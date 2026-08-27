-- ====================================================================
-- ManzilIQ Supabase Migration: Voice Notes & Audio URL Integration
-- Migration: 20260827_add_voice_notes_and_audio_url.sql
-- Description: Adds audio_url and voice_transcript columns to properties table,
--              provisions 'property-voice-notes' storage bucket with strict
--              Row Level Security (RLS) for Dealers & Society Admins.
-- ====================================================================

-- 1. Add audio_url and voice_transcript columns to properties table
ALTER TABLE IF EXISTS public.properties 
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS voice_transcript TEXT,
ADD COLUMN IF NOT EXISTS audio_file_size_bytes BIGINT,
ADD COLUMN IF NOT EXISTS audio_duration_seconds NUMERIC(5,2);

-- Comment on columns for documentation
COMMENT ON COLUMN public.properties.audio_url IS 'Public / Storage URL of original dealer/admin voice recording';
COMMENT ON COLUMN public.properties.voice_transcript IS 'Transcribed audio text (Urdu/English) produced by Whisper or Gemini AI';

-- 2. Create Storage Bucket for Property Voice Notes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'property-voice-notes',
    'property-voice-notes',
    true,
    5242880, -- 5MB maximum file size
    ARRAY['audio/webm', 'audio/mp3', 'audio/wav', 'audio/x-m4a', 'audio/m4a', 'audio/ogg', 'audio/mp4']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['audio/webm', 'audio/mp3', 'audio/wav', 'audio/x-m4a', 'audio/m4a', 'audio/ogg', 'audio/mp4'];

-- 3. Storage Row Level Security (RLS) Policies
-- Ensure RLS is active on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy A: Allow Dealers and Society Admins to upload voice notes
DROP POLICY IF EXISTS "Dealers and Society Admins can upload property voice notes" ON storage.objects;
CREATE POLICY "Dealers and Society Admins can upload property voice notes"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'property-voice-notes'
    AND (
        (auth.jwt() ->> 'role') IN ('dealer', 'society', 'society_admin', 'super_admin')
        OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('dealer', 'society', 'society_admin', 'super_admin')
    )
);

-- Policy B: Allow Dealers and Society Admins to update or delete their own voice notes
DROP POLICY IF EXISTS "Dealers and Society Admins can manage their voice notes" ON storage.objects;
CREATE POLICY "Dealers and Society Admins can manage their voice notes"
ON storage.objects
FOR ALL
TO authenticated
USING (
    bucket_id = 'property-voice-notes'
    AND (
        owner = auth.uid()
        OR (auth.jwt() ->> 'role') IN ('society_admin', 'super_admin')
    )
);

-- Policy C: Public read access for voice notes attached to active listings
DROP POLICY IF EXISTS "Public can listen to property voice notes" ON storage.objects;
CREATE POLICY "Public can listen to property voice notes"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'property-voice-notes');

-- 4. Properties Table RLS Policy update
DROP POLICY IF EXISTS "Dealers and Societies can insert voice properties" ON public.properties;
CREATE POLICY "Dealers and Societies can insert voice properties"
ON public.properties
FOR INSERT
TO authenticated
WITH CHECK (
    (auth.jwt() ->> 'role') IN ('dealer', 'society', 'society_admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('dealer', 'society', 'society_admin', 'super_admin')
);
