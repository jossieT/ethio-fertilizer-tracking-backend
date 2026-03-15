import { Response } from 'express';
import { validationResult, body } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';
import { SupplyModel } from '../models/supply.model';

export class SupplyController {
  static initiateSaleValidators = [
    body('farmerId').isInt().withMessage('Valid Farmer ID is required'),
    body('product').notEmpty().withMessage('Product name is required'),
    body('quantity').isFloat({ min: 0.1 }).withMessage('Quantity must be positive'),
  ];

  static async initiateSale(req: AuthRequest, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { farmerId, product, quantity } = req.body;
    const kebeleId = req.user!.kebeleId;

    if (!kebeleId) {
      return res.status(403).json({ message: 'User must be assigned to a Kebele to initiate sales' });
    }

    try {
      const sale = await SupplyModel.initiateSale({ farmerId, kebeleId, product, quantity });
      res.status(201).json(sale);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async deliverSale(req: AuthRequest, res: Response) {
    const { id } = req.params;
    try {
      const sale = await SupplyModel.deliverSale(parseInt(id as string));
      if (!sale) {
        return res.status(404).json({ message: 'Sale not found or already processed' });
      }
      res.json(sale);
    } catch (error: any) {
      if (error.message === 'Insufficient stock or inventory not found') {
        return res.status(400).json({ message: error.message });
      }
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async getInventory(req: AuthRequest, res: Response) {
    const { id } = req.params; // Using id as kebeleId per Postman collection path /api/supply/inventory/1
    try {
      const inventory = await SupplyModel.getInventory(parseInt(id as string));
      if (!inventory) {
        return res.status(404).json({ message: 'Inventory not found for this location' });
      }
      res.json(inventory);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
