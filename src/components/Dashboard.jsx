// src/components/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';
import { useAuth } from '../hooks/useAuth.js';
import ProjectCard from './ProjectCard.jsx';
import BlueprintBuilder from './BlueprintBuilder.jsx';
import { Button } from './ui/Button.jsx';
import { Plus, Home } from 'lucide-react';

// The main dashboard view for authenticated users.
// It displays a list of the user's projects and provides an entry point to create new ones.

export default function Dashboard() {
  const { userId } = useAuth();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!userId) return;

    setIsLoading(true);
    const projectsCollection = collection(db, "projects");
    const q = query(projectsCollection, where("userId", "==", userId));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const projectsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort projects by creation date, newest first.
      projectsData.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setProjects(projectsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching projects: ", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);
  
  // If the user is in the process of creating a new blueprint, show the BlueprintBuilder.
  if (isCreating) {
    return <BlueprintBuilder onCancel={() => setIsCreating(false)} />;
  }

  return (
    <div className="animate-fade-in space-y-8">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Home className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-neutral-800">My Blueprints</h1>
        </div>
        <Button onClick={() => setIsCreating(true)} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          New Blueprint
        </Button>
      </header>

      {isLoading ? (
        <p className="text-neutral-500 text-center py-10">Loading your blueprints...</p>
      ) : projects.length === 0 ? (
        // Empty state when the user has no projects.
        <div className="text-center bg-white p-12 rounded-2xl border-2 border-dashed border-neutral-300">
          <h2 className="text-2xl font-semibold text-neutral-700">Welcome to Your Design Studio!</h2>
          <p className="text-neutral-500 mt-2 mb-6 max-w-md mx-auto">This is where your project blueprints will live. Let's design your first one together.</p>
          <Button onClick={() => setIsCreating(true)} size="lg">
            Start Your First Blueprint
          </Button>
        </div>
      ) : (
        // Grid layout for displaying project cards.
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} /> 
          ))}
        </div>
      )}
    </div>
  );
}
