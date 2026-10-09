import React, { useState, useMemo } from 'react';
import { Property, Society, User } from '../../types';
import { 
  Search, 
  Filter, 
  Building2, 
  MapPin, 
  Bed, 
  Bath, 
  Heart, 
  Scale, 
  Sparkles, 
  ShieldCheck, 
  SlidersHorizontal,
  X, 
  RotateCcw, 
  Lock, 
  ArrowRight, 
  CheckCircle2,
  LayoutGrid,
  LayoutList,
  Maximize2,
  Compass,
  CreditCard,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { calculateAIPriceEstimate } from '../../utils/aiEstimator';
import { 
  MarketplaceFilterSidebar, 
  MarketplaceFilters, 
  COMMON_AMENITIES_CONFIG,
  MARLA_PRESETS 
} from '../../components/marketplace/MarketplaceFilterSidebar';
import { PropertyCard } from '../../components/marketplace/PropertyCard';
import { MediaPermissionButton } from '../../components/MediaPermissionButton';

interface PropertyMarketplaceViewProps {
  properties?: Property[];
  plots?: any[];
  societies?: Society[];
  currentUser?: User;
  wishlistIds?: string[];
  comparisonIds?: string[];
  compareIds?: string[];
  onToggleWishlist?: (property: any) => void;
  onToggleComparison?: (property: Property) => void;
  onToggleCompare?: (property: Property) => void;
  onSelectProperty?: (propertyId: string) => void;
  onOpenBooking?: (property: Property) => void;
  onInitiateBooking?: (target: { id: string; title: string; societyName: string; sector: string; pricePKR: number; sizeMarla: number }) => void;
  onNavigate?: (route: string) => void;
  onToast?: (message: string) => void;
}

const INITIAL_FILTERS: MarketplaceFilters = {
  searchQuery: '',
  selectedSociety: 'all',
  selectedType: 'all',
  selectedCategory: 'all',
  selectedSector: 'all',
  selectedRoadWidth: 'all',
  verifiedOnly: false,
  minPrice: 0,
  maxPrice: 50000000,
  minMarla: 0,
  maxMarla: 100,
  selectedMarlaPill: 'all',
  selectedBedrooms: 'all',
  selectedAmenities: [],
  amenityMatchMode: 'any',
  installmentsOnly: false,
  featuredOnly: false,
  possessionReadyOnly: false
};

const ITEMS_PER_PAGE = 8;

export const PropertyMarketplaceView: React.FC<PropertyMarketplaceViewProps> = ({
  properties = [],
  societies = [],
  currentUser,
  wishlistIds = [],
  comparisonIds = [],
  compareIds = [],
  onToggleWishlist,
  onToggleComparison,
  onToggleCompare,
  onSelectProperty,
  onOpenBooking,
  onInitiateBooking,
  onNavigate,
  onToast
}) => {
  const [filters, setFilters] = useState<MarketplaceFilters>(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'size_desc'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showDesktopSidebar, setShowDesktopSidebar] = useState(true);
  const [showMobileFiltersDrawer, setShowMobileFiltersDrawer] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Compare limit alert message
  const [compareAlertMessage, setCompareAlertMessage] = useState<string | null>(null);

  // Quick AI Valuation modal target
  const [aiValuationProp, setAiValuationProp] = useState<Property | null>(null);
  
  // Auth Gate Modal target for booking
  const [showAuthModalForProp, setShowAuthModalForProp] = useState<Property | null>(null);

  const isPublicBuyer = !currentUser || currentUser.role === 'public_buyer';
  const activeCompareIds = comparisonIds.length > 0 ? comparisonIds : compareIds;

  const handleFilterChange = <K extends keyof MarketplaceFilters>(key: K, value: MarketplaceFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setActiveVoiceTranscript(null);
    setCurrentPage(1);
  };

  // Voice search query handler that maps speech transcription to marketplace criteria
  const [activeVoiceTranscript, setActiveVoiceTranscript] = useState<string | null>(null);

  const handleApplyVoiceQuery = (transcript: string, extracted?: any) => {
    if (!transcript) return;
    setActiveVoiceTranscript(transcript);
    
    // 1. Update text search query
    handleFilterChange('searchQuery', transcript);

    // 2. Automatically apply matching marketplace filters if extracted
    if (extracted) {
      if (extracted.propertyType) {
        const typeMap: Record<string, string> = {
          plot: 'Plot',
          house: 'House',
          commercial: 'Commercial',
          apartment: 'Apartment'
        };
        const mappedType = typeMap[extracted.propertyType] || extracted.propertyType;
        handleFilterChange('selectedType', mappedType);
      }

      if (extracted.societyId) {
        handleFilterChange('selectedSociety', extracted.societyId);
      } else if (extracted.societyName && societies.length > 0) {
        const found = societies.find(s => s.name.toLowerCase().includes(extracted.societyName.toLowerCase()));
        if (found) {
          handleFilterChange('selectedSociety', found.id);
        }
      }

      if (extracted.maxPrice && typeof extracted.maxPrice === 'number') {
        handleFilterChange('maxPrice', extracted.maxPrice);
      }

      if (extracted.sizeMarla && typeof extracted.sizeMarla === 'number') {
        handleFilterChange('selectedMarlaPill', String(extracted.sizeMarla));
      }
    }

    if (onToast) {
      onToast(`🎙️ Voice search applied: "${transcript}"`);
    }
  };

  const handleSelectProp = (id: string) => {
    if (onSelectProperty) {
      onSelectProperty(id);
    } else if (onNavigate) {
      onNavigate(`/property/${id}`);
    }
  };

  const handleBookProp = (prop: Property) => {
    if (isPublicBuyer) {
      setShowAuthModalForProp(prop);
      return;
    }

    if (onOpenBooking) {
      onOpenBooking(prop);
    } else if (onInitiateBooking) {
      onInitiateBooking({
        id: prop.id,
        title: prop.title,
        societyName: prop.societyName,
        sector: prop.sector || 'Sector A',
        pricePKR: prop.pricePKR,
        sizeMarla: prop.sizeMarla
      });
    }
  };

  const handleCompareProp = (prop: Property) => {
    const isCurrentlyComparing = (activeCompareIds || []).includes(prop.id);
    if (!isCurrentlyComparing && (activeCompareIds || []).length >= 3) {
      setCompareAlertMessage('You can compare a maximum of 3 properties simultaneously.');
      setTimeout(() => setCompareAlertMessage(null), 4000);
      return;
    }

    if (onToggleComparison) {
      onToggleComparison(prop);
    } else if (onToggleCompare) {
      onToggleCompare(prop);
    }
  };

  const handleWishlistProp = (prop: Property) => {
    if (onToggleWishlist) {
      onToggleWishlist(prop);
    }
  };

  // Comprehensive Real Estate Filter Logic
  const filteredProperties = useMemo(() => {
    return (properties || []).filter((prop) => {
      // Exclude duplicate flagged properties from public view unless super admin
      if (prop.isDuplicateFlagged && currentUser?.role !== 'super_admin') {
        return false;
      }

      // 1. Keyword search (ID, title, location, society, sector, block, plotNumber, dealer, amenities)
      const q = filters.searchQuery.toLowerCase().trim();
      if (q) {
        const idMatch = prop.id.toLowerCase().includes(q);
        const propIdMatch = prop.propertyId && prop.propertyId.toLowerCase().includes(q);
        const prefixMatch = prop.categoryPrefix && prop.categoryPrefix.toLowerCase().includes(q);
        const titleMatch = prop.title.toLowerCase().includes(q);
        const locMatch = prop.location.toLowerCase().includes(q);
        const socMatch = prop.societyName && prop.societyName.toLowerCase().includes(q);
        const secMatch = prop.sector && prop.sector.toLowerCase().includes(q);
        const blkMatch = prop.block && prop.block.toLowerCase().includes(q);
        const plotMatch = prop.plotNumber && prop.plotNumber.toLowerCase().includes(q);
        const dealerMatch = prop.dealerName && prop.dealerName.toLowerCase().includes(q);
        const descMatch = prop.description && prop.description.toLowerCase().includes(q);
        if (!idMatch && !propIdMatch && !prefixMatch && !titleMatch && !locMatch && !socMatch && !secMatch && !blkMatch && !plotMatch && !dealerMatch && !descMatch) {
          return false;
        }
      }

      // 2. Society Filter
      if (filters.selectedSociety !== 'all' && prop.societyId !== filters.selectedSociety) {
        return false;
      }

      // 3. Property Type
      if (filters.selectedType !== 'all' && prop.type !== filters.selectedType) {
        return false;
      }

      // 4. Property Category
      if (filters.selectedCategory && filters.selectedCategory !== 'all' && prop.category !== filters.selectedCategory) {
        return false;
      }

      // 5. Sector
      if (filters.selectedSector && filters.selectedSector !== 'all' && prop.sector !== filters.selectedSector) {
        return false;
      }

      // 6. Road Width
      if (filters.selectedRoadWidth && filters.selectedRoadWidth !== 'all') {
        const minWidth = parseInt(filters.selectedRoadWidth, 10);
        const roadStr = prop.roadWidth || '';
        const match = roadStr.match(/(\d+)/);
        const roadWidthNum = match ? parseInt(match[1], 10) : 0;
        if (roadWidthNum < minWidth) {
          return false;
        }
      }

      // 7. Verified Only
      if (filters.verifiedOnly && prop.verificationStatus !== 'verified') {
        return false;
      }

      // 8. Price Range (Min & Max PKR)
      if (prop.pricePKR < filters.minPrice || prop.pricePKR > filters.maxPrice) {
        return false;
      }

      // 9. Size in Marlas
      if (filters.selectedMarlaPill !== 'all' && filters.selectedMarlaPill !== 'custom') {
        const preset = MARLA_PRESETS.find(p => p.id === filters.selectedMarlaPill);
        if (preset && (prop.sizeMarla < preset.min || prop.sizeMarla > preset.max)) {
          return false;
        }
      } else {
        if (prop.sizeMarla < filters.minMarla || (filters.maxMarla < 100 && prop.sizeMarla > filters.maxMarla)) {
          return false;
        }
      }

      // 10. Bedrooms (for houses/villas)
      if (filters.selectedBedrooms !== 'all') {
        const minBeds = parseInt(filters.selectedBedrooms, 10);
        if (!prop.bedrooms || prop.bedrooms < minBeds) {
          return false;
        }
      }

      // 11. Verified Amenities Filter
      if (filters.selectedAmenities.length > 0) {
        const propertyAmenityText = [
          ...(prop.amenities || []),
          prop.description || '',
          prop.title || '',
          ...(prop.type === 'house' ? ['house', 'constructed'] : [])
        ].join(' ').toLowerCase();

        if (filters.amenityMatchMode === 'all') {
          const hasAll = filters.selectedAmenities.every(amId => {
            const config = COMMON_AMENITIES_CONFIG.find(c => c.id === amId);
            if (!config) return true;
            return config.keywords.some(kw => propertyAmenityText.includes(kw));
          });
          if (!hasAll) return false;
        } else {
          const hasAny = filters.selectedAmenities.some(amId => {
            const config = COMMON_AMENITIES_CONFIG.find(c => c.id === amId);
            if (!config) return true;
            return config.keywords.some(kw => propertyAmenityText.includes(kw));
          });
          if (!hasAny) return false;
        }
      }

      // 12. Special deal flags
      if (filters.installmentsOnly && !prop.paymentPlan?.installmentsAvailable) {
        return false;
      }

      if (filters.featuredOnly && !prop.featured) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.pricePKR - b.pricePKR;
      if (sortBy === 'price_desc') return b.pricePKR - a.pricePKR;
      if (sortBy === 'size_desc') return b.sizeMarla - a.sizeMarla;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });
  }, [properties, filters, sortBy, currentUser?.role]);

  // Paginated listings
  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE) || 1;
  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProperties.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProperties, currentPage]);

  // Active filter count calculation
  const activeFiltersCount = useMemo(() => {
    return (
      (filters.searchQuery ? 1 : 0) +
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
      (filters.featuredOnly ? 1 : 0)
    );
  }, [filters]);

  const selectedSocietyObj = societies.find(s => s.id === filters.selectedSociety);

  return (
    <div className="space-y-6" id="marketplace-root-view">
      
      {/* Compare Limit Toast Notification */}
      {compareAlertMessage && (
        <div className="p-3 bg-amber-500 text-slate-950 font-bold rounded-2xl shadow-lg border border-amber-600 flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-slate-950" />
            <span className="text-xs">{compareAlertMessage}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setCompareAlertMessage(null)}
            className="text-slate-950 hover:opacity-75 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner & Global Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-[Outfit] text-slate-900 tracking-tight flex items-center gap-2">
            <span>Verified National Property Marketplace</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Verified plots, luxury homes, and commercial units across LDA & TMA approved housing societies.
          </p>
        </div>

        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          
          {/* Voice Search MediaPermissionButton in Marketplace Search Header */}
          <div className="shrink-0">
            <MediaPermissionButton
              kind="microphone"
              label="Voice Search"
              onAudioTranscript={handleApplyVoiceQuery}
            />
          </div>

          {/* Comparison Tray Link if properties selected */}
          {activeCompareIds.length > 0 && (
            <button
              id="btn-view-comparison"
              type="button"
              onClick={() => onNavigate && onNavigate('/compare')}
              className="px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <Scale className="w-4 h-4 text-emerald-200" />
              <span>Compare ({activeCompareIds.length}/3)</span>
            </button>
          )}

          {/* Toggle Filters Button (Mobile / Desktop) */}
          <button
            id="btn-toggle-filters"
            type="button"
            onClick={() => {
              if (window.innerWidth < 1024) {
                setShowMobileFiltersDrawer(true);
              } else {
                setShowDesktopSidebar(!showDesktopSidebar);
              }
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border cursor-pointer ${
              activeFiltersCount > 0
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden lg:inline">{showDesktopSidebar ? 'Hide Filters' : 'Show Filters'}</span>
            <span className="lg:hidden">Filter Listings</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-mono font-black text-[10px] flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* View Mode Toggle (Grid vs List) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              id="btn-view-grid"
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              id="btn-view-list"
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Compact List View"
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Sort:</span>
            <select
              id="select-sort-marketplace"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-600 shadow-2xs cursor-pointer"
            >
              <option value="newest">Newest Listed</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="size_desc">Size: Largest First</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Content Layout: Sidebar + Listings Area */}
      <div className="flex items-start gap-6">
        
        {/* Desktop Sticky Filter Sidebar */}
        {showDesktopSidebar && (
          <div className="hidden lg:block w-72 xl:w-80 shrink-0">
            <MarketplaceFilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              societies={societies}
              allProperties={properties}
              matchingCount={filteredProperties.length}
              totalCount={properties.length}
            />
          </div>
        )}

        {/* Main Listings Column */}
        <div className="flex-1 min-w-0 space-y-4">
          
          {/* Quick Keyword Search Bar & Voice-Enabled Search */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="flex-1 flex items-center gap-2.5 bg-slate-50 sm:bg-transparent px-3 py-2 sm:p-0 rounded-xl sm:rounded-none">
                <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                <input
                  id="input-marketplace-search"
                  type="text"
                  value={filters.searchQuery}
                  onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                  placeholder="Search by keywords, sector, block, plot #, society, road width..."
                  className="w-full text-xs bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
                />
                {filters.searchQuery && (
                  <button
                    type="button"
                    onClick={() => handleFilterChange('searchQuery', '')}
                    className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer shrink-0"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* MediaPermissionButton for Real-Time Voice Search */}
              <div className="shrink-0 flex items-center justify-end">
                <MediaPermissionButton
                  kind="microphone"
                  label="Voice Search"
                  compact
                  onAudioTranscript={handleApplyVoiceQuery}
                />
              </div>
            </div>
          </div>

          {/* Active Voice Search Query Pill & Indicator */}
          {activeVoiceTranscript && (
            <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white rounded-2xl border border-emerald-500/30 text-xs shadow-md animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute"></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Whisper Voice Search Active:</span>
                    <span className="font-bold text-white italic">"{activeVoiceTranscript}"</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Transcribed & automatically applied to marketplace criteria</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveVoiceTranscript(null);
                  handleFilterChange('searchQuery', '');
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer border border-slate-700 shrink-0 ml-2"
                title="Clear voice query"
              >
                <span>Clear Voice Filter</span>
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Active Filter Chips Bar */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mr-1">
                Active Filters:
              </span>

              {/* Society Chip */}
              {filters.selectedSociety !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-lg text-xs font-bold shadow-2xs">
                  <Building2 className="w-3 h-3 text-indigo-600" />
                  <span>{selectedSocietyObj?.name || 'Society'}</span>
                  <button 
                    type="button"
                    onClick={() => handleFilterChange('selectedSociety', 'all')}
                    className="hover:text-rose-600 cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Category / Type Chip */}
              {filters.selectedType !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 text-teal-900 border border-teal-200 rounded-lg text-xs font-bold shadow-2xs">
                  <span>Type: {filters.selectedType}</span>
                  <button 
                    type="button"
                    onClick={() => handleFilterChange('selectedType', 'all')}
                    className="hover:text-rose-600 cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Sector Chip */}
              {filters.selectedSector && filters.selectedSector !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-900 border border-blue-200 rounded-lg text-xs font-bold shadow-2xs">
                  <Compass className="w-3 h-3 text-blue-600" />
                  <span>{filters.selectedSector}</span>
                  <button 
                    type="button"
                    onClick={() => handleFilterChange('selectedSector', 'all')}
                    className="hover:text-rose-600 cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Road Width Chip */}
              {filters.selectedRoadWidth && filters.selectedRoadWidth !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-900 border border-blue-200 rounded-lg text-xs font-bold shadow-2xs">
                  <span>Road: {filters.selectedRoadWidth} ft+</span>
                  <button 
                    type="button"
                    onClick={() => handleFilterChange('selectedRoadWidth', 'all')}
                    className="hover:text-rose-600 cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Price Range Chip */}
              {(filters.minPrice > 0 || filters.maxPrice < 50000000) && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg text-xs font-bold shadow-2xs">
                  <span>
                    Price: {filters.minPrice > 0 ? `PKR ${(filters.minPrice/100000).toFixed(0)}L` : '0'} – {filters.maxPrice < 50000000 ? `PKR ${(filters.maxPrice/100000).toFixed(0)}L` : 'Max'}
                  </span>
                  <button 
                    type="button"
                    onClick={() => {
                      handleFilterChange('minPrice', 0);
                      handleFilterChange('maxPrice', 50000000);
                    }}
                    className="hover:text-rose-600 cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Marla Size Chip */}
              {(filters.selectedMarlaPill !== 'all' || filters.minMarla > 0 || filters.maxMarla < 100) && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold shadow-2xs">
                  <Maximize2 className="w-3 h-3 text-amber-600" />
                  <span>
                    Size: {filters.selectedMarlaPill !== 'all' && filters.selectedMarlaPill !== 'custom' 
                      ? `${filters.selectedMarlaPill} Marla` 
                      : `${filters.minMarla}–${filters.maxMarla} Marla`}
                  </span>
                  <button 
                    type="button"
                    onClick={() => {
                      handleFilterChange('selectedMarlaPill', 'all');
                      handleFilterChange('minMarla', 0);
                      handleFilterChange('maxMarla', 100);
                    }}
                    className="hover:text-rose-600 cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Verified Only Chip */}
              {filters.verifiedOnly && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-900 border border-blue-300 rounded-lg text-xs font-bold shadow-2xs">
                  <ShieldCheck className="w-3 h-3 text-blue-700" />
                  <span>Verified Only</span>
                  <button 
                    type="button"
                    onClick={() => handleFilterChange('verifiedOnly', false)}
                    className="hover:text-rose-600 cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Installments Chip */}
              {filters.installmentsOnly && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-lg text-xs font-bold shadow-2xs">
                  <CreditCard className="w-3 h-3" />
                  <span>Installments Available</span>
                  <button 
                    type="button"
                    onClick={() => handleFilterChange('installmentsOnly', false)}
                    className="hover:text-rose-600 cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Clear All Action */}
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-black text-rose-600 hover:text-rose-800 ml-auto flex items-center gap-1 cursor-pointer transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>
          )}

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <div>
              Showing <strong className="text-slate-900">{filteredProperties.length}</strong> matching verified properties
            </div>
            {filteredProperties.length > 0 && (
              <div className="text-[11px] text-slate-400">
                Pakistan Real Estate Ecosystem
              </div>
            )}
          </div>

          {/* Empty State */}
          {filteredProperties.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-3 shadow-xs">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No properties match your filter criteria</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your price range, clearing selected sector/road filters, or resetting the size filters.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-800 transition shadow-xs"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            
            /* GRID VIEW */
            <div className={`grid grid-cols-1 md:grid-cols-2 ${showDesktopSidebar ? 'xl:grid-cols-2 2xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'} gap-5`}>
              {paginatedProperties.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  viewMode="grid"
                  isWishlisted={(wishlistIds || []).includes(prop.id)}
                  isComparing={(activeCompareIds || []).includes(prop.id)}
                  canCompare={activeCompareIds.length < 3}
                  onSelect={handleSelectProp}
                  onToggleWishlist={handleWishlistProp}
                  onToggleCompare={handleCompareProp}
                  onBook={handleBookProp}
                  onOpenAiValuation={setAiValuationProp}
                  onToast={onToast}
                />
              ))}
            </div>

          ) : (

            /* COMPACT LIST VIEW */
            <div className="space-y-3.5">
              {paginatedProperties.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  viewMode="list"
                  isWishlisted={(wishlistIds || []).includes(prop.id)}
                  isComparing={(activeCompareIds || []).includes(prop.id)}
                  canCompare={activeCompareIds.length < 3}
                  onSelect={handleSelectProp}
                  onToggleWishlist={handleWishlistProp}
                  onToggleCompare={handleCompareProp}
                  onBook={handleBookProp}
                  onOpenAiValuation={setAiValuationProp}
                  onToast={onToast}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <div className="text-xs text-slate-500 font-semibold">
                Page {currentPage} of {totalPages}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition cursor-pointer ${
                      currentPage === page
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Mobile Slide-Over Filter Drawer */}
      {showMobileFiltersDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowMobileFiltersDrawer(false)}
          />
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl z-10 flex flex-col">
            <MarketplaceFilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              societies={societies}
              allProperties={properties}
              matchingCount={filteredProperties.length}
              totalCount={properties.length}
              isMobileDrawer={true}
              onCloseMobileDrawer={() => setShowMobileFiltersDrawer(false)}
            />
          </div>
        </div>
      )}

      {/* AI Fair Price Modal */}
      {aiValuationProp && (() => {
        const est = calculateAIPriceEstimate({
          propertyType: aiValuationProp.type === 'house' ? 'constructed_house' : 'residential_plot',
          areaMarla: aiValuationProp.sizeMarla,
          bedrooms: aiValuationProp.bedrooms || 3,
          bathrooms: aiValuationProp.bathrooms || 3,
          societyName: aiValuationProp.societyName || 'Al-Rehman Garden',
          locationCategory: 'prime_main_road',
          amenities: aiValuationProp.amenities || []
        });

        const diffPKR = aiValuationProp.pricePKR - est.estimatedPricePKR;
        const isGoodDeal = diffPKR <= 0;

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-5 animate-slide-down">
              
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 font-[Outfit]">
                      AI Fair Valuation Engine
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate max-w-[240px]">
                      {aiValuationProp.title}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAiValuationProp(null)}
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Estimate Stats Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Seller Demand:</span>
                  <span className="font-mono font-bold text-slate-900">
                    PKR {aiValuationProp.pricePKR.toLocaleString('en-PK')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-700 font-bold">AI Estimated Fair Value:</span>
                  <span className="font-mono font-extrabold text-purple-900 text-sm">
                    PKR {est.estimatedPricePKR.toLocaleString('en-PK')}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-bold">Pricing Assessment:</span>
                  <span className={`font-bold px-2 py-0.5 rounded-lg text-[10px] ${
                    isGoodDeal ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {isGoodDeal ? '✨ Below Market Demand' : '📈 Premium Demand'}
                  </span>
                </div>
              </div>

              {/* Influencing Market Factors */}
              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  Key Algorithmic Valuation Drivers:
                </div>
                <div className="space-y-1.5">
                  {est.influencingFactors.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-[11px]">
                      <span className="text-slate-700 font-medium">{f.factor}</span>
                      <span className={`font-bold ${f.impact === 'positive' ? 'text-emerald-700' : 'text-slate-600'}`}>
                        {f.percentage}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const p = aiValuationProp;
                    setAiValuationProp(null);
                    handleBookProp(p);
                  }}
                  className="flex-1 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Proceed to Book Plot
                </button>
                <button
                  type="button"
                  onClick={() => setAiValuationProp(null)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Auth Gate Modal when Unauthenticated Guest tries to book */}
      {showAuthModalForProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-slate-900 shadow-2xl border border-slate-200 relative animate-scale-up">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 font-black text-2xl flex items-center justify-center mx-auto shadow-xs">
                <Lock className="w-6 h-6 text-amber-700" />
              </div>
              <h3 className="text-xl font-black font-[Outfit] text-slate-900">
                Buyer Sign In Required for Booking
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                To reserve <strong>{showAuthModalForProp.title}</strong> ({showAuthModalForProp.societyName}) with official token advance and NADRA CNIC verification, please sign in or register your buyer account.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => {
                  const targetId = showAuthModalForProp.id;
                  setShowAuthModalForProp(null);
                  if (onNavigate) onNavigate(`/login?redirect=/property/${targetId}`);
                }}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Sign In to Existing Account</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>

              <button
                type="button"
                onClick={() => {
                  const targetId = showAuthModalForProp.id;
                  setShowAuthModalForProp(null);
                  if (onNavigate) onNavigate(`/signup?redirect=/property/${targetId}`);
                }}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Create New Free Buyer Account (30s)</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowAuthModalForProp(null)}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                Continue Browsing Marketplace
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
