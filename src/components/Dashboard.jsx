// src/components/Dashboard.jsx

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';
import { useAuth } from '../hooks/useAuth.js';
import ProjectCard from './ProjectCard.jsx';
import { projectRepository } from '../services/ProjectRepository';
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
  const [showDeleted, setShowDeleted] = useState(false);
  const [deletedDrafts, setDeletedDrafts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  // Recovery UI disabled

  const effectiveUserId = useMemo(() => {
    if (!userId && !user?.isAnonymous) {
      return null;
    }
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
        let summaries = await projectRepository.list(effectiveUserId);
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

  const handleOpenDraft = draftId => {
    if (!draftId) {
      return;
    }
    navigate(`/app/blueprint/${draftId}`);
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

  const handleDeleteAll = async () => {
    if (!effectiveUserId) return;
    const confirm1 = window.confirm('Delete ALL local projects? This cannot be undone.');
    if (!confirm1) return;
    const confirm2 = window.confirm('Are you absolutely sure? This will remove all projects from this browser.');
    if (!confirm2) return;
    try {
      setIsPurging(true);
      await projectRepository.deleteAll(effectiveUserId);
      setDrafts([]);
    } catch (e) {
      console.error('[Dashboard] Bulk delete failed:', e);
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
    if (!effectiveUserId) return;
    try {
      await projectRepository.restore(effectiveUserId, draftId);
      setDeletedDrafts(prev => prev.filter(d => d.id !== draftId));
    } catch (e) {
      console.error('[Dashboard] Restore failed:', e);
    }
  };

  // Recovery handler removed for now

  const filteredDrafts = drafts.filter(d => {
    if (statusFilter === 'all') return true;
    const s = d.status || 'draft';
    if (statusFilter === 'in-progress') return s === 'in-progress' || s === 'draft';
    if (statusFilter === 'ready') return s === 'ready';
    if (statusFilter === 'published') return s === 'published';
    return true;
  });

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
              <div className="flex items-center gap-1 bg-white/80 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60 rounded-full p-1">
                {['all','in-progress','ready','published'].map(key => (
                  <button
                    key={key}
                    onClick={() => setStatusFilter(key)}
                    className={`px-3 py-1.5 text-xs rounded-full ${statusFilter===key ? 'bg-primary-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    title={`Show ${key.replace('-', ' ')}`}
                  >
                    {key.replace('-', ' ')}
                  </button>
                ))}
              </div>
              <Button onClick={() => navigate('/app/new')} variant="primary" size="lg" leftIcon="add">Start New Project</Button>
              <Button
                onClick={() => navigate('/app/samples?show=showcase')}
                variant="secondary"
                size="sm"
                leftIcon="sparkles"
              >
                Browse Showcase
              </Button>
              {import.meta.env?.DEV && drafts.length > 0 && (
                <Button
                  onClick={handleDeleteAll}
                  variant="secondary"
                  size="sm"
                  disabled={isPurging}
                  leftIcon="delete"
                >
                  {isPurging ? 'Deleting…' : 'Delete All'}
                </Button>
              )}
              <Button
                onClick={handleToggleDeleted}
                variant="ghost"
                size="sm"
              >
                {showDeleted ? 'Hide Deleted' : 'Recently deleted'}
              </Button>
              {/* Recover Projects temporarily removed */}
            </div>
          </header>

          {/* Recovery result UI removed */}

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

          {!isLoading && !loadError && filteredDrafts.length > 0 && (
            <Grid cols={3} gap={6}>
              {filteredDrafts.map(draft => (
                <ProjectCard
                  key={draft.id}
                  draft={draft}
                  onOpen={handleOpenDraft}
                  onDelete={handleDeleteDraft}
                />
              ))}
            </Grid>
          )}

          {/* Recently deleted list (TTL 30 days) */}
          {showDeleted && (
            <Card padding="lg" className="bg-white/90 dark:bg-gray-900/90 border border-gray-200/60 dark:border-gray-700/60">
              <Heading level={3} className="mb-3">Recently deleted (last 30 days)</Heading>
              {deletedDrafts.length === 0 ? (
                <Text color="secondary">No deleted projects.</Text>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {deletedDrafts.map(d => (
                    <div key={d.id} className="rounded-xl border border-gray-200/60 dark:border-gray-700/60 p-4 bg-white/80 dark:bg-gray-900/80">
                      <div className="flex items-center justify-between">
                        <Heading level={4} className="truncate" title={d.title}>{d.title}</Heading>
                        <Button size="sm" variant="ghost" onClick={() => handleRestore(d.id)}>Restore</Button>
                      </div>
                      <Caption color="muted">Deleted {new Date(d.deletedAt).toLocaleDateString()}</Caption>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </Stack>
      </Container>
    </Section>
  );
}
