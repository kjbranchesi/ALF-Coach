/**
 * RevisionService.ts - Track changes and maintain history of blueprint edits
 */

import { BlueprintDoc } from '../types/SOPTypes';

export interface Revision {
  id: string;
  timestamp: Date;
  blueprintId: string;
  changes: ChangeRecord[];
  author?: string;
  comment?: string;
  snapshot: BlueprintDoc;
}

export interface ChangeRecord {
  path: string; // e.g., "ideation.bigIdea"
  oldValue: any;
  newValue: any;
  action: 'create' | 'update' | 'delete';
}

export class RevisionService {
  private revisions: Map<string, Revision[]> = new Map();
  private currentRevision: Revision | null = null;
  private maxRevisions = 50; // Keep last 50 revisions per blueprint

  /**
   * Start tracking changes for a new revision
   */
  startRevision(blueprintId: string, comment?: string): void {
    this.currentRevision = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      blueprintId,
      changes: [],
      comment,
      snapshot: {} as BlueprintDoc // Will be set when committing
    };
  }

  /**
   * Track a change
   */
  trackChange(path: string, oldValue: any, newValue: any): void {
    if (!this.currentRevision) {
      console.warn('No active revision to track changes');
      return;
    }

    // Don't track if values are the same
    if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
      return;
    }

    const action = oldValue === undefined ? 'create' : 
                   newValue === undefined ? 'delete' : 'update';

    this.currentRevision.changes.push({
      path,
      oldValue,
      newValue,
      action
    });
  }

  /**
   * Commit the current revision
   */
  commitRevision(currentSnapshot: BlueprintDoc): void {
    if (!this.currentRevision || this.currentRevision.changes.length === 0) {
      this.currentRevision = null;
      return;
    }

    // Set the snapshot
    this.currentRevision.snapshot = JSON.parse(JSON.stringify(currentSnapshot));

    // Add to revisions list
    const blueprintId = this.currentRevision.blueprintId;
    if (!this.revisions.has(blueprintId)) {
      this.revisions.set(blueprintId, []);
    }

    const revisionList = this.revisions.get(blueprintId)!;
    revisionList.push(this.currentRevision);

    // Limit revisions
    if (revisionList.length > this.maxRevisions) {
      revisionList.shift(); // Remove oldest
    }

    // Clear current revision
    this.currentRevision = null;
  }

  /**
   * Get revision history for a blueprint
   */
  getHistory(blueprintId: string): Revision[] {
    return this.revisions.get(blueprintId) || [];
  }

  /**
   * Get a specific revision
   */
  getRevision(blueprintId: string, revisionId: string): Revision | undefined {
    const history = this.getHistory(blueprintId);
    return history.find(r => r.id === revisionId);
  }

  /**
   * Restore blueprint to a specific revision
   */
  restoreRevision(revisionId: string, blueprintId: string): BlueprintDoc | null {
    const revision = this.getRevision(blueprintId, revisionId);
    if (!revision) {
      return null;
    }

    return JSON.parse(JSON.stringify(revision.snapshot));
  }

  /**
   * Get change summary for display
   */
  getChangeSummary(revision: Revision): string {
    const summary: string[] = [];
    
    revision.changes.forEach(change => {
      const fieldName = this.getFieldDisplayName(change.path);
      
      switch (change.action) {
        case 'create':
          summary.push(`Added ${fieldName}`);
          break;
        case 'update':
          summary.push(`Updated ${fieldName}`);
          break;
        case 'delete':
          summary.push(`Removed ${fieldName}`);
          break;
      }
    });

    return summary.join(', ');
  }

  /**
   * Get human-readable field name
   */
  private getFieldDisplayName(path: string): string {
    const pathMap: Record<string, string> = {
      'wizard.vision': 'Project Vision',
      'wizard.subject': 'Subject',
      'wizard.students': 'Student Grade Level',
      'wizard.scope': 'Project Scope',
      'ideation.bigIdea': 'Big Idea',
      'ideation.essentialQuestion': 'Essential Question',
      'ideation.challenge': 'Challenge',
      'journey.phases': 'Journey Phases',
      'journey.activities': 'Activities',
      'journey.resources': 'Resources',
      'deliverables.milestones': 'Milestones',
      'deliverables.rubric': 'Assessment Rubric',
      'deliverables.impact.audience': 'Target Audience',
      'deliverables.impact.method': 'Presentation Method'
    };

    return pathMap[path] || path.split('.').pop() || path;
  }

  /**
   * Compare two blueprints and generate changes
   */
  compareBlueprints(oldBlueprint: BlueprintDoc, newBlueprint: BlueprintDoc): ChangeRecord[] {
    const changes: ChangeRecord[] = [];

    // Helper to recursively compare objects
    const compareObjects = (obj1: any, obj2: any, path: string) => {
      // Get all keys from both objects
      const allKeys = new Set([
        ...Object.keys(obj1 || {}),
        ...Object.keys(obj2 || {})
      ]);

      allKeys.forEach(key => {
        const newPath = path ? `${path}.${key}` : key;
        const val1 = obj1?.[key];
        const val2 = obj2?.[key];

        if (val1 === val2) return;

        if (typeof val1 === 'object' && typeof val2 === 'object' && 
            val1 !== null && val2 !== null && 
            !Array.isArray(val1) && !Array.isArray(val2)) {
          // Recursively compare objects
          compareObjects(val1, val2, newPath);
        } else if (JSON.stringify(val1) !== JSON.stringify(val2)) {
          // Values are different
          const action = val1 === undefined ? 'create' : 
                        val2 === undefined ? 'delete' : 'update';
          
          changes.push({
            path: newPath,
            oldValue: val1,
            newValue: val2,
            action
          });
        }
      });
    };

    compareObjects(oldBlueprint, newBlueprint, '');
    return changes;
  }

  /**
   * Export revision history (for backup/analysis)
   */
  exportHistory(blueprintId: string): string {
    const history = this.getHistory(blueprintId);
    return JSON.stringify(history, null, 2);
  }

  /**
   * Clear history for a blueprint
   */
  clearHistory(blueprintId: string): void {
    this.revisions.delete(blueprintId);
  }
}

// Singleton instance
export const revisionService = new RevisionService();