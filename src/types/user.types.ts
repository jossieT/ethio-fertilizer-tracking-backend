export type UserRole = 'Federal' | 'Region' | 'Zone' | 'Woreda' | 'Kebele' | 'KEBELE_DA' | 'WOREDA_ADMIN' | 'ZONE_ADMIN' | 'REGION_ADMIN' | 'FEDERAL_ADMIN';

export interface User {
  user_id: string;
  full_name: string;
  username?: string;
  email?: string;
  phone: string;
  password_hash: string;
  role: UserRole;
  region_id?: number;
  zone_id?: number;
  woreda_id?: number;
  kebele_id?: number;
  created_at: Date;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password_hash'>;
}
