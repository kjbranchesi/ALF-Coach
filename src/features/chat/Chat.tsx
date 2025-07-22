import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WizardData } from '../wizard/wizardSchema';
import { BlueprintStateMachine, BlueprintStates, DecisionChips } from '../ideation/BlueprintStateMachine';
import { sendMessageToGemini } from '../../services/geminiService';
import { 
  SendIcon, 
  LightbulbIcon, 
  FileTextIcon, 
  HelpCircleIcon, 
  SkipForwardIcon,
  SparklesIcon
} from '../../components/icons/ButtonIcons';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  chips?: typeof DecisionChips[keyof typeof DecisionChips][];
}

interface ChatProps {
  wizardData: WizardData;
  blueprintId: string;
  chatHistory: ChatMessage[];
  onUpdateHistory: (history: ChatMessage[]) => void;
  onComplete: () => void;
}

const chipIcons = {
  Lightbulb: LightbulbIcon,
  FileText: FileTextIcon,
  HelpCircle: HelpCircleIcon,
  SkipForward: SkipForwardIcon
};

export function Chat({ wizardData, blueprintId, chatHistory, onUpdateHistory, onComplete }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(chatHistory);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stateMachine] = useState(() => new BlueprintStateMachine());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize state machine with wizard data
  useEffect(() => {
    stateMachine.blueprint.motivation = wizardData.motivation;
    stateMachine.blueprint.subject = wizardData.subject;
    stateMachine.blueprint.ageGroup = wizardData.ageGroup;
    stateMachine.blueprint.location = wizardData.location || '';
    stateMachine.blueprint.materials = wizardData.materials?.split(', ') || [];
    stateMachine.blueprint.scope = wizardData.scope.charAt(0).toUpperCase() + wizardData.scope.slice(1);
    stateMachine.blueprint.completedFields = 4;
    
    // Move to ideation phase
    stateMachine.currentState = BlueprintStates.IDEATION_BIG_IDEA;
    
    // Add initial message if no history
    if (messages.length === 0) {
      const initialMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: stateMachine.getStatePrompt(),
        timestamp: new Date(),
        chips: stateMachine.getAvailableChips()
      };
      setMessages([initialMessage]);
      onUpdateHistory([initialMessage]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (messageText: string = input) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Process input through state machine
      const result = stateMachine.processInput(messageText);
      
      let assistantContent = '';
      let availableChips = stateMachine.getAvailableChips();

      if (result.success) {
        assistantContent = result.prompt || stateMachine.getStatePrompt();
        availableChips = result.chips || availableChips;
      } else {
        assistantContent = result.message || 'Please try again.';
      }

      // Check if blueprint is complete
      if (stateMachine.currentState === BlueprintStates.PUBLISH) {
        assistantContent += '\n\n✨ Your blueprint is complete! You can now start building your project.';
        setTimeout(() => {
          onComplete();
        }, 3000);
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        chips: availableChips
      };

      const newHistory = [...messages, userMessage, assistantMessage];
      setMessages(newHistory);
      onUpdateHistory(newHistory);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleChipClick = (chip: typeof DecisionChips[keyof typeof DecisionChips]) => {
    let response;
    
    switch (chip.text) {
      case 'Get Ideas':
        response = stateMachine.handleChip('GET_IDEAS');
        break;
      case 'See Examples':
        response = stateMachine.handleChip('SEE_EXAMPLES');
        break;
      case 'Help':
        response = stateMachine.handleChip('HELP');
        break;
      case 'Skip':
        response = stateMachine.handleChip('SKIP');
        break;
    }

    if (response) {
      handleSendMessage(chip.text);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-t-xl shadow-sm p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Blueprint Builder</h1>
            <p className="text-sm text-slate-600 mt-1">
              Creating your {wizardData.subject} {wizardData.scope} • {stateMachine.updateProgress()}
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
            <SparklesIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              {stateMachine.currentState.replace(/_/g, ' ').toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white p-6 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => {
            const IconComponent = message.role === 'assistant' ? SparklesIcon : null;
            
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <SparklesIcon className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className={`
                  max-w-[70%] rounded-lg p-4
                  ${message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white shadow-soft border border-gray-100'
                  }
                `}>
                  <p className={`whitespace-pre-wrap ${message.role === 'assistant' ? 'text-gray-800' : ''}`}>
                    {message.content}
                  </p>
                  
                  {message.chips && message.chips.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {message.chips.map((chip, index) => {
                        const ChipIcon = chipIcons[chip.icon as keyof typeof chipIcons];
                        
                        return (
                          <motion.button
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleChipClick(chip)}
                            disabled={isLoading}
                            className="
                              flex items-center gap-2 px-4 py-2 rounded-full
                              bg-gray-100 hover:bg-gray-200 text-gray-700
                              transition-all duration-200 text-sm
                              disabled:opacity-50 disabled:cursor-not-allowed
                            "
                          >
                            {ChipIcon && <ChipIcon className="w-4 h-4" />}
                            {chip.text}
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {wizardData.subject.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <SparklesIcon className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div className="bg-white shadow-soft border border-gray-100 rounded-lg p-4">
              <div className="flex space-x-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Type your response..."
            className="
              flex-1 px-4 py-3 rounded-lg border-2 border-gray-200
              focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
              disabled:bg-gray-50 disabled:text-gray-500
              transition-all duration-200
            "
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="
              px-6 py-3 rounded-lg bg-blue-600 text-white
              hover:bg-blue-700 disabled:bg-gray-300
              disabled:cursor-not-allowed transition-all duration-200
              flex items-center gap-2
            "
          >
            <SendIcon className="w-5 h-5" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}