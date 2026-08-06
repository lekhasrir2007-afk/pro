import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { generateAiContent, analyzeDocumentContext } from '../services/gemini.service';
import { prisma } from '../config/db';

export const generateText = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { prompt, context } = req.body;
    const userId = req.user?.id;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt string is required' });
    }

    const aiResult = await generateAiContent(prompt, context);

    // Save prompt & response to database if user is authenticated and DB is available
    if (userId) {
      try {
        await prisma.aiQuery.create({
          data: {
            prompt,
            response: aiResult,
            userId,
            model: 'gemini-2.5-flash',
          },
        });
      } catch (dbErr) {
        console.warn('⚠️ Could not save AI Query to database:', dbErr);
      }
    }

    return res.json({
      prompt,
      response: aiResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const analyzeDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { documentText, instruction } = req.body;

    if (!documentText || typeof documentText !== 'string') {
      return res.status(400).json({ error: 'documentText is required' });
    }

    const analysis = await analyzeDocumentContext(documentText, instruction);

    if (req.user?.id) {
      try {
        await prisma.aiQuery.create({
          data: {
            prompt: instruction || 'Document Analysis',
            response: analysis,
            userId: req.user.id,
            model: 'gemini-2.5-flash',
          },
        });
      } catch (dbErr) {
        console.warn('⚠️ Could not save AI document query to database:', dbErr);
      }
    }

    return res.json({
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const getAiHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const history = await prisma.aiQuery.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return res.json({ history });
  } catch (error) {
    next(error);
  }
};
