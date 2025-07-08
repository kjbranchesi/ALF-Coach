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
  // FIX: Renamed selectedStudioId to selectedProjectId for consistency.
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const { userId } = useAuth();

  /**
   * Centralized navigation function.
   * FIX: Renamed studioId parameter to projectId for clarity.
   * @param {string} view - The view to navigate to ('dashboard', 'workspace', 'summary').
   * @param {string|null} projectId - The ID of the project to work on or view.
   */
  const navigateTo = (view, projectId = null) => {
    setSelectedProjectId(projectId);
    setCurrentView(view);
  };

  // FIX: Renamed createNewStudio to createNewProject.
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
        stage: "Ideation",
        ageGroup: ageGroup,
        createdAt: serverTimestamp(),
        ideationChat: [],
        curriculumChat: [],
        assignmentChat: [],
        curriculumDraft: "",
        assignments: [],
      });
      navigateTo('workspace', newProjectRef.id);
    } catch (error) {
      console.error("Error creating new project:", error);
    }
  };

  // FIX: Renamed deleteStudio to deleteProject.
  const deleteProject = async (projectId) => {
    if (!projectId) {
      console.error("No project ID provided for deletion.");
      return;
    }
    const docRef = doc(db, "projects", projectId);
    try {
      await deleteDoc(docRef);
      // If the deleted project was being viewed, navigate back to the dashboard
      if (selectedProjectId === projectId) {
        navigateTo('dashboard');
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  // FIX: Updated the context value to provide the renamed functions and state.
  const value = {
    currentView,
    selectedProjectId,
    navigateTo,
    createNewProject,
    deleteProject,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
