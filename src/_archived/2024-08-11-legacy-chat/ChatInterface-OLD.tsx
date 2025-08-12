/**
 * ChatInterface.tsx - Main chat component for ALF Coach
 * Orchestrates the SOP flow with stage-specific components
 */

import React, { useState, useRef, useEffect } from 'react';
import { type SOPFlowManager } from '../../core/SOPFlowManager';
import { type GeminiService } from '../../services/GeminiService';
import { ErrorBoundary } from '../ErrorBoundary';
import { 
  type ChatMessage, 
  type SuggestionCard, 
  type QuickReply,
  type SOPFlowState,
  SOPStep
} from '../../core/types/SOPTypes';
import { type WizardData } from '../../features/wizard/wizardSchema';
import { MessageBubble } from './MessageBubble';
import { UltraMinimalChatBubbles } from './MinimalChatBubbles';
import { ProgressSidebar } from './ProgressSidebar';
import { QuickReplyChips } from './QuickReplyChips';
import { ProcessOverview } from './ProcessOverview';
import { SuggestionCards } from './SuggestionCards';
import { EnhancedSuggestionCards } from './EnhancedSuggestionCards';
import { SaveExitButton, FloatingSaveButton, DesktopSaveButton } from '../SaveExitButton';
import { ChatInput } from './ChatInput';
import { MinimalChatInput } from './MinimalChatInput';
// Removed MinimalProgress - using ProgressSidebar instead
import { 
  StageInitiator, 
  StepPrompt, 
  StageClarifier, 
  RubricStage, 
  JourneyDetailsStage, 
  MethodSelectionStage, 
  JourneyPhaseSelectorDraggable,
  ActivityBuilderEnhanced, 
  ResourceSelector,
  MilestoneSelectorDraggable,
  RubricBuilderEnhanced,
  ImpactDesignerEnhanced
} from './stages';
import { JourneySummary } from './stages/JourneySummary';
import { LearningJourneyBuilder } from './stages/LearningJourneyBuilder';
import { LearningJourneyBuilderEnhanced } from './stages/LearningJourneyBuilderEnhanced';
import { EnhancedStageInitiator } from './stages/EnhancedStageInitiator';
// Import Creative Process Journey to replace old Learning Journey
import { CreativeProcessJourney } from '../../features/learningJourney/CreativeProcessJourney';
// Import new simplified 4-step Wizard instead of old WizardFlow
import { Wizard } from '../../features/wizard/Wizard';
import { DebugPanel } from './DebugPanel';
import { PDFExportService } from '../../core/services/PDFExportService';
import { googleDocsExportService } from '../../core/services/GoogleDocsExportService';
import { BlueprintViewer } from '../BlueprintViewer';
// import { BlueprintSidebar } from '../BlueprintSidebar'; // Replaced with ProgressSidebar
import { detectCommand } from '../../core/utils/commandDetection';
import { TeacherFeedback } from '../TeacherFeedback';
// FUTURES: Progress monitoring, community, and enrichment features moved to /futures folder
// import { ProgressMonitoringButton } from '../../futures/progress/ProgressMonitoringButton';
// import { CommunityResourceButton } from '../../futures/community/CommunityResourceButton';
// import { EnrichmentPanel } from '../../futures/enrichment/EnrichmentPanel';
// import { EnrichmentToggle } from '../../futures/enrichment/EnrichmentToggle';
import { WizardErrorBoundary } from '../ErrorBoundary/WizardErrorBoundary';

// Design System imports
import { 
  Container, 
  Section, 
  Stack, 
  Card,
  Button,
  Icon 
} from '../../design-system';

// Enrichment Services
import { enrichmentAdapter } from '../../core/services/EnrichmentAdapter';

interface ChatInterfaceProps {
  flowManager: SOPFlowManager;
  geminiService: GeminiService;
  onExportBlueprint?: () => void;
  onUpdateBlueprint?: (blueprint: any) => Promise<void>;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  flowManager,
  geminiService,
  onExportBlueprint,
  onUpdateBlueprint
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [flowState, setFlowState] = useState<SOPFlowState>(flowManager.getState());
  const [showStageComponent, setShowStageComponent] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [showBlueprintViewer, setShowBlueprintViewer] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showProgressSidebar, setShowProgressSidebar] = useState(true);
  const [showEnrichmentPanel, setShowEnrichmentPanel] = useState(false);
  const [lastEnrichmentResult, setLastEnrichmentResult] = useState<any>(null);
  const [hasPendingSuggestions, setHasPendingSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const pdfExportService = useRef(new PDFExportService());
  
  // Debug logging for easier development
  useEffect(() => {
    console.log('[ChatInterface] Current state:', {
      stage: flowState.currentStage,
      step: flowState.currentStep,
      showStageComponent,
      isWizard: flowState.currentStage === 'WIZARD',
      messageCount: messages.length
    });
    
    // Log captured data being passed to ProgressSidebar
    console.log('[ChatInterface] Captured data for ProgressSidebar:', {
      ideation: flowState.blueprintDoc.ideation,
      journey: flowState.blueprintDoc.journey,
      deliverables: flowState.blueprintDoc.deliverables
    });
    
    // Log specific captured values
    console.log('[ChatInterface] Detailed captured values:', {
      bigIdea: flowState.blueprintDoc.ideation?.bigIdea || 'Not captured',
      essentialQuestion: flowState.blueprintDoc.ideation?.essentialQuestion || 'Not captured',
      challenge: flowState.blueprintDoc.ideation?.challenge || 'Not captured',
      phases: flowState.blueprintDoc.journey?.phases || [],
      activities: flowState.blueprintDoc.journey?.activities || [],
      resources: flowState.blueprintDoc.journey?.resources || [],
      milestones: flowState.blueprintDoc.deliverables?.milestones || [],
      rubricCriteria: flowState.blueprintDoc.deliverables?.rubric?.criteria || [],
      impactAudience: flowState.blueprintDoc.deliverables?.impact?.audience || 'Not set',
      impactMethod: flowState.blueprintDoc.deliverables?.impact?.method || 'Not set'
    });
  }, [flowState.currentStage, flowState.currentStep, showStageComponent, messages.length, flowState.blueprintDoc]);

  // Subscribe to flow state changes
  useEffect(() => {
    const unsubscribe = flowManager.subscribe((newState) => {
      console.log('[ChatInterface] Flow state changed:', {
        oldStage: flowState.currentStage,
        newStage: newState.currentStage,
        oldStep: flowState.currentStep,
        newStep: newState.currentStep,
        dataChanged: {
          ideation: JSON.stringify(flowState.blueprintDoc.ideation) !== JSON.stringify(newState.blueprintDoc.ideation),
          journey: JSON.stringify(flowState.blueprintDoc.journey) !== JSON.stringify(newState.blueprintDoc.journey),
          deliverables: JSON.stringify(flowState.blueprintDoc.deliverables) !== JSON.stringify(newState.blueprintDoc.deliverables)
        }
      });
      setFlowState(newState);
    });
    return unsubscribe;
  }, [flowManager]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // CRITICAL FIX: No automatic suggestion display
  // Suggestions should ONLY appear when explicitly requested via action buttons
  // This useEffect was causing suggestion cards to appear with every AI response
  // useEffect(() => {
  //   const lastMessage = messages[messages.length - 1];
  //   if (lastMessage?.suggestions && lastMessage.suggestions.length > 0) {
  //     console.log('[ChatInterface] useEffect detected suggestions in latest message:', lastMessage.suggestions);
  //     setHasPendingSuggestions(true);
  //     // Hide stage component to show suggestions
  //     if (showStageComponent) {
  //       setShowStageComponent(false);
  //     }
  //   }
  // }, [messages, showStageComponent]);

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
   * Handle enrichment request
   */
  const handleEnrichment = async () => {
    setIsLoading(true);
    try {
      const currentData = flowState.blueprintDoc.deliverables?.rubric || {};
      const enrichedData = await enrichmentAdapter.enrichSection('rubric', currentData);
      
      if (enrichedData) {
        flowManager.updateStep(currentStep, enrichedData);
        setFlowState(flowManager.getState());
        setLastEnrichmentResult(enrichedData);
        setShowEnrichmentPanel(true);
      }
    } catch (error) {
      console.error('Enrichment failed:', error);
      addMessage({
        role: 'assistant',
        content: 'I encountered an error while enriching the rubric. Please try again.',
        isError: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle general action clicks (like continue)
   */
  const handleActionClick = async (action: string) => {
    if (action === 'continue' && flowManager.canAdvance()) {
      // CRITICAL FIX: Don't clear messages during deliverables stage navigation
      const currentState = flowManager.getState();
      const isDeliverables = currentState.currentStage === 'DELIVERABLES';
      
      flowManager.advance();
      const newState = flowManager.getState();
      setFlowState(newState);
      setShowStageComponent(true);
      
      // Only clear messages when moving between major stages, not within deliverables
      if (!isDeliverables || newState.currentStage !== 'DELIVERABLES') {
        setMessages([]);
      }
      
      console.log('[ChatInterface] handleActionClick continue:', {
        wasDeliverables: isDeliverables,
        newStage: newState.currentStage,
        clearedMessages: !isDeliverables || newState.currentStage !== 'DELIVERABLES'
      });
    }
  };

  /**
   * Handle stage initiator step completion
   */
  const handleStepComplete = async (response: string) => {
    console.log('[ChatInterface] Step completion initiated:', { 
      step: flowState.currentStep, 
      response,
      currentData: {
        ideation: flowState.blueprintDoc.ideation,
        journey: flowState.blueprintDoc.journey,
        deliverables: flowState.blueprintDoc.deliverables
      }
    });
    
    // Use sophisticated command detection
    const detection = detectCommand(response);
    console.log('[ChatInterface] Command detection result:', detection);
    
    // Add user message
    addMessage({
      role: 'user',
      content: response
    });

    setIsLoading(true);
    setShowStageComponent(false);

    try {
      // Check if user needs help generating items
      const needsHelp = response.toLowerCase().includes('not sure') ||
                       response.toLowerCase().includes('you decide') ||
                       response.toLowerCase().includes('you choose') ||
                       response.toLowerCase().includes('help me') ||
                       response.toLowerCase().includes('suggest');

      // Generate AI response based on whether it's a command or data
      const action = detection.isCommand ? detection.command! : 'response';
      const aiResponse = await geminiService.generate({
        step: flowState.currentStep,
        context: flowState.blueprintDoc,
        action: action,
        userInput: response
      });

      // CRITICAL FIX: Extract meaningful content from AI response instead of saving verbatim user input
      if (needsHelp && !detection.isCommand) {
        // When user asks for help, extract AI-processed content and save that
        if (flowState.currentStep === 'IDEATION_BIG_IDEA' ||
            flowState.currentStep === 'IDEATION_EQ' ||
            flowState.currentStep === 'IDEATION_CHALLENGE' ||
            flowState.currentStep === 'JOURNEY_PHASES' || 
            flowState.currentStep === 'JOURNEY_ACTIVITIES' || 
            flowState.currentStep === 'JOURNEY_RESOURCES' ||
            flowState.currentStep === 'DELIVER_MILESTONES') {
          // Extract the refined/processed content from AI response
          const processedContent = extractProcessedContent(aiResponse.message, flowState.currentStep);
          console.log('[ChatInterface] Processing content for step with help:', {
            step: flowState.currentStep,
            originalResponse: response,
            processedContent: processedContent,
            willSave: processedContent || response
          });
          flowManager.updateStepData(processedContent || response);
        } else {
          // For other steps, save user's original response
          console.log('[ChatInterface] Saving original user response for step:', {
            step: flowState.currentStep,
            response: response
          });
          flowManager.updateStepData(response);
        }
      } else if (!detection.isCommand) {
        // For normal user input, check if AI refined it and save the refined version
        const processedContent = extractProcessedContent(aiResponse.message, flowState.currentStep);
        if (processedContent) {
          // AI provided a refined version, use that
          console.log('[ChatInterface] Saving AI-refined content:', {
            step: flowState.currentStep,
            originalResponse: response,
            processedContent: processedContent
          });
          flowManager.updateStepData(processedContent);
        } else {
          // No AI refinement, save user input as-is
          console.log('[ChatInterface] No AI refinement, saving user input as-is:', {
            step: flowState.currentStep,
            response: response
          });
          flowManager.updateStepData(response);
        }
      }

      // Log the updated flow state after data is saved
      console.log('[ChatInterface] Flow state after updateStepData:', {
        step: flowState.currentStep,
        updatedData: {
          ideation: flowManager.getState().blueprintDoc.ideation,
          journey: flowManager.getState().blueprintDoc.journey,
          deliverables: flowManager.getState().blueprintDoc.deliverables
        }
      });

      // Add AI message with quick replies based on allowed actions
      const allowedActions = flowState.allowedActions || [];
      const quickReplies: QuickReply[] = [];
      
      // Build quick replies based on allowed actions from flow manager
      if (allowedActions.includes('continue')) {
        quickReplies.push({ action: 'continue', label: getActionLabel('continue') });
      }
      
      if (allowedActions.includes('ideas')) {
        quickReplies.push({ action: 'ideas', label: getActionLabel('ideas') });
      }
      
      if (allowedActions.includes('whatif')) {
        quickReplies.push({ action: 'whatif', label: getActionLabel('whatif') });
      }
      
      if (allowedActions.includes('help')) {
        quickReplies.push({ action: 'help', label: getActionLabel('help') });
      }
      
      // Add validation feedback if can't advance
      if (!flowManager.canAdvance() && !allowedActions.includes('continue')) {
        // Add validation feedback for specific steps
        if (flowState.currentStep === 'DELIVER_IMPACT') {
          const impact = flowState.blueprintDoc.deliverables?.impact;
          if (!impact?.audience || !impact?.method || impact.audience.length === 0 || impact.method.length === 0) {
            // Add a feedback message explaining what's needed
            setTimeout(() => {
              addMessage({
                role: 'assistant',
                content: '**To continue, please specify both:**\n\n1. **WHO** is your authentic audience?\n2. **HOW** will students share their work?\n\nBoth pieces are needed to create a complete impact plan!',
                quickReplies: quickReplies
              });
            }, 500);
          }
        }
      }

      // Enrich the AI response using the adapter
      const enrichmentResult = await enrichmentAdapter.enrichAIResponse(
        aiResponse.message,
        flowState.currentStep,
        flowState.blueprintDoc
      );
      
      // Store enrichment result for UI
      setLastEnrichmentResult(enrichmentResult);
      
      // Add enriched content to message
      let enrichedMessage = enrichmentResult.enrichedContent;
      
      // Add learning objectives if generated
      if (enrichmentResult.learningObjectives && enrichmentResult.learningObjectives.length > 0) {
        enrichedMessage += '\n\n**Learning Objectives Generated:**\n';
        enrichmentResult.learningObjectives.forEach((obj, idx) => {
          enrichedMessage += `${idx + 1}. ${obj}\n`;
        });
      }
      
      // Add assessment suggestions if generated
      if (enrichmentResult.assessmentSuggestions && enrichmentResult.assessmentSuggestions.length > 0) {
        enrichedMessage += '\n\n**Formative Assessment Ideas:**\n';
        enrichmentResult.assessmentSuggestions.forEach((assessment, idx) => {
          enrichedMessage += `${idx + 1}. ${assessment}\n`;
        });
      }
      
      // Add standards alignment if generated
      if (enrichmentResult.standardsAlignment && enrichmentResult.standardsAlignment.length > 0) {
        enrichedMessage += '\n\n**Standards Alignment:**\n';
        enrichmentResult.standardsAlignment.forEach((standard, idx) => {
          enrichedMessage += `• ${standard}\n`;
        });
      }
      
      // Add UDL suggestions if generated
      if (enrichmentResult.udlSuggestions && enrichmentResult.udlSuggestions.length > 0) {
        enrichedMessage += '\n\n**Universal Design for Learning:**\n';
        enrichmentResult.udlSuggestions.forEach((suggestion, idx) => {
          enrichedMessage += `• ${suggestion}\n`;
        });
      }
      
      // Add quality score indicator if available
      if (enrichmentResult.validationScore !== undefined) {
        const scoreIndicator = enrichmentResult.validationScore >= 0.8 ? 'Excellent' : 
                              enrichmentResult.validationScore >= 0.6 ? 'Good' : 'Needs Improvement';
        enrichedMessage = `**Quality Score: ${Math.round(enrichmentResult.validationScore * 100)}% (${scoreIndicator})**\n\n${enrichedMessage}`;
      }
      
      // CRITICAL FIX: NEVER add suggestions to initial AI responses
      // Suggestions should ONLY appear when user clicks action buttons
      addMessage({
        role: 'assistant',
        content: enrichedMessage,
        quickReplies
        // NO suggestions property here - this prevents automatic suggestion display
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
   * Get consistent label for quick reply actions
   */
  const getActionLabel = (action: string): string => {
    switch (action) {
      case 'continue':
        return 'Continue';
      case 'ideas':
        return 'Ideas';
      // 'whatif' removed - confusing mental model
      case 'help':
        return 'Help';
      case 'refine':
        return 'Refine';
      case 'edit':
        return 'Edit';
      default:
        return action;
    }
  };

  /**
   * Handle quick reply action
   */
  const handleQuickReply = async (action: string) => {
    console.log('[ChatInterface] Quick reply clicked:', action);
    
    if (!flowManager.isActionAllowed(action as any)) {
      console.error('[ChatInterface] Action not allowed:', action);
      return;
    }

    setIsLoading(true);

    try {
      // Handle stage progression
      if (action === 'continue') {
        if (flowManager.canAdvance()) {
          // CRITICAL FIX: Get the updated state BEFORE clearing messages
          const oldState = flowManager.getState();
          flowManager.advance();
          const newState = flowManager.getState();
          
          setShowStageComponent(true);
          
          // CRITICAL FIX: Don't clear messages during deliverables transitions
          // Only clear messages when moving to a completely new stage AND it's not within deliverables
          const isNewStage = newState.currentStage !== oldState.currentStage;
          const isDeliverablesTransition = oldState.currentStage === 'DELIVERABLES' && newState.currentStage === 'DELIVERABLES';
          const isFromDeliverables = oldState.currentStage === 'DELIVERABLES';
          
          console.log('[ChatInterface] Stage transition analysis:', {
            oldStage: oldState.currentStage,
            newStage: newState.currentStage,
            oldStep: oldState.currentStep,
            newStep: newState.currentStep,
            isNewStage,
            isDeliverablesTransition,
            isFromDeliverables,
            shouldClearMessages: isNewStage && !isFromDeliverables
          });
          
          // Only clear messages when transitioning to a completely different stage
          // AND we're not leaving deliverables (to preserve deliverables conversation history)
          if (isNewStage && !isFromDeliverables) {
            setMessages([]);
          }
          
          // Force state update
          setFlowState(newState);
        } else {
          console.warn('Cannot advance - missing required data');
          
          // Provide specific feedback based on current step
          let feedbackMessage = 'Please complete the current step before continuing.';
          const blueprint = flowState.blueprintDoc;
          
          if (flowState.currentStep === 'JOURNEY_PHASES') {
            const phaseCount = blueprint.journey?.phases?.length || 0;
            feedbackMessage = `**Journey Phases:** You need at least 1 phase (currently have ${phaseCount}). Please provide your learning phases or click "Ideas" for suggestions.`;
          } else if (flowState.currentStep === 'JOURNEY_ACTIVITIES') {
            const activityCount = blueprint.journey?.activities?.length || 0;
            feedbackMessage = `**Learning Activities:** You need at least 3 activities (currently have ${activityCount}). Please provide more activities or click "Ideas" for suggestions.`;
          } else if (flowState.currentStep === 'JOURNEY_RESOURCES') {
            const resourceCount = blueprint.journey?.resources?.length || 0;
            feedbackMessage = `**Learning Resources:** You need at least 3 resources (currently have ${resourceCount}). Please provide more resources or click "Ideas" for suggestions.`;
          } else if (flowState.currentStep === 'DELIVER_IMPACT') {
            const impact = blueprint.deliverables?.impact;
            if (!impact?.audience || !impact?.method || impact.audience.length === 0 || impact.method.length === 0) {
              feedbackMessage = '**To continue, please specify both:**\n\n1. **WHO** is your authentic audience?\n2. **HOW** will students share their work?\n\nBoth pieces are needed to create a complete impact plan!';
            }
          }
          
          addMessage({
            role: 'assistant',
            content: feedbackMessage,
            quickReplies: [
              { action: 'ideas', label: getActionLabel('ideas') },
              { action: 'whatif', label: getActionLabel('whatif') },
              { action: 'help', label: getActionLabel('help') }
            ]
          });
        }
        
        // Important: Don't return here without clearing loading state
        setIsLoading(false);
        return;
      }

      // Generate response for other actions
      const response = await geminiService.generate({
        step: flowState.currentStep,
        context: flowState.blueprintDoc,
        action: action as any
      });

      // After ideas/whatif/help, show response with allowed actions
      const updatedAllowedActions = flowManager.getState().allowedActions || [];
      const updatedQuickReplies: QuickReply[] = [];
      
      if (updatedAllowedActions.includes('continue')) {
        updatedQuickReplies.push({ action: 'continue', label: getActionLabel('continue') });
      }
      if (updatedAllowedActions.includes('ideas')) {
        updatedQuickReplies.push({ action: 'ideas', label: getActionLabel('ideas') });
      }
      if (updatedAllowedActions.includes('whatif')) {
        updatedQuickReplies.push({ action: 'whatif', label: getActionLabel('whatif') });
      }
      if (updatedAllowedActions.includes('help')) {
        updatedQuickReplies.push({ action: 'help', label: getActionLabel('help') });
      }

      console.log('[ChatInterface] Adding message with suggestions:', {
        message: response.message,
        suggestionsCount: response.suggestions?.length,
        suggestions: response.suggestions
      });
      
      // CRITICAL FIX: Explicitly manage suggestion display state for action responses
      // Only show suggestions when user explicitly requested them via action buttons
      addMessage({
        role: 'assistant',
        content: response.message,
        suggestions: response.suggestions,
        quickReplies: updatedQuickReplies
      });
      
      // For action-based responses (ideas, whatif), show suggestions and hide stage component
      if ((action === 'ideas' || action === 'whatif') && response.suggestions && response.suggestions.length > 0) {
        setHasPendingSuggestions(true);
        setShowStageComponent(false);
      }

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
    
    // CRITICAL FIX: Clear suggestions state and return to stage component
    setHasPendingSuggestions(false);
    setShowStageComponent(true);
    
    // Move to next step if possible
    if (flowManager.canAdvance()) {
      flowManager.advance();
      setFlowState(flowManager.getState());
    }
  };

  /**
   * Handle text input
   */
  const handleInputSubmit = async () => {
    if (!inputValue.trim() || isLoading) {
      console.log('[ChatInterface] Input submit blocked:', { 
        hasValue: !!inputValue.trim(), 
        isLoading 
      });
      return;
    }

    const userInput = inputValue.trim();
    console.log('[ChatInterface] User input submitted:', userInput);
    setInputValue('');

    // If stage component is showing, treat as step response
    if (showStageComponent) {
      console.log('[ChatInterface] Handling as step completion');
      handleStepComplete(userInput);
    } else {
      console.log('[ChatInterface] Handling as regular chat message');
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
          { action: 'continue', label: getActionLabel('continue') },
          { action: 'ideas', label: getActionLabel('ideas') },
          { action: 'whatif', label: getActionLabel('whatif') },
          { action: 'help', label: getActionLabel('help') }
        ];

        // CRITICAL FIX: Regular chat should NOT show suggestion cards automatically
        addMessage({
          role: 'assistant',
          content: response.message,
          quickReplies: chatQuickReplies
          // NO suggestions for regular chat - only when user clicks action buttons
        });
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  /**
   * Extract processed/refined content from AI response
   */
  const extractProcessedContent = (aiMessage: string, step: string): string | null => {
    if (!aiMessage) return null;
    
    // Look for patterns where AI provides refined content
    const patterns: Record<string, RegExp[]> = {
      'IDEATION_BIG_IDEA': [
        /Big Idea[:\s]*"([^"]+)"/i,
        /Big Idea[:\s]*([^\n\.]+)/i,
        /I suggest[:\s]*"([^"]+)"/i,
        /How about[:\s]*"([^"]+)"/i,
        /Consider[:\s]*"([^"]+)"/i
      ],
      'IDEATION_EQ': [
        /Essential Question[:\s]*"([^"]+\?)/i,
        /Question[:\s]*"([^"]+\?)/i,
        /I suggest[:\s]*"([^"]+\?)/i,
        /How about[:\s]*"([^"]+\?)/i,
        /Consider[:\s]*"([^"]+\?)/i
      ],
      'IDEATION_CHALLENGE': [
        /Challenge[:\s]*"([^"]+)"/i,
        /Project[:\s]*"([^"]+)"/i,
        /Task[:\s]*"([^"]+)"/i,
        /I suggest[:\s]*"([^"]+)"/i,
        /How about[:\s]*"([^"]+)"/i,
        /Consider[:\s]*"([^"]+)"/i
      ]
    };
    
    const stepPatterns = patterns[step];
    if (!stepPatterns) return null;
    
    // Try each pattern to find refined content
    for (const pattern of stepPatterns) {
      const match = aiMessage.match(pattern);
      if (match && match[1]?.trim()) {
        return match[1].trim();
      }
    }
    
    // If no specific pattern found, look for quoted content that seems refined
    const quotedContent = aiMessage.match(/"([^"]{10,100})"/g);
    if (quotedContent && quotedContent.length > 0) {
      // Return the first substantial quoted content
      const cleaned = quotedContent[0].replace(/"/g, '').trim();
      if (cleaned.length > 5 && cleaned.length < 150) {
        return cleaned;
      }
    }
    
    return null;
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
    
    console.log('[ChatInterface] addMessage called with:', {
      message,
      hassuggestions: !!message.suggestions,
      suggestionCount: message.suggestions?.length || 0,
      suggestions: message.suggestions
    });
    
    console.log('[ChatInterface] Creating new message:', {
      newMessage,
      hassuggestions: !!newMessage.suggestions,
      suggestionCount: newMessage.suggestions?.length || 0
    });
    
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
   * Handle Google Docs export
   */
  const handleGoogleDocsExport = async () => {
    setIsExporting(true);
    try {
      const blueprint = flowManager.exportBlueprint();
      const googleDoc = await googleDocsExportService.exportToGoogleDocs(blueprint);
      
      // Create a blob from the HTML content
      const blob = new Blob([googleDoc.content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `${googleDoc.title}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Show instructions
      alert('HTML file downloaded! To import to Google Docs:\n\n1. Open Google Docs\n2. Create a new document\n3. Go to File → Open\n4. Upload the downloaded HTML file\n5. The document will be imported with formatting preserved');
    } catch (error) {
      console.error('Failed to export to Google Docs:', error);
      alert('Failed to generate Google Docs export. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Handle plain text export for easy copy/paste
   */
  const handlePlainTextExport = async () => {
    setIsExporting(true);
    try {
      const blueprint = flowManager.exportBlueprint();
      const plainText = await googleDocsExportService.exportAsPlainText(blueprint);
      
      // Create a blob from the text content
      const blob = new Blob([plainText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      const projectTitle = blueprint.ideation?.bigIdea 
        ? blueprint.ideation.bigIdea.split(' ').slice(0, 3).join('_')
        : 'ALF_Project';
      a.download = `${projectTitle}_Blueprint.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export plain text:', error);
      alert('Failed to generate text export. Please try again.');
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
          step1: blueprint.journey?.progression || 
            (blueprint.journey?.phases?.length > 0 
              ? blueprint.journey.phases.map(p => p.title).join(', ')
              : 'Developing...'),
          step2: blueprint.journey?.activities?.join?.(', ') || 'Developing...',
          step3: blueprint.journey?.resources?.join?.(', ') || 'Developing...'
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
  
  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('[ChatInterface] Stage info:', {
      currentStage,
      currentStep,
      isWizard,
      showStageComponent,
      shouldShowWizard: isWizard && showStageComponent
    });
  }

  // Current message data
  const lastMessage = messages[messages.length - 1];
  const currentSuggestions = lastMessage?.suggestions || [];
  const currentQuickReplies = lastMessage?.quickReplies || [];
  
  // DEBUG: Log current suggestions status
  console.log('[ChatInterface] Render cycle - Messages array length:', messages.length);
  console.log('[ChatInterface] Last message:', lastMessage);
  console.log('[ChatInterface] Last message suggestions:', lastMessage?.suggestions);
  console.log('[ChatInterface] Current suggestions (final):', currentSuggestions);
  console.log('[ChatInterface] Render conditions:', {
    showStageComponent,
    isWizard,
    isCompleted,
    hasPendingSuggestions,
    willRenderSuggestions: !isWizard && !isCompleted && !showStageComponent && currentSuggestions.length > 0,
    actualSuggestionsCount: currentSuggestions.length
  });

  return (
    <ErrorBoundary>
      <div className="chat-interface flex h-screen bg-white dark:bg-gray-950">
        {/* Left Progress Sidebar - similar to ChatGPT's chat list */}
        {!isWizard && (
          <ProgressSidebar
            currentStage={currentStage}
            currentStep={currentStep}
            capturedData={{
              ideation: flowState.blueprintDoc.ideation,
              journey: flowState.blueprintDoc.journey,
              deliverables: flowState.blueprintDoc.deliverables
            }}
            progress={flowManager.getProgress()}
            isCollapsed={!showProgressSidebar}
            onToggleCollapse={() => setShowProgressSidebar(!showProgressSidebar)}
          />
        )}
        
        {/* Main Chat Area - flex column to position input at bottom */}
        <div className="flex-1 flex flex-col relative">
        {/* Show wizard if in wizard stage */}
        {isWizard && showStageComponent && (
          <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <WizardErrorBoundary 
              wizardData={flowState.data?.wizardData}
              onReset={() => window.location.reload()}
            >
              <Wizard 
                onComplete={handleWizardComplete}
                onCancel={() => window.location.href = '/app/dashboard'}
              />
            </WizardErrorBoundary>
          </div>
        )}

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          {/* Show stage components when appropriate */}
          {!isWizard && !isCompleted && showStageComponent && (
            <div className="max-w-4xl mx-auto p-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200/50 dark:border-gray-700/50">
              {currentStep === 'DELIVER_RUBRIC' ? (
                <RubricStage
                  currentStep={currentStep}
                  journeyData={flowState.journeyData}
                  onDataUpdate={(data) => {
                    flowManager.updateStep(currentStep, data);
                    setFlowState(flowManager.getState());
                  }}
                  onActionClick={(action) => {
                    if (action === 'enrich') {
                      handleEnrichment();
                    } else if (action === 'continue') {
                      handleActionClick('continue');
                    }
                  }}
                />
              ) : currentStep === 'JOURNEY_DETAILS' ? (
                <JourneyDetailsStage
                  currentStep={currentStep}
                  journeyData={flowState.journeyData}
                  ideationData={flowState.ideationData}
                  onDataUpdate={(data) => {
                    flowManager.updateStep(currentStep, data);
                    setFlowState(flowManager.getState());
                  }}
                  onActionClick={(action) => {
                    if (action === 'refine') {
                      // Handle refine action if needed
                      console.log('Refine journey details');
                    } else if (action === 'continue') {
                      handleActionClick('continue');
                    }
                  }}
                />
              ) : currentStep === 'IDEATION_METHODS' ? (
                <MethodSelectionStage
                  currentStep={currentStep}
                  ideationData={flowState.ideationData}
                  onDataUpdate={(data) => {
                    flowManager.updateStep(currentStep, data);
                    setFlowState(flowManager.getState());
                  }}
                  onActionClick={(action) => {
                    if (action === 'compare') {
                      // Handle compare action if needed
                      console.log('Compare methods');
                    } else if (action === 'continue') {
                      handleActionClick('continue');
                    }
                  }}
                />
              ) : currentStage === 'JOURNEY' && !isClarifier && showStageComponent ? (
                // Use Creative Process Journey instead of old Learning Journey
                <CreativeProcessJourney
                  projectData={{
                    title: flowState.blueprintDoc?.wizard?.topic || 'Untitled Project',
                    description: flowState.blueprintDoc?.ideation?.bigIdea || '',
                    timeline: flowState.blueprintDoc?.wizard?.timeline || flowState.blueprintDoc?.wizard?.scope || '4 weeks',
                    gradeLevel: flowState.blueprintDoc?.wizard?.students?.gradeLevel || 'middle school',
                    subject: flowState.blueprintDoc?.wizard?.subject || 'General',
                    studentCount: flowState.blueprintDoc?.wizard?.students?.count || 25,
                    essentialQuestion: flowState.blueprintDoc?.ideation?.essentialQuestion || '',
                    challenge: flowState.blueprintDoc?.ideation?.challenge || ''
                  }}
                  onComplete={(journeyData) => {
                    console.log('[ChatInterface] Creative Process Journey completed:', journeyData);
                    // Update the blueprint with new journey data
                    const updatedBlueprint = {
                      ...flowState.blueprintDoc,
                      journey: {
                        ...journeyData,
                        // Maintain backward compatibility
                        progression: journeyData.phases?.map(p => p.name).join(' → ') || '',
                        activities: journeyData.phases?.flatMap(p => p.activities || []).join(', ') || '',
                        resources: journeyData.resources?.join(', ') || ''
                      }
                    };
                    flowManager.updateBlueprint(updatedBlueprint);
                    // Advance to clarifier
                    flowManager.advance();
                    setShowStageComponent(false);
                  }}
                  onSave={(data) => {
                    // Auto-save journey progress
                    const updatedBlueprint = {
                      ...flowState.blueprintDoc,
                      journey: {
                        ...flowState.blueprintDoc?.journey,
                        ...data
                      }
                    };
                    flowManager.updateBlueprint(updatedBlueprint);
                    console.log('[ChatInterface] Auto-saved Creative Process Journey progress');
                  }}
                />
              ) : isClarifier && currentStage === 'JOURNEY' ? (
                // Show JourneySummary for Journey clarifier instead of generic StageClarifier
                <JourneySummary
                  journeyData={{
                    progression: flowState.blueprintDoc?.journey?.progression || flowState.blueprintDoc?.journey?.phases?.map((p: any) => p.title).join(' → ') || '',
                    activities: flowState.blueprintDoc?.journey?.activities?.join(', ') || '',
                    resources: flowState.blueprintDoc?.journey?.resources?.join(', ') || ''
                  }}
                  ideationData={{
                    bigIdea: flowState.blueprintDoc?.ideation?.bigIdea || '',
                    essentialQuestion: flowState.blueprintDoc?.ideation?.essentialQuestion || '',
                    challenge: flowState.blueprintDoc?.ideation?.challenge || ''
                  }}
                  wizardData={{
                    timeline: flowState.blueprintDoc?.wizard?.timeline || '4 weeks',
                    students: {
                      gradeLevel: flowState.blueprintDoc?.wizard?.students?.gradeLevel || 'middle school',
                      classSize: flowState.blueprintDoc?.wizard?.students?.count?.toString() || '25'
                    }
                  }}
                  onContinue={() => {
                    handleClarifierAction('continue');
                  }}
                  onExport={() => {
                    // TODO: Implement export functionality
                    console.log('Export journey plan');
                  }}
                />
              ) : isClarifier ? (
                <StageClarifier
                  stage={currentStage}
                  summary={getStageSummary()}
                  onAction={handleClarifierAction}
                  isLoading={isLoading}
                />
              ) : (
                <EnhancedStageInitiator
                  stage={currentStage}
                  currentStep={getCurrentStageStep()}
                  onStepComplete={handleStepComplete}
                  onActionClick={async (action) => {
                    // Handle Ideas and Help button clicks
                    if (action === 'ideas' || action === 'help') {
                      handleQuickReply(action);
                    }
                  }}
                  isLoading={isLoading}
                  capturedData={flowState.blueprintDoc}
                />
              )}
              </div>
            </div>
          )}

          {/* Process Overview - show at key transitions */}
          {!showStageComponent && !isWizard && !isCompleted && messages.length === 0 && (
            <div className="max-w-4xl mx-auto p-6">
              <ProcessOverview 
                currentStage={currentStage}
                completedStages={
                  currentStage === 'JOURNEY' ? ['IDEATION'] :
                  currentStage === 'DELIVERABLES' ? ['IDEATION', 'JOURNEY'] :
                  []
                }
              />
            </div>
          )}
          
          {/* Chat messages - classic layout with scrollable area */}
          {!showStageComponent && !isWizard && !isCompleted && (
            <>
              {messages.length > 0 ? (
                <>
                  <UltraMinimalChatBubbles
                    messages={messages}
                    isLoading={isLoading}
                    onAcceptSuggestion={(suggestion) => {
                      // Set the suggestion as input value for user to review/edit
                      setInputValue(suggestion);
                      // Optionally auto-submit
                      // handleInputSubmit();
                    }}
                  />
                  <div ref={messagesEndRef} />
                  {/* Spacer to ensure last message isn't hidden behind input */}
                  <div className="h-32" />
                </>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[400px]">
                  <div className="text-center">
                    <div className="text-3xl font-light text-gray-400 dark:text-gray-600 mb-2">
                      Welcome to ALF Coach
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-500">
                      Start creating your project-based learning blueprint
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Show completed state */}
          {isCompleted && !showBlueprintViewer && (
          <div className="max-w-4xl mx-auto p-8 min-h-screen">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200/50 dark:border-gray-700/50">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 dark:bg-gradient-to-br dark:from-blue-900/30 dark:to-blue-800/30 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">Project Blueprint Complete!</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">Your active learning experience is ready to implement.</p>
              </div>
              
              {/* Review Blueprint Button */}
              <div className="mb-8 text-center">
                <button
                  onClick={() => setShowBlueprintViewer(true)}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Icon name="edit" size="sm" className="inline mr-2" />
                  Review & Edit Blueprint
                </button>
              </div>
            
              {/* Export Options */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Teacher Materials */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    <Icon name="book" size="sm" className="inline mr-2" />
                    Teacher Materials
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Complete implementation guide with rubrics, timelines, and assessment strategies
                  </p>
                </div>
                  <button
                    onClick={handleExportTeacherGuide}
                    disabled={isExporting}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {isExporting ? 'Generating...' : 'Download Teacher Guide (PDF)'}
                  </button>
                </div>

                {/* Student Materials */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    <Icon name="users" size="sm" className="inline mr-2" />
                    Student Materials
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Student-friendly project guide with journey map and success tips
                  </p>
                </div>
                  <button
                    onClick={handleExportStudentGuide}
                    disabled={isExporting}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-xl font-semibold hover:from-blue-500 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {isExporting ? 'Generating...' : 'Download Student Guide (PDF)'}
                  </button>
                </div>
              </div>

            {/* Additional Export Options */}
            <div className="mt-6 space-y-4">
              {/* Primary Export Actions */}
              <div className="text-center">
                <button
                  onClick={handleExportBothGuides}
                  disabled={isExporting}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isExporting ? 'Generating...' : (
                    <>
                      <Icon name="download" size="sm" className="inline mr-2" />
                      Download Complete PDF Package
                    </>
                  )}
                </button>
              </div>
              
              {/* Google Docs Export Section */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                  Google Docs Export Options
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleGoogleDocsExport}
                    disabled={isExporting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {isExporting ? 'Exporting...' : (
                      <>
                        <Icon name="document" size="sm" className="inline mr-2" />
                        Export for Google Docs
                      </>
                    )}
                  </button>
                  <button
                    onClick={handlePlainTextExport}
                    disabled={isExporting}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {isExporting ? 'Exporting...' : (
                      <>
                        <Icon name="code" size="sm" className="inline mr-2" />
                        Export as Plain Text
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Export as HTML for Google Docs import or plain text for easy copying
                </p>
              </div>
              
              {/* Raw Data Export */}
              <div className="text-center">
                <button
                  onClick={onExportBlueprint}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <Icon name="download" size="sm" className="inline mr-2" />
                  Export Raw Blueprint (JSON)
                </button>
              </div>
            </div>
            
              {/* Teacher Feedback Section */}
              <div className="mt-8 pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
                <TeacherFeedback
                  blueprintId={flowManager.getBlueprintId()}
                  onSubmitFeedback={(feedback) => {
                    // In a real app, this would save to a database
                    console.log('Teacher feedback submitted:', feedback);
                    alert('Thank you for your feedback! This helps improve ALF Coach for everyone.');
                  }}
                  existingFeedback={[]} // In a real app, load from database
                />
              </div>
            </div>
          </div>
          )}
          
          {/* Blueprint Viewer */}
          {isCompleted && showBlueprintViewer && (
          <div className="p-4 bg-gray-100 dark:bg-gray-900 min-h-screen">
            <BlueprintViewer
              blueprint={flowManager.exportBlueprint()}
              onUpdate={(updates) => {
                // Update the blueprint in flow manager
                flowManager.updateBlueprint(updates);
              }}
              onExport={() => setShowBlueprintViewer(false)}
            />
          </div>
          )}
        </div>

        {/* Bottom interaction area - moved outside scrollable area but inside flex container */}
        {!isWizard && !isCompleted && !showStageComponent && (
        <>
          {/* Journey-specific components or regular suggestions - ONLY when user requested */}
          {flowState.currentStep === 'JOURNEY_PHASES' && hasPendingSuggestions && currentSuggestions.length > 0 ? (
            <div className="px-4 pb-4">
              <JourneyPhaseSelectorDraggable
                suggestedPhases={currentSuggestions.map((s, idx) => {
                  // Extract title and description from text if not separate
                  let title = s.title || s.text;
                  let description = s.description || '';
                  
                  // If text contains " - ", split it
                  if (!s.title && s.text && s.text.includes(' - ')) {
                    const parts = s.text.split(' - ');
                    title = parts[0];
                    description = parts.slice(1).join(' - ');
                  }
                  
                  return {
                    id: s.id || `phase-${idx}`,
                    title: title,
                    description: description || s.text,
                    duration: '2-3 weeks',
                    activities: []
                  };
                })}
                onPhasesSelected={(phases) => {
                  // Format as a single response with all selected phases
                  const phasesText = phases.map((p, i) => `Phase ${i + 1}: ${p.title} - ${p.description}`).join('\n');
                  handleSuggestionClick({ id: 'phases', title: 'Selected Phases', text: phasesText, description: phasesText });
                }}
                onRequestNewSuggestions={() => {
                  handleQuickReply({ id: 'ideas', text: 'Give me different ideas', action: 'get_ideas' });
                }}
                minPhases={2}
                maxPhases={5}
              />
            </div>
          ) : flowState.currentStep === 'JOURNEY_ACTIVITIES' && hasPendingSuggestions && currentSuggestions.length > 0 ? (
            <div className="px-4 pb-4">
              <ActivityBuilderEnhanced
                suggestedActivities={currentSuggestions.map((s, idx) => {
                  // Extract title and description from text if not separate
                  let title = s.title || s.text;
                  let description = s.description || '';
                  
                  // If text contains " - " or starts with activity description, parse it
                  if (!s.title && s.text) {
                    // Remove "Activity N: " prefix if present
                    const cleanText = s.text.replace(/^Activity \d+:\s*/, '');
                    if (cleanText.includes(' - ')) {
                      const parts = cleanText.split(' - ');
                      title = parts[0];
                      description = parts.slice(1).join(' - ');
                    } else {
                      title = cleanText;
                    }
                  }
                  
                  return {
                    id: s.id || `activity-${idx}`,
                    title: title,
                    description: description || title,
                    duration: '30-60 minutes',
                    type: 'group' as const
                  };
                })}
                currentPhase={flowState.blueprintDoc?.journey?.phases?.[0]?.title}
                existingActivities={[]} // TODO: Parse existing activities from blueprintDoc.journey.activities
                onActivitiesConfirmed={(activities) => {
                  // Store activities as structured objects
                  console.log('[ChatInterface] Saving structured activities:', activities);
                  // For now, format as text for compatibility
                  const activitiesText = activities.map((a, i) => `Activity ${i + 1}: ${a.title} - ${a.description}`).join('\n');
                  handleSuggestionClick({ id: 'activities', title: 'Selected Activities', text: activitiesText, description: activitiesText });
                }}
                onRequestNewSuggestions={() => {
                  handleQuickReply({ id: 'ideas', text: 'Give me different ideas', action: 'get_ideas' });
                }}
                minActivities={3}
                maxActivities={8}
              />
            </div>
          ) : flowState.currentStep === 'JOURNEY_RESOURCES' && hasPendingSuggestions && currentSuggestions.length > 0 ? (
            <div className="px-4 pb-4">
              <ResourceSelector
                suggestedResources={currentSuggestions.map((s, idx) => {
                  // Parse resource type from text if possible
                  let type: 'digital' | 'physical' | 'human' | 'location' = 'physical';
                  const text = s.text?.toLowerCase() || '';
                  if (text.includes('online') || text.includes('digital') || text.includes('app') || text.includes('website')) {
                    type = 'digital';
                  } else if (text.includes('guest') || text.includes('expert') || text.includes('speaker') || text.includes('mentor')) {
                    type = 'human';
                  } else if (text.includes('visit') || text.includes('field') || text.includes('location')) {
                    type = 'location';
                  }
                  
                  return {
                    id: s.id || `resource-${idx}`,
                    title: s.title || s.text || 'Resource',
                    description: s.description || s.text || '',
                    type: type
                  };
                })}
                onResourcesConfirmed={(resources) => {
                  // Format as a single response with all selected resources
                  const resourcesText = resources.map((r, i) => `${r.title}`).join(', ');
                  handleSuggestionClick({ id: 'resources', title: 'Selected Resources', text: resourcesText, description: resourcesText });
                }}
                onRequestNewSuggestions={() => {
                  handleQuickReply({ id: 'ideas', text: 'Give me different ideas', action: 'get_ideas' });
                }}
                minResources={1}
                maxResources={10}
              />
            </div>
          ) : flowState.currentStep === 'DELIVER_MILESTONES' && hasPendingSuggestions && currentSuggestions.length > 0 ? (
            <div className="px-4 pb-4">
              <MilestoneSelectorDraggable
                suggestedMilestones={currentSuggestions.map((s, idx) => {
                  // Parse milestone data from suggestion
                  let timeline = 'Week ' + (idx + 1);
                  let deliverable = '';
                  const text = s.text || '';
                  
                  // Try to extract timeline from text
                  const timelineMatch = text.match(/week\s+\d+|day\s+\d+|month\s+\d+/i);
                  if (timelineMatch) {
                    timeline = timelineMatch[0];
                  }
                  
                  return {
                    id: s.id || `milestone-${idx}`,
                    title: s.title || s.text || `Milestone ${idx + 1}`,
                    description: s.description || s.text || '',
                    timeline: timeline,
                    deliverable: deliverable
                  };
                })}
                projectDuration={parseInt(flowState.blueprintDoc?.wizard?.timeline?.split(' ')[0]) || 4}
                onMilestonesConfirmed={(milestones) => {
                  // Format as a single response with all selected milestones
                  const milestonesText = milestones.map((m, i) => `Milestone ${i + 1}: ${m.title} (${m.timeline})`).join('\n');
                  
                  // Add user message
                  addMessage({
                    role: 'user',
                    content: milestonesText
                  });
                  
                  // Update step data with milestones array
                  flowManager.updateStepData(milestones);
                  
                  // Clear suggestions and advance
                  setHasPendingSuggestions(false);
                  setShowStageComponent(false);
                  
                  // Force advance to next step
                  setTimeout(() => {
                    flowManager.advance();
                    setFlowState(flowManager.getState());
                  }, 100);
                }}
                onRequestNewSuggestions={() => {
                  handleQuickReply({ id: 'ideas', text: 'Give me different ideas', action: 'get_ideas' });
                }}
                minMilestones={3}
                maxMilestones={8}
              />
            </div>
          ) : flowState.currentStep === 'DELIVER_RUBRIC' && hasPendingSuggestions && currentSuggestions.length > 0 ? (
            <div className="px-4 pb-4">
              <RubricBuilderEnhanced
                suggestedCriteria={currentSuggestions.map((s, idx) => {
                  // Parse category and weight from text if possible
                  let category = s.title || `Criterion ${idx + 1}`;
                  let weight = 25; // Default weight
                  
                  // Try to extract weight if mentioned
                  const weightMatch = (s.text || '').match(/(\d+)%/);
                  if (weightMatch) {
                    weight = parseInt(weightMatch[1]);
                  }
                  
                  return {
                    id: s.id || `criterion-${idx}`,
                    category: category,
                    description: s.description || s.text || '',
                    weight: weight,
                    levels: [
                      { level: 'Exceeds', description: 'Exceptional work', points: 4 },
                      { level: 'Meets', description: 'Proficient work', points: 3 },
                      { level: 'Approaching', description: 'Developing work', points: 2 },
                      { level: 'Beginning', description: 'Needs improvement', points: 1 }
                    ]
                  };
                })}
                onCriteriaConfirmed={(criteria) => {
                  // Format as a single response with all selected criteria
                  const criteriaText = criteria.map((c, i) => `${c.category}: ${c.description} (${c.weight}%)`).join('\n');
                  handleSuggestionClick({ id: 'rubric', title: 'Selected Rubric Criteria', text: criteriaText, description: criteriaText });
                }}
                onRequestNewSuggestions={() => {
                  handleQuickReply({ id: 'ideas', text: 'Give me different ideas', action: 'get_ideas' });
                }}
                minCriteria={3}
                maxCriteria={8}
              />
            </div>
          ) : flowState.currentStep === 'DELIVER_IMPACT' && hasPendingSuggestions && currentSuggestions.length > 0 ? (
            <div className="px-4 pb-4">
              <ImpactDesignerEnhanced
                suggestedImpacts={currentSuggestions.map((s, idx) => {
                  // Parse audience and method from suggestion
                  let audience = 'Community';
                  let method = 'Presentation';
                  const text = s.text || '';
                  
                  // Try to parse audience and method from text format "Audience → Method"
                  if (text.includes('→')) {
                    const parts = text.split('→');
                    audience = parts[0].trim();
                    method = parts[1].trim();
                  } else if (text.includes('to')) {
                    const parts = text.split(' to ');
                    method = parts[0].trim();
                    audience = parts[1].trim();
                  }
                  
                  // Determine icon based on content
                  let icon: 'users' | 'globe' | 'building' | 'heart' | 'megaphone' | 'share2' | 'school' | 'briefcase' = 'share2';
                  const lowerText = text.toLowerCase();
                  if (lowerText.includes('community') || lowerText.includes('local')) icon = 'users';
                  else if (lowerText.includes('global') || lowerText.includes('world')) icon = 'globe';
                  else if (lowerText.includes('school') || lowerText.includes('board')) icon = 'school';
                  else if (lowerText.includes('charity') || lowerText.includes('nonprofit')) icon = 'heart';
                  else if (lowerText.includes('media') || lowerText.includes('press')) icon = 'megaphone';
                  else if (lowerText.includes('business') || lowerText.includes('organization')) icon = 'building';
                  else if (lowerText.includes('expert') || lowerText.includes('professional')) icon = 'briefcase';
                  
                  return {
                    id: s.id || `impact-${idx}`,
                    audience: audience,
                    method: method,
                    description: s.description || s.text || `Share with ${audience} through ${method}`,
                    icon: icon,
                    examples: []
                  };
                })}
                currentImpact={flowState.blueprintDoc?.deliverables?.impact}
                onImpactConfirmed={(impact) => {
                  // Format as a single response with the selected impact
                  const impactText = `Audience: ${impact.audience}, Method: ${impact.method}`;
                  handleSuggestionClick({ id: 'impact', title: 'Selected Impact Method', text: impactText, description: impactText });
                }}
                onRequestNewSuggestions={() => {
                  handleQuickReply({ id: 'ideas', text: 'Give me different ideas', action: 'get_ideas' });
                }}
              />
            </div>
          ) : hasPendingSuggestions && currentSuggestions.length > 0 ? (
            // Use enhanced cards for Journey and Deliverables stages for better teacher control
            (flowState.currentStage === 'JOURNEY' || flowState.currentStage === 'DELIVERABLES') ? (
              <EnhancedSuggestionCards
                suggestions={currentSuggestions.map(s => ({
                  id: s.id,
                  category: s.category,
                  title: s.text.substring(0, 50),
                  items: [{
                    id: s.id + '-item',
                    text: s.text,
                    type: 'activity' as const,
                    selected: true
                  }],
                  allowPartialSelection: true,
                  editable: true
                }))}
                onAccept={(accepted) => {
                  // Use the first selected item from accepted suggestions
                  if (accepted.length > 0 && accepted[0].items.length > 0) {
                    handleSuggestionClick({
                      id: accepted[0].id,
                      category: accepted[0].category as any,
                      text: accepted[0].items[0].text
                    });
                  }
                }}
                context={{
                  stage: flowState.currentStage.toLowerCase() as any
                }}
              />
            ) : (
              <SuggestionCards 
                suggestions={currentSuggestions}
                onSelect={handleSuggestionClick}
              />
            )
          ) : null}

          {/* Quick Replies - Always show action buttons in Ideation */}
          {currentQuickReplies.length > 0 && (
            <QuickReplyChips
              replies={currentQuickReplies}
              onSelect={handleQuickReply}
              disabled={isLoading}
            />
          )}

        </>
        )}
        
        {/* Classic Input Area - Always show except in wizard and completed states */}
        {!isWizard && !isCompleted && (
          <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
            <div className="max-w-3xl mx-auto">
              <MinimalChatInput
                value={inputValue}
                onChange={setInputValue}
                onSubmit={handleInputSubmit}
                disabled={isLoading}
                placeholder={showStageComponent ? "Type your response..." : "Message ALF Coach..."}
                isLoading={isLoading}
                showHelpHint={showStageComponent && !isClarifier} // Only show hint when stage component is showing (has Ideas/Help buttons)
                onStop={() => {
                  console.log('[ChatInterface] Stop generation requested');
                  setIsLoading(false);
                  // TODO: Implement proper stop generation logic with Gemini
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* FUTURES: Progress Monitoring Button - temporarily disabled */}
      {/* {(flowState.currentStage === 'DELIVERABLES' || flowState.currentStage === 'COMPLETED') && (
        <ProgressMonitoringButton
          blueprint={flowState.blueprintDoc}
          currentStep={flowState.currentStep}
          hasNotifications={true}
        />
      )} */}

      {/* FUTURES: Community Resource Button - moved to /futures folder */}
      {/* {(flowState.currentStage === 'JOURNEY' || flowState.currentStage === 'DELIVERABLES' || flowState.currentStage === 'COMPLETED') && (
        <CommunityResourceButton
          blueprint={flowState.blueprintDoc}
          onResourceSelect={(resource) => {
            console.log('Selected community resource:', resource);
            // Handle resource selection - could add to blueprint or create engagement
          }}
        />
      )} */}

      {/* FUTURES: Enrichment UI - moved to /futures folder */}
      {/* <EnrichmentToggle
        enrichmentResult={lastEnrichmentResult}
        isVisible={showEnrichmentPanel}
        onToggle={() => setShowEnrichmentPanel(!showEnrichmentPanel)}
      />
      
      <EnrichmentPanel
        enrichmentResult={lastEnrichmentResult}
        isVisible={showEnrichmentPanel}
        onToggle={() => setShowEnrichmentPanel(!showEnrichmentPanel)}
      /> */}

      {/* Debug Panel - remove in production */}
      <DebugPanel flowState={flowState} isVisible={true} />
      
      {/* Save & Exit Button - always visible except in wizard */}
      {!isWizard && (
        <>
          <FloatingSaveButton 
            onSave={async () => {
              // Get the most up-to-date blueprint from flowManager and trigger explicit save
              if (onUpdateBlueprint) {
                try {
                  const currentBlueprint = flowManager.exportBlueprint();
                  const currentFlowState = flowManager.getState();
                  
                  // Create a complete blueprint update with current flow state
                  const blueprintUpdate = {
                    ...currentBlueprint,
                    currentStep: currentFlowState.currentStep,
                    currentStage: currentFlowState.currentStage,
                    stageStep: currentFlowState.stageStep,
                    updatedAt: new Date()
                  };
                  
                  await onUpdateBlueprint(blueprintUpdate);
                  console.log('Blueprint explicitly saved via FloatingSaveButton');
                } catch (error) {
                  console.error('Save error:', error);
                  // Don't throw - let the button handle navigation even if save fails
                }
              }
            }}
          />
          <DesktopSaveButton 
            onSave={async () => {
              // Get the most up-to-date blueprint from flowManager and trigger explicit save
              if (onUpdateBlueprint) {
                try {
                  const currentBlueprint = flowManager.exportBlueprint();
                  const currentFlowState = flowManager.getState();
                  
                  // Create a complete blueprint update with current flow state
                  const blueprintUpdate = {
                    ...currentBlueprint,
                    currentStep: currentFlowState.currentStep,
                    currentStage: currentFlowState.currentStage,
                    stageStep: currentFlowState.stageStep,
                    updatedAt: new Date()
                  };
                  
                  await onUpdateBlueprint(blueprintUpdate);
                  console.log('Blueprint explicitly saved via DesktopSaveButton');
                } catch (error) {
                  console.error('Save error:', error);
                  // Don't throw - let the button handle navigation even if save fails
                }
              }
            }}
          />
        </>
      )}
      </div>
    </ErrorBoundary>
  );
};