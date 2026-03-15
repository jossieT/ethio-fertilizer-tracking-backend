import pool from '../config/database';

export interface Inventory {
  inventory_id: number;
  kebele_id: number;
  product_name: string;
  stock_quantity: number;
  unit: string;
}

export interface Sale {
  sale_id: number;
  farmer_id: number;
  kebele_id: number;
  product_name: string;
  quantity: number;
  status: 'Initiated' | 'Delivered' | 'Cancelled';
  sale_date: Date;
  delivery_date?: Date;
}

export class SupplyModel {
  static async getInventory(kebeleId: number): Promise<Inventory | null> {
    const query = 'SELECT * FROM inventory WHERE kebele_id = $1';
    const { rows } = await pool.query(query, [kebeleId]);
    return rows.length ? rows[0] : null;
  }

  static async initiateSale(data: { farmerId: number, kebeleId: number, product: string, quantity: number }): Promise<Sale> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const saleQuery = `
        INSERT INTO sales (farmer_id, kebele_id, product_name, quantity, status)
        VALUES ($1, $2, $3, $4, 'Initiated')
        RETURNING *
      `;
      const { rows } = await client.query(saleQuery, [data.farmerId, data.kebeleId, data.product, data.quantity]);
      const sale = rows[0];

      // Reserve stock (optional, depending on business logic - here we just log the sale)
      
      await client.query('COMMIT');
      return sale;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async deliverSale(saleId: number): Promise<Sale | null> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const getSaleQuery = 'SELECT * FROM sales WHERE sale_id = $1 AND status = \'Initiated\'';
      const { rows: saleRows } = await client.query(getSaleQuery, [saleId]);
      if (saleRows.length === 0) return null;
      const sale = saleRows[0];

      // Update Inventory
      const updateInvQuery = `
        UPDATE inventory 
        SET stock_quantity = stock_quantity - $1, updated_at = CURRENT_TIMESTAMP
        WHERE kebele_id = $2 AND product_name = $3 AND stock_quantity >= $1
        RETURNING *
      `;
      const { rows: invRows } = await client.query(updateInvQuery, [sale.quantity, sale.kebele_id, sale.product_name]);
      if (invRows.length === 0) {
        throw new Error('Insufficient stock or inventory not found');
      }

      // Mark Sale as Delivered
      const updateSaleQuery = `
        UPDATE sales 
        SET status = 'Delivered', delivery_date = CURRENT_TIMESTAMP
        WHERE sale_id = $1
        RETURNING *
      `;
      const { rows: updatedSaleRows } = await client.query(updateSaleQuery, [saleId]);
      
      await client.query('COMMIT');
      return updatedSaleRows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
