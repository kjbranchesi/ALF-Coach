/**
 * Formative Assessment Integration Service
 * Integrates formative assessments with existing ALF Coach PBL stages and data flow
 */

import { 
  FormativeAssessmentCollection,
  ExitTicket,
  PeerAssessment,
  SelfReflection,
  QuickCheck,
  ClassProgressDashboard,
  StudentProgressData,
  PBLStage,
  AssessmentType,
  ConfidenceLevel,
  DEFAULT_EXIT_TICKET_QUESTIONS,
  DEFAULT_REFLECTION_PROMPTS,
  DEFAULT_PEER_ASSESSMENT_CRITERIA,
  validateFormativeAssessmentCollection
} from '../types/FormativeAssessmentTypes';
import { UnifiedProject } from '../types/ProjectDataTypes';

interface AssessmentTrigger {
  stage: PBLStage;
  condition: 'stage_entry' | 'stage_completion' | 'time_interval' | 'manual';
  assessmentTypes: AssessmentType[];
  priority: 'low' | 'medium' | 'high';
}

interface AssessmentInsights {
  averageConfidence: number;
  commonChallenges: string[];
  studentsNeedingSupport: string[];
  readyForExtension: string[];
  nextSteps: string[];
}

export class FormativeAssessmentIntegrationService {
  private assessmentData: Map<string, FormativeAssessmentCollection> = new Map();

  /**
   * Defines when assessments should be triggered during the PBL journey
   */
  private readonly assessmentTriggers: AssessmentTrigger[] = [
    {
      stage: PBLStage.BIG_IDEA,
      condition: 'stage_completion',
      assessmentTypes: [AssessmentType.EXIT_TICKET, AssessmentType.SELF_REFLECTION],
      priority: 'high'
    },
    {
      stage: PBLStage.ESSENTIAL_QUESTION,
      condition: 'stage_completion',
      assessmentTypes: [AssessmentType.EXIT_TICKET, AssessmentType.QUICK_CHECK],
      priority: 'high'
    },
    {
      stage: PBLStage.CHALLENGE,
      condition: 'stage_entry',
      assessmentTypes: [AssessmentType.SELF_REFLECTION],
      priority: 'medium'
    },
    {
      stage: PBLStage.JOURNEY,
      condition: 'time_interval',
      assessmentTypes: [AssessmentType.PEER_ASSESSMENT, AssessmentType.PROGRESS_CHECKPOINT],
      priority: 'high'
    },
    {
      stage: PBLStage.DELIVERABLES,
      condition: 'stage_entry',
      assessmentTypes: [AssessmentType.PEER_ASSESSMENT, AssessmentType.SELF_REFLECTION],
      priority: 'high'
    },
    {
      stage: PBLStage.REFLECTION,
      condition: 'stage_completion',
      assessmentTypes: [AssessmentType.SELF_REFLECTION, AssessmentType.EXIT_TICKET],
      priority: 'high'
    }
  ];

  /**
   * Initialize assessment collection for a project
   */
  async initializeAssessments(
    projectId: string, 
    userId: string, 
    project: UnifiedProject
  ): Promise<FormativeAssessmentCollection> {
    const collection: FormativeAssessmentCollection = {
      id: `assessment-${projectId}`,
      projectId,
      userId,
      exitTickets: [],
      peerAssessments: [],
      selfReflections: [],
      quickChecks: [],
      settings: {
        enablePeerAssessment: true,
        enableSelfReflection: true,
        exitTicketFrequency: 'per_stage',
        anonymousPeerFeedback: false,
        requireReflectionCompletion: true,
        dashboardUpdateFrequency: 60
      }
    };

    this.assessmentData.set(projectId, collection);
    return collection;
  }

  /**
   * Check if assessments should be triggered based on project state
   */
  shouldTriggerAssessment(
    project: UnifiedProject,
    currentStage: PBLStage,
    condition: 'stage_entry' | 'stage_completion' | 'time_interval' | 'manual'
  ): AssessmentTrigger[] {
    return this.assessmentTriggers.filter(trigger => 
      trigger.stage === currentStage && trigger.condition === condition
    );
  }

  /**
   * Generate appropriate exit ticket for a PBL stage
   */
  generateExitTicket(stage: PBLStage, projectContext: UnifiedProject): ExitTicket {
    const questions = DEFAULT_EXIT_TICKET_QUESTIONS[stage] || [];
    
    return {
      id: `exit-ticket-${stage}-${Date.now()}`,
      title: `${stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Exit Ticket`,
      pblStage: stage,
      questions: questions.map((q, index) => ({
        ...q,
        id: `${stage}-q${index + 1}`
      })),
      responses: [],
      metadata: {
        createdAt: new Date(),
        isCompleted: false
      }
    };
  }

  /**
   * Generate self-reflection prompts for a PBL stage
   */
  generateSelfReflection(stage: PBLStage, projectContext: UnifiedProject): SelfReflection {
    const prompts = DEFAULT_REFLECTION_PROMPTS[stage] || [];
    
    return {
      id: `reflection-${stage}-${Date.now()}`,
      title: `${stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Reflection`,
      pblStage: stage,
      prompts,
      responses: [],
      learningGoalsProgress: [],
      metadata: {
        createdAt: new Date(),
        isCompleted: false
      }
    };
  }

  /**
   * Generate peer assessment for collaboration during PBL
   */
  generatePeerAssessment(
    stage: PBLStage,
    assessorId: string,
    assesseeId: string,
    assesseeName: string
  ): PeerAssessment {
    const criteria = Object.values(DEFAULT_PEER_ASSESSMENT_CRITERIA);
    
    return {
      id: `peer-assessment-${stage}-${Date.now()}`,
      title: `${stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Peer Assessment`,
      assessorId,
      assesseeId,
      pblStage: stage,
      criteria,
      feedback: [],
      metadata: {
        createdAt: new Date(),
        isAnonymous: false,
        isCompleted: false
      }
    };
  }

  /**
   * Generate quick check assessment
   */
  generateQuickCheck(
    stage: PBLStage,
    type: QuickCheck['type'],
    prompt?: string
  ): QuickCheck {
    const defaultPrompts = {
      'think_pair_share': `Share your thoughts about the ${stage.replace('_', ' ').toLowerCase()} we just explored.`,
      'gallery_walk': `Review the ${stage.replace('_', ' ').toLowerCase()} examples and provide feedback.`,
      'thumbs_up_down': `I understand the key concepts from ${stage.replace('_', ' ').toLowerCase()}.`,
      'exit_slip': `Reflect on your learning from ${stage.replace('_', ' ').toLowerCase()}.`,
      'one_word': `Describe ${stage.replace('_', ' ').toLowerCase()} in one word.`,
      'muddiest_point': `What was most confusing about ${stage.replace('_', ' ').toLowerCase()}?`
    };

    return {
      id: `quick-check-${type}-${Date.now()}`,
      type,
      title: `${type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${stage.replace('_', ' ')}`,
      description: `Quick formative assessment during ${stage.replace('_', ' ').toLowerCase()}`,
      pblStage: stage,
      prompt: prompt || defaultPrompts[type],
      responses: [],
      metadata: {
        createdAt: new Date()
      }
    };
  }

  /**
   * Analyze assessment data to provide insights for teachers
   */
  async analyzeAssessmentData(
    projectId: string,
    studentIds: string[]
  ): Promise<AssessmentInsights> {
    const collection = this.assessmentData.get(projectId);
    if (!collection) {
      throw new Error(`No assessment data found for project ${projectId}`);
    }

    // Analyze exit tickets for confidence trends
    const confidenceScores: number[] = [];
    collection.exitTickets.forEach(ticket => {
      ticket.responses.forEach(response => {
        if (response.confidence) {
          confidenceScores.push(response.confidence);
        }
      });
    });

    const averageConfidence = confidenceScores.length > 0 
      ? confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length
      : 2.5;

    // Extract common challenges from reflections and exit tickets
    const commonChallenges: string[] = [];
    collection.selfReflections.forEach(reflection => {
      reflection.responses.forEach(response => {
        if (response.response.toLowerCase().includes('difficult') || 
            response.response.toLowerCase().includes('challenging') ||
            response.response.toLowerCase().includes('confused')) {
          // Extract key challenge words/phrases
          const words = response.response.split(' ');
          words.forEach(word => {
            if (word.length > 4 && !commonChallenges.includes(word.toLowerCase())) {
              commonChallenges.push(word.toLowerCase());
            }
          });
        }
      });
    });

    // Identify students needing support (low confidence, struggling themes)
    const studentsNeedingSupport: string[] = [];
    const readyForExtension: string[] = [];

    // This would typically analyze individual student data
    // For now, we'll provide placeholder logic
    studentIds.forEach(studentId => {
      const studentConfidence = Math.random() * 4 + 1; // Placeholder
      if (studentConfidence < 2.5) {
        studentsNeedingSupport.push(studentId);
      } else if (studentConfidence > 3.5) {
        readyForExtension.push(studentId);
      }
    });

    // Generate next steps based on insights
    const nextSteps: string[] = [];
    if (averageConfidence < 2.5) {
      nextSteps.push('Consider re-teaching key concepts with different approaches');
      nextSteps.push('Provide additional scaffolding and support materials');
    }
    if (studentsNeedingSupport.length > studentIds.length * 0.3) {
      nextSteps.push('Implement small group interventions');
      nextSteps.push('Check prerequisite knowledge and skills');
    }
    if (readyForExtension.length > 0) {
      nextSteps.push('Provide extension activities for advanced learners');
      nextSteps.push('Consider peer tutoring opportunities');
    }

    return {
      averageConfidence,
      commonChallenges: commonChallenges.slice(0, 5),
      studentsNeedingSupport,
      readyForExtension,
      nextSteps
    };
  }

  /**
   * Generate progress dashboard data
   */
  async generateProgressDashboard(
    projectId: string,
    classId: string,
    currentStage: PBLStage,
    studentIds: string[]
  ): Promise<ClassProgressDashboard> {
    const collection = this.assessmentData.get(projectId);
    if (!collection) {
      throw new Error(`No assessment data found for project ${projectId}`);
    }

    // Generate mock student progress data (in real implementation, this would aggregate actual data)
    const students: StudentProgressData[] = studentIds.map(studentId => ({
      studentId,
      studentName: `Student ${studentId.slice(-4)}`, // Placeholder name
      pblStage: currentStage,
      completionRate: Math.floor(Math.random() * 40) + 60, // 60-100%
      engagementLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
      strugglingAreas: this.getRandomStrugglingAreas(),
      strengths: this.getRandomStrengths(),
      lastActivity: new Date(),
      interventionsNeeded: this.getRandomInterventions(),
      confidenceTrends: [
        {
          stage: currentStage,
          averageConfidence: Math.random() * 2 + 2, // 2-4 range
          timestamp: new Date()
        }
      ]
    }));

    // Generate class metrics
    const averageProgress = students.reduce((sum, s) => sum + s.completionRate, 0) / students.length;
    const averageEngagement = students.reduce((sum, s) => {
      const engagementMap = { low: 1, medium: 3, high: 5 };
      return sum + engagementMap[s.engagementLevel];
    }, 0) / students.length;

    // Generate alerts
    const alerts = this.generateAlerts(students);

    return {
      id: `dashboard-${projectId}`,
      classId,
      projectId,
      currentStage,
      students,
      classMetrics: {
        averageProgress,
        averageEngagement,
        completionRates: {
          [PBLStage.BIG_IDEA]: 85,
          [PBLStage.ESSENTIAL_QUESTION]: 78,
          [PBLStage.CHALLENGE]: 65,
          [PBLStage.JOURNEY]: 45,
          [PBLStage.DELIVERABLES]: 20,
          [PBLStage.REFLECTION]: 10
        },
        commonChallenges: ['collaboration', 'time management', 'research skills'],
        successfulStrategies: ['peer feedback', 'scaffolded activities', 'visual organizers']
      },
      alerts,
      lastUpdated: new Date()
    };
  }

  /**
   * Save assessment data (integrate with existing data persistence)
   */
  async saveAssessmentData(
    projectId: string, 
    collection: FormativeAssessmentCollection
  ): Promise<void> {
    // Validate the data
    validateFormativeAssessmentCollection(collection);
    
    // Store in memory (in real implementation, save to Firebase/database)
    this.assessmentData.set(projectId, collection);
    
    // Here you would integrate with existing Firebase services
    // await FirebaseService.saveFormativeAssessments(projectId, collection);
  }

  /**
   * Load assessment data for a project
   */
  async loadAssessmentData(projectId: string): Promise<FormativeAssessmentCollection | null> {
    return this.assessmentData.get(projectId) || null;
  }

  /**
   * Generate appropriate intervention suggestions
   */
  generateInterventionSuggestions(
    insights: AssessmentInsights,
    stage: PBLStage
  ): Array<{ type: string; description: string; priority: 'low' | 'medium' | 'high' }> {
    const suggestions = [];

    if (insights.averageConfidence < 2.0) {
      suggestions.push({
        type: 'reteach',
        description: `Re-teach key concepts from ${stage.replace('_', ' ').toLowerCase()} with different strategies`,
        priority: 'high' as const
      });
    }

    if (insights.studentsNeedingSupport.length > 0) {
      suggestions.push({
        type: 'scaffold',
        description: `Provide additional scaffolding for ${insights.studentsNeedingSupport.length} students`,
        priority: 'high' as const
      });
    }

    if (insights.readyForExtension.length > 0) {
      suggestions.push({
        type: 'extend',
        description: `Offer extension activities for ${insights.readyForExtension.length} advanced learners`,
        priority: 'medium' as const
      });
    }

    if (insights.commonChallenges.length > 0) {
      suggestions.push({
        type: 'targeted_support',
        description: `Address common challenges: ${insights.commonChallenges.join(', ')}`,
        priority: 'medium' as const
      });
    }

    return suggestions;
  }

  // Helper methods
  private getRandomStrugglingAreas(): string[] {
    const areas = ['collaboration', 'research', 'time management', 'communication', 'problem solving', 'creativity'];
    const count = Math.floor(Math.random() * 3);
    return areas.sort(() => Math.random() - 0.5).slice(0, count);
  }

  private getRandomStrengths(): string[] {
    const strengths = ['creative thinking', 'leadership', 'analytical skills', 'communication', 'collaboration', 'persistence'];
    const count = Math.floor(Math.random() * 3) + 1;
    return strengths.sort(() => Math.random() - 0.5).slice(0, count);
  }

  private getRandomInterventions(): Array<'scaffold' | 'extend' | 'reteach' | 'peer_support'> {
    const interventions: Array<'scaffold' | 'extend' | 'reteach' | 'peer_support'> = [];
    if (Math.random() < 0.3) interventions.push('scaffold');
    if (Math.random() < 0.2) interventions.push('extend');
    if (Math.random() < 0.2) interventions.push('reteach');
    if (Math.random() < 0.3) interventions.push('peer_support');
    return interventions;
  }

  private generateAlerts(students: StudentProgressData[]) {
    const alerts = [];
    
    const lowEngagement = students.filter(s => s.engagementLevel === 'low');
    if (lowEngagement.length > 0) {
      alerts.push({
        type: 'low_engagement' as const,
        studentIds: lowEngagement.map(s => s.studentId),
        description: `${lowEngagement.length} students showing low engagement`,
        suggestedAction: 'Check in with students individually and adjust activities',
        priority: 'medium' as const,
        timestamp: new Date()
      });
    }

    const behindSchedule = students.filter(s => s.completionRate < 60);
    if (behindSchedule.length > 0) {
      alerts.push({
        type: 'behind_schedule' as const,
        studentIds: behindSchedule.map(s => s.studentId),
        description: `${behindSchedule.length} students behind schedule`,
        suggestedAction: 'Provide additional support and consider extending timeline',
        priority: 'high' as const,
        timestamp: new Date()
      });
    }

    return alerts;
  }
}