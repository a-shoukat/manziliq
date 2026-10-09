import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { fetchMyRequests, fetchSocietySummaries, sendJoinRequest } from '../../lib/dealer';
import type { SocietySummary } from '../../types';

/** WBS: Dealer Portal — Society Discovery & Join (5 features) */
export default function Discover({ onNavigate }: { onNavigate: (p: string) => void }) {
  const { session } = useAuth();
  const [societies, setSocieties] = useState<SocietySummary[]>([]);
  const [reqMap, setReqMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [s, r] = await Promise.all([
      fetchSocietySummaries(),
      session ? fetchMyRequests(session.user.id) : Promise.resolve([]),
    ]);
    setSocieties(s);
    const m: Record<string, string> = {};
    r.forEach((x) => (m[x.society_id] = x.status));
    setReqMap(m);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const join = async (sid: string) => {
    if (!session) return;
    try {
      await sendJoinRequest(session.user.id, sid);
      setMsg('Join request sent. Track its status here.');
      load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Request failed');
    }
  };

  return (
    <div className="container">
      <div className="topbar">
        <div>
          <h1>Discover societies</h1>
          <p className="muted" style={{ margin: 0 }}>Browse registered societies & request to join</p>
        </div>
        <button className="btn secondary small" onClick={() => onNavigate('dealer')}>Dealer portal</button>
      </div>
      {msg && <div className="notice" style={{ marginBottom: 12 }}>{msg}</div>}
      {loading ? <p className="muted">Loading…</p> : societies.length === 0 ? (
        <p className="muted">No verified societies yet.</p>
      ) : (
        <div className="hub-grid">
          {societies.map((s) => {
            const st = reqMap[s.id];
            return (
              <div key={s.id} className="hub-card" style={{ cursor: 'default' }}>
                <strong>{s.name}</strong>
                <span className="muted small">{s.email}</span>
                <span className="muted small">
                  {s.plots_available} / {s.plots_total} plots available
                </span>
                {st === 'approved' ? (
                  <span className="badge ok">Approved — view lots in "My Lots"</span>
                ) : st === 'pending' ? (
                  <span className="badge warn">Request pending</span>
                ) : st === 'rejected' ? (
                  <span className="badge warn">Rejected</span>
                ) : (
                  <button className="btn small" onClick={() => join(s.id)}>Send join request</button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
