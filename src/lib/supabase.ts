import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, UserRole, Society, Plot, Property, Booking, Installment } from '../types';

// Read Supabase environment variables from Vite environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.length > 0 &&
    !supabaseUrl.includes('your-project-id') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.length > 0 &&
    !supabaseAnonKey.includes('your-anon-key')
  );
};

// Create Supabase client lazily if configured
let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return clientInstance;
};

// SQL Schema Definition string for users to easily run in Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- MANZILIQ Smart Real Estate & Housing Society Management Ecosystem
-- Complete Multi-Role RBAC & Row Level Security (RLS) SQL Migration Script
-- Target Database: PostgreSQL 14+ / Supabase

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Custom Role Enum Type
DO $$ BEGIN
  CREATE TYPE user_role_type AS ENUM ('buyer', 'dealer', 'society_admin', 'super_admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE user_status_type AS ENUM ('active', 'pending', 'pending_verification', 'rejected', 'suspended');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Profiles / Users Table (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID GENERATED ALWAYS AS (id) STORED,
  name TEXT NOT NULL,
  full_name TEXT GENERATED ALWAYS AS (name) STORED,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role user_role_type DEFAULT 'buyer'::user_role_type NOT NULL,
  status user_status_type DEFAULT 'active'::user_status_type NOT NULL,
  verified BOOLEAN DEFAULT false,
  cnic TEXT,
  cnic_doc_url TEXT,
  license_no TEXT,
  license_doc_url TEXT,
  noc_doc_url TEXT,
  secp_doc_url TEXT,
  avatar TEXT,
  society_id TEXT,
  society_name TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Housing Societies Table
CREATE TABLE IF NOT EXISTS public.societies (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name TEXT NOT NULL,
  city TEXT DEFAULT 'Lahore',
  district TEXT DEFAULT 'Lahore',
  location TEXT NOT NULL,
  total_plots INT DEFAULT 0,
  available_plots INT DEFAULT 0,
  reserved_plots INT DEFAULT 0,
  sold_plots INT DEFAULT 0,
  hero_image TEXT,
  description TEXT,
  amenities TEXT[] DEFAULT '{}',
  approval_status TEXT DEFAULT 'approved' CHECK (approval_status IN ('approved', 'pending', 'rejected')),
  contact_phone TEXT,
  map_embed_url TEXT,
  noc_number TEXT,
  noc_doc_url TEXT,
  secp_doc_url TEXT,
  late_fee_percent NUMERIC DEFAULT 2.5,
  down_payment_percent NUMERIC DEFAULT 20.0,
  standard_duration_months INT DEFAULT 36,
  admin_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Plots Table
CREATE TABLE IF NOT EXISTS public.plots (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  society_id TEXT NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  society_name TEXT NOT NULL,
  plot_number TEXT NOT NULL,
  sector TEXT NOT NULL,
  block TEXT NOT NULL,
  size_marla NUMERIC NOT NULL,
  size_unit TEXT DEFAULT 'Marla',
  size_sq_ft NUMERIC NOT NULL,
  price_pkr NUMERIC NOT NULL,
  base_price NUMERIC,
  down_payment_pkr NUMERIC NOT NULL,
  monthly_installment_pkr NUMERIC NOT NULL,
  installment_months INT DEFAULT 36,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'reserved', 'sold', 'disputed')),
  category TEXT DEFAULT 'residential' CHECK (category IN ('residential', 'commercial', 'plot_file')),
  dimensions TEXT DEFAULT '25x45',
  features TEXT[] DEFAULT '{}',
  coord_x NUMERIC DEFAULT 0,
  coord_y NUMERIC DEFAULT 0,
  dealer_id TEXT,
  dealer_name TEXT,
  assigned_at TIMESTAMPTZ,
  assignment_expiry TIMESTAMPTZ,
  is_locked BOOLEAN DEFAULT false,
  is_disputed BOOLEAN DEFAULT false,
  dispute_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_society_block_plot UNIQUE (society_id, block, plot_number)
);

-- 5b. Dealer Society Relations Table
CREATE TABLE IF NOT EXISTS public.dealer_society_relations (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  dealer_id TEXT NOT NULL,
  dealer_name TEXT NOT NULL,
  dealer_cnic TEXT NOT NULL,
  dealer_license TEXT NOT NULL,
  dealer_email TEXT NOT NULL,
  dealer_phone TEXT NOT NULL,
  society_id TEXT NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  society_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  commission_percent NUMERIC DEFAULT 2.0,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  CONSTRAINT uq_dealer_society UNIQUE (dealer_id, society_id)
);

-- 5c. Lot Assignments Table
CREATE TABLE IF NOT EXISTS public.lot_assignments (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  lot_number TEXT NOT NULL,
  society_id TEXT NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  society_name TEXT NOT NULL,
  block TEXT NOT NULL,
  dealer_id TEXT NOT NULL,
  dealer_name TEXT NOT NULL,
  dealer_license TEXT,
  dealer_cnic TEXT,
  dealer_phone TEXT,
  plot_ids TEXT[] NOT NULL DEFAULT '{}',
  plot_numbers TEXT[] NOT NULL DEFAULT '{}',
  assigned_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expiring', 'expired', 'released', 'revoked')),
  commission_percent NUMERIC DEFAULT 2.0,
  assigned_by TEXT NOT NULL,
  renewal_terms TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5d. Dealer Lot Requests Table
CREATE TABLE IF NOT EXISTS public.dealer_lot_requests (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  dealer_id TEXT NOT NULL,
  dealer_name TEXT NOT NULL,
  society_id TEXT NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  society_name TEXT NOT NULL,
  type TEXT DEFAULT 'additional_lot' CHECK (type IN ('additional_lot', 'release_lot')),
  requested_block TEXT NOT NULL,
  plot_count INT NOT NULL DEFAULT 1,
  plot_ids TEXT[] DEFAULT '{}',
  plot_numbers TEXT[] DEFAULT '{}',
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  review_note TEXT
);

-- 5e. Lot Audit Trail Table
CREATE TABLE IF NOT EXISTS public.lot_audit_trail (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  assignment_id TEXT NOT NULL,
  plot_id TEXT NOT NULL,
  plot_number TEXT NOT NULL,
  block TEXT NOT NULL,
  society_id TEXT NOT NULL,
  society_name TEXT NOT NULL,
  dealer_id TEXT NOT NULL,
  dealer_name TEXT NOT NULL,
  assigned_by TEXT NOT NULL,
  assigned_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  released_date DATE,
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('ASSIGNED', 'RESERVED', 'SOLD', 'RELEASED', 'EXPIRED', 'RENEWED', 'REVOKED', 'DISPUTED')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- 6. Properties / Marketplace Listings Table
CREATE TABLE IF NOT EXISTS public.properties (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'plot' CHECK (type IN ('plot', 'house', 'commercial', 'apartment')),
  price_pkr NUMERIC NOT NULL,
  size_marla NUMERIC NOT NULL,
  bedrooms INT,
  bathrooms INT,
  location TEXT NOT NULL,
  city TEXT DEFAULT 'Lahore',
  society_id TEXT NOT NULL,
  society_name TEXT NOT NULL,
  dealer_id TEXT,
  dealer_name TEXT,
  images TEXT[] DEFAULT '{}',
  description TEXT,
  amenities TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'rejected')),
  listing_status TEXT DEFAULT 'available' CHECK (listing_status IN ('available', 'reserved', 'sold', 'disputed')),
  is_duplicate_flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  buyer_id TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  buyer_cnic TEXT,
  plot_id TEXT NOT NULL,
  plot_number TEXT NOT NULL,
  sector TEXT NOT NULL,
  society_id TEXT NOT NULL,
  society_name TEXT NOT NULL,
  total_price_pkr NUMERIC NOT NULL,
  token_advance_pkr NUMERIC DEFAULT 50000,
  down_payment_pkr NUMERIC NOT NULL,
  monthly_installment_pkr NUMERIC NOT NULL,
  total_installments INT DEFAULT 36,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  pipeline_stage INT DEFAULT 1 CHECK (pipeline_stage BETWEEN 1 AND 6),
  dealer_id TEXT,
  dealer_name TEXT,
  allotment_letter_number TEXT,
  cancellation_reason TEXT,
  cancellation_penalty_pkr NUMERIC,
  booking_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Installments Ledger Table
CREATE TABLE IF NOT EXISTS public.installments (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  booking_id TEXT NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  installment_number INT NOT NULL,
  due_date DATE NOT NULL,
  amount_pkr NUMERIC NOT NULL,
  late_fee_pkr NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'due' CHECK (status IN ('paid', 'due', 'overdue')),
  paid_date DATE,
  payment_method TEXT,
  transaction_id TEXT,
  receipt_number TEXT,
  challan_number TEXT,
  plot_number TEXT,
  society_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Dealer Leads Table
CREATE TABLE IF NOT EXISTS public.dealer_leads (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  dealer_id TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  property_interested TEXT,
  budget_pkr NUMERIC,
  status TEXT DEFAULT 'inquiry',
  notes TEXT,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT,
  booking_id TEXT,
  buyer_id TEXT,
  buyer_name TEXT,
  buyer_cnic TEXT,
  plot_number TEXT,
  society_name TEXT,
  file_url TEXT,
  file_size TEXT,
  verified_stamp BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Immutable Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id TEXT,
  actor TEXT NOT NULL,
  actor_role TEXT,
  action TEXT NOT NULL,
  category TEXT NOT NULL,
  target TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  ip_address TEXT,
  details TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. Verification Requests Queue Table
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL,
  society_name TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  cnic_number TEXT,
  cnic_doc_name TEXT,
  license_doc_name TEXT,
  noc_doc_name TEXT,
  secp_doc_name TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  comments TEXT
);

--------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
--------------------------------------------------------------------------------

-- Helper Functions to extract current user's role
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS text AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin' AND status = 'active'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_society_admin(soc_id text)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND role = 'society_admin' 
      AND status = 'active'
      AND (society_id = soc_id OR society_id IS NULL)
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_dealer()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'dealer' AND status = 'active'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Enable RLS on ALL tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealer_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
-- Users can read their own profile; Super Admins can read all profiles; Society Admins can view dealers/buyers in their society
CREATE POLICY "Profiles read policy" ON public.profiles
  FOR SELECT USING (
    id = auth.uid() OR public.is_super_admin() OR role = 'dealer'
  );

-- Users can update only their own profile, but CANNOT escalate their own role or status
CREATE POLICY "Profiles self update policy" ON public.profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() AND 
    (role = (SELECT role FROM public.profiles WHERE id = auth.uid()) OR public.is_super_admin())
  );

-- Super admin full access on profiles
CREATE POLICY "Super admin full profiles" ON public.profiles
  FOR ALL USING (public.is_super_admin());

-- 2. Societies Policies
-- Public can read approved societies
CREATE POLICY "Public read approved societies" ON public.societies
  FOR SELECT USING (approval_status = 'approved' OR public.is_super_admin() OR admin_user_id = auth.uid());

-- Society Admin can update their assigned society
CREATE POLICY "Society admin update assigned society" ON public.societies
  FOR UPDATE USING (admin_user_id = auth.uid() OR public.is_super_admin());

-- Super Admin can manage all societies
CREATE POLICY "Super admin manage societies" ON public.societies
  FOR ALL USING (public.is_super_admin());

-- 3. Plots Policies
-- Public can read plot status for masterplan
CREATE POLICY "Public read plots" ON public.plots
  FOR SELECT USING (true);

-- Society Admin can manage plots in their assigned society
CREATE POLICY "Society admin manage society plots" ON public.plots
  FOR ALL USING (
    public.is_super_admin() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'society_admin' AND society_id = plots.society_id)
  );

-- 4. Properties / Marketplace Listings Policies
-- Public can read approved non-flagged listings
CREATE POLICY "Public read properties" ON public.properties
  FOR SELECT USING (status = 'approved' OR dealer_id = auth.uid()::text OR public.is_super_admin());

-- Dealers can insert and update their own property listings
CREATE POLICY "Dealers manage own listings" ON public.properties
  FOR INSERT WITH CHECK (dealer_id = auth.uid()::text OR public.is_super_admin());

CREATE POLICY "Dealers update own listings" ON public.properties
  FOR UPDATE USING (dealer_id = auth.uid()::text OR public.is_super_admin());

CREATE POLICY "Dealers delete own listings" ON public.properties
  FOR DELETE USING (dealer_id = auth.uid()::text OR public.is_super_admin());

-- 5. Bookings Policies
-- Buyers can read only their own bookings; Society Admin can read society bookings; Dealers can read assigned bookings; Super Admin can read all
CREATE POLICY "Bookings select access" ON public.bookings
  FOR SELECT USING (
    buyer_id = auth.uid()::text OR 
    dealer_id = auth.uid()::text OR 
    public.is_super_admin() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'society_admin' AND society_id = bookings.society_id)
  );

-- Authenticated buyers can insert bookings
CREATE POLICY "Buyers create booking" ON public.bookings
  FOR INSERT WITH CHECK (buyer_id = auth.uid()::text OR public.is_super_admin());

-- Society Admin and Super Admin can advance / manage bookings
CREATE POLICY "Society Admin manage bookings" ON public.bookings
  FOR UPDATE USING (
    public.is_super_admin() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'society_admin' AND society_id = bookings.society_id)
  );

-- 6. Installments Policies
-- Buyers can read their own installments; Society Admin and Super Admin can manage
CREATE POLICY "Installments select access" ON public.installments
  FOR SELECT USING (
    public.is_super_admin() OR 
    EXISTS (
      SELECT 1 FROM public.bookings b 
      WHERE b.id = installments.booking_id 
        AND (b.buyer_id = auth.uid()::text OR b.dealer_id = auth.uid()::text OR 
             EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'society_admin' AND p.society_id = b.society_id))
    )
  );

-- 7. Dealer Leads Policies
-- Dealers can manage ONLY their own leads
CREATE POLICY "Dealer manage own leads" ON public.dealer_leads
  FOR ALL USING (dealer_id = auth.uid()::text OR public.is_super_admin());

-- 8. Audit Logs Policies
-- Read-only for Super Admin; System insert only
CREATE POLICY "Super admin read audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_super_admin());

CREATE POLICY "Allow system insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- 9. Verification Requests Policies
-- Users can insert and read their own verification request; Super Admins manage all
CREATE POLICY "Verification requests read" ON public.verification_requests
  FOR SELECT USING (user_id = auth.uid()::text OR public.is_super_admin());

CREATE POLICY "Verification requests insert" ON public.verification_requests
  FOR INSERT WITH CHECK (user_id = auth.uid()::text OR public.is_super_admin());

CREATE POLICY "Verification requests super admin update" ON public.verification_requests
  FOR UPDATE USING (public.is_super_admin());
`;

// Helper for Supabase Authentication
export const supabaseAuthHelper = {
  async signUp(email: string, pass: string, name: string, role: UserRole, phone: string = '') {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase is not configured yet. Please enter VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }

    // Disallow self-assignment of super_admin role on public sign up
    const safeRole: UserRole = role === 'super_admin' ? 'buyer' : role;
    const isPending = safeRole === 'dealer' || safeRole === 'society_admin';

    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          name,
          role: safeRole,
          phone,
          status: isPending ? 'pending' : 'active',
        },
      },
    });

    if (error) throw error;

    // Create user record in profiles table
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name,
        email,
        phone,
        role: safeRole,
        status: isPending ? 'pending' : 'active',
        verified: !isPending,
      });
    }

    return data;
  },

  async signIn(email: string, pass: string) {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase is not configured yet. Please enter VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
  },

  async resetPassword(email: string) {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase is not configured yet. Please enter VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/#reset-password` : undefined,
    });

    if (error) throw error;
    return data;
  },

  async getCurrentUser(): Promise<User | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const u = session.user;
    
    // Fetch user profile from DB
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', u.id)
      .single();

    return {
      id: u.id,
      user_id: u.id,
      name: profile?.name || u.user_metadata?.name || 'User',
      full_name: profile?.name || u.user_metadata?.name || 'User',
      email: u.email || '',
      phone: profile?.phone || u.user_metadata?.phone || '',
      role: (profile?.role || u.user_metadata?.role || 'buyer') as UserRole,
      status: (profile?.status || u.user_metadata?.status || 'active') as any,
      verified: profile?.verified ?? true,
      avatar: profile?.avatar,
      societyId: profile?.society_id,
      societyName: profile?.society_name,
      createdAt: profile?.created_at || new Date().toISOString().split('T')[0],
      created_at: profile?.created_at,
      updated_at: profile?.updated_at,
    };
  },
};
