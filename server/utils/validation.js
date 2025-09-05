import validator from 'validator';

export const validateInput = (data, rules) => {
  const errors = [];
  let isValid = true;

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];

    // Required validation
    if (fieldRules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors.push(`${field} is required`);
      isValid = false;
      continue;
    }

    // Skip other validations if field is not required and empty
    if (!fieldRules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      continue;
    }

    // String validations
    if (typeof value === 'string') {
      // Min length
      if (fieldRules.minLength && value.length < fieldRules.minLength) {
        errors.push(`${field} must be at least ${fieldRules.minLength} characters long`);
        isValid = false;
      }

      // Max length
      if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
        errors.push(`${field} cannot exceed ${fieldRules.maxLength} characters`);
        isValid = false;
      }

      // Email validation
      if (fieldRules.email && !validator.isEmail(value)) {
        errors.push(`${field} must be a valid email address`);
        isValid = false;
      }

      // URL validation
      if (fieldRules.url && !validator.isURL(value)) {
        errors.push(`${field} must be a valid URL`);
        isValid = false;
      }

      // Pattern validation
      if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
        errors.push(`${field} format is invalid`);
        isValid = false;
      }
    }

    // Number validations
    if (typeof value === 'number') {
      // Min value
      if (fieldRules.min !== undefined && value < fieldRules.min) {
        errors.push(`${field} must be at least ${fieldRules.min}`);
        isValid = false;
      }

      // Max value
      if (fieldRules.max !== undefined && value > fieldRules.max) {
        errors.push(`${field} cannot exceed ${fieldRules.max}`);
        isValid = false;
      }
    }

    // Array validations
    if (Array.isArray(value)) {
      // Min items
      if (fieldRules.minItems && value.length < fieldRules.minItems) {
        errors.push(`${field} must have at least ${fieldRules.minItems} items`);
        isValid = false;
      }

      // Max items
      if (fieldRules.maxItems && value.length > fieldRules.maxItems) {
        errors.push(`${field} cannot have more than ${fieldRules.maxItems} items`);
        isValid = false;
      }
    }

    // Custom validation function
    if (fieldRules.custom && typeof fieldRules.custom === 'function') {
      const customResult = fieldRules.custom(value);
      if (customResult !== true) {
        errors.push(customResult || `${field} is invalid`);
        isValid = false;
      }
    }
  }

  return { isValid, errors };
};

// Common validation patterns
export const patterns = {
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  slug: /^[a-z0-9-]+$/
};

// Sanitize input
export const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return validator.escape(input.trim());
  }
  return input;
};

// Validate ObjectId
export const isValidObjectId = (id) => {
  return validator.isMongoId(id);
};