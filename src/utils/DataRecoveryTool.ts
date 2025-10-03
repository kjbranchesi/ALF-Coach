/**
 * Data Recovery and Migration Tool
 * Recovers lost projects from localStorage and migrates them to unified storage
 */

import { unifiedStorage, type UnifiedProjectData } from '../services/UnifiedStorageManager';

export interface RecoveryResult {
  success: boolean;
  recoveredProjects: number;
  migratedProjects: number;
  errors: string[];
  projects: Array<{
    id: string;
    title: string;
    source: string;
    status: 'recovered' | 'migrated' | 'error';
  }>;
}

export class DataRecoveryTool {
  private static readonly LEGACY_PREFIXES = [
    'blueprint_',
    'journey-v5-',
    'alf-project-drafts'
  ];

  /**
   * Scan localStorage for recoverable project data
   */
  static async scanForRecoverableProjects(): Promise<{
    legacyBlueprints: Array<{ key: string; id: string; data: any }>;
    journeyData: Array<{ key: string; id: string; data: any }>;
    draftData: Array<{ key: string; data: any }>;
  }> {
    const legacyBlueprints: Array<{ key: string; id: string; data: any }> = [];
    const journeyData: Array<{ key: string; id: string; data: any }> = [];
    const draftData: Array<{ key: string; data: any }> = [];

    // Scan all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) {continue;}

      try {
        // Blueprint data
        if (key.startsWith('blueprint_')) {
          const id = key.replace('blueprint_', '');
          const rawData = localStorage.getItem(key);
          if (rawData) {
            const data = JSON.parse(rawData);
            legacyBlueprints.push({ key, id, data });
          }
        }

        // Journey data
        if (key.startsWith('journey-v5-')) {
          const id = key.replace('journey-v5-', '');
          const rawData = localStorage.getItem(key);
          if (rawData) {
            const data = JSON.parse(rawData);
            journeyData.push({ key, id, data });
          }
        }

        // Draft data
        if (key === 'alf-project-drafts') {
          const rawData = localStorage.getItem(key);
          if (rawData) {
            const data = JSON.parse(rawData);
            draftData.push({ key, data });
          }
        }
      } catch (error) {
        console.warn(`Failed to parse data for key ${key}:`, error.message);
      }
    }

    return { legacyBlueprints, journeyData, draftData };
  }

  /**
   * Recover all available project data and migrate to unified storage
   */
  static async recoverAndMigrateProjects(): Promise<RecoveryResult> {
    const result: RecoveryResult = {
      success: false,
      recoveredProjects: 0,
      migratedProjects: 0,
      errors: [],
      projects: []
    };

    try {
      console.log('[DataRecoveryTool] Starting data recovery and migration...');

      // Scan for recoverable data
      const { legacyBlueprints, journeyData, draftData } = await this.scanForRecoverableProjects();

      console.log(`[DataRecoveryTool] Found ${legacyBlueprints.length} legacy blueprints, ${journeyData.length} journey data, ${draftData.length} draft collections`);

      // Process legacy blueprints
      for (const { key, id, data } of legacyBlueprints) {
        try {
          // Check if already migrated
          const existing = await unifiedStorage.loadProject(id);
          if (existing) {
            console.log(`[DataRecoveryTool] Project ${id} already exists in unified storage, skipping`);
            continue;
          }

          // Convert to unified format
          const unifiedData = this.convertLegacyBlueprintToUnified(data, id);

          // Find matching journey data
          const matchingJourney = journeyData.find(j => j.id === id);
          if (matchingJourney) {
            unifiedData.capturedData = matchingJourney.data;
          }

          // Save to unified storage
          await unifiedStorage.saveProject(unifiedData);

          result.recoveredProjects++;
          result.projects.push({
            id,
            title: unifiedData.title,
            source: 'legacy_blueprint',
            status: 'recovered'
          });

          console.log(`[DataRecoveryTool] Recovered project: ${id} (${unifiedData.title})`);
        } catch (error) {
          result.errors.push(`Failed to recover blueprint ${id}: ${error.message}`);
          result.projects.push({
            id,
            title: data.title || data.wizardData?.projectTopic || 'Unknown',
            source: 'legacy_blueprint',
            status: 'error'
          });
        }
      }

      // Process orphaned journey data (where blueprint doesn't exist)
      for (const { key, id, data } of journeyData) {
        const hasBlueprint = legacyBlueprints.some(b => b.id === id);
        if (hasBlueprint) {continue;} // Already processed with blueprint

        try {
          // Check if already migrated
          const existing = await unifiedStorage.loadProject(id);
          if (existing) {
            console.log(`[DataRecoveryTool] Journey data ${id} already exists in unified storage, skipping`);
            continue;
          }

          // Create minimal project from journey data
          const unifiedData: UnifiedProjectData = {
            id,
            title: this.extractTitleFromJourneyData(data) || 'Recovered Project',
            userId: 'anonymous',
            createdAt: new Date(),
            updatedAt: new Date(),
            capturedData: data,
            version: '3.0',
            syncStatus: 'local',
            source: 'chat'
          };

          // Save to unified storage
          await unifiedStorage.saveProject(unifiedData);

          result.recoveredProjects++;
          result.projects.push({
            id,
            title: unifiedData.title,
            source: 'orphaned_journey',
            status: 'recovered'
          });

          console.log(`[DataRecoveryTool] Recovered orphaned journey: ${id} (${unifiedData.title})`);
        } catch (error) {
          result.errors.push(`Failed to recover journey data ${id}: ${error.message}`);
          result.projects.push({
            id,
            title: 'Unknown Journey',
            source: 'orphaned_journey',
            status: 'error'
          });
        }
      }

      // Process draft data
      for (const { key, data } of draftData) {
        try {
          // Draft data is organized by userId
          for (const [userId, userDrafts] of Object.entries(data)) {
            if (typeof userDrafts !== 'object') {continue;}

            for (const [draftId, draftData] of Object.entries(userDrafts as Record<string, any>)) {
              try {
                // Check if already migrated
                const existing = await unifiedStorage.loadProject(draftId);
                if (existing) {
                  console.log(`[DataRecoveryTool] Draft ${draftId} already exists in unified storage, skipping`);
                  continue;
                }

                // Convert draft to unified format
                const unifiedData = this.convertDraftToUnified(draftData, draftId, userId);

                // Save to unified storage
                await unifiedStorage.saveProject(unifiedData);

                result.migratedProjects++;
                result.projects.push({
                  id: draftId,
                  title: unifiedData.title,
                  source: 'draft_data',
                  status: 'migrated'
                });

                console.log(`[DataRecoveryTool] Migrated draft: ${draftId} (${unifiedData.title})`);
              } catch (error) {
                result.errors.push(`Failed to migrate draft ${draftId}: ${error.message}`);
                result.projects.push({
                  id: draftId,
                  title: 'Unknown Draft',
                  source: 'draft_data',
                  status: 'error'
                });
              }
            }
          }
        } catch (error) {
          result.errors.push(`Failed to process draft data: ${error.message}`);
        }
      }

      result.success = result.errors.length === 0 || (result.recoveredProjects + result.migratedProjects) > 0;

      console.log(`[DataRecoveryTool] Recovery complete: ${result.recoveredProjects} recovered, ${result.migratedProjects} migrated, ${result.errors.length} errors`);

      return result;
    } catch (error) {
      result.errors.push(`Recovery tool failed: ${error.message}`);
      console.error('[DataRecoveryTool] Recovery failed:', error);
      return result;
    }
  }

  /**
   * Convert legacy blueprint data to unified format
   */
  private static convertLegacyBlueprintToUnified(data: any, id: string): UnifiedProjectData {
    return {
      id,
      title: data.wizardData?.projectTopic || data.wizardData?.vision || data.title || 'Recovered Project',
      userId: data.userId || 'anonymous',
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
      wizardData: data.wizardData,
      projectData: data.projectData,
      capturedData: data.capturedData,
      ideation: data.ideation,
      journey: data.journey,
      deliverables: data.deliverables,
      chatHistory: data.chatHistory || [],
      version: '3.0',
      syncStatus: 'local',
      source: 'import'
    };
  }

  /**
   * Convert draft data to unified format
   */
  private static convertDraftToUnified(draftData: any, id: string, userId: string): UnifiedProjectData {
    return {
      id,
      title: draftData.project?.title || draftData.wizardData?.projectTopic || 'Migrated Project',
      userId,
      createdAt: draftData.metadata?.createdAt ? new Date(draftData.metadata.createdAt) : new Date(),
      updatedAt: draftData.metadata?.updatedAt ? new Date(draftData.metadata.updatedAt) : new Date(),
      wizardData: draftData.wizardData,
      projectData: draftData.project,
      capturedData: draftData.capturedData,
      version: '3.0',
      syncStatus: 'local',
      source: 'import'
    };
  }

  /**
   * Extract title from journey data
   */
  private static extractTitleFromJourneyData(journeyData: any): string | null {
    // Try to find title in various journey data fields
    if (journeyData['ideation.bigIdea']) {
      return `${journeyData['ideation.bigIdea'].substring(0, 50)  }...`;
    }
    if (journeyData['ideation.essentialQuestion']) {
      return `${journeyData['ideation.essentialQuestion'].substring(0, 50)  }...`;
    }
    return null;
  }

  /**
   * Clean up legacy data after successful migration
   */
  static async cleanupLegacyData(projectIds: string[]): Promise<void> {
    console.log(`[DataRecoveryTool] Cleaning up legacy data for ${projectIds.length} projects`);

    for (const id of projectIds) {
      try {
        // Remove legacy blueprint data
        localStorage.removeItem(`blueprint_${id}`);

        // Remove legacy journey data
        localStorage.removeItem(`journey-v5-${id}`);

        console.log(`[DataRecoveryTool] Cleaned up legacy data for project: ${id}`);
      } catch (error) {
        console.warn(`[DataRecoveryTool] Failed to cleanup legacy data for ${id}:`, error.message);
      }
    }
  }

  /**
   * Export all project data for backup
   */
  static async exportAllProjectData(): Promise<string> {
    try {
      const projects = await unifiedStorage.listProjects();
      const exportData = {
        exportDate: new Date().toISOString(),
        version: '3.0',
        projectCount: projects.length,
        projects: []
      };

      for (const project of projects) {
        try {
          const fullProject = await unifiedStorage.loadProject(project.id);
          if (fullProject) {
            exportData.projects.push(fullProject);
          }
        } catch (error) {
          console.warn(`Failed to export project ${project.id}:`, error.message);
        }
      }

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  /**
   * Import project data from backup
   */
  static async importProjectData(jsonData: string): Promise<{
    imported: number;
    errors: string[];
  }> {
    const result = { imported: 0, errors: [] };

    try {
      const data = JSON.parse(jsonData);

      if (!data.projects || !Array.isArray(data.projects)) {
        throw new Error('Invalid export format');
      }

      for (const project of data.projects) {
        try {
          // Generate new ID to avoid conflicts
          const newId = `imported_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
          const importedProject = {
            ...project,
            id: newId,
            createdAt: new Date(),
            updatedAt: new Date(),
            syncStatus: 'local'
          };

          await unifiedStorage.saveProject(importedProject);
          result.imported++;
        } catch (error) {
          result.errors.push(`Failed to import project: ${error.message}`);
        }
      }

      return result;
    } catch (error) {
      throw new Error(`Import failed: ${error.message}`);
    }
  }
}

// Export convenience function for easy access
export const dataRecoveryTool = DataRecoveryTool;