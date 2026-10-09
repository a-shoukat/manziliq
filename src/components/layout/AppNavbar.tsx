import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole, NotificationItem } from '../../types';
import { ManzilIQLogo } from '../common/ManzilIQLogo';
import { 
  Bell, 
  Menu, 
  X, 
  ChevronDown, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  LogIn, 
  PlusCircle, 
  CheckCircle2, 
  Shield 
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
  onOpenSupabase?: () => void;
  onOpenAddProperty?: () => void;
  onToggleMobileMenu?: () => void;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
  currentRoute,
  currentUser,
  wishlistCount = 0,
  unreadNotificationsCount = 0,
  comparisonCount = 0,
  notificationList = [],
  onOpenNotificationModal,
  onMarkNotificationRead,
  onNavigate,
  onRoleSwitch,
  onOpenAddProperty
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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

  const roleBadgeConfig = {
    label: currentUser.role === 'public_buyer' ? 'Guest' :
           currentUser.role === 'buyer' ? 'Buyer' :
           currentUser.role === 'dealer' ? 'Dealer' :
           currentUser.role === 'society_admin' ? 'Society Admin' : 'Super Admin',
    badgeClass: currentUser.role === 'buyer' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                currentUser.role === 'dealer' ? 'bg-teal-100 text-teal-800 border-teal-200' :
                currentUser.role === 'society_admin' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                currentUser.role === 'super_admin' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : 'bg-slate-100 text-slate-700 border-slate-200'
  };

  const navLinks = [
    { label: 'Marketplace', route: '/marketplace' },
    { label: 'Societies', route: '/societies' },
    { label: 'Add Property', route: '/properties/add' },
    { label: 'AI Estimator', route: '/price-estimator' },
    { 
      label: 'Compare', 
      route: '/compare', 
      count: comparisonCount > 0 ? comparisonCount : undefined 
    }
  ];

  const handleLinkClick = (route: string) => {
    setMobileNavOpen(false);
    onNavigate(route);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[68px]">
          
          {/* 1. LOGO AREA (left) */}
          <div className="flex items-center gap-2 sm:gap-8 min-w-0">
            <button 
              id="navbar-brand-logo"
              onClick={() => handleLinkClick('/')}
              className="flex items-center cursor-pointer group focus:outline-none py-1 min-w-0"
              aria-label="ManzilIQ Home"
            >
              <ManzilIQLogo variant="horizontal" size="sm" theme="light" showTagline={true} />
            </button>

            {/* 2. MAIN NAV LINKS (center / desktop) */}
            <nav className="hidden md:flex items-center gap-7 lg:gap-8 ml-2">
              {navLinks.map((link) => {
                const isActive = currentRoute === link.route;
                return (
                  <button
                    key={link.route}
                    id={`nav-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => handleLinkClick(link.route)}
                    className={`relative text-sm transition cursor-pointer py-1 ${
                      isActive 
                        ? 'font-bold text-blue-900' 
                        : 'font-medium text-slate-600 hover:text-blue-900'
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.count !== undefined && (
                      <sup className="ml-1 -top-1.5 px-1.5 py-0.2 text-[10px] font-bold bg-blue-100 text-blue-900 rounded-full leading-none">
                        {link.count}
                      </sup>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-900 rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 3. RIGHT SIDE: UTILITY & AUTH/ACCOUNT AREA */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Quick Add Property Listing Button */}
            <button
              id="btn-navbar-add-property"
              onClick={() => handleLinkClick('/properties/add')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95 ${
                currentRoute === '/properties/add'
                  ? 'bg-emerald-800 text-white shadow-emerald-900/20'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
              title="Add New Property Listing"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Add Property</span>
              <span className="sm:hidden">+ Add</span>
            </button>

            {/* Utility: Consolidated Notifications Bell */}
            <div className="relative" ref={notifRef}>
              <button
                id="btn-navbar-notifications"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-slate-600 hover:text-blue-900 hover:bg-slate-100 rounded-xl transition cursor-pointer relative"
                title="Notifications"
                aria-label="View Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {notificationsOpen && (
                <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto right-auto sm:right-0 top-16 sm:top-auto sm:mt-2 w-auto sm:w-88 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 z-50 space-y-3 text-xs animate-in fade-in zoom-in-95 duration-150 max-h-[80vh] overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">Notifications</span>
                      {unreadNotificationsCount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                          {unreadNotificationsCount} new
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        setNotificationsOpen(false);
                        onNavigate('/buyer/notifications');
                      }}
                      className="text-[11px] text-blue-900 hover:text-blue-950 font-bold hover:underline cursor-pointer"
                    >
                      View All →
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 overflow-y-auto space-y-1 pr-1 flex-1">
                    {notificationList.length === 0 ? (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        No notifications yet.
                      </div>
                    ) : (
                      notificationList.slice(0, 5).map(n => (
                        <div 
                          key={n.id} 
                          className={`py-2.5 px-2 rounded-xl transition cursor-pointer hover:bg-slate-50 ${
                            !n.read ? 'bg-blue-50/40 font-medium' : ''
                          }`}
                          onClick={() => {
                            if (onOpenNotificationModal) onOpenNotificationModal(n);
                            if (onMarkNotificationRead && !n.read) onMarkNotificationRead(n.id);
                            setNotificationsOpen(false);
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <strong className="text-slate-900 text-xs truncate max-w-[180px] sm:max-w-[200px]">{n.title}</strong>
                            <span className="text-[10px] text-slate-400 shrink-0">{n.date || n.createdAt || 'Recent'}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 4. AUTH & ACCOUNT AREA */}
            {isPublicBuyer ? (
              <div className="flex items-center gap-3">
                {/* Unobtrusive Try Demo Link */}
                <button
                  id="btn-navbar-try-demo"
                  onClick={() => {
                    onRoleSwitch('buyer');
                    onNavigate('/buyer/overview');
                  }}
                  className="hidden lg:inline-block text-xs font-medium text-slate-500 hover:text-blue-900 transition hover:underline cursor-pointer pr-1"
                  title="Test Verified Customer Experience"
                >
                  Try Demo
                </button>

                {/* Log In (Ghost / Text Button) */}
                <button
                  id="btn-navbar-login"
                  onClick={() => onNavigate('/login')}
                  className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Log In
                </button>

                {/* Sign Up (Brand Primary Blue Solid Button) */}
                <button
                  id="btn-navbar-signup"
                  onClick={() => onNavigate('/signup')}
                  className="px-4.5 py-2 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition shadow-xs cursor-pointer active:scale-98"
                >
                  Sign Up
                </button>
              </div>
            ) : (
              /* Authenticated User Profile Dropdown */
              <div className="relative" ref={profileRef}>
                <button
                  id="btn-navbar-user-profile"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-2 hover:bg-slate-100 rounded-xl transition cursor-pointer border border-slate-200"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-900 text-white font-bold text-xs flex items-center justify-center">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-slate-900 hidden lg:inline max-w-[120px] truncate">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-50 space-y-2 text-xs">
                    <div className="pb-2 border-b border-slate-100">
                      <div className="font-bold text-slate-900 text-sm truncate">{currentUser.name}</div>
                      <div className="text-slate-500 text-[11px] truncate">{currentUser.email}</div>
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1.5 bg-blue-50 text-blue-800 border-blue-200 uppercase">
                        {currentUser.role.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {/* Dashboard Action */}
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

                      {/* Add Property Option for all authenticated users */}
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

                      {/* Profile & Settings */}
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

                    {/* Role Persona Switcher */}
                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <div className="px-2 text-[10px] font-bold uppercase text-slate-400">
                        Switch Persona:
                      </div>
                      <div className="grid grid-cols-2 gap-1 pt-1">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            onRoleSwitch('buyer');
                          }}
                          className={`p-1.5 rounded-lg text-[10px] font-bold text-left transition cursor-pointer ${
                            currentUser.role === 'buyer'
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : 'bg-slate-50 hover:bg-blue-50 text-slate-700'
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
                              ? 'bg-teal-100 text-teal-900 border border-teal-300'
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
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
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
                              ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                              : 'bg-slate-50 hover:bg-indigo-50 text-slate-700'
                          }`}
                        >
                          🛡️ Admin
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
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
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              id="btn-navbar-mobile-toggle"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-blue-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileNavOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 animate-in slide-in-from-top-2 duration-150 shadow-xl max-h-[85vh] overflow-y-auto">
          {/* User Status Bar if Logged In */}
          {!isPublicBuyer && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-900 text-white font-bold flex items-center justify-center text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 truncate max-w-[160px]">{currentUser.name}</div>
                    <div className="text-[10px] font-semibold text-slate-500">{currentUser.phone}</div>
                  </div>
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${roleBadgeConfig.badgeClass}`}>
                  {roleBadgeConfig.label}
                </span>
              </div>

              {/* Portal Shortcut CTA */}
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  const portalRoute = 
                    currentUser.role === 'buyer' ? '/buyer/overview' :
                    currentUser.role === 'dealer' ? '/dealer/overview' :
                    currentUser.role === 'society_admin' ? '/society/overview' : '/admin/overview';
                  onNavigate(portalRoute);
                }}
                className="w-full py-2 px-3 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Open {roleBadgeConfig.label} Portal</span>
              </button>
            </div>
          )}

          {/* Core Navigation Links */}
          <nav className="flex flex-col space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
              Marketplace & Tools
            </div>
            {navLinks.map((link) => {
              const isActive = currentRoute === link.route;
              return (
                <button
                  key={link.route}
                  onClick={() => handleLinkClick(link.route)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer text-left ${
                    isActive 
                      ? 'bg-blue-50 text-blue-900 font-bold' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.count !== undefined && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-900 rounded-full">
                      {link.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Role Switcher in Mobile Drawer */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Switch Account View
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  onRoleSwitch('buyer');
                  onNavigate('/buyer/overview');
                }}
                className={`p-2 rounded-xl text-[11px] font-bold text-left transition cursor-pointer ${
                  currentUser.role === 'buyer'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-slate-50 hover:bg-amber-50 text-slate-700'
                }`}
              >
                🏡 Buyer
              </button>
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  onRoleSwitch('dealer');
                  onNavigate('/dealer/overview');
                }}
                className={`p-2 rounded-xl text-[11px] font-bold text-left transition cursor-pointer ${
                  currentUser.role === 'dealer'
                    ? 'bg-teal-100 text-teal-900 border border-teal-300'
                    : 'bg-slate-50 hover:bg-teal-50 text-slate-700'
                }`}
              >
                💼 Dealer
              </button>
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  onRoleSwitch('society_admin');
                  onNavigate('/society/overview');
                }}
                className={`p-2 rounded-xl text-[11px] font-bold text-left transition cursor-pointer ${
                  currentUser.role === 'society_admin'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-slate-50 hover:bg-emerald-50 text-slate-700'
                }`}
              >
                🏢 Society
              </button>
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  onRoleSwitch('super_admin');
                  onNavigate('/admin/overview');
                }}
                className={`p-2 rounded-xl text-[11px] font-bold text-left transition cursor-pointer ${
                  currentUser.role === 'super_admin'
                    ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                    : 'bg-slate-50 hover:bg-indigo-50 text-slate-700'
                }`}
              >
                🛡️ Admin
              </button>
            </div>
          </div>

          {/* Public Buyer Login / Signup */}
          {isPublicBuyer ? (
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
              <button
                onClick={() => handleLinkClick('/login')}
                className="w-full py-2.5 text-center text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                Log In
              </button>
              <button
                onClick={() => handleLinkClick('/signup')}
                className="w-full py-2.5 text-center text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-xs"
              >
                Sign Up
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  onNavigate('/profile');
                }}
                className="flex-1 py-2 text-center text-xs font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
              >
                Profile & Settings
              </button>
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  onRoleSwitch('public_buyer');
                  onNavigate('/');
                }}
                className="py-2 px-3 text-center text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
