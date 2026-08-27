import React from 'react';
import { User, Plot, Property, Booking } from '../../types';
import { 
  Building2, 
  Users, 
  Layers, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Phone, 
  ShieldCheck, 
  PlusCircle, 
  Award,
  AlertTriangle,
  Mic,
  Sparkles
} from 'lucide-react';
import { VoicePropertyListingModal } from '../../components/properties/VoicePropertyListingModal';

interface DealerOverviewViewProps {
  currentUser: User;
  plots: Plot[];
  properties: Property[];
  bookings: Booking[];
  societies?: any[];
  onNavigate: (route: string) => void;
  onOpenAddProperty?: () => void;
  onAddProperty?: (property: Property, plotData?: Partial<Plot>) => void;
}

export const DealerOverviewView: React.FC<DealerOverviewViewProps> = ({
  currentUser,
  plots,
  properties,
  bookings,
  societies = [],
  onNavigate,
  onOpenAddProperty,
  onAddProperty
}) => {
  const [isVoiceModalOpen, setIsVoiceModalOpen] = React.useState(false);

  // Assigned plots to this dealer
  const assignedPlots = plots.filter(p => p.dealerId === currentUser.id);
  const dealerListings = properties.filter(p => p.dealerId === currentUser.id);

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Authorized Realtor • Punjab Real Estate License #REA-NRL-2026-99</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {currentUser.name}
          </h1>
          <p className="text-xs text-slate-300">
            Assigned Society Lots: <strong>{assignedPlots.length} Plots</strong> (One-Plot-One-Dealer Enforced) • Rating: <strong>4.9/5 ⭐</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 rounded-xl text-xs font-black transition shadow-xs hover:shadow-md cursor-pointer flex items-center gap-2 group active:scale-95"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950"></span>
            </span>
            <Mic className="w-4 h-4 text-slate-950 group-hover:scale-110 transition" />
            <span>Add by Voice</span>
          </button>
          <button
            onClick={onOpenAddProperty || (() => onNavigate('/properties/add'))}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Property</span>
          </button>
          <button
            onClick={() => onNavigate('/dealer/listings')}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4" />
            <span>Manage Listings</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Exclusive Lots</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{assignedPlots.length} Plots</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">Al-Rehman & Royal Orchard</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Leads</div>
            <div className="text-2xl font-black text-blue-700 mt-1">12 Hot Leads</div>
            <div className="text-[11px] text-slate-500 mt-0.5">3 Site Visits Scheduled</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Closed Volume</div>
            <div className="text-2xl font-black text-emerald-900 mt-1">PKR 14.8M</div>
            <div className="text-[11px] text-slate-500 mt-0.5">4 Confirmed Token Deals</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Commission Earned</div>
            <div className="text-2xl font-black text-amber-800 mt-1">PKR 296,000</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">2.0% Standard Payout</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Quick Access Pipeline & Enforcement Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: One-Plot-One-Dealer Verification Badge */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Award className="w-5 h-5 text-emerald-800" />
            <h3 className="text-base font-bold text-slate-900">One-Plot-One-Dealer Lock</h3>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Strict Anti-Poaching Rule Active</span>
            </div>
            <p className="leading-relaxed">
              Every plot assigned to you by housing society admins cannot be relisted or sold by any other dealer, eliminating commission disputes and double-booking scams across societies.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/dealer/assigned-lots')}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Manage Assigned Society Lots</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Quick Hot Leads Callbacks */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-800" />
              <span>Today's Urgent Client Callbacks</span>
            </h3>
            <button
              onClick={() => onNavigate('/dealer/crm')}
              className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
            >
              Open Full CRM &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Muhammad Farooq', phone: '+92 300 8472910', interest: 'Plot 42-A (5 Marla Executive)', status: 'Site Visit at 4:00 PM', urgency: 'High' },
              { name: 'Dr. Kamran Akmal', phone: '+92 321 4455667', interest: '10 Marla Corner Commercial', status: 'Wants Token Invoice PDF', urgency: 'Urgent' },
              { name: 'Zeeshan Haider', phone: '+92 333 1122334', interest: '7 Marla Villa Model Town', status: 'Requested Price Negotiation', urgency: 'Medium' }
            ].map((lead, i) => (
              <div
                key={i}
                className="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">{lead.name}</div>
                  <div className="text-slate-500">{lead.interest} • <span className="text-emerald-800 font-semibold">{lead.status}</span></div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white rounded-xl font-bold cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                  <a
                    href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition cursor-pointer"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Voice Property Listing Modal */}
      <VoicePropertyListingModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        currentUser={currentUser}
        societies={societies}
        plots={plots}
        onAddProperty={(prop, plotData) => {
          if (onAddProperty) {
            onAddProperty(prop, plotData);
          }
        }}
      />

    </div>
  );
};
