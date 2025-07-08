// src/context/AppContext.jsx

import React, { createContext, useState, useContext } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
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
  const [currentView, setCurrentView] = useState('dashboard'); // Default to dashboard
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const { userId } = useAuth(); // Get the current user from our hook

  // Centralized navigation function
  const navigateTo = (view, projectId = null) => {
    setSelectedProjectId(projectId);
    setCurrentView(view);
  };

  /**
   * Creates a new project document in Firestore and navigates to the Ideation module.
   * This function is now centralized here and can be called from anywhere in the app.
   */
  const createNewProject = async () => {
    if (!userId) {
      console.error("No user is signed in. Cannot create a project.");
      return;
    }

    try {
      // Create a new document in the "projects" collection
      const newProjectRef = await addDoc(collection(db, "projects"), {
        userId: userId,
        title: "Untitled Project",
        coreIdea: "A new idea waiting to be explored.",
        stage: "Ideation",
        createdAt: serverTimestamp(),
        curriculumDraft: "",
        assignments: [],
        // Provide a welcoming first message for the ideation chat
        ideationChat: [{ 
          role: 'assistant', 
          content: "Welcome! I'm ProjectCraft, your AI partner for curriculum design. To get started, what subject or general topic is on your mind for this new project?" 
        }],
      });
      
      // After the project is successfully created in the database, navigate to it.
      navigateTo('ideation', newProjectRef.id);
    } catch (error) {
      console.error("Error creating new project:", error);
      // Here you could add user-facing error handling, e.g., a toast notification
    }
  };

  // The value object contains all the state and functions we want to make global.
  const value = {
    currentView,
    selectedProjectId,
    navigateTo,
    createNewProject, // Expose the new function to the rest of the app
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
