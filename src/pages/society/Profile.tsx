import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { fetchSocietyProfile, updateSocietyProfile } from '../../lib/society';

/** WBS: Society Portal — edit society profile after admin approval */
export default function SocietyProfile({ onNavigate }: { onNavigate: (p: string) => void }) {
  const { profile } = useAuth();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [developer, setDeveloper] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profile) return;
    fetchSocietyProfile(profile.id).then((d) => {
      if (d) {
        setName(d.society_name);
        setAddress(d.address);
        setDeveloper(d.developer_info ?? '');
      }
      setLoading(false);
    });
  }, [profile]);

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateSocietyProfile(profile.id, { society_name: name, address, developer_info: developer });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container"><p className="muted">Loading…</p></div>;

  return (
    <div className="container">
      <div className="card wide">
        <div className="topbar">
          <h1 style={{ margin: 0 }}>Society profile</h1>
          <button className="btn secondary small" onClick={() => onNavigate('society')}>Back</button>
        </div>
        {error && <div className="error">{error}</div>}
        {saved && <div className="badge ok">Profile updated</div>}
        <label>Society name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. DHA Lahore" />
        </label>
        <label>Address
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Society address" />
        </label>
        <label>Developer info
          <textarea value={developer} onChange={(e) => setDeveloper(e.target.value)} placeholder="Developer / company details" rows={3} />
        </label>
        <button className="btn" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save changes'}</button>
      </div>
    </div>
  );
}
