/**
 * WizardContextHelper - Provides context generation for AI prompts
 * Works with GeminiService to ensure wizard data is included in prompts
 */

import { queryHeroPromptReferences } from '../ai/context/heroContext';

export class WizardContextHelper {
  /**
   * Generate contextual prompt prefix from wizard/blueprint data
   */
  static generateContextualPromptPrefix(context: any): string {
    if (!context) return '';
    
    const parts: string[] = [];
    
    // Extract wizard data from various possible locations
    const wizardData = context.wizardData || context.wizard || context;

    const subjectList: string[] = Array.isArray(wizardData.subjects)
      ? wizardData.subjects
      : wizardData.subject
        ? [wizardData.subject]
        : [];
    const subjectLabel = subjectList.filter(Boolean).join(', ');
    const gradeLabel = wizardData.gradeLevel || wizardData.students || '';
    const durationLabel = wizardData.duration || wizardData.scope || '';
    
    // Build context string from available data
    if (subjectLabel) {
      parts.push(`Subject Area(s): ${subjectLabel}`);
    }
    
    if (gradeLabel) {
      parts.push(`Grade Level: ${gradeLabel}`);
    }
    
    if (durationLabel) {
      parts.push(`Duration: ${durationLabel}`);
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
    
    const heroReferences = queryHeroPromptReferences({
      subjects: subjectList,
      gradeLevels: gradeLabel ? [gradeLabel] : undefined,
      limit: 3
    });

    if (heroReferences.length) {
      const exemplarLines = heroReferences.map(ref => {
        const milestone = ref.milestoneHighlights?.[0]?.title || 'Signature milestone';
        const metric = ref.metricHighlights?.[0];
        const metricText = metric ? ` Key Metric: ${metric.metric} → ${metric.target}.` : '';
        return `• ${ref.title} (${ref.gradeLevel}, ${ref.duration}) — Challenge: ${ref.challenge}. Milestone: ${milestone}.${metricText}`;
      });
      parts.push(`Hero Exemplars:\n${exemplarLines.join('\n')}`);
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
