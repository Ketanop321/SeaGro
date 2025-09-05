import axios from 'axios';
import { config } from '../config/env';
import { RateLimiter } from '../utils/rateLimiter';
import { handleError, AppError, ErrorTypes } from '../utils/errorHandler';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const rateLimiter = new RateLimiter(
  config.rateLimiting.gemini.maxRequests,
  config.rateLimiting.gemini.windowMs
);

// Message history management
class MessageHistory {
  constructor(maxMessages = 10) {
    this.maxMessages = maxMessages;
    this.history = [];
  }

  addMessage(message) {
    this.history.push(message);
    if (this.history.length > this.maxMessages) {
      this.history = this.history.slice(-this.maxMessages);
    }
  }

  getContext() {
    return this.history.slice(-5); // Last 5 messages for context
  }

  clear() {
    this.history = [];
  }
}

class GeminiService {
  constructor() {
    this.messageHistory = new MessageHistory();
    this.isInitialized = false;
  }

  // Initialize service and check API key
  initialize() {
    if (!config.geminiApiKey) {
      throw new AppError(
        ErrorTypes.VALIDATION,
        'Gemini API key is not configured. Please check your environment variables.'
      );
    }
    this.isInitialized = true;
  }

  // Validate and sanitize input
  validateInput(messages) {
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new AppError(ErrorTypes.VALIDATION, 'Messages array is required and cannot be empty.');
    }

    const latestMessage = messages[messages.length - 1];
    if (!latestMessage?.content || typeof latestMessage.content !== 'string') {
      throw new AppError(ErrorTypes.VALIDATION, 'Latest message must have valid content.');
    }

    // Check message length
    if (latestMessage.content.length > 8000) {
      throw new AppError(ErrorTypes.VALIDATION, 'Message is too long. Please keep it under 8000 characters.');
    }

    return latestMessage;
  }

  // Build conversation context
  buildContext(messages) {
    const context = this.messageHistory.getContext();
    const latestMessage = messages[messages.length - 1];
    
    // Combine context with current message
    let prompt = '';
    
    if (context.length > 0) {
      prompt += 'Previous conversation:\n';
      context.forEach((msg, index) => {
        prompt += `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
      prompt += '\nCurrent message:\n';
    }
    
    prompt += `User: ${latestMessage.content}`;
    
    return prompt;
  }

  // Generate response with improved error handling
  async generateResponse(messages) {
    try {
      // Initialize if not done
      if (!this.isInitialized) {
        this.initialize();
      }

      // Validate input
      const latestMessage = this.validateInput(messages);

      // Check rate limit
      await rateLimiter.tryRequest();

      // Build context
      const prompt = this.buildContext(messages);

      // Make API request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await axios.post(
        `${GEMINI_API_URL}?key=${config.geminiApiKey}`,
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
          signal: controller.signal,
          timeout: 30000
        }
      );

      clearTimeout(timeoutId);

      // Validate response
      if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new AppError(ErrorTypes.SERVER, 'Invalid response format from Gemini API');
      }

      const generatedText = response.data.candidates[0].content.parts[0].text;

      // Add to message history
      this.messageHistory.addMessage(latestMessage);
      this.messageHistory.addMessage({ type: 'bot', content: generatedText });

      return generatedText;

    } catch (error) {
      // Handle specific error types
      if (error.name === 'AbortError') {
        throw new AppError(ErrorTypes.NETWORK, 'Request timed out. Please try again.');
      }

      if (error instanceof AppError) {
        throw error;
      }

      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        switch (status) {
          case 400:
            throw new AppError(ErrorTypes.VALIDATION, 'Invalid request. Please check your message and try again.');
          case 401:
            throw new AppError(ErrorTypes.AUTHENTICATION, 'Invalid API key. Please check your configuration.');
          case 403:
            throw new AppError(ErrorTypes.AUTHORIZATION, 'Access denied. Please check your API permissions.');
          case 429:
            throw new AppError(ErrorTypes.RATE_LIMIT, 'Rate limit exceeded. Please wait a moment and try again.');
          case 500:
          case 502:
          case 503:
            throw new AppError(ErrorTypes.SERVER, 'Gemini service is temporarily unavailable. Please try again later.');
          default:
            throw new AppError(ErrorTypes.UNKNOWN, errorData?.error?.message || 'Failed to generate response.');
        }
      }

      if (error.request) {
        throw new AppError(ErrorTypes.NETWORK, 'Network error. Please check your connection and try again.');
      }

      throw new AppError(ErrorTypes.UNKNOWN, error.message || 'An unexpected error occurred.');
    }
  }

  // Clear conversation history
  clearHistory() {
    this.messageHistory.clear();
  }

  // Get conversation history
  getHistory() {
    return this.messageHistory.getContext();
  }
}

// Create singleton instance
const geminiService = new GeminiService();

export { geminiService };
export default geminiService;