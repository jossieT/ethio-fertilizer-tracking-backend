export type UserRole = 'Federal' | 'Region' | 'Zone' | 'Woreda' | 'Kebele';

export interface User {
  user_id: number;
  full_name: string;
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
