/**
 * Intent Detection System
 * Catches conversational/meta inputs before validation to prevent chat freeze
 */

export type UserIntent =
  | 'accept_suggestion'
  | 'request_alternatives'
  | 'provide_custom'
  | 'request_clarification'
  | 'modify_previous'
  | 'show_progress'
  | 'skip_stage'
  | 'go_back'
  | 'substantive_input'; // Default - proceed to validation

export interface IntentDetectionResult {
  intent: UserIntent;
  confidence: number; // 0-1
  extractedValue?: string; // For modifications like "that but 3 weeks"
  lastSuggestionIndex?: number; // Which suggestion they're referring to
}

// Affirmative patterns
const ACCEPT_PATTERNS = [
  /^(yes|yep|yeah|yup|sure|ok|okay|sounds good|looks good|perfect|great|love it|i like (it|that|this)|let's (use|go with) (it|that|this)|that works|that's good)/i,
  /^(use (that|this|the (first|second|third|last) (one|suggestion)))/i,
  /^(go with|i'll (use|take|go with)) (that|this|it|the (first|second|third))/i,
  /^(accept|approved|confirm)/i
];

// Request for alternatives
const ALTERNATIVES_PATTERNS = [
  /^(other|more|different|another|alternative|else)/i,
  /^(can (i|we|you) (see|get|have)) (other|more|different|another)/i,
  /^(what (about|if)|how about|try) (something|anything) (else|different)/i,
  /^(show me|give me|suggest) (more|other|different|new)/i,
  /^(not (sure|quite|really)|maybe something (else|different))/i
];

// Confusion / clarification request
const CLARIFICATION_PATTERNS = [
  /^(what|huh|wait|hold on|i don't|not sure what|what do you mean|can you (clarify|explain))/i,
  /^\?+$/,
  /^(help|stuck|lost|confused)/i
];

// Modification patterns
const MODIFY_PATTERNS = [
  /(but|except|however|instead|actually|change|adjust|modify)/i,
  /make it/i,
  /(shorter|longer|simpler|more complex|different)/i
];

// Navigation patterns
const SHOW_PROGRESS_PATTERNS = [
  /^(show|what|where|display) (me )?(what|where|my|the) (i have|we have|i've|we've|progress|work|captured|saved)/i,
  /^(what have|what've) (i|we) (done|captured|entered|saved)/i
];

const SKIP_PATTERNS = [
  /^(skip|pass|move on|next|come back later|i'll do (this|that) later)/i
];

const GO_BACK_PATTERNS = [
  /^(go back|undo|previous|revert|change (the )?(last|previous))/i
];

// Ordinal reference detection
function extractOrdinalReference(text: string): number | null {
  const ordinalMatch = text.match(/(first|second|third|1st|2nd|3rd|last|one|two|three)/i);
  if (!ordinalMatch) return null;

  const ordinal = ordinalMatch[1].toLowerCase();
  switch (ordinal) {
    case 'first':
    case '1st':
    case 'one':
      return 0;
    case 'second':
    case '2nd':
    case 'two':
      return 1;
    case 'third':
    case '3rd':
    case 'three':
      return 2;
    case 'last':
      return -1; // Special case, caller needs to resolve to actual index
    default:
      return null;
  }
}

/**
 * Detect user intent from their input BEFORE running validation
 * This prevents the chat from freezing on conversational replies
 */
export function detectIntent(
  userInput: string,
  recentSuggestions: string[] = [],
  conversationHistory: string[] = []
): IntentDetectionResult {
  const text = userInput.trim();

  // Empty input
  if (!text) {
    return {
      intent: 'substantive_input',
      confidence: 0
    };
  }

  // Very short affirmatives (1-3 words)
  if (text.split(/\s+/).length <= 3) {
    // Check accept patterns
    for (const pattern of ACCEPT_PATTERNS) {
      if (pattern.test(text)) {
        const ordinalIndex = extractOrdinalReference(text);
        return {
          intent: 'accept_suggestion',
          confidence: 0.95,
          lastSuggestionIndex: ordinalIndex !== null ? ordinalIndex : 0 // Default to first
        };
      }
    }
  }

  // Accept with ordinal reference ("use the first one", "I like the second suggestion")
  for (const pattern of ACCEPT_PATTERNS) {
    if (pattern.test(text)) {
      const ordinalIndex = extractOrdinalReference(text);
      return {
        intent: 'accept_suggestion',
        confidence: 0.9,
        lastSuggestionIndex: ordinalIndex !== null ? ordinalIndex : 0
      };
    }
  }

  // Request for alternatives
  for (const pattern of ALTERNATIVES_PATTERNS) {
    if (pattern.test(text)) {
      return {
        intent: 'request_alternatives',
        confidence: 0.9
      };
    }
  }

  // Clarification request
  for (const pattern of CLARIFICATION_PATTERNS) {
    if (pattern.test(text)) {
      return {
        intent: 'request_clarification',
        confidence: 0.95
      };
    }
  }

  // Show progress
  for (const pattern of SHOW_PROGRESS_PATTERNS) {
    if (pattern.test(text)) {
      return {
        intent: 'show_progress',
        confidence: 0.9
      };
    }
  }

  // Skip stage
  for (const pattern of SKIP_PATTERNS) {
    if (pattern.test(text)) {
      return {
        intent: 'skip_stage',
        confidence: 0.85
      };
    }
  }

  // Go back
  for (const pattern of GO_BACK_PATTERNS) {
    if (pattern.test(text)) {
      return {
        intent: 'go_back',
        confidence: 0.9
      };
    }
  }

  // Modification patterns ("that but make it 3 weeks", "like the first one but shorter")
  let hasModificationIntent = false;
  let extractedModification = text;

  for (const pattern of MODIFY_PATTERNS) {
    if (pattern.test(text)) {
      hasModificationIntent = true;
      // Try to extract what comes after "but", "except", etc.
      const parts = text.split(/\b(but|except|however|instead)\b/i);
      if (parts.length > 2) {
        extractedModification = parts.slice(2).join('').trim();
      }
      break;
    }
  }

  // Check if they're referencing a previous suggestion
  const hasReferenceToSuggestion = /\b(that|it|this|the (first|second|third|one))\b/i.test(text);

  if (hasModificationIntent && hasReferenceToSuggestion) {
    const ordinalIndex = extractOrdinalReference(text);
    return {
      intent: 'modify_previous',
      confidence: 0.85,
      extractedValue: extractedModification,
      lastSuggestionIndex: ordinalIndex !== null ? ordinalIndex : 0
    };
  }

  // Check if input contains elements from recent suggestions
  // This catches cases like "create an exhibition for visitors" when that was a suggestion
  if (recentSuggestions.length > 0) {
    const inputLower = text.toLowerCase();
    for (let i = 0; i < recentSuggestions.length; i++) {
      const suggestion = recentSuggestions[i].toLowerCase();
      // Check for significant overlap (>60% of suggestion words present in input)
      const suggestionWords = suggestion.split(/\s+/).filter(w => w.length > 3);
      const matchingWords = suggestionWords.filter(word => inputLower.includes(word));
      const overlapRatio = matchingWords.length / suggestionWords.length;

      if (overlapRatio > 0.6) {
        return {
          intent: 'accept_suggestion',
          confidence: 0.75,
          lastSuggestionIndex: i
        };
      }
    }
  }

  // Default: treat as substantive input that should proceed to validation
  return {
    intent: 'substantive_input',
    confidence: 1.0
  };
}

/**
 * Generate immediate acknowledgment for conversational inputs
 * Returns null if input should proceed directly to validation
 */
export function getImmediateAcknowledgment(intent: UserIntent): string | null {
  switch (intent) {
    case 'accept_suggestion':
      return "Got it! Let me confirm that for you...";
    case 'request_alternatives':
      return "Let me generate some fresh ideas...";
    case 'request_clarification':
      return null; // Will be handled by AI
    case 'modify_previous':
      return "I'll adjust that...";
    case 'show_progress':
      return null; // Will show working draft
    case 'skip_stage':
      return "Understood. We can return to this later.";
    case 'go_back':
      return "Let me take you back to that step...";
    case 'substantive_input':
    default:
      return null; // Proceed to normal flow
  }
}
