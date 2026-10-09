import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { getSupabase } from '../../lib/supabase';
import { fetchAvailablePlots } from '../../lib/booking';
import { formatPrice } from '../../lib/properties';

type SimplePlot = { id: string; block: string; plot_no: string; size_marla: number; base_price: number };

/** WBS: Society Portal — direct / walk-in sale (no online booking flow) */
export default function DirectSale({ onNavigate }: { onNavigate: (p: string) => void }) {
  const { profile } = useAuth();
  const [plots, setPlots] = useState<SimplePlot[]>([]);
  const [plotId, setPlotId] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerCnic, setBuyerCnic] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    if (profile) fetchAvailablePlots(profile.id).then(setPlots);
  }, [profile]);

  const submit = async () => {
    if (!profile || !plotId) return;
    const saleAmount = parseFloat(amount) || 0;
    if (saleAmount <= 0) { setError('Sale amount must be greater than zero.'); return; }
    if (!buyerName.trim()) { setError('Buyer name is required.'); return; }
    setLoading(true);
    setError(null);
    setDone(null);
    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error('Database not connected');
      const ref = `DS-${Date.now().toString(36).toUpperCase()}`;
      const { error: bErr } = await supabase.from('bookings').insert({
        reference_no: ref,
        plot_id: plotId,
        customer_id: null,
        dealer_id: null,
        society_id: profile.id,
        channel: 'direct',
        token_amount: saleAmount,
        installment_plan: 'Lump sum (full payment)',
        status: 'completed',
      });
      if (bErr) throw bErr;
      const { error: pErr } = await supabase.from('plots').update({ status: 'sold' }).eq('id', plotId);
      if (pErr) throw pErr;
      // store walk-in buyer info as a notification-style record for the society's reference
      setDone(`Direct sale recorded (${ref}) for ${buyerName.trim()} — ${formatPrice(saleAmount)}`);
      setPlotId(''); setBuyerName(''); setBuyerPhone(''); setBuyerCnic(''); setAmount('');
      fetchAvailablePlots(profile.id).then(setPlots);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sale failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card wide">
        <div className="topbar">
          <h1 style={{ margin: 0 }}>Direct sale</h1>
          <button className="btn secondary small" onClick={() => onNavigate('society')}>Back</button>
        </div>
        <p className="muted">Record a walk-in / office sale. The plot is marked sold immediately.</p>
        {error && <div className="error">{error}</div>}
        {done && <div className="badge ok">{done}</div>}
        <label>Plot
          <select value={plotId} onChange={(e) => setPlotId(e.target.value)}>
            <option value="">Choose a plot…</option>
            {plots.map((p) => (
              <option key={p.id} value={p.id}>{p.block}-{p.plot_no} · {p.size_marla}M · {formatPrice(p.base_price)}</option>
            ))}
          </select>
        </label>
        <label>Buyer name
          <input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="Walk-in buyer name" />
        </label>
        <label>Buyer phone
          <input value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} placeholder="03xx-xxxxxxx" />
        </label>
        <label>Buyer CNIC
          <input value={buyerCnic} onChange={(e) => setBuyerCnic(e.target.value)} placeholder="35202-xxxxxxx-x" />
        </label>
        <label>Sale amount (PKR)
          <input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 5000000" />
        </label>
        <button className="btn" disabled={loading || !plotId} onClick={submit}>
          {loading ? 'Recording…' : 'Record direct sale'}
        </button>
      </div>
    </div>
  );
}
