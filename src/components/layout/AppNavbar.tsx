import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole, Property, NotificationItem } from '../../types';
import { 
  Building2, 
  Sparkles, 
  Scale, 
  Heart, 
  Bell, 
  User as UserIcon, 
  LogIn, 
  Database,
  LayoutDashboard,
  Search,
  CheckCircle2,
  Menu,
  X,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
  Briefcase,
  AlertCircle,
  Plus,
  PlusCircle,
  Zap,
  Smartphone,
  Mail,
  ExternalLink
} from 'lucide-react';

interface AppNavbarProps {
  currentRoute: string;
  currentUser: User;
  wishlistCount: number;
  unreadNotificationsCount: number;
  comparisonCount: number;
  notificationList?: NotificationItem[];
  onOpenNotificationModal?: (notification: NotificationItem) => void;
  onMarkNotificationRead?: (id: string) => void;
  onNavigate: (route: string) => void;
  onRoleSwitch: (role: UserRole) => void;
  onOpenSupabase: () => void;
  onOpenAddProperty?: () => void;
  onToggleMobileMenu?: () => void;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
  currentRoute,
  currentUser,
  wishlistCount,
  unreadNotificationsCount,
  comparisonCount,
  notificationList = [],
  onOpenNotificationModal,
  onMarkNotificationRead,
  onNavigate,
  onRoleSwitch,
  onOpenSupabase,
  onOpenAddProperty,
  onToggleMobileMenu
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isPublicBuyer = currentUser.role === 'public_buyer';

  const role = currentUser.role;

  const roleAccentMap: Record<UserRole, {
    label: string;
    badge: string;
    color: string;
    border: string;
  }> = {
    super_admin: { label: 'Super Admin', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', color: 'text-indigo-600', border: 'border-indigo-500' },
    society_admin: { label: 'Society Admin', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', color: 'text-emerald-600', border: 'border-emerald-500' },
    dealer: { label: 'Dealer / Agent', badge: 'bg-teal-50 text-teal-700 border-teal-200', color: 'text-teal-600', border: 'border-teal-500' },
    buyer: { label: 'Customer', badge: 'bg-amber-50 text-amber-900 border-amber-200', color: 'text-amber-600', border: 'border-amber-500' },
    public_buyer: { label: 'Guest', badge: 'bg-slate-100 text-slate-700 border-slate-200', color: 'text-slate-600', border: 'border-slate-500' }
  };

  const currentRoleMeta = roleAccentMap[role] || roleAccentMap.super_admin;

  const navLinks = [
    { label: 'Marketplace', route: '/marketplace', icon: Search },
    { label: 'Societies', route: '/societies', icon: Building2 },
    { label: 'AI Estimator', route: '/price-estimator', icon: Sparkles },
    { 
      label: 'Compare', 
      route: '/compare', 
      icon: Scale, 
      badge: comparisonCount > 0 ? comparisonCount : undefined 
    }
  ];

  const sampleNotifications = [
    { id: '1', title: 'Plot Demarcation Update', desc: 'Sector A Plot 42-A passed LDA survey inspection.', time: '10m ago', unread: true },
    { id: '2', title: 'Installment Reminder', desc: 'Installment #4 for Al-Rehman Garden due on Aug 28.', time: '2h ago', unread: true },
    { id: '3', title: 'New Deal Assigned', desc: 'Executive 10 Marla lot allotted to your dealer pipeline.', time: '1d ago', unread: false }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left: Mobile Menu & Logo */}
          <div className="flex items-center gap-3">
            {onToggleMobileMenu && (
              <button
                onClick={onToggleMobileMenu}
                className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                title="Toggle Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <button 
              onClick={() => onNavigate('/')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-amber-400 font-black text-lg shadow-sm group-hover:bg-slate-800 transition">
                M
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-extrabold text-slate-900 text-base leading-tight tracking-tight flex items-center gap-1.5">
                  <span>MANZILIQ</span>
                  <span className="text-[9px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    SaaS
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">National Property Portal</p>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 ml-4">
              {navLinks.map((link) => {
                const IconComponent = link.icon;
                const isActive = currentRoute === link.route;
                return (
                  <button
                    key={link.route}
                    onClick={() => onNavigate(link.route)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                    <span>{link.label}</span>
                    {link.badge !== undefined && (
                      <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-amber-300">
                        {link.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Center Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-3">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                placeholder="Quick search (plots, societies, deals)..."
                className="w-full text-xs pl-8.5 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition"
              />
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            
            {/* Database Sync Badge */}
            <button
              onClick={onOpenSupabase}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition cursor-pointer"
              title="Supabase PostgreSQL Sync"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Sync</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            </button>

            {/* Add Property Button (Accessible with auto-switch for seamless experience) */}
            {!isPublicBuyer && (
              <button
                onClick={() => {
                  if (currentUser.role === 'buyer' && onRoleSwitch) {
                    onRoleSwitch('dealer');
                  }
                  if (onOpenAddProperty) onOpenAddProperty();
                  else onNavigate('/properties/add');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white rounded-xl shadow-xs transition cursor-pointer active:scale-95 ${
                  currentUser.role === 'super_admin' ? 'bg-indigo-600 hover:bg-indigo-700' :
                  currentUser.role === 'society_admin' ? 'bg-emerald-700 hover:bg-emerald-800' :
                  'bg-teal-700 hover:bg-teal-800'
                }`}
                title="Add New Property Listing"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Property</span>
              </button>
            )}

            {/* Role Dashboard Quick Link (When Logged In) */}
            {!isPublicBuyer && (
              <button
                onClick={() => {
                  if (currentUser.role === 'buyer') onNavigate('/buyer/overview');
                  else if (currentUser.role === 'dealer') onNavigate('/dealer/overview');
                  else if (currentUser.role === 'society_admin') onNavigate('/society/overview');
                  else if (currentUser.role === 'super_admin') onNavigate('/admin/overview');
                }}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer ${currentRoleMeta.badge} hover:opacity-90`}
                title="Go to Role Dashboard"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Dashboard</span>
              </button>
            )}

            {/* Saved Wishlist */}
            <button
              onClick={() => onNavigate(isPublicBuyer ? '/signup' : '/buyer/wishlist')}
              className="relative p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
              title="Saved Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Notifications Bell with Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-amber-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-84 bg-white rounded-3xl border border-slate-200 shadow-2xl p-4 z-50 space-y-3 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900">Notifications</span>
                      {unreadNotificationsCount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-800 text-white rounded-full">
                          {unreadNotificationsCount} new
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        setNotificationsOpen(false);
                        onNavigate('/buyer/notifications');
                      }}
                      className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold hover:underline cursor-pointer"
                    >
                      Command Center →
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto space-y-1">
                    {notificationList.length === 0 ? (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        No notifications yet.
                      </div>
                    ) : (
                      notificationList.slice(0, 5).map(n => (
                        <div 
                          key={n.id} 
                          className={`py-2.5 px-2 rounded-2xl transition cursor-pointer hover:bg-slate-50 ${
                            !n.read ? 'bg-emerald-50/40 font-medium' : ''
                          }`}
                          onClick={() => {
                            if (onOpenNotificationModal) onOpenNotificationModal(n);
                            if (onMarkNotificationRead && !n.read) onMarkNotificationRead(n.id);
                            setNotificationsOpen(false);
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <strong className="text-slate-900 text-xs truncate max-w-[190px]">{n.title}</strong>
                            <span className="text-[10px] text-slate-400 shrink-0">{n.date || n.createdAt}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">{n.message}</p>
                          <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-100/60">
                            <span className="text-[9px] font-bold uppercase text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                              {n.type}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-800 hover:underline">
                              View 4-Tier ↗
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Auth Actions */}
            <div className="relative" ref={profileRef}>
              {isPublicBuyer ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onRoleSwitch('buyer');
                      onNavigate('/buyer/overview');
                    }}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition cursor-pointer"
                    title="1-Click Login as Verified Customer (Muhammad Farooq)"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-amber-700" />
                    <span>Demo Customer</span>
                  </button>
                  <button
                    onClick={() => onNavigate('/login')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5 text-slate-500" />
                    <span>Sign In</span>
                  </button>
                  <button
                    onClick={() => onNavigate('/signup')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-xs cursor-pointer"
                  >
                    <span>Register</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2 hover:bg-slate-100 rounded-xl transition cursor-pointer border border-slate-200/80"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="text-left hidden xl:block">
                    <div className="text-xs font-bold text-slate-900 leading-none">{currentUser.name}</div>
                    <span className={`text-[9px] font-bold ${currentRoleMeta.color}`}>
                      {currentRoleMeta.label}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              )}

              {/* Profile Menu Dropdown */}
              {profileDropdownOpen && !isPublicBuyer && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-50 space-y-2 text-xs">
                  <div className="pb-2 border-b border-slate-100">
                    <div className="font-bold text-slate-900 text-sm truncate">{currentUser.name}</div>
                    <div className="text-slate-500 text-[11px] truncate">{currentUser.email}</div>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1.5 ${currentRoleMeta.badge}`}>
                      {currentRoleMeta.label}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {/* Add Property option for authorized roles */}
                    {(currentUser.role === 'dealer' || currentUser.role === 'society_admin' || currentUser.role === 'super_admin') && (
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          if (onOpenAddProperty) onOpenAddProperty();
                          else onNavigate('/properties/add');
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-emerald-700 hover:bg-emerald-50 rounded-xl font-bold transition cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4 text-emerald-600" />
                        <span>Add New Property</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        if (currentUser.role === 'buyer') onNavigate('/buyer/overview');
                        else if (currentUser.role === 'dealer') onNavigate('/dealer/overview');
                        else if (currentUser.role === 'society_admin') onNavigate('/society/overview');
                        else if (currentUser.role === 'super_admin') onNavigate('/admin/overview');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 text-slate-700 hover:bg-slate-50 rounded-xl font-medium transition cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      <span>Role Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onNavigate('/profile');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 text-slate-700 hover:bg-slate-50 rounded-xl font-medium transition cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Profile & Settings</span>
                    </button>
                  </div>

                  {/* 1-Click Role Persona Quick Switcher */}
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <div className="px-2 text-[10px] font-bold uppercase text-slate-400">
                      Switch Role Persona:
                    </div>
                    <div className="grid grid-cols-2 gap-1 pt-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onRoleSwitch('buyer');
                        }}
                        className={`p-1.5 rounded-lg text-[10px] font-bold text-left transition cursor-pointer ${
                          currentUser.role === 'buyer'
                            ? 'bg-amber-100 text-amber-950 border border-amber-300 font-extrabold'
                            : 'bg-slate-50 hover:bg-amber-50 text-slate-700'
                        }`}
                      >
                        👤 Customer
                      </button>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onRoleSwitch('dealer');
                        }}
                        className={`p-1.5 rounded-lg text-[10px] font-bold text-left transition cursor-pointer ${
                          currentUser.role === 'dealer'
                            ? 'bg-teal-100 text-teal-950 border border-teal-300 font-extrabold'
                            : 'bg-slate-50 hover:bg-teal-50 text-slate-700'
                        }`}
                      >
                        💼 Dealer
                      </button>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onRoleSwitch('society_admin');
                        }}
                        className={`p-1.5 rounded-lg text-[10px] font-bold text-left transition cursor-pointer ${
                          currentUser.role === 'society_admin'
                            ? 'bg-emerald-100 text-emerald-950 border border-emerald-300 font-extrabold'
                            : 'bg-slate-50 hover:bg-emerald-50 text-slate-700'
                        }`}
                      >
                        🏢 Society
                      </button>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onRoleSwitch('super_admin');
                        }}
                        className={`p-1.5 rounded-lg text-[10px] font-bold text-left transition cursor-pointer ${
                          currentUser.role === 'super_admin'
                            ? 'bg-indigo-100 text-indigo-950 border border-indigo-300 font-extrabold'
                            : 'bg-slate-50 hover:bg-indigo-50 text-slate-700'
                        }`}
                      >
                        🛡️ Admin
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onNavigate('/login');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition cursor-pointer"
                    >
                      <LogIn className="w-4 h-4 text-slate-400" />
                      <span>Login Portal (All Roles)</span>
                    </button>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onRoleSwitch('public_buyer');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl font-semibold transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out (Guest Mode)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
