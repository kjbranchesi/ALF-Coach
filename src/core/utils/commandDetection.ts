/**
 * commandDetection.ts - Utilities for detecting commands vs data input
 */

export interface CommandDetectionResult {
  isCommand: boolean;
  command?: string;
  originalInput: string;
}

/**
 * List of recognized commands and their variations
 */
const COMMAND_PATTERNS = {
  help: ['help', 'help me', 'i need help', 'assist', 'assistance', '?'],
  ideas: ['ideas', 'give me ideas', 'suggest', 'suggestions', 'examples'],
  whatif: ['whatif', 'what if', 'what-if', 'alternatives', 'other options'],
  continue: ['continue', 'next', 'proceed', 'move on', 'ready'],
  refine: ['refine', 'edit', 'change', 'modify', 'update'],
  back: ['back', 'previous', 'go back', 'undo']
};

/**
 * Detect if user input is a command or actual data
 */
export function detectCommand(input: string): CommandDetectionResult {
  const normalizedInput = input.trim().toLowerCase();
  
  // Check for exact matches first
  for (const [command, patterns] of Object.entries(COMMAND_PATTERNS)) {
    if (patterns.includes(normalizedInput)) {
      return {
        isCommand: true,
        command,
        originalInput: input
      };
    }
  }
  
  // Check for pattern matches (e.g., "can you help me?" -> help)
  for (const [command, patterns] of Object.entries(COMMAND_PATTERNS)) {
    for (const pattern of patterns) {
      if (normalizedInput.includes(pattern) && normalizedInput.length < 20) {
        // Short phrases containing command words are likely commands
        return {
          isCommand: true,
          command,
          originalInput: input
        };
      }
    }
  }
  
  // Special case: single word inputs that might be commands
  if (normalizedInput.split(' ').length === 1 && normalizedInput.length < 10) {
    // Check if it's close to a command (typo detection)
    const possibleCommand = findClosestCommand(normalizedInput);
    if (possibleCommand) {
      return {
        isCommand: true,
        command: possibleCommand,
        originalInput: input
      };
    }
  }
  
  return {
    isCommand: false,
    originalInput: input
  };
}

/**
 * Find closest command match for typo detection
 */
function findClosestCommand(input: string): string | null {
  const threshold = 2; // Maximum edit distance
  
  for (const [command, patterns] of Object.entries(COMMAND_PATTERNS)) {
    for (const pattern of patterns) {
      if (levenshteinDistance(input, pattern) <= threshold) {
        return command;
      }
    }
  }
  
  return null;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  
  for (let i = 0; i <= a.length; i++) {
    matrix[0][i] = i;
  }
  
  for (let j = 0; j <= b.length; j++) {
    matrix[j][0] = j;
  }
  
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[j][i] = matrix[j - 1][i - 1];
      } else {
        matrix[j][i] = Math.min(
          matrix[j - 1][i] + 1,
          matrix[j][i - 1] + 1,
          matrix[j - 1][i - 1] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

/**
 * Check if input looks like it might be data (not a command)
 */
export function looksLikeData(input: string): boolean {
  const normalized = input.trim();
  
  // Longer inputs are more likely to be data
  if (normalized.length > 30) {return true;}
  
  // Multiple sentences are likely data
  if (normalized.split(/[.!?]/).length > 2) {return true;}
  
  // Contains specific data patterns
  const dataPatterns = [
    /\d{2,}/, // Contains numbers
    /[A-Z][a-z]+\s+[A-Z][a-z]+/, // Proper names
    /@/, // Email addresses
    /https?:\/\//, // URLs
  ];
  
  return dataPatterns.some(pattern => pattern.test(normalized));
}