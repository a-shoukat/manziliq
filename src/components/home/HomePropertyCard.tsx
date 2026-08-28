import React, { useState } from 'react';
import { Property } from '../../types';
import { 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  Layers, 
  Check, 
  Copy, 
  ArrowRight,
  Maximize2,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { copyToClipboard, getPropertyShareUrl, formatPKRNumber } from '../../utils/shareUtils';

interface HomePropertyCardProps {
  property: Property;
  isCompared?: boolean;
  onToggleCompare?: (property: Property) => void;
  onSelectProperty?: (id: string) => void;
  onToast?: (msg: string) => void;
}

export const HomePropertyCard: React.FC<HomePropertyCardProps> = ({
  property,
  isCompared = false,
  onToggleCompare,
  onSelectProperty,
  onToast,
}) => {
  const [copiedId, setCopiedId] = useState(false);

  const propId = property.propertyId || property.id;
  const sqFt = property.sizeSqFt || property.sizeMarla * 225;
  const status = property.listingStatus || 'available';

  // Format price cleanly ONCE (e.g., PKR 9,500,000)
  const formattedPrice = `PKR ${property.pricePKR.toLocaleString('en-PK')}`;
  const priceShortWord = formatPKRNumber(property.pricePKR);

  // Status Badge Configuration
  const getStatusBadge = () => {
    switch (status) {
      case 'sold':
        return {
          label: 'Sold Out',
          className: 'bg-slate-900/90 text-slate-200 border-slate-700',
        };
      case 'reserved':
        return {
          label: 'Reserved',
          className: 'bg-amber-600/90 text-amber-50 border-amber-500',
        };
      case 'available':
      default:
        return {
          label: 'Available',
          className: 'bg-emerald-600/90 text-white border-emerald-500',
        };
    }
  };

  const statusBadge = getStatusBadge();

  const handleCopyPropId = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(propId);
    if (success) {
      setCopiedId(true);
      if (onToast) onToast(`Property ID "${propId}" copied to clipboard!`);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleCardClick = () => {
    if (onSelectProperty) {
      onSelectProperty(property.id);
    }
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleCompare) {
      onToggleCompare(property);
    }
  };

  return (
    <div 
      id={`home-property-card-${property.id}`}
      onClick={handleCardClick}
      className="group bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col h-full overflow-hidden cursor-pointer relative"
    >
      {/* 1. Media & Image Frame */}
      <div className="relative aspect-[16/10] sm:h-52 w-full overflow-hidden bg-slate-100">
        <img
          src={property.images && property.images.length > 0 
            ? property.images[0] 
            : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Gradient Overlay for Top Badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/40 pointer-events-none" />

        {/* Top-Left: Status & Property Type Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md backdrop-blur-md border shadow-xs ${statusBadge.className}`}>
            {statusBadge.label}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-slate-100 border border-slate-700/60 shadow-xs">
            {property.category || property.type}
          </span>
        </div>

        {/* Top-Right: Quick Compare Checkbox */}
        <div className="absolute top-3 right-3 z-10">
          <button
            type="button"
            id={`btn-home-compare-checkbox-${property.id}`}
            onClick={handleCompareClick}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold backdrop-blur-md transition-all shadow-md cursor-pointer ${
              isCompared 
                ? 'bg-blue-900 text-white ring-2 ring-blue-400' 
                : 'bg-white/90 hover:bg-white text-slate-800 hover:text-blue-900'
            }`}
            title={isCompared ? 'Remove from comparison' : 'Add to compare matrix'}
          >
            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
              isCompared ? 'bg-blue-600 border-blue-400 text-white' : 'border-slate-400 bg-white'
            }`}>
              {isCompared && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span className="hidden xs:inline">{isCompared ? 'Compared' : 'Compare'}</span>
          </button>
        </div>

        {/* Bottom Banner inside image: Property ID & Society */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between z-10 text-white">
          <button
            type="button"
            id={`btn-copy-home-id-${property.id}`}
            onClick={handleCopyPropId}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950/80 hover:bg-slate-900 backdrop-blur-md border border-slate-700/80 text-[11px] font-mono text-amber-300 transition cursor-pointer"
            title="Click to copy Property ID"
          >
            <span>{propId}</span>
            {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
          </button>

          {property.societyName && (
            <span className="text-[11px] font-semibold text-slate-200 truncate max-w-[140px] drop-shadow-sm flex items-center gap-1">
              <Building2 className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{property.societyName}</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Card Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
        
        {/* Title & Location */}
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors line-clamp-1">
            {property.title}
          </h3>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{property.location}</span>
          </p>
        </div>

        {/* Key Dimensions Specs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-800 shrink-0" />
            <span>{property.sizeMarla} Marla</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="text-slate-500 text-[11px]">
            {sqFt.toLocaleString('en-PK')} sq. ft.
          </div>
          {property.plotNumber && (
            <>
              <span className="text-slate-300">•</span>
              <div className="text-slate-600 text-[11px] font-mono">
                Plot #{property.plotNumber}
              </div>
            </>
          )}
        </div>

        {/* Trust Badges: Approved NOC, Escrow Protected, AI Valuated */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Approved NOC */}
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>Approved NOC</span>
          </div>

          {/* Escrow Protected */}
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold">
            <Lock className="w-3 h-3 text-blue-600 shrink-0" />
            <span>Escrow Protected</span>
          </div>

          {/* AI Valuated */}
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold">
            <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
            <span>AI Valuated</span>
          </div>
        </div>

        {/* 3. Footer: Price & Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          {/* Price rendered ONCE */}
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">
              Total Demand
            </div>
            <div className="text-base sm:text-lg font-black font-[Outfit] text-slate-950 tracking-tight truncate">
              {formattedPrice}
            </div>
            <div className="text-[10px] font-bold text-emerald-800">
              {priceShortWord}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              id={`btn-home-view-detail-${property.id}`}
              onClick={handleCardClick}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold transition shadow-xs cursor-pointer group-hover:translate-x-0.5"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
