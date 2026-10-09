import { useState } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import { isSupabaseConfigured } from './lib/supabase';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function Shell() {
  const [page, setPage] = useState('login');
  const { session, loading } = useAuth();

  if (!isSupabaseConfigured()) {
    return <Login onNavigate={setPage} />;
  }

  if (loading) {
    return (
      <div className="page">
        <div className="card">
          <p className="muted">Loading…</p>
        </div>
      </div>
    );
  }

  // Already signed in → go to dashboard
  if (session && page === 'login') {
    return (
      <ProtectedRoute onNavigate={setPage}>
        <Dashboard onNavigate={setPage} />
      </ProtectedRoute>
    );
  }

  if (page === 'dashboard') {
    return (
      <ProtectedRoute onNavigate={setPage}>
        <Dashboard onNavigate={setPage} />
      </ProtectedRoute>
    );
  }

  return <Login onNavigate={setPage} />;
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
