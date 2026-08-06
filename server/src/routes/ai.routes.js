import { Router } from 'express';
import { analyzeContent } from '../controllers/ai.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { uploadMiddleware } from '../middleware/upload.middleware.js';

const router = Router();

// Protected route for AI analysis (requires JWT & processes optional file upload)
router.post('/analyze', authMiddleware, uploadMiddleware.single('file'), analyzeContent);

export default router;
