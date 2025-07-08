// src/context/AppContext.jsx

import React, { createContext, useState, useContext } from 'react';
import { addDoc, collection, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../hooks/useAuth.js';

// Create the context object
const AppContext = createContext();

/**
 * This is a custom hook that our components will use to easily access the context.
 */
export const useAppContext = () => {
  return useContext(AppContext);
};

/**
 * This is the Provider component. It wraps our entire application and
 * holds all the global state and functions, making them available to any
 * component that needs them.
 */
export const AppProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const { userId } = useAuth();

  // Centralized navigation function
  const navigateTo = (view, projectId = null) => {
    setSelectedProjectId(projectId);
    setCurrentView(view);
  };

  /**
   * Creates a new project document in Firestore with a specified age group.
   * @param {string} ageGroup - The age group selected by the user in the modal.
   */
  const createNewProject = async (ageGroup) => {
    if (!userId || !ageGroup) {
      console.error("User ID or Age Group is missing. Cannot create project.");
      return;
    }
    try {
      const newProjectRef = await addDoc(collection(db, "projects"), {
        userId: userId,
        title: "Untitled Project",
        coreIdea: "A new idea waiting to be explored.",
        stage: "Ideation",
        ageGroup: ageGroup, // Save the selected age group
        createdAt: serverTimestamp(),
        curriculumDraft: "",
        assignments: [],
        ideationChat: [], // Start with an empty chat, the AI will initiate
      });
      navigateTo('ideation', newProjectRef.id);
    } catch (error) {
      console.error("Error creating new project:", error);
    }
  };

  /**
   * Deletes a project document from Firestore.
   * @param {string} projectId - The ID of the project to delete.
   */
  const deleteProject = async (projectId) => {
    if (!projectId) {
      console.error("No project ID provided for deletion.");
      return;
    }
    const docRef = doc(db, "projects", projectId);
    try {
      await deleteDoc(docRef);
      console.log("Project deleted successfully:", projectId);
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  // The value object contains all the state and functions we want to make global.
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
