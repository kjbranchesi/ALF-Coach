/**
 * Data Migration & Recovery Utilities
 * Handles legacy data migration, validation, and error recovery
 */

import { 
  type UnifiedProject, 
  type WizardData, 
  type ChatData, 
  validateUnifiedProject,
  validateWizardData,
  validateChatData,
  migrateLegacyProject,
  EntryPoint,
  PBLExperience,
  ConversationPhase
} from '../types/ProjectDataTypes';
import { projectDataService } from '../services/ProjectDataService';

// ==================== VALIDATION & SANITIZATION ====================

/**
 * Comprehensive data validation with error recovery
 */
export class DataValidator {
  static validateAndSanitizeWizardData(data: any): { data: WizardData | null; errors: string[] } {
    const errors: string[] = [];
    
    try {
      // Attempt direct validation first
      const validated = validateWizardData(data);
      return { data: validated, errors: [] };
    } catch (error) {
      console.warn('Direct wizard validation failed, attempting recovery:', error);
    }

    // Attempt data recovery
    try {
      const recovered = this.recoverWizardData(data);
      const validated = validateWizardData(recovered);
      errors.push('Data was automatically corrected');
      return { data: validated, errors };
    } catch (error) {
      errors.push(`Wizard data validation failed: ${error.message}`);
      return { data: null, errors };
    }
  }

  static validateAndSanitizeChatData(data: any): { data: ChatData | null; errors: string[] } {
    const errors: string[] = [];
    
    try {
      const validated = validateChatData(data);
      return { data: validated, errors: [] };
    } catch (error) {
      console.warn('Direct chat validation failed, attempting recovery:', error);
    }

    try {
      const recovered = this.recoverChatData(data);
      const validated = validateChatData(recovered);
      errors.push('Chat data was automatically corrected');
      return { data: validated, errors };
    } catch (error) {
      errors.push(`Chat data validation failed: ${error.message}`);
      return { data: null, errors };
    }
  }

  static validateAndSanitizeProject(data: any): { data: UnifiedProject | null; errors: string[] } {
    const errors: string[] = [];
    
    try {
      const validated = validateUnifiedProject(data);
      return { data: validated, errors: [] };
    } catch (error) {
      console.warn('Direct project validation failed, attempting migration/recovery:', error);
    }

    try {
      // Try legacy migration first
      const migrated = migrateLegacyProject(data);
      const validated = validateUnifiedProject({
        userId: data.userId || 'anonymous',
        ...migrated
      });
      errors.push('Legacy project data was migrated to new format');
      return { data: validated, errors };
    } catch (error) {
      errors.push(`Project data validation failed: ${error.message}`);
      return { data: null, errors };
    }
  }

  // ==================== DATA RECOVERY METHODS ====================

  private static recoverWizardData(data: any): Partial<WizardData> {
    const recovered: any = {
      // Core fields with fallbacks
      entryPoint: this.sanitizeEnum(data.entryPoint, EntryPoint, EntryPoint.LEARNING_GOAL),
      projectTopic: this.sanitizeString(data.projectTopic || data.title || '', 20),
      learningGoals: this.sanitizeString(data.learningGoals || data.motivation || '', 20),
      materials: this.sanitizeString(data.materials),
      
      // Educational context
      subjects: this.sanitizeArray(data.subjects || (data.subject ? [data.subject] : [])),
      primarySubject: this.sanitizeString(data.primarySubject || data.subject || ''),
      gradeLevel: this.sanitizeString(data.gradeLevel || data.ageGroup || ''),
      duration: this.sanitizeEnum(data.duration || data.scope, ['short', 'medium', 'long'], 'medium'),
      specialRequirements: this.sanitizeString(data.specialRequirements),
      
      // Teaching context
      pblExperience: this.sanitizeEnum(data.pblExperience, PBLExperience, PBLExperience.SOME),
      specialConsiderations: this.sanitizeString(data.specialConsiderations),
      
      // Conversation state
      conversationPhase: this.sanitizeEnum(data.conversationPhase, ConversationPhase, ConversationPhase.WIZARD),
      contextCompleteness: {
        core: this.sanitizeNumber(data.contextCompleteness?.core, 0, 100, 0),
        context: this.sanitizeNumber(data.contextCompleteness?.context, 0, 100, 0),
        progressive: this.sanitizeNumber(data.contextCompleteness?.progressive, 0, 100, 0)
      },
      
      // Metadata
      metadata: {
        createdAt: this.sanitizeDate(data.metadata?.createdAt || data.createdAt),
        lastModified: this.sanitizeDate(data.metadata?.lastModified || data.updatedAt),
        version: '3.0',
        wizardCompleted: Boolean(data.metadata?.wizardCompleted || data.wizardCompleted),
        skippedFields: this.sanitizeArray(data.metadata?.skippedFields || [])
      }
    };

    return recovered;
  }

  private static recoverChatData(data: any): Partial<ChatData> {
    const recovered: any = {
      ideation: data.ideation ? {
        bigIdea: this.sanitizeString(data.ideation.bigIdea),
        essentialQuestion: this.sanitizeString(data.ideation.essentialQuestion),
        challenge: this.sanitizeString(data.ideation.challenge),
        confirmed: Boolean(data.ideation.confirmed || data.ideation.challengeConfirmed)
      } : undefined,
      
      learningJourney: data.learningJourney || data.journey ? {
        phases: this.sanitizeArray(data.learningJourney?.phases || data.journey?.phaseBreakdown || []),
        timeline: this.sanitizeString(data.learningJourney?.timeline || data.journey?.projectDuration),
        milestones: this.sanitizeArray(data.learningJourney?.milestones || [])
      } : undefined,
      
      deliverables: data.deliverables || data.studentDeliverables ? {
        rubric: data.deliverables?.rubric || data.studentDeliverables?.rubric ? {
          criteria: this.sanitizeArray(data.deliverables?.rubric?.criteria || data.studentDeliverables?.rubric?.criteria || [])
        } : undefined,
        assessments: this.sanitizeArray(data.deliverables?.assessments || []),
        portfolio: this.sanitizeArray(data.deliverables?.portfolio || [])
      } : undefined,
      
      chatHistory: this.sanitizeArray(data.chatHistory || []).map((msg: any) => ({
        id: msg.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: this.sanitizeEnum(msg.role, ['user', 'assistant', 'system'], 'user'),
        content: this.sanitizeString(msg.content || msg.chatResponse || ''),
        timestamp: this.sanitizeDate(msg.timestamp),
        metadata: msg.metadata || {}
      }))
    };

    return recovered;
  }

  // ==================== SANITIZATION HELPERS ====================

  private static sanitizeString(value: any, minLength = 0): string {
    if (typeof value !== 'string') {return '';}
    const trimmed = value.trim();
    return trimmed.length >= minLength ? trimmed : '';
  }

  private static sanitizeArray(value: any): any[] {
    return Array.isArray(value) ? value : [];
  }

  private static sanitizeNumber(value: any, min: number, max: number, defaultValue: number): number {
    const num = Number(value);
    if (isNaN(num)) {return defaultValue;}
    return Math.max(min, Math.min(max, num));
  }

  private static sanitizeDate(value: any): Date {
    if (value instanceof Date) {return value;}
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? new Date() : date;
    }
    return new Date();
  }

  private static sanitizeEnum<T>(value: any, enumObject: any, defaultValue: T): T {
    if (typeof enumObject === 'object') {
      const enumValues = Object.values(enumObject);
      return enumValues.includes(value) ? value : defaultValue;
    }
    if (Array.isArray(enumObject)) {
      return enumObject.includes(value) ? value : defaultValue;
    }
    return defaultValue;
  }
}

// ==================== BULK DATA OPERATIONS ====================

/**
 * Utility for bulk data migration and cleanup
 */
export class BulkDataManager {
  /**
   * Migrate all projects in localStorage to new format
   */
  static async migrateAllLocalProjects(): Promise<{ migrated: number; failed: number; errors: string[] }> {
    const results = { migrated: 0, failed: 0, errors: [] as string[] };
    
    try {
      // Find all project keys in localStorage
      const projectKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('blueprint_') || key.startsWith('alf_project_')
      );

      for (const key of projectKeys) {
        try {
          const stored = localStorage.getItem(key);
          if (!stored) {continue;}

          const data = JSON.parse(stored);
          const { data: validated, errors } = DataValidator.validateAndSanitizeProject(data);

          if (validated) {
            // Store in new format
            const newKey = `alf_project_${validated.id}`;
            localStorage.setItem(newKey, JSON.stringify(validated));
            
            // Remove old key if different
            if (key !== newKey) {
              localStorage.removeItem(key);
            }
            
            results.migrated++;
            if (errors.length > 0) {
              results.errors.push(`${validated.id}: ${errors.join(', ')}`);
            }
          } else {
            results.failed++;
            results.errors.push(`${key}: Migration failed - ${errors.join(', ')}`);
          }
        } catch (error) {
          results.failed++;
          results.errors.push(`${key}: Parse error - ${error.message}`);
        }
      }
    } catch (error) {
      results.errors.push(`Bulk migration error: ${error.message}`);
    }

    return results;
  }

  /**
   * Clean up invalid or corrupted data
   */
  static cleanupLocalStorage(): { cleaned: number; errors: string[] } {
    const results = { cleaned: 0, errors: [] as string[] };
    
    try {
      const alfKeys = Object.keys(localStorage).filter(key => key.startsWith('alf_'));
      
      for (const key of alfKeys) {
        try {
          const stored = localStorage.getItem(key);
          if (!stored) {
            localStorage.removeItem(key);
            results.cleaned++;
            continue;
          }

          // Try to parse - if it fails, it's corrupted
          JSON.parse(stored);
          
          // Check if it's a project and validate structure
          if (key.startsWith('alf_project_')) {
            const data = JSON.parse(stored);
            const { data: validated } = DataValidator.validateAndSanitizeProject(data);
            
            if (!validated) {
              localStorage.removeItem(key);
              results.cleaned++;
              results.errors.push(`Removed corrupted project: ${key}`);
            }
          }
        } catch (error) {
          localStorage.removeItem(key);
          results.cleaned++;
          results.errors.push(`Removed invalid data: ${key} - ${error.message}`);
        }
      }
    } catch (error) {
      results.errors.push(`Cleanup error: ${error.message}`);
    }

    return results;
  }

  /**
   * Get storage usage statistics
   */
  static getStorageStats(): { totalSize: number; projectCount: number; wizardDataExists: boolean } {
    let totalSize = 0;
    let projectCount = 0;
    let wizardDataExists = false;

    try {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith('alf_')) {
          const value = localStorage.getItem(key);
          if (value) {
            totalSize += value.length;
            
            if (key.startsWith('alf_project_')) {
              projectCount++;
            } else if (key === 'alf_wizard_data') {
              wizardDataExists = true;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error calculating storage stats:', error);
    }

    return {
      totalSize: Math.round(totalSize / 1024), // KB
      projectCount,
      wizardDataExists
    };
  }
}

// ==================== ERROR RECOVERY STRATEGIES ====================

/**
 * Error recovery and fallback strategies
 */
export class ErrorRecoveryManager {
  /**
   * Attempt to recover from various error states
   */
  static async recoverFromError(error: any, context: string): Promise<{ recovered: boolean; action: string }> {
    console.error(`Error in ${context}:`, error);

    // Network errors
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('network')) {
      return {
        recovered: true,
        action: 'Switched to offline mode. Changes will sync when connection is restored.'
      };
    }

    // Validation errors
    if (error.code === 'VALIDATION_ERROR') {
      try {
        // Attempt data cleanup
        const cleanupResult = BulkDataManager.cleanupLocalStorage();
        return {
          recovered: cleanupResult.cleaned > 0,
          action: `Cleaned up ${cleanupResult.cleaned} corrupted data entries.`
        };
      } catch (cleanupError) {
        return {
          recovered: false,
          action: 'Data validation failed and cleanup was unsuccessful.'
        };
      }
    }

    // Storage errors
    if (error.code === 'STORAGE_ERROR') {
      try {
        // Clear some space by removing old data
        const beforeStats = BulkDataManager.getStorageStats();
        BulkDataManager.cleanupLocalStorage();
        const afterStats = BulkDataManager.getStorageStats();
        
        const freedSpace = beforeStats.totalSize - afterStats.totalSize;
        return {
          recovered: freedSpace > 0,
          action: `Freed ${freedSpace}KB of storage space.`
        };
      } catch (storageError) {
        return {
          recovered: false,
          action: 'Storage cleanup failed. Please clear browser data manually.'
        };
      }
    }

    // Unknown errors
    return {
      recovered: false,
      action: 'An unexpected error occurred. Please refresh the page and try again.'
    };
  }

  /**
   * Check system health and suggest fixes
   */
  static async performHealthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    suggestions: string[];
  }> {
    const issues: string[] = [];
    const suggestions: string[] = [];

    try {
      // Check storage space
      const stats = BulkDataManager.getStorageStats();
      if (stats.totalSize > 40 * 1024) { // 40MB warning
        issues.push('High storage usage detected');
        suggestions.push('Consider cleaning up old project data');
      }

      // Check for wizard data stuck in storage
      if (stats.wizardDataExists) {
        issues.push('Incomplete wizard data found');
        suggestions.push('Complete or restart the project creation wizard');
      }

      // Check connection to data service
      const connectionStatus = projectDataService.getConnectionStatus();
      if (connectionStatus === 'offline') {
        issues.push('No connection to cloud storage');
        suggestions.push('Check internet connection for data sync');
      }

      // Check sync queue
      const queueSize = projectDataService.getSyncQueueSize();
      if (queueSize > 5) {
        issues.push(`${queueSize} changes pending sync`);
        suggestions.push('Sync will resume automatically when online');
      }

      // Determine overall status
      let status: 'healthy' | 'warning' | 'critical';
      if (issues.length === 0) {
        status = 'healthy';
      } else if (issues.length <= 2) {
        status = 'warning';
      } else {
        status = 'critical';
      }

      return { status, issues, suggestions };
    } catch (error) {
      return {
        status: 'critical',
        issues: ['Health check failed'],
        suggestions: ['Please refresh the page and contact support if issues persist']
      };
    }
  }
}

// ==================== EXPORT UTILITIES ====================

export { DataValidator, BulkDataManager, ErrorRecoveryManager };