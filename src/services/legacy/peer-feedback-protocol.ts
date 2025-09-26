/**
 * Peer Feedback Protocol Service
 * Structures peer feedback to enhance learning through collaborative assessment
 */

import { logger } from '../utils/logger';

export interface PeerFeedbackProtocol {
  id: string;
  title: string;
  type: FeedbackType;
  structure: FeedbackStructure;
  prompts: FeedbackPrompt[];
  criteria: FeedbackCriterion[];
  process: FeedbackStep[];
  norms: string[];
  supportTools: SupportTool[];
}

export type FeedbackType = 
  | 'stars_and_wishes'
  | 'two_stars_and_a_wish'
  | 'glow_and_grow'
  | 'warm_and_cool'
  | 'plus_delta'
  | 'critical_friends'
  | 'gallery_walk'
  | 'speed_dating_feedback';

export interface FeedbackStructure {
  format: 'written' | 'verbal' | 'visual' | 'mixed';
  timeAllocation: number; // minutes
  groupSize: number;
  roles: FeedbackRole[];
}

export interface FeedbackRole {
  name: string;
  responsibilities: string[];
  scripts?: string[];
}

export interface FeedbackPrompt {
  id: string;
  category: 'positive' | 'constructive' | 'questioning';
  ageGroup: string;
  prompt: string;
  examples: string[];
  sentenceStarters: string[];
}

export interface FeedbackCriterion {
  id: string;
  dimension: string;
  description: string;
  lookFors: string[];
  studentFriendlyLanguage: string;
}

export interface FeedbackStep {
  stepNumber: number;
  title: string;
  duration: number;
  instructions: string;
  materials: string[];
  tips: string[];
}

export interface SupportTool {
  id: string;
  name: string;
  type: 'template' | 'checklist' | 'rubric' | 'guide';
  content: string;
  purpose: string;
}

export interface PeerFeedbackSession {
  protocolId: string;
  participants: Participant[];
  workProduct: WorkProduct;
  feedbackGiven: FeedbackItem[];
  reflections: Reflection[];
  teacherObservations: string[];
  timestamp: Date;
}

export interface Participant {
  id: string;
  role: 'presenter' | 'reviewer' | 'observer';
  preparedness: number; // 1-5 scale
}

export interface WorkProduct {
  id: string;
  type: string;
  title: string;
  description: string;
  criteria: string[];
}

export interface FeedbackItem {
  id: string;
  fromParticipant: string;
  toParticipant: string;
  type: 'positive' | 'constructive' | 'question';
  content: string;
  criterion?: string;
  helpful: boolean;
  specific: boolean;
  actionable: boolean;
}

export interface Reflection {
  participantId: string;
  questions: ReflectionResponse[];
  nextSteps: string[];
  confidenceChange: number; // -2 to +2
}

export interface ReflectionResponse {
  question: string;
  response: string;
}

export class PeerFeedbackProtocolService {
  private protocols: Map<string, PeerFeedbackProtocol>;
  private feedbackHistory: FeedbackItem[];

  constructor() {
    this.protocols = this.initializeProtocols();
    this.feedbackHistory = [];
  }

  /**
   * Get appropriate feedback protocol based on context
   */
  selectProtocol(
    ageGroup: string,
    objective: string,
    groupSize: number,
    timeAvailable: number
  ): PeerFeedbackProtocol {
    logger.info('Selecting peer feedback protocol', { 
      ageGroup, objective, groupSize, timeAvailable 
    });

    // Age-appropriate protocol selection
    const ageAppropriate = this.filterByAge(ageGroup);
    
    // Time-feasible protocols
    const timeFeasible = ageAppropriate.filter(
      protocol => protocol.structure.timeAllocation <= timeAvailable
    );
    
    // Group size compatible
    const sizeCompatible = timeFeasible.filter(
      protocol => groupSize >= protocol.structure.groupSize
    );

    // Select best match
    const selected = sizeCompatible.length > 0 ? 
      sizeCompatible[0] : 
      this.getDefaultProtocol(ageGroup);

    logger.info('Selected protocol', { protocolId: selected.id });
    return selected;
  }

  /**
   * Generate feedback prompts for students
   */
  generatePrompts(
    protocol: PeerFeedbackProtocol,
    workType: string,
    ageGroup: string
  ): FeedbackPrompt[] {
    const relevantPrompts = protocol.prompts.filter(
      prompt => prompt.ageGroup === ageGroup || prompt.ageGroup === 'all'
    );

    // Customize prompts based on work type
    return relevantPrompts.map(prompt => ({
      ...prompt,
      prompt: this.customizePrompt(prompt.prompt, workType),
      examples: prompt.examples.map(ex => this.customizePrompt(ex, workType))
    }));
  }

  /**
   * Create structured feedback session
   */
  createSession(
    protocol: PeerFeedbackProtocol,
    participants: string[],
    workProduct: WorkProduct
  ): PeerFeedbackSession {
    // Assign roles
    const assignedParticipants = this.assignRoles(participants, protocol);

    return {
      protocolId: protocol.id,
      participants: assignedParticipants,
      workProduct,
      feedbackGiven: [],
      reflections: [],
      teacherObservations: [],
      timestamp: new Date()
    };
  }

  /**
   * Process and validate feedback
   */
  processFeedback(
    session: PeerFeedbackSession,
    rawFeedback: string,
    fromId: string,
    toId: string,
    type: 'positive' | 'constructive' | 'question'
  ): FeedbackItem {
    const feedback: FeedbackItem = {
      id: this.generateId(),
      fromParticipant: fromId,
      toParticipant: toId,
      type,
      content: rawFeedback,
      helpful: this.assessHelpfulness(rawFeedback),
      specific: this.assessSpecificity(rawFeedback),
      actionable: this.assessActionability(rawFeedback, type)
    };

    // Add to session and history
    session.feedbackGiven.push(feedback);
    this.feedbackHistory.push(feedback);

    // Generate coaching if needed
    if (!feedback.helpful || !feedback.specific) {
      this.generateFeedbackCoaching(feedback);
    }

    return feedback;
  }

  /**
   * Generate reflection questions
   */
  generateReflectionQuestions(
    protocol: PeerFeedbackProtocol,
    role: 'presenter' | 'reviewer' | 'observer'
  ): string[] {
    const baseQuestions = [
      'What feedback was most helpful to you? Why?',
      'What did you learn from giving/receiving feedback?',
      'How will you use this feedback to improve?'
    ];

    const roleSpecific: Record<string, string[]> = {
      presenter: [
        'Which suggestions will you try first?',
        'What strengths did others notice that surprised you?',
        'What questions do you still have?'
      ],
      reviewer: [
        'What was challenging about giving feedback?',
        'What did you notice about effective feedback?',
        'How did looking at others\' work help you?'
      ],
      observer: [
        'What patterns did you notice in the feedback?',
        'What makes feedback helpful versus unhelpful?',
        'What will you remember for your own work?'
      ]
    };

    return [...baseQuestions, ...(roleSpecific[role] || [])];
  }

  /**
   * Analyze feedback quality
   */
  analyzeFeedbackQuality(session: PeerFeedbackSession): FeedbackAnalysis {
    const totalFeedback = session.feedbackGiven.length;
    const helpfulCount = session.feedbackGiven.filter(f => f.helpful).length;
    const specificCount = session.feedbackGiven.filter(f => f.specific).length;
    const actionableCount = session.feedbackGiven.filter(f => f.actionable).length;

    const typeDistribution = {
      positive: session.feedbackGiven.filter(f => f.type === 'positive').length,
      constructive: session.feedbackGiven.filter(f => f.type === 'constructive').length,
      question: session.feedbackGiven.filter(f => f.type === 'question').length
    };

    const participationRate = session.participants.filter(
      p => session.feedbackGiven.some(f => f.fromParticipant === p.id)
    ).length / session.participants.length;

    return {
      totalItems: totalFeedback,
      qualityMetrics: {
        helpfulness: helpfulCount / totalFeedback,
        specificity: specificCount / totalFeedback,
        actionability: actionableCount / totalFeedback
      },
      typeDistribution,
      participationRate,
      strengths: this.identifyStrengths(session),
      areasForGrowth: this.identifyGrowthAreas(session),
      recommendations: this.generateRecommendations(session)
    };
  }

  /**
   * Initialize feedback protocols
   */
  private initializeProtocols(): Map<string, PeerFeedbackProtocol> {
    const protocols = new Map<string, PeerFeedbackProtocol>();

    // Two Stars and a Wish - Elementary friendly
    protocols.set('two_stars_wish', {
      id: 'two_stars_wish',
      title: 'Two Stars and a Wish',
      type: 'two_stars_and_a_wish',
      structure: {
        format: 'written',
        timeAllocation: 15,
        groupSize: 2,
        roles: [
          {
            name: 'Presenter',
            responsibilities: ['Share work', 'Listen carefully', 'Ask clarifying questions'],
            scripts: ['Here is my work on...', 'Can you help me with...']
          },
          {
            name: 'Reviewer',
            responsibilities: ['Look carefully', 'Find two strengths', 'Suggest one improvement'],
            scripts: ['I really like how you...', 'One thing that might make it even better is...']
          }
        ]
      },
      prompts: [
        {
          id: 'star1',
          category: 'positive',
          ageGroup: 'elementary',
          prompt: 'Share something specific you like about their work',
          examples: ['I like how you used colorful details', 'Your explanation is very clear'],
          sentenceStarters: ['I really like how you...', 'You did a great job with...']
        },
        {
          id: 'wish1',
          category: 'constructive',
          ageGroup: 'elementary',
          prompt: 'Share one idea to make their work even better',
          examples: ['You could add more examples', 'Try explaining this part more'],
          sentenceStarters: ['Maybe you could...', 'It might help if you...']
        }
      ],
      criteria: [
        {
          id: 'clarity',
          dimension: 'Communication',
          description: 'Work clearly expresses ideas',
          lookFors: ['Complete sentences', 'Organized thoughts', 'Clear explanations'],
          studentFriendlyLanguage: 'I can understand your ideas'
        }
      ],
      process: [
        {
          stepNumber: 1,
          title: 'Present',
          duration: 3,
          instructions: 'Presenter shares their work and explains their thinking',
          materials: ['Student work', 'Feedback form'],
          tips: ['Speak clearly', 'Point to specific parts']
        },
        {
          stepNumber: 2,
          title: 'Review',
          duration: 5,
          instructions: 'Reviewer examines work and thinks about feedback',
          materials: ['Feedback prompts', 'Sticky notes'],
          tips: ['Look carefully', 'Be specific']
        },
        {
          stepNumber: 3,
          title: 'Share',
          duration: 5,
          instructions: 'Reviewer shares two stars and one wish',
          materials: ['Completed feedback'],
          tips: ['Be kind', 'Be helpful']
        },
        {
          stepNumber: 4,
          title: 'Respond',
          duration: 2,
          instructions: 'Presenter thanks reviewer and asks questions',
          materials: [],
          tips: ['Say thank you', 'Ask for clarification if needed']
        }
      ],
      norms: [
        'Be kind and respectful',
        'Be specific in your feedback',
        'Focus on the work, not the person',
        'Listen carefully',
        'Say thank you'
      ],
      supportTools: [
        {
          id: 'feedback_form',
          name: 'Stars and Wishes Form',
          type: 'template',
          content: 'Star 1: ___\nStar 2: ___\nWish: ___',
          purpose: 'Structure feedback for young learners'
        }
      ]
    });

    // Critical Friends Protocol - Secondary
    protocols.set('critical_friends', {
      id: 'critical_friends',
      title: 'Critical Friends Protocol',
      type: 'critical_friends',
      structure: {
        format: 'verbal',
        timeAllocation: 30,
        groupSize: 4,
        roles: [
          {
            name: 'Presenter',
            responsibilities: ['Present work and dilemma', 'Listen without defending', 'Reflect on feedback']
          },
          {
            name: 'Critical Friends',
            responsibilities: ['Ask probing questions', 'Offer warm and cool feedback', 'Suggest alternatives']
          },
          {
            name: 'Process Observer',
            responsibilities: ['Monitor time', 'Ensure protocol is followed', 'Note group dynamics']
          }
        ]
      },
      prompts: [
        {
          id: 'warm_feedback',
          category: 'positive',
          ageGroup: 'secondary',
          prompt: 'Identify strengths and effective elements',
          examples: ['Your thesis is compelling because...', 'The evidence you chose effectively...'],
          sentenceStarters: ['I appreciate how you...', 'The strength I see is...']
        },
        {
          id: 'cool_feedback',
          category: 'constructive',
          ageGroup: 'secondary',
          prompt: 'Raise questions and suggest improvements',
          examples: ['Have you considered...', 'What if you tried...'],
          sentenceStarters: ['I wonder if...', 'It might strengthen your work to...']
        },
        {
          id: 'probing_questions',
          category: 'questioning',
          ageGroup: 'secondary',
          prompt: 'Ask questions to deepen thinking',
          examples: ['What led you to this approach?', 'How does this connect to...'],
          sentenceStarters: ['Can you explain...', 'What would happen if...']
        }
      ],
      criteria: [
        {
          id: 'depth',
          dimension: 'Critical Thinking',
          description: 'Work demonstrates deep analysis',
          lookFors: ['Multiple perspectives', 'Evidence-based reasoning', 'Nuanced understanding'],
          studentFriendlyLanguage: 'Shows thoughtful analysis'
        },
        {
          id: 'originality',
          dimension: 'Creativity',
          description: 'Work shows original thinking',
          lookFors: ['Unique connections', 'Creative solutions', 'Personal voice'],
          studentFriendlyLanguage: 'Brings fresh ideas'
        }
      ],
      process: [
        {
          stepNumber: 1,
          title: 'Presentation',
          duration: 5,
          instructions: 'Presenter shares work and poses focusing question',
          materials: ['Work sample', 'Focusing question'],
          tips: ['Be clear about what feedback you need', 'Provide context']
        },
        {
          stepNumber: 2,
          title: 'Clarifying Questions',
          duration: 5,
          instructions: 'Friends ask clarifying questions only',
          materials: [],
          tips: ['No suggestions yet', 'Seek to understand']
        },
        {
          stepNumber: 3,
          title: 'Feedback Preparation',
          duration: 3,
          instructions: 'Friends silently prepare feedback',
          materials: ['Note cards'],
          tips: ['Consider warm and cool feedback', 'Be specific']
        },
        {
          stepNumber: 4,
          title: 'Warm Feedback',
          duration: 5,
          instructions: 'Friends share appreciations and strengths',
          materials: [],
          tips: ['Start positive', 'Be genuine']
        },
        {
          stepNumber: 5,
          title: 'Cool Feedback',
          duration: 7,
          instructions: 'Friends share questions and suggestions',
          materials: [],
          tips: ['Frame as wonderings', 'Offer alternatives']
        },
        {
          stepNumber: 6,
          title: 'Reflection',
          duration: 5,
          instructions: 'Presenter reflects on feedback received',
          materials: ['Reflection form'],
          tips: ['No need to respond to each point', 'Focus on takeaways']
        }
      ],
      norms: [
        'Assume positive intentions',
        'Step up, step back',
        'Be hard on content, soft on people',
        'Stick to protocol timing',
        'Maintain confidentiality'
      ],
      supportTools: [
        {
          id: 'focusing_question',
          name: 'Focusing Question Guide',
          type: 'guide',
          content: 'Frame your question to get the feedback you need',
          purpose: 'Help presenters articulate their needs'
        }
      ]
    });

    return protocols;
  }

  /**
   * Filter protocols by age appropriateness
   */
  private filterByAge(ageGroup: string): PeerFeedbackProtocol[] {
    const ageMapping: Record<string, string[]> = {
      'Early Childhood': ['stars_and_wishes', 'glow_and_grow'],
      'Elementary': ['two_stars_and_a_wish', 'plus_delta', 'gallery_walk'],
      'Middle': ['warm_and_cool', 'critical_friends', 'gallery_walk'],
      'High': ['critical_friends', 'speed_dating_feedback'],
      'Adult': ['critical_friends', 'plus_delta']
    };

    const ageKey = Object.keys(ageMapping).find(key => 
      ageGroup.toLowerCase().includes(key.toLowerCase())
    );

    const appropriateTypes = ageKey ? ageMapping[ageKey] : ['two_stars_and_a_wish'];
    
    return Array.from(this.protocols.values()).filter(
      protocol => appropriateTypes.includes(protocol.type)
    );
  }

  /**
   * Get default protocol for age group
   */
  private getDefaultProtocol(ageGroup: string): PeerFeedbackProtocol {
    if (ageGroup.includes('Elementary') || ageGroup.includes('Early')) {
      return this.protocols.get('two_stars_wish')!;
    }
    return this.protocols.get('critical_friends')!;
  }

  /**
   * Customize prompt for work type
   */
  private customizePrompt(prompt: string, workType: string): string {
    return prompt.replace(/\{work\}/g, workType)
                 .replace(/\{Work\}/g, workType.charAt(0).toUpperCase() + workType.slice(1));
  }

  /**
   * Assign participant roles
   */
  private assignRoles(
    participants: string[],
    protocol: PeerFeedbackProtocol
  ): Participant[] {
    const roles = protocol.structure.roles;
    const assigned: Participant[] = [];

    participants.forEach((id, index) => {
      const role = roles[index % roles.length];
      assigned.push({
        id,
        role: role.name.toLowerCase() as 'presenter' | 'reviewer' | 'observer',
        preparedness: 4 // Default to good preparedness
      });
    });

    return assigned;
  }

  /**
   * Assess feedback helpfulness
   */
  private assessHelpfulness(feedback: string): boolean {
    // Check for constructive elements
    const constructiveIndicators = [
      'because', 'try', 'could', 'might', 'consider',
      'example', 'such as', 'like', 'specifically'
    ];

    return constructiveIndicators.some(indicator => 
      feedback.toLowerCase().includes(indicator)
    );
  }

  /**
   * Assess feedback specificity
   */
  private assessSpecificity(feedback: string): boolean {
    // Check for specific references
    const vaguePhrases = [
      'good job', 'nice work', 'great', 'awesome',
      'bad', 'wrong', 'needs work', 'fix this'
    ];

    const hasVague = vaguePhrases.some(phrase => 
      feedback.toLowerCase().includes(phrase)
    );

    // Longer feedback tends to be more specific
    return !hasVague && feedback.split(' ').length > 5;
  }

  /**
   * Assess feedback actionability
   */
  private assessActionability(feedback: string, type: string): boolean {
    if (type === 'positive') return true; // Positive feedback doesn't need to be actionable

    const actionableIndicators = [
      'try', 'could', 'add', 'remove', 'change', 'move',
      'include', 'explain', 'describe', 'show', 'use'
    ];

    return actionableIndicators.some(indicator => 
      feedback.toLowerCase().includes(indicator)
    );
  }

  /**
   * Generate coaching for poor feedback
   */
  private generateFeedbackCoaching(feedback: FeedbackItem): string {
    const coaching: string[] = [];

    if (!feedback.specific) {
      coaching.push('Try to point to specific examples in the work');
    }

    if (!feedback.helpful) {
      coaching.push('Explain why this would improve the work');
    }

    if (!feedback.actionable && feedback.type === 'constructive') {
      coaching.push('Suggest a specific action they could take');
    }

    return coaching.join('. ');
  }

  /**
   * Identify session strengths
   */
  private identifyStrengths(session: PeerFeedbackSession): string[] {
    const strengths: string[] = [];

    const qualityFeedback = session.feedbackGiven.filter(
      f => f.helpful && f.specific && f.actionable
    );

    if (qualityFeedback.length > session.feedbackGiven.length * 0.7) {
      strengths.push('High quality feedback throughout');
    }

    const balanced = this.checkBalancedFeedback(session);
    if (balanced) {
      strengths.push('Good balance of positive and constructive feedback');
    }

    if (session.reflections.some(r => r.confidenceChange > 0)) {
      strengths.push('Feedback boosted student confidence');
    }

    return strengths;
  }

  /**
   * Identify growth areas
   */
  private identifyGrowthAreas(session: PeerFeedbackSession): string[] {
    const areas: string[] = [];

    const nonSpecific = session.feedbackGiven.filter(f => !f.specific);
    if (nonSpecific.length > session.feedbackGiven.length * 0.3) {
      areas.push('Increase specificity in feedback');
    }

    const questions = session.feedbackGiven.filter(f => f.type === 'question');
    if (questions.length === 0) {
      areas.push('Include probing questions to deepen thinking');
    }

    return areas;
  }

  /**
   * Generate session recommendations
   */
  private generateRecommendations(session: PeerFeedbackSession): string[] {
    const recommendations: string[] = [];

    if (session.participants.some(p => p.preparedness < 3)) {
      recommendations.push('Review feedback protocol before next session');
    }

    if (session.feedbackGiven.length < session.participants.length * 2) {
      recommendations.push('Encourage more participation from all students');
    }

    recommendations.push('Practice giving specific examples in feedback');
    recommendations.push('Follow up on suggested improvements');

    return recommendations;
  }

  /**
   * Check if feedback is balanced
   */
  private checkBalancedFeedback(session: PeerFeedbackSession): boolean {
    const positive = session.feedbackGiven.filter(f => f.type === 'positive').length;
    const constructive = session.feedbackGiven.filter(f => f.type === 'constructive').length;
    
    const ratio = positive / (constructive || 1);
    return ratio >= 1 && ratio <= 3; // Good balance is 1:1 to 3:1
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Additional interfaces
interface FeedbackAnalysis {
  totalItems: number;
  qualityMetrics: {
    helpfulness: number;
    specificity: number;
    actionability: number;
  };
  typeDistribution: {
    positive: number;
    constructive: number;
    question: number;
  };
  participationRate: number;
  strengths: string[];
  areasForGrowth: string[];
  recommendations: string[];
}

// Export singleton instance
export const peerFeedbackService = new PeerFeedbackProtocolService();