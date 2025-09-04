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
// ALFOnboarding removed - now integrated into wizard

export default function Dashboard() {
  const { userId, user } = useAuth();
  const { setCurrentView, setCurrentProjectId, deleteProject } = useAppContext();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  // ALF onboarding is now integrated into the wizard
  // const [showOnboarding, setShowOnboarding] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Helper function to load blueprints from localStorage
  const loadBlueprintsFromLocalStorage = (effectiveUserId) => {
    const localBlueprints = [];
    
    try {
      // Get all localStorage keys that start with 'blueprint_'
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('blueprint_')) {
          try {
            const stored = localStorage.getItem(key);
            if (stored) {
              const blueprintData = JSON.parse(stored);
              
              // Only include blueprints that belong to the current user
              if (blueprintData.userId === effectiveUserId) {
                const blueprint = {
                  ...blueprintData,
                  // Convert ISO strings back to Date objects for compatibility
                  createdAt: blueprintData.createdAt ? new Date(blueprintData.createdAt) : new Date(),
                  updatedAt: blueprintData.updatedAt ? new Date(blueprintData.updatedAt) : new Date()
                };
                localBlueprints.push(blueprint);
              }
            }
          } catch (parseError) {
            console.warn(`Error parsing localStorage blueprint ${key}:`, parseError);
          }
        }
      }
    } catch (error) {
      console.warn('Error accessing localStorage:', error);
    }

    return localBlueprints;
  };

  // Helper function to merge and deduplicate blueprints
  const mergeBlueprintLists = (firebaseBlueprints, localBlueprints) => {
    const blueprintMap = new Map();
    
    // Add Firebase blueprints first (they take priority)
    firebaseBlueprints.forEach(blueprint => {
      blueprintMap.set(blueprint.id, blueprint);
    });
    
    // Add localStorage blueprints only if they don't exist in Firebase
    localBlueprints.forEach(blueprint => {
      if (!blueprintMap.has(blueprint.id)) {
        blueprintMap.set(blueprint.id, blueprint);
      }
    });
    
    // Convert to array and sort by creation date
    const mergedBlueprints = Array.from(blueprintMap.values());
    return mergedBlueprints.sort((a, b) => {
      const aTime = a.createdAt?.getTime ? a.createdAt.getTime() : 
                   a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const bTime = b.createdAt?.getTime ? b.createdAt.getTime() : 
                   b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return bTime - aTime;
    });
  };

  // Expose refresh function to window for AppContext to call
  useEffect(() => {
    window.refreshDashboard = () => {
      console.log('[Dashboard] Manual refresh triggered');
      setRefreshTrigger(prev => prev + 1);
    };
    
    return () => {
      delete window.refreshDashboard;
    };
  }, []);

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

    // Load blueprints from localStorage as initial fallback
    const localBlueprints = loadBlueprintsFromLocalStorage(effectiveUserId);
    console.log(`Loaded ${localBlueprints.length} blueprints from localStorage`);

    try {
      const projectsCollection = collection(db, "blueprints");
      const q = query(projectsCollection, where("userId", "==", effectiveUserId));

      unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const firebaseBlueprints = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          console.log(`Loaded ${firebaseBlueprints.length} blueprints from Firebase`);
          
          // Merge Firebase and localStorage blueprints
          const mergedBlueprints = mergeBlueprintLists(firebaseBlueprints, localBlueprints);
          console.log(`Total merged blueprints: ${mergedBlueprints.length}`);
          
          setProjects(mergedBlueprints);
          setIsLoading(false);
        }, 
        (error) => {
          console.error("Error fetching projects from Firebase: ", error);
          
          // On Firebase error, fall back to localStorage only
          if (localBlueprints.length > 0) {
            console.log('Falling back to localStorage blueprints only');
            setProjects(localBlueprints.sort((a, b) => {
              const aTime = a.createdAt?.getTime() || 0;
              const bTime = b.createdAt?.getTime() || 0;
              return bTime - aTime;
            }));
          }
          
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error("Error setting up projects listener:", error);
      
      // On setup error, fall back to localStorage only
      if (localBlueprints.length > 0) {
        console.log('Falling back to localStorage blueprints only');
        setProjects(localBlueprints.sort((a, b) => {
          const aTime = a.createdAt?.getTime() || 0;
          const bTime = b.createdAt?.getTime() || 0;
          return bTime - aTime;
        }));
      }
      
      setIsLoading(false);
    }

    return () => cleanupFirestoreListener(unsubscribe);
  }, [userId, user?.isAnonymous, refreshTrigger]);

  const handleCreateNew = () => {
    // Navigate directly to blueprint creation - ALF intro is now in the wizard
    console.log('[Dashboard] Create new blueprint clicked - navigating to blueprint');
    const newBlueprintId = 'new-' + Date.now();
    navigate(`/app/blueprint/${newBlueprintId}`);
  };

  // ALF onboarding handlers removed - now handled in wizard

  // ALF onboarding is now integrated into the wizard
  
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
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => (window.location.href = '/how-it-works')}
                variant="secondary"
                size="md"
              >
                How It Works
              </Button>
              <Button 
                onClick={() => navigate('/app/samples')}
                variant="secondary"
                size="md"
              >
                Explore Sample Projects
              </Button>
              <Button 
                onClick={handleCreateNew}
                variant="primary"
                size="lg"
                leftIcon="add"
              >
                New Blueprint
              </Button>
            </div>
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
            <ProjectCard 
              key={project.id} 
              project={project}
              onDelete={async (projectId) => {
                await deleteProject(projectId);
                // Remove from local state immediately for instant UI update
                setProjects(prev => prev.filter(p => p.id !== projectId));
              }}
            /> 
          ))}
            </Grid>
          )}
        </Stack>
      </Container>
    </Section>
  );
}
