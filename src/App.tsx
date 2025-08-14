// src/App.tsx

import React from 'react';
import AppRouter from './AppRouter';
import { ThemeProvider } from './providers/ThemeProvider';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  );
};

export default App;