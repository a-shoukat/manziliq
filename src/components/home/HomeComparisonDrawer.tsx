import React, { useState } from 'react';
import { Property } from '../../types';
import { 
  X, 
  Layers, 
  ArrowRight, 
  Trash2, 
  ShieldCheck, 
  MapPin, 
  Building2, 
  Check, 
  CheckCircle2,
  Maximize2
} from 'lucide-react';
import { formatPKRNumber } from '../../utils/shareUtils';

interface HomeComparisonDrawerProps {
  selectedProperties: Property[];
  onRemoveProperty: (id: string) => void;
  onClearAll: () => void;
  onSelectProperty?: (id: string) => void;
}

export const HomeComparisonDrawer: React.FC<HomeComparisonDrawerProps> = ({
  selectedProperties,
  onRemoveProperty,
  onClearAll,
  onSelectProperty,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (selectedProperties.length === 0) return null;

  return (
    <>
      {/* 1. Sticky Bottom Comparison Drawer */}
      <div 
        id="home-comparison-sticky-bar"
        className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[96%] sm:w-[95%] max-w-4xl bg-slate-900/95 backdrop-blur-md border border-slate-700 text-white rounded-2xl sm:rounded-3xl shadow-2xl p-2.5 sm:p-4 animate-in slide-in-from-bottom-6 duration-300"
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          
          {/* Left: Indicator & Selected Property Chips */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] sm:text-xs font-bold text-slate-200">
                Compare ({selectedProperties.length}/6)
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {selectedProperties.map(prop => (
                <div 
                  key={prop.id}
                  className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2 py-1 shrink-0"
                >
                  <img 
                    src={prop.images[0]} 
                    alt={prop.title} 
                    className="w-6 h-6 rounded-lg object-cover" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-left max-w-[90px] sm:max-w-[110px]">
                    <div className="text-[10px] sm:text-[11px] font-bold truncate text-white">{prop.title}</div>
                    <div className="text-[9px] sm:text-[10px] font-mono text-emerald-400 font-bold truncate">
                      PKR {prop.pricePKR.toLocaleString('en-PK')}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveProperty(prop.id)}
                    className="p-0.5 text-slate-400 hover:text-red-400 transition cursor-pointer"
                    title="Remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Actions (Compare Now & Clear) */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-800">
            <button
              type="button"
              id="btn-clear-home-compare"
              onClick={onClearAll}
              className="p-1.5 text-slate-400 hover:text-slate-200 text-xs font-bold transition cursor-pointer flex items-center gap-1"
              title="Clear all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="text-[11px] sm:hidden">Clear</span>
            </button>
            <button
              type="button"
              id="btn-open-home-compare-modal"
              onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white text-xs font-extrabold shadow-lg transition cursor-pointer active:scale-95"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Compare Side-by-Side</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. Side-by-Side Comparison Full Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-5xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-900 text-amber-400 flex items-center justify-center font-black text-sm">
                  M
                </div>
                <div>
                  <h2 className="text-base font-extrabold font-[Outfit] text-slate-900">
                    Side-by-Side Property Comparison Matrix
                  </h2>
                  <p className="text-xs text-slate-500">
                    Evaluating {selectedProperties.length} selected properties across core specifications
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="btn-close-home-compare-modal"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comparison Table Content */}
            <div className="p-6 overflow-y-auto overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                <thead>
                  <tr>
                    <th className="p-3 bg-slate-100 font-extrabold text-slate-700 border-b border-slate-300 w-1/4 rounded-tl-xl">
                      Comparison Spec
                    </th>
                    {selectedProperties.map(prop => (
                      <th key={prop.id} className="p-3 bg-slate-50 border-b border-slate-300 w-1/4">
                        <div className="space-y-2">
                          <img 
                            src={prop.images[0]} 
                            alt={prop.title} 
                            className="w-full h-32 rounded-xl object-cover" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="font-bold text-slate-900 line-clamp-1">{prop.title}</div>
                          <div className="text-sm font-black font-[Outfit] text-blue-900">
                            PKR {prop.pricePKR.toLocaleString('en-PK')}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {/* Row: Property ID */}
                  <tr>
                    <td className="p-3 bg-slate-50 font-bold text-slate-600">Property ID</td>
                    {selectedProperties.map(p => (
                      <td key={p.id} className="p-3 font-mono font-bold text-slate-900">
                        {p.propertyId || p.id}
                      </td>
                    ))}
                  </tr>

                  {/* Row: Location & Society */}
                  <tr>
                    <td className="p-3 bg-slate-50 font-bold text-slate-600">Location & Society</td>
                    {selectedProperties.map(p => (
                      <td key={p.id} className="p-3 text-slate-700">
                        <div className="font-semibold">{p.societyName || 'Independent'}</div>
                        <div className="text-slate-500 text-[11px]">{p.location}</div>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Size */}
                  <tr>
                    <td className="p-3 bg-slate-50 font-bold text-slate-600">Size & Area</td>
                    {selectedProperties.map(p => (
                      <td key={p.id} className="p-3 font-bold text-slate-900">
                        {p.sizeMarla} Marla ({p.sizeSqFt || p.sizeMarla * 225} Sq. Ft.)
                      </td>
                    ))}
                  </tr>

                  {/* Row: Demand Price */}
                  <tr>
                    <td className="p-3 bg-slate-50 font-bold text-slate-600">Total Price</td>
                    {selectedProperties.map(p => (
                      <td key={p.id} className="p-3">
                        <div className="font-black text-slate-900 font-mono">
                          PKR {p.pricePKR.toLocaleString('en-PK')}
                        </div>
                        <div className="text-[11px] font-bold text-emerald-800">
                          {formatPKRNumber(p.pricePKR)}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Price Per Marla */}
                  <tr>
                    <td className="p-3 bg-slate-50 font-bold text-slate-600">Rate / Marla</td>
                    {selectedProperties.map(p => (
                      <td key={p.id} className="p-3 font-bold text-slate-700 font-mono">
                        PKR {Math.round(p.pricePKR / (p.sizeMarla || 1)).toLocaleString('en-PK')}
                      </td>
                    ))}
                  </tr>

                  {/* Row: Status */}
                  <tr>
                    <td className="p-3 bg-slate-50 font-bold text-slate-600">Listing Status</td>
                    {selectedProperties.map(p => (
                      <td key={p.id} className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          p.listingStatus === 'sold' 
                            ? 'bg-slate-200 text-slate-800' 
                            : p.listingStatus === 'reserved' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {p.listingStatus || 'Available'}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Row: NOC Status */}
                  <tr>
                    <td className="p-3 bg-slate-50 font-bold text-slate-600">NOC & Legal Status</td>
                    {selectedProperties.map(p => (
                      <td key={p.id} className="p-3">
                        <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>LDA / TMA Approved</span>
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Sector & Plot */}
                  <tr>
                    <td className="p-3 bg-slate-50 font-bold text-slate-600">Sector & Block</td>
                    {selectedProperties.map(p => (
                      <td key={p.id} className="p-3 text-slate-700 font-medium">
                        {[p.sector, p.block, p.plotNumber ? `Plot #${p.plotNumber}` : ''].filter(Boolean).join(' - ') || 'Standard Zone'}
                      </td>
                    ))}
                  </tr>

                  {/* Row: Action */}
                  <tr>
                    <td className="p-3 bg-slate-50 font-bold text-slate-600">Action</td>
                    {selectedProperties.map(p => (
                      <td key={p.id} className="p-3">
                        <button
                          type="button"
                          onClick={() => {
                            setIsModalOpen(false);
                            if (onSelectProperty) onSelectProperty(p.id);
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs transition cursor-pointer text-center"
                        >
                          View Details
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
