// src/components/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';
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

export default function Dashboard() {
  const { userId, user } = useAuth();
  const { setCurrentView, setCurrentProjectId } = useAppContext();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // Handle anonymous users
    const effectiveUserId = userId || (user?.isAnonymous ? 'anonymous' : null);
    
    if (!effectiveUserId) {
      setIsLoading(false);
      return;
    }

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
  
  // Navigate directly to new architecture for project creation
  if (isCreating) {
    // Create a new blueprint and navigate to it
    const newBlueprintId = 'new-' + Date.now(); // Temporary ID, will be replaced by SOPFlowManager
    navigate(`/app/blueprint/${newBlueprintId}`);
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
              onClick={() => setIsCreating(true)}
              variant="primary"
              size="lg"
              leftIcon="add"
            >
              New Blueprint
            </Button>
          </header>

          {isLoading ? (
            <div className="text-center py-10">
              <Icon name="refresh" size="xl" className="animate-spin mx-auto mb-4" color="#3b82f6" />
              <Text color="muted">Loading your blueprints...</Text>
            </div>
          ) : projects.length === 0 ? (
            <Card padding="lg" className="text-center">
              <Stack spacing={6} align="center">
                <Heading level={2}>Welcome to Your Design Studio!</Heading>
                <Text color="secondary" size="lg">
                  You don't have any blueprints yet. Let's design your first one.
                </Text>
                <Button 
                  onClick={() => setIsCreating(true)}
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
