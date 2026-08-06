import { z } from 'zod';

// Auth Schemas
export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name is required')
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// Profile Schema
export const ProfileSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email().optional(),
  university: z.string().optional().default(''),
  current_year: z.string().optional().default(''),
  target_role: z.enum(['Frontend Developer', 'Backend Developer', 'Full-Stack Developer']),
  experience_level: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Beginner'),
  preferred_difficulty: z.enum(['Easy', 'Medium', 'Hard']).default('Easy'),
  known_technologies: z.array(z.string()).default([]),
  weak_technologies: z.array(z.string()).default([]),
  daily_preparation_minutes: z.number().int().min(15).max(360).default(60),
  onboarding_completed: z.boolean().default(true)
});

// Interview Setup Schema
export const InterviewSetupSchema = z.object({
  target_role: z.enum(['Frontend Developer', 'Backend Developer', 'Full-Stack Developer']),
  interview_type: z.enum(['Technical', 'HR', 'Mixed']),
  topic: z.string().min(1, 'Topic is required'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  total_questions: z.number().int().min(1).max(10).default(3)
});

// Student Answer Schema
export const StudentAnswerSchema = z.object({
  question_id: z.string().uuid('Invalid question ID'),
  student_answer: z.string().min(5, 'Answer must be at least 5 characters long').max(5000, 'Answer is too long (max 5000 characters)')
});

// Gemini AI Response Schemas
export const GeminiQuestionResponseSchema = z.object({
  question: z.string().min(1),
  topic: z.string().min(1),
  difficulty: z.string().min(1),
  skill_tested: z.string().min(1),
  expected_points: z.array(z.string()).min(1)
});

export const GeminiEvaluationResponseSchema = z.object({
  score: z.number().min(0).max(10),
  result: z.string().min(1),
  correct_points: z.array(z.string()),
  missing_points: z.array(z.string()),
  incorrect_points: z.array(z.string()),
  technical_feedback: z.string().min(1),
  communication_feedback: z.string().min(1),
  improved_answer: z.string().min(1),
  follow_up_question: z.string().optional().default(''),
  recommended_topic: z.string().min(1)
});

export const GeminiFinalReportResponseSchema = z.object({
  overall_score: z.number().min(0).max(100),
  performance_level: z.string().min(1),
  strong_areas: z.array(z.string()),
  weak_areas: z.array(z.string()),
  technical_summary: z.string().min(1),
  communication_summary: z.string().min(1),
  topics_to_revise: z.array(z.string()),
  next_difficulty: z.string().min(1),
  final_message: z.string().min(1)
});

export const GeminiStudyPlanDaySchema = z.object({
  day: z.number().int().min(1).max(7),
  topic: z.string().min(1),
  objective: z.string().min(1),
  learning_activity: z.string().min(1),
  practice_activity: z.string().min(1),
  duration_minutes: z.number().int().min(15)
});

export const GeminiStudyPlanResponseSchema = z.object({
  plan_title: z.string().min(1),
  days: z.array(GeminiStudyPlanDaySchema).length(7)
});

export type GeminiQuestionResponse = z.infer<typeof GeminiQuestionResponseSchema>;
export type GeminiEvaluationResponse = z.infer<typeof GeminiEvaluationResponseSchema>;
export type GeminiFinalReportResponse = z.infer<typeof GeminiFinalReportResponseSchema>;
export type GeminiStudyPlanResponse = z.infer<typeof GeminiStudyPlanResponseSchema>;
