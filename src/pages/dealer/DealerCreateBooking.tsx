import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { getSupabase } from '../../lib/supabase';
import { createBooking } from '../../lib/booking';
import { formatPrice } from '../../lib/properties';
import { INSTALLMENT_PLANS, type Plot } from '../../types';

/** WBS: Dealer Portal — dealer creates a booking for a customer */
export default function DealerCreateBooking({ onNavigate }: { onNavigate: (p: string) => void }) {
  const { profile } = useAuth();
  const [plots, setPlots] = useState<(Plot & { society_name?: string })[]>([]);
  const [plotId, setPlotId] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [token, setToken] = useState('');
  const [plan, setPlan] = useState(INSTALLMENT_PLANS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!profile) return;
      const supabase = getSupabase();
      if (!supabase) return;
      // plots from societies this dealer is approved with
      const { data: reqs } = await supabase.from('dealer_requests').select('society_id').eq('dealer_id', profile.id).eq('status', 'approved');
      const sids = ((reqs as { society_id: string }[]) ?? []).map((r) => r.society_id);
      if (sids.length === 0) return;
      const { data } = await supabase.from('plots').select('*').in('society_id', sids).eq('status', 'available').order('block').limit(200);
      const list = (data as Plot[]) ?? [];
      const withNames: (Plot & { society_name?: string })[] = [];
      for (const p of list) {
        const { data: s } = await supabase.from('society_details').select('society_name').eq('profile_id', p.society_id).single();
        withNames.push({ ...p, society_name: (s as { society_name: string } | null)?.society_name ?? '—' });
      }
      setPlots(withNames);
    })();
  }, [profile]);

  const selected = plots.find((p) => p.id === plotId);

  const submit = async () => {
    if (!profile || !plotId || !selected) return;
    if (!customerEmail.trim()) { setError('Customer email is required.'); return; }
    setLoading(true);
    setError(null);
    setDone(null);
    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error('Database not connected');
      // find or match the customer profile by email
      const { data: cust } = await supabase.from('profiles').select('id').eq('email', customerEmail.trim().toLowerCase()).single();
      const customerId = (cust as { id: string } | null)?.id ?? null;
      if (!customerId) {
        throw new Error('No customer account found with this email. The customer must register first.');
      }
      const b = await createBooking({
        plot_id: plotId,
        customer_id: customerId,
        dealer_id: profile.id,
        society_id: selected.society_id,
        channel: 'dealer',
        token_amount: parseFloat(token) || 0,
        installment_plan: plan,
      });
      setDone(`Booking ${b.reference_no} created for ${customerName.trim() || customerEmail.trim()}. The society will review it.`);
      setPlotId(''); setCustomerEmail(''); setCustomerName(''); setToken('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card wide">
        <div className="topbar">
          <h1 style={{ margin: 0 }}>Create booking for customer</h1>
          <button className="btn secondary small" onClick={() => onNavigate('dealer')}>Back</button>
        </div>
        {error && <div className="error">{error}</div>}
        {done && <div className="badge ok">{done}</div>}
        <label>Plot (from your approved societies)
          <select value={plotId} onChange={(e) => setPlotId(e.target.value)}>
            <option value="">Choose a plot…</option>
            {plots.map((p) => (
              <option key={p.id} value={p.id}>
                {p.society_name} · {p.block}-{p.plot_no} · {p.size_marla}M · {formatPrice(p.base_price)}
              </option>
            ))}
          </select>
        </label>
        {plots.length === 0 && <p className="muted small">No available plots. Get approved by a society first.</p>}
        <label>Customer email (must be registered)
          <input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="customer@example.com" />
        </label>
        <label>Customer name
          <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer full name" />
        </label>
        <label>Token amount (PKR)
          <input type="number" min={0} value={token} onChange={(e) => setToken(e.target.value)} placeholder="e.g. 100000" />
        </label>
        <label>Installment plan
          <select value={plan} onChange={(e) => setPlan(e.target.value)}>
            {INSTALLMENT_PLANS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
        <button className="btn" disabled={loading || !plotId} onClick={submit}>
          {loading ? 'Creating…' : 'Create booking'}
        </button>
      </div>
    </div>
  );
}
