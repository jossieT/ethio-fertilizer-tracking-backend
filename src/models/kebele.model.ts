import pool from '../config/database';
import { FertilizerDemandSummary } from '../types/demand.types';

export class KebeleModel {
  static async getDemandSummary(kebeleId: number, season: string): Promise<FertilizerDemandSummary[]> {
    const query = `
      SELECT 
        ft.fert_name as "F-Type",
        COALESCE(s.demand_collected, 0) as "Demand Collected (Qt)",
        COALESCE(s.demand_intelligence, 0) as "Demand Intelligence (Qt)",
        COALESCE(s.demand_approved, 0) as "Demand Approved (Qt)",
        COALESCE(s.final_allocated, 0) as "Final Allocated"
      FROM fertilizer_types ft
      LEFT JOIN kebele_fert_demand_summary s ON ft.fert_type_id = s.fert_type_id 
        AND s.kebele_id = $1 AND s.year_season = $2
    `;
    const { rows } = await pool.query(query, [kebeleId, season]);
    
    // Mapping keys to match the required UI format
    return rows.map((row: any) => ({
      fType: row['F-Type'],
      demand_collected: parseFloat(row['Demand Collected (Qt)']),
      demand_intelligence: parseFloat(row['Demand Intelligence (Qt)']),
      demand_approved: parseFloat(row['Demand Approved (Qt)']),
      final_allocated: parseFloat(row['Final Allocated'])
    }));
  }
}
