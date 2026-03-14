import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

router.post('/login', AuthController.loginValidators, AuthController.login);

export default router;
