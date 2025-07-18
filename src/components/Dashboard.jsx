// src/components/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';
import { useAuth } from '../hooks/useAuth.js';
import ProjectCard from './ProjectCard.jsx';
import BlueprintBuilder from './BlueprintBuilder.jsx';

// --- Icon Components ---
const PlusIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg> );
const HomeIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> );

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
      projectsData.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setProjects(projectsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching projects: ", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);
  
  if (isCreating) {
    return <BlueprintBuilder onCancel={() => setIsCreating(false)} />;
  }

  return (
    <div className="animate-fade-in">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <HomeIcon className="text-purple-600" />
          <h1 className="text-4xl font-bold text-slate-800">Dashboard</h1>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center justify-center gap-2 transition-all"
        >
          <PlusIcon />
          New Blueprint
        </button>
      </header>

      {isLoading ? (
        <p className="text-slate-500 text-center py-10">Loading your blueprints...</p>
      ) : projects.length === 0 ? (
        <div className="text-center bg-white p-12 rounded-2xl border border-dashed border-gray-300">
          <h2 className="text-2xl font-semibold text-slate-700">Welcome to Your Design Studio!</h2>
          <p className="text-slate-500 mt-2 mb-6">You don't have any blueprints yet. Let's design your first one.</p>
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition-all"
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
