import { nanoid } from 'nanoid';
import { UnifiedStorageManager } from '../../services/UnifiedStorageManager';
import type { UnifiedProject } from '../../types/project';
import { defaultWizardData, EntryPoint } from '../../features/wizard/wizardSchema';
import { deriveSeedFields } from '../transformers/projectTransformers';

const mapDurationToWizard = (duration: string): 'short' | 'medium' | 'long' => {
  const lower = duration.toLowerCase();
  if (lower.includes('lesson') || lower.includes('day') || lower.includes('1-2')) {
    return 'short';
  }
  if (lower.includes('semester') || lower.includes('12') || lower.includes('quarter')) {
    return 'long';
  }
  return 'medium';
};

const cloneWizardData = () => {
  const now = new Date();
  return {
    ...defaultWizardData,
    metadata: {
      ...defaultWizardData.metadata,
      createdAt: now,
      lastModified: now,
      wizardCompleted: false,
      skippedFields: [],
    },
    conversationState: {
      ...defaultWizardData.conversationState,
      phase: defaultWizardData.conversationState.phase,
      contextCompleteness: {
        ...defaultWizardData.conversationState.contextCompleteness,
      },
    },
  };
};

export const seedBlueprintFromUnified = (project: UnifiedProject): string => {
  const blueprintId = `bp_${Date.now().toString(36)}_${nanoid(6)}`;
  const { bigIdea, essentialQuestion, challenge } = deriveSeedFields(project);
  const wizardData = cloneWizardData();

  wizardData.entryPoint = EntryPoint.EXPLORE;
  wizardData.projectTopic = bigIdea;
  wizardData.learningGoals = [essentialQuestion, challenge].filter(Boolean).join('\n');
  wizardData.subjects = project.meta.subjects;
  wizardData.primarySubject = project.meta.subjects[0] || '';
  wizardData.gradeLevel = project.meta.gradeBands[0] || '';
  wizardData.duration = mapDurationToWizard(project.meta.duration);

  const createdAt = new Date();

  const unifiedStorage = UnifiedStorageManager.getInstance();
  void unifiedStorage.saveProject({
    id: blueprintId,
    title: project.meta.title,
    userId: 'anonymous',
    wizardData,
    projectData: {
      unifiedProject: project,
      showcaseSeed: {
        microOverview: project.microOverview,
        quickSpark: project.quickSpark,
        assignments: project.assignments,
        outcomeMenu: project.outcomeMenu,
      },
    },
    capturedData: {
      seedSourceId: project.meta.id,
      seedVariant: project.metadata.variant,
    },
    stage: 'blueprint',
    source: 'import',
    createdAt,
    updatedAt: createdAt,
    syncStatus: 'local',
  });

  // Also persist legacy fallback so chat can load without unified storage
  const legacyBlueprint = {
    id: blueprintId,
    wizardData,
    createdAt: createdAt.toISOString(),
    updatedAt: createdAt.toISOString(),
    userId: 'anonymous',
    chatHistory: [],
    journey: {},
    ideation: {},
    deliverables: project.outcomeMenu,
    capturedData: {
      microOverview: project.microOverview,
      quickSpark: project.quickSpark,
      assignments: project.assignments,
    },
    projectData: { unifiedProject: project },
  };

  localStorage.setItem(`blueprint_${blueprintId}`, JSON.stringify(legacyBlueprint));

  return blueprintId;
};
