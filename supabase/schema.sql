-- ManzilIQ Prototype — Supabase schema (cumulative per version)
-- Run this in the Supabase SQL Editor. Safe to re-run (uses IF NOT EXISTS).

-- ============ v2-auth: profiles, role details, verification ============

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'buyer'
    check (role in ('buyer', 'dealer', 'society_admin', 'super_admin')),
  verification_status text not null default 'approved'
    check (verification_status in ('pending', 'approved', 'rejected', 'blacklisted')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Society registration details (WBS: Society Portal — Registration & Verification)
create table if not exists public.society_details (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  society_name text not null,
  address text not null,
  developer_info text,
  noc_doc_url text,
  secp_doc_url text,
  created_at timestamptz not null default now()
);

alter table public.society_details enable row level security;

drop policy if exists "society_details_owner" on public.society_details;
create policy "society_details_owner" on public.society_details
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- Dealer registration details (WBS: Dealer Portal — Registration & Profile)
create table if not exists public.dealer_details (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  cnic_doc_url text,
  license_no text not null,
  firm_name text not null,
  experience_years int not null default 0,
  photo_url text,
  created_at timestamptz not null default now()
);

alter table public.dealer_details enable row level security;

drop policy if exists "dealer_details_owner" on public.dealer_details;
create policy "dealer_details_owner" on public.dealer_details
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- Customer registration details (WBS: Customer Portal — Account Registration)
create table if not exists public.customer_details (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  cnic_number text,
  contact_phone text,
  address text,
  photo_url text,
  created_at timestamptz not null default now()
);

alter table public.customer_details enable row level security;

drop policy if exists "customer_details_owner" on public.customer_details;
create policy "customer_details_owner" on public.customer_details
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- Document storage bucket (CNIC, NOC, SECP, photos)
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

drop policy if exists "documents_owner_rw" on storage.objects;
create policy "documents_owner_rw" on storage.objects
  for all using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
