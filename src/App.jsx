// src/App.jsx

import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext.jsx';
import { useAuth } from './hooks/useAuth.js';

// Import all our page components
import Dashboard from './components/Dashboard.jsx';
import IdeationModule from './components/IdeationModule.jsx';
import CurriculumModule from './components/CurriculumModule.jsx';
import AssignmentModule from './components/AssignmentModule.jsx';

/**
 * The MainRouter component reads the global state and decides which
 * page-level component to render. This is the core of our app's navigation.
 */
const MainRouter = () => {
  const { currentView, selectedProjectId } = useAppContext();
  const { userId, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-3xl font-bold text-purple-600">Loading ProjectCraft...</h1>
      </div>
    );
  }

  if (!userId) {
    // In the future, this could be a public landing page.
    // For now, we show a simple "Please sign in" message or handle auth.
    return (
        <div className="flex items-center justify-center h-screen">
            <h1 className="text-3xl font-bold text-purple-600">Authenticating...</h1>
        </div>
    );
  }

  switch (currentView) {
    case 'ideation':
      return <IdeationModule />;
    case 'curriculum':
      return <CurriculumModule />;
    case 'assignment':
      return <AssignmentModule />;
    case 'dashboard':
    default:
      return <Dashboard />;
  }
};

/**
 * The App component is the absolute top-level of our application.
 * Its only job is to provide the global context and render the router.
 */
function App() {
  return (
    <AppProvider>
      <div className="bg-gray-50 font-sans min-h-screen p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-7xl mx-auto">
          <MainRouter />
        </div>
      </div>
    </AppProvider>
  );
}

export default App;
