import { useState } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import { CompareProvider } from './lib/compare';
import { isSupabaseConfigured } from './lib/supabase';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import PropertyDetail from './pages/PropertyDetail';
import Compare from './pages/Compare';
import AddProperty from './pages/AddProperty';
import AdminVerification from './pages/AdminVerification';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function Shell() {
  const [page, setPage] = useState('login');
  const [arg, setArg] = useState<string | undefined>(undefined);
  const { session, loading } = useAuth();

  const navigate = (p: string, a?: string) => {
    setPage(p);
    setArg(a);
    window.scrollTo(0, 0);
  };

  if (!isSupabaseConfigured()) {
    return <Login onNavigate={navigate} />;
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

  if (!session) {
    return <Login onNavigate={navigate} />;
  }

  return (
    <>
      <Navbar page={page} onNavigate={navigate} />
      {page === 'dashboard' || page === 'login' ? (
        <ProtectedRoute onNavigate={navigate}>
          <Dashboard onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'marketplace' ? (
        <ProtectedRoute onNavigate={navigate}>
          <Marketplace onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'property' && arg ? (
        <ProtectedRoute onNavigate={navigate}>
          <PropertyDetail id={arg} onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'compare' ? (
        <ProtectedRoute onNavigate={navigate}>
          <Compare onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'add-property' ? (
        <ProtectedRoute
          onNavigate={navigate}
          allowedRoles={['dealer', 'society_admin', 'super_admin']}
        >
          <AddProperty onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'admin-verification' ? (
        <ProtectedRoute onNavigate={navigate} allowedRoles={['super_admin']}>
          <AdminVerification onNavigate={navigate} />
        </ProtectedRoute>
      ) : (
        <ProtectedRoute onNavigate={navigate}>
          <Dashboard onNavigate={navigate} />
        </ProtectedRoute>
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CompareProvider>
        <Shell />
      </CompareProvider>
    </AuthProvider>
  );
}
