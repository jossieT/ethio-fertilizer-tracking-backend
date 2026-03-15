import { Router } from 'express';
import { SupplyController } from '../controllers/supply.controller';
import { authMiddleware, roleGuard } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/sales/initiate', SupplyController.initiateSaleValidators, SupplyController.initiateSale);
router.get('/sales', SupplyController.getSales);
router.put('/sales/:id/approve', roleGuard(['Woreda', 'Zone', 'Region', 'Federal']), SupplyController.approveSale);

export default router;
