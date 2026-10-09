import React, { useState, useCallback, useMemo } from 'react';
import { 
  GoogleMap, 
  useJsApiLoader, 
  MarkerF, 
  PolygonF, 
  InfoWindowF,
  Libraries
} from '@react-google-maps/api';
import { 
  LatLng, 
  getGoogleMapsApiKey, 
  getDirectionsUrl, 
  getGoogleMapsViewUrl, 
  FacilityItem 
} from '../../services/googleMapsService';
import { 
  MapPin, 
  Navigation, 
  Layers, 
  ExternalLink, 
  Compass, 
  Maximize2, 
  Info, 
  Sparkles,
  ShieldCheck,
  Building2,
  GraduationCap,
  HeartPulse,
  ShoppingBag
} from 'lucide-react';

export interface MapMarkerData {
  id: string;
  position: LatLng;
  title: string;
  subtitle?: string;
  price?: string;
  category?: 'society' | 'property' | 'plot' | 'school' | 'hospital' | 'mosque' | 'market';
  isPrimary?: boolean;
}

interface GoogleMapViewProps {
  center: LatLng;
  zoom?: number;
  markers?: MapMarkerData[];
  boundaryPolygon?: LatLng[];
  height?: string;
  className?: string;
  mapTitle?: string;
  showDirectionsButton?: boolean;
  showMapTypeToggle?: boolean;
  onMarkerClick?: (marker: MapMarkerData) => void;
  selectedMarkerId?: string;
}

// Stable libraries array outside the component to prevent re-render loops
const GOOGLE_MAPS_LIBRARIES: Libraries = ['places', 'geometry'];

const defaultMapContainerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  minHeight: '380px',
  borderRadius: '1.25rem'
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  scaleControl: true,
  streetViewControl: true,
  rotateControl: true,
  fullscreenControl: true,
  gestureHandling: 'cooperative',
  styles: [
    {
      featureType: 'poi.business',
      stylers: [{ visibility: 'simplified' }]
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry.fill',
      stylers: [{ color: '#e5f3e9' }]
    }
  ]
};

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  center,
  zoom = 15,
  markers = [],
  boundaryPolygon,
  height = '450px',
  className = '',
  mapTitle,
  showDirectionsButton = true,
  showMapTypeToggle = true,
  onMarkerClick,
  selectedMarkerId
}) => {
  const apiKey = getGoogleMapsApiKey();
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');
  const [activeMarker, setActiveMarker] = useState<MapMarkerData | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || 'DEMO_MODE',
    libraries: GOOGLE_MAPS_LIBRARIES
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMapInstance(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMapInstance(null);
  }, []);

  const polygonOptions = useMemo(() => ({
    fillColor: '#059669', // Emerald 600
    fillOpacity: 0.22,
    strokeColor: '#047857', // Emerald 700
    strokeOpacity: 0.9,
    strokeWeight: 2.5,
    clickable: true,
    draggable: false,
    editable: false,
    geodesic: false,
    zIndex: 1
  }), []);

  const directionsUrl = getDirectionsUrl(center);
  const externalViewUrl = getGoogleMapsViewUrl(center, mapTitle);

  // If no API key or load error, render high-fidelity interactive map preview
  if (!apiKey || loadError) {
    return (
      <div 
        className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900 flex flex-col justify-between ${className}`}
        style={{ height }}
        id="google-maps-view-fallback"
      >
        {/* Satellite Map Simulated Aerial Backdrop */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-45 transform scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-900/30" />

        {/* Top Header Controls */}
        <div className="relative z-10 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700 text-xs text-white">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono font-bold">{center.lat.toFixed(4)}° N, {center.lng.toFixed(4)}° E</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>GPS Geocoded</span>
            </span>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Get Directions</span>
            </a>
          </div>
        </div>

        {/* Center Pin & Radar Pulsing Animation */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center p-4">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-20 h-20 bg-emerald-500/20 rounded-full animate-ping" />
            <div className="absolute w-12 h-12 bg-emerald-500/30 rounded-full animate-pulse" />
            <div className="relative w-10 h-10 bg-emerald-700 text-white rounded-2xl shadow-xl flex items-center justify-center border-2 border-white">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          
          <div className="mt-3 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800 text-white max-w-sm">
            <h4 className="text-sm font-bold font-[Outfit] text-white">
              {mapTitle || 'Demarcated Real-World Coordinates'}
            </h4>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Verified ground coordinates centered for precise LDA/TMA site mapping.
            </p>
          </div>
        </div>

        {/* Bottom Bar: Action Links & Config Helper */}
        <div className="relative z-10 p-4 bg-slate-950/90 backdrop-blur-md border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px]">
              Set <code className="text-amber-300 font-mono">VITE_GOOGLE_MAPS_API_KEY</code> in <code className="text-slate-300 font-mono">.env</code> to activate live interactive vector tiles.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={externalViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition border border-slate-700 text-[11px]"
            >
              <ExternalLink className="w-3 h-3 text-emerald-400" />
              <span>Open in Google Maps</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Active Interactive Google Map Render
  return (
    <div 
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 ${className}`}
      style={{ height }}
      id="google-maps-view-container"
    >
      {/* Top Floating Controls */}
      <div className="absolute top-3 left-3 right-3 z-10 pointer-events-none flex items-center justify-between gap-2">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-xs font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-emerald-800" />
          <span>{mapTitle || 'Society Location & Boundary'}</span>
          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          {showMapTypeToggle && (
            <div className="bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-md border border-slate-200 text-[11px] font-bold flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMapType('roadmap')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  mapType === 'roadmap' ? 'bg-emerald-800 text-white shadow-2xs' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Map
              </button>
              <button
                type="button"
                onClick={() => setMapType('satellite')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  mapType === 'satellite' ? 'bg-emerald-800 text-white shadow-2xs' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Satellite
              </button>
            </div>
          )}

          {showDirectionsButton && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl shadow-md text-xs font-bold transition cursor-pointer"
              title="Open Google Maps Directions"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Directions</span>
            </a>
          )}
        </div>
      </div>

      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={defaultMapContainerStyle}
          center={center}
          zoom={zoom}
          mapTypeId={mapType}
          options={mapOptions}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {/* Boundary Polygon for Societies */}
          {boundaryPolygon && boundaryPolygon.length > 2 && (
            <PolygonF
              paths={boundaryPolygon}
              options={polygonOptions}
            />
          )}

          {/* Primary Center Marker */}
          <MarkerF
            position={center}
            title={mapTitle || 'Target Location'}
            onClick={() => {
              setActiveMarker({
                id: 'center-pin',
                position: center,
                title: mapTitle || 'Project Location',
                category: 'society',
                isPrimary: true
              });
            }}
          />

          {/* Additional Markers (Plots, Nearby Facilities, etc.) */}
          {markers.map((m) => (
            <MarkerF
              key={m.id}
              position={m.position}
              title={m.title}
              onClick={() => {
                setActiveMarker(m);
                if (onMarkerClick) onMarkerClick(m);
              }}
            />
          ))}

          {/* Info Window */}
          {activeMarker && (
            <InfoWindowF
              position={activeMarker.position}
              onCloseClick={() => setActiveMarker(null)}
            >
              <div className="p-2 text-slate-900 max-w-xs space-y-1">
                <h5 className="font-extrabold text-xs text-slate-900 font-[Outfit]">
                  {activeMarker.title}
                </h5>
                {activeMarker.subtitle && (
                  <p className="text-[11px] text-slate-600">
                    {activeMarker.subtitle}
                  </p>
                )}
                {activeMarker.price && (
                  <p className="text-xs font-bold text-emerald-800 font-mono">
                    {activeMarker.price}
                  </p>
                )}
                <div className="pt-1 flex items-center justify-between gap-2 text-[10px]">
                  <span className="font-mono text-slate-500">
                    {activeMarker.position.lat.toFixed(4)}, {activeMarker.position.lng.toFixed(4)}
                  </span>
                  <a
                    href={getDirectionsUrl(activeMarker.position)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-emerald-800 hover:underline flex items-center gap-0.5"
                  >
                    <span>Directions &rarr;</span>
                  </a>
                </div>
              </div>
            </InfoWindowF>
          )}
        </GoogleMap>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-500 text-xs">
          <span>Loading Google Maps Platform...</span>
        </div>
      )}
    </div>
  );
};
