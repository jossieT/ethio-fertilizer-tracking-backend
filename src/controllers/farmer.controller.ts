import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';
import { FarmerModel } from '../models/farmer.model';

export class FarmerController {
  static async createFarmer(req: AuthRequest, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const data = {
        ...req.body,
        registered_by: req.user!.userId
      };

      // Check for unique_farmer_id collision
      const existing = await FarmerModel.findByUniqueId(data.unique_farmer_id);
      if (existing) {
        return res.status(400).json({ message: 'Farmer with this Unique ID already exists' });
      }
      
      const farmer = await FarmerModel.createFarmer(data);
      res.status(201).json(farmer);
    } catch (error: any) {
      if (error.code === '23505') { // Postgres unique violation
        return res.status(400).json({ message: 'Unique Farmer ID or Phone number already exists' });
      }
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async getFarmers(req: AuthRequest, res: Response) {
    const { search, kebele_id, woreda_id, zone_id, region_id, page, limit } = req.query;

    try {
      const filters = {
        search: search as string,
        kebele_id: kebele_id ? parseInt(kebele_id as string) : undefined,
        woreda_id: woreda_id ? parseInt(woreda_id as string) : undefined,
        zone_id: zone_id ? parseInt(zone_id as string) : undefined,
        region_id: region_id ? parseInt(region_id as string) : undefined,
        page: parseInt(req.query.page as string || '1'),
        limit: parseInt(req.query.limit as string || '10'),
        userRole: req.user?.role,
        locationIds: {
          kebeleId: req.user?.kebeleId,
        }
      };

      const result = await FarmerModel.getFarmers(filters);
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

  static async getFarmerById(req: AuthRequest, res: Response) {
    const { id } = req.params;
    try {
      const farmer = await FarmerModel.getFarmerById(parseInt(id as string));
      if (!farmer) {
        return res.status(404).json({ message: 'Farmer not found' });
      }
      res.json(farmer);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async updateFarmer(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updated = await FarmerModel.updateFarmer(parseInt(id as string), req.body);
      if (!updated) {
        return res.status(404).json({ message: 'Farmer not found' });
      }
      res.json(updated);
    } catch (error: any) {
      if (error.code === '23505') {
        return res.status(400).json({ message: 'Unique Farmer ID or Phone number already exists' });
      }
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async deleteFarmer(req: AuthRequest, res: Response) {
    const { id } = req.params;
    try {
      const success = await FarmerModel.deleteFarmer(parseInt(id as string));
      if (success) {
        res.json({ message: 'Farmer deleted successfully' });
      } else {
        res.status(404).json({ message: 'Farmer not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
