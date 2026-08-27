import React, { useState } from 'react';
import { Property, SavedComparison } from '../../types';
import { Heart, Trash2, MapPin, Building2, FileText, ArrowRight, Scale, Bookmark, Clock, Eye } from 'lucide-react';

interface BuyerWishlistViewProps {
  properties: Property[];
  savedComparisons?: SavedComparison[];
  onRemoveFromWishlist: (id: string) => void;
  onDeleteSavedComparison?: (id: string) => void;
  onLoadSavedComparison?: (comparison: SavedComparison) => void;
  onOpenBooking: (property: Property) => void;
  onSelectProperty: (id: string) => void;
  onNavigate: (route: string) => void;
}

export const BuyerWishlistView: React.FC<BuyerWishlistViewProps> = ({
  properties,
  savedComparisons = [],
  onRemoveFromWishlist,
  onDeleteSavedComparison,
  onLoadSavedComparison,
  onOpenBooking,
  onSelectProperty,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'wishlist' | 'comparisons'>('wishlist');

  return (
    <div className="space-y-8" id="buyer-wishlist-view-root">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Heart className="w-7 h-7 text-rose-600 fill-current" />
            <span>Saved Properties & Comparisons</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Properties, plot files, and side-by-side comparison matrices saved to your profile.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold w-full sm:w-auto">
          <button
            id="btn-buyer-tab-wishlist"
            type="button"
            onClick={() => setActiveTab('wishlist')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'wishlist'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>Wishlist ({properties.length})</span>
          </button>

          <button
            id="btn-buyer-tab-comparisons"
            type="button"
            onClick={() => setActiveTab('comparisons')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'comparisons'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-emerald-600" />
            <span>Saved Comparisons ({savedComparisons.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: WISHLIST PROPERTIES */}
      {activeTab === 'wishlist' && (
        <>
          {properties.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-4">
              <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Your wishlist is currently empty</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Browse the marketplace and tap the heart icon on any property to save it to your dashboard.
              </p>
              <button
                onClick={() => onNavigate('/marketplace')}
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Go to Marketplace
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((prop) => (
                <div
                  key={prop.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between group"
                >
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={prop.images[0]}
                      alt={prop.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      onClick={() => onRemoveFromWishlist(prop.id)}
                      className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-rose-50 text-rose-600 rounded-xl shadow-xs transition cursor-pointer"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="absolute top-3 left-3 bg-slate-900/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                      {prop.sizeMarla} Marla • {prop.type}
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div>
                      <h3 
                        onClick={() => onSelectProperty(prop.id)}
                        className="text-base font-bold text-slate-900 hover:text-emerald-800 transition line-clamp-1 cursor-pointer"
                      >
                        {prop.title}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{prop.location}</span>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Demand Price</div>
                        <div className="text-sm font-extrabold text-emerald-900">
                          PKR {prop.pricePKR.toLocaleString('en-PK')}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectProperty(prop.id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          onClick={() => onOpenBooking(prop)}
                          className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          Book
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 2: SAVED COMPARISONS */}
      {activeTab === 'comparisons' && (
        <>
          {savedComparisons.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Scale className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Saved Comparisons Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Select up to 3 plots in the marketplace or society masterplan, navigate to Comparison, and click "Save This Comparison" to bookmark your analysis.
              </p>
              <button
                onClick={() => onNavigate('/marketplace')}
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Explore Marketplace
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedComparisons.map((comp) => (
                <div
                  key={comp.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition p-5 flex flex-col justify-between space-y-4"
                >
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

                    <h3 className="font-extrabold text-slate-900 text-base font-[Outfit] line-clamp-2">
                      {comp.title}
                    </h3>

                    {comp.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                        {comp.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => {
                        if (onLoadSavedComparison) {
                          onLoadSavedComparison(comp);
                        }
                        onNavigate('/compare');
                      }}
                      className="flex-1 py-2 px-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Matrix</span>
                    </button>

                    {onDeleteSavedComparison && (
                      <button
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
        </>
      )}

    </div>
  );
};
