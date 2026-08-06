import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { getProgress } from '../controllers/progressController';

const router = Router();

router.use(authenticateUser);

router.get('/', getProgress);

export default router;
