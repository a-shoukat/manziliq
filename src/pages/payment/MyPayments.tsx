import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { calcLateFee, fetchMyPayments, payInstallment } from '../../lib/payment';
import { formatPrice } from '../../lib/properties';
import type { Payment, PaymentMethod } from '../../types';

const METHODS: { id: PaymentMethod; label: string }[] = [
  { id: 'bank', label: 'Bank transfer (receipt upload)' },
  { id: 'cash', label: 'Cash (receipt from office)' },
  { id: 'cheque', label: 'Cheque' },
];

/** WBS: Payment & Financial System — customer side (tracking + receipts) */
export default function MyPayments({ onNavigate }: { onNavigate: (p: string) => void }) {
  const { session } = useAuth();
  const [list, setList] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<Payment | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('bank');
  const [proof, setProof] = useState<File | null>(null);
  const [receipt, setReceipt] = useState<Payment | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    if (!session) return;
    setLoading(true);
    setList(await fetchMyPayments(session.user.id));
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const dueSoon = list.filter(
    (p) => p.status === 'pending' && p.due_date && p.due_date <= today,
  );

  // due-date calendar (WBS: calendar-style due-date view)
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const dueByDate: Record<string, Payment[]> = {};
  for (const p of list) {
    if (!p.due_date) continue;
    (dueByDate[p.due_date] ??= []).push(p);
  }
  const calDays: (number | null)[] = [];
  const firstDow = new Date(calMonth.y, calMonth.m, 1).getDay();
  const daysInMonth = new Date(calMonth.y, calMonth.m + 1, 0).getDate();
  for (let i = 0; i < firstDow; i++) calDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calDays.push(d);
  const monthName = new Date(calMonth.y, calMonth.m, 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  const doPay = async () => {
    if (!paying) return;
    try {
      await payInstallment(paying, method, proof);
      setMsg('Receipt submitted — society/dealer will verify it, then it will show as confirmed.');
      setPaying(null);
      setProof(null);
      load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Payment failed');
    }
  };

  return (
    <div className="container">
      <div className="topbar">
        <div>
          <h1>My payments</h1>
          <p className="muted" style={{ margin: 0 }}>Due calendar & history</p>
        </div>
        <button className="btn secondary small" onClick={() => onNavigate('dashboard')}>Dashboard</button>
      </div>

      {msg && <div className="notice" style={{ marginBottom: 12 }}>{msg}</div>}
      {dueSoon.length > 0 && (
        <div className="notice warn-box" style={{ marginBottom: 12 }}>
          ⏰ {dueSoon.length} payment{dueSoon.length > 1 ? 's' : ''} due or overdue — late fee 2%/month applies.
        </div>
      )}

      {loading ? <p className="muted">Loading…</p> : list.length === 0 ? (
        <p className="muted">No payment schedule yet — it appears after your booking is approved.</p>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="topbar">
              <h3 style={{ margin: 0 }}>Due-date calendar</h3>
              <div className="link-row">
                <button className="btn secondary small" onClick={() => setCalMonth(({ y, m }) => m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 })}>‹ Prev</button>
                <strong>{monthName}</strong>
                <button className="btn secondary small" onClick={() => setCalMonth(({ y, m }) => m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 })}>Next ›</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <div key={d} className="muted small" style={{ textAlign: 'center', fontWeight: 600 }}>{d}</div>
              ))}
              {calDays.map((d, i) => {
                if (d === null) return <div key={i} />;
                const key = `${calMonth.y}-${String(calMonth.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const dues = dueByDate[key] ?? [];
                const isToday = key === today;
                return (
                  <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 4, minHeight: 52, background: isToday ? 'var(--accent-soft)' : undefined }}>
                    <div className="small" style={{ fontWeight: isToday ? 700 : 400 }}>{d}</div>
                    {dues.map((p) => (
                      <div key={p.id} className="small" style={{ fontSize: 11 }} title={`${p.label} — ${formatPrice(p.amount)}`}>
                        <span className={`badge ${p.status === 'confirmed' ? 'ok' : p.status === 'pending' ? 'warn' : ''}`} style={{ fontSize: 10 }}>
                          {p.label?.slice(0, 12)}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Booking</th><th>Label</th><th>Due</th><th>Amount</th><th>Late fee</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {list.map((p) => {
                const late = calcLateFee(p);
                const overdue = p.status === 'pending' && p.due_date && p.due_date < today;
                return (
                  <tr key={p.id} className={overdue ? 'row-overdue' : ''}>
                    <td>{p.booking_ref}</td>
                    <td>{p.label ?? '—'}</td>
                    <td>{p.due_date ?? '—'}</td>
                    <td>{formatPrice(p.amount)}</td>
                    <td>{late > 0 ? formatPrice(late) : '—'}</td>
                    <td>
                      <span className={`badge ${p.status === 'confirmed' ? 'ok' : p.status === 'rejected' ? 'bad' : 'warn'}`}>
                        {p.status === 'pending' && p.paid_at ? 'awaiting verification' : p.status}
                      </span>
                      {p.status === 'rejected' && p.rejection_reason && (
                        <div className="muted small">{p.rejection_reason}</div>
                      )}
                    </td>
                    <td className="row-actions">
                      {(p.status === 'pending' && !p.paid_at) || p.status === 'rejected' ? (
                        <button className="link inline" onClick={() => setPaying(p)}>
                          {p.status === 'rejected' ? 'Resubmit' : 'Pay'}
                        </button>
                      ) : null}
                      {p.status === 'confirmed' && (
                        <button className="link inline" onClick={() => setReceipt(p)}>Receipt</button>
                      )}
                      {p.proof_url && (
                        <a className="link inline" href={p.proof_url} target="_blank" rel="noreferrer">Proof</a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </>
      )}

      {paying && (
        <div className="modal-backdrop" onClick={() => setPaying(null)}>
          <div className="card" onClick={(e) => e.stopPropagation()}>
            <h3>Pay {formatPrice(paying.amount + calcLateFee(paying))}</h3>
            <p className="muted small">{paying.label} · {paying.booking_ref}</p>
            <label>Method
              <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
                {METHODS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </label>
            {method === 'bank' && (
              <label>Transfer receipt / screenshot (required)
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setProof(e.target.files?.[0] ?? null)} />
              </label>
            )}
            {(method === 'cash' || method === 'cheque') && (
              <label>Receipt photo (optional)
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setProof(e.target.files?.[0] ?? null)} />
              </label>
            )}
            <div className="notice" style={{ marginBottom: 12 }}>
              Submit your receipt — the society/dealer will verify it before the payment is confirmed.
            </div>
            <div className="link-row">
              <button className="btn small" onClick={doPay}>Submit receipt</button>
              <button className="btn secondary small" onClick={() => setPaying(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {receipt && (
        <div className="modal-backdrop" onClick={() => setReceipt(null)}>
          <div className="card receipt" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ textAlign: 'center' }}>Payment Receipt</h2>
            <p style={{ textAlign: 'center' }} className="muted">{receipt.receipt_no}</p>
            <div className="spec-table">
              <div className="spec-row"><span className="detail-key">Booking</span><span>{receipt.booking_ref}</span></div>
              <div className="spec-row"><span className="detail-key">Label</span><span>{receipt.label}</span></div>
              <div className="spec-row"><span className="detail-key">Amount</span><span>{formatPrice(receipt.amount)}</span></div>
              <div className="spec-row"><span className="detail-key">Late fee</span><span>{formatPrice(receipt.late_fee)}</span></div>
              <div className="spec-row"><span className="detail-key">Method</span><span>{receipt.method}</span></div>
              <div className="spec-row"><span className="detail-key">Paid at</span><span>{receipt.paid_at ? new Date(receipt.paid_at).toLocaleString() : '—'}</span></div>
            </div>
            <div className="link-row no-print">
              <button className="btn small" onClick={() => window.print()}>Print / PDF</button>
              <button className="btn secondary small" onClick={() => setReceipt(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
