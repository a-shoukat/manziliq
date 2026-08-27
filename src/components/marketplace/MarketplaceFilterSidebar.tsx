import React, { useState } from 'react';
import { Society, Property } from '../../types';
import { 
  Filter, 
  RotateCcw, 
  DollarSign, 
  Maximize2, 
  Sparkles, 
  Check, 
  Building2, 
  Home, 
  ShieldCheck, 
  Search, 
  X, 
  ChevronDown, 
  ChevronUp,
  Flame,
  Zap,
  Shield,
  Compass,
  TreePine,
  Layers,
  FileCheck,
  CreditCard,
  Droplets,
  Car,
  CheckCircle2,
  Tag
} from 'lucide-react';

export interface MarketplaceFilters {
  searchQuery: string;
  selectedCity?: string;
  selectedArea?: string;
  selectedSociety: string;
  selectedBlock?: string;
  selectedType: string;
  selectedCategory?: string;
  selectedSector?: string;
  selectedRoadWidth?: string;
  selectedStatus?: string;
  inventoryMode?: 'all' | 'plots' | 'properties';
  verifiedOnly?: boolean;
  minPrice: number;
  maxPrice: number;
  minMarla: number;
  maxMarla: number;
  selectedMarlaPill: string; // 'all', '3', '5', '7', '10', '20', '40', 'custom'
  selectedBedrooms: string;
  selectedAmenities: string[];
  amenityMatchMode: 'any' | 'all';
  installmentsOnly: boolean;
  featuredOnly: boolean;
  possessionReadyOnly: boolean;
}

export const CITY_OPTIONS = [
  { id: 'all', label: 'All Cities' },
  { id: 'Lahore', label: 'Lahore' },
  { id: 'Islamabad', label: 'Islamabad' },
  { id: 'Rawalpindi', label: 'Rawalpindi' },
  { id: 'Faisalabad', label: 'Faisalabad' },
  { id: 'Karachi', label: 'Karachi' },
  { id: 'Shakargarh', label: 'Shakargarh' },
  { id: 'Zafarwal', label: 'Zafarwal' },
  { id: 'Lahore', label: 'Lahore Division' }
];

export const BLOCK_OPTIONS = [
  { id: 'all', label: 'All Blocks' },
  { id: 'Executive', label: 'Executive Block' },
  { id: 'Commercial', label: 'Commercial Broadway' },
  { id: 'Rose Block', label: 'Rose Block' },
  { id: 'Overseas', label: 'Overseas Block' },
  { id: 'Block A', label: 'Block A' },
  { id: 'Block B', label: 'Block B' }
];

export const STATUS_FILTER_OPTIONS = [
  { id: 'all', label: 'All Statuses' },
  { id: 'available', label: 'Available Only (Green)' },
  { id: 'reserved', label: 'Reserved (Yellow)' },
  { id: 'sold', label: 'Sold (Gray)' }
];

export const COMMON_AMENITIES_CONFIG = [
  { id: 'gas', label: 'Sui Gas / Gas Line', icon: Flame, keywords: ['gas', 'sui gas', 'gas meter', 'gas connection'] },
  { id: 'electricity', label: 'Underground Electricity', icon: Zap, keywords: ['electricity', 'underground', '3-phase', 'power'] },
  { id: 'security', label: '24/7 Gated Security & CCTV', icon: Shield, keywords: ['security', 'cctv', 'gated', 'guard', 'surveillance'] },
  { id: 'boulevard', label: 'Main Boulevard Access', icon: Compass, keywords: ['boulevard', 'main road', '100ft', '80ft', '60ft', '50ft', '40ft'] },
  { id: 'park', label: 'Parks & Green Belts', icon: TreePine, keywords: ['park', 'green belt', 'park facing', 'landscape', 'garden'] },
  { id: 'corner', label: 'Corner / Open Plot', icon: Layers, keywords: ['corner', 'west open', 'open', 'double road'] },
  { id: 'noc', label: 'TMA / LDA Approved NOC', icon: FileCheck, keywords: ['noc', 'approved', 'lda', 'tma', 'secp'] },
  { id: 'water', label: 'Water Filtration Plant', icon: Droplets, keywords: ['water', 'clean water', 'filtration', 'tank'] },
  { id: 'parking', label: 'Car Porch / Garage', icon: Car, keywords: ['porch', 'car', 'garage', 'parking'] }
];

export const MARLA_PRESETS = [
  { id: 'all', label: 'All Sizes', min: 0, max: 100 },
  { id: '3', label: '3 Marla', min: 2.5, max: 3.5 },
  { id: '5', label: '5 Marla', min: 4.5, max: 5.5 },
  { id: '7', label: '7 Marla', min: 6.5, max: 7.5 },
  { id: '10', label: '10 Marla', min: 9.5, max: 10.5 },
  { id: '20', label: '1 Kanal (20M)', min: 18, max: 22 },
  { id: '40', label: '2+ Kanal', min: 38, max: 200 }
];

export const PRICE_TIERS = [
  { label: 'All Budgets', min: 0, max: 50000000 },
  { label: '< 25 Lacs', min: 0, max: 2500000 },
  { label: '25 – 50 Lacs', min: 2500000, max: 5000000 },
  { label: '50 Lacs – 1 Cr', min: 5000000, max: 10000000 },
  { label: '1 – 2.5 Crore', min: 10000000, max: 25000000 },
  { label: '2.5+ Crore', min: 25000000, max: 50000000 }
];

export const CATEGORY_OPTIONS = [
  { id: 'all', label: 'All Categories' },
  { id: 'Residential Plot', label: 'Residential Plots' },
  { id: 'Villa / House', label: 'Constructed Houses / Villas' },
  { id: 'Commercial Plot', label: 'Commercial Plots' },
  { id: 'Commercial Plaza', label: 'Commercial Plazas' }
];

export const SECTOR_OPTIONS = [
  { id: 'all', label: 'All Sectors' },
  { id: 'Sector A', label: 'Sector A' },
  { id: 'Sector B', label: 'Sector B' },
  { id: 'Central Zone', label: 'Central Zone' },
  { id: 'Highway Front', label: 'Highway Front' }
];

export const ROAD_WIDTH_OPTIONS = [
  { id: 'all', label: 'Any Road Width' },
  { id: '30', label: '30 ft+ Standard' },
  { id: '40', label: '40 ft+ Sector Road' },
  { id: '50', label: '50 ft+ Wide Avenue' },
  { id: '60', label: '60 ft+ Boulevard' },
  { id: '80', label: '80 ft+ Main Boulevard' }
];

interface MarketplaceFilterSidebarProps {
  filters: MarketplaceFilters;
  onFilterChange: <K extends keyof MarketplaceFilters>(key: K, value: MarketplaceFilters[K]) => void;
  onResetFilters: () => void;
  societies: Society[];
  allProperties: Property[];
  matchingCount: number;
  totalCount: number;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const MarketplaceFilterSidebar: React.FC<MarketplaceFilterSidebarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  societies,
  allProperties,
  matchingCount,
  totalCount,
  isMobileDrawer = false,
  onCloseMobileDrawer
}) => {
  // Collapsible accordion sections
  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
    size: true,
    society: true,
    sectorRoad: true,
    amenities: true,
    additional: true
  });

  const [amenitySearch, setAmenitySearch] = useState('');

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Dynamic counts for societies
  const societyCounts: Record<string, number> = (societies || []).reduce((acc: Record<string, number>, s) => {
    acc[s.id] = (allProperties || []).filter(p => p.societyId === s.id).length;
    return acc;
  }, {});

  // Dynamic counts for types
  const typeCounts = {
    all: (allProperties || []).length,
    plot: (allProperties || []).filter(p => p.type === 'plot').length,
    house: (allProperties || []).filter(p => p.type === 'house').length,
    commercial: (allProperties || []).filter(p => p.type === 'commercial').length
  };

  // Dynamic counts for categories
  const categoryCounts: Record<string, number> = CATEGORY_OPTIONS.reduce((acc: Record<string, number>, cat) => {
    if (cat.id === 'all') {
      acc[cat.id] = (allProperties || []).length;
    } else {
      acc[cat.id] = (allProperties || []).filter(p => p.category === cat.id).length;
    }
    return acc;
  }, {});

  // Dynamic counts for sectors
  const sectorCounts: Record<string, number> = SECTOR_OPTIONS.reduce((acc: Record<string, number>, sec) => {
    if (sec.id === 'all') {
      acc[sec.id] = (allProperties || []).length;
    } else {
      acc[sec.id] = (allProperties || []).filter(p => p.sector === sec.id).length;
    }
    return acc;
  }, {});

  // Dynamic counts for sizes
  const marlaCounts: Record<string, number> = MARLA_PRESETS.reduce((acc: Record<string, number>, preset) => {
    if (preset.id === 'all') {
      acc[preset.id] = (allProperties || []).length;
    } else {
      acc[preset.id] = (allProperties || []).filter(p => p.sizeMarla >= preset.min && p.sizeMarla <= preset.max).length;
    }
    return acc;
  }, {});

  // Dynamic counts for amenities
  const amenityCounts: Record<string, number> = COMMON_AMENITIES_CONFIG.reduce((acc: Record<string, number>, am) => {
    acc[am.id] = (allProperties || []).filter(p => {
      const allText = [...(p.amenities || []), p.description || '', p.title || '', ...(p.type === 'house' ? ['house'] : [])].join(' ').toLowerCase();
      return am.keywords.some(kw => allText.includes(kw));
    }).length;
    return acc;
  }, {});

  const handleMarlaPresetClick = (presetId: string) => {
    const preset = MARLA_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    onFilterChange('selectedMarlaPill', presetId);
    if (presetId === 'all') {
      onFilterChange('minMarla', 0);
      onFilterChange('maxMarla', 100);
    } else {
      onFilterChange('minMarla', Math.floor(preset.min));
      onFilterChange('maxMarla', Math.ceil(preset.max));
    }
  };

  const handlePriceTierClick = (min: number, max: number) => {
    onFilterChange('minPrice', min);
    onFilterChange('maxPrice', max);
  };

  const toggleAmenity = (amenityId: string) => {
    const current = filters.selectedAmenities;
    if (current.includes(amenityId)) {
      onFilterChange('selectedAmenities', current.filter(id => id !== amenityId));
    } else {
      onFilterChange('selectedAmenities', [...current, amenityId]);
    }
  };

  const filteredAmenitiesList = COMMON_AMENITIES_CONFIG.filter(a => 
    a.label.toLowerCase().includes(amenitySearch.toLowerCase())
  );

  const activeFiltersCount = 
    (filters.selectedSociety !== 'all' ? 1 : 0) +
    (filters.selectedType !== 'all' ? 1 : 0) +
    (filters.selectedCategory && filters.selectedCategory !== 'all' ? 1 : 0) +
    (filters.selectedSector && filters.selectedSector !== 'all' ? 1 : 0) +
    (filters.selectedRoadWidth && filters.selectedRoadWidth !== 'all' ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0) +
    (filters.selectedMarlaPill !== 'all' || filters.minMarla > 0 || filters.maxMarla < 100 ? 1 : 0) +
    (filters.minPrice > 0 || filters.maxPrice < 50000000 ? 1 : 0) +
    filters.selectedAmenities.length +
    (filters.selectedBedrooms !== 'all' ? 1 : 0) +
    (filters.installmentsOnly ? 1 : 0) +
    (filters.featuredOnly ? 1 : 0) +
    (filters.possessionReadyOnly ? 1 : 0);

  return (
    <aside 
      id="marketplace-filter-sidebar"
      className={`flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-xs ${isMobileDrawer ? 'h-full' : 'sticky top-20'}`}
    >
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm font-[Outfit] text-white tracking-tight">
              Filters & Preferences
            </h2>
            <div className="text-[10px] text-slate-400 font-medium">
              Showing <strong className="text-emerald-400">{matchingCount}</strong> of {totalCount} listings
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {activeFiltersCount > 0 && (
            <button
              id="btn-sidebar-reset-filters"
              type="button"
              onClick={onResetFilters}
              className="px-2.5 py-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition flex items-center gap-1 cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          {isMobileDrawer && onCloseMobileDrawer && (
            <button
              id="btn-close-filter-drawer"
              type="button"
              onClick={onCloseMobileDrawer}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Badges Counter */}
      {activeFiltersCount > 0 && (
        <div className="px-4 py-2 bg-emerald-50/80 border-b border-emerald-100 flex items-center justify-between">
          <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>{activeFiltersCount} active filter{activeFiltersCount > 1 ? 's' : ''} applied</span>
          </span>
          <button
            type="button"
            onClick={onResetFilters}
            className="text-[10px] font-extrabold text-emerald-700 hover:text-rose-600 underline cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Scrollable Filter Sections */}
      <div className="p-4 overflow-y-auto space-y-5 flex-1 divide-y divide-slate-100 max-h-[calc(100vh-180px)]">

        {/* 1. Property Type & Category */}
        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={() => toggleSection('category')}
            className="w-full flex items-center justify-between font-extrabold text-slate-900 text-xs uppercase tracking-wider cursor-pointer select-none"
          >
            <span className="flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-teal-700" />
              <span>Property Type & Category</span>
            </span>
            {openSections.category ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {openSections.category && (
            <div className="space-y-2 pt-1">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'all', label: 'All Types', count: typeCounts.all },
                  { id: 'plot', label: 'Plots / Files', count: typeCounts.plot },
                  { id: 'house', label: 'Villas / Homes', count: typeCounts.house },
                  { id: 'commercial', label: 'Commercial', count: typeCounts.commercial }
                ].map((type) => {
                  const isSelected = filters.selectedType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => onFilterChange('selectedType', type.id)}
                      className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-[11px] font-bold transition border cursor-pointer ${
                        isSelected
                          ? 'bg-teal-800 text-white border-teal-800 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>{type.label}</span>
                      <span className={`text-[10px] font-mono ${isSelected ? 'text-teal-200' : 'text-slate-400'}`}>
                        ({type.count})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Bedrooms filter if looking at houses or all */}
              {(filters.selectedType === 'house' || filters.selectedType === 'all') && (
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Bedrooms (Constructed):
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {['all', '2', '3', '4', '5'].map((bed) => (
                      <button
                        key={bed}
                        type="button"
                        onClick={() => onFilterChange('selectedBedrooms', bed)}
                        className={`py-1 rounded-lg text-[11px] font-bold transition border text-center cursor-pointer ${
                          filters.selectedBedrooms === bed
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {bed === 'all' ? 'All' : `${bed}+`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. Housing Society Selector */}
        <div className="space-y-3 pt-3">
          <button
            type="button"
            onClick={() => toggleSection('society')}
            className="w-full flex items-center justify-between font-extrabold text-slate-900 text-xs uppercase tracking-wider cursor-pointer select-none"
          >
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-700" />
              <span>Housing Society</span>
            </span>
            {openSections.society ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {openSections.society && (
            <div className="space-y-1.5 pt-1">
              <button
                type="button"
                onClick={() => onFilterChange('selectedSociety', 'all')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-bold transition border cursor-pointer ${
                  filters.selectedSociety === 'all'
                    ? 'bg-indigo-700 text-white border-indigo-700 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span>All Housing Societies</span>
                <span className={`text-[10px] font-mono ${filters.selectedSociety === 'all' ? 'text-indigo-100' : 'text-slate-400'}`}>
                  ({allProperties.length})
                </span>
              </button>

              {societies.map((s) => {
                const isSelected = filters.selectedSociety === s.id;
                const count = societyCounts[s.id] || 0;

                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onFilterChange('selectedSociety', s.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-bold transition border text-left cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-700 text-white border-indigo-700 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="truncate pr-2">{s.name}</span>
                    <span className={`text-[10px] font-mono shrink-0 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Sector & Road Width Selection */}
        <div className="space-y-3 pt-3">
          <button
            type="button"
            onClick={() => toggleSection('sectorRoad')}
            className="w-full flex items-center justify-between font-extrabold text-slate-900 text-xs uppercase tracking-wider cursor-pointer select-none"
          >
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-700" />
              <span>Sector & Road Width</span>
            </span>
            {openSections.sectorRoad ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {openSections.sectorRoad && (
            <div className="space-y-3 pt-1">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Filter by Sector:
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {SECTOR_OPTIONS.map((sec) => {
                    const isSelected = (filters.selectedSector || 'all') === sec.id;
                    const count = sectorCounts[sec.id] || 0;
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => onFilterChange('selectedSector', sec.id)}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition border cursor-pointer ${
                          isSelected
                            ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span className="truncate pr-1">{sec.label}</span>
                        <span className={`text-[10px] font-mono ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                          ({count})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Minimum Road Width:
                </div>
                <select
                  value={filters.selectedRoadWidth || 'all'}
                  onChange={(e) => onFilterChange('selectedRoadWidth', e.target.value)}
                  className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-blue-600"
                >
                  {ROAD_WIDTH_OPTIONS.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 4. Price Budget Range */}
        <div className="space-y-3 pt-3">
          <button
            type="button"
            onClick={() => toggleSection('price')}
            className="w-full flex items-center justify-between font-extrabold text-slate-900 text-xs uppercase tracking-wider cursor-pointer select-none"
          >
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
              <span>Budget / Price Range</span>
            </span>
            {openSections.price ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {openSections.price && (
            <div className="space-y-3 pt-1">
              {/* Quick Price Tier Chips */}
              <div className="grid grid-cols-2 gap-1.5">
                {PRICE_TIERS.map((tier, idx) => {
                  const isSelected = filters.minPrice === tier.min && filters.maxPrice === tier.max;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePriceTierClick(tier.min, tier.max)}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition border cursor-pointer text-center ${
                        isSelected 
                          ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs' 
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {tier.label}
                    </button>
                  );
                })}
              </div>

              {/* Slider / Numeric inputs */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span>PKR {(filters.minPrice / 100000).toFixed(0)} Lacs</span>
                  <span>PKR {(filters.maxPrice / 100000).toFixed(0)} Lacs</span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={50000000}
                  step={500000}
                  value={filters.maxPrice}
                  onChange={(e) => onFilterChange('maxPrice', Number(e.target.value))}
                  className="w-full accent-emerald-700 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
              </div>
            </div>
          )}
        </div>

        {/* 5. Size in Marlas */}
        <div className="space-y-3 pt-3">
          <button
            type="button"
            onClick={() => toggleSection('size')}
            className="w-full flex items-center justify-between font-extrabold text-slate-900 text-xs uppercase tracking-wider cursor-pointer select-none"
          >
            <span className="flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Plot / Property Size</span>
            </span>
            {openSections.size ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {openSections.size && (
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-3 gap-1.5">
                {MARLA_PRESETS.map((preset) => {
                  const isSelected = filters.selectedMarlaPill === preset.id;
                  const count = marlaCounts[preset.id] || 0;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleMarlaPresetClick(preset.id)}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition border cursor-pointer text-center ${
                        isSelected 
                          ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-2xs font-extrabold' 
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <div>{preset.label}</div>
                      <div className="text-[9px] font-mono opacity-70">({count})</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 6. Verified Amenities Checklist */}
        <div className="space-y-3 pt-3">
          <button
            type="button"
            onClick={() => toggleSection('amenities')}
            className="w-full flex items-center justify-between font-extrabold text-slate-900 text-xs uppercase tracking-wider cursor-pointer select-none"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-700" />
              <span>Verified Society Amenities</span>
            </span>
            {openSections.amenities ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {openSections.amenities && (
            <div className="space-y-2 pt-1">
              {/* Amenity Search input */}
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={amenitySearch}
                  onChange={(e) => setAmenitySearch(e.target.value)}
                  placeholder="Filter amenities (gas, security...)"
                  className="w-full text-[11px] pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>

              {/* Match Mode toggle */}
              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 px-1">
                <span>Match mode:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onFilterChange('amenityMatchMode', 'any')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${filters.amenityMatchMode === 'any' ? 'bg-purple-700 text-white font-bold' : 'bg-slate-100 text-slate-600'}`}
                  >
                    Any
                  </button>
                  <button
                    type="button"
                    onClick={() => onFilterChange('amenityMatchMode', 'all')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${filters.amenityMatchMode === 'all' ? 'bg-purple-700 text-white font-bold' : 'bg-slate-100 text-slate-600'}`}
                  >
                    All
                  </button>
                </div>
              </div>

              {/* Amenity Checkbox Items */}
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {filteredAmenitiesList.map((am) => {
                  const isChecked = filters.selectedAmenities.includes(am.id);
                  const count = amenityCounts[am.id] || 0;
                  const Icon = am.icon;

                  return (
                    <label
                      key={am.id}
                      className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer select-none ${
                        isChecked 
                          ? 'bg-purple-50 border-purple-300 text-purple-950 font-bold' 
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAmenity(am.id)}
                          className="w-3.5 h-3.5 accent-purple-700 rounded cursor-pointer"
                        />
                        <Icon className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span className="text-[11px] truncate">{am.label}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">({count})</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 7. Special Highlights & Deal Flags */}
        <div className="space-y-3 pt-3 pb-2">
          <div className="text-slate-900 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Buyer Assurance & Deal Flags</span>
          </div>

          <div className="space-y-2">
            <label className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer transition select-none">
              <div className="flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-[11px] font-bold text-slate-800">Installments Available</span>
              </div>
              <input
                type="checkbox"
                checked={filters.installmentsOnly}
                onChange={(e) => onFilterChange('installmentsOnly', e.target.checked)}
                className="w-4 h-4 accent-emerald-700 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer transition select-none">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[11px] font-bold text-slate-800">Featured Listings Only</span>
              </div>
              <input
                type="checkbox"
                checked={filters.featuredOnly}
                onChange={(e) => onFilterChange('featuredOnly', e.target.checked)}
                className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer transition select-none">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px] font-bold text-slate-800">Verified Listings Only</span>
              </div>
              <input
                type="checkbox"
                checked={filters.verifiedOnly || false}
                onChange={(e) => onFilterChange('verifiedOnly', e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

      </div>

      {/* Footer Mobile Apply Button */}
      {isMobileDrawer && onCloseMobileDrawer && (
        <div className="p-4 border-t border-slate-200 bg-white shrink-0">
          <button
            id="btn-apply-filters-mobile"
            type="button"
            onClick={onCloseMobileDrawer}
            className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-black transition shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Show {matchingCount} Matching Properties</span>
          </button>
        </div>
      )}

    </aside>
  );
};
