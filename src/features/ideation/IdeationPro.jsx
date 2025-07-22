// IdeationPro.jsx - Enhanced Ideation with Issue Mapping

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBlueprint } from '../../context/BlueprintContext';
import { DecisionTreeOptions } from '../../context/BlueprintSchema';
import { useWhatIfScenarios } from '../../hooks/useWhatIfScenarios';
import ConsistencyDialog from '../../components/ConsistencyDialog';
import { generateJsonResponse } from '../../services/geminiService';
import { renderMarkdown } from '../../lib/markdown.ts';
import { titleCase, formatAgeGroup } from '../../lib/textUtils.ts';

// Icons
const Icons = {
  ProjectCraft: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  ),
  User: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Lightbulb: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z"/>
      <path d="M9 21h6"/>
    </svg>
  ),
  Send: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Tag: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  Document: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  Chat: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Forward: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  )
};

// Decision Tree Chip
const DecisionChip = ({ option, onClick, disabled = false }) => {
  const IconComponent = Icons[option.icon] || Icons.Lightbulb;
  
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={() => onClick(option.id)}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        bg-white shadow-md hover:shadow-lg transition-all duration-200
        text-blue-600 hover:text-blue-700 border border-blue-200`}
    >
      <IconComponent />
      <span>{option.label}</span>
    </motion.button>
  );
};

// Issue Tag Component
const IssueTag = ({ issue, onRemove, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ delay: index * 0.05 }}
    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 
               rounded-full text-sm font-medium group"
  >
    <Icons.Tag />
    <span>{issue}</span>
    <button
      onClick={onRemove}
      className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  </motion.div>
);

// Progress Badge
const ProgressBadge = ({ step, isComplete, isCurrent }) => {
  const steps = {
    bigIdea: { label: 'Big Idea', icon: Icons.Lightbulb },
    essentialQuestion: { label: 'Essential Question', icon: Icons.Chat },
    challenge: { label: 'Challenge', icon: Icons.Target },
    issues: { label: 'Issue Mapping', icon: Icons.Tag }
  };

  const StepIcon = steps[step]?.icon || Icons.Lightbulb;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
      ${isCurrent ? 'bg-blue-100 text-blue-700' : 
        isComplete ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
      <StepIcon />
      <span>{steps[step]?.label}</span>
      {isComplete && <Icons.Check />}
    </div>
  );
};

// Checkpoint Toast
const CheckpointToast = ({ message, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 50 }}
    className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg
               flex items-center gap-3 z-50"
  >
    <Icons.Check />
    <span className="font-medium">{message}</span>
    <button
      onClick={onClose}
      className="ml-4 hover:opacity-80"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  </motion.div>
);

// Main Component
const IdeationPro = ({ projectInfo, onComplete, onCancel }) => {
  const { 
    blueprint, 
    updateIdeation, 
    validateBigIdea, 
    validateEssentialQuestion, 
    validateChallenge,
    markStepComplete,
    skipStep,
    generateCatalystCard
  } = useBlueprint();

  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('bigIdea');
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [checkpointMessage, setCheckpointMessage] = useState('');
  const [suggestedIssues, setSuggestedIssues] = useState([]);
  
  const chatEndRef = useRef(null);
  
  // What-If scenarios hook
  const {
    checkHelpRequest,
    checkEmptyRequired,
    checkConsistency,
    applyPendingChanges,
    cancelPendingChanges,
    getAutoUpdateSuggestion,
    showConsistencyDialog,
    inconsistencies
  } = useWhatIfScenarios();

  // Get ideation data from blueprint
  const ideationData = blueprint.ideation;

  // Determine next step
  const getNextStep = useCallback(() => {
    if (!ideationData.bigIdea) return 'bigIdea';
    if (!ideationData.essentialQuestion) return 'essentialQuestion';
    if (!ideationData.challenge) return 'challenge';
    if (ideationData.issues.length < 2) return 'issues';
    return 'complete';
  }, [ideationData]);

  // Handle step completion
  const completeStep = useCallback((step, value) => {
    updateIdeation({ [step]: value });
    markStepComplete(`ideation-${step}`);
    
    // Show checkpoint toast
    setCheckpointMessage(`✓ ${step === 'bigIdea' ? 'Big Idea' : 
                              step === 'essentialQuestion' ? 'Essential Question' :
                              step === 'challenge' ? 'Challenge' : 'Issue'} locked in!`);
    setShowCheckpoint(true);
    setTimeout(() => setShowCheckpoint(false), 3000);

    // Move to next step
    const nextStep = getNextStep();
    if (nextStep === 'complete') {
      // Generate deliverable
      const catalystCard = generateCatalystCard();
      updateIdeation({ deliverable: catalystCard });
      
      // Complete ideation
      setTimeout(() => {
        onComplete(ideationData);
      }, 1500);
    } else {
      setCurrentStep(nextStep);
    }
  }, [updateIdeation, markStepComplete, getNextStep, generateCatalystCard, onComplete, ideationData]);

  // Handle decision tree actions
  const handleDecisionAction = async (actionId) => {
    switch (actionId) {
      case 'get-ideas':
        handleSendMessage('Get Ideas');
        break;
      case 'see-examples':
        handleSendMessage('See Examples');
        break;
      case 'ask-ai':
        // Open free text - just focus input
        document.querySelector('input[type="text"]')?.focus();
        break;
      case 'skip':
        skipStep(`ideation-${currentStep}`);
        const nextStep = getNextStep();
        setCurrentStep(nextStep);
        break;
    }
  };

  // Handle message sending
  const handleSendMessage = async (messageContent = userInput) => {
    if (!messageContent.trim() || isAiLoading) return;

    // Check for help request
    const helpCheck = checkHelpRequest(messageContent);
    if (helpCheck) {
      const helpMessage = {
        role: 'assistant',
        content: `I'm here to help! Here are your options:\n\n${helpCheck.suggestions.map(s => `• ${s}`).join('\n')}\n\nWhat would you like to do?`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, helpMessage]);
      return;
    }

    if (messageContent === userInput) {
      setUserInput('');
    }

    // Add user message
    const userMessage = {
      role: 'user',
      content: messageContent,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsAiLoading(true);

    try {
      // Build prompt based on current step
      let systemPrompt = `You are helping an educator design a ${projectInfo.subject} project for ${projectInfo.ageGroup}.
Current step: ${currentStep}
Context: ${JSON.stringify(ideationData)}
Project scope: ${projectInfo.projectScope}`;

      if (currentStep === 'issues') {
        systemPrompt += '\nFor Issue Mapping, suggest 5 specific sub-themes or issues related to their Big Idea and Essential Question.';
      }

      // Handle special commands
      let dynamicInstruction = '';
      if (messageContent === 'Get Ideas') {
        dynamicInstruction = `Provide 3-5 fresh ${currentStep} suggestions based on the context.`;
      } else if (messageContent === 'See Examples') {
        dynamicInstruction = `Show 3 well-formed ${currentStep} examples from similar projects.`;
      }

      // Validate response if it's actual input
      if (currentStep !== 'issues' && !['Get Ideas', 'See Examples', 'Help'].includes(messageContent)) {
        let validation;
        switch (currentStep) {
          case 'bigIdea':
            validation = validateBigIdea(messageContent);
            break;
          case 'essentialQuestion':
            validation = validateEssentialQuestion(messageContent);
            break;
          case 'challenge':
            validation = validateChallenge(messageContent);
            break;
        }

        if (validation && !validation.valid) {
          dynamicInstruction = `User's response needs guidance: ${validation.message}. Coach them gently.`;
        } else if (validation?.valid) {
          // Check for consistency issues if updating existing field
          if (ideationData[currentStep]) {
            const consistencyChecks = checkConsistency('ideation', currentStep, messageContent);
            if (consistencyChecks.length > 0) {
              // Show consistency dialog instead of immediately saving
              const confirmMessage = {
                role: 'assistant',
                content: `I notice you're updating your ${currentStep}. This change might affect other parts of your blueprint. Would you like me to suggest updates to keep everything aligned?`,
                timestamp: Date.now()
              };
              setMessages(prev => [...prev, confirmMessage]);
              return;
            }
          }
          
          // Valid response - save it
          completeStep(currentStep, messageContent);
          dynamicInstruction = `Excellent! The ${currentStep} has been saved. Now guide them to the next step.`;
        }
      }

      // Get AI response
      const response = await generateJsonResponse(
        [{ role: 'user', parts: [{ text: messageContent }] }],
        systemPrompt + '\n' + dynamicInstruction
      );

      // Process response
      const aiMessage = {
        role: 'assistant',
        content: response.chatResponse || response.message || 'Let me help you with that.',
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Handle issue suggestions
      if (currentStep === 'issues' && response.suggestions) {
        setSuggestedIssues(response.suggestions);
      }

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'I had trouble processing that. Let me help you another way.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsAiLoading(false);
  };

  // Handle issue tag management
  const addIssue = (issue) => {
    if (ideationData.issues.length < 4) {
      updateIdeation({ issues: [...ideationData.issues, issue] });
      setSuggestedIssues(prev => prev.filter(i => i !== issue));
      
      if (ideationData.issues.length + 1 >= 2) {
        completeStep('issues', [...ideationData.issues, issue]);
      }
    }
  };

  const removeIssue = (index) => {
    const newIssues = ideationData.issues.filter((_, i) => i !== index);
    updateIdeation({ issues: newIssues });
  };

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize conversation
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = {
        role: 'assistant',
        content: `Welcome! Let's design your ${titleCase(projectInfo.subject)} project for ${formatAgeGroup(projectInfo.ageGroup)}.

We'll work through four steps:
**Big Idea** → **Essential Question** → **Challenge** → **Issue Mapping**

Starting with your Big Idea - what core theme will anchor your students' learning?`,
        timestamp: Date.now()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">Ideation</h1>
            <div className="flex items-center gap-2">
              {['bigIdea', 'essentialQuestion', 'challenge', 'issues'].map(step => (
                <ProgressBadge
                  key={step}
                  step={step}
                  isComplete={step === 'issues' ? ideationData.issues.length >= 2 : !!ideationData[step]}
                  isCurrent={currentStep === step}
                />
              ))}
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, index) => (
            <Message key={index} message={msg} isUser={msg.role === 'user'} />
          ))}
          
          {isAiLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Icons.ProjectCraft />
              </div>
              <div className="bg-white rounded-2xl px-4 py-3 shadow-md">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}

          {/* Issue mapping UI */}
          {currentStep === 'issues' && (
            <div className="mt-6 space-y-4">
              <div className="bg-white rounded-xl p-4 shadow-md">
                <h3 className="font-medium text-gray-900 mb-3">Selected Issues ({ideationData.issues.length}/4)</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  <AnimatePresence>
                    {ideationData.issues.map((issue, index) => (
                      <IssueTag
                        key={issue}
                        issue={issue}
                        index={index}
                        onRemove={() => removeIssue(index)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
                
                {suggestedIssues.length > 0 && (
                  <>
                    <p className="text-sm text-gray-600 mb-2">Suggested issues:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedIssues.map((issue, index) => (
                        <motion.button
                          key={issue}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => addIssue(issue)}
                          disabled={ideationData.issues.length >= 4}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm
                                   text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          + {issue}
                        </motion.button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Decision tree chips */}
      <div className="bg-white border-t px-4 py-3">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-2 justify-center">
          {Object.values(DecisionTreeOptions).map(option => (
            <DecisionChip
              key={option.id}
              option={option}
              onClick={handleDecisionAction}
              disabled={isAiLoading}
            />
          ))}
        </div>
      </div>

      {/* Input area */}
      <div className="bg-white border-t px-4 py-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <div className="relative flex-1">
            <Icons.User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder={`Type your ${currentStep === 'bigIdea' ? 'big idea' : 
                          currentStep === 'essentialQuestion' ? 'essential question' :
                          currentStep === 'challenge' ? 'challenge' : 'response'}...`}
              disabled={isAiLoading}
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 
                       focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
          <button
            onClick={() => handleSendMessage()}
            disabled={!userInput.trim() || isAiLoading}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Icons.Send />
          </button>
        </div>
      </div>

      {/* Checkpoint Toast */}
      <AnimatePresence>
        {showCheckpoint && (
          <CheckpointToast 
            message={checkpointMessage} 
            onClose={() => setShowCheckpoint(false)} 
          />
        )}
      </AnimatePresence>

      {/* Consistency Dialog */}
      <ConsistencyDialog
        isOpen={showConsistencyDialog}
        inconsistencies={inconsistencies}
        onApply={applyPendingChanges}
        onCancel={cancelPendingChanges}
        onAutoUpdate={(item) => {
          const suggestion = getAutoUpdateSuggestion(item.field, ideationData);
          if (suggestion) {
            updateIdeation({ [item.field]: suggestion });
          }
        }}
      />
    </div>
  );
};

// Message component (simplified for brevity)
const Message = ({ message, isUser }) => (
  <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
    {!isUser ? (
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
        <Icons.ProjectCraft />
      </div>
    ) : (
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 order-2">
        <Icons.User />
      </div>
    )}
    <div className={`max-w-[70%] ${isUser ? 'order-1' : 'order-2'}`}>
      <div className={`rounded-2xl px-4 py-2.5 ${
        isUser ? 'bg-blue-600 text-white' : 'bg-white shadow-md text-gray-800'
      }`}>
        <div 
          className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : ''}`}
          dangerouslySetInnerHTML={renderMarkdown(message.content)}
        />
      </div>
    </div>
  </div>
);

export default IdeationPro;