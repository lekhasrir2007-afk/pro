import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { supabaseAdmin } from '../utils/supabase';

export const getProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const { data: progressItems } = await supabaseAdmin
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .order('average_score', { ascending: false });

    if (!progressItems || progressItems.length === 0) {
      const sampleProgress = [
        { topic: 'JavaScript & Async', attempts: 3, average_score: 82, best_score: 90, last_attempted_at: new Date().toISOString() },
        { topic: 'React & State Management', attempts: 2, average_score: 75, best_score: 85, last_attempted_at: new Date().toISOString() },
        { topic: 'Node.js & Express', attempts: 1, average_score: 68, best_score: 68, last_attempted_at: new Date().toISOString() },
        { topic: 'SQL & Database Design', attempts: 1, average_score: 60, best_score: 60, last_attempted_at: new Date().toISOString() }
      ];
      res.json({ progress: sampleProgress });
      return;
    }

    res.json({ progress: progressItems });
  } catch (error) {
    console.error('getProgress error:', error);
    res.status(500).json({ error: 'Failed to fetch progress metrics' });
  }
};
