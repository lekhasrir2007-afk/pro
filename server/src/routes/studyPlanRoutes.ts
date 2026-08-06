import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { generateStudyPlan, getStudyPlans, getStudyPlanById } from '../controllers/studyPlanController';

const router = Router();

router.use(authenticateUser);

router.post('/', generateStudyPlan);
router.get('/', getStudyPlans);
router.get('/:id', getStudyPlanById);

export default router;
