import { Response } from 'express';
import { validationResult, body } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';
import { SupplyModel } from '../models/supply.model';
import { FarmerModel } from '../models/farmer.model';

export class SupplyController {
  static initiateSaleValidators = [
    body('farmerId').isInt().withMessage('Valid Farmer ID is required'),
    body('supplyYear').notEmpty().withMessage('Supply year is required'),
    body('season').notEmpty().withMessage('Season is required'),
    body('fertType').isIn(['Urea', 'DAP']).withMessage('Invalid fertilizer type. Only Urea and DAP are allowed.'),
    body('quantity').isFloat({ min: 0.1 }).withMessage('Quantity must be positive'),
  ];

  static async initiateSale(req: AuthRequest, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { farmerId, supplyYear, season, fertType, quantity } = req.body;

    try {
      const farmer = await FarmerModel.findById(farmerId);
      if (!farmer) {
        return res.status(404).json({ message: 'Farmer not found' });
      }

      const sale = await SupplyModel.initiateSale({
        farmer_id: farmerId,
        supply_year: supplyYear,
        season,
        fert_type: fertType,
        amount_supplied_qt: quantity,
        registered_by: req.user!.userId
      });
      
      res.status(201).json(sale);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async getSales(req: AuthRequest, res: Response) {
    const { farmerId, page, limit } = req.query;
    try {
      const filters = {
        farmer_id: farmerId ? parseInt(farmerId as string) : undefined,
        page: parseInt(page as string || '1'),
        limit: parseInt(limit as string || '10')
      };
      const result = await SupplyModel.getSales(filters);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async approveSale(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    try {
      const success = await SupplyModel.updateApproval(parseInt(id as string), status, req.user!.userId);
      if (success) {
        res.json({ message: `Sale ${status.toLowerCase()} successfully` });
      } else {
        res.status(404).json({ message: 'Sale not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
