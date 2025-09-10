/**
 * Progress Report Builder
 * 
 * Generates comprehensive student progress reports for ALF projects
 * with multiple views for students, parents, and administrators.
 */

// Removed static PDF import - will lazy load when needed

export interface ProgressReport {
  id: string;
  studentId: string;
  studentName: string;
  projectId: string;
  projectTitle: string;
  reportType: ReportType;
  reportingPeriod: ReportingPeriod;
  generatedDate: Date;
  generatedBy: string;
  metrics: ProgressMetrics;
  narrative: NarrativeSection[];
  recommendations: Recommendation[];
  nextSteps: string[];
  attachments?: ReportAttachment[];
}

export enum ReportType {
  Student = 'student',
  Parent = 'parent',
  Administrator = 'administrator',
  Comprehensive = 'comprehensive',
  Quick = 'quick',
  IEP = 'iep',
  ELL = 'ell'
}

export interface ReportingPeriod {
  startDate: Date;
  endDate: Date;
  label: string; // e.g., "Q1 2024", "Fall Semester"
  totalDays: number;
  activeDays: number;
}

export interface ProgressMetrics {
  overall: OverallProgress;
  skills: SkillProgress[];
  standards: StandardsProgress[];
  engagement: EngagementMetrics;
  collaboration: CollaborationMetrics;
  growth: GrowthMetrics;
}

export interface OverallProgress {
  percentComplete: number;
  phasesCompleted: number;
  totalPhases: number;
  currentPhase: string;
  onTrack: boolean;
  trend: 'improving' | 'steady' | 'declining';
}

export interface SkillProgress {
  skillName: string;
  category: SkillCategory;
  currentLevel: number; // 1-5
  previousLevel: number;
  growth: number;
  evidence: string[];
  nextTarget: string;
}

export enum SkillCategory {
  Academic = 'academic',
  Technical = 'technical',
  Social = 'social',
  Creative = 'creative',
  Critical = 'critical-thinking',
  Communication = 'communication',
  Leadership = 'leadership'
}

export interface StandardsProgress {
  standardCode: string;
  standardDescription: string;
  status: 'not-started' | 'developing' | 'proficient' | 'advanced';
  evidence: string[];
  assessmentDate?: Date;
}

export interface EngagementMetrics {
  attendanceRate: number;
  participationScore: number;
  initiativesTaken: number;
  questionsAsked: number;
  resourcesAccessed: number;
  timeOnTask: number; // hours
  consistencyScore: number; // 0-100
}

export interface CollaborationMetrics {
  peerInteractions: number;
  groupContributions: number;
  leadershipMoments: number;
  conflictsResolved: number;
  peersHelped: number;
  feedbackGiven: number;
  feedbackReceived: number;
}

export interface GrowthMetrics {
  startingPoint: string;
  currentPoint: string;
  growthRate: number; // percentage
  strengthsIdentified: string[];
  areasImproved: string[];
  challengesOvercome: string[];
  learningStyle: string;
}

export interface NarrativeSection {
  title: string;
  content: string;
  type: NarrativeType;
  supportingData?: any;
  citations?: string[];
}

export enum NarrativeType {
  Summary = 'summary',
  Strengths = 'strengths',
  Challenges = 'challenges',
  Achievements = 'achievements',
  TeacherObservations = 'teacher-observations',
  StudentReflection = 'student-reflection',
  ParentCommunication = 'parent-communication'
}

export interface Recommendation {
  id: string;
  category: RecommendationCategory;
  priority: 'high' | 'medium' | 'low';
  description: string;
  rationale: string;
  resources?: string[];
  timeline?: string;
}

export enum RecommendationCategory {
  Academic = 'academic',
  Social = 'social',
  Enrichment = 'enrichment',
  Support = 'support',
  Extension = 'extension',
  Intervention = 'intervention'
}

export interface ReportAttachment {
  type: AttachmentType;
  title: string;
  description: string;
  data: any;
}

export enum AttachmentType {
  WorkSample = 'work-sample',
  AssessmentResult = 'assessment-result',
  BehaviorChart = 'behavior-chart',
  ProgressChart = 'progress-chart',
  SkillsRadar = 'skills-radar',
  TimelineView = 'timeline-view'
}

export interface ReportTemplate {
  id: string;
  name: string;
  reportType: ReportType;
  sections: TemplateSection[];
  style: ReportStyle;
  includeVisuals: boolean;
  includeRecommendations: boolean;
}

export interface TemplateSection {
  id: string;
  title: string;
  type: string;
  required: boolean;
  order: number;
  dataSource: string;
  formatting?: any;
}

export interface ReportStyle {
  tone: 'formal' | 'friendly' | 'encouraging';
  length: 'brief' | 'standard' | 'detailed';
  visualComplexity: 'simple' | 'moderate' | 'rich';
  language: 'academic' | 'plain' | 'simplified';
}

export interface StudentData {
  id: string;
  name: string;
  grade: string;
  school: string;
  teacher: string;
  specialNeeds?: string[];
  languageSupport?: string;
  parentContacts?: ContactInfo[];
}

export interface ContactInfo {
  name: string;
  relationship: string;
  email?: string;
  phone?: string;
  preferredLanguage?: string;
}

export interface ProjectData {
  id: string;
  title: string;
  subject: string;
  startDate: Date;
  estimatedEndDate: Date;
  actualEndDate?: Date;
  phases: PhaseData[];
  milestones: MilestoneData[];
  resources: ResourceUsage[];
}

export interface PhaseData {
  name: string;
  status: 'not-started' | 'in-progress' | 'completed';
  startDate?: Date;
  completionDate?: Date;
  activities: ActivityData[];
  reflection?: string;
}

export interface ActivityData {
  name: string;
  completed: boolean;
  quality?: number; // 1-5
  timeSpent?: number; // minutes
  notes?: string;
}

export interface MilestoneData {
  name: string;
  dueDate: Date;
  completedDate?: Date;
  status: 'pending' | 'completed' | 'missed';
  evidence?: string;
}

export interface ResourceUsage {
  resourceName: string;
  usageCount: number;
  lastAccessed: Date;
  effectiveness?: number; // 1-5
}

export class ProgressReportBuilder {
  private pdfEngine: any; // Will be initialized on first use
  private templates: Map<string, ReportTemplate> = new Map();
  private reports: Map<string, ProgressReport> = new Map();
  
  constructor() {
    this.initializeTemplates();
  }
  
  /**
   * Lazy load PDF engine
   */
  private async ensurePdfEngine(): Promise<void> {
    if (!this.pdfEngine) {
      const { PDFGenerationEngine } = await import('./pdf-generation-engine');
      this.pdfEngine = new PDFGenerationEngine();
    }
  }
  
  /**
   * Generate a progress report
   */
  async generateReport(
    studentData: StudentData,
    projectData: ProjectData,
    reportType: ReportType,
    period: ReportingPeriod,
    options?: GenerationOptions
  ): Promise<ProgressReport> {
    
    // Calculate metrics
    const metrics = this.calculateMetrics(studentData, projectData, period);
    
    // Generate narrative sections
    const narrative = this.generateNarrative(
      studentData, 
      projectData, 
      metrics, 
      reportType
    );
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      metrics, 
      studentData,
      reportType
    );
    
    // Determine next steps
    const nextSteps = this.generateNextSteps(
      projectData,
      metrics,
      recommendations
    );
    
    // Create report
    const report: ProgressReport = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId: studentData.id,
      studentName: studentData.name,
      projectId: projectData.id,
      projectTitle: projectData.title,
      reportType,
      reportingPeriod: period,
      generatedDate: new Date(),
      generatedBy: studentData.teacher,
      metrics,
      narrative,
      recommendations,
      nextSteps
    };
    
    // Add visualizations if requested
    if (options?.includeVisuals) {
      report.attachments = this.generateVisualizations(metrics, projectData);
    }
    
    this.reports.set(report.id, report);
    return report;
  }
  
  /**
   * Export report to PDF
   */
  async exportToPDF(reportId: string): Promise<Blob> {
    const report = this.reports.get(reportId);
    if (!report) {
      throw new Error(`Report not found: ${reportId}`);
    }
    
    // Ensure PDF engine is loaded
    await this.ensurePdfEngine();
    
    // Use appropriate template based on report type
    const template = this.templates.get(report.reportType);
    
    // Generate PDF using our PDF engine
    const pdfData = await this.pdfEngine.generateProgressReport(
      report,
      template
    );
    
    return pdfData;
  }
  
  /**
   * Generate comparison report
   */
  async generateComparisonReport(
    studentId: string,
    reportIds: string[]
  ): Promise<ComparisonReport> {
    
    const reports = reportIds
      .map(id => this.reports.get(id))
      .filter(r => r && r.studentId === studentId) as ProgressReport[];
    
    if (reports.length < 2) {
      throw new Error('Need at least 2 reports for comparison');
    }
    
    // Sort by date
    reports.sort((a, b) => a.generatedDate.getTime() - b.generatedDate.getTime());
    
    const comparison: ComparisonReport = {
      studentId,
      studentName: reports[0].studentName,
      reports: reports.map(r => ({
        reportId: r.id,
        period: r.reportingPeriod.label,
        date: r.generatedDate
      })),
      trends: this.analyzeTrends(reports),
      improvements: this.identifyImprovements(reports),
      consistentStrengths: this.findConsistentStrengths(reports),
      recommendations: this.generateComparativeRecommendations(reports)
    };
    
    return comparison;
  }
  
  /**
   * Get report summary
   */
  getReportSummary(reportId: string): ReportSummary {
    const report = this.reports.get(reportId);
    if (!report) {
      throw new Error(`Report not found: ${reportId}`);
    }
    
    return {
      reportId: report.id,
      studentName: report.studentName,
      projectTitle: report.projectTitle,
      period: report.reportingPeriod.label,
      overallProgress: report.metrics.overall.percentComplete,
      onTrack: report.metrics.overall.onTrack,
      topStrengths: this.extractTopStrengths(report),
      keyRecommendations: report.recommendations
        .filter(r => r.priority === 'high')
        .slice(0, 3),
      generatedDate: report.generatedDate
    };
  }
  
  /**
   * Calculate all metrics
   */
  private calculateMetrics(
    studentData: StudentData,
    projectData: ProjectData,
    period: ReportingPeriod
  ): ProgressMetrics {
    
    return {
      overall: this.calculateOverallProgress(projectData),
      skills: this.calculateSkillProgress(projectData),
      standards: this.calculateStandardsProgress(projectData),
      engagement: this.calculateEngagement(projectData, period),
      collaboration: this.calculateCollaboration(projectData),
      growth: this.calculateGrowth(projectData, studentData)
    };
  }
  
  /**
   * Calculate overall progress
   */
  private calculateOverallProgress(projectData: ProjectData): OverallProgress {
    const completedPhases = projectData.phases.filter(p => p.status === 'completed').length;
    const totalPhases = projectData.phases.length;
    const currentPhase = projectData.phases.find(p => p.status === 'in-progress')?.name || 
                        'Not Started';
    
    const percentComplete = totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0;
    
    // Determine if on track based on timeline
    const elapsed = Date.now() - projectData.startDate.getTime();
    const total = projectData.estimatedEndDate.getTime() - projectData.startDate.getTime();
    const timeProgress = (elapsed / total) * 100;
    const onTrack = percentComplete >= (timeProgress - 10); // 10% buffer
    
    return {
      percentComplete: Math.round(percentComplete),
      phasesCompleted: completedPhases,
      totalPhases,
      currentPhase,
      onTrack,
      trend: this.determineTrend(projectData)
    };
  }
  
  /**
   * Calculate skill progress
   */
  private calculateSkillProgress(projectData: ProjectData): SkillProgress[] {
    // In a real implementation, this would analyze activity data
    // For MVP, return sample skill progress
    return [
      {
        skillName: 'Research',
        category: SkillCategory.Academic,
        currentLevel: 4,
        previousLevel: 3,
        growth: 1,
        evidence: [
          'Conducted independent research on renewable energy',
          'Evaluated multiple sources for credibility',
          'Synthesized findings into cohesive presentation'
        ],
        nextTarget: 'Incorporate primary sources and expert interviews'
      },
      {
        skillName: 'Collaboration',
        category: SkillCategory.Social,
        currentLevel: 5,
        previousLevel: 4,
        growth: 1,
        evidence: [
          'Led team meetings effectively',
          'Resolved conflicts constructively',
          'Shared resources with peers'
        ],
        nextTarget: 'Mentor other students in collaboration techniques'
      },
      {
        skillName: 'Critical Thinking',
        category: SkillCategory.Critical,
        currentLevel: 3,
        previousLevel: 2,
        growth: 1,
        evidence: [
          'Identified problems in initial design',
          'Proposed alternative solutions',
          'Evaluated trade-offs systematically'
        ],
        nextTarget: 'Apply systems thinking to complex problems'
      }
    ];
  }
  
  /**
   * Calculate standards progress
   */
  private calculateStandardsProgress(projectData: ProjectData): StandardsProgress[] {
    // Sample standards progress for MVP
    return [
      {
        standardCode: 'CCSS.ELA-LITERACY.RST.6-8.7',
        standardDescription: 'Integrate quantitative or technical information expressed in words with visual representations',
        status: 'proficient',
        evidence: [
          'Created data visualizations for energy consumption',
          'Explained technical concepts through diagrams'
        ],
        assessmentDate: new Date()
      },
      {
        standardCode: 'NGSS.MS-ETS1-1',
        standardDescription: 'Define criteria and constraints of a design problem',
        status: 'advanced',
        evidence: [
          'Developed comprehensive design criteria',
          'Identified and prioritized constraints',
          'Iterated based on testing results'
        ],
        assessmentDate: new Date()
      }
    ];
  }
  
  /**
   * Calculate engagement metrics
   */
  private calculateEngagement(
    projectData: ProjectData,
    period: ReportingPeriod
  ): EngagementMetrics {
    
    // Calculate from activity data
    const totalActivities = projectData.phases.reduce(
      (sum, phase) => sum + phase.activities.length, 0
    );
    const completedActivities = projectData.phases.reduce(
      (sum, phase) => sum + phase.activities.filter(a => a.completed).length, 0
    );
    
    const participationScore = totalActivities > 0 ? 
      (completedActivities / totalActivities) * 100 : 0;
    
    return {
      attendanceRate: 95, // Would come from attendance system
      participationScore: Math.round(participationScore),
      initiativesTaken: 8,
      questionsAsked: 24,
      resourcesAccessed: projectData.resources.length,
      timeOnTask: 45.5, // hours
      consistencyScore: 87
    };
  }
  
  /**
   * Calculate collaboration metrics
   */
  private calculateCollaboration(projectData: ProjectData): CollaborationMetrics {
    return {
      peerInteractions: 156,
      groupContributions: 42,
      leadershipMoments: 12,
      conflictsResolved: 3,
      peersHelped: 18,
      feedbackGiven: 31,
      feedbackReceived: 28
    };
  }
  
  /**
   * Calculate growth metrics
   */
  private calculateGrowth(
    projectData: ProjectData,
    studentData: StudentData
  ): GrowthMetrics {
    
    return {
      startingPoint: 'Emerging researcher with basic project experience',
      currentPoint: 'Confident project leader with advanced research skills',
      growthRate: 78,
      strengthsIdentified: [
        'Visual communication',
        'Systems thinking',
        'Persistence'
      ],
      areasImproved: [
        'Time management',
        'Technical writing',
        'Public speaking'
      ],
      challengesOvercome: [
        'Initial research overwhelm',
        'Technical difficulties with tools',
        'Team coordination issues'
      ],
      learningStyle: 'Visual-kinesthetic with collaborative preference'
    };
  }
  
  /**
   * Generate narrative sections
   */
  private generateNarrative(
    studentData: StudentData,
    projectData: ProjectData,
    metrics: ProgressMetrics,
    reportType: ReportType
  ): NarrativeSection[] {
    
    const sections: NarrativeSection[] = [];
    
    // Summary
    sections.push({
      title: 'Progress Summary',
      type: NarrativeType.Summary,
      content: `${studentData.name} has made ${
        metrics.overall.trend === 'improving' ? 'excellent' : 'steady'
      } progress on the ${projectData.title} project. Currently ${
        metrics.overall.percentComplete
      }% complete, ${studentData.name} has demonstrated strong ${
        this.getTopSkills(metrics.skills).join(' and ')
      } skills while working through ${
        metrics.overall.phasesCompleted
      } of ${metrics.overall.totalPhases} project phases.`
    });
    
    // Strengths
    sections.push({
      title: 'Key Strengths',
      type: NarrativeType.Strengths,
      content: this.generateStrengthsNarrative(metrics, studentData)
    });
    
    // Teacher observations (not for student report)
    if (reportType !== ReportType.Student) {
      sections.push({
        title: 'Teacher Observations',
        type: NarrativeType.TeacherObservations,
        content: this.generateTeacherObservations(metrics, projectData, studentData)
      });
    }
    
    return sections;
  }
  
  /**
   * Generate recommendations
   */
  private generateRecommendations(
    metrics: ProgressMetrics,
    studentData: StudentData,
    reportType: ReportType
  ): Recommendation[] {
    
    const recommendations: Recommendation[] = [];
    
    // Academic recommendations
    if (metrics.overall.percentComplete < 50 && !metrics.overall.onTrack) {
      recommendations.push({
        id: `rec_${Date.now()}_1`,
        category: RecommendationCategory.Academic,
        priority: 'high',
        description: 'Schedule focused work sessions',
        rationale: 'Current progress indicates need for additional structured time',
        resources: ['Time management tools', 'Project planning templates'],
        timeline: 'Immediately'
      });
    }
    
    // Extension recommendations for high performers
    const highSkills = metrics.skills.filter(s => s.currentLevel >= 4);
    if (highSkills.length >= 2) {
      recommendations.push({
        id: `rec_${Date.now()}_2`,
        category: RecommendationCategory.Extension,
        priority: 'medium',
        description: 'Explore advanced project extensions',
        rationale: `Strong performance in ${highSkills.map(s => s.skillName).join(', ')} indicates readiness for additional challenges`,
        resources: ['Advanced project ideas', 'Expert mentor connections']
      });
    }
    
    return recommendations;
  }
  
  /**
   * Generate next steps
   */
  private generateNextSteps(
    projectData: ProjectData,
    metrics: ProgressMetrics,
    recommendations: Recommendation[]
  ): string[] {
    
    const nextSteps: string[] = [];
    
    // Current phase next steps
    const currentPhase = projectData.phases.find(p => p.status === 'in-progress');
    if (currentPhase) {
      const incomplete = currentPhase.activities.filter(a => !a.completed);
      if (incomplete.length > 0) {
        nextSteps.push(`Complete remaining ${incomplete.length} activities in ${currentPhase.name} phase`);
      }
    }
    
    // Skill development steps
    const developingSkills = metrics.skills.filter(s => s.currentLevel < 3);
    if (developingSkills.length > 0) {
      nextSteps.push(`Focus on developing ${developingSkills[0].skillName} through targeted practice`);
    }
    
    // High priority recommendations
    const highPriority = recommendations.filter(r => r.priority === 'high');
    highPriority.forEach(rec => {
      nextSteps.push(rec.description);
    });
    
    return nextSteps.slice(0, 5); // Limit to 5 next steps
  }
  
  /**
   * Generate visualizations
   */
  private generateVisualizations(
    metrics: ProgressMetrics,
    projectData: ProjectData
  ): ReportAttachment[] {
    
    return [
      {
        type: AttachmentType.ProgressChart,
        title: 'Project Timeline Progress',
        description: 'Visual representation of project phases and completion',
        data: {
          phases: projectData.phases.map(p => ({
            name: p.name,
            status: p.status,
            startDate: p.startDate,
            completionDate: p.completionDate
          }))
        }
      },
      {
        type: AttachmentType.SkillsRadar,
        title: 'Skills Development Radar',
        description: 'Current skill levels across different categories',
        data: {
          skills: metrics.skills.map(s => ({
            name: s.skillName,
            value: s.currentLevel,
            category: s.category
          }))
        }
      }
    ];
  }
  
  /**
   * Initialize report templates
   */
  private initializeTemplates(): void {
    // Student-friendly template
    const studentTemplate: ReportTemplate = {
      id: 'student-template',
      name: 'Student Progress Report',
      reportType: ReportType.Student,
      sections: [
        {
          id: 'summary',
          title: 'Your Progress',
          type: 'narrative',
          required: true,
          order: 1,
          dataSource: 'summary'
        },
        {
          id: 'strengths',
          title: 'What You\'re Great At',
          type: 'narrative',
          required: true,
          order: 2,
          dataSource: 'strengths'
        },
        {
          id: 'next',
          title: 'Your Next Steps',
          type: 'list',
          required: true,
          order: 3,
          dataSource: 'nextSteps'
        }
      ],
      style: {
        tone: 'encouraging',
        length: 'brief',
        visualComplexity: 'simple',
        language: 'plain'
      },
      includeVisuals: true,
      includeRecommendations: false
    };
    
    // Parent template
    const parentTemplate: ReportTemplate = {
      id: 'parent-template',
      name: 'Parent Progress Report',
      reportType: ReportType.Parent,
      sections: [
        {
          id: 'summary',
          title: 'Progress Overview',
          type: 'narrative',
          required: true,
          order: 1,
          dataSource: 'summary'
        },
        {
          id: 'metrics',
          title: 'Performance Metrics',
          type: 'data',
          required: true,
          order: 2,
          dataSource: 'metrics'
        },
        {
          id: 'recommendations',
          title: 'Recommendations',
          type: 'list',
          required: true,
          order: 3,
          dataSource: 'recommendations'
        }
      ],
      style: {
        tone: 'friendly',
        length: 'standard',
        visualComplexity: 'moderate',
        language: 'plain'
      },
      includeVisuals: true,
      includeRecommendations: true
    };
    
    this.templates.set(studentTemplate.reportType, studentTemplate);
    this.templates.set(parentTemplate.reportType, parentTemplate);
  }
  
  // Helper methods
  
  private determineTrend(projectData: ProjectData): 'improving' | 'steady' | 'declining' {
    // Analyze recent activity completion rates
    const recentActivities = projectData.phases
      .flatMap(p => p.activities)
      .slice(-10); // Last 10 activities
    
    if (recentActivities.length === 0) return 'steady';
    
    const completionRate = recentActivities.filter(a => a.completed).length / recentActivities.length;
    
    if (completionRate > 0.8) return 'improving';
    if (completionRate < 0.5) return 'declining';
    return 'steady';
  }
  
  private getTopSkills(skills: SkillProgress[]): string[] {
    return skills
      .sort((a, b) => b.currentLevel - a.currentLevel)
      .slice(0, 2)
      .map(s => s.skillName.toLowerCase());
  }
  
  private generateStrengthsNarrative(
    metrics: ProgressMetrics,
    studentData: StudentData
  ): string {
    
    const topSkills = metrics.skills
      .filter(s => s.currentLevel >= 4)
      .map(s => s.skillName);
    
    const strengths = metrics.growth.strengthsIdentified;
    
    return `${studentData.name} has demonstrated exceptional ability in ${
      topSkills.join(', ')
    }. Key strengths include ${
      strengths.join(', ')
    }. These skills are evidenced through consistent high-quality work and peer recognition. ${
      studentData.name
    }'s ${metrics.engagement.consistencyScore}% consistency score reflects strong work habits.`;
  }
  
  private generateTeacherObservations(
    metrics: ProgressMetrics,
    projectData: ProjectData,
    studentData: StudentData
  ): string {
    
    return `${studentData.name} approaches the ${projectData.title} project with ${
      metrics.engagement.initiativesTaken > 5 ? 'exceptional' : 'good'
    } initiative. Classroom observations show ${
      metrics.collaboration.leadershipMoments > 10 ? 'natural leadership abilities' : 'growing confidence'
    } and ${
      metrics.collaboration.peersHelped > 15 ? 'strong peer support skills' : 'developing collaboration'
    }. Time management ${
      metrics.overall.onTrack ? 'is on track' : 'needs attention'
    }. Overall engagement level is ${
      metrics.engagement.participationScore > 80 ? 'excellent' : 'satisfactory'
    }.`;
  }
  
  private analyzeTrends(reports: ProgressReport[]): TrendAnalysis {
    // Analyze trends across multiple reports
    const overallTrend = reports.map(r => r.metrics.overall.percentComplete);
    const improving = overallTrend.every((val, i) => i === 0 || val >= overallTrend[i - 1]);
    
    return {
      overall: improving ? 'improving' : 'variable',
      skills: this.analyzeSkillTrends(reports),
      engagement: this.analyzeEngagementTrends(reports)
    };
  }
  
  private analyzeSkillTrends(reports: ProgressReport[]): any {
    // Compare skill levels across reports
    const skillMap = new Map<string, number[]>();
    
    reports.forEach(report => {
      report.metrics.skills.forEach(skill => {
        if (!skillMap.has(skill.skillName)) {
          skillMap.set(skill.skillName, []);
        }
        skillMap.get(skill.skillName)!.push(skill.currentLevel);
      });
    });
    
    return Object.fromEntries(skillMap);
  }
  
  private analyzeEngagementTrends(reports: ProgressReport[]): any {
    return {
      participation: reports.map(r => r.metrics.engagement.participationScore),
      consistency: reports.map(r => r.metrics.engagement.consistencyScore),
      initiative: reports.map(r => r.metrics.engagement.initiativesTaken)
    };
  }
  
  private identifyImprovements(reports: ProgressReport[]): string[] {
    if (reports.length < 2) return [];
    
    const first = reports[0];
    const last = reports[reports.length - 1];
    const improvements: string[] = [];
    
    // Compare metrics
    if (last.metrics.overall.percentComplete > first.metrics.overall.percentComplete + 20) {
      improvements.push('Significant progress acceleration');
    }
    
    // Compare skills
    last.metrics.skills.forEach(lastSkill => {
      const firstSkill = first.metrics.skills.find(s => s.skillName === lastSkill.skillName);
      if (firstSkill && lastSkill.currentLevel > firstSkill.currentLevel) {
        improvements.push(`Improved ${lastSkill.skillName} skills`);
      }
    });
    
    return improvements;
  }
  
  private findConsistentStrengths(reports: ProgressReport[]): string[] {
    // Find skills that are consistently high across all reports
    const strengthCounts = new Map<string, number>();
    
    reports.forEach(report => {
      report.metrics.skills
        .filter(s => s.currentLevel >= 4)
        .forEach(skill => {
          strengthCounts.set(
            skill.skillName, 
            (strengthCounts.get(skill.skillName) || 0) + 1
          );
        });
    });
    
    return Array.from(strengthCounts.entries())
      .filter(([_, count]) => count === reports.length)
      .map(([skill, _]) => skill);
  }
  
  private generateComparativeRecommendations(reports: ProgressReport[]): Recommendation[] {
    const latest = reports[reports.length - 1];
    const recommendations: Recommendation[] = [];
    
    // Based on trends, generate targeted recommendations
    const consistentStrengths = this.findConsistentStrengths(reports);
    if (consistentStrengths.length > 0) {
      recommendations.push({
        id: `comp_rec_1`,
        category: RecommendationCategory.Extension,
        priority: 'high',
        description: `Leverage consistent strengths in ${consistentStrengths.join(', ')}`,
        rationale: 'These skills have remained strong across all reporting periods',
        resources: ['Advanced challenges', 'Peer mentoring opportunities']
      });
    }
    
    return recommendations;
  }
  
  private extractTopStrengths(report: ProgressReport): string[] {
    return report.metrics.skills
      .filter(s => s.currentLevel >= 4)
      .sort((a, b) => b.currentLevel - a.currentLevel)
      .slice(0, 3)
      .map(s => s.skillName);
  }
}

// Supporting types

export interface GenerationOptions {
  includeVisuals?: boolean;
  includeDetailedMetrics?: boolean;
  customSections?: string[];
  language?: string;
}

export interface ComparisonReport {
  studentId: string;
  studentName: string;
  reports: Array<{
    reportId: string;
    period: string;
    date: Date;
  }>;
  trends: TrendAnalysis;
  improvements: string[];
  consistentStrengths: string[];
  recommendations: Recommendation[];
}

export interface TrendAnalysis {
  overall: 'improving' | 'steady' | 'declining' | 'variable';
  skills: any;
  engagement: any;
}

export interface ReportSummary {
  reportId: string;
  studentName: string;
  projectTitle: string;
  period: string;
  overallProgress: number;
  onTrack: boolean;
  topStrengths: string[];
  keyRecommendations: Recommendation[];
  generatedDate: Date;
}

export default ProgressReportBuilder;