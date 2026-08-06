import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env';

const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'mock-gemini-key') {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('⚠️ Gemini AI client initialization warning:', err);
  }
}

export const generateAiContent = async (prompt: string, context?: string): Promise<string> => {
  if (!aiClient || !apiKey) {
    return `[Demo AI Mode] Received prompt: "${prompt}". To enable live Google Gemini responses, please set a valid GEMINI_API_KEY in server/.env.\n\nSummary of findings: Key concepts were parsed successfully and stored.`;
  }

  try {
    const fullPrompt = context
      ? `Context Information:\n${context}\n\nUser Request: ${prompt}`
      : prompt;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        systemInstruction: 'You are an intelligent AI assistant built into a production full-stack web application. Provide concise, clear, and action-oriented markdown formatted responses.',
      },
    });

    return response.text || 'No output received from Gemini API.';
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    throw new Error(`Gemini AI service error: ${error.message || 'Failed to generate response'}`);
  }
};

export const analyzeDocumentContext = async (documentText: string, instruction?: string): Promise<string> => {
  const prompt = instruction || 'Please analyze this document text. Provide a summary of key points, main takeaways, and action items.';
  return generateAiContent(prompt, documentText);
};
