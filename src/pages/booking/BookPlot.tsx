import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { fetchApprovedSocieties } from '../../lib/society';
import { fetchSocietyDealers } from '../../lib/society';
import { createBooking, fetchAvailablePlots } from '../../lib/booking';
import { submitTokenPayment } from '../../lib/payment';
import { formatPrice } from '../../lib/properties';
import { INSTALLMENT_PLANS, type Booking, type PaymentMethod } from '../../types';

/** WBS: Customer Portal — Booking Flow (6 features) */
export default function BookPlot({ onNavigate }: { onNavigate: (p: string) => void }) {
  const { session } = useAuth();
  const [step, setStep] = useState(1);
  const [societies, setSocieties] = useState<{ id: string; name: string }[]>([]);
  const [societyId, setSocietyId] = useState('');
  const [plots, setPlots] = useState<Awaited<ReturnType<typeof fetchAvailablePlots>>>([]);
  const [plotId, setPlotId] = useState('');
  const [channel, setChannel] = useState<'direct' | 'dealer'>('direct');
  const [dealers, setDealers] = useState<{ id: string; email: string; firm: string }[]>([]);
  const [dealerId, setDealerId] = useState('');
  const [token, setToken] = useState('');
  const [plan, setPlan] = useState(INSTALLMENT_PLANS[0]);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('bank');
  const [proof, setProof] = useState<File | null>(null);
  const [done, setDone] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApprovedSocieties().then((list) => {
      setSocieties(list.map((s) => ({ id: s.id, name: s.name })));
      if (list.length > 0) setSocietyId(list[0].id);
    });
  }, []);

  useEffect(() => {
    if (!societyId) return;
    fetchAvailablePlots(societyId).then(setPlots);
    fetchSocietyDealers(societyId).then(setDealers);
    setPlotId('');
  }, [societyId]);

  const selectedPlot = plots.find((p) => p.id === plotId);

  const submit = async () => {
    if (!session || !plotId) return;
    setLoading(true);
    setError(null);
    try {
      const b = await createBooking({
        plot_id: plotId,
        customer_id: session.user.id,
        dealer_id: channel === 'dealer' ? dealerId || null : null,
        society_id: societyId,
        channel,
        token_amount: parseFloat(token) || 0,
        installment_plan: plan,
      });
      // token paid via receipt upload → pending verification by society/dealer
      const amt = parseFloat(token) || 0;
      if (amt > 0) {
        await submitTokenPayment(b, amt, payMethod, proof);
      }
      setDone(b);
      setStep(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const canNext1 = societyId && plotId;
  const canNext2 = channel === 'direct' || dealerId;

  return (
    <div className="container">
      <div className="card wide">
        <div className="topbar">
          <h1 style={{ margin: 0 }}>Book a plot</h1>
          <button className="btn secondary small" onClick={() => onNavigate('dashboard')}>Dashboard</button>
        </div>

        <div className="pipeline" style={{ marginBottom: 20 }}>
          {['Plot', 'Channel', 'Token', 'Plan', 'Done'].map((s, i) => (
            <div key={s} className={`pipe-stage${i + 1 <= step ? ' done' : ''}`} title={s}>{s}</div>
          ))}
        </div>

        {error && <div className="error">{error}</div>}

        {step === 1 && (
          <>
            <label>Society
              <select value={societyId} onChange={(e) => setSocietyId(e.target.value)}>
                {societies.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
            <label>Select plot
              <select value={plotId} onChange={(e) => setPlotId(e.target.value)}>
                <option value="">Choose a plot…</option>
                {plots.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.block}-{p.plot_no} · {p.size_marla}M · {formatPrice(p.base_price)}
                  </option>
                ))}
              </select>
            </label>
            {plots.length === 0 && <p className="muted small">No available plots in this society.</p>}
            <button className="btn" disabled={!canNext1} onClick={() => setStep(2)}>Continue</button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="muted">How do you want to book?</p>
            <div className="role-grid">
              <button className={`role-card${channel === 'direct' ? ' selected' : ''}`} onClick={() => setChannel('direct')}>
                Direct society
              </button>
              <button className={`role-card${channel === 'dealer' ? ' selected' : ''}`} onClick={() => setChannel('dealer')}>
                Via dealer
              </button>
            </div>
            {channel === 'dealer' && (
              <label>Choose dealer
                <select value={dealerId} onChange={(e) => setDealerId(e.target.value)}>
                  <option value="">Select dealer…</option>
                  {dealers.map((d) => <option key={d.id} value={d.id}>{d.firm} ({d.email})</option>)}
                </select>
              </label>
            )}
            <div className="link-row">
              <button className="btn secondary small" onClick={() => setStep(1)}>Back</button>
              <button className="btn small" disabled={!canNext2} onClick={() => setStep(3)}>Continue</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <p className="muted">Token payment — upload your transfer receipt for verification</p>
            <label>Token amount (PKR)
              <input type="number" min={0} value={token} onChange={(e) => setToken(e.target.value)} placeholder="e.g. 100000" />
            </label>
            <label>Payment method
              <select value={payMethod} onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}>
                <option value="bank">Bank transfer</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
              </select>
            </label>
            <label>Transfer receipt / screenshot {payMethod === 'bank' ? '(required)' : '(optional)'}
              <input type="file" accept="image/*,.pdf" onChange={(e) => setProof(e.target.files?.[0] ?? null)} />
            </label>
            <div className="notice" style={{ marginBottom: 12 }}>
              Your booking stays pending until the society verifies your token receipt.
            </div>
            <div className="link-row">
              <button className="btn secondary small" onClick={() => setStep(2)}>Back</button>
              <button className="btn small" onClick={() => setStep(4)}>Continue {token ? formatPrice(parseFloat(token)) : ''}</button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <p className="muted">Select installment plan</p>
            {INSTALLMENT_PLANS.map((p) => (
              <button key={p} className={`role-card${plan === p ? ' selected' : ''}`} style={{ width: '100%', marginBottom: 8 }} onClick={() => setPlan(p)}>
                {p}
              </button>
            ))}
            <div className="link-row">
              <button className="btn secondary small" onClick={() => setStep(3)}>Back</button>
              <button className="btn small" disabled={loading} onClick={submit}>
                {loading ? 'Booking…' : 'Confirm booking'}
              </button>
            </div>
          </>
        )}

        {step === 5 && done && (
          <>
            <div className="badge ok">Booking confirmed</div>
            <h3>Reference number</h3>
            <p className="price big">{done.reference_no}</p>
            <div className="detail-grid">
              <div className="detail-item"><span className="detail-key">Plot</span><span>{selectedPlot ? `${selectedPlot.block}-${selectedPlot.plot_no}` : '—'}</span></div>
              <div className="detail-item"><span className="detail-key">Channel</span><span>{done.channel}</span></div>
              <div className="detail-item"><span className="detail-key">Token</span><span>{formatPrice(done.token_amount)}</span></div>
              <div className="detail-item"><span className="detail-key">Plan</span><span>{done.installment_plan}</span></div>
            </div>
            <p className="muted small" style={{ marginTop: 12 }}>
              The society will review your booking. Track status in "My bookings".
            </p>
            <div className="link-row">
              <button className="btn small" onClick={() => onNavigate('my-bookings')}>My bookings</button>
              <button className="btn secondary small" onClick={() => onNavigate('dashboard')}>Dashboard</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
