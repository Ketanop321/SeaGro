import express from 'express';
import axios from 'axios';
import rateLimit from 'express-rate-limit';
import { protect } from '../middleware/authMiddleware.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Rate limiting for AI endpoints
const aiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 requests per minute per user
  message: {
    error: 'Too many AI requests. Please wait a moment before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Gemini API endpoint
router.post('/gemini/chat', protect, aiRateLimit, async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: 'Messages array is required and cannot be empty'
      });
    }

    const latestMessage = messages[messages.length - 1];
    if (!latestMessage?.content || typeof latestMessage.content !== 'string') {
      return res.status(400).json({
        error: 'Latest message must have valid content'
      });
    }

    // Check message length
    if (latestMessage.content.length > 8000) {
      return res.status(400).json({
        error: 'Message is too long. Please keep it under 8000 characters.'
      });
    }

    // Build prompt from messages
    let prompt = '';
    if (messages.length > 1) {
      prompt += 'Previous conversation:\n';
      messages.slice(-5).forEach((msg) => {
        prompt += `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
      prompt += '\nCurrent message:\n';
    }
    prompt += `User: ${latestMessage.content}`;

    // Make request to Gemini API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    // Validate response
    if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      logger.error('Invalid Gemini API response format', response.data);
      return res.status(500).json({
        error: 'Invalid response from AI service'
      });
    }

    const generatedText = response.data.candidates[0].content.parts[0].text;

    logger.info(`AI response generated for user ${req.user._id}`);

    res.json({
      response: generatedText,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Gemini API error:', error);

    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      switch (status) {
        case 400:
          return res.status(400).json({
            error: 'Invalid request. Please check your message and try again.'
          });
        case 401:
          return res.status(500).json({
            error: 'AI service configuration error. Please contact support.'
          });
        case 403:
          return res.status(500).json({
            error: 'AI service access denied. Please contact support.'
          });
        case 429:
          return res.status(429).json({
            error: 'AI service rate limit exceeded. Please try again later.'
          });
        case 500:
        case 502:
        case 503:
          return res.status(503).json({
            error: 'AI service is temporarily unavailable. Please try again later.'
          });
        default:
          return res.status(500).json({
            error: errorData?.error?.message || 'Failed to generate AI response.'
          });
      }
    }

    if (error.request) {
      return res.status(503).json({
        error: 'AI service is currently unavailable. Please try again later.'
      });
    }

    res.status(500).json({
      error: 'An unexpected error occurred while processing your request.'
    });
  }
});

// YouTube API endpoint (for video search)
router.get('/youtube/search', protect, async (req, res) => {
  try {
    const { q, maxResults = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        error: 'Search query is required'
      });
    }

    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        key: process.env.YOUTUBE_API_KEY,
        q,
        part: 'snippet',
        type: 'video',
        maxResults: Math.min(maxResults, 25), // Limit to 25 max
        order: 'relevance'
      },
      timeout: 10000
    });

    res.json({
      videos: response.data.items,
      totalResults: response.data.pageInfo?.totalResults || 0
    });

  } catch (error) {
    logger.error('YouTube API error:', error);

    if (error.response?.status === 403) {
      return res.status(500).json({
        error: 'Video search service is temporarily unavailable.'
      });
    }

    res.status(500).json({
      error: 'Failed to search videos. Please try again later.'
    });
  }
});

export default router;