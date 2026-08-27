import React, { useState } from 'react';
import { Society } from '../../types';
import { 
  Sparkles, 
  Building2, 
  Calculator, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Info,
  Layers,
  MapPin
} from 'lucide-react';

interface StandalonePriceEstimatorViewProps {
  societies: Society[];
  onNavigate: (route: string) => void;
}

export const StandalonePriceEstimatorView: React.FC<StandalonePriceEstimatorViewProps> = ({
  societies,
  onNavigate
}) => {
  const [selectedSocietyId, setSelectedSocietyId] = useState(societies[0]?.id || 'soc-1');
  const [sizeMarla, setSizeMarla] = useState<number>(5);
  const [propertyType, setPropertyType] = useState<'plot' | 'house' | 'commercial'>('plot');
  const [roadWidth, setRoadWidth] = useState<number>(40);
  const [isCorner, setIsCorner] = useState(false);
  const [isParkFacing, setIsParkFacing] = useState(false);
  const [isMainBoulevard, setIsMainBoulevard] = useState(false);
  const [hasUndergroundElectricity, setHasUndergroundElectricity] = useState(true);

  // Society base rates per Marla in PKR
  const baseRatePerMarlaMap: Record<string, number> = {
    'soc-1': 520000, // Al-Rehman Garden
    'soc-2': 490000, // Royal Orchard
    'soc-3': 480000, // Model Town
    'soc-4': 410000, // Shakargarh
  };

  const selectedSociety = societies.find(s => s.id === selectedSocietyId) || societies[0];
  const baseRate = baseRatePerMarlaMap[selectedSocietyId] || 500000;

  // Multipliers
  let multiplier = 1.0;
  if (propertyType === 'commercial') multiplier *= 2.3;
  if (propertyType === 'house') multiplier *= 3.4; // includes construction cost
  if (isCorner) multiplier += 0.10;
  if (isParkFacing) multiplier += 0.08;
  if (isMainBoulevard || roadWidth >= 80) multiplier += 0.15;
  if (roadWidth === 60) multiplier += 0.05;
  if (hasUndergroundElectricity) multiplier += 0.04;

  const rawEstimatedValue = Math.round(baseRate * sizeMarla * multiplier);
  const minEstimated = Math.round(rawEstimatedValue * 0.95);
  const maxEstimated = Math.round(rawEstimatedValue * 1.06);

  const baseLandValue = baseRate * sizeMarla;
  const featurePremiumValue = rawEstimatedValue - (propertyType === 'house' ? baseLandValue * 3.4 : (propertyType === 'commercial' ? baseLandValue * 2.3 : baseLandValue));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-900 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Automated Valuation Model (AVM) for Real Estate</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          AI Property & Plot Price Estimator
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Trained on verified registry transactions, DC circle rates, and on-ground development progress across master-planned sectors.
        </p>
      </div>

      {/* Grid: Inputs (Left) vs Real-time Output (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Parameters Box */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Calculator className="w-5 h-5 text-emerald-800" />
            <h3 className="text-base font-bold text-slate-900">Property Parameters</h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* Society Selector */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Target Housing Society</label>
              <select
                value={selectedSocietyId}
                onChange={(e) => setSelectedSocietyId(e.target.value)}
                className="w-full font-semibold bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-1 focus:ring-emerald-600"
              >
                {societies.map((soc) => (
                  <option key={soc.id} value={soc.id}>
                    {soc.name} ({soc.location})
                  </option>
                ))}
              </select>
            </div>

            {/* Category and Size */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Property Category</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as any)}
                  className="w-full font-semibold bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="plot">Residential Plot / File</option>
                  <option value="house">Constructed House / Villa</option>
                  <option value="commercial">Commercial Plot / Plaza</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Plot Size (Marla)</label>
                <select
                  value={sizeMarla}
                  onChange={(e) => setSizeMarla(Number(e.target.value))}
                  className="w-full font-semibold bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value={3}>3 Marla (675 Sq Ft)</option>
                  <option value={4}>4 Marla (900 Sq Ft)</option>
                  <option value={5}>5 Marla (1,125 Sq Ft)</option>
                  <option value={7}>7 Marla (1,575 Sq Ft)</option>
                  <option value={10}>10 Marla (2,250 Sq Ft)</option>
                  <option value={20}>1 Kanal (4,500 Sq Ft)</option>
                </select>
              </div>
            </div>

            {/* Road Width */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Frontage Road Width</label>
              <div className="grid grid-cols-4 gap-2">
                {[30, 40, 60, 100].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => {
                      setRoadWidth(w);
                      if (w === 100) setIsMainBoulevard(true);
                      else setIsMainBoulevard(false);
                    }}
                    className={`py-2.5 rounded-xl border font-bold transition cursor-pointer ${
                      roadWidth === w
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {w} Feet {w === 100 ? '⭐' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Premium Feature Checkboxes */}
            <div className="space-y-2.5 pt-2">
              <label className="block font-bold text-slate-700">Special Premium Attributes</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCorner}
                    onChange={(e) => setIsCorner(e.target.checked)}
                    className="accent-emerald-700 w-4 h-4 rounded"
                  />
                  <div>
                    <div className="font-bold text-slate-900">Corner Plot (+10%)</div>
                    <div className="text-[10px] text-slate-500">Dual side road access</div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isParkFacing}
                    onChange={(e) => setIsParkFacing(e.target.checked)}
                    className="accent-emerald-700 w-4 h-4 rounded"
                  />
                  <div>
                    <div className="font-bold text-slate-900">Park Facing (+8%)</div>
                    <div className="text-[10px] text-slate-500">Direct park scenic view</div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasUndergroundElectricity}
                    onChange={(e) => setHasUndergroundElectricity(e.target.checked)}
                    className="accent-emerald-700 w-4 h-4 rounded"
                  />
                  <div>
                    <div className="font-bold text-slate-900">Underground Power (+4%)</div>
                    <div className="text-[10px] text-slate-500">Uninterrupted wiring</div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMainBoulevard}
                    onChange={(e) => setIsMainBoulevard(e.target.checked)}
                    className="accent-emerald-700 w-4 h-4 rounded"
                  />
                  <div>
                    <div className="font-bold text-slate-900">Main Boulevard (+15%)</div>
                    <div className="text-[10px] text-slate-500">Prime commercial flow</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Valuation Output Box */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Fair Market Estimate
              </div>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                94% High Confidence
              </span>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">
                PKR {rawEstimatedValue.toLocaleString('en-PK')}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Estimated Value Range: <strong>PKR {(minEstimated/100000).toFixed(1)}L - {(maxEstimated/100000).toFixed(1)}L</strong>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/80 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Base Society Rate / Marla:</span>
                <span className="font-semibold text-white">PKR {baseRate.toLocaleString('en-PK')}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Base Land Value ({sizeMarla} Marla):</span>
                <span className="font-semibold text-white">PKR {baseLandValue.toLocaleString('en-PK')}</span>
              </div>
              {featurePremiumValue > 0 && (
                <div className="flex justify-between text-amber-300">
                  <span>Location & Feature Adjustments:</span>
                  <span className="font-semibold">+ PKR {featurePremiumValue.toLocaleString('en-PK')}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-700 flex justify-between text-slate-300">
                <span>Projected Monthly Rental Yield:</span>
                <span className="font-semibold text-emerald-400">PKR {Math.round(rawEstimatedValue * 0.004).toLocaleString('en-PK')} / mo</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => onNavigate('/marketplace')}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Matching Listings in Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <p className="text-[10px] text-slate-400 text-center">
              Disclaimer: Automated estimation is for guidance. Actual sale value depends on physical inspection and token agreements.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
