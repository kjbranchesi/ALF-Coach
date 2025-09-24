// src/components/Dashboard.jsx

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';
import { useAuth } from '../hooks/useAuth.js';
import ProjectCard from './ProjectCard.jsx';
import { listProjectDraftSummaries, deleteProjectDraft } from '../services/projectPersistence';
import { unifiedStorage } from '../services/UnifiedStorageManager';
import { dataRecoveryTool } from '../utils/DataRecoveryTool';

// Design system imports
import {
  Container,
  Section,
  Stack,
  Grid,
  Card,
  Heading,
  Text,
  Button,
  Icon
} from '../design-system';

export default function Dashboard() {
  const { userId, user } = useAuth();
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryResult, setRecoveryResult] = useState(null);

  const effectiveUserId = useMemo(() => {
    if (!userId && !user?.isAnonymous) return null;
    return user?.isAnonymous ? 'anonymous' : userId;
  }, [userId, user?.isAnonymous]);

  useEffect(() => {
    let isMounted = true;

    const fetchDrafts = async () => {
      if (!effectiveUserId) {
        setDrafts([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        // Try unified storage first, then fallback to legacy persistence
        let summaries = [];

        try {
          // Get projects from unified storage
          const unifiedProjects = await unifiedStorage.listProjects();
          summaries = unifiedProjects.map(project => ({
            id: project.id,
            title: project.title,
            updatedAt: project.updatedAt.toISOString(),
            completeness: { core: 50, context: 50, progressive: 50, overall: 50 }, // Default completeness
            tierCounts: { core: 0, scaffold: 0, aspirational: 0 },
            metrics: { learningGoals: 0, successCriteria: 0, phases: 0, milestones: 0, artifacts: 0, rubrics: 0, roles: 0, scaffolds: 0, checkpoints: 0, risks: 0 },
            syncStatus: project.syncStatus
          }));
          console.log(`[Dashboard] Loaded ${summaries.length} projects from unified storage`);
        } catch (unifiedError) {
          console.warn(`[Dashboard] Unified storage failed, trying legacy: ${unifiedError.message}`);
          // Fallback to legacy persistence
          summaries = await listProjectDraftSummaries(effectiveUserId);
          console.log(`[Dashboard] Loaded ${summaries.length} projects from legacy persistence`);
        }

        if (isMounted) {
          setDrafts(summaries);
        }
      } catch (error) {
        console.error('Failed to load project drafts', error);
        if (isMounted) {
          const isPermissionDenied = error instanceof FirebaseError && error.code === 'permission-denied';
          setLoadError(isPermissionDenied
            ? null
            : error instanceof Error
              ? error
              : new Error('Unknown error'));
          setDrafts([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDrafts();

    return () => {
      isMounted = false;
    };
  }, [effectiveUserId]);

  const handleCreateNew = () => {
    const newDraftId = `new-${Date.now()}`;
    navigate(`/app/blueprint/${newDraftId}`);
  };

  const handleOpenDraft = draftId => {
    if (!draftId) return;
    navigate(`/app/blueprint/${draftId}`);
  };

  const handleDeleteDraft = async draftId => {
    if (!effectiveUserId) return;
    try {
      // Try unified storage first
      await unifiedStorage.deleteProject(draftId);
    } catch (error) {
      // Fallback to legacy deletion
      await deleteProjectDraft(effectiveUserId, draftId);
    }
    setDrafts(prev => prev.filter(draft => draft.id !== draftId));
  };

  const handleDataRecovery = async () => {
    if (isRecovering) return;

    setIsRecovering(true);
    setRecoveryResult(null);

    try {
      console.log('[Dashboard] Starting data recovery...');
      const result = await dataRecoveryTool.recoverAndMigrateProjects();
      setRecoveryResult(result);

      // Refresh the drafts list if any projects were recovered
      if (result.recoveredProjects > 0 || result.migratedProjects > 0) {
        // Re-fetch drafts to show recovered projects
        window.location.reload(); // Simple refresh for now
      }
    } catch (error) {
      console.error('[Dashboard] Data recovery failed:', error);
      setRecoveryResult({
        success: false,
        recoveredProjects: 0,
        migratedProjects: 0,
        errors: [error.message],
        projects: []
      });
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <Section background="gray" className="min-h-screen">
      <Container>
        <Stack spacing={8}>
          <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Icon name="home" size="lg" color="#3b82f6" />
              <Heading level={1}>Project Drafts</Heading>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {(import.meta.env.VITE_FEATURE_QUICK_SPARK ?? 'true') !== 'false' && (
                <Button
                  onClick={() => navigate('/app/quick-spark')}
                  variant="secondary"
                  size="sm"
                  leftIcon="sparkles"
                >
                  Start Quick Spark
                </Button>
              )}
              <Button
                onClick={() => navigate('/app/samples?show=showcase')}
                variant="secondary"
                size="sm"
                leftIcon="sparkles"
              >
                Explore Showcase
              </Button>
              <Button
                onClick={handleDataRecovery}
                variant="secondary"
                size="sm"
                leftIcon="refresh"
                disabled={isRecovering}
              >
                {isRecovering ? 'Recovering...' : 'Recover Projects'}
              </Button>
              <Button
                onClick={handleCreateNew}
                variant="primary"
                size="lg"
                leftIcon="add"
              >
                Start a New Project
              </Button>
            </div>
          </header>

          {recoveryResult && (
            <Card padding="lg" className={`${recoveryResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <Stack spacing={3}>
                <Heading level={3} className={recoveryResult.success ? 'text-green-800' : 'text-red-800'}>
                  Data Recovery {recoveryResult.success ? 'Completed' : 'Failed'}
                </Heading>
                <Text className={recoveryResult.success ? 'text-green-700' : 'text-red-700'}>
                  Recovered: {recoveryResult.recoveredProjects} projects, Migrated: {recoveryResult.migratedProjects} projects
                </Text>
                {recoveryResult.errors.length > 0 && (
                  <div>
                    <Text className="font-medium text-red-700 mb-2">Errors:</Text>
                    <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                      {recoveryResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {recoveryResult.projects.length > 0 && (
                  <div>
                    <Text className="font-medium mb-2">Recovered Projects:</Text>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {recoveryResult.projects.map((project, index) => (
                        <li key={index} className={project.status === 'error' ? 'text-red-600' : 'text-green-600'}>
                          {project.title} ({project.source}) - {project.status}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <Button
                  onClick={() => setRecoveryResult(null)}
                  variant="secondary"
                  size="sm"
                >
                  Dismiss
                </Button>
              </Stack>
            </Card>
          )}

          {isLoading && (
            <div className="text-center py-10">
              <Icon name="refresh" size="xl" className="animate-spin mx-auto mb-4 text-primary-600 dark:text-primary-400" />
              <Text className="text-gray-600 dark:text-gray-400">
                Loading your drafts…
              </Text>
            </div>
          )}

          {!isLoading && loadError && (
            <Card padding="lg" className="bg-amber-50 border border-amber-200">
              <Heading level={3} className="text-amber-800 mb-2">
                We couldn’t load your drafts
              </Heading>
              <Text className="text-amber-700">
                {loadError.message || 'Please try again in a moment.'}
              </Text>
            </Card>
          )}

          {!isLoading && !loadError && drafts.length === 0 && (
            <Card padding="lg" className="text-center">
              <Stack spacing={6} align="center">
                <Heading level={2}>No projects yet</Heading>
                <Text color="secondary" size="lg">
                  Start your first project to see it appear here.
                </Text>
                <Button
                  onClick={handleCreateNew}
                  variant="primary"
                  size="lg"
                >
                  Create Project
                </Button>
              </Stack>
            </Card>
          )}

          {!isLoading && !loadError && drafts.length > 0 && (
            <Grid cols={3} gap={6}>
              {drafts.map(draft => (
                <ProjectCard
                  key={draft.id}
                  draft={draft}
                  onOpen={handleOpenDraft}
                  onDelete={handleDeleteDraft}
                />
              ))}
            </Grid>
          )}
        </Stack>
      </Container>
    </Section>
  );
}
