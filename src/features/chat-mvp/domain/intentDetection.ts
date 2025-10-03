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
  | 'cancel_flow'        // NEW: Escape hatch for micro-flows
  | 'substantive_input'; // Default - proceed to validation

export interface IntentDetectionResult {
  intent: UserIntent;
  confidence: number; // 0-1
  extractedValue?: string; // For modifications like "that but 3 weeks"
  lastSuggestionIndex?: number; // Which suggestion they're referring to
}

// Affirmative patterns - MUST be specific to avoid false positives
const ACCEPT_PATTERNS = [
  // Simple short affirmatives (must be alone or with minimal words)
  /^(yes|yep|yeah|yup|sure)$/i,

  // OK/Okay ONLY if followed by nothing, confirmation, or period
  /^(ok|okay)(\s+(that'?s?|looks?|sounds?)\s+(good|great|perfect|fine))?[.!]?$/i,

  // Enthusiastic acceptance (must be standalone)
  /^(love it|perfect|great|excellent|sounds good|looks good|that works|that'?s good)!?$/i,

  // Explicit "use" language
  /^(let'?s\s+(use|go with)|i'?ll\s+(use|take|go with)|we can use)\s+(that|this|it|the\s+(first|second|third|one))/i,
  /^(use|take|accept)\s+(that|this|it|the\s+(first|second|third|one))/i,
  /^(go with|going with)\s+(that|this|it|the\s+(first|second|third))/i,

  // Confirmation with reference
  /^(i like|i love)\s+(that|this|it|the\s+(first|second|third))\s*(one|suggestion)?$/i
];

// Negative patterns - things that LOOK like acceptance but aren't
const NOT_ACCEPT_PATTERNS = [
  /\b(how|what|why|when|where|which)\b/i,  // Question words
  /\b(can you|could you|would you|will you|should you)\b/i,  // Requests for AI action
  /\b(help|assist|guide|show|tell|explain|suggest|idea|ideas|thought|thoughts)\b/i,  // Help requests
  /\?/,  // Contains question mark
  /\b(but|however|except|instead|actually|though)\b/i,  // Contradictions
  /\b(not sure|don'?t know|unsure|confused|stuck|lost)\b/i,  // Uncertainty
];

// Request for alternatives
const ALTERNATIVES_PATTERNS = [
  /^(other|more|different|another|alternative|else)/i,
  /^(can (i|we|you) (see|get|have)) (other|more|different|another)/i,
  /^(what (about|if)|how about|try) (something|anything) (else|different)/i,
  /^(show me|give me|suggest) (more|other|different|new)/i,
  /^(not (sure|quite|really)|maybe something (else|different))/i
];

// Confusion / clarification / help request
const CLARIFICATION_PATTERNS = [
  /^(what|huh|wait|hold on|i don't|not sure what|what do you mean|can you (clarify|explain))/i,
  /^\?+$/,
  /^(help|stuck|lost|confused)/i,
  /\b(any (ideas?|suggestions?|thoughts?|examples?))\b/i,
  /\b(can you (help|assist|guide|suggest|show|give me))\b/i,
  /\b(how (do|can|should) (i|we))\b/i,
  /\b(what (do|can|should) (i|we))\b/i,
  /\b(need (help|guidance|ideas?|suggestions?))\b/i,
];

// Modification patterns
const MODIFY_PATTERNS = [
  /(but|except|however|instead|actually|change|adjust|modify)/i,
  /make it/i,
  /(shorter|longer|simpler|more complex|different)/i
];

// Cancel/escape patterns - NEW
const CANCEL_PATTERNS = [
  /^(cancel|stop|nevermind|never mind|forget it|skip this)$/i,
  /^(go back|start over|let me try again)$/i,
  /^(i (want to|need to) (start over|try something else))$/i,
  /^(this isn'?t working|let'?s try something else)$/i
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
  if (!ordinalMatch) {return null;}

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

  // FIRST: Check for cancel/escape intent - highest priority
  for (const pattern of CANCEL_PATTERNS) {
    if (pattern.test(text)) {
      return {
        intent: 'cancel_flow',
        confidence: 0.95
      };
    }
  }

  // SECOND: Check negative patterns - these override everything else
  for (const pattern of NOT_ACCEPT_PATTERNS) {
    if (pattern.test(text)) {
      // This is NOT an acceptance - continue with other intent checks
      break;
    }
  }

  // Very short affirmatives (1-3 words) - but only if not negative
  const isNegative = NOT_ACCEPT_PATTERNS.some(pattern => pattern.test(text));

  if (!isNegative && text.split(/\s+/).length <= 3) {
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
  // But NOT if it's a negative pattern
  if (!isNegative) {
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
 * Extract actual content from conversational wrappers
 * Handles patterns like "what about [content]", "how about [content]", "I think [content]"
 * Returns extracted content or original input if no wrapper detected
 */
export function extractFromConversationalWrapper(input: string): string {
  const text = input.trim();

  // Patterns for conversational wrappers with capturing groups
  const wrapperPatterns = [
    // "what about X" / "what about something like X"
    /^what\s+about\s+(?:something\s+like\s+)?(.+)$/i,

    // "how about X" / "how about something like X"
    /^how\s+about\s+(?:something\s+like\s+)?(.+)$/i,

    // "maybe X" / "maybe something like X"
    /^maybe\s+(?:something\s+like\s+)?(.+)$/i,

    // "I think X" / "I was thinking X"
    /^i\s+(?:think|was\s+thinking)\s+(.+)$/i,

    // "could it be X" / "could we do X"
    /^could\s+(?:it\s+be|we\s+(?:do|use|try))\s+(.+)$/i,

    // "could we just X" / "could we adjust to X"
    /^could\s+we\s+(?:just\s+)?(.+)$/i,

    // "what if X" / "what if we X"
    /^what\s+if\s+(?:we\s+)?(.+)$/i,

    // "let's try X" / "let's use X"
    /^let'?s\s+(?:try|use|do|go with)\s+(.+)$/i,

    // "something like X" (standalone)
    /^something\s+like\s+(.+)$/i,

    // "instead" wrappers: "instead, we X"
    /^(?:but\s+)?instead[,\s]+(.+)$/i,

    // "maybe we" / "maybe let's" wrappers
    /^maybe\s+we\s+(.+)$/i,
    /^maybe\s+let'?s\s+(.+)$/i,
  ];

  for (const pattern of wrapperPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const extracted = match[1].trim();
      // Only return if extracted content is meaningful (not too short)
      if (extracted.length > 5) {
        return extracted;
      }
    }
  }

  // No wrapper detected - return original
  return text;
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
