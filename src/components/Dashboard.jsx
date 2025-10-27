// src/components/Dashboard.jsx

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';
import { useAuth } from '../hooks/useAuth.js';
import ProjectCard from './ProjectCard.jsx';
import WorkflowProgressIndicator from './WorkflowProgressIndicator.jsx';
import CompletedProjectsGallery from './CompletedProjectsGallery.jsx';
import GetStartedPanel from './GetStartedPanel.jsx';
import { projectRepository } from '../services/ProjectRepository';
import { deriveStageStatus, getStageRoute } from '../utils/stageStatus';
import { telemetry } from '../features/builder/useStageController';
// Data recovery tool temporarily disabled from UI

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
  const [isPurging, setIsPurging] = useState(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [purgeAcknowledged, setPurgeAcknowledged] = useState(false);
  // MVP: hide deleted items view and status filters
  const [showDeleted, setShowDeleted] = useState(false);
  const [deletedDrafts, setDeletedDrafts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState('');
  // Recovery UI disabled

  const effectiveUserId = useMemo(() => {
    if (!userId && !user?.isAnonymous) {
      return null;
    }
    return user?.isAnonymous ? 'anonymous' : userId;
  }, [userId, user?.isAnonymous]);

  // Delete All is always visible when there are projects

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
        let summaries = await projectRepository.list(effectiveUserId);
        const removed = await projectRepository.cleanupEmptyProjects().catch((e) => {
          console.warn('[Dashboard] Cleanup of empty projects failed', e);
          return 0;
        });
        if (removed > 0) {
          console.log(`[Dashboard] Removed ${removed} empty projects during cleanup`);
          summaries = await projectRepository.list(effectiveUserId);
        }
        console.log(`[Dashboard] Loaded ${summaries.length} projects`);

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

    // Opportunistically purge expired soft-deleted items
    projectRepository.purgeExpiredDeleted?.().catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [effectiveUserId]);

  // Auto-clear toast after a short delay
  useEffect(() => {
    if (!toastMessage) {return;}
    const t = setTimeout(() => setToastMessage(''), 3000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const handleOpenDraft = draftId => {
    if (!draftId) {
      return;
    }

    // Find the project to check its completion status
    const project = drafts.find(d => d.id === draftId);
    if (!project) {
      return;
    }

    // Use deriveStageStatus to determine current stage
    const { currentStage, stageStatus } = deriveStageStatus(project);

    // Track resume click with stage info
    telemetry.track('resume_click', {
      projectId: draftId,
      stage: currentStage,
      stageStatus: stageStatus[currentStage]
    });

    // Route to preview if project is completed, otherwise to stage route
    if (currentStage === 'review') {
      navigate(`/app/project/${draftId}/preview`);
    } else {
      // Route to the stage-specific page
      const stagePath = getStageRoute(draftId, currentStage);
      navigate(stagePath);
    }
  };

  const handleCreateNew = () => {
    // Route to the same minimal intake wizard as the header action
    navigate('/app/new');
  };

  const handleDeleteDraft = async draftId => {
    if (!effectiveUserId) {
      return;
    }
    try {
      await projectRepository.delete(effectiveUserId, draftId);
    } catch (error) {
      console.error('[Dashboard] Delete failed:', error);
    }
    setDrafts(prev => prev.filter(draft => draft.id !== draftId));
  };

  const requestDeleteAll = () => {
    if (!effectiveUserId) {
      return;
    }
    setShowPurgeConfirm(true);
    setPurgeAcknowledged(false);
  };

  const cancelDeleteAll = () => {
    setShowPurgeConfirm(false);
    setPurgeAcknowledged(false);
  };

  const handleDeleteAll = async () => {
    if (!effectiveUserId) {return;}
    if (!purgeAcknowledged) {
      setToastMessage('Please confirm you understand this action before deleting all projects.');
      return;
    }
    try {
      setIsPurging(true);
      await projectRepository.deleteAll(effectiveUserId);
      setDrafts([]);
      setToastMessage('All projects deleted');
      setShowPurgeConfirm(false);
      setPurgeAcknowledged(false);
    } catch (e) {
      console.error('[Dashboard] Bulk delete failed:', e);
      setToastMessage('Delete failed. Please try again.');
    } finally {
      setIsPurging(false);
    }
  };

  const handleToggleDeleted = async () => {
    setShowDeleted(v => !v);
    if (!showDeleted) {
      try {
        const items = await projectRepository.listDeleted();
        setDeletedDrafts(items);
      } catch (e) {
        console.warn('[Dashboard] Failed to load deleted items', e);
        setDeletedDrafts([]);
      }
    }
  };

  const handleRestore = async (draftId) => {
    if (!effectiveUserId) {return;}
    try {
      await projectRepository.restore(effectiveUserId, draftId);
      setDeletedDrafts(prev => prev.filter(d => d.id !== draftId));
    } catch (e) {
      console.error('[Dashboard] Restore failed:', e);
    }
  };

  // Recovery handler removed for now

  // MVP: show all drafts without status filtering
  const filteredDrafts = drafts;

  // Group projects by stage using deriveStageStatus
  const groupedProjects = useMemo(() => {
    const groups = {
      ideation: [],
      journey: [],
      deliverables: [],
      completed: []
    };

    filteredDrafts.forEach(project => {
      const { currentStage } = deriveStageStatus(project);

      if (currentStage === 'review') {
        groups.completed.push(project);
      } else {
        groups[currentStage].push(project);
      }
    });

    return groups;
  }, [filteredDrafts]);

  // Find most recently modified in-progress project for "Resume" quick action
  const mostRecentInProgressProject = useMemo(() => {
    const inProgress = [
      ...groupedProjects.ideation,
      ...groupedProjects.journey,
      ...groupedProjects.deliverables
    ];

    if (inProgress.length === 0) return null;

    return inProgress.reduce((most, project) => {
      const projectDate = new Date(project.updatedAt || project.createdAt);
      const mostDate = new Date(most.updatedAt || most.createdAt);
      return projectDate > mostDate ? project : most;
    });
  }, [groupedProjects]);

  return (
    <div className="relative min-h-screen transition-colors bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-[#040b1a] dark:via-[#040b1a] dark:to-[#0a1628]">
      <div className="hidden dark:block pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(94,118,255,0.28),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.22),transparent_45%),radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.18),transparent_55%)] opacity-80" />
      <div className="relative">
        <Container className="pt-24 pb-20">
        <Stack spacing={8}>
          {/* Refined Header with macOS styling */}
          <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4" role="banner">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 squircle-sm bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25" aria-hidden="true">
                  <Icon name="home" size="md" color="white" />
                </div>
                <Heading level={1} className="text-slate-900 dark:text-slate-50">ALF Studio Dashboard</Heading>
              </div>
              <Text color="secondary" size="sm" className="ml-[52px]">Create and manage your project-based learning experiences</Text>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Primary Action: Resume or Start New */}
              {mostRecentInProgressProject ? (
                <>
                  <button
                    onClick={() => {
                      const { currentStage, stageStatus } = deriveStageStatus(mostRecentInProgressProject);
                      telemetry.track('resume_click', {
                        projectId: mostRecentInProgressProject.id,
                        stage: currentStage,
                        stageStatus: stageStatus[currentStage]
                      });
                      const route = getStageRoute(mostRecentInProgressProject.id, currentStage);
                      navigate(route);
                    }}
                    className="squircle-button flex items-center gap-2 px-5 py-2.5
                               bg-gradient-to-b from-blue-500 to-blue-600
                               hover:from-blue-600 hover:to-blue-700
                               active:scale-[0.98]
                               text-white font-medium text-sm
                               shadow-lg shadow-blue-500/25
                               hover:shadow-xl hover:shadow-blue-500/30
                               transition-all duration-200"
                    aria-label="Resume most recent project"
                  >
                    <Icon name="play" size="sm" color="white" />
                    <span>Resume "{mostRecentInProgressProject.title || 'Untitled'}"</span>
                  </button>

                  {/* Secondary: Start New */}
                  <button
                    onClick={() => navigate('/app/new')}
                    className="squircle-button flex items-center gap-2 px-4 py-2
                               bg-white/80 dark:bg-slate-800/80
                               hover:bg-white dark:hover:bg-slate-800
                               backdrop-blur-md
                               border border-slate-200/60 dark:border-slate-700/60
                               text-slate-700 dark:text-slate-300 font-medium text-sm
                               shadow-sm hover:shadow-md
                               active:scale-[0.98]
                               transition-all duration-200"
                  >
                    <Icon name="add" size="sm" />
                    <span>New Project</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/app/new')}
                  className="squircle-button flex items-center gap-2 px-5 py-2.5
                             bg-gradient-to-b from-blue-500 to-blue-600
                             hover:from-blue-600 hover:to-blue-700
                             active:scale-[0.98]
                             text-white font-medium text-sm
                             shadow-lg shadow-blue-500/25
                             hover:shadow-xl hover:shadow-blue-500/30
                             transition-all duration-200"
                >
                  <Icon name="add" size="sm" color="white" />
                  <span>Start New Project</span>
                </button>
              )}

              {/* Secondary Actions */}
              <button
                onClick={() => navigate('/app/samples?show=showcase')}
                className="squircle-button flex items-center gap-2 px-4 py-2
                           bg-white/80 dark:bg-slate-800/80
                           hover:bg-white dark:hover:bg-slate-800
                           backdrop-blur-md
                           border border-slate-200/60 dark:border-slate-700/60
                           text-slate-700 dark:text-slate-300 font-medium text-sm
                           shadow-sm hover:shadow-md
                           active:scale-[0.98]
                           transition-all duration-200"
              >
                <Icon name="sparkles" size="sm" />
                <span>Browse Showcase</span>
              </button>

              {/* Delete All moved to overflow menu concept (keeping for now but de-emphasized) */}
              {drafts.length > 0 && (
                <button
                  onClick={requestDeleteAll}
                  disabled={isPurging}
                  className="squircle-button flex items-center gap-2 px-3 py-2
                             bg-white/80 dark:bg-slate-800/80
                             hover:bg-red-50 dark:hover:bg-red-950/30
                             backdrop-blur-md
                             border border-slate-200/60 dark:border-slate-700/60
                             hover:border-red-200/60 dark:hover:border-red-800/60
                             text-slate-600 dark:text-slate-400
                             hover:text-red-600 dark:hover:text-red-400
                             text-sm
                             shadow-sm hover:shadow-md
                             active:scale-[0.98]
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-all duration-200"
                  aria-label="Delete all projects"
                >
                  <Icon name="delete" size="sm" />
                  <span className="hidden sm:inline">{isPurging ? 'Deleting…' : 'Delete All'}</span>
                </button>
              )}
            </div>
            {showPurgeConfirm && (
              <div className="mt-4 sm:mt-6 rounded-2xl border border-red-200/70 dark:border-red-800/50 bg-white/95 dark:bg-red-950/40 px-4 py-4 sm:px-5 sm:py-5 shadow-[0_10px_30px_rgba(220,38,38,0.08)]">
                <div className="space-y-4">
                  <div>
                    <Heading as="h3" size="sm" className="text-red-700 dark:text-red-300 font-semibold">
                      Delete all projects?
                    </Heading>
                    <Text size="sm" className="text-red-600 dark:text-red-200 mt-1">
                      This permanently removes every saved project from this browser. The action cannot be undone.
                    </Text>
                  </div>
                  <label className="flex items-start gap-2 text-sm text-red-700/80 dark:text-red-200">
                    <input
                      type="checkbox"
                      checked={purgeAcknowledged}
                      onChange={(event) => setPurgeAcknowledged(event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500"
                    />
                    <span>I understand this will permanently delete every project stored locally.</span>
                  </label>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
                    <Button
                      variant="ghost"
                      onClick={cancelDeleteAll}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      onClick={handleDeleteAll}
                      disabled={isPurging || !purgeAcknowledged}
                      className="w-full sm:w-auto"
                    >
                      {isPurging ? 'Deleting…' : 'Delete Everything'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </header>

          {/* Recovery result UI removed */}

          {toastMessage && (
            <div className="squircle-md bg-emerald-50/90 dark:bg-emerald-950/30 backdrop-blur-md
                            border border-emerald-200/60 dark:border-emerald-800/60
                            shadow-lg shadow-emerald-500/10
                            px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 squircle-sm bg-emerald-100 dark:bg-emerald-900/50">
                    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <Text className="text-emerald-800 dark:text-emerald-200 font-medium">{toastMessage}</Text>
                </div>
                <button
                  onClick={() => setToastMessage('')}
                  className="squircle-sm px-3 py-1.5 text-sm text-emerald-700 dark:text-emerald-300
                             hover:bg-emerald-100 dark:hover:bg-emerald-900/50
                             transition-colors duration-200"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="squircle-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg
                            border border-slate-200/50 dark:border-slate-700/50
                            shadow-[0_8px_32px_rgba(15,23,42,0.08)] dark:shadow-[0_12px_48px_rgba(0,0,0,0.4)]
                            p-10 text-center space-y-8">
              {/* Show the workflow so first-time users understand the journey */}
              <div className="max-w-3xl mx-auto">
                <WorkflowProgressIndicator />
              </div>
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 blur-xl animate-pulse" />
                  <Icon name="refresh" size="xl" className="relative animate-spin text-blue-600 dark:text-blue-400" />
                </div>
                <Text className="text-slate-600 dark:text-slate-400 font-medium">
                  Loading your projects…
                </Text>
              </div>
            </div>
          )}

          {!isLoading && loadError && (
            <div className="squircle-xl bg-amber-50/90 dark:bg-amber-950/30 backdrop-blur-lg
                            border border-amber-200/60 dark:border-amber-800/60
                            shadow-lg shadow-amber-500/10
                            p-8">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 squircle-sm bg-amber-100 dark:bg-amber-900/50 flex-shrink-0">
                  <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <Heading level={3} className="text-amber-900 dark:text-amber-100 font-semibold">
                    We couldn't load your projects
                  </Heading>
                  <Text className="text-amber-700 dark:text-amber-300">
                    {loadError.message || 'Please try again in a moment.'}
                  </Text>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !loadError && drafts.length === 0 && (
            <div className="squircle-xl relative overflow-hidden
                            bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg
                            border border-slate-200/50 dark:border-slate-700/50
                            shadow-[0_8px_32px_rgba(15,23,42,0.08)] dark:shadow-[0_12px_48px_rgba(0,0,0,0.4)]
                            p-10">
              {/* Gradient overlay */}
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none
                              bg-gradient-to-br from-blue-500 via-purple-500 to-emerald-500" />

              <div className="relative flex flex-col items-center gap-8 max-w-5xl mx-auto">
                {/* Icon illustration */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-2xl" />
                  <div className="relative flex items-center justify-center w-24 h-24 squircle-lg
                                  bg-gradient-to-br from-blue-50 to-purple-50
                                  dark:from-blue-950/30 dark:to-purple-950/30
                                  border border-blue-200/50 dark:border-blue-800/50
                                  shadow-lg shadow-blue-500/10">
                    <svg className="w-12 h-12 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>

                {/* Get Started copy + actions */}
                <div className="space-y-3 text-center">
                  <Heading level={2} className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                    No projects yet
                  </Heading>
                  <Text color="secondary" size="lg" className="leading-relaxed">
                    Start your first project and build in short, focused steps.
                  </Text>
                </div>

                <div className="w-full">
                  <GetStartedPanel
                    onStart={handleCreateNew}
                    onHowItWorks={() => navigate('/how-it-works')}
                  />
                </div>
              </div>
            </div>
          )}

          {!isLoading && !loadError && filteredDrafts.length > 0 && (
            <div className="space-y-12">
              {/* Workflow Progress Indicator (also shown in empty state) */}
              <WorkflowProgressIndicator />

              {/* Completed Projects Gallery (at top for celebration) */}
              {groupedProjects.completed.length > 0 && (
                <CompletedProjectsGallery
                  projects={groupedProjects.completed}
                  onOpen={handleOpenDraft}
                  onDuplicate={(project) => {
                    // TODO: Implement duplicate functionality
                    console.log('Duplicate project:', project.id);
                  }}
                  onArchive={(project) => {
                    // Archive is essentially soft delete
                    handleDeleteDraft(project.id);
                  }}
                />
              )}

              {/* In Progress Section: 3 Columns */}
              {(groupedProjects.ideation.length > 0 ||
                groupedProjects.journey.length > 0 ||
                groupedProjects.deliverables.length > 0) && (
                <section className="space-y-6" role="region" aria-label="In progress projects">
                  <Heading level={2} className="text-slate-900 dark:text-slate-50">
                    Working On
                  </Heading>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Ideation Column */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 px-1">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30">
                          <span className="text-base">💡</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                            1. Ideation
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            Define your big idea
                          </p>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          {groupedProjects.ideation.length}
                        </span>
                      </div>
                      <div className="space-y-4">
                        {groupedProjects.ideation.map(draft => (
                          <ProjectCard
                            key={draft.id}
                            draft={draft}
                            onOpen={handleOpenDraft}
                            onDelete={handleDeleteDraft}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Journey Column */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 px-1">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30">
                          <span className="text-base">🗺️</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                            2. Journey
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            Map the learning path
                          </p>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                          {groupedProjects.journey.length}
                        </span>
                      </div>
                      <div className="space-y-4">
                        {groupedProjects.journey.map(draft => (
                          <ProjectCard
                            key={draft.id}
                            draft={draft}
                            onOpen={handleOpenDraft}
                            onDelete={handleDeleteDraft}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Deliverables Column */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 px-1">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                          <span className="text-base">📦</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                            3. Deliverables
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            Plan outcomes & assessment
                          </p>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                          {groupedProjects.deliverables.length}
                        </span>
                      </div>
                      <div className="space-y-4">
                        {groupedProjects.deliverables.map(draft => (
                          <ProjectCard
                            key={draft.id}
                            draft={draft}
                            onOpen={handleOpenDraft}
                            onDelete={handleDeleteDraft}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>
          )}

          {/* Recently deleted panel hidden for MVP */}
        </Stack>
      </Container>
      </div>
    </div>
  );
}
