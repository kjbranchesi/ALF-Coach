import React from 'react';
import { AlfOnboarding } from '../features/wizard/ALFOnboarding';

export const TestOnboarding: React.FC = () => {
  console.log('[TestOnboarding] Component rendered');
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <h1 className="text-2xl p-4">Testing Alf Onboarding</h1>
      <AlfOnboarding 
        onComplete={() => {
          console.log('[TestOnboarding] Onboarding completed');
          alert('Onboarding completed!');
        }}
        onSkip={() => {
          console.log('[TestOnboarding] Onboarding skipped');
          alert('Onboarding skipped!');
        }}
      />
    </div>
  );
};