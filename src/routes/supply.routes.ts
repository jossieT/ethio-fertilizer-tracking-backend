import { Router } from 'express';
import { SupplyController } from '../controllers/supply.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/sales/initiate', SupplyController.initiateSaleValidators, SupplyController.initiateSale);
router.put('/sales/:id/deliver', SupplyController.deliverSale);
router.get('/inventory/:id', SupplyController.getInventory);

export default router;
