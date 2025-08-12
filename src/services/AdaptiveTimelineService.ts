/**
 * AdaptiveTimelineService.ts
 * 
 * Intelligently adapts Creative Process phase timing based on:
 * - Project duration
 * - Grade level
 * - Subject complexity
 * - Teacher preferences
 */

export interface PhaseAllocation {
  phaseId: 'analyze' | 'brainstorm' | 'prototype' | 'evaluate';
  percentage: number;
  duration: string;
  rationale: string;
}

export interface TimelineConfig {
  projectDuration: string;
  gradeLevel: string;
  subject: string;
  complexity?: 'basic' | 'moderate' | 'complex';
  iterationExpectation?: 'minimal' | 'moderate' | 'extensive';
}

export class AdaptiveTimelineService {
  /**
   * Parse various duration formats into school days
   */
  private parseDurationToDays(duration: string): number {
    const lower = duration.toLowerCase().trim();
    
    // Extract number from string
    const match = lower.match(/(\d+)/);
    const num = match ? parseInt(match[1]) : 1;
    
    // Convert to school days based on unit
    if (lower.includes('day')) {
      return num;
    } else if (lower.includes('week')) {
      return num * 5; // 5 school days per week
    } else if (lower.includes('month')) {
      return num * 20; // ~20 school days per month
    } else if (lower.includes('quarter')) {
      return num * 45; // ~45 days per quarter
    } else if (lower.includes('semester')) {
      return num * 90; // ~90 days per semester
    } else if (lower.includes('year')) {
      return 180; // standard school year
    }
    
    // Default to weeks if no unit specified
    return num * 5;
  }
  
  /**
   * Format days back into human-readable duration
   */
  private formatDuration(days: number): string {
    if (days === 1) return '1 day';
    if (days < 5) return `${days} days`;
    if (days <= 10) return `${Math.round(days / 5)} weeks`;
    if (days <= 25) return `${days} days`;
    if (days <= 45) return `${Math.round(days / 5)} weeks`;
    if (days <= 90) return `${Math.round(days / 20)} months`;
    return `${Math.round(days / 45)} quarters`;
  }
  
  /**
   * Get grade level adjustment factors
   */
  private getGradeLevelFactors(gradeLevel: string): {
    analyzeWeight: number;
    brainstormWeight: number;
    prototypeWeight: number;
    evaluateWeight: number;
  } {
    const lower = gradeLevel.toLowerCase();
    
    // Elementary (K-5)
    if (lower.includes('k') || lower.includes('elementary') || 
        lower.includes('1') || lower.includes('2') || 
        lower.includes('3') || lower.includes('4') || lower.includes('5')) {
      return {
        analyzeWeight: 0.8,    // Less analysis
        brainstormWeight: 1.2,  // More creative exploration
        prototypeWeight: 1.1,   // Hands-on learning
        evaluateWeight: 0.9     // Simpler evaluation
      };
    }
    
    // Middle School (6-8)
    if (lower.includes('middle') || lower.includes('6') || 
        lower.includes('7') || lower.includes('8')) {
      return {
        analyzeWeight: 1.0,
        brainstormWeight: 1.0,
        prototypeWeight: 1.0,
        evaluateWeight: 1.0
      };
    }
    
    // High School (9-12)
    if (lower.includes('high') || lower.includes('9') || 
        lower.includes('10') || lower.includes('11') || lower.includes('12')) {
      return {
        analyzeWeight: 1.2,    // Deeper research
        brainstormWeight: 0.9,  // More focused ideation
        prototypeWeight: 1.0,
        evaluateWeight: 1.1    // Rigorous evaluation
      };
    }
    
    // University/College
    if (lower.includes('university') || lower.includes('college')) {
      return {
        analyzeWeight: 1.3,    // Research-heavy
        brainstormWeight: 0.8,  // Focused innovation
        prototypeWeight: 1.1,   // Complex prototypes
        evaluateWeight: 1.2    // Academic rigor
      };
    }
    
    // Default (middle school baseline)
    return {
      analyzeWeight: 1.0,
      brainstormWeight: 1.0,
      prototypeWeight: 1.0,
      evaluateWeight: 1.0
    };
  }
  
  /**
   * Get subject complexity factors
   */
  private getSubjectFactors(subject: string): {
    researchIntensity: number;
    creativityDemand: number;
    buildComplexity: number;
    evaluationDepth: number;
  } {
    const lower = subject.toLowerCase();
    
    // STEM subjects
    if (lower.includes('science') || lower.includes('physics') || 
        lower.includes('chemistry') || lower.includes('biology')) {
      return {
        researchIntensity: 1.2,
        creativityDemand: 0.9,
        buildComplexity: 1.1,
        evaluationDepth: 1.2
      };
    }
    
    if (lower.includes('math') || lower.includes('engineering')) {
      return {
        researchIntensity: 1.0,
        creativityDemand: 0.8,
        buildComplexity: 1.3,
        evaluationDepth: 1.1
      };
    }
    
    if (lower.includes('technology') || lower.includes('computer')) {
      return {
        researchIntensity: 0.9,
        creativityDemand: 1.0,
        buildComplexity: 1.4,
        evaluationDepth: 1.0
      };
    }
    
    // Liberal Arts
    if (lower.includes('english') || lower.includes('literature') || 
        lower.includes('writing')) {
      return {
        researchIntensity: 1.1,
        creativityDemand: 1.3,
        buildComplexity: 0.8,
        evaluationDepth: 1.1
      };
    }
    
    if (lower.includes('history') || lower.includes('social')) {
      return {
        researchIntensity: 1.4,
        creativityDemand: 0.9,
        buildComplexity: 0.7,
        evaluationDepth: 1.2
      };
    }
    
    // Creative subjects
    if (lower.includes('art') || lower.includes('music') || 
        lower.includes('drama') || lower.includes('theater')) {
      return {
        researchIntensity: 0.7,
        creativityDemand: 1.4,
        buildComplexity: 1.2,
        evaluationDepth: 0.9
      };
    }
    
    // Default balanced
    return {
      researchIntensity: 1.0,
      creativityDemand: 1.0,
      buildComplexity: 1.0,
      evaluationDepth: 1.0
    };
  }
  
  /**
   * Calculate optimal phase allocations
   */
  public calculatePhaseAllocations(config: TimelineConfig): PhaseAllocation[] {
    const totalDays = this.parseDurationToDays(config.projectDuration);
    const gradeLevelFactors = this.getGradeLevelFactors(config.gradeLevel);
    const subjectFactors = this.getSubjectFactors(config.subject);
    
    // Base allocations (percentages)
    let baseAllocations = {
      analyze: 25,
      brainstorm: 25,
      prototype: 35,
      evaluate: 15
    };
    
    // Adjust for project duration
    if (totalDays <= 10) {
      // Very short projects - less analysis, more doing
      baseAllocations = {
        analyze: 20,
        brainstorm: 20,
        prototype: 40,
        evaluate: 20
      };
    } else if (totalDays >= 60) {
      // Long projects - more depth in each phase
      baseAllocations = {
        analyze: 30,
        brainstorm: 20,
        prototype: 35,
        evaluate: 15
      };
    }
    
    // Apply grade level adjustments
    const analyzePercent = Math.round(
      baseAllocations.analyze * gradeLevelFactors.analyzeWeight * subjectFactors.researchIntensity
    );
    const brainstormPercent = Math.round(
      baseAllocations.brainstorm * gradeLevelFactors.brainstormWeight * subjectFactors.creativityDemand
    );
    const prototypePercent = Math.round(
      baseAllocations.prototype * gradeLevelFactors.prototypeWeight * subjectFactors.buildComplexity
    );
    const evaluatePercent = Math.round(
      baseAllocations.evaluate * gradeLevelFactors.evaluateWeight * subjectFactors.evaluationDepth
    );
    
    // Normalize to 100%
    const total = analyzePercent + brainstormPercent + prototypePercent + evaluatePercent;
    const normalizedAllocations = {
      analyze: Math.round((analyzePercent / total) * 100),
      brainstorm: Math.round((brainstormPercent / total) * 100),
      prototype: Math.round((prototypePercent / total) * 100),
      evaluate: Math.round((evaluatePercent / total) * 100)
    };
    
    // Ensure it adds to 100%
    const diff = 100 - (normalizedAllocations.analyze + normalizedAllocations.brainstorm + 
                        normalizedAllocations.prototype + normalizedAllocations.evaluate);
    normalizedAllocations.prototype += diff; // Add difference to prototype (usually largest)
    
    // Calculate actual days for each phase
    const allocations: PhaseAllocation[] = [
      {
        phaseId: 'analyze',
        percentage: normalizedAllocations.analyze,
        duration: this.formatDuration(Math.round(totalDays * normalizedAllocations.analyze / 100)),
        rationale: this.getPhaseRationale('analyze', config, normalizedAllocations.analyze)
      },
      {
        phaseId: 'brainstorm',
        percentage: normalizedAllocations.brainstorm,
        duration: this.formatDuration(Math.round(totalDays * normalizedAllocations.brainstorm / 100)),
        rationale: this.getPhaseRationale('brainstorm', config, normalizedAllocations.brainstorm)
      },
      {
        phaseId: 'prototype',
        percentage: normalizedAllocations.prototype,
        duration: this.formatDuration(Math.round(totalDays * normalizedAllocations.prototype / 100)),
        rationale: this.getPhaseRationale('prototype', config, normalizedAllocations.prototype)
      },
      {
        phaseId: 'evaluate',
        percentage: normalizedAllocations.evaluate,
        duration: this.formatDuration(Math.round(totalDays * normalizedAllocations.evaluate / 100)),
        rationale: this.getPhaseRationale('evaluate', config, normalizedAllocations.evaluate)
      }
    ];
    
    return allocations;
  }
  
  /**
   * Generate rationale for phase allocation
   */
  private getPhaseRationale(
    phase: string,
    config: TimelineConfig,
    percentage: number
  ): string {
    const duration = config.projectDuration;
    const grade = config.gradeLevel;
    const subject = config.subject;
    
    switch (phase) {
      case 'analyze':
        if (percentage > 25) {
          return `Extended analysis phase (${percentage}%) allows ${grade} students to deeply investigate the problem space, crucial for ${subject} projects.`;
        } else if (percentage < 25) {
          return `Condensed analysis (${percentage}%) gets ${grade} students into hands-on work quickly while covering essential research.`;
        }
        return `Standard analysis phase (${percentage}%) provides balanced research time for ${grade} ${subject} students.`;
        
      case 'brainstorm':
        if (percentage > 25) {
          return `Extended brainstorming (${percentage}%) encourages creative exploration, important for ${grade} students in ${subject}.`;
        } else if (percentage < 20) {
          return `Focused ideation (${percentage}%) moves students efficiently from ideas to action.`;
        }
        return `Balanced brainstorming (${percentage}%) allows for creative thinking without losing momentum.`;
        
      case 'prototype':
        if (percentage > 35) {
          return `Extended prototyping (${percentage}%) provides ample time for iteration and refinement, essential for ${subject} projects.`;
        }
        return `Core prototyping phase (${percentage}%) balances building time with other phases.`;
        
      case 'evaluate':
        if (percentage > 15) {
          return `Thorough evaluation (${percentage}%) ensures ${grade} students reflect deeply and present professionally.`;
        }
        return `Focused evaluation (${percentage}%) provides essential reflection and presentation time.`;
        
      default:
        return `Optimized for ${duration} ${subject} project with ${grade} students.`;
    }
  }
  
  /**
   * Get iteration recommendations based on timeline
   */
  public getIterationStrategy(totalDays: number): {
    strategy: string;
    checkpoints: string[];
    flexibility: string;
  } {
    if (totalDays <= 10) {
      return {
        strategy: 'Rapid iterations within phases',
        checkpoints: ['Daily check-ins', 'Mid-phase pivots allowed'],
        flexibility: 'High flexibility for quick adjustments'
      };
    } else if (totalDays <= 30) {
      return {
        strategy: 'Planned iteration points between phases',
        checkpoints: ['Weekly reviews', 'Phase-end decision points'],
        flexibility: 'Structured flexibility with clear pivot moments'
      };
    } else {
      return {
        strategy: 'Multiple iteration cycles expected',
        checkpoints: ['Bi-weekly reviews', 'Multiple prototype cycles', 'Major pivot opportunities'],
        flexibility: 'Extensive flexibility for deep exploration'
      };
    }
  }
}