export interface Sale {
  sale_id: number;
  farmer_id: number;
  supply_year: string;
  season: string;
  fert_type: 'Urea' | 'DAP';
  amount_supplied_qt: number;
  date_of_supply: Date;
  registered_by: string | null;
  approval_status: 'Pending' | 'Approved' | 'Rejected';
  approved_by: string | null;
  approved_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface SaleWithDetails extends Sale {
  farmer_name: string;
  farmer_unique_id: string;
  kebele: string;
  woreda: string;
}
