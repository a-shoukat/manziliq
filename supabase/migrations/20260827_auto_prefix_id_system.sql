-- ==============================================================================
-- MANZILIQ Supabase Migration: Auto-Generated Unique Prefix ID System
-- Migration: 20260827_auto_prefix_id_system.sql
-- Description:
--   1. Adds society_code & society_id_code to societies table
--   2. Adds property_id & category_prefix to properties & plots tables
--   3. Creates concurrency-safe id_counters table with row-locking
--   4. Creates PostgreSQL BEFORE INSERT triggers as single source of truth
--   5. One-time retroactive migration to backfill unique IDs for existing inventory
-- ==============================================================================

BEGIN;

-- 1. EXTEND SOCIETIES TABLE
ALTER TABLE IF EXISTS public.societies 
ADD COLUMN IF NOT EXISTS society_code TEXT,
ADD COLUMN IF NOT EXISTS society_id_code TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_societies_society_code ON public.societies(society_code);

-- 2. EXTEND PROPERTIES TABLE
ALTER TABLE IF EXISTS public.properties 
ADD COLUMN IF NOT EXISTS property_id TEXT,
ADD COLUMN IF NOT EXISTS category_prefix TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_properties_property_id ON public.properties(property_id);

-- 3. EXTEND PLOTS TABLE
ALTER TABLE IF EXISTS public.plots 
ADD COLUMN IF NOT EXISTS property_id TEXT,
ADD COLUMN IF NOT EXISTS plot_code TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_plots_property_id ON public.plots(property_id);

-- 4. CREATE CONCURRENCY-SAFE ID COUNTERS TABLE
CREATE TABLE IF NOT EXISTS public.id_counters (
    id SERIAL PRIMARY KEY,
    society_id TEXT REFERENCES public.societies(id) ON DELETE CASCADE,
    society_code TEXT NOT NULL,
    category TEXT NOT NULL, -- 'residential_plot', 'commercial_plot', 'residential_property', 'commercial_property', 'society'
    prefix TEXT NOT NULL,   -- 'RPL', 'CPL', 'RES', 'COM', 'SOC'
    last_number INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_id_counters_soc_cat UNIQUE (society_id, category)
);

CREATE INDEX IF NOT EXISTS idx_id_counters_lookup ON public.id_counters(society_id, category);

-- 5. HELPER FUNCTION: DERIVE CATEGORY PREFIX
CREATE OR REPLACE FUNCTION public.fn_get_category_prefix(p_category TEXT, p_type TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Residential Plots
    IF LOWER(COALESCE(p_category, '')) LIKE '%residential%plot%' 
       OR (LOWER(COALESCE(p_type, '')) = 'plot' AND LOWER(COALESCE(p_category, '')) NOT LIKE '%commercial%') THEN
        RETURN 'RPL';
    END IF;

    -- Commercial Plots
    IF LOWER(COALESCE(p_category, '')) LIKE '%commercial%plot%' 
       OR (LOWER(COALESCE(p_type, '')) = 'commercial' AND LOWER(COALESCE(p_category, '')) LIKE '%plot%') THEN
        RETURN 'CPL';
    END IF;

    -- Residential Properties (Houses, Villas, Apartments)
    IF LOWER(COALESCE(p_type, '')) IN ('house', 'apartment', 'villa') 
       OR LOWER(COALESCE(p_category, '')) LIKE '%villa%' 
       OR LOWER(COALESCE(p_category, '')) LIKE '%house%'
       OR LOWER(COALESCE(p_category, '')) LIKE '%residential%property%' THEN
        RETURN 'RES';
    END IF;

    -- Commercial Properties (Shops, Plazas, Offices)
    IF LOWER(COALESCE(p_type, '')) IN ('commercial', 'shop', 'office') 
       OR LOWER(COALESCE(p_category, '')) LIKE '%plaza%' 
       OR LOWER(COALESCE(p_category, '')) LIKE '%commercial%property%' THEN
        RETURN 'COM';
    END IF;

    RETURN 'RES';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 6. HELPER FUNCTION: DERIVE SOCIETY SHORT CODE
CREATE OR REPLACE FUNCTION public.fn_derive_society_code(p_name TEXT)
RETURNS TEXT AS $$
DECLARE
    v_clean TEXT;
    v_words TEXT[];
    v_code TEXT := '';
    v_i INT;
BEGIN
    IF p_name IS NULL OR TRIM(p_name) = '' THEN
        RETURN 'GEN';
    END IF;

    -- Normalize string
    v_clean := REGEXP_REPLACE(p_name, '[^a-zA-Z0-9\s]', ' ', 'g');
    v_words := STRING_TO_ARRAY(TRIM(v_clean), ' ');

    -- Try acronym of major words
    FOR v_i IN 1..ARRAY_LENGTH(v_words, 1) LOOP
        IF LENGTH(TRIM(v_words[v_i])) > 0 AND UPPER(TRIM(v_words[v_i])) NOT IN ('THE', 'AND', 'OF', 'NEAR', 'PHASE', 'SECTOR', 'BLOCK') THEN
            v_code := v_code || SUBSTRING(UPPER(TRIM(v_words[v_i])) FROM 1 FOR 1);
        END IF;
    END LOOP;

    -- Ensure minimum 2 and maximum 4 characters
    IF LENGTH(v_code) < 2 THEN
        v_code := UPPER(SUBSTRING(REGEXP_REPLACE(p_name, '[^a-zA-Z0-9]', '', 'g') FROM 1 FOR 3));
    ELSIF LENGTH(v_code) > 4 THEN
        v_code := SUBSTRING(v_code FROM 1 FOR 4);
    END IF;

    IF LENGTH(v_code) = 0 THEN
        v_code := 'SOC';
    END IF;

    RETURN v_code;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 7. TRIGGER FUNCTION: AUTO-ASSIGN UNIQUE PROPERTY ID (BEFORE INSERT ON properties)
CREATE OR REPLACE FUNCTION public.trg_assign_property_unique_id()
RETURNS TRIGGER AS $$
DECLARE
    v_soc_code TEXT;
    v_prefix TEXT;
    v_cat_key TEXT;
    v_next_num INT;
BEGIN
    -- If property_id is already assigned with proper prefix pattern, skip re-generation
    IF NEW.property_id IS NOT NULL AND NEW.property_id ~ '^[A-Z0-9]{2,5}-[A-Z]{3}-[0-9]{4,}$' THEN
        RETURN NEW;
    END IF;

    -- 1. Fetch Society Code & Validate Society Status
    IF NEW.society_id IS NOT NULL THEN
        SELECT COALESCE(society_code, fn_derive_society_code(name))
        INTO v_soc_code
        FROM public.societies
        WHERE id = NEW.society_id;
        
        IF v_soc_code IS NULL THEN
            v_soc_code := 'GEN';
        END IF;
    ELSE
        v_soc_code := 'GEN';
    END IF;

    -- 2. Determine Category Prefix
    v_prefix := fn_get_category_prefix(NEW.category, NEW.type);
    
    IF v_prefix = 'RPL' THEN
        v_cat_key := 'residential_plot';
    ELSIF v_prefix = 'CPL' THEN
        v_cat_key := 'commercial_plot';
    ELSIF v_prefix = 'COM' THEN
        v_cat_key := 'commercial_property';
    ELSE
        v_cat_key := 'residential_property';
    END IF;

    -- 3. Atomic Row-Level Locked Increment in id_counters
    INSERT INTO public.id_counters (society_id, society_code, category, prefix, last_number, updated_at)
    VALUES (NEW.society_id, v_soc_code, v_cat_key, v_prefix, 1, NOW())
    ON CONFLICT (society_id, category)
    DO UPDATE SET 
        last_number = public.id_counters.last_number + 1,
        updated_at = NOW()
    RETURNING last_number INTO v_next_num;

    -- 4. Set NEW Fields
    NEW.property_id := v_soc_code || '-' || v_prefix || '-' || LPAD(v_next_num::text, 4, '0');
    NEW.category_prefix := v_prefix;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_assign_property_unique_id ON public.properties;
CREATE TRIGGER trigger_assign_property_unique_id
BEFORE INSERT ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.trg_assign_property_unique_id();

-- 8. TRIGGER FUNCTION: AUTO-ASSIGN UNIQUE PLOT PROPERTY ID (BEFORE INSERT ON plots)
CREATE OR REPLACE FUNCTION public.trg_assign_plot_unique_id()
RETURNS TRIGGER AS $$
DECLARE
    v_soc_code TEXT;
    v_prefix TEXT;
    v_cat_key TEXT;
    v_next_num INT;
BEGIN
    IF NEW.property_id IS NOT NULL AND NEW.property_id ~ '^[A-Z0-9]{2,5}-[A-Z]{3}-[0-9]{4,}$' THEN
        RETURN NEW;
    END IF;

    -- Society Code
    IF NEW.society_id IS NOT NULL THEN
        SELECT COALESCE(society_code, fn_derive_society_code(name))
        INTO v_soc_code
        FROM public.societies
        WHERE id = NEW.society_id;
        
        IF v_soc_code IS NULL THEN
            v_soc_code := 'GEN';
        END IF;
    ELSE
        v_soc_code := 'GEN';
    END IF;

    -- Prefix
    IF LOWER(COALESCE(NEW.category, '')) = 'commercial' THEN
        v_prefix := 'CPL';
        v_cat_key := 'commercial_plot';
    ELSE
        v_prefix := 'RPL';
        v_cat_key := 'residential_plot';
    END IF;

    -- Atomic Counter Increment
    INSERT INTO public.id_counters (society_id, society_code, category, prefix, last_number, updated_at)
    VALUES (NEW.society_id, v_soc_code, v_cat_key, v_prefix, 1, NOW())
    ON CONFLICT (society_id, category)
    DO UPDATE SET 
        last_number = public.id_counters.last_number + 1,
        updated_at = NOW()
    RETURNING last_number INTO v_next_num;

    NEW.property_id := v_soc_code || '-' || v_prefix || '-' || LPAD(v_next_num::text, 4, '0');
    NEW.plot_code := NEW.property_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_assign_plot_unique_id ON public.plots;
CREATE TRIGGER trigger_assign_plot_unique_id
BEFORE INSERT ON public.plots
FOR EACH ROW
EXECUTE FUNCTION public.trg_assign_plot_unique_id();

-- 9. TRIGGER FUNCTION: AUTO-ASSIGN SOCIETY CODE & ID (BEFORE INSERT ON societies)
CREATE OR REPLACE FUNCTION public.trg_assign_society_code_and_id()
RETURNS TRIGGER AS $$
DECLARE
    v_soc_count INT;
    v_code TEXT;
    v_suffix INT := 1;
BEGIN
    IF NEW.society_code IS NULL OR TRIM(NEW.society_code) = '' THEN
        v_code := fn_derive_society_code(NEW.name);
        -- Check collision
        WHILE EXISTS (SELECT 1 FROM public.societies WHERE society_code = v_code AND id != NEW.id) LOOP
            v_suffix := v_suffix + 1;
            v_code := SUBSTRING(v_code FROM 1 FOR 2) || v_suffix::text;
        END LOOP;
        NEW.society_code := v_code;
    END IF;

    IF NEW.society_id_code IS NULL OR TRIM(NEW.society_id_code) = '' THEN
        SELECT COUNT(*) + 1 INTO v_soc_count FROM public.societies;
        NEW.society_id_code := 'SOC-' || LPAD(v_soc_count::text, 4, '0');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_assign_society_code ON public.societies;
CREATE TRIGGER trigger_assign_society_code
BEFORE INSERT ON public.societies
FOR EACH ROW
EXECUTE FUNCTION public.trg_assign_society_code_and_id();

-- 10. ONE-TIME RETROACTIVE MIGRATION (Backfill existing societies, counters, plots & properties)

-- Backfill Societies
UPDATE public.societies SET society_code = 'ARG', society_id_code = 'SOC-0001' WHERE id = 'soc-nwl-1' OR name ILIKE '%Al-Rehman%';
UPDATE public.societies SET society_code = 'MCH', society_id_code = 'SOC-0002' WHERE id = 'soc-nwl-2' OR name ILIKE '%Model City%';
UPDATE public.societies SET society_code = 'RPC', society_id_code = 'SOC-0003' WHERE id = 'soc-nwl-3' OR name ILIKE '%Royal Palm%';
UPDATE public.societies SET society_code = 'GVE', society_id_code = 'SOC-0004' WHERE id = 'soc-nwl-4' OR name ILIKE '%Green Valley%';

-- Backfill any remaining societies
UPDATE public.societies 
SET society_code = fn_derive_society_code(name),
    society_id_code = 'SOC-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::text, 4, '0')
WHERE society_code IS NULL;

-- Backfill Plots with clean IDs (e.g. ARG-RPL-0001, ARG-CPL-0001, etc.)
WITH numbered_plots AS (
    SELECT 
        p.id,
        s.society_code,
        CASE WHEN p.category = 'commercial' THEN 'CPL' ELSE 'RPL' END as prefix,
        ROW_NUMBER() OVER (
            PARTITION BY p.society_id, CASE WHEN p.category = 'commercial' THEN 'CPL' ELSE 'RPL' END 
            ORDER BY p.id
        ) as seq_num
    FROM public.plots p
    JOIN public.societies s ON s.id = p.society_id
)
UPDATE public.plots p
SET property_id = np.society_code || '-' || np.prefix || '-' || LPAD(np.seq_num::text, 4, '0'),
    plot_code = np.society_code || '-' || np.prefix || '-' || LPAD(np.seq_num::text, 4, '0')
FROM numbered_plots np
WHERE p.id = np.id;

-- Backfill Properties with clean IDs (e.g. ARG-RES-0001, RPC-RES-0001, ARG-RPL-0001, etc.)
WITH numbered_props AS (
    SELECT 
        pr.id,
        COALESCE(s.society_code, 'GEN') as soc_code,
        fn_get_category_prefix(pr.category, pr.type) as prefix,
        ROW_NUMBER() OVER (
            PARTITION BY pr.society_id, fn_get_category_prefix(pr.category, pr.type) 
            ORDER BY pr.id
        ) as seq_num
    FROM public.properties pr
    LEFT JOIN public.societies s ON s.id = pr.society_id
)
UPDATE public.properties pr
SET property_id = npr.soc_code || '-' || npr.prefix || '-' || LPAD(npr.seq_num::text, 4, '0'),
    category_prefix = npr.prefix
FROM numbered_props npr
WHERE pr.id = npr.id;

-- Seed / Synchronize id_counters based on current max numbers
INSERT INTO public.id_counters (society_id, society_code, category, prefix, last_number, updated_at)
SELECT 
    s.id as society_id,
    s.society_code,
    'residential_plot' as category,
    'RPL' as prefix,
    COALESCE(MAX(CAST(SUBSTRING(p.property_id FROM '[0-9]+$') AS INT)), 0) as last_number,
    NOW() as updated_at
FROM public.societies s
LEFT JOIN public.plots p ON p.society_id = s.id AND p.property_id LIKE '%-RPL-%'
GROUP BY s.id, s.society_code
ON CONFLICT (society_id, category) DO UPDATE 
SET last_number = EXCLUDED.last_number, updated_at = NOW();

INSERT INTO public.id_counters (society_id, society_code, category, prefix, last_number, updated_at)
SELECT 
    s.id as society_id,
    s.society_code,
    'commercial_plot' as category,
    'CPL' as prefix,
    COALESCE(MAX(CAST(SUBSTRING(p.property_id FROM '[0-9]+$') AS INT)), 0) as last_number,
    NOW() as updated_at
FROM public.societies s
LEFT JOIN public.plots p ON p.society_id = s.id AND p.property_id LIKE '%-CPL-%'
GROUP BY s.id, s.society_code
ON CONFLICT (society_id, category) DO UPDATE 
SET last_number = EXCLUDED.last_number, updated_at = NOW();

INSERT INTO public.id_counters (society_id, society_code, category, prefix, last_number, updated_at)
SELECT 
    s.id as society_id,
    s.society_code,
    'residential_property' as category,
    'RES' as prefix,
    COALESCE(MAX(CAST(SUBSTRING(pr.property_id FROM '[0-9]+$') AS INT)), 0) as last_number,
    NOW() as updated_at
FROM public.societies s
LEFT JOIN public.properties pr ON pr.society_id = s.id AND pr.property_id LIKE '%-RES-%'
GROUP BY s.id, s.society_code
ON CONFLICT (society_id, category) DO UPDATE 
SET last_number = EXCLUDED.last_number, updated_at = NOW();

INSERT INTO public.id_counters (society_id, society_code, category, prefix, last_number, updated_at)
SELECT 
    s.id as society_id,
    s.society_code,
    'commercial_property' as category,
    'COM' as prefix,
    COALESCE(MAX(CAST(SUBSTRING(pr.property_id FROM '[0-9]+$') AS INT)), 0) as last_number,
    NOW() as updated_at
FROM public.societies s
LEFT JOIN public.properties pr ON pr.society_id = s.id AND pr.property_id LIKE '%-COM-%'
GROUP BY s.id, s.society_code
ON CONFLICT (society_id, category) DO UPDATE 
SET last_number = EXCLUDED.last_number, updated_at = NOW();

COMMIT;
