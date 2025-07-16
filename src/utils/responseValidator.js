// src/utils/responseValidator.js

/**
 * Utility to validate and fix AI responses
 */

// Expected fields for each stage
const stageFields = {
  'Ideation': [
    'interactionType', 'currentStage', 'chatResponse', 'isStageComplete',
    'summary', 'suggestions', 'buttons', 'recap', 'process', 'frameworkOverview'
  ],
  'Learning Journey': [
    'interactionType', 'currentStage', 'chatResponse', 'isStageComplete',
    'curriculumDraft', 'summary', 'suggestions', 'recap', 'process', 'frameworkOverview'
  ],
  'Student Deliverables': [
    'interactionType', 'currentStage', 'chatResponse', 'isStageComplete',
    'newAssignment', 'assessmentMethods', 'summary', 'suggestions', 
    'recap', 'process', 'frameworkOverview'
  ]
};

/**
 * Validates an AI response and attempts to fix common issues
 * @param {object} response - The AI response to validate
 * @param {string} expectedStage - The expected stage
 * @returns {object} - { isValid: boolean, errors: string[], fixed: object|null }
 */
export function validateResponse(response, expectedStage) {
  const errors = [];
  let fixed = null;

  // Check if response is an object
  if (!response || typeof response !== 'object') {
    errors.push('Response is not a valid object');
    return { isValid: false, errors, fixed };
  }

  // Get expected fields for this stage
  const expectedFields = stageFields[expectedStage] || stageFields['Ideation'];
  
  // Check for missing fields
  const missingFields = expectedFields.filter(field => !(field in response));
  if (missingFields.length > 0) {
    errors.push(`Missing fields: ${missingFields.join(', ')}`);
    
    // Attempt to fix by adding missing fields as null
    fixed = { ...response };
    missingFields.forEach(field => {
      fixed[field] = null;
    });
  }

  // Check currentStage matches
  if (response.currentStage && response.currentStage !== expectedStage) {
    errors.push(`Stage mismatch: expected "${expectedStage}", got "${response.currentStage}"`);
    if (!fixed) fixed = { ...response };
    fixed.currentStage = expectedStage;
  }

  // Validate required fields
  if (!response.interactionType) {
    errors.push('Missing required field: interactionType');
    if (!fixed) fixed = { ...response };
    fixed.interactionType = 'Standard';
  }

  if (!response.chatResponse || typeof response.chatResponse !== 'string') {
    errors.push('Missing or invalid chatResponse');
    if (!fixed) fixed = { ...response };
    fixed.chatResponse = 'I apologize, I had trouble processing that. Could you please try again?';
  }

  if (typeof response.isStageComplete !== 'boolean') {
    errors.push('isStageComplete must be a boolean');
    if (!fixed) fixed = { ...response };
    fixed.isStageComplete = false;
  }

  // Stage-specific validations
  if (expectedStage === 'Learning Journey' && response.curriculumDraft !== null) {
    if (typeof response.curriculumDraft !== 'string') {
      errors.push('curriculumDraft must be a string or null');
      if (!fixed) fixed = { ...response };
      fixed.curriculumDraft = '';
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    fixed
  };
}

/**
 * Creates a safe fallback response for a given stage
 * @param {string} stage - The current stage
 * @param {string} error - The error message
 * @returns {object} - A valid response object
 */
export function createFallbackResponse(stage, error = '') {
  const baseResponse = {
    interactionType: 'Standard',
    currentStage: stage,
    chatResponse: 'I apologize for the confusion. Let me help you continue with your project. What would you like to work on?',
    isStageComplete: false,
    summary: null,
    suggestions: null,
    buttons: null,
    recap: null,
    process: null,
    frameworkOverview: null
  };

  // Add stage-specific fields
  if (stage === 'Learning Journey') {
    baseResponse.curriculumDraft = '';
  } else if (stage === 'Student Deliverables') {
    baseResponse.newAssignment = null;
    baseResponse.assessmentMethods = null;
  }

  return baseResponse;
}

/**
 * Sanitizes text to prevent JSON parsing errors
 * @param {string} text - The text to sanitize
 * @returns {string} - Sanitized text
 */
export function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .replace(/\\/g, '\\\\')  // Escape backslashes
    .replace(/"/g, '\\"')    // Escape quotes
    .replace(/\n/g, '\\n')   // Escape newlines
    .replace(/\r/g, '\\r')   // Escape carriage returns
    .replace(/\t/g, '\\t')   // Escape tabs
    .replace(/[\x00-\x1F\x7F-\x9F]/g, ''); // Remove control characters
}