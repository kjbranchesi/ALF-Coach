/**
 * Unified Storage Manager
 * Centralized data persistence with offline-first architecture
 * Replaces fragmented localStorage approaches with reliable, consistent storage
 */

import { v4 as uuidv4 } from 'uuid';
import type { HeroProjectTransformer, EnhancedHeroProjectData, TransformationLevel, TransformationContext } from './HeroProjectTransformer';

// Unified project data interface
export interface UnifiedProjectData {
  // Core identity
  id: string;
  title: string;
  userId: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastSyncAt?: Date;

  // Wizard data (from project creation)
  wizardData?: Record<string, any>;

  // Project data (structured format)
  projectData?: Record<string, any>;

  // Chat captured data
  capturedData?: Record<string, any>;

  // Legacy compatibility
  ideation?: Record<string, any>;
  journey?: Record<string, any>;
  deliverables?: Record<string, any>;
  chatHistory?: Array<any>;

  // Metadata
  stage?: string;
  source?: 'wizard' | 'chat' | 'import';
  version: string;
  hasPendingChanges?: boolean;

  // Sync status
  syncStatus: 'local' | 'synced' | 'conflict' | 'error';
  lastError?: string;
}

export interface StorageOptions {
  enableBackup?: boolean;
  maxBackups?: number;
  syncToFirebase?: boolean;
  validateData?: boolean;
  enableHeroTransformation?: boolean;
  heroTransformationLevel?: TransformationLevel;
  transformationContext?: TransformationContext;
}

const DEFAULT_OPTIONS: StorageOptions = {
  enableBackup: true,
  maxBackups: 5,
  syncToFirebase: true,
  validateData: true,
  enableHeroTransformation: true,
  heroTransformationLevel: 'standard',
  transformationContext: {}
};

export class UnifiedStorageManager {
  private static instance: UnifiedStorageManager;
  private readonly STORAGE_PREFIX = 'alf_project_';
  private readonly HERO_PREFIX = 'alf_hero_';
  private readonly BACKUP_PREFIX = 'alf_backup_';
  private readonly INDEX_KEY = 'alf_project_index';
  private readonly LEGACY_PREFIXES = ['blueprint_', 'journey-v5-'];
  private heroTransformerPromise: Promise<HeroProjectTransformer> | null = null;

  private constructor(private options: StorageOptions = DEFAULT_OPTIONS) {}

  private async getHeroTransformer(): Promise<HeroProjectTransformer> {
    if (!this.heroTransformerPromise) {
      this.heroTransformerPromise = import('./HeroProjectTransformer').then(module => module.heroProjectTransformer);
    }
    return this.heroTransformerPromise;
  }

  static getInstance(options?: StorageOptions): UnifiedStorageManager {
    if (!UnifiedStorageManager.instance) {
      UnifiedStorageManager.instance = new UnifiedStorageManager(options);
    }
    return UnifiedStorageManager.instance;
  }

  /**
   * Save project data with guaranteed persistence
   */
  async saveProject(projectData: Partial<UnifiedProjectData>): Promise<string> {
    try {
      // Generate ID if not provided
      const id = projectData.id || this.generateProjectId();

      // Prepare unified data structure
      const unifiedData: UnifiedProjectData = {
        id,
        title: projectData.title || 'Untitled Project',
        userId: projectData.userId || 'anonymous',
        createdAt: projectData.createdAt || new Date(),
        updatedAt: new Date(),
        version: '3.0',
        syncStatus: 'local',
        ...projectData
      };

      // Validate data if enabled
      if (this.options.validateData) {
        this.validateProjectData(unifiedData);
      }

      // Create backup if enabled
      if (this.options.enableBackup) {
        await this.createBackup(id);
      }

      // Save to localStorage with retry logic
      await this.saveToLocalStorage(id, unifiedData);

      // Update project index
      await this.updateProjectIndex(id, {
        title: unifiedData.title,
        updatedAt: unifiedData.updatedAt,
        stage: unifiedData.stage,
        syncStatus: unifiedData.syncStatus
      });

      // Sync legacy chat service format
      this.syncChatServiceFormat(id, unifiedData);

      console.log(`[UnifiedStorageManager] Project saved: ${id}`);

      // Background hero transformation (if enabled)
      if (this.options.enableHeroTransformation) {
        this.backgroundHeroTransformation(id, unifiedData).catch(error => {
          console.warn(`[UnifiedStorageManager] Hero transformation failed: ${error.message}`);
        });
      }

      // Background Firebase sync (if enabled and online)
      if (this.options.syncToFirebase && navigator.onLine) {
        this.backgroundFirebaseSync(id, unifiedData).catch(error => {
          console.warn(`[UnifiedStorageManager] Background sync failed: ${error.message}`);
        });
      }

      return id;
    } catch (error) {
      console.error('[UnifiedStorageManager] Save failed:', error);
      throw new Error(`Failed to save project: ${error.message}`);
    }
  }

  /**
   * Load project data with fallback mechanisms
   */
  async loadProject(projectId: string): Promise<UnifiedProjectData | null> {
    try {
      // Try primary storage
      const data = await this.loadFromLocalStorage(projectId);
      if (data) {
        console.log(`[UnifiedStorageManager] Project loaded from primary storage: ${projectId}`);
        return data;
      }

      // Try legacy formats
      const legacyData = await this.loadFromLegacyStorage(projectId);
      if (legacyData) {
        console.log(`[UnifiedStorageManager] Project loaded from legacy storage: ${projectId}`);
        // Migrate to new format
        const migratedData = this.migrateLegacyData(legacyData, projectId);
        await this.saveProject(migratedData);
        return migratedData;
      }

      console.warn(`[UnifiedStorageManager] Project not found: ${projectId}`);
      return null;
    } catch (error) {
      console.error('[UnifiedStorageManager] Load failed:', error);

      // Try backup recovery
      const backupData = await this.loadFromBackup(projectId);
      if (backupData) {
        console.log(`[UnifiedStorageManager] Project recovered from backup: ${projectId}`);
        return backupData;
      }

      throw new Error(`Failed to load project: ${error.message}`);
    }
  }

  /**
   * List all projects with metadata
   */
  async listProjects(): Promise<Array<{
    id: string;
    title: string;
    updatedAt: Date;
    stage?: string;
    syncStatus: string;
  }>> {
    try {
      const index = await this.loadProjectIndex();
      return Object.entries(index).map(([id, metadata]) => ({
        id,
        ...metadata,
        updatedAt: new Date(metadata.updatedAt)
      })).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    } catch (error) {
      console.error('[UnifiedStorageManager] List projects failed:', error);
      return [];
    }
  }

  /**
   * Delete project with cleanup
   */
  async deleteProject(projectId: string): Promise<void> {
    try {
      // Remove from primary storage
      localStorage.removeItem(`${this.STORAGE_PREFIX}${projectId}`);

      // Remove hero data
      localStorage.removeItem(`${this.HERO_PREFIX}${projectId}`);

      // Remove legacy formats
      this.LEGACY_PREFIXES.forEach(prefix => {
        localStorage.removeItem(`${prefix}${projectId}`);
      });

      // Remove backups
      for (let i = 1; i <= (this.options.maxBackups || 5); i++) {
        localStorage.removeItem(`${this.BACKUP_PREFIX}${projectId}_${i}`);
      }

      // Update index
      const index = await this.loadProjectIndex();
      delete index[projectId];
      localStorage.setItem(this.INDEX_KEY, JSON.stringify(index));

      console.log(`[UnifiedStorageManager] Project deleted: ${projectId}`);
    } catch (error) {
      console.error('[UnifiedStorageManager] Delete failed:', error);
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }

  /**
   * Export project data for backup/sharing
   */
  async exportProject(projectId: string): Promise<string> {
    const data = await this.loadProject(projectId);
    if (!data) {
      throw new Error(`Project not found: ${projectId}`);
    }

    return JSON.stringify(data, null, 2);
  }

  /**
   * Import project data from backup/sharing
   */
  async importProject(jsonData: string): Promise<string> {
    try {
      const data = JSON.parse(jsonData) as UnifiedProjectData;

      // Generate new ID to avoid conflicts
      const newId = this.generateProjectId();
      data.id = newId;
      data.createdAt = new Date();
      data.updatedAt = new Date();
      data.syncStatus = 'local';

      return await this.saveProject(data);
    } catch (error) {
      console.error('[UnifiedStorageManager] Import failed:', error);
      throw new Error(`Failed to import project: ${error.message}`);
    }
  }

  /**
   * Load enhanced hero project data
   */
  async loadHeroProject(projectId: string): Promise<EnhancedHeroProjectData | null> {
    try {
      // Try to load existing hero data
      const heroData = await this.loadHeroFromLocalStorage(projectId);
      if (heroData) {
        console.log(`[UnifiedStorageManager] Hero data loaded from cache: ${projectId}`);
        return heroData;
      }

      // If no hero data exists, load original and transform
      const originalData = await this.loadProject(projectId);
      if (!originalData) {
        console.warn(`[UnifiedStorageManager] No project data found for hero transformation: ${projectId}`);
        return null;
      }

      // Transform to hero format
      console.log(`[UnifiedStorageManager] Transforming project to hero format: ${projectId}`);
      const heroTransformer = await this.getHeroTransformer();
      const transformedData = await heroTransformer.transformProject(
        originalData,
        this.options.transformationContext || {},
        this.options.heroTransformationLevel || 'standard'
      );

      // Save the transformed data for future use
      await this.saveHeroToLocalStorage(projectId, transformedData);

      return transformedData;
    } catch (error) {
      console.error(`[UnifiedStorageManager] Hero project load failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Update hero transformation with new data (for real-time chat updates)
   */
  async updateHeroTransformation(projectId: string, updates: Partial<UnifiedProjectData>): Promise<void> {
    try {
      if (!this.options.enableHeroTransformation) {
        return;
      }

      console.log(`[UnifiedStorageManager] Updating hero transformation: ${projectId}`);

      // Update the hero transformation incrementally
      const heroTransformer = await this.getHeroTransformer();
      const updatedHeroData = await heroTransformer.updateTransformation(
        projectId,
        updates,
        this.options.transformationContext
      );

      if (updatedHeroData) {
        await this.saveHeroToLocalStorage(projectId, updatedHeroData);
        console.log(`[UnifiedStorageManager] Hero transformation updated: ${projectId}`);
      }
    } catch (error) {
      console.warn(`[UnifiedStorageManager] Hero update failed: ${error.message}`);
    }
  }

  /**
   * Configure transformation settings
   */
  setTransformationOptions(options: {
    level?: TransformationLevel;
    context?: Partial<TransformationContext>;
    enabled?: boolean;
  }): void {
    if (options.level) {
      this.options.heroTransformationLevel = options.level;
    }
    if (options.context) {
      this.options.transformationContext = {
        ...this.options.transformationContext,
        ...options.context
      };
    }
    if (options.enabled !== undefined) {
      this.options.enableHeroTransformation = options.enabled;
    }

    console.log('[UnifiedStorageManager] Transformation options updated:', {
      level: this.options.heroTransformationLevel,
      enabled: this.options.enableHeroTransformation
    });
  }

  // Private helper methods
  private generateProjectId(): string {
    return `project_${Date.now()}_${uuidv4().substring(0, 8)}`;
  }

  private validateProjectData(data: UnifiedProjectData): void {
    if (!data.id || !data.title || !data.userId) {
      throw new Error('Missing required project fields');
    }
  }

  private async saveToLocalStorage(id: string, data: UnifiedProjectData): Promise<void> {
    const key = `${this.STORAGE_PREFIX}${id}`;
    const serializedData = JSON.stringify(data);

    // Retry logic for localStorage operations
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        localStorage.setItem(key, serializedData);
        return;
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error(`LocalStorage save failed after ${maxAttempts} attempts: ${error.message}`);
        }
        // Clear some space and retry
        await this.cleanupOldBackups();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  private async loadFromLocalStorage(id: string): Promise<UnifiedProjectData | null> {
    try {
      const key = `${this.STORAGE_PREFIX}${id}`;
      const data = localStorage.getItem(key);
      if (!data) return null;

      const parsed = JSON.parse(data);
      // Ensure dates are properly restored
      parsed.createdAt = new Date(parsed.createdAt);
      parsed.updatedAt = new Date(parsed.updatedAt);
      if (parsed.lastSyncAt) {
        parsed.lastSyncAt = new Date(parsed.lastSyncAt);
      }

      return parsed;
    } catch (error) {
      console.error(`[UnifiedStorageManager] Load from localStorage failed: ${error.message}`);
      return null;
    }
  }

  private async loadFromLegacyStorage(id: string): Promise<any | null> {
    // Try blueprint_ format
    const blueprintKey = `blueprint_${id}`;
    const blueprintData = localStorage.getItem(blueprintKey);
    if (blueprintData) {
      try {
        return JSON.parse(blueprintData);
      } catch (error) {
        console.warn(`Failed to parse legacy blueprint data: ${error.message}`);
      }
    }

    // Try journey-v5- format
    const journeyKey = `journey-v5-${id}`;
    const journeyData = localStorage.getItem(journeyKey);
    if (journeyData) {
      try {
        return { capturedData: JSON.parse(journeyData), id };
      } catch (error) {
        console.warn(`Failed to parse legacy journey data: ${error.message}`);
      }
    }

    return null;
  }

  private migrateLegacyData(legacyData: any, projectId: string): UnifiedProjectData {
    return {
      id: projectId,
      title: legacyData.wizardData?.projectTopic || legacyData.title || 'Migrated Project',
      userId: legacyData.userId || 'anonymous',
      createdAt: legacyData.createdAt ? new Date(legacyData.createdAt) : new Date(),
      updatedAt: new Date(),
      wizardData: legacyData.wizardData,
      projectData: legacyData.projectData,
      capturedData: legacyData.capturedData,
      ideation: legacyData.ideation,
      journey: legacyData.journey,
      deliverables: legacyData.deliverables,
      chatHistory: legacyData.chatHistory,
      version: '3.0',
      syncStatus: 'local',
      source: 'import'
    };
  }

  private async createBackup(id: string): Promise<void> {
    try {
      const existingData = await this.loadFromLocalStorage(id);
      if (!existingData) return;

      // Rotate backups
      const maxBackups = this.options.maxBackups || 5;
      for (let i = maxBackups; i > 1; i--) {
        const oldKey = `${this.BACKUP_PREFIX}${id}_${i - 1}`;
        const newKey = `${this.BACKUP_PREFIX}${id}_${i}`;
        const oldData = localStorage.getItem(oldKey);
        if (oldData) {
          localStorage.setItem(newKey, oldData);
        }
      }

      // Create new backup
      const backupKey = `${this.BACKUP_PREFIX}${id}_1`;
      localStorage.setItem(backupKey, JSON.stringify(existingData));
    } catch (error) {
      console.warn(`[UnifiedStorageManager] Backup creation failed: ${error.message}`);
    }
  }

  private async loadFromBackup(id: string): Promise<UnifiedProjectData | null> {
    const maxBackups = this.options.maxBackups || 5;
    for (let i = 1; i <= maxBackups; i++) {
      try {
        const backupKey = `${this.BACKUP_PREFIX}${id}_${i}`;
        const data = localStorage.getItem(backupKey);
        if (data) {
          const parsed = JSON.parse(data);
          parsed.createdAt = new Date(parsed.createdAt);
          parsed.updatedAt = new Date(parsed.updatedAt);
          return parsed;
        }
      } catch (error) {
        console.warn(`[UnifiedStorageManager] Backup ${i} load failed: ${error.message}`);
      }
    }
    return null;
  }

  private async updateProjectIndex(id: string, metadata: any): Promise<void> {
    try {
      const index = await this.loadProjectIndex();
      index[id] = {
        title: metadata.title,
        updatedAt: metadata.updatedAt.toISOString(),
        stage: metadata.stage,
        syncStatus: metadata.syncStatus
      };
      localStorage.setItem(this.INDEX_KEY, JSON.stringify(index));
    } catch (error) {
      console.warn(`[UnifiedStorageManager] Index update failed: ${error.message}`);
    }
  }

  private async loadProjectIndex(): Promise<Record<string, any>> {
    try {
      const data = localStorage.getItem(this.INDEX_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.warn(`[UnifiedStorageManager] Index load failed: ${error.message}`);
      return {};
    }
  }

  private syncChatServiceFormat(id: string, data: UnifiedProjectData): void {
    try {
      // Maintain compatibility with chat-service.ts localStorage format
      const chatServiceKey = `journey-v5-${id}`;
      const chatData = data.capturedData || {};
      localStorage.setItem(chatServiceKey, JSON.stringify(chatData));
    } catch (error) {
      console.warn(`[UnifiedStorageManager] Chat service sync failed: ${error.message}`);
    }
  }

  private async cleanupOldBackups(): Promise<void> {
    try {
      const keys = Object.keys(localStorage);
      const backupKeys = keys.filter(key => key.startsWith(this.BACKUP_PREFIX));

      // Remove oldest backups to free space
      const toRemove = backupKeys.slice(-10); // Keep only recent backups
      toRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn(`[UnifiedStorageManager] Cleanup failed: ${error.message}`);
    }
  }

  private async backgroundFirebaseSync(id: string, data: UnifiedProjectData): Promise<void> {
    try {
      // Import auth to check authentication status
      const { auth, isOfflineMode } = await import('../firebase/firebase');

      if (isOfflineMode) {
        console.log(`[UnifiedStorageManager] Skipping Firebase sync - offline mode: ${id}`);
        return;
      }

      // Wait for authentication if needed
      if (!auth.currentUser) {
        console.log(`[UnifiedStorageManager] Waiting for authentication before sync: ${id}`);
        await this.waitForAuth(auth, 5000);
      }

      if (!auth.currentUser) {
        console.warn(`[UnifiedStorageManager] No authenticated user for Firebase sync: ${id}`);
        return;
      }

      // Use project persistence service which now has proper error handling
      const { saveProjectDraft } = await import('./projectPersistence');

      const userId = auth.currentUser.isAnonymous ? 'anonymous' : auth.currentUser.uid;

      await saveProjectDraft(userId, {
        wizardData: data.wizardData,
        project: data.projectData,
        capturedData: data.capturedData
      }, {
        draftId: id,
        source: data.source || 'chat',
        metadata: {
          title: data.title,
          stage: data.stage
        }
      });

      console.log(`[UnifiedStorageManager] Background Firebase sync successful: ${id}`);

      // Update sync status
      data.syncStatus = 'synced';
      data.lastSyncAt = new Date();
      await this.saveToLocalStorage(id, data);

    } catch (error: any) {
      console.warn(`[UnifiedStorageManager] Background Firebase sync failed: ${id}`, error.message);
      // Don't throw - local storage is the primary persistence method
    }
  }

  private async waitForAuth(auth: any, timeoutMs: number): Promise<boolean> {
    if (auth.currentUser) return true;

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        unsubscribe();
        resolve(false);
      }, timeoutMs);

      const unsubscribe = auth.onAuthStateChanged((user: any) => {
        if (user) {
          clearTimeout(timeout);
          unsubscribe();
          resolve(true);
        }
      });
    });
  }

  private async backgroundHeroTransformation(id: string, data: UnifiedProjectData): Promise<void> {
    try {
      console.log(`[UnifiedStorageManager] Starting background hero transformation: ${id}`);

      const heroTransformer = await this.getHeroTransformer();
      const heroData = await heroTransformer.transformProject(
        data,
        this.options.transformationContext || {},
        this.options.heroTransformationLevel || 'standard'
      );

      await this.saveHeroToLocalStorage(id, heroData);
      console.log(`[UnifiedStorageManager] Background hero transformation complete: ${id}`);
    } catch (error) {
      console.error(`[UnifiedStorageManager] Background hero transformation failed: ${error.message}`);
    }
  }

  private async saveHeroToLocalStorage(id: string, heroData: EnhancedHeroProjectData): Promise<void> {
    try {
      const key = `${this.HERO_PREFIX}${id}`;
      const serializedData = JSON.stringify(heroData);
      localStorage.setItem(key, serializedData);
      console.log(`[UnifiedStorageManager] Hero data saved: ${id}`);
    } catch (error) {
      console.error(`[UnifiedStorageManager] Hero data save failed: ${error.message}`);
      throw error;
    }
  }

  private async loadHeroFromLocalStorage(id: string): Promise<EnhancedHeroProjectData | null> {
    try {
      const key = `${this.HERO_PREFIX}${id}`;
      const data = localStorage.getItem(key);
      if (!data) return null;

      const parsed = JSON.parse(data);

      // Restore dates from ISO strings
      if (parsed.createdAt) parsed.createdAt = new Date(parsed.createdAt);
      if (parsed.updatedAt) parsed.updatedAt = new Date(parsed.updatedAt);
      if (parsed.transformationMeta?.lastTransformed) {
        parsed.transformationMeta.lastTransformed = new Date(parsed.transformationMeta.lastTransformed);
      }

      return parsed;
    } catch (error) {
      console.error(`[UnifiedStorageManager] Hero data load failed: ${error.message}`);
      return null;
    }
  }
}

// Export singleton instance
export const unifiedStorage = UnifiedStorageManager.getInstance();
