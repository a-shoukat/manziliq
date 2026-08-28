import React, { useState, useMemo } from 'react';
import { Society, Property, Plot, User } from '../../types';
import { 
  Building2, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  Layers, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  FileText,
  Lock,
  ChevronRight,
  Users,
  Compass,
  Star,
  Share2,
  Link as LinkIcon,
  Check,
  Calculator,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Award,
  Maximize2
} from 'lucide-react';
import { HomePropertyCard } from '../../components/home/HomePropertyCard';
import { HomeFilterBar, HomeFilterCriteria } from '../../components/home/HomeFilterBar';
import { HomeComparisonDrawer } from '../../components/home/HomeComparisonDrawer';
import { HomeAiValuationWidget } from '../../components/home/HomeAiValuationWidget';
import { HomeVerifiedNocSection } from '../../components/home/HomeVerifiedNocSection';
import { HomeAboutUsSection } from '../../components/home/HomeAboutUsSection';
import { SharePropertyModal } from '../../components/common/SharePropertyModal';
import { ManzilIQLogo } from '../../components/common/ManzilIQLogo';
import { formatPKRNumber } from '../../utils/shareUtils';

interface LandingPageViewProps {
  societies: Society[];
  properties: Property[];
  plots: Plot[];
  currentUser?: User;
  onNavigate: (route: string) => void;
  onSelectProperty?: (id: string) => void;
  onSelectSociety?: (id: string) => void;
  onOpenEstimator?: () => void;
  wishlistIds?: string[];
  compareIds?: string[];
  onToggleWishlist?: (property: Property) => void;
  onToggleCompare?: (property: Property) => void;
  onInitiateBooking?: (bookingInfo: { plotId: string; title: string; price: number; downPayment: number; societyName: string }) => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  societies,
  properties,
  plots,
  currentUser,
  onNavigate,
  onSelectProperty = (id: string) => onNavigate(`/property/${id}`),
  onSelectSociety = (id: string) => onNavigate(`/society/${id}`),
  onOpenEstimator = () => onNavigate('/price-estimator'),
  onInitiateBooking,
}) => {
  // Hero Search Quick Form State
  const [heroTab, setHeroTab] = useState<'all' | 'plot' | 'house' | 'commercial'>('all');
  const [heroSearchCity, setHeroSearchCity] = useState<string>('all');
  const [heroSearchSociety, setHeroSearchSociety] = useState<string>('all');

  // Client-Side Real-time Filter State
  const [filterCriteria, setFilterCriteria] = useState<HomeFilterCriteria>({
    searchTerm: '',
    city: 'all',
    category: 'all',
    minSizeMarla: 0,
    maxSizeMarla: 30,
    minPricePKR: 0,
    maxPricePKR: 50000000,
    statuses: [],
  });

  // Comparison State (Home Page Specific Matrix)
  const [comparedProperties, setComparedProperties] = useState<Property[]>([]);

  // Share & Toast Notification States
  const [shareModalProperty, setShareModalProperty] = useState<Property | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Installment Calculator State
  const [calcMarla, setCalcMarla] = useState<number>(5);
  const [calcTenureMonths, setCalcTenureMonths] = useState<number>(36);
  const [calcSocietyId, setCalcSocietyId] = useState<string>(societies[0]?.id || 'soc-1');

  // FAQ Accordion State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Distinct cities list
  const citiesList = useMemo(() => {
    const set = new Set<string>();
    societies.forEach(s => { if (s.city) set.add(s.city); });
    properties.forEach(p => { if (p.city) set.add(p.city); });
    return Array.from(set);
  }, [societies, properties]);

  // Handle hero quick search submit
  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilterCriteria(prev => ({
      ...prev,
      category: heroTab,
      city: heroSearchCity,
      searchTerm: heroSearchSociety !== 'all' ? (societies.find(s => s.id === heroSearchSociety)?.name || '') : prev.searchTerm,
    }));
    // Smooth scroll down to listings section
    const listingsEl = document.getElementById('home-listings-section');
    if (listingsEl) {
      listingsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Real-time client-side filtering on fetched dataset
  const filteredProperties = useMemo(() => {
    return properties.filter(prop => {
      // 1. Search term (title, location, societyName, propertyId)
      if (filterCriteria.searchTerm) {
        const term = filterCriteria.searchTerm.toLowerCase();
        const matchesTitle = prop.title.toLowerCase().includes(term);
        const matchesLoc = prop.location.toLowerCase().includes(term);
        const matchesSoc = (prop.societyName || '').toLowerCase().includes(term);
        const matchesId = (prop.propertyId || prop.id).toLowerCase().includes(term);
        if (!matchesTitle && !matchesLoc && !matchesSoc && !matchesId) return false;
      }

      // 2. City filter
      if (filterCriteria.city !== 'all') {
        const propCity = prop.city || (societies.find(s => s.id === prop.societyId)?.city) || '';
        if (propCity.toLowerCase() !== filterCriteria.city.toLowerCase()) return false;
      }

      // 3. Category filter
      if (filterCriteria.category !== 'all') {
        const cat = (prop.category || prop.type).toLowerCase();
        if (filterCriteria.category === 'plot' && !cat.includes('plot')) return false;
        if (filterCriteria.category === 'house' && !cat.includes('house') && !cat.includes('villa')) return false;
        if (filterCriteria.category === 'commercial' && !cat.includes('commercial') && !cat.includes('plaza')) return false;
      }

      // 4. Size Marla
      if (prop.sizeMarla > filterCriteria.maxSizeMarla) return false;

      // 5. Price Range
      if (prop.pricePKR > filterCriteria.maxPricePKR) return false;
      if (filterCriteria.minPricePKR > 0 && prop.pricePKR < filterCriteria.minPricePKR) return false;

      // 6. Status Multi-select Chips
      if (filterCriteria.statuses.length > 0) {
        const currentStatus = prop.listingStatus || 'available';
        if (!filterCriteria.statuses.includes(currentStatus)) return false;
      }

      return true;
    });
  }, [properties, filterCriteria, societies]);

  // Toggle Property in comparison drawer (Max 3)
  const handleToggleCompare = (property: Property) => {
    setComparedProperties(prev => {
      const exists = prev.some(p => p.id === property.id);
      if (exists) {
        return prev.filter(p => p.id !== property.id);
      }
      if (prev.length >= 3) {
        showToast('Comparison limit: You can compare up to 3 properties at a time.');
        return prev;
      }
      showToast(`Added "${property.title}" to Compare Matrix`);
      return [...prev, property];
    });
  };

  const handleRemoveCompare = (id: string) => {
    setComparedProperties(prev => prev.filter(p => p.id !== id));
  };

  const handleClearCompare = () => {
    setComparedProperties([]);
  };

  // Calculator computations
  const selectedCalcSociety = societies.find(s => s.id === calcSocietyId) || societies[0];
  const avgMarlaPrice = selectedCalcSociety ? 550000 : 500000;
  const calcTotalPrice = calcMarla * avgMarlaPrice;
  const calcDownPayment = Math.round(calcTotalPrice * (selectedCalcSociety?.downPaymentPercent ? selectedCalcSociety.downPaymentPercent / 100 : 0.20));
  const calcRemaining = calcTotalPrice - calcDownPayment;
  const calcMonthlyInstallment = Math.round(calcRemaining / calcTenureMonths);

  const faqs = [
    {
      q: "Are all housing societies on MANZILIQ approved by LDA, CDA, or local TMAs?",
      a: "Yes! Every housing society listed on MANZILIQ undergoes strict legal auditing against official Development Authorities (LDA, CDA, RDA, FDA) and Tehsil Municipal Administrations (TMA) records before being approved for digital allotment."
    },
    {
      q: "How does the online plot booking and 20% down payment escrow process work?",
      a: "Select your desired plot from the Interactive Masterplan map, review the transparent down payment breakdown, and initiate online payment via EasyPaisa, JazzCash, or bank wire. Funds are held in escrow until your QR-coded allotment deed is registered."
    },
    {
      q: "How does the AI Price Valuation engine estimate plot market rates?",
      a: "Our heuristic machine learning model analyzes recent verified property sales in major housing societies, factoring in plot dimensions, boulevard width, proximity to civic amenities, and sector development status."
    },
    {
      q: "What legal documents do I receive after completing plot booking?",
      a: "You receive an official QR-verified Allotment Deed, a digital Booking Agreement with society stamp, and a downloadable payment schedule ledger."
    }
  ];

  return (
    <div className="space-y-16 pb-24 bg-slate-50 text-slate-900 min-h-screen">
      
      {/* 1. HERO PORTAL BANNER (High-End Real Estate Portal Backdrop) */}
      <section className="relative text-white pt-16 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Real Estate Architectural Background Image Layer */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000"
            alt="Luxury Real Estate Architectural Horizon"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center scale-105 transform duration-1000"
          />
          {/* Deep Sapphire & Charcoal Gradient Overlay for Ultimate Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/92 via-slate-950/88 to-slate-950" />
          <div className="absolute inset-0 bg-radial-at-c from-blue-600/15 via-transparent to-black/60 pointer-events-none" />
        </div>

        {/* Geometric subtle grid backdrop */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f59e0b_1.2px,transparent_1.2px)] [background-size:28px_28px] pointer-events-none z-0" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl pointer-events-none z-0" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none z-0" />

        <div className="max-w-6xl mx-auto text-center relative z-10 space-y-7">
          
          {/* Prominent Official MANZIL IQ Brand Crest Card */}
          <div className="flex justify-center">
            <ManzilIQLogo variant="hero" size="md" theme="dark" showTagline={true} />
          </div>

          {/* Main Display Headline */}
          <div className="space-y-3 max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-[Outfit] tracking-tight text-white leading-tight">
              Pakistan’s Premier NOC-Verified <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">Smart Property Network</span>
            </h1>
            <p className="text-sm sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Explore TMA & LDA approved masterplans, verify official NOC registries, calculate fair market AI valuations, and automate flexible installment schedules.
            </p>
          </div>

          {/* Quick Search Portal Card */}
          <div className="max-w-4xl mx-auto bg-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-200 text-slate-900 text-left space-y-4">
            
            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
              {[
                { id: 'all', label: 'All Inventory' },
                { id: 'plot', label: 'Residential Plots' },
                { id: 'house', label: 'Luxury Villas / Houses' },
                { id: 'commercial', label: 'Commercial Plazas' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setHeroTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                    heroTab === tab.id
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Form Inputs Row */}
            <form onSubmit={handleHeroSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-12 gap-3 items-end">
              
              {/* City Selection */}
              <div className="lg:col-span-4">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  City / Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={heroSearchCity}
                    onChange={(e) => setHeroSearchCity(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-900"
                  >
                    <option value="all">All Cities in Pakistan</option>
                    {citiesList.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Society Selection */}
              <div className="lg:col-span-5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Housing Society
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={heroSearchSociety}
                    onChange={(e) => setHeroSearchSociety(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-900"
                  >
                    <option value="all">All Verified Housing Societies</option>
                    {societies.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.city})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search Submit CTA */}
              <div className="lg:col-span-3">
                <button
                  type="submit"
                  id="btn-hero-search-submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition cursor-pointer active:scale-95"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Properties</span>
                </button>
              </div>

            </form>

          </div>

          {/* High-Impact Trust Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 text-center text-slate-300">
            <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
              <div className="text-xl sm:text-2xl font-black font-[Outfit] text-amber-400">100%</div>
              <div className="text-[11px] font-semibold text-slate-300">NOC Audited Societies</div>
            </div>
            <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
              <div className="text-xl sm:text-2xl font-black font-[Outfit] text-white">2,400+</div>
              <div className="text-[11px] font-semibold text-slate-300">Plots Mapped in 3D</div>
            </div>
            <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
              <div className="text-xl sm:text-2xl font-black font-[Outfit] text-emerald-400">0.00%</div>
              <div className="text-[11px] font-semibold text-slate-300">Duplicate Allotment Rate</div>
            </div>
            <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
              <div className="text-xl sm:text-2xl font-black font-[Outfit] text-white">24/7</div>
              <div className="text-[11px] font-semibold text-slate-300">Digital Ledger & Escrow</div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. VERIFIED HOUSING SOCIETIES & MASTERPLANS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HomeVerifiedNocSection
          societies={societies}
          onSelectSociety={onSelectSociety}
          onToast={showToast}
        />
      </section>

      {/* 3. REAL-TIME FILTER BAR & FEATURED PROPERTY LISTINGS */}
      <section id="home-listings-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>Direct Society Allotments & Verified Resale</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-[Outfit] text-slate-900 tracking-tight">
              Featured Properties & Available Plots
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl">
              Real-time available inventory with single-click legal verification, clear road specifications, and transparent prices.
            </p>
          </div>

          <div className="text-xs font-bold text-slate-500">
            Updated in real-time from masterplan ledgers
          </div>
        </div>

        {/* Real-time Debounced Filter Bar */}
        <HomeFilterBar
          initialCriteria={filterCriteria}
          onFilterChange={setFilterCriteria}
          totalResultsCount={filteredProperties.length}
          citiesList={citiesList}
        />

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">No matching properties found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try loosening your filter criteria, broadening the Marla plot size, or increasing the budget ceiling.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFilterCriteria({
                searchTerm: '',
                city: 'all',
                category: 'all',
                minSizeMarla: 0,
                maxSizeMarla: 30,
                minPricePKR: 0,
                maxPricePKR: 50000000,
                statuses: [],
              })}
              className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold hover:bg-blue-950 transition cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map(property => {
              const isCompared = comparedProperties.some(p => p.id === property.id);

              return (
                <HomePropertyCard
                  key={property.id}
                  property={property}
                  isCompared={isCompared}
                  onToggleCompare={handleToggleCompare}
                  onSelectProperty={onSelectProperty}
                  onToast={showToast}
                />
              );
            })}
          </div>
        )}

      </section>

      {/* 4. INTERACTIVE AI MARKET PRICE VALUATION ENGINE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HomeAiValuationWidget
          societies={societies}
          onOpenFullEstimator={onOpenEstimator}
        />
      </section>

      {/* 5. INTERACTIVE EASY INSTALLMENT CALCULATOR WIDGET */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-10 space-y-8 overflow-hidden">
          {/* Architectural Background Photo */}
          <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1600"
              alt="Contemporary Villa Design"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-white/60" />
          </div>
          
          <div className="relative z-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  <span>Financial Planning Tool</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black font-[Outfit] text-slate-900 tracking-tight">
                  Plot Installment & Down Payment Calculator
                </h2>
                <p className="text-sm text-slate-600 max-w-2xl">
                  Simulate monthly installment commitments across approved housing societies with transparent down payments.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Controls (7 Cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Society Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Select Housing Society
                </label>
                <select
                  value={calcSocietyId}
                  onChange={(e) => setCalcSocietyId(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-900"
                >
                  {societies.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.city})</option>
                  ))}
                </select>
              </div>

              {/* Marla Size Buttons */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Plot Size: <span className="text-blue-900 font-extrabold">{calcMarla} Marla</span> ({calcMarla * 225} sq. ft.)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 5, 10, 20].map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setCalcMarla(size)}
                      className={`py-2 px-3 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                        calcMarla === size
                          ? 'bg-blue-900 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {size} Marla
                    </button>
                  ))}
                </div>
              </div>

              {/* Tenure Duration */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Installment Plan Duration: <span className="text-emerald-800 font-extrabold">{calcTenureMonths} Months ({calcTenureMonths / 12} Years)</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[12, 24, 36, 48].map(months => (
                    <button
                      key={months}
                      type="button"
                      onClick={() => setCalcTenureMonths(months)}
                      className={`py-2 px-3 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                        calcTenureMonths === months
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {months} Months
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Summary Box (5 Cols) */}
            <div className="lg:col-span-5 bg-slate-900 text-white p-6 sm:p-7 rounded-3xl space-y-4 shadow-xl border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-amber-400">Payment Breakdown</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  {selectedCalcSociety?.name}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Estimated Total Plot Value:</span>
                  <span className="font-extrabold font-mono text-white text-sm">
                    PKR {calcTotalPrice.toLocaleString('en-PK')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                  <span className="text-slate-300">Down Payment ({selectedCalcSociety?.downPaymentPercent || 20}%):</span>
                  <span className="font-extrabold font-mono text-amber-400 text-sm">
                    PKR {calcDownPayment.toLocaleString('en-PK')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Monthly Installment ({calcTenureMonths}x):</span>
                  <span className="font-black font-mono text-emerald-400 text-base">
                    PKR {calcMonthlyInstallment.toLocaleString('en-PK')} / mo
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectSociety(calcSocietyId)}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <span>View Masterplan & Book Online</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* 6. ABOUT US & EXECUTIVE LEADERSHIP SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HomeAboutUsSection />
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS (FAQ) ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wider">
            <span>Help & Assurance</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-[Outfit] text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Clear answers about land registry verification, NOC approvals, and digital payments.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = expandedFaq === index;
            return (
              <div 
                key={index}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between gap-4 cursor-pointer hover:text-blue-900"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-blue-900 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. STICKY COMPARISON DRAWER & MATRIX MODAL */}
      <HomeComparisonDrawer
        selectedProperties={comparedProperties}
        onRemoveProperty={handleRemoveCompare}
        onClearAll={handleClearCompare}
        onSelectProperty={onSelectProperty}
      />

      {/* 9. SHARE PROPERTY MODAL */}
      {shareModalProperty && (
        <SharePropertyModal
          isOpen={Boolean(shareModalProperty)}
          property={shareModalProperty}
          onClose={() => setShareModalProperty(null)}
          onToast={showToast}
        />
      )}

      {/* 10. FLOATING ACTION TOAST ALERT */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl font-bold text-xs shadow-2xl border border-slate-700 flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
