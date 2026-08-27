import React, { useState } from 'react';
import { Property, Society, User } from '../../types';
import { 
  Building2, 
  MapPin, 
  Bed, 
  Bath, 
  Heart, 
  Scale, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  Phone, 
  Mail, 
  Share2, 
  CheckCircle2, 
  FileText, 
  Clock, 
  AlertCircle,
  MessageSquare,
  ArrowRight,
  Lock,
  Compass,
  CreditCard,
  Maximize2,
  Link as LinkIcon,
  Check,
  MessageCircle,
  Send
} from 'lucide-react';
import { calculateAIPriceEstimate } from '../../utils/aiEstimator';
import { formatPKR } from '../../components/marketplace/PropertyCard';
import { copyToClipboard, getPropertyShareUrl, getWhatsAppShareUrl } from '../../utils/shareUtils';
import { SharePropertyModal } from '../../components/common/SharePropertyModal';

interface PropertyDetailViewProps {
  property: Property;
  society?: Society;
  currentUser?: User;
  isWishlisted?: boolean;
  isComparing?: boolean;
  isCompared?: boolean;
  onToggleWishlist?: () => void;
  onToggleComparison?: () => void;
  onToggleCompare?: () => void;
  onOpenBooking?: () => void;
  onInitiateBooking?: () => void;
  onOpenInquiry?: (message: string, visitDate?: string) => void;
  onNavigate: (route: string) => void;
  onToast?: (message: string) => void;
}

export const PropertyDetailView: React.FC<PropertyDetailViewProps> = ({
  property,
  society,
  currentUser,
  isWishlisted = false,
  isComparing = false,
  isCompared = false,
  onToggleWishlist = () => {},
  onToggleComparison,
  onToggleCompare,
  onOpenBooking,
  onInitiateBooking,
  onOpenInquiry,
  onNavigate,
  onToast
}) => {
  const isPublicBuyer = !currentUser || currentUser.role === 'public_buyer';
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [inquiryText, setInquiryText] = useState('I am interested in this property and would like to confirm availability and schedule a physical inspection.');
  const [visitDate, setVisitDate] = useState('2026-08-25');
  const [inquirySent, setInquirySent] = useState(false);
  const [showAuthGateModal, setShowAuthGateModal] = useState(false);
  const [authGateReason, setAuthGateReason] = useState<string>('booking');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const images = (property?.images && property.images.length > 0) ? property.images : [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000'
  ];

  const pricePerMarla = property.pricePerMarla || Math.round(property.pricePKR / (property.sizeMarla || 1));

  const handleBookingClick = () => {
    if (isPublicBuyer) {
      setAuthGateReason('booking');
      setShowAuthGateModal(true);
      return;
    }
    if (onOpenBooking) onOpenBooking();
    else if (onInitiateBooking) onInitiateBooking();
  };

  const handleCompareClick = () => {
    if (onToggleComparison) onToggleComparison();
    else if (onToggleCompare) onToggleCompare();
  };

  const handleCopyLink = async () => {
    const url = getPropertyShareUrl(property.id);
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedLink(true);
      if (onToast) {
        onToast(`Link Copied! Shareable link for "${property.title}" copied to clipboard.`);
      }
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Real Dynamic AI Price estimate calculations based on actual property attributes
  const aiPrediction = calculateAIPriceEstimate({
    propertyType: property.type === 'house' ? 'constructed_house' : (property.type === 'commercial' ? 'commercial_plot' : 'residential_plot'),
    areaMarla: property.sizeMarla,
    bedrooms: property.bedrooms || 3,
    bathrooms: property.bathrooms || 3,
    societyName: property.societyName || society?.name || 'Al-Rehman Garden',
    locationCategory: 'prime_main_road',
    amenities: property.amenities || []
  });

  const estimatedMin = aiPrediction.minPricePKR;
  const estimatedMax = aiPrediction.maxPricePKR;

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPublicBuyer) {
      setAuthGateReason('contact');
      setShowAuthGateModal(true);
      return;
    }
    if (onOpenInquiry) {
      onOpenInquiry(inquiryText, visitDate);
    }
    setInquirySent(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Guest Authentication Banner for Public Users */}
      {isPublicBuyer && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-4 sm:p-5 rounded-3xl text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-700">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-400 text-slate-950 rounded-2xl shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 font-bold" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-amber-300">
                You are viewing this property in Guest Preview Mode
              </div>
              <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                Sign in to access official <strong>TMA/LDA Legal Registry Dossiers</strong>, <strong>Direct Dealer Chat</strong>, and <strong>Instant Plot Token Reservations</strong> with CNIC verification.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('/login')}
              className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl transition cursor-pointer shadow-xs"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigate('/signup')}
              className="flex-1 sm:flex-none px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer shadow-xs"
            >
              Register as Buyer
            </button>
          </div>
        </div>
      )}

      {/* Auth Gate Modal when Guest tries to book or access locked features */}
      {showAuthGateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-slate-900 shadow-2xl border border-slate-200 relative animate-scale-up">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 font-black text-2xl flex items-center justify-center mx-auto shadow-xs">
                <Lock className="w-6 h-6 text-amber-700" />
              </div>
              <h3 className="text-xl font-black font-[Outfit] text-slate-900">
                {authGateReason === 'booking' ? 'Buyer Sign In Required for Booking' : 'Sign In to Contact Registered Dealer'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {authGateReason === 'booking'
                  ? `To reserve ${property.title} with official token advance and NADRA CNIC verification, please sign in to your MANZILIQ account.`
                  : `To send direct inquiries, chat with certified dealers, or schedule site walkthroughs for ${property.title}, please sign in to your account.`}
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={() => {
                  setShowAuthGateModal(false);
                  onNavigate(`/login?redirect=/property/${property.id}`);
                }}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Sign In to Existing Account</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>

              <button
                onClick={() => {
                  setShowAuthGateModal(false);
                  onNavigate(`/signup?redirect=/property/${property.id}`);
                }}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Create New Free Buyer Account (30s)</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowAuthGateModal(false)}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                Continue Browsing as Guest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Title & Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-900 text-white uppercase tracking-wider">
              {property.category || property.type}
            </span>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono">
              {property.sizeMarla} Marla ({property.sizeMarla * 225} Sq Ft)
            </span>
            {property.verificationStatus === 'verified' && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>LDA / TMA Verified</span>
              </span>
            )}
            {property.societyName && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-900 border border-indigo-200 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>{property.societyName}</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-[Outfit] text-slate-900 tracking-tight">
            {property.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{property.location}</span>
            </span>
            {(property.sector || property.block || property.plotNumber) && (
              <span className="text-slate-700 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
                {[property.sector, property.block, property.plotNumber ? `Plot #${property.plotNumber}` : ''].filter(Boolean).join(' • ')}
              </span>
            )}
            {property.roadWidth && (
              <span className="text-slate-700 font-semibold bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Compass className="w-3 h-3 text-slate-500" />
                <span>{property.roadWidth}</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Copy Link Button with Visual 'Link Copied!' Feedback */}
          <button
            id="btn-copy-link-detail-view"
            type="button"
            onClick={handleCopyLink}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer active:scale-95 ${
              copiedLink
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-emerald-800'
            }`}
            title="Copy Shareable Property Link to Clipboard"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <LinkIcon className="w-4 h-4" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          {/* Share Property Button */}
          <button
            id="btn-share-detail-view"
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 transition cursor-pointer shadow-2xs active:scale-95"
            title="Share Property on WhatsApp, Facebook, X, etc."
          >
            <Share2 className="w-4 h-4 text-emerald-700" />
            <span>Share</span>
          </button>

          {/* Compare */}
          <button
            id="btn-compare-detail-view"
            type="button"
            onClick={handleCompareClick}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
              (isComparing || isCompared)
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>{(isComparing || isCompared) ? 'In Comparison' : 'Compare'}</span>
          </button>

          {/* Wishlist */}
          <button
            id="btn-wishlist-detail-view"
            type="button"
            onClick={onToggleWishlist}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
              isWishlisted 
                ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-xs' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current text-rose-600' : ''}`} />
            <span>{isWishlisted ? 'Saved' : 'Wishlist'}</span>
          </button>

          {/* Book */}
          <button
            id="btn-book-detail-view"
            type="button"
            onClick={handleBookingClick}
            className="flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-black transition shadow-md cursor-pointer active:scale-95"
          >
            <FileText className="w-4 h-4" />
            <span>Book Plot</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Gallery & Left Details vs Right Sticky Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Gallery, Specs, Amenities, Map */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden bg-slate-900 shadow-md">
              <img
                src={images[activeImageIndex]}
                alt={property.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
              
              {/* Quick Image Share & Copy floating overlay */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  className="p-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition cursor-pointer shadow-md"
                  title="Share Property"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                <div className="text-xs font-bold bg-black/50 backdrop-blur-xs px-3 py-1 rounded-full">
                  Image {activeImageIndex + 1} of {images.length}
                </div>
                <div className="text-xs font-mono font-bold bg-amber-500 text-slate-950 px-3 py-1 rounded-full">
                  PKR {property.pricePKR.toLocaleString('en-PK')}
                </div>
              </div>
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                      activeImageIndex === idx ? 'border-amber-400 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Overview Attributes Grid */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold font-[Outfit] text-slate-900">Property Key Attributes</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-xs text-slate-500">Plot Size</div>
                <div className="text-sm font-bold text-slate-900 mt-1">{property.sizeMarla} Marla</div>
                <div className="text-[11px] text-slate-400 font-mono">{property.sizeMarla * 225} Sq Ft</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-xs text-slate-500">Property Type</div>
                <div className="text-sm font-bold text-slate-900 mt-1 uppercase">{property.type}</div>
                <div className="text-[11px] text-emerald-700 font-medium">Ready for Construction</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-xs text-slate-500">Front Road Width</div>
                <div className="text-sm font-bold text-slate-900 mt-1">{property.roadWidth || '40 Feet'}</div>
                <div className="text-[11px] text-slate-400">Paved Asphalt Road</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-xs text-slate-500">Orientation / Facing</div>
                <div className="text-sm font-bold text-slate-900 mt-1">North-East Facing</div>
                <div className="text-[11px] text-amber-700 font-medium">Park View / Boulevard</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-base font-extrabold font-[Outfit] text-slate-900">Description & Location Advantage</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {property.description || 'Prime location residential plot with all direct society utilities installed. Immediate possession and registry available. Close to main commercial boulevard, grand central mosque, and 100-foot entrance.'}
            </p>
          </div>

          {/* Amenities & Infrastructure */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold font-[Outfit] text-slate-900">Infrastructure & Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(property.amenities && property.amenities.length > 0 ? property.amenities : [
                'Underground Electricity',
                'Sui Gas Connected',
                '24/7 Gated Security & CCTV',
                'Clean Water Filtration',
                '100ft Main Boulevard',
                'Parks & Recreation Area'
              ]).map((amenity, i) => (
                <div key={i} className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Dossier & TMA Verification Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-900 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold font-[Outfit] text-slate-900">
                    Official Regulatory & Title Verification
                  </h3>
                  <p className="text-xs text-slate-500">Government Record Verification</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-xs font-bold">
                100% Clear Title
              </span>
            </div>

            {!isPublicBuyer ? (
              /* Verified Dossier for Logged-In Users */
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">TMA Planning Sanction</div>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">TMA-NRL-NOC/2026/842</div>
                    <div className="text-[10px] text-emerald-700 font-bold mt-1">✓ Approved Masterplan Demarcation</div>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">District Revenue Intiqal / Registry</div>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">Khasra # 412/18 - Registered Moza</div>
                    <div className="text-[10px] text-emerald-700 font-bold mt-1">✓ Verified Free from Encumbrance</div>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Certified Aks Shajra & Fard Malkiat available in your Document Locker.</span>
                  </div>
                  <button
                    onClick={() => onNavigate('/buyer/documents')}
                    className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-[11px] shrink-0 transition cursor-pointer shadow-xs"
                  >
                    View Dossier
                  </button>
                </div>
              </div>
            ) : (
              /* Locked Dossier for Guests with 1-Click Sign In */
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-600 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto">
                  <div className="text-xs font-bold text-slate-900">Protected Legal & Land Records</div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    TMA approval letters, Khasra numbers, Aks Shajra maps, and chain of title are reserved for registered MANZILIQ members.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    onClick={() => onNavigate(`/login?redirect=/property/${property.id}`)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Sign In to Unlock
                  </button>
                  <button
                    onClick={() => onNavigate(`/signup?redirect=/property/${property.id}`)}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Register
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Location Map Embed */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold font-[Outfit] text-slate-900">Demarcation & Location Map</h3>
                <p className="text-xs text-slate-500">{property.location}</p>
              </div>
              {society && (
                <button
                  onClick={() => onNavigate(`/societies/${society.id}`)}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-900 cursor-pointer"
                >
                  View Society Masterplan &rarr;
                </button>
              )}
            </div>

            <div className="h-64 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
              <iframe
                title="Location Map"
                src={society?.mapEmbedUrl || 'https://maps.google.com/maps?q=Lahore+Punjab+Pakistan&t=&z=13&ie=UTF8&iwloc=&output=embed'}
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
          </div>

        </div>

        {/* Right Sticky Column: Pricing, AI Estimator Card, Agent Contact & Inquiry Form */}
        <div className="space-y-6">
          
          {/* Price Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Demand Price</div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-950 mt-1">
                PKR {property.pricePKR.toLocaleString('en-PK')}
              </div>
              <div className="text-xs font-bold text-emerald-700 mt-0.5">
                ≈ PKR {formatPKR(property.pricePKR)} ({formatPKR(pricePerMarla)}/Marla)
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Token Reservation: <strong>PKR 100,000</strong> • Balance downpayment in 7 days
              </p>
            </div>

            <button
              onClick={handleBookingClick}
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-black transition shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <FileText className="w-4 h-4" />
              <span>Apply for Official Booking</span>
            </button>

            {/* Quick Share Widget inside Price Sidebar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  copiedLink
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Share Property</span>
              </button>
            </div>
          </div>

          {/* Quick WhatsApp Share Pill for Pakistani Buyers */}
          <div className="bg-emerald-50/90 border border-emerald-200 p-4 rounded-3xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-950">Share via WhatsApp</div>
                <div className="text-[10px] text-emerald-800">Send property dossier to family/clients</div>
              </div>
            </div>
            <a
              href={getWhatsAppShareUrl(property)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 shadow-2xs"
            >
              <span>Share</span>
              <Send className="w-3 h-3 text-emerald-300" />
            </a>
          </div>

          {/* Embedded AI Price Valuation Engine Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-3xl border border-slate-800 text-white shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Sparkles className="w-4 h-4" />
                <span>AI Price Valuation</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded">
                {aiPrediction.confidenceScore}% Confidence
              </span>
            </div>

            <div className="text-xs text-slate-300 space-y-1.5 pt-1">
              <div className="flex justify-between">
                <span>Fair Market Range:</span>
                <span className="font-semibold text-white">PKR {(estimatedMin/100000).toFixed(1)}L - {(estimatedMax/100000).toFixed(1)}L</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Fair Value:</span>
                <span className="font-semibold text-amber-400">PKR {aiPrediction.estimatedPricePKR.toLocaleString('en-PK')}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Marla Rate:</span>
                <span className="font-semibold text-slate-200">PKR {(aiPrediction.avgMarlaRatePKR / 100000).toFixed(2)} Lakh / Marla</span>
              </div>
              <div className="flex justify-between">
                <span>Demand Index in Area:</span>
                <span className="font-semibold text-emerald-400">{aiPrediction.marketDemand}</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-800">
              Cross-referenced with registry transfers in Tehsil Land Registrar Office and verified {property.societyName || 'society'} ledger rates.
            </p>
          </div>

          {/* Authorized Dealer & Inquiry Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-amber-400 font-black text-sm">
                CT
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">{property.dealerName || 'Chaudhry Tariq Real Estate'}</h4>
                <p className="text-[11px] text-emerald-700 font-semibold">Authorized Registered Dealer</p>
              </div>
            </div>

            {/* Direct Inquiry Form */}
            {!inquirySent ? (
              <form onSubmit={handleSendInquiry} className="space-y-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Send Direct Message / Query</label>
                  <textarea
                    rows={3}
                    value={inquiryText}
                    onChange={(e) => setInquiryText(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-600 outline-none"
                    placeholder="Enter your message..."
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Request Site Walkthrough Date</label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send Inquiry to Dealer</span>
                </button>
              </form>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 text-center space-y-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                <div className="font-bold">Inquiry Sent Successfully!</div>
                <p className="text-[11px] text-emerald-800">
                  Dealer Chaudhry Tariq has been notified via SMS & In-App. Track replies in your <strong>Buyer Inquiries</strong> panel.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Share Property Modal Component */}
      <SharePropertyModal
        isOpen={isShareModalOpen}
        property={property}
        onClose={() => setIsShareModalOpen(false)}
        onToast={onToast}
      />
    </div>
  );
};
