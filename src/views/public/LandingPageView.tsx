import React, { useState } from 'react';
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
  Check
} from 'lucide-react';
import { copyToClipboard, getPropertyShareUrl } from '../../utils/shareUtils';
import { SharePropertyModal } from '../../components/common/SharePropertyModal';

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
  onOpenEstimator = () => onNavigate('/price-estimator')
}) => {
  const [searchSociety, setSearchSociety] = useState('');
  const [propertyType, setPropertyType] = useState('all');
  const [budgetMax, setBudgetMax] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareModalProperty, setShareModalProperty] = useState<Property | null>(null);
  const [landingToast, setLandingToast] = useState<string | null>(null);

  const handleCopyLink = async (e: React.MouseEvent, prop: Property) => {
    e.stopPropagation();
    const url = getPropertyShareUrl(prop.id);
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedId(prop.id);
      setLandingToast(`Link Copied! Shareable link for "${prop.title}" copied.`);
      setTimeout(() => {
        setCopiedId(null);
        setLandingToast(null);
      }, 2500);
    }
  };

  const handleShareClick = (e: React.MouseEvent, prop: Property) => {
    e.stopPropagation();
    setShareModalProperty(prop);
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('/marketplace');
  };

  const featuredProperties = properties.filter(p => p.featured && !p.isDuplicateFlagged);
  const totalPlotsCount = plots.length;
  const availablePlotsCount = plots.filter(p => p.status === 'available').length;

  return (
    <div className="space-y-16 pb-20 bg-slate-50">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pakistan's Premier Verified Housing & Real Estate Ecosystem</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Buy, Verify & Manage Real Estate with <span className="text-amber-400">100% Transparency</span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Eliminating duplicate allotments and manual registry delays. Explore masterplans, automate installment schedules, and verify legal NOC documentation in real-time.
          </p>

          {/* Quick Search Widget */}
          <form onSubmit={handleHeroSearch} className="max-w-4xl mx-auto mt-8 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-2xl border border-slate-200 text-slate-900">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-left">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Housing Society
                </label>
                <select
                  value={searchSociety}
                  onChange={(e) => setSearchSociety(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="">All Housing Societies</option>
                  {societies.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Property Category
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="all">Residential & Commercial</option>
                  <option value="house">Houses / Villas</option>
                  <option value="plot">Plots / Files</option>
                  <option value="commercial">Commercial Plazas</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Plot Size / Marla
                </label>
                <select
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="all">Any Size (3, 5, 7, 10 Marla)</option>
                  <option value="3">3 Marla</option>
                  <option value="5">5 Marla</option>
                  <option value="10">10 Marla</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition shadow-md cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Inventory</span>
                </button>
              </div>
            </div>
          </form>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800/80 text-left">
            <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
              <div className="text-2xl font-black text-amber-400">{societies.length}</div>
              <div className="text-xs text-slate-400">Verified Societies</div>
            </div>
            <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
              <div className="text-2xl font-black text-emerald-400">{availablePlotsCount} / {totalPlotsCount}</div>
              <div className="text-xs text-slate-400">Available Plots Ready</div>
            </div>
            <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
              <div className="text-2xl font-black text-blue-400">PKR 14.8M+</div>
              <div className="text-xs text-slate-400">Escrow Payments Tracked</div>
            </div>
            <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
              <div className="text-2xl font-black text-purple-400">0%</div>
              <div className="text-xs text-slate-400">Double-Booking Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Master-Planned Societies */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
              Registered Housing Societies
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Master-Planned Communities Across Pakistan
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/societies')}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 cursor-pointer"
          >
            <span>View All Societies</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {societies.map((soc) => (
            <div 
              key={soc.id}
              onClick={() => onSelectSociety(soc.id)}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition overflow-hidden group cursor-pointer flex flex-col"
            >
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <img 
                  src={soc.heroImage} 
                  alt={soc.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-900/90 text-white shadow-xs">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    {soc.approvalStatus.toUpperCase()}
                  </span>
                </div>
                {soc.nocNumber && (
                  <div className="absolute bottom-2 right-2 bg-slate-900/80 text-[10px] font-mono text-slate-200 px-2 py-0.5 rounded">
                    NOC: {soc.nocNumber.split('/')[2] || soc.nocNumber}
                  </div>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition line-clamp-1">
                    {soc.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{soc.location}</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-1 text-center text-xs">
                  <div>
                    <div className="font-bold text-slate-800">{soc.availablePlots}</div>
                    <div className="text-[10px] text-slate-400">Available</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{soc.reservedPlots}</div>
                    <div className="text-[10px] text-slate-400">Reserved</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{soc.soldPlots}</div>
                    <div className="text-[10px] text-slate-400">Sold</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-emerald-800 font-bold pt-1">
                  <span>Explore Masterplan Map</span>
                  <ChevronRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-1 transition" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
              Top Listings
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Properties & Villa Deals
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/marketplace')}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 cursor-pointer"
          >
            <span>Browse Full Marketplace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProperties.slice(0, 3).map((prop) => (
            <div
              key={prop.id}
              onClick={() => onSelectProperty(prop.id)}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition overflow-hidden group cursor-pointer flex flex-col"
            >
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img 
                  src={prop.images[0]} 
                  alt={prop.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/90 text-white uppercase">
                    {prop.type}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono">
                    {prop.sizeMarla} Marla
                  </span>
                </div>

                {/* Quick Copy Link & Share Overlay on Card */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                  <button
                    type="button"
                    onClick={(e) => handleCopyLink(e, prop)}
                    className={`p-1.5 rounded-lg backdrop-blur-md transition shadow-xs cursor-pointer ${
                      copiedId === prop.id
                        ? 'bg-emerald-700 text-white'
                        : 'bg-white/90 hover:bg-white text-slate-700'
                    }`}
                    title={copiedId === prop.id ? 'Link Copied!' : 'Copy Property Link'}
                  >
                    {copiedId === prop.id ? <Check className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleShareClick(e, prop)}
                    className="p-1.5 rounded-lg backdrop-blur-md bg-white/90 hover:bg-white text-slate-700 hover:text-emerald-800 transition shadow-xs cursor-pointer"
                    title="Share on WhatsApp & Socials"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition line-clamp-2">
                    {prop.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{prop.location}</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Price</div>
                    <div className="text-base font-extrabold text-emerald-800">
                      PKR {prop.pricePKR.toLocaleString('en-PK')}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button 
                      type="button"
                      onClick={(e) => handleCopyLink(e, prop)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        copiedId === prop.id 
                          ? 'bg-emerald-700 text-white' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {copiedId === prop.id ? <Check className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
                      <span>{copiedId === prop.id ? 'Copied!' : 'Copy'}</span>
                    </button>
                    <button className="px-3 py-1.5 bg-emerald-800 text-white hover:bg-emerald-900 rounded-lg text-xs font-bold transition">
                      View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Estimator & Innovation Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Smart Valuation Engine</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Curious What Your Plot or Property is Worth Today?
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Calculate instant data-driven fair market estimates based on historical society transactions, corner premium rates, development density, and boulevard frontage.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={onOpenEstimator}
                className="flex items-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Free AI Price Estimator</span>
              </button>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 max-w-sm w-full space-y-3 text-xs">
            <div className="font-bold text-amber-300 flex items-center justify-between">
              <span>Sample Valuation Model</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">94% Confidence</span>
            </div>
            <div className="space-y-1.5 text-slate-200">
              <div className="flex justify-between">
                <span>Location:</span>
                <span className="font-semibold text-white">Al-Rehman Garden (5 Marla)</span>
              </div>
              <div className="flex justify-between">
                <span>Base Market Rate:</span>
                <span className="font-semibold text-white">PKR 2,450,000</span>
              </div>
              <div className="flex justify-between text-amber-300">
                <span>Corner & Boulevard Index:</span>
                <span className="font-semibold">+ PKR 300,000</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-white text-sm">
                <span>Estimated True Value:</span>
                <span className="text-emerald-400">PKR 2,750,000</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Share Property Modal */}
      {shareModalProperty && (
        <SharePropertyModal
          isOpen={!!shareModalProperty}
          property={shareModalProperty}
          onClose={() => setShareModalProperty(null)}
          onToast={(msg) => {
            setLandingToast(msg);
            setTimeout(() => setLandingToast(null), 3000);
          }}
        />
      )}

      {/* Floating Action Toast Alert */}
      {landingToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl font-bold text-xs shadow-2xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>{landingToast}</span>
        </div>
      )}
    </div>
  );
};
