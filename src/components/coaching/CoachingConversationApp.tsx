/**
 * CoachingConversationApp
 *
 * Main container for the Hero Project coaching conversation experience.
 * Replaces the 3928-line monolith with a clean, modular architecture.
 */

import React, { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

// Context and state management
import {
  CoachingConversationProvider,
  useCoachingConversation
} from '../../contexts/CoachingConversationContext';

// Core components
import { CoachingHeader } from './components/CoachingHeader';
import { ConversationArea } from './components/ConversationArea';
import { CoachingSidebar } from './components/CoachingSidebar';
import { MobileNavigationDrawer } from './components/MobileNavigationDrawer';

// Modal components
import { ConfirmationModal } from './components/ConfirmationModal';
import { HelpModal } from './components/HelpModal';
import { PreviewModal } from './components/PreviewModal';
import { ErrorRecoveryModal } from './components/ErrorRecoveryModal';

// Integration services
import { UnifiedStorageManager } from '../../services/UnifiedStorageManager';
import { heroProjectTransformer } from '../../services/HeroProjectTransformer';
import { CoachingHeroIntegration } from '../../services/CoachingConversationArchitecture';

// Types
interface CoachingConversationAppProps {
  projectId?: string;
  initialData?: any;
  onComplete?: (heroProjectData: any) => void;
  onNavigate?: (target: string) => void;
  className?: string;
}

/**
 * Internal App Component (uses context)
 */
const CoachingConversationAppInternal: React.FC<CoachingConversationAppProps> = ({
  projectId,
  initialData,
  onComplete,
  onNavigate,
  className = ''
}) => {
  const { state, actions } = useCoachingConversation();
  const [showPreview, setShowPreview] = useState(false);
  const [heroProjectData, setHeroProjectData] = useState<any>(null);
  const [isGeneratingHeroProject, setIsGeneratingHeroProject] = useState(false);

  // Initialize conversation on mount
  useEffect(() => {
    actions.initializeConversation(projectId, initialData);
  }, [projectId, initialData, actions.initializeConversation]);

  // Auto-save progress
  useEffect(() => {
    if (state.hasPendingChanges && !state.isAutoSaving) {
      const timer = setTimeout(() => {
        actions.saveProgress();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [state.hasPendingChanges, state.isAutoSaving, actions.saveProgress]);

  // Generate Hero Project when conversation is complete
  useEffect(() => {
    if (state.currentStage === 'HERO_TRANSFORMATION' && state.stageProgress.percentage >= 85) {
      generateHeroProject();
    }
  }, [state.currentStage, state.stageProgress.percentage]);

  const generateHeroProject = useCallback(async () => {
    if (isGeneratingHeroProject) return;

    try {
      setIsGeneratingHeroProject(true);

      // Convert coaching data to Hero Project format
      const transformation = CoachingHeroIntegration.convertCoachingDataToHeroProject(
        state.stageManager
      );

      // Transform using HeroProjectTransformer
      const heroData = await heroProjectTransformer.transformProject(
        transformation.heroProjectData,
        transformation.coachingData.transformationContext,
        transformation.transformationLevel
      );

      setHeroProjectData(heroData);

      // Notify parent component
      if (onComplete) {
        onComplete(heroData);
      }

      // Advance to final stage
      actions.updateCapturedData({
        'heroTransformation.completed': true,
        'heroTransformation.data': heroData
      });

    } catch (error) {
      actions.handleError(
        error as Error,
        'transformation',
        true
      );
    } finally {
      setIsGeneratingHeroProject(false);
    }
  }, [state.stageManager, onComplete, actions, isGeneratingHeroProject]);

  const handlePreviewHeroProject = useCallback(() => {
    if (heroProjectData) {
      setShowPreview(true);
    } else {
      generateHeroProject();
    }
  }, [heroProjectData, generateHeroProject]);

  const handleConfirmData = useCallback((confirmationId: string, approved: boolean) => {
    actions.confirmData(confirmationId, approved);
  }, [actions.confirmData]);

  const handleErrorRecovery = useCallback((errorId: string, action: 'retry' | 'ignore' | 'reset') => {
    switch (action) {
      case 'retry':
        // Retry the last action that caused the error
        actions.clearError(errorId);
        break;
      case 'ignore':
        actions.clearError(errorId);
        break;
      case 'reset':
        actions.resetConversation();
        break;
    }
  }, [actions]);

  // Get current unrecoverable errors
  const criticalErrors = state.errors.filter(error => !error.recoverable);
  const recoverableErrors = state.errors.filter(error => error.recoverable);

  // Show critical error if present
  if (criticalErrors.length > 0) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Critical Error
            </h2>
          </div>
          <p className="text-gray-700 mb-4">
            {criticalErrors[0].message}
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => actions.resetConversation()}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Reset Conversation
            </button>
            <button
              onClick={() => onNavigate?.('dashboard')}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <CoachingHeader
        currentStage={state.currentStage}
        stageProgress={state.stageProgress}
        projectTitle={state.capturedData['project.title'] || 'Hero Project Design'}
        onSave={actions.saveProgress}
        onPreview={handlePreviewHeroProject}
        onNavigate={onNavigate}
        isSaving={state.isAutoSaving}
        lastSaved={state.lastSaved}
        hasUnsavedChanges={state.hasPendingChanges}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Hidden on mobile */}
        <AnimatePresence>
          {!state.sidebarCollapsed && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="hidden lg:block bg-white border-r border-gray-200"
            >
              <CoachingSidebar
                currentStage={state.currentStage}
                stageProgress={state.stageProgress}
                capturedData={state.capturedData}
                pendingConfirmations={state.pendingConfirmations}
                onNavigateToStage={(stageId) => {
                  // Navigate to specific stage if criteria met
                  if (state.stageManager.canAdvanceToStage(stageId)) {
                    actions.updateCapturedData({ 'navigation.targetStage': stageId });
                  }
                }}
                onEditCapturedData={actions.updateCapturedData}
                onShowHelp={(topic) => {
                  // Implementation for showing contextual help
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Conversation Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <ConversationArea
            messages={state.messages}
            currentStage={state.currentStage}
            isTyping={state.isTyping}
            input={state.input}
            suggestions={[]} // Would be populated from state
            onSendMessage={actions.sendMessage}
            onInputChange={(value) => {
              // Update input in context
            }}
            onSelectSuggestion={(suggestion) => {
              actions.sendMessage(suggestion.text);
            }}
            showSuggestions={state.showSuggestions}
            onToggleSuggestions={(show) => {
              // Update suggestions visibility
            }}
          />
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileNavigationDrawer
        isOpen={state.mobileMenuOpen}
        onClose={() => {
          // Close mobile menu
        }}
        currentStage={state.currentStage}
        stageProgress={state.stageProgress}
        capturedData={state.capturedData}
        onNavigateToStage={(stageId) => {
          // Mobile navigation logic
        }}
      />

      {/* Modals */}
      <AnimatePresence>
        {/* Confirmation Modals */}
        {state.pendingConfirmations.map(confirmation => (
          <ConfirmationModal
            key={confirmation.id}
            isOpen={true}
            confirmation={confirmation}
            onConfirm={(approved) => handleConfirmData(confirmation.id, approved)}
            onClose={() => handleConfirmData(confirmation.id, false)}
          />
        ))}

        {/* Help Modal */}
        {state.showContextualHelp && (
          <HelpModal
            isOpen={true}
            topic={state.activeHelpTopic}
            currentStage={state.currentStage}
            onClose={() => {
              // Close help modal
            }}
          />
        )}

        {/* Preview Modal */}
        {showPreview && heroProjectData && (
          <PreviewModal
            isOpen={true}
            heroProjectData={heroProjectData}
            onClose={() => setShowPreview(false)}
            onEdit={() => {
              setShowPreview(false);
              // Allow editing of hero project
            }}
            onExport={() => {
              // Export functionality
            }}
          />
        )}

        {/* Error Recovery Modal */}
        {recoverableErrors.length > 0 && (
          <ErrorRecoveryModal
            isOpen={true}
            errors={recoverableErrors}
            onRecover={handleErrorRecovery}
            onClose={() => {
              recoverableErrors.forEach(error =>
                actions.clearError(error.id)
              );
            }}
          />
        )}
      </AnimatePresence>

      {/* Loading Overlay for Hero Project Generation */}
      <AnimatePresence>
        {isGeneratingHeroProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <div className="flex items-center space-x-3">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Generating Hero Project
                  </h3>
                  <p className="text-sm text-gray-600">
                    Converting your design into a publication-ready Hero Project...
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Notification */}
      <AnimatePresence>
        {state.currentStage === 'HERO_TRANSFORMATION' && heroProjectData && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 right-4 bg-green-600 text-white rounded-lg p-4 shadow-lg z-40"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Hero Project Complete!</p>
                <p className="text-sm opacity-90">
                  Your project is ready for implementation.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Main exported component with provider wrapper
 */
export const CoachingConversationApp: React.FC<CoachingConversationAppProps> = (props) => {
  const storageManager = UnifiedStorageManager.getInstance({
    enableHeroTransformation: true,
    heroTransformationLevel: 'comprehensive'
  });

  return (
    <CoachingConversationProvider storageManager={storageManager}>
      <CoachingConversationAppInternal {...props} />
    </CoachingConversationProvider>
  );
};

export default CoachingConversationApp;