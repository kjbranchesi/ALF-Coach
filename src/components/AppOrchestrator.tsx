/**
 * AppOrchestrator - Central component that manages the entire user experience
 * CRITICAL: Ensures seamless flow from wizard to chat to completion
 */

import React, { useEffect, useState } from 'react';
import { stateManager, useStateManager } from '../services/StateManager';
import { UserFlowOrchestrator } from '../services/UserFlowOrchestrator';
import { ProjectOnboardingWizard } from './onboarding/ProjectOnboardingWizard';
import { ChatbotFirstInterfaceFixed } from './chat/ChatbotFirstInterfaceFixed';
import { ChatErrorBoundary } from './ErrorBoundary/ChatErrorBoundaryV2';
import { SystemHealthDashboard } from './SystemHealthDashboard';
import { performanceMonitor } from '../services/PerformanceMonitor';
import { EnhancedButton } from './ui/EnhancedButton';
import { CheckCircle, AlertCircle, Clock, Wifi, WifiOff } from 'lucide-react';

interface AppOrchestratorProps {
  userId?: string;
}

export function AppOrchestrator({ userId = 'anonymous' }: AppOrchestratorProps) {
  const appState = useStateManager();
  const [isInitializing, setIsInitializing] = useState(true);
  const [userPersona, setUserPersona] = useState<string>('sarah-novice');

  // Log connection status to console
  useEffect(() => {
    console.log('[ALF Coach] Connection status:', {
      online: appState.connectionStatus.online,
      source: appState.connectionStatus.source,
      timestamp: new Date().toISOString()
    });
  }, [appState.connectionStatus]);

  // Initialize the app
  useEffect(() => {
    const initializeApp = async () => {
      const measureInit = performanceMonitor.startMeasurement('App Initialization');
      
      try {
        // Set user in state manager
        stateManager.setUser(userId, userId === 'anonymous');
        
        // Check for existing work in localStorage
        const existingWork = checkForExistingWork();
        if (existingWork) {
          await stateManager.loadBlueprint(existingWork.id);
        }
        
        setIsInitializing(false);
        measureInit(); // Record initialization time
      } catch (error) {
        console.error('App initialization error:', error);
        performanceMonitor.recordError(error as Error, 'App initialization');
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, [userId]);

  // Handle wizard completion
  const handleWizardComplete = async (wizardData: any) => {
    try {
      stateManager.setError(null);
      // Transform wizard data to match expected format
      const transformedData = {
        subject: wizardData.subject,
        gradeLevel: wizardData.gradeLevel,
        duration: wizardData.duration,
        location: wizardData.location,
        materials: wizardData.materials,
        initialIdeas: wizardData.initialIdeas
      };
      const blueprintId = await stateManager.createBlueprintFromWizard(transformedData);
      console.log('✅ Blueprint created with context:', {
        blueprintId,
        subject: transformedData.subject,
        gradeLevel: transformedData.gradeLevel
      });
    } catch (error) {
      console.error('Failed to create blueprint:', error);
      stateManager.setError('Failed to save your project setup. Your work is still saved locally.');
    }
  };

  // Handle wizard skip
  const handleWizardSkip = () => {
    // Create minimal blueprint for users who want to skip setup
    const minimalWizardData = {
      subject: 'General',
      ageGroup: 'Middle School',
      duration: '4 weeks',
      location: 'Classroom',
      motivation: 'Create engaging learning experience'
    };
    
    handleWizardComplete(minimalWizardData);
  };

  // Handle chat interactions
  const handleChatAction = async (action: string, userInput?: string) => {
    try {
      const result = await UserFlowOrchestrator.orchestrateFlow(userInput || '', action);
      
      if (result.success) {
        // Update blueprint with any data from the interaction
        if (result.nextStep !== appState.currentStep) {
          stateManager.setCurrentStep(result.nextStep);
        }
        
        // Update blueprint with processed user input
        if (userInput && userInput.trim()) {
          const updates = processUserInputForCurrentStep(appState.currentStep, userInput);
          if (updates) {
            stateManager.updateBlueprint(updates);
          }
        }
      } else {
        console.warn('Flow orchestration warning:', result.error);
      }
    } catch (error) {
      console.error('Chat action error:', error);
      stateManager.setError('Having trouble processing that. Your work is still saved.');
    }
  };

  // Check for existing work
  const checkForExistingWork = (): { id: string } | null => {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('blueprint_')) {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.userId === userId || data.userId === 'anonymous') {
            return { id: data.id };
          }
        }
      }
    } catch (error) {
      console.warn('Error checking existing work:', error);
    }
    return null;
  };

  // Process user input for current step
  const processUserInputForCurrentStep = (step: string, input: string): any => {
    const currentBlueprint = appState.currentBlueprint;
    if (!currentBlueprint) return null;

    const updates = { ...currentBlueprint };

    switch (step) {
      case 'IDEATION_BIG_IDEA':
        updates.ideation = {
          ...updates.ideation,
          bigIdea: input.trim()
        };
        break;
      case 'IDEATION_EQ':
        updates.ideation = {
          ...updates.ideation,
          essentialQuestion: input.trim()
        };
        break;
      case 'IDEATION_CHALLENGE':
        updates.ideation = {
          ...updates.ideation,
          challenge: input.trim()
        };
        break;
      default:
        return null;
    }

    return updates;
  };

  // Show loading state
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-12 h-12 text-primary-500 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Loading ALF Coach...
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Setting up your workspace
          </p>
        </div>
      </div>
    );
  }

  // Show wizard if no current blueprint
  if (!appState.currentBlueprint || appState.currentStep === 'ONBOARDING') {
    return (
      <div className="min-h-screen">
        <ProjectOnboardingWizard
          onComplete={handleWizardComplete}
          onSkip={handleWizardSkip}
        />
      </div>
    );
  }

  // Main chat interface
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Status Bar - Connection status moved to console */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              ALF Coach
            </h1>
            {/* Connection status moved to console only */}
          </div>
          
          <div className="flex items-center space-x-3">
            {appState.error && (
              <div className="flex items-center space-x-2 text-amber-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Working offline</span>
              </div>
            )}
            
            <EnhancedButton
              onClick={() => stateManager.clearBlueprint()}
              variant="outlined"
              size="sm"
            >
              New Project
            </EnhancedButton>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4">
        <ChatErrorBoundary
          onError={(error) => {
            console.error('Chat component error:', error);
            stateManager.setError('Chat temporarily unavailable');
          }}
          onRetry={() => {
            stateManager.clearError();
            window.location.reload();
          }}
        >
          {/* Current Step Indicator */}
          <div className="mb-6">
            {/* Step indicator removed - now integrated into chat */}
          </div>

          {/* Chat Interface - Now properly integrated */}
          <ChatbotFirstInterfaceFixed
            projectId={appState.currentBlueprint?.id}
            projectData={appState.currentBlueprint}
            onStageComplete={(stage, data) => {
              console.log('Stage completed:', stage, data);
              if (stage === 'onboarding') {
                // This is handled by handleWizardComplete
                handleWizardComplete(data);
              } else {
                // Update blueprint with stage data
                stateManager.updateBlueprint(data);
              }
            }}
            onNavigate={(target) => {
              console.log('Navigation requested:', target);
            }}
          />
        </ChatErrorBoundary>
      </div>

      {/* System Health Dashboard */}
      <SystemHealthDashboard />
    </div>
  );
}

// Helper function to get step display names
function getStepDisplayName(step: string): string {
  const stepNames: Record<string, string> = {
    'ONBOARDING': 'Project Setup',
    'IDEATION_BIG_IDEA': 'Big Idea Development',
    'IDEATION_EQ': 'Essential Question',
    'IDEATION_CHALLENGE': 'Project Challenge',
    'JOURNEY_PHASES': 'Learning Phases',
    'JOURNEY_ACTIVITIES': 'Activities & Skills',
    'JOURNEY_RESOURCES': 'Resources & Materials',
    'DELIVER_MILESTONES': 'Project Milestones',
    'DELIVER_RUBRIC': 'Assessment Design',
    'DELIVER_IMPACT': 'Project Impact'
  };

  return stepNames[step] || 'Project Development';
}

export default AppOrchestrator;