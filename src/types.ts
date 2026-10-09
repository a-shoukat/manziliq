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
