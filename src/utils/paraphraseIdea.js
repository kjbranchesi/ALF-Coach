// src/utils/paraphraseIdea.js
import { ideationPrompts } from '../ai/promptTemplates/ideation.js';

/**
 * Paraphrases an idea to make it clearer and more engaging
 * @param {string} originalText - The original text to paraphrase
 * @param {string} type - The type of text (bigIdea, essentialQuestion, challenge)
 * @returns {string} - The paraphrased text
 */
export const paraphraseIdea = (originalText, type = 'idea') => {
  // Simple paraphrasing logic for now
  // In a real implementation, this would call an AI service
  
  if (!originalText || originalText.trim().length === 0) {
    return originalText;
  }

  // Clean up common typos and formatting issues
  let paraphrased = originalText
    .trim()
    .replace(/\s+/g, ' ') // Remove extra whitespace
    .replace(/([.!?])\s*$/, '$1'); // Ensure proper punctuation

  // Type-specific improvements
  switch (type) {
    case 'bigIdea': {
      // Capitalize first letter, remove redundant words
      paraphrased = paraphrased.charAt(0).toUpperCase() + paraphrased.slice(1);
      break;
    }
      
    case 'essentialQuestion': {
      // Ensure proper question format
      if (!paraphrased.toLowerCase().startsWith('how')) {
        paraphrased = `How might we ${paraphrased.toLowerCase()}`;
      }
      if (!paraphrased.endsWith('?')) {
        paraphrased += '?';
      }
      break;
    }
      
    case 'challenge': {
      // Ensure action-oriented language
      paraphrased = paraphrased.charAt(0).toUpperCase() + paraphrased.slice(1);
      // Add action verbs if missing
      const actionVerbs = ['design', 'create', 'build', 'develop', 'implement', 'construct'];
      const hasActionVerb = actionVerbs.some(verb => 
        paraphrased.toLowerCase().startsWith(verb)
      );
      if (!hasActionVerb && !paraphrased.toLowerCase().startsWith('a ')) {
        paraphrased = `Design ${paraphrased.toLowerCase()}`;
      }
      break;
    }
      
    default:
      paraphrased = paraphrased.charAt(0).toUpperCase() + paraphrased.slice(1);
  }

  return paraphrased;
};

/**
 * Gets help suggestions for a specific ideation component
 * @param {string} type - The type of help needed (bigIdea, essentialQuestion, challenge)
 * @returns {Array} - Array of suggestion strings
 */
export const getHelpSuggestions = (type) => {
  return ideationPrompts.helpSuggestions[type] || [];
};

export default paraphraseIdea;