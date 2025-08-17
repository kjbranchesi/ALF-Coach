/**
 * WizardMigrationService - Handles migration from legacy wizard data to streamlined v2.0
 */

import { 
  WizardData, 
  defaultWizardData, 
  legacyFieldMapping,
  EntryPoint,
  PBLExperience,
  ConversationPhase,
  wizardSchema
} from '../features/wizard/wizardSchema';

export class WizardMigrationService {
  /**
   * Check if data needs migration from legacy format
   */
  static needsMigration(data: any): boolean {
    // Check for legacy fields
    const hasLegacyFields = Object.keys(legacyFieldMapping).some(key => key in data);
    
    // Check for missing v2.0 fields
    const missingNewFields = !data.metadata?.version || data.metadata.version !== '2.0';
    
    // Check for old structure (if it has old fields but not new structure)
    const hasOldStructure = data.subject && !data.subjects; // Old single subject vs new array
    
    return hasLegacyFields || missingNewFields || hasOldStructure;
  }

  /**
   * Migrate from legacy data structure to v2.0
   */
  static migrateFromLegacy(legacyData: any): WizardData {
    console.log('[WizardMigration] Starting migration from legacy data:', legacyData);
    
    // Start with defaults
    const migrated: WizardData = { ...defaultWizardData };
    
    // Apply direct field mappings
    Object.entries(legacyFieldMapping).forEach(([oldKey, newKey]) => {
      if (legacyData[oldKey] !== undefined) {
        (migrated as any)[newKey] = legacyData[oldKey];
        console.log(`[WizardMigration] Mapped ${oldKey} → ${newKey}:`, legacyData[oldKey]);
      }
    });
    
    // Handle subject migration (single to array)
    if (legacyData.subject) {
      migrated.subjects = [legacyData.subject];
      migrated.primarySubject = legacyData.subject;
    } else if (legacyData.subjects && Array.isArray(legacyData.subjects)) {
      migrated.subjects = legacyData.subjects;
      migrated.primarySubject = legacyData.subjects[0];
    }
    
    // Map old grade level formats
    if (legacyData.gradeLevel) {
      migrated.gradeLevel = this.normalizeGradeLevel(legacyData.gradeLevel);
    }
    
    // Map old duration formats
    if (legacyData.duration) {
      migrated.duration = this.normalizeDuration(legacyData.duration);
    }
    
    // Infer entry point from available data
    migrated.entryPoint = this.inferEntryPoint(legacyData);
    
    // Infer PBL experience (default to 'some' for existing users)
    migrated.pblExperience = this.inferPBLExperience(legacyData);
    
    // Combine old materials and ideas into special requirements
    if (legacyData.materials || legacyData.initialIdeas) {
      const requirements: string[] = [];
      
      if (legacyData.materials?.readings?.length > 0) {
        requirements.push(`Readings: ${legacyData.materials.readings.join(', ')}`);
      }
      if (legacyData.materials?.tools?.length > 0) {
        requirements.push(`Tools: ${legacyData.materials.tools.join(', ')}`);
      }
      if (legacyData.initialIdeas?.length > 0) {
        requirements.push(`Initial ideas: ${legacyData.initialIdeas.join(', ')}`);
      }
      
      if (requirements.length > 0) {
        migrated.specialRequirements = requirements.join('\n');
      }
    }
    
    // Set metadata
    migrated.metadata = {
      ...migrated.metadata,
      createdAt: legacyData.createdAt || new Date(),
      lastModified: new Date(),
      version: '2.0',
      migrationApplied: true,
      wizardCompleted: true // Assume legacy data means wizard was completed
    };
    
    // Set conversation state
    migrated.conversationState = {
      phase: ConversationPhase.PROJECT_DESIGN, // Legacy users are past wizard
      contextCompleteness: {
        core: migrated.vision ? 100 : 0,
        context: this.calculateLegacyContextCompleteness(migrated),
        progressive: 0
      },
      gatheredContext: {},
      lastContextUpdate: new Date()
    };
    
    // Validate the migrated data
    try {
      const validated = wizardSchema.parse(migrated);
      console.log('[WizardMigration] Migration successful:', validated);
      return validated;
    } catch (error) {
      console.error('[WizardMigration] Validation failed, using partial migration:', error);
      // Return best effort migration even if validation fails
      return migrated;
    }
  }

  /**
   * Normalize grade level to match new format
   */
  private static normalizeGradeLevel(gradeLevel: string): string {
    const normalized = gradeLevel.toLowerCase().trim();
    
    // Map various formats to standard bands
    if (normalized.includes('k') || normalized.includes('kindergarten')) {
      return 'k-2';
    }
    if (normalized.includes('elementary') || normalized === '3-5') {
      return '3-5';
    }
    if (normalized.includes('middle') || normalized === '6-8') {
      return '6-8';
    }
    if (normalized.includes('high') || normalized === '9-12') {
      return '9-12';
    }
    if (normalized.includes('college') || normalized.includes('university')) {
      return 'college';
    }
    
    // Try to parse numeric grades
    const match = normalized.match(/(\d+)/);
    if (match) {
      const grade = parseInt(match[1]);
      if (grade <= 2) return 'k-2';
      if (grade <= 5) return '3-5';
      if (grade <= 8) return '6-8';
      if (grade <= 12) return '9-12';
      return 'college';
    }
    
    // Default to middle school if unclear
    return '6-8';
  }

  /**
   * Normalize duration to match new format
   */
  private static normalizeDuration(duration: string): 'short' | 'medium' | 'long' {
    const normalized = duration.toLowerCase().trim();
    
    if (normalized.includes('short') || normalized.includes('week')) {
      return 'short';
    }
    if (normalized.includes('long') || normalized.includes('semester')) {
      return 'long';
    }
    
    // Default to medium
    return 'medium';
  }

  /**
   * Infer entry point from legacy data
   */
  private static inferEntryPoint(legacyData: any): EntryPoint {
    // If they had materials, they probably started with materials
    if (legacyData.materials?.readings?.length > 0 || legacyData.materials?.tools?.length > 0) {
      return EntryPoint.MATERIALS_FIRST;
    }
    
    // If they had a clear vision/motivation, they had learning goals
    if (legacyData.vision || legacyData.motivation) {
      return EntryPoint.LEARNING_GOAL;
    }
    
    // Default to explore
    return EntryPoint.EXPLORE;
  }

  /**
   * Infer PBL experience level from legacy data
   */
  private static inferPBLExperience(legacyData: any): PBLExperience {
    // Look for clues in the data complexity
    const hasDetailedMaterials = legacyData.materials?.readings?.length > 2 || 
                                 legacyData.materials?.tools?.length > 2;
    const hasMultipleIdeas = legacyData.initialIdeas?.length > 3;
    const hasComplexVision = legacyData.vision?.length > 100;
    
    if (hasDetailedMaterials && hasMultipleIdeas && hasComplexVision) {
      return PBLExperience.EXPERIENCED;
    }
    
    if (hasDetailedMaterials || hasMultipleIdeas || hasComplexVision) {
      return PBLExperience.SOME;
    }
    
    // Default to some experience for existing users
    return PBLExperience.SOME;
  }

  /**
   * Calculate context completeness for legacy data
   */
  private static calculateLegacyContextCompleteness(data: Partial<WizardData>): number {
    const contextFields = ['subjects', 'gradeLevel', 'duration', 'specialRequirements'];
    const filledFields = contextFields.filter(field => {
      const value = data[field as keyof WizardData];
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== '';
    });
    
    return (filledFields.length / contextFields.length) * 100;
  }

  /**
   * Perform batch migration for multiple documents
   */
  static async migrateBatch(documents: any[]): Promise<WizardData[]> {
    console.log(`[WizardMigration] Starting batch migration for ${documents.length} documents`);
    
    const migrated: WizardData[] = [];
    const errors: Array<{ doc: any; error: Error }> = [];
    
    for (const doc of documents) {
      try {
        if (this.needsMigration(doc)) {
          migrated.push(this.migrateFromLegacy(doc));
        } else {
          migrated.push(doc as WizardData);
        }
      } catch (error) {
        console.error('[WizardMigration] Failed to migrate document:', doc, error);
        errors.push({ doc, error: error as Error });
      }
    }
    
    console.log(`[WizardMigration] Batch migration complete. Success: ${migrated.length}, Errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.error('[WizardMigration] Migration errors:', errors);
    }
    
    return migrated;
  }

  /**
   * Create a rollback point before migration
   */
  static createBackup(data: any): string {
    const backup = {
      timestamp: new Date().toISOString(),
      originalData: data,
      version: data.metadata?.version || 'legacy'
    };
    
    // Store in localStorage as backup
    const backupKey = `wizard-backup-${Date.now()}`;
    try {
      localStorage.setItem(backupKey, JSON.stringify(backup));
      console.log(`[WizardMigration] Created backup at ${backupKey}`);
      return backupKey;
    } catch (error) {
      console.error('[WizardMigration] Failed to create backup:', error);
      return '';
    }
  }

  /**
   * Restore from backup if migration fails
   */
  static restoreFromBackup(backupKey: string): any {
    try {
      const backup = localStorage.getItem(backupKey);
      if (backup) {
        const parsed = JSON.parse(backup);
        console.log(`[WizardMigration] Restored from backup ${backupKey}`);
        return parsed.originalData;
      }
    } catch (error) {
      console.error('[WizardMigration] Failed to restore from backup:', error);
    }
    return null;
  }
}