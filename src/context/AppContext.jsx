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
  const [selectedStudioId, setSelectedStudioId] = useState(null);
  const { userId } = useAuth();

  /**
   * Centralized navigation function.
   * @param {string} view - The view to navigate to ('dashboard', 'workspace', 'summary').
   * @param {string|null} studioId - The ID of the studio to work on or view.
   */
  const navigateTo = (view, studioId = null) => {
    setSelectedStudioId(studioId);
    setCurrentView(view);
  };

  const createNewStudio = async (ageGroup) => {
    if (!userId || !ageGroup) {
      console.error("User ID or Age Group is missing. Cannot create studio project.");
      return;
    }
    try {
      // NOTE: The firestore collection remains "projects" to avoid database migration.
      const newStudioRef = await addDoc(collection(db, "projects"), {
        userId: userId,
        title: "Untitled Studio Project",
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
      navigateTo('workspace', newStudioRef.id);
    } catch (error) {
      console.error("Error creating new studio project:", error);
    }
  };

  const deleteStudio = async (studioId) => {
    if (!studioId) {
      console.error("No studio ID provided for deletion.");
      return;
    }
    const docRef = doc(db, "projects", studioId);
    try {
      await deleteDoc(docRef);
      // If the deleted studio was being viewed, navigate back to the dashboard
      if (selectedStudioId === studioId) {
        navigateTo('dashboard');
      }
    } catch (error) {
      console.error("Error deleting studio project:", error);
    }
  };

  const value = {
    currentView,
    selectedStudioId,
    navigateTo,
    createNewStudio,
    deleteStudio,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
