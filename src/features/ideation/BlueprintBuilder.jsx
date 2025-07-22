// BlueprintBuilder.jsx - Structured state machine UI for Blueprint Builder v1.0

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBlueprint } from '../../context/BlueprintContext';
import BlueprintStateMachine, { BlueprintStates, DecisionChips } from './BlueprintStateMachine';
import * as Icons from '../../components/icons/ButtonIcons';

// Decision Chip Component
const DecisionChip = ({ chip, onClick, disabled = false }) => {
  const IconComponent = Icons[`${chip.icon}Icon`];
  
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-full
        border-2 transition-all duration-200
        ${disabled 
          ? 'opacity-50 cursor-not-allowed border-gray-300 bg-gray-100' 
          : 'border-blue-300 bg-white hover:bg-blue-50 hover:border-blue-400 cursor-pointer'
        }
      `}
      onClick={() => !disabled && onClick(chip.text)}
      disabled={disabled}
    >
      {IconComponent && <IconComponent className="w-4 h-4 text-blue-600" />}
      <span className="text-sm font-medium text-gray-700">{chip.text}</span>
    </motion.button>
  );
};

// Progress Meter Component
const ProgressMeter = ({ completed, total }) => {
  const percentage = (completed / total) * 100;
  
  return (
    <div className="bg-white rounded-xl p-4 shadow-soft">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">Progress</span>
        <span className="text-sm text-gray-500">{completed} / {total} fields</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div 
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

// Message Component
const Message = ({ role, content, chips, onChipClick }) => {
  const isUser = role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
        ${isUser ? 'bg-gray-200' : 'bg-blue-100'}
      `}>
        {isUser ? (
          <Icons.UserIcon className="w-4 h-4 text-gray-600" />
        ) : (
          <Icons.SparklesIcon className="w-4 h-4 text-blue-600" />
        )}
      </div>
      
      {/* Content */}
      <div className={`flex-1 max-w-2xl ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`
          rounded-2xl px-5 py-4
          ${isUser 
            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white' 
            : 'bg-white border border-gray-200 text-gray-800'
          }
        `}>
          <div 
            className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : ''}`}
            dangerouslySetInnerHTML={{ __html: formatContent(content) }}
          />
        </div>
        
        {/* Decision Chips */}
        {chips && chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {chips.map((chip, i) => (
              <DecisionChip 
                key={i} 
                chip={chip} 
                onClick={onChipClick}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Format content with markdown-like syntax
const formatContent = (content) => {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/###\s+(.*?)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/•/g, '&bull;')
    .replace(/\n/g, '<br />');
};

// Main Blueprint Builder Component
const BlueprintBuilder = ({ onComplete, onCancel }) => {
  const { updateBlueprint } = useBlueprint();
  const [stateMachine] = useState(() => new BlueprintStateMachine());
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const chatEndRef = useRef(null);
  
  // Initialize with first prompt
  useEffect(() => {
    const initialMessage = {
      role: 'assistant',
      content: stateMachine.getStatePrompt(),
      chips: stateMachine.getAvailableChips()
    };
    setMessages([initialMessage]);
  }, []);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle user input submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isProcessing) return;
    
    const input = userInput.trim();
    setUserInput('');
    setIsProcessing(true);
    
    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: input
    }]);
    
    // Process input through state machine
    const result = stateMachine.processInput(input);
    
    // Add response
    setTimeout(() => {
      if (result.success) {
        // Add confirmation message
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `*Saved!* **${stateMachine.currentState}** → **${input}**`
        }]);
        
        // Add next state prompt
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: result.prompt,
            chips: result.chips
          }]);
          
          // Update progress
          updateBlueprint(stateMachine.getBlueprint());
          
          // Check if complete
          if (stateMachine.currentState === BlueprintStates.PUBLISH) {
            // Format blueprint data for ideation context
            const blueprint = stateMachine.getBlueprint();
            const ideationData = {
              bigIdea: blueprint.bigIdea,
              essentialQuestion: blueprint.essentialQuestion,
              challenge: blueprint.challenge,
              // Include additional blueprint data
              phases: blueprint.phases,
              activities: blueprint.activities,
              resources: blueprint.resources,
              milestones: blueprint.milestones,
              rubric: blueprint.rubric,
              impactPlan: blueprint.impactPlan
            };
            setTimeout(() => onComplete(ideationData), 1000);
          }
        }, 500);
      } else {
        // Show error
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: result.message
        }]);
      }
      
      setIsProcessing(false);
    }, 300);
  };
  
  // Handle chip clicks
  const handleChipClick = (chipText) => {
    // Find the chip type from text
    const chipType = Object.values(DecisionChips)
      .find(chip => chip.text === chipText)?.text
      .replace(' ', '_')
      .toUpperCase();
    
    if (!chipType) return;
    
    // Add user action
    setMessages(prev => [...prev, {
      role: 'user',
      content: `[${chipText}]`
    }]);
    
    // Handle chip action
    const result = stateMachine.handleChip(chipType);
    
    // Add response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: Array.isArray(result) 
          ? result.map((item, i) => `${i + 1}. ${typeof item === 'string' ? item : `**${item.title}** - ${item.description}`}`).join('\n')
          : result,
        chips: stateMachine.getAvailableChips()
      }]);
    }, 300);
  };
  
  // Handle special inputs (Confirm, Edit, numbers)
  const handleSpecialInput = (input) => {
    if (stateMachine.currentState === BlueprintStates.ONBOARDING_CONFIRM) {
      if (input === 'Confirm') {
        handleSubmit({ preventDefault: () => {} });
      } else if (input === 'Edit') {
        setUserInput('Edit');
        handleSubmit({ preventDefault: () => {} });
      }
    }
  };
  
  const blueprint = stateMachine.getBlueprint();
  
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Blueprint Builder v1.0</h2>
            <p className="text-sm text-gray-600 mt-1">
              Creating your structured learning experience
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {messages.map((msg, i) => (
              <Message 
                key={i}
                role={msg.role}
                content={msg.content}
                chips={msg.chips}
                onChipClick={handleChipClick}
              />
            ))}
            
            {isProcessing && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Icons.SparklesIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="bg-white rounded-2xl px-5 py-4 shadow-soft">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>
          
          {/* Input Area */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white px-6 py-4">
            {/* Show special buttons for certain states */}
            {stateMachine.currentState === BlueprintStates.ONBOARDING_CONFIRM && (
              <div className="flex gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => handleSpecialInput('Confirm')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => handleSpecialInput('Edit')}
                  className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Edit
                </button>
              </div>
            )}
            
            <div className="flex gap-3">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your response..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isProcessing}
              />
              <button
                type="submit"
                disabled={!userInput.trim() || isProcessing}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Icons.SendIcon className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
        
        {/* Sidebar */}
        <div className="w-80 bg-white/50 backdrop-blur-sm border-l border-gray-200 p-6 overflow-y-auto">
          {/* Progress Meter */}
          <ProgressMeter 
            completed={blueprint.completedFields} 
            total={blueprint.totalRequiredFields} 
          />
          
          {/* Current Blueprint */}
          <div className="mt-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Your Blueprint</h3>
            
            {blueprint.subject && (
              <div className="bg-white rounded-lg p-3 shadow-soft">
                <span className="text-xs text-gray-500">Subject</span>
                <p className="font-medium">{blueprint.subject}</p>
              </div>
            )}
            
            {blueprint.ageGroup && (
              <div className="bg-white rounded-lg p-3 shadow-soft">
                <span className="text-xs text-gray-500">Age Group</span>
                <p className="font-medium">{blueprint.ageGroup}</p>
              </div>
            )}
            
            {blueprint.bigIdea && (
              <div className="bg-white rounded-lg p-3 shadow-soft">
                <span className="text-xs text-gray-500">Big Idea</span>
                <p className="font-medium">{blueprint.bigIdea}</p>
              </div>
            )}
            
            {blueprint.essentialQuestion && (
              <div className="bg-white rounded-lg p-3 shadow-soft">
                <span className="text-xs text-gray-500">Essential Question</span>
                <p className="font-medium">{blueprint.essentialQuestion}</p>
              </div>
            )}
            
            {blueprint.challenge && (
              <div className="bg-white rounded-lg p-3 shadow-soft">
                <span className="text-xs text-gray-500">Challenge</span>
                <p className="font-medium">{blueprint.challenge}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlueprintBuilder;