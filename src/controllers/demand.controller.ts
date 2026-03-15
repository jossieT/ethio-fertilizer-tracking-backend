import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';
import { DemandModel } from '../models/demand.model';
import { FarmerModel } from '../models/farmer.model';

export class DemandController {
  static async createDemand(req: AuthRequest, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      farmer_id, demand_year, season_irrigation, season_meher, 
      season_belg, fert_type, amount_needed_qt, 
      crop_cereal, crop_pulse, crop_oils, crop_horti, crop_rootcrop
    } = req.body;

    try {
      // Check if farmer exists
      const farmer = await FarmerModel.findById(farmer_id);
      if (!farmer) {
        return res.status(404).json({ message: 'Farmer not found' });
      }

      // Authorization: Kebele staff can only register for their kebele
      if (req.user?.role === 'Kebele' && farmer.kebele_id !== req.user.kebeleId) {
        return res.status(403).json({ message: 'You can only register demand for farmers in your kebele' });
      }

      // Restrict to Urea and DAP
      if (!['Urea', 'DAP'].includes(fert_type)) {
        return res.status(400).json({ message: 'Invalid fertilizer type. Only Urea and DAP are allowed.' });
      }

      const demand = await DemandModel.create({
        farmer_id,
        demand_year,
        season_irrigation,
        season_meher,
        season_belg,
        fert_type,
        amount_needed_qt,
        crop_cereal,
        crop_pulse,
        crop_oils,
        crop_horti,
        crop_rootcrop,
        registered_by: req.user!.userId
      });

      res.status(201).json(demand);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async getDemands(req: AuthRequest, res: Response) {
    const { search, status, page, limit } = req.query;

    try {
      const filters = {
        search: search as string,
        status: status as string,
        page: parseInt(req.query.page as string || '1'),
        limit: parseInt(req.query.limit as string || '10'),
        userRole: req.user?.role,
        locationIds: {
          kebeleId: req.user?.kebeleId,
        }
      };

      const result = await DemandModel.getDemands(filters);
      
      res.json({
        data: result.data,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: result.total,
          pages: Math.ceil(result.total / filters.limit)
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async updateStatus(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be Approved or Rejected' });
    }

    try {
      const demand = await DemandModel.getById(parseInt(id as string));
      if (!demand) {
        return res.status(404).json({ message: 'Demand request not found' });
      }

      const success = await DemandModel.updateStatus(parseInt(id as string), status, req.user!.userId);
      if (success) {
        res.json({ message: `Demand request ${status.toLowerCase()} successfully` });
      } else {
        res.status(400).json({ message: 'Failed to update demand status' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
