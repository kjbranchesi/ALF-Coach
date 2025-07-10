// src/context/AppContext.jsx

import React, { createContext, useState, useContext } from 'react';
import { addDoc, collection, serverTimestamp, doc, deleteDoc, updateDoc } from 'firebase/firestore';
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

  const createNewProject = async (projectDetails) => {
    const { ageGroup, projectScope, subject, location } = projectDetails;
    if (!userId || !ageGroup || !projectScope) {
      console.error("User ID, Age Group, or Project Scope is missing. Cannot create project.");
      return;
    }
    try {
      const newProjectRef = await addDoc(collection(db, "projects"), {
        userId: userId,
        title: "Untitled Project",
        coreIdea: "",
        challenge: "",
        abstract: "",
        stage: "Ideation",
        ageGroup: ageGroup,
        scope: projectScope,
        subject: subject || "",
        location: location || "",
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
    if (!projectId) return;
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

  const advanceProjectStage = async (projectId, nextStage) => {
    if (!projectId || !nextStage) return;
    const docRef = doc(db, "projects", projectId);
    try {
      await updateDoc(docRef, { stage: nextStage });
    } catch (error) {
      console.error("Error advancing project stage:", error);
    }
  };

  const reviseProjectStage = async (projectId, stageToRevise) => {
    if (!projectId || !stageToRevise) return;
    const docRef = doc(db, "projects", projectId);
    try {
      await updateDoc(docRef, { stage: stageToRevise });
    } catch (error) {
      console.error("Error revising project stage:", error);
    }
  };

  const value = {
    currentView,
    selectedProjectId,
    navigateTo,
    createNewProject,
    deleteProject,
    advanceProjectStage,
    reviseProjectStage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};