import { Response } from 'express';
import { validationResult, body } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';
import { DemandModelV2 } from '../models/demand.v2.model';

export class DemandControllerV2 {
  static submitValidators = [
    body('crop').notEmpty().withMessage('Crop type is required'),
    body('quantity').isFloat({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('kebeleId').isInt().withMessage('Valid Kebele ID is required'),
  ];

  static async submitDemand(req: AuthRequest, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { crop, quantity, kebeleId } = req.body;

    try {
      const demand = await DemandModelV2.submit(crop, quantity, kebeleId);
      res.status(201).json(demand);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async adjustDemand(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    try {
      const updated = await DemandModelV2.adjust(parseInt(id as string), quantity);
      if (!updated) {
        return res.status(404).json({ message: 'Demand not found or is locked' });
      }
      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async lockDemands(req: AuthRequest, res: Response) {
    try {
      // Logic could depend on role - Federal locks everything, others lock their own
      const kebeleId = req.user?.role === 'KEBELE_DA' ? req.user.kebeleId : undefined;
      await DemandModelV2.lockAll(kebeleId);
      res.json({ message: 'Demands locked successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async getDashboard(req: AuthRequest, res: Response) {
    try {
      const data = await DemandModelV2.getDashboardData();
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
