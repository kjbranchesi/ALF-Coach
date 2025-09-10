/**
 * ContextTracker - Manages context gathering and tracking throughout the conversation
 * Extends existing ContextManager functionality
 */

// Avoid importing full schema
type WizardData = any;
type ConversationPhase = 'wizard' | 'discovery' | 'creation' | 'refinement';
const calculateCompleteness = (data: any) => ({ core: 0, context: 0, progressive: 0 });

export interface ContextField {
  name: string;
  value: any;
  source: 'wizard' | 'chat' | 'inferred';
  confidence: number; // 0-1 confidence score
  timestamp: Date;
}

export interface GatheringPriority {
  field: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  suggestedPrompt?: string;
}

export class ContextTracker {
  private wizardData: Partial<WizardData>;
  private gatheredFields: Map<string, ContextField>;
  private gatheringHistory: Array<{ field: string; timestamp: Date; success: boolean }>;

  constructor(initialData: Partial<WizardData> = {}) {
    this.wizardData = initialData;
    this.gatheredFields = new Map();
    this.gatheringHistory = [];
    
    // Initialize with wizard-provided data
    this.initializeFromWizardData(initialData);
  }

  /**
   * Initialize gathered fields from wizard data
   */
  private initializeFromWizardData(data: Partial<WizardData>): void {
    const wizardFields = [
      'vision', 'drivingQuestion', 'subjects', 'primarySubject', 
      'gradeLevel', 'duration', 'specialRequirements', 
      'pblExperience', 'specialConsiderations'
    ];

    wizardFields.forEach(field => {
      const value = data[field as keyof WizardData];
      if (value !== undefined && value !== null && value !== '') {
        this.gatheredFields.set(field, {
          name: field,
          value,
          source: 'wizard',
          confidence: 1.0, // Wizard data has full confidence
          timestamp: new Date()
        });
      }
    });
  }

  /**
   * Update context with new information from chat
   */
  updateFromChat(field: string, value: any, confidence: number = 0.8): void {
    const existingField = this.gatheredFields.get(field);
    
    // Only update if new confidence is higher or field doesn't exist
    if (!existingField || confidence > existingField.confidence) {
      this.gatheredFields.set(field, {
        name: field,
        value,
        source: 'chat',
        confidence,
        timestamp: new Date()
      });
      
      this.gatheringHistory.push({
        field,
        timestamp: new Date(),
        success: true
      });
      
      // Update wizard data for persistence
      if (this.wizardData.conversationState) {
        if (!this.wizardData.conversationState.gatheredContext) {
          this.wizardData.conversationState.gatheredContext = {};
        }
        this.wizardData.conversationState.gatheredContext[field] = value;
        this.wizardData.conversationState.lastContextUpdate = new Date();
      }
    }
  }

  /**
   * Infer context from user messages
   */
  inferFromMessage(message: string): Array<{ field: string; value: any; confidence: number }> {
    const inferences: Array<{ field: string; value: any; confidence: number }> = [];
    
    // Grade level inference
    const gradePatterns = [
      { pattern: /\b(kindergarten|kinder)\b/i, value: 'k-2', confidence: 0.9 },
      { pattern: /\b(1st|2nd|first|second)\s*grade/i, value: 'k-2', confidence: 0.9 },
      { pattern: /\b(3rd|4th|5th|third|fourth|fifth)\s*grade/i, value: '3-5', confidence: 0.9 },
      { pattern: /\b(6th|7th|8th|sixth|seventh|eighth)\s*grade/i, value: '6-8', confidence: 0.9 },
      { pattern: /\b(9th|10th|11th|12th|ninth|tenth|eleventh|twelfth)\s*grade/i, value: '9-12', confidence: 0.9 },
      { pattern: /\b(high school|highschool)\b/i, value: '9-12', confidence: 0.8 },
      { pattern: /\b(middle school|middleschool)\b/i, value: '6-8', confidence: 0.8 },
      { pattern: /\b(elementary)\b/i, value: '3-5', confidence: 0.7 },
      { pattern: /\b(college|university|undergrad)\b/i, value: 'college', confidence: 0.9 }
    ];
    
    for (const { pattern, value, confidence } of gradePatterns) {
      if (pattern.test(message) && !this.hasField('gradeLevel')) {
        inferences.push({ field: 'gradeLevel', value, confidence });
        break;
      }
    }
    
    // Duration inference
    const durationPatterns = [
      { pattern: /\b(2-3|two|three)\s*weeks?\b/i, value: 'short', confidence: 0.9 },
      { pattern: /\b(month|4-8|four|eight)\s*weeks?\b/i, value: 'medium', confidence: 0.8 },
      { pattern: /\b(semester|term|year)\b/i, value: 'long', confidence: 0.9 },
      { pattern: /\bshort\s*(term|project)\b/i, value: 'short', confidence: 0.7 },
      { pattern: /\blong\s*(term|project)\b/i, value: 'long', confidence: 0.7 }
    ];
    
    for (const { pattern, value, confidence } of durationPatterns) {
      if (pattern.test(message) && !this.hasField('duration')) {
        inferences.push({ field: 'duration', value, confidence });
        break;
      }
    }
    
    // Subject inference
    const subjectPatterns = [
      { pattern: /\b(science|biology|chemistry|physics)\b/i, value: 'Science', confidence: 0.8 },
      { pattern: /\b(math|mathematics|algebra|geometry|calculus)\b/i, value: 'Mathematics', confidence: 0.8 },
      { pattern: /\b(technology|computer|coding|programming|IT)\b/i, value: 'Technology', confidence: 0.8 },
      { pattern: /\b(engineering|robotics|design)\b/i, value: 'Engineering', confidence: 0.8 },
      { pattern: /\b(art|arts|music|theater|drama)\b/i, value: 'Arts', confidence: 0.8 },
      { pattern: /\b(history|geography|social studies|civics)\b/i, value: 'Social Studies', confidence: 0.8 },
      { pattern: /\b(english|language arts|literature|writing)\b/i, value: 'Language Arts', confidence: 0.8 },
      { pattern: /\b(PE|physical education|health|wellness)\b/i, value: 'Health & PE', confidence: 0.8 }
    ];
    
    const detectedSubjects: string[] = [];
    for (const { pattern, value, confidence } of subjectPatterns) {
      if (pattern.test(message)) {
        detectedSubjects.push(value);
        if (!this.hasField('subjects') || (this.getField('subjects')?.value?.length || 0) === 0) {
          inferences.push({ field: 'subjects', value: detectedSubjects, confidence });
        }
      }
    }
    
    // Special considerations inference
    const specialPatterns = [
      { pattern: /\b(ELL|ESL|english learners?)\b/i, key: 'ell', confidence: 0.9 },
      { pattern: /\b(special needs?|IEP|504|accommodations?)\b/i, key: 'special_needs', confidence: 0.9 },
      { pattern: /\b(gifted|advanced|accelerated)\b/i, key: 'gifted', confidence: 0.8 },
      { pattern: /\b(remote|online|virtual|distance)\b/i, key: 'remote', confidence: 0.8 },
      { pattern: /\b(rural|urban|suburban)\b/i, key: 'location_type', confidence: 0.7 }
    ];
    
    const detectedConsiderations: string[] = [];
    for (const { pattern, key, confidence } of specialPatterns) {
      if (pattern.test(message)) {
        detectedConsiderations.push(key);
      }
    }
    
    if (detectedConsiderations.length > 0 && !this.hasField('specialConsiderations')) {
      inferences.push({ 
        field: 'specialConsiderations', 
        value: detectedConsiderations.join(', '), 
        confidence: 0.7 
      });
    }
    
    // Apply inferences
    inferences.forEach(({ field, value, confidence }) => {
      this.updateFromChat(field, value, confidence);
    });
    
    return inferences;
  }

  /**
   * Get missing context fields prioritized by importance
   */
  getMissingContext(): GatheringPriority[] {
    const priorities: GatheringPriority[] = [];
    
    // High priority - Essential for PBL
    if (!this.hasField('gradeLevel')) {
      priorities.push({
        field: 'gradeLevel',
        priority: 'high',
        reason: 'Grade level determines complexity and scaffolding needs',
        suggestedPrompt: 'What grade level are your students?'
      });
    }
    
    if (!this.hasField('duration')) {
      priorities.push({
        field: 'duration',
        priority: 'high',
        reason: 'Duration shapes project scope and milestones',
        suggestedPrompt: 'How long do you have for this project? (2-3 weeks, 4-8 weeks, or a full semester?)'
      });
    }
    
    // Medium priority - Helpful for customization
    if (!this.hasField('subjects') || (this.getField('subjects')?.value?.length || 0) === 0) {
      priorities.push({
        field: 'subjects',
        priority: 'medium',
        reason: 'Subject areas help tailor content and examples',
        suggestedPrompt: 'What subject area(s) will this project cover?'
      });
    }
    
    if (!this.hasField('specialRequirements')) {
      priorities.push({
        field: 'specialRequirements',
        priority: 'medium',
        reason: 'Constraints help avoid suggesting impossible activities',
        suggestedPrompt: 'Are there any specific materials or constraints I should know about?'
      });
    }
    
    // Low priority - Nice to have
    if (!this.hasField('specialConsiderations')) {
      priorities.push({
        field: 'specialConsiderations',
        priority: 'low',
        reason: 'Special considerations enable better differentiation',
        suggestedPrompt: 'Any special considerations for your students? (This is optional)'
      });
    }
    
    return priorities;
  }

  /**
   * Check if a field has been gathered
   */
  hasField(fieldName: string): boolean {
    return this.gatheredFields.has(fieldName) && 
           this.gatheredFields.get(fieldName)!.value !== undefined &&
           this.gatheredFields.get(fieldName)!.value !== '';
  }

  /**
   * Get a specific field
   */
  getField(fieldName: string): ContextField | undefined {
    return this.gatheredFields.get(fieldName);
  }

  /**
   * Get all gathered fields
   */
  getAllFields(): Map<string, ContextField> {
    return new Map(this.gatheredFields);
  }

  /**
   * Get context completeness
   */
  getCompleteness(): { core: number; context: number; progressive: number } {
    return calculateCompleteness(this.wizardData);
  }

  /**
   * Check if we should gather more context
   */
  shouldGatherContext(): boolean {
    const completeness = this.getCompleteness();
    const phase = this.wizardData.conversationState?.phase;
    
    // In context gathering phase and context < 75%
    if (phase === ConversationPhase.CONTEXT_GATHERING && completeness.context < 75) {
      return true;
    }
    
    // In project design but missing critical fields
    if (phase === ConversationPhase.PROJECT_DESIGN) {
      const critical = ['gradeLevel', 'duration'];
      const missingCritical = critical.some(field => !this.hasField(field));
      return missingCritical;
    }
    
    return false;
  }

  /**
   * Generate a natural prompt for gathering missing context
   */
  generateGatheringPrompt(): string | null {
    const missing = this.getMissingContext();
    
    // Find highest priority missing field
    const highPriority = missing.find(m => m.priority === 'high');
    if (highPriority) {
      return highPriority.suggestedPrompt || null;
    }
    
    // If no high priority, check medium
    const mediumPriority = missing.find(m => m.priority === 'medium');
    if (mediumPriority && Math.random() > 0.5) { // 50% chance to ask for medium priority
      return mediumPriority.suggestedPrompt || null;
    }
    
    return null;
  }

  /**
   * Export context for AI prompt enhancement
   */
  exportForPrompt(): string {
    const fields = Array.from(this.gatheredFields.values());
    const sections: string[] = [];
    
    // Core context
    const vision = this.getField('vision');
    if (vision) {
      sections.push(`Learning Vision: ${vision.value}`);
    }
    
    const drivingQuestion = this.getField('drivingQuestion');
    if (drivingQuestion) {
      sections.push(`Driving Question: ${drivingQuestion.value}`);
    }
    
    // Educational context
    const gradeLevel = this.getField('gradeLevel');
    if (gradeLevel) {
      sections.push(`Grade Level: ${gradeLevel.value}`);
    }
    
    const duration = this.getField('duration');
    if (duration) {
      sections.push(`Duration: ${duration.value}`);
    }
    
    const subjects = this.getField('subjects');
    if (subjects && subjects.value.length > 0) {
      sections.push(`Subject Areas: ${subjects.value.join(', ')}`);
    }
    
    // Experience and special needs
    const pblExperience = this.getField('pblExperience');
    if (pblExperience) {
      sections.push(`Teacher PBL Experience: ${pblExperience.value}`);
    }
    
    const specialRequirements = this.getField('specialRequirements');
    if (specialRequirements) {
      sections.push(`Special Requirements: ${specialRequirements.value}`);
    }
    
    const specialConsiderations = this.getField('specialConsiderations');
    if (specialConsiderations) {
      sections.push(`Special Considerations: ${specialConsiderations.value}`);
    }
    
    return sections.join('\n');
  }

  /**
   * Mark gathering attempt
   */
  markGatheringAttempt(field: string, success: boolean): void {
    this.gatheringHistory.push({
      field,
      timestamp: new Date(),
      success
    });
  }

  /**
   * Get gathering statistics
   */
  getGatheringStats(): { attempted: number; successful: number; fields: string[] } {
    const successful = this.gatheringHistory.filter(h => h.success).length;
    const fields = [...new Set(this.gatheringHistory.map(h => h.field))];
    
    return {
      attempted: this.gatheringHistory.length,
      successful,
      fields
    };
  }
}