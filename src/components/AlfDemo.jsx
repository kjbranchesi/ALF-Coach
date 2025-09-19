import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, ArrowRight, BookOpen, Target, Lightbulb } from 'lucide-react';
import { GeminiService } from '../services/GeminiService';
import { getStageMessage } from '../utils/conversationFramework';
import { getStageSuggestions } from '../utils/suggestionContent';

const AlfDemo = () => {
  const [step, setStep] = useState('intro'); // intro, bigIdea, essentialQuestion, challenge, complete
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [ideation, setIdeation] = useState({
    topic: '',
    bigIdea: '',
    essentialQuestion: '',
    challenge: ''
  });

  const geminiService = useRef(new GeminiService());
  const messagesEndRef = useRef(null);

  // Mock project state for ALF protocols
  const projectState = {
    stage: step === 'bigIdea' ? 'BIG_IDEA' : step === 'essentialQuestion' ? 'ESSENTIAL_QUESTION' : step === 'challenge' ? 'CHALLENGE' : 'GROUNDING',
    messageCountInStage: 1,
    ideation: ideation,
    context: {
      subject: 'General',
      gradeLevel: 'General',
      duration: 'Flexible',
      location: 'General',
      materials: 'Flexible'
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (role, content) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      role,
      content,
      timestamp: new Date()
    }]);
  };

  // Enhanced contextual suggestions based on current progress
  const getContextualSuggestions = (nextStep, ideation, userInput) => {
    const topic = ideation.topic || userInput;

    if (nextStep === 'essentialQuestion') {
      return [
        {
          text: `How can ${topic} address real challenges in our community?`,
          description: "Community-focused inquiry approach"
        },
        {
          text: `What role does ${topic} play in creating a sustainable future?`,
          description: "Future-oriented perspective"
        },
        {
          text: `How do different perspectives on ${topic} lead to better solutions?`,
          description: "Multiple viewpoints framework"
        },
        {
          text: `What can ${topic} teach us about solving complex problems?`,
          description: "Problem-solving methodology"
        }
      ];
    } else if (nextStep === 'challenge') {
      return [
        {
          text: `Create a ${topic} solution for local businesses`,
          description: "Real-world application with authentic audience"
        },
        {
          text: `Design a community campaign about ${topic}`,
          description: "Public engagement and social impact"
        },
        {
          text: `Build a ${topic} resource for younger students`,
          description: "Teaching others while learning"
        },
        {
          text: `Develop a ${topic} innovation for your school`,
          description: "Institution-specific problem solving"
        }
      ];
    }
    return [];
  };

  const startDemo = async () => {
    if (!userInput.trim()) return;

    setIdeation(prev => ({ ...prev, topic: userInput }));
    addMessage('user', userInput);
    setUserInput('');
    setIsLoading(true);
    setStep('bigIdea');
    setChatExpanded(true); // Expand chat when user starts interacting

    // Use the real ALF conversation framework
    const stageMessage = getStageMessage('BIG_IDEA', {
      stage: 'BIG_IDEA',
      messageCountInStage: 1,
      ideation: { topic: userInput },
      context: {
        subject: 'General',
        gradeLevel: 'General',
        duration: 'Flexible',
        location: 'General',
        materials: 'Flexible'
      }
    });

    // Generate real ALF-style response using actual protocols
    const systemPrompt = `You are Alf, an AI curriculum coach. The user wants to explore "${userInput}" as a project topic.

Your job: Coach them to develop their own Big Idea by asking guiding questions that help them think about real-world connections.

DON'T give them ready-made Big Ideas. Instead, guide them to discover possibilities through questions like:

"Great choice! ${userInput} has so much potential for real impact. Let me help you develop this into a powerful Big Idea.

First, let's think about your community - what issues related to ${userInput} do you see around you? What problems could students actually help solve?

Here are some questions to spark your thinking:
- Who in your community is affected by ${userInput}?
- What local organizations work on this issue?
- What could students realistically create or investigate that would make a difference?

Take a moment to think about it, then tell me what direction feels most compelling to you."

Be encouraging and Socratic. Help them discover rather than telling them what to think.`;

    try {
      const response = await geminiService.current.generateResponse(systemPrompt);
      addMessage('assistant', response);

      // Load real ALF suggestions
      const alfSuggestions = getStageSuggestions('BIG_IDEA', userInput);
      if (alfSuggestions && alfSuggestions.length > 0) {
        setSuggestions(alfSuggestions.slice(0, 3));
        setShowSuggestions(true);
      }

    } catch (error) {
      console.error('Gemini API error:', error);
      addMessage('assistant', "I'm having trouble connecting right now. Let me try a different approach to help you develop your Big Idea. Could you tell me more about what specific aspect of this topic interests you most?");
    }
    setIsLoading(false);
  };


  const handleStageSubmit = async () => {
    if (!userInput.trim()) return;

    addMessage('user', userInput);
    setIsLoading(true);

    let prompt = '';
    let nextStep = '';

    if (step === 'bigIdea') {
      setIdeation(prev => ({ ...prev, bigIdea: userInput }));
      nextStep = 'essentialQuestion';

      // Use real ALF Essential Question methodology
      prompt = `You are Alf coaching the user to develop their Essential Question. Their Big Idea is: "${userInput}"

Your job: Guide them to craft their own Essential Question through coaching questions.

DON'T give them ready-made questions. Instead, coach them with:

"Excellent Big Idea! Now let's develop an Essential Question that will drive deep student inquiry.

The best Essential Questions feel like mysteries students can't wait to solve. They should make students think 'I really want to figure this out!'

Think about your Big Idea and consider:
- What would students genuinely wonder about this topic?
- What question has no simple answer but feels important to explore?
- What would make students want to investigate different perspectives?

Try crafting a question that starts with 'How might...' or 'What is the relationship between...' or 'Why do...'

What Essential Question comes to mind for you?"

Be encouraging and help them discover their own compelling question.`;

    } else if (step === 'essentialQuestion') {
      setIdeation(prev => ({ ...prev, essentialQuestion: userInput }));
      nextStep = 'challenge';

      // Use real ALF Challenge definition methodology
      prompt = `You are Alf coaching the user to define their Challenge. They have:
- Big Idea: "${ideation.bigIdea}"
- Essential Question: "${userInput}"

Your job: Coach them to identify what students will actually create or solve.

DON'T give them ready-made challenges. Instead, guide them with:

"Perfect Essential Question! Now let's get specific about what students will actually DO.

The Challenge is where the rubber meets the road - what will students create, build, or solve that has real impact?

Think about:
- Who could actually use what students create?
- What format would be most useful (presentation, design, solution, campaign, etc.)?
- What would students be excited to work on?
- What would make the biggest difference for your community?

What specific Challenge do you think would work best? What should students actually create or solve?"

Guide them to discover their own authentic Challenge.`;

    } else if (step === 'challenge') {
      setIdeation(prev => ({ ...prev, challenge: userInput }));
      nextStep = 'complete';

      prompt = `🎉 You just experienced ALF's systematic methodology in action!

**What you built:**
• Big Idea: "${ideation.bigIdea}"
• Essential Question: "${ideation.essentialQuestion}"
• Challenge: "${userInput}"

**What just happened that's different:**
You didn't just get "project ideas" - you experienced ALF's proven framework that ensures every project has real community impact, authentic assessment, and student agency built in from the start.

**Why this matters:**
This foundation guarantees your students won't just "do a project" - they'll solve real problems for real people while meeting rigorous academic standards.

**What's next:**
The full ALF platform takes this foundation and builds complete learning experiences with implementation timelines, assessment rubrics, standards alignment, and classroom management tools.

You've just seen why thousands of educators choose ALF over generic project templates!`;
    }

    try {
      const response = await geminiService.current.generateResponse(prompt);
      addMessage('assistant', response);
      setStep(nextStep);

      // Add contextual ALF suggestions for next stage
      if (nextStep !== 'complete') {
        const contextualSuggestions = getContextualSuggestions(nextStep, ideation, userInput);
        if (contextualSuggestions && contextualSuggestions.length > 0) {
          setSuggestions(contextualSuggestions);
          setShowSuggestions(true);
        }
      }

    } catch (error) {
      console.error('Gemini API error:', error);
      addMessage('assistant', "I'm experiencing a connection issue. Could you rephrase your response or try again? I want to make sure I give you the best guidance for this stage.");
      return; // Don't advance to next step on error
    }

    setUserInput('');
    setIsLoading(false);
  };

  const resetDemo = () => {
    setStep('intro');
    setMessages([]);
    setIdeation({ topic: '', bigIdea: '', essentialQuestion: '', challenge: '' });
    setUserInput('');
  };

  const getStepInfo = () => {
    switch(step) {
      case 'bigIdea':
        return { icon: Lightbulb, title: 'Big Idea', color: 'bg-blue-500' };
      case 'essentialQuestion':
        return { icon: BookOpen, title: 'Essential Question', color: 'bg-purple-500' };
      case 'challenge':
        return { icon: Target, title: 'Challenge', color: 'bg-emerald-500' };
      default:
        return { icon: Sparkles, title: 'Introduction', color: 'bg-primary-500' };
    }
  };

  const stepInfo = getStepInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-blue-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
                Experience{" "}
                <span className="font-sans font-bold text-primary-600 dark:text-primary-400">Alf</span>{" "}
                in Action
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                See how Alf transforms any topic into engaging project-based learning in just 3 simple steps.
                Try it with your own idea!
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Demo Container */}
      <div className={`${chatExpanded ? 'max-w-7xl' : 'max-w-6xl'} mx-auto px-4 sm:px-6 lg:px-8 pb-16 transition-all duration-500`}>
        <div className={`${chatExpanded ? 'grid-cols-1 lg:grid-cols-3' : 'grid lg:grid-cols-2'} grid gap-8`}>

          {/* Left Panel - ALF Methodology Showcase */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{
              opacity: chatExpanded ? 0.95 : 1,
              x: 0,
              scale: chatExpanded ? 0.95 : 1
            }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`${chatExpanded ? 'lg:col-span-1' : ''} bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50 dark:border-gray-700/50 transition-all duration-500`}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Target className="w-6 h-6 text-primary-500 mr-2" />
              ALF Methodology in Action
            </h2>

            {/* Current Stage Indicator */}
            <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-primary-700 dark:text-primary-300">
                  {step === 'intro' && 'Ready to Transform Your Topic'}
                  {step === 'bigIdea' && 'Building Authentic Connections'}
                  {step === 'essentialQuestion' && 'Designing Inquiry Framework'}
                  {step === 'challenge' && 'Creating Real-World Impact'}
                  {step === 'complete' && 'Learning Experience Foundation Built'}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {step === 'intro' && 'ALF will analyze your topic for authentic problem connections and student agency opportunities'}
                {step === 'bigIdea' && 'ALF ensures real-world relevance, multiple perspectives, and clear standards alignment'}
                {step === 'essentialQuestion' && 'ALF crafts questions that drive sustained inquiry and higher-order thinking'}
                {step === 'challenge' && 'ALF designs authentic assessment with real audiences and measurable impact'}
                {step === 'complete' && 'ALF has created a foundation that ensures rigorous, engaging project-based learning'}
              </p>
            </div>

            {/* ALF Systematic Approach */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">ALF Systematically Ensures:</h3>

              {[
                {
                  title: 'Authentic Assessment Design',
                  desc: 'Built-in rubrics, real audiences, measurable outcomes',
                  completed: step === 'challenge' || step === 'complete',
                  active: step === 'challenge'
                },
                {
                  title: 'Standards Integration',
                  desc: 'Automatic alignment to academic frameworks',
                  completed: step === 'essentialQuestion' || step === 'challenge' || step === 'complete',
                  active: step === 'essentialQuestion'
                },
                {
                  title: 'Student Agency Mechanisms',
                  desc: 'Multiple pathways, choice, and ownership',
                  completed: step === 'bigIdea' || step === 'essentialQuestion' || step === 'challenge' || step === 'complete',
                  active: step === 'bigIdea'
                },
                {
                  title: 'Real-World Connection',
                  desc: 'Community stakeholders and authentic problems',
                  completed: step === 'bigIdea' || step === 'essentialQuestion' || step === 'challenge' || step === 'complete',
                  active: step === 'bigIdea'
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className={`flex items-start space-x-3 p-3 rounded-lg transition-all ${
                    item.active
                      ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                      : item.completed
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-gray-50 dark:bg-gray-700/50'
                  }`}
                  animate={{
                    scale: item.active ? 1.02 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${
                    item.completed ? 'bg-emerald-500' : item.active ? 'bg-primary-500' : 'bg-gray-400'
                  }`}>
                    {item.completed ? '✓' : item.active ? '○' : '○'}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium text-sm ${
                      item.active ? 'text-primary-700 dark:text-primary-300' :
                      item.completed ? 'text-emerald-700 dark:text-emerald-300' :
                      'text-gray-600 dark:text-gray-400'
                    }`}>
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {step === 'complete' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg"
              >
                <h3 className="font-semibold text-emerald-700 dark:text-emerald-300 mb-2">🎉 Foundation Complete!</h3>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  Your project idea now has a solid foundation. The full Alf platform builds on this to create complete learning experiences with standards alignment, assessments, and detailed implementation guides.
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Right Panel - Chat Interface */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{
              opacity: 1,
              x: 0,
              scale: chatExpanded ? 1.02 : 1
            }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className={`${chatExpanded ? 'lg:col-span-2' : ''} bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-500 ${chatExpanded ? 'shadow-2xl' : ''}`}
          >
            {/* Chat Header */}
            <div className={`${stepInfo.color} text-white p-4 flex items-center justify-between`}>
              <div className="flex items-center space-x-2">
                <stepInfo.icon className="w-5 h-5" />
                <span className="font-semibold">{stepInfo.title}</span>
              </div>
              {step !== 'intro' && (
                <button
                  onClick={resetDemo}
                  className="text-white/80 hover:text-white text-sm underline"
                >
                  Start Over
                </button>
              )}
            </div>

            {/* Chat Messages */}
            <div className={`${chatExpanded ? 'h-[500px]' : 'h-96'} overflow-y-auto p-4 space-y-4 transition-all duration-500`}>
              {step === 'intro' ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      A
                    </div>
                    <div>
                      <p className="text-gray-700 dark:text-gray-300">
                        Hi! I'm <span className="font-sans font-bold text-primary-600 dark:text-primary-400">Alf</span>, your expert AI curriculum designer powered by the Active Learning Framework.
                        I don't just help with topics - I transform them into rigorous, authentic project-based learning experiences.
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 mt-2">
                        I'll guide you through my proven methodology: developing Big Ideas that connect to real problems, crafting Essential Questions that drive deep inquiry, and defining Challenges that lead to meaningful impact.
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 mt-2">
                        <strong>What topic would you like to explore?</strong> (Try: Urban Planning, Climate Change, Artificial Intelligence, Food Systems, Social Media, Local History...)
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}>
                        {message.role === 'assistant' && (
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                              A
                            </div>
                            <span className="text-xs font-medium text-primary-600 dark:text-primary-400">Alf</span>
                          </div>
                        )}
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Enhanced ALF Suggestions */}
            {showSuggestions && suggestions.length > 0 && step !== 'complete' && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">ALF Smart Suggestions</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Based on your {ideation.topic || 'topic'}</span>
                </div>
                <div className={`grid ${chatExpanded ? 'grid-cols-2 gap-3' : 'gap-2'}`}>
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => {
                        setUserInput(suggestion.text || suggestion);
                        setShowSuggestions(false);
                      }}
                      className={`p-3 bg-white dark:bg-gray-800 text-left rounded-lg border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all group ${
                        chatExpanded ? 'text-sm' : 'text-xs'
                      }`}
                    >
                      <div className="font-medium text-blue-700 dark:text-blue-300 group-hover:text-blue-800 dark:group-hover:text-blue-200">
                        {suggestion.text || suggestion}
                      </div>
                      {suggestion.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {suggestion.description}
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (step === 'intro' ? startDemo() : handleStageSubmit())}
                  placeholder={
                    step === 'intro'
                      ? "Enter a topic you'd like to explore..."
                      : step === 'bigIdea'
                      ? "Describe your Big Idea..."
                      : step === 'essentialQuestion'
                      ? "Craft your Essential Question..."
                      : "Define your Challenge..."
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  disabled={isLoading || step === 'complete'}
                />

                {/* Ideas Button */}
                {step !== 'intro' && step !== 'complete' && (
                  <button
                    onClick={() => {
                      const contextualSuggestions = getContextualSuggestions(step, ideation, userInput);
                      if (contextualSuggestions && contextualSuggestions.length > 0) {
                        setSuggestions(contextualSuggestions);
                        setShowSuggestions(true);
                      }
                    }}
                    className="px-3 py-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors border border-yellow-300 dark:border-yellow-700"
                    title="Get ALF suggestions"
                  >
                    <Lightbulb className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={step === 'intro' ? startDemo : handleStageSubmit}
                  disabled={!userInput.trim() || isLoading || step === 'complete'}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              {step !== 'intro' && step !== 'complete' && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  ALF Tip: Click the lightbulb for suggestions or type your own response
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* CTA Section */}
        {step === 'complete' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to Build the Complete Experience?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                This is just the beginning! The full Alf platform helps you turn this foundation into a complete project-based learning curriculum with detailed implementation guides, standards alignment, and assessment tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={resetDemo}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Try Another Topic
                </button>
                <a
                  href="/signin"
                  className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center"
                >
                  Get Started with Alf
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AlfDemo;