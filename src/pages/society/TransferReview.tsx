import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { fetchSocietyTransferRequests, decideTransferRequest, type TransferRequest } from '../../lib/booking';
import { formatPrice } from '../../lib/properties';

/** WBS: Society Portal — review dealer transfer requests, approve → plot sold */
export default function TransferReview({ onNavigate }: { onNavigate: (p: string) => void }) {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<TransferRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!profile) return;
    setLoading(true);
    setRequests(await fetchSocietyTransferRequests(profile.id));
    setLoading(false);
  };

  useEffect(() => { load(); }, [profile]);

  const decide = async (r: TransferRequest, approved: boolean) => {
    setActing(r.id);
    setError(null);
    try {
      await decideTransferRequest(r.id, approved);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActing(null);
    }
  };

  const pending = requests.filter((r) => r.status === 'pending');
  const decided = requests.filter((r) => r.status !== 'pending');

  return (
    <div className="container">
      <div className="card wide">
        <div className="topbar">
          <h1 style={{ margin: 0 }}>Transfer requests</h1>
          <button className="btn secondary small" onClick={() => onNavigate('society')}>Back</button>
        </div>
        <p className="muted">Dealers request plot transfers for their buyers. Approving marks the plot as sold.</p>
        {error && <div className="error">{error}</div>}
        {loading ? <p className="muted">Loading…</p> : (
          <>
            <h3>Pending ({pending.length})</h3>
            {pending.length === 0 ? <p className="muted small">No pending requests.</p> : (
              <div className="table-wrap"><table className="table">
                <thead><tr><th>Plot</th><th>Dealer</th><th>Buyer</th><th>Phone / CNIC</th><th>Price</th><th>Actions</th></tr></thead>
                <tbody>
                  {pending.map((r) => (
                    <tr key={r.id}>
                      <td>{r.plot_label}</td>
                      <td className="small">{r.dealer_email}</td>
                      <td>{r.buyer_name}</td>
                      <td className="small">{r.buyer_phone ?? '—'}<br />{r.buyer_cnic ?? ''}</td>
                      <td>{formatPrice(r.sale_price)}</td>
                      <td>
                        <div className="link-row">
                          <button className="btn small" disabled={acting === r.id} onClick={() => decide(r, true)}>Approve → sold</button>
                          <button className="btn secondary small" disabled={acting === r.id} onClick={() => decide(r, false)}>Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            )}
            {decided.length > 0 && (
              <>
                <h3 style={{ marginTop: 20 }}>Decided</h3>
                <div className="table-wrap"><table className="table">
                  <thead><tr><th>Plot</th><th>Buyer</th><th>Price</th><th>Status</th></tr></thead>
                  <tbody>
                    {decided.map((r) => (
                      <tr key={r.id}>
                        <td>{r.plot_label}</td>
                        <td>{r.buyer_name}</td>
                        <td>{formatPrice(r.sale_price)}</td>
                        <td><span className={`badge ${r.status === 'approved' ? 'ok' : 'err'}`}>{r.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table></div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
