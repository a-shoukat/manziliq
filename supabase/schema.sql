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

-- ============ v3-marketplace: properties ============

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  city text not null,
  area text,
  society_name text,
  block text,
  plot_size_marla numeric not null default 5,
  category text not null default 'residential' check (category in ('residential', 'commercial')),
  purpose text not null default 'sale' check (purpose in ('sale', 'rent')),
  price numeric not null default 0,
  bedrooms int,
  bathrooms int,
  description text,
  image_url text,
  status text not null default 'available'
    check (status in ('available', 'reserved', 'sold')),
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.properties enable row level security;

drop policy if exists "properties_public_read" on public.properties;
create policy "properties_public_read" on public.properties
  for select using (true);

drop policy if exists "properties_owner_write" on public.properties;
create policy "properties_owner_write" on public.properties
  for insert with check (auth.uid() = owner_id);

drop policy if exists "properties_owner_update" on public.properties;
create policy "properties_owner_update" on public.properties
  for update using (auth.uid() = owner_id);

drop policy if exists "properties_owner_delete" on public.properties;
create policy "properties_owner_delete" on public.properties
  for delete using (auth.uid() = owner_id);

-- ============ v4-society: plots, lots, dealer requests ============

create table if not exists public.lots (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references public.profiles(id) on delete cascade,
  dealer_id uuid references public.profiles(id) on delete set null,
  name text not null,
  block text,
  commission_pct numeric not null default 0,
  expires_at date,
  status text not null default 'active'
    check (status in ('active', 'revoked', 'expired', 'released')),
  created_at timestamptz not null default now()
);

create table if not exists public.plots (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references public.profiles(id) on delete cascade,
  block text not null,
  plot_no text not null,
  size_marla numeric not null default 5,
  category text not null default 'residential'
    check (category in ('residential', 'commercial')),
  base_price numeric not null default 0,
  status text not null default 'available'
    check (status in ('available', 'assigned', 'reserved', 'sold', 'blocked')),
  lot_id uuid references public.lots(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (society_id, block, plot_no)
);

create table if not exists public.dealer_requests (
  id uuid primary key default gen_random_uuid(),
  dealer_id uuid not null references public.profiles(id) on delete cascade,
  society_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  unique (dealer_id, society_id)
);

alter table public.lots enable row level security;
alter table public.plots enable row level security;
alter table public.dealer_requests enable row level security;

-- plots: public can read; society owns writes; assigned dealer can read own lots
drop policy if exists "plots_public_read" on public.plots;
create policy "plots_public_read" on public.plots for select using (true);

drop policy if exists "plots_society_write" on public.plots;
create policy "plots_society_write" on public.plots
  for all using (auth.uid() = society_id) with check (auth.uid() = society_id);

-- lots: society manages; dealer reads own
drop policy if exists "lots_society_all" on public.lots;
create policy "lots_society_all" on public.lots
  for all using (auth.uid() = society_id) with check (auth.uid() = society_id);

drop policy if exists "lots_dealer_read" on public.lots;
create policy "lots_dealer_read" on public.lots
  for select using (auth.uid() = dealer_id);

-- dealer_requests: dealer creates own; society manages incoming
drop policy if exists "dr_dealer_create" on public.dealer_requests;
create policy "dr_dealer_create" on public.dealer_requests
  for insert with check (auth.uid() = dealer_id);

drop policy if exists "dr_read" on public.dealer_requests;
create policy "dr_read" on public.dealer_requests
  for select using (auth.uid() = dealer_id or auth.uid() = society_id);

drop policy if exists "dr_society_update" on public.dealer_requests;
create policy "dr_society_update" on public.dealer_requests
  for update using (auth.uid() = society_id);
