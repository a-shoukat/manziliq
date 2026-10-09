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
