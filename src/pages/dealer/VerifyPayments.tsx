import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { fetchDealerPendingVerifications, verifyPayment } from '../../lib/payment';
import { formatPrice } from '../../lib/properties';
import type { Payment } from '../../types';

/** Dealer portal — verify payment receipts for own bookings */
export default function VerifyPayments({ onNavigate }: { onNavigate: (p: string) => void }) {
  const { session } = useAuth();
  const [queue, setQueue] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejecting, setRejecting] = useState<Payment | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = async () => {
    if (!session) return;
    setLoading(true);
    setQueue(await fetchDealerPendingVerifications(session.user.id));
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container">
      <div className="topbar">
        <div>
          <h1>Verify payments</h1>
          <p className="muted" style={{ margin: 0 }}>Receipts submitted by your customers</p>
        </div>
        <button className="btn secondary small" onClick={() => onNavigate('dealer')}>Dealer portal</button>
      </div>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : queue.length === 0 ? (
        <p className="muted">No receipts awaiting verification.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Booking</th><th>Label</th><th>Amount</th><th>Method</th><th>Submitted</th><th>Receipt</th><th></th></tr></thead>
            <tbody>
              {queue.map((p) => (
                <tr key={p.id}>
                  <td>{p.booking_ref}</td>
                  <td>{p.label}</td>
                  <td>{formatPrice(p.amount)}</td>
                  <td>{p.method}</td>
                  <td>{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '—'}</td>
                  <td>
                    {p.proof_url ? (
                      <a className="link inline" href={p.proof_url} target="_blank" rel="noreferrer">View receipt</a>
                    ) : (
                      <span className="muted small">no file</span>
                    )}
                  </td>
                  <td className="row-actions">
                    <button
                      className="btn small"
                      onClick={async () => {
                        if (!session) return;
                        await verifyPayment(p.id, session.user.id, true);
                        load();
                      }}
                    >
                      ✓ Verify
                    </button>
                    <button
                      className="btn secondary small"
                      onClick={() => { setRejecting(p); setRejectReason(''); }}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rejecting && (
        <div className="modal-backdrop" onClick={() => setRejecting(null)}>
          <div className="card" onClick={(e) => e.stopPropagation()}>
            <h3>Reject receipt</h3>
            <p className="muted small">{rejecting.label} · {formatPrice(rejecting.amount)}</p>
            <label>Reason (customer will see this)
              <input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Receipt is blurry / amount mismatch"
              />
            </label>
            <div className="link-row">
              <button
                className="btn small"
                onClick={async () => {
                  if (!session) return;
                  await verifyPayment(rejecting.id, session.user.id, false, rejectReason.trim() || undefined);
                  setRejecting(null);
                  load();
                }}
              >
                Reject payment
              </button>
              <button className="btn secondary small" onClick={() => setRejecting(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
