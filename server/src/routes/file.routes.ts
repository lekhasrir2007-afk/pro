import { Router } from 'express';
import { uploadFile, getUserFiles, deleteFile } from '../controllers/file.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';

const router = Router();

router.use(authenticateJwt);

router.post('/upload', uploadMiddleware.single('file'), uploadFile);
router.get('/', getUserFiles);
router.delete('/:id', deleteFile);

export default router;
