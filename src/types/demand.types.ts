export interface FarmerDemand {
  demand_id: number;
  farmer_id: number;
  demand_year: string;
  season_irrigation: boolean;
  season_meher: boolean;
  season_belg: boolean;
  fert_type_id: number;
  amount_needed_qt: number;
  request_date: Date;
  registered_by: string | null;
  approval_status: 'Pending' | 'Approved' | 'Rejected';
  approved_by: string | null;
  approved_date: Date | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface FarmerDemandWithDetails {
  demand_id: number;
  request_id: string;          
  farmer_name: string;
  sex: string;
  kebele: string;              
  woreda: string;              
  zone: string;                
  fertilizer_type: string;     
  amount: string;              
  status: string;              
}

export interface FeatureSummary {
  fType: string;
  demand_collected: number;
  demand_intelligence: number;
  demand_approved: number;
  final_allocated: number;
}

export interface FertilizerDemandSummary {
  fType: string;
  demand_collected: number;
  demand_intelligence: number;
  demand_approved: number;
  final_allocated: number;
}
