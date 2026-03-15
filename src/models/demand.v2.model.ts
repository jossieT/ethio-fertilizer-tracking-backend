import pool from '../config/database';

export interface DemandV2 {
  demand_id: number;
  crop: string;
  quantity: number;
  kebele_id: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  is_locked: boolean;
  created_at: Date;
  updated_at: Date;
}

export class DemandModelV2 {
  static async submit(crop: string, quantity: number, kebeleId: number): Promise<DemandV2> {
    const query = `
      INSERT INTO demands (crop, quantity, kebele_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [crop, quantity, kebeleId]);
    return rows[0];
  }

  static async adjust(id: number, quantity: number): Promise<DemandV2 | null> {
    const query = `
      UPDATE demands 
      SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE demand_id = $2 AND is_locked = FALSE
      RETURNING *
    `;
    const { rows } = await pool.query(query, [quantity, id]);
    return rows.length ? rows[0] : null;
  }

  static async lockAll(kebeleId?: number): Promise<boolean> {
    let query = 'UPDATE demands SET is_locked = TRUE WHERE is_locked = FALSE';
    const params = [];
    if (kebeleId) {
      query += ' AND kebele_id = $1';
      params.push(kebeleId);
    }
    const result = await pool.query(query, params);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  static async getDashboardData() {
    // Aggregate by crop across all kebeles
    const cropSummaryQuery = `
      SELECT crop, SUM(quantity) as total_quantity, 
             COUNT(*) as request_count,
             COUNT(CASE WHEN status = 'Approved' THEN 1 END) as approved_count
      FROM demands
      GROUP BY crop
    `;
    
    // Status breakdown
    const statusQuery = `
      SELECT status, COUNT(*) as count
      FROM demands
      GROUP BY status
    `;

    const [crops, statuses] = await Promise.all([
      pool.query(cropSummaryQuery),
      pool.query(statusQuery)
    ]);

    return {
      crops: crops.rows,
      statuses: statuses.rows
    };
  }
}
