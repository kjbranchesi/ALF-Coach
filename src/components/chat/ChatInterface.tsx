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
  type WizardData,
  SOPStep
} from '../../core/types/SOPTypes';
import { MessageBubble } from './MessageBubble';
import { QuickReplyChips } from './QuickReplyChips';
import { SuggestionCards } from './SuggestionCards';
import { ChatInput } from './ChatInput';
import { ProgressBar } from './ProgressBar';
import { StageInitiator, StepPrompt, StageClarifier, WizardFlow, RubricStage, JourneyDetailsStage, MethodSelectionStage, JourneyPhaseSelector, ActivityBuilder } from './stages';
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
  const [hasPendingSuggestions, setHasPendingSuggestions] = useState(false);
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

  // Handle suggestions state management
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.suggestions && lastMessage.suggestions.length > 0) {
      console.log('[ChatInterface] useEffect detected suggestions in latest message:', lastMessage.suggestions);
      setHasPendingSuggestions(true);
      // Hide stage component to show suggestions
      if (showStageComponent) {
        setShowStageComponent(false);
      }
    }
  }, [messages, showStageComponent]);

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
      flowManager.advance();
      setFlowState(flowManager.getState());
      setShowStageComponent(true);
      setMessages([]);
    }
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
          flowManager.updateStepData(processedContent || response);
        } else {
          // For other steps, save user's original response
          flowManager.updateStepData(response);
        }
      } else if (!detection.isCommand) {
        // For normal user input, check if AI refined it and save the refined version
        const processedContent = extractProcessedContent(aiResponse.message, flowState.currentStep);
        if (processedContent) {
          // AI provided a refined version, use that
          flowManager.updateStepData(processedContent);
        } else {
          // No AI refinement, save user input as-is
          flowManager.updateStepData(response);
        }
      }

      // Add AI message with quick replies based on allowed actions
      const allowedActions = flowState.allowedActions || [];
      const quickReplies: QuickReply[] = [];
      
      // Build quick replies based on allowed actions from flow manager
      if (allowedActions.includes('continue')) {
        quickReplies.push({ action: 'continue', label: 'Continue to Next Step' });
      }
      
      if (allowedActions.includes('ideas')) {
        quickReplies.push({ action: 'ideas', label: 'Ideas' });
      }
      
      if (allowedActions.includes('whatif')) {
        quickReplies.push({ action: 'whatif', label: 'What If?' });
      }
      
      if (allowedActions.includes('help')) {
        quickReplies.push({ action: 'help', label: 'Help' });
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
          // CRITICAL FIX: Get the updated state BEFORE clearing messages
          const oldState = flowManager.getState();
          flowManager.advance();
          const newState = flowManager.getState();
          
          setShowStageComponent(true);
          
          // Only clear messages when moving to a completely new stage, not just new step
          const isNewStage = newState.currentStage !== oldState.currentStage;
          if (isNewStage) {
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
              { action: 'ideas', label: 'Ideas' },
              { action: 'whatif', label: 'What If?' },
              { action: 'help', label: 'Help' }
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
        updatedQuickReplies.push({ action: 'continue', label: 'Continue to Next Step' });
      }
      if (updatedAllowedActions.includes('ideas')) {
        updatedQuickReplies.push({ action: 'ideas', label: 'More Ideas' });
      }
      if (updatedAllowedActions.includes('whatif')) {
        updatedQuickReplies.push({ action: 'whatif', label: 'What If?' });
      }
      if (updatedAllowedActions.includes('help')) {
        updatedQuickReplies.push({ action: 'help', label: 'Help' });
      }

      console.log('[ChatInterface] Adding message with suggestions:', {
        message: response.message,
        suggestionsCount: response.suggestions?.length,
        suggestions: response.suggestions
      });
      
      // Add the message with suggestions - useEffect will handle UI state
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
    
    // Clear suggestions state
    setHasPendingSuggestions(false);
    
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
      <div className="chat-interface flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
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
              ) : isClarifier ? (
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
          </div>
        )}

        {/* Chat messages - only show when NOT using stage components */}
        {!showStageComponent && messages.length > 0 && (
          <div className="p-6 space-y-6 min-h-screen">
            <div className="max-w-4xl mx-auto">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex justify-center py-6">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg px-6 py-4 border border-gray-200/50 dark:border-gray-700/50">
                    <div className="typing-indicator flex gap-2">
                      <span className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></span>
                      <span className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
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

      {/* Bottom interaction area */}
      {!isWizard && !isCompleted && !showStageComponent && (
        <>
          {/* Journey-specific components or regular suggestions */}
          {flowState.currentStep === 'JOURNEY_PHASES' && currentSuggestions.length > 0 ? (
            <div className="px-4 pb-4">
              <JourneyPhaseSelector
                suggestedPhases={currentSuggestions.map((s, idx) => ({
                  id: s.id || `phase-${idx}`,
                  title: s.title,
                  description: s.description || s.text,
                  duration: '2-3 weeks',
                  activities: []
                }))}
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
          ) : flowState.currentStep === 'JOURNEY_ACTIVITIES' && currentSuggestions.length > 0 ? (
            <div className="px-4 pb-4">
              <ActivityBuilder
                suggestedActivities={currentSuggestions.map((s, idx) => ({
                  id: s.id || `activity-${idx}`,
                  title: s.title,
                  description: s.description || s.text,
                  duration: '30-60 minutes',
                  type: 'group' as const
                }))}
                currentPhase={flowState.blueprintDoc?.journey?.phases?.[0]?.title}
                onActivitiesConfirmed={(activities) => {
                  // Format as a single response with all selected activities
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
          ) : currentSuggestions.length > 0 ? (
            <SuggestionCards 
              suggestions={currentSuggestions}
              onSelect={handleSuggestionClick}
            />
          ) : null}

          {/* Quick Replies - Always show action buttons in Ideation */}
          {currentQuickReplies.length > 0 && (
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
            disabled={isLoading}
            placeholder={currentSuggestions.length > 0 ? "Type your response or select a suggestion..." : "Type your response..."}
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

      {/* Community Resource Button - temporarily disabled until feature is complete */}
      {false && (flowState.currentStage === 'JOURNEY' || flowState.currentStage === 'DELIVERABLES' || flowState.currentStage === 'COMPLETED') && (
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
    </ErrorBoundary>
  );
};