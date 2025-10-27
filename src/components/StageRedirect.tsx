/**
 * StageRedirect - Smart redirect from legacy builder paths to stage routes
 *
 * Phase 7 Cutover: Replaces ChatLoader with stage-aware routing
 *
 * Routes handled:
 * - /app/blueprint/:id → /app/projects/:id/{ideation|journey|deliverables}
 * - /app/project/:projectId → /app/projects/:id/{ideation|journey|deliverables}
 */

import React, { useEffect, useState } from 'react';
import { useParams, Navigate, useLocation } from 'react-router-dom';
import { UnifiedStorageManager } from '../services/UnifiedStorageManager';
import { deriveStageStatus, getStageRoute } from '../utils/stageStatus';
import { useAuth } from '../hooks/useAuth.js';

export function StageRedirect() {
  const { id, projectId } = useParams<{ id?: string; projectId?: string }>();
  const location = useLocation();
  const { user, userId } = useAuth();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const determineRedirect = async () => {
      const targetId = id || projectId;

      if (!targetId) {
        console.error('[StageRedirect] No project ID in route params');
        setRedirectPath('/app/dashboard');
        setIsLoading(false);
        return;
      }

      try {
        const storage = UnifiedStorageManager.getInstance();

        // Handle "new-*" IDs from the IntakeWizard: mint a real project ID and seed
        if (targetId.startsWith('new-')) {
          const newBlueprintId = `bp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

          // Preserve onboarding params (e.g., intro=1) and capture wizard context
          const params = new URLSearchParams(location.search || window.location.search || '');
          const qpSubjectsParam = params.get('subjects') || '';
          const qpSubjects = qpSubjectsParam ? qpSubjectsParam.split(',').filter(Boolean) : [];
          const qpPrimary = params.get('primarySubject') || '';
          const qpAge = params.get('ageGroup') || '';
          const qpClassSize = params.get('classSize') || '';
          const qpDuration = params.get('duration') || 'medium';
          const qpTopic = params.get('topic') || '';
          const qpProjectName = params.get('projectName') || '';
          const userIdentity = user?.isAnonymous ? 'anonymous' : (userId || 'anonymous');

          try {
            await storage.saveProject({
              id: newBlueprintId,
              title: qpProjectName || 'Untitled Project',
              userId: userIdentity,
              stage: 'ideation',
              status: 'draft',
              provisional: true,
              createdAt: new Date(),
              updatedAt: new Date(),
              wizardData: {
                entryPoint: 'learning_goal',
                projectTopic: qpTopic || '',
                projectName: qpProjectName || '',
                learningGoals: '',
                subjects: qpSubjects,
                primarySubject: qpPrimary || (qpSubjects[0] || ''),
                gradeLevel: qpAge || '',
                duration: qpDuration || 'medium',
                pblExperience: 'some',
                vision: qpTopic || 'balanced',
                subject: qpPrimary || (qpSubjects[0] || ''),
                ageGroup: qpAge || '',
                students: qpClassSize || '',
                location: '',
                materials: '',
                resources: '',
                scope: 'unit',
                metadata: {
                  createdAt: new Date(),
                  lastModified: new Date(),
                  version: '3.0',
                  wizardCompleted: false,
                  skippedFields: []
                }
              },
              ideation: { bigIdea: '', essentialQuestion: '', challenge: '' },
              journey: { phases: [], activities: [], resources: [] },
              deliverables: { milestones: [], rubric: { criteria: [] }, impact: { audience: '', method: '' } },
              chatHistory: []
            });
          } catch (seedErr) {
            console.error('[StageRedirect] Failed to seed new project', (seedErr as Error)?.message);
            setRedirectPath('/app/dashboard');
            setIsLoading(false);
            return;
          }

          // Redirect to ideation for the newly minted project, preserve intro param if present
          const intro = params.get('intro') === '1' ? '?intro=1' : '';
          const nextPath = `/app/projects/${newBlueprintId}/ideation${intro}`;
          console.log(`[StageRedirect] Minted new project ${newBlueprintId} from ${targetId} → ${nextPath}`);
          setRedirectPath(nextPath);
          setIsLoading(false);
          return;
        }

        // Load existing project from storage
        const project = await storage.loadProject(targetId);

        if (!project) {
          console.warn(`[StageRedirect] Project ${targetId} not found, redirecting to dashboard`);
          setRedirectPath('/app/dashboard');
          setIsLoading(false);
          return;
        }

        // Determine current stage from project data
        const { currentStage } = deriveStageStatus(project);

        // Build stage route path
        const stagePath = getStageRoute(targetId, currentStage);

        console.log(`[StageRedirect] ${targetId} → ${stagePath} (stage: ${currentStage})`);
        setRedirectPath(stagePath);
      } catch (error) {
        console.error('[StageRedirect] Failed to determine stage', error);
        setError('Failed to load project');
        setRedirectPath('/app/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    determineRedirect();
  }, [id, projectId, location.search, userId, user?.isAnonymous]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin">
            <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full" />
          </div>
          <p className="text-slate-600 dark:text-slate-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
        <div className="max-w-md p-6 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
            Unable to Load Project
          </h2>
          <p className="text-sm text-red-700 dark:text-red-200 mb-4">{error}</p>
          <a
            href="/app/dashboard"
            className="text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  // Fallback (should never reach here)
  return <Navigate to="/app/dashboard" replace />;
}
