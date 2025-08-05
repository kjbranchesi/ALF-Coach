/**
 * AIResponseParser.ts - Robust parsing utilities for AI responses
 * Handles multiple response formats with fallback strategies
 */

interface ParsedMilestone {
  id: string;
  title: string;
  description: string;
  phase: 'phase1' | 'phase2' | 'phase3';
}

interface ParsedCriterion {
  criterion: string;
  description: string;
  weight: number;
}

export class AIResponseParser {
  
  /**
   * Parse milestones from various AI response formats
   */
  static parseMilestones(input: string | any): ParsedMilestone[] {
    // If already an array, validate and return
    if (Array.isArray(input)) {
      return input.map((item, idx) => this.normalizeMilestone(item, idx));
    }

    // If not a string, convert
    if (typeof input !== 'string') {
      return [this.normalizeMilestone(input, 0)];
    }

    const milestones: ParsedMilestone[] = [];

    // Strategy 1: Parse "Milestone N:" format
    const milestoneMatches = input.match(/Milestone\s*\d+:\s*([^\n]+)(?:\n([^\n]+))?/gi);
    if (milestoneMatches && milestoneMatches.length >= 2) {
      milestoneMatches.forEach((match, idx) => {
        const parts = match.match(/Milestone\s*\d+:\s*([^\n]+)(?:\n([^\n]+))?/i);
        if (parts) {
          milestones.push({
            id: `m${idx + 1}`,
            title: parts[1].trim(),
            description: parts[2]?.trim() || '',
            phase: `phase${Math.min(idx + 1, 3)}` as 'phase1' | 'phase2' | 'phase3'
          });
        }
      });
    }

    // Strategy 2: Parse numbered list (1. Title - Description)
    if (milestones.length === 0) {
      const numberedMatches = input.match(/\d+\.\s*([^-\n]+)(?:\s*-\s*([^\n]+))?/g);
      if (numberedMatches && numberedMatches.length >= 2) {
        numberedMatches.forEach((match, idx) => {
          const parts = match.match(/\d+\.\s*([^-\n]+)(?:\s*-\s*([^\n]+))?/);
          if (parts) {
            milestones.push({
              id: `m${idx + 1}`,
              title: parts[1].trim(),
              description: parts[2]?.trim() || '',
              phase: `phase${Math.min(idx + 1, 3)}` as 'phase1' | 'phase2' | 'phase3'
            });
          }
        });
      }
    }

    // Strategy 3: Parse bullet points
    if (milestones.length === 0) {
      const bulletMatches = input.match(/[•·]\s*([^•·\n]+)/g);
      if (bulletMatches && bulletMatches.length >= 2) {
        bulletMatches.forEach((match, idx) => {
          const text = match.replace(/[•·]\s*/, '').trim();
          milestones.push({
            id: `m${idx + 1}`,
            title: text.split(/[:.]/)[0].trim(),
            description: text.split(/[:.]/)[1]?.trim() || '',
            phase: `phase${Math.min(idx + 1, 3)}` as 'phase1' | 'phase2' | 'phase3'
          });
        });
      }
    }

    // Strategy 4: Split by Phase mentions
    if (milestones.length === 0) {
      const phaseMatches = input.match(/Phase\s*\d+[:\s]+([^.!?\n]+)/gi);
      if (phaseMatches && phaseMatches.length >= 2) {
        phaseMatches.forEach((match, idx) => {
          const text = match.replace(/Phase\s*\d+[:\s]+/i, '').trim();
          milestones.push({
            id: `m${idx + 1}`,
            title: text,
            description: '',
            phase: `phase${Math.min(idx + 1, 3)}` as 'phase1' | 'phase2' | 'phase3'
          });
        });
      }
    }

    // Fallback: Create single milestone from entire input
    if (milestones.length === 0) {
      const lines = input.split('\n').filter(line => line.trim().length > 10);
      if (lines.length >= 3) {
        // Try to extract 3 milestones from first 3 substantial lines
        lines.slice(0, 3).forEach((line, idx) => {
          milestones.push({
            id: `m${idx + 1}`,
            title: line.trim(),
            description: '',
            phase: `phase${idx + 1}` as 'phase1' | 'phase2' | 'phase3'
          });
        });
      } else {
        // Last resort - single milestone
        milestones.push({
          id: 'm1',
          title: input.trim().substring(0, 100),
          description: '',
          phase: 'phase1'
        });
      }
    }

    // Ensure we have at least 3 milestones
    while (milestones.length < 3) {
      milestones.push({
        id: `m${milestones.length + 1}`,
        title: `Phase ${milestones.length + 1} Milestone`,
        description: 'To be developed',
        phase: `phase${milestones.length + 1}` as 'phase1' | 'phase2' | 'phase3'
      });
    }

    return milestones.slice(0, 3); // Ensure exactly 3 milestones
  }

  /**
   * Parse rubric criteria from various formats
   */
  static parseRubricCriteria(input: string | any): ParsedCriterion[] {
    if (Array.isArray(input)) {
      return this.normalizeRubricArray(input);
    }

    if (typeof input !== 'string') {
      return [{
        criterion: 'Assessment Criteria',
        description: String(input),
        weight: 100
      }];
    }

    const criteria: ParsedCriterion[] = [];

    // Strategy 1: Numbered criteria (1. Criterion: Description)
    const numberedMatches = input.match(/\d+\.\s*([^:]+):\s*([^\n]+)/g);
    if (numberedMatches && numberedMatches.length > 0) {
      const totalWeight = 100;
      const weightPerCriterion = Math.floor(totalWeight / numberedMatches.length);
      
      numberedMatches.forEach((match, index) => {
        const parts = match.match(/\d+\.\s*([^:]+):\s*(.+)/);
        if (parts) {
          criteria.push({
            criterion: parts[1].trim(),
            description: parts[2].trim(),
            weight: weightPerCriterion + (index === numberedMatches.length - 1 ? totalWeight % numberedMatches.length : 0)
          });
        }
      });
    }

    // Strategy 2: Bullet points with colons
    if (criteria.length === 0) {
      const bulletMatches = input.match(/[•·-]\s*([^:]+):\s*([^\n]+)/g);
      if (bulletMatches && bulletMatches.length > 0) {
        const totalWeight = 100;
        const weightPerCriterion = Math.floor(totalWeight / bulletMatches.length);
        
        bulletMatches.forEach((match, index) => {
          const parts = match.match(/[•·-]\s*([^:]+):\s*(.+)/);
          if (parts) {
            criteria.push({
              criterion: parts[1].trim(),
              description: parts[2].trim(),
              weight: weightPerCriterion + (index === bulletMatches.length - 1 ? totalWeight % bulletMatches.length : 0)
            });
          }
        });
      }
    }

    // Strategy 3: Headers with descriptions
    if (criteria.length === 0) {
      const sections = input.split(/\n{2,}/);
      const validSections = sections.filter(s => s.trim().length > 20);
      
      if (validSections.length >= 2) {
        const totalWeight = 100;
        const weightPerCriterion = Math.floor(totalWeight / validSections.length);
        
        validSections.forEach((section, index) => {
          const lines = section.trim().split('\n');
          criteria.push({
            criterion: lines[0].replace(/[*_#]/g, '').trim(),
            description: lines.slice(1).join(' ').trim() || 'Assessment of this criterion',
            weight: weightPerCriterion + (index === validSections.length - 1 ? totalWeight % validSections.length : 0)
          });
        });
      }
    }

    // Fallback: Create basic criteria
    if (criteria.length === 0) {
      criteria.push(
        { criterion: 'Content Understanding', description: 'Demonstrates comprehension of key concepts', weight: 40 },
        { criterion: 'Application & Creativity', description: 'Applies learning in creative ways', weight: 30 },
        { criterion: 'Communication', description: 'Clearly communicates ideas and findings', weight: 30 }
      );
    }

    return criteria;
  }

  /**
   * Normalize a single milestone object
   */
  private static normalizeMilestone(item: any, index: number): ParsedMilestone {
    if (typeof item === 'string') {
      return {
        id: `m${index + 1}`,
        title: item.trim(),
        description: '',
        phase: `phase${Math.min(index + 1, 3)}` as 'phase1' | 'phase2' | 'phase3'
      };
    }

    return {
      id: item.id || `m${index + 1}`,
      title: item.title || item.name || `Milestone ${index + 1}`,
      description: item.description || '',
      phase: item.phase || `phase${Math.min(index + 1, 3)}` as 'phase1' | 'phase2' | 'phase3'
    };
  }

  /**
   * Normalize an array of rubric criteria
   */
  private static normalizeRubricArray(items: any[]): ParsedCriterion[] {
    const totalWeight = 100;
    const weightPerCriterion = Math.floor(totalWeight / items.length);
    
    return items.map((item, index) => {
      if (typeof item === 'string') {
        return {
          criterion: item.trim(),
          description: 'Assessment of this criterion',
          weight: weightPerCriterion + (index === items.length - 1 ? totalWeight % items.length : 0)
        };
      }

      return {
        criterion: item.criterion || item.name || `Criterion ${index + 1}`,
        description: item.description || 'Assessment of this criterion',
        weight: item.weight || (weightPerCriterion + (index === items.length - 1 ? totalWeight % items.length : 0))
      };
    });
  }

  /**
   * Parse impact/audience information
   */
  static parseImpact(input: string | any): { audience: string; method: string; timeline: string } {
    if (typeof input === 'object' && input !== null) {
      return {
        audience: input.audience || 'Community stakeholders',
        method: input.method || 'Presentation and demonstration',
        timeline: input.timeline || 'End of project'
      };
    }

    const text = String(input);
    
    // Extract audience
    const audienceMatch = text.match(/(?:audience|present to|share with|for)\s*:?\s*([^,.]+)/i);
    const audience = audienceMatch ? audienceMatch[1].trim() : 'Community stakeholders';
    
    // Extract method
    const methodMatch = text.match(/(?:through|via|by|using)\s*:?\s*([^,.]+)/i);
    const method = methodMatch ? methodMatch[1].trim() : 'Presentation and demonstration';
    
    // Extract timeline
    const timelineMatch = text.match(/(?:when|timeline|by|at)\s*:?\s*([^,.]+)/i);
    const timeline = timelineMatch ? timelineMatch[1].trim() : 'End of project';
    
    return { audience, method, timeline };
  }
}