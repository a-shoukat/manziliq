import React, { useState } from 'react';
import { PricePredictionInput, PricePredictionResult, Society } from '../types';
import { calculateAIPriceEstimate } from '../utils/aiEstimator';
import { Sparkles, Calculator, CheckCircle2, TrendingUp, Info, ShieldCheck, ArrowRight } from 'lucide-react';

interface AiPriceEstimatorViewProps {
  societies: Society[];
}

export const AiPriceEstimatorView: React.FC<AiPriceEstimatorViewProps> = ({ societies }) => {
  const [propertyType, setPropertyType] = useState<PricePredictionInput['propertyType']>('residential_plot');
  const [areaMarla, setAreaMarla] = useState<number>(5);
  const [bedrooms, setBedrooms] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(3);
  const [societyName, setSocietyName] = useState<string>(societies[0]?.name || 'Al-Rehman Garden');
  const [locationCategory, setLocationCategory] = useState<PricePredictionInput['locationCategory']>('corner_plot');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['Underground Electricity', 'Gated Security', 'Park Facing']);

  const [predictionResult, setPredictionResult] = useState<PricePredictionResult>(() =>
    calculateAIPriceEstimate({
      propertyType: 'residential_plot',
      areaMarla: 5,
      bedrooms: 3,
      bathrooms: 3,
      societyName: societies[0]?.name || 'Al-Rehman Garden',
      locationCategory: 'corner_plot',
      amenities: ['Underground Electricity', 'Gated Security', 'Park Facing']
    })
  );

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const result = calculateAIPriceEstimate({
      propertyType,
      areaMarla,
      bedrooms,
      bathrooms,
      societyName,
      locationCategory,
      amenities: selectedAmenities
    });
    setPredictionResult(result);
  };

  const toggleAmenity = (a: string) => {
    if (selectedAmenities.includes(a)) {
      setSelectedAmenities(selectedAmenities.filter(x => x !== a));
    } else {
      setSelectedAmenities([...selectedAmenities, a]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-900 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span className="bg-amber-100 text-amber-800 font-bold text-xs px-2.5 py-0.5 rounded border border-amber-300">
              ML Valuation Engine
            </span>
          </div>
          <h2 className="text-2xl font-black font-[Outfit] text-slate-900 mt-1">AI Property Price Valuation Engine</h2>
          <p className="text-xs text-slate-500">
            Real-time heuristic pricing model calibrated using verified provincial Development Authority & benchmark sales datasets.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-right">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Market Benchmark</span>
          <span className="text-sm font-black text-emerald-700 font-[Outfit]">PKR 450k – 650k / Marla</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Column (6 Cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-500" />
            <span>Property Input Specification</span>
          </h3>

          <form onSubmit={handleCalculate} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Property Category</label>
                <select
                  value={propertyType}
                  onChange={e => setPropertyType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                >
                  <option value="residential_plot">Residential Plot</option>
                  <option value="commercial_plot">Commercial Plot</option>
                  <option value="constructed_house">Constructed House</option>
                  <option value="plot_file">Plot File / Allocation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Area Size (Marla)</label>
                <select
                  value={areaMarla}
                  onChange={e => setAreaMarla(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                >
                  <option value={3}>3 Marla (675 Sq Ft)</option>
                  <option value={5}>5 Marla (1,125 Sq Ft)</option>
                  <option value={7}>7 Marla (1,575 Sq Ft)</option>
                  <option value={10}>10 Marla (2,250 Sq Ft)</option>
                  <option value={20}>1 Kanal (4,500 Sq Ft)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Housing Society / Sector</label>
              <select
                value={societyName}
                onChange={e => setSocietyName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              >
                {societies.map(s => (
                  <option key={s.id} value={s.name}>{s.name} ({s.location})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Plot Location Premium</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'standard', label: 'Standard Plot' },
                  { id: 'corner_plot', label: 'Corner Plot (+15%)' },
                  { id: 'park_facing', label: 'Park Facing (+12%)' },
                  { id: 'prime_main_road', label: 'Main Boulevard (+35%)' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLocationCategory(item.id as any)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border text-left transition-all ${
                      locationCategory === item.id
                        ? 'bg-amber-500 text-slate-950 border-amber-500'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {propertyType === 'constructed_house' && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bedrooms</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={bedrooms}
                    onChange={e => setBedrooms(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bathrooms</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={bathrooms}
                    onChange={e => setBathrooms(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Amenities (Value Drivers)</label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Underground Electricity',
                  'Gated Security',
                  'Park Facing',
                  'Commercial Zone Access',
                  'Gas Connection'
                ].map((a, i) => {
                  const active = selectedAmenities.includes(a);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleAmenity(a)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                        active
                          ? 'bg-slate-900 text-amber-400 border-slate-900'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}{a}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3 rounded-xl shadow-lg text-xs flex items-center justify-center gap-2 transition-all mt-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Run AI Valuation Analysis</span>
            </button>

          </form>
        </div>

        {/* Prediction Results Card (6 Cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 text-slate-900 shadow-sm space-y-6 sticky top-24">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block">Valuation Output</span>
              <h3 className="text-xl font-black font-[Outfit] text-slate-900">Estimated Fair Market Value</h3>
            </div>

            <div className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{predictionResult.confidenceScore}% Confidence</span>
            </div>
          </div>

          {/* Big Estimated Price Banner */}
          <div className="bg-amber-50/70 border border-amber-200 p-5 rounded-2xl text-center space-y-1 relative overflow-hidden">
            <span className="text-xs text-slate-600 font-semibold block">Estimated Price</span>
            <span className="text-3xl sm:text-4xl font-black font-[Outfit] text-amber-800 block">
              PKR {predictionResult.estimatedPricePKR.toLocaleString('en-PK')}
            </span>

            <div className="pt-2 flex items-center justify-center gap-4 text-xs font-medium text-slate-700">
              <span>Min Range: <strong className="text-slate-900">PKR {predictionResult.minPricePKR.toLocaleString('en-PK')}</strong></span>
              <span>•</span>
              <span>Max Range: <strong className="text-slate-900">PKR {predictionResult.maxPricePKR.toLocaleString('en-PK')}</strong></span>
            </div>
          </div>

          {/* Rate per Marla & Market Demand */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Society Avg Rate / Marla</span>
              <span className="text-sm font-bold text-slate-900 font-mono">
                PKR {predictionResult.avgMarlaRatePKR.toLocaleString('en-PK')}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Buyer Demand Velocity</span>
              <span className="text-sm font-bold text-emerald-700 flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>{predictionResult.marketDemand}</span>
              </span>
            </div>
          </div>

          {/* Influencing Factor Breakdown */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Key Value Driving Factors</h4>
            <div className="space-y-2">
              {predictionResult.influencingFactors.map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span className="text-slate-800 font-medium">{item.factor}</span>
                  </div>
                  <span className="font-bold text-amber-800 font-mono">{item.percentage}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
