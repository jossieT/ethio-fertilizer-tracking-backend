import { Router } from 'express';
import { DemandControllerV2 } from '../controllers/demand.v2.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', DemandControllerV2.submitValidators, DemandControllerV2.submitDemand);
router.put('/:id/adjust', DemandControllerV2.adjustDemand);
router.put('/lock', DemandControllerV2.lockDemands);
router.get('/dashboard', DemandControllerV2.getDashboard);

export default router;
