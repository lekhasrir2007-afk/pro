import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { supabaseAdmin } from '../utils/supabase';
import { mockSessionsStore } from './interviewController';

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const { data: dbSessions } = await supabaseAdmin
      .from('interview_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const userMockSessions = Object.values(mockSessionsStore).filter((s: any) => s.user_id === userId);
    const sessions = dbSessions && dbSessions.length > 0 ? dbSessions : userMockSessions;

    const completedSessions = sessions.filter((s: any) => s.status === 'completed');
    const totalInterviews = sessions.length;

    let averageScore = 0;
    if (completedSessions.length > 0) {
      const sum = completedSessions.reduce((acc: number, s: any) => acc + (s.overall_score || 0), 0);
      averageScore = Math.round(sum / completedSessions.length);
    }

    const recommendedTopics = profile?.weak_technologies?.length > 0 
      ? profile.weak_technologies 
      : ['Async JavaScript', 'REST Principles', 'Database Indexing'];

    res.json({
      stats: {
        totalInterviews,
        completedInterviews: completedSessions.length,
        averageScore,
        targetRole: profile?.target_role || 'Full-Stack Developer',
        preparationMinutes: profile?.daily_preparation_minutes || 60,
        onboardingCompleted: profile?.onboarding_completed || false
      },
      recentInterviews: sessions.slice(0, 5),
      recommendedTopics
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
