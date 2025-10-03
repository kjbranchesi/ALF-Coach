/**
 * Input sanitization and validation utilities
 * Prevents XSS attacks and ensures data integrity
 */

/**
 * Sanitize user input by removing potentially dangerous characters
 * while preserving educational content formatting
 */
export function sanitizeInput(input: string): string {
  if (!input) {return '';}
  
  return input
    .trim()
    // Remove HTML tags but preserve basic formatting characters
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    // Remove dangerous characters that could be used for injection
    .replace(/[<>\"\'&]/g, (char) => {
      const entities: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[char];
    });
}

/**
 * Validate input length and content
 */
export interface ValidationOptions {
  maxLength?: number;
  minLength?: number;
  allowedCharacters?: RegExp;
  required?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue: string;
}

export function validateAndSanitizeInput(
  input: string,
  options: ValidationOptions = {}
): ValidationResult {
  const {
    maxLength = 500,
    minLength = 1,
    allowedCharacters = /^[\w\s\-.,!?()]+$/,
    required = true
  } = options;

  // Check if required
  if (required && !input.trim()) {
    return {
      isValid: false,
      error: 'This field is required',
      sanitizedValue: ''
    };
  }

  // Sanitize first
  const sanitized = sanitizeInput(input);

  // Length validation
  if (sanitized.length > maxLength) {
    return {
      isValid: false,
      error: `Input must be ${maxLength} characters or less`,
      sanitizedValue: sanitized
    };
  }

  if (sanitized.length < minLength && sanitized.length > 0) {
    return {
      isValid: false,
      error: `Input must be at least ${minLength} characters`,
      sanitizedValue: sanitized
    };
  }

  // Character validation
  if (sanitized && !allowedCharacters.test(sanitized)) {
    return {
      isValid: false,
      error: 'Input contains invalid characters',
      sanitizedValue: sanitized
    };
  }

  return {
    isValid: true,
    sanitizedValue: sanitized
  };
}