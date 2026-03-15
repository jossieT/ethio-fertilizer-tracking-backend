import pool from '../config/database';
import { FarmerDemand, FarmerDemandWithDetails } from '../types/demand.types';

export class DemandModel {
  static async create(data: Partial<FarmerDemand>): Promise<FarmerDemand> {
    const query = `
      INSERT INTO farmer_demand 
      (farmer_id, demand_year, season_irrigation, season_meher, season_belg, fert_type_id, amount_needed_qt, registered_by, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [
      data.farmer_id,
      data.demand_year,
      data.season_irrigation || false,
      data.season_meher || false,
      data.season_belg || false,
      data.fert_type_id,
      data.amount_needed_qt,
      data.registered_by,
      data.notes
    ]);
    return rows[0];
  }

  static async getById(id: number): Promise<FarmerDemandWithDetails | null> {
    const query = `
      ${this.baseSelectQuery}
      WHERE d.demand_id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows.length ? this.mapToDetails(rows[0]) : null;
  }

  static async getDemands(filters: any): Promise<{ data: FarmerDemandWithDetails[], total: number }> {
    const { search, status, page = 1, limit = 10, userRole, locationIds } = filters;
    const offset = (page - 1) * limit;

    let query = this.baseSelectQuery;
    const params: any[] = [];
    let paramIndex = 1;

    const conditions: string[] = [];

    if (search) {
      conditions.push(`(f.full_name ILIKE $${paramIndex} OR f.farmer_unique_id ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      conditions.push(`d.approval_status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    // Role-based filtering
    if (userRole === 'Kebele' && locationIds.kebeleId) {
      conditions.push(`f.kebele_id = $${paramIndex}`);
      params.push(locationIds.kebeleId);
      paramIndex++;
    } else if (userRole === 'Woreda' && locationIds.woredaId) {
      conditions.push(`k.woreda_id = $${paramIndex}`);
      params.push(locationIds.woredaId);
      paramIndex++;
    } else if (userRole === 'Zone' && locationIds.zoneId) {
      conditions.push(`w.zone_id = $${paramIndex}`);
      params.push(locationIds.zoneId);
      paramIndex++;
    } else if (userRole === 'Region' && locationIds.regionId) {
      conditions.push(`z.region_id = $${paramIndex}`);
      params.push(locationIds.regionId);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM (${query}) as count_query`;
    const { rows: countRows } = await pool.query(countQuery, params);
    const total = parseInt(countRows[0].count);

    // Apply pagination
    query += ` ORDER BY d.request_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);
    return {
      data: rows.map(row => this.mapToDetails(row)),
      total
    };
  }

  static async updateStatus(id: number, status: string, approvedBy: string): Promise<boolean> {
    const query = `
      UPDATE farmer_demand 
      SET approval_status = $1, approved_by = $2, approved_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE demand_id = $3
    `;
    const result = await pool.query(query, [status, approvedBy, id]);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  private static baseSelectQuery = `
    SELECT 
      d.demand_id,
      f.full_name as farmer_name,
      f.sex,
      k.kebele_name as kebele,
      w.woreda_name as woreda,
      z.zone_name as zone,
      ft.fert_name as fertilizer_type,
      d.amount_needed_qt as amount,
      d.approval_status as status
    FROM farmer_demand d
    JOIN farmers f ON d.farmer_id = f.farmer_id
    JOIN kebeles k ON f.kebele_id = k.kebele_id
    JOIN woredas w ON k.woreda_id = w.woreda_id
    JOIN zones z ON w.zone_id = z.zone_id
    JOIN fertilizer_types ft ON d.fert_type_id = ft.fert_type_id
  `;

  private static mapToDetails(row: any): FarmerDemandWithDetails {
    return {
      demand_id: row.demand_id,
      request_id: `REQ-${row.demand_id.toString().padStart(4, '0')}`,
      farmer_name: row.farmer_name,
      sex: row.sex,
      kebele: row.kebele,
      woreda: row.woreda,
      zone: row.zone,
      fertilizer_type: row.fertilizer_type,
      amount: `${row.amount} Qt`,
      status: row.status
    };
  }
}
