/**
 * ChatInterface.tsx - Main chat component for ALF Coach
 * Orchestrates the SOP flow with stage-specific components
 */

import React, { useState, useRef, useEffect } from 'react';
import { type SOPFlowManager } from '../../core/SOPFlowManager';
import { type GeminiService } from '../../services/GeminiService';
import { 
  type ChatMessage, 
  type SuggestionCard, 
  type QuickReply,
  type SOPFlowState,
  type WizardData,
  SOPStep
} from '../../core/types/SOPTypes';
import { MessageBubble } from './MessageBubble';
import { QuickReplyChips } from './QuickReplyChips';
import { SuggestionCards } from './SuggestionCards';
import { ChatInput } from './ChatInput';
import { ProgressBar } from './ProgressBar';
import { StageInitiator, StepPrompt, StageClarifier, WizardFlow } from './stages';
import { DebugPanel } from './DebugPanel';
import { PDFExportService } from '../../core/services/PDFExportService';

interface ChatInterfaceProps {
  flowManager: SOPFlowManager;
  geminiService: GeminiService;
  onExportBlueprint?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  flowManager,
  geminiService,
  onExportBlueprint
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [flowState, setFlowState] = useState<SOPFlowState>(flowManager.getState());
  const [showStageComponent, setShowStageComponent] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pdfExportService = useRef(new PDFExportService());
  
  // Debug logging
  console.log('NEW ChatInterface rendering:', {
    showStageComponent,
    currentStage: flowState.currentStage,
    currentStep: flowState.currentStep,
    isWizard: flowState.currentStage === 'WIZARD',
    isCompleted: flowState.currentStage === 'COMPLETED'
  });

  // Subscribe to flow state changes
  useEffect(() => {
    const unsubscribe = flowManager.subscribe((newState) => {
      setFlowState(newState);
    });
    return unsubscribe;
  }, [flowManager]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Handle wizard completion
   */
  const handleWizardComplete = (data: WizardData) => {
    console.log('Wizard completed, transitioning to Ideation');
    flowManager.completeWizard(data);
    // Keep stage component showing for Ideation
    setShowStageComponent(true);
    // Force a re-render with new state
    setFlowState(flowManager.getState());
  };

  /**
   * Handle stage initiator step completion
   */
  const handleStepComplete = async (response: string) => {
    // Add user message
    addMessage({
      role: 'user',
      content: response
    });

    setIsLoading(true);
    setShowStageComponent(false);

    try {
      // Update flow manager with response
      flowManager.updateStepData(response);

      // Generate AI response
      const aiResponse = await geminiService.generate({
        step: flowState.currentStep,
        context: flowState.blueprintDoc,
        action: 'response',
        userInput: response
      });

      // Add AI message with quick replies - no continue yet
      const quickReplies: QuickReply[] = [
        { action: 'ideas', label: 'Ideas' },
        { action: 'whatif', label: 'What If?' },
        { action: 'help', label: 'Help' }
      ];

      addMessage({
        role: 'assistant',
        content: aiResponse.message,
        quickReplies,
        suggestions: aiResponse.suggestions
      });
      
      // Don't advance automatically - let user interact with chat first
      // The advancement will happen when user is ready via quick replies

    } catch (error) {
      console.error('Error handling step completion:', error);
      addMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle quick reply action
   */
  const handleQuickReply = async (action: string) => {
    if (!flowManager.isActionAllowed(action as any)) {
      console.error('Action not allowed:', action);
      return;
    }

    setIsLoading(true);

    try {
      // Handle stage progression
      if (action === 'continue') {
        if (flowManager.canAdvance()) {
          flowManager.advance();
          setShowStageComponent(true);
          
          // Clear messages on stage change
          if (flowState.currentStep.endsWith('_1')) {
            setMessages([]);
          }
        }
        return;
      }

      // Generate response for other actions
      const response = await geminiService.generate({
        step: flowState.currentStep,
        context: flowState.blueprintDoc,
        action: action as any
      });

      // After ideas/whatif/help, show response with Continue option
      const updatedQuickReplies: QuickReply[] = [
        { action: 'continue', label: 'Continue to Next Step' },
        { action: 'ideas', label: 'More Ideas' },
        { action: 'whatif', label: 'What If?' },
        { action: 'help', label: 'Help' }
      ];

      addMessage({
        role: 'assistant',
        content: response.message,
        suggestions: response.suggestions,
        quickReplies: updatedQuickReplies
      });

    } catch (error) {
      console.error('Error handling quick reply:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle stage clarifier action
   */
  const handleClarifierAction = async (action: string) => {
    if (action === 'continue') {
      flowManager.advance();
      setMessages([]);
      setShowStageComponent(true);
    } else if (action === 'refine') {
      // Go back to beginning of stage
      flowManager.resetToStageBeginning();
      setMessages([]);
      setShowStageComponent(true);
    } else if (action === 'help') {
      addMessage({
        role: 'assistant',
        content: 'I can help you refine any part of this stage. What would you like to adjust?',
        quickReplies: [
          { action: 'continue', label: 'Continue' },
          { action: 'refine', label: 'Start Over' }
        ]
      });
      setShowStageComponent(false);
    }
  };

  /**
   * Handle suggestion click
   */
  const handleSuggestionClick = (suggestion: SuggestionCard) => {
    addMessage({
      role: 'user',
      content: suggestion.text
    });
    
    flowManager.updateStepData(suggestion.text);
    
    // Move to next step
    if (flowManager.canAdvance()) {
      flowManager.advance();
      setShowStageComponent(true);
    }
  };

  /**
   * Handle text input
   */
  const handleInputSubmit = async () => {
    if (!inputValue.trim() || isLoading) {return;}

    const userInput = inputValue.trim();
    setInputValue('');

    // If stage component is showing, treat as step response
    if (showStageComponent) {
      handleStepComplete(userInput);
    } else {
      // Regular chat interaction
      addMessage({
        role: 'user',
        content: userInput
      });

      // Process based on context
      setIsLoading(true);
      try {
        const response = await geminiService.generate({
          step: flowState.currentStep,
          context: flowState.blueprintDoc,
          action: 'chat',
          userInput
        });

        // Add quick replies with continue option after regular chat
        const chatQuickReplies: QuickReply[] = [
          { action: 'continue', label: 'Continue to Next Step' },
          { action: 'ideas', label: 'Ideas' },
          { action: 'whatif', label: 'What If?' },
          { action: 'help', label: 'Help' }
        ];

        addMessage({
          role: 'assistant',
          content: response.message,
          suggestions: response.suggestions,
          quickReplies: chatQuickReplies
        });
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  /**
   * Add message to chat
   */
  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    flowManager.addMessage(newMessage);
  };

  /**
   * Handle PDF export for teacher guide
   */
  const handleExportTeacherGuide = async () => {
    setIsExporting(true);
    try {
      const blueprint = flowManager.exportBlueprint();
      const pdfBlob = await pdfExportService.current.exportTeacherGuide(blueprint);
      
      const projectTitle = blueprint.ideation?.bigIdea 
        ? blueprint.ideation.bigIdea.split(' ').slice(0, 3).join('_')
        : 'ALF_Project';
      
      pdfExportService.current.downloadPDF(
        pdfBlob, 
        `${projectTitle}_Teacher_Guide_${new Date().toISOString().split('T')[0]}.pdf`
      );
    } catch (error) {
      console.error('Failed to export teacher guide:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Handle PDF export for student guide
   */
  const handleExportStudentGuide = async () => {
    setIsExporting(true);
    try {
      const blueprint = flowManager.exportBlueprint();
      const pdfBlob = await pdfExportService.current.exportStudentGuide(blueprint);
      
      const projectTitle = blueprint.ideation?.bigIdea 
        ? blueprint.ideation.bigIdea.split(' ').slice(0, 3).join('_')
        : 'ALF_Project';
      
      pdfExportService.current.downloadPDF(
        pdfBlob, 
        `${projectTitle}_Student_Guide_${new Date().toISOString().split('T')[0]}.pdf`
      );
    } catch (error) {
      console.error('Failed to export student guide:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Handle export of both guides
   */
  const handleExportBothGuides = async () => {
    setIsExporting(true);
    try {
      const blueprint = flowManager.exportBlueprint();
      const { teacher, student } = await pdfExportService.current.exportCompletePackage(blueprint);
      
      const projectTitle = blueprint.ideation?.bigIdea 
        ? blueprint.ideation.bigIdea.split(' ').slice(0, 3).join('_')
        : 'ALF_Project';
      const date = new Date().toISOString().split('T')[0];
      
      // Download both files
      pdfExportService.current.downloadPDF(teacher, `${projectTitle}_Teacher_Guide_${date}.pdf`);
      
      // Small delay between downloads
      setTimeout(() => {
        pdfExportService.current.downloadPDF(student, `${projectTitle}_Student_Guide_${date}.pdf`);
      }, 500);
    } catch (error) {
      console.error('Failed to export guides:', error);
      alert('Failed to generate PDFs. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Get current stage step (1, 2, or 3)
   */
  const getCurrentStageStep = (): number => {
    // Use stageStep from flow state if available
    if (flowState.stageStep) {
      return flowState.stageStep;
    }
    
    // Otherwise determine from step name
    const step = flowState.currentStep;
    const stage = flowState.currentStage;
    
    switch (stage) {
      case 'IDEATION':
        if (step === 'IDEATION_BIG_IDEA') {return 1;}
        if (step === 'IDEATION_EQ') {return 2;}
        if (step === 'IDEATION_CHALLENGE') {return 3;}
        break;
      case 'JOURNEY':
        if (step === 'JOURNEY_PHASES') {return 1;}
        if (step === 'JOURNEY_ACTIVITIES') {return 2;}
        if (step === 'JOURNEY_RESOURCES') {return 3;}
        break;
      case 'DELIVERABLES':
        if (step === 'DELIVER_MILESTONES') {return 1;}
        if (step === 'DELIVER_RUBRIC') {return 2;}
        if (step === 'DELIVER_IMPACT') {return 3;}
        break;
    }
    
    return 1;
  };

  /**
   * Get stage summary for clarifier
   */
  const getStageSummary = () => {
    const blueprint = flowState.blueprintDoc;
    const stage = flowState.currentStage;

    switch (stage) {
      case 'IDEATION':
        return {
          step1: blueprint.ideation?.bigIdea || 'Developing...',
          step2: blueprint.ideation?.essentialQuestion || 'Developing...',
          step3: blueprint.ideation?.challenge || 'Developing...'
        };
      case 'JOURNEY':
        return {
          step1: blueprint.journey?.phases?.length > 0 
            ? blueprint.journey.phases.map(p => p.title).join(', ')
            : 'Developing...',
          step2: blueprint.journey?.activities?.length > 0
            ? blueprint.journey.activities.join(', ')
            : 'Developing...',
          step3: blueprint.journey?.resources?.length > 0
            ? blueprint.journey.resources.join(', ')
            : 'Developing...'
        };
      case 'DELIVERABLES':
        return {
          step1: blueprint.deliverables?.milestones?.length > 0
            ? blueprint.deliverables.milestones.join(', ')
            : 'Developing...',
          step2: blueprint.deliverables?.rubric?.criteria?.length > 0
            ? blueprint.deliverables.rubric.criteria.map(c => c.criterion).join(', ')
            : 'Developing...',
          step3: blueprint.deliverables?.impact?.audience 
            ? `${blueprint.deliverables.impact.audience} - ${blueprint.deliverables.impact.method || 'TBD'}`
            : 'Developing...'
        };
      default:
        return { step1: '', step2: '', step3: '' };
    }
  };

  // Get current UI state
  const currentStage = flowState.currentStage;
  const currentStep = flowState.currentStep;
  const isClarifier = currentStep.endsWith('_CLARIFIER');
  const isWizard = currentStage === 'WIZARD';
  const isCompleted = currentStage === 'COMPLETED';

  // Current message data
  const lastMessage = messages[messages.length - 1];
  const currentSuggestions = lastMessage?.suggestions || [];
  const currentQuickReplies = lastMessage?.quickReplies || [];

  return (
    <div className="chat-interface flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Progress Bar - hide during wizard */}
      {!isWizard && !isCompleted && (
        <ProgressBar 
          progress={flowManager.getProgress()} 
          currentStage={currentStage}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Show wizard if in wizard stage */}
        {isWizard && showStageComponent && (
          <WizardFlow onComplete={handleWizardComplete} />
        )}

        {/* Show stage components when appropriate */}
        {!isWizard && !isCompleted && showStageComponent && (
          <div className="max-w-3xl mx-auto p-4">
            {console.log('Rendering stage component, isClarifier:', isClarifier)}
            {isClarifier ? (
              <StageClarifier
                stage={currentStage}
                summary={getStageSummary()}
                onAction={handleClarifierAction}
                isLoading={isLoading}
              />
            ) : (
              <StageInitiator
                stage={currentStage}
                currentStep={getCurrentStageStep()}
                onStepComplete={handleStepComplete}
                isLoading={isLoading}
              />
            )}
          </div>
        )}

        {/* Chat messages - only show when NOT using stage components */}
        {!showStageComponent && messages.length > 0 && (
          <div className="p-4 space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-center">
                <div className="typing-indicator flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Show completed state */}
        {isCompleted && (
          <div className="max-w-4xl mx-auto p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Project Blueprint Complete!</h2>
              <p className="text-gray-600 dark:text-gray-400">Your active learning experience is ready to implement.</p>
            </div>
            
            {/* Export Options */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Teacher Materials */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    📚 Teacher Materials
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Complete implementation guide with rubrics, timelines, and assessment strategies
                  </p>
                </div>
                <button
                  onClick={handleExportTeacherGuide}
                  disabled={isExporting}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? 'Generating...' : 'Download Teacher Guide (PDF)'}
                </button>
              </div>

              {/* Student Materials */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    🎒 Student Materials
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Student-friendly project guide with journey map and success tips
                  </p>
                </div>
                <button
                  onClick={handleExportStudentGuide}
                  disabled={isExporting}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? 'Generating...' : 'Download Student Guide (PDF)'}
                </button>
              </div>
            </div>

            {/* Additional Export Options */}
            <div className="mt-6 text-center space-y-3">
              <button
                onClick={handleExportBothGuides}
                disabled={isExporting}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? 'Generating...' : '📦 Download Complete Package'}
              </button>
              
              <div>
                <button
                  onClick={onExportBlueprint}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  💾 Export Raw Blueprint (JSON)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom interaction area */}
      {!isWizard && !isCompleted && !showStageComponent && (
        <>
          {/* Suggestions */}
          {currentSuggestions.length > 0 && (
            <SuggestionCards 
              suggestions={currentSuggestions}
              onSelect={handleSuggestionClick}
            />
          )}

          {/* Quick Replies */}
          {currentQuickReplies.length > 0 && !currentSuggestions.length && (
            <QuickReplyChips
              replies={currentQuickReplies}
              onSelect={handleQuickReply}
              disabled={isLoading}
            />
          )}

          {/* Input Area */}
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleInputSubmit}
            disabled={isLoading || currentSuggestions.length > 0}
            placeholder={currentSuggestions.length > 0 ? "Select a suggestion above..." : "Type your response..."}
          />
        </>
      )}

      {/* Debug Panel - remove in production */}
      <DebugPanel flowState={flowState} isVisible={true} />
    </div>
  );
};