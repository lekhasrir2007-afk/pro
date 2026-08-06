import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../config/db';
import fs from 'fs';

export const uploadFile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded or file type rejected.' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    let fileRecord = null;
    try {
      fileRecord = await prisma.uploadedFile.create({
        data: {
          originalName: req.file.originalname,
          filename: req.file.filename,
          mimeType: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
          userId,
        },
      });
    } catch (dbErr) {
      console.warn('⚠️ Could not record file in database:', dbErr);
    }

    return res.status(201).json({
      message: 'File uploaded successfully',
      file: fileRecord || {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserFiles = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const files = await prisma.uploadedFile.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ files });
  } catch (error) {
    next(error);
  }
};

export const deleteFile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const file = await prisma.uploadedFile.findFirst({
      where: { id, userId },
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found or permission denied' });
    }

    // Delete physically from disk if exists
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    await prisma.uploadedFile.delete({
      where: { id },
    });

    return res.json({ message: 'File deleted successfully' });
  } catch (error) {
    next(error);
  }
};
