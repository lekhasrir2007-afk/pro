import { Router } from 'express';
import { generateText, analyzeDocument, getAiHistory } from '../controllers/ai.controller';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();

// Protect all AI routes with JWT authentication middleware
router.use(authenticateJwt);

router.post('/generate', generateText);
router.post('/analyze-doc', analyzeDocument);
router.get('/history', getAiHistory);

export default router;
