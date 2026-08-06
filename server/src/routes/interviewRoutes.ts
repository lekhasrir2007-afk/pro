import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import {
  startInterview,
  getInterviews,
  getInterviewById,
  generateQuestion,
  submitAnswer,
  completeInterview
} from '../controllers/interviewController';

const router = Router();

router.use(authenticateUser);

router.post('/start', startInterview);
router.get('/', getInterviews);
router.get('/:id', getInterviewById);
router.post('/:id/question', generateQuestion);
router.post('/:id/answer', submitAnswer);
router.post('/:id/complete', completeInterview);

export default router;
