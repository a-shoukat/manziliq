import React from 'react';
import { User, Society, Property, Booking, Plot } from '../../types';
import { 
  ShieldCheck, 
  Building2, 
  Users, 
  AlertTriangle, 
  Scale, 
  FileCheck2, 
  Activity, 
  ArrowRight, 
  TrendingUp, 
  Lock,
  Layers,
  Plus,
  PlusCircle
} from 'lucide-react';

interface SuperAdminOverviewViewProps {
  currentUser: User;
  societies: Society[];
  properties: Property[];
  bookings: Booking[];
  plots: Plot[];
  onNavigate: (route: string) => void;
  onOpenAddProperty?: () => void;
}

export const SuperAdminOverviewView: React.FC<SuperAdminOverviewViewProps> = ({
  currentUser,
  societies,
  properties,
  bookings,
  plots,
  onNavigate,
  onOpenAddProperty
}) => {
  const duplicateProperties = properties.filter(p => p.isDuplicateFlagged);
  const disputedPlots = plots.filter(p => p.isDisputed);

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Platform Super Admin • Real Estate & Municipal Oversight</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Governance & Executive Control Center
          </h1>
          <p className="text-xs text-slate-300">
            Authorized Officer: <strong>{currentUser.name}</strong> ({currentUser.email})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenAddProperty || (() => onNavigate('/properties/add'))}
            className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
            title="Add New Property Listing"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Property</span>
          </button>
          <button
            onClick={() => onNavigate('/admin/verification-queue')}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Review Pending Queue (2)</span>
          </button>
        </div>
      </div>

      {/* 4 Super Admin Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Housing Societies</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{societies.length} Projects</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">100% TMA Verified</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Bookings GMV</div>
            <div className="text-2xl font-black text-emerald-900 mt-1">PKR 48.2M</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{bookings.length} Token Agreements</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Duplicate Flags</div>
            <div className="text-2xl font-black text-amber-700 mt-1">{duplicateProperties.length} Detected</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Auto-Filtered from public</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Title Disputes</div>
            <div className="text-2xl font-black text-rose-700 mt-1">{disputedPlots.length} Case Active</div>
            <div className="text-[11px] text-rose-600 font-semibold mt-0.5">Plot 12-A Frozen</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Two Columns: Verification Queue Quick Action & Dispute Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Verification Queue Preview */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-purple-700" />
              <span>Pending Credentials Verification Queue</span>
            </h3>
            <button
              onClick={() => onNavigate('/admin/verification-queue')}
              className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
            >
              Open Full Queue &rarr;
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { applicant: 'Bismillah Estate & Builders', type: 'Dealer License', doc: 'REA-NRL-2026-42', date: 'Today' },
              { applicant: 'Al-Haram City', type: 'Society Developer', doc: 'TMA NOC Submission #99', date: 'Yesterday' }
            ].map((item, i) => (
              <div
                key={i}
                className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900">{item.applicant}</div>
                  <div className="text-slate-500 text-[11px]">{item.type} • {item.doc}</div>
                </div>
                <button
                  onClick={() => onNavigate('/admin/verification-queue')}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-xl font-bold cursor-pointer"
                >
                  Review Docs
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Dispute & Anti-Fraud Center */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-rose-600" />
              <span>Title Disputes & Mediation Desk</span>
            </h3>
            <button
              onClick={() => onNavigate('/admin/disputes')}
              className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
            >
              Manage Disputes &rarr;
            </button>
          </div>

          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 text-xs text-rose-950">
            <div className="font-bold flex items-center gap-1.5 text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Active Case: Plot 12-A (Sector A, Al-Rehman Garden)</span>
            </div>
            <p className="text-rose-800 leading-relaxed">
              Dispute logged regarding overlapping boundary demarcations between adjacent allottees. Plot has been automatically locked from marketplace booking until Super Admin arbitration deed is filed.
            </p>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => onNavigate('/admin/disputes')}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer"
              >
                Arbitrate Dispute Case
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
