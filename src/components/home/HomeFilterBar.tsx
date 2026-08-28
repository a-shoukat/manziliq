import React, { useState, useEffect } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  RotateCcw, 
  Building2, 
  MapPin, 
  DollarSign, 
  Layers,
  ChevronDown
} from 'lucide-react';
import { formatPKRNumber } from '../../utils/shareUtils';

export interface HomeFilterCriteria {
  searchTerm: string;
  city: string;
  category: string;
  minSizeMarla: number;
  maxSizeMarla: number;
  minPricePKR: number;
  maxPricePKR: number;
  statuses: string[];
}

interface HomeFilterBarProps {
  initialCriteria: HomeFilterCriteria;
  onFilterChange: (criteria: HomeFilterCriteria) => void;
  totalResultsCount: number;
  citiesList: string[];
}

export const HomeFilterBar: React.FC<HomeFilterBarProps> = ({
  initialCriteria,
  onFilterChange,
  totalResultsCount,
  citiesList,
}) => {
  const [localCriteria, setLocalCriteria] = useState<HomeFilterCriteria>(initialCriteria);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Debounce filter updates by 300ms for smooth client-side filtering
  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange(localCriteria);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [localCriteria, onFilterChange]);

  const handleStatusToggle = (status: string) => {
    setLocalCriteria(prev => {
      if (status === 'all') {
        return { ...prev, statuses: [] };
      }
      const exists = prev.statuses.includes(status);
      let newStatuses: string[];
      if (exists) {
        newStatuses = prev.statuses.filter(s => s !== status);
      } else {
        newStatuses = [...prev.statuses, status];
      }
      return { ...prev, statuses: newStatuses };
    });
  };

  const handleResetFilters = () => {
    const resetState: HomeFilterCriteria = {
      searchTerm: '',
      city: 'all',
      category: 'all',
      minSizeMarla: 0,
      maxSizeMarla: 30,
      minPricePKR: 0,
      maxPricePKR: 50000000,
      statuses: [],
    };
    setLocalCriteria(resetState);
  };

  const isFiltered = 
    localCriteria.searchTerm !== '' ||
    localCriteria.city !== 'all' ||
    localCriteria.category !== 'all' ||
    localCriteria.minSizeMarla > 0 ||
    localCriteria.maxSizeMarla < 30 ||
    localCriteria.minPricePKR > 0 ||
    localCriteria.maxPricePKR < 50000000 ||
    localCriteria.statuses.length > 0;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-4 sm:p-6 space-y-4">
      {/* 1. Primary Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* Search Keyword */}
        <div className="lg:col-span-4 relative">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
            Search Location / Title / ID
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              id="input-home-search-keyword"
              placeholder="e.g. Al-Rehman, 5 Marla, Villa..."
              value={localCriteria.searchTerm}
              onChange={(e) => setLocalCriteria({ ...localCriteria, searchTerm: e.target.value })}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition"
            />
          </div>
        </div>

        {/* City Dropdown */}
        <div className="lg:col-span-3">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
            City / District
          </label>
          <div className="relative">
            <select
              id="select-home-filter-city"
              value={localCriteria.city}
              onChange={(e) => setLocalCriteria({ ...localCriteria, city: e.target.value })}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition appearance-none cursor-pointer"
            >
              <option value="all">All Cities in Pakistan</option>
              {citiesList.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Property Category */}
        <div className="lg:col-span-3">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
            Property Category
          </label>
          <div className="relative">
            <select
              id="select-home-filter-category"
              value={localCriteria.category}
              onChange={(e) => setLocalCriteria({ ...localCriteria, category: e.target.value })}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition appearance-none cursor-pointer"
            >
              <option value="all">All Property Categories</option>
              <option value="plot">Plots & Land Files</option>
              <option value="house">Houses & Luxury Villas</option>
              <option value="commercial">Commercial Plazas & Shops</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Advanced Filters & Reset Toggle */}
        <div className="lg:col-span-2 flex items-end gap-2">
          <button
            type="button"
            id="btn-toggle-advanced-filters"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
              showAdvanced || isFiltered
                ? 'bg-blue-50 border-blue-200 text-blue-900' 
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showAdvanced ? 'Hide Filters' : 'More Filters'}</span>
          </button>
        </div>
      </div>

      {/* 2. Status Chips Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mr-1">
            Status:
          </span>
          <button
            type="button"
            onClick={() => handleStatusToggle('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              localCriteria.statuses.length === 0
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Listings
          </button>
          {['available', 'reserved', 'sold'].map(status => {
            const isSelected = localCriteria.statuses.includes(status);
            return (
              <button
                key={status}
                type="button"
                onClick={() => handleStatusToggle(status)}
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                  isSelected
                    ? status === 'available' ? 'bg-emerald-600 text-white' : status === 'reserved' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>

        {/* Results Counter & Reset Action */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700">
            Showing <span className="text-blue-900 font-extrabold">{totalResultsCount}</span> properties
          </span>
          {isFiltered && (
            <button
              type="button"
              id="btn-reset-home-filters"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Advanced Expandable Drawer (Plot Size Slider & Dual-Handle Price Range) */}
      {showAdvanced && (
        <div className="pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/70 p-4 rounded-2xl animate-in fade-in duration-200">
          
          {/* Plot Size Range Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-900" />
                <span>Max Plot Size: {localCriteria.maxSizeMarla} Marla</span>
              </span>
              <span className="text-slate-500 font-normal text-[11px]">
                ({localCriteria.maxSizeMarla * 225} sq. ft.)
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={30}
              step={1}
              value={localCriteria.maxSizeMarla}
              onChange={(e) => setLocalCriteria({ ...localCriteria, maxSizeMarla: Number(e.target.value) })}
              className="w-full accent-blue-900 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
              <span>3 Marla</span>
              <span>5 Marla</span>
              <span>10 Marla</span>
              <span>20 Marla</span>
              <span>30+ Marla</span>
            </div>
          </div>

          {/* Price Range Slider / Dual Handles */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Budget Cap: PKR {localCriteria.maxPricePKR.toLocaleString('en-PK')}</span>
              </span>
              <span className="text-emerald-700 font-extrabold text-[11px]">
                {formatPKRNumber(localCriteria.maxPricePKR)}
              </span>
            </div>
            <input
              type="range"
              min={1000000}
              max={50000000}
              step={500000}
              value={localCriteria.maxPricePKR}
              onChange={(e) => setLocalCriteria({ ...localCriteria, maxPricePKR: Number(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
              <span>10 Lakh</span>
              <span>50 Lakh</span>
              <span>1.5 Crore</span>
              <span>3 Crore</span>
              <span>5 Crore+</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
