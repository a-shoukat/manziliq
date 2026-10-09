import { useAuth } from '../lib/auth';
import { ROLE_LABELS } from '../types';

const ROLE_HOME: Record<string, string> = {
  buyer: 'Browse properties in the marketplace (coming in v3).',
  dealer: 'Manage your listings and leads (coming in v5).',
  society_admin: 'Manage your society inventory (coming in v4).',
  super_admin: 'Full platform administration (coming in v11).',
};

export default function Dashboard({ onNavigate }: { onNavigate: (p: string) => void }) {
  const { profile, signOut } = useAuth();

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

        <div className="badge ok">Database connected</div>
        <p>
          Signed in as <strong>{profile?.email}</strong>
        </p>
        <p className="muted">
          {profile ? ROLE_HOME[profile.role] : ''}
        </p>

        <div className="notice" style={{ marginTop: 16 }}>
          Module 1 of 12 complete: Authentication with role-based access.
          Marketplace, Society, Dealer and the rest arrive in the next versions.
        </div>
      </div>
    </div>
  );
}
