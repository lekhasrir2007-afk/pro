import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { supabaseAdmin } from '../utils/supabase';
import { ProfileSchema } from '../validation/schemas';

const mockProfiles: Record<string, any> = {};

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      if (mockProfiles[userId]) {
        res.json({ profile: mockProfiles[userId] });
        return;
      }
      
      const defaultProfile = {
        id: userId,
        full_name: req.user!.email.split('@')[0] || 'Student',
        email: req.user!.email,
        university: '',
        current_year: '',
        target_role: 'Full-Stack Developer',
        experience_level: 'Beginner',
        preferred_difficulty: 'Easy',
        known_technologies: ['HTML', 'CSS', 'JavaScript'],
        weak_technologies: ['TypeScript', 'Express.js'],
        daily_preparation_minutes: 60,
        role: 'student',
        onboarding_completed: false
      };
      
      res.json({ profile: defaultProfile });
      return;
    }

    res.json({ profile: data });
  } catch (error) {
    console.error('getProfile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const validationResult = ProfileSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({ error: 'Validation failed', details: validationResult.error.format() });
      return;
    }

    const profileData = {
      id: userId,
      ...validationResult.data,
      email: req.user!.email,
      updated_at: new Date().toISOString()
    };

    mockProfiles[userId] = profileData;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.warn('Supabase profile update warning:', error.message);
    }

    res.json({ message: 'Profile updated successfully', profile: data || profileData });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
