import { getSupabase } from './supabase';
import { uploadDocument } from './storage';
import { notify } from './notify';
import { generateDocument } from './legal';
import { logAudit } from './audit';
import type { Booking, InstallmentPlan, Payment, PaymentMethod } from '../types';

const DEFAULT_PLANS: Record<string, { months: number; downPct: number }> = {
  'Lump sum (full payment)': { months: 1, downPct: 100 },
  '1-year plan': { months: 12, downPct: 20 },
  '3-year plan': { months: 36, downPct: 20 },
  '5-year plan': { months: 60, downPct: 20 },
};

export function makeReceiptNo(): string {
  return `RCP-${Date.now().toString(36).toUpperCase().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
}

/** Auto-generate payment schedule for an approved booking. */
export async function generateSchedule(booking: Booking, totalPrice: number): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Database not connected');

  // find society's custom plan by name, else defaults
  let months = 12;
  let downPct = 20;
  const { data: custom } = await supabase
    .from('installment_plans')
    .select('*')
    .eq('society_id', booking.society_id)
    .eq('name', booking.installment_plan ?? '')
    .single();
  if (custom) {
    months = (custom as InstallmentPlan).duration_months;
    downPct = Number((custom as InstallmentPlan).down_payment_pct);
  } else if (booking.installment_plan && DEFAULT_PLANS[booking.installment_plan]) {
    months = DEFAULT_PLANS[booking.installment_plan].months;
    downPct = DEFAULT_PLANS[booking.installment_plan].downPct;
  }

  const down = Math.round((totalPrice * downPct) / 100);
  const rest = totalPrice - down;
  const monthly = months <= 1 ? rest : Math.round(rest / months);

  const rows: Partial<Payment>[] = [];
  const start = new Date();
  if (down > 0) {
    rows.push({
      booking_id: booking.id,
      customer_id: booking.customer_id,
      society_id: booking.society_id,
      amount: down,
      method: 'bank',
      status: 'pending',
      due_date: start.toISOString().slice(0, 10),
      late_fee: 0,
      receipt_no: makeReceiptNo(),
      label: 'Down payment',
    });
  }
  for (let i = 1; i <= months; i++) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + i);
    rows.push({
      booking_id: booking.id,
      customer_id: booking.customer_id,
      society_id: booking.society_id,
      amount: monthly,
      method: 'bank',
      status: 'pending',
      due_date: d.toISOString().slice(0, 10),
      late_fee: 0,
      receipt_no: makeReceiptNo(),
      label: `Installment ${i}/${months}`,
    });
  }
  // token already paid counts toward down payment
  if (booking.token_amount > 0 && rows.length > 0) {
    const first = rows[0].amount ?? 0;
    if (booking.token_amount >= first) {
      rows[0] = { ...rows[0], amount: 0, status: 'confirmed', paid_at: new Date().toISOString() };
    } else {
      rows[0] = { ...rows[0], amount: first - booking.token_amount };
    }
  }

  const { error } = await supabase.from('payments').insert(rows);
  if (error) throw error;
}

/** Late fee: 2% per overdue month on unpaid amount. */
export function calcLateFee(p: Payment): number {
  if (p.status === 'confirmed' || !p.due_date) return 0;
  const due = new Date(p.due_date);
  const now = new Date();
  if (now <= due) return 0;
  const months = Math.max(1, Math.floor((now.getTime() - due.getTime()) / (30 * 24 * 3600 * 1000)));
  return Math.round(p.amount * 0.02 * months);
}

export async function fetchMyPayments(customerId: string): Promise<Payment[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase.from('payments').select('*').eq('customer_id', customerId).order('due_date');
  const list = (data as Payment[]) ?? [];
  for (const p of list) {
    const { data: b } = await supabase.from('bookings').select('reference_no').eq('id', p.booking_id).single();
    p.booking_ref = (b as { reference_no: string } | null)?.reference_no ?? '—';
  }
  return list;
}

/** Customer submits a payment with receipt proof.
 *  NOTHING auto-confirms: every payment stays 'pending' until the
 *  society admin or dealer verifies the receipt. */
export async function payInstallment(
  p: Payment,
  method: PaymentMethod,
  proofFile?: File | null,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Database not connected');
  if (method === 'bank' && !proofFile && !p.proof_url) {
    throw new Error('Bank transfer requires a receipt/screenshot upload.');
  }
  let proofUrl: string | null = p.proof_url ?? null;
  if (proofFile) proofUrl = await uploadDocument(proofFile);
  const lateFee = calcLateFee(p);
  const { error } = await supabase
    .from('payments')
    .update({
      method,
      proof_url: proofUrl,
      status: 'pending',
      rejection_reason: null,
      paid_at: new Date().toISOString(),
      late_fee: lateFee,
    })
    .eq('id', p.id);
  if (error) throw error;
  // trigger: payment submitted → notify society + dealer for verification
  const { data: b } = await supabase.from('bookings').select('society_id, dealer_id').eq('id', p.booking_id).single();
  const targets = [p.society_id, (b as { dealer_id?: string } | null)?.dealer_id].filter(Boolean) as string[];
  if (targets.length > 0) {
    notify(targets, 'Payment receipt submitted', `${p.label ?? 'Payment'} of PKR ${p.amount.toLocaleString()} submitted for verification (${p.booking_ref ?? ''}).`, 'payment_verify').catch(() => {});
  }
}

/** Customer submits token payment receipt at booking time.
 * Creates a pending payment record for society/dealer verification.
 * The booking is approved only after the token receipt is verified. */
export async function submitTokenPayment(
  booking: Booking,
  amount: number,
  method: PaymentMethod,
  proofFile?: File | null,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Database not connected');
  if (amount <= 0) throw new Error('Token amount must be greater than zero.');
  if (method === 'bank' && !proofFile) {
    throw new Error('Bank transfer requires a receipt/screenshot upload.');
  }
  let proofUrl: string | null = null;
  if (proofFile) proofUrl = await uploadDocument(proofFile);
  const { error } = await supabase.from('payments').insert({
    booking_id: booking.id,
    customer_id: booking.customer_id,
    society_id: booking.society_id,
    amount,
    method,
    proof_url: proofUrl,
    status: 'pending',
    paid_at: new Date().toISOString(),
    receipt_no: makeReceiptNo(),
    label: 'Token payment',
  });
  if (error) throw error;
  // trigger: token receipt submitted → notify society for verification
  if (booking.society_id) {
    notify(
      booking.society_id,
      'Token receipt submitted',
      `Token payment of PKR ${amount.toLocaleString()} for booking ${booking.reference_no} needs verification.`,
      'payment_verify',
    ).catch(() => {});
  }
}

/** Society admin / dealer verifies a submitted receipt. */
export async function verifyPayment(
  paymentId: string,
  verifierId: string,
  approved: boolean,
  reason?: string,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Database not connected');
  const { data: p } = await supabase.from('payments').select('*').eq('id', paymentId).single();
  if (!p) throw new Error('Payment not found');
  const pay = p as Payment;
  const { error } = await supabase
    .from('payments')
    .update({
      status: approved ? 'confirmed' : 'rejected',
      verified_by: verifierId,
      verified_at: new Date().toISOString(),
      rejection_reason: approved ? null : (reason ?? 'Receipt could not be verified.'),
      paid_at: approved ? new Date().toISOString() : pay.paid_at,
    })
    .eq('id', paymentId);
  if (error) throw error;
  // audit: payment verification decision
  const { data: verifier } = await supabase.from('profiles').select('email').eq('id', verifierId).single();
  logAudit(verifierId, (verifier as { email: string } | null)?.email ?? null, approved ? 'payment_verified' : 'payment_rejected', 'payment', paymentId, `${pay.label ?? 'Payment'} PKR ${Number(pay.amount).toLocaleString()}`);
  // notify customer of the decision
  if (pay.customer_id) {
    notify(
      pay.customer_id,
      approved ? 'Payment verified ✓' : 'Payment receipt rejected',
      approved
        ? `${pay.label ?? 'Payment'} of PKR ${pay.amount.toLocaleString()} has been verified.`
        : `${pay.label ?? 'Payment'} of PKR ${pay.amount.toLocaleString()} was rejected: ${reason ?? 'receipt could not be verified'}. Please resubmit.`,
      approved ? 'payment_verified' : 'payment_rejected',
    ).catch(() => {});
  }
  // auto-generate installment receipt on approval
  if (approved) {
    try {
      const { data: b } = await supabase.from('bookings').select('*').eq('id', pay.booking_id).single();
      if (b) await generateDocument(b as Booking, 'installment_receipt');
    } catch (e) {
      console.error('receipt gen failed:', e);
    }
  }
  // token payment verified → approve the booking as well (schedule + allotment)
  if (approved && pay.label === 'Token payment') {
    try {
      const { data: b } = await supabase.from('bookings').select('*').eq('id', pay.booking_id).single();
      const bk = b as Booking | null;
      if (bk && bk.status === 'pending') {
        await supabase.from('bookings').update({ status: 'approved' }).eq('id', bk.id);
        let total = 0;
        if (bk.plot_id) {
          await supabase.from('plots').update({ status: 'reserved' }).eq('id', bk.plot_id);
          const { data: p } = await supabase.from('plots').select('base_price').eq('id', bk.plot_id).single();
          total = Number((p as { base_price: number } | null)?.base_price ?? 0);
        }
        await generateSchedule({ ...bk, status: 'approved' }, total);
        if (bk.customer_id) {
          notify(bk.customer_id, 'Booking approved', `Booking ${bk.reference_no} approved. Your payment schedule is ready.`, 'booking_approved').catch(() => {});
        }
        try {
          await generateDocument(bk, 'allotment');
        } catch (e) {
          console.error('allotment letter failed:', e);
        }
      }
    } catch (e) {
      console.error('token booking approval failed:', e);
    }
  }
}

/** Pending receipts awaiting verification for a society. */
export async function fetchPendingVerifications(societyId: string): Promise<Payment[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from('payments')
    .select('*')
    .eq('society_id', societyId)
    .eq('status', 'pending')
    .not('paid_at', 'is', null)
    .order('paid_at', { ascending: false });
  const list = (data as Payment[]) ?? [];
  for (const p of list) {
    const { data: b } = await supabase.from('bookings').select('reference_no').eq('id', p.booking_id).single();
    p.booking_ref = (b as { reference_no: string } | null)?.reference_no ?? '—';
  }
  return list;
}

/** Pending receipts for bookings handled by a dealer. */
export async function fetchDealerPendingVerifications(dealerId: string): Promise<Payment[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data: bookings } = await supabase.from('bookings').select('id').eq('dealer_id', dealerId);
  const ids = ((bookings as { id: string }[]) ?? []).map((b) => b.id);
  if (ids.length === 0) return [];
  const { data } = await supabase
    .from('payments')
    .select('*')
    .in('booking_id', ids)
    .eq('status', 'pending')
    .not('paid_at', 'is', null)
    .order('paid_at', { ascending: false });
  const list = (data as Payment[]) ?? [];
  for (const p of list) {
    const { data: b } = await supabase.from('bookings').select('reference_no').eq('id', p.booking_id).single();
    p.booking_ref = (b as { reference_no: string } | null)?.reference_no ?? '—';
  }
  return list;
}

export async function fetchSocietyPayments(societyId: string): Promise<Payment[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase.from('payments').select('*').eq('society_id', societyId).order('due_date');
  const list = (data as Payment[]) ?? [];
  for (const p of list) {
    const { data: b } = await supabase.from('bookings').select('reference_no').eq('id', p.booking_id).single();
    p.booking_ref = (b as { reference_no: string } | null)?.reference_no ?? '—';
  }
  return list;
}

export async function fetchPlans(societyId: string): Promise<InstallmentPlan[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase.from('installment_plans').select('*').eq('society_id', societyId).order('duration_months');
  return (data as InstallmentPlan[]) ?? [];
}

export async function savePlan(societyId: string, input: Partial<InstallmentPlan> & { name: string }): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Database not connected');
  const { error } = await supabase.from('installment_plans').upsert(
    {
      society_id: societyId,
      name: input.name,
      duration_months: input.duration_months ?? 12,
      down_payment_pct: input.down_payment_pct ?? 20,
    },
    { onConflict: 'society_id,name' },
  );
  if (error) throw error;
}

export async function deletePlan(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Database not connected');
  const { error } = await supabase.from('installment_plans').delete().eq('id', id);
  if (error) throw error;
}

export interface FinancialSummary {
  collected: number;
  pending: number;
  overdue: number;
  defaulters: { ref: string; amount: number }[];
  commissionPayable: number;
  monthly: { month: string; total: number }[];
}

export async function financialSummary(societyId: string): Promise<FinancialSummary> {
  const payments = await fetchSocietyPayments(societyId);
  let collected = 0;
  let pending = 0;
  let overdue = 0;
  const defMap = new Map<string, number>();
  const monthly = new Map<string, number>();

  for (const p of payments) {
    if (p.status === 'confirmed') {
      collected += p.amount + p.late_fee;
      const m = (p.paid_at ?? p.created_at).slice(0, 7);
      monthly.set(m, (monthly.get(m) ?? 0) + p.amount);
    } else {
      pending += p.amount;
      if (calcLateFee(p) > 0) {
        overdue += p.amount;
        defMap.set(p.booking_ref ?? p.booking_id, (defMap.get(p.booking_ref ?? p.booking_id) ?? 0) + p.amount);
      }
    }
  }

  // commission payable: sum over lots commission % of assigned plot values (approx via payments of dealer bookings)
  const supabase = getSupabase();
  let commissionPayable = 0;
  if (supabase) {
    const { data: lots } = await supabase.from('lots').select('commission_pct, dealer_id').eq('society_id', societyId).eq('status', 'active');
    for (const lot of (lots as { commission_pct: number }[]) ?? []) {
      commissionPayable += Math.round(collected * (Number(lot.commission_pct) / 100));
    }
  }

  return {
    collected,
    pending,
    overdue,
    defaulters: [...defMap.entries()].map(([ref, amount]) => ({ ref, amount })),
    commissionPayable,
    monthly: [...monthly.entries()].map(([month, total]) => ({ month, total })).sort((a, b) => a.month.localeCompare(b.month)).slice(-6),
  };
}

/** Society admin edits a payment's due date / amount (WBS: per-booking schedule editing). */
export async function updatePaymentSchedule(
  paymentId: string,
  input: { due_date?: string | null; amount?: number },
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Database not connected');
  if (input.amount !== undefined && input.amount < 0) throw new Error('Amount cannot be negative.');
  const patch: Record<string, unknown> = {};
  if (input.due_date !== undefined) patch.due_date = input.due_date || null;
  if (input.amount !== undefined) patch.amount = input.amount;
  if (Object.keys(patch).length === 0) return;
  const { error } = await supabase.from('payments').update(patch).eq('id', paymentId);
  if (error) throw error;
}
