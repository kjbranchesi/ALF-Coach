/**
 * ALF Competency Tracking Implementation
 * 
 * Implementation functions for competency tracking, visualization,
 * and analytics that support the main tracking service.
 */

import {
  CompetencyStatus,
  CompetencyGroup,
  TransferRecord,
  AccelerationPeriod,
  CompetencyGoal,
  NextStepRecommendation,
  CompetencyTrackingUpdate,
  ALFCompetencyProfile,
  CertificationLevel,
  CompetencyMilestone,
  TransferPattern,
  GrowthFactor,
  PlateauAnalysis
} from './alf-competency-tracking-service';

import {
  ALFProgressionLevel,
  ALFProgressionEvidence,
  EvidenceType
} from './alf-learning-progression-service';

/**
 * Competency analysis utilities
 */
export interface CompetencyAnalytics {
  calculateCompetencyVelocity(status: CompetencyStatus, timeframe: number): number;
  predictTimeToNextLevel(status: CompetencyStatus): number;
  analyzeCompetencyCorrelations(profile: ALFCompetencyProfile): CompetencyCorrelation[];
  identifyCompetencyGaps(profile: ALFCompetencyProfile): CompetencyGap[];
  generateCompetencyHeatmap(profile: ALFCompetencyProfile): HeatmapData;
}

export interface CompetencyCorrelation {
  competency1: string;
  competency2: string;
  correlationStrength: number; // -1 to 1
  correlationType: 'positive' | 'negative' | 'neutral';
  insights: string[];
}

export interface CompetencyGap {
  competencyId: string;
  gapType: 'missing_evidence' | 'low_transfer' | 'no_community_validation' | 'plateau' | 'imbalanced_development';
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommendations: string[];
}

export interface HeatmapData {
  competencies: string[];
  dimensions: string[];
  values: number[][];
  insights: string[];
}

/**
 * Visualization data generators
 */
export interface CompetencyVisualizationGenerators {
  generateProgressionTimeline(updates: CompetencyTrackingUpdate[]): TimelineData;
  generateCompetencyNetwork(profile: ALFCompetencyProfile): NetworkData;
  generateGrowthCurve(profile: ALFCompetencyProfile): GrowthCurveData;
  generateMilestoneTracker(goals: CompetencyGoal[]): MilestoneTrackerData;
  generateTransferSankey(profile: ALFCompetencyProfile): SankeyData;
}

export interface TimelineData {
  events: TimelineEvent[];
  milestones: TimelineMilestone[];
  periods: TimelinePeriod[];
}

export interface TimelineEvent {
  date: Date;
  type: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  competencies: string[];
}

export interface TimelineMilestone {
  date: Date;
  title: string;
  achieved: boolean;
  competencyId: string;
  celebrationType: 'level_up' | 'goal_achieved' | 'community_validation' | 'transfer_mastery';
}

export interface TimelinePeriod {
  start: Date;
  end: Date;
  type: 'acceleration' | 'steady_growth' | 'plateau' | 'exploration';
  competencies: string[];
  description: string;
}

export interface NetworkData {
  nodes: NetworkNode[];
  links: NetworkLink[];
  clusters: NetworkCluster[];
}

export interface NetworkNode {
  id: string;
  label: string;
  type: 'competency' | 'domain' | 'project' | 'community';
  size: number;
  color: string;
  metadata: any;
}

export interface NetworkLink {
  source: string;
  target: string;
  strength: number;
  type: 'transfer' | 'correlation' | 'prerequisite' | 'synergy';
}

export interface NetworkCluster {
  id: string;
  name: string;
  nodes: string[];
  cohesion: number;
}

export interface GrowthCurveData {
  timePoints: Date[];
  competencyGrowth: Map<string, number[]>;
  overallGrowth: number[];
  projections: GrowthProjection[];
}

export interface GrowthProjection {
  competencyId: string;
  projectedGrowth: number[];
  confidence: number[];
  assumptions: string[];
}

export interface MilestoneTrackerData {
  goals: GoalTrackingData[];
  overallProgress: number;
  onTrackPercentage: number;
  upcomingMilestones: UpcomingMilestone[];
}

export interface GoalTrackingData {
  goalId: string;
  competencyName: string;
  progress: number;
  milestones: MilestoneStatus[];
  projectedCompletion: Date;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface MilestoneStatus {
  milestoneId: string;
  name: string;
  dueDate: Date;
  completed: boolean;
  blockers: string[];
}

export interface UpcomingMilestone {
  goalId: string;
  milestoneId: string;
  dueIn: number; // days
  preparationNeeded: string[];
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export interface SankeyNode {
  id: string;
  name: string;
  category: 'source_competency' | 'target_competency' | 'context' | 'domain';
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
  type: string;
}

/**
 * Competency tracking implementation functions
 */
export class CompetencyTrackingImplementation {
  
  /**
   * Calculate velocity of competency development
   */
  static calculateCompetencyVelocity(
    status: CompetencyStatus,
    updates: CompetencyTrackingUpdate[],
    timeframeDays: number = 30
  ): number {
    const cutoffDate = new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000);
    const relevantUpdates = updates.filter(u => 
      u.competencyId === status.competencyId && u.timestamp >= cutoffDate
    );
    
    // Calculate demonstrations per week
    const demonstrationsPerWeek = (relevantUpdates.length / timeframeDays) * 7;
    
    // Factor in quality of demonstrations
    const qualityMultiplier = relevantUpdates.reduce((sum, update) => {
      if (update.updateType === 'demonstration' && update.details.authenticityScore) {
        return sum + update.details.authenticityScore;
      }
      return sum;
    }, 0) / Math.max(relevantUpdates.length, 1);
    
    // Factor in momentum
    const momentumMultiplier = {
      'accelerating': 1.5,
      'steady': 1.0,
      'slowing': 0.7,
      'dormant': 0.3
    }[status.momentum];
    
    return demonstrationsPerWeek * qualityMultiplier * momentumMultiplier;
  }

  /**
   * Predict time to reach next certification level
   */
  static predictTimeToNextLevel(
    status: CompetencyStatus,
    velocity: number,
    historicalData?: CompetencyTrackingUpdate[]
  ): number {
    const remainingProgress = 100 - status.progressPercentage;
    const currentLevel = status.currentLevel;
    
    // Base time estimates for each level transition (in days)
    const baseTimeByLevel: Record<CertificationLevel, number> = {
      [CertificationLevel.Emerging]: 21,
      [CertificationLevel.Developing]: 28,
      [CertificationLevel.Proficient]: 42,
      [CertificationLevel.Advanced]: 56,
      [CertificationLevel.Expert]: 84,
      [CertificationLevel.Master]: 120
    };
    
    const baseTime = baseTimeByLevel[currentLevel] || 30;
    
    // Adjust based on velocity
    const velocityAdjustment = velocity > 0 ? 1 / velocity : 2;
    
    // Adjust based on transfer and community validation
    const transferBonus = status.transferCount > 2 ? 0.8 : 1.0;
    const communityBonus = status.communityValidations > 0 ? 0.9 : 1.0;
    
    const predictedDays = baseTime * velocityAdjustment * transferBonus * communityBonus;
    
    return Math.round(predictedDays);
  }

  /**
   * Analyze correlations between competencies
   */
  static analyzeCompetencyCorrelations(
    profile: ALFCompetencyProfile
  ): CompetencyCorrelation[] {
    const correlations: CompetencyCorrelation[] = [];
    const competencyIds = Array.from(profile.competencyMap.keys());
    
    // Analyze co-occurrence in evidence
    for (let i = 0; i < competencyIds.length - 1; i++) {
      for (let j = i + 1; j < competencyIds.length; j++) {
        const comp1 = competencyIds[i];
        const comp2 = competencyIds[j];
        
        const evidence1 = profile.portfolioCompetencyLinks.get(comp1) || [];
        const evidence2 = profile.portfolioCompetencyLinks.get(comp2) || [];
        
        // Calculate overlap
        const overlap = evidence1.filter(e => evidence2.includes(e)).length;
        const union = new Set([...evidence1, ...evidence2]).size;
        const correlation = union > 0 ? overlap / union : 0;
        
        if (correlation > 0.3) {
          correlations.push({
            competency1: comp1,
            competency2: comp2,
            correlationStrength: correlation,
            correlationType: 'positive',
            insights: this.generateCorrelationInsights(comp1, comp2, correlation, profile)
          });
        }
      }
    }
    
    return correlations;
  }

  /**
   * Identify gaps in competency development
   */
  static identifyCompetencyGaps(
    profile: ALFCompetencyProfile
  ): CompetencyGap[] {
    const gaps: CompetencyGap[] = [];
    
    for (const [competencyId, status] of profile.competencyMap) {
      // Check for missing evidence
      const evidenceCount = profile.portfolioCompetencyLinks.get(competencyId)?.length || 0;
      if (evidenceCount < 3 && status.currentLevel === CertificationLevel.Emerging) {
        gaps.push({
          competencyId,
          gapType: 'missing_evidence',
          severity: 'high',
          description: `${status.competencyName} needs more evidence of demonstration`,
          recommendations: [
            'Create a project that specifically demonstrates this competency',
            'Document your process and reflection more thoroughly',
            'Seek opportunities to apply this competency in different contexts'
          ]
        });
      }
      
      // Check for low transfer
      if (status.transferCount === 0 && status.demonstrationCount > 3) {
        gaps.push({
          competencyId,
          gapType: 'low_transfer',
          severity: 'medium',
          description: `${status.competencyName} hasn't been applied across different contexts`,
          recommendations: [
            'Try using this competency in a different subject area',
            'Connect this skill to a community project',
            'Collaborate with peers from different domains'
          ]
        });
      }
      
      // Check for community validation
      if (status.communityValidations === 0 && status.currentLevel >= CertificationLevel.Developing) {
        gaps.push({
          competencyId,
          gapType: 'no_community_validation',
          severity: 'medium',
          description: `${status.competencyName} lacks community feedback and validation`,
          recommendations: [
            'Share your work with community partners',
            'Present your projects to authentic audiences',
            'Seek feedback from professionals in the field'
          ]
        });
      }
      
      // Check for plateaus
      if (status.momentum === 'dormant' || status.momentum === 'slowing') {
        gaps.push({
          competencyId,
          gapType: 'plateau',
          severity: status.momentum === 'dormant' ? 'high' : 'medium',
          description: `Progress in ${status.competencyName} has stalled`,
          recommendations: [
            'Set a specific goal for this competency',
            'Find a mentor or collaborator to reignite interest',
            'Try a completely different approach or project type',
            'Connect this competency to your personal interests'
          ]
        });
      }
    }
    
    // Check for imbalanced development
    const competencyLevels = Array.from(profile.competencyMap.values()).map(s => s.progressPercentage);
    const avgProgress = competencyLevels.reduce((a, b) => a + b, 0) / competencyLevels.length;
    const variance = competencyLevels.reduce((sum, level) => sum + Math.pow(level - avgProgress, 2), 0) / competencyLevels.length;
    
    if (variance > 400) { // High variance indicates imbalance
      const laggingCompetencies = Array.from(profile.competencyMap.entries())
        .filter(([_, status]) => status.progressPercentage < avgProgress - 20)
        .map(([id, _]) => id);
      
      for (const competencyId of laggingCompetencies) {
        gaps.push({
          competencyId,
          gapType: 'imbalanced_development',
          severity: 'low',
          description: `This competency is lagging behind your overall development`,
          recommendations: [
            'Consider how this competency connects to your stronger areas',
            'Set small, achievable goals to build momentum',
            'Find projects that combine this with your strengths'
          ]
        });
      }
    }
    
    return gaps;
  }

  /**
   * Generate competency heatmap data
   */
  static generateCompetencyHeatmap(
    profile: ALFCompetencyProfile
  ): HeatmapData {
    const competencies = Array.from(profile.competencyMap.keys());
    const dimensions = [
      'Progress',
      'Demonstrations',
      'Transfer',
      'Community',
      'Momentum',
      'Authenticity'
    ];
    
    const values: number[][] = [];
    
    for (const competencyId of competencies) {
      const status = profile.competencyMap.get(competencyId)!;
      const row = [
        status.progressPercentage / 100,
        Math.min(status.demonstrationCount / 10, 1),
        Math.min(status.transferCount / 5, 1),
        Math.min(status.communityValidations / 3, 1),
        { 'accelerating': 1, 'steady': 0.7, 'slowing': 0.4, 'dormant': 0.1 }[status.momentum],
        0.8 // Would calculate from evidence authenticity scores
      ];
      values.push(row);
    }
    
    const insights = this.generateHeatmapInsights(competencies, dimensions, values);
    
    return {
      competencies,
      dimensions,
      values,
      insights
    };
  }

  /**
   * Generate progression timeline visualization data
   */
  static generateProgressionTimeline(
    updates: CompetencyTrackingUpdate[],
    profile: ALFCompetencyProfile
  ): TimelineData {
    const events: TimelineEvent[] = updates.map(update => ({
      date: update.timestamp,
      type: update.updateType,
      title: this.getUpdateTitle(update),
      description: this.getUpdateDescription(update, profile),
      impact: this.assessUpdateImpact(update),
      competencies: [update.competencyId]
    }));
    
    const milestones: TimelineMilestone[] = this.extractMilestones(updates, profile);
    const periods: TimelinePeriod[] = this.identifyGrowthPeriods(updates, profile);
    
    return { events, milestones, periods };
  }

  /**
   * Generate competency network visualization
   */
  static generateCompetencyNetwork(
    profile: ALFCompetencyProfile
  ): NetworkData {
    const nodes: NetworkNode[] = [];
    const links: NetworkLink[] = [];
    
    // Add competency nodes
    for (const [competencyId, status] of profile.competencyMap) {
      nodes.push({
        id: competencyId,
        label: status.competencyName,
        type: 'competency',
        size: status.progressPercentage,
        color: this.getCompetencyColor(status),
        metadata: status
      });
    }
    
    // Add domain nodes
    const domains = new Set<string>();
    for (const status of profile.competencyMap.values()) {
      domains.add(status.domain);
    }
    
    for (const domain of domains) {
      nodes.push({
        id: `domain_${domain}`,
        label: domain,
        type: 'domain',
        size: 50,
        color: '#cccccc',
        metadata: { domain }
      });
      
      // Link competencies to domains
      for (const [competencyId, status] of profile.competencyMap) {
        if (status.domain === domain) {
          links.push({
            source: competencyId,
            target: `domain_${domain}`,
            strength: 0.5,
            type: 'correlation'
          });
        }
      }
    }
    
    // Add transfer links
    for (const [fromComp, toMap] of profile.transferMatrix.transferStrength) {
      for (const [toComp, strength] of toMap) {
        links.push({
          source: fromComp,
          target: toComp,
          strength: strength,
          type: 'transfer'
        });
      }
    }
    
    // Identify clusters
    const clusters = this.identifyCompetencyClusters(nodes, links);
    
    return { nodes, links, clusters };
  }

  /**
   * Generate growth curve visualization
   */
  static generateGrowthCurve(
    profile: ALFCompetencyProfile,
    updates: CompetencyTrackingUpdate[]
  ): GrowthCurveData {
    const timePoints: Date[] = [];
    const competencyGrowth = new Map<string, number[]>();
    const overallGrowth: number[] = [];
    
    // Create monthly time points for the last year
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      timePoints.push(date);
    }
    
    // Calculate growth for each competency at each time point
    for (const [competencyId, status] of profile.competencyMap) {
      const growth: number[] = [];
      
      for (const timePoint of timePoints) {
        const relevantUpdates = updates.filter(u => 
          u.competencyId === competencyId && 
          u.timestamp <= timePoint
        );
        
        // Simulate growth based on updates
        const progressAtTime = Math.min(relevantUpdates.length * 10, 100);
        growth.push(progressAtTime);
      }
      
      competencyGrowth.set(competencyId, growth);
    }
    
    // Calculate overall growth
    for (let i = 0; i < timePoints.length; i++) {
      let totalProgress = 0;
      let competencyCount = 0;
      
      for (const growth of competencyGrowth.values()) {
        if (growth[i] > 0) {
          totalProgress += growth[i];
          competencyCount++;
        }
      }
      
      overallGrowth.push(competencyCount > 0 ? totalProgress / competencyCount : 0);
    }
    
    // Generate projections
    const projections = this.generateGrowthProjections(profile, competencyGrowth);
    
    return {
      timePoints,
      competencyGrowth,
      overallGrowth,
      projections
    };
  }

  /**
   * Generate milestone tracker visualization
   */
  static generateMilestoneTracker(
    goals: CompetencyGoal[]
  ): MilestoneTrackerData {
    const goalTrackingData: GoalTrackingData[] = goals.map(goal => {
      const completedMilestones = goal.milestones.filter(m => m.completed).length;
      const progress = (completedMilestones / goal.milestones.length) * 100;
      
      const projectedCompletion = this.projectGoalCompletion(goal);
      const riskLevel = this.assessGoalRisk(goal);
      
      return {
        goalId: goal.goalId,
        competencyName: goal.competencyId, // Would lookup actual name
        progress,
        milestones: goal.milestones.map(m => ({
          milestoneId: m.milestoneId,
          name: m.description,
          dueDate: m.targetDate,
          completed: m.completed,
          blockers: [] // Would analyze from progress
        })),
        projectedCompletion,
        riskLevel
      };
    });
    
    const overallProgress = goalTrackingData.reduce((sum, g) => sum + g.progress, 0) / goals.length;
    const onTrackPercentage = (goalTrackingData.filter(g => g.riskLevel === 'low').length / goals.length) * 100;
    
    const upcomingMilestones = this.identifyUpcomingMilestones(goals);
    
    return {
      goals: goalTrackingData,
      overallProgress,
      onTrackPercentage,
      upcomingMilestones
    };
  }

  /**
   * Generate transfer sankey diagram
   */
  static generateTransferSankey(
    profile: ALFCompetencyProfile
  ): SankeyData {
    const nodes: SankeyNode[] = [];
    const links: SankeyLink[] = [];
    
    // Add source competency nodes
    const sourceCompetencies = new Set<string>();
    const targetCompetencies = new Set<string>();
    const contexts = new Set<string>();
    
    for (const transfer of profile.transferMatrix.transfers) {
      sourceCompetencies.add(transfer.fromCompetency);
      targetCompetencies.add(transfer.toCompetency);
      contexts.add(transfer.fromContext);
      contexts.add(transfer.toContext);
    }
    
    // Create nodes
    for (const comp of sourceCompetencies) {
      nodes.push({
        id: `source_${comp}`,
        name: comp,
        category: 'source_competency'
      });
    }
    
    for (const comp of targetCompetencies) {
      nodes.push({
        id: `target_${comp}`,
        name: comp,
        category: 'target_competency'
      });
    }
    
    for (const context of contexts) {
      nodes.push({
        id: `context_${context}`,
        name: context,
        category: 'context'
      });
    }
    
    // Create links based on transfer patterns
    const transferCounts = new Map<string, number>();
    
    for (const transfer of profile.transferMatrix.transfers) {
      const key1 = `source_${transfer.fromCompetency}_context_${transfer.fromContext}`;
      const key2 = `context_${transfer.toContext}_target_${transfer.toCompetency}`;
      
      transferCounts.set(key1, (transferCounts.get(key1) || 0) + 1);
      transferCounts.set(key2, (transferCounts.get(key2) || 0) + 1);
    }
    
    // Convert to links
    for (const [key, count] of transferCounts) {
      const [source, target] = key.split('_').filter((_, i) => i % 2 === 0);
      links.push({
        source,
        target,
        value: count,
        type: 'transfer'
      });
    }
    
    return { nodes, links };
  }

  // Private helper methods

  private static generateCorrelationInsights(
    comp1: string,
    comp2: string,
    correlation: number,
    profile: ALFCompetencyProfile
  ): string[] {
    const insights: string[] = [];
    
    if (correlation > 0.7) {
      insights.push(`Strong synergy between ${comp1} and ${comp2}`);
      insights.push('Consider projects that leverage both competencies together');
    } else if (correlation > 0.5) {
      insights.push(`Moderate connection between ${comp1} and ${comp2}`);
      insights.push('These competencies complement each other well');
    }
    
    // Check if they're in the same domain
    const status1 = profile.competencyMap.get(comp1);
    const status2 = profile.competencyMap.get(comp2);
    
    if (status1 && status2 && status1.domain === status2.domain) {
      insights.push('Same domain competencies - natural progression path');
    } else {
      insights.push('Cross-domain connection shows interdisciplinary thinking');
    }
    
    return insights;
  }

  private static generateHeatmapInsights(
    competencies: string[],
    dimensions: string[],
    values: number[][]
  ): string[] {
    const insights: string[] = [];
    
    // Find competencies with high overall scores
    const overallScores = values.map(row => row.reduce((a, b) => a + b, 0) / row.length);
    const maxScore = Math.max(...overallScores);
    const highPerformers = competencies.filter((_, i) => overallScores[i] > maxScore * 0.8);
    
    if (highPerformers.length > 0) {
      insights.push(`Strong performance in: ${highPerformers.join(', ')}`);
    }
    
    // Find dimensions that need attention
    for (let dim = 0; dim < dimensions.length; dim++) {
      const dimScores = values.map(row => row[dim]);
      const avgScore = dimScores.reduce((a, b) => a + b, 0) / dimScores.length;
      
      if (avgScore < 0.3) {
        insights.push(`${dimensions[dim]} needs attention across most competencies`);
      }
    }
    
    return insights;
  }

  private static getUpdateTitle(update: CompetencyTrackingUpdate): string {
    const titles: Record<string, string> = {
      'progress': 'Progress Update',
      'demonstration': 'New Demonstration',
      'transfer': 'Transfer Achievement',
      'validation': 'Community Validation',
      'goal_set': 'Goal Set',
      'milestone_reached': 'Milestone Reached'
    };
    
    return titles[update.updateType] || 'Competency Update';
  }

  private static getUpdateDescription(
    update: CompetencyTrackingUpdate,
    profile: ALFCompetencyProfile
  ): string {
    const competency = profile.competencyMap.get(update.competencyId);
    const competencyName = competency?.competencyName || update.competencyId;
    
    switch (update.updateType) {
      case 'demonstration':
        return `Demonstrated ${competencyName} through authentic project work`;
      case 'transfer':
        return `Successfully transferred ${competencyName} to a new context`;
      case 'validation':
        return `Received community validation for ${competencyName}`;
      case 'milestone_reached':
        return `Reached a major milestone in ${competencyName}`;
      default:
        return `Updated progress in ${competencyName}`;
    }
  }

  private static assessUpdateImpact(update: CompetencyTrackingUpdate): 'high' | 'medium' | 'low' {
    if (update.updateType === 'milestone_reached' || update.updateType === 'validation') {
      return 'high';
    }
    if (update.updateType === 'demonstration' || update.updateType === 'transfer') {
      return 'medium';
    }
    return 'low';
  }

  private static extractMilestones(
    updates: CompetencyTrackingUpdate[],
    profile: ALFCompetencyProfile
  ): TimelineMilestone[] {
    return updates
      .filter(u => u.updateType === 'milestone_reached')
      .map(u => ({
        date: u.timestamp,
        title: `${profile.competencyMap.get(u.competencyId)?.competencyName} Level Up`,
        achieved: true,
        competencyId: u.competencyId,
        celebrationType: 'level_up' as const
      }));
  }

  private static identifyGrowthPeriods(
    updates: CompetencyTrackingUpdate[],
    profile: ALFCompetencyProfile
  ): TimelinePeriod[] {
    // Simplified implementation
    return profile.growthTrajectory.accelerationPeriods.map(period => ({
      start: period.startDate,
      end: period.endDate,
      type: 'acceleration' as const,
      competencies: period.competenciesAffected,
      description: `Rapid growth in ${period.competenciesAffected.length} competencies`
    }));
  }

  private static getCompetencyColor(status: CompetencyStatus): string {
    if (status.momentum === 'accelerating') return '#4CAF50';
    if (status.momentum === 'steady') return '#2196F3';
    if (status.momentum === 'slowing') return '#FF9800';
    return '#F44336';
  }

  private static identifyCompetencyClusters(
    nodes: NetworkNode[],
    links: NetworkLink[]
  ): NetworkCluster[] {
    // Simplified clustering - group by domain
    const clusters: NetworkCluster[] = [];
    const domainNodes = nodes.filter(n => n.type === 'domain');
    
    for (const domainNode of domainNodes) {
      const connectedCompetencies = links
        .filter(l => l.target === domainNode.id)
        .map(l => l.source);
      
      clusters.push({
        id: domainNode.id,
        name: domainNode.label,
        nodes: connectedCompetencies,
        cohesion: 0.7 // Would calculate based on internal connections
      });
    }
    
    return clusters;
  }

  private static generateGrowthProjections(
    profile: ALFCompetencyProfile,
    historicalGrowth: Map<string, number[]>
  ): GrowthProjection[] {
    const projections: GrowthProjection[] = [];
    
    for (const [competencyId, growth] of historicalGrowth) {
      // Simple linear projection
      const recentGrowth = growth.slice(-3);
      const growthRate = recentGrowth.length > 1 ? 
        (recentGrowth[recentGrowth.length - 1] - recentGrowth[0]) / recentGrowth.length : 0;
      
      const projectedGrowth: number[] = [];
      const confidence: number[] = [];
      
      for (let i = 1; i <= 6; i++) {
        const projected = Math.min(growth[growth.length - 1] + (growthRate * i), 100);
        projectedGrowth.push(projected);
        confidence.push(Math.max(0.9 - (i * 0.1), 0.3));
      }
      
      projections.push({
        competencyId,
        projectedGrowth,
        confidence,
        assumptions: ['Maintains current learning pace', 'No major interruptions']
      });
    }
    
    return projections;
  }

  private static projectGoalCompletion(goal: CompetencyGoal): Date {
    const completedMilestones = goal.milestones.filter(m => m.completed).length;
    const remainingMilestones = goal.milestones.length - completedMilestones;
    
    if (remainingMilestones === 0) return new Date();
    
    const daysPerMilestone = goal.progressTracking.daysRemaining / remainingMilestones;
    return new Date(Date.now() + (daysPerMilestone * remainingMilestones * 24 * 60 * 60 * 1000));
  }

  private static assessGoalRisk(goal: CompetencyGoal): 'low' | 'medium' | 'high' {
    if (!goal.progressTracking.onTrack) return 'high';
    if (goal.progressTracking.adjustmentsNeeded.length > 2) return 'high';
    if (goal.progressTracking.percentComplete < 30 && goal.progressTracking.daysElapsed > goal.progressTracking.daysRemaining) {
      return 'high';
    }
    if (goal.progressTracking.adjustmentsNeeded.length > 0) return 'medium';
    return 'low';
  }

  private static identifyUpcomingMilestones(goals: CompetencyGoal[]): UpcomingMilestone[] {
    const upcoming: UpcomingMilestone[] = [];
    const now = new Date();
    
    for (const goal of goals) {
      for (const milestone of goal.milestones) {
        if (!milestone.completed) {
          const daysUntilDue = Math.floor((milestone.targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilDue <= 14 && daysUntilDue > 0) {
            upcoming.push({
              goalId: goal.goalId,
              milestoneId: milestone.milestoneId,
              dueIn: daysUntilDue,
              preparationNeeded: ['Review requirements', 'Gather evidence', 'Schedule review']
            });
          }
        }
      }
    }
    
    return upcoming.sort((a, b) => a.dueIn - b.dueIn);
  }
}

export default CompetencyTrackingImplementation;