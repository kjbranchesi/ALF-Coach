/**
 * Coaching Integration Service
 *
 * Seamlessly integrates the new coaching conversation architecture with
 * existing UnifiedStorageManager and HeroProjectTransformer services.
 */

import { UnifiedStorageManager, type UnifiedProjectData } from './UnifiedStorageManager';
import { heroProjectTransformer, type EnhancedHeroProjectData, type TransformationContext } from './HeroProjectTransformer';
import { CoachingStageManager, type CoachingToHeroTransformation } from './CoachingConversationArchitecture';
import type { ConversationMessage } from '../contexts/CoachingConversationContext';

export interface CoachingIntegrationConfig {
  autoSaveInterval: number; // milliseconds
  heroTransformationLevel: 'standard' | 'comprehensive' | 'publication';
  enableRealtimeSync: boolean;
  fallbackToLocalStorage: boolean;
  maxRetryAttempts: number;
}

export interface CoachingSession {
  id: string;
  projectId: string;
  userId: string;
  stageManager: CoachingStageManager;
  messages: ConversationMessage[];
  capturedData: Record<string, any>;
  startTime: Date;
  lastActivity: Date;
  isComplete: boolean;
  heroProjectId?: string;
}

const DEFAULT_CONFIG: CoachingIntegrationConfig = {
  autoSaveInterval: 2000,
  heroTransformationLevel: 'comprehensive',
  enableRealtimeSync: true,
  fallbackToLocalStorage: true,
  maxRetryAttempts: 3
};

export class CoachingIntegrationService {
  private static instance: CoachingIntegrationService;
  private storageManager: UnifiedStorageManager;
  private activeSessions = new Map<string, CoachingSession>();
  private autoSaveTimers = new Map<string, NodeJS.Timeout>();

  private constructor(
    private config: CoachingIntegrationConfig = DEFAULT_CONFIG
  ) {
    this.storageManager = UnifiedStorageManager.getInstance({
      enableHeroTransformation: true,
      heroTransformationLevel: config.heroTransformationLevel,
      enableBackup: true,
      maxBackups: 10
    });
  }

  static getInstance(config?: Partial<CoachingIntegrationConfig>): CoachingIntegrationService {
    if (!CoachingIntegrationService.instance) {
      CoachingIntegrationService.instance = new CoachingIntegrationService({
        ...DEFAULT_CONFIG,
        ...config
      });
    }
    return CoachingIntegrationService.instance;
  }

  /**
   * Initialize a new coaching session or restore an existing one
   */
  async initializeSession(
    sessionId: string,
    userId: string,
    projectId?: string,
    existingData?: Partial<UnifiedProjectData>
  ): Promise<CoachingSession> {
    try {
      let session: CoachingSession;

      if (this.activeSessions.has(sessionId)) {
        // Resume existing session
        session = this.activeSessions.get(sessionId)!;
        session.lastActivity = new Date();
      } else {
        // Create new session
        const stageManager = new CoachingStageManager();
        let messages: ConversationMessage[] = [];
        let capturedData: Record<string, any> = {};

        // Load existing project data if available
        if (projectId || existingData) {
          const projectData = projectId
            ? await this.storageManager.getProject(projectId)
            : existingData;

          if (projectData) {
            // Convert existing data to coaching format
            const conversion = this.convertProjectToCoachingData(projectData);
            capturedData = conversion.capturedData;
            messages = conversion.messages;

            // Update stage manager with existing data
            stageManager.updateStageData(capturedData);
          }
        }

        session = {
          id: sessionId,
          projectId: projectId || this.generateProjectId(),
          userId,
          stageManager,
          messages,
          capturedData,
          startTime: new Date(),
          lastActivity: new Date(),
          isComplete: false
        };

        this.activeSessions.set(sessionId, session);
      }

      // Set up auto-save
      this.setupAutoSave(sessionId);

      return session;
    } catch (error) {
      console.error(`Failed to initialize coaching session ${sessionId}:`, error);
      throw new Error(`Session initialization failed: ${error.message}`);
    }
  }

  /**
   * Update session data and trigger auto-save
   */
  async updateSession(
    sessionId: string,
    updates: {
      messages?: ConversationMessage[];
      capturedData?: Record<string, any>;
      stageAdvancement?: boolean;
    }
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      // Update session data
      if (updates.messages) {
        session.messages = updates.messages;
      }

      if (updates.capturedData) {
        session.capturedData = { ...session.capturedData, ...updates.capturedData };
        session.stageManager.updateStageData(session.capturedData);
      }

      session.lastActivity = new Date();

      // Check for stage completion and advancement
      if (updates.stageAdvancement) {
        const nextStage = session.stageManager.advanceStage();
        if (nextStage) {
          console.log(`Session ${sessionId} advanced to stage: ${nextStage}`);
        }
      }

      // Check if session is complete
      if (session.stageManager.getCurrentStage() === 'HERO_TRANSFORMATION') {
        const progress = session.stageManager.getStageProgress();
        if (progress.percentage >= 90) {
          await this.completeSession(sessionId);
        }
      }

      // Trigger auto-save (debounced)
      this.scheduleAutoSave(sessionId);

    } catch (error) {
      console.error(`Failed to update session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Save session data to persistent storage
   */
  async saveSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      // Convert session to UnifiedProjectData format
      const projectData = this.convertSessionToProjectData(session);

      // Save to unified storage
      await this.storageManager.saveProject(projectData);

      console.log(`Session ${sessionId} saved successfully`);
    } catch (error) {
      console.error(`Failed to save session ${sessionId}:`, error);

      // Fallback to localStorage if configured
      if (this.config.fallbackToLocalStorage) {
        try {
          this.saveToLocalStorage(sessionId, session);
          console.log(`Session ${sessionId} saved to localStorage as fallback`);
        } catch (fallbackError) {
          console.error(`Fallback save also failed:`, fallbackError);
          throw new Error(`All save methods failed for session ${sessionId}`);
        }
      } else {
        throw error;
      }
    }
  }

  /**
   * Complete a coaching session and generate Hero Project
   */
  async completeSession(sessionId: string): Promise<EnhancedHeroProjectData> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      // Mark session as complete
      session.isComplete = true;

      // Convert coaching data to hero project format
      const projectData = this.convertSessionToProjectData(session);

      // Create transformation context from coaching data
      const transformationContext = this.createTransformationContext(session);

      // Generate Hero Project using transformer
      const heroProject = await heroProjectTransformer.transformProject(
        projectData,
        transformationContext,
        this.config.heroTransformationLevel
      );

      // Save both the session and hero project
      await this.saveSession(sessionId);

      // Store hero project reference
      session.heroProjectId = heroProject.id;

      console.log(`Session ${sessionId} completed and Hero Project generated`);
      return heroProject;

    } catch (error) {
      console.error(`Failed to complete session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Get session status and progress
   */
  getSessionStatus(sessionId: string): {
    exists: boolean;
    isActive: boolean;
    isComplete: boolean;
    currentStage: string;
    progress: { completed: number; total: number; percentage: number };
    lastActivity: Date | null;
  } {
    const session = this.activeSessions.get(sessionId);

    if (!session) {
      return {
        exists: false,
        isActive: false,
        isComplete: false,
        currentStage: '',
        progress: { completed: 0, total: 0, percentage: 0 },
        lastActivity: null
      };
    }

    return {
      exists: true,
      isActive: !session.isComplete,
      isComplete: session.isComplete,
      currentStage: session.stageManager.getCurrentStage(),
      progress: session.stageManager.getStageProgress(),
      lastActivity: session.lastActivity
    };
  }

  /**
   * Clean up inactive sessions
   */
  cleanupInactiveSessions(maxInactiveHours: number = 24): void {
    const cutoffTime = new Date(Date.now() - maxInactiveHours * 60 * 60 * 1000);

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.lastActivity < cutoffTime && !session.isComplete) {
        // Save session before cleanup
        this.saveSession(sessionId).catch(error => {
          console.error(`Failed to save session ${sessionId} during cleanup:`, error);
        });

        // Clear auto-save timer
        const timer = this.autoSaveTimers.get(sessionId);
        if (timer) {
          clearTimeout(timer);
          this.autoSaveTimers.delete(sessionId);
        }

        // Remove from active sessions
        this.activeSessions.delete(sessionId);
        console.log(`Cleaned up inactive session: ${sessionId}`);
      }
    }
  }

  /**
   * Private helper methods
   */

  private convertProjectToCoachingData(projectData: Partial<UnifiedProjectData>): {
    capturedData: Record<string, any>;
    messages: ConversationMessage[];
  } {
    const capturedData: Record<string, any> = {};
    const messages: ConversationMessage[] = [];

    // Convert wizard data
    if (projectData.wizardData) {
      capturedData['context.subject'] = projectData.wizardData.subject;
      capturedData['context.gradeLevel'] = projectData.wizardData.ageGroup;
      capturedData['context.duration'] = projectData.wizardData.duration;
      capturedData['project.motivation'] = projectData.wizardData.motivation;
    }

    // Convert captured data
    if (projectData.capturedData) {
      Object.assign(capturedData, projectData.capturedData);
    }

    // Convert chat history
    if (projectData.chatHistory && Array.isArray(projectData.chatHistory)) {
      projectData.chatHistory.forEach((msg, index) => {
        messages.push({
          id: `imported_${index}`,
          role: msg.role || 'user',
          content: msg.content || '',
          timestamp: new Date(msg.timestamp || Date.now()),
          stageId: msg.stage || 'DISCOVERY_CONTEXT',
          metadata: msg.metadata
        });
      });
    }

    return { capturedData, messages };
  }

  private convertSessionToProjectData(session: CoachingSession): UnifiedProjectData {
    return {
      id: session.projectId,
      title: session.capturedData['project.title'] || `Hero Project - ${new Date().toLocaleDateString()}`,
      userId: session.userId,
      createdAt: session.startTime,
      updatedAt: session.lastActivity,
      version: '3.0',
      source: 'chat',
      stage: session.stageManager.getCurrentStage(),
      syncStatus: 'local',

      // Coaching-specific data
      capturedData: session.capturedData,
      chatHistory: session.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        stage: msg.stageId,
        metadata: msg.metadata
      })),

      // Convert to legacy format for compatibility
      wizardData: {
        subject: session.capturedData['context.subject'],
        ageGroup: session.capturedData['context.gradeLevel'],
        duration: session.capturedData['context.duration'],
        motivation: session.capturedData['project.motivation'],
        vision: session.capturedData['challenge.vision'],
        scope: session.capturedData['impact.scope']
      },

      ideation: {
        bigIdea: session.capturedData['challenge.problemStatement'],
        essentialQuestion: session.capturedData['learning.essentialQuestion'],
        challenge: session.capturedData['challenge.challenge']
      },

      journey: {
        phases: session.capturedData['journey.phases'] || []
      },

      deliverables: {
        items: session.capturedData['deliverables.items'] || []
      }
    };
  }

  private createTransformationContext(session: CoachingSession): TransformationContext {
    return {
      educatorPreferences: {
        teachingStyle: session.capturedData['context.teachingStyle'] || 'collaborative',
        technologyComfort: session.capturedData['context.technologyComfort'] || 'medium',
        timeConstraints: session.capturedData['context.duration']
      },
      schoolContext: {
        type: session.capturedData['context.schoolType'] || 'public',
        resources: session.capturedData['context.resources'] || 'adequate',
        communityType: session.capturedData['context.communityType'] || 'suburban'
      },
      standardsAlignment: {
        primary: this.mapStandardsFramework(session.capturedData['standards.framework']),
        secondary: session.capturedData['standards.secondary'] || []
      },
      enhancementGoals: {
        priorityAreas: ['community-connection', 'real-world-application', 'assessment'],
        emphasisLevel: this.config.heroTransformationLevel
      }
    };
  }

  private mapStandardsFramework(framework?: string): 'common-core' | 'ngss' | 'state-specific' | 'international' {
    if (!framework) return 'state-specific';

    const lower = framework.toLowerCase();
    if (lower.includes('common core')) return 'common-core';
    if (lower.includes('ngss')) return 'ngss';
    if (lower.includes('international')) return 'international';
    return 'state-specific';
  }

  private setupAutoSave(sessionId: string): void {
    // Clear existing timer
    const existingTimer = this.autoSaveTimers.get(sessionId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set up new auto-save timer
    const timer = setTimeout(() => {
      this.saveSession(sessionId).catch(error => {
        console.error(`Auto-save failed for session ${sessionId}:`, error);
      });
    }, this.config.autoSaveInterval);

    this.autoSaveTimers.set(sessionId, timer);
  }

  private scheduleAutoSave(sessionId: string): void {
    // Debounced auto-save
    const existingTimer = this.autoSaveTimers.get(sessionId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      this.saveSession(sessionId).catch(error => {
        console.error(`Scheduled auto-save failed for session ${sessionId}:`, error);
      });
    }, this.config.autoSaveInterval);

    this.autoSaveTimers.set(sessionId, timer);
  }

  private saveToLocalStorage(sessionId: string, session: CoachingSession): void {
    try {
      const sessionData = {
        id: session.id,
        projectId: session.projectId,
        userId: session.userId,
        capturedData: session.capturedData,
        messages: session.messages,
        currentStage: session.stageManager.getCurrentStage(),
        startTime: session.startTime.toISOString(),
        lastActivity: session.lastActivity.toISOString(),
        isComplete: session.isComplete
      };

      localStorage.setItem(`coaching_session_${sessionId}`, JSON.stringify(sessionData));
    } catch (error) {
      throw new Error(`Failed to save to localStorage: ${error.message}`);
    }
  }

  private generateProjectId(): string {
    return `coached_project_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  /**
   * Recovery methods for error handling
   */

  async recoverSession(sessionId: string): Promise<CoachingSession | null> {
    try {
      // Try to load from localStorage first
      const localData = localStorage.getItem(`coaching_session_${sessionId}`);
      if (localData) {
        const sessionData = JSON.parse(localData);
        const stageManager = new CoachingStageManager();
        stageManager.updateStageData(sessionData.capturedData);

        const session: CoachingSession = {
          id: sessionData.id,
          projectId: sessionData.projectId,
          userId: sessionData.userId,
          stageManager,
          messages: sessionData.messages,
          capturedData: sessionData.capturedData,
          startTime: new Date(sessionData.startTime),
          lastActivity: new Date(sessionData.lastActivity),
          isComplete: sessionData.isComplete
        };

        this.activeSessions.set(sessionId, session);
        this.setupAutoSave(sessionId);

        console.log(`Recovered session ${sessionId} from localStorage`);
        return session;
      }

      // Try to load from unified storage
      const projectData = await this.storageManager.getProject(sessionId);
      if (projectData) {
        const session = await this.initializeSession(
          sessionId,
          projectData.userId,
          projectData.id,
          projectData
        );

        console.log(`Recovered session ${sessionId} from unified storage`);
        return session;
      }

      return null;
    } catch (error) {
      console.error(`Failed to recover session ${sessionId}:`, error);
      return null;
    }
  }
}

// Export singleton instance
export const coachingIntegration = CoachingIntegrationService.getInstance();