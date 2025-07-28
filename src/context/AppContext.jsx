// src/context/AppContext.jsx - COMPLETE FILE

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
  const { userId, user } = useAuth();

  const navigateTo = (view, projectId = null) => {
    setSelectedProjectId(projectId);
    setCurrentView(view);
  };

  const createNewBlueprint = async (blueprintDetails) => {
    const { educatorPerspective, subject, ageGroup, location, initialMaterials, projectScope, ideation } = blueprintDetails;
    
    // Handle anonymous users properly
    const effectiveUserId = userId || (user?.isAnonymous ? 'anonymous' : null);
    
    if (!effectiveUserId || !subject || !ageGroup || !educatorPerspective) {
      console.error("Required blueprint details are missing or no user authenticated.");
      return;
    }
    try {
      const newProjectRef = await addDoc(collection(db, "projects"), {
        userId: effectiveUserId,
        // Use real values, not placeholders
        title: `${subject} Learning Project`,
        subject: subject,
        educatorPerspective: educatorPerspective,
        initialMaterials: initialMaterials || "",
        ageGroup: ageGroup,
        location: location || "",
        projectScope: projectScope || "A Full Course/Studio",
        stage: PROJECT_STAGES.IDEATION,
        createdAt: serverTimestamp(),
        // CRITICAL: Use the exact same keys as in Firebase
        ideationChat: [],
        learningJourneyChat: [],
        studentDeliverablesChat: [],
        // Initialize empty but valid values
        curriculumDraft: "",
        assignments: [],
        assessmentMethods: "",
        coreIdea: "",
        challenge: "",
        // Add ideation fields with backward compatibility
        ideation: ideation || {
          bigIdea: "",
          essentialQuestion: "",
          challenge: ""
        },
        // Real abstract, not generic
        abstract: `An exploration of ${subject} for learners aged ${ageGroup}.`
      });
      navigateTo('workspace', newProjectRef.id);
    } catch (error) {
      console.error("Error creating new blueprint:", error);
    }
  };

  const saveIdeation = async (projectId, ideationData) => {
    if (!projectId || !ideationData) {return;}
    const docRef = doc(db, "projects", projectId);
    try {
      await updateDoc(docRef, { 
        ideation: ideationData,
        // Update stage to Learning Journey after ideation is complete
        stage: PROJECT_STAGES.LEARNING_JOURNEY
      });
    } catch (error) {
      console.error("Error saving ideation:", error);
    }
  };

  const deleteProject = async (projectId) => {
    if (!projectId) {return;}
    const docRef = doc(db, "blueprints", projectId);
    try {
      await deleteDoc(docRef);
      if (selectedProjectId === projectId) {
        navigateTo('dashboard');
      }
    } catch (error) {
      console.error("Error deleting blueprint:", error);
    }
  };

  const advanceProjectStage = async (projectId, nextStage) => {
    if (!projectId || !nextStage) {return;}
    const docRef = doc(db, "projects", projectId);
    try {
      await updateDoc(docRef, { stage: nextStage });
    } catch (error) {
      console.error("Error advancing project stage:", error);
    }
  };

  const reviseProjectStage = async (projectId, stageToRevise) => {
    if (!projectId || !stageToRevise) {return;}
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
    saveIdeation,
    deleteProject,
    advanceProjectStage,
    reviseProjectStage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};