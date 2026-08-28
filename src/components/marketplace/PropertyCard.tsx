import React, { useState } from 'react';
import { Property } from '../../types';
import { 
  Building2, 
  MapPin, 
  Bed, 
  Bath, 
  Heart, 
  Scale, 
  Sparkles, 
  ShieldCheck, 
  Compass, 
  CreditCard,
  CheckCircle2,
  Share2,
  Link as LinkIcon,
  Check,
  Tag,
  Copy
} from 'lucide-react';
import { copyToClipboard, getPropertyShareUrl } from '../../utils/shareUtils';
import { SharePropertyModal } from '../common/SharePropertyModal';

interface PropertyCardProps {
  property: Property;
  viewMode?: 'grid' | 'list';
  isWishlisted?: boolean;
  isComparing?: boolean;
  canCompare?: boolean;
  onSelect: (propertyId: string) => void;
  onToggleWishlist: (property: Property) => void;
  onToggleCompare: (property: Property) => void;
  onBook: (property: Property) => void;
  onOpenAiValuation?: (property: Property) => void;
  onShare?: (property: Property) => void;
  onCopyLink?: (property: Property) => void;
  onToast?: (message: string) => void;
}

export const formatPKR = (amount: number): string => {
  if (amount >= 10000000) {
    const crore = amount / 10000000;
    return `${crore % 1 === 0 ? crore.toFixed(0) : crore.toFixed(2)} Crore`;
  }
  if (amount >= 100000) {
    const lakh = amount / 100000;
    return `${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1)} Lacs`;
  }
  return amount.toLocaleString('en-PK');
};

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  viewMode = 'grid',
  isWishlisted = false,
  isComparing = false,
  canCompare = true,
  onSelect,
  onToggleWishlist,
  onToggleCompare,
  onBook,
  onOpenAiValuation,
  onShare,
  onCopyLink,
  onToast
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [internalShareOpen, setInternalShareOpen] = useState(false);

  const images = property.images && property.images.length > 0 ? property.images : [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'
  ];

  const pricePerMarla = property.pricePerMarla || Math.round(property.pricePKR / (property.sizeMarla || 1));
  const verification = property.verificationStatus || 'verified';

  // Extract key quick amenity tags
  const keyAmenities = (property.amenities || []).slice(0, 3);

  const handleCopyPropertyId = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const idToCopy = property.propertyId || property.id;
    const success = await copyToClipboard(idToCopy);
    if (success) {
      setCopiedId(true);
      if (onToast) onToast(`Property ID "${idToCopy}" copied to clipboard!`);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCopyLink) {
      onCopyLink(property);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
      return;
    }
    const url = getPropertyShareUrl(property.id);
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedLink(true);
      if (onToast) onToast(`Link Copied! Link for "${property.title}" copied.`);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(property);
    } else {
      setInternalShareOpen(true);
    }
  };

  if (viewMode === 'list') {
    return (
      <>
        <div 
          id={`property-card-list-${property.id}`}
          className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:shadow-xl hover:border-emerald-700/30 transition-all duration-300 flex flex-col md:flex-row items-stretch md:items-center gap-5 group relative"
        >
          {/* Thumbnail Image Container */}
          <div className="relative w-full md:w-56 h-44 sm:h-48 md:h-40 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
            <img
              src={images[0]}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500 cursor-pointer"
              onClick={() => onSelect(property.id)}
              referrerPolicy="no-referrer"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

            {/* Badges */}
            <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 z-10">
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-slate-900/90 text-white uppercase tracking-wider shadow-xs">
                {property.category || property.type}
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono shadow-xs">
                {property.sizeMarla} Marla
              </span>
            </div>

            {/* Verification Badge */}
            {verification === 'verified' && (
              <div className="absolute bottom-2.5 left-2.5 z-10 bg-emerald-800/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Verified Listing</span>
              </div>
            )}
          </div>

          {/* Info Column */}
          <div className="flex-1 min-w-0 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {property.societyName && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200 font-bold text-[11px]">
                  <Building2 className="w-3 h-3 text-indigo-700" />
                  <span>{property.societyName}</span>
                </span>
              )}

              {/* Unique Prefix ID Tag with Copy to Clipboard button */}
              <span className="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-lg bg-slate-900 text-white font-mono font-bold text-[10px] tracking-wider shadow-2xs">
                <Tag className="w-3 h-3 text-amber-400 shrink-0" />
                <span>{property.propertyId || property.id}</span>
                <button
                  type="button"
                  id={`btn-copy-id-list-${property.id}`}
                  onClick={handleCopyPropertyId}
                  className={`p-0.5 px-1 rounded transition flex items-center gap-0.5 cursor-pointer ${
                    copiedId 
                      ? 'bg-emerald-600 text-white font-sans' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800 active:scale-90'
                  }`}
                  title="Copy Unique Property ID to Clipboard"
                >
                  {copiedId ? (
                    <>
                      <Check className="w-2.5 h-2.5 text-emerald-200" />
                      <span className="text-[9px] font-sans font-semibold text-emerald-200">Copied!</span>
                    </>
                  ) : (
                    <Copy className="w-2.5 h-2.5" />
                  )}
                </button>
              </span>

              {/* Sector / Block / Plot Number */}
              {(property.sector || property.block || property.plotNumber) && (
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                  {[property.sector, property.block, property.plotNumber ? `Plot #${property.plotNumber}` : '']
                    .filter(Boolean)
                    .join(' • ')}
                </span>
              )}

              {/* Road Width */}
              {property.roadWidth && (
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg flex items-center gap-1 border border-slate-200">
                  <Compass className="w-3 h-3 text-slate-500" />
                  <span>{property.roadWidth}</span>
                </span>
              )}
            </div>

            <h3 
              onClick={() => onSelect(property.id)}
              className="text-base font-extrabold font-[Outfit] text-slate-900 group-hover:text-emerald-800 transition cursor-pointer line-clamp-1"
            >
              {property.title}
            </h3>

            <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{property.location}</span>
            </p>

            {/* Quick Amenities Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {keyAmenities.map((am, i) => (
                <span key={i} className="text-[10px] font-medium text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{am}</span>
                </span>
              ))}
              {property.type === 'house' && property.bedrooms && (
                <span className="text-[10px] font-bold text-slate-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Bed className="w-3 h-3 text-emerald-700" />
                  <span>{property.bedrooms} Beds / {property.bathrooms || 0} Baths</span>
                </span>
              )}
            </div>
          </div>

          {/* Pricing & Direct CTA Column */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-5 shrink-0">
            <div className="text-left md:text-right">
              <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Demand Price</div>
              <div className="text-base sm:text-lg font-black font-mono text-emerald-950">
                PKR {property.pricePKR.toLocaleString('en-PK')}
              </div>
              <div className="text-[10px] font-semibold text-emerald-700">
                ≈ PKR {formatPKR(property.pricePKR)} ({formatPKR(pricePerMarla)}/Marla)
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Copy Link Button */}
              <button
                id={`btn-copy-link-list-${property.id}`}
                type="button"
                onClick={handleCopyLink}
                className={`p-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  copiedLink
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
                title={copiedLink ? 'Link Copied!' : 'Copy Shareable Link'}
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-200" /> : <LinkIcon className="w-4 h-4" />}
              </button>

              {/* Share Button */}
              <button
                id={`btn-share-list-${property.id}`}
                type="button"
                onClick={handleShareClick}
                className="p-2 rounded-xl text-xs font-bold bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 transition cursor-pointer"
                title="Share Property (WhatsApp & Social)"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* AI Estimation Trigger */}
              {onOpenAiValuation && (
                <button
                  id={`btn-ai-est-list-${property.id}`}
                  type="button"
                  onClick={() => onOpenAiValuation(property)}
                  className="p-2 rounded-xl text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition cursor-pointer"
                  title="View AI Fair Valuation"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              )}

              {/* Compare */}
              <button
                id={`btn-compare-list-${property.id}`}
                type="button"
                disabled={!isComparing && !canCompare}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCompare(property);
                }}
                className={`p-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  isComparing
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : (!canCompare
                        ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200')
                }`}
                title={isComparing ? 'Remove from Comparison' : (canCompare ? 'Compare Side-by-Side (Max 3)' : 'Comparison full (Max 3)')}
              >
                <Scale className="w-4 h-4" />
              </button>

              {/* Wishlist */}
              <button
                id={`btn-wishlist-list-${property.id}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWishlist(property);
                }}
                className={`p-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  isWishlisted
                    ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
                title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current text-rose-600' : ''}`} />
              </button>

              {/* Details CTA */}
              <button
                id={`btn-details-list-${property.id}`}
                type="button"
                onClick={() => onSelect(property.id)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Details
              </button>

              {/* Book CTA */}
              <button
                id={`btn-book-list-${property.id}`}
                type="button"
                onClick={() => onBook(property)}
                className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-black transition shadow-xs cursor-pointer active:scale-95"
              >
                Book
              </button>
            </div>
          </div>
        </div>

        {/* Internal Share Modal fallback */}
        <SharePropertyModal
          isOpen={internalShareOpen}
          property={property}
          onClose={() => setInternalShareOpen(false)}
          onToast={onToast}
        />
      </>
    );
  }

  // DEFAULT: GRID VIEW
  return (
    <>
      <div 
        id={`property-card-grid-${property.id}`}
        className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-2xl hover:border-emerald-700/30 transition-all duration-300 overflow-hidden flex flex-col group justify-between"
      >
        {/* Top Media Area */}
        <div className="relative h-52 bg-slate-100 overflow-hidden">
          <img
            src={images[0]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
            onClick={() => onSelect(property.id)}
            referrerPolicy="no-referrer"
            loading="lazy"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20 pointer-events-none" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-slate-900/90 text-white uppercase tracking-wider shadow-xs backdrop-blur-xs">
              {property.category || property.type}
            </span>
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono shadow-xs">
              {property.sizeMarla} Marla
            </span>
            {property.paymentPlan?.installmentsAvailable && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-700 text-white flex items-center gap-1 shadow-xs">
                <CreditCard className="w-2.5 h-2.5" />
                <span>Installments</span>
              </span>
            )}
          </div>

          {/* Top Action Icons (Share, Copy Link, Compare & Wishlist) */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
            {/* Copy Link Button */}
            <button
              id={`btn-copy-link-grid-${property.id}`}
              type="button"
              onClick={handleCopyLink}
              className={`p-2 rounded-xl backdrop-blur-md transition shadow-md cursor-pointer ${
                copiedLink
                  ? 'bg-emerald-700 text-white shadow-emerald-900/40'
                  : 'bg-white/90 hover:bg-white text-slate-700 hover:text-emerald-800'
              }`}
              title={copiedLink ? 'Link Copied!' : 'Copy Shareable Link'}
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-200" /> : <LinkIcon className="w-3.5 h-3.5" />}
            </button>

            {/* Share Modal Trigger */}
            <button
              id={`btn-share-grid-${property.id}`}
              type="button"
              onClick={handleShareClick}
              className="p-2 rounded-xl backdrop-blur-md bg-white/90 hover:bg-white text-slate-700 hover:text-emerald-800 transition shadow-md cursor-pointer"
              title="Share Property on WhatsApp & Socials"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {/* Compare */}
            <button
              id={`btn-compare-grid-${property.id}`}
              type="button"
              disabled={!isComparing && !canCompare}
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(property);
              }}
              className={`p-2 rounded-xl backdrop-blur-md transition shadow-md cursor-pointer ${
                isComparing
                  ? 'bg-emerald-600 text-white shadow-emerald-900/40'
                  : (!canCompare
                      ? 'bg-white/40 text-slate-400 cursor-not-allowed opacity-60'
                      : 'bg-white/90 hover:bg-white text-slate-700')
              }`}
              title={isComparing ? 'Remove from Comparison' : (canCompare ? 'Compare Side-by-Side (Max 3)' : 'Comparison Limit Reached (Max 3)')}
            >
              <Scale className="w-3.5 h-3.5" />
            </button>

            {/* Wishlist */}
            <button
              id={`btn-wishlist-grid-${property.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(property);
              }}
              className={`p-2 rounded-xl backdrop-blur-md transition shadow-md cursor-pointer ${
                isWishlisted
                  ? 'bg-rose-600 text-white shadow-rose-900/40'
                  : 'bg-white/90 hover:bg-white text-slate-700'
              }`}
              title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
            >
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Bottom Banner inside media */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between z-10 text-white">
            {property.societyName ? (
              <div className="bg-slate-900/85 backdrop-blur-xs text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-slate-700/50 shadow-xs max-w-[70%] truncate">
                <Building2 className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">{property.societyName}</span>
              </div>
            ) : <div />}

            {verification === 'verified' && (
              <div className="bg-emerald-800/90 backdrop-blur-xs text-[10px] font-extrabold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-emerald-600/50 shadow-xs">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                <span>Verified</span>
              </div>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
          
          <div className="space-y-2">
            {/* Unique Prefix ID Tag & Location Badges */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
              <span className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md bg-slate-900 text-white font-mono font-bold text-[10px] tracking-wider shadow-2xs">
                <Tag className="w-3 h-3 text-amber-400 shrink-0" />
                <span>{property.propertyId || property.id}</span>
                <button
                  type="button"
                  id={`btn-copy-id-grid-${property.id}`}
                  onClick={handleCopyPropertyId}
                  className={`p-0.5 px-1 rounded transition flex items-center gap-0.5 cursor-pointer ${
                    copiedId 
                      ? 'bg-emerald-600 text-white font-sans' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800 active:scale-90'
                  }`}
                  title="Copy Unique Property ID to Clipboard"
                >
                  {copiedId ? (
                    <>
                      <Check className="w-2.5 h-2.5 text-emerald-200" />
                      <span className="text-[9px] font-sans font-semibold text-emerald-200">Copied!</span>
                    </>
                  ) : (
                    <Copy className="w-2.5 h-2.5" />
                  )}
                </button>
              </span>
              {property.sector && (
                <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                  {property.sector}
                </span>
              )}
              {property.block && (
                <span className="font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
                  {property.block}
                </span>
              )}
              {property.plotNumber && (
                <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                  Plot #{property.plotNumber}
                </span>
              )}
              {property.roadWidth && (
                <span className="font-medium text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Compass className="w-3 h-3 text-slate-400" />
                  <span>{property.roadWidth}</span>
                </span>
              )}
            </div>

            {/* Title */}
            <h3 
              onClick={() => onSelect(property.id)}
              className="text-sm sm:text-base font-extrabold font-[Outfit] text-slate-900 group-hover:text-emerald-800 transition line-clamp-2 cursor-pointer leading-snug"
            >
              {property.title}
            </h3>

            {/* Location */}
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{property.location}</span>
            </p>
          </div>

          {/* Specifications snippet */}
          {property.type === 'house' && (property.bedrooms || property.bathrooms) ? (
            <div className="flex items-center gap-3 text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-semibold">
              {property.bedrooms && (
                <div className="flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5 text-slate-400" />
                  <span>{property.bedrooms} Beds</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center gap-1">
                  <Bath className="w-3.5 h-3.5 text-slate-400" />
                  <span>{property.bathrooms} Baths</span>
                </div>
              )}
              <div className="ml-auto text-[10px] text-slate-400 font-mono">
                {property.sizeMarla * 225} Sq Ft
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5">
              {keyAmenities.map((am, idx) => (
                <span key={idx} className="text-[10px] font-medium text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>{am}</span>
                </span>
              ))}
            </div>
          )}

          {/* AI Valuation Mini Trigger */}
          {onOpenAiValuation && (
            <button
              id={`btn-ai-valuation-card-${property.id}`}
              type="button"
              onClick={() => onOpenAiValuation(property)}
              className="w-full py-1.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-xl text-[11px] font-bold transition flex items-center justify-between border border-purple-200 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>AI Fair Price Estimate</span>
              </span>
              <span className="text-[10px] text-purple-700 font-black uppercase tracking-wider">Inspect →</span>
            </button>
          )}

          {/* Price & Primary Actions Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <div>
              <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Demand Price</div>
              <div className="text-sm sm:text-base font-black font-mono text-emerald-950">
                PKR {property.pricePKR.toLocaleString('en-PK')}
              </div>
              <div className="text-[10px] font-semibold text-emerald-700">
                {formatPKR(property.pricePKR)} ({formatPKR(pricePerMarla)}/M)
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                id={`btn-details-grid-${property.id}`}
                type="button"
                onClick={() => onSelect(property.id)}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Details
              </button>
              <button
                id={`btn-book-grid-${property.id}`}
                type="button"
                onClick={() => onBook(property)}
                className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-black transition shadow-xs cursor-pointer active:scale-95"
              >
                Book
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Internal Share Modal fallback */}
      <SharePropertyModal
        isOpen={internalShareOpen}
        property={property}
        onClose={() => setInternalShareOpen(false)}
        onToast={onToast}
      />
    </>
  );
};
