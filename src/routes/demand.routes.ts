import { Router } from 'express';
import { body } from 'express-validator';
import { DemandController } from '../controllers/demand.controller';
import { authMiddleware, roleGuard } from '../middleware/auth.middleware';

const router = Router();

// Validation for creation
const createDemandValidators = [
  body('farmer_id').isInt().withMessage('Farmer ID must be an integer'),
  body('demand_year').notEmpty().withMessage('Demand year is required (e.g., 2017/18)'),
  body('fert_type_id').isInt().withMessage('Fertilizer type ID is required'),
  body('amount_needed_qt').isFloat({ min: 0.1 }).withMessage('Amount needed must be a positive number'),
];

// Routes

// 1. List demands (Protected, hierarchies handled in controller/model)
router.get('/', authMiddleware, DemandController.getDemands);

// 2. Create demand (Restricted to Kebele/Woreda staff)
router.post(
  '/', 
  authMiddleware, 
  roleGuard(['Kebele', 'Woreda']), 
  createDemandValidators, 
  DemandController.createDemand
);

// 3. Update status (Restricted to overseers - Woreda, Zone, Region, Federal)
router.patch(
  '/:id/status',
  authMiddleware,
  roleGuard(['Woreda', 'Zone', 'Region', 'Federal']),
  DemandController.updateStatus
);

export default router;
