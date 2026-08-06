import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { getDashboardStats } from '../controllers/dashboardController';

const router = Router();

router.use(authenticateUser);
router.get('/', getDashboardStats);

export default router;
