import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Calculator, 
  Building2, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  Info, 
  ArrowRight,
  Layers,
  MapPin,
  Cpu,
  BarChart3,
  Flame,
  Zap,
  Home,
  Check,
  RotateCcw
} from 'lucide-react';
import { priceEstimatorService, PriceEstimateResponse, PricePredictionPayload } from '../../services/priceEstimatorService';
import { ModelPerformanceModal } from './ModelPerformanceModal';

interface SocietyOption {
  id?: string;
  name: string;
  location?: string;
}

interface AiPriceEstimatorWidgetProps {
  societies?: SocietyOption[];
  onNavigate?: (route: string) => void;
  initialSociety?: string;
  initialAreaMarla?: number;
  initialPropertyType?: 'residential_plot' | 'commercial_plot' | 'constructed_house' | 'plot_file';
  compact?: boolean;
}

export const AiPriceEstimatorWidget: React.FC<AiPriceEstimatorWidgetProps> = ({
  societies = [
    { name: 'Al-Rehman Garden', location: 'Circular Road, Narowal' },
    { name: 'Royal Orchard', location: 'Zafarwal Road, Narowal' },
    { name: 'Model Town', location: 'Katchehry Road, Narowal' },
    { name: 'Executive City', location: 'New Bypass, Narowal' },
    { name: 'Shakargarh Road Enclave', location: 'Shakargarh Highway, Narowal' },
    { name: 'Zafarwal Mega City', location: 'Zafarwal Road, Narowal' }
  ],
  onNavigate,
  initialSociety,
  initialAreaMarla = 5,
  initialPropertyType = 'residential_plot',
  compact = false
}) => {
  // Form State
  const [propertyType, setPropertyType] = useState<'residential_plot' | 'commercial_plot' | 'constructed_house' | 'plot_file'>(initialPropertyType);
  const [areaSize, setAreaSize] = useState<number>(initialAreaMarla);
  const [unit, setUnit] = useState<'marla' | 'sqft'>('marla');
  const [bedrooms, setBedrooms] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(3);
  const [society, setSociety] = useState<string>(initialSociety || societies[0]?.name || 'Al-Rehman Garden');
  
  // Specific Location Flags
  const [isCorner, setIsCorner] = useState<boolean>(false);
  const [isParkFacing, setIsParkFacing] = useState<boolean>(false);
  const [isMainBoulevard, setIsMainBoulevard] = useState<boolean>(false);

  // Amenities
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Underground Electricity',
    'Sui Gas Connection',
    '24/7 Gated Security',
    'Water Filtration Plant'
  ]);

  // Nearby Facilities
  const [schoolKm, setSchoolKm] = useState<number>(1.2);
  const [hospitalKm, setHospitalKm] = useState<number>(2.5);
  const [marketKm, setMarketKm] = useState<number>(0.8);

  // Execution & Loading States
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PriceEstimateResponse | null>(null);
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState<boolean>(false);

  // Calculate area in Marla for standardized API transmission
  const effectiveAreaMarla = unit === 'sqft' ? Number((areaSize / 225).toFixed(2)) : Number(areaSize);

  const availableAmenities = [
    { id: 'Underground Electricity', label: 'Underground Electricity', icon: Zap },
    { id: 'Sui Gas Connection', label: 'Sui Gas Connection', icon: Flame },
    { id: '24/7 Gated Security', label: '24/7 Gated Security', icon: ShieldCheck },
    { id: 'Water Filtration Plant', label: 'Water Supply & Filtration', icon: Sparkles },
    { id: 'Sewerage & Drainage', label: 'Sewerage & Drainage', icon: Layers },
    { id: 'Community Mosque & Center', label: 'Mosque & Community Center', icon: Home }
  ];

  const handleToggleAmenity = (name: string) => {
    if (selectedAmenities.includes(name)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== name));
    } else {
      setSelectedAmenities([...selectedAmenities, name]);
    }
  };

  const handlePredict = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    const payload: PricePredictionPayload = {
      property_type: propertyType,
      area_marla: effectiveAreaMarla,
      unit: 'marla',
      bedrooms: propertyType === 'constructed_house' ? bedrooms : 0,
      bathrooms: propertyType === 'constructed_house' ? bathrooms : 0,
      society,
      amenities: selectedAmenities,
      is_corner: isCorner,
      is_park_facing: isParkFacing,
      is_main_boulevard: isMainBoulevard,
      nearby_facilities: {
        school_km: schoolKm,
        hospital_km: hospitalKm,
        market_km: marketKm
      }
    };

    try {
      const response = await priceEstimatorService.estimatePrice(payload);
      setResult(response);
    } catch (err) {
      console.error('Valuation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Run initial prediction on mount
  useEffect(() => {
    handlePredict();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Top Banner / FYP Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              ML Valuation Microservice (FYP Module 8)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            AI Property & Plot Price Estimator
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl">
            Trained on Narowal Land Registry transactions, DC circle rates, and on-ground development metrics via Random Forest and XGBoost Regressors.
          </p>
        </div>

        {/* Actions on Top */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPerformanceModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition border border-slate-200 cursor-pointer active:scale-95 shadow-2xs"
            title="Inspect Linear Regression, Random Forest, and XGBoost MAE/RMSE/R² metrics"
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-700" />
            <span>Model Comparison & Accuracy</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form Inputs (Left) vs Output Prediction Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Form Column (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-800" />
              <h3 className="text-sm font-bold text-slate-900">Property Parameters</h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Step 1 of 2</span>
          </div>

          <form onSubmit={handlePredict} className="space-y-4">
            
            {/* 1. Property Type & Society */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as any)}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                >
                  <option value="residential_plot">Residential Plot</option>
                  <option value="commercial_plot">Commercial Plot</option>
                  <option value="constructed_house">Constructed House / Villa</option>
                  <option value="plot_file">Plot File / Affidavit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Housing Society / Location</label>
                <select
                  value={society}
                  onChange={(e) => setSociety(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                >
                  {societies.map((soc, idx) => (
                    <option key={`soc-${soc.name}-${idx}`} value={soc.name}>
                      {soc.name} {soc.location ? `(${soc.location})` : ''}
                    </option>
                  ))}
                  <option value="Model Town">Model Town, Narowal</option>
                  <option value="Shakargarh Road">Shakargarh Road Enclave</option>
                  <option value="Executive City">Executive City, Narowal</option>
                  <option value="Zafarwal Road">Zafarwal Road Sector</option>
                </select>
              </div>
            </div>

            {/* 2. Area Size with Marla / Sq Ft toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Area Dimension</label>
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      if (unit === 'sqft') setAreaSize(Math.round(areaSize / 225));
                      setUnit('marla');
                    }}
                    className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                      unit === 'marla' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Marla
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (unit === 'marla') setAreaSize(areaSize * 225);
                      setUnit('sqft');
                    }}
                    className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                      unit === 'sqft' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Sq Ft
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-5 relative">
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={areaSize}
                    onChange={(e) => setAreaSize(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-full text-sm font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                  />
                  <span className="absolute right-3 top-2.5 text-[11px] font-bold text-slate-400 uppercase">
                    {unit}
                  </span>
                </div>

                {/* Quick Presets for Marla */}
                <div className="sm:col-span-7 flex flex-wrap items-center gap-1.5">
                  {[3, 5, 7, 10, 20].map((mVal) => (
                    <button
                      key={mVal}
                      type="button"
                      onClick={() => {
                        setUnit('marla');
                        setAreaSize(mVal);
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        unit === 'marla' && areaSize === mVal
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                      }`}
                    >
                      {mVal === 20 ? '1 Kanal (20M)' : `${mVal} Marla`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Bedrooms & Bathrooms (Visible for Constructed House) */}
            {propertyType === 'constructed_house' && (
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl grid grid-cols-2 gap-3 animate-in fade-in">
                <div>
                  <label className="block text-xs font-bold text-emerald-950 mb-1">Bedrooms</label>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(parseInt(e.target.value))}
                    className="w-full text-xs font-bold bg-white border border-emerald-300 rounded-xl px-3 py-2 text-slate-900 outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map(b => (
                      <option key={b} value={b}>{b} Bedrooms</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-950 mb-1">Bathrooms</label>
                  <select
                    value={bathrooms}
                    onChange={(e) => setBathrooms(parseInt(e.target.value))}
                    className="w-full text-xs font-bold bg-white border border-emerald-300 rounded-xl px-3 py-2 text-slate-900 outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map(b => (
                      <option key={b} value={b}>{b} Bathrooms</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* 4. Location Attributes (Corner, Park Facing, Main Boulevard) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Location Orientation & Perks</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setIsCorner(!isCorner)}
                  className={`p-2.5 rounded-2xl border text-center transition cursor-pointer text-xs font-bold flex flex-col items-center gap-1 ${
                    isCorner 
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-xs' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {isCorner && <Check className="w-3 h-3 text-emerald-700" />}
                    <span>Corner Plot</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold">+10% Premium</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsParkFacing(!isParkFacing)}
                  className={`p-2.5 rounded-2xl border text-center transition cursor-pointer text-xs font-bold flex flex-col items-center gap-1 ${
                    isParkFacing 
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-xs' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {isParkFacing && <Check className="w-3 h-3 text-emerald-700" />}
                    <span>Park Facing</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold">+8% Premium</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsMainBoulevard(!isMainBoulevard)}
                  className={`p-2.5 rounded-2xl border text-center transition cursor-pointer text-xs font-bold flex flex-col items-center gap-1 ${
                    isMainBoulevard 
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-xs' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {isMainBoulevard && <Check className="w-3 h-3 text-emerald-700" />}
                    <span>Main Blvd (60ft+)</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold">+15% Premium</span>
                </button>
              </div>
            </div>

            {/* 5. Amenities Checkboxes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Essential Society Amenities</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableAmenities.map(amenity => {
                  const Icon = amenity.icon;
                  const isChecked = selectedAmenities.includes(amenity.id);
                  return (
                    <label
                      key={amenity.id}
                      onClick={() => handleToggleAmenity(amenity.id)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition select-none ${
                        isChecked 
                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-bold' 
                          : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition shrink-0 ${
                        isChecked ? 'bg-emerald-700 border-emerald-700 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <Icon className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{amenity.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 6. Nearby Facilities Proximity Sliders */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Nearby Facility Proximity (km)</span>
                <span className="text-[11px] text-slate-400 font-medium">Urban Accessibility</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                    <span>School</span>
                    <span className="font-mono text-emerald-800 font-bold">{schoolKm} km</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="5.0"
                    step="0.1"
                    value={schoolKm}
                    onChange={(e) => setSchoolKm(parseFloat(e.target.value))}
                    className="w-full accent-emerald-700 cursor-pointer"
                  />
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                    <span>Hospital</span>
                    <span className="font-mono text-emerald-800 font-bold">{hospitalKm} km</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="10.0"
                    step="0.5"
                    value={hospitalKm}
                    onChange={(e) => setHospitalKm(parseFloat(e.target.value))}
                    className="w-full accent-emerald-700 cursor-pointer"
                  />
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                    <span>Market</span>
                    <span className="font-mono text-emerald-800 font-bold">{marketKm} km</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="4.0"
                    step="0.1"
                    value={marketKm}
                    onChange={(e) => setMarketKm(parseFloat(e.target.value))}
                    className="w-full accent-emerald-700 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-700 to-blue-900 hover:from-emerald-800 hover:to-blue-950 text-white font-extrabold text-xs sm:text-sm shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Executing ML Prediction Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Calculate AI Property Valuation</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

        {/* Prediction Results Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {loading ? (
            /* Loading Skeleton */
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded-full w-1/3" />
              <div className="h-10 bg-slate-200 rounded-2xl w-3/4" />
              <div className="h-16 bg-slate-100 rounded-2xl" />
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-4 bg-slate-200 rounded w-5/6" />
                <div className="h-4 bg-slate-200 rounded w-4/6" />
              </div>
            </div>
          ) : result ? (
            /* Valuation Result Output */
            <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-slate-800 space-y-5 animate-in zoom-in-95 duration-200">
              
              {/* Header with Confidence Badge */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-300">Live AI Valuation</span>
                </div>

                {/* Confidence Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{result.confidence_score}% ({result.confidence_tier} Confidence)</span>
                </div>
              </div>

              {/* Big Estimated Price */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Estimated Market Value
                </span>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight font-mono">
                  {result.predicted_price_formatted}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Exact Estimate: PKR {result.predicted_price.toLocaleString('en-PK')}
                </div>
              </div>

              {/* Price Range Pill */}
              <div className="bg-slate-800/90 border border-slate-700/80 p-3.5 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Estimated Price Range</span>
                  <span className="font-bold text-amber-300">95% Confidence Band</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-100">
                  <span>{result.price_range.low_formatted}</span>
                  <span className="text-slate-500">↔</span>
                  <span>{result.price_range.high_formatted}</span>
                </div>
              </div>

              {/* Model Attribution */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  <span className="truncate">{result.model_used}</span>
                </div>
                <span className="text-emerald-400 font-mono font-bold">R²: {result.model_metrics.r2_score}</span>
              </div>

              {/* Valuation Breakdown */}
              <div className="space-y-2 text-xs pt-1 border-t border-slate-800/80">
                <div className="font-bold text-slate-300">Valuation Breakdown</div>
                
                <div className="flex justify-between text-slate-400">
                  <span>Base Land ({effectiveAreaMarla} Marla @ PKR {(result.valuation_breakdown.base_rate_per_marla / 1000).toFixed(0)}k):</span>
                  <span className="font-mono text-slate-200">PKR {result.valuation_breakdown.base_land_value.toLocaleString()}</span>
                </div>

                {result.valuation_breakdown.construction_cost > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Structure / Construction Cost:</span>
                    <span className="font-mono text-slate-200">PKR {result.valuation_breakdown.construction_cost.toLocaleString()}</span>
                  </div>
                )}

                {result.valuation_breakdown.location_premium > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Location Orientation Premium:</span>
                    <span className="font-mono">+PKR {result.valuation_breakdown.location_premium.toLocaleString()}</span>
                  </div>
                )}

                {result.valuation_breakdown.amenities_and_infra_bonus > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Amenities & Infrastructure Boost:</span>
                    <span className="font-mono">+PKR {result.valuation_breakdown.amenities_and_infra_bonus.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Mandatory Disclaimer */}
              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-start gap-2 text-[11px] text-amber-200/90 leading-relaxed">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{result.disclaimer}</span>
              </div>

              {/* Navigation CTAs */}
              {onNavigate && (
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('/marketplace')}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                  >
                    <span>Browse Matching Inventory</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

            </div>
          ) : null}

          {/* Quick FAQ / Info Box */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2.5 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-800" />
              <span>How are these valuations calculated?</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              ManzilIQ’s Valuation Microservice continuously ingests verified revenue registry records, District Collector (DC) assessment tables, and on-ground development progress to train nonlinear regressor models.
            </p>
          </div>

        </div>

      </div>

      {/* Model Performance Comparison Modal */}
      <ModelPerformanceModal
        isOpen={isPerformanceModalOpen}
        onClose={() => setIsPerformanceModalOpen(false)}
      />

    </div>
  );
};
