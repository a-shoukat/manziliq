import type { ReactNode } from 'react';
import { useAuth } from '../lib/auth';
import type { UserRole } from '../types';

interface Props {
  children: ReactNode;
  allowedRoles?: UserRole[];
  onNavigate: (page: string) => void;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  onNavigate,
}: Props) {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="page">
        <div className="card">
          <p className="muted">Loading…</p>
        </div>
      </div>
    );
  }

  if (!session) {
    onNavigate('login');
    return null;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return (
      <div className="page">
        <div className="card">
          <div className="badge warn">Access denied</div>
          <p className="muted">
            Your role ({profile.role}) cannot access this page.
          </p>
          <button className="btn secondary" onClick={() => onNavigate('dashboard')}>
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
