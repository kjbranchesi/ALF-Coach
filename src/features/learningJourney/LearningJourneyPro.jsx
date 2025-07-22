// LearningJourneyPro.jsx - Learning Journey stage with phases, activities, and resources

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useBlueprint } from '../../context/BlueprintContext';
import { DecisionTreeOptions, ValidationRules } from '../../context/BlueprintSchema';
import { generateJsonResponse } from '../../services/geminiService';
import { renderMarkdown } from '../../lib/markdown.ts';

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
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Activity: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  Link: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  ),
  Drag: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="5" r="1"/>
      <circle cx="12" cy="12" r="1"/>
      <circle cx="12" cy="19" r="1"/>
      <circle cx="19" cy="5" r="1"/>
      <circle cx="19" cy="12" r="1"/>
      <circle cx="19" cy="19" r="1"/>
      <circle cx="5" cy="5" r="1"/>
      <circle cx="5" cy="12" r="1"/>
      <circle cx="5" cy="19" r="1"/>
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Send: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  )
};

// Phase Card Component
const PhaseCard = ({ phase, activities = [], onAddActivity, onEditPhase, onDeletePhase, isEditing }) => {
  const [showActivities, setShowActivities] = useState(true);
  const [newActivity, setNewActivity] = useState('');

  const handleAddActivity = () => {
    if (newActivity.trim()) {
      onAddActivity(phase.id, newActivity.trim());
      setNewActivity('');
    }
  };

  return (
    <motion.div
      layout
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          {isEditing && <Icons.Drag className="text-gray-400 cursor-move" />}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{phase.name}</h3>
            <p className="text-sm text-gray-600">{phase.duration || 'Duration not set'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowActivities(!showActivities)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points={showActivities ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}/>
            </svg>
          </button>
          {isEditing && (
            <button
              onClick={() => onDeletePhase(phase.id)}
              className="p-1 hover:bg-red-50 text-red-600 rounded transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showActivities && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-2"
          >
            {activities.map((activity, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <Icons.Activity className="text-blue-600 flex-shrink-0" />
                <span className="text-sm text-gray-700 flex-1">{activity}</span>
              </div>
            ))}
            
            {isEditing && (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddActivity()}
                  placeholder="Add an activity..."
                  className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddActivity}
                  disabled={!newActivity.trim()}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icons.Plus />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Resource Item Component
const ResourceItem = ({ resource, onRemove }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
  >
    <Icons.Link className="text-blue-600 flex-shrink-0" />
    <div className="flex-1">
      <a 
        href={resource.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
      >
        {resource.title}
      </a>
      {resource.type && (
        <span className="ml-2 text-xs text-gray-500">({resource.type})</span>
      )}
    </div>
    {onRemove && (
      <button
        onClick={() => onRemove(resource.id)}
        className="p-1 hover:bg-red-50 text-red-600 rounded transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    )}
  </motion.div>
);

// Main Component
const LearningJourneyPro = ({ projectInfo, onComplete, onCancel }) => {
  const {
    blueprint,
    updateLearningJourney,
    markStepComplete,
    skipStep,
    generateTimelineOutline
  } = useBlueprint();

  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isEditingPhases, setIsEditingPhases] = useState(false);
  const [phases, setPhases] = useState(blueprint.learningJourney.phases || []);
  const [activities, setActivities] = useState(blueprint.learningJourney.activities || {});
  const [resources, setResources] = useState(blueprint.learningJourney.resources || []);
  const [currentFocus, setCurrentFocus] = useState('phases'); // phases, activities, resources
  
  const chatEndRef = useRef(null);

  // Check completion status
  const checkCompletion = useCallback(() => {
    const hasEnoughPhases = phases.length >= ValidationRules.phases.min;
    const allPhasesHaveActivities = phases.every(phase => 
      activities[phase.id] && activities[phase.id].length >= ValidationRules.activities.minPerPhase
    );
    
    return hasEnoughPhases && allPhasesHaveActivities;
  }, [phases, activities]);

  // Save journey data
  const saveJourneyData = useCallback(() => {
    updateLearningJourney({
      phases,
      activities,
      resources
    });
  }, [phases, activities, resources, updateLearningJourney]);

  // Add phase
  const addPhase = useCallback((phaseName, duration = '') => {
    const newPhase = {
      id: Date.now().toString(),
      name: phaseName,
      order: phases.length + 1,
      duration
    };
    setPhases(prev => [...prev, newPhase]);
    setActivities(prev => ({ ...prev, [newPhase.id]: [] }));
  }, [phases]);

  // Delete phase
  const deletePhase = useCallback((phaseId) => {
    setPhases(prev => prev.filter(p => p.id !== phaseId));
    setActivities(prev => {
      const newActivities = { ...prev };
      delete newActivities[phaseId];
      return newActivities;
    });
  }, []);

  // Add activity to phase
  const addActivity = useCallback((phaseId, activity) => {
    setActivities(prev => ({
      ...prev,
      [phaseId]: [...(prev[phaseId] || []), activity]
    }));
  }, []);

  // Add resource
  const addResource = useCallback((resource) => {
    const newResource = {
      id: Date.now().toString(),
      ...resource,
      addedAt: new Date().toISOString()
    };
    setResources(prev => [...prev, newResource]);
  }, []);

  // Remove resource
  const removeResource = useCallback((resourceId) => {
    setResources(prev => prev.filter(r => r.id !== resourceId));
  }, []);

  // Handle reordering phases
  const handleReorder = (newOrder) => {
    setPhases(newOrder.map((phase, index) => ({ ...phase, order: index + 1 })));
  };

  // Handle AI conversation
  const handleSendMessage = async (messageContent = userInput) => {
    if (!messageContent.trim() || isAiLoading) return;

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
      // Build context
      const context = {
        projectInfo,
        ideation: blueprint.ideation,
        currentPhases: phases,
        currentActivities: activities,
        currentResources: resources,
        currentFocus
      };

      let systemPrompt = `You are helping design the learning journey for a ${projectInfo.subject} project.
Big Idea: ${blueprint.ideation.bigIdea}
Essential Question: ${blueprint.ideation.essentialQuestion}
Challenge: ${blueprint.ideation.challenge}
Current focus: ${currentFocus}`;

      // Handle commands
      let instruction = '';
      if (messageContent === 'Suggest Sequence') {
        instruction = 'Suggest a logical sequence of 3-5 phases for this project.';
      } else if (messageContent.startsWith('/examples')) {
        instruction = 'Provide 3 example activities for the current phase.';
      } else if (messageContent === 'Local Examples' && projectInfo.location) {
        instruction = `Suggest local resources and examples from ${projectInfo.location} area.`;
      }

      // Get AI response
      const response = await generateJsonResponse(
        [{ role: 'user', parts: [{ text: messageContent }] }],
        systemPrompt + '\n' + instruction
      );

      // Process response
      const aiMessage = {
        role: 'assistant',
        content: response.chatResponse || response.message || 'Let me help you with that.',
        suggestions: response.suggestions,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Handle phase suggestions
      if (response.phaseSuggestions) {
        response.phaseSuggestions.forEach(phase => {
          addPhase(phase.name, phase.duration);
        });
      }

      // Handle activity suggestions
      if (response.activitySuggestions && response.targetPhaseId) {
        response.activitySuggestions.forEach(activity => {
          addActivity(response.targetPhaseId, activity);
        });
      }

      // Handle resource suggestions
      if (response.resourceSuggestions) {
        response.resourceSuggestions.forEach(resource => {
          addResource(resource);
        });
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

  // Handle stage completion
  const handleComplete = useCallback(() => {
    saveJourneyData();
    const outline = generateTimelineOutline();
    updateLearningJourney({ deliverable: outline });
    markStepComplete('learning-journey');
    onComplete();
  }, [saveJourneyData, generateTimelineOutline, updateLearningJourney, markStepComplete, onComplete]);

  // Auto-save on changes
  useEffect(() => {
    const timer = setTimeout(() => {
      saveJourneyData();
    }, 1000);
    return () => clearTimeout(timer);
  }, [phases, activities, resources, saveJourneyData]);

  // Initialize conversation
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = {
        role: 'assistant',
        content: `Let's map out the learning journey for your ${projectInfo.subject} project!

We'll break it into **3-5 phases**, each with **key activities** and **resources**.

Start by adding your phases - what are the major stages of this project?`,
        timestamp: Date.now()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isComplete = checkCompletion();

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">Learning Journey</h1>
            <div className="flex items-center gap-2 text-sm">
              <span className={`px-3 py-1 rounded-full ${
                phases.length >= ValidationRules.phases.min ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {phases.length} / {ValidationRules.phases.min} phases
              </span>
              <span className={`px-3 py-1 rounded-full ${
                isComplete ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {isComplete ? '✓ Ready' : 'In progress'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isComplete && (
              <button
                onClick={handleComplete}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                         font-medium transition-colors"
              >
                Complete Journey
              </button>
            )}
            <button
              onClick={onCancel}
              className="text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Phases & Resources */}
        <div className="w-1/2 flex flex-col bg-white m-4 rounded-xl shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b">
            <button
              onClick={() => setCurrentFocus('phases')}
              className={`flex-1 px-4 py-3 font-medium transition-colors ${
                currentFocus === 'phases' 
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Phases Timeline
            </button>
            <button
              onClick={() => setCurrentFocus('resources')}
              className={`flex-1 px-4 py-3 font-medium transition-colors ${
                currentFocus === 'resources' 
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Resources
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {currentFocus === 'phases' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Project Phases</h3>
                  <button
                    onClick={() => setIsEditingPhases(!isEditingPhases)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {isEditingPhases ? 'Done Editing' : 'Edit Phases'}
                  </button>
                </div>

                {isEditingPhases ? (
                  <Reorder.Group values={phases} onReorder={handleReorder} className="space-y-3">
                    {phases.map(phase => (
                      <Reorder.Item key={phase.id} value={phase}>
                        <PhaseCard
                          phase={phase}
                          activities={activities[phase.id] || []}
                          onAddActivity={addActivity}
                          onDeletePhase={deletePhase}
                          isEditing={isEditingPhases}
                        />
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                ) : (
                  <div className="space-y-3">
                    {phases.map(phase => (
                      <PhaseCard
                        key={phase.id}
                        phase={phase}
                        activities={activities[phase.id] || []}
                        onAddActivity={addActivity}
                        onDeletePhase={deletePhase}
                        isEditing={false}
                      />
                    ))}
                  </div>
                )}

                {isEditingPhases && (
                  <button
                    onClick={() => {
                      const phaseName = prompt('Enter phase name:');
                      if (phaseName) addPhase(phaseName);
                    }}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg
                             hover:border-blue-400 hover:bg-blue-50 transition-colors
                             flex items-center justify-center gap-2 text-gray-600"
                  >
                    <Icons.Plus />
                    Add Phase
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Resources & Support</h3>
                  <button
                    onClick={() => {
                      const url = prompt('Enter resource URL:');
                      if (url) {
                        const title = prompt('Enter resource title:') || url;
                        addResource({ url, title, type: 'link' });
                      }
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Icons.Plus />
                    Add Resource
                  </button>
                </div>

                <div className="space-y-2">
                  <AnimatePresence>
                    {resources.map(resource => (
                      <ResourceItem
                        key={resource.id}
                        resource={resource}
                        onRemove={removeResource}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {resources.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Icons.Link className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>No resources added yet</p>
                    <p className="text-sm mt-1">Add links, readings, or expert contacts</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Chat */}
        <div className="flex-1 flex flex-col m-4 ml-0">
          {/* Chat Messages */}
          <div className="flex-1 bg-white rounded-xl shadow-lg overflow-y-auto p-4 mb-4">
            <div className="space-y-4">
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
              
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-3 mb-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSendMessage('Suggest Sequence')}
                disabled={isAiLoading}
                className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 
                         text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Icons.Calendar className="inline mr-1" />
                Suggest Sequence
              </button>
              <button
                onClick={() => handleSendMessage('/examples')}
                disabled={isAiLoading}
                className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 
                         text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Icons.Activity className="inline mr-1" />
                Activity Examples
              </button>
              {projectInfo.location && (
                <button
                  onClick={() => handleSendMessage('Local Examples')}
                  disabled={isAiLoading}
                  className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 
                           text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <Icons.Link className="inline mr-1" />
                  Local Examples
                </button>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-white rounded-xl shadow-lg p-3">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Icons.User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Ask about phases, activities, or resources..."
                  disabled={isAiLoading}
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none 
                           focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
        </div>
      </div>
    </div>
  );
};

// Message component
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
        isUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
      }`}>
        <div 
          className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : ''}`}
          dangerouslySetInnerHTML={renderMarkdown(message.content)}
        />
      </div>
    </div>
  </div>
);

export default LearningJourneyPro;