/**
 * ContentParsingService.ts
 * 
 * A dedicated service for parsing AI-generated content into structured data.
 * Handles multiple response formats with intelligent fallback strategies.
 */

import { 
  Phase, 
  Activity, 
  RubricData, 
  Product,
  IdeationData 
} from '../types/SOPTypes';

// ============================================================================
// Type Definitions
// ============================================================================

export interface ParseResult<T> {
  data: T;
  confidence: number;
  format: string;
  warnings?: string[];
}

export interface JourneyPhasesResult {
  phases: Phase[];
  confidence: number;
  format: string;
}

export interface ActivitiesResult {
  activities: Activity[];
  milestones: string[];
  confidence: number;
}

export interface ResourcesResult {
  resources: string[];
  confidence: number;
}

export interface ParsingConfig {
  enableFallback: boolean;
  minConfidence: number;
  maxRetries: number;
  preserveMarkdown: boolean;
}

// ============================================================================
// ContentParsingService Class
// ============================================================================

export class ContentParsingService {
  private config: ParsingConfig;

  constructor(config?: Partial<ParsingConfig>) {
    this.config = {
      enableFallback: true,
      minConfidence: 0.3,
      maxRetries: 3,
      preserveMarkdown: false,
      ...config
    };
  }

  /**
   * Clean markdown formatting from text
   */
  private cleanMarkdown(text: string): string {
    if (this.config.preserveMarkdown) return text;
    
    return text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/`/g, '')
      .trim();
  }

  /**
   * Parse journey phases from various AI response formats
   */
  public parseJourneyPhases(data: string): JourneyPhasesResult {
    const phases: Phase[] = [];
    let confidence = 1.0;
    let format = 'unknown';

    // Clean the data first
    const cleanData = this.cleanMarkdown(data);

    // Strategy 1: JSON format
    try {
      const jsonMatch = data.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.phases && Array.isArray(parsed.phases)) {
          return {
            phases: parsed.phases.map(this.normalizePhase),
            confidence: 1.0,
            format: 'json'
          };
        }
      }
    } catch (e) {
      // JSON parsing failed, try next strategy
    }

    // Strategy 2: Structured format with bullets
    const phaseWithBulletsRegex = /Phase \d+:\s*([^\n]+)\n(?:\*\s*Focus:\s*([^\n]+)\n)?(?:\*\s*Activities:\s*([^\n]+))?/g;
    let match;
    while ((match = phaseWithBulletsRegex.exec(cleanData)) !== null) {
      phases.push({
        id: `phase_${phases.length + 1}`,
        title: match[1].trim(),
        focus: match[2]?.trim() || '',
        activities: match[3]?.split(',').map(a => a.trim()) || [],
        duration: this.extractDuration(match[1])
      });
      format = 'structured_bullets';
    }

    if (phases.length > 0) {
      return { phases, confidence: 0.9, format };
    }

    // Strategy 3: Numbered list format
    const numberedRegex = /(\d+)\.\s*([^:]+)(?::\s*(.+))?/g;
    while ((match = numberedRegex.exec(cleanData)) !== null) {
      const title = match[2].trim();
      const description = match[3]?.trim() || '';
      
      phases.push({
        id: `phase_${match[1]}`,
        title: title,
        focus: description,
        activities: this.extractActivities(description),
        duration: this.extractDuration(title + ' ' + description)
      });
      format = 'numbered_list';
    }

    if (phases.length > 0) {
      confidence = 0.8;
    } else if (this.config.enableFallback) {
      // Strategy 4: Paragraph-based fallback
      const paragraphs = cleanData.split(/\n\s*\n/).filter(p => p.trim());
      paragraphs.forEach((para, idx) => {
        if (para.length > 20) {
          phases.push({
            id: `phase_${idx + 1}`,
            title: this.extractTitle(para),
            focus: para,
            activities: this.extractActivities(para),
            duration: this.extractDuration(para)
          });
        }
      });
      format = 'paragraph_fallback';
      confidence = 0.5;
    }

    // Final fallback: Create a single phase
    if (phases.length === 0 && this.config.enableFallback) {
      phases.push({
        id: 'phase_1',
        title: 'Project Phase',
        focus: cleanData.substring(0, 200),
        activities: ['Explore', 'Create', 'Share'],
        duration: '1 week'
      });
      format = 'minimal_fallback';
      confidence = 0.3;
    }

    return { phases, confidence, format };
  }

  /**
   * Parse activities and milestones from AI response
   */
  public parseActivities(data: string): ActivitiesResult {
    const activities: Activity[] = [];
    const milestones: string[] = [];
    let confidence = 1.0;

    const cleanData = this.cleanMarkdown(data);

    // Try JSON format first
    try {
      const jsonMatch = data.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.activities || parsed.milestones) {
          return {
            activities: (parsed.activities || []).map(this.normalizeActivity),
            milestones: parsed.milestones || [],
            confidence: 1.0
          };
        }
      }
    } catch (e) {
      // Continue with other strategies
    }

    // Extract activities from bullet points
    const bulletRegex = /[-*]\s+([^\n]+)/g;
    let match;
    while ((match = bulletRegex.exec(cleanData)) !== null) {
      const text = match[1].trim();
      
      if (text.toLowerCase().includes('milestone')) {
        milestones.push(text.replace(/milestone:?\s*/i, '').trim());
      } else {
        activities.push({
          id: `activity_${activities.length + 1}`,
          title: this.extractTitle(text),
          description: text,
          type: this.categorizeActivity(text),
          duration: this.extractDuration(text),
          required: true
        });
      }
    }

    if (activities.length === 0 && this.config.enableFallback) {
      // Fallback: Create activities from sentences
      const sentences = cleanData.split(/[.!?]+/).filter(s => s.trim().length > 20);
      sentences.slice(0, 5).forEach((sentence, idx) => {
        activities.push({
          id: `activity_${idx + 1}`,
          title: `Activity ${idx + 1}`,
          description: sentence.trim(),
          type: 'exploration',
          duration: '30 minutes',
          required: true
        });
      });
      confidence = 0.6;
    }

    return { activities, milestones, confidence };
  }

  /**
   * Parse resources from AI response
   */
  public parseResources(data: string): ResourcesResult {
    const resources: string[] = [];
    let confidence = 1.0;

    const cleanData = this.cleanMarkdown(data);

    // Try JSON format
    try {
      const jsonMatch = data.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.resources && Array.isArray(parsed.resources)) {
          return {
            resources: parsed.resources.map(r => typeof r === 'string' ? r : r.name || r.title),
            confidence: 1.0
          };
        }
      }
    } catch (e) {
      // Continue with other strategies
    }

    // Extract from bullet points
    const bulletRegex = /[-*]\s+([^\n]+)/g;
    let match;
    while ((match = bulletRegex.exec(cleanData)) !== null) {
      resources.push(match[1].trim());
    }

    // Extract from numbered lists
    if (resources.length === 0) {
      const numberedRegex = /\d+\.\s+([^\n]+)/g;
      while ((match = numberedRegex.exec(cleanData)) !== null) {
        resources.push(match[1].trim());
      }
      confidence = 0.8;
    }

    // Fallback: Extract from comma-separated text
    if (resources.length === 0 && this.config.enableFallback) {
      const items = cleanData.split(/[,;]/).map(item => item.trim()).filter(item => 
        item.length > 5 && item.length < 100
      );
      resources.push(...items);
      confidence = 0.5;
    }

    return { resources, confidence };
  }

  /**
   * Parse rubric data from AI response
   */
  public parseRubric(data: string): ParseResult<RubricData> {
    const defaultRubric: RubricData = {
      criteria: [],
      levels: ['Emerging', 'Developing', 'Proficient', 'Advanced'],
      weights: []
    };

    try {
      // Try JSON format
      const jsonMatch = data.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.criteria || parsed.rubric) {
          const rubricData = parsed.rubric || parsed;
          return {
            data: {
              criteria: rubricData.criteria || [],
              levels: rubricData.levels || defaultRubric.levels,
              weights: rubricData.weights || []
            },
            confidence: 1.0,
            format: 'json'
          };
        }
      }
    } catch (e) {
      // Continue with fallback
    }

    // Parse table format
    const lines = data.split('\n');
    const criteria: any[] = [];
    
    lines.forEach(line => {
      if (line.includes('|') && !line.includes('---')) {
        const cells = line.split('|').map(c => c.trim()).filter(c => c);
        if (cells.length > 2 && !cells[0].toLowerCase().includes('criteria')) {
          criteria.push({
            name: cells[0],
            description: cells.slice(1).join(' '),
            weight: 25
          });
        }
      }
    });

    if (criteria.length > 0) {
      return {
        data: {
          ...defaultRubric,
          criteria
        },
        confidence: 0.8,
        format: 'table'
      };
    }

    // Fallback: Create basic rubric
    return {
      data: {
        ...defaultRubric,
        criteria: [
          { name: 'Content Understanding', description: 'Demonstrates knowledge of subject', weight: 25 },
          { name: 'Creativity', description: 'Shows original thinking', weight: 25 },
          { name: 'Collaboration', description: 'Works well with others', weight: 25 },
          { name: 'Presentation', description: 'Communicates effectively', weight: 25 }
        ]
      },
      confidence: 0.4,
      format: 'default',
      warnings: ['Using default rubric structure']
    };
  }

  /**
   * Parse ideation data from AI response
   */
  public parseIdeation(data: string): ParseResult<IdeationData> {
    const result: IdeationData = {
      drivingQuestion: '',
      learningObjectives: [],
      successCriteria: [],
      constraints: [],
      realWorldApplication: ''
    };

    const cleanData = this.cleanMarkdown(data);

    // Try JSON format
    try {
      const jsonMatch = data.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          data: {
            drivingQuestion: parsed.drivingQuestion || parsed.question || '',
            learningObjectives: parsed.learningObjectives || parsed.objectives || [],
            successCriteria: parsed.successCriteria || parsed.criteria || [],
            constraints: parsed.constraints || [],
            realWorldApplication: parsed.realWorldApplication || parsed.application || ''
          },
          confidence: 1.0,
          format: 'json'
        };
      }
    } catch (e) {
      // Continue with parsing
    }

    // Parse structured format
    const sections = cleanData.split(/\n(?=[A-Z])/);
    
    sections.forEach(section => {
      const lines = section.split('\n');
      const header = lines[0].toLowerCase();
      
      if (header.includes('driving question') || header.includes('essential question')) {
        result.drivingQuestion = lines.slice(1).join(' ').trim();
      } else if (header.includes('objective')) {
        result.learningObjectives = this.extractBulletPoints(section);
      } else if (header.includes('success') || header.includes('criteria')) {
        result.successCriteria = this.extractBulletPoints(section);
      } else if (header.includes('constraint') || header.includes('limitation')) {
        result.constraints = this.extractBulletPoints(section);
      } else if (header.includes('real') || header.includes('application')) {
        result.realWorldApplication = lines.slice(1).join(' ').trim();
      }
    });

    const confidence = result.drivingQuestion ? 0.8 : 0.5;

    return {
      data: result,
      confidence,
      format: 'structured'
    };
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private normalizePhase(phase: any): Phase {
    return {
      id: phase.id || `phase_${Date.now()}`,
      title: phase.title || phase.name || 'Unnamed Phase',
      focus: phase.focus || phase.description || '',
      activities: phase.activities || [],
      duration: phase.duration || phase.timeframe || '1 week'
    };
  }

  private normalizeActivity(activity: any): Activity {
    return {
      id: activity.id || `activity_${Date.now()}`,
      title: activity.title || activity.name || 'Activity',
      description: activity.description || '',
      type: activity.type || 'exploration',
      duration: activity.duration || '1 hour',
      required: activity.required !== false
    };
  }

  private extractTitle(text: string): string {
    const words = text.split(' ').slice(0, 5).join(' ');
    return words.length > 50 ? words.substring(0, 47) + '...' : words;
  }

  private extractDuration(text: string): string {
    const durationRegex = /(\d+)\s*(hour|day|week|month|minute)/i;
    const match = text.match(durationRegex);
    return match ? match[0] : '1 week';
  }

  private extractActivities(text: string): string[] {
    const activities: string[] = [];
    
    // Look for action verbs
    const actionVerbs = ['explore', 'create', 'build', 'design', 'research', 'analyze', 'present', 'collaborate'];
    const words = text.toLowerCase().split(' ');
    
    actionVerbs.forEach(verb => {
      if (words.includes(verb)) {
        const idx = words.indexOf(verb);
        const activity = words.slice(idx, Math.min(idx + 5, words.length)).join(' ');
        activities.push(activity);
      }
    });

    return activities.length > 0 ? activities : ['Explore', 'Create', 'Share'];
  }

  private categorizeActivity(text: string): 'exploration' | 'creation' | 'collaboration' | 'presentation' {
    const lower = text.toLowerCase();
    
    if (lower.includes('research') || lower.includes('explore') || lower.includes('investigate')) {
      return 'exploration';
    }
    if (lower.includes('create') || lower.includes('build') || lower.includes('design')) {
      return 'creation';
    }
    if (lower.includes('collaborate') || lower.includes('team') || lower.includes('group')) {
      return 'collaboration';
    }
    if (lower.includes('present') || lower.includes('share') || lower.includes('demonstrate')) {
      return 'presentation';
    }
    
    return 'exploration';
  }

  private extractBulletPoints(text: string): string[] {
    const points: string[] = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      const cleaned = line.replace(/^[-*•]\s*/, '').trim();
      if (cleaned && !cleaned.toLowerCase().includes('objective') && 
          !cleaned.toLowerCase().includes('criteria') && 
          cleaned.length > 5) {
        points.push(cleaned);
      }
    });
    
    return points;
  }
}

// Export a default instance for convenience
export const contentParsingService = new ContentParsingService();