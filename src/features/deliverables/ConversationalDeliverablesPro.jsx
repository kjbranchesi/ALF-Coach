// src/features/deliverables/ConversationalDeliverablesPro.jsx
// Professional UI for generating comprehensive course deliverables

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StageHeader from '../../components/StageHeader.jsx';
import DeliverablesProgress from './DeliverablesProgress.jsx';
import { PROJECT_STAGES } from '../../config/constants.js';
import { generateJsonResponse } from '../../services/geminiService.js';
import { conversationalDeliverablesPrompts } from '../../ai/promptTemplates/conversationalDeliverables.js';
import { useConversationRecovery } from '../../hooks/useConversationRecovery.js';
import { renderMarkdown } from '../../lib/markdown.ts';
import { titleCase, formatAgeGroup, getPedagogicalContext } from '../../lib/textUtils.ts';
import { ProgressionEngine } from '../../utils/ProgressionEngine.js';
import { getFrameworkBuilder } from '../../utils/ComprehensiveFrameworkBuilder.js';

// Icons
const Icons = {
  Bot: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="10" rx="2" ry="2"/>
      <circle cx="12" cy="5" r="2"/>
      <path d="M12 7v4"/>
    </svg>
  ),
  Send: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  Document: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  Rubric: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <line x1="9" y1="3" x2="9" y2="21"/>
      <line x1="15" y1="3" x2="15" y2="21"/>
      <line x1="3" y1="9" x2="21" y2="9"/>
      <line x1="3" y1="15" x2="21" y2="15"/>
    </svg>
  ),
  Download: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  Menu: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  X: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
};

// Deliverables progress indicator
const DeliverablesStageProgress = ({ currentStep, deliverablesData }) => {
  const steps = [
    { key: 'syllabus', label: 'Syllabus', icon: Icons.Document, complete: !!deliverablesData.syllabus?.courseInfo },
    { key: 'curriculum', label: 'Curriculum', icon: Icons.Document, complete: !!deliverablesData.curriculum?.units?.length },
    { key: 'rubric', label: 'Rubric', icon: Icons.Rubric, complete: !!deliverablesData.rubric?.criteria?.length },
    { key: 'finalize', label: 'Finalize', icon: Icons.Check, complete: !!deliverablesData.isComplete }
  ];

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-sm">
      {steps.map((step, index) => {
        const isActive = currentStep === step.key;
        const Icon = step.icon;

        return (
          <React.Fragment key={step.key}>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-md transition-all ${
              isActive ? 'bg-white shadow-sm text-gray-900' : 
              step.complete ? 'text-green-600' : 'text-gray-400'
            }`}>
              <Icon />
              <span className="font-medium">{step.label}</span>
              {step.complete && <Icons.Check />}
            </div>
            {index < steps.length - 1 && <Icons.ChevronRight />}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Preview component for generated materials
const MaterialPreview = ({ type, content, onEdit }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gray-50 rounded-lg p-4 mb-4"
  >
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
        {type === 'syllabus' && <><Icons.Document /> Course Syllabus</>}
        {type === 'curriculum' && <><Icons.Document /> Curriculum Map</>}
        {type === 'rubric' && <><Icons.Rubric /> Assessment Rubric</>}
      </h3>
      <button
        onClick={onEdit}
        className="text-sm text-purple-600 hover:text-purple-700"
      >
        Edit
      </button>
    </div>
    <div className="prose prose-sm max-w-none text-gray-700">
      {typeof content === 'string' ? (
        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
      ) : (
        <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(content, null, 2)}</pre>
      )}
    </div>
  </motion.div>
);

const ConversationalDeliverablesPro = ({ projectInfo, ideationData, journeyData, onComplete, onCancel }) => {
  // State management
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [deliverablesData, setDeliverablesData] = useState({
    courseAbstract: '',
    syllabus: {},
    curriculum: {},
    rubric: {},
    isComplete: false
  });
  const [currentStep, setCurrentStep] = useState('syllabus');
  const [isInitialized, setIsInitialized] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const progressionEngine = useRef(new ProgressionEngine('Deliverables', 'syllabus'));
  const frameworkBuilder = useRef(getFrameworkBuilder());

  // Complete project context
  const projectContext = useMemo(() => ({
    ...projectInfo,
    ...ideationData,
    ...journeyData,
    pedagogical: getPedagogicalContext(projectInfo.ageGroup || '')
  }), [projectInfo, ideationData, journeyData]);

  // Conversation recovery
  const { saveCheckpoint } = useConversationRecovery(
    { deliverablesData, currentStep, messages },
    setMessages,
    'Deliverables'
  );

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize conversation
  useEffect(() => {
    if (!isInitialized && projectInfo && ideationData && journeyData) {
      initializeConversation();
      setIsInitialized(true);
    }
  }, [isInitialized, projectInfo, ideationData, journeyData]);

  const initializeConversation = async () => {
    setIsAiLoading(true);
    
    try {
      // Generate initial course abstract
      const abstract = frameworkBuilder.current.generateCourseAbstract();
      setDeliverablesData(prev => ({ ...prev, courseAbstract: abstract }));

      const welcomeMessage = `Excellent! Now let's create your comprehensive course materials. 

**Your Project Foundation:**
- **${ideationData.bigIdea}**
- **"${ideationData.essentialQuestion}"**
- **${ideationData.challenge}**

**Your Learning Journey:**
- ${journeyData.milestones?.length || 0} milestones mapped
- ${journeyData.activities?.length || 0} learning activities designed
- Assessment strategies defined

Let's start with your **course syllabus**. I've drafted an initial course description:

*${abstract}*

How would you like to refine this description? Or shall we proceed with the learning objectives?`;

      const aiMessage = {
        role: 'assistant',
        chatResponse: welcomeMessage,
        currentStep: 'syllabus',
        suggestions: ['Keep this description', 'Refine the description', 'Add specific details'],
        timestamp: Date.now()
      };

      setMessages([aiMessage]);
    } catch (error) {
      console.error('Init error:', error);
    }
    
    setIsAiLoading(false);
  };

  // Generate comprehensive materials
  const generateMaterials = useCallback((type) => {
    const builder = frameworkBuilder.current;
    
    switch (type) {
      case 'syllabus':
        return builder.generateSyllabus();
      case 'curriculum':
        return builder.generateCurriculum();
      case 'rubric':
        return builder.generateRubric();
      default:
        return null;
    }
  }, []);

  // Handle message sending
  const handleSendMessage = async (messageContent = userInput) => {
    if (!messageContent.trim() || isAiLoading) return;
    
    if (messageContent === userInput) {
      setUserInput('');
    }

    // Add user message
    const userMessage = {
      role: 'user',
      chatResponse: messageContent,
      timestamp: Date.now()
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    
    setIsAiLoading(true);

    try {
      // Build chat history
      const chatHistory = newMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.chatResponse || '' }]
      }));

      // Handle quick actions
      let dynamicInstruction = '';
      if (messageContent === 'Keep this description') {
        dynamicInstruction = 'Move to learning objectives for the syllabus';
      } else if (messageContent === 'Generate Full Syllabus') {
        const syllabus = generateMaterials('syllabus');
        setDeliverablesData(prev => ({ ...prev, syllabus }));
        dynamicInstruction = 'Present the generated syllabus and move to curriculum';
      }

      // Get AI response
      const systemPrompt = conversationalDeliverablesPrompts.systemPrompt(
        projectInfo, 
        ideationData, 
        journeyData, 
        deliverablesData
      );
      const stepPrompt = conversationalDeliverablesPrompts.stepPrompts[currentStep]?.(
        projectInfo, 
        deliverablesData
      ) || '';
      
      const response = await generateJsonResponse(
        chatHistory, 
        systemPrompt + '\n' + stepPrompt + '\n' + dynamicInstruction
      );

      // Process response
      const aiMessage = {
        role: 'assistant',
        chatResponse: response.chatResponse,
        suggestions: response.suggestions,
        currentStep: response.currentStep || currentStep,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      if (response.deliverablesProgress) {
        setDeliverablesData(response.deliverablesProgress);
        
        // Update framework builder
        frameworkBuilder.current.updateFromDeliverables(response.deliverablesProgress);
      }
      
      if (response.currentStep && response.currentStep !== currentStep) {
        setCurrentStep(response.currentStep);
        
        // Auto-generate materials when moving to new step
        if (response.currentStep === 'curriculum' && !deliverablesData.curriculum?.units) {
          const curriculum = generateMaterials('curriculum');
          setDeliverablesData(prev => ({ ...prev, curriculum }));
        } else if (response.currentStep === 'rubric' && !deliverablesData.rubric?.criteria) {
          const rubric = generateMaterials('rubric');
          setDeliverablesData(prev => ({ ...prev, rubric }));
        }
      }

      if (response.isStageComplete) {
        const completeFramework = frameworkBuilder.current.exportFramework();
        setTimeout(() => onComplete(completeFramework), 2000);
      }

      saveCheckpoint({
        deliverablesData: response.deliverablesProgress || deliverablesData,
        currentStep: response.currentStep || currentStep,
        messages: [...newMessages, aiMessage]
      });

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant',
        chatResponse: "Let me help you finalize your course materials.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsAiLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Export functions
  const exportMaterial = (type) => {
    const material = deliverablesData[type];
    const blob = new Blob([JSON.stringify(material, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ideationData.bigIdea.replace(/\s+/g, '_')}_${type}.json`;
    a.click();
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-semibold text-gray-900">Project Design: Course Materials</h1>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Icons.Menu />
              </button>
              <button 
                onClick={onCancel}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Exit
              </button>
            </div>
          </div>
          <DeliverablesStageProgress currentStep={currentStep} deliverablesData={deliverablesData} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat and preview area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-4">
              <div className="space-y-6">
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Icons.Bot />
                      </div>
                    )}
                    <div className={`max-w-[80%] md:max-w-[70%]`}>
                      <div className={`rounded-2xl px-4 py-2 ${
                        msg.role === 'user' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
                      }`}>
                        <div 
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.chatResponse) }}
                        />
                      </div>
                      
                      {/* Suggestions */}
                      {msg.suggestions && msg.suggestions.length > 0 && index === messages.length - 1 && (
                        <motion.div className="mt-3 space-y-2">
                          {msg.suggestions.map((suggestion, i) => (
                            <button
                              key={i}
                              onClick={() => handleSendMessage(suggestion)}
                              disabled={isAiLoading}
                              className="block w-full text-left px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all text-sm disabled:opacity-50"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {isAiLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Icons.Bot />
                    </div>
                    <div className="bg-gray-100 rounded-2xl px-4 py-2">
                      <div className="flex gap-1">
                        <motion.div className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity }} />
                        <motion.div className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, delay: 0.2, repeat: Infinity }} />
                        <motion.div className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, delay: 0.4, repeat: Infinity }} />
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Material previews */}
              {showPreview && (
                <div className="mt-8">
                  {deliverablesData.syllabus?.courseInfo && (
                    <MaterialPreview
                      type="syllabus"
                      content={deliverablesData.syllabus}
                      onEdit={() => handleSendMessage('Edit syllabus')}
                    />
                  )}
                  {deliverablesData.curriculum?.units && (
                    <MaterialPreview
                      type="curriculum"
                      content={deliverablesData.curriculum}
                      onEdit={() => handleSendMessage('Edit curriculum')}
                    />
                  )}
                  {deliverablesData.rubric?.criteria && (
                    <MaterialPreview
                      type="rubric"
                      content={deliverablesData.rubric}
                      onEdit={() => handleSendMessage('Edit rubric')}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Input area */}
          <div className="border-t border-gray-200">
            <div className="max-w-4xl mx-auto p-4">
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Provide feedback or request changes..."
                  disabled={isAiLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!userInput.trim() || isAiLoading}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icons.Send />
                </button>
              </div>
              
              {/* Quick actions */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleSendMessage('Generate Full Syllabus')}
                  disabled={isAiLoading || currentStep !== 'syllabus'}
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-100"
                >
                  📄 Generate Syllabus
                </button>
                <button
                  onClick={() => handleSendMessage('Generate Curriculum Map')}
                  disabled={isAiLoading || currentStep !== 'curriculum'}
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-100"
                >
                  🗺️ Generate Curriculum
                </button>
                <button
                  onClick={() => handleSendMessage('Generate Rubric')}
                  disabled={isAiLoading || currentStep !== 'rubric'}
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-100"
                >
                  📊 Generate Rubric
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Deliverables sidebar */}
        <div className="hidden lg:block w-80 border-l border-gray-200 bg-gray-50 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900">Your Progress</h2>
          </div>
          <DeliverablesProgress 
            deliverablesData={deliverablesData}
            currentStep={currentStep}
            ideationData={ideationData}
            journeyData={journeyData}
          />
          
          {/* Export options */}
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Export Materials
            </h3>
            <div className="space-y-2">
              {deliverablesData.syllabus?.courseInfo && (
                <button
                  onClick={() => exportMaterial('syllabus')}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm"
                >
                  <span>Syllabus</span>
                  <Icons.Download />
                </button>
              )}
              {deliverablesData.curriculum?.units && (
                <button
                  onClick={() => exportMaterial('curriculum')}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm"
                >
                  <span>Curriculum Map</span>
                  <Icons.Download />
                </button>
              )}
              {deliverablesData.rubric?.criteria && (
                <button
                  onClick={() => exportMaterial('rubric')}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm"
                >
                  <span>Rubric</span>
                  <Icons.Download />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
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
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Your Progress</h2>
                <button 
                  onClick={() => setShowMobileSidebar(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Icons.X />
                </button>
              </div>
              <DeliverablesProgress 
                deliverablesData={deliverablesData}
                currentStep={currentStep}
                ideationData={ideationData}
                journeyData={journeyData}
              />
              
              {/* Export options */}
              <div className="p-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Export Materials
                </h3>
                <div className="space-y-2">
                  {deliverablesData.syllabus?.courseInfo && (
                    <button
                      onClick={() => exportMaterial('syllabus')}
                      className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm"
                    >
                      <span>Syllabus</span>
                      <Icons.Download />
                    </button>
                  )}
                  {deliverablesData.curriculum?.units && (
                    <button
                      onClick={() => exportMaterial('curriculum')}
                      className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm"
                    >
                      <span>Curriculum Map</span>
                      <Icons.Download />
                    </button>
                  )}
                  {deliverablesData.rubric?.criteria && (
                    <button
                      onClick={() => exportMaterial('rubric')}
                      className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm"
                    >
                      <span>Rubric</span>
                      <Icons.Download />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConversationalDeliverablesPro;