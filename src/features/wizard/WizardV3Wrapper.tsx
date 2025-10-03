import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { WizardV3, WIZARD_STEP_CONFIGS, type WizardStepId } from './WizardV3';
import type { WizardDataV3 } from './wizardSchema';
import type { ProjectV3 } from '../../types/alf';
import { normalizeProjectV3 } from '../../utils/normalizeProject';
import { saveProjectDraft } from '../../services/projectPersistence';
import { useAuth } from '../../hooks/useAuth';

interface WizardV3WrapperProps {
  projectId?: string;
  initialData?: Partial<WizardDataV3>;
  onComplete: (payload: {
    draftId: string;
    project: ProjectV3;
    wizardData: Partial<WizardDataV3>;
  }) => Promise<void> | void;
  onCancel?: () => void;
  onSkip?: () => void;
}

interface PersistOptions {
  data?: Partial<WizardDataV3>;
  stage?: string;
  markCompleted?: boolean;
  projectOverride?: ProjectV3;
}

const generateDraftId = () => `bp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export function WizardV3Wrapper({
  projectId,
  initialData,
  onComplete,
  onCancel,
  onSkip
}: WizardV3WrapperProps) {
  const { user } = useAuth();
  const [draftId, setDraftId] = useState<string>(() => projectId || generateDraftId());
  const [currentStep, setCurrentStep] = useState<{ stepId: WizardStepId; stepIndex: number }>(
    () => ({ stepId: 'context', stepIndex: 0 })
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const latestDataRef = useRef<Partial<WizardDataV3>>(initialData ?? {});

  useEffect(() => {
    if (projectId && projectId !== draftId) {
      setDraftId(projectId);
    }
  }, [projectId, draftId]);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      latestDataRef.current = { ...initialData };
    }
  }, [initialData]);

  const userId = useMemo(() => {
    if (user?.uid) {return user.uid;}
    if (user?.isAnonymous) {return 'anonymous';}
    return 'anonymous';
  }, [user]);

  const persistSnapshot = useCallback(async (
    { data, stage, markCompleted, projectOverride }: PersistOptions = {}
  ) => {
    if (!draftId || !userId) {
      return null;
    }

    const mergedData: Partial<WizardDataV3> = {
      ...latestDataRef.current,
      ...(data ?? {})
    };
    latestDataRef.current = mergedData;

    const project: ProjectV3 = projectOverride || normalizeProjectV3(mergedData as WizardDataV3);
    const stageLabel = stage || currentStep.stepId;

    setIsSaving(true);
    try {
      await saveProjectDraft(
        userId,
        {
          wizardData: mergedData,
          project
        },
        {
          draftId,
          source: 'wizard',
          metadata: {
            stage: stageLabel,
            title: project.title,
            wizardCompleted: markCompleted ?? false
          }
        }
      );
      setSaveError(null);
    } catch (error) {
      console.error('[WizardV3Wrapper] Failed to persist wizard snapshot', error);
      const message = error instanceof Error ? error.message : 'Failed to persist wizard snapshot';
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }

    return { project, wizardData: mergedData };
  }, [currentStep.stepId, draftId, userId]);

  const handleStepChange = useCallback(({ stepId, stepIndex }: { stepId: WizardStepId; stepIndex: number }) => {
    setCurrentStep({ stepId, stepIndex });
  }, []);

  const handleSave = useCallback(async ({
    data,
    stepId
  }: {
    data: Partial<WizardDataV3>;
    stepId: WizardStepId;
    stepIndex: number;
  }) => {
    await persistSnapshot({ data, stage: stepId });
  }, [persistSnapshot]);

  const handleComplete = useCallback(async (project: ProjectV3) => {
    const result = await persistSnapshot({
      stage: 'handoff',
      markCompleted: true,
      projectOverride: project
    });

    await onComplete({
      draftId,
      project,
      wizardData: result?.wizardData ?? latestDataRef.current
    });
  }, [draftId, onComplete, persistSnapshot]);

  const statusMessage = () => {
    if (isSaving) {
      return 'Saving...';
    }
    if (saveError) {
      return saveError;
    }
    return null;
  };

  const wizardKey = `${draftId}-${initialData ? 'prefill' : 'new'}`;

  return (
    <div className="relative">
      <WizardV3
        key={wizardKey}
        initialData={latestDataRef.current}
        onSave={handleSave}
        onStepChange={handleStepChange}
        onComplete={handleComplete}
      />

      {statusMessage() && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className={`px-4 py-2 rounded-xl shadow-lg text-sm font-medium ${isSaving ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'}`}>
            {statusMessage()}
          </div>
        </div>
      )}

      {onSkip && (
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 px-3 py-1.5 text-xs rounded-full border border-slate-300 bg-white/80 backdrop-blur hover:bg-white"
        >
          Skip Wizard (Debug)
        </button>
      )}

      {onCancel && (
        <button
          onClick={onCancel}
          className="absolute top-4 left-4 px-3 py-1.5 text-xs rounded-full border border-slate-300 bg-white/80 backdrop-blur hover:bg-white"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
