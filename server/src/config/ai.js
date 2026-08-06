import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Ensure AI API Key stays strictly on backend process.env
const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey || apiKey.includes('your_gemini_api_key_here')) {
  console.warn('⚠️ Warning: AI_API_KEY is not configured or using default template. AI routes will return simulated responses until a valid API key is set in server/.env');
}

// Initialize Google Gemini Client
export const aiClient = apiKey && !apiKey.includes('your_gemini_api_key_here')
  ? new GoogleGenAI({ apiKey })
  : null;

/**
 * Perform text or document analysis using Google Gemini API
 * @param {string} prompt - User instruction or analysis prompt
 * @param {Object} [fileData] - Optional uploaded file buffer / mimeType
 * @returns {Promise<string>} Generated response string
 */
export const generateAIResponse = async (prompt, fileData = null) => {
  if (!aiClient) {
    // Return a structured demonstration response when API key is not yet set
    return `### 🤖 Gemini AI Analysis Report (Simulated Mode)

> **Note:** To connect live Google Gemini responses, set a valid \`AI_API_KEY\` in your \`server/.env\` file.

#### 📋 Prompt Summary
* **Query Received:** "${prompt}"
${fileData ? `* **Uploaded Document:** \`${fileData.filename}\` (${fileData.mimetype})` : ''}

#### 💡 Key Insights
1. **Security Verified:** Direct AI API requests are fully encapsulated within server execution (\`process.env.AI_API_KEY\`).
2. **Context Analysis:** Input payloads and optional document metadata were processed cleanly through server-side Multer and Zod middleware.
3. **Actionable Recommendations:** Set up your Gemini API key from Google AI Studio to unlock live real-time analysis!`;
  }

  try {
    const model = 'gemini-2.5-flash';
    const contents = [];

    if (fileData && fileData.buffer) {
      contents.push({
        inlineData: {
          mimeType: fileData.mimetype,
          data: fileData.buffer.toString('base64'),
        },
      });
    }

    contents.push(prompt);

    const response = await aiClient.models.generateContent({
      model,
      contents,
    });

    return response.text || 'No response generated from Gemini API.';
  } catch (error) {
    console.error('❌ Gemini API Error:', error);
    throw new Error(`AI Generation Failed: ${error.message}`);
  }
};

export default generateAIResponse;
