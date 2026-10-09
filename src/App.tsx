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
import SocietyHub from './pages/society/SocietyHub';
import Inventory from './pages/society/Inventory';
import PlotMap from './pages/society/PlotMap';
import Dealers from './pages/society/Dealers';
import DealerHub from './pages/dealer/DealerHub';
import Discover from './pages/dealer/Discover';
import MyLots from './pages/dealer/MyLots';
import Leads from './pages/dealer/Leads';
import MapView from './pages/MapView';
import BookPlot from './pages/booking/BookPlot';
import MyBookings from './pages/booking/MyBookings';
import BookingsAdmin from './pages/booking/BookingsAdmin';
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
      ) : page === 'society' ? (
        <ProtectedRoute onNavigate={navigate} allowedRoles={['society_admin', 'super_admin']}>
          <SocietyHub onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'society-inventory' ? (
        <ProtectedRoute onNavigate={navigate} allowedRoles={['society_admin', 'super_admin']}>
          <Inventory onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'society-map' ? (
        <ProtectedRoute onNavigate={navigate} allowedRoles={['society_admin', 'super_admin']}>
          <PlotMap onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'society-dealers' ? (
        <ProtectedRoute onNavigate={navigate} allowedRoles={['society_admin', 'super_admin']}>
          <Dealers onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'dealer' ? (
        <ProtectedRoute onNavigate={navigate} allowedRoles={['dealer', 'super_admin']}>
          <DealerHub onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'dealer-discover' ? (
        <ProtectedRoute onNavigate={navigate} allowedRoles={['dealer', 'super_admin']}>
          <Discover onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'dealer-lots' ? (
        <ProtectedRoute onNavigate={navigate} allowedRoles={['dealer', 'super_admin']}>
          <MyLots onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'dealer-leads' ? (
        <ProtectedRoute onNavigate={navigate} allowedRoles={['dealer', 'super_admin']}>
          <Leads onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'map-view' ? (
        <ProtectedRoute onNavigate={navigate}>
          <MapView onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'book-plot' ? (
        <ProtectedRoute onNavigate={navigate} allowedRoles={['buyer', 'super_admin']}>
          <BookPlot onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'my-bookings' ? (
        <ProtectedRoute onNavigate={navigate} allowedRoles={['buyer', 'super_admin']}>
          <MyBookings onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'society-bookings' ? (
        <ProtectedRoute onNavigate={navigate} allowedRoles={['society_admin', 'super_admin']}>
          <BookingsAdmin onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'admin-bookings' ? (
        <ProtectedRoute onNavigate={navigate} allowedRoles={['super_admin']}>
          <BookingsAdmin onNavigate={navigate} admin />
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
