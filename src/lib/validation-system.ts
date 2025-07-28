// Comprehensive validation system for journey inputs

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  suggestions: string[];
  transformedInput?: string;
}

export interface ValidationIssue {
  type: 'structure' | 'content' | 'clarity' | 'alignment';
  severity: 'error' | 'warning' | 'info';
  message: string;
}

// Stage-specific validators
export const StageValidators = {
  IDEATION_BIG_IDEA: {
    validate(input: string, context: any): ValidationResult {
      const issues: ValidationIssue[] = [];
      const suggestions: string[] = [];
      
      // Check for conceptual depth
      const hasConceptualDepth = /\b(as|through|by|using|with|transformation|connection|impact)\b/i.test(input);
      const wordCount = input.split(' ').filter(w => w.length > 0).length;
      const hasContext = /\b(because|since|as|to|in order to|so that)\b/i.test(input);
      
      // Too short
      if (wordCount < 3) {
        issues.push({
          type: 'structure',
          severity: 'error',
          message: 'Big Ideas need more depth to guide a whole unit.'
        });
        suggestions.push('Try expanding your idea - what transformation are you envisioning?');
      }
      
      // Just a topic, not a concept
      if (!hasConceptualDepth && wordCount < 10) {
        issues.push({
          type: 'content',
          severity: 'warning',
          message: 'This reads more like a topic than a Big Idea.'
        });
        suggestions.push('Consider framing it as "[Topic] as [Conceptual Lens]" - for example: "Technology as a force for social change"');
      }
      
      // Good structure examples
      if (input.match(/^\w+\s+as\s+\w+/i)) {
        // Pattern like "Technology as transformation"
        return { isValid: true, issues: [], suggestions: [] };
      }
      
      return {
        isValid: issues.filter(i => i.severity === 'error').length === 0,
        issues,
        suggestions
      };
    },
    
    transform(input: string, context: any): string {
      // Clean up common patterns
      input = input.trim();
      
      // If it's just a single word or phrase, suggest conceptual framing
      if (!input.includes(' as ') && input.split(' ').length < 5) {
        return input; // Don't transform, let validation guide them
      }
      
      return input;
    }
  },
  
  IDEATION_EQ: {
    validate(input: string, context: any): ValidationResult {
      const issues: ValidationIssue[] = [];
      const suggestions: string[] = [];
      const transformedInput = input;
      
      const isQuestion = input.includes('?');
      const hasQuestionWord = /^(how|what|why|in what ways|to what extent|should|can|will)/i.test(input.trim());
      const isStatement = /^(i am|i like|i think|i want)/i.test(input.trim());
      
      // Not a question at all
      if (!isQuestion && !hasQuestionWord) {
        issues.push({
          type: 'structure',
          severity: 'error',
          message: 'Essential Questions must be... questions!'
        });
        
        // If it's a statement of interest, help transform it
        if (isStatement) {
          const interest = input.replace(/^(i am interested in|i like|i want to explore)/i, '').trim();
          suggestions.push(`Try transforming your interest into a question:`);
          suggestions.push(`• "How might ${interest} shape our community?"`);
          suggestions.push(`• "In what ways does ${interest} connect to larger systems?"`);
          suggestions.push(`• "Why does ${interest} matter in today's world?"`);
        }
      }
      
      // Too simple/closed-ended
      if (isQuestion && (input.toLowerCase().startsWith('is ') || input.toLowerCase().startsWith('are '))) {
        issues.push({
          type: 'content',
          severity: 'warning',
          message: 'This seems like a yes/no question. Essential Questions should be open-ended.'
        });
        suggestions.push('Start with "How," "Why," "In what ways," or "To what extent" for deeper inquiry.');
      }
      
      // Check alignment with Big Idea
      if (context.bigIdea && !containsRelatedConcepts(input, context.bigIdea)) {
        issues.push({
          type: 'alignment',
          severity: 'info',
          message: 'Consider how this question connects to your Big Idea.'
        });
      }
      
      return {
        isValid: issues.filter(i => i.severity === 'error').length === 0,
        issues,
        suggestions,
        transformedInput: transformedInput !== input ? transformedInput : undefined
      };
    },
    
    transform(input: string, context: any): string {
      // Add question mark if missing
      if (!input.includes('?') && /^(how|what|why|in what ways)/i.test(input.trim())) {
        return `${input.trim()  }?`;
      }
      return input;
    }
  },
  
  IDEATION_CHALLENGE: {
    validate(input: string, context: any): ValidationResult {
      const issues: ValidationIssue[] = [];
      const suggestions: string[] = [];
      
      const hasActionVerb = /\b(create|design|build|develop|launch|solve|investigate|research|explore)\b/i.test(input);
      const hasAudience = /\b(for|to help|that helps|which helps|community|students|people|audience)\b/i.test(input);
      const isVague = /\b(something|things|stuff|project)\b/i.test(input);
      
      if (!hasActionVerb) {
        issues.push({
          type: 'structure',
          severity: 'error',
          message: 'Challenges should start with an action verb.'
        });
        suggestions.push('Begin with: Create, Design, Build, Develop, Launch, or Investigate');
      }
      
      if (!hasAudience) {
        issues.push({
          type: 'content',
          severity: 'warning',
          message: 'Who is the authentic audience for this challenge?'
        });
        suggestions.push('Specify who will benefit from or use what students create.');
      }
      
      if (isVague) {
        issues.push({
          type: 'clarity',
          severity: 'warning',
          message: 'This challenge could be more specific.'
        });
        suggestions.push('Replace vague terms with concrete outcomes students will produce.');
      }
      
      return {
        isValid: issues.filter(i => i.severity === 'error').length === 0,
        issues,
        suggestions
      };
    },
    
    transform(input: string, context: any): string {
      return input.trim();
    }
  },
  
  JOURNEY_PHASES: {
    validate(input: string, context: any): ValidationResult {
      const issues: ValidationIssue[] = [];
      const suggestions: string[] = [];
      
      // Check if it's a list
      const lines = input.split('\n').filter(line => line.trim());
      const hasMultiplePhases = lines.length >= 3;
      const hasLogicalFlow = /\b(then|next|after|finally|conclude)\b/i.test(input);
      
      if (!hasMultiplePhases) {
        issues.push({
          type: 'structure',
          severity: 'warning',
          message: 'Consider breaking your journey into 3-5 distinct phases.'
        });
        suggestions.push('Think about: Introduction/Hook → Exploration → Creation → Sharing');
      }
      
      // Check for phase names that are too generic
      const genericPhases = lines.filter(line => 
        /^(phase|step|part|section)\s*\d+/i.test(line.trim())
      );
      
      if (genericPhases.length > 0) {
        issues.push({
          type: 'content',
          severity: 'info',
          message: 'Give your phases meaningful names that tell a story.'
        });
        suggestions.push('Example: "Discover" instead of "Phase 1", "Create" instead of "Step 2"');
      }
      
      return {
        isValid: issues.filter(i => i.severity === 'error').length === 0,
        issues,
        suggestions
      };
    },
    
    transform(input: string, context: any): string {
      return input.trim();
    }
  },
  
  JOURNEY_ACTIVITIES: {
    validate(input: string, context: any): ValidationResult {
      const issues: ValidationIssue[] = [];
      const suggestions: string[] = [];
      
      const hasActiveVerbs = /\b(explore|create|analyze|design|interview|research|build|present)\b/i.test(input);
      const hasVariety = input.split('\n').filter(line => line.trim()).length >= 3;
      
      if (!hasActiveVerbs) {
        issues.push({
          type: 'content',
          severity: 'warning',
          message: 'Activities should emphasize action and engagement.'
        });
        suggestions.push('Use active verbs: explore, create, interview, design, analyze');
      }
      
      if (!hasVariety) {
        issues.push({
          type: 'structure',
          severity: 'info',
          message: 'Consider including a variety of activity types.'
        });
        suggestions.push('Mix individual work, collaboration, hands-on creation, and reflection');
      }
      
      return {
        isValid: issues.filter(i => i.severity === 'error').length === 0,
        issues,
        suggestions
      };
    },
    
    transform(input: string, context: any): string {
      return input.trim();
    }
  }
};

// Helper function to check conceptual alignment
function containsRelatedConcepts(text1: string, text2: string): boolean {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  // Check for any meaningful word overlap (not just articles/prepositions)
  const meaningfulWords = words1.filter(w => w.length > 3);
  return meaningfulWords.some(word => words2.includes(word));
}

// Main validation function
export function validateStageInput(
  input: string, 
  stage: string, 
  context: any
): ValidationResult {
  const validator = StageValidators[stage as keyof typeof StageValidators];
  
  if (!validator) {
    return { isValid: true, issues: [], suggestions: [] };
  }
  
  // First transform the input
  const transformed = validator.transform(input, context);
  
  // Then validate
  const result = validator.validate(transformed, context);
  
  // Add transformed input if it changed
  if (transformed !== input) {
    result.transformedInput = transformed;
  }
  
  return result;
}