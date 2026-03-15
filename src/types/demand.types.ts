export interface FarmerDemand {
  demand_id: number;
  farmer_id: number;
  demand_year: string;
  season_irrigation: boolean;
  season_meher: boolean;
  season_belg: boolean;
  
  // Fertilizer focus: Urea and DAP only
  fert_type: 'Urea' | 'DAP';
  amount_needed_qt: number;
  
  // Detailed Crop Categories
  crop_cereal?: string;
  crop_pulse?: string;
  crop_oils?: string;
  crop_horti?: string;
  crop_rootcrop?: string;
  
  request_date: Date;
  registered_by: string | null;
  approval_status: 'Pending' | 'Approved' | 'Rejected';
  approved_by: string | null;
  approved_date: Date | null;
  
  created_at: Date;
  updated_at: Date;
}

export interface FarmerDemandWithDetails {
  demand_id: number;
  request_id: string;          
  farmer_id: number;
  farmer_name: string;
  farmer_unique_id: string;
  sex: string;
  kebele: string;              
  woreda: string;              
  zone: string;                
  fertilizer_type: string;     
  amount: string;              
  status: string;
  crop_details: {
    cereal?: string;
    pulse?: string;
    oils?: string;
    horti?: string;
    rootcrop?: string;
  };
  request_date: Date;
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
