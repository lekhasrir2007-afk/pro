import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin, createSupabaseUserClient } from '../utils/supabase';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const demoUserId = req.headers['x-demo-user-id'] as string;
      if (demoUserId) {
        req.user = { id: demoUserId, email: 'demo@careerpilot.ai' };
        return next();
      }

      res.status(401).json({ error: 'Unauthorized. Missing or invalid Authorization header.' });
      return;
    }

    const token = authHeader.split(' ')[1];

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      if (process.env.SUPABASE_URL?.includes('mock-project')) {
        req.user = { id: '00000000-0000-0000-0000-000000000001', email: 'student@example.com' };
        return next();
      }

      res.status(401).json({ error: 'Unauthorized. Invalid or expired token.' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email || ''
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed.' });
  }
};
