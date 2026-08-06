import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { getProfile, updateProfile } from '../controllers/profileController';

const router = Router();

router.use(authenticateUser);
router.get('/', getProfile);
router.put('/', updateProfile);

export default router;
