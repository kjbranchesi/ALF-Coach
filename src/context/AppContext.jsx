// src/context/AppContext.jsx

import React, { createContext, useState, useContext } from 'react';
import { addDoc, collection, serverTimestamp, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../hooks/useAuth.js';
import { PROJECT_STAGES } from '../config/constants';

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

  const createNewBlueprint = async (blueprintDetails) => {
    const { educatorPerspective, subject, ageGroup, initialMaterials } = blueprintDetails;
    if (!userId || !subject || !ageGroup || !educatorPerspective) {
      console.error("Required blueprint details are missing.");
      // You might want to show an error to the user here
      return;
    }
    try {
      const newProjectRef = await addDoc(collection(db, "projects"), {
        userId: userId,
        title: `Blueprint for ${subject}`,
        subject: subject,
        educatorPerspective: educatorPerspective,
        initialMaterials: initialMaterials || "", // Save the new field, defaulting to an empty string
        ageGroup: ageGroup,
        stage: PROJECT_STAGES.IDEATION, // Start at the Ideation stage
        createdAt: serverTimestamp(),
        // Initialize all chat histories and drafts to prevent errors
        ideationChat: [],
        learningJourneyChat: [],
        studentDeliverablesChat: [],
        curriculumDraft: "",
        assignments: [],
        assessmentMethods: "",
        coreIdea: "",
        challenge: "",
        abstract: `An exploration of ${subject} for learners aged ${ageGroup}.`
      });
      navigateTo('workspace', newProjectRef.id);
    } catch (error) {
      console.error("Error creating new blueprint:", error);
      // You might want to show an error to the user here
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
    createNewBlueprint,
    deleteProject,
    advanceProjectStage,
    reviseProjectStage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};