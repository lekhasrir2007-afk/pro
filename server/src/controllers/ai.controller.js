import { generateAIResponse } from '../config/ai.js';

/**
 * @route POST /api/ai/analyze
 * @desc Protected route to process prompts & document uploads using Google Gemini API on server side
 */
export const analyzeContent = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    const file = req.file;

    if (!prompt && !file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a text prompt or upload a document to analyze.',
      });
    }

    const defaultPrompt = prompt || 'Please analyze this uploaded document in detail and provide key insights.';

    let fileData = null;
    if (file) {
      fileData = {
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer,
      };
    }

    const result = await generateAIResponse(defaultPrompt, fileData);

    res.status(200).json({
      success: true,
      message: 'Content analysis completed successfully',
      data: {
        analysis: result,
        metadata: {
          prompt: defaultPrompt,
          hasAttachment: !!file,
          fileName: file ? file.originalname : null,
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
