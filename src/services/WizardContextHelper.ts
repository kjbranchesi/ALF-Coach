/**
 * WizardContextHelper.ts
 * Ensures wizard data is properly used in all AI prompts
 * Enhanced to work with ContextTracker and streamlined wizard data
 */

import { ContextTracker } from './ContextTracker';
import { WizardData, ENTRY_POINTS, PBL_EXPERIENCE } from '../features/wizard/wizardSchema';

export interface WizardContext {
  subject?: string;
  students?: string;
  location?: string;
  resources?: string;
  scope?: string;
  vision?: string;
  entryPoint?: string;
  drivingQuestion?: string;
  pblExperience?: string;
  specialConsiderations?: string;
}

export class WizardContextHelper {
  /**
   * Extracts wizard context from blueprint (with enhanced support)
   */
  static extractWizardContext(context: any): WizardContext {
    // Handle both wizard and wizardData structures
    const wizard = context?.wizard || context?.wizardData || {};
    
    return {
      subject: wizard.subject || '',
      students: wizard.students || wizard.gradeLevel || wizard.ageGroup || '',
      location: wizard.location || '',
      resources: wizard.resources || wizard.materials || wizard.requiredResources || '',
      scope: wizard.scope || wizard.duration || '',
      vision: wizard.vision || wizard.alfFocus || '',
      entryPoint: wizard.entryPoint || '',
      drivingQuestion: wizard.drivingQuestion || '',
      pblExperience: wizard.pblExperience || '',
      specialConsiderations: wizard.specialConsiderations || ''
    };
  }

  /**
   * Enhanced context builder with ContextTracker integration
   */
  static buildEnhancedContextString(contextTracker: ContextTracker): string {
    const context = contextTracker.getContext();
    const completeness = contextTracker.getCompleteness();
    const aiPromptContext = contextTracker.generateAIPromptContext();
    
    return aiPromptContext;
  }

  /**
   * Builds a context string for prompts
   */
  static buildContextString(context: any): string {
    const wizard = this.extractWizardContext(context);
    const contextParts: string[] = [];

    if (wizard.subject) {
      contextParts.push(`Subject: ${wizard.subject}`);
    }
    if (wizard.students) {
      contextParts.push(`Students: ${wizard.students}`);
    }
    if (wizard.location) {
      contextParts.push(`Location: ${wizard.location}`);
    }
    if (wizard.resources) {
      contextParts.push(`Available Resources: ${wizard.resources}`);
    }
    if (wizard.scope) {
      contextParts.push(`Project Scope: ${wizard.scope}`);
    }
    if (wizard.vision) {
      contextParts.push(`Learning Focus: ${wizard.vision}`);
    }

    return contextParts.length > 0 
      ? `\n\nProject Context:\n${contextParts.join('\n')}\n` 
      : '';
  }

  /**
   * Builds subject-specific prompt additions
   */
  static getSubjectSpecificPrompt(subject: string): string {
    const subjectLower = subject.toLowerCase();
    
    // Computer Science / Technology
    if (subjectLower.includes('computer') || subjectLower.includes('technology') || 
        subjectLower.includes('coding') || subjectLower.includes('programming')) {
      return `
Focus on technology and computer science concepts such as:
- Programming and coding projects
- AI and machine learning applications
- Web development and app creation
- Data science and visualization
- Cybersecurity and digital citizenship
- Computational thinking and algorithms`;
    }
    
    // Science
    if (subjectLower.includes('science') || subjectLower.includes('biology') || 
        subjectLower.includes('chemistry') || subjectLower.includes('physics')) {
      return `
Focus on scientific concepts such as:
- Scientific method and experimentation
- Real-world scientific problems
- Environmental and sustainability issues
- Laboratory investigations
- Data collection and analysis
- STEM integration opportunities`;
    }
    
    // Mathematics
    if (subjectLower.includes('math')) {
      return `
Focus on mathematical concepts such as:
- Real-world problem solving
- Mathematical modeling
- Data analysis and statistics
- Geometric design and construction
- Financial literacy applications
- Cross-curricular math connections`;
    }
    
    // English / Language Arts
    if (subjectLower.includes('english') || subjectLower.includes('language') || 
        subjectLower.includes('literature') || subjectLower.includes('writing')) {
      return `
Focus on language arts concepts such as:
- Creative writing and storytelling
- Literary analysis and criticism
- Multimedia presentations
- Journalism and reporting
- Digital storytelling
- Communication and public speaking`;
    }
    
    // History / Social Studies
    if (subjectLower.includes('history') || subjectLower.includes('social')) {
      return `
Focus on historical and social concepts such as:
- Historical investigations and research
- Current events and civic engagement
- Cultural studies and diversity
- Geographic exploration
- Economic systems and impacts
- Social justice and community issues`;
    }
    
    // Arts
    if (subjectLower.includes('art') || subjectLower.includes('music') || 
        subjectLower.includes('drama') || subjectLower.includes('theater')) {
      return `
Focus on artistic concepts such as:
- Creative expression and design
- Performance and presentation
- Cultural and historical connections
- Digital media and technology
- Collaboration and ensemble work
- Community engagement through arts`;
    }
    
    // Default for unspecified subjects
    return `
Consider interdisciplinary connections and real-world applications relevant to the subject area.`;
  }

  /**
   * Gets age-appropriate suggestions
   */
  static getAgeAppropriatePrompt(students: string): string {
    const studentsLower = students.toLowerCase();
    
    // Elementary
    if (studentsLower.includes('elementary') || studentsLower.includes('k-5') || 
        studentsLower.includes('primary')) {
      return `
Ensure suggestions are appropriate for elementary students:
- Use simple, concrete language
- Include hands-on, tactile activities
- Keep projects shorter and more structured
- Focus on foundational skills
- Include visual and interactive elements
- Emphasize collaboration and teamwork`;
    }
    
    // Middle School
    if (studentsLower.includes('middle') || studentsLower.includes('6-8') || 
        studentsLower.includes('junior')) {
      return `
Ensure suggestions are appropriate for middle school students:
- Balance structure with independence
- Include identity and social relevance
- Incorporate technology and digital tools
- Allow for creative expression
- Build critical thinking skills
- Connect to their expanding worldview`;
    }
    
    // High School
    if (studentsLower.includes('high') || studentsLower.includes('9-12') || 
        studentsLower.includes('secondary')) {
      return `
Ensure suggestions are appropriate for high school students:
- Include complex, open-ended challenges
- Connect to college and career readiness
- Emphasize real-world applications
- Allow for deep research and analysis
- Include authentic audiences
- Build professional skills`;
    }
    
    // College/University
    if (studentsLower.includes('college') || studentsLower.includes('university') || 
        studentsLower.includes('higher ed')) {
      return `
Ensure suggestions are appropriate for college/university students:
- Focus on professional-level work
- Include research and scholarship
- Connect to industry standards
- Emphasize innovation and creativity
- Include interdisciplinary approaches
- Build expertise and specialization`;
    }
    
    // Adult Learners
    if (studentsLower.includes('adult') || studentsLower.includes('professional')) {
      return `
Ensure suggestions are appropriate for adult learners:
- Connect to professional development
- Include practical applications
- Respect prior experience
- Allow for self-directed learning
- Focus on immediate relevance
- Build on existing expertise`;
    }
    
    return `
Consider the developmental level and interests of the students.`;
  }

  /**
   * Generates a complete contextual prompt prefix
   */
  static generateContextualPromptPrefix(context: any): string {
    const wizard = this.extractWizardContext(context);
    const contextString = this.buildContextString(context);
    
    let promptPrefix = contextString;
    
    if (wizard.subject) {
      promptPrefix += this.getSubjectSpecificPrompt(wizard.subject);
    }
    
    if (wizard.students) {
      promptPrefix += this.getAgeAppropriatePrompt(wizard.students);
    }
    
    return promptPrefix;
  }
}