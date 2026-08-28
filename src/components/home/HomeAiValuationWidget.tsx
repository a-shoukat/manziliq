import React, { useState } from 'react';
import { Society, PricePredictionInput, PricePredictionResult } from '../../types';
import { calculateAIPriceEstimate } from '../../utils/aiEstimator';
import { 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Building2, 
  ArrowRight, 
  Layers, 
  MapPin, 
  Calculator,
  CheckCircle2,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { formatPKRNumber } from '../../utils/shareUtils';

interface HomeAiValuationWidgetProps {
  societies: Society[];
  onOpenFullEstimator?: () => void;
}

export const HomeAiValuationWidget: React.FC<HomeAiValuationWidgetProps> = ({
  societies,
  onOpenFullEstimator,
}) => {
  // Pre-filled demo defaults
  const [societyName, setSocietyName] = useState<string>('Al-Rehman Garden');
  const [propertyType, setPropertyType] = useState<string>('residential_plot');
  const [areaMarla, setAreaMarla] = useState<number>(5);
  const [locationCategory, setLocationCategory] = useState<'prime_main_road' | 'corner_plot' | 'park_facing' | 'standard'>('standard');
  const [bedrooms, setBedrooms] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(3);
  
  // Loading & Result States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState<PricePredictionResult | null>(() => {
    return calculateAIPriceEstimate({
      societyName: 'Al-Rehman Garden',
      propertyType: 'residential_plot',
      areaMarla: 5,
      locationCategory: 'standard',
      amenities: ['underground_electricity', 'gated_security', 'carpeted_roads'],
      bedrooms: 0,
      bathrooms: 0
    });
  });

  const handleEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate realistic AI heuristic model inference delay
    setTimeout(() => {
      const input: PricePredictionInput = {
        societyName,
        propertyType: propertyType as any,
        areaMarla,
        locationCategory: locationCategory,
        amenities: ['underground_electricity', 'gated_security', 'carpeted_roads'],
        bedrooms: propertyType === 'constructed_house' ? bedrooms : 0,
        bathrooms: propertyType === 'constructed_house' ? bathrooms : 0
      };

      const result = calculateAIPriceEstimate(input);
      setPredictionResult(result);
      setIsLoading(false);
    }, 450);
  };

  return (
    <div className="relative text-white rounded-3xl p-6 sm:p-10 border border-slate-700/80 shadow-2xl overflow-hidden">
      {/* High-Resolution Architectural & Smart City Backdrop Image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1600"
          alt="Modern Architectural Smart City"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105"
        />
        {/* Deep Slate/Blue Overlay for crystal clear typography */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-blue-950/92 to-slate-900/95 backdrop-blur-[2px]" />
      </div>

      {/* Background radial accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="relative z-10 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Property Valuation Engine</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-[Outfit] tracking-tight">
              AI Market Price Estimator
            </h2>
            <p className="text-sm text-slate-300 max-w-xl">
              Input plot dimensions, housing society, and road position to compute verified fair market estimates based on historical registries and development indices.
            </p>
          </div>

          {onOpenFullEstimator && (
            <button
              type="button"
              id="btn-open-full-estimator"
              onClick={onOpenFullEstimator}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition cursor-pointer"
            >
              <span>Explore Advanced Multi-Factor Model</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Interactive Estimator Form + Live Result Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Form (7 Cols) */}
          <form onSubmit={handleEstimate} className="lg:col-span-7 bg-white/5 backdrop-blur-md p-5 sm:p-7 rounded-2xl border border-white/10 space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Society Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Housing Society
                </label>
                <select
                  id="select-ai-society"
                  value={societyName}
                  onChange={(e) => setSocietyName(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="Al-Rehman Garden">Al-Rehman Garden (Lahore)</option>
                  <option value="Royal Orchard Housing">Royal Orchard Housing (Lahore/Isb)</option>
                  <option value="Model Town Greens">Model Town Greens (Rawalpindi)</option>
                  <option value="Executive Enclave Heights">Executive Enclave (Shakargarh)</option>
                  <option value="General Market Society">Other LDA/TMA Approved Society</option>
                </select>
              </div>

              {/* Property Category */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Property Category
                </label>
                <select
                  id="select-ai-category"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="residential_plot">Residential Plot</option>
                  <option value="constructed_house">Constructed Luxury Villa</option>
                  <option value="commercial_plot">Commercial Plaza / Plot</option>
                  <option value="plot_file">Affidavit / Balloting File</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Area in Marla */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Plot Size (Marla): <span className="text-amber-400 font-mono font-bold">{areaMarla} Marla</span> ({areaMarla * 225} sq. ft.)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={3}
                    max={20}
                    step={1}
                    value={areaMarla}
                    onChange={(e) => setAreaMarla(Number(e.target.value))}
                    className="flex-1 accent-amber-400 cursor-pointer h-2 bg-slate-700 rounded-lg"
                  />
                  <input
                    type="number"
                    min={3}
                    max={50}
                    value={areaMarla}
                    onChange={(e) => setAreaMarla(Math.max(1, Number(e.target.value)))}
                    className="w-16 text-center text-xs font-bold bg-slate-800 border border-slate-700 rounded-lg py-1.5 text-white"
                  />
                </div>
              </div>

              {/* Road / Location Premium */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Position / Facing Premium
                </label>
                <select
                  id="select-ai-location-pos"
                  value={locationCategory}
                  onChange={(e) => setLocationCategory(e.target.value as any)}
                  className="w-full text-xs font-semibold bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="standard">Standard Sector (30-40ft Road)</option>
                  <option value="prime_main_road">Main Boulevard (60-100ft Wide)</option>
                  <option value="corner_plot">Corner Plot Position (+15%)</option>
                  <option value="park_facing">Park Facing (+12%)</option>
                </select>
              </div>
            </div>

            {/* If Constructed House */}
            {propertyType === 'constructed_house' && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    className="w-full text-xs font-semibold bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={bathrooms}
                    onChange={(e) => setBathrooms(Number(e.target.value))}
                    className="w-full text-xs font-semibold bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              id="btn-trigger-ai-estimate"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg cursor-pointer active:scale-95 disabled:opacity-75"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Computing Heuristic Model...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Calculate AI Valuation Estimate</span>
                </>
              )}
            </button>
          </form>

          {/* Right Result Card (5 Cols) with Skeleton Loading State */}
          <div className="lg:col-span-5 space-y-4">
            {isLoading ? (
              /* Loading Skeleton */
              <div className="bg-slate-800/60 backdrop-blur-md p-6 rounded-2xl border border-slate-700/80 space-y-4 animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-1/3" />
                <div className="h-10 bg-slate-700 rounded w-3/4" />
                <div className="space-y-2 pt-4 border-t border-slate-700">
                  <div className="h-3 bg-slate-700 rounded w-full" />
                  <div className="h-3 bg-slate-700 rounded w-5/6" />
                  <div className="h-3 bg-slate-700 rounded w-2/3" />
                </div>
              </div>
            ) : predictionResult ? (
              /* Calculated Result */
              <div className="bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl border border-slate-700 text-xs space-y-4 shadow-xl">
                
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Fair Market Valuation</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                    {predictionResult.confidenceScore}% Model Confidence
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Estimated Market Price</div>
                  <div className="text-2xl sm:text-3xl font-black font-[Outfit] text-white font-mono">
                    PKR {predictionResult.estimatedPricePKR.toLocaleString('en-PK')}
                  </div>
                  <div className="text-xs font-bold text-amber-400">
                    {formatPKRNumber(predictionResult.estimatedPricePKR)}
                  </div>
                </div>

                {/* Range Band */}
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/60 space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Expected Range Band:</span>
                    <span className="text-slate-200 font-mono">
                      PKR {(predictionResult.minPricePKR / 100000).toFixed(1)}L - {(predictionResult.maxPricePKR / 100000).toFixed(1)}L
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full w-4/5 rounded-full mx-auto" />
                  </div>
                </div>

                {/* Factors Breakdown */}
                <div className="space-y-2 pt-2 border-t border-slate-700/80 text-[11px]">
                  <div className="font-bold text-slate-300">Valuation Drivers:</div>
                  {predictionResult.influencingFactors.map((f, i) => (
                    <div key={i} className="flex items-center justify-between text-slate-300">
                      <span className="truncate max-w-[200px]">{f.factor}</span>
                      <span className="font-bold text-white font-mono shrink-0">{f.percentage}</span>
                    </div>
                  ))}
                </div>

              </div>
            ) : null}
          </div>

        </div>

      </div>
    </div>
  );
};
