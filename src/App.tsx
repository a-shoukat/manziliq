import React, { useState, useEffect } from 'react';
import { 
  User, 
  UserRole, 
  UserStatus,
  Society, 
  Plot, 
  Property, 
  Booking, 
  Installment, 
  Payment,
  BookingPipelineStage,
  NotificationItem, 
  DocumentItem,
  VerificationRequest, 
  Dispute,
  AuditLogEntry,
  DealerSocietyRelation,
  LotAssignment,
  DealerLotRequest,
  LotAuditTrailEntry,
  SavedComparison
} from './types';
import { 
  INITIAL_USERS, 
  INITIAL_SOCIETIES, 
  INITIAL_PLOTS, 
  INITIAL_PROPERTIES, 
  INITIAL_BOOKINGS, 
  INITIAL_INSTALLMENTS, 
  INITIAL_PAYMENTS,
  INITIAL_NOTIFICATIONS, 
  INITIAL_DOCUMENTS,
  INITIAL_VERIFICATION_REQUESTS,
  INITIAL_DISPUTES,
  INITIAL_AUDIT_LOGS,
  INITIAL_DEALER_RELATIONS,
  INITIAL_LOT_ASSIGNMENTS,
  INITIAL_DEALER_LOT_REQUESTS,
  INITIAL_LOT_AUDIT_TRAIL
} from './data/mockData';
import { appStore } from './lib/appStore';

// Layout & Common Components
import { AppNavbar } from './components/layout/AppNavbar';
import { DashboardSidebar } from './components/layout/DashboardSidebar';
import { Breadcrumbs } from './components/layout/Breadcrumbs';
import { BookingModal } from './components/common/BookingModal';
import { PaymentModal } from './components/common/PaymentModal';
import { PaymentSimModal } from './components/common/PaymentSimModal';
import { ThreeTierNotificationModal } from './components/common/ThreeTierNotificationModal';
import { PushNotificationToast } from './components/common/PushNotificationToast';
import { SupabaseConnectModal } from './components/SupabaseConnectModal';
import { CompareBar } from './components/CompareBar';
import { AiAssistantWidget } from './components/AiAssistantWidget';
import { NotificationCenterView } from './views/common/NotificationCenterView';
import { notificationService } from './services/notificationService';

// Public Views
import { LandingPageView } from './views/public/LandingPageView';
import { PropertyMarketplaceView } from './views/public/PropertyMarketplaceView';
import { PropertyDetailView } from './views/public/PropertyDetailView';
import { ComparisonView } from './views/public/ComparisonView';
import { SocietiesExplorerView } from './views/public/SocietiesExplorerView';
import { SocietyDetailView } from './views/public/SocietyDetailView';
import { StandalonePriceEstimatorView } from './views/public/StandalonePriceEstimatorView';

// Auth Views
import { LoginView } from './views/auth/LoginView';
import { SignupView } from './views/auth/SignupView';
import { VerifyPendingView } from './views/auth/VerifyPendingView';
import { ResetPasswordView } from './views/auth/ResetPasswordView';

// Buyer Dashboard Views
import { BuyerOverviewView } from './views/buyer/BuyerOverviewView';
import { BuyerBookingsView } from './views/buyer/BuyerBookingsView';
import { BuyerInstallmentsView } from './views/buyer/BuyerInstallmentsView';
import { BuyerWishlistView } from './views/buyer/BuyerWishlistView';
import { BuyerDocumentsView } from './views/buyer/BuyerDocumentsView';
import { BuyerInquiriesView } from './views/buyer/BuyerInquiriesView';
import { BuyerNotificationsView } from './views/buyer/BuyerNotificationsView';

// Dealer Dashboard Views
import { DealerOverviewView } from './views/dealer/DealerOverviewView';
import { DealerAssignedLotsView } from './views/dealer/DealerAssignedLotsView';
import { DealerLeadsCrmView } from './views/dealer/DealerLeadsCrmView';
import { DealerCommissionView } from './views/dealer/DealerCommissionView';
import { DealerListingsManagerView } from './views/dealer/DealerListingsManagerView';

// Society Admin Dashboard Views
import { SocietyOverviewView } from './views/society/SocietyOverviewView';
import { SocietyPlotInventoryView } from './views/society/SocietyPlotInventoryView';
import { SocietyDealerAssignmentView } from './views/society/SocietyDealerAssignmentView';
import { SocietyBookingApprovalsView } from './views/society/SocietyBookingApprovalsView';
import { SocietyFinancialsView } from './views/society/SocietyFinancialsView';

// Super Admin Dashboard Views
import { SuperAdminOverviewView } from './views/admin/SuperAdminOverviewView';
import { AdminUsersManagementView } from './views/admin/AdminUsersManagementView';
import { AdminVerificationQueueView } from './views/admin/AdminVerificationQueueView';
import { AdminContentModerationView } from './views/admin/AdminContentModerationView';
import { AdminDisputeManagementView } from './views/admin/AdminDisputeManagementView';
import { AdminAuditLogsView } from './views/admin/AdminAuditLogsView';

// Common Role-Aware Views & Components
import { ProfileSettingsView } from './views/common/ProfileSettingsView';
import { DocumentLockerGrid } from './components/common/DocumentLockerGrid';
import { DealPipelineKanban } from './components/common/DealPipelineKanban';
import { AddPropertyView } from './views/properties/AddPropertyView';
import { AddEditPropertyModal } from './components/properties/AddEditPropertyModal';

export default function App() {
  // Global Entities State
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // default Registered Buyer
  const [societies, setSocieties] = useState<Society[]>(INITIAL_SOCIETIES);
  const [plots, setPlots] = useState<Plot[]>(INITIAL_PLOTS);
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [installments, setInstallments] = useState<Installment[]>(INITIAL_INSTALLMENTS);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(INITIAL_VERIFICATION_REQUESTS);
  const [disputes, setDisputes] = useState<Dispute[]>(INITIAL_DISPUTES);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [dealerRelations, setDealerRelations] = useState<DealerSocietyRelation[]>(INITIAL_DEALER_RELATIONS);
  const [lotAssignments, setLotAssignments] = useState<LotAssignment[]>(INITIAL_LOT_ASSIGNMENTS);
  const [dealerLotRequests, setDealerLotRequests] = useState<DealerLotRequest[]>(INITIAL_DEALER_LOT_REQUESTS);
  const [lotAuditTrail, setLotAuditTrail] = useState<LotAuditTrailEntry[]>(INITIAL_LOT_AUDIT_TRAIL);

  // Helper to record immutable audit log entries across the application
  const addAuditLog = (entry: {
    action: string;
    category: 'SECURITY' | 'TRANSACTION' | 'MODERATION' | 'DISPUTE' | 'IDENTITY';
    target: string;
    details: string;
    entityType?: string;
    entityId?: string;
  }) => {
    const now = new Date();
    const formattedTimestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      user_id: currentUser.id,
      action: entry.action,
      category: entry.category,
      actor: `${currentUser.name} (${currentUser.role.replace('_', ' ').toUpperCase()})`,
      actorRole: currentUser.role,
      target: entry.target,
      entityType: entry.entityType,
      entityId: entry.entityId,
      ipAddress: '119.160.119.42 (Lahore, PK)',
      timestamp: formattedTimestamp,
      details: entry.details
    };

    setAuditLogs(prev => [newLog, ...prev]);
    appStore.addAuditLog(newLog);
  };

  // Property Creation / Edit State
  const [addPropertyModalOpen, setAddPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Layout Sidebar Responsive State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Client Selection / Session State
  const [wishlist, setWishlist] = useState<Property[]>([INITIAL_PROPERTIES[0]]);
  const [compareList, setCompareList] = useState<Property[]>([INITIAL_PROPERTIES[0], INITIAL_PROPERTIES[1]]);
  const [savedComparisons, setSavedComparisons] = useState<SavedComparison[]>(() => appStore.getSavedComparisons());

  // Simple Router State (synchronizes with window.location.hash or browser history)
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      return window.location.hash.replace('#', '') || '/';
    }
    return '/';
  });

  // Modal Triggers
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingTarget, setBookingTarget] = useState<{
    id?: string;
    title?: string;
    societyName?: string;
    sector?: string;
    pricePKR?: number;
    sizeMarla?: number;
    plot?: Plot;
    property?: Property;
  } | null>(null);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activeInstallment, setActiveInstallment] = useState<Installment | null>(null);

  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [selectedNotificationItem, setSelectedNotificationItem] = useState<NotificationItem | null>(null);
  const [activePushToast, setActivePushToast] = useState<NotificationItem | null>(null);

  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);

  // Sync notifications with centralized backend on mount & subscribe to realtime pushes
  useEffect(() => {
    notificationService.fetchNotifications().then(backendNotifs => {
      if (backendNotifs && backendNotifs.length > 0) {
        setNotifications(backendNotifs);
      }
    });

    const unsubscribe = notificationService.onNotificationReceived((newNotif) => {
      setNotifications(prev => {
        if (prev.some(n => n.id === newNotif.id)) return prev;
        return [newNotif, ...prev];
      });
      setActivePushToast(newNotif);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Toast Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // State to retain attempted property destination before forced auth redirects
  const [lastVisitedProperty, setLastVisitedProperty] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Route Navigation Helper with destination capture
  const handleNavigate = (route: string) => {
    let targetRoute = route;
    if (route.includes('?redirect=')) {
      const [baseRoute, queryParam] = route.split('?redirect=');
      targetRoute = baseRoute;
      if (queryParam) {
        setLastVisitedProperty(decodeURIComponent(queryParam));
      }
    } else if ((route === '/login' || route === '/signup') && currentRoute.startsWith('/property/')) {
      setLastVisitedProperty(currentRoute);
    }

    setCurrentRoute(targetRoute);
    if (typeof window !== 'undefined') {
      window.location.hash = targetRoute;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Hash change listener
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || '/';
      setCurrentRoute(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // RBAC Route Guard Enforcement
  useEffect(() => {
    // 1. Guest / Unauthenticated users attempting to access protected dashboards
    const isProtected = currentRoute.startsWith('/buyer/') ||
                        currentRoute.startsWith('/dealer/') ||
                        currentRoute.startsWith('/society/') ||
                        currentRoute.startsWith('/admin/') ||
                        currentRoute === '/properties/add' ||
                        currentRoute.startsWith('/properties/edit/') ||
                        currentRoute === '/profile' ||
                        currentRoute === '/settings';

    if (isProtected && currentUser.role === 'public_buyer') {
      triggerToast('Please sign in with authorized credentials to access this portal.');
      handleNavigate(`/login?redirect=${encodeURIComponent(currentRoute)}`);
      return;
    }

    // 2. Role Boundary Enforcement
    if (currentUser.role === 'buyer') {
      if (currentRoute.startsWith('/dealer/') || currentRoute.startsWith('/society/') || currentRoute.startsWith('/admin/') || currentRoute === '/properties/add') {
        triggerToast('Access Restricted: Customer accounts cannot access administrative portals.');
        handleNavigate('/buyer/overview');
      }
    } else if (currentUser.role === 'dealer') {
      if (currentRoute.startsWith('/society/') || currentRoute.startsWith('/admin/')) {
        triggerToast('Access Restricted: Dealer accounts cannot access Society or Super Admin portals.');
        handleNavigate('/dealer/overview');
      }
    } else if (currentUser.role === 'society_admin') {
      if (currentRoute.startsWith('/admin/')) {
        triggerToast('Access Restricted: Super Admin / TMA Regulator clearance required.');
        handleNavigate('/society/overview');
      }
    }
  }, [currentRoute, currentUser.role]);

  // Persona / Role Switcher
  const handleRoleSwitch = (role: UserRole) => {
    const matchedUser = users.find(u => u.role === role) || users[0];
    setCurrentUser(matchedUser);

    // Land on dedicated role overview route
    if (role === 'public_buyer') {
      handleNavigate('/marketplace');
      triggerToast('Browsing as Public Guest (Read-Only)');
    } else if (role === 'buyer') {
      handleNavigate('/buyer/overview');
      triggerToast(`Switched persona to Registered Buyer (${matchedUser.name})`);
    } else if (role === 'dealer') {
      handleNavigate('/dealer/overview');
      triggerToast(`Switched persona to Agent / Dealer (${matchedUser.name})`);
    } else if (role === 'society_admin') {
      handleNavigate('/society/overview');
      triggerToast(`Switched persona to Society Admin (${matchedUser.name})`);
    } else if (role === 'super_admin') {
      handleNavigate('/admin/overview');
      triggerToast(`Switched persona to Platform Super Admin (${matchedUser.name})`);
    }
  };

  // Wishlist Actions
  const handleToggleWishlist = (property: Property) => {
    if (currentUser.role === 'public_buyer') {
      setLastVisitedProperty(`/property/${property.id}`);
      triggerToast('Please sign in as a Registered Buyer to save properties to wishlist.');
      handleNavigate('/login');
      return;
    }
    if (wishlist.some(p => p.id === property.id)) {
      setWishlist(wishlist.filter(p => p.id !== property.id));
      triggerToast(`Removed "${property.title}" from your wishlist.`);
    } else {
      setWishlist([...wishlist, property]);
      triggerToast(`Saved "${property.title}" to your wishlist!`);
    }
  };

  // Compare Actions
  const handleToggleCompare = (property: Property) => {
    if (compareList.some(p => p.id === property.id)) {
      setCompareList(compareList.filter(p => p.id !== property.id));
      triggerToast(`Removed "${property.title}" from comparison.`);
    } else {
      if (compareList.length >= 3) {
        triggerToast(`Comparison limit reached (maximum 3 properties/plots).`);
        return;
      }
      setCompareList([...compareList, property]);
      triggerToast(`Added "${property.title}" to compare list (${compareList.length + 1}/3).`);
    }
  };

  const handleToggleComparePlot = (plot: Plot) => {
    const matched = compareList.some(p => p.id === plot.id || p.plotNumber === plot.plotNumber);
    if (matched) {
      setCompareList(compareList.filter(p => p.id !== plot.id && p.plotNumber !== plot.plotNumber));
      triggerToast(`Removed Plot #${plot.plotNumber} from comparison.`);
    } else {
      if (compareList.length >= 3) {
        triggerToast(`Comparison limit reached (maximum 3 plots).`);
        return;
      }
      const mappedProp: Property = {
        id: plot.id,
        title: `Plot #${plot.plotNumber} - ${plot.sizeMarla} Marla (${plot.sector})`,
        societyId: plot.societyId,
        societyName: plot.societyName,
        type: plot.category === 'commercial' ? 'commercial' : 'plot',
        sizeMarla: plot.sizeMarla,
        sizeSqFt: plot.sizeSqFt || plot.sizeMarla * 225,
        pricePKR: plot.pricePKR,
        pricePerMarla: Math.round(plot.pricePKR / (plot.sizeMarla || 1)),
        location: `${plot.sector}, ${plot.societyName}`,
        city: 'Lahore',
        images: [
          'https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=1200&q=80'
        ],
        description: `Premium ${plot.sizeMarla} Marla plot in ${plot.sector}, ${plot.societyName}.`,
        amenities: plot.features || ['Direct Road Access', 'Underground Electricity', 'LDA Verified'],
        featured: false,
        status: 'approved',
        plotNumber: plot.plotNumber,
        block: plot.block,
        createdAt: new Date().toISOString(),
        paymentPlan: {
          installmentsAvailable: true,
          downPaymentPercent: 20,
          downPaymentPKR: plot.downPaymentPKR || Math.round(plot.pricePKR * 0.2),
          monthlyAmountPKR: plot.monthlyInstallmentPKR || Math.round((plot.pricePKR * 0.8) / (plot.installmentMonths || 36)),
          installmentMonths: plot.installmentMonths || 36
        }
      };
      setCompareList([...compareList, mappedProp]);
      triggerToast(`Added Plot #${plot.plotNumber} to comparison (${compareList.length + 1}/3).`);
    }
  };

  const handleSaveComparison = (newComp: SavedComparison) => {
    appStore.saveComparison(newComp);
    setSavedComparisons(appStore.getSavedComparisons());
    triggerToast(`Comparison matrix "${newComp.title}" saved!`);
  };

  const handleDeleteSavedComparison = (id: string) => {
    appStore.deleteComparison(id);
    setSavedComparisons(appStore.getSavedComparisons());
    triggerToast('Saved comparison removed.');
  };

  const handleLoadSavedComparison = (comp: SavedComparison) => {
    const matchedProps = properties.filter(p => comp.propertyIds?.includes(p.id));
    const matchedPlots: Property[] = plots.filter(pl => comp.plotIds?.includes(pl.id)).map(plot => ({
      id: plot.id,
      title: `Plot #${plot.plotNumber} - ${plot.sizeMarla} Marla (${plot.sector})`,
      societyId: plot.societyId,
      societyName: plot.societyName,
      type: (plot.category === 'commercial' ? 'commercial' : 'plot') as 'plot' | 'commercial',
      sizeMarla: plot.sizeMarla,
      sizeSqFt: plot.sizeSqFt || plot.sizeMarla * 225,
      pricePKR: plot.pricePKR,
      pricePerMarla: Math.round(plot.pricePKR / (plot.sizeMarla || 1)),
      location: `${plot.sector}, ${plot.societyName}`,
      city: 'Lahore',
      images: [
        'https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=1200&q=80'
      ],
      description: `Premium ${plot.sizeMarla} Marla plot in ${plot.sector}, ${plot.societyName}.`,
      amenities: plot.features || ['Direct Road Access', 'Underground Electricity'],
      featured: false,
      status: 'approved' as const,
      plotNumber: plot.plotNumber,
      block: plot.block,
      createdAt: new Date().toISOString(),
      paymentPlan: {
        installmentsAvailable: true,
        downPaymentPercent: 20,
        downPaymentPKR: plot.downPaymentPKR || Math.round(plot.pricePKR * 0.2),
        monthlyAmountPKR: plot.monthlyInstallmentPKR || 45000,
        installmentMonths: plot.installmentMonths || 36
      }
    }));

    const combined = [...matchedProps, ...matchedPlots].slice(0, 3);
    if (combined.length > 0) {
      setCompareList(combined);
      triggerToast(`Loaded "${comp.title}" with ${combined.length} plots into comparison!`);
    } else {
      triggerToast('Comparison set loaded.');
    }
  };

  // Initiate Booking Modal
  const handleInitiateBooking = (item: {
    id?: string;
    title?: string;
    societyName?: string;
    sector?: string;
    pricePKR?: number;
    sizeMarla?: number;
    plot?: Plot;
    property?: Property;
  }) => {
    if (currentUser.role === 'public_buyer') {
      const attemptedTarget = currentRoute.startsWith('/property/') ? currentRoute : `/property/${item.id || 'plot'}`;
      setLastVisitedProperty(attemptedTarget);
      triggerToast('Please sign in or create an account to initiate official plot booking.');
      handleNavigate('/login');
      return;
    }
    setBookingTarget(item);
    setBookingModalOpen(true);
  };

  // Confirm Booking with Auto-Lock, Token Receipt Generation, and Centralized Multi-Channel Dispatch
  const handleBookingSuccess = async (newBooking: Booking, generatedInstallments: Installment[], paymentRecord: Payment) => {
    // 1. Update State
    setBookings(prev => [newBooking, ...prev]);
    setInstallments(prev => [...generatedInstallments, ...prev]);
    setPayments(prev => [paymentRecord, ...prev]);

    // 2. Concurrency Auto-Lock on Plot
    setPlots(prev => prev.map(p => {
      if (p.id === newBooking.plotId || p.plotNumber === newBooking.plotNumber) {
        return {
          ...p,
          status: 'reserved',
          isLocked: true,
          lockedAt: newBooking.lockedAt || new Date().toISOString(),
          lockedByUserId: newBooking.lockedByUserId || currentUser.id
        };
      }
      return p;
    }));

    // 3. Issue Token Receipt in Document Locker
    const tokenDoc: DocumentItem = {
      id: `doc-tok-${Date.now()}`,
      title: `Token Money Receipt - ${newBooking.plotNumber}`,
      type: 'token_receipt',
      category: 'payment_receipt',
      bookingId: newBooking.id,
      bookingReference: newBooking.bookingReference,
      plotNumber: newBooking.plotNumber,
      societyName: newBooking.societyName,
      buyerId: newBooking.buyerId,
      buyerName: newBooking.buyerName,
      issueDate: new Date().toISOString().split('T')[0],
      status: 'active',
      verified: true,
      verifiedStamp: true,
      verificationCode: `VRF-TOK-${newBooking.bookingReference?.replace('PROP-', '') || Date.now().toString().slice(-6)}`,
      tamperProofHash: `SHA256-${Date.now().toString(16).toUpperCase()}`,
      version: '1.0',
      fileUrl: 'stamped_token_receipt.pdf',
      fileSize: '245 KB'
    };
    setDocuments(prev => [tokenDoc, ...prev]);

    // 4. Centralized Multi-Channel Dispatch (In-App, Push/FCM, SMS, Email)
    const dispatchRes = await notificationService.dispatchWorkflowNotification(
      'booking_confirmed',
      {
        customerName: newBooking.buyerName,
        customerPhone: newBooking.buyerPhone,
        customerEmail: newBooking.buyerEmail,
        plotNumber: newBooking.plotNumber,
        societyName: newBooking.societyName,
        bookingReference: newBooking.bookingReference,
        amountPKR: newBooking.tokenAdvancePKR || 50000,
        verificationCode: newBooking.bookingReference
      },
      {
        userId: newBooking.buyerId || currentUser.id,
        role: 'buyer',
        name: newBooking.buyerName,
        phone: newBooking.buyerPhone,
        email: newBooking.buyerEmail
      },
      {
        eventKey: `booking:${newBooking.id}:confirmed`
      }
    );

    if (dispatchRes.notification) {
      setSelectedNotificationItem(dispatchRes.notification);
      setNotificationModalOpen(true);
    }

    addAuditLog({
      action: 'PLOT_AUTO_LOCKED_TOKEN_RECEIVED',
      category: 'TRANSACTION',
      target: `${newBooking.plotNumber} (${newBooking.societyName})`,
      entityType: 'BOOKING',
      entityId: newBooking.id,
      details: `Plot ${newBooking.plotNumber} auto-locked. Escrow token PKR ${(newBooking.tokenAdvancePKR || 50000).toLocaleString('en-PK')} received from ${newBooking.buyerName}. Booking Ref: ${newBooking.bookingReference}.`
    });

    setBookingModalOpen(false);
    triggerToast(`🎉 Plot ${newBooking.plotNumber} successfully reserved & auto-locked!`);
  };

  // Payment Initiation
  const handleOpenPayment = (inst: Installment) => {
    setActiveInstallment(inst);
    setPaymentModalOpen(true);
  };

  // Payment Success Handler with Digital Ledger Reconciliation & Centralized Dispatch
  const handlePaymentSuccess = async (payment: Payment, updatedInstallment: Installment) => {
    setPayments(prev => [payment, ...prev]);
    setInstallments(prev => prev.map(inst => inst.id === updatedInstallment.id ? updatedInstallment : inst));

    // Auto-generate Payment Receipt document in Document Locker
    const receiptDoc: DocumentItem = {
      id: `doc-rcp-${Date.now()}`,
      title: `Payment Receipt - ${updatedInstallment.plotNumber || 'Plot'} (${payment.receiptNumber || 'RCP'})`,
      type: 'payment_receipt',
      category: 'payment_receipt',
      bookingId: updatedInstallment.bookingId,
      bookingReference: updatedInstallment.bookingReference,
      plotNumber: updatedInstallment.plotNumber,
      societyName: updatedInstallment.societyName,
      buyerName: payment.buyerName,
      issueDate: new Date().toISOString().split('T')[0],
      status: 'active',
      verified: true,
      verifiedStamp: true,
      verificationCode: `VRF-RCP-${Date.now().toString().slice(-6)}`,
      tamperProofHash: `SHA256-${Date.now().toString(16).toUpperCase()}`,
      version: '1.0',
      fileUrl: 'stamped_payment_receipt.pdf',
      fileSize: '210 KB'
    };
    setDocuments(prev => [receiptDoc, ...prev]);

    // Centralized Multi-Channel Dispatch (Guaranteed after payment confirmation)
    const dispatchRes = await notificationService.dispatchWorkflowNotification(
      'payment_received',
      {
        customerName: payment.buyerName || currentUser.name,
        customerPhone: currentUser.phone || '+92 300 8472910',
        customerEmail: currentUser.email || 'customer@manziliq.pk',
        plotNumber: updatedInstallment.plotNumber || 'Plot',
        societyName: updatedInstallment.societyName || 'Housing Society',
        amountPKR: payment.amountPKR,
        receiptNumber: payment.receiptNumber || `RCP-${Date.now().toString().slice(-6)}`,
        paymentMethod: payment.method,
        installmentNumber: updatedInstallment.installmentNumber
      },
      {
        userId: (updatedInstallment as any).buyerId || currentUser.id,
        role: 'buyer',
        name: payment.buyerName || currentUser.name,
        phone: currentUser.phone || '+92 300 8472910',
        email: currentUser.email || 'customer@manziliq.pk'
      },
      {
        eventKey: `payment:${payment.id}:confirmed`
      }
    );

    if (dispatchRes.notification) {
      setSelectedNotificationItem(dispatchRes.notification);
      setNotificationModalOpen(true);
    }

    addAuditLog({
      action: 'INSTALLMENT_PAYMENT_CLEARED',
      category: 'TRANSACTION',
      target: `Installment #${updatedInstallment.installmentNumber} (${updatedInstallment.plotNumber})`,
      entityType: 'PAYMENT',
      entityId: payment.id,
      details: `Payment of PKR ${payment.amountPKR.toLocaleString('en-PK')} cleared via ${payment.method}. Txn: ${payment.transactionRef}. Receipt: ${payment.receiptNumber}.`
    });

    setPaymentModalOpen(false);
    setActiveInstallment(null);
    triggerToast(`Payment of PKR ${payment.amountPKR.toLocaleString('en-PK')} cleared & verified!`);
  };

  // Advance Booking Stage with Legal Document Auto-Issuance & Multi-Channel Broadcast
  const handleAdvancePipeline = async (bookingId: string) => {
    const targetBooking = bookings.find(b => b.id === bookingId);
    if (!targetBooking) return;

    const nextStage = Math.min(6, (targetBooking.pipelineStage || 1) + 1) as BookingPipelineStage;

    // Stage-specific document generation:
    if (nextStage === 4) {
      const agreementDoc: DocumentItem = {
        id: `doc-agr-${Date.now()}`,
        title: `Sale & Purchase Agreement - ${targetBooking.plotNumber}`,
        type: 'booking_agreement',
        category: 'agreement',
        bookingId: targetBooking.id,
        bookingReference: targetBooking.bookingReference,
        plotNumber: targetBooking.plotNumber,
        societyName: targetBooking.societyName,
        buyerName: targetBooking.buyerName,
        issueDate: new Date().toISOString().split('T')[0],
        status: 'active',
        verified: true,
        verifiedStamp: true,
        verificationCode: `VRF-AGR-${Date.now().toString().slice(-6)}`,
        tamperProofHash: `SHA256-AGR-${Date.now().toString(16).toUpperCase()}`,
        version: '1.0',
        fileUrl: 'sale_agreement.pdf',
        fileSize: '410 KB'
      };
      setDocuments(prev => [agreementDoc, ...prev]);
    } else if (nextStage === 5) {
      const allotmentDoc: DocumentItem = {
        id: `doc-alt-${Date.now()}`,
        title: `Official Allotment Letter - ${targetBooking.plotNumber}`,
        type: 'allotment_letter',
        category: 'allotment',
        bookingId: targetBooking.id,
        bookingReference: targetBooking.bookingReference,
        plotNumber: targetBooking.plotNumber,
        societyName: targetBooking.societyName,
        buyerName: targetBooking.buyerName,
        issueDate: new Date().toISOString().split('T')[0],
        status: 'active',
        verified: true,
        verifiedStamp: true,
        verificationCode: `VRF-ALT-${Date.now().toString().slice(-6)}`,
        tamperProofHash: `SHA256-ALT-${Date.now().toString(16).toUpperCase()}`,
        version: '1.0',
        fileUrl: 'allotment_letter.pdf',
        fileSize: '380 KB'
      };
      setDocuments(prev => [allotmentDoc, ...prev]);
    } else if (nextStage === 6) {
      const transferDoc: DocumentItem = {
        id: `doc-trf-${Date.now()}`,
        title: `Deed of Absolute Transfer - ${targetBooking.plotNumber}`,
        type: 'transfer_deed',
        category: 'title_deed',
        bookingId: targetBooking.id,
        bookingReference: targetBooking.bookingReference,
        plotNumber: targetBooking.plotNumber,
        societyName: targetBooking.societyName,
        buyerName: targetBooking.buyerName,
        issueDate: new Date().toISOString().split('T')[0],
        status: 'active',
        verified: true,
        verifiedStamp: true,
        verificationCode: `VRF-TRF-${Date.now().toString().slice(-6)}`,
        tamperProofHash: `SHA256-TRF-${Date.now().toString(16).toUpperCase()}`,
        version: '1.0',
        fileUrl: 'transfer_deed.pdf',
        fileSize: '520 KB'
      };
      setDocuments(prev => [transferDoc, ...prev]);
      setPlots(prev => prev.map(p => (p.id === targetBooking.plotId || p.plotNumber === targetBooking.plotNumber) ? { ...p, status: 'sold' } : p));
    }

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        const updatedTimeline = b.timeline.map(s => {
          if (s.stage <= nextStage) return { ...s, completed: true, timestamp: s.timestamp || 'Approved' };
          return s;
        });
        return {
          ...b,
          pipelineStage: nextStage,
          timeline: updatedTimeline,
          status: nextStage === 6 ? 'completed' : 'approved'
        };
      }
      return b;
    }));

    const stageNames: Record<number, string> = {
      1: 'Token Advance Submitted',
      2: 'Society Admin Review',
      3: 'Escrow Down Payment Verified',
      4: 'Sale Agreement Executed',
      5: 'Official Allotment Letter Issued',
      6: 'Deed of Absolute Title Transfer Registered'
    };

    // Centralized Multi-Channel Dispatch for Stage Transition
    await notificationService.dispatchWorkflowNotification(
      'deal_stage_transition',
      {
        customerName: targetBooking.buyerName,
        customerPhone: targetBooking.buyerPhone,
        customerEmail: targetBooking.buyerEmail,
        plotNumber: targetBooking.plotNumber,
        societyName: targetBooking.societyName,
        bookingReference: targetBooking.bookingReference,
        stageName: stageNames[nextStage] || `Stage ${nextStage}`
      },
      {
        userId: targetBooking.buyerId || 'u-buyer-1',
        role: 'buyer',
        name: targetBooking.buyerName,
        phone: targetBooking.buyerPhone,
        email: targetBooking.buyerEmail
      },
      {
        eventKey: `deal_stage:${bookingId}:${nextStage}`
      }
    );

    triggerToast(`Booking ${targetBooking.plotNumber} advanced to Stage ${nextStage}!`);
  };

  // Revert Booking Stage (Society Admin or Dealer action)
  const handleMoveBackPipeline = (bookingId: string) => {
    setBookings(bookings.map(b => {
      if (b.id === bookingId) {
        const prevStage = Math.max(1, (b.pipelineStage || 1) - 1) as BookingPipelineStage;
        const updatedTimeline = b.timeline.map(s => {
          if (s.stage > prevStage) return { ...s, completed: false, timestamp: undefined };
          return s;
        });
        return {
          ...b,
          pipelineStage: prevStage,
          timeline: updatedTimeline,
          status: prevStage === 1 ? 'pending' : 'in_review'
        };
      }
      return b;
    }));
    triggerToast(`Booking stage reverted.`);
  };

  // Cancel Booking with 10% Statutory Deduction and Auto-Lock Release
  const handleCancelBooking = (bookingId: string, reason: string, penaltyPKR: number) => {
    const targetBooking = bookings.find(b => b.id === bookingId);
    if (!targetBooking) return;

    // 1. Mark booking cancelled
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'cancelled',
          cancellationReason: reason,
          cancellationPenaltyPKR: penaltyPKR
        };
      }
      return b;
    }));

    // 2. Release auto-lock on plot
    setPlots(prev => prev.map(p => {
      if (p.id === targetBooking.plotId || p.plotNumber === targetBooking.plotNumber) {
        return {
          ...p,
          status: 'available',
          isLocked: false,
          lockedAt: undefined,
          lockedByUserId: undefined
        };
      }
      return p;
    }));

    // 3. Issue Cancellation Notice document in Document Locker
    const cancelDoc: DocumentItem = {
      id: `doc-cnl-${Date.now()}`,
      title: `Plot Allotment Cancellation Notice - ${targetBooking.plotNumber}`,
      type: 'cancellation_letter',
      category: 'cancellation',
      bookingId: targetBooking.id,
      bookingReference: targetBooking.bookingReference,
      plotNumber: targetBooking.plotNumber,
      societyName: targetBooking.societyName,
      buyerName: targetBooking.buyerName,
      issueDate: new Date().toISOString().split('T')[0],
      status: 'active',
      verified: true,
      verifiedStamp: true,
      verificationCode: `VRF-CNL-${Date.now().toString().slice(-6)}`,
      tamperProofHash: `SHA256-CNL-${Date.now().toString(16).toUpperCase()}`,
      version: '1.0',
      fileUrl: 'cancellation_notice.pdf',
      fileSize: '290 KB'
    };
    setDocuments(prev => [cancelDoc, ...prev]);

    triggerToast(`Booking cancelled. Plot ${targetBooking.plotNumber} auto-lock released. 10% penalty applied.`);
  };

  // Assign Dealer with One-Plot-One-Dealer Enforcement
  const handleAssignDealer = (plotId: string, dealerId: string, dealerName: string) => {
    setPlots(plots.map(p => {
      if (p.id === plotId) {
        return {
          ...p,
          dealerId,
          dealerName,
          status: 'assigned'
        };
      }
      return p;
    }));
    triggerToast(`Plot exclusively assigned to ${dealerName} under One-Plot-One-Dealer rule.`);
  };

  // Create & Assign Lot with Single-Broker Rule and Immutable Audit Trail
  const handleCreateLotAssignment = (lot: LotAssignment, affectedPlots: Plot[]) => {
    setLotAssignments(prev => [lot, ...prev]);

    // Update plots to bind to dealer and status 'assigned'
    setPlots(prev => prev.map(p => {
      if (lot.plotIds.includes(p.id)) {
        return {
          ...p,
          dealerId: lot.dealerId,
          dealerName: lot.dealerName,
          status: 'assigned'
        };
      }
      return p;
    }));

    // Create Audit Trail records for each assigned plot
    const now = new Date();
    const formattedTimestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;
    const newTrailEntries: LotAuditTrailEntry[] = affectedPlots.map((p, idx) => ({
      id: `trail-${Date.now()}-${idx}`,
      lotId: lot.id,
      lotNumber: lot.lotNumber,
      plotId: p.id,
      plotNumber: p.plotNumber,
      societyId: lot.societyId,
      block: lot.block || p.block || 'Executive Block',
      dealerId: lot.dealerId,
      dealerName: lot.dealerName,
      action: 'ASSIGNED',
      previousStatus: p.status || 'available',
      newStatus: 'assigned',
      assignedBy: lot.assignedBy,
      timestamp: formattedTimestamp,
      notes: `Allocated under Lot #${lot.lotNumber} (${lot.commissionPercent}% Commission, Exp: ${lot.expiryDate})`
    }));

    setLotAuditTrail(prev => [...newTrailEntries, ...prev]);

    addAuditLog({
      action: 'LOT_ALLOCATION_CREATED',
      category: 'SECURITY',
      target: `Lot ${lot.lotNumber} (${lot.societyName})`,
      entityType: 'LOT_ASSIGNMENT',
      entityId: lot.id,
      details: `Exclusive allocation of ${affectedPlots.length} plots to ${lot.dealerName}. Expiry: ${lot.expiryDate}. Single-broker binding enforced.`
    });

    triggerToast(`Lot ${lot.lotNumber} (${affectedPlots.length} plots) assigned to ${lot.dealerName}!`);
  };

  // Revoke / Release Lot Assignment
  const handleRevokeLotAssignment = (lotId: string) => {
    const targetLot = lotAssignments.find(l => l.id === lotId);
    if (!targetLot) return;

    setLotAssignments(prev => prev.map(l => l.id === lotId ? { ...l, status: 'revoked' } : l));

    // Release plots back to available status and remove dealer binding
    setPlots(prev => prev.map(p => {
      if (targetLot.plotIds.includes(p.id) && p.status === 'assigned') {
        return {
          ...p,
          dealerId: undefined,
          dealerName: undefined,
          status: 'available'
        };
      }
      return p;
    }));

    // Record audit trail entries
    const now = new Date();
    const formattedTimestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;
    const newTrailEntries: LotAuditTrailEntry[] = targetLot.plotNumbers.map((num, idx) => ({
      id: `trail-revoke-${Date.now()}-${idx}`,
      lotId: targetLot.id,
      lotNumber: targetLot.lotNumber,
      plotId: targetLot.plotIds[idx] || `plot-${idx}`,
      plotNumber: num,
      societyId: targetLot.societyId,
      block: targetLot.block,
      dealerId: targetLot.dealerId,
      dealerName: targetLot.dealerName,
      action: 'RELEASED',
      previousStatus: 'assigned',
      newStatus: 'available',
      assignedBy: currentUser.name,
      timestamp: formattedTimestamp,
      notes: `Lot revoked by society management. Plot released back to open inventory.`
    }));

    setLotAuditTrail(prev => [...newTrailEntries, ...prev]);

    addAuditLog({
      action: 'LOT_ALLOCATION_REVOKED',
      category: 'SECURITY',
      target: `Lot ${targetLot.lotNumber} (${targetLot.societyName})`,
      entityType: 'LOT_ASSIGNMENT',
      entityId: lotId,
      details: `Revoked exclusive lot allocation from ${targetLot.dealerName}. Plots returned to society pool.`
    });

    triggerToast(`Lot ${targetLot.lotNumber} revoked. Plots released back to available status.`);
  };

  // Review Dealer Join Request
  const handleReviewDealerRelation = (
    relationId: string, 
    status: 'approved' | 'rejected', 
    commissionPercent?: number, 
    reason?: string
  ) => {
    setDealerRelations(prev => prev.map(r => {
      if (r.id === relationId) {
        return {
          ...r,
          status,
          commissionPercent: commissionPercent ?? r.commissionPercent,
          rejectionReason: reason,
          approvedAt: status === 'approved' ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return r;
    }));

    addAuditLog({
      action: status === 'approved' ? 'DEALER_PARTNERSHIP_APPROVED' : 'DEALER_PARTNERSHIP_REJECTED',
      category: 'IDENTITY',
      target: `Dealer Relation #${relationId}`,
      entityType: 'DEALER_RELATION',
      entityId: relationId,
      details: `Society admin ${status} dealer authorization. Commission: ${commissionPercent || 2.0}%.`
    });

    triggerToast(`Dealer registration request has been ${status}.`);
  };

  // Review Dealer Lot Request (Expansion or Release)
  const handleReviewLotRequest = (requestId: string, status: 'approved' | 'rejected', note?: string) => {
    setDealerLotRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status,
          reviewNote: note,
          reviewedAt: new Date().toLocaleString()
        };
      }
      return r;
    }));

    addAuditLog({
      action: `DEALER_LOT_REQUEST_${status.toUpperCase()}`,
      category: 'TRANSACTION',
      target: `Lot Request #${requestId}`,
      entityType: 'LOT_REQUEST',
      entityId: requestId,
      details: `Society admin ${status} dealer request #${requestId}. Note: ${note || 'None'}`
    });

    triggerToast(`Dealer lot request #${requestId} ${status}.`);
  };

  // Submit Dealer Lot Request (From Dealer portal)
  const handleSubmitLotRequest = (request: Partial<DealerLotRequest>) => {
    const fullRequest: DealerLotRequest = {
      id: request.id || `req-lot-${Date.now()}`,
      dealerId: request.dealerId || currentUser.id,
      dealerName: request.dealerName || currentUser.name,
      societyId: request.societyId || 'soc-1',
      societyName: request.societyName || 'Al-Rehman Garden',
      type: request.type || 'additional_lot',
      requestedBlock: request.requestedBlock || 'Executive Block',
      plotCount: request.plotCount || 2,
      plotIds: request.plotIds,
      plotNumbers: request.plotNumbers,
      message: request.message || '',
      status: 'pending',
      submittedAt: request.submittedAt || new Date().toLocaleString()
    };

    setDealerLotRequests(prev => [fullRequest, ...prev]);

    addAuditLog({
      action: 'DEALER_LOT_REQUEST_SUBMITTED',
      category: 'TRANSACTION',
      target: `${fullRequest.societyName} (${fullRequest.type})`,
      entityType: 'LOT_REQUEST',
      entityId: fullRequest.id,
      details: `Dealer ${fullRequest.dealerName} submitted ${fullRequest.type} for ${fullRequest.plotCount} plots in ${fullRequest.requestedBlock}.`
    });

    triggerToast('Lot request submitted to Society Management!');
  };

  // Toggle Plot Dispute Freeze (Super Admin action)
  const handleToggleDispute = (plotId: string, isDisputed: boolean, disputeReason?: string) => {
    const targetPlot = plots.find(p => p.id === plotId);
    setPlots(plots.map(p => {
      if (p.id === plotId) {
        return {
          ...p,
          isDisputed,
          disputeReason: isDisputed ? (disputeReason || 'Title dispute under active tribunal review') : undefined
        };
      }
      return p;
    }));

    addAuditLog({
      action: isDisputed ? 'TITLE_DISPUTE_FREEZE' : 'TITLE_DISPUTE_UNFREEZE',
      category: 'DISPUTE',
      target: `Plot ${targetPlot?.plotNumber || plotId} (${targetPlot?.societyName || 'Society'})`,
      entityType: 'PLOT',
      entityId: plotId,
      details: isDisputed
        ? `Plot locked under administrative dispute freeze. Reason: ${disputeReason || 'Title dispute under active tribunal review'}`
        : `Plot dispute resolved and transaction locks released.`
    });

    triggerToast(isDisputed ? 'Plot frozen under title dispute.' : 'Plot released from dispute freeze.');
  };

  // Toggle Duplicate Flag (Super Admin action)
  const handleToggleDuplicateFlag = (propertyId: string) => {
    const targetProp = properties.find(p => p.id === propertyId);
    const willBeFlagged = !targetProp?.isDuplicateFlagged;
    setProperties(properties.map(p => {
      if (p.id === propertyId) {
        return { ...p, isDuplicateFlagged: !p.isDuplicateFlagged };
      }
      return p;
    }));

    addAuditLog({
      action: willBeFlagged ? 'DUPLICATE_LISTING_FLAG' : 'DUPLICATE_FLAG_REMOVED',
      category: 'MODERATION',
      target: targetProp?.title || propertyId,
      entityType: 'PROPERTY',
      entityId: propertyId,
      details: willBeFlagged
        ? 'Flagged for duplicate inventory detection & coordinate clustering.'
        : 'Duplicate flag manually cleared by administrator.'
    });

    triggerToast('Listing duplicate flag toggled.');
  };

  // Super Admin Approve Verification Request (Updates both requests and user verified status)
  const handleApproveVerification = (reqId: string, userId: string) => {
    const targetReq = verificationRequests.find(r => r.id === reqId);
    setVerificationRequests(prev => prev.map(req => {
      if (req.id === reqId) {
        return { ...req, status: 'approved' };
      }
      return req;
    }));

    setUsers(prev => prev.map(u => {
      if (u.id === userId || u.email === targetReq?.email) {
        return { ...u, verified: true, status: 'active' };
      }
      return u;
    }));

    // If current user is the approved user, update current user too
    if (currentUser.id === userId || currentUser.email === targetReq?.email) {
      setCurrentUser(prev => ({ ...prev, verified: true, status: 'active' }));
    }

    addAuditLog({
      action: 'ROLE_PRIVILEGE_ELEVATION',
      category: 'IDENTITY',
      target: targetReq?.userName || userId,
      entityType: 'USER',
      entityId: userId,
      details: `Approved verification request #${reqId} for ${targetReq?.role?.toUpperCase() || 'USER'}. Account activated with verified credentials.`
    });

    triggerToast('Applicant verified and credentials approved successfully!');
  };

  // Super Admin Reject Verification Request
  const handleRejectVerification = (reqId: string, userId: string, reason: string) => {
    const targetReq = verificationRequests.find(r => r.id === reqId);
    setVerificationRequests(prev => prev.map(req => {
      if (req.id === reqId) {
        return { ...req, status: 'rejected', rejectionReason: reason };
      }
      return req;
    }));

    setUsers(prev => prev.map(u => {
      if (u.id === userId || u.email === targetReq?.email) {
        return { ...u, status: 'rejected' };
      }
      return u;
    }));

    addAuditLog({
      action: 'VERIFICATION_REJECTED',
      category: 'IDENTITY',
      target: targetReq?.userName || userId,
      entityType: 'USER',
      entityId: userId,
      details: `Rejected verification request #${reqId}. Stated reason: ${reason}`
    });

    triggerToast('Verification rejected and notice logged.');
  };

  // Super Admin Update User Status (Suspend or Activate)
  const handleUpdateUserStatus = (userId: string, newStatus: UserStatus, reason?: string) => {
    const targetUser = users.find(u => u.id === userId);
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, status: newStatus };
      }
      return u;
    }));

    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, status: newStatus }));
    }

    addAuditLog({
      action: newStatus === 'suspended' ? 'USER_SUSPENDED' : 'USER_ACTIVATED',
      category: 'SECURITY',
      target: `${targetUser?.name || 'User'} (${userId})`,
      entityType: 'USER',
      entityId: userId,
      details: reason || `Account status changed to ${newStatus.toUpperCase()} by Super Admin.`
    });
  };

  // Super Admin Update User Role
  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    const targetUser = users.find(u => u.id === userId);
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    }));

    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, role: newRole }));
    }

    addAuditLog({
      action: 'ROLE_PRIVILEGE_ELEVATION',
      category: 'IDENTITY',
      target: `${targetUser?.name || 'User'} (${userId})`,
      entityType: 'USER',
      entityId: userId,
      details: `Role reassigned from ${(targetUser?.role || 'UNKNOWN').toUpperCase()} to ${newRole.toUpperCase()} by Super Admin.`
    });
  };

  const handleUpdateUser = (updated: Partial<User>) => {
    const updatedUser = { ...currentUser, ...updated };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    triggerToast('Profile information successfully saved!');
  };

  // Property Creation & Synchronization Handler
  const handleOpenAddProperty = (prop?: Property) => {
    setEditingProperty(prop || null);
    setAddPropertyModalOpen(true);
  };

  const handleSaveProperty = (propData: Property, plotData?: Partial<Plot>) => {
    if (editingProperty) {
      setProperties(prev => prev.map(p => p.id === propData.id ? propData : p));
      if (plotData && propData.plotNumber) {
        setPlots(prev => prev.map(pl => pl.plotNumber === propData.plotNumber ? { ...pl, ...plotData } : pl));
      }
      triggerToast(`Property "${propData.title}" updated successfully!`);
    } else {
      const newPropId = propData.id || `prop-${Date.now()}`;
      const newProp: Property = {
        ...propData,
        id: newPropId,
        propertyId: propData.propertyId || newPropId,
        categoryPrefix: propData.categoryPrefix,
        dealerId: propData.dealerId || (currentUser.role === 'dealer' ? currentUser.id : undefined),
        dealerName: propData.dealerName || (currentUser.role === 'dealer' ? currentUser.name : undefined),
        createdAt: 'Just now',
        status: 'approved'
      };
      setProperties(prev => [newProp, ...prev]);

      // Synchronize plot inside society masterplan
      const targetSoc = societies.find(s => s.id === newProp.societyId) || societies[0];
      const newPlot: Plot = {
        id: `plot-${Date.now()}`,
        propertyId: newProp.propertyId,
        plotCode: newProp.propertyId,
        societyId: targetSoc.id,
        societyName: targetSoc.name,
        plotNumber: newProp.plotNumber || `${Math.floor(100 + Math.random() * 900)}`,
        sector: newProp.block || 'Sector A',
        block: newProp.block || 'Block A',
        sizeMarla: newProp.sizeMarla || 5,
        sizeSqFt: (newProp.sizeMarla || 5) * 225,
        pricePKR: newProp.pricePKR || 2500000,
        downPaymentPKR: newProp.paymentPlan?.downPaymentPKR || (newProp.pricePKR * 0.2),
        monthlyInstallmentPKR: newProp.paymentPlan?.monthlyAmountPKR || Math.round((newProp.pricePKR * 0.8) / 36),
        installmentMonths: newProp.paymentPlan?.installmentMonths || 36,
        status: 'available',
        category: newProp.type === 'commercial' ? 'commercial' : 'residential',
        dimensions: (plotData && plotData.dimensions) || '25x45',
        features: (plotData && plotData.features) || ['Direct Road Access', 'Underground Utilities', 'Sui Gas Verified'],
        coordinates: { x: Math.floor(10 + Math.random() * 80), y: Math.floor(10 + Math.random() * 80) },
        dealerId: newProp.dealerId,
        dealerName: newProp.dealerName,
        isLocked: false,
        isDisputed: false,
        ...(plotData || {})
      };
      setPlots(prev => [newPlot, ...prev]);
      triggerToast(`🎉 Property "${newProp.title}" published & synced to Masterplan!`);
    }
    setAddPropertyModalOpen(false);
    setEditingProperty(null);
  };

  // Helper to determine if current route is a Dashboard module
  const isSocietyDashboard = currentRoute.startsWith('/society/') && (
    currentRoute === '/society/overview' ||
    currentRoute === '/society/inventory' ||
    currentRoute === '/society/dealers' ||
    currentRoute === '/society/bookings' ||
    currentRoute === '/society/financials' ||
    currentRoute === '/society/documents' ||
    currentRoute === '/society/disputes'
  );

  const isDashboardRoute = currentRoute.startsWith('/buyer/') || 
                           currentRoute.startsWith('/dealer/') || 
                           isSocietyDashboard || 
                           currentRoute.startsWith('/admin/') ||
                           currentRoute === '/properties/add' ||
                           currentRoute.startsWith('/properties/edit/') ||
                           currentRoute === '/profile' ||
                           currentRoute === '/settings';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-amber-500 selection:text-slate-950">
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl font-bold text-xs shadow-2xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Primary Clean App Navbar */}
      <AppNavbar
        currentRoute={currentRoute}
        currentUser={currentUser}
        wishlistCount={wishlist.length}
        unreadNotificationsCount={notifications.filter(n => !n.read).length}
        comparisonCount={compareList.length}
        notificationList={notifications}
        onNavigate={handleNavigate}
        onRoleSwitch={handleRoleSwitch}
        onOpenAddProperty={() => handleOpenAddProperty()}
        onOpenSupabase={() => setSupabaseModalOpen(true)}
        onToggleMobileMenu={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        onOpenNotificationModal={(n) => {
          setSelectedNotificationItem(n);
          setNotificationModalOpen(true);
        }}
        onMarkNotificationRead={(id) => {
          notificationService.markAsRead(id);
          setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true, is_read: true } : n));
        }}
      />

      {/* Router Routing View Container */}
      <div className="flex-1 flex flex-col">
        
        {isDashboardRoute ? (
          /* Dashboard Layout with Persistent Collapsible Sidebar & Breadcrumbs */
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
            <DashboardSidebar
              currentRoute={currentRoute}
              currentUser={currentUser}
              onNavigate={handleNavigate}
              onRoleSwitch={handleRoleSwitch}
              onOpenAddProperty={() => handleOpenAddProperty()}
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
              isMobileOpen={mobileSidebarOpen}
              onCloseMobile={() => setMobileSidebarOpen(false)}
              onLogout={() => {
                handleRoleSwitch('public_buyer');
                triggerToast('Logged out to Public Guest mode.');
              }}
            />

            <main className="flex-1 min-w-0 space-y-6">
              <Breadcrumbs currentRoute={currentRoute} onNavigate={handleNavigate} />

              {/* Shared Role-Aware Profile & Settings Page */}
              {(currentRoute === '/profile' || currentRoute === '/settings') && (
                <ProfileSettingsView
                  currentUser={currentUser}
                  onUpdateUser={handleUpdateUser}
                  onShowToast={triggerToast}
                />
              )}

              {/* Buyer Routes */}
              {currentRoute === '/buyer/overview' && (
                <BuyerOverviewView
                  currentUser={currentUser}
                  bookings={bookings.filter(b => b.buyerId === currentUser.id)}
                  installments={installments}
                  notifications={notifications}
                  wishlistProperties={wishlist}
                  onNavigate={handleNavigate}
                  onOpenPayment={handleOpenPayment}
                  onOpenNotificationDetail={(n) => {
                    setSelectedNotificationItem(n);
                    setNotificationModalOpen(true);
                  }}
                />
              )}

              {currentRoute === '/buyer/bookings' && (
                <BuyerBookingsView
                  currentUser={currentUser}
                  bookings={bookings.filter(b => b.buyerId === currentUser.id)}
                  onNavigate={handleNavigate}
                />
              )}

              {currentRoute === '/buyer/installments' && (
                <BuyerInstallmentsView
                  currentUser={currentUser}
                  installments={installments}
                  onOpenPayment={handleOpenPayment}
                />
              )}

              {currentRoute === '/buyer/wishlist' && (
                <BuyerWishlistView
                  properties={wishlist}
                  savedComparisons={savedComparisons}
                  onRemoveFromWishlist={(id) => setWishlist(wishlist.filter(w => w.id !== id))}
                  onDeleteSavedComparison={handleDeleteSavedComparison}
                  onLoadSavedComparison={handleLoadSavedComparison}
                  onOpenBooking={(p) => handleInitiateBooking({
                    id: p.id,
                    title: p.title,
                    societyName: p.societyName,
                    sector: 'Executive Block',
                    pricePKR: p.pricePKR,
                    sizeMarla: p.sizeMarla
                  })}
                  onSelectProperty={(id) => handleNavigate(`/property/${id}`)}
                  onNavigate={handleNavigate}
                />
              )}

              {currentRoute === '/buyer/documents' && (
                <DocumentLockerGrid
                  currentUser={currentUser}
                  documents={documents}
                  onUploadDocument={(doc) => setDocuments([doc, ...documents])}
                  onDeleteDocument={(id) => setDocuments(documents.filter(d => d.id !== id))}
                  roleAccent="amber"
                />
              )}

              {currentRoute === '/buyer/inquiries' && (
                <BuyerInquiriesView
                  currentUser={currentUser}
                  onNavigate={handleNavigate}
                />
              )}

              {(currentRoute === '/buyer/notifications' || currentRoute === '/dealer/notifications' || currentRoute === '/society/notifications' || currentRoute === '/admin/notifications' || currentRoute === '/notifications') && (
                <NotificationCenterView
                  notifications={notifications}
                  currentUserRole={currentUser.role}
                  currentUserId={currentUser.id}
                  onOpenDetailModal={(notif) => {
                    setSelectedNotificationItem(notif);
                    setNotificationModalOpen(true);
                  }}
                  onNavigateToEntity={handleNavigate}
                  onRefreshNotifications={() => {
                    notificationService.fetchNotifications().then(setNotifications);
                  }}
                  installments={installments}
                  dealerLots={lotAssignments}
                />
              )}

              {/* Dealer Routes */}
              {currentRoute === '/dealer/overview' && (
                <DealerOverviewView
                  currentUser={currentUser}
                  plots={plots}
                  properties={properties}
                  bookings={bookings}
                  onNavigate={handleNavigate}
                  onOpenAddProperty={() => handleOpenAddProperty()}
                />
              )}

              {currentRoute === '/dealer/assigned-lots' && (
                <DealerAssignedLotsView
                  currentUser={currentUser}
                  plots={plots}
                  societies={societies}
                  lotAssignments={lotAssignments}
                  dealerLotRequests={dealerLotRequests}
                  onUpdatePlotStatus={(plotId, newStatus) => {
                    setPlots(plots.map(p => p.id === plotId ? { ...p, status: newStatus } : p));
                    triggerToast(`Plot status updated to ${newStatus.toUpperCase()}`);
                  }}
                  onSubmitLotRequest={handleSubmitLotRequest}
                />
              )}

              {(currentRoute === '/dealer/crm' || currentRoute === '/dealer/pipeline') && (
                <DealerLeadsCrmView
                  bookings={bookings}
                  currentUser={currentUser}
                  onAdvancePipeline={handleAdvancePipeline}
                  onMoveBackPipeline={handleMoveBackPipeline}
                  onCancelBooking={handleCancelBooking}
                />
              )}

              {currentRoute === '/dealer/commission' && (
                <DealerCommissionView />
              )}

              {currentRoute === '/dealer/documents' && (
                <DocumentLockerGrid
                  currentUser={currentUser}
                  documents={documents}
                  onUploadDocument={(doc) => setDocuments([doc, ...documents])}
                  onDeleteDocument={(id) => setDocuments(documents.filter(d => d.id !== id))}
                  roleAccent="teal"
                />
              )}

              {currentRoute === '/dealer/listings' && (
                <DealerListingsManagerView
                  currentUser={currentUser}
                  properties={properties}
                  societies={societies}
                  onAddProperty={(newProp) => {
                    setProperties([newProp, ...properties]);
                    triggerToast(`Property "${newProp.title}" published!`);
                  }}
                  onDeleteProperty={(id) => {
                    setProperties(properties.filter(p => p.id !== id));
                    triggerToast('Listing removed.');
                  }}
                />
              )}

              {/* Society Admin Routes */}
              {currentRoute === '/society/overview' && (
                <SocietyOverviewView
                  currentUser={currentUser}
                  society={societies[0]}
                  plots={plots}
                  bookings={bookings}
                  lotAssignments={lotAssignments}
                  dealerRelations={dealerRelations}
                  onNavigate={handleNavigate}
                  onOpenAddProperty={() => handleOpenAddProperty()}
                />
              )}

              {currentRoute === '/society/inventory' && (
                <SocietyPlotInventoryView
                  currentUser={currentUser}
                  society={societies[0]}
                  plots={plots}
                  onAddPlot={(newPlot) => {
                    setPlots([newPlot, ...plots]);
                    triggerToast(`Plot ${newPlot.plotNumber} added to masterplan inventory!`);
                  }}
                  onUpdatePlotStatus={(plotId, newStatus) => {
                    setPlots(plots.map(p => p.id === plotId ? { ...p, status: newStatus } : p));
                    triggerToast(`Plot status updated.`);
                  }}
                />
              )}

              {currentRoute === '/society/dealers' && (
                <SocietyDealerAssignmentView
                  society={societies[0]}
                  plots={plots}
                  dealerRelations={dealerRelations}
                  lotAssignments={lotAssignments}
                  dealerLotRequests={dealerLotRequests}
                  lotAuditTrail={lotAuditTrail}
                  onAssignDealer={handleAssignDealer}
                  onCreateLotAssignment={handleCreateLotAssignment}
                  onRevokeLotAssignment={handleRevokeLotAssignment}
                  onReviewDealerRelation={handleReviewDealerRelation}
                  onReviewLotRequest={handleReviewLotRequest}
                />
              )}

              {currentRoute === '/society/approvals' && (
                <SocietyBookingApprovalsView
                  society={societies[0]}
                  bookings={bookings}
                  onAdvancePipeline={handleAdvancePipeline}
                  onCancelBooking={handleCancelBooking}
                />
              )}

              {currentRoute === '/society/financials' && (
                <SocietyFinancialsView
                  society={societies[0]}
                  installments={installments}
                  bookings={bookings}
                />
              )}

              {currentRoute === '/society/documents' && (
                <DocumentLockerGrid
                  currentUser={currentUser}
                  documents={documents}
                  onUploadDocument={(doc) => setDocuments([doc, ...documents])}
                  onDeleteDocument={(id) => setDocuments(documents.filter(d => d.id !== id))}
                  roleAccent="emerald"
                />
              )}

              {/* Super Admin Routes */}
              {currentRoute === '/admin/overview' && (
                <SuperAdminOverviewView
                  currentUser={currentUser}
                  societies={societies}
                  properties={properties}
                  bookings={bookings}
                  plots={plots}
                  onNavigate={handleNavigate}
                  onOpenAddProperty={() => handleOpenAddProperty()}
                />
              )}

              {currentRoute === '/admin/verification-queue' && (
                <AdminVerificationQueueView
                  verificationRequests={verificationRequests}
                  users={users}
                  onApproveVerification={handleApproveVerification}
                  onRejectVerification={handleRejectVerification}
                />
              )}

              {(currentRoute === '/admin/users' || currentRoute === '/admin/dealers') && (
                <AdminUsersManagementView
                  users={users}
                  currentUser={currentUser}
                  onUpdateUserStatus={handleUpdateUserStatus}
                  onUpdateUserRole={handleUpdateUserRole}
                  onNavigate={handleNavigate}
                  initialRoleFilter={currentRoute === '/admin/dealers' ? 'dealer' : 'all'}
                />
              )}

              {currentRoute === '/admin/moderation' && (
                <AdminContentModerationView
                  properties={properties}
                  onToggleDuplicateFlag={handleToggleDuplicateFlag}
                  onDeleteProperty={(id) => {
                    setProperties(properties.filter(p => p.id !== id));
                    triggerToast('Listing delisted permanently.');
                  }}
                  onNavigate={handleNavigate}
                  onOpenAddProperty={() => handleOpenAddProperty()}
                />
              )}

              {currentRoute === '/admin/disputes' && (
                <AdminDisputeManagementView
                  plots={plots}
                  onToggleDispute={handleToggleDispute}
                />
              )}

              {currentRoute === '/admin/audit-logs' && (
                <AdminAuditLogsView logs={auditLogs} />
              )}

              {currentRoute === '/admin/documents' && (
                <DocumentLockerGrid
                  currentUser={currentUser}
                  documents={documents}
                  onUploadDocument={(doc) => setDocuments([doc, ...documents])}
                  onDeleteDocument={(id) => setDocuments(documents.filter(d => d.id !== id))}
                  roleAccent="indigo"
                />
              )}

              {/* Add / Edit Property View in Dashboard Layout */}
              {(currentRoute === '/properties/add' || currentRoute.startsWith('/properties/edit/')) && (
                <AddPropertyView
                  currentUser={currentUser}
                  societies={societies}
                  plots={plots}
                  existingProperty={currentRoute.startsWith('/properties/edit/') ? properties.find(p => p.id === currentRoute.replace('/properties/edit/', '')) : null}
                  onSaveProperty={handleSaveProperty}
                  onNavigate={handleNavigate}
                  onRoleSwitch={handleRoleSwitch}
                />
              )}

            </main>
          </div>
        ) : (
          /* Public & Auth Full Page Routes */
          <main className="flex-1">
            
            {/* Landing Page (No floating compare button on landing, as per user requirement) */}
            {(currentRoute === '/' || currentRoute === '/home') && (
              <LandingPageView
                societies={societies}
                plots={plots}
                properties={properties}
                currentUser={currentUser}
                wishlistIds={wishlist.map(w => w.id)}
                compareIds={compareList.map(c => c.id)}
                onToggleWishlist={handleToggleWishlist}
                onToggleCompare={handleToggleCompare}
                onSelectSociety={(socId) => handleNavigate(`/society/${socId}`)}
                onSelectProperty={(propId) => handleNavigate(`/property/${propId}`)}
                onOpenEstimator={() => handleNavigate('/price-estimator')}
                onInitiateBooking={(bookingInfo) => handleInitiateBooking({
                  id: bookingInfo.plotId || 'plot-1',
                  title: bookingInfo.title || 'Property',
                  societyName: bookingInfo.societyName || 'Al-Rehman Garden',
                  sector: 'Sector A',
                  pricePKR: bookingInfo.price || 2500000,
                  sizeMarla: 5
                })}
                onNavigate={handleNavigate}
              />
            )}

            {/* Marketplace Route */}
            {currentRoute === '/marketplace' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <Breadcrumbs currentRoute={currentRoute} onNavigate={handleNavigate} />
                <PropertyMarketplaceView
                  properties={properties}
                  plots={plots}
                  societies={societies}
                  currentUser={currentUser}
                  wishlistIds={wishlist.map(w => w.id)}
                  compareIds={compareList.map(c => c.id)}
                  onToggleWishlist={handleToggleWishlist}
                  onToggleCompare={handleToggleCompare}
                  onInitiateBooking={handleInitiateBooking}
                  onNavigate={handleNavigate}
                  onToast={triggerToast}
                />
              </div>
            )}

            {/* Property Detail Route */}
            {currentRoute.startsWith('/property/') && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <Breadcrumbs currentRoute={currentRoute} onNavigate={handleNavigate} />
                {(() => {
                  const propId = currentRoute.replace('/property/', '');
                  const prop = properties.find(p => p.id === propId) || properties[0];
                  return (
                    <PropertyDetailView
                      property={prop}
                      currentUser={currentUser}
                      isWishlisted={wishlist.some(w => w.id === prop.id)}
                      isCompared={compareList.some(c => c.id === prop.id)}
                      onToggleWishlist={() => handleToggleWishlist(prop)}
                      onToggleCompare={() => handleToggleCompare(prop)}
                      onInitiateBooking={() => handleInitiateBooking({
                        id: prop.id,
                        title: prop.title,
                        societyName: prop.societyName,
                        sector: 'Sector A',
                        pricePKR: prop.pricePKR,
                        sizeMarla: prop.sizeMarla
                      })}
                      onNavigate={handleNavigate}
                      onToast={triggerToast}
                    />
                  );
                })()}
              </div>
            )}

            {/* Societies Explorer Route */}
            {currentRoute === '/societies' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <Breadcrumbs currentRoute={currentRoute} onNavigate={handleNavigate} />
                <SocietiesExplorerView
                  societies={societies}
                  plots={plots}
                  onNavigate={handleNavigate}
                />
              </div>
            )}

            {/* Society Detail & Masterplan Route */}
            {(currentRoute.startsWith('/society/') || currentRoute.startsWith('/society-detail/')) && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <Breadcrumbs currentRoute={currentRoute} onNavigate={handleNavigate} />
                {(() => {
                  const socId = currentRoute.replace('/society-detail/', '').replace('/society/', '');
                  const society = societies.find(s => s.id === socId) || societies[0];
                  return (
                    <SocietyDetailView
                      society={society}
                      plots={plots}
                      currentUser={currentUser}
                      onInitiateBooking={handleInitiateBooking}
                      onToggleCompare={handleToggleComparePlot}
                      comparedPlotIds={compareList.map(c => c.id)}
                      onNavigate={handleNavigate}
                    />
                  );
                })()}
              </div>
            )}

            {/* Comparison Route */}
            {currentRoute === '/compare' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <Breadcrumbs currentRoute={currentRoute} onNavigate={handleNavigate} />
                <ComparisonView
                  properties={compareList}
                  compareList={compareList}
                  plots={plots}
                  savedComparisons={savedComparisons}
                  currentUser={currentUser}
                  onRemove={(id) => setCompareList(compareList.filter(c => c.id !== id))}
                  onClear={() => setCompareList([])}
                  onSaveComparison={handleSaveComparison}
                  onDeleteSavedComparison={handleDeleteSavedComparison}
                  onLoadSavedComparison={handleLoadSavedComparison}
                  onInitiateBooking={handleInitiateBooking}
                  onNavigate={handleNavigate}
                />
              </div>
            )}

            {/* AI Price Estimator Route */}
            {currentRoute === '/price-estimator' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <Breadcrumbs currentRoute={currentRoute} onNavigate={handleNavigate} />
                <StandalonePriceEstimatorView
                  societies={societies}
                  onNavigate={handleNavigate}
                />
              </div>
            )}

            {/* Auth Routes */}
            {currentRoute === '/login' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <LoginView
                  users={users}
                  lastVisitedProperty={lastVisitedProperty}
                  onLoginSuccess={(user) => {
                    setCurrentUser(user);
                    triggerToast(`Welcome back, ${user.name}!`);

                    // Check if user was attempting to visit or book a property before auth redirect
                    if (lastVisitedProperty) {
                      const destination = lastVisitedProperty.startsWith('/') ? lastVisitedProperty : `/property/${lastVisitedProperty}`;
                      setLastVisitedProperty(null);
                      handleNavigate(destination);
                      triggerToast(`Returned to your selected property.`);
                      return;
                    }

                    if (user.role === 'buyer') handleNavigate('/buyer/overview');
                    else if (user.role === 'dealer') handleNavigate('/dealer/overview');
                    else if (user.role === 'society_admin') handleNavigate('/society/overview');
                    else if (user.role === 'super_admin') handleNavigate('/admin/overview');
                    else handleNavigate('/marketplace');
                  }}
                  onNavigate={handleNavigate}
                />
              </div>
            )}

            {currentRoute === '/signup' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <SignupView
                  lastVisitedProperty={lastVisitedProperty}
                  onSignupSuccess={(newUser, verificationReq) => {
                    setUsers(prev => [newUser, ...prev]);
                    setCurrentUser(newUser);

                    // If dealer or society admin, create verification queue entry immediately
                    if (newUser.role === 'dealer' || newUser.role === 'society_admin') {
                      const reqToAdd: VerificationRequest = verificationReq || {
                        id: `ver-${Date.now()}`,
                        userId: newUser.id,
                        userName: newUser.name,
                        email: newUser.email,
                        phone: newUser.phone,
                        role: newUser.role,
                        societyName: newUser.societyName || (newUser.role === 'society_admin' ? newUser.name : undefined),
                        submittedAt: 'Just now',
                        status: 'pending',
                        cnicNumber: newUser.cnic,
                        cnicDocName: `${newUser.name.toLowerCase().replace(/\s+/g, '_')}_cnic_verification.pdf`,
                        licenseDocName: newUser.role === 'dealer' ? 'punjab_excise_realtor_license.pdf' : undefined,
                        nocDocName: newUser.role === 'society_admin' ? 'tma_approval_noc_deed.pdf' : undefined,
                        secpDocName: newUser.role === 'society_admin' ? 'secp_form_29_registration.pdf' : undefined,
                        comments: `New applicant registration submitted via portal.`
                      };
                      setVerificationRequests(prev => [reqToAdd, ...prev]);
                      triggerToast('Account submitted! Awaiting Super Admin verification approval.');
                      handleNavigate('/verify-pending');
                    } else {
                      if (lastVisitedProperty) {
                        const destination = lastVisitedProperty.startsWith('/') ? lastVisitedProperty : `/property/${lastVisitedProperty}`;
                        setLastVisitedProperty(null);
                        handleNavigate(destination);
                        triggerToast('Account registered successfully! Returned to your selected property.');
                      } else {
                        triggerToast('Account registered successfully! Welcome to MANZILIQ.');
                        handleNavigate('/buyer/overview');
                      }
                    }
                  }}
                  onNavigate={handleNavigate}
                />
              </div>
            )}

            {currentRoute === '/verify-pending' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <VerifyPendingView
                  currentUser={currentUser}
                  onNavigate={handleNavigate}
                />
              </div>
            )}

            {currentRoute === '/reset-password' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ResetPasswordView onNavigate={handleNavigate} />
              </div>
            )}

          </main>
        )}

      </div>

      {/* Floating Compare Bar on Non-Landing Pages if Compare Items Exist */}
      {currentRoute !== '/' && currentRoute !== '/home' && compareList.length > 0 && (
        <CompareBar
          compareList={compareList}
          onRemove={(id) => setCompareList(compareList.filter(p => p.id !== id))}
          onClear={() => setCompareList([])}
          onOpenModal={() => handleNavigate('/compare')}
        />
      )}

      {/* Booking Form Modal */}
      {bookingTarget && (
        <BookingModal
          item={{
            plot: bookingTarget.plot || plots.find(p => p.id === bookingTarget.id),
            property: bookingTarget.property || properties.find(p => p.id === bookingTarget.id)
          }}
          currentUser={currentUser}
          onClose={() => {
            setBookingModalOpen(false);
            setBookingTarget(null);
          }}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* Payment Processing Modal with Surcharges & Stamped PDF Receipt */}
      {activeInstallment && (
        <PaymentModal
          installment={activeInstallment}
          booking={bookings.find(b => b.id === activeInstallment.bookingId || b.plotNumber === activeInstallment.plotNumber)}
          currentUser={currentUser}
          onClose={() => {
            setPaymentModalOpen(false);
            setActiveInstallment(null);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Real-Time Push Notification Toast Alert */}
      <PushNotificationToast
        notification={activePushToast}
        onDismiss={() => setActivePushToast(null)}
        onOpenModal={(notif) => {
          setSelectedNotificationItem(notif);
          setNotificationModalOpen(true);
        }}
      />

      {/* 4-Channel Multi-Tier Notification Modal */}
      <ThreeTierNotificationModal
        isOpen={notificationModalOpen}
        notification={selectedNotificationItem}
        onClose={() => {
          setNotificationModalOpen(false);
          setSelectedNotificationItem(null);
        }}
        onNavigateToEntity={(route) => {
          setNotificationModalOpen(false);
          setSelectedNotificationItem(null);
          handleNavigate(route);
        }}
        onRetry={async (id) => {
          await notificationService.retryNotification(id);
          const updated = await notificationService.fetchNotifications();
          setNotifications(updated);
          const found = updated.find(n => n.id === id);
          if (found) setSelectedNotificationItem(found);
          triggerToast('Notification delivery retried across all configured channels.');
        }}
      />

      {/* Supabase Database Provisioning & Realtime Sync Modal */}
      <SupabaseConnectModal
        isOpen={supabaseModalOpen}
        currentUser={currentUser}
        onClose={() => setSupabaseModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          triggerToast(`Logged in via Supabase as ${user.name}!`);
        }}
      />

      {/* Global Add/Edit Property Modal for Dealers, Society Admins & Super Admins */}
      {addPropertyModalOpen && (
        <AddEditPropertyModal
          isOpen={addPropertyModalOpen}
          currentUser={currentUser}
          societies={societies}
          plots={plots}
          existingProperty={editingProperty || undefined}
          onClose={() => {
            setAddPropertyModalOpen(false);
            setEditingProperty(null);
          }}
          onSave={handleSaveProperty}
        />
      )}

      {/* Floating Gemini AI Advisor Chat Widget */}
      <AiAssistantWidget
        currentUser={currentUser}
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
      />

      {/* Platform Global Production Footer */}
      <footer className="bg-slate-950 text-slate-300 text-xs py-14 px-4 sm:px-8 mt-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Col 1: Brand & Municipal Scope */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                  M
                </div>
                <span className="text-xl font-black text-white tracking-tight">MANZILIQ</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Comprehensive Digitized Housing Society & Real Estate Marketplace for Pakistan.
              </p>
              <div className="inline-flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-[10px] text-amber-400 font-bold">
                <span>TMA & NADRA Title Compliant</span>
              </div>
            </div>

            {/* Col 2: Marketplace Discovery */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider mb-2">Discovery</h4>
              <ul className="space-y-2 text-slate-400 text-xs">
                <li><button onClick={() => handleNavigate('/marketplace')} className="hover:text-amber-400 transition cursor-pointer">Marketplace Listings</button></li>
                <li><button onClick={() => handleNavigate('/societies')} className="hover:text-amber-400 transition cursor-pointer">Housing Societies & Masterplans</button></li>
                <li><button onClick={() => handleNavigate('/price-estimator')} className="hover:text-amber-400 transition cursor-pointer">AI Price Estimation Engine</button></li>
                <li><button onClick={() => handleNavigate('/compare')} className="hover:text-amber-400 transition cursor-pointer">Side-by-Side Comparison</button></li>
              </ul>
            </div>

            {/* Col 3: District Housing Projects */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider mb-2">Verified Societies</h4>
              <ul className="space-y-2 text-slate-400 text-xs">
                <li><button onClick={() => handleNavigate('/society/soc-1')} className="hover:text-amber-400 transition cursor-pointer">Al-Rehman Garden (Zafarwal Rd)</button></li>
                <li><button onClick={() => handleNavigate('/society/soc-2')} className="hover:text-amber-400 transition cursor-pointer">Royal Orchard (Muridke Rd)</button></li>
                <li><button onClick={() => handleNavigate('/society/soc-3')} className="hover:text-amber-400 transition cursor-pointer">Model Town Greens</button></li>
                <li><button onClick={() => handleNavigate('/society/soc-4')} className="hover:text-amber-400 transition cursor-pointer">Executive Enclave Shakargarh</button></li>
              </ul>
            </div>

            {/* Col 4: Role-Based Portals */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider mb-2">Dedicated Portals</h4>
              <ul className="space-y-2 text-slate-400 text-xs">
                <li><button onClick={() => handleRoleSwitch('buyer')} className="hover:text-amber-400 transition cursor-pointer">Registered Buyer Dashboard</button></li>
                <li><button onClick={() => handleRoleSwitch('dealer')} className="hover:text-amber-400 transition cursor-pointer">Authorized Realtor CRM</button></li>
                <li><button onClick={() => handleRoleSwitch('society_admin')} className="hover:text-amber-400 transition cursor-pointer">Society Admin Management</button></li>
                <li><button onClick={() => handleRoleSwitch('super_admin')} className="hover:text-amber-400 transition cursor-pointer">Platform Super Admin</button></li>
              </ul>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-slate-500 text-[11px]">
            <div>
              © {new Date().getFullYear()} MANZILIQ Technologies Ltd. Pakistan.
            </div>
            <div className="flex items-center gap-4">
              <span>NOC & TMA Registry Verification</span>
              <span>•</span>
              <span>1Link & BOP Escrow Protected</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
