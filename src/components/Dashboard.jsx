// src/components/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';
import { useAuth } from '../hooks/useAuth.js';
import { useAppContext } from '../context/AppContext.jsx';
import ProjectCard from './ProjectCard.jsx';
import { cleanupFirestoreListener } from '../utils/firestoreHelpers.js';

// --- Icon Components ---
const PlusIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg> );
const HomeIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> );

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
    <div className="animate-fade-in bg-slate-50 dark:bg-slate-900 min-h-screen p-6">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <HomeIcon className="text-blue-600" />
          <h1 className="text-[2.25rem] font-bold text-slate-800 dark:text-slate-100 leading-tight">Dashboard</h1>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 soft-rounded-xl shadow-soft-lg hover:shadow-soft-xl hover:lift flex items-center justify-center gap-2 soft-transition"
        >
          <PlusIcon />
          New Blueprint
        </button>
      </header>

      {isLoading ? (
        <p className="text-slate-500 dark:text-slate-400 text-center py-10">Loading your blueprints...</p>
      ) : projects.length === 0 ? (
        <div className="text-center soft-card soft-rounded-xl p-12">
          <h2 className="text-[1.875rem] font-bold text-slate-700 dark:text-slate-200 leading-tight">Welcome to Your Design Studio!</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6">You don't have any blueprints yet. Let's design your first one.</p>
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 soft-rounded-xl shadow-soft-lg hover:shadow-soft-xl hover:lift soft-transition"
          >
            Start Your First Blueprint
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} /> 
          ))}
        </div>
      )}
    </div>
  );
}
