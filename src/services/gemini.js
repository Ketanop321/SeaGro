import { apiService } from './api';
import { handleError, AppError, ErrorTypes } from '../utils/errorHandler';

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

  // Initialize service
  initialize() {
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

  // Generate response using server-side API
  async generateResponse(messages) {
    try {
      // Initialize if not done
      if (!this.isInitialized) {
        this.initialize();
      }

      // Validate input
      const latestMessage = this.validateInput(messages);

      // Make API request to our server
      const response = await apiService.post('/ai/gemini/chat', {
        messages
      });

      const generatedText = response.response;

      // Add to message history
      this.messageHistory.addMessage(latestMessage);
      this.messageHistory.addMessage({ type: 'bot', content: generatedText });

      return generatedText;

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      // Handle server response errors
      if (error.response?.data?.error) {
        throw new AppError(ErrorTypes.SERVER, error.response.data.error);
      }

      throw new AppError(ErrorTypes.UNKNOWN, error.message || 'Failed to generate response.');
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