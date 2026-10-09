-- MANZILIQ Legal Documentation, Transfer Deeds & Digital Agreements Schema
-- Supabase Storage & PostgreSQL Migration Script

-- 1. Generated Documents Table (Linked to Bookings & User Profiles)
CREATE TABLE IF NOT EXISTS public.generated_documents (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  booking_id TEXT REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  society_id TEXT REFERENCES public.societies(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'transfer_deed', 
    'sale_agreement', 
    'allotment_letter', 
    'token_slip', 
    'payment_receipt', 
    'noc_certificate', 
    'cancellation_deed'
  )),
  file_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size TEXT DEFAULT '320 KB',
  verification_code TEXT UNIQUE NOT NULL,
  tamper_hash TEXT NOT NULL,
  signatories JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'superseded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes for Fast Buyer & Society Queries
CREATE INDEX IF NOT EXISTS idx_gen_docs_user_id ON public.generated_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_gen_docs_booking_id ON public.generated_documents(booking_id);
CREATE INDEX IF NOT EXISTS idx_gen_docs_doc_type ON public.generated_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_gen_docs_verification_code ON public.generated_documents(verification_code);

-- 3. Supabase Storage Bucket Initialization
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents', 
  'documents', 
  true, 
  10485760, -- 10 MB limit
  ARRAY['application/pdf', 'image/png', 'image/jpeg']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760;

-- 4. Storage Row-Level Security (RLS) Policies
-- Allow public download/read of verified legal documents
CREATE POLICY "Public Read Access for Legal Documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');

-- Allow authenticated users and service roles to upload to documents bucket
CREATE POLICY "Authenticated Uploads to Documents Bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents');

-- 5. Row-Level Security on generated_documents table
ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own generated documents"
  ON public.generated_documents FOR SELECT
  USING (
    auth.uid()::text = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('society_admin', 'super_admin')
    )
  );

CREATE POLICY "Admins and Society Admins can insert generated documents"
  ON public.generated_documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('society_admin', 'super_admin')
    ) OR
    auth.uid()::text = user_id
  );
