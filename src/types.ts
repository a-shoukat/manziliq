export type UserRole = 'buyer' | 'dealer' | 'society_admin' | 'super_admin';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  buyer: 'Buyer',
  dealer: 'Dealer',
  society_admin: 'Society Admin',
  super_admin: 'Super Admin',
};
