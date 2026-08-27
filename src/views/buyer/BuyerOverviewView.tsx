import React from 'react';
import { User, Booking, Installment, NotificationItem, Property } from '../../types';
import { 
  LayoutDashboard, 
  Layers, 
  CreditCard, 
  Heart, 
  FolderLock, 
  Bell, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Building2, 
  Sparkles,
  Download
} from 'lucide-react';
import { generatePDFDocument } from '../../utils/pdfGenerator';

interface BuyerOverviewViewProps {
  currentUser: User;
  bookings: Booking[];
  installments: Installment[];
  notifications: NotificationItem[];
  wishlistProperties: Property[];
  onNavigate: (route: string) => void;
  onOpenPayment: (installment: Installment) => void;
  onOpenNotificationDetail: (notification: NotificationItem) => void;
}

export const BuyerOverviewView: React.FC<BuyerOverviewViewProps> = ({
  currentUser,
  bookings,
  installments,
  notifications,
  wishlistProperties,
  onNavigate,
  onOpenPayment,
  onOpenNotificationDetail
}) => {
  const userBookings = bookings.filter(b => 
    b.buyerId === currentUser.id || 
    (currentUser.email && b.buyerEmail?.toLowerCase() === currentUser.email.toLowerCase()) ||
    (currentUser.role === 'buyer' && (!b.buyerId || b.buyerId === 'u-buyer-1' || b.buyerId === 'u-buyer-alias'))
  );
  const userInstallments = installments;
  const overdueInstallment = userInstallments.find(i => i.status === 'overdue');
  const nextDueInstallment = userInstallments.find(i => i.status === 'due');

  const totalPaid = userInstallments
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.amountPKR, 0);

  return (
    <div className="space-y-8">
      
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified Registered Allottee • NADRA CNIC Synchronized</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome Back, {currentUser.name}
          </h1>
          <p className="text-xs text-slate-300">
            CNIC: <span className="font-mono">{currentUser.cnic || '34501-8472910-3'}</span> • Active Bookings: <strong>{userBookings.length}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/marketplace')}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Browse Marketplace
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Active Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Bookings</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{userBookings.length} Plots</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">Al-Rehman Garden</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Total Paid */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Dues Cleared</div>
            <div className="text-2xl font-black text-emerald-800 mt-1">PKR {(totalPaid/1000).toFixed(0)}k</div>
            <div className="text-[11px] text-slate-500 mt-0.5">2 Installments + Downpayment</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        {/* Pending / Overdue Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Next Dues Status</div>
            <div className="text-xl font-black text-amber-700 mt-1">
              {overdueInstallment ? '1 Overdue Surcharge' : 'On Schedule'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {overdueInstallment ? `PKR ${(overdueInstallment.amountPKR + (overdueInstallment.lateFeePKR || 0)).toLocaleString('en-PK')} due` : 'No immediate pending dues'}
            </div>
          </div>
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${overdueInstallment ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Document Locker */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Document Locker</div>
            <div className="text-2xl font-black text-purple-700 mt-1">4 Stamped</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Allotment Letters & Receipts</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <FolderLock className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Active Booking Highlight with 6-Stage Tracker */}
      {userBookings[0] && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Primary Registered Plot
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                {userBookings[0].plotNumber} — {userBookings[0].societyName}
              </h3>
              <p className="text-xs text-slate-500">
                Allotment Ref: <strong>{userBookings[0].allotmentLetterNumber || 'AR-2026-0841'}</strong> • 5 Marla Executive Block
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('/buyer/bookings')}
                className="flex items-center gap-1 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <span>View Full Pipeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 6-Stage Pipeline Timeline */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-700">6-Stage Official Booking & Allotment Status</div>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
              {[
                { stage: 1, label: '1. Token Recv', done: true },
                { stage: 2, label: '2. CNIC Verif', done: true },
                { stage: 3, label: '3. Down Payment', done: true },
                { stage: 4, label: '4. Allotment Letter', done: true },
                { stage: 5, label: '5. Installments', active: true },
                { stage: 6, label: '6. Transfer Deed', done: false }
              ].map((s) => (
                <div 
                  key={s.stage}
                  className={`p-3 rounded-2xl border text-center transition ${
                    s.done 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' 
                      : s.active 
                      ? 'bg-amber-50 border-amber-300 text-amber-900 font-black ring-2 ring-amber-400' 
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="text-sm mb-0.5">{s.done ? '✓' : s.active ? '⚡' : '○'}</div>
                  <div className="truncate text-[11px]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Row: Overdue Alert / Pay Now */}
          {overdueInstallment && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold">
                  !
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-950">
                    Installment #{overdueInstallment.installmentNumber} Overdue ({overdueInstallment.daysOverdue} Days)
                  </div>
                  <div className="text-xs text-amber-800">
                    Base: PKR {overdueInstallment.amountPKR.toLocaleString('en-PK')} + Late Surcharge: PKR {overdueInstallment.lateFeePKR?.toLocaleString('en-PK')} (2.5%)
                  </div>
                </div>
              </div>

              <button
                onClick={() => onOpenPayment(overdueInstallment)}
                className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
              >
                Pay Overdue Now &rarr;
              </button>
            </div>
          )}
        </div>
      )}

      {/* Two Columns: Recent Notifications & Quick Wishlist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Notifications with 3-tier trigger */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-800" />
              <span>Recent Dispatches & Alerts</span>
            </h3>
            <button
              onClick={() => onNavigate('/buyer/notifications')}
              className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {notifications.slice(0, 3).map((notif) => (
              <div
                key={notif.id}
                onClick={() => onOpenNotificationDetail(notif)}
                className="p-3.5 bg-slate-50 hover:bg-emerald-50/50 rounded-2xl border border-slate-100 transition cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-900">{notif.title}</span>
                  <span className="text-slate-400">{notif.date.split(' ')[1]}</span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-1">{notif.message}</p>
                <div className="text-[10px] text-emerald-700 font-semibold pt-1">
                  Click to inspect 3-Tier preview (In-App • SMS • Email) &rarr;
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Saved Wishlist */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-600" />
              <span>Saved Properties & Wishlist ({wishlistProperties.length})</span>
            </h3>
            <button
              onClick={() => onNavigate('/buyer/wishlist')}
              className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
            >
              Manage
            </button>
          </div>

          {wishlistProperties.length > 0 ? (
            <div className="space-y-3">
              {wishlistProperties.slice(0, 2).map((prop) => (
                <div
                  key={prop.id}
                  onClick={() => onNavigate(`/property/${prop.id}`)}
                  className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 transition cursor-pointer"
                >
                  <img
                    src={prop.images[0]}
                    alt={prop.title}
                    className="w-14 h-14 rounded-xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 truncate">{prop.title}</div>
                    <div className="text-[11px] text-emerald-800 font-extrabold mt-0.5">
                      PKR {prop.pricePKR.toLocaleString('en-PK')}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-400">
              No saved properties yet. Browse the marketplace and tap the heart icon.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
