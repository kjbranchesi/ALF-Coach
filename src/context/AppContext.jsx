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

  const navigateTo = (view, projectId = null) => {
    setSelectedProjectId(projectId);
    setCurrentView(view);
  };

  // FIX: Updated function to accept an object with all the new project details.
  const createNewProject = async (projectDetails) => {
    const { ageGroup, projectScope, subject, location } = projectDetails;
    if (!userId || !ageGroup || !projectScope) {
      console.error("User ID, Age Group, or Project Scope is missing. Cannot create project.");
      return;
    }
    try {
      // FIX: Add the new fields (scope, subject, location) to the Firestore document.
      const newProjectRef = await addDoc(collection(db, "projects"), {
        userId: userId,
        title: "Untitled Project",
        coreIdea: "",
        stage: "Ideation",
        ageGroup: ageGroup,
        scope: projectScope,
        subject: subject || "", // Ensure empty string if not provided
        location: location || "", // Ensure empty string if not provided
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

  const deleteProject = async (projectId) => {
    if (!projectId) {
      console.error("No project ID provided for deletion.");
      return;
    }
    const docRef = doc(db, "projects", projectId);
    try {
      await deleteDoc(docRef);
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

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
