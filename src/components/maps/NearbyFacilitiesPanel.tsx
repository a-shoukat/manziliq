import React, { useState } from 'react';
import { 
  FacilityItem, 
  LatLng, 
  getDirectionsUrl, 
  getGoogleMapsViewUrl 
} from '../../services/googleMapsService';
import { 
  GraduationCap, 
  HeartPulse, 
  Building2, 
  ShoppingBag, 
  Landmark, 
  Bus, 
  Navigation, 
  ExternalLink,
  MapPin,
  Clock,
  Star,
  ChevronRight,
  Filter
} from 'lucide-react';

interface NearbyFacilitiesPanelProps {
  facilities: FacilityItem[];
  centerLocation: LatLng;
  onSelectFacility?: (facility: FacilityItem) => void;
  selectedFacilityId?: string;
}

export const NearbyFacilitiesPanel: React.FC<NearbyFacilitiesPanelProps> = ({
  facilities,
  centerLocation,
  onSelectFacility,
  selectedFacilityId
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Places', count: facilities.length },
    { id: 'school', label: 'Schools', count: facilities.filter(f => f.category === 'school').length },
    { id: 'hospital', label: 'Hospitals', count: facilities.filter(f => f.category === 'hospital').length },
    { id: 'mosque', label: 'Mosques', count: facilities.filter(f => f.category === 'mosque').length },
    { id: 'market', label: 'Commercial', count: facilities.filter(f => f.category === 'market').length },
    { id: 'bank', label: 'Banks', count: facilities.filter(f => f.category === 'bank').length }
  ];

  const filteredFacilities = activeCategory === 'all' 
    ? facilities 
    : facilities.filter(f => f.category === activeCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'school':
        return <GraduationCap className="w-4 h-4 text-indigo-700" />;
      case 'hospital':
        return <HeartPulse className="w-4 h-4 text-rose-700" />;
      case 'mosque':
        return <Building2 className="w-4 h-4 text-emerald-800" />;
      case 'market':
        return <ShoppingBag className="w-4 h-4 text-amber-700" />;
      case 'bank':
        return <Landmark className="w-4 h-4 text-teal-700" />;
      case 'transport':
        return <Bus className="w-4 h-4 text-blue-700" />;
      default:
        return <MapPin className="w-4 h-4 text-slate-600" />;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'school':
        return 'bg-indigo-50 text-indigo-900 border-indigo-200';
      case 'hospital':
        return 'bg-rose-50 text-rose-900 border-rose-200';
      case 'mosque':
        return 'bg-emerald-50 text-emerald-900 border-emerald-200';
      case 'market':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'bank':
        return 'bg-teal-50 text-teal-900 border-teal-200';
      case 'transport':
        return 'bg-blue-50 text-blue-900 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden" id="nearby-facilities-panel">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-extrabold font-[Outfit] text-slate-900 flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-emerald-800" />
            <span>Nearby Places & Infrastructure</span>
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Essential community facilities and road connectivity radius
          </p>
        </div>
        <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
          {facilities.length} Locations
        </span>
      </div>

      {/* Category Pills */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
              activeCategory === cat.id
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            {cat.label} ({cat.count})
          </button>
        ))}
      </div>

      {/* Facility Cards List */}
      <div className="p-3 space-y-2 max-h-[320px] overflow-y-auto divide-y divide-slate-100">
        {filteredFacilities.map((fac) => {
          const isSelected = selectedFacilityId === fac.id;
          return (
            <div
              key={fac.id}
              onClick={() => onSelectFacility && onSelectFacility(fac)}
              className={`pt-2 first:pt-0 p-2.5 rounded-xl transition flex items-start justify-between gap-3 ${
                onSelectFacility ? 'cursor-pointer hover:bg-slate-50' : ''
              } ${isSelected ? 'bg-emerald-50/70 border border-emerald-200' : ''}`}
            >
              <div className="flex items-start gap-2.5">
                <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${getCategoryBadgeClass(fac.category)}`}>
                  {getCategoryIcon(fac.category)}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 leading-tight">
                      {fac.name}
                    </span>
                    {fac.rating && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                        <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                        <span>{fac.rating}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {fac.address}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-semibold text-slate-600">
                    <span className="text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                      {fac.distanceFormatted} away
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{fac.travelTimeDrive}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action: Directions Button */}
              <div className="shrink-0 flex flex-col items-end gap-1">
                <a
                  href={getDirectionsUrl(fac.location, centerLocation)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-emerald-700 hover:text-white text-slate-700 rounded-lg text-[10px] font-bold transition border border-slate-200"
                  title="Navigate with Google Maps"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Directions</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
