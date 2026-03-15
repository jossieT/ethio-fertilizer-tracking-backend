import pool from '../config/database';
import { Farmer, FarmerWithLocation } from '../types/farmer.types';

export class FarmerModel {
  static async createFarmer(data: Partial<Farmer>): Promise<Farmer> {
    const query = `
      INSERT INTO farmers (
        unique_farmer_id, full_name, gender, phone_number, address, 
        farm_area_hectares, photo_url, land_certificate_url, kebele_id, registered_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [
      data.unique_farmer_id,
      data.full_name,
      data.gender,
      data.phone_number,
      data.address,
      data.farm_area_hectares,
      data.photo_url,
      data.land_certificate_url,
      data.kebele_id,
      data.registered_by
    ]);
    return rows[0];
  }

  static async getFarmerById(id: number): Promise<FarmerWithLocation | null> {
    const query = `
      ${this.baseSelectQuery}
      WHERE f.farmer_id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows.length ? rows[0] : null;
  }

  static async findById(id: number): Promise<Farmer | null> {
    const query = 'SELECT * FROM farmers WHERE farmer_id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows.length ? rows[0] : null;
  }

  static async findByUniqueId(uniqueId: string): Promise<Farmer | null> {
    const query = 'SELECT * FROM farmers WHERE unique_farmer_id = $1';
    const { rows } = await pool.query(query, [uniqueId]);
    return rows.length ? rows[0] : null;
  }

  static async getFarmers(filters: any): Promise<{ data: FarmerWithLocation[], total: number }> {
    const { search, kebele_id, woreda_id, zone_id, region_id, page = 1, limit = 10, userRole, locationIds } = filters;
    const offset = (page - 1) * limit;

    let query = this.baseSelectQuery;
    const params: any[] = [];
    let paramIndex = 1;
    const conditions: string[] = [];

    if (search) {
      conditions.push(`(f.full_name ILIKE $${paramIndex} OR f.unique_farmer_id ILIKE $${paramIndex} OR f.phone_number ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Role and Location Filters
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

    // Explicit filters from query params
    if (kebele_id) {
      conditions.push(`f.kebele_id = $${paramIndex}`);
      params.push(kebele_id);
      paramIndex++;
    } else if (woreda_id) {
      conditions.push(`k.woreda_id = $${paramIndex}`);
      params.push(woreda_id);
      paramIndex++;
    } else if (zone_id) {
      conditions.push(`w.zone_id = $${paramIndex}`);
      params.push(zone_id);
      paramIndex++;
    } else if (region_id) {
      conditions.push(`z.region_id = $${paramIndex}`);
      params.push(region_id);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    const countQuery = `SELECT COUNT(*) FROM (${query}) as count_query`;
    const { rows: countRows } = await pool.query(countQuery, params);
    const total = parseInt(countRows[0].count);

    query += ` ORDER BY f.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);
    return { data: rows, total };
  }

  static async updateFarmer(id: number, data: Partial<Farmer>): Promise<Farmer | null> {
    const fields = Object.keys(data).filter(key => data[key as keyof Farmer] !== undefined);
    if (fields.length === 0) return null;

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const query = `
      UPDATE farmers 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
      WHERE farmer_id = $${fields.length + 1} 
      RETURNING *
    `;
    const params = [...fields.map(field => data[field as keyof Farmer]), id];
    const { rows } = await pool.query(query, params);
    return rows.length ? rows[0] : null;
  }

  static async deleteFarmer(id: number): Promise<boolean> {
    const query = 'DELETE FROM farmers WHERE farmer_id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  private static baseSelectQuery = `
    SELECT 
      f.*,
      k.kebele_name,
      w.woreda_name,
      z.zone_name,
      r.region_name_e as region_name
    FROM farmers f
    LEFT JOIN kebeles k ON f.kebele_id = k.kebele_id
    LEFT JOIN woredas w ON k.woreda_id = w.woreda_id
    LEFT JOIN zones z ON w.zone_id = z.zone_id
    LEFT JOIN regions r ON z.region_id = r.region_id
  `;
}
