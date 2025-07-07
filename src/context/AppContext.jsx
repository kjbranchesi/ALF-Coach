// src/context/AppContext.jsx

import React, { createContext, useState, useContext } from 'react';

// Create the context object
const AppContext = createContext();

/**
 * This is a custom hook that our components will use to easily access the context.
 * It's a clean way to avoid writing `useContext(AppContext)` in every file.
 */
export const useAppContext = () => {
  return useContext(AppContext);
};

/**
 * This is the Provider component. It will wrap our entire application and
 * hold all the global state and functions, making them available to any
 * component that needs them.
 */
export const AppProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('loading'); // loading, dashboard, ideation, etc.
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // Centralized navigation function
  const navigateTo = (view, projectId = null) => {
    setSelectedProjectId(projectId);
    setCurrentView(view);
  };

  // The value object contains all the state and functions we want to make global.
  const value = {
    currentView,
    selectedProjectId,
    navigateTo,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
