import { useEffect, useState } from 'react';
import { fetchAuditLogs, fetchSettings, saveSetting, type AuditEntry } from '../../lib/audit';

/** WBS: System admin — system settings + audit log viewer */
export default function SystemSettings({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [s, l] = await Promise.all([fetchSettings(), fetchAuditLogs()]);
    setSettings(s);
    setLogs(l);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const set = (k: string, v: string) => setSettings((prev) => ({ ...prev, [k]: v }));

  const saveAll = async () => {
    setSaving(true);
    setMsg(null);
    try {
      for (const [k, v] of Object.entries(settings)) await saveSetting(k, v);
      setMsg('Settings saved.');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const fields: { key: string; label: string; hint: string }[] = [
    { key: 'app_name', label: 'App name', hint: 'Shown in headers and emails' },
    { key: 'support_email', label: 'Support email', hint: 'Contact shown to users' },
    { key: 'support_phone', label: 'Support phone', hint: 'Contact shown to users' },
    { key: 'late_fee_pct', label: 'Late fee % / month', hint: 'Applied to overdue installments' },
    { key: 'token_default_pct', label: 'Default token %', hint: 'Suggested token amount hint' },
  ];

  return (
    <div className="container">
      <div className="card wide">
        <div className="topbar">
          <h1 style={{ margin: 0 }}>System settings</h1>
          <button className="btn secondary small" onClick={() => onNavigate('admin')}>Back</button>
        </div>
        {msg && <div className="notice" style={{ marginBottom: 12 }}>{msg}</div>}
        {loading ? <p className="muted">Loading…</p> : (
          <>
            {fields.map((f) => (
              <label key={f.key}>{f.label}
                <input value={settings[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)} placeholder={f.hint} />
              </label>
            ))}
            <button className="btn" disabled={saving} onClick={saveAll}>{saving ? 'Saving…' : 'Save settings'}</button>

            <h3 style={{ marginTop: 32 }}>Audit log</h3>
            <p className="muted small">Key admin actions across the platform (latest {logs.length}).</p>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Entity</th><th>Details</th></tr></thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id}>
                      <td className="small">{new Date(l.created_at).toLocaleString()}</td>
                      <td className="small">{l.actor_email ?? '—'}</td>
                      <td><span className="badge">{l.action}</span></td>
                      <td className="small">{l.entity_type ?? '—'}{l.entity_id ? ` · ${l.entity_id.slice(0, 8)}` : ''}</td>
                      <td className="small">{l.details ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {logs.length === 0 && <p className="muted small">No audit entries yet.</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
