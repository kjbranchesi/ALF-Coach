// src/utils/responseValidator.js - ENHANCED VERSION

/**
 * Enhanced validator with better error recovery and logging
 */

// Expected fields for each stage
const stageFields = {
  'Ideation': [
    'interactionType', 'currentStage', 'chatResponse', 'isStageComplete',
    'summary', 'suggestions', 'buttons', 'recap', 'process', 'frameworkOverview'
  ],
  'Learning Journey': [
    'interactionType', 'currentStage', 'chatResponse', 'isStageComplete',
    'curriculumDraft', 'summary', 'suggestions', 'recap', 'process', 
    'frameworkOverview', 'buttons'
  ],
  'Student Deliverables': [
    'interactionType', 'currentStage', 'chatResponse', 'isStageComplete',
    'newAssignment', 'assessmentMethods', 'summary', 'suggestions', 
    'recap', 'process', 'frameworkOverview', 'buttons'
  ]
};

// Valid interaction types
const validInteractionTypes = ['Standard', 'Guide', 'Provocation', 'Welcome', 'Framework', 'Process'];

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
    return { isValid: false, errors, fixed: createFallbackResponse(expectedStage) };
  }

  // Create a working copy for fixes
  fixed = { ...response };

  // Get expected fields for this stage
  const expectedFields = stageFields[expectedStage] || stageFields['Ideation'];
  
  // Add missing fields as null
  expectedFields.forEach(field => {
    if (!(field in fixed)) {
      fixed[field] = null;
      errors.push(`Added missing field: ${field}`);
    }
  });

  // Fix currentStage
  if (fixed.currentStage !== expectedStage) {
    errors.push(`Fixed stage: "${fixed.currentStage}" → "${expectedStage}"`);
    fixed.currentStage = expectedStage;
  }

  // Validate and fix interactionType
  if (!fixed.interactionType || !validInteractionTypes.includes(fixed.interactionType)) {
    errors.push(`Fixed invalid interactionType: "${fixed.interactionType}" → "Standard"`);
    fixed.interactionType = 'Standard';
  }

  // Ensure chatResponse is a string
  if (!fixed.chatResponse || typeof fixed.chatResponse !== 'string') {
    errors.push('Fixed missing/invalid chatResponse');
    fixed.chatResponse = getContextualFallbackMessage(expectedStage);
  }

  // Ensure isStageComplete is boolean
  if (typeof fixed.isStageComplete !== 'boolean') {
    errors.push('Fixed isStageComplete to boolean');
    fixed.isStageComplete = false;
  }

  // Stage-specific validations
  if (expectedStage === 'Learning Journey') {
    // Ensure curriculumDraft is string or null
    if (fixed.curriculumDraft !== null && typeof fixed.curriculumDraft !== 'string') {
      errors.push('Fixed curriculumDraft type');
      fixed.curriculumDraft = '';
    }
    
    // If curriculumDraft exists but is empty string, set to null
    if (fixed.curriculumDraft === '') {
      fixed.curriculumDraft = null;
    }
  }

  if (expectedStage === 'Student Deliverables') {
    // Validate newAssignment structure if present
    if (fixed.newAssignment && typeof fixed.newAssignment === 'object') {
      if (!fixed.newAssignment.title || !fixed.newAssignment.description || !fixed.newAssignment.rubric) {
        errors.push('Fixed incomplete newAssignment');
        fixed.newAssignment = null;
      }
    }
  }

  // Validate arrays
  ['suggestions', 'buttons'].forEach(field => {
    if (fixed[field] !== null && !Array.isArray(fixed[field])) {
      errors.push(`Fixed ${field} to array`);
      fixed[field] = null;
    }
  });

  // Validate complex objects
  if (fixed.process !== null && typeof fixed.process !== 'object') {
    errors.push('Fixed process to object');
    fixed.process = null;
  }

  if (fixed.frameworkOverview !== null && typeof fixed.frameworkOverview !== 'object') {
    errors.push('Fixed frameworkOverview to object');
    fixed.frameworkOverview = null;
  }

  // Log validation results for debugging
  if (errors.length > 0) {
    console.log('Response validation fixes applied:', errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
    fixed: errors.length > 0 ? fixed : null
  };
}

/**
 * Gets a contextual fallback message based on stage
 */
function getContextualFallbackMessage(stage) {
  const messages = {
    'Ideation': "I'm here to help shape your project idea. What aspect would you like to explore?",
    'Learning Journey': "Let's continue building your curriculum. What would you like to work on next?",
    'Student Deliverables': "Let's design meaningful assessments. What kind of student work are you envisioning?"
  };
  return messages[stage] || "Let's continue working on your project. How can I help?";
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
    chatResponse: getContextualFallbackMessage(stage),
    isStageComplete: false,
    summary: null,
    suggestions: null,
    buttons: ['Tell me more', 'I need help'],
    recap: null,
    process: null,
    frameworkOverview: null
  };

  // Add stage-specific fields
  if (stage === 'Learning Journey') {
    baseResponse.curriculumDraft = null;
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

/**
 * Validates curriculum draft format
 * @param {string} draft - The curriculum draft
 * @returns {object} - { isValid: boolean, issues: string[] }
 */
export function validateCurriculumDraft(draft) {
  if (!draft || typeof draft !== 'string') {
    return { isValid: false, issues: ['Draft is not a string'] };
  }

  const issues = [];
  
  // Check for phase headers
  const phaseCount = (draft.match(/### Phase/g) || []).length;
  if (phaseCount === 0) {
    issues.push('No phase headers found');
  }

  // Check for unclosed brackets (template literal issues)
  if (draft.includes('[') && draft.includes(']')) {
    const bracketCount = (draft.match(/\[([^\]]+)\]/g) || []).length;
    if (bracketCount > 0) {
      issues.push(`Found ${bracketCount} placeholder brackets that need content`);
    }
  }

  // Check for basic structure elements
  const hasObjectives = draft.includes('Objectives:') || draft.includes('Learning Objectives:');
  const hasActivities = draft.includes('Activities:') || draft.includes('Week');
  
  if (!hasObjectives && phaseCount > 0) {
    issues.push('Phases lack learning objectives');
  }
  
  if (!hasActivities && phaseCount > 0) {
    issues.push('Phases lack activities');
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}