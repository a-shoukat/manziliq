import { useState } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import { CompareProvider } from './lib/compare';
import { isSupabaseConfigured } from './lib/supabase';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import PropertyDetail from './pages/PropertyDetail';
import Compare from './pages/Compare';
import AddProperty from './pages/AddProperty';
import AdminVerification from './pages/AdminVerification';
import SocietyHub from './pages/society/SocietyHub';
import SocietyProfile from './pages/society/Profile';
import DirectSale from './pages/society/DirectSale';
import TransferReview from './pages/society/TransferReview';
import Inventory from './pages/society/Inventory';
import PlotMap from './pages/society/PlotMap';
import Dealers from './pages/society/Dealers';
import DealerHub from './pages/dealer/DealerHub';
import DealerCreateBooking from './pages/dealer/DealerCreateBooking';
import TransferRequests from './pages/dealer/TransferRequests';
import Discover from './pages/dealer/Discover';
import MyLots from './pages/dealer/MyLots';
import Leads from './pages/dealer/Leads';
import VerifyPayments from './pages/dealer/VerifyPayments';
import MapView from './pages/MapView';
import BookPlot from './pages/booking/BookPlot';
import MyBookings from './pages/booking/MyBookings';
import BookingsAdmin from './pages/booking/BookingsAdmin';
import MyPayments from './pages/payment/MyPayments';
import SocietyFinancials from './pages/payment/SocietyFinancials';
import PriceEstimator from './pages/PriceEstimator';
import Inbox from './pages/notifications/Inbox';
import Broadcast from './pages/notifications/Broadcast';
import AdminHub from './pages/admin/AdminHub';
import SystemSettings from './pages/admin/SystemSettings';
import Disputes from './pages/admin/Disputes';
import LegalTemplates from './pages/admin/LegalTemplates';
import PlatformAnalytics from './pages/admin/PlatformAnalytics';
import Documents from './pages/legal/Documents';
import SocietyAnalytics from './pages/analytics/SocietyAnalytics';
import DealerAnalytics from './pages/analytics/DealerAnalytics';
import MarketTrends from './pages/analytics/MarketTrends';
import CustomerActivity from './pages/analytics/CustomerActivity';
import Navbar from './components/Navbar';
import AiAssistant from './components/AiAssistant';
import ProtectedRoute from './components/ProtectedRoute';
import { startBroadcastScheduler, type ScheduledBroadcast } from './lib/scheduler';
import { allSocietyIds, allUserIds, societyCustomerIds, societyDealerIds } from './lib/notify';
import { useEffect } from 'react';
import './index.css';

function Shell() {
  const [page, setPage] = useState('login');
  const [arg, setArg] = useState<string | undefined>(undefined);
  const { session, loading } = useAuth();

  // start the scheduled-broadcast worker once per session
  useEffect(() => {
    if (!session) return;
    const resolveAudience = async (b: ScheduledBroadcast): Promise<string[]> => {
      if (b.audience === 'customers') return societyCustomerIds(b.owner_id);
      if (b.audience === 'dealers') return societyDealerIds(b.owner_id);
      if (b.audience === 'societies') return allSocietyIds();
      if (b.audience === 'all') return allUserIds();
      return [];
    };
    startBroadcastScheduler(resolveAudience, session.user.id);
  }, [session]);

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
    if (page === 'login') return <Login onNavigate={navigate} />;
    return <Landing onNavigate={navigate} />;
  }

  return (
    <>
      <Navbar page={page} onNavigate={navigate} />
      <AiAssistant onNavigate={navigate} />
      {page === 'dashboard' || page === 'login' ? (
        <ProtectedRoute onNavigate={navigate}>
          <Dashboard onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'landing' ? (
        <Landing onNavigate={navigate} />
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
      ) : page === 'society-profile' ? (
        <ProtectedRoute onNavigate={navigate} allowedRoles={['society_admin', 'super_admin']}>
          <SocietyProfile onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'society-direct-sale' ? (
        <ProtectedRoute onNavigate={navigate} allowedRoles={['society_admin', 'super_admin']}>
          <DirectSale onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'society-transfer-review' ? (
        <ProtectedRoute onNavigate={navigate} allowedRoles={['society_admin', 'super_admin']}>
          <TransferReview onNavigate={navigate} />
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
      ) : page === 'dealer-verify-payments' ? (
        <ProtectedRoute onNavigate={navigate} allowedRoles={['dealer', 'super_admin']}>
          <VerifyPayments onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'dealer-create-booking' ? (
        <ProtectedRoute onNavigate={navigate} allowedRoles={['dealer', 'super_admin']}>
          <DealerCreateBooking onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'dealer-transfer-requests' ? (
        <ProtectedRoute onNavigate={navigate} allowedRoles={['dealer', 'super_admin']}>
          <TransferRequests onNavigate={navigate} />
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
      ) : page === 'my-payments' ? (
        <ProtectedRoute onNavigate={navigate} allowedRoles={['buyer', 'super_admin']}>
          <MyPayments onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'society-financials' ? (
        <ProtectedRoute onNavigate={navigate} allowedRoles={['society_admin', 'super_admin']}>
          <SocietyFinancials onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'price-estimator' ? (
        <ProtectedRoute onNavigate={navigate}>
          <PriceEstimator onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'inbox' ? (
        <ProtectedRoute onNavigate={navigate}>
          <Inbox onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'broadcast' ? (
        <ProtectedRoute onNavigate={navigate} allowedRoles={['society_admin', 'super_admin']}>
          <Broadcast onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'admin' ? (
        <ProtectedRoute onNavigate={navigate} allowedRoles={['super_admin']}>
          <AdminHub onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'admin-disputes' ? (
        <ProtectedRoute onNavigate={navigate} allowedRoles={['super_admin']}>
          <Disputes onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'admin-settings' ? (
        <ProtectedRoute onNavigate={navigate} allowedRoles={['super_admin']}>
          <SystemSettings onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'admin-templates' ? (
        <ProtectedRoute onNavigate={navigate} allowedRoles={['super_admin']}>
          <LegalTemplates onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'admin-analytics' ? (
        <ProtectedRoute onNavigate={navigate} allowedRoles={['super_admin']}>
          <PlatformAnalytics onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'documents' ? (
        <ProtectedRoute onNavigate={navigate}>
          <Documents onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'society-analytics' ? (
        <ProtectedRoute onNavigate={navigate} allowedRoles={['society_admin', 'super_admin']}>
          <SocietyAnalytics onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'dealer-analytics' ? (
        <ProtectedRoute onNavigate={navigate} allowedRoles={['dealer']}>
          <DealerAnalytics onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'market-trends' ? (
        <ProtectedRoute onNavigate={navigate}>
          <MarketTrends onNavigate={navigate} />
        </ProtectedRoute>
      ) : page === 'my-activity' ? (
        <ProtectedRoute onNavigate={navigate} allowedRoles={['buyer']}>
          <CustomerActivity onNavigate={navigate} />
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
