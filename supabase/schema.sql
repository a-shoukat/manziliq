-- ManzilIQ Prototype — Supabase schema (cumulative per version)
-- Run this in the Supabase SQL Editor. Safe to re-run (uses IF NOT EXISTS).

-- v2-auth: user profiles with roles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'buyer'
    check (role in ('buyer', 'dealer', 'society_admin', 'super_admin')),
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
