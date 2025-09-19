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

  const startDemo = async () => {
    if (!userInput.trim()) return;

    setIdeation(prev => ({ ...prev, topic: userInput }));
    addMessage('user', userInput);
    setUserInput('');
    setIsLoading(true);
    setStep('bigIdea');

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
    const systemPrompt = `You are Alf, an expert AI curriculum designer using the Active Learning Framework (ALF).

User Context: They want to explore "${userInput}" as a project topic.

Your Role: Guide them to develop a compelling Big Idea using ALF methodology.

ALF Big Ideas must:
- Connect to authentic, real-world problems students can actually impact
- Allow for student agency and multiple solution pathways
- Be broad enough for sustained investigation across multiple disciplines
- Have clear assessment opportunities and deliverable potential
- Connect to academic standards naturally

Provide 2-3 specific Big Idea directions. For each, explain:
1. The authentic problem it addresses
2. How students would have agency/choice
3. What real impact they could create

Be conversational but demonstrate deep pedagogical expertise. Show you understand what makes projects successful.`;

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
      prompt = `You are Alf, expert curriculum designer. The user has chosen this Big Idea: "${userInput}"

Using ALF methodology, guide them to develop a powerful Essential Question.

ALF Essential Questions must:
- Be open-ended with no single correct answer
- Require higher-order thinking and synthesis
- Connect directly to the Big Idea
- Be personally meaningful to students
- Guide sustained inquiry throughout the project
- Allow for multiple valid perspectives and solutions

Analyze their Big Idea and suggest 2-3 Essential Question options. For each, explain:
1. How it drives deep inquiry
2. What perspectives students might explore
3. How it connects to real-world complexity

Show your pedagogical expertise in question crafting.`;

    } else if (step === 'essentialQuestion') {
      setIdeation(prev => ({ ...prev, essentialQuestion: userInput }));
      nextStep = 'challenge';

      // Use real ALF Challenge definition methodology
      prompt = `You are Alf, expert in project-based learning. The user has:
- Big Idea: "${ideation.bigIdea}"
- Essential Question: "${userInput}"

Using ALF methodology, help them define a specific, actionable Challenge.

ALF Challenges must:
- Be specific and achievable within project timeframe
- Allow students to create authentic products/solutions
- Connect to real audiences and stakeholders
- Provide clear success criteria
- Enable student choice in approach and execution
- Lead to meaningful impact beyond the classroom

Suggest 2-3 Challenge options that build from their Essential Question. For each, explain:
1. What students would create/deliver
2. Who the real audience would be
3. What impact it could have

Demonstrate deep understanding of authentic assessment.`;

    } else if (step === 'challenge') {
      setIdeation(prev => ({ ...prev, challenge: userInput }));
      nextStep = 'complete';

      prompt = `Excellent! You've just experienced ALF's ideation methodology:

**Big Idea**: "${ideation.bigIdea}"
**Essential Question**: "${ideation.essentialQuestion}"
**Challenge**: "${userInput}"

This foundation creates the backbone for powerful project-based learning. You've seen how ALF:
- Connects learning to authentic, real-world problems
- Ensures student agency and choice
- Builds toward meaningful impact
- Integrates multiple disciplines naturally

The full ALF platform would now help you develop this into a complete curriculum with learning progressions, authentic assessments, standards alignment, and implementation guides.

You've experienced firsthand how ALF transforms any topic into engaging, rigorous learning experiences!`;
    }

    try {
      const response = await geminiService.current.generateResponse(prompt);
      addMessage('assistant', response);
      setStep(nextStep);

      // Add ALF suggestions for next stage
      if (nextStep !== 'complete') {
        const nextStageName = nextStep === 'essentialQuestion' ? 'ESSENTIAL_QUESTION' : 'CHALLENGE';
        const nextSuggestions = getStageSuggestions(nextStageName, userInput);
        if (nextSuggestions && nextSuggestions.length > 0) {
          setSuggestions(nextSuggestions.slice(0, 3));
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-2 gap-8">

          {/* Left Panel - Process Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Sparkles className="w-6 h-6 text-primary-500 mr-2" />
              The Alf Process
            </h2>

            <div className="space-y-6">
              {[
                { step: 1, title: 'Start with Your Topic', desc: 'Any subject, issue, or idea you want to explore', active: step === 'intro' },
                { step: 2, title: 'Develop Big Idea', desc: 'Alf helps expand your topic into a compelling, broad concept', active: step === 'bigIdea' },
                { step: 3, title: 'Craft Essential Question', desc: 'Create an open-ended question that drives inquiry', active: step === 'essentialQuestion' },
                { step: 4, title: 'Define the Challenge', desc: 'Establish a specific, actionable problem to solve', active: step === 'challenge' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className={`flex items-start space-x-4 p-4 rounded-lg transition-all ${
                    item.active
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800'
                      : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600'
                  }`}
                  animate={{
                    scale: item.active ? 1.02 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    item.active ? 'bg-primary-500' : 'bg-gray-400'
                  }`}>
                    {item.step}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${item.active ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
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
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
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
            <div className="h-96 overflow-y-auto p-4 space-y-4">
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

            {/* ALF Suggestions */}
            {showSuggestions && suggestions.length > 0 && step !== 'complete' && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">ALF Suggestions</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setUserInput(suggestion.text || suggestion);
                        setShowSuggestions(false);
                      }}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 text-sm rounded-full hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                    >
                      {suggestion.text || suggestion}
                    </button>
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
                      const currentStage = step === 'bigIdea' ? 'BIG_IDEA' : step === 'essentialQuestion' ? 'ESSENTIAL_QUESTION' : 'CHALLENGE';
                      const stageSuggestions = getStageSuggestions(currentStage, userInput || ideation.topic);
                      if (stageSuggestions && stageSuggestions.length > 0) {
                        setSuggestions(stageSuggestions.slice(0, 4));
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