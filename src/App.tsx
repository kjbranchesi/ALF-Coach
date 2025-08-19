// src/App.tsx

import React from 'react';
import AppRouter from './AppRouter';
import { ThemeProvider } from './providers/ThemeProvider';
import { SystemErrorBoundary } from './components/ErrorBoundary/SystemErrorBoundary';
import { ProjectDataProvider } from './contexts/ProjectDataContext';

const App: React.FC = () => {
  return (
    <SystemErrorBoundary>
      <ProjectDataProvider>
        <ThemeProvider>
          <AppRouter />
        </ThemeProvider>
      </ProjectDataProvider>
    </SystemErrorBoundary>
  );
};

export default App;