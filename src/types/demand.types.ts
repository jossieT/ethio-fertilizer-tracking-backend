export interface FertilizerDemandSummary {
  fType: string;
  demand_collected: number;
  demand_intelligence: number;
  demand_approved: number;
  final_allocated: number;
}

export interface KebeleDashboardData {
  user: {
    fullName: string;
    role: string;
    kebeleName: string;
  };
  demandTable: FertilizerDemandSummary[];
}
