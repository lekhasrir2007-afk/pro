import { Router } from 'express';
import { register, login, getCurrentUser } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validate.middleware';
import { registerSchema, loginSchema } from '../validation/auth.validation';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.get('/me', authenticateJwt, getCurrentUser);

export default router;
