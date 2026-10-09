import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { sendWhatsApp } from '../../lib/whatsapp';
import {
  allSocietyIds,
  allUserIds,
  deleteTemplate,
  fetchTemplates,
  notify,
  saveTemplate,
  societyCustomerIds,
  societyDealerIds,
} from '../../lib/notify';
import { cancelBroadcast, fetchMyBroadcasts, scheduleBroadcast, type ScheduledBroadcast } from '../../lib/scheduler';
import type { MessageTemplate } from '../../types';

/** WBS: Broadcast features + message template library */
export default function Broadcast({ onNavigate }: { onNavigate: (p: string) => void }) {
  const { session, profile } = useAuth();
  const [audience, setAudience] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [scheduled, setScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [broadcasts, setBroadcasts] = useState<ScheduledBroadcast[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [tTitle, setTTitle] = useState('');
  const [tBody, setTBody] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [waTo, setWaTo] = useState('');
  const [waSending, setWaSending] = useState(false);

  const isSociety = profile?.role === 'society_admin';
  const isAdmin = profile?.role === 'super_admin';

  const audiences = [
    ...(isSociety
      ? [
          { id: 'customers', label: 'My customers (bookings)' },
          { id: 'dealers', label: 'My dealers' },
        ]
      : []),
    ...(isAdmin
      ? [
          { id: 'societies', label: 'All societies' },
          { id: 'all', label: 'All users (system-wide)' },
        ]
      : []),
  ];

  const loadTemplates = async () => {
    setTemplates(await fetchTemplates(session?.user.id ?? null));
  };

  const loadBroadcasts = async () => {
    if (session) setBroadcasts(await fetchMyBroadcasts(session.user.id));
  };

  useEffect(() => {
    loadTemplates();
    loadBroadcasts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resolveAudience = async (): Promise<string[]> => {
    if (!session) return [];
    if (audience === 'customers' && isSociety) return societyCustomerIds(session.user.id);
    if (audience === 'dealers' && isSociety) return societyDealerIds(session.user.id);
    if (audience === 'societies' && isAdmin) return allSocietyIds();
    if (audience === 'all' && isAdmin) return allUserIds();
    return [];
  };

  const send = async () => {
    if (!title.trim() || !body.trim() || !audience) {
      setMsg('Pick an audience and write a title + message.');
      return;
    }
    if (!session) return;
    setSending(true);
    try {
      const ids = (await resolveAudience()).filter((id) => id !== session?.user.id);
      if (ids.length === 0) {
        setMsg('No recipients in this audience.');
      } else if (scheduled) {
        if (!scheduledAt) {
          setMsg('Pick a date & time for the scheduled broadcast.');
        } else {
          await scheduleBroadcast(session.user.id, audience, title, body, new Date(scheduledAt), ids.length);
          setMsg(`Scheduled for ${new Date(scheduledAt).toLocaleString()} — will send to ${ids.length} recipients automatically.`);
          loadBroadcasts();
        }
      } else {
        await notify(ids, title.trim(), body.trim(), 'broadcast');
        setMsg(`Sent to ${ids.length} recipients.`);
      }
      setTitle('');
      setBody('');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Send failed');
    } finally {
      setSending(false);
    }
  };

  const useTemplate = (t: MessageTemplate) => {
    setTitle(t.title);
    setBody(t.body);
  };

  return (
    <div className="container">
      <div className="topbar">
        <div>
          <h1>Broadcast</h1>
          <p className="muted" style={{ margin: 0 }}>Announcements & templates</p>
        </div>
        <button className="btn secondary small" onClick={() => onNavigate('dashboard')}>Dashboard</button>
      </div>

      {msg && <div className="notice" style={{ marginBottom: 12 }}>{msg}</div>}

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>💬 WhatsApp test</h3>
        <p className="muted small">Send a test WhatsApp message via Meta Cloud API (free tier). Use the hello_world template — your number must be registered as a test recipient in the Meta dashboard.</p>
        <div className="form-row">
          <label>To (digits only, e.g. 923001234567)
            <input value={waTo} onChange={(e) => setWaTo(e.target.value)} placeholder="92300…" />
          </label>
        </div>
        <button
          className="btn small"
          disabled={waSending}
          onClick={async () => {
            if (!waTo.trim()) {
              setMsg('Enter a phone number first.');
              return;
            }
            setWaSending(true);
            const r = await sendWhatsApp(waTo.trim(), { template: 'hello_world' });
            setMsg(r.ok ? 'WhatsApp message sent! Check the phone.' : `WhatsApp failed: ${r.error}`);
            setWaSending(false);
          }}
        >
          {waSending ? 'Sending…' : 'Send test WhatsApp'}
        </button>
      </div>

      <div className="panel-grid">
        <div className="card">
          <h3>New announcement</h3>
          <label>Audience
            <select value={audience} onChange={(e) => setAudience(e.target.value)}>
              <option value="">Select…</option>
              {audiences.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
          </label>
          <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
          <label>Message<textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} /></label>
          <label className="check-row">
            <input type="checkbox" checked={scheduled} onChange={(e) => setScheduled(e.target.checked)} />
            Schedule for later
          </label>
          {scheduled && (
            <label>Send at
              <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            </label>
          )}
          <button className="btn" disabled={sending} onClick={send}>
            {sending ? 'Sending…' : scheduled ? 'Schedule' : 'Send now'}
          </button>
          <p className="muted small" style={{ marginTop: 10 }}>
            Scheduled broadcasts are sent automatically when due (checked every 5 minutes while the app is open).
          </p>
        </div>

        <div className="card">
          <h3>Scheduled broadcasts</h3>
          {broadcasts.length === 0 ? <p className="muted small">None yet.</p> : (
            <div className="table-wrap"><table className="data-table">
              <thead><tr><th>Title</th><th>Audience</th><th>Scheduled</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {broadcasts.map((b) => (
                  <tr key={b.id}>
                    <td>{b.title}</td>
                    <td className="small">{b.audience}</td>
                    <td className="small">{new Date(b.scheduled_at).toLocaleString()}</td>
                    <td>{b.sent_at ? <span className="badge ok">Sent ({b.recipient_count})</span> : <span className="badge warn">Pending</span>}</td>
                    <td>{!b.sent_at && <button className="link inline" onClick={async () => { await cancelBroadcast(b.id); loadBroadcasts(); }}>Cancel</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          )}
        </div>

        <div className="card">
          <h3>Message templates</h3>
          {templates.map((t) => (
            <div key={t.id} className="queue-head" style={{ borderBottom: '1px solid #1e293b', padding: '8px 0' }}>
              <div>
                <strong>{t.title}</strong>
                <div className="muted small">{t.body.slice(0, 80)}{t.body.length > 80 ? '…' : ''}</div>
              </div>
              <div className="link-row" style={{ margin: 0 }}>
                <button className="link inline" onClick={() => useTemplate(t)}>Use</button>
                {t.owner_id && (
                  <button className="link inline danger-text" onClick={async () => { await deleteTemplate(t.id); loadTemplates(); }}>Delete</button>
                )}
              </div>
            </div>
          ))}
          {templates.length === 0 && <p className="muted small">No templates yet.</p>}
          <h3 style={{ marginTop: 16 }}>Save new template</h3>
          <label>Title<input value={tTitle} onChange={(e) => setTTitle(e.target.value)} /></label>
          <label>Body<textarea rows={3} value={tBody} onChange={(e) => setTBody(e.target.value)} /></label>
          <button
            className="btn secondary small"
            onClick={async () => {
              if (!session || !tTitle.trim() || !tBody.trim()) return;
              await saveTemplate(session.user.id, tTitle.trim(), tBody.trim());
              setTTitle('');
              setTBody('');
              loadTemplates();
            }}
          >
            Save template
          </button>
        </div>
      </div>
    </div>
  );
}
