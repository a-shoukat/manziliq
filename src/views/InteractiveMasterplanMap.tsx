import React, { useState } from 'react';
import { Plot, Society } from '../types';
import { MapPin, Building2, CheckCircle2, Info, ArrowRight, ShieldCheck, Layers, Eye } from 'lucide-react';

interface InteractiveMasterplanMapProps {
  plots: Plot[];
  societies: Society[];
  onSelectPlotToBook: (plot: Plot) => void;
  onOpenInquiry: (plot: Plot) => void;
}

export const InteractiveMasterplanMap: React.FC<InteractiveMasterplanMapProps> = ({
  plots,
  societies,
  onSelectPlotToBook,
  onOpenInquiry
}) => {
  const [selectedSocietyId, setSelectedSocietyId] = useState<string>(societies[0]?.id || 'soc-1');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [activePlot, setActivePlot] = useState<Plot | null>(plots[0] || null);
  const [activeViewMode, setActiveViewMode] = useState<'masterplan' | 'google_map'>('masterplan');

  const currentSociety = societies.find(s => s.id === selectedSocietyId) || societies[0];
  const societyPlots = plots.filter(p => p.societyId === selectedSocietyId);

  const filteredPlots = societyPlots.filter(p => {
    if (selectedSector !== 'all' && p.sector !== selectedSector) return false;
    return true;
  });

  const availableCount = societyPlots.filter(p => p.status === 'available').length;
  const reservedCount = societyPlots.filter(p => p.status === 'reserved').length;
  const soldCount = societyPlots.filter(p => p.status === 'sold').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header & Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-900 shadow-sm space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-2.5 py-0.5 rounded border border-emerald-200">
                Interactive Plot Layout
              </span>
              <span className="text-slate-500 text-xs hidden sm:inline">Click any plot block to inspect live availability</span>
            </div>
            <h2 className="text-2xl font-black font-[Outfit] text-slate-900 mt-1">{currentSociety.name} — Masterplan</h2>
            <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>{currentSociety.location}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveViewMode('masterplan')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeViewMode === 'masterplan'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Interactive Plot Grid
            </button>
            <button
              onClick={() => setActiveViewMode('google_map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeViewMode === 'google_map'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Google Map View
            </button>
          </div>
        </div>

        {/* Society Selector & Legend Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs font-semibold text-slate-700">Switch Society:</label>
            <select
              value={selectedSocietyId}
              onChange={e => {
                setSelectedSocietyId(e.target.value);
                const first = plots.find(p => p.societyId === e.target.value);
                if (first) setActivePlot(first);
              }}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-amber-500"
            >
              {societies.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.district})</option>
              ))}
            </select>
          </div>

          {/* Color Legend */}
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500 border border-emerald-600" />
              <span>Available ({availableCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500 border border-amber-600" />
              <span>Reserved ({reservedCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500 border border-rose-600" />
              <span>Sold ({soldCount})</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Masterplan Container */}
      {activeViewMode === 'masterplan' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Plot Visual Grid View (8 Cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-800">
                Sector A & B Plot Layout Map ({filteredPlots.length} Plots Displayed)
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">Click plot box to inspect & book</span>
            </div>

            {/* Interactive Plot Matrix Grid */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 min-h-[340px] flex items-center justify-center relative overflow-hidden">
              
              {/* Background Road & Amenity Markings */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 bg-amber-100/80 border-y border-amber-300 flex items-center justify-center text-[10px] font-extrabold text-amber-900 tracking-widest uppercase">
                100 FT MAIN BOULEVARD (ENTRY GATE)
              </div>

              <div className="grid grid-cols-5 gap-3 w-full max-w-xl z-10 py-6">
                {filteredPlots.map(plot => {
                  const isSelected = activePlot?.id === plot.id;

                  let statusBg = 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100';
                  if (plot.status === 'reserved') statusBg = 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100';
                  if (plot.status === 'sold') statusBg = 'bg-rose-50 border-rose-200 text-rose-800 opacity-60';

                  if (isSelected) {
                    statusBg += ' ring-2 ring-amber-500 scale-105 shadow-md';
                  }

                  return (
                    <button
                      key={plot.id}
                      onClick={() => setActivePlot(plot)}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center min-h-[85px] ${statusBg}`}
                    >
                      <span className="text-xs font-black font-mono">{plot.plotNumber}</span>
                      <span className="text-[10px] font-bold mt-1 opacity-90">{plot.sizeMarla} Marla</span>
                      <span className="text-[9px] uppercase tracking-wider font-semibold mt-0.5">
                        {plot.status}
                      </span>
                    </button>
                  );
                })}
              </div>

            </div>

            <p className="text-[11px] text-slate-500 text-center italic">
              All plots listed above are georeferenced against society boundary layout across the masterplan.
            </p>

          </div>

          {/* Active Plot Details Panel (4 Cols) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 text-slate-900 shadow-sm space-y-4 sticky top-24">
            {activePlot ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-2 py-0.5 rounded border border-amber-200 uppercase">
                      Selected Plot Details
                    </span>
                    <h3 className="text-xl font-black font-[Outfit] text-slate-900 mt-1">Plot {activePlot.plotNumber}</h3>
                    <p className="text-xs text-slate-500">{activePlot.sector} • {activePlot.block}</p>
                  </div>

                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                    activePlot.status === 'available' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    activePlot.status === 'reserved' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                    'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}>
                    {activePlot.status}
                  </span>
                </div>

                {/* Price Spec Box */}
                <div className="bg-slate-50 p-3.5 rounded-xl space-y-2 border border-slate-200">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Total Price:</span>
                    <span className="text-base font-black text-amber-700 font-[Outfit]">
                      PKR {activePlot.pricePKR.toLocaleString('en-PK')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">20% Down Payment:</span>
                    <span className="font-bold text-slate-900">
                      PKR {activePlot.downPaymentPKR.toLocaleString('en-PK')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Monthly Installment ({activePlot.installmentMonths}m):</span>
                    <span className="font-bold text-emerald-700">
                      PKR {activePlot.monthlyInstallmentPKR.toLocaleString('en-PK')} / mo
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200">
                    <span className="text-slate-600">Dimensions:</span>
                    <span className="font-mono text-slate-900 font-bold">{activePlot.dimensions} ({activePlot.sizeSqFt} Sq Ft)</span>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1">Plot Highlights:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activePlot.features.map((f, i) => (
                      <span key={i} className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  {activePlot.status === 'available' ? (
                    <button
                      onClick={() => onSelectPlotToBook(activePlot)}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3 rounded-xl shadow-md text-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <span>Book Plot {activePlot.plotNumber} Online</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-slate-100 text-slate-400 font-bold py-2.5 rounded-xl text-xs cursor-not-allowed border border-slate-200"
                    >
                      Plot Currently {activePlot.status.toUpperCase()}
                    </button>
                  )}

                  <button
                    onClick={() => onOpenInquiry(undefined, activePlot)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-2 rounded-xl text-xs font-semibold border border-slate-200 transition-colors"
                  >
                    Inquire Dealer Regarding This Plot
                  </button>
                </div>

              </div>
            ) : (
              <p className="text-slate-500 text-xs text-center py-8">Select a plot block on the masterplan map to view details.</p>
            )}
          </div>

        </div>
      ) : (
        /* Google Maps View Tab */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-900 shadow-sm space-y-4">
          <h3 className="font-bold text-base font-[Outfit]">Google Maps Geolocation — {currentSociety.name}</h3>
          <p className="text-xs text-slate-600">{currentSociety.location}</p>

          <div className="w-full h-96 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative">
            <iframe
              title="Society Masterplan Map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={`https://maps.google.com/maps?q=Lahore,Punjab,Pakistan&t=&z=13&ie=UTF8&iwloc=&output=embed`}
            />
          </div>
        </div>
      )}

    </div>
  );
};
