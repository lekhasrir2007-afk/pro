import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { supabaseAdmin } from '../utils/supabase';
import { InterviewSetupSchema, StudentAnswerSchema } from '../validation/schemas';
import {
  generateQuestionService,
  evaluateAnswerService,
  generateFinalReportService
} from '../services/geminiService';

export const mockSessionsStore: Record<string, any> = {};
export const mockQuestionsStore: Record<string, any[]> = {};
export const mockAnswersStore: Record<string, any[]> = {};

export const startInterview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const validation = InterviewSetupSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({ error: 'Invalid interview setup configuration', details: validation.error.format() });
      return;
    }

    const { target_role, interview_type, topic, difficulty, total_questions } = validation.data;
    const sessionId = crypto.randomUUID();

    const sessionData = {
      id: sessionId,
      user_id: userId,
      target_role,
      interview_type,
      topic,
      difficulty,
      total_questions,
      current_question_number: 0,
      status: 'in_progress',
      processing_status: 'waiting',
      started_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockSessionsStore[sessionId] = sessionData;
    mockQuestionsStore[sessionId] = [];
    mockAnswersStore[sessionId] = [];

    const { error } = await supabaseAdmin
      .from('interview_sessions')
      .insert(sessionData);

    if (error) {
      console.warn('Supabase session insert warning:', error.message);
    }

    res.status(201).json({
      message: 'Interview session created successfully',
      session: sessionData
    });
  } catch (error) {
    console.error('startInterview error:', error);
    res.status(500).json({ error: 'Failed to start interview session' });
  }
};

export const getInterviews = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const { data: dbSessions } = await supabaseAdmin
      .from('interview_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const userMockSessions = Object.values(mockSessionsStore).filter((s: any) => s.user_id === userId);

    const sessions = dbSessions && dbSessions.length > 0 ? dbSessions : userMockSessions;
    res.json({ sessions });
  } catch (error) {
    console.error('getInterviews error:', error);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
};

export const getInterviewById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const sessionId = req.params.id as string;

    let session = mockSessionsStore[sessionId];
    if (!session || session.user_id !== userId) {
      const { data } = await supabaseAdmin
        .from('interview_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single();
      
      session = data;
    }

    if (!session || session.user_id !== userId) {
      res.status(404).json({ error: 'Interview session not found or unauthorized access' });
      return;
    }

    const { data: dbQuestions } = await supabaseAdmin
      .from('interview_questions')
      .select('*')
      .eq('session_id', sessionId)
      .order('question_order', { ascending: true });

    const { data: dbAnswers } = await supabaseAdmin
      .from('interview_answers')
      .select('*')
      .eq('session_id', sessionId);

    const questions = dbQuestions && dbQuestions.length > 0 ? dbQuestions : (mockQuestionsStore[sessionId] || []);
    const answers = dbAnswers && dbAnswers.length > 0 ? dbAnswers : (mockAnswersStore[sessionId] || []);

    const safeQuestions = questions.map((q: any) => {
      const { expected_points, ...safe } = q;
      return safe;
    });

    res.json({
      session,
      questions: safeQuestions,
      answers
    });
  } catch (error) {
    console.error('getInterviewById error:', error);
    res.status(500).json({ error: 'Failed to fetch interview details' });
  }
};

export const generateQuestion = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const sessionId = req.params.id as string;

    let session = mockSessionsStore[sessionId];
    if (!session || session.user_id !== userId) {
      const { data } = await supabaseAdmin
        .from('interview_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single();
      session = data;
    }

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    session.processing_status = 'generating_question';
    await supabaseAdmin
      .from('interview_sessions')
      .update({ processing_status: 'generating_question' })
      .eq('id', sessionId);

    const existingQuestions = mockQuestionsStore[sessionId] || [];
    const previousQuestionTexts = existingQuestions.map((q: any) => q.question);

    const nextOrder = session.current_question_number + 1;

    const aiQuestion = await generateQuestionService({
      target_role: session.target_role,
      interview_type: session.interview_type,
      topic: session.topic,
      difficulty: session.difficulty,
      experience_level: 'Beginner',
      previous_questions: previousQuestionTexts,
      weak_areas: []
    });

    const questionRecord = {
      id: crypto.randomUUID(),
      session_id: sessionId,
      user_id: userId,
      question: aiQuestion.question,
      topic: aiQuestion.topic || session.topic,
      difficulty: aiQuestion.difficulty || session.difficulty,
      skill_tested: aiQuestion.skill_tested,
      expected_points: aiQuestion.expected_points,
      question_order: nextOrder,
      created_at: new Date().toISOString()
    };

    if (!mockQuestionsStore[sessionId]) mockQuestionsStore[sessionId] = [];
    mockQuestionsStore[sessionId].push(questionRecord);

    session.current_question_number = nextOrder;
    session.processing_status = 'question_ready';

    await supabaseAdmin
      .from('interview_questions')
      .insert(questionRecord);

    await supabaseAdmin
      .from('interview_sessions')
      .update({
        current_question_number: nextOrder,
        processing_status: 'question_ready',
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    const { expected_points, ...safeQuestion } = questionRecord;
    res.json({ question: safeQuestion });
  } catch (error) {
    console.error('generateQuestion error:', error);
    res.status(500).json({ error: 'Failed to generate question' });
  }
};

export const submitAnswer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const sessionId = req.params.id as string;

    const validation = StudentAnswerSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: 'Invalid answer submission', details: validation.error.format() });
      return;
    }

    const { question_id, student_answer } = validation.data;

    let session = mockSessionsStore[sessionId];
    if (!session || session.user_id !== userId) {
      const { data } = await supabaseAdmin
        .from('interview_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single();
      session = data;
    }

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const existingAnswers = mockAnswersStore[sessionId] || [];
    if (existingAnswers.some((a: any) => a.question_id === question_id)) {
      res.status(400).json({ error: 'Answer already submitted for this question' });
      return;
    }

    const questions = mockQuestionsStore[sessionId] || [];
    const questionObj = questions.find((q: any) => q.id === question_id);

    if (!questionObj) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    session.processing_status = 'evaluating_answer';
    await supabaseAdmin
      .from('interview_sessions')
      .update({ processing_status: 'evaluating_answer' })
      .eq('id', sessionId);

    const evaluation = await evaluateAnswerService({
      question: questionObj.question,
      expected_points: questionObj.expected_points || [],
      student_answer,
      experience_level: 'Beginner'
    });

    session.processing_status = 'saving_result';

    const answerRecord = {
      id: crypto.randomUUID(),
      question_id,
      session_id: sessionId,
      user_id: userId,
      student_answer,
      score: evaluation.score,
      result: evaluation.result,
      correct_points: evaluation.correct_points,
      missing_points: evaluation.missing_points,
      incorrect_points: evaluation.incorrect_points,
      technical_feedback: evaluation.technical_feedback,
      communication_feedback: evaluation.communication_feedback,
      improved_answer: evaluation.improved_answer,
      follow_up_question: evaluation.follow_up_question || '',
      recommended_topic: evaluation.recommended_topic || session.topic,
      created_at: new Date().toISOString()
    };

    if (!mockAnswersStore[sessionId]) mockAnswersStore[sessionId] = [];
    mockAnswersStore[sessionId].push(answerRecord);

    await supabaseAdmin
      .from('interview_answers')
      .insert(answerRecord);

    updateProgressTable(userId, session.topic, evaluation.score);

    session.processing_status = 'waiting';
    await supabaseAdmin
      .from('interview_sessions')
      .update({ processing_status: 'waiting', updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    res.json({ evaluation: answerRecord });
  } catch (error) {
    console.error('submitAnswer error:', error);
    res.status(500).json({ error: 'Failed to evaluate answer' });
  }
};

export const completeInterview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const sessionId = req.params.id as string;

    let session = mockSessionsStore[sessionId];
    if (!session || session.user_id !== userId) {
      const { data } = await supabaseAdmin
        .from('interview_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single();
      session = data;
    }

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const answers = mockAnswersStore[sessionId] || [];

    const finalReport = await generateFinalReportService({
      target_role: session.target_role,
      interview_type: session.interview_type,
      difficulty: session.difficulty,
      interview_results: answers
    });

    session.status = 'completed';
    session.processing_status = 'completed';
    session.overall_score = finalReport.overall_score;
    session.performance_level = finalReport.performance_level;
    session.technical_summary = finalReport.technical_summary;
    session.communication_summary = finalReport.communication_summary;
    session.strong_areas = finalReport.strong_areas;
    session.weak_areas = finalReport.weak_areas;
    session.topics_to_revise = finalReport.topics_to_revise;
    session.next_difficulty = finalReport.next_difficulty;
    session.final_message = finalReport.final_message;
    session.completed_at = new Date().toISOString();

    await supabaseAdmin
      .from('interview_sessions')
      .update({
        status: 'completed',
        processing_status: 'completed',
        overall_score: finalReport.overall_score,
        performance_level: finalReport.performance_level,
        technical_summary: finalReport.technical_summary,
        communication_summary: finalReport.communication_summary,
        strong_areas: finalReport.strong_areas,
        weak_areas: finalReport.weak_areas,
        topics_to_revise: finalReport.topics_to_revise,
        next_difficulty: finalReport.next_difficulty,
        final_message: finalReport.final_message,
        completed_at: session.completed_at,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    res.json({ report: finalReport, session });
  } catch (error) {
    console.error('completeInterview error:', error);
    res.status(500).json({ error: 'Failed to complete interview session' });
  }
};

async function updateProgressTable(userId: string, topic: string, score: number) {
  try {
    const { data } = await supabaseAdmin
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .eq('topic', topic)
      .single();

    if (data) {
      const newAttempts = (data.attempts || 0) + 1;
      const newAvg = Math.round((((data.average_score || 0) * (data.attempts || 0)) + (score * 10)) / newAttempts);
      const newBest = Math.max(data.best_score || 0, Math.round(score * 10));

      await supabaseAdmin
        .from('progress')
        .update({
          attempts: newAttempts,
          average_score: newAvg,
          best_score: newBest,
          last_attempted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id);
    } else {
      await supabaseAdmin
        .from('progress')
        .insert({
          id: crypto.randomUUID(),
          user_id: userId,
          topic,
          attempts: 1,
          average_score: Math.round(score * 10),
          best_score: Math.round(score * 10),
          last_attempted_at: new Date().toISOString()
        });
    }
  } catch (e) {
    console.warn('Progress update error:', e);
  }
}
