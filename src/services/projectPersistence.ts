import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { db, isOfflineMode } from '../firebase/firebase';
import { v4 as uuidv4 } from 'uuid';
import type { ProjectV3 } from '../types/alf';
import type { WizardData, WizardDataV3 } from '../features/wizard/wizardSchema';
import type { SnapshotMetrics } from '../utils/wizardExport';
import { evaluateWizardCompleteness } from '../utils/completeness/wizardCompleteness';

interface PersistenceOptions {
  draftId?: string;
  source?: 'wizard' | 'chat' | 'import';
  metadata?: Record<string, unknown>;
}

export interface ProjectDraftSummary {
  id: string;
  title: string;
  updatedAt: string;
  completeness: {
    core: number;
    context: number;
    progressive: number;
    overall: number;
  };
  tierCounts: {
    core: number;
    scaffold: number;
    aspirational: number;
  };
  metrics: SnapshotMetrics;
}

const LOCAL_STORAGE_KEY = 'alf-project-drafts';

export interface ProjectDraftPayload {
  wizardData?: Partial<WizardData> | Partial<WizardDataV3> | null;
  project?: Partial<ProjectV3> | null;
  capturedData?: Record<string, unknown> | null;
}

export interface ProjectDraftRecord extends ProjectDraftPayload {
  metadata?: Record<string, unknown> & { updatedAt?: string };
  completeness?: ProjectDraftSummary['completeness'];
  tierCounts?: ProjectDraftSummary['tierCounts'];
  metrics?: SnapshotMetrics;
}

const EMPTY_METRICS: SnapshotMetrics = {
  learningGoals: 0,
  successCriteria: 0,
  phases: 0,
  milestones: 0,
  artifacts: 0,
  rubrics: 0,
  roles: 0,
  scaffolds: 0,
  checkpoints: 0,
  risks: 0
};

function clone<T>(value: T): T {
  return value ? JSON.parse(JSON.stringify(value)) : value;
}

function computeCompletenessFromWizard(wizardData?: Partial<WizardData> | Partial<WizardDataV3> | null) {
  if (!wizardData) {
    return { core: 0, context: 0, progressive: 0, overall: 0 };
  }
  const completeness = evaluateWizardCompleteness(wizardData);
  return completeness.summary;
}

function computeCompleteness(project?: Partial<ProjectV3> | null, wizardData?: Partial<WizardData> | Partial<WizardDataV3> | null) {
  if (wizardData) {
    return computeCompletenessFromWizard(wizardData);
  }
  if (!project) {
    return { core: 0, context: 0, progressive: 0, overall: 0 };
  }

  const wizardLike = {
    projectTopic: project.title,
    learningGoals: project.learningGoals?.map(goal => ('text' in goal ? (goal as any).text : '')).filter(Boolean).join('\n'),
    vision: project.description,
    essentialQuestion: (project.essentialQuestion as any)?.text || '',
    subjects: (project.context as any)?.subjects || [],
    primarySubject: (project.context as any)?.subjects?.[0] || '',
    gradeLevel: (project.context as any)?.gradeLevel,
    duration: (project.context as any)?.timeWindow,
    projectContext: {
      schedule: (project.context as any)?.cadence,
      availableTech: (project.context as any)?.availableTech,
      resources: (project.context as any)?.availableMaterials
    },
    standardsAlignment: { standards: project.standards ?? [] },
    phases: project.phases,
    milestones: project.milestones,
    artifacts: project.artifacts,
    rubrics: project.rubrics,
    differentiation: project.differentiation,
    evidencePlan: project.evidencePlan,
    communications: project.communications,
    exhibition: project.exhibition
  } as any;

  return evaluateWizardCompleteness(wizardLike).summary;
}

function isWizardDataV3Candidate(value: Partial<WizardData> | Partial<WizardDataV3> | null | undefined): value is Partial<WizardDataV3> {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return 'milestones' in candidate || 'artifacts' in candidate || 'studentRoles' in candidate;
}

function computeSnapshotMetrics(
  project?: Partial<ProjectV3> | null,
  wizardData?: Partial<WizardData> | Partial<WizardDataV3> | null
): SnapshotMetrics {
  if (project) {
    return {
      learningGoals: project.learningGoals?.length ?? 0,
      successCriteria: project.successCriteria?.length ?? 0,
      phases: project.phases?.length ?? 0,
      milestones: project.milestones?.length ?? 0,
      artifacts: project.artifacts?.length ?? 0,
      rubrics: project.rubrics?.length ?? 0,
      roles: project.roles?.length ?? 0,
      scaffolds: project.scaffolds?.length ?? 0,
      checkpoints: project.evidencePlan?.checkpoints?.length ?? 0,
      risks: project.risks?.length ?? 0
    };
  }

  if (isWizardDataV3Candidate(wizardData)) {
    return {
      learningGoals: wizardData?.learningGoals?.length ?? 0,
      successCriteria: wizardData?.successCriteria?.length ?? 0,
      phases: wizardData?.phases?.length ?? 0,
      milestones: wizardData?.milestones?.length ?? 0,
      artifacts: wizardData?.artifacts?.length ?? 0,
      rubrics: wizardData?.rubrics?.length ?? 0,
      roles: wizardData?.studentRoles?.length ?? 0,
      scaffolds: wizardData?.scaffolds?.length ?? 0,
      checkpoints: wizardData?.evidencePlan?.checkpoints?.length ?? 0,
      risks: wizardData?.riskManagement?.risks?.length ?? 0
    };
  }

  return EMPTY_METRICS;
}

function extractTierCounts(project?: Partial<ProjectV3> | null) {
  const counts = { core: 0, scaffold: 0, aspirational: 0 };
  if (!project) return counts;
  const tally = (tier?: string) => {
    if (!tier) return;
    if (tier === 'core') counts.core += 1;
    else if (tier === 'scaffold') counts.scaffold += 1;
    else if (tier === 'aspirational') counts.aspirational += 1;
  };

  project.learningGoals?.forEach(goal => tally(goal.tier));
  project.successCriteria?.forEach(criteria => tally(criteria.tier));
  project.phases?.forEach(phase => tally((phase as any).tier));
  project.milestones?.forEach(milestone => tally((milestone as any).tier));
  project.artifacts?.forEach(artifact => tally((artifact as any).tier));
  project.rubrics?.forEach(rubric => tally((rubric as any).tier));
  project.scaffolds?.forEach(scaffold => tally((scaffold as any).tier));
  return counts;
}

function loadLocalDrafts(): Record<string, any> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, any>;
  } catch (error) {
    console.warn('Failed to read local project drafts', error);
    return {};
  }
}

function saveLocalDrafts(drafts: Record<string, any>) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(drafts));
  } catch (error) {
    console.warn('Failed to write local project drafts', error);
  }
}

async function waitForAuthentication(timeoutMs: number = 5000): Promise<boolean> {
  // Import auth here to avoid circular dependency
  const { auth } = await import('../firebase/firebase');

  if (auth.currentUser) {
    return true;
  }

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      unsubscribe();
      resolve(false);
    }, timeoutMs);

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        clearTimeout(timeout);
        unsubscribe();
        resolve(true);
      }
    });
  });
}

export async function saveProjectDraft(
  userId: string,
  payload: ProjectDraftPayload,
  options: PersistenceOptions = {}
): Promise<string> {
  const draftId = options.draftId
    ? options.draftId
    : (payload.project as ProjectV3 | undefined)?.id
      ? (payload.project as ProjectV3).id
      : typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : uuidv4();
  const completeness = computeCompleteness(payload.project, payload.wizardData);
  const tierCounts = extractTierCounts(payload.project);
  const metrics = computeSnapshotMetrics(payload.project, payload.wizardData);
  const record: ProjectDraftRecord = {
    completeness,
    tierCounts,
    metrics,
    metadata: {
      ...options.metadata,
      updatedAt: new Date().toISOString()
    }
  };

  if (payload.project) {
    record.project = clone(payload.project);
  }

  if (payload.wizardData) {
    record.wizardData = clone(payload.wizardData);
  }

  if (payload.capturedData !== undefined && payload.capturedData !== null) {
    record.capturedData = clone(payload.capturedData);
  }

  // Always save to localStorage first for immediate persistence
  const drafts = loadLocalDrafts();
  if (!drafts[userId]) drafts[userId] = {};
  drafts[userId][draftId] = record;
  saveLocalDrafts(drafts);

  // Attempt Firebase save with proper authentication checks
  if (!isOfflineMode && db?.type === 'firestore') {
    try {
      // Wait for authentication to complete before attempting Firebase operation
      const isAuthenticated = await waitForAuthentication(3000);

      if (!isAuthenticated) {
        console.warn(`[projectPersistence] Authentication timeout, using localStorage fallback for draft: ${draftId}`);
        return draftId;
      }

      // Verify we have a valid userId for Firestore operations
      const { auth } = await import('../firebase/firebase');
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.warn(`[projectPersistence] No authenticated user, using localStorage fallback for draft: ${draftId}`);
        return draftId;
      }

      // Use the actual authenticated user ID for Firestore path
      const authenticatedUserId = currentUser.isAnonymous ? 'anonymous' : currentUser.uid;

      const ref = doc(collection(db, 'users', authenticatedUserId, 'projectDrafts'), draftId);
      await setDoc(ref, {
        ...record,
        userId: authenticatedUserId,
        metadata: {
          ...record.metadata,
          updatedAt: serverTimestamp()
        }
      }, { merge: true });

      console.log(`[projectPersistence] Successfully saved draft to Firebase: ${draftId}`);
      return draftId;
    } catch (error: any) {
      // Handle specific Firebase permission errors gracefully
      if (error?.code === 'permission-denied' || error?.message?.includes('permission')) {
        console.warn(`[projectPersistence] Firebase permissions denied for draft ${draftId}, continuing with localStorage only:`, error.message);
      } else if (error?.code === 'unauthenticated') {
        console.warn(`[projectPersistence] Firebase authentication required for draft ${draftId}, continuing with localStorage only`);
      } else {
        console.error(`[projectPersistence] Firebase save failed for draft ${draftId}:`, error);
      }

      // Don't throw - localStorage save already succeeded
      return draftId;
    }
  }

  return draftId;
}

export async function loadProjectDraft(userId: string, draftId: string): Promise<ProjectDraftRecord | null> {
  if (!isOfflineMode && db?.type === 'firestore') {
    const ref = doc(collection(db, 'users', userId, 'projectDrafts'), draftId);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) {
      return null;
    }
    return snapshot.data() as ProjectDraftRecord;
  }

  const drafts = loadLocalDrafts();
  return drafts[userId]?.[draftId] ?? null;
}

export async function listProjectDraftSummaries(userId: string): Promise<ProjectDraftSummary[]> {
  if (!isOfflineMode && db?.type === 'firestore') {
    const draftsRef = collection(db, 'users', userId, 'projectDrafts');
    const q = query(draftsRef, orderBy('metadata.updatedAt', 'desc'));
    const snapshots = await getDocs(q);
    return snapshots.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.project?.title || data.wizardData?.projectTopic || 'Untitled project',
        updatedAt: data.metadata?.updatedAt?.toDate?.().toISOString?.() || new Date().toISOString(),
        completeness: data.completeness || computeCompleteness(data.project, data.wizardData),
        tierCounts: data.tierCounts || extractTierCounts(data.project),
        metrics: data.metrics || computeSnapshotMetrics(data.project, data.wizardData)
      };
    });
  }

  const drafts = loadLocalDrafts();
  const userDrafts = drafts[userId] || {};
  return Object.entries(userDrafts)
    .map(([id, data]: [string, any]) => ({
      id,
      title: data.project?.title || data.wizardData?.projectTopic || 'Untitled project',
      updatedAt: data.metadata?.updatedAt || new Date().toISOString(),
      completeness: data.completeness || computeCompleteness(data.project, data.wizardData),
      tierCounts: data.tierCounts || extractTierCounts(data.project),
      metrics: data.metrics || computeSnapshotMetrics(data.project, data.wizardData)
    }));
}

export async function deleteProjectDraft(userId: string, draftId: string): Promise<void> {
  if (!draftId) return;

  if (!isOfflineMode && db?.type === 'firestore') {
    const ref = doc(collection(db, 'users', userId, 'projectDrafts'), draftId);
    await deleteDoc(ref);
  }

  const drafts = loadLocalDrafts();
  if (drafts[userId]?.[draftId]) {
    delete drafts[userId][draftId];
    if (Object.keys(drafts[userId]).length === 0) {
      delete drafts[userId];
    }
    saveLocalDrafts(drafts);
  }
}
