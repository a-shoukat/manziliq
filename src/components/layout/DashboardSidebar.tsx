import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { ManzilIQLogo } from '../common/ManzilIQLogo';
import { 
  LayoutDashboard, 
  Layers, 
  CreditCard, 
  Heart, 
  FolderLock, 
  Bell, 
  MessageSquare, 
  Kanban, 
  Users, 
  MapPin, 
  TrendingUp, 
  FileText, 
  ShieldCheck, 
  Sliders, 
  DollarSign, 
  UserCheck, 
  AlertTriangle, 
  BarChart3, 
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Building2,
  Lock,
  Sparkles,
  Settings,
  User as UserIcon,
  Shield,
  Plus,
  PlusCircle,
  X
} from 'lucide-react';

interface DashboardSidebarProps {
  currentRoute: string;
  currentUser: User;
  onNavigate: (route: string) => void;
  onRoleSwitch: (role: UserRole) => void;
  onLogout: () => void;
  onOpenAddProperty?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavMenuItem {
  label: string;
  route: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  currentRoute,
  currentUser,
  onNavigate,
  onRoleSwitch,
  onLogout,
  onOpenAddProperty,
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const toggleCollapse = onToggleCollapse || (() => setInternalCollapsed(prev => !prev));

  const role = currentUser.role;

  // Role accents: Admin=indigo, Society=green, Dealer=teal/blue, Customer=amber
  const roleAccentMap: Record<UserRole, {
    title: string;
    badge: string;
    pillColor: string;
    activeNav: string;
    activeIcon: string;
    hoverNav: string;
    borderAccent: string;
  }> = {
    super_admin: {
      title: 'Super Administrator',
      badge: 'Admin Control',
      pillColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      activeNav: 'bg-indigo-50 text-indigo-900 font-bold border-indigo-200 shadow-xs',
      activeIcon: 'text-indigo-600',
      hoverNav: 'hover:bg-indigo-50/50 hover:text-indigo-900',
      borderAccent: 'border-indigo-600'
    },
    society_admin: {
      title: 'Society Administration',
      badge: 'Society Suite',
      pillColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      activeNav: 'bg-emerald-50 text-emerald-900 font-bold border-emerald-200 shadow-xs',
      activeIcon: 'text-emerald-600',
      hoverNav: 'hover:bg-emerald-50/50 hover:text-emerald-900',
      borderAccent: 'border-emerald-600'
    },
    dealer: {
      title: 'Licensed Dealer',
      badge: 'Dealer CRM',
      pillColor: 'bg-teal-50 text-teal-700 border-teal-200',
      activeNav: 'bg-teal-50 text-teal-900 font-bold border-teal-200 shadow-xs',
      activeIcon: 'text-teal-600',
      hoverNav: 'hover:bg-teal-50/50 hover:text-teal-900',
      borderAccent: 'border-teal-600'
    },
    buyer: {
      title: 'Registered Customer',
      badge: 'Customer Portal',
      pillColor: 'bg-amber-50 text-amber-900 border-amber-200',
      activeNav: 'bg-amber-50 text-amber-950 font-bold border-amber-200 shadow-xs',
      activeIcon: 'text-amber-600',
      hoverNav: 'hover:bg-amber-50/50 hover:text-amber-950',
      borderAccent: 'border-amber-500'
    },
    public_buyer: {
      title: 'Guest Customer',
      badge: 'Guest Portal',
      pillColor: 'bg-slate-100 text-slate-700 border-slate-200',
      activeNav: 'bg-amber-50 text-amber-950 font-bold border-amber-200 shadow-xs',
      activeIcon: 'text-amber-600',
      hoverNav: 'hover:bg-amber-50/50 hover:text-amber-950',
      borderAccent: 'border-amber-500'
    }
  };

  const accent = roleAccentMap[role] || roleAccentMap.super_admin;

  // Define navigation items based on role
  let menuSections: { heading: string; items: NavMenuItem[] }[] = [];

  if (role === 'buyer' || role === 'public_buyer') {
    menuSections = [
      {
        heading: 'Customer Hub',
        items: [
          { label: 'Overview', route: '/buyer/overview', icon: LayoutDashboard },
          { label: 'Post Property Listing', route: '/properties/add', icon: PlusCircle, badge: 'Sell / Rent', badgeColor: 'bg-emerald-100 text-emerald-800' },
          { label: 'My Bookings', route: '/buyer/bookings', icon: Layers, badge: '6 Stages', badgeColor: 'bg-amber-100 text-amber-900' },
          { label: 'Installments & Dues', route: '/buyer/installments', icon: CreditCard, badge: '1 Overdue', badgeColor: 'bg-rose-100 text-rose-800' },
          { label: 'Saved Wishlist', route: '/buyer/wishlist', icon: Heart },
          { label: 'Document Locker', route: '/buyer/documents', icon: FolderLock, badge: 'Encrypted', badgeColor: 'bg-blue-100 text-blue-800' },
          { label: 'Inquiries & Visits', route: '/buyer/inquiries', icon: MessageSquare },
          { label: 'Notification Inbox', route: '/buyer/notifications', icon: Bell, badge: '2 New', badgeColor: 'bg-amber-100 text-amber-900' },
          { label: 'Profile & Settings', route: '/profile', icon: Settings }
        ]
      },
      {
        heading: 'Marketplace Tools',
        items: [
          { label: 'Browse Marketplace', route: '/marketplace', icon: ExternalLink },
          { label: 'Society Explorer', route: '/societies', icon: Building2 },
          { label: 'AI Price Estimator', route: '/price-estimator', icon: Sparkles }
        ]
      }
    ];
  } else if (role === 'dealer') {
    menuSections = [
      {
        heading: 'Dealer CRM',
        items: [
          { label: 'Overview', route: '/dealer/overview', icon: LayoutDashboard },
          { label: 'Add New Property', route: '/properties/add', icon: PlusCircle, badge: '+ New', badgeColor: 'bg-emerald-100 text-emerald-800' },
          { label: 'Exclusive Assigned Lots', route: '/dealer/assigned-lots', icon: MapPin, badge: 'One-Plot Rule', badgeColor: 'bg-teal-100 text-teal-800' },
          { label: '6-Stage Deal Pipeline', route: '/dealer/pipeline', icon: Kanban, badge: '6 Stages', badgeColor: 'bg-teal-100 text-teal-800' },
          { label: 'Listings Manager', route: '/dealer/listings', icon: Layers },
          { label: 'Notification Center', route: '/buyer/notifications', icon: Bell, badge: 'Live', badgeColor: 'bg-teal-100 text-teal-800' },
          { label: 'Commission & Analytics', route: '/dealer/commission', icon: TrendingUp },
          { label: 'Document Vault', route: '/dealer/documents', icon: FolderLock },
          { label: 'Profile & Settings', route: '/profile', icon: Settings }
        ]
      },
      {
        heading: 'Marketplace Tools',
        items: [
          { label: 'Property Marketplace', route: '/marketplace', icon: ExternalLink },
          { label: 'Society Masterplans', route: '/societies', icon: Building2 },
          { label: 'AI Price Estimator', route: '/price-estimator', icon: Sparkles }
        ]
      }
    ];
  } else if (role === 'society_admin') {
    menuSections = [
      {
        heading: 'Society Operations',
        items: [
          { label: 'Society Overview', route: '/society/overview', icon: LayoutDashboard },
          { label: 'Add Plot / Property', route: '/properties/add', icon: PlusCircle, badge: '+ New', badgeColor: 'bg-emerald-100 text-emerald-800' },
          { label: 'Sector Plot Inventory', route: '/society/inventory', icon: Layers, badge: 'Masterplan', badgeColor: 'bg-emerald-100 text-emerald-800' },
          { label: 'Authorized Dealers & Lots', route: '/society/dealers', icon: Users, badge: 'Allocation', badgeColor: 'bg-emerald-100 text-emerald-800' },
          { label: 'Booking Approvals Queue', route: '/society/approvals', icon: UserCheck, badge: '1 Pending', badgeColor: 'bg-amber-100 text-amber-800' },
          { label: 'Financials & Defaulters', route: '/society/financials', icon: DollarSign },
          { label: 'Notification Center', route: '/buyer/notifications', icon: Bell, badge: 'Live', badgeColor: 'bg-emerald-100 text-emerald-800' },
          { label: 'Society Legal Vault', route: '/society/documents', icon: FolderLock },
          { label: 'Profile & Settings', route: '/profile', icon: Settings }
        ]
      },
      {
        heading: 'Marketplace Tools',
        items: [
          { label: 'Public Societies View', route: '/societies', icon: Building2 },
          { label: 'Property Marketplace', route: '/marketplace', icon: ExternalLink }
        ]
      }
    ];
  } else if (role === 'super_admin') {
    menuSections = [
      {
        heading: 'Platform Super Admin',
        items: [
          { label: 'Master Overview', route: '/admin/overview', icon: LayoutDashboard },
          { label: 'Analytics & Reports', route: '/admin/analytics', icon: TrendingUp, badge: 'Intelligence', badgeColor: 'bg-indigo-100 text-indigo-800' },
          { label: 'Add Property Listing', route: '/properties/add', icon: PlusCircle, badge: '+ New', badgeColor: 'bg-indigo-100 text-indigo-800' },
          { label: 'User & Dealer Accounts', route: '/admin/users', icon: Users, badge: 'Directory', badgeColor: 'bg-purple-100 text-purple-800' },
          { label: 'Verification Queue', route: '/admin/verification-queue', icon: ShieldCheck, badge: '2 Pending', badgeColor: 'bg-rose-100 text-rose-800' },
          { label: 'Listings Moderation', route: '/admin/moderation', icon: Layers, badge: '1 Duplicate', badgeColor: 'bg-amber-100 text-amber-800' },
          { label: 'Dispute Management', route: '/admin/disputes', icon: AlertTriangle, badge: '1 Frozen', badgeColor: 'bg-indigo-100 text-indigo-800' },
          { label: 'Notification Command Center', route: '/buyer/notifications', icon: Bell, badge: 'Multi-Channel', badgeColor: 'bg-indigo-100 text-indigo-800' },
          { label: 'Master Document Vault', route: '/admin/documents', icon: FolderLock },
          { label: 'Immutable Audit Logs', route: '/admin/audit-logs', icon: BarChart3 },
          { label: 'Profile & Settings', route: '/profile', icon: Settings }
        ]
      },
      {
        heading: 'Marketplace Tools',
        items: [
          { label: 'Explore Marketplace', route: '/marketplace', icon: ExternalLink },
          { label: 'Societies Directory', route: '/societies', icon: Building2 },
          { label: 'AI Price Estimator', route: '/price-estimator', icon: Sparkles }
        ]
      }
    ];
  }

  const handleNavClick = (route: string) => {
    onNavigate(route);
    if (onCloseMobile) onCloseMobile();
  };

  const canAddProperty = true;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      
      {/* Top Header & Brand */}
      <div className={`p-4 border-b border-slate-100 flex items-center justify-between ${isCollapsed ? 'px-2 justify-center' : ''}`}>
        {!isCollapsed ? (
          <button 
            onClick={() => handleNavClick('/')}
            className="flex items-center text-left cursor-pointer group py-0.5"
            title="MANZIL IQ - Home"
          >
            <ManzilIQLogo variant="horizontal" size="sm" theme="light" showTagline={false} />
          </button>
        ) : (
          <button 
            onClick={() => handleNavClick('/')}
            className="flex items-center justify-center p-1.5 rounded-xl hover:bg-amber-50 border border-amber-200 transition cursor-pointer"
            title="MANZIL IQ"
          >
            <ManzilIQLogo variant="icon" size="sm" theme="light" />
          </button>
        )}

        <button
          onClick={toggleCollapse}
          className="hidden md:flex p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition cursor-pointer"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Role Pill Header */}
      {!isCollapsed && (
        <div className="px-4 py-3 bg-slate-50/60 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Role</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${accent.pillColor}`}>
              {accent.badge}
            </span>
          </div>
          <div className="text-xs font-bold text-slate-900 truncate mt-1">
            {currentUser.name}
          </div>
        </div>
      )}

      {/* Dedicated Add Property Action Button for Dealer & Admin roles */}
      {canAddProperty && (
        <div className={`p-3 border-b border-slate-100 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <button
            onClick={onOpenAddProperty || (() => handleNavClick('/properties/add'))}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-white shadow-xs transition cursor-pointer active:scale-98 ${
              role === 'super_admin' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' :
              role === 'society_admin' ? 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-200' :
              role === 'dealer' ? 'bg-teal-700 hover:bg-teal-800 shadow-teal-200' :
              'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-200'
            }`}
            title="Add Property Listing"
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Add Property</span>}
          </button>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {menuSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {section.heading}
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item, itemIdx) => {
                const IconComponent = item.icon;
                const isActive = currentRoute === item.route || currentRoute.startsWith(`${item.route}/`);

                return (
                  <button
                    key={itemIdx}
                    onClick={() => handleNavClick(item.route)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center py-2.5' : 'justify-between px-3 py-2'} rounded-xl text-xs transition cursor-pointer border ${
                      isActive
                        ? `${accent.activeNav}`
                        : `border-transparent text-slate-600 ${accent.hoverNav} hover:bg-slate-50`
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? accent.activeIcon : 'text-slate-400'}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${item.badgeColor || 'bg-slate-100 text-slate-600'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer / User Session Card */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50 space-y-2">
        {!isCollapsed ? (
          <div className="space-y-2">
            {/* User Details Banner */}
            <div className="p-2 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{currentUser.email}</div>
                </div>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${accent.pillColor}`}>
                {accent.badge.split(' ')[0]}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onNavigate('/profile')}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg transition font-medium border border-slate-200 bg-white cursor-pointer"
                title="Account Settings"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Settings</span>
              </button>

              <button
                onClick={onLogout}
                className="flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition font-medium border border-rose-200 bg-white cursor-pointer"
                title="Sign Out to Guest Mode"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => onNavigate('/profile')}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg cursor-pointer"
              title="Profile & Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onLogout}
              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className={`hidden md:flex flex-col h-full shrink-0 transition-all duration-200 ${isCollapsed ? 'w-16' : 'w-64'}`}>
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-2xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[85vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
