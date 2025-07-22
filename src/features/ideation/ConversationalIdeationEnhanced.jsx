// ConversationalIdeationEnhanced.jsx - Restored coaching soul with framework benefits

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBlueprint } from '../../context/BlueprintContext';
import { useWhatIfScenarios } from '../../hooks/useWhatIfScenarios';
import ConsistencyDialog from '../../components/ConsistencyDialog';
import IdeationProgress from './IdeationProgress.jsx';
import { generateJsonResponse } from '../../services/geminiService.js';
import { renderMarkdown } from '../../lib/markdown.ts';
import { titleCase, formatAgeGroup } from '../../lib/textUtils.ts';
import { processOnboardingData, isSuggestionClick, processSuggestionClick } from '../../utils/onboardingProcessor.js';
import UnifiedSuggestionCard, { getCardType, getCardIcon } from '../../components/UnifiedSuggestionCard';
import { preprocessIdeationContext, formatBigIdeaSuggestions } from '../../services/ideationPreprocessor';

// Icons remain the same but with proper styling
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
  Sparkles: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L14.09 8.36L21 9.27L16.5 13.97L17.82 21L12 17.77L6.18 21L7.5 13.97L3 9.27L9.91 8.36L12 2z"/>
    </svg>
  ),
  Lightbulb: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z"/>
      <path d="M9 21h6"/>
    </svg>
  ),
  Target: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  Send: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6"/>
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
  Exit: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
};

// Beautiful Progress Indicator in header
const StageProgress = ({ currentStep, ideationData }) => {
  const steps = [
    { key: 'bigIdea', label: 'Big Idea', icon: Icons.Lightbulb },
    { key: 'essentialQuestion', label: 'Essential Question', icon: Icons.Sparkles },
    { key: 'challenge', label: 'Challenge', icon: Icons.Target },
    { key: 'issues', label: 'Issues', icon: Icons.Tag }
  ];

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-sm overflow-x-auto">
      {steps.map((step, index) => {
        const isComplete = step.key === 'issues' ? ideationData.issues?.length >= 2 : ideationData[step.key];
        const isActive = currentStep === step.key;
        const Icon = step.icon;

        return (
          <React.Fragment key={step.key}>
            <motion.div 
              className={`flex items-center gap-2 px-3 py-1 rounded-md transition-all whitespace-nowrap ${
                isActive ? 'bg-white shadow-sm text-gray-900' : 
                isComplete ? 'text-green-600' : 'text-gray-400'
              }`}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Icon />
              <span className="font-medium hidden sm:inline">{step.label}</span>
              {isComplete && <Icons.Check />}
            </motion.div>
            {index < steps.length - 1 && (
              <Icons.ChevronRight className="text-gray-400" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Using UnifiedSuggestionCard for consistent styling

// Enhanced Message Component with Beautiful Cards
const Message = ({ message, isUser }) => {
  if (!message || typeof message !== 'object') {
    return null;
  }
  
  const messageContent = message.chatResponse || message.content || message.text || '';
  
  if (!messageContent) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser ? (
        <motion.div 
          className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-soft"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Icons.ProjectCraft />
        </motion.div>
      ) : (
        <motion.div 
          className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 order-2 shadow-soft"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Icons.User />
        </motion.div>
      )}
      <motion.div 
        className={`max-w-[85%] sm:max-w-[80%] md:max-w-[70%] ${isUser ? 'order-1' : 'order-2'}`}
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <div className={`rounded-2xl px-4 py-2.5 transition-all duration-200 ${
          isUser 
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-soft-lg hover:shadow-soft-xl' 
            : 'bg-white shadow-soft hover:shadow-soft-lg text-slate-800'
        }`}>
          <div 
            className={`prose prose-sm max-w-none ${
              isUser ? 'prose-invert prose-p:text-white prose-strong:text-white prose-headings:text-white' : 'prose-slate'
            }`}
            dangerouslySetInnerHTML={renderMarkdown(String(messageContent))}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

// Issue Tag with Beautiful Styling
const IssueTag = ({ issue, onRemove, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ delay: index * 0.05 }}
    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 
               rounded-full text-sm font-medium group shadow-soft hover:shadow-soft-lg
               border border-blue-200 transition-all duration-200"
  >
    <Icons.Tag />
    <span>{issue}</span>
    {onRemove && (
      <button
        onClick={onRemove}
        className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    )}
  </motion.div>
);

// Checkpoint Celebration Toast
const CheckpointToast = ({ message, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 50 }}
    className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-soft-xl
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
const ConversationalIdeationEnhanced = ({ projectInfo, onComplete, onCancel }) => {
  // Blueprint integration
  const { 
    blueprint, 
    updateIdeation, 
    validateBigIdea, 
    validateEssentialQuestion, 
    validateChallenge,
    markStepComplete,
    skipStep
  } = useBlueprint();

  // What-If scenarios
  const {
    checkHelpRequest,
    checkConsistency,
    applyPendingChanges,
    cancelPendingChanges,
    getAutoUpdateSuggestion,
    showConsistencyDialog,
    inconsistencies
  } = useWhatIfScenarios();

  // State management
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('bigIdea');
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [checkpointMessage, setCheckpointMessage] = useState('');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  const chatEndRef = useRef(null);
  const ideationData = blueprint.ideation;
  
  // Log whenever ideation data changes
  useEffect(() => {
    console.log('[DEBUG] Blueprint ideation updated:', {
      bigIdea: blueprint.ideation.bigIdea,
      essentialQuestion: blueprint.ideation.essentialQuestion,
      challenge: blueprint.ideation.challenge,
      currentStep
    });
  }, [blueprint.ideation, currentStep]);
  
  // Debug initial state
  useEffect(() => {
    console.log('[DEBUG] Initial ideation data:', ideationData);
    console.log('[DEBUG] Current step:', currentStep);
    
    // Make debugging functions available in console
    if (typeof window !== 'undefined') {
      // Import test functions
      import('../../utils/testAllButtons.js').then(module => {
        window.testAllButtons = module.testAllButtons;
        window.testConversationFlow = module.testConversationFlow;
      });
      
      window.testIdeationFlow = () => {
        console.log('=== IDEATION STATE DEBUG ===');
        console.log('Current ideation data:', ideationData);
        console.log('Current step:', currentStep);
        console.log('Messages:', messages);
        console.log('=== END DEBUG ===');
      };
      
      window.clearIdeationData = () => {
        updateIdeation({
          bigIdea: '',
          essentialQuestion: '',
          challenge: '',
          issues: []
        });
        console.log('Ideation data cleared!');
      };
    }
  }, [ideationData, currentStep, messages]);

  // Coaching prompts based on step
  const getCoachingPrompts = useCallback((step, context) => {
    const prompts = {
      bigIdea: {
        initial: `I'm excited to help you design a meaningful ${context.subject} project!
        
Let's start with the Big Idea - the overarching theme that will anchor your students' learning journey. This should be something that:
• Connects to real-world relevance
• Sparks curiosity and wonder
• Has depth for exploration

What broad concept or theme do you want your ${context.ageGroup} to explore?`,
        
        suggestions: [
          "How about exploring \"Innovation in Our Community\"?",
          "What if we focused on \"Sustainability and Future Design\"?",
          "Consider \"Connection and Collaboration in the Modern World\"",
          "See more examples for " + context.subject
        ]
      },
      essentialQuestion: {
        initial: ideationData.bigIdea ? 
          `Excellent! "${ideationData.bigIdea}" is a powerful theme to explore.

Now let's craft an Essential Question that will drive inquiry throughout the project. A great essential question:
• Is open-ended (no single right answer)
• Provokes deep thinking
• Connects to students' lives
• Starts with How, Why, or What

Based on your Big Idea, what burning question should students investigate?` :
          `Let's craft an Essential Question that will drive inquiry throughout the project. A great essential question:
• Is open-ended (no single right answer)
• Provokes deep thinking
• Connects to students' lives
• Starts with How, Why, or What

What burning question should your students investigate?`,
        
        suggestions: ideationData.bigIdea ? [
          `What if we asked: "How can we use ${ideationData.bigIdea} to improve our community?"`,
          `Consider: "Why does ${ideationData.bigIdea} matter for our future?"`,
          `How about: "What would happen if we reimagined ${ideationData.bigIdea}?"`,
          "Let me suggest more questions based on your context"
        ] : [
          "How can we improve our community?",
          "Why does this matter for our future?",
          "What would happen if we reimagined our world?",
          "Show me example questions"
        ]
      },
      challenge: {
        initial: ideationData.essentialQuestion ? 
          `Perfect! Your essential question "${ideationData.essentialQuestion}" will really get students thinking.

Now for the exciting part - let's design a Challenge that puts learning into action! This should be:
• An authentic task with a real audience
• Something students create, design, or solve
• Connected to your Big Idea and Essential Question

What will your ${context.ageGroup} DO to demonstrate their understanding?` :
          `Now for the exciting part - let's design a Challenge that puts learning into action! This should be:
• An authentic task with a real audience
• Something students create, design, or solve
• Connected to your learning goals

What will your ${context.ageGroup} DO to demonstrate their understanding?`,
        
        suggestions: [
          "Create a multimedia exhibition for the community",
          "Design a solution and pitch it to local experts",
          "Develop a digital resource that teaches others",
          "Produce an interactive experience or performance"
        ]
      },
      issues: {
        initial: `Wonderful! Your challenge "${ideationData.challenge}" will give students an authentic purpose.

Finally, let's identify 2-4 key issues or sub-themes within ${ideationData.bigIdea} that students will explore. These will help organize the learning journey.

What specific aspects or angles should we investigate?`,
        
        suggestions: []  // Will be dynamically generated
      }
    };

    return prompts[step] || prompts.bigIdea;
  }, [ideationData]);

  // Get coaching prompts with specific ideation data
  const getCoachingPromptsWithData = useCallback((step, context, ideationDataOverride) => {
    const data = ideationDataOverride || ideationData;
    const prompts = {
      bigIdea: {
        initial: `I'm excited to help you design a meaningful ${context.subject} project!
        
Let's start with the Big Idea - the overarching theme that will anchor your students' learning journey. This should be something that:
• Connects to real-world relevance
• Sparks curiosity and wonder
• Has depth for exploration

What broad concept or theme do you want your ${context.ageGroup} to explore?`,
        
        suggestions: [
          "How about exploring \"Innovation in Our Community\"?",
          "What if we focused on \"Sustainability and Future Design\"?",
          "Consider \"Connection and Collaboration in the Modern World\"",
          "See more examples for " + context.subject
        ]
      },
      essentialQuestion: {
        initial: data.bigIdea ? 
          `Excellent! "${data.bigIdea}" is a powerful theme to explore. 

Now let's craft an Essential Question that will drive inquiry throughout the project. A great essential question:
• Is open-ended (no single right answer)
• Provokes deep thinking
• Connects to students' lives
• Starts with How, Why, or What

Based on your Big Idea, what burning question should students investigate?` :
          `Let's craft an Essential Question that will drive inquiry throughout the project. A great essential question:
• Is open-ended (no single right answer)
• Provokes deep thinking
• Connects to students' lives
• Starts with How, Why, or What

What burning question should your students investigate?`,
        
        suggestions: data.bigIdea ? [
          `What if we asked: "How can we use ${data.bigIdea} to improve our community?"`,
          `Consider: "Why does ${data.bigIdea} matter for our future?"`,
          `How about: "What would happen if we reimagined ${data.bigIdea}?"`,
          "Let me suggest more questions based on your context"
        ] : [
          "How can we improve our community?",
          "Why does this matter for our future?",
          "What would happen if we reimagined our world?",
          "Show me example questions"
        ]
      },
      challenge: {
        initial: data.essentialQuestion ? 
          `Perfect! Your essential question "${data.essentialQuestion}" will really get students thinking.

Now for the exciting part - let's design a Challenge that puts learning into action! This should be:
• An authentic task with a real audience
• Something students create, design, or solve
• Connected to your Big Idea and Essential Question

What will your ${context.ageGroup} DO to demonstrate their understanding?` :
          `Now for the exciting part - let's design a Challenge that puts learning into action! This should be:
• An authentic task with a real audience
• Something students create, design, or solve
• Connected to your learning goals

What will your ${context.ageGroup} DO to demonstrate their understanding?`,
        
        suggestions: [
          "Create a multimedia exhibition for the community",
          "Design a solution and pitch it to local experts",
          "Develop a digital resource that teaches others",
          "Produce an interactive experience or performance"
        ]
      }
    };

    return prompts[step] || prompts.bigIdea;
  }, [ideationData]);

  // Initialize with warm coaching message
  useEffect(() => {
    if (messages.length === 0) {
      initializeConversation();
    }
  }, []);

  // Initialize conversation with AI preprocessing
  const initializeConversation = async () => {
    try {
      // Process onboarding data for better context
      const processedData = processOnboardingData(projectInfo);
      const enrichedProjectInfo = {
        ...projectInfo,
        ...processedData.processed.context
      };
      
      // Try AI preprocessing for even better context
      let aiInsights = null;
      try {
        const preprocessResult = await preprocessIdeationContext(projectInfo);
        if (preprocessResult.success) {
          aiInsights = preprocessResult.insights;
        }
      } catch (error) {
        console.log('AI preprocessing unavailable, using fallback');
      }
      
      // Use AI insights if available, otherwise use processed data
      const bigIdeaSuggestions = aiInsights?.bigIdeaSuggestions 
        ? formatBigIdeaSuggestions(aiInsights.bigIdeaSuggestions)
        : processedData.processed.bigIdeaSuggestions;
      
      const customSuggestions = bigIdeaSuggestions.slice(0, 3).map((idea) => {
        return `How about exploring "${idea}"?`;
      });
      
      // Create personalized welcome based on educator's vision
      let welcomeText = `I'm excited to help you design a meaningful ${projectInfo.subject} project!\n\n`;
      
      if (processedData.processed.educatorVision && processedData.processed.educatorVision.trim()) {
        welcomeText += `I love your vision: "${processedData.processed.educatorVision}". Let's build on that!\n\n`;
      }
      
      // Add personalized insights if available
      if (aiInsights?.personalizedInsights) {
        welcomeText += `${aiInsights.personalizedInsights}\n\n`;
      }
      
      welcomeText += `Let's start with the Big Idea - the overarching theme that will anchor your students' learning journey. This should be something that:
• Connects to real-world relevance
• Sparks curiosity and wonder
• Has depth for exploration

What broad concept or theme do you want your ${formatAgeGroup(projectInfo.ageGroup)} to explore?`;

      const welcomeMessage = {
        role: 'assistant',
        chatResponse: welcomeText,
        suggestions: [...customSuggestions, "See more examples for " + projectInfo.subject],
        timestamp: Date.now()
      };
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Error initializing conversation:', error);
      // Fallback to basic initialization
      const welcomeMessage = {
        role: 'assistant',
        chatResponse: `I'm excited to help you design a meaningful ${projectInfo.subject} project!\n\nLet's start with the Big Idea - the overarching theme that will anchor your students' learning journey. What broad concept or theme do you want your ${formatAgeGroup(projectInfo.ageGroup)} to explore?`,
        suggestions: ["Get Ideas", "See Examples", "Help"],
        timestamp: Date.now()
      };
      setMessages([welcomeMessage]);
    }
  };

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle command actions (Get Ideas, See Examples, etc.)
  const handleCommand = async (command) => {
    setIsAiLoading(true);
    
    try {
      let responseContent = '';
      let suggestions = [];
      
      switch (command) {
        case 'get-ideas':
          const currentPrompts = getCoachingPrompts(currentStep, projectInfo);
          responseContent = `Here are some inspiring ideas for your ${currentStep}:\n\n`;
          suggestions = currentPrompts.suggestions;
          break;
          
        case 'see-examples':
          responseContent = await getExamplesForStep(currentStep, projectInfo);
          suggestions = ["Adapt one of these", "Combine ideas", "Create my own"];
          break;
          
        case 'help':
          responseContent = `I'm here to guide you through creating your ${currentStep}! 

Currently, we're working on: **${currentStep === 'bigIdea' ? 'Big Idea' : 
                                     currentStep === 'essentialQuestion' ? 'Essential Question' :
                                     currentStep === 'challenge' ? 'Challenge' : 'Key Issues'}**

You can:
• Type your own idea
• Click a suggestion to explore it
• Ask for examples or more ideas
• Take your time - there's no rush!`;
          suggestions = ["Show me ideas", "I'd like examples", "I'm ready to type my own"];
          break;
          
        case 'show-changes':
          // Show what would change if they update
          responseContent = `Here's what would be affected by your change:

**Current ${currentStep}:** "${ideationData[currentStep]}"
**Your new version:** (pending)

This change would impact:
• How we frame the essential question
• The type of challenge we design
• The learning activities we create

Would you like to proceed with the update?`;
          suggestions = [
            "Yes, update everything to match",
            "Keep my original and continue",
            "Let me revise it more"
          ];
          break;
          
        case 'accept-changes':
          // Accept the consistency changes
          responseContent = `Great! I'll update everything to align with your refined ${currentStep}.

This ensures your project maintains a clear, coherent focus throughout. Let's continue building your blueprint!`;
          suggestions = getCoachingPrompts(currentStep, projectInfo).suggestions;
          // Apply the pending changes if any
          if (typeof applyPendingChanges === 'function') {
            applyPendingChanges();
          }
          break;
          
        case 'keep-original':
          // Keep original and continue
          responseContent = `No problem! We'll keep your original ${currentStep} as is. 

Sometimes the first instinct is the best one. Let's move forward with your blueprint!`;
          suggestions = getCoachingPrompts(currentStep, projectInfo).suggestions;
          break;
          
        case 'creative-challenge':
          responseContent = `Great choice! Creative challenges are perfect for engaging students. Here are some ideas:

**Exhibition or Gallery**
Students curate a physical or virtual exhibition showcasing their understanding through art, design, or multimedia.

**Documentary or Podcast**
Students create media that tells a compelling story about their topic, interviewing experts or community members.

**Interactive Installation**
Students design an experience that others can engage with to learn about the topic.`;
          suggestions = ["I like the exhibition idea", "Tell me more about documentary", "Let me create my own"];
          break;
          
        case 'solution-challenge':
          responseContent = `Excellent! Solution-based challenges connect learning to real impact. Consider these:

**Design Challenge**
Students identify a problem and prototype a solution, presenting to stakeholders or experts.

**Policy Proposal**
Students research and draft recommendations for local government or organizations.

**Community Action Plan**
Students develop and potentially implement a plan to address a local issue.`;
          suggestions = ["Design challenge sounds great", "Policy proposal interests me", "Community action fits well"];
          break;
          
        case 'digital-challenge':
          responseContent = `Digital products can reach wide audiences! Here are some options:

**App or Website**
Students create a digital tool that serves their community or teaches others about their topic.

**Digital Story Map**
Students build an interactive map showcasing research, stories, or solutions.

**Online Resource Hub**
Students curate and create resources for others learning about this topic.`;
          suggestions = ["App/website appeals to me", "Digital story map sounds interesting", "Resource hub would work well"];
          break;
          
        case 'performance-challenge':
          responseContent = `Performance and presentations bring learning to life! Consider:

**Community Forum or Symposium**
Students organize and lead a public event sharing their findings and facilitating discussion.

**TED-style Talks**
Students prepare and deliver compelling presentations about their essential question.

**Immersive Theater or Simulation**
Students create an experience that puts audiences in scenarios related to their topic.`;
          suggestions = ["Community forum would be powerful", "TED talks excite my students", "Immersive experience sounds amazing"];
          break;
          
        default:
          responseContent = "Let me help you with that...";
          suggestions = getCoachingPrompts(currentStep, projectInfo).suggestions;
      }
      
      const aiMessage = {
        role: 'assistant',
        chatResponse: responseContent,
        suggestions: suggestions,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Command error:', error);
    }
    
    setIsAiLoading(false);
  };

  // Handle message sending with coaching approach
  const handleSendMessage = async (suggestionText) => {
    // Determine the actual message content
    let messageContent = suggestionText || userInput.trim();
    
    if (!messageContent || isAiLoading) return;

    console.log('[DEBUG] handleSendMessage called with:', { 
      suggestionText, 
      userInput: userInput.trim(), 
      messageContent,
      isSuggestion: isSuggestionClick(messageContent)
    });

    // CRITICAL: Check if this is a button click vs typed input
    const isButtonClick = !!suggestionText;
    
    if (isButtonClick) {
      console.log('[DEBUG] This is a button click, not typed input');
      console.log('[DEBUG] Checking if suggestion:', isSuggestionClick(suggestionText));
      
      // Process the button click
      const processed = processSuggestionClick(suggestionText);
      console.log('[DEBUG] Processed button click:', processed);
      
      if (processed.type === 'command') {
        // Handle commands like "Get Ideas", "See Examples"
        console.log('[DEBUG] Handling command:', processed.command);
        handleCommand(processed.command);
        return;
      } else if (processed.type === 'suggestion-selected') {
        // User selected a specific suggestion - use the extracted value
        console.log('[DEBUG] Suggestion selected, extracted value:', processed.value);
        messageContent = processed.value;
        // Clear the input field since this came from a button
        setUserInput('');
      } else {
        // Check if it's a consistency-related action
        const lowerText = suggestionText.toLowerCase();
        if (lowerText.includes('yes') && lowerText.includes('update')) {
          handleCommand('accept-changes');
          return;
        } else if (lowerText.includes('show') && lowerText.includes('change')) {
          handleCommand('show-changes');
          return;
        } else if (lowerText.includes('keep') && lowerText.includes('original')) {
          handleCommand('keep-original');
          return;
        }
        // It's a UI interaction, not actual input - log and ignore
        console.error('[ERROR] Unhandled button click:', suggestionText);
        return;
      }
    }

    // Check for help
    const helpCheck = checkHelpRequest(messageContent);
    if (helpCheck) {
      // Provide contextual help based on current step
      let helpResponse = '';
      let helpSuggestions = [];
      
      if (currentStep === 'bigIdea') {
        helpResponse = `Of course! I'd love to help you craft a compelling Big Idea. 
        
A Big Idea is the overarching theme that will anchor your entire project. Think of something that:
• Connects to real-world relevance
• Sparks curiosity in your ${formatAgeGroup(projectInfo.ageGroup)}
• Has depth for exploration

Would you like me to suggest some ideas based on ${projectInfo.subject}?`;
        helpSuggestions = ["Yes, show me Big Ideas", "See examples from other projects", "Let me think more"];
      } else if (currentStep === 'essentialQuestion') {
        helpResponse = `Absolutely! Essential Questions are the heart of inquiry-based learning.
        
A great Essential Question:
• Starts with How, Why, or What
• Has no single "right" answer
• Connects to students' lives
• Provokes deep thinking

Would you like me to suggest some questions that align with your Big Idea?`;
        helpSuggestions = ["Yes, suggest questions", "Show me examples", "Tips for writing my own"];
      } else if (currentStep === 'challenge') {
        helpResponse = `I'm here to help! The Challenge is where students put their learning into action.
        
A meaningful challenge:
• Has a real audience or purpose
• Results in something students create
• Connects to your Big Idea and Essential Question
• Is appropriately scoped for ${projectInfo.projectScope}

What kind of project outcome interests you?`;
        helpSuggestions = ["Creative projects", "Solution-based challenges", "Digital products", "Performance/presentation"];
      }
      
      const helpMessage = {
        role: 'assistant',
        chatResponse: helpResponse,
        suggestions: helpSuggestions,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, helpMessage]);
      setIsAiLoading(false);
      return;
    }

    if (messageContent === userInput) {
      setUserInput('');
    }

    // Add user message
    const userMessage = {
      role: 'user',
      chatResponse: messageContent,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsAiLoading(true);

    try {
      // Validate input for current step
      let validation = { valid: true };
      let shouldAdvance = false;

      // Don't process empty or whitespace-only input
      if (!messageContent.trim()) {
        const emptyMessage = {
          role: 'assistant',
          chatResponse: `I notice you haven't entered anything yet. Take your time to think about your ${currentStep}. 

Need inspiration? Try one of these options:`,
          suggestions: getCoachingPrompts(currentStep, projectInfo).suggestions,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, emptyMessage]);
        setIsAiLoading(false);
        return;
      }

      if (!['Get Ideas', 'See Examples', 'Help'].includes(messageContent)) {
        // Additional check - don't accept suggestion text as input
        if (isSuggestionClick(messageContent)) {
          setIsAiLoading(false);
          return;
        }
        
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

        if (validation.valid && messageContent.trim().length > 0) {
          // Check consistency if updating an existing non-empty value
          if (ideationData[currentStep] && ideationData[currentStep].trim()) {
            const checks = checkConsistency('ideation', currentStep, messageContent);
            if (checks.length > 0) {
              // Show friendly consistency message
              const consistencyMessage = {
                role: 'assistant',
                chatResponse: `I notice you're refining your ${currentStep}. Great iteration! 

Since this connects to other parts of your blueprint, would you like me to suggest updates to keep everything aligned? 

Your new ${currentStep}: "${messageContent}"`,
                suggestions: [
                  "Yes, update everything to match",
                  "Show me what would change",
                  "Keep my original and continue"
                ],
                timestamp: Date.now()
              };
              setMessages(prev => [...prev, consistencyMessage]);
              setIsAiLoading(false);
              return;
            }
          }

          // Save the valid input
          console.log('[DEBUG] Saving to ideation:', { field: currentStep, value: messageContent });
          console.log('[DEBUG] Current ideationData before save:', ideationData);
          updateIdeation({ [currentStep]: messageContent });
          markStepComplete(`ideation-${currentStep}`);
          shouldAdvance = true;
          console.log('[DEBUG] Should advance to next step');

          // Show checkpoint
          setCheckpointMessage(`${currentStep === 'bigIdea' ? 'Big Idea' : 
                                    currentStep === 'essentialQuestion' ? 'Essential Question' :
                                    currentStep === 'challenge' ? 'Challenge' : 'Issue'} captured beautifully!`);
          setShowCheckpoint(true);
          setTimeout(() => setShowCheckpoint(false), 3000);
        }
      }

      // Build coaching response
      let responseContent = '';
      let suggestions = [];

      if (!validation.valid) {
        // Gentle coaching for invalid input
        responseContent = `I love your thinking! Let me help you refine this a bit. ${validation.message}

Your current draft: "${messageContent}"

Would you like to:`;
        suggestions = [
          "See Examples",
          "Try Again",
          "Why does this matter?"
        ];
      } else if (shouldAdvance) {
        // Celebrate and move forward
        const nextStep = currentStep === 'bigIdea' ? 'essentialQuestion' :
                       currentStep === 'essentialQuestion' ? 'challenge' :
                       currentStep === 'challenge' ? 'issues' : 'complete';

        if (nextStep === 'complete') {
          responseContent = `Congratulations! Your ideation framework is complete!

**Big Idea:** ${ideationData.bigIdea}
**Essential Question:** ${ideationData.essentialQuestion}
**Challenge:** ${messageContent}

This is going to be an amazing learning experience for your students! Ready to design the learning journey?`;
          
          setTimeout(() => onComplete(ideationData), 2000);
        } else {
          setCurrentStep(nextStep);
          
          // Create an updated ideation object with the new value
          const updatedIdeation = {
            ...ideationData,
            [currentStep]: messageContent
          };
          
          // Generate prompts with the updated data
          const nextPrompts = getCoachingPromptsWithData(nextStep, projectInfo, updatedIdeation);
          responseContent = nextPrompts.initial;
          suggestions = nextPrompts.suggestions;
        }
      } else {
        // Handle special commands
        if (messageContent === 'Get Ideas' || messageContent.toLowerCase().includes('idea')) {
          const currentPrompts = getCoachingPrompts(currentStep, projectInfo);
          responseContent = `Here are some ideas to inspire your ${currentStep}:`;
          suggestions = currentPrompts.suggestions;
        } else if (messageContent === 'See Examples' || messageContent.toLowerCase().includes('example')) {
          responseContent = await getExamplesForStep(currentStep, projectInfo);
          suggestions = ["Adapt one of these", "Combine ideas", "Create my own"];
        }
      }

      // Add AI response
      const aiMessage = {
        role: 'assistant',
        chatResponse: responseContent,
        suggestions: suggestions,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant',
        chatResponse: "I had a moment there! Let's try that again. What would you like to explore?",
        suggestions: ["Get Ideas", "See Examples", "Start Over"],
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsAiLoading(false);
  };

  // Get contextual examples
  const getExamplesForStep = async (step, context) => {
    const examples = {
      bigIdea: `Here are some inspiring Big Ideas for ${context.subject}:

**"Systems and Interconnections"**
Perfect for exploring how everything connects in our world

**"Innovation Through Constraints"**  
Great for creative problem-solving projects

**"Local Solutions, Global Impact"**
Ideal for community-based learning

**"The Science of Everyday Life"**
Wonderful for making learning relevant`,

      essentialQuestion: `Here are powerful Essential Questions that drive deep learning:

**"How might we redesign our community spaces to foster connection?"**
Opens doors to urban planning, social studies, and design

**"What does it mean to be a responsible digital citizen?"**
Perfect for media literacy and ethics

**"How can we create sustainable solutions for future generations?"**
Great for environmental science and innovation`,

      challenge: `Here are authentic challenges that engage students:

**"Design and propose a new community space to city council"**
Real audience, real impact

**"Create an app prototype that solves a local problem"**
Technology meets community needs

**"Produce a documentary that changes perspectives"**
Storytelling with purpose`
    };

    return examples[step] || "Let me think of some examples...";
  };

  // Handle issue tag management
  const addIssue = (issue) => {
    if (ideationData.issues.length < 4) {
      const newIssues = [...ideationData.issues, issue];
      updateIdeation({ issues: newIssues });
      
      if (newIssues.length >= 2) {
        markStepComplete('ideation-issues');
        
        // Celebrate completion
        const completionMessage = {
          role: 'assistant',
          chatResponse: `Beautiful! Your ideation framework is complete!

**Big Idea:** ${ideationData.bigIdea}
**Essential Question:** ${ideationData.essentialQuestion}
**Challenge:** ${ideationData.challenge}
**Key Issues:** ${newIssues.join(', ')}

You've created a powerful foundation for authentic learning. Your students are going to love this project!`,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, completionMessage]);
        
        setTimeout(() => onComplete(ideationData), 3000);
      }
    }
  };

  const removeIssue = (index) => {
    const newIssues = ideationData.issues.filter((_, i) => i !== index);
    updateIdeation({ issues: newIssues });
  };

  // Get current suggestions from latest message
  const currentSuggestions = messages[messages.length - 1]?.suggestions || [];
  const showSuggestions = !isAiLoading && currentSuggestions.length > 0 && 
                         messages[messages.length - 1]?.role === 'assistant';

  return (
    <motion.div 
      className="h-screen flex flex-col bg-slate-50 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header with Progress */}
      <div className="bg-white shadow-soft flex-shrink-0 rounded-b-xl">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-semibold text-gray-900">Project Design: Ideation</h1>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              <button 
                onClick={onCancel}
                className="px-4 py-2 bg-white text-blue-600 hover:text-blue-700 rounded-lg font-medium shadow-soft hover:shadow-soft-lg transition-all duration-200 flex items-center gap-2 border border-blue-200 hover:border-blue-300"
              >
                <Icons.Exit />
                <span>Exit</span>
              </button>
            </div>
          </div>
          <StageProgress currentStep={currentStep} ideationData={ideationData} />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex min-h-0">
        {/* Chat area */}
        <div className="flex-1 flex flex-col min-h-0 p-3 gap-3">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow-soft-lg min-h-0">
            <div className="max-w-3xl mx-auto p-4">
              <div className="space-y-4 sm:space-y-6">
                {messages.map((msg, index) => (
                  <Message key={index} message={msg} isUser={msg.role === 'user'} />
                ))}
                
                {isAiLoading && (
                  <motion.div 
                    className="flex gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div 
                      className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-soft"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Icons.ProjectCraft />
                    </motion.div>
                    <div className="bg-white shadow-soft rounded-2xl px-4 py-3">
                      <div className="flex gap-1.5">
                        <motion.div className="w-2 h-2 bg-blue-500 rounded-full"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }} />
                        <motion.div className="w-2 h-2 bg-blue-500 rounded-full"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, delay: 0.2, repeat: Infinity }} />
                        <motion.div className="w-2 h-2 bg-blue-500 rounded-full"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, delay: 0.4, repeat: Infinity }} />
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Issue mapping UI */}
                {currentStep === 'issues' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-soft">
                      <h3 className="font-semibold text-gray-900 mb-4">
                        Key Issues to Explore ({ideationData.issues.length}/4)
                      </h3>
                      
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

                      <div className="grid grid-cols-2 gap-2">
                        {['Technology Impact', 'Community Needs', 'Environmental Factors', 'Social Equity', 'Economic Considerations', 'Cultural Perspectives'].map((issue, index) => (
                          <motion.button
                            key={issue}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => addIssue(issue)}
                            disabled={ideationData.issues.includes(issue) || ideationData.issues.length >= 4}
                            className="px-3 py-2 bg-white hover:bg-blue-50 rounded-lg text-sm
                                     text-gray-700 transition-all shadow-soft hover:shadow-soft-lg
                                     disabled:opacity-50 disabled:cursor-not-allowed
                                     border border-blue-200 hover:border-blue-300"
                          >
                            + {issue}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Suggestions */}
              {showSuggestions && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-2"
                >
                  {currentSuggestions.map((suggestion, i) => (
                    <UnifiedSuggestionCard
                      key={i}
                      index={i}
                      text={suggestion}
                      type={getCardType(suggestion)}
                      icon={getCardIcon(suggestion)}
                      onClick={(suggestionText) => {
                        console.log('[DEBUG] Suggestion clicked:', suggestionText);
                        handleSendMessage(suggestionText);
                      }}
                      disabled={isAiLoading}
                    />
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* Input area */}
          <div className="bg-white rounded-xl shadow-soft-lg flex-shrink-0">
            <div className="max-w-3xl mx-auto p-3">
              <div className="flex gap-3 items-center">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Icons.User />
                  </div>
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder={`Share your ${currentStep === 'bigIdea' ? 'big idea' : 
                                currentStep === 'essentialQuestion' ? 'essential question' :
                                currentStep === 'challenge' ? 'challenge' : 'thoughts'}...`}
                    disabled={isAiLoading}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 transition-all duration-200"
                  />
                </div>
                <motion.button
                  onClick={() => handleSendMessage()}
                  disabled={!userInput.trim() || isAiLoading}
                  whileHover={userInput.trim() && !isAiLoading ? { scale: 1.05 } : {}}
                  whileTap={userInput.trim() && !isAiLoading ? { scale: 0.95 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft hover:shadow-soft-lg"
                >
                  <Icons.Send />
                </motion.button>
              </div>
              
              {/* Quick actions */}
              <div className="flex gap-2 mt-2 flex-wrap">
                <motion.button
                  onClick={() => {
                    console.log('[DEBUG] Quick action clicked: Get Ideas');
                    handleSendMessage('Get Ideas');
                  }}
                  disabled={isAiLoading}
                  whileHover={!isAiLoading ? { scale: 1.05, y: -2 } : {}}
                  whileTap={!isAiLoading ? { scale: 0.95 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg bg-white shadow-soft hover:shadow-soft-lg font-medium transition-all inline-flex items-center gap-1.5 border border-blue-200"
                >
                  <Icons.Lightbulb />
                  <span>Get Ideas</span>
                </motion.button>
                <motion.button
                  onClick={() => {
                    console.log('[DEBUG] Quick action clicked: See Examples');
                    handleSendMessage('See Examples');
                  }}
                  disabled={isAiLoading}
                  whileHover={!isAiLoading ? { scale: 1.05, y: -2 } : {}}
                  whileTap={!isAiLoading ? { scale: 0.95 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg bg-white shadow-soft hover:shadow-soft-lg font-medium transition-all inline-flex items-center gap-1.5 border border-blue-200"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="9" y1="9" x2="15" y2="9"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                  </svg>
                  <span>See Examples</span>
                </motion.button>
                <motion.button
                  onClick={() => {
                    console.log('[DEBUG] Quick action clicked: Help');
                    handleSendMessage('Help');
                  }}
                  disabled={isAiLoading}
                  whileHover={!isAiLoading ? { scale: 1.05, y: -2 } : {}}
                  whileTap={!isAiLoading ? { scale: 0.95 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg bg-white shadow-soft hover:shadow-soft-lg font-medium transition-all inline-flex items-center gap-1.5 border border-blue-200"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <span>Help</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Desktop Progress sidebar */}
        <div className="hidden lg:block w-80 bg-white shadow-soft-lg m-3 ml-0 rounded-xl overflow-y-auto flex-shrink-0">
          <div className="sticky top-0 bg-white p-4 border-b">
            <h2 className="font-semibold text-gray-900">Your Progress</h2>
          </div>
          <IdeationProgress 
            key={`progress-${blueprint.ideation.bigIdea}-${blueprint.ideation.essentialQuestion}-${blueprint.ideation.challenge}`}
            ideationData={blueprint.ideation}
            currentStep={currentStep}
            onEditStep={(step) => {
              setCurrentStep(step);
              // Show a message that we're ready to edit
              const editMessage = {
                role: 'assistant',
                chatResponse: `Let's refine your ${step === 'bigIdea' ? 'Big Idea' : step === 'essentialQuestion' ? 'Essential Question' : 'Challenge'}. 

Current value: "${ideationData[step]}"

What would you like to change it to?`,
                suggestions: ["Get new ideas", "I'll type a new one", "Keep it as is"],
                timestamp: Date.now()
              };
              setMessages(prev => [...prev, editMessage]);
            }}
          />
        </div>
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {showMobileSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black lg:hidden z-40"
              onClick={() => setShowMobileSidebar(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 lg:hidden overflow-y-auto"
            >
              <div className="sticky top-0 bg-white p-4 flex items-center justify-between border-b">
                <h2 className="font-semibold text-gray-900">Your Progress</h2>
                <button 
                  onClick={() => setShowMobileSidebar(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <IdeationProgress 
                ideationData={ideationData}
                currentStep={currentStep}
                onEditStep={(step) => {
              setCurrentStep(step);
              // Show a message that we're ready to edit
              const editMessage = {
                role: 'assistant',
                chatResponse: `Let's refine your ${step === 'bigIdea' ? 'Big Idea' : step === 'essentialQuestion' ? 'Essential Question' : 'Challenge'}. 

Current value: "${ideationData[step]}"

What would you like to change it to?`,
                suggestions: ["Get new ideas", "I'll type a new one", "Keep it as is"],
                timestamp: Date.now()
              };
              setMessages(prev => [...prev, editMessage]);
            }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
    </motion.div>
  );
};

export default ConversationalIdeationEnhanced;