// src/components/Footer.jsx

import React from 'react';

// Design System imports
import { Container, Text } from '../design-system';

export default function Footer() {
  return (
    <footer className="w-full mt-16 py-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <Container>
        <div className="text-center">
          <Text size="sm" color="muted">
            &copy; {new Date().getFullYear()} ALF Coach. Active Learning Framework for Project-Based Education.
          </Text>
        </div>
      </Container>
    </footer>
  );
}
