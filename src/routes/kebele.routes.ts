import { Router } from 'express';
import { KebeleController } from '../controllers/kebele.controller';
import { authMiddleware, roleGuard } from '../middleware/auth.middleware';

const router = Router();

router.get(
  '/dashboard',
  authMiddleware,
  roleGuard(['Kebele']),
  KebeleController.getDashboard
);

export default router;
