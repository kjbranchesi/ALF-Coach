/**
 * Formative Assessment Integration
 * Connects formative assessment services with ALF Coach architecture
 */

import { FormativeAssessmentService } from './formative-assessment-service';
import { ProgressTrackingIntegration } from './progress-tracking-integration';
import { EarlyInterventionTriggers } from './early-intervention-triggers';
import { PeerFeedbackProtocolService } from './peer-feedback-protocol';
import { logger } from '../utils/logger';

export interface AssessmentContext {
  journeyId: string;
  phaseId: string;
  activityId: string;
  studentId: string;
  ageGroup: string;
  subject: string;
  learningObjectives: string[];
}

export interface IntegratedAssessment {
  checkpoints: any[]; // From FormativeAssessmentService
  progressData: any; // From ProgressTrackingIntegration
  interventions: any; // From EarlyInterventionTriggers
  peerFeedback: any; // From PeerFeedbackProtocolService
}

export class FormativeAssessmentIntegration {
  private assessmentService: FormativeAssessmentService;
  private progressTracker: ProgressTrackingIntegration;
  private interventionSystem: EarlyInterventionTriggers;
  private peerFeedbackService: PeerFeedbackProtocolService;

  constructor() {
    this.assessmentService = new FormativeAssessmentService();
    this.progressTracker = new ProgressTrackingIntegration();
    this.interventionSystem = new EarlyInterventionTriggers();
    this.peerFeedbackService = new PeerFeedbackProtocolService();
  }

  /**
   * Generate integrated assessment plan for a learning journey phase
   */
  async generateIntegratedAssessment(
    context: AssessmentContext
  ): Promise<IntegratedAssessment> {
    logger.info('Generating integrated assessment', { context });

    try {
      // 1. Generate assessment checkpoints
      const checkpoints = await this.assessmentService.generateCheckpoints(
        context.learningObjectives,
        context.ageGroup,
        'phase' // checkpoint type
      );

      // 2. Initialize progress tracking
      const initialProgress = context.learningObjectives.map(objective => 
        this.progressTracker.trackProgress(
          context.studentId,
          objective,
          0, // initial performance
          0  // initial time
        )
      );

      // 3. Set up peer feedback protocol
      const feedbackProtocol = this.peerFeedbackService.selectProtocol(
        context.ageGroup,
        context.learningObjectives[0],
        4, // typical group size
        30 // time available
      );

      // 4. Create monitoring triggers
      const studentMetrics = {
        studentId: context.studentId,
        taskId: context.activityId,
        accuracy: 0,
        completionRate: 0,
        timeOnTask: 0,
        attemptCount: 0,
        helpRequests: 0,
        errorPatterns: [],
        engagementScore: 1,
        timestamp: new Date()
      };

      const interventionPlan = this.interventionSystem.analyzeStudent(studentMetrics);

      return {
        checkpoints,
        progressData: initialProgress,
        interventions: interventionPlan,
        peerFeedback: {
          protocol: feedbackProtocol,
          prompts: this.peerFeedbackService.generatePrompts(
            feedbackProtocol,
            'project',
            context.ageGroup
          )
        }
      };

    } catch (error) {
      logger.error('Failed to generate integrated assessment', { error, context });
      throw new Error(`Assessment integration failed: ${error.message}`);
    }
  }

  /**
   * Process student response and update all systems
   */
  async processStudentResponse(
    context: AssessmentContext,
    checkpointId: string,
    response: any,
    timeSpent: number
  ): Promise<AssessmentUpdate> {
    logger.info('Processing student response', { context, checkpointId });

    // 1. Evaluate response with assessment service
    const evaluation = await this.assessmentService.evaluateResponse(
      checkpointId,
      response,
      { studentId: context.studentId }
    );

    // 2. Update progress tracking
    const progressUpdate = this.progressTracker.trackProgress(
      context.studentId,
      context.learningObjectives[0],
      evaluation.score,
      timeSpent
    );

    // 3. Generate learning progression
    const progression = this.progressTracker.generateProgression(
      context.learningObjectives[0],
      progressUpdate
    );

    // 4. Check for intervention triggers
    const metrics = {
      studentId: context.studentId,
      taskId: checkpointId,
      accuracy: evaluation.score,
      completionRate: evaluation.isCorrect ? 1 : 0,
      timeOnTask: timeSpent,
      attemptCount: 1,
      helpRequests: 0,
      errorPatterns: this.extractErrorPatterns(evaluation),
      engagementScore: 0.8,
      timestamp: new Date()
    };

    const interventionCheck = this.interventionSystem.analyzeStudent(metrics);

    // 5. Generate next steps
    const nextSteps = this.generateNextSteps(
      evaluation,
      progression,
      interventionCheck
    );

    return {
      evaluation,
      progressUpdate,
      progression,
      interventionCheck,
      nextSteps,
      visualProgress: this.progressTracker.createProgressVisualization(progression)
    };
  }

  /**
   * Facilitate peer feedback session
   */
  async facilitatePeerFeedback(
    context: AssessmentContext,
    workProduct: any,
    participantIds: string[]
  ): Promise<PeerFeedbackResult> {
    logger.info('Facilitating peer feedback', { context, participantIds });

    // 1. Select appropriate protocol
    const protocol = this.peerFeedbackService.selectProtocol(
      context.ageGroup,
      context.learningObjectives[0],
      participantIds.length,
      20 // time available
    );

    // 2. Create session
    const session = this.peerFeedbackService.createSession(
      protocol,
      participantIds,
      {
        id: workProduct.id,
        type: workProduct.type,
        title: workProduct.title,
        description: workProduct.description,
        criteria: context.learningObjectives
      }
    );

    // 3. Generate prompts
    const prompts = this.peerFeedbackService.generatePrompts(
      protocol,
      workProduct.type,
      context.ageGroup
    );

    // 4. Generate reflection questions
    const reflectionQuestions = participantIds.map(id => ({
      participantId: id,
      questions: this.peerFeedbackService.generateReflectionQuestions(
        protocol,
        'reviewer' // default role
      )
    }));

    return {
      session,
      protocol,
      prompts,
      reflectionQuestions,
      instructions: this.generateSessionInstructions(protocol, context)
    };
  }

  /**
   * Generate comprehensive progress report
   */
  async generateProgressReport(
    context: AssessmentContext,
    timeframe: 'daily' | 'weekly' | 'phase'
  ): Promise<ProgressReport> {
    logger.info('Generating progress report', { context, timeframe });

    // Gather all progress data
    const objectiveProgress = context.learningObjectives.map(objective => {
      const data = this.getStoredProgressData(context.studentId, objective);
      return {
        objective,
        progression: this.progressTracker.generateProgression(objective, data),
        insights: this.progressTracker.generateInsights([data])
      };
    });

    // Analyze patterns
    const patterns = this.analyzeProgressPatterns(objectiveProgress);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      objectiveProgress,
      patterns,
      context
    );

    return {
      studentId: context.studentId,
      timeframe,
      objectiveProgress,
      patterns,
      recommendations,
      celebrations: this.identifyCelebrations(objectiveProgress),
      nextSteps: this.prioritizeNextSteps(recommendations)
    };
  }

  /**
   * Extract error patterns from evaluation
   */
  private extractErrorPatterns(evaluation: any): any[] {
    const patterns = [];
    
    if (evaluation.misconceptions && evaluation.misconceptions.length > 0) {
      patterns.push({
        type: 'conceptual',
        frequency: 1,
        examples: evaluation.misconceptions,
        conceptArea: evaluation.conceptArea || 'general'
      });
    }

    return patterns;
  }

  /**
   * Generate next steps based on assessment data
   */
  private generateNextSteps(
    evaluation: any,
    progression: any,
    interventionCheck: any
  ): NextSteps {
    const steps: string[] = [];

    // Based on evaluation
    if (evaluation.isCorrect && evaluation.score >= 0.9) {
      steps.push('Move to extension activities');
    } else if (evaluation.isCorrect) {
      steps.push('Practice with similar problems');
    } else {
      steps.push('Review concept with additional support');
    }

    // Based on progression
    if (progression.supportNeeded) {
      steps.push('Work with teacher or peer tutor');
    }

    // Based on interventions
    if (interventionCheck.priority === 'immediate') {
      steps.push(interventionCheck.interventions[0]?.title || 'Immediate support needed');
    }

    return {
      immediate: steps.slice(0, 1),
      shortTerm: steps.slice(1, 3),
      longTerm: ['Continue building mastery', 'Apply learning to new contexts']
    };
  }

  /**
   * Generate session instructions
   */
  private generateSessionInstructions(protocol: any, context: AssessmentContext): string {
    return `
## ${protocol.title} Instructions

**Time:** ${protocol.structure.timeAllocation} minutes
**Group Size:** ${protocol.structure.groupSize} students

### Process:
${protocol.process.map((step: any) => 
  `${step.stepNumber}. **${step.title}** (${step.duration} min): ${step.instructions}`
).join('\n')}

### Remember:
${protocol.norms.slice(0, 3).map((norm: string) => `- ${norm}`).join('\n')}
    `.trim();
  }

  /**
   * Get stored progress data (mock implementation)
   */
  private getStoredProgressData(studentId: string, objective: string): any {
    // In real implementation, this would fetch from database
    return {
      studentId,
      objectiveId: objective,
      currentLevel: 'developing',
      attempts: 3,
      successRate: 0.75,
      timeSpent: 45,
      lastActivity: new Date(),
      growthRate: 0.6
    };
  }

  /**
   * Analyze progress patterns
   */
  private analyzeProgressPatterns(objectiveProgress: any[]): ProgressPattern[] {
    const patterns: ProgressPattern[] = [];

    // Check for consistent growth
    const growthRates = objectiveProgress.map(op => op.progression.growthRate);
    const avgGrowth = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
    
    if (avgGrowth > 0.7) {
      patterns.push({
        type: 'consistent_growth',
        description: 'Showing steady progress across objectives',
        strength: 'high'
      });
    }

    // Check for struggle areas
    const strugglingObjectives = objectiveProgress.filter(
      op => op.insights.some((i: any) => i.type === 'support')
    );
    
    if (strugglingObjectives.length > 0) {
      patterns.push({
        type: 'challenge_areas',
        description: `Needs support in ${strugglingObjectives.length} objectives`,
        strength: 'medium'
      });
    }

    return patterns;
  }

  /**
   * Generate recommendations based on progress
   */
  private generateRecommendations(
    objectiveProgress: any[],
    patterns: ProgressPattern[],
    context: AssessmentContext
  ): string[] {
    const recommendations: string[] = [];

    // Based on patterns
    patterns.forEach(pattern => {
      if (pattern.type === 'consistent_growth') {
        recommendations.push('Continue current learning pace');
        recommendations.push('Introduce challenge extensions');
      } else if (pattern.type === 'challenge_areas') {
        recommendations.push('Schedule targeted support sessions');
        recommendations.push('Implement differentiated practice');
      }
    });

    // Based on insights
    objectiveProgress.forEach(op => {
      op.insights.forEach((insight: any) => {
        if (insight.type === 'next-step') {
          recommendations.push(insight.recommendation);
        }
      });
    });

    return [...new Set(recommendations)]; // Remove duplicates
  }

  /**
   * Identify celebrations
   */
  private identifyCelebrations(objectiveProgress: any[]): string[] {
    const celebrations: string[] = [];

    objectiveProgress.forEach(op => {
      if (op.progression.currentMilestone >= 3) {
        celebrations.push(`Mastered ${op.objective}!`);
      }
      
      op.insights
        .filter((i: any) => i.type === 'celebration')
        .forEach((i: any) => celebrations.push(i.message));
    });

    return celebrations;
  }

  /**
   * Prioritize next steps
   */
  private prioritizeNextSteps(recommendations: string[]): PrioritizedSteps {
    return {
      immediate: recommendations.slice(0, 2),
      thisWeek: recommendations.slice(2, 5),
      ongoing: recommendations.slice(5)
    };
  }
}

// Type definitions
interface AssessmentUpdate {
  evaluation: any;
  progressUpdate: any;
  progression: any;
  interventionCheck: any;
  nextSteps: NextSteps;
  visualProgress: string;
}

interface NextSteps {
  immediate: string[];
  shortTerm: string[];
  longTerm: string[];
}

interface PeerFeedbackResult {
  session: any;
  protocol: any;
  prompts: any[];
  reflectionQuestions: any[];
  instructions: string;
}

interface ProgressReport {
  studentId: string;
  timeframe: string;
  objectiveProgress: any[];
  patterns: ProgressPattern[];
  recommendations: string[];
  celebrations: string[];
  nextSteps: PrioritizedSteps;
}

interface ProgressPattern {
  type: string;
  description: string;
  strength: 'high' | 'medium' | 'low';
}

interface PrioritizedSteps {
  immediate: string[];
  thisWeek: string[];
  ongoing: string[];
}

// Export singleton instance
export const formativeAssessmentIntegration = new FormativeAssessmentIntegration();