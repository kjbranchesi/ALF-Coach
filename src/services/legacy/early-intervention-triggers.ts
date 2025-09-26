/**
 * Early Intervention Trigger System
 * Identifies when students need additional support and generates targeted interventions
 */

import { logger } from '../utils/logger';

export interface InterventionTrigger {
  id: string;
  type: TriggerType;
  threshold: number;
  metric: MetricType;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export type TriggerType = 
  | 'performance_drop'
  | 'repeated_errors'
  | 'time_struggle'
  | 'engagement_decline'
  | 'misconception_pattern'
  | 'skill_gap'
  | 'confidence_issue';

export type MetricType = 
  | 'accuracy'
  | 'completion_rate'
  | 'time_on_task'
  | 'attempt_count'
  | 'help_requests'
  | 'error_pattern'
  | 'engagement_score';

export interface StudentMetrics {
  studentId: string;
  taskId: string;
  accuracy: number;
  completionRate: number;
  timeOnTask: number; // minutes
  attemptCount: number;
  helpRequests: number;
  errorPatterns: ErrorPattern[];
  engagementScore: number;
  timestamp: Date;
}

export interface ErrorPattern {
  type: string;
  frequency: number;
  examples: string[];
  conceptArea: string;
}

export interface Intervention {
  id: string;
  triggerId: string;
  type: InterventionType;
  title: string;
  description: string;
  activities: InterventionActivity[];
  estimatedDuration: number; // minutes
  targetSkills: string[];
  successCriteria: string[];
}

export type InterventionType = 
  | 'reteach'
  | 'scaffold'
  | 'peer_support'
  | 'teacher_conference'
  | 'practice_boost'
  | 'conceptual_bridge'
  | 'confidence_builder';

export interface InterventionActivity {
  id: string;
  type: string;
  title: string;
  instructions: string;
  materials: string[];
  duration: number;
  supportLevel: 'high' | 'medium' | 'low';
}

export interface InterventionPlan {
  studentId: string;
  triggers: TriggeredAlert[];
  interventions: Intervention[];
  priority: 'immediate' | 'soon' | 'monitor';
  recommendedSequence: string[]; // intervention IDs in order
  parentCommunication: ParentMessage;
  teacherAlert: TeacherAlert;
}

export interface TriggeredAlert {
  trigger: InterventionTrigger;
  metricValue: number;
  timestamp: Date;
  context: string;
}

export interface ParentMessage {
  subject: string;
  message: string;
  suggestedActions: string[];
  resources: string[];
}

export interface TeacherAlert {
  priority: 'high' | 'medium' | 'low';
  summary: string;
  detailedAnalysis: string;
  recommendedActions: string[];
  groupingSuggestions?: string[];
}

export class EarlyInterventionTriggers {
  private triggers: InterventionTrigger[];
  private interventionLibrary: Map<string, Intervention>;

  constructor() {
    this.triggers = this.initializeTriggers();
    this.interventionLibrary = this.initializeInterventions();
  }

  /**
   * Analyze student metrics and identify triggered interventions
   */
  analyzeStudent(metrics: StudentMetrics): InterventionPlan {
    const triggeredAlerts: TriggeredAlert[] = [];

    // Check each trigger against student metrics
    for (const trigger of this.triggers) {
      const metricValue = this.getMetricValue(metrics, trigger.metric);
      
      if (this.isTriggerMet(trigger, metricValue)) {
        triggeredAlerts.push({
          trigger,
          metricValue,
          timestamp: new Date(),
          context: this.generateContext(metrics, trigger)
        });
      }
    }

    // Generate intervention plan based on triggers
    const interventions = this.selectInterventions(triggeredAlerts, metrics);
    const priority = this.determinePriority(triggeredAlerts);
    const sequence = this.optimizeInterventionSequence(interventions);

    return {
      studentId: metrics.studentId,
      triggers: triggeredAlerts,
      interventions,
      priority,
      recommendedSequence: sequence,
      parentCommunication: this.generateParentMessage(triggeredAlerts, interventions),
      teacherAlert: this.generateTeacherAlert(metrics, triggeredAlerts, interventions)
    };
  }

  /**
   * Batch analyze multiple students for grouping opportunities
   */
  analyzeClassroom(allMetrics: StudentMetrics[]): ClassroomInsights {
    const studentPlans = allMetrics.map(metrics => this.analyzeStudent(metrics));
    
    // Identify common intervention needs
    const commonNeeds = this.identifyCommonNeeds(studentPlans);
    
    // Create grouping suggestions
    const groups = this.createInterventionGroups(studentPlans, commonNeeds);
    
    // Generate classroom-level recommendations
    const classroomRecommendations = this.generateClassroomRecommendations(
      studentPlans,
      groups
    );

    return {
      individualPlans: studentPlans,
      interventionGroups: groups,
      commonChallenges: commonNeeds,
      classroomRecommendations,
      priorityStudents: studentPlans
        .filter(plan => plan.priority === 'immediate')
        .map(plan => plan.studentId)
    };
  }

  /**
   * Initialize standard intervention triggers
   */
  private initializeTriggers(): InterventionTrigger[] {
    return [
      {
        id: 'low_accuracy',
        type: 'performance_drop',
        threshold: 0.6,
        metric: 'accuracy',
        description: 'Student accuracy below 60%',
        severity: 'high'
      },
      {
        id: 'high_attempts',
        type: 'repeated_errors',
        threshold: 4,
        metric: 'attempt_count',
        description: 'More than 4 attempts on same task',
        severity: 'medium'
      },
      {
        id: 'excessive_time',
        type: 'time_struggle',
        threshold: 30,
        metric: 'time_on_task',
        description: 'Spending over 30 minutes on single task',
        severity: 'medium'
      },
      {
        id: 'low_engagement',
        type: 'engagement_decline',
        threshold: 0.5,
        metric: 'engagement_score',
        description: 'Engagement score below 50%',
        severity: 'medium'
      },
      {
        id: 'multiple_help_requests',
        type: 'confidence_issue',
        threshold: 3,
        metric: 'help_requests',
        description: 'More than 3 help requests',
        severity: 'low'
      }
    ];
  }

  /**
   * Initialize intervention library
   */
  private initializeInterventions(): Map<string, Intervention> {
    const interventions = new Map<string, Intervention>();

    // Reteaching intervention
    interventions.set('reteach_basics', {
      id: 'reteach_basics',
      triggerId: 'low_accuracy',
      type: 'reteach',
      title: 'Concept Review Session',
      description: 'Revisit fundamental concepts with visual aids and manipulatives',
      activities: [
        {
          id: 'visual_intro',
          type: 'demonstration',
          title: 'Visual Concept Introduction',
          instructions: 'Use visual representations to explain the concept',
          materials: ['concept maps', 'diagrams', 'real-world examples'],
          duration: 10,
          supportLevel: 'high'
        },
        {
          id: 'guided_practice',
          type: 'practice',
          title: 'Step-by-Step Practice',
          instructions: 'Work through problems together with scaffolding',
          materials: ['practice worksheets', 'manipulatives'],
          duration: 15,
          supportLevel: 'high'
        }
      ],
      estimatedDuration: 25,
      targetSkills: ['conceptual understanding', 'procedural knowledge'],
      successCriteria: ['Can explain concept in own words', 'Completes guided problems with 80% accuracy']
    });

    // Scaffold intervention
    interventions.set('scaffold_support', {
      id: 'scaffold_support',
      triggerId: 'high_attempts',
      type: 'scaffold',
      title: 'Breaking It Down',
      description: 'Decompose complex tasks into manageable steps',
      activities: [
        {
          id: 'task_analysis',
          type: 'analysis',
          title: 'Task Decomposition',
          instructions: 'Break the problem into smaller, manageable parts',
          materials: ['task cards', 'step-by-step guides'],
          duration: 5,
          supportLevel: 'medium'
        },
        {
          id: 'chunked_practice',
          type: 'practice',
          title: 'Practice Each Step',
          instructions: 'Master each component before combining',
          materials: ['scaffolded worksheets'],
          duration: 20,
          supportLevel: 'medium'
        }
      ],
      estimatedDuration: 25,
      targetSkills: ['problem decomposition', 'systematic approach'],
      successCriteria: ['Can identify task components', 'Successfully completes each subtask']
    });

    // Peer support intervention
    interventions.set('peer_collaboration', {
      id: 'peer_collaboration',
      triggerId: 'multiple_help_requests',
      type: 'peer_support',
      title: 'Learning Partners',
      description: 'Collaborative learning with structured peer support',
      activities: [
        {
          id: 'think_pair_share',
          type: 'collaboration',
          title: 'Think-Pair-Share',
          instructions: 'Work with a partner to solve problems together',
          materials: ['partner worksheets', 'discussion prompts'],
          duration: 15,
          supportLevel: 'low'
        }
      ],
      estimatedDuration: 15,
      targetSkills: ['collaboration', 'communication', 'peer learning'],
      successCriteria: ['Actively participates in discussion', 'Can explain solution to partner']
    });

    return interventions;
  }

  /**
   * Get metric value from student metrics
   */
  private getMetricValue(metrics: StudentMetrics, metricType: MetricType): number {
    switch (metricType) {
      case 'accuracy': return metrics.accuracy;
      case 'completion_rate': return metrics.completionRate;
      case 'time_on_task': return metrics.timeOnTask;
      case 'attempt_count': return metrics.attemptCount;
      case 'help_requests': return metrics.helpRequests;
      case 'engagement_score': return metrics.engagementScore;
      case 'error_pattern': return metrics.errorPatterns.length;
      default: return 0;
    }
  }

  /**
   * Check if trigger threshold is met
   */
  private isTriggerMet(trigger: InterventionTrigger, metricValue: number): boolean {
    switch (trigger.type) {
      case 'performance_drop':
      case 'engagement_decline':
        return metricValue < trigger.threshold;
      default:
        return metricValue > trigger.threshold;
    }
  }

  /**
   * Generate context for triggered alert
   */
  private generateContext(metrics: StudentMetrics, trigger: InterventionTrigger): string {
    const contextParts = [];
    
    if (metrics.errorPatterns.length > 0) {
      contextParts.push(`Common errors in: ${metrics.errorPatterns[0].conceptArea}`);
    }
    
    if (metrics.timeOnTask > 20) {
      contextParts.push(`Extended time on task: ${metrics.timeOnTask} minutes`);
    }
    
    if (metrics.attemptCount > 3) {
      contextParts.push(`Multiple attempts: ${metrics.attemptCount}`);
    }
    
    return contextParts.join('; ') || 'Standard learning pace';
  }

  /**
   * Select appropriate interventions based on triggers
   */
  private selectInterventions(
    triggers: TriggeredAlert[], 
    metrics: StudentMetrics
  ): Intervention[] {
    const interventions: Intervention[] = [];
    
    for (const alert of triggers) {
      const intervention = Array.from(this.interventionLibrary.values())
        .find(i => i.triggerId === alert.trigger.id);
      
      if (intervention) {
        interventions.push(intervention);
      }
    }
    
    // Remove duplicates and limit to top 3
    return interventions
      .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
      .slice(0, 3);
  }

  /**
   * Determine overall priority level
   */
  private determinePriority(triggers: TriggeredAlert[]): 'immediate' | 'soon' | 'monitor' {
    const severities = triggers.map(t => t.trigger.severity);
    
    if (severities.includes('critical') || severities.filter(s => s === 'high').length >= 2) {
      return 'immediate';
    } else if (severities.includes('high') || severities.filter(s => s === 'medium').length >= 2) {
      return 'soon';
    }
    
    return 'monitor';
  }

  /**
   * Optimize intervention sequence
   */
  private optimizeInterventionSequence(interventions: Intervention[]): string[] {
    // Sort by estimated duration (shortest first) and support level
    return interventions
      .sort((a, b) => {
        if (a.activities[0].supportLevel === 'high' && b.activities[0].supportLevel !== 'high') {
          return -1;
        }
        return a.estimatedDuration - b.estimatedDuration;
      })
      .map(i => i.id);
  }

  /**
   * Generate parent communication
   */
  private generateParentMessage(
    triggers: TriggeredAlert[], 
    interventions: Intervention[]
  ): ParentMessage {
    const priority = triggers.some(t => t.trigger.severity === 'high');
    
    return {
      subject: priority ? 
        'Your child needs some extra support' : 
        'Update on your child\'s learning progress',
      message: this.generateParentMessageContent(triggers, interventions),
      suggestedActions: [
        'Review today\'s work together',
        'Celebrate effort and progress',
        'Practice similar problems for 10-15 minutes',
        'Reach out if you have questions'
      ],
      resources: [
        'Parent guide to supporting learning at home',
        'Practice materials aligned with classroom work',
        'Tips for building math confidence'
      ]
    };
  }

  /**
   * Generate parent message content
   */
  private generateParentMessageContent(
    triggers: TriggeredAlert[],
    interventions: Intervention[]
  ): string {
    const challenges = triggers.map(t => t.trigger.description).join(', ');
    const support = interventions.map(i => i.title).join(', ');
    
    return `We noticed your child may benefit from some additional support with their current learning. 
    
Specifically: ${challenges}

We're providing targeted support through: ${support}

Your child is working hard, and with this extra support, we're confident they'll master these concepts soon!`;
  }

  /**
   * Generate teacher alert
   */
  private generateTeacherAlert(
    metrics: StudentMetrics,
    triggers: TriggeredAlert[],
    interventions: Intervention[]
  ): TeacherAlert {
    const priority = this.determineAlertPriority(triggers);
    
    return {
      priority,
      summary: this.generateAlertSummary(metrics, triggers),
      detailedAnalysis: this.generateDetailedAnalysis(metrics, triggers, interventions),
      recommendedActions: this.generateTeacherActions(triggers, interventions),
      groupingSuggestions: this.generateGroupingSuggestions(metrics, interventions)
    };
  }

  private determineAlertPriority(triggers: TriggeredAlert[]): 'high' | 'medium' | 'low' {
    const highCount = triggers.filter(t => t.trigger.severity === 'high').length;
    if (highCount >= 2) return 'high';
    if (highCount === 1) return 'medium';
    return 'low';
  }

  private generateAlertSummary(metrics: StudentMetrics, triggers: TriggeredAlert[]): string {
    return `Student ${metrics.studentId} showing ${triggers.length} intervention indicators. 
    Accuracy: ${(metrics.accuracy * 100).toFixed(0)}%, 
    Attempts: ${metrics.attemptCount}, 
    Time on task: ${metrics.timeOnTask} minutes`;
  }

  private generateDetailedAnalysis(
    metrics: StudentMetrics,
    triggers: TriggeredAlert[],
    interventions: Intervention[]
  ): string {
    const errorSummary = metrics.errorPatterns.length > 0 ?
      `Common errors in: ${metrics.errorPatterns.map(e => e.conceptArea).join(', ')}` :
      'No specific error patterns identified';
    
    return `Detailed Analysis:
    
Triggers: ${triggers.map(t => t.trigger.description).join('; ')}

Error Patterns: ${errorSummary}

Recommended Interventions: ${interventions.map(i => `${i.title} (${i.estimatedDuration} min)`).join(', ')}

Student has made ${metrics.attemptCount} attempts with ${metrics.helpRequests} help requests.`;
  }

  private generateTeacherActions(
    triggers: TriggeredAlert[],
    interventions: Intervention[]
  ): string[] {
    const actions: string[] = [];
    
    if (triggers.some(t => t.trigger.type === 'performance_drop')) {
      actions.push('Schedule small group reteaching session');
    }
    
    if (triggers.some(t => t.trigger.type === 'confidence_issue')) {
      actions.push('Provide positive reinforcement and confidence building');
    }
    
    if (interventions.some(i => i.type === 'peer_support')) {
      actions.push('Pair with supportive peer partner');
    }
    
    actions.push('Monitor progress over next 2-3 sessions');
    
    return actions;
  }

  private generateGroupingSuggestions(
    metrics: StudentMetrics,
    interventions: Intervention[]
  ): string[] {
    const suggestions: string[] = [];
    
    if (metrics.errorPatterns.length > 0) {
      suggestions.push(`Group with students struggling with ${metrics.errorPatterns[0].conceptArea}`);
    }
    
    if (interventions.some(i => i.type === 'reteach')) {
      suggestions.push('Include in small group reteaching session');
    }
    
    if (interventions.some(i => i.type === 'peer_support')) {
      suggestions.push('Pair with strong peer mentor');
    }
    
    return suggestions;
  }

  /**
   * Identify common needs across multiple students
   */
  private identifyCommonNeeds(plans: InterventionPlan[]): CommonNeed[] {
    const needsMap = new Map<string, number>();
    
    plans.forEach(plan => {
      plan.interventions.forEach(intervention => {
        const count = needsMap.get(intervention.type) || 0;
        needsMap.set(intervention.type, count + 1);
      });
    });
    
    return Array.from(needsMap.entries())
      .map(([type, count]) => ({
        interventionType: type as InterventionType,
        studentCount: count,
        percentage: (count / plans.length) * 100
      }))
      .filter(need => need.studentCount >= 2)
      .sort((a, b) => b.studentCount - a.studentCount);
  }

  /**
   * Create intervention groups
   */
  private createInterventionGroups(
    plans: InterventionPlan[],
    commonNeeds: CommonNeed[]
  ): InterventionGroup[] {
    const groups: InterventionGroup[] = [];
    
    commonNeeds.forEach(need => {
      const studentsWithNeed = plans
        .filter(plan => 
          plan.interventions.some(i => i.type === need.interventionType)
        )
        .map(plan => plan.studentId);
      
      if (studentsWithNeed.length >= 2) {
        groups.push({
          id: `group_${need.interventionType}`,
          interventionType: need.interventionType,
          studentIds: studentsWithNeed,
          size: studentsWithNeed.length,
          recommendedActivities: this.getGroupActivities(need.interventionType)
        });
      }
    });
    
    return groups;
  }

  /**
   * Get group activities for intervention type
   */
  private getGroupActivities(type: InterventionType): string[] {
    const activities: Record<InterventionType, string[]> = {
      reteach: [
        'Small group mini-lesson',
        'Concept mapping together',
        'Peer teaching rotation'
      ],
      scaffold: [
        'Step-by-step group work',
        'Jigsaw method for complex tasks',
        'Collaborative problem solving'
      ],
      peer_support: [
        'Partner work stations',
        'Peer tutoring pairs',
        'Think-pair-share activities'
      ],
      teacher_conference: [
        'Individual check-ins',
        'Goal setting sessions',
        'Progress monitoring meetings'
      ],
      practice_boost: [
        'Game-based practice',
        'Timed challenges',
        'Practice stations rotation'
      ],
      conceptual_bridge: [
        'Real-world connections',
        'Cross-curricular projects',
        'Hands-on explorations'
      ],
      confidence_builder: [
        'Success celebrations',
        'Growth mindset activities',
        'Positive peer feedback'
      ]
    };
    
    return activities[type] || [];
  }

  /**
   * Generate classroom recommendations
   */
  private generateClassroomRecommendations(
    plans: InterventionPlan[],
    groups: InterventionGroup[]
  ): string[] {
    const recommendations: string[] = [];
    
    const immediateCount = plans.filter(p => p.priority === 'immediate').length;
    if (immediateCount > 0) {
      recommendations.push(`${immediateCount} students need immediate intervention`);
    }
    
    if (groups.length > 0) {
      recommendations.push(`Form ${groups.length} intervention groups for targeted support`);
    }
    
    const commonInterventions = this.getMostCommonInterventions(plans);
    if (commonInterventions.length > 0) {
      recommendations.push(`Focus whole-class review on: ${commonInterventions.join(', ')}`);
    }
    
    recommendations.push('Schedule follow-up assessments in 3-5 days');
    
    return recommendations;
  }

  /**
   * Get most common intervention needs
   */
  private getMostCommonInterventions(plans: InterventionPlan[]): string[] {
    const typeCount = new Map<string, number>();
    
    plans.forEach(plan => {
      plan.interventions.forEach(intervention => {
        intervention.targetSkills.forEach(skill => {
          const count = typeCount.get(skill) || 0;
          typeCount.set(skill, count + 1);
        });
      });
    });
    
    return Array.from(typeCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([skill]) => skill);
  }
}

// Additional interfaces
interface CommonNeed {
  interventionType: InterventionType;
  studentCount: number;
  percentage: number;
}

interface InterventionGroup {
  id: string;
  interventionType: InterventionType;
  studentIds: string[];
  size: number;
  recommendedActivities: string[];
}

interface ClassroomInsights {
  individualPlans: InterventionPlan[];
  interventionGroups: InterventionGroup[];
  commonChallenges: CommonNeed[];
  classroomRecommendations: string[];
  priorityStudents: string[];
}

// Export singleton instance
export const interventionSystem = new EarlyInterventionTriggers();