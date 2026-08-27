import React, { useState } from 'react';
import { Society, Plot } from '../../types';
import { 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  FileCheck2,
  ExternalLink
} from 'lucide-react';

interface SocietiesExplorerViewProps {
  societies: Society[];
  plots?: Plot[];
  onSelectSociety?: (id: string) => void;
  onNavigate: (route: string) => void;
}

export const SocietiesExplorerView: React.FC<SocietiesExplorerViewProps> = ({
  societies = [],
  plots = [],
  onSelectSociety,
  onNavigate
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenSociety = (id: string) => {
    if (onSelectSociety) {
      onSelectSociety(id);
    } else {
      onNavigate(`/society/${id}`);
    }
  };

  const filteredSocieties = (societies || []).filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.city && s.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Premier Housing Societies & Masterplans
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Verified master-planned communities with LDA / TMA approvals, SECP registration, and interactive plot maps.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search societies or areas..."
            className="w-full text-xs pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Societies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredSocieties.map((soc) => {
          const societyPlots = plots.filter(p => p.societyId === soc.id);
          const availableCount = societyPlots.filter(p => p.status === 'available').length;
          const reservedCount = societyPlots.filter(p => p.status === 'reserved').length;
          const soldCount = societyPlots.filter(p => p.status === 'sold').length;

          return (
            <div 
              key={soc.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition overflow-hidden flex flex-col group"
            >
              <div className="relative h-60 overflow-hidden bg-slate-900">
                <img 
                  src={soc.heroImage} 
                  alt={soc.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-900/90 text-white shadow-md">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    {soc.approvalStatus.toUpperCase()}
                  </span>
                </div>
                {soc.nocNumber && (
                  <div className="absolute bottom-3 right-3 bg-slate-950/85 backdrop-blur-xs text-xs font-mono text-amber-400 px-3 py-1 rounded-lg border border-slate-800">
                    NOC: {soc.nocNumber}
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-800 transition">
                    {soc.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{soc.location}</span>
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {soc.description}
                  </p>
                </div>

                {/* Plot stats banner */}
                <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Lots</div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">{soc.totalPlots}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-700 uppercase font-semibold">Available</div>
                    <div className="text-sm font-bold text-emerald-700 mt-0.5">{availableCount || soc.availablePlots}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-amber-700 uppercase font-semibold">Reserved</div>
                    <div className="text-sm font-bold text-amber-700 mt-0.5">{reservedCount || soc.reservedPlots}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Sold</div>
                    <div className="text-sm font-bold text-slate-700 mt-0.5">{soldCount || soc.soldPlots}</div>
                  </div>
                </div>

                {/* Amenities pills */}
                <div className="flex flex-wrap gap-1.5">
                  {(soc.amenities || []).slice(0, 4).map((a, i) => (
                    <span key={i} className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                      ✓ {a}
                    </span>
                  ))}
                  {(soc.amenities || []).length > 4 && (
                    <span className="text-[11px] font-medium text-slate-400 px-1 py-1">
                      +{(soc.amenities || []).length - 4} more
                    </span>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Downpayment: <strong className="text-slate-800">{soc.downPaymentPercent || 20}%</strong> • {soc.standardDurationMonths || 36} Mo. Plan
                  </div>
                  <button
                    onClick={() => handleOpenSociety(soc.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <span>Open Masterplan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
