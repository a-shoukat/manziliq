import React, { useState } from 'react';
import { Search, MapPin, Building2, Sparkles, ShieldCheck, CheckCircle2, ArrowRight, Layers, FileText } from 'lucide-react';

interface HeroSectionProps {
  onSearch: (filters: { city: string; society: string; plotSize: string; type: string }) => void;
  onOpenEstimator: () => void;
  onOpenMap: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch, onOpenEstimator, onOpenMap }) => {
  const [society, setSociety] = useState('all');
  const [plotSize, setPlotSize] = useState('all');
  const [type, setType] = useState('all');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ city: 'all', society, plotSize, type });
  };

  return (
    <div className="relative bg-white text-slate-900 overflow-hidden border-b border-slate-200">
      
      {/* Background Soft Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-40 -mt-20" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-300 rounded-full px-3.5 py-1 text-xs font-semibold text-amber-900">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Pakistan's Premier Real Estate & Society Portal</span>
              <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
                PUNJAB
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-[Outfit] tracking-tight leading-[1.15] text-slate-900">
              Digitizing Property Discovery & <span className="text-amber-600">Housing Societies</span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-base max-w-2xl font-normal leading-relaxed">
              Find verified plots, explore interactive society masterplans, calculate AI price estimates, track monthly installments, and generate legal allotment documents — all in one unified platform.
            </p>

            {/* Quick Feature Badges */}
            <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-700 pt-1">
              <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                100% LDA/TMA Verified
              </span>
              <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                Direct Easy Installments
              </span>
              <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                Instant PDF Allotment Letters
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenMap}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-5 py-3 rounded-xl shadow-md text-sm flex items-center gap-2 transition-all"
              >
                <Layers className="w-4 h-4" />
                <span>Interactive Plot Masterplan</span>
              </button>

              <button
                onClick={onOpenEstimator}
                className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold px-5 py-3 rounded-xl border border-slate-300 text-sm flex items-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>AI Price Valuation Tool</span>
              </button>
            </div>

          </div>

          {/* Right Column: Embedded Hero Search Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg font-[Outfit] text-slate-900 flex items-center gap-2">
                  <Search className="w-5 h-5 text-amber-600" />
                  <span>Find Your Ideal Plot</span>
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-200">
                  LIVE INVENTORY
                </span>
              </div>

              <form onSubmit={handleSearchSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Housing Society</label>
                  <select
                    value={society}
                    onChange={e => setSociety(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 shadow-2xs"
                  >
                    <option value="all">All Societies (Nationwide)</option>
                    <option value="Al-Rehman Garden">Al-Rehman Garden (Zafarwal Rd)</option>
                    <option value="Royal Orchard Housing">Royal Orchard (Muridke Rd)</option>
                    <option value="Model Town Greens">Model Town City Center</option>
                    <option value="Executive Enclave Shakargarh">Executive Enclave Shakargarh</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Plot Size</label>
                    <select
                      value={plotSize}
                      onChange={e => setPlotSize(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 shadow-2xs"
                    >
                      <option value="all">Any Size</option>
                      <option value="3">3 Marla</option>
                      <option value="5">5 Marla</option>
                      <option value="10">10 Marla</option>
                      <option value="20">1 Kanal (20 Marla)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Property Type</label>
                    <select
                      value={type}
                      onChange={e => setType(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 shadow-2xs"
                    >
                      <option value="all">Residential & Commercial</option>
                      <option value="plot">Plot / Land</option>
                      <option value="house">Constructed House</option>
                      <option value="commercial">Commercial Plaza Plot</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3 rounded-xl shadow-md text-sm flex items-center justify-center gap-2 transition-all mt-2"
                >
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  <span>Search Property Listings</span>
                </button>
              </form>

              {/* Stats Strip */}
              <div className="mt-5 pt-4 border-t border-slate-200 grid grid-cols-3 text-center text-xs">
                <div>
                  <span className="font-extrabold text-slate-900 text-base block font-[Outfit]">2,400+</span>
                  <span className="text-slate-500 text-[10px]">Total Plots</span>
                </div>
                <div>
                  <span className="font-extrabold text-amber-600 text-base block font-[Outfit]">PKR 85M+</span>
                  <span className="text-slate-500 text-[10px]">Bookings Logged</span>
                </div>
                <div>
                  <span className="font-extrabold text-emerald-600 text-base block font-[Outfit]">4 Societies</span>
                  <span className="text-slate-500 text-[10px]">Verified Ecosystem</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
