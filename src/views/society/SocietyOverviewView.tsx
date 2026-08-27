import React from 'react';
import { User, Society, Plot, Booking, LotAssignment, DealerSocietyRelation } from '../../types';
import { SocietyBookingTrendsWidget } from '../../components/society/SocietyBookingTrendsWidget';
import { 
  Building2, 
  Layers, 
  CreditCard, 
  Users, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  DollarSign, 
  FileText,
  AlertTriangle,
  Plus,
  Upload,
  FileSpreadsheet,
  RotateCcw,
  Sparkles,
  PieChart,
  ChevronRight
} from 'lucide-react';

interface SocietyOverviewViewProps {
  currentUser: User;
  society: Society;
  plots: Plot[];
  bookings: Booking[];
  lotAssignments?: LotAssignment[];
  dealerRelations?: DealerSocietyRelation[];
  onNavigate: (route: string) => void;
  onOpenAddProperty?: () => void;
  onOpenCSVUpload?: () => void;
}

export const SocietyOverviewView: React.FC<SocietyOverviewViewProps> = ({
  currentUser,
  society,
  plots,
  bookings,
  lotAssignments = [],
  dealerRelations = [],
  onNavigate,
  onOpenAddProperty,
  onOpenCSVUpload
}) => {
  const societyPlots = plots.filter(p => p.societyId === society.id);
  const societyBookings = bookings.filter(b => b.societyName.includes(society.name.split(' ')[0]) || b.societyId === society.id);

  const availableCount = societyPlots.filter(p => p.status === 'available').length;
  const assignedCount = societyPlots.filter(p => p.status === 'assigned').length;
  const reservedCount = societyPlots.filter(p => p.status === 'reserved').length;
  const soldCount = societyPlots.filter(p => p.status === 'sold').length;
  const disputedCount = societyPlots.filter(p => p.status === 'disputed').length;

  const societyLots = lotAssignments.filter(l => l.societyId === society.id);
  const societyDealers = dealerRelations.filter(r => r.societyId === society.id);
  const approvedDealers = societyDealers.filter(r => r.status === 'approved');
  const pendingDealers = societyDealers.filter(r => r.status === 'pending');

  const totalRevenue = societyBookings.reduce((sum, b) => sum + (b.downPaymentPKR || 500000), 0);

  return (
    <div className="space-y-8">
      
      {/* Society Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>TMA / SECP Verified Housing Scheme • NOC: {society.nocNumber || 'TMA/NRL/2026/88'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {society.name} Operational Command
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Authorized Admin: <strong className="text-white">{currentUser.name}</strong> • Masterplan Scope: <strong className="text-emerald-300">{societyPlots.length} Demarcated Plots</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('/society/inventory')}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Manual Plot Entry</span>
          </button>

          <button
            onClick={() => onNavigate('/society/inventory')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>CSV / Excel Upload</span>
          </button>

          <button
            onClick={() => onNavigate('/society/dealers')}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Lot Assignment Desk
          </button>
        </div>
      </div>

      {/* 4 Primary Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Plot Inventory */}
        <div 
          onClick={() => onNavigate('/society/inventory')}
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-emerald-500 transition cursor-pointer flex items-center justify-between group"
        >
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Demarcated Inventory</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{societyPlots.length} Plots</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">{availableCount} Available • {assignedCount} In Lots</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white flex items-center justify-center transition">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Dealer Management & Lots */}
        <div 
          onClick={() => onNavigate('/society/dealers')}
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-teal-500 transition cursor-pointer flex items-center justify-between group"
        >
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Authorized Dealers & Lots</div>
            <div className="text-2xl font-black text-teal-900 mt-1">{approvedDealers.length || 4} Dealers</div>
            <div className="text-[11px] text-teal-700 font-semibold mt-0.5">{societyLots.length} Active Lots Allocated</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 group-hover:bg-teal-700 group-hover:text-white flex items-center justify-center transition">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Booking Queue */}
        <div 
          onClick={() => onNavigate('/society/approvals')}
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-blue-500 transition cursor-pointer flex items-center justify-between group"
        >
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Booking Approvals</div>
            <div className="text-2xl font-black text-blue-900 mt-1">{societyBookings.length} In Queue</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{reservedCount} Token Advance Inflows</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 group-hover:bg-blue-700 group-hover:text-white flex items-center justify-center transition">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Escrow Realization */}
        <div 
          onClick={() => onNavigate('/society/financials')}
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-purple-500 transition cursor-pointer flex items-center justify-between group"
        >
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Downpayment Escrow</div>
            <div className="text-2xl font-black text-emerald-950 mt-1">PKR {(totalRevenue / 1000000).toFixed(1)}M</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Realized Installments</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 group-hover:bg-purple-700 group-hover:text-white flex items-center justify-center transition">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Proportional Inventory Status Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="font-bold text-slate-800 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-700" />
            <span>Masterplan Plot Allocation Spectrum</span>
          </div>
          <button 
            onClick={() => onNavigate('/society/inventory')}
            className="text-emerald-800 font-bold hover:underline"
          >
            Explore Block-Wise Inventory &rarr;
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div 
            style={{ width: `${societyPlots.length ? (availableCount / societyPlots.length) * 100 : 40}%` }} 
            className="bg-emerald-500 h-full" 
            title={`Available: ${availableCount}`}
          />
          <div 
            style={{ width: `${societyPlots.length ? (assignedCount / societyPlots.length) * 100 : 20}%` }} 
            className="bg-teal-500 h-full" 
            title={`Assigned to Dealer: ${assignedCount}`}
          />
          <div 
            style={{ width: `${societyPlots.length ? (reservedCount / societyPlots.length) * 100 : 15}%` }} 
            className="bg-amber-500 h-full" 
            title={`Reserved: ${reservedCount}`}
          />
          <div 
            style={{ width: `${societyPlots.length ? (soldCount / societyPlots.length) * 100 : 20}%` }} 
            className="bg-blue-600 h-full" 
            title={`Sold Out: ${soldCount}`}
          />
          <div 
            style={{ width: `${societyPlots.length ? (disputedCount / societyPlots.length) * 100 : 5}%` }} 
            className="bg-rose-500 h-full" 
            title={`Disputed: ${disputedCount}`}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-[11px] pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600">Available: <strong>{availableCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
            <span className="text-slate-600">Assigned Lots: <strong>{assignedCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-600">Reserved: <strong>{reservedCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span className="text-slate-600">Sold: <strong>{soldCount}</strong></span>
          </div>
          {disputedCount > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-slate-600">Disputed: <strong>{disputedCount}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* 6-Month Booking Trends Line Chart Widget */}
      <SocietyBookingTrendsWidget
        society={society}
        bookings={bookings}
        plots={plots}
      />

      {/* Two Columns: Recent Dealer Lots & Booking Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Module 4: Dealer Lot Allocations */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-800" />
              <span>Dealer Lots (Single-Broker Exclusivity)</span>
            </h3>
            <button
              onClick={() => onNavigate('/society/dealers')}
              className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
            >
              Lot Assignment Desk &rarr;
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {societyLots.slice(0, 3).map(lot => (
              <div
                key={lot.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between"
              >
                <div>
                  <div className="font-mono font-bold text-slate-900">{lot.lotNumber}</div>
                  <div className="text-slate-500 text-[11px]">
                    {lot.dealerName} • {lot.plotNumbers.length} Plots in {lot.block}
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                    {lot.status}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">Exp: {lot.expiryDate}</div>
                </div>
              </div>
            ))}

            {societyLots.length === 0 && (
              <div className="p-6 text-center text-slate-400">
                No active lots allocated yet.
              </div>
            )}
          </div>
        </div>

        {/* Pending Booking Approvals */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700" />
              <span>Pending Booking Queue ({societyBookings.length})</span>
            </h3>
            <button
              onClick={() => onNavigate('/society/approvals')}
              className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
            >
              Open Approvals Queue &rarr;
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {societyBookings.slice(0, 3).map(b => (
              <div
                key={b.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="font-bold text-slate-900">Plot {b.plotNumber} — {b.buyerName}</div>
                  <div className="text-slate-500 text-[11px]">
                    Token: PKR {b.tokenAdvancePKR?.toLocaleString('en-PK')} • Stage {b.pipelineStage}/6
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('/society/approvals')}
                  className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold cursor-pointer"
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
