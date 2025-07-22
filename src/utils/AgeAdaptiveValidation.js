export class AgeAdaptiveValidation {
  constructor() {
    this.ageGroups = {
      'elementary': {
        minAge: 5,
        maxAge: 11,
        characteristics: [
          'concrete thinking',
          'hands-on learning',
          'shorter attention spans',
          'visual learning preference'
        ],
        projectCriteria: {
          complexity: 'simple',
          duration: 'short-term',
          scaffolding: 'high',
          collaboration: 'pairs or small groups'
        }
      },
      'middle_school': {
        minAge: 11,
        maxAge: 14,
        characteristics: [
          'developing abstract thinking',
          'peer influence',
          'identity exploration',
          'increasing independence'
        ],
        projectCriteria: {
          complexity: 'moderate',
          duration: 'medium-term',
          scaffolding: 'moderate',
          collaboration: 'small to medium groups'
        }
      },
      'high_school': {
        minAge: 14,
        maxAge: 18,
        characteristics: [
          'abstract thinking',
          'career exploration',
          'social justice awareness',
          'complex problem solving'
        ],
        projectCriteria: {
          complexity: 'complex',
          duration: 'long-term',
          scaffolding: 'low to moderate',
          collaboration: 'flexible grouping'
        }
      },
      'college': {
        minAge: 18,
        maxAge: 25,
        characteristics: [
          'professional preparation',
          'research skills',
          'independent learning',
          'critical thinking'
        ],
        projectCriteria: {
          complexity: 'advanced',
          duration: 'semester-long',
          scaffolding: 'minimal',
          collaboration: 'professional teams'
        }
      },
      'adult': {
        minAge: 25,
        maxAge: 99,
        characteristics: [
          'life experience',
          'practical application',
          'self-directed learning',
          'professional development'
        ],
        projectCriteria: {
          complexity: 'variable',
          duration: 'flexible',
          scaffolding: 'self-determined',
          collaboration: 'professional networks'
        }
      }
    };
  }

  detectAgeGroup(audienceDescription) {
    const description = audienceDescription.toLowerCase();
    
    if (description.includes('elementary') || description.includes('primary') || 
        description.includes('grade 1') || description.includes('grade 2') || 
        description.includes('grade 3') || description.includes('grade 4') || 
        description.includes('grade 5')) {
      return 'elementary';
    }
    
    if (description.includes('middle school') || description.includes('junior high') ||
        description.includes('grade 6') || description.includes('grade 7') || 
        description.includes('grade 8')) {
      return 'middle_school';
    }
    
    if (description.includes('high school') || description.includes('secondary') ||
        description.includes('grade 9') || description.includes('grade 10') || 
        description.includes('grade 11') || description.includes('grade 12')) {
      return 'high_school';
    }
    
    if (description.includes('college') || description.includes('university') ||
        description.includes('undergraduate') || description.includes('graduate')) {
      return 'college';
    }
    
    if (description.includes('adult') || description.includes('professional') ||
        description.includes('workforce') || description.includes('career')) {
      return 'adult';
    }
    
    // Default to middle school if unclear
    return 'middle_school';
  }

  validateProjectComplexity(projectIdea, ageGroup) {
    const group = this.ageGroups[ageGroup];
    const validation = {
      isValid: true,
      suggestions: [],
      warnings: []
    };

    // Check complexity alignment
    const complexityKeywords = {
      simple: ['basic', 'introduction', 'explore', 'discover'],
      moderate: ['analyze', 'compare', 'design', 'create'],
      complex: ['evaluate', 'synthesize', 'innovate', 'research'],
      advanced: ['theoretical', 'empirical', 'systematic', 'comprehensive']
    };

    const ideaLower = projectIdea.toLowerCase();
    const expectedComplexity = group.projectCriteria.complexity;
    
    // Validate duration expectations
    if (ageGroup === 'elementary' && ideaLower.includes('year-long')) {
      validation.warnings.push('Consider breaking this into smaller, shorter projects for elementary students.');
    }

    // Validate collaboration style
    if (ageGroup === 'elementary' && ideaLower.includes('independent')) {
      validation.suggestions.push('Elementary students benefit from collaborative work. Consider adding peer interaction.');
    }

    // Add age-appropriate suggestions
    validation.suggestions.push(...this.getAgeAppropriateSuggestions(ageGroup, projectIdea));

    return validation;
  }

  getAgeAppropriateSuggestions(ageGroup, projectIdea) {
    const suggestions = [];
    const group = this.ageGroups[ageGroup];

    switch(ageGroup) {
      case 'elementary':
        suggestions.push('Include hands-on activities and visual elements');
        suggestions.push('Break down tasks into small, manageable steps');
        suggestions.push('Incorporate movement and interactive elements');
        break;
      case 'middle_school':
        suggestions.push('Connect to their interests and pop culture');
        suggestions.push('Provide choices and autonomy within structure');
        suggestions.push('Include peer collaboration opportunities');
        break;
      case 'high_school':
        suggestions.push('Connect to real-world careers and applications');
        suggestions.push('Allow for student voice and choice');
        suggestions.push('Include community engagement opportunities');
        break;
      case 'college':
        suggestions.push('Emphasize research and critical analysis');
        suggestions.push('Include professional skill development');
        suggestions.push('Connect to current industry practices');
        break;
      case 'adult':
        suggestions.push('Focus on practical, immediate application');
        suggestions.push('Respect and utilize their prior experience');
        suggestions.push('Provide flexible pacing options');
        break;
    }

    return suggestions;
  }

  adaptPromptForAge(basePrompt, ageGroup) {
    const adaptations = {
      elementary: {
        prefix: "Keep language simple and concrete. ",
        suffix: " Use familiar examples and break down complex ideas."
      },
      middle_school: {
        prefix: "Balance structure with student choice. ",
        suffix: " Connect to their emerging interests and identity."
      },
      high_school: {
        prefix: "Encourage critical thinking and real-world connections. ",
        suffix: " Provide opportunities for leadership and innovation."
      },
      college: {
        prefix: "Emphasize academic rigor and professional preparation. ",
        suffix: " Include research and theoretical frameworks."
      },
      adult: {
        prefix: "Focus on practical application and efficiency. ",
        suffix: " Respect their experience and time constraints."
      }
    };

    const adaptation = adaptations[ageGroup] || adaptations.middle_school;
    return adaptation.prefix + basePrompt + adaptation.suffix;
  }
}