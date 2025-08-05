// AuthenticDeliverablesPro.jsx - Authentic Deliverables stage with milestones, rubric, and impact plan

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Calendar: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Grid: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  Megaphone: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 11l19-9v20L3 13V11z"/>
      <path d="M8.5 16.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5"/>
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Send: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  )
};

// Milestone Card
const MilestoneCard = ({ milestone, onEdit, onDelete }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">{milestone.title}</h4>
        <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
        {milestone.dueDate && (
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
            <Icons.Calendar />
            <span>{new Date(milestone.dueDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => onEdit(milestone)}
          className="p-1 hover:bg-gray-100 rounded text-gray-600"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button
          onClick={() => onDelete(milestone.id)}
          className="p-1 hover:bg-red-50 rounded text-red-600"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  </motion.div>
);

// Rubric Builder Component
const RubricBuilder = ({ rubric, onUpdate }) => {
  const [editingCell, setEditingCell] = useState(null);

  const handleCellEdit = (criteriaId, levelIndex, value) => {
    const updatedCriteria = rubric.criteria.map(c => 
      c.id === criteriaId 
        ? {
            ...c,
            levels: c.levels.map((l, i) => 
              i === levelIndex ? { ...l, description: value } : l
            )
          }
        : c
    );
    onUpdate({ ...rubric, criteria: updatedCriteria });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Assessment Rubric</h3>
        <button
          onClick={() => {
            const newCriteria = {
              id: Date.now().toString(),
              name: 'New Criteria',
              weight: 25,
              levels: [
                { level: 1, description: '', points: 25 },
                { level: 2, description: '', points: 50 },
                { level: 3, description: '', points: 75 },
                { level: 4, description: '', points: 100 }
              ]
            };
            onUpdate({
              ...rubric,
              criteria: [...rubric.criteria, newCriteria]
            });
          }}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <Icons.Plus />
          Add Criteria
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-50 text-left">Criteria</th>
              <th className="border p-2 bg-gray-50">Beginning (1)</th>
              <th className="border p-2 bg-gray-50">Developing (2)</th>
              <th className="border p-2 bg-gray-50">Proficient (3)</th>
              <th className="border p-2 bg-gray-50">Advanced (4)</th>
            </tr>
          </thead>
          <tbody>
            {rubric.criteria.map(criteria => (
              <tr key={criteria.id}>
                <td className="border p-2 font-medium">{criteria.name}</td>
                {criteria.levels.map((level, index) => (
                  <td key={index} className="border p-2">
                    {editingCell === `${criteria.id}-${index}` ? (
                      <textarea
                        autoFocus
                        className="w-full p-1 text-sm border rounded"
                        value={level.description}
                        onChange={(e) => handleCellEdit(criteria.id, index, e.target.value)}
                        onBlur={() => setEditingCell(null)}
                        onKeyPress={(e) => e.key === 'Enter' && setEditingCell(null)}
                      />
                    ) : (
                      <div
                        onClick={() => setEditingCell(`${criteria.id}-${index}`)}
                        className="cursor-pointer text-sm text-gray-700 hover:bg-gray-50 p-1 rounded min-h-[50px]"
                      >
                        {level.description || 'Click to edit...'}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Impact Plan Component
const ImpactPlan = ({ plan, onUpdate }) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <h3 className="font-semibold text-gray-900 mb-4">Impact Plan</h3>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Authentic Audience
        </label>
        <input
          type="text"
          value={plan.audience}
          onChange={(e) => onUpdate({ ...plan, audience: e.target.value })}
          placeholder="e.g., Local city council, Parents, Industry experts..."
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sharing Method
        </label>
        <select
          value={plan.method}
          onChange={(e) => onUpdate({ ...plan, method: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select method...</option>
          <option value="presentation">Live Presentation</option>
          <option value="exhibition">Public Exhibition</option>
          <option value="publication">Online Publication</option>
          <option value="workshop">Community Workshop</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Target Date
        </label>
        <input
          type="date"
          value={plan.date ? plan.date.split('T')[0] : ''}
          onChange={(e) => onUpdate({ ...plan, date: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={plan.description}
          onChange={(e) => onUpdate({ ...plan, description: e.target.value })}
          placeholder="Describe how students will share their work..."
          rows="3"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  </div>
);

// Main Component
const AuthenticDeliverablesPro = ({ projectInfo, onComplete, onCancel }) => {
  const {
    blueprint,
    updateAuthenticDeliverables,
    markStepComplete,
    skipStep
  } = useBlueprint();

  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('milestones');
  
  const chatEndRef = useRef(null);
  const deliverables = blueprint.authenticDeliverables;

  // Handle milestone management
  const addMilestone = (milestone) => {
    updateAuthenticDeliverables({
      milestones: [...deliverables.milestones, {
        id: Date.now().toString(),
        ...milestone,
        createdAt: new Date().toISOString()
      }]
    });
  };

  const updateMilestone = (milestoneId, updates) => {
    updateAuthenticDeliverables({
      milestones: deliverables.milestones.map(m => 
        m.id === milestoneId ? { ...m, ...updates } : m
      )
    });
  };

  const deleteMilestone = (milestoneId) => {
    updateAuthenticDeliverables({
      milestones: deliverables.milestones.filter(m => m.id !== milestoneId)
    });
  };

  // Handle rubric updates
  const updateRubric = (rubricData) => {
    updateAuthenticDeliverables({ rubric: rubricData });
  };

  // Handle impact plan updates
  const updateImpactPlan = (planData) => {
    updateAuthenticDeliverables({ impactPlan: planData });
  };

  // Check completion
  const isComplete = () => {
    return deliverables.milestones.length > 0 && 
           deliverables.rubric.criteria.length >= ValidationRules.rubricCriteria.min;
  };

  // Handle AI conversation
  const handleSendMessage = async (messageContent = userInput) => {
    if (!messageContent.trim() || isAiLoading) {return;}

    if (messageContent === userInput) {
      setUserInput('');
    }

    const userMessage = {
      role: 'user',
      content: messageContent,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsAiLoading(true);

    try {
      const context = {
        projectInfo,
        ideation: blueprint.ideation,
        journey: blueprint.learningJourney,
        deliverables: deliverables,
        activeTab
      };

      const systemPrompt = `You are helping design authentic deliverables for a ${projectInfo.subject} project.
Big Idea: ${blueprint.ideation.bigIdea}
Essential Question: ${blueprint.ideation.essentialQuestion}
Challenge: ${blueprint.ideation.challenge}
Current focus: ${activeTab}`;

      // Handle commands
      let instruction = '';
      if (messageContent === 'Draft schedule') {
        instruction = 'Create a milestone schedule spread across the project timeline.';
      } else if (messageContent.startsWith('/examples')) {
        instruction = 'Provide example rubrics for this type of project.';
      } else if (messageContent === '/holistic') {
        instruction = 'Convert the current rubric to a holistic format.';
      }

      const response = await generateJsonResponse(
        [{ role: 'user', parts: [{ text: messageContent }] }],
        `${systemPrompt  }\n${  instruction}`
      );

      const aiMessage = {
        role: 'assistant',
        content: response.chatResponse || response.message || 'Let me help you with that.',
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Handle milestone suggestions
      if (response.milestoneSuggestions) {
        response.milestoneSuggestions.forEach(milestone => {
          addMilestone(milestone);
        });
      }

      // Handle rubric suggestions
      if (response.rubricSuggestions) {
        updateRubric({
          ...deliverables.rubric,
          criteria: response.rubricSuggestions
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

  // Handle completion
  const handleComplete = () => {
    markStepComplete('authentic-deliverables');
    onComplete();
  };

  // Initialize conversation
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = {
        role: 'assistant',
        content: `Let's design authentic assessments for your ${projectInfo.subject} project!

We'll create:
• **Milestones** - Interim checkpoints
• **Rubric** - Clear evaluation criteria  
• **Impact Plan** - How students share with real audiences

Where would you like to start?`,
        timestamp: Date.now()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">Authentic Deliverables</h1>
            <div className="flex items-center gap-2 text-sm">
              <span className={`px-3 py-1 rounded-full ${
                deliverables.milestones.length > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {deliverables.milestones.length} milestones
              </span>
              <span className={`px-3 py-1 rounded-full ${
                isComplete() ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {isComplete() ? '✓ Ready' : 'In progress'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isComplete() && (
              <button
                onClick={handleComplete}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                         font-medium transition-colors"
              >
                Complete Stage
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
        {/* Left Panel - Deliverables Editor */}
        <div className="w-1/2 flex flex-col bg-white m-4 rounded-xl shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('milestones')}
              className={`flex-1 px-4 py-3 font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'milestones' 
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icons.Calendar />
              Milestones
            </button>
            <button
              onClick={() => setActiveTab('rubric')}
              className={`flex-1 px-4 py-3 font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'rubric' 
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icons.Grid />
              Rubric
            </button>
            <button
              onClick={() => setActiveTab('impact')}
              className={`flex-1 px-4 py-3 font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'impact' 
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icons.Megaphone />
              Impact
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'milestones' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Project Milestones</h3>
                  <button
                    onClick={() => {
                      const title = prompt('Milestone title:');
                      if (title) {
                        const description = prompt('Description:');
                        addMilestone({ title, description });
                      }
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Icons.Plus />
                    Add Milestone
                  </button>
                </div>

                <AnimatePresence>
                  {deliverables.milestones.map(milestone => (
                    <MilestoneCard
                      key={milestone.id}
                      milestone={milestone}
                      onEdit={(m) => {
                        const title = prompt('Edit title:', m.title);
                        if (title) {updateMilestone(m.id, { title });}
                      }}
                      onDelete={deleteMilestone}
                    />
                  ))}
                </AnimatePresence>

                {deliverables.milestones.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Icons.Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>No milestones yet</p>
                    <p className="text-sm mt-1">Add checkpoints to track progress</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'rubric' && (
              <RubricBuilder
                rubric={deliverables.rubric}
                onUpdate={updateRubric}
              />
            )}

            {activeTab === 'impact' && (
              <ImpactPlan
                plan={deliverables.impactPlan}
                onUpdate={updateImpactPlan}
              />
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
              {activeTab === 'milestones' && (
                <button
                  onClick={() => handleSendMessage('Draft schedule')}
                  disabled={isAiLoading}
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 
                           text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <Icons.Calendar className="inline mr-1" />
                  Draft Schedule
                </button>
              )}
              {activeTab === 'rubric' && (
                <>
                  <button
                    onClick={() => handleSendMessage('/examples')}
                    disabled={isAiLoading}
                    className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 
                             text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <Icons.Grid className="inline mr-1" />
                    See Examples
                  </button>
                  <button
                    onClick={() => handleSendMessage('/holistic')}
                    disabled={isAiLoading}
                    className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 
                             text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Convert to Holistic
                  </button>
                </>
              )}
              {activeTab === 'impact' && (
                <button
                  onClick={() => handleSendMessage('Suggest audiences')}
                  disabled={isAiLoading}
                  className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 
                           text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <Icons.Megaphone className="inline mr-1" />
                  Suggest Audiences
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
                  placeholder="Ask about milestones, rubrics, or impact plans..."
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

export default AuthenticDeliverablesPro;