export interface Farmer {
  farmer_id: number;
  unique_farmer_id: string;
  full_name: string;
  gender: 'Male' | 'Female' | 'Other';
  phone_number: string | null;
  address: string | null;
  farm_area_hectares: number | null;
  photo_url: string | null;
  land_certificate_url: string | null;
  kebele_id: number | null;
  registered_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface FarmerWithLocation extends Farmer {
  kebele_name: string;
  woreda_name: string;
  zone_name: string;
  region_name: string;
}
