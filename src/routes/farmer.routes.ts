import { Router } from 'express';
import { body } from 'express-validator';
import { FarmerController } from '../controllers/farmer.controller';
import { authMiddleware, roleGuard } from '../middleware/auth.middleware';

const router = Router();

const farmerValidators = [
  body('unique_farmer_id').notEmpty().withMessage('Unique Farmer ID is required'),
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
  body('kebele_id').isInt().withMessage('Kebele ID must be an integer'),
  body('farm_area_hectares').optional().isFloat({ min: 0 }).withMessage('Farm area must be a positive number'),
];

// Routes
router.get('/', authMiddleware, FarmerController.getFarmers);
router.get('/:id', authMiddleware, FarmerController.getFarmerById);
router.post('/', authMiddleware, roleGuard(['Kebele', 'Woreda', 'Zone', 'Region', 'Federal']), farmerValidators, FarmerController.createFarmer);
router.put('/:id', authMiddleware, roleGuard(['Kebele', 'Woreda', 'Zone', 'Region', 'Federal']), farmerValidators, FarmerController.updateFarmer);
router.delete('/:id', authMiddleware, roleGuard(['Kebele', 'Woreda', 'Zone', 'Region', 'Federal']), FarmerController.deleteFarmer);

export default router;
