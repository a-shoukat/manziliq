export type UserRole = 'buyer' | 'dealer' | 'society_admin' | 'super_admin';

export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'blacklisted';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  verification_status: VerificationStatus;
  created_at: string;
}

export interface SocietyDetails {
  profile_id: string;
  society_name: string;
  address: string;
  developer_info: string | null;
  noc_doc_url: string | null;
  secp_doc_url: string | null;
}

export interface DealerDetails {
  profile_id: string;
  cnic_doc_url: string | null;
  license_no: string;
  firm_name: string;
  experience_years: number;
  photo_url: string | null;
}

export interface CustomerDetails {
  profile_id: string;
  cnic_number: string | null;
  contact_phone: string | null;
  address: string | null;
  photo_url: string | null;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  buyer: 'Buyer',
  dealer: 'Dealer',
  society_admin: 'Society Admin',
  super_admin: 'Super Admin',
};

export type PropertyCategory = 'residential' | 'commercial';
export type PropertyPurpose = 'sale' | 'rent';
export type PropertyStatus = 'available' | 'reserved' | 'sold';

export interface Property {
  id: string;
  title: string;
  city: string;
  area: string | null;
  society_name: string | null;
  block: string | null;
  plot_size_marla: number;
  category: PropertyCategory;
  purpose: PropertyPurpose;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  description: string | null;
  image_url: string | null;
  status: PropertyStatus;
  owner_id: string | null;
  created_at: string;
}

export type PlotStatus = 'available' | 'assigned' | 'reserved' | 'sold' | 'blocked';

export interface Plot {
  id: string;
  society_id: string;
  block: string;
  plot_no: string;
  size_marla: number;
  category: PropertyCategory;
  base_price: number;
  status: PlotStatus;
  lot_id: string | null;
  created_at: string;
}

export type LotStatus = 'active' | 'revoked' | 'expired' | 'released';

export interface Lot {
  id: string;
  society_id: string;
  dealer_id: string | null;
  name: string;
  block: string | null;
  commission_pct: number;
  expires_at: string | null;
  status: LotStatus;
  created_at: string;
  dealer_email?: string;
  plot_count?: number;
}

export interface DealerRequest {
  id: string;
  dealer_id: string;
  society_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  dealer_email?: string;
  firm_name?: string | null;
  license_no?: string | null;
}
