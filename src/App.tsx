// src/App.tsx

import React from 'react';
import AppRouter from './AppRouter';
import { ThemeProvider } from './providers/ThemeProvider';
import { SystemErrorBoundary } from './components/ErrorBoundary/SystemErrorBoundary';

const App: React.FC = () => {
  return (
    <SystemErrorBoundary>
      <ThemeProvider>
        <AppRouter />
      </ThemeProvider>
    </SystemErrorBoundary>
  );
};

export default App;