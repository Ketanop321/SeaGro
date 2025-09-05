import { toast } from 'react-hot-toast';

// Error types
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// Error messages
const errorMessages = {
  [ErrorTypes.NETWORK]: 'Network connection failed. Please check your internet connection.',
  [ErrorTypes.VALIDATION]: 'Please check your input and try again.',
  [ErrorTypes.AUTHENTICATION]: 'Please log in to continue.',
  [ErrorTypes.AUTHORIZATION]: 'You don\'t have permission to perform this action.',
  [ErrorTypes.RATE_LIMIT]: 'Too many requests. Please wait a moment and try again.',
  [ErrorTypes.SERVER]: 'Server error occurred. Please try again later.',
  [ErrorTypes.UNKNOWN]: 'An unexpected error occurred. Please try again.'
};

// Custom error class
export class AppError extends Error {
  constructor(type, message, originalError = null) {
    super(message || errorMessages[type] || errorMessages[ErrorTypes.UNKNOWN]);
    this.type = type;
    this.originalError = originalError;
    this.name = 'AppError';
  }
}

// Error classifier
export const classifyError = (error) => {
  if (error instanceof AppError) {
    return error;
  }

  // Network errors
  if (!navigator.onLine) {
    return new AppError(ErrorTypes.NETWORK, 'You appear to be offline. Please check your connection.');
  }

  // HTTP errors
  if (error.response) {
    const status = error.response.status;
    
    switch (status) {
      case 400:
        return new AppError(ErrorTypes.VALIDATION, error.response.data?.message);
      case 401:
        return new AppError(ErrorTypes.AUTHENTICATION, 'Your session has expired. Please log in again.');
      case 403:
        return new AppError(ErrorTypes.AUTHORIZATION);
      case 429:
        return new AppError(ErrorTypes.RATE_LIMIT);
      case 500:
      case 502:
      case 503:
      case 504:
        return new AppError(ErrorTypes.SERVER);
      default:
        return new AppError(ErrorTypes.UNKNOWN, error.response.data?.message);
    }
  }

  // Request errors (no response)
  if (error.request) {
    return new AppError(ErrorTypes.NETWORK);
  }

  // Rate limiting errors
  if (error.message?.includes('wait') && error.message?.includes('seconds')) {
    return new AppError(ErrorTypes.RATE_LIMIT, error.message);
  }

  return new AppError(ErrorTypes.UNKNOWN, error.message, error);
};

// Global error handler
export const handleError = (error, showToast = true) => {
  const appError = classifyError(error);
  
  // Log error in development
  if (import.meta.env.DEV) {
    console.error('Error occurred:', {
      type: appError.type,
      message: appError.message,
      originalError: appError.originalError,
      stack: appError.stack
    });
  }

  // Show toast notification
  if (showToast) {
    toast.error(appError.message, {
      duration: appError.type === ErrorTypes.RATE_LIMIT ? 5000 : 4000,
      position: 'top-right'
    });
  }

  // Handle authentication errors
  if (appError.type === ErrorTypes.AUTHENTICATION) {
    // Clear auth data and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  return appError;
};

// Async error wrapper
export const withErrorHandling = (asyncFn, showToast = true) => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      throw handleError(error, showToast);
    }
  };
};

// Export the ErrorFallback component from its own file
export { ErrorFallback } from '../components/ui/ErrorFallback.jsx';