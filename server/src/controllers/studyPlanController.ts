import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { supabaseAdmin } from '../utils/supabase';
import { generateStudyPlanService } from '../services/geminiService';

const mockStudyPlans: Record<string, any> = {};

export const generateStudyPlan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { target_role, experience_level, weak_areas, daily_time } = req.body;

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const role = target_role || profile?.target_role || 'Full-Stack Developer';
    const level = experience_level || profile?.experience_level || 'Beginner';
    const time = daily_time || profile?.daily_preparation_minutes || 60;
    const weak = weak_areas || profile?.weak_technologies || ['TypeScript', 'Database Design'];

    const plan = await generateStudyPlanService({
      target_role: role,
      experience_level: level,
      weak_areas: weak,
      daily_time: time
    });

    const planRecord = {
      id: crypto.randomUUID(),
      user_id: userId,
      plan_title: plan.plan_title,
      plan_content: plan.days,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockStudyPlans[planRecord.id] = planRecord;

    await supabaseAdmin
      .from('study_plans')
      .insert(planRecord);

    res.status(201).json({ plan: planRecord });
  } catch (error) {
    console.error('generateStudyPlan error:', error);
    res.status(500).json({ error: 'Failed to generate study plan' });
  }
};

export const getStudyPlans = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const { data: dbPlans } = await supabaseAdmin
      .from('study_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const userMockPlans = Object.values(mockStudyPlans).filter((p: any) => p.user_id === userId);
    const plans = dbPlans && dbPlans.length > 0 ? dbPlans : userMockPlans;

    res.json({ plans });
  } catch (error) {
    console.error('getStudyPlans error:', error);
    res.status(500).json({ error: 'Failed to fetch study plans' });
  }
};

export const getStudyPlanById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const planId = req.params.id as string;

    let plan = mockStudyPlans[planId];
    if (!plan || plan.user_id !== userId) {
      const { data } = await supabaseAdmin
        .from('study_plans')
        .select('*')
        .eq('id', planId)
        .eq('user_id', userId)
        .single();
      plan = data;
    }

    if (!plan || plan.user_id !== userId) {
      res.status(404).json({ error: 'Study plan not found' });
      return;
    }

    res.json({ plan });
  } catch (error) {
    console.error('getStudyPlanById error:', error);
    res.status(500).json({ error: 'Failed to fetch study plan' });
  }
};
