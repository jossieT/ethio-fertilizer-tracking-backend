import pool from '../config/database';
import { User } from '../types/user.types';

export class UserModel {
  static async findByPhone(phone: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE phone = $1';
    const { rows } = await pool.query(query, [phone]);
    return rows.length ? rows[0] : null;
  }

  static async findById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE user_id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows.length ? rows[0] : null;
  }

  static async getKebeleInfo(kebeleId: number) {
    const query = `
      SELECT k.kebele_name, w.woreda_name, z.zone_name, r.region_name_e as region_name
      FROM kebeles k
      JOIN woredas w ON k.woreda_id = w.woreda_id
      JOIN zones z ON w.zone_id = z.zone_id
      JOIN regions r ON z.region_id = r.region_id
      WHERE k.kebele_id = $1
    `;
    const { rows } = await pool.query(query, [kebeleId]);
    return rows.length ? rows[0] : null;
  }
}
