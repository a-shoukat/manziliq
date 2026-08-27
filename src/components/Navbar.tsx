import React, { useState } from 'react';
import { User, UserRole, NotificationItem } from '../types';
import { 
  Building2, 
  MapPin, 
  Sparkles, 
  Heart, 
  SlidersHorizontal, 
  Bell, 
  LogOut, 
  Menu, 
  X, 
  Search,
  LayoutDashboard,
  ShieldCheck,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  activeRole: UserRole;
  currentTab: string;
  onTabChange: (tab: string) => void;
  wishlistCount: number;
  compareCount: number;
  notifications: NotificationItem[];
  onOpenAuth: () => void;
  onOpenWishlist: () => void;
  onOpenNotifications: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeRole,
  currentTab,
  onTabChange,
  wishlistCount,
  compareCount,
  notifications,
  onOpenAuth,
  onOpenWishlist,
  onOpenNotifications,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unreadNotifs = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white text-slate-900 border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div 
            onClick={() => onTabChange('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-extrabold shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-[Outfit] text-2xl font-black tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors">
                  MANZILIQ
                </span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-300 uppercase tracking-widest">
                  PK
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide -mt-1 hidden sm:block">
                Property & Housing Society Portal
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onTabChange('home')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                currentTab === 'home' || currentTab === 'marketplace'
                  ? 'bg-amber-50 text-amber-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Marketplace
            </button>

            <button
              onClick={() => onTabChange('map')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                currentTab === 'map'
                  ? 'bg-amber-50 text-amber-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Interactive Map</span>
            </button>

            <button
              onClick={() => onTabChange('ai_estimator')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                currentTab === 'ai_estimator'
                  ? 'bg-amber-50 text-amber-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>AI Valuation</span>
            </button>

            {/* Dashboard Link dynamically based on Role */}
            <button
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>
                {activeRole === 'buyer' && 'My Bookings'}
                {activeRole === 'society_admin' && 'Society Portal'}
                {activeRole === 'dealer' && 'Dealer Pipeline'}
                {activeRole === 'super_admin' && 'Super Admin'}
              </span>
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Compare Badge */}
            {compareCount > 0 && (
              <button
                onClick={() => onTabChange('compare')}
                className="hidden sm:flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-300 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Compare</span>
                <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {compareCount}
                </span>
              </button>
            )}

            {/* Wishlist Icon */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Saved Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-slate-950 font-extrabold text-[10px] rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Notifications Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifs}
                </span>
              )}
            </button>

            {/* User Avatar / Profile */}
            <div className="pl-2 border-l border-slate-200 flex items-center gap-2">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900 max-w-[120px] truncate">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-amber-700 font-semibold capitalize flex items-center justify-end gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>

              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full object-cover border-2 border-amber-400"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-bold border border-amber-300">
                  {currentUser.name.charAt(0)}
                </div>
              )}

              <button
                onClick={onOpenAuth}
                className="hidden sm:block text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-md border border-slate-200 transition-colors font-semibold"
              >
                Account
              </button>
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
          <div className="py-2 border-b border-slate-200 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
              <p className="text-xs text-amber-700 font-medium capitalize">{currentUser.role.replace('_', ' ')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => { onTabChange('home'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
                currentTab === 'home' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-800'
              }`}
            >
              Marketplace
            </button>

            <button
              onClick={() => { onTabChange('map'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
                currentTab === 'map' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-800'
              }`}
            >
              Interactive Map
            </button>

            <button
              onClick={() => { onTabChange('ai_estimator'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
                currentTab === 'ai_estimator' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-800'
              }`}
            >
              AI Price Valuation
            </button>

            <button
              onClick={() => { onTabChange('dashboard'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold bg-amber-500 text-slate-950`}
            >
              My Dashboard
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
