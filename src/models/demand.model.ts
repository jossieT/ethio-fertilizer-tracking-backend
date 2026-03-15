import pool from '../config/database';
import { FarmerDemand, FarmerDemandWithDetails } from '../types/demand.types';

export class DemandModel {
  static async create(data: Partial<FarmerDemand>): Promise<FarmerDemand> {
    const query = `
      INSERT INTO demands 
      (farmer_id, demand_year, season_irrigation, season_meher, season_belg, 
       fert_type, amount_needed_qt, crop_cereal, crop_pulse, crop_oils, 
       crop_horti, crop_rootcrop, registered_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [
      data.farmer_id,
      data.demand_year,
      data.season_irrigation || false,
      data.season_meher || false,
      data.season_belg || false,
      data.fert_type,
      data.amount_needed_qt,
      data.crop_cereal,
      data.crop_pulse,
      data.crop_oils,
      data.crop_horti,
      data.crop_rootcrop,
      data.registered_by
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
      conditions.push(`(f.full_name ILIKE $${paramIndex} OR f.unique_farmer_id ILIKE $${paramIndex})`);
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
      UPDATE demands 
      SET approval_status = $1, approved_by = $2, approved_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE demand_id = $3
    `;
    const result = await pool.query(query, [status, approvedBy, id]);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  private static baseSelectQuery = `
    SELECT 
      d.demand_id,
      f.farmer_id,
      f.full_name as farmer_name,
      f.unique_farmer_id,
      f.gender as sex,
      k.kebele_name as kebele,
      w.woreda_name as woreda,
      z.zone_name as zone,
      d.fert_type as fertilizer_type,
      d.amount_needed_qt as amount,
      d.approval_status as status,
      d.crop_cereal,
      d.crop_pulse,
      d.crop_oils,
      d.crop_horti,
      d.crop_rootcrop,
      d.request_date
    FROM demands d
    JOIN farmers f ON d.farmer_id = f.farmer_id
    JOIN kebeles k ON f.kebele_id = k.kebele_id
    JOIN woredas w ON k.woreda_id = w.woreda_id
    JOIN zones z ON w.zone_id = z.zone_id
  `;

  private static mapToDetails(row: any): FarmerDemandWithDetails {
    return {
      demand_id: row.demand_id,
      request_id: `REQ-${row.demand_id.toString().padStart(4, '0')}`,
      farmer_id: row.farmer_id,
      farmer_name: row.farmer_name,
      farmer_unique_id: row.unique_farmer_id,
      sex: row.sex,
      kebele: row.kebele,
      woreda: row.woreda,
      zone: row.zone,
      fertilizer_type: row.fertilizer_type,
      amount: `${row.amount} Qt`,
      status: row.status,
      crop_details: {
        cereal: row.crop_cereal,
        pulse: row.crop_pulse,
        oils: row.crop_oils,
        horti: row.crop_horti,
        rootcrop: row.crop_rootcrop
      },
      request_date: row.request_date
    };
  }
}
