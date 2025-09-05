import validator from 'validator';

// Validation utility functions
export const validateInput = (data, rules) => {
  const errors = {};
  let isValid = true;

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];

    // Check if field is required
    if (fieldRules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors[field] = `${field} is required`;
      isValid = false;
      continue;
    }

    // Skip other validations if field is empty and not required
    if (!value && !fieldRules.required) {
      continue;
    }

    // String validations
    if (typeof value === 'string') {
      // Min length
      if (fieldRules.minLength && value.length < fieldRules.minLength) {
        errors[field] = `${field} must be at least ${fieldRules.minLength} characters long`;
        isValid = false;
      }

      // Max length
      if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
        errors[field] = `${field} must be no more than ${fieldRules.maxLength} characters long`;
        isValid = false;
      }

      // Email validation
      if (fieldRules.email && !validator.isEmail(value)) {
        errors[field] = `${field} must be a valid email address`;
        isValid = false;
      }

      // URL validation
      if (fieldRules.url && !validator.isURL(value)) {
        errors[field] = `${field} must be a valid URL`;
        isValid = false;
      }

      // Phone validation
      if (fieldRules.phone && !validator.isMobilePhone(value)) {
        errors[field] = `${field} must be a valid phone number`;
        isValid = false;
      }

      // Alphanumeric validation
      if (fieldRules.alphanumeric && !validator.isAlphanumeric(value)) {
        errors[field] = `${field} must contain only letters and numbers`;
        isValid = false;
      }

      // Custom regex pattern
      if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
        errors[field] = fieldRules.patternMessage || `${field} format is invalid`;
        isValid = false;
      }
    }

    // Number validations
    if (typeof value === 'number' || (typeof value === 'string' && !isNaN(value))) {
      const numValue = typeof value === 'number' ? value : parseFloat(value);

      // Min value
      if (fieldRules.min !== undefined && numValue < fieldRules.min) {
        errors[field] = `${field} must be at least ${fieldRules.min}`;
        isValid = false;
      }

      // Max value
      if (fieldRules.max !== undefined && numValue > fieldRules.max) {
        errors[field] = `${field} must be no more than ${fieldRules.max}`;
        isValid = false;
      }
    }

    // Array validations
    if (Array.isArray(value)) {
      // Min array length
      if (fieldRules.minItems && value.length < fieldRules.minItems) {
        errors[field] = `${field} must have at least ${fieldRules.minItems} items`;
        isValid = false;
      }

      // Max array length
      if (fieldRules.maxItems && value.length > fieldRules.maxItems) {
        errors[field] = `${field} must have no more than ${fieldRules.maxItems} items`;
        isValid = false;
      }
    }

    // Custom validation function
    if (fieldRules.custom && typeof fieldRules.custom === 'function') {
      const customResult = fieldRules.custom(value, data);
      if (customResult !== true) {
        errors[field] = customResult || `${field} is invalid`;
        isValid = false;
      }
    }
  }

  return {
    isValid,
    errors
  };
};

// Sanitize input data
export const sanitizeInput = (data) => {
  const sanitized = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Trim whitespace and escape HTML
      sanitized[key] = validator.escape(value.trim());
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize objects
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

// Password strength validation
export const validatePasswordStrength = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength: getPasswordStrength(password)
  };
};

// Get password strength score
const getPasswordStrength = (password) => {
  let score = 0;
  
  // Length bonus
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Character variety bonus
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  
  // Complexity bonus
  if (password.length >= 16) score += 1;
  if (/[^\w\s]/.test(password)) score += 1;

  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  if (score <= 6) return 'strong';
  return 'very-strong';
};

// Email validation
export const isValidEmail = (email) => {
  return validator.isEmail(email);
};

// Phone validation
export const isValidPhone = (phone) => {
  return validator.isMobilePhone(phone);
};

// URL validation
export const isValidURL = (url) => {
  return validator.isURL(url);
};

// MongoDB ObjectId validation
export const isValidObjectId = (id) => {
  return validator.isMongoId(id);
};

// File validation
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif']
  } = options;

  const errors = [];

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
    errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
  }

  // Check file extension
  if (allowedExtensions.length > 0) {
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    if (!allowedExtensions.includes(fileExtension)) {
      errors.push(`File extension must be one of: ${allowedExtensions.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  validateInput,
  sanitizeInput,
  validatePasswordStrength,
  isValidEmail,
  isValidPhone,
  isValidURL,
  isValidObjectId,
  validateFile
};