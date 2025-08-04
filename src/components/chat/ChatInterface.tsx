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
import { googleDocsExportService } from '../../core/services/GoogleDocsExportService';
import { BlueprintViewer } from '../BlueprintViewer';
import { BlueprintSidebar } from '../BlueprintSidebar';
import { detectCommand } from '../../core/utils/commandDetection';
import { TeacherFeedback } from '../TeacherFeedback';
import { ProgressMonitoringButton } from '../progress/ProgressMonitoringButton';
import { CommunityResourceButton } from '../community/CommunityResourceButton';
import { EnrichmentPanel } from '../enrichment/EnrichmentPanel';
import { EnrichmentToggle } from '../enrichment/EnrichmentToggle';

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
  const [showBlueprintViewer, setShowBlueprintViewer] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showEnrichmentPanel, setShowEnrichmentPanel] = useState(false);
  const [lastEnrichmentResult, setLastEnrichmentResult] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const pdfExportService = useRef(new PDFExportService());
  
  // Debug logging removed to reduce re-renders

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
    // Use sophisticated command detection
    const detection = detectCommand(response);
    
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

      // If AI generated items for journey steps, extract and save them
      if (needsHelp && !detection.isCommand) {
        // Extract generated content based on current step
        if (flowState.currentStep === 'IDEATION_BIG_IDEA' ||
            flowState.currentStep === 'IDEATION_EQ' ||
            flowState.currentStep === 'IDEATION_CHALLENGE' ||
            flowState.currentStep === 'JOURNEY_PHASES' || 
            flowState.currentStep === 'JOURNEY_ACTIVITIES' || 
            flowState.currentStep === 'JOURNEY_RESOURCES' ||
            flowState.currentStep === 'DELIVER_MILESTONES') {
          // The AI response contains the generated items - update the data
          flowManager.updateStepData(aiResponse.message);
        } else {
          // For other steps, just save the user's original response
          flowManager.updateStepData(response);
        }
      } else if (!detection.isCommand) {
        // Normal user input - save as is
        flowManager.updateStepData(response);
      }

      // Add AI message with quick replies
      // Show "Continue" button if we have data for this step
      const quickReplies: QuickReply[] = [];
      
      if (flowManager.canAdvance()) {
        quickReplies.push({ action: 'continue', label: 'Continue to Next Step' });
      } else {
        // Add validation feedback for specific steps
        if (flowState.currentStep === 'DELIVER_IMPACT') {
          const impact = flowState.blueprintDoc.deliverables?.impact;
          if (!impact?.audience || !impact?.method || impact.audience.length === 0 || impact.method.length === 0) {
            // Add a feedback message explaining what's needed
            setTimeout(() => {
              addMessage({
                role: 'assistant',
                content: '💡 **To continue, please specify both:**\n\n1. **WHO** is your authentic audience?\n2. **HOW** will students share their work?\n\nBoth pieces are needed to create a complete impact plan!',
                quickReplies: [
                  { action: 'ideas', label: 'Ideas' },
                  { action: 'whatif', label: 'What If?' },
                  { action: 'help', label: 'Help' }
                ]
              });
            }, 500);
          }
        }
      }
      
      quickReplies.push(
        { action: 'ideas', label: 'Ideas' },
        { action: 'whatif', label: 'What If?' },
        { action: 'help', label: 'Help' }
      );

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
        enrichedMessage += '\n\n📊 **Formative Assessment Ideas:**\n';
        enrichmentResult.assessmentSuggestions.forEach((assessment, idx) => {
          enrichedMessage += `${idx + 1}. ${assessment}\n`;
        });
      }
      
      // Add standards alignment if generated
      if (enrichmentResult.standardsAlignment && enrichmentResult.standardsAlignment.length > 0) {
        enrichedMessage += '\n\n📐 **Standards Alignment:**\n';
        enrichmentResult.standardsAlignment.forEach((standard, idx) => {
          enrichedMessage += `• ${standard}\n`;
        });
      }
      
      // Add UDL suggestions if generated
      if (enrichmentResult.udlSuggestions && enrichmentResult.udlSuggestions.length > 0) {
        enrichedMessage += '\n\n♿ **Universal Design for Learning:**\n';
        enrichmentResult.udlSuggestions.forEach((suggestion, idx) => {
          enrichedMessage += `• ${suggestion}\n`;
        });
      }
      
      // Add quality score indicator if available
      if (enrichmentResult.validationScore !== undefined) {
        const scoreEmoji = enrichmentResult.validationScore >= 0.8 ? '✅' : 
                          enrichmentResult.validationScore >= 0.6 ? '⚠️' : '❌';
        enrichedMessage = `${scoreEmoji} Quality Score: ${Math.round(enrichmentResult.validationScore * 100)}%\n\n${enrichedMessage}`;
      }
      
      addMessage({
        role: 'assistant',
        content: enrichedMessage,
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
          const isNewStage = flowManager.getState().currentStep !== flowState.currentStep;
          if (isNewStage) {
            setMessages([]);
          }
          
          // Force state update
          setFlowState(flowManager.getState());
        } else {
          console.warn('Cannot advance - missing required data');
          
          // Provide specific feedback based on current step
          let feedbackMessage = 'Please complete the current step before continuing.';
          if (flowState.currentStep === 'DELIVER_IMPACT') {
            const impact = flowState.blueprintDoc.deliverables?.impact;
            if (!impact?.audience || !impact?.method || impact.audience.length === 0 || impact.method.length === 0) {
              feedbackMessage = '💡 **To continue, please specify both:**\n\n1. **WHO** is your authentic audience?\n2. **HOW** will students share their work?\n\nBoth pieces are needed to create a complete impact plan!';
            }
          }
          
          addMessage({
            role: 'assistant',
            content: feedbackMessage
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
    <div className="chat-interface flex flex-col h-full bg-gray-100 dark:bg-gray-900">
      {/* Blueprint Sidebar - always visible except in wizard */}
      {!isWizard && (
        <BlueprintSidebar
          blueprint={flowState.blueprintDoc}
          currentStage={currentStage}
          isOpen={showSidebar}
          onToggle={() => setShowSidebar(!showSidebar)}
        />
      )}
      
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
          <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <WizardFlow onComplete={handleWizardComplete} />
          </div>
        )}

        {/* Show stage components when appropriate */}
        {!isWizard && !isCompleted && showStageComponent && (
          <div className="max-w-3xl mx-auto p-4 bg-gray-100 dark:bg-gray-900">
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
          <div className="p-4 space-y-4 bg-gray-100 dark:bg-gray-900 min-h-screen">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-center py-4">
                <div className="typing-indicator flex gap-1">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Show completed state */}
        {isCompleted && !showBlueprintViewer && (
          <div className="max-w-4xl mx-auto p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Project Blueprint Complete!</h2>
              <p className="text-gray-600 dark:text-gray-400">Your active learning experience is ready to implement.</p>
            </div>
            
            {/* Review Blueprint Button */}
            <div className="mb-8 text-center">
              <button
                onClick={() => setShowBlueprintViewer(true)}
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                <Icon name="edit" size="sm" className="inline mr-2" />
                Review & Edit Blueprint
              </button>
            </div>
            
            {/* Export Options */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Teacher Materials */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
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
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? 'Generating...' : 'Download Teacher Guide (PDF)'}
                </button>
              </div>

              {/* Student Materials */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
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
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="mt-8 pt-8 border-t border-gray-200">
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

      {/* Progress Monitoring Button - show after journey stage */}
      {(flowState.currentStage === 'DELIVERABLES' || flowState.currentStage === 'COMPLETED') && (
        <ProgressMonitoringButton
          blueprint={flowState.blueprintDoc}
          currentStep={flowState.currentStep}
          hasNotifications={true}
        />
      )}

      {/* Community Resource Button - show during journey and deliverables stages */}
      {(flowState.currentStage === 'JOURNEY' || flowState.currentStage === 'DELIVERABLES' || flowState.currentStage === 'COMPLETED') && (
        <CommunityResourceButton
          blueprint={flowState.blueprintDoc}
          onResourceSelect={(resource) => {
            console.log('Selected community resource:', resource);
            // Handle resource selection - could add to blueprint or create engagement
          }}
        />
      )}

      {/* Enrichment UI - show when enrichment data is available */}
      <EnrichmentToggle
        enrichmentResult={lastEnrichmentResult}
        isVisible={showEnrichmentPanel}
        onToggle={() => setShowEnrichmentPanel(!showEnrichmentPanel)}
      />
      
      <EnrichmentPanel
        enrichmentResult={lastEnrichmentResult}
        isVisible={showEnrichmentPanel}
        onToggle={() => setShowEnrichmentPanel(!showEnrichmentPanel)}
      />

      {/* Debug Panel - remove in production */}
      <DebugPanel flowState={flowState} isVisible={true} />
    </div>
  );
};