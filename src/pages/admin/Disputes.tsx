import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import {
  fetchDisputes,
  fileDispute,
  freezePlotForDispute,
  setDisputeStatus,
} from '../../lib/admin';
import type { Dispute, DisputeStatus, DisputeType } from '../../types';

const TYPES: DisputeType[] = ['society-dealer', 'customer-complaint', 'transaction'];

/** WBS: Admin Panel — Dispute Management (6 features) */
export default function Disputes({ onNavigate }: { onNavigate: (p: string) => void }) {
  const { session, profile } = useAuth();
  const isAdmin = profile?.role === 'super_admin';
  const [list, setList] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [fType, setFType] = useState<DisputeType>('customer-complaint');
  const [fSubject, setFSubject] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fBooking, setFBooking] = useState('');
  const [resolution, setResolution] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setList(await fetchDisputes(isAdmin || profile?.role === 'society_admin' ? null : (session?.user.id ?? null)));
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    try {
      await fileDispute({
        reporter_id: session.user.id,
        type: fType,
        subject: fSubject,
        description: fDesc,
        booking_ref: fBooking || null,
      });
      setMsg('Dispute filed. Admin will review it.');
      setShowForm(false);
      setFSubject(''); setFDesc(''); setFBooking('');
      load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Failed');
    }
  };

  const act = async (d: Dispute, status: DisputeStatus) => {
    await setDisputeStatus(d.id, status, resolution[d.id] || undefined);
    load();
  };

  return (
    <div className="container">
      <div className="topbar">
        <div>
          <h1>Disputes</h1>
          <p className="muted" style={{ margin: 0 }}>{list.length} total</p>
        </div>
        <div className="link-row" style={{ margin: 0 }}>
          <button className="btn small" onClick={() => setShowForm(!showForm)}>+ File dispute</button>
          <button className="btn secondary small" onClick={() => onNavigate(isAdmin ? 'admin' : 'dashboard')}>Back</button>
        </div>
      </div>

      {msg && <div className="notice" style={{ marginBottom: 12 }}>{msg}</div>}

      {showForm && (
        <div className="card wide" style={{ marginBottom: 16 }}>
          <h3>File a dispute / complaint</h3>
          <form onSubmit={submit}>
            <label>Type
              <select value={fType} onChange={(e) => setFType(e.target.value as DisputeType)}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label>Subject<input required value={fSubject} onChange={(e) => setFSubject(e.target.value)} /></label>
            <label>Booking ref (optional)<input value={fBooking} onChange={(e) => setFBooking(e.target.value)} placeholder="BK-…" /></label>
            <label>Description<textarea required rows={3} value={fDesc} onChange={(e) => setFDesc(e.target.value)} /></label>
            <button className="btn small" type="submit">Submit</button>
          </form>
        </div>
      )}

      {loading ? <p className="muted">Loading…</p> : list.length === 0 ? (
        <p className="muted">No disputes.</p>
      ) : (
        list.map((d) => (
          <div key={d.id} className="card wide" style={{ marginBottom: 12 }}>
            <div className="queue-head">
              <div>
                <strong>{d.subject}</strong>
                <div className="muted small">
                  {d.type} · by {d.reporter_email}
                  {d.plot_label ? ` · Plot ${d.plot_label}` : ''}
                  {d.booking_ref ? ` · ${d.booking_ref}` : ''}
                </div>
                <p style={{ margin: '8px 0 0' }}>{d.description}</p>
                {d.resolution_note && (
                  <p className="muted small" style={{ marginTop: 8 }}>
                    <strong>Resolution:</strong> {d.resolution_note}
                  </p>
                )}
              </div>
              <span className={`badge ${d.status === 'open' ? 'warn' : d.status === 'resolved' ? 'ok' : 'warn'}`}>
                {d.status.replace('_', ' ')}
              </span>
            </div>
            {isAdmin && d.status !== 'resolved' && (
              <div style={{ marginTop: 12 }}>
                <label>Resolution notice
                  <input
                    value={resolution[d.id] ?? ''}
                    onChange={(e) => setResolution((p) => ({ ...p, [d.id]: e.target.value }))}
                    placeholder="Write resolution notice…"
                  />
                </label>
                <div className="link-row">
                  <button className="btn small" onClick={() => act(d, 'in_review')}>Take up</button>
                  <button className="btn small" onClick={() => act(d, 'resolved')}>Resolve & notify</button>
                  <button className="btn secondary small" onClick={() => act(d, 'escalated')}>Escalate</button>
                  {d.plot_id && (
                    <button className="btn danger small" onClick={async () => { await freezePlotForDispute(d.plot_id!, true); setMsg('Plot frozen during dispute.'); }}>
                      Freeze plot
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
