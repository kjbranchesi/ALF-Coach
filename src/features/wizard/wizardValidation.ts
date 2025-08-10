/**
 * wizardValidation.ts - Friendly validation service for Wizard V2
 * Provides helpful, encouraging feedback instead of harsh errors
 */

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  suggestion?: string;
  helpLink?: string;
  severity?: 'error' | 'warning' | 'info';
}

export interface FieldValidation {
  field: string;
  value: any;
  rules: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  suggestion?: string;
}

export class WizardValidator {
  private static instance: WizardValidator;

  private constructor() {}

  public static getInstance(): WizardValidator {
    if (!WizardValidator.instance) {
      WizardValidator.instance = new WizardValidator();
    }
    return WizardValidator.instance;
  }

  /**
   * Validate a single field with friendly messaging
   */
  public validateField(field: string, value: any, step?: string): ValidationResult {
    switch (field) {
      case 'vision':
        return this.validateVision(value);
      
      case 'subject':
        return this.validateSubject(value);
      
      case 'timeline':
      case 'duration':
        return this.validateTimeline(value);
      
      case 'gradeLevel':
        return this.validateGradeLevel(value);
      
      case 'customStudents':
        return this.validateCustomStudents(value);
      
      default:
        return { isValid: true };
    }
  }

  private validateVision(value: string): ValidationResult {
    if (!value || value.trim().length === 0) {
      return {
        isValid: false,
        message: "Let's start with your vision",
        suggestion: "Share what you hope students will learn or achieve",
        severity: 'info'
      };
    }

    if (value.trim().length < 20) {
      const remaining = 20 - value.trim().length;
      return {
        isValid: false,
        message: `Just ${remaining} more character${remaining === 1 ? '' : 's'} to go!`,
        suggestion: "Add a bit more detail about your learning goals",
        severity: 'info'
      };
    }

    if (value.trim().length > 500) {
      return {
        isValid: false,
        message: "That's a great vision, but let's keep it concise",
        suggestion: "Try to summarize in under 500 characters",
        severity: 'warning'
      };
    }

    // Check for quality indicators
    const hasActionVerb = /\b(learn|develop|create|understand|explore|build|design|solve|discover|analyze)\b/i.test(value);
    const hasOutcome = /\b(skill|knowledge|ability|understanding|project|solution|presentation|portfolio)\b/i.test(value);

    if (!hasActionVerb && value.length > 50) {
      return {
        isValid: true,
        message: "Good start!",
        suggestion: "Consider adding an action verb like 'develop', 'create', or 'explore'",
        severity: 'info'
      };
    }

    if (!hasOutcome && value.length > 50) {
      return {
        isValid: true,
        message: "Nice vision!",
        suggestion: "You might want to specify what students will produce or gain",
        severity: 'info'
      };
    }

    return {
      isValid: true,
      message: "Excellent vision!",
      severity: 'info'
    };
  }

  private validateSubject(value: string): ValidationResult {
    if (!value || value.trim().length === 0) {
      return {
        isValid: false,
        message: "What subject area will you explore?",
        suggestion: "Enter your main subject or combine multiple (e.g., 'Math & Art')",
        severity: 'info'
      };
    }

    if (value.trim().length < 3) {
      return {
        isValid: false,
        message: "Please provide a subject area",
        suggestion: "Try something like 'Science', 'Environmental Studies', or 'Digital Arts'",
        severity: 'info'
      };
    }

    // Check for STEAM combination
    const hasMultiple = value.includes('&') || value.includes('and') || value.includes(',');
    if (hasMultiple) {
      return {
        isValid: true,
        message: "Great STEAM combination!",
        suggestion: "Cross-curricular projects often lead to deeper learning",
        severity: 'info'
      };
    }

    return {
      isValid: true,
      message: "Perfect!",
      severity: 'info'
    };
  }

  private validateTimeline(value: string): ValidationResult {
    if (!value) {
      return {
        isValid: false,
        message: "How much time do you have?",
        suggestion: "Select a duration that fits your calendar",
        severity: 'info'
      };
    }

    const validDurations = ['short', 'medium', 'long', '2-3 weeks', '4-8 weeks', 'semester'];
    if (!validDurations.some(d => value.toLowerCase().includes(d.toLowerCase()))) {
      return {
        isValid: false,
        message: "Please select a project duration",
        suggestion: "Choose from Sprint (2-3 weeks), Deep Dive (4-8 weeks), or Semester",
        severity: 'info'
      };
    }

    return {
      isValid: true,
      message: "Timeline set!",
      severity: 'info'
    };
  }

  private validateGradeLevel(value: string): ValidationResult {
    if (!value || value.trim().length === 0) {
      return {
        isValid: false,
        message: "Tell us about your students",
        suggestion: "Select a grade level or use 'Custom Description'",
        severity: 'info'
      };
    }

    return {
      isValid: true,
      message: "Got it!",
      severity: 'info'
    };
  }

  private validateCustomStudents(value: string): ValidationResult {
    if (!value || value.trim().length === 0) {
      return {
        isValid: true, // Optional field
      };
    }

    if (value.trim().length < 10) {
      return {
        isValid: false,
        message: "Tell us a bit more",
        suggestion: "Include age range, skill level, or special characteristics",
        severity: 'info'
      };
    }

    return {
      isValid: true,
      message: "Thanks for the details!",
      severity: 'info'
    };
  }

  /**
   * Validate entire step
   */
  public validateStep(step: string, data: any): ValidationResult {
    switch (step) {
      case 'vision':
        const visionResult = this.validateVision(data.vision);
        const toolsResult = data.tools ? this.validateTools(data.tools) : { isValid: true };
        
        if (!visionResult.isValid) return visionResult;
        if (!toolsResult.isValid) return toolsResult;
        
        return {
          isValid: true,
          message: "Vision complete! Let's move forward"
        };

      case 'subjectScope':
        const subjectResult = this.validateSubject(data.subject);
        const timelineResult = this.validateTimeline(data.duration || data.timeline);
        
        if (!subjectResult.isValid) return subjectResult;
        if (!timelineResult.isValid) return timelineResult;
        
        return {
          isValid: true,
          message: "Subject and timeline ready! 📚"
        };

      case 'students':
        if (!data.gradeLevel && !data.customStudents) {
          return {
            isValid: false,
            message: "Help us understand your learners",
            suggestion: "Select a grade level or describe your student group",
            severity: 'info'
          };
        }
        
        return {
          isValid: true,
          message: "Student profile complete! 🎓"
        };

      default:
        return { isValid: true };
    }
  }

  private validateTools(value: string): ValidationResult {
    // Tools are optional but if provided, should be meaningful
    if (value.trim().length > 0 && value.trim().length < 5) {
      return {
        isValid: false,
        message: "Tell us more about your resources",
        suggestion: "List specific tools like '3D printer' or constraints like 'limited budget'",
        severity: 'info'
      };
    }

    return { isValid: true };
  }

  /**
   * Get encouraging message for partial completion
   */
  public getEncouragementMessage(completionPercentage: number): string {
    if (completionPercentage < 25) {
      return "Great start! Every journey begins with a single step 🌱";
    } else if (completionPercentage < 50) {
      return "You're making excellent progress!";
    } else if (completionPercentage < 75) {
      return "Halfway there! Your blueprint is taking shape 🏗️";
    } else if (completionPercentage < 100) {
      return "Almost done! Just a few more details";
    } else {
      return "Perfect! Your blueprint is ready to come to life!";
    }
  }

  /**
   * Get contextual help based on field
   */
  public getFieldHelp(field: string): string {
    const helpTexts: Record<string, string> = {
      vision: "Your vision drives the entire project. Think about what success looks like for your students.",
      subject: "Choose your main subject area or combine multiple for interdisciplinary learning.",
      timeline: "Consider your academic calendar, testing schedules, and student attention spans.",
      gradeLevel: "This helps us tailor content complexity and engagement strategies.",
      tools: "We'll adapt activities based on your available resources and constraints.",
      customStudents: "Share any special considerations like ELL support, gifted programs, or IEPs."
    };

    return helpTexts[field] || "This information helps us personalize your blueprint.";
  }
}

// Export singleton instance
export const wizardValidator = WizardValidator.getInstance();