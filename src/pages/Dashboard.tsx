import { useAuth } from '../lib/auth';
import { ROLE_LABELS } from '../types';

const ROLE_HOME: Record<string, { text: string; links: { label: string; page: string }[] }> = {
  buyer: {
    text: 'Search and browse properties. Marketplace arrives in v3.',
    links: [],
  },
  dealer: {
    text: 'Your account is under verification. After approval you can discover societies and manage leads.',
    links: [],
  },
  society_admin: {
    text: 'Your society is under verification. After approval you can manage plot inventory.',
    links: [],
  },
  super_admin: {
    text: 'Review pending society & dealer registrations.',
    links: [{ label: 'Verification queue', page: 'admin-verification' }],
  },
};

export default function Dashboard({ onNavigate }: { onNavigate: (p: string) => void }) {
  const { profile, signOut } = useAuth();
  const home = profile ? ROLE_HOME[profile.role] : null;

  const statusBadge =
    profile?.verification_status === 'approved' ? (
      <div className="badge ok">Verified</div>
    ) : profile?.verification_status === 'pending' ? (
      <div className="badge warn">Pending verification</div>
    ) : profile?.verification_status === 'rejected' ? (
      <div className="badge warn">Rejected</div>
    ) : (
      <div className="badge warn">Blacklisted</div>
    );

  return (
    <div className="page">
      <div className="card wide">
        <div className="topbar">
          <div>
            <h1>ManzilIQ</h1>
            <p className="muted" style={{ margin: 0 }}>
              {profile ? ROLE_LABELS[profile.role] : ''} dashboard
            </p>
          </div>
          <button
            className="btn secondary small"
            onClick={async () => {
              await signOut();
              onNavigate('login');
            }}
          >
            Sign out
          </button>
        </div>

        {statusBadge}
        <p>
          Signed in as <strong>{profile?.email}</strong>
        </p>
        <p className="muted">{home?.text}</p>

        {home && home.links.length > 0 && (
          <div className="link-row">
            {home.links.map((l) => (
              <button key={l.page} className="btn secondary small" onClick={() => onNavigate(l.page)}>
                {l.label}
              </button>
            ))}
          </div>
        )}

        <div className="link-row">
          <button className="btn small" onClick={() => onNavigate('marketplace')}>
            Browse marketplace
          </button>
          <button className="btn secondary small" onClick={() => onNavigate('compare')}>
            Compare plots
          </button>
        </div>

        <div className="notice" style={{ marginTop: 16 }}>
          Module 1 of 12: Authentication + Registration & Verification (all roles).
        </div>
      </div>
    </div>
  );
}
