/**
 * WizardContextHelper - Provides context generation for AI prompts
 * Works with GeminiService to ensure wizard data is included in prompts
 */

export class WizardContextHelper {
  /**
   * Generate contextual prompt prefix from wizard/blueprint data
   */
  static generateContextualPromptPrefix(context: any): string {
    if (!context) return '';
    
    const parts: string[] = [];
    
    // Extract wizard data from various possible locations
    const wizardData = context.wizardData || context.wizard || context;
    
    // Build context string from available data
    if (wizardData.subject || wizardData.subjects) {
      const subjects = wizardData.subjects?.join(', ') || wizardData.subject;
      if (subjects) {
        parts.push(`Subject Area(s): ${subjects}`);
      }
    }
    
    if (wizardData.gradeLevel || wizardData.students) {
      const grade = wizardData.gradeLevel || wizardData.students;
      parts.push(`Grade Level: ${grade}`);
    }
    
    if (wizardData.duration || wizardData.scope) {
      const duration = wizardData.duration || wizardData.scope;
      parts.push(`Duration: ${duration}`);
    }
    
    if (wizardData.projectTopic) {
      parts.push(`Project Topic: ${wizardData.projectTopic}`);
    }
    
    if (wizardData.learningGoals) {
      parts.push(`Learning Goals: ${wizardData.learningGoals}`);
    }
    
    if (wizardData.materials || wizardData.resources) {
      const materials = wizardData.materials || wizardData.resources;
      if (materials) {
        parts.push(`Available Materials: ${materials}`);
      }
    }
    
    if (wizardData.location) {
      parts.push(`Setting: ${wizardData.location}`);
    }
    
    if (wizardData.specialRequirements) {
      parts.push(`Special Requirements: ${wizardData.specialRequirements}`);
    }
    
    if (wizardData.specialConsiderations) {
      parts.push(`Special Considerations: ${wizardData.specialConsiderations}`);
    }
    
    // Return formatted context
    if (parts.length === 0) return '';
    
    return `
=== PROJECT CONTEXT ===
${parts.join('\n')}
=== END CONTEXT ===

`;
  }
  
  /**
   * Extract key wizard fields for quick reference
   */
  static extractKeyFields(context: any): {
    subject?: string;
    gradeLevel?: string;
    duration?: string;
    projectTopic?: string;
    learningGoals?: string;
  } {
    const wizardData = context?.wizardData || context?.wizard || context || {};
    
    return {
      subject: wizardData.subjects?.join(', ') || wizardData.subject,
      gradeLevel: wizardData.gradeLevel || wizardData.students,
      duration: wizardData.duration || wizardData.scope,
      projectTopic: wizardData.projectTopic,
      learningGoals: wizardData.learningGoals
    };
  }
  
  /**
   * Check if context has minimum viable data
   */
  static hasMinimumContext(context: any): boolean {
    const wizardData = context?.wizardData || context?.wizard || context || {};
    
    // At minimum we need subject/grade or a project topic
    return !!(
      (wizardData.subject || wizardData.subjects?.length > 0) ||
      wizardData.projectTopic ||
      wizardData.gradeLevel ||
      wizardData.students
    );
  }
}