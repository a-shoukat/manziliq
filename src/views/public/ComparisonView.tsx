import React, { useState, useMemo, useRef } from 'react';
import { Property, Plot, SavedComparison, User, Society } from '../../types';
import { 
  Scale, 
  Trash2, 
  CheckCircle2, 
  X, 
  MapPin, 
  Building2, 
  Plus, 
  FileText,
  Sparkles,
  ShieldCheck,
  Compass,
  CreditCard,
  Bookmark,
  BookmarkCheck,
  Clock,
  ArrowRight,
  FolderHeart,
  Save,
  Check,
  AlertCircle,
  Search,
  SlidersHorizontal,
  Layers,
  ChevronDown,
  Printer,
  TrendingDown,
  Award,
  Zap,
  Info,
  CheckSquare,
  Square
} from 'lucide-react';
import { formatPKR } from '../../components/marketplace/PropertyCard';

interface ComparisonViewProps {
  properties?: Property[];
  plots?: Plot[];
  allProperties?: Property[];
  societies?: Society[];
  compareList?: Property[];
  savedComparisons?: SavedComparison[];
  currentUser?: User;
  onRemove: (propertyId: string) => void;
  onClear: () => void;
  onSetCompareList?: (items: Property[]) => void;
  onToggleComparePlot?: (plot: Plot) => void;
  onToggleCompareProperty?: (property: Property) => void;
  onSelectProperty?: (propertyId: string) => void;
  onOpenBooking?: (property: Property) => void;
  onInitiateBooking?: (target: { id: string; title: string; societyName: string; sector: string; pricePKR: number; sizeMarla: number }) => void;
  onSaveComparison?: (comparison: SavedComparison) => void;
  onDeleteSavedComparison?: (id: string) => void;
  onLoadSavedComparison?: (comparison: SavedComparison) => void;
  onNavigate: (route: string) => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  properties,
  plots = [],
  allProperties = [],
  societies = [],
  compareList,
  savedComparisons = [],
  currentUser,
  onRemove,
  onClear,
  onSetCompareList,
  onToggleComparePlot,
  onToggleCompareProperty,
  onSelectProperty,
  onOpenBooking,
  onInitiateBooking,
  onSaveComparison,
  onDeleteSavedComparison,
  onLoadSavedComparison,
  onNavigate
}) => {
  const activeProperties = properties || compareList || [];
  const [activeTab, setActiveTab] = useState<'current_matrix' | 'saved_history'>('current_matrix');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [saveNotes, setSaveNotes] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Search & Multi-Selection States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('all');
  const [selectedSocietyFilter, setSelectedSocietyFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'marla_asc' | 'rate_asc'>('price_asc');
  const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(true);

  const matrixSectionRef = useRef<HTMLDivElement>(null);

  const isPublicBuyer = !currentUser || currentUser.role === 'public_buyer';

  const userSavedComparisons = (savedComparisons || []).filter(c => 
    !currentUser || currentUser.role === 'public_buyer' ? true : c.userId === currentUser.id || true
  );

  // Map Plot object to Property object for uniform comparison matrix handling
  const mapPlotToProperty = (plot: Plot): Property => {
    return {
      id: plot.id,
      title: `Plot #${plot.plotNumber} - ${plot.sizeMarla} Marla (${plot.sector})`,
      societyId: plot.societyId,
      societyName: plot.societyName,
      type: (plot.category === 'commercial' ? 'commercial' : 'plot') as 'plot' | 'commercial',
      sizeMarla: plot.sizeMarla,
      sizeSqFt: plot.sizeSqFt || plot.sizeMarla * 225,
      pricePKR: plot.pricePKR,
      pricePerMarla: Math.round(plot.pricePKR / (plot.sizeMarla || 1)),
      location: `${plot.sector}, ${plot.societyName}`,
      city: 'Lahore',
      images: [
        'https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=1200&q=80'
      ],
      description: `Demarcated ${plot.sizeMarla} Marla plot in ${plot.sector}, ${plot.societyName}.`,
      amenities: plot.features || ['Direct Road Access', 'Underground Electricity', 'LDA Verified'],
      featured: false,
      status: 'approved',
      plotNumber: plot.plotNumber,
      block: plot.block,
      createdAt: new Date().toISOString(),
      paymentPlan: {
        installmentsAvailable: true,
        downPaymentPercent: 20,
        downPaymentPKR: plot.downPaymentPKR || Math.round(plot.pricePKR * 0.2),
        monthlyAmountPKR: plot.monthlyInstallmentPKR || Math.round((plot.pricePKR * 0.8) / (plot.installmentMonths || 36)),
        installmentMonths: plot.installmentMonths || 36
      }
    };
  };

  // Build unified inventory of candidate plots & properties
  const allCandidateItems: Property[] = useMemo(() => {
    const plotItems: Property[] = plots.map(mapPlotToProperty);
    const existingIds = new Set(plotItems.map(p => p.id));
    const extraProps: Property[] = allProperties.filter(p => !existingIds.has(p.id));
    return [...plotItems, ...extraProps];
  }, [plots, allProperties]);

  // Extract unique societies for filter dropdown
  const uniqueSocieties = useMemo(() => {
    const socSet = new Set<string>();
    allCandidateItems.forEach(item => {
      if (item.societyName) socSet.add(item.societyName);
    });
    return Array.from(socSet).sort();
  }, [allCandidateItems]);

  // Filtered candidate list based on user search query & filter criteria
  const filteredCandidates = useMemo(() => {
    return allCandidateItems.filter(item => {
      // 1. Text Search (Size, Plot #, Society, Sector, Block, Features)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSociety = (item.societyName || '').toLowerCase().includes(q);
        const matchesSector = (item.sector || '').toLowerCase().includes(q);
        const matchesBlock = (item.block || '').toLowerCase().includes(q);
        const matchesPlotNo = (item.plotNumber || '').toLowerCase().includes(q);
        const matchesLocation = (item.location || '').toLowerCase().includes(q);
        const matchesSizeMarla = `${item.sizeMarla} marla`.toLowerCase().includes(q) || 
                                `${item.sizeMarla}marla`.toLowerCase().includes(q) || 
                                (q === `${item.sizeMarla}`);
        const matchesFeatures = (item.amenities || []).some(f => f.toLowerCase().includes(q));

        if (!matchesTitle && !matchesSociety && !matchesSector && !matchesBlock && !matchesPlotNo && !matchesLocation && !matchesSizeMarla && !matchesFeatures) {
          return false;
        }
      }

      // 2. Size Pill Filter
      if (selectedSizeFilter !== 'all') {
        if (selectedSizeFilter === '3_marla' && item.sizeMarla !== 3) return false;
        if (selectedSizeFilter === '5_marla' && item.sizeMarla !== 5) return false;
        if (selectedSizeFilter === '7_marla' && item.sizeMarla !== 7) return false;
        if (selectedSizeFilter === '10_marla' && item.sizeMarla !== 10) return false;
        if (selectedSizeFilter === '1_kanal' && item.sizeMarla !== 20) return false;
        if (selectedSizeFilter === 'commercial' && item.type !== 'commercial') return false;
      }

      // 3. Society Filter
      if (selectedSocietyFilter !== 'all') {
        if (item.societyName !== selectedSocietyFilter) return false;
      }

      // 4. Status Filter
      if (selectedStatusFilter === 'available_only') {
        const isPlotAvail = plots.find(p => p.id === item.id)?.status === 'available';
        if (!isPlotAvail && item.status !== 'approved') return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.pricePKR - b.pricePKR;
      if (sortBy === 'price_desc') return b.pricePKR - a.pricePKR;
      if (sortBy === 'marla_asc') return a.sizeMarla - b.sizeMarla;
      if (sortBy === 'rate_asc') {
        const rateA = Math.round(a.pricePKR / (a.sizeMarla || 1));
        const rateB = Math.round(b.pricePKR / (b.sizeMarla || 1));
        return rateA - rateB;
      }
      return 0;
    });
  }, [allCandidateItems, searchQuery, selectedSizeFilter, selectedSocietyFilter, selectedStatusFilter, sortBy, plots]);

  // Check if a candidate item is already in active compare list
  const isItemInCompare = (item: Property) => {
    return activeProperties.some(p => p.id === item.id || (p.plotNumber && p.plotNumber === item.plotNumber));
  };

  // Toggle single item selection
  const handleToggleCandidate = (item: Property) => {
    if (isItemInCompare(item)) {
      onRemove(item.id);
    } else {
      if (activeProperties.length >= 6) {
        alert('You can compare up to 6 plots side-by-side. Please remove one before adding another.');
        return;
      }
      if (onSetCompareList) {
        onSetCompareList([...activeProperties, item]);
      } else if (onToggleCompareProperty) {
        onToggleCompareProperty(item);
      }
    }
  };

  // Quick preset: Select first 5 or 6 plots matching 5 Marla
  const handleSelectFiveMarlaPlots = () => {
    const fiveMarlaList = allCandidateItems.filter(item => item.sizeMarla === 5);
    const chosen = fiveMarlaList.slice(0, 6);
    if (chosen.length > 0) {
      if (onSetCompareList) {
        onSetCompareList(chosen);
      }
      setSearchQuery('5 marla');
      setSelectedSizeFilter('5_marla');
      setSaveSuccessMsg(`Selected ${chosen.length} 5-Marla plots for side-by-side comparison!`);
      setTimeout(() => setSaveSuccessMsg(null), 3500);
      scrollToMatrix();
    }
  };

  // Quick preset: Select all currently filtered plots (up to 6)
  const handleSelectFilteredPlots = () => {
    const chosen = filteredCandidates.slice(0, 6);
    if (chosen.length > 0) {
      if (onSetCompareList) {
        onSetCompareList(chosen);
      }
      setSaveSuccessMsg(`Loaded ${chosen.length} selected plots into the comparison matrix!`);
      setTimeout(() => setSaveSuccessMsg(null), 3500);
      scrollToMatrix();
    }
  };

  const scrollToMatrix = () => {
    setTimeout(() => {
      if (matrixSectionRef.current) {
        matrixSectionRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSelectProp = (id: string) => {
    if (onSelectProperty) {
      onSelectProperty(id);
    } else {
      onNavigate(`/property/${id}`);
    }
  };

  const handleBook = (prop: Property) => {
    if (isPublicBuyer) {
      onNavigate('/login');
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

  const handleSaveCurrentComparison = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPublicBuyer) {
      onNavigate('/login');
      return;
    }
    if (!saveTitle.trim()) return;

    const newSavedComp: SavedComparison = {
      id: `saved-comp-${Date.now()}`,
      userId: currentUser?.id || 'u-buyer-1',
      title: saveTitle.trim(),
      savedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      plotIds: activeProperties.map(p => p.id),
      propertyIds: activeProperties.map(p => p.id),
      plotsCount: activeProperties.length,
      notes: saveNotes.trim()
    };

    if (onSaveComparison) {
      onSaveComparison(newSavedComp);
    }
    setShowSaveModal(false);
    setSaveTitle('');
    setSaveNotes('');
    setSaveSuccessMsg(`Comparison matrix "${newSavedComp.title}" successfully saved to your profile!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Identify Best Value & Lowest Metrics among compared plots
  const lowestPrice = activeProperties.length > 0 ? Math.min(...activeProperties.map(p => p.pricePKR)) : 0;
  const lowestRatePerMarla = activeProperties.length > 0 ? Math.min(...activeProperties.map(p => Math.round(p.pricePKR / (p.sizeMarla || 1)))) : 0;
  const lowestDownPayment = activeProperties.length > 0 ? Math.min(...activeProperties.map(p => Math.round(p.pricePKR * 0.20))) : 0;
  const largestArea = activeProperties.length > 0 ? Math.max(...activeProperties.map(p => p.sizeMarla)) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6" id="comparison-view-root">
      
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Interactive Comparison Tool
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              Select 2 to 6 plots for side-by-side evaluation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-[Outfit] text-slate-900 tracking-tight flex items-center gap-2 mt-1">
            <Scale className="w-7 h-7 text-emerald-800" />
            <span>Plot & Property Comparison Matrix</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Search 5-Marla, 10-Marla or commercial plots, pick multiple options from the live list, and analyze rate per Marla, advance payment & installment plans side-by-side.
          </p>
        </div>

        {/* Tab switcher: Active Matrix vs Saved Comparisons */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold w-full sm:w-auto">
          <button
            id="tab-current-comparison"
            type="button"
            onClick={() => setActiveTab('current_matrix')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'current_matrix'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Active Comparison ({activeProperties.length}/6)</span>
          </button>

          <button
            id="tab-saved-comparisons"
            type="button"
            onClick={() => setActiveTab('saved_history')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'saved_history'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-500" />
            <span>Saved Sets ({userSavedComparisons.length})</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* TAB 1: ACTIVE COMPARISON MATRIX & SEARCH BUILDER */}
      {activeTab === 'current_matrix' && (
        <div className="space-y-6">

          {/* ========================================================================= */}
          {/* SECTION 1: SEARCH & MULTI-SELECT PLOTS PANEL (Requested by User)           */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5" id="plot-search-selector-panel">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h2 className="text-lg font-extrabold font-[Outfit] text-slate-900 flex items-center gap-2">
                    <Search className="w-5 h-5 text-emerald-800" />
                    <span>Search & Select Plots to Compare</span>
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Type <strong>"5 Marla"</strong> or choose society/sector below to select 5–6 plots from the list and compare them instantly.
                </p>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  id="btn-preset-5-marla"
                  onClick={handleSelectFiveMarlaPlots}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-extrabold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition cursor-pointer shadow-2xs"
                  title="Auto-select 5-6 5-Marla plots"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Auto-Pick 5 Marla Plots</span>
                </button>

                {filteredCandidates.length > 0 && (
                  <button
                    type="button"
                    id="btn-select-filtered-plots"
                    onClick={handleSelectFilteredPlots}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition cursor-pointer"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
                    <span>Select Matching ({Math.min(filteredCandidates.length, 6)})</span>
                  </button>
                )}

                {activeProperties.length > 0 && (
                  <button
                    type="button"
                    id="btn-clear-selection-selector"
                    onClick={onClear}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>
            </div>

            {/* Search Input Bar & Quick Filters */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Main Search Input */}
              <div className="md:col-span-6 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-compare-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by size (e.g. 5 Marla), plot #, society, sector, block, or feature..."
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Society Selector */}
              <div className="md:col-span-3">
                <select
                  id="select-compare-society"
                  value={selectedSocietyFilter}
                  onChange={(e) => setSelectedSocietyFilter(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-600 outline-none cursor-pointer"
                >
                  <option value="all">All Housing Societies</option>
                  {uniqueSocieties.map((soc) => (
                    <option key={soc} value={soc}>{soc}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="md:col-span-3">
                <select
                  id="select-compare-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-600 outline-none cursor-pointer"
                >
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="marla_asc">Size: Small to Large</option>
                  <option value="rate_asc">Rate / Marla: Lowest First</option>
                </select>
              </div>
            </div>

            {/* Quick Size Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" />
                <span>Size Filter:</span>
              </span>
              {[
                { id: 'all', label: 'All Sizes' },
                { id: '3_marla', label: '3 Marla' },
                { id: '5_marla', label: '5 Marla ⭐' },
                { id: '7_marla', label: '7 Marla' },
                { id: '10_marla', label: '10 Marla' },
                { id: '1_kanal', label: '1 Kanal (20 Marla)' },
                { id: 'commercial', label: 'Commercial Lots' }
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setSelectedSizeFilter(pill.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedSizeFilter === pill.id
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {pill.label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'all' ? 'available_only' : 'all')}
                className={`ml-auto px-3 py-1 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                  selectedStatusFilter === 'available_only'
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Available Plots Only</span>
              </button>
            </div>

            {/* Selection Status & Floating Call-to-Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/80">
              <div className="flex items-center gap-2.5 text-xs text-emerald-950">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-800 text-white font-extrabold text-xs">
                  {activeProperties.length}
                </span>
                <span className="font-bold">
                  <strong>{activeProperties.length} of 6</strong> plots selected for side-by-side comparison
                </span>
                {activeProperties.length >= 6 && (
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-extrabold px-2 py-0.5 rounded">
                    Max 6 Reached
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {activeProperties.length > 0 && (
                  <button
                    type="button"
                    onClick={scrollToMatrix}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>View Side-by-Side Table ({activeProperties.length} Plots)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Matching Plots Results List (Checkboxes & Selection Cards) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                <span>Showing <strong>{filteredCandidates.length}</strong> matching plots:</span>
                <span className="text-[11px] text-slate-400">Click any plot card or checkbox to select/unselect</span>
              </div>

              {filteredCandidates.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                  No plots match the search query "{searchQuery}". Try selecting <strong>"5 Marla"</strong> or clear search filters.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[440px] overflow-y-auto pr-1">
                  {filteredCandidates.map((item) => {
                    const selected = isItemInCompare(item);
                    const selIndex = activeProperties.findIndex(p => p.id === item.id || (p.plotNumber && p.plotNumber === item.plotNumber));
                    const ratePerMarla = Math.round(item.pricePKR / (item.sizeMarla || 1));

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggleCandidate(item)}
                        className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                          selected
                            ? 'bg-emerald-50/90 border-emerald-500 shadow-xs ring-1 ring-emerald-500'
                            : 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-2">
                          {/* Top Row: Plot #, Size, Checkbox */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono font-extrabold text-[11px]">
                                {item.plotNumber ? `Plot #${item.plotNumber}` : `Unit #${item.id.slice(-4).toUpperCase()}`}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold text-[11px] border border-amber-200">
                                {item.sizeMarla} Marla
                              </span>
                              {item.type === 'commercial' && (
                                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-[10px]">
                                  Commercial
                                </span>
                              )}
                            </div>

                            {/* Checkbox indicator */}
                            <div className="shrink-0 pt-0.5">
                              {selected ? (
                                <div className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-md">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  <span>#{selIndex + 1}</span>
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-md border border-slate-300 group-hover:border-slate-400 flex items-center justify-center text-transparent hover:text-slate-400">
                                  <Plus className="w-3.5 h-3.5 text-slate-400" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Society & Sector Location */}
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-emerald-800 transition line-clamp-1">
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3 text-emerald-700 shrink-0" />
                              <span className="font-semibold text-slate-700">{item.societyName}</span>
                              <span>• {item.sector || 'Sector A'}</span>
                            </p>
                          </div>

                          {/* Features Tags */}
                          <div className="flex flex-wrap gap-1">
                            {(item.amenities || []).slice(0, 2).map((feat, idx) => (
                              <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 font-medium px-1.5 py-0.5 rounded">
                                {feat}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Bottom Row: Price & Rate */}
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Demand</span>
                            <span className="font-extrabold text-slate-900 font-mono">
                              PKR {item.pricePKR.toLocaleString('en-PK')}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Rate / Marla</span>
                            <span className="font-bold text-emerald-800 font-mono text-[11px]">
                              PKR {ratePerMarla.toLocaleString('en-PK')}
                            </span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* ========================================================================= */}
          {/* SECTION 2: SIDE-BY-SIDE COMPARISON MATRIX (1 to 6 Columns)                */}
          {/* ========================================================================= */}
          <div ref={matrixSectionRef} className="space-y-4 pt-2">
            
            {activeProperties.length === 0 ? (
              <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-4 bg-white rounded-3xl border border-slate-200 shadow-xs p-8">
                <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-slate-400">
                  <Scale className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-extrabold font-[Outfit] text-slate-900">
                  No Plots Selected for Comparison
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Use the search panel above to select 5–6 plots or click the button below to auto-load 5-Marla residential plots for side-by-side evaluation.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    id="btn-load-5-marla-empty"
                    type="button"
                    onClick={handleSelectFiveMarlaPlots}
                    className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>Auto-Compare 5 Marla Plots</span>
                  </button>
                  <button
                    id="btn-explore-marketplace-empty-compare"
                    type="button"
                    onClick={() => onNavigate('/marketplace')}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition border border-slate-200 cursor-pointer"
                  >
                    Explore Marketplace
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="text-xs text-slate-700 font-semibold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span>Comparing <strong>{activeProperties.length} of 6</strong> Plots & Properties Side-by-Side</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Save comparison button */}
                    <button
                      id="btn-open-save-comparison-modal"
                      type="button"
                      onClick={() => {
                        if (isPublicBuyer) {
                          onNavigate('/login');
                        } else {
                          setSaveTitle(`Comparison of ${activeProperties.map(p => p.title.slice(0, 15)).join(', ')}`);
                          setShowSaveModal(true);
                        }
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition shadow-2xs cursor-pointer"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                      <span>Save Set</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>Print Sheet</span>
                    </button>

                    <button
                      id="btn-clear-all-compare"
                      type="button"
                      onClick={onClear}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Matrix</span>
                    </button>
                  </div>
                </div>

                {/* Key Insights Highlights Row */}
                {activeProperties.length > 1 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-emerald-800 tracking-wider flex items-center gap-1">
                        <TrendingDown className="w-3 h-3 text-emerald-600" />
                        <span>Lowest Rate / Marla</span>
                      </span>
                      <div className="font-extrabold text-emerald-950 text-sm font-mono">
                        PKR {lowestRatePerMarla.toLocaleString('en-PK')}
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-amber-800 tracking-wider flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-600" />
                        <span>Lowest Demand Price</span>
                      </span>
                      <div className="font-extrabold text-amber-950 text-sm font-mono">
                        PKR {lowestPrice.toLocaleString('en-PK')}
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-200 text-xs space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-blue-800 tracking-wider flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-blue-600" />
                        <span>Min Advance (20%)</span>
                      </span>
                      <div className="font-extrabold text-blue-950 text-sm font-mono">
                        PKR {lowestDownPayment.toLocaleString('en-PK')}
                      </div>
                    </div>

                    <div className="p-3 bg-purple-50/80 rounded-2xl border border-purple-200 text-xs space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-purple-800 tracking-wider flex items-center gap-1">
                        <Layers className="w-3 h-3 text-purple-600" />
                        <span>Largest Size</span>
                      </span>
                      <div className="font-extrabold text-purple-950 text-sm font-mono">
                        {largestArea} Marla
                      </div>
                    </div>
                  </div>
                )}

                {/* Comparison Matrix Table */}
                <div className="overflow-x-auto bg-white rounded-3xl border border-slate-200 shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/90">
                        <th className="p-4 w-44 min-w-[170px] font-black text-slate-500 uppercase tracking-wider text-[11px] sticky left-0 bg-slate-50/95 backdrop-blur-xs z-10">
                          Specification
                        </th>
                        {activeProperties.map((prop, idx) => {
                          const ratePerMarla = Math.round(prop.pricePKR / (prop.sizeMarla || 1));
                          const isLowestPrice = prop.pricePKR === lowestPrice && activeProperties.length > 1;
                          const isLowestRate = ratePerMarla === lowestRatePerMarla && activeProperties.length > 1;

                          return (
                            <th key={prop.id} className="p-4 min-w-[260px] max-w-[320px] align-top">
                              <div className="space-y-2.5">
                                <div className="relative h-36 rounded-2xl overflow-hidden bg-slate-100 group border border-slate-200">
                                  <img 
                                    src={prop.images && prop.images[0] ? prop.images[0] : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000'} 
                                    alt={prop.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                                  />
                                  <button
                                    type="button"
                                    onClick={() => onRemove(prop.id)}
                                    className="absolute top-2.5 right-2.5 bg-slate-900/80 hover:bg-rose-600 text-white p-1.5 rounded-full transition shadow-md cursor-pointer"
                                    title="Remove from comparison"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                  <div className="absolute bottom-2.5 left-2.5 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                                    Option #{idx + 1}
                                  </div>
                                </div>

                                <div>
                                  <button
                                    type="button"
                                    onClick={() => handleSelectProp(prop.id)}
                                    className="text-left font-extrabold text-slate-900 text-sm hover:text-emerald-800 transition line-clamp-1"
                                  >
                                    {prop.title}
                                  </button>
                                  <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1 mt-0.5">
                                    <Building2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                    <span className="truncate">{prop.societyName}</span>
                                  </div>
                                </div>

                                {/* Main Demand Price with badges */}
                                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase text-slate-500">Total Demand</span>
                                    {isLowestPrice && (
                                      <span className="text-[9px] bg-amber-100 text-amber-900 font-extrabold px-1.5 py-0.5 rounded">
                                        Best Price
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-base font-black text-amber-800 font-[Outfit]">
                                    PKR {prop.pricePKR.toLocaleString('en-PK')}
                                  </div>
                                </div>
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 text-xs">
                      
                      {/* Plot / Unit Number */}
                      <tr>
                        <td className="p-4 font-bold text-slate-500 bg-slate-50/50 sticky left-0 bg-slate-50/95 z-10">
                          Plot / Unit ID
                        </td>
                        {activeProperties.map(p => (
                          <td key={p.id} className="p-4 font-bold text-slate-900 font-mono">
                            {p.plotNumber ? `Plot #${p.plotNumber}` : `Unit #${p.id.slice(-4).toUpperCase()}`}
                          </td>
                        ))}
                      </tr>

                      {/* Sector & Block */}
                      <tr>
                        <td className="p-4 font-bold text-slate-500 bg-slate-50/50 sticky left-0 bg-slate-50/95 z-10">
                          Sector & Block
                        </td>
                        {activeProperties.map(p => (
                          <td key={p.id} className="p-4 text-slate-800 font-semibold">
                            {p.block || 'Executive'} Block • {p.sector || 'Sector A'}
                          </td>
                        ))}
                      </tr>

                      {/* Area Size */}
                      <tr>
                        <td className="p-4 font-bold text-slate-500 bg-slate-50/50 sticky left-0 bg-slate-50/95 z-10">
                          Area Size
                        </td>
                        {activeProperties.map(p => (
                          <td key={p.id} className="p-4">
                            <span className="font-extrabold text-slate-900 text-sm block">
                              {p.sizeMarla} Marla
                            </span>
                            <span className="text-slate-500 text-[11px]">
                              {p.sizeMarla * 225} Sq. Ft ({Math.round(p.sizeMarla * 25)} Sq. Yds)
                            </span>
                          </td>
                        ))}
                      </tr>

                      {/* Rate per Marla */}
                      <tr>
                        <td className="p-4 font-bold text-slate-500 bg-slate-50/50 sticky left-0 bg-slate-50/95 z-10">
                          Rate per Marla
                        </td>
                        {activeProperties.map(p => {
                          const rate = Math.round(p.pricePKR / (p.sizeMarla || 1));
                          const isBestRate = rate === lowestRatePerMarla && activeProperties.length > 1;

                          return (
                            <td key={p.id} className="p-4">
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-emerald-800 font-mono text-xs">
                                  PKR {rate.toLocaleString('en-PK')}
                                </span>
                                {isBestRate && (
                                  <span className="text-[9px] bg-emerald-100 text-emerald-900 font-extrabold px-1.5 py-0.5 rounded">
                                    Lowest
                                  </span>
                                )}
                              </div>
                              <span className="text-slate-500 text-[10px]"> / Marla</span>
                            </td>
                          );
                        })}
                      </tr>

                      {/* Down Payment & Installment Breakdown */}
                      <tr>
                        <td className="p-4 font-bold text-slate-500 bg-slate-50/50 sticky left-0 bg-slate-50/95 z-10">
                          Payment Plan (20% Advance)
                        </td>
                        {activeProperties.map(p => (
                          <td key={p.id} className="p-4 space-y-1">
                            <div className="text-[11px] text-slate-700">
                              Down Payment: <strong className="text-emerald-800 font-mono">PKR {Math.round(p.pricePKR * 0.20).toLocaleString('en-PK')}</strong>
                            </div>
                            <div className="text-[11px] text-slate-700">
                              Monthly (36 Mo): <strong className="text-amber-800 font-mono">PKR {Math.round((p.pricePKR * 0.80) / 36).toLocaleString('en-PK')}</strong>/mo
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* Plot Type & Orientation */}
                      <tr>
                        <td className="p-4 font-bold text-slate-500 bg-slate-50/50 sticky left-0 bg-slate-50/95 z-10">
                          Category & Access
                        </td>
                        {activeProperties.map(p => (
                          <td key={p.id} className="p-4 text-slate-800">
                            <div className="font-bold text-slate-900 capitalize">
                              {p.type === 'commercial' ? 'Commercial Zone' : 'Residential Demarcated'}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {p.roadWidth || '40-60 ft Sector Road'}
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* Verified Legal Status */}
                      <tr>
                        <td className="p-4 font-bold text-slate-500 bg-slate-50/50 sticky left-0 bg-slate-50/95 z-10">
                          Legal Verification
                        </td>
                        {activeProperties.map(p => (
                          <td key={p.id} className="p-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>LDA / TMA Approved</span>
                            </span>
                          </td>
                        ))}
                      </tr>

                      {/* Features & Key Amenities */}
                      <tr>
                        <td className="p-4 font-bold text-slate-500 bg-slate-50/50 sticky left-0 bg-slate-50/95 z-10">
                          Features & Amenities
                        </td>
                        {activeProperties.map(p => (
                          <td key={p.id} className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {(p.amenities || ['Gas Connection', 'Underground Electricity', '24/7 Security']).map((am, idx) => (
                                <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">
                                  {am}
                                </span>
                              ))}
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* Booking Action Entry Point */}
                      <tr>
                        <td className="p-4 font-bold text-slate-500 bg-slate-50/50 sticky left-0 bg-slate-50/95 z-10">
                          Action
                        </td>
                        {activeProperties.map(p => (
                          <td key={p.id} className="p-4 space-y-2">
                            <button
                              id={`btn-book-prop-from-matrix-${p.id}`}
                              type="button"
                              onClick={() => handleBook(p)}
                              className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Book Plot</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSelectProp(p.id)}
                              className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[11px] transition text-center cursor-pointer"
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
            )}
          </div>

        </div>
      )}

      {/* TAB 2: SAVED COMPARISONS ARCHIVE */}
      {activeTab === 'saved_history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-[Outfit]">
                Saved Comparison Sets ({userSavedComparisons.length})
              </h3>
              <p className="text-xs text-slate-500">
                Persistent comparison configurations saved to your customer account for future review.
              </p>
            </div>
          </div>

          {userSavedComparisons.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <FolderHeart className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">No Saved Comparisons Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Compare plots using the search tool or marketplace and click <strong>"Save Set"</strong> to save sets for quick retrieval.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userSavedComparisons.map((comp) => (
                <div key={comp.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-mono text-[10px]">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{comp.savedAt}</span>
                      </span>
                      <span className="bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200 text-[10px]">
                        {comp.plotsCount} Plots
                      </span>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-sm font-[Outfit] line-clamp-2">
                      {comp.title}
                    </h4>

                    {comp.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                        {comp.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      id={`btn-load-saved-comp-${comp.id}`}
                      type="button"
                      onClick={() => {
                        if (onLoadSavedComparison) {
                          onLoadSavedComparison(comp);
                        }
                        setActiveTab('current_matrix');
                      }}
                      className="flex-1 py-2 px-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>Load Matrix</span>
                    </button>

                    {onDeleteSavedComparison && (
                      <button
                        id={`btn-delete-saved-comp-${comp.id}`}
                        type="button"
                        onClick={() => onDeleteSavedComparison(comp.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-200 cursor-pointer"
                        title="Delete saved comparison"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SAVE COMPARISON MODAL */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-extrabold text-slate-900 font-[Outfit]">
                  Save Plot Comparison
                </h3>
              </div>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCurrentComparison} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Comparison Title *</label>
                <input
                  type="text"
                  required
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="e.g. 5 Marla Executive vs Sector B Corner"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Personal Notes / Budget Strategy</label>
                <textarea
                  rows={3}
                  value={saveNotes}
                  onChange={(e) => setSaveNotes(e.target.value)}
                  placeholder="e.g. Down payment budget PKR 600,000; check boulevard road facing."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-normal outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-600 space-y-1">
                <div className="font-bold text-slate-800">Included Listings ({activeProperties.length}):</div>
                <ul className="list-disc list-inside text-[11px] space-y-0.5">
                  {activeProperties.map(p => (
                    <li key={p.id} className="truncate">{p.title} ({p.societyName})</li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-save-comparison"
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-black rounded-xl transition flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Comparison</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
