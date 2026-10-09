import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { getSupabase } from '../../lib/supabase';
import { submitTransferRequest, fetchDealerTransferRequests, type TransferRequest } from '../../lib/booking';
import { formatPrice } from '../../lib/properties';

type SimplePlot = { id: string; block: string; plot_no: string; size_marla: number; base_price: number; society_id: string; society_name: string };

/** WBS: Dealer Portal — submit plot transfer requests to societies */
export default function TransferRequests({ onNavigate }: { onNavigate: (p: string) => void }) {
  const { profile } = useAuth();
  const [plots, setPlots] = useState<SimplePlot[]>([]);
  const [requests, setRequests] = useState<TransferRequest[]>([]);
  const [plotId, setPlotId] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerCnic, setBuyerCnic] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const load = async () => {
    if (!profile) return;
    const supabase = getSupabase();
    if (!supabase) return;
    const { data: reqs } = await supabase.from('dealer_requests').select('society_id').eq('dealer_id', profile.id).eq('status', 'approved');
    const sids = ((reqs as { society_id: string }[]) ?? []).map((r) => r.society_id);
    if (sids.length > 0) {
      const { data } = await supabase.from('plots').select('id, block, plot_no, size_marla, base_price, society_id').in('society_id', sids).eq('status', 'available').order('block').limit(200);
      const out: SimplePlot[] = [];
      for (const p of (data as (SimplePlot & { society_id: string })[]) ?? []) {
        const { data: s } = await supabase.from('society_details').select('society_name').eq('profile_id', p.society_id).single();
        out.push({ ...p, society_name: (s as { society_name: string } | null)?.society_name ?? '—' });
      }
      setPlots(out);
    }
    setRequests(await fetchDealerTransferRequests(profile.id));
  };

  useEffect(() => { load(); }, [profile]);

  const selected = plots.find((p) => p.id === plotId);

  const submit = async () => {
    if (!profile || !selected) return;
    setLoading(true);
    setError(null);
    setDone(false);
    try {
      await submitTransferRequest({
        dealer_id: profile.id,
        society_id: selected.society_id,
        plot_id: selected.id,
        buyer_name: buyerName,
        buyer_phone: buyerPhone,
        buyer_cnic: buyerCnic,
        sale_price: parseFloat(price) || 0,
      });
      setDone(true);
      setPlotId(''); setBuyerName(''); setBuyerPhone(''); setBuyerCnic(''); setPrice('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card wide">
        <div className="topbar">
          <h1 style={{ margin: 0 }}>Transfer requests</h1>
          <button className="btn secondary small" onClick={() => onNavigate('dealer')}>Back</button>
        </div>
        <p className="muted">Request a plot transfer for your buyer. The society reviews and marks the plot sold on approval.</p>
        {error && <div className="error">{error}</div>}
        {done && <div className="badge ok">Transfer request submitted</div>}
        <label>Plot
          <select value={plotId} onChange={(e) => setPlotId(e.target.value)}>
            <option value="">Choose a plot…</option>
            {plots.map((p) => (
              <option key={p.id} value={p.id}>{p.society_name} · {p.block}-{p.plot_no} · {p.size_marla}M · {formatPrice(p.base_price)}</option>
            ))}
          </select>
        </label>
        <label>Buyer name
          <input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="Buyer full name" />
        </label>
        <label>Buyer phone
          <input value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} placeholder="03xx-xxxxxxx" />
        </label>
        <label>Buyer CNIC
          <input value={buyerCnic} onChange={(e) => setBuyerCnic(e.target.value)} placeholder="35202-xxxxxxx-x" />
        </label>
        <label>Agreed sale price (PKR)
          <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 5000000" />
        </label>
        <button className="btn" disabled={loading || !plotId} onClick={submit}>{loading ? 'Submitting…' : 'Submit transfer request'}</button>

        <h3 style={{ marginTop: 24 }}>My requests</h3>
        {requests.length === 0 ? <p className="muted small">No transfer requests yet.</p> : (
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Plot</th><th>Buyer</th><th>Price</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{r.plot_label}</td>
                  <td>{r.buyer_name}</td>
                  <td>{formatPrice(r.sale_price)}</td>
                  <td><span className={`badge ${r.status === 'approved' ? 'ok' : r.status === 'rejected' ? 'err' : ''}`}>{r.status}</span></td>
                  <td className="small">{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  );
}
