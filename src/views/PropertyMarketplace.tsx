import React, { useState } from 'react';
import { Property, Plot, Society } from '../types';
import { 
  Building2, 
  MapPin, 
  Heart, 
  SlidersHorizontal, 
  Check, 
  Eye, 
  Sparkles, 
  Phone, 
  MessageSquare, 
  ArrowRight, 
  X, 
  Bed, 
  Bath, 
  Maximize2,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Share2
} from 'lucide-react';

interface PropertyMarketplaceProps {
  properties: Property[];
  plots: Plot[];
  societies: Society[];
  wishlistIds: string[];
  compareIds: string[];
  onToggleWishlist: (property: Property) => void;
  onToggleCompare: (property: Property) => void;
  onInitiateBooking: (plotOrProperty: { plotId?: string; propertyId?: string; title: string; price: number; downPayment: number; societyName: string }) => void;
  onOpenInquiry: (property?: Property, plot?: Plot) => void;
}

export const PropertyMarketplace: React.FC<PropertyMarketplaceProps> = ({
  properties,
  plots,
  societies,
  wishlistIds,
  compareIds,
  onToggleWishlist,
  onToggleCompare,
  onInitiateBooking,
  onOpenInquiry
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'plots' | 'houses' | 'commercial'>('all');
  const [selectedSociety, setSelectedSociety] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Filter logic
  const filteredProperties = properties.filter(item => {
    if (activeCategory === 'plots' && item.type !== 'plot') return false;
    if (activeCategory === 'houses' && item.type !== 'house') return false;
    if (activeCategory === 'commercial' && item.type !== 'commercial') return false;

    if (selectedSociety !== 'all' && item.societyName !== selectedSociety) return false;
    if (sizeFilter !== 'all' && item.sizeMarla !== parseInt(sizeFilter)) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.societyName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Category Tabs & Filter Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-2xl font-bold font-[Outfit] text-slate-900">Featured Properties & Plots</h2>
            <p className="text-xs text-slate-500 mt-0.5">Explore verified housing society inventory across Pakistan</p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeCategory === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({properties.length})
            </button>
            <button
              onClick={() => setActiveCategory('plots')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeCategory === 'plots' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Residential Plots
            </button>
            <button
              onClick={() => setActiveCategory('houses')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeCategory === 'houses' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Constructed Houses
            </button>
            <button
              onClick={() => setActiveCategory('commercial')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeCategory === 'commercial' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Commercial Plazas
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <input
              type="text"
              placeholder="Search by keyword, society, or road..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <select
              value={selectedSociety}
              onChange={e => setSelectedSociety(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Filter by Society (All)</option>
              {societies.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={sizeFilter}
              onChange={e => setSizeFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Filter by Plot Size (All)</option>
              <option value="3">3 Marla</option>
              <option value="4">4 Marla</option>
              <option value="5">5 Marla</option>
              <option value="10">10 Marla</option>
            </select>
          </div>
        </div>

      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500">
            <Building2 className="w-12 h-12 mx-auto stroke-1 text-slate-400 mb-2" />
            <p className="text-base font-bold text-slate-800">No properties found matching filters</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting search filters or selecting another society.</p>
          </div>
        ) : (
          filteredProperties.map(prop => {
            const isWishlisted = wishlistIds.includes(prop.id);
            const isCompared = compareIds.includes(prop.id);

            return (
              <div
                key={prop.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative"
              >
                {/* Image & Badge Header */}
                <div className="relative h-52 overflow-hidden bg-slate-900">
                  <img
                    src={prop.images[0]}
                    alt={prop.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-md shadow">
                      {prop.sizeMarla} Marla
                    </span>
                    <span className="bg-slate-900/80 text-white font-semibold text-[10px] px-2 py-0.5 rounded-md backdrop-blur-sm uppercase">
                      {prop.type}
                    </span>
                  </div>

                  {/* Quick Action Overlay Buttons */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      onClick={() => onToggleWishlist(prop)}
                      className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                        isWishlisted
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-900/60 text-white hover:bg-slate-900'
                      }`}
                      title="Add to Wishlist"
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
                    </button>

                    <button
                      onClick={() => onToggleCompare(prop)}
                      className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                        isCompared
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-900/60 text-white hover:bg-slate-900'
                      }`}
                      title="Compare Property"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Bottom Price on Image */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                    <div>
                      <span className="text-[10px] text-slate-300 font-medium block">Total Price</span>
                      <span className="text-2xl font-black font-[Outfit] text-amber-400">
                        PKR {prop.pricePKR.toLocaleString('en-PK')}
                      </span>
                    </div>
                    <span className="text-[11px] bg-emerald-500/90 text-white font-bold px-2 py-0.5 rounded">
                      PKR {Math.round(prop.pricePKR / prop.sizeMarla / 1000)}k / Marla
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-600 transition-colors line-clamp-1">
                      {prop.title}
                    </h3>

                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{prop.location}</span>
                    </p>

                    <p className="text-xs font-semibold text-teal-700 flex items-center gap-1 mt-1">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{prop.societyName}</span>
                    </p>
                  </div>

                  {/* Bed/Bath & Feature summary */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    {prop.bedrooms ? (
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Bed className="w-3.5 h-3.5 text-slate-400" />
                          <span>{prop.bedrooms} Bed</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Bath className="w-3.5 h-3.5 text-slate-400" />
                          <span>{prop.bathrooms} Bath</span>
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500 font-medium text-[11px]">Direct Society Plot File</span>
                    )}

                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => setSelectedProperty(prop)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>

                    <button
                      onClick={() => onInitiateBooking({
                        propertyId: prop.id,
                        title: prop.title,
                        price: prop.pricePKR,
                        downPayment: Math.round(prop.pricePKR * 0.2),
                        societyName: prop.societyName
                      })}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-2 rounded-xl text-xs shadow-sm flex items-center justify-center gap-1 transition-all"
                    >
                      <span>Book Now</span>
                    </button>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Property Details Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 text-slate-900 shadow-2xl relative my-8">
            
            <button
              onClick={() => setSelectedProperty(null)}
              className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-lg text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Gallery Images */}
            <div className="grid grid-cols-3 gap-2 mb-4 rounded-xl overflow-hidden h-64 bg-slate-900">
              <img src={selectedProperty.images[0]} alt={selectedProperty.title} className="col-span-2 w-full h-full object-cover" />
              <div className="flex flex-col gap-2 h-full">
                {selectedProperty.images[1] && (
                  <img src={selectedProperty.images[1]} alt="Gallery 2" className="w-full h-1/2 object-cover" />
                )}
                {selectedProperty.images[2] ? (
                  <img src={selectedProperty.images[2]} alt="Gallery 3" className="w-full h-1/2 object-cover" />
                ) : (
                  <div className="w-full h-1/2 bg-slate-800 flex items-center justify-center text-xs text-slate-400 font-bold">
                    MANZILIQ Verified
                  </div>
                )}
              </div>
            </div>

            {/* Details Title & Price */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="bg-amber-100 text-amber-800 font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
                  {selectedProperty.sizeMarla} Marla • {selectedProperty.type}
                </span>
                <h2 className="text-2xl font-black font-[Outfit] text-slate-900 mt-1">{selectedProperty.title}</h2>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedProperty.location}</span>
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 font-medium block">Total Price</span>
                <span className="text-2xl font-black text-amber-600 font-[Outfit]">
                  PKR {selectedProperty.pricePKR.toLocaleString('en-PK')}
                </span>
                <span className="text-xs text-emerald-700 font-bold block">
                  Est. Down Payment: PKR {Math.round(selectedProperty.pricePKR * 0.2).toLocaleString('en-PK')}
                </span>
              </div>
            </div>

            {/* Overview & Amenities */}
            <div className="py-4 space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Description</h4>
                <p className="text-slate-600 leading-relaxed">{selectedProperty.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">Key Amenities & Features</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProperty.amenities.map((a, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-800 font-semibold px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              {/* Society Info Box */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase block">Developer / Society</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedProperty.societyName}</span>
                </div>
                <button
                  onClick={() => onOpenInquiry(selectedProperty)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Send Inquiry</span>
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
              <button
                onClick={() => setSelectedProperty(null)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 font-bold text-xs"
              >
                Close
              </button>

              <button
                onClick={() => {
                  const propToBook = selectedProperty;
                  setSelectedProperty(null);
                  onInitiateBooking({
                    propertyId: propToBook.id,
                    title: propToBook.title,
                    price: propToBook.pricePKR,
                    downPayment: Math.round(propToBook.pricePKR * 0.2),
                    societyName: propToBook.societyName
                  });
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl shadow-md text-xs flex items-center gap-2"
              >
                <span>Book This Property</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
