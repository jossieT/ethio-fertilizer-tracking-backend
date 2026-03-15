import pool from '../config/database';
import { Sale, SaleWithDetails } from '../types/supply.types';

export class SupplyModel {
  static async initiateSale(data: Partial<Sale>): Promise<Sale> {
    const query = `
      INSERT INTO sales 
      (farmer_id, supply_year, season, fert_type, amount_supplied_qt, registered_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [
      data.farmer_id,
      data.supply_year,
      data.season,
      data.fert_type,
      data.amount_supplied_qt,
      data.registered_by
    ]);
    return rows[0];
  }

  static async getSales(filters: any): Promise<{ data: SaleWithDetails[], total: number }> {
    const { farmer_id, page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    let query = `
      SELECT s.*, f.full_name as farmer_name, f.unique_farmer_id, 
             k.kebele_name as kebele, w.woreda_name as woreda
      FROM sales s
      JOIN farmers f ON s.farmer_id = f.farmer_id
      JOIN kebeles k ON f.kebele_id = k.kebele_id
      JOIN woredas w ON k.woreda_id = w.woreda_id
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (farmer_id) {
      query += ` WHERE s.farmer_id = $${paramIndex}`;
      params.push(farmer_id);
      paramIndex++;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM (${query}) as count_query`;
    const { rows: countRows } = await pool.query(countQuery, params);
    const total = parseInt(countRows[0].count);

    // Pagination
    query += ` ORDER BY s.date_of_supply DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);
    return { data: rows, total };
  }

  static async updateApproval(id: number, status: string, approvedBy: string): Promise<boolean> {
    const query = `
      UPDATE sales 
      SET approval_status = $1, approved_by = $2, approved_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE sale_id = $3
    `;
    const result = await pool.query(query, [status, approvedBy, id]);
    return result.rowCount ? result.rowCount > 0 : false;
  }
}
