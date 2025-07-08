// src/context/AppContext.jsx

import React, { createContext, useState, useContext } from 'react';
import { addDoc, collection, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../hooks/useAuth.js';

const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const { userId } = useAuth();

  /**
   * Centralized navigation function.
   * For project views, it sets the project ID and switches to the 'workspace' view.
   * @param {string} view - The view to navigate to ('dashboard', 'workspace', 'summary').
   * @param {string|null} projectId - The ID of the project to work on or view.
   */
  const navigateTo = (view, projectId = null) => {
    setSelectedProjectId(projectId);
    setCurrentView(view);
  };

  const createNewProject = async (ageGroup) => {
    if (!userId || !ageGroup) {
      console.error("User ID or Age Group is missing. Cannot create project.");
      return;
    }
    try {
      const newProjectRef = await addDoc(collection(db, "projects"), {
        userId: userId,
        title: "Untitled Project",
        coreIdea: "",
        stage: "Ideation", // Start at the Ideation stage
        ageGroup: ageGroup,
        createdAt: serverTimestamp(),
        ideationChat: [], // Initialize chat histories
        curriculumChat: [],
        assignmentChat: [],
        curriculumDraft: "",
        assignments: [],
      });
      // Navigate to the unified workspace view for the new project
      navigateTo('workspace', newProjectRef.id);
    } catch (error) {
      console.error("Error creating new project:", error);
    }
  };

  const deleteProject = async (projectId) => {
    if (!projectId) {
      console.error("No project ID provided for deletion.");
      return;
    }
    const docRef = doc(db, "projects", projectId);
    try {
      await deleteDoc(docRef);
      console.log("Project deleted successfully:", projectId);
      // If the deleted project was being viewed, navigate back to the dashboard
      if (selectedProjectId === projectId) {
        navigateTo('dashboard');
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const value = {
    currentView,
    selectedProjectId,
    navigateTo,
    createNewProject,
    deleteProject,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
