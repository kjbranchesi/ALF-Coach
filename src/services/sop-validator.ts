// SOP Validator - Ensures AI responses comply with the 10-step SOP structure
// Validates content requirements and provides correction suggestions

import { ChatStage } from './chat-service';
import { SOPRequirement } from './ai-conversation-manager';

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
  score: number; // 0-100
}

export interface StepRequirements {
  stage: string;
  step: string;
  requirements: SOPRequirement[];
}

export class SOPValidator {
  private stageRequirements: Record<string, Record<string, SOPRequirement[]>> = {
    IDEATION: {
      'IDEATION_BIG_IDEA': [
        { type: 'include', value: 'transferable concept', priority: 'must' },
        { type: 'include', value: 'real-world', priority: 'should' },
        { type: 'include', value: 'connect', priority: 'should' },
        { type: 'tone', value: 'inspiring', priority: 'must' },
        { type: 'length', value: '150-300', priority: 'should' }
      ],
      'IDEATION_EQ': [
        { type: 'include', value: 'question', priority: 'must' },
        { type: 'include', value: 'investigation', priority: 'should' },
        { type: 'include', value: 'open-ended', priority: 'must' },
        { type: 'structure', value: 'question format', priority: 'must' },
        { type: 'tone', value: 'thought-provoking', priority: 'should' }
      ],
      'IDEATION_CHALLENGE': [
        { type: 'include', value: 'authentic', priority: 'must' },
        { type: 'include', value: 'real-world impact', priority: 'must' },
        { type: 'include', value: 'student action', priority: 'must' },
        { type: 'include', value: 'community', priority: 'should' },
        { type: 'tone', value: 'action-oriented', priority: 'must' }
      ]
    },
    JOURNEY: {
      'JOURNEY_PHASES': [
        { type: 'include', value: 'progression', priority: 'must' },
        { type: 'include', value: 'phases', priority: 'must' },
        { type: 'include', value: 'build', priority: 'should' },
        { type: 'structure', value: 'sequential', priority: 'must' },
        { type: 'tone', value: 'organized', priority: 'should' }
      ],
      'JOURNEY_ACTIVITIES': [
        { type: 'include', value: 'hands-on', priority: 'must' },
        { type: 'include', value: 'age-appropriate', priority: 'must' },
        { type: 'include', value: 'collaborative', priority: 'should' },
        { type: 'include', value: 'engaging', priority: 'must' },
        { type: 'tone', value: 'dynamic', priority: 'should' }
      ],
      'JOURNEY_RESOURCES': [
        { type: 'include', value: 'materials', priority: 'must' },
        { type: 'include', value: 'support', priority: 'should' },
        { type: 'include', value: 'accessible', priority: 'must' },
        { type: 'include', value: 'tools', priority: 'should' },
        { type: 'structure', value: 'list-friendly', priority: 'nice' }
      ]
    },
    DELIVERABLES: {
      'DELIVER_MILESTONES': [
        { type: 'include', value: 'checkpoint', priority: 'must' },
        { type: 'include', value: 'progress', priority: 'must' },
        { type: 'include', value: 'measurable', priority: 'should' },
        { type: 'include', value: 'celebrate', priority: 'should' },
        { type: 'structure', value: 'timeline', priority: 'should' }
      ],
      'DELIVER_RUBRIC': [
        { type: 'include', value: 'criteria', priority: 'must' },
        { type: 'include', value: 'student-friendly', priority: 'must' },
        { type: 'include', value: 'growth', priority: 'should' },
        { type: 'include', value: 'clear', priority: 'must' },
        { type: 'structure', value: 'categories', priority: 'must' }
      ],
      'DELIVER_IMPACT': [
        { type: 'include', value: 'audience', priority: 'must' },
        { type: 'include', value: 'authentic', priority: 'must' },
        { type: 'include', value: 'sharing', priority: 'must' },
        { type: 'include', value: 'celebration', priority: 'should' },
        { type: 'include', value: 'community', priority: 'should' }
      ]
    }
  };

  // Stage-level requirements for stage_init messages
  private stageInitRequirements: Record<ChatStage, SOPRequirement[]> = {
    IDEATION: [
      { type: 'include', value: 'three', priority: 'must' },
      { type: 'include', value: 'Big Idea', priority: 'must' },
      { type: 'include', value: 'Essential Question', priority: 'must' },
      { type: 'include', value: 'Challenge', priority: 'must' },
      { type: 'tone', value: 'welcoming', priority: 'must' }
    ],
    JOURNEY: [
      { type: 'include', value: 'three', priority: 'must' },
      { type: 'include', value: 'Phases', priority: 'must' },
      { type: 'include', value: 'Activities', priority: 'must' },
      { type: 'include', value: 'Resources', priority: 'must' },
      { type: 'tone', value: 'building', priority: 'should' }
    ],
    DELIVERABLES: [
      { type: 'include', value: 'three', priority: 'must' },
      { type: 'include', value: 'Milestones', priority: 'must' },
      { type: 'include', value: 'Rubric', priority: 'must' },
      { type: 'include', value: 'Impact', priority: 'must' },
      { type: 'tone', value: 'culminating', priority: 'should' }
    ]
  };

  getStageRequirements(stage: ChatStage): SOPRequirement[] {
    return this.stageInitRequirements[stage] || [];
  }

  getStepRequirements(stage: string, stepId: string): SOPRequirement[] {
    const stageReqs = this.stageRequirements[stage];
    return stageReqs?.[stepId] || [];
  }

  validateResponse(response: string, stage: string, step?: string, action?: string): ValidationResult {
    let requirements: SOPRequirement[] = [];
    
    // Get appropriate requirements based on context
    if (action === 'stage_init' && stage) {
      requirements = this.getStageRequirements(stage as ChatStage);
    } else if (step) {
      requirements = this.getStepRequirements(stage, step);
    }
    
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;
    
    requirements.forEach(req => {
      const checkResult = this.checkRequirement(response, req);
      
      if (!checkResult.passed) {
        if (req.priority === 'must') {
          issues.push(`Missing required element: ${req.value}`);
          score -= 20;
        } else if (req.priority === 'should') {
          suggestions.push(`Consider including: ${req.value}`);
          score -= 10;
        } else {
          suggestions.push(`Nice to have: ${req.value}`);
          score -= 5;
        }
        
        if (checkResult.suggestion) {
          suggestions.push(checkResult.suggestion);
        }
      }
    });
    
    // Additional validation checks
    if (response.length < 50) {
      issues.push('Response is too short');
      score -= 30;
    }
    
    if (!response.includes('**') && !response.includes('#')) {
      suggestions.push('Add markdown formatting for better readability');
      score -= 5;
    }
    
    // Ensure score doesn't go below 0
    score = Math.max(0, score);
    
    return {
      isValid: issues.length === 0,
      issues,
      suggestions,
      score
    };
  }

  private checkRequirement(response: string, req: SOPRequirement): { passed: boolean; suggestion?: string } {
    const lowerResponse = response.toLowerCase();
    
    switch (req.type) {
      case 'include':
        const passed = lowerResponse.includes(req.value.toLowerCase());
        return {
          passed,
          suggestion: !passed ? `Make sure to mention "${req.value}" in your response` : undefined
        };
        
      case 'tone':
        // Simplified tone check - in production, use sentiment analysis
        const toneKeywords: Record<string, string[]> = {
          'inspiring': ['exciting', 'transform', 'powerful', 'amazing', 'great'],
          'welcoming': ['welcome', 'glad', 'excited', 'ready', 'let\'s'],
          'encouraging': ['you can', 'great', 'excellent', 'wonderful', 'fantastic'],
          'thought-provoking': ['consider', 'think', 'explore', 'wonder', 'imagine'],
          'action-oriented': ['create', 'build', 'design', 'develop', 'make'],
          'organized': ['first', 'next', 'then', 'finally', 'structure'],
          'dynamic': ['active', 'engaging', 'interactive', 'hands-on', 'exciting']
        };
        
        const keywords = toneKeywords[req.value] || [];
        const hasTone = keywords.some(keyword => lowerResponse.includes(keyword));
        
        return {
          passed: hasTone,
          suggestion: !hasTone ? `Adjust tone to be more ${req.value}` : undefined
        };
        
      case 'structure':
        if (req.value === 'question format') {
          return {
            passed: response.includes('?'),
            suggestion: 'Include questions to engage the user'
          };
        }
        if (req.value === 'sequential') {
          const hasSequence = /\b(first|then|next|finally|phase|step)\b/i.test(response);
          return {
            passed: hasSequence,
            suggestion: 'Use sequential language to show progression'
          };
        }
        if (req.value === 'list-friendly') {
          const hasList = response.includes('•') || response.includes('-') || response.includes('1.');
          return {
            passed: hasList,
            suggestion: 'Consider using bullet points or numbered lists'
          };
        }
        return { passed: true };
        
      case 'length':
        const words = response.split(/\s+/).length;
        const [min, max] = req.value.split('-').map(Number);
        const inRange = words >= min && words <= max;
        
        return {
          passed: inRange,
          suggestion: !inRange ? `Aim for ${min}-${max} words (currently ${words})` : undefined
        };
        
      default:
        return { passed: true };
    }
  }

  // Check if action should be allowed based on current state
  enforceProgressionRules(currentStage: string, currentStep: number, proposedAction: string): {
    allowed: boolean;
    reason?: string;
  } {
    // Define valid progressions
    const validProgressions: Record<string, string[]> = {
      'welcome': ['start'],
      'stage_init': ['start', 'tellmore'],
      'step_entry': ['text', 'ideas', 'whatif', 'help'],
      'step_confirm': ['continue', 'refine', 'help'],
      'stage_clarify': ['proceed', 'edit'],
      'complete': ['review', 'export']
    };
    
    // Add validation logic here
    return { allowed: true };
  }

  // Generate correction suggestions for AI
  generateCorrections(response: string, validation: ValidationResult): string {
    if (validation.isValid) return response;
    
    let corrections = `Please revise the response to address these issues:\n`;
    
    validation.issues.forEach(issue => {
      corrections += `- ${issue}\n`;
    });
    
    if (validation.suggestions.length > 0) {
      corrections += `\nSuggestions for improvement:\n`;
      validation.suggestions.forEach(suggestion => {
        corrections += `- ${suggestion}\n`;
      });
    }
    
    return corrections;
  }

  // Get template for specific step to guide AI
  getStepTemplate(stage: string, stepId: string): string {
    const templates: Record<string, string> = {
      'IDEATION_BIG_IDEA': 'Ask about a transferable concept that connects to real-world experiences',
      'IDEATION_EQ': 'Request an open-ended question that drives investigation',
      'IDEATION_CHALLENGE': 'Seek an authentic challenge with real-world impact',
      'JOURNEY_PHASES': 'Inquire about the progression of learning phases',
      'JOURNEY_ACTIVITIES': 'Ask for hands-on, age-appropriate activities',
      'JOURNEY_RESOURCES': 'Request materials and tools needed',
      'DELIVER_MILESTONES': 'Ask about checkpoints and progress markers',
      'DELIVER_RUBRIC': 'Seek student-friendly success criteria',
      'DELIVER_IMPACT': 'Inquire about authentic audience and sharing'
    };
    
    return templates[stepId] || 'Guide the user through this step';
  }
}

// Factory function
export function createSOPValidator(): SOPValidator {
  return new SOPValidator();
}