import React, { useState } from 'react';
import { Property, Society } from '../../types';
import { 
  LatLng, 
  DEFAULT_PAKISTAN_COORDINATES, 
  SOCIETY_COORDINATES_MAP, 
  getDirectionsUrl, 
  getNearbyFacilities, 
  FacilityItem 
} from '../../services/googleMapsService';
import { GoogleMapView, MapMarkerData } from './GoogleMapView';
import { NearbyFacilitiesPanel } from './NearbyFacilitiesPanel';
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Compass, 
  Layers, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Building2
} from 'lucide-react';

interface PropertyLocationPinMapProps {
  property: Property;
  society?: Society;
  onNavigate?: (route: string) => void;
}

export const PropertyLocationPinMap: React.FC<PropertyLocationPinMapProps> = ({
  property,
  society,
  onNavigate
}) => {
  const [showNearbyPanel, setShowNearbyPanel] = useState<boolean>(true);
  const [selectedFacility, setSelectedFacility] = useState<FacilityItem | null>(null);

  // Determine property coordinates
  const propertyCoords: LatLng = React.useMemo(() => {
    if (property.latitude && property.longitude) {
      return { lat: property.latitude, lng: property.longitude };
    }
    if (property.geoCoordinates?.lat && property.geoCoordinates?.lng) {
      return { lat: property.geoCoordinates.lat, lng: property.geoCoordinates.lng };
    }
    if (property.coordinates && 'lat' in property.coordinates && 'lng' in property.coordinates) {
      return { lat: property.coordinates.lat, lng: property.coordinates.lng };
    }
    if (society && SOCIETY_COORDINATES_MAP[society.id]) {
      return SOCIETY_COORDINATES_MAP[society.id].center;
    }
    return DEFAULT_PAKISTAN_COORDINATES;
  }, [property, society]);

  // Nearby facilities
  const facilities = React.useMemo(() => {
    return getNearbyFacilities(propertyCoords);
  }, [propertyCoords]);

  // Markers
  const markers: MapMarkerData[] = React.useMemo(() => {
    const list: MapMarkerData[] = [
      {
        id: `prop-${property.id}`,
        position: propertyCoords,
        title: property.title,
        subtitle: `${property.sector || ''} ${property.block || ''} ${property.plotNumber ? `Plot #${property.plotNumber}` : ''}`.trim(),
        price: `PKR ${property.pricePKR.toLocaleString('en-PK')}`,
        category: 'property',
        isPrimary: true
      }
    ];

    facilities.forEach(fac => {
      list.push({
        id: fac.id,
        position: fac.location,
        title: fac.name,
        subtitle: `${fac.categoryLabel} • ${fac.distanceFormatted} away`,
        category: fac.category
      });
    });

    return list;
  }, [property, propertyCoords, facilities]);

  const directionsUrl = getDirectionsUrl(propertyCoords);

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5" id="property-location-pin-map-card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
              <MapPin className="w-4 h-4" />
            </span>
            <h3 className="text-base font-extrabold font-[Outfit] text-slate-900">
              Location & Ground Demarcation Pin
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span>{property.location}</span>
            <span className="font-mono text-slate-400">({propertyCoords.lat.toFixed(4)}° N, {propertyCoords.lng.toFixed(4)}° E)</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {society && onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate(`/societies/${society.id}`)}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition cursor-pointer"
            >
              <span>Explore Masterplan &rarr;</span>
            </button>
          )}

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            title="Open in Google Maps to get turn-by-turn driving directions"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Get Directions</span>
          </a>
        </div>
      </div>

      {/* Embedded Google Map Component */}
      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <GoogleMapView
          center={propertyCoords}
          zoom={16}
          markers={markers}
          height="340px"
          mapTitle={property.title}
          showDirectionsButton={true}
          showMapTypeToggle={true}
        />
      </div>

      {/* Nearby Facilities Collapsible Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowNearbyPanel(!showNearbyPanel)}
            className="flex items-center gap-2 text-xs font-bold text-slate-800 hover:text-slate-950 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Nearby Facilities & Civic Infrastructure ({facilities.length} Points of Interest)</span>
            {showNearbyPanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showNearbyPanel && (
          <NearbyFacilitiesPanel
            facilities={facilities}
            centerLocation={propertyCoords}
            selectedFacilityId={selectedFacility?.id}
            onSelectFacility={(fac) => setSelectedFacility(fac)}
          />
        )}
      </div>
    </div>
  );
};
