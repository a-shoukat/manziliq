/**
 * ManzilIQ Google Maps Platform Service & Helpers
 * Handles API key resolution, coordinate geometries, directions URLs,
 * nearby places query formatting, and Supabase schema documentation.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface FacilityItem {
  id: string;
  name: string;
  category: 'school' | 'hospital' | 'mosque' | 'market' | 'bank' | 'transport';
  categoryLabel: string;
  distanceKm: number;
  distanceFormatted: string;
  travelTimeDrive: string;
  travelTimeWalk: string;
  location: LatLng;
  address: string;
  rating?: number;
}

/**
 * Default fallback coordinates for Narowal & Lahore, Punjab
 */
export const DEFAULT_PAKISTAN_COORDINATES: LatLng = {
  lat: 32.1025, // Narowal center / Punjab
  lng: 74.8760
};

/**
 * Society Default Coordinates and Boundary Polygons
 */
export const SOCIETY_COORDINATES_MAP: Record<string, { center: LatLng; boundary: LatLng[]; zoom: number }> = {
  'soc-1': {
    center: { lat: 31.5982, lng: 74.2854 }, // Al-Rehman Garden Lahore / GT Road
    zoom: 16,
    boundary: [
      { lat: 31.6020, lng: 74.2810 },
      { lat: 31.6035, lng: 74.2895 },
      { lat: 31.5945, lng: 74.2920 },
      { lat: 31.5930, lng: 74.2835 },
      { lat: 31.6020, lng: 74.2810 }
    ]
  },
  'soc-2': {
    center: { lat: 31.5305, lng: 74.3820 }, // Royal Orchard Housing
    zoom: 16,
    boundary: [
      { lat: 31.5340, lng: 74.3780 },
      { lat: 31.5355, lng: 74.3860 },
      { lat: 31.5270, lng: 74.3875 },
      { lat: 31.5255, lng: 74.3795 },
      { lat: 31.5340, lng: 74.3780 }
    ]
  },
  'soc-3': {
    center: { lat: 31.4850, lng: 74.3210 }, // Model Town Greens
    zoom: 16,
    boundary: [
      { lat: 31.4885, lng: 74.3170 },
      { lat: 31.4898, lng: 74.3255 },
      { lat: 31.4815, lng: 74.3268 },
      { lat: 31.4802, lng: 74.3182 },
      { lat: 31.4885, lng: 74.3170 }
    ]
  },
  'soc-4': {
    center: { lat: 32.1620, lng: 75.1610 }, // Executive Enclave Heights Shakargarh
    zoom: 15,
    boundary: [
      { lat: 32.1660, lng: 75.1560 },
      { lat: 32.1675, lng: 75.1660 },
      { lat: 32.1580, lng: 75.1675 },
      { lat: 32.1565, lng: 75.1575 },
      { lat: 32.1660, lng: 75.1560 }
    ]
  }
};

/**
 * Retrieve the Google Maps API Key from environment
 */
export const getGoogleMapsApiKey = (): string => {
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
};

/**
 * Calculate Great-Circle Distance (Haversine Formula) in Kilometers
 */
export const calculateDistanceKm = (coord1: LatLng, coord2: LatLng): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
};

/**
 * Generate Google Maps App/Web "Get Directions" deep link
 */
export const getDirectionsUrl = (destination: LatLng | string, origin?: LatLng): string => {
  const destStr = typeof destination === 'string' 
    ? encodeURIComponent(destination) 
    : `${destination.lat},${destination.lng}`;
    
  if (origin) {
    return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destStr}&travelmode=driving`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${destStr}&travelmode=driving`;
};

/**
 * Generate Google Maps Place Viewer URL
 */
export const getGoogleMapsViewUrl = (coords: LatLng, label?: string): string => {
  const query = label ? `${encodeURIComponent(label)}/@${coords.lat},${coords.lng},16z` : `${coords.lat},${coords.lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
};

/**
 * Generate curated/realistic nearby facilities around any location
 */
export const getNearbyFacilities = (center: LatLng): FacilityItem[] => {
  // Offsets generated realistically around the coordinate
  const presets: Omit<FacilityItem, 'distanceKm' | 'distanceFormatted' | 'travelTimeDrive' | 'travelTimeWalk'>[] = [
    {
      id: 'fac-1',
      name: 'The City School & College Campus',
      category: 'school',
      categoryLabel: 'School & College',
      location: { lat: center.lat + 0.0032, lng: center.lng + 0.0041 },
      address: 'Main Boulevard, Phase 1 Educational Zone',
      rating: 4.8
    },
    {
      id: 'fac-2',
      name: 'District HQ / Medicare Emergency Hospital',
      category: 'hospital',
      categoryLabel: 'Hospital & Healthcare',
      location: { lat: center.lat - 0.0045, lng: center.lng + 0.0028 },
      address: 'Near Ring Road Circular Interchange',
      rating: 4.7
    },
    {
      id: 'fac-3',
      name: 'Grand Jamia Mosque & Islamic Centre',
      category: 'mosque',
      categoryLabel: 'Grand Mosque',
      location: { lat: center.lat + 0.0018, lng: center.lng - 0.0022 },
      address: 'Central Civic Sector, Sector A Block',
      rating: 5.0
    },
    {
      id: 'fac-4',
      name: 'Al-Madina Commercial Hub & Hypermarket',
      category: 'market',
      categoryLabel: 'Supermarket & Shopping',
      location: { lat: center.lat - 0.0025, lng: center.lng - 0.0035 },
      address: '100ft Main Boulevard Commercial Plaza',
      rating: 4.6
    },
    {
      id: 'fac-5',
      name: 'Habib Bank (HBL) & Meezan Islamic Bank ATM',
      category: 'bank',
      categoryLabel: 'Bank & ATM',
      location: { lat: center.lat + 0.0048, lng: center.lng - 0.0015 },
      address: 'Plot # 12, Financial Avenue',
      rating: 4.5
    },
    {
      id: 'fac-6',
      name: 'Metro / Speedo Bus Terminal & Public Transit',
      category: 'transport',
      categoryLabel: 'Public Transit',
      location: { lat: center.lat - 0.0062, lng: center.lng + 0.0055 },
      address: 'Main Highway Gateway Station',
      rating: 4.4
    }
  ];

  return presets.map((item) => {
    const dist = calculateDistanceKm(center, item.location);
    const driveMinutes = Math.max(1, Math.round(dist * 2.2));
    const walkMinutes = Math.max(3, Math.round(dist * 12));

    return {
      ...item,
      distanceKm: dist,
      distanceFormatted: dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist} km`,
      travelTimeDrive: `${driveMinutes} min drive`,
      travelTimeWalk: `${walkMinutes} min walk`
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);
};

/**
 * Supabase SQL Schema Reference for Google Maps integration
 */
export const SUPABASE_MAPS_SCHEMA_SQL = `
-- ============================================================================
-- MANZILIQ Smart Housing Platform: Google Maps GPS & Boundary Schema Update
-- Compatible with Supabase PostgreSQL (Supports standard float8 and PostGIS)
-- ============================================================================

-- 1. Add GPS Coordinates & Boundary Polygon columns to 'societies' table
ALTER TABLE IF EXISTS public.societies 
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS boundary_coordinates JSONB,
  ADD COLUMN IF NOT EXISTS map_zoom INTEGER DEFAULT 16,
  ADD COLUMN IF NOT EXISTS place_id TEXT;

-- 2. Add GPS coordinates to individual 'properties' table
ALTER TABLE IF EXISTS public.properties 
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS place_id TEXT,
  ADD COLUMN IF NOT EXISTS geo_address TEXT;

-- 3. Add GPS coordinates to 'plots' table for SVG-to-GPS ground geocoding
ALTER TABLE IF EXISTS public.plots 
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS geo_polygon JSONB;

-- 4. Create Performance Indexes for Spatial Queries
CREATE INDEX IF NOT EXISTS idx_societies_lat_lng ON public.societies(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_properties_lat_lng ON public.properties(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_plots_lat_lng ON public.plots(latitude, longitude);

-- 5. Seed Real Coordinates for Sample Societies
UPDATE public.societies 
SET 
  latitude = 31.5982,
  longitude = 74.2854,
  map_zoom = 16,
  boundary_coordinates = '[
    {"lat": 31.6020, "lng": 74.2810},
    {"lat": 31.6035, "lng": 74.2895},
    {"lat": 31.5945, "lng": 74.2920},
    {"lat": 31.5930, "lng": 74.2835}
  ]'::jsonb
WHERE id = 'soc-1' OR name ILIKE '%Al-Rehman%';

UPDATE public.societies 
SET 
  latitude = 31.5305,
  longitude = 74.3820,
  map_zoom = 16,
  boundary_coordinates = '[
    {"lat": 31.5340, "lng": 74.3780},
    {"lat": 31.5355, "lng": 74.3860},
    {"lat": 31.5270, "lng": 74.3875},
    {"lat": 31.5255, "lng": 74.3795}
  ]'::jsonb
WHERE id = 'soc-2' OR name ILIKE '%Royal Orchard%';

UPDATE public.societies 
SET 
  latitude = 31.4850,
  longitude = 74.3210,
  map_zoom = 16,
  boundary_coordinates = '[
    {"lat": 31.4885, "lng": 74.3170},
    {"lat": 31.4898, "lng": 74.3255},
    {"lat": 31.4815, "lng": 74.3268},
    {"lat": 31.4802, "lng": 74.3182}
  ]'::jsonb
WHERE id = 'soc-3' OR name ILIKE '%Model Town%';

UPDATE public.societies 
SET 
  latitude = 32.1620,
  longitude = 75.1610,
  map_zoom = 15,
  boundary_coordinates = '[
    {"lat": 32.1660, "lng": 75.1560},
    {"lat": 32.1675, "lng": 75.1660},
    {"lat": 32.1580, "lng": 75.1675},
    {"lat": 32.1565, "lng": 75.1575}
  ]'::jsonb
WHERE id = 'soc-4' OR name ILIKE '%Executive Enclave%';
`;
