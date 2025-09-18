// src/components/Dashboard.jsx

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';
import { useAuth } from '../hooks/useAuth.js';
import ProjectCard from './ProjectCard.jsx';
import { listProjectDraftSummaries, deleteProjectDraft } from '../services/projectPersistence';

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
        const summaries = await listProjectDraftSummaries(effectiveUserId);
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
    await deleteProjectDraft(effectiveUserId, draftId);
    setDrafts(prev => prev.filter(draft => draft.id !== draftId));
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
            <div className="flex items-center gap-3">
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
