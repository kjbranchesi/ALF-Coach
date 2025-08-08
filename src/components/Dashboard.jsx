// src/components/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../hooks/useAuth.js';
import { useAppContext } from '../context/AppContext.jsx';
import ProjectCard from './ProjectCard.jsx';
import { cleanupFirestoreListener } from '../utils/firestoreHelpers.js';

// Design System imports
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
import { ALFOnboarding } from '../features/wizard/ALFOnboarding';

export default function Dashboard() {
  const { userId, user } = useAuth();
  const { setCurrentView, setCurrentProjectId } = useAppContext();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Handle anonymous users - use 'anonymous' string for anonymous users
    const effectiveUserId = user?.isAnonymous ? 'anonymous' : userId;
    
    if (!effectiveUserId) {
      setIsLoading(false);
      return;
    }
    
    console.log('Dashboard querying for userId:', effectiveUserId, 'isAnonymous:', user?.isAnonymous);

    let unsubscribe = null;
    setIsLoading(true);

    try {
      const projectsCollection = collection(db, "blueprints");
      const q = query(projectsCollection, where("userId", "==", effectiveUserId));

      unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const projectsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          projectsData.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
          setProjects(projectsData);
          setIsLoading(false);
        }, 
        (error) => {
          console.error("Error fetching projects: ", error);
          setIsLoading(false);
          // Don't set projects to empty on error - keep existing data
        }
      );
    } catch (error) {
      console.error("Error setting up projects listener:", error);
      setIsLoading(false);
    }

    return () => cleanupFirestoreListener(unsubscribe);
  }, [userId, user?.isAnonymous]);

  const handleCreateNew = () => {
    // Always show onboarding as process overview for new blueprints
    console.log('[Dashboard] Create new blueprint clicked - showing process overview');
    setShowOnboarding(true);
  };

  const proceedToBlueprint = () => {
    const newBlueprintId = 'new-' + Date.now();
    navigate(`/app/blueprint/${newBlueprintId}`);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    proceedToBlueprint();
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    proceedToBlueprint();
  };

  // Show onboarding if needed
  if (showOnboarding) {
    return (
      <ALFOnboarding
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    );
  }
  
  // Navigate directly to new architecture for project creation
  if (isCreating) {
    // This is now handled by handleCreateNew
    setIsCreating(false);
    return null;
  }

  return (
    <Section background="gray" className="min-h-screen">
      <Container>
        <Stack spacing={8}>
          <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Icon name="home" size="lg" color="#3b82f6" />
              <Heading level={1}>Dashboard</Heading>
            </div>
            <Button 
              onClick={handleCreateNew}
              variant="primary"
              size="lg"
              leftIcon="add"
            >
              New Blueprint
            </Button>
          </header>

          {isLoading ? (
            <div className="text-center py-10">
              <Icon name="refresh" size="xl" className="animate-spin mx-auto mb-4 text-blue-600 dark:text-blue-400" />
              <Text className="text-gray-600 dark:text-gray-400">Loading your blueprints...</Text>
            </div>
          ) : projects.length === 0 ? (
            <Card padding="lg" className="text-center">
              <Stack spacing={6} align="center">
                <Heading level={2}>Welcome to Your Design Studio!</Heading>
                <Text color="secondary" size="lg">
                  You don't have any blueprints yet. Let's design your first one.
                </Text>
                <Button 
                  onClick={handleCreateNew}
                  variant="primary"
                  size="lg"
                >
                  Start Your First Blueprint
                </Button>
              </Stack>
            </Card>
          ) : (
            <Grid cols={3} gap={6}>
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} /> 
          ))}
            </Grid>
          )}
        </Stack>
      </Container>
    </Section>
  );
}
