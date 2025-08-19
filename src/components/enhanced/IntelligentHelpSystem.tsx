import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  BookOpen, 
  Lightbulb, 
  PlayCircle,
  CheckCircle,
  X,
  ChevronRight,
  ChevronDown,
  MessageSquare,
  Video,
  FileText,
  ExternalLink,
  Clock,
  Star
} from 'lucide-react';

interface HelpContent {
  id: string;
  title: string;
  description: string;
  type: 'concept' | 'example' | 'video' | 'template' | 'tip' | 'troubleshooting';
  content: React.ReactNode;
  timeToRead?: number;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  stage?: 'ideation' | 'journey' | 'deliverables';
  step?: string;
  tags: string[];
}

interface IntelligentHelpSystemProps {
  currentStage: 'ideation' | 'journey' | 'deliverables';
  currentStep: string;
  userType: 'new' | 'experienced' | 'expert';
  userContext?: {
    hasInteracted?: boolean;
    timeSpent?: number;
    lastAction?: string;
    strugglingWith?: string[];
  };
  onHelpUsed?: (helpId: string, helpful: boolean) => void;
}

const helpDatabase: HelpContent[] = [
  // Ideation Stage Help
  {
    id: 'bigidea-concept',
    title: 'What is a Big Idea?',
    description: 'Understanding the foundational concept that drives learning',
    type: 'concept',
    complexity: 'beginner',
    stage: 'ideation',
    step: 'bigIdea',
    timeToRead: 2,
    tags: ['concept', 'foundation', 'learning theory'],
    content: (
      <div className="space-y-4">
        <p>A Big Idea is a fundamental concept that:</p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Connects to students' lives and experiences</li>
          <li>Has relevance beyond the classroom</li>
          <li>Can be explored from multiple perspectives</li>
          <li>Sparks curiosity and deeper questions</li>
        </ul>
        <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
          <p className="text-blue-800 text-sm">
            <strong>Remember:</strong> Think concepts, not topics. "Sustainability" is a Big Idea. 
            "Recycling plastic bottles" is a topic within that idea.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'bigidea-examples',
    title: 'Big Idea Examples by Subject',
    description: 'See how Big Ideas work across different subjects',
    type: 'example',
    complexity: 'beginner',
    stage: 'ideation',
    step: 'bigIdea',
    timeToRead: 3,
    tags: ['examples', 'subjects', 'inspiration'],
    content: (
      <div className="space-y-4">
        <div className="grid gap-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900">Science</h4>
            <p className="text-green-700 text-sm">Systems thinking, cause and effect, adaptation</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900">Social Studies</h4>
            <p className="text-blue-700 text-sm">Power and authority, justice and equality, cultural identity</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-900">English Language Arts</h4>
            <p className="text-purple-700 text-sm">Communication, perspective, storytelling's power</p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <h4 className="font-medium text-orange-900">Math</h4>
            <p className="text-orange-700 text-sm">Patterns and relationships, data-driven decisions, modeling</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'essential-question-framework',
    title: 'Crafting Essential Questions',
    description: 'Framework for creating thought-provoking questions',
    type: 'template',
    complexity: 'intermediate',
    stage: 'ideation',
    step: 'essentialQuestion',
    timeToRead: 4,
    tags: ['framework', 'questions', 'inquiry'],
    content: (
      <div className="space-y-4">
        <p>Essential questions should be:</p>
        <div className="grid gap-3">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium">Open-ended</h4>
              <p className="text-sm text-gray-600">Cannot be answered with a simple yes/no or fact</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium">Thought-provoking</h4>
              <p className="text-sm text-gray-600">Stimulates discussion and deeper thinking</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium">Inquiry-focused</h4>
              <p className="text-sm text-gray-600">Encourages investigation and research</p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Question Starters:</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• How might we...?</p>
            <p>• What if...?</p>
            <p>• Why do you think...?</p>
            <p>• How does... affect...?</p>
            <p>• What would happen if...?</p>
          </div>
        </div>
      </div>
    )
  }
];

export function IntelligentHelpSystem({
  currentStage,
  currentStep,
  userType,
  userContext = {},
  onHelpUsed
}: IntelligentHelpSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHelp, setSelectedHelp] = useState<HelpContent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [helpHistory, setHelpHistory] = useState<string[]>([]);
  const [contextualSuggestions, setContextualSuggestions] = useState<HelpContent[]>([]);

  // Get contextual help based on current state
  useEffect(() => {
    const relevantHelp = helpDatabase.filter(help => {
      // Stage and step matching
      if (help.stage && help.stage !== currentStage) return false;
      if (help.step && help.step !== currentStep) return false;
      
      // User type complexity matching
      if (userType === 'new' && help.complexity === 'advanced') return false;
      if (userType === 'expert' && help.complexity === 'beginner') return false;
      
      // Context-based filtering
      if (userContext.strugglingWith?.length) {
        const hasRelevantTag = help.tags.some(tag => 
          userContext.strugglingWith?.includes(tag)
        );
        if (hasRelevantTag) return true;
      }
      
      return true;
    });

    // Sort by relevance
    const sorted = relevantHelp.sort((a, b) => {
      // Prioritize by user type complexity match
      const aComplexityMatch = (userType === 'new' && a.complexity === 'beginner') ||
                              (userType === 'experienced' && a.complexity === 'intermediate') ||
                              (userType === 'expert' && a.complexity === 'advanced');
      const bComplexityMatch = (userType === 'new' && b.complexity === 'beginner') ||
                              (userType === 'experienced' && b.complexity === 'intermediate') ||
                              (userType === 'expert' && b.complexity === 'advanced');
      
      if (aComplexityMatch && !bComplexityMatch) return -1;
      if (!aComplexityMatch && bComplexityMatch) return 1;
      
      // Then by type priority (concepts first for beginners, examples for experienced)
      const typeOrder = userType === 'new' ? 
        ['concept', 'example', 'template', 'tip', 'video', 'troubleshooting'] :
        ['example', 'tip', 'concept', 'template', 'video', 'troubleshooting'];
      
      return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
    });

    setContextualSuggestions(sorted.slice(0, 6));
  }, [currentStage, currentStep, userType, userContext]);

  // Filter help based on search
  const filteredHelp = searchQuery ? 
    helpDatabase.filter(help => 
      help.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      help.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      help.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    ) : contextualSuggestions;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'concept': return BookOpen;
      case 'example': return Lightbulb;
      case 'video': return Video;
      case 'template': return FileText;
      case 'tip': return Star;
      case 'troubleshooting': return MessageSquare;
      default: return HelpCircle;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'concept': return 'blue';
      case 'example': return 'green';
      case 'video': return 'purple';
      case 'template': return 'orange';
      case 'tip': return 'yellow';
      case 'troubleshooting': return 'red';
      default: return 'gray';
    }
  };

  return (
    <>
      {/* Help Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50 flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <HelpCircle className="w-6 h-6" />
      </motion.button>

      {/* Quick Help Tooltip for New Users */}
      {userType === 'new' && !userContext.hasInteracted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-20 right-6 bg-white rounded-lg shadow-lg p-3 border border-gray-200 max-w-xs z-40"
        >
          <p className="text-sm text-gray-700 mb-2">
            Need help getting started? Click here for guidance!
          </p>
          <button
            onClick={() => setIsOpen(true)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Show me how →
          </button>
        </motion.div>
      )}

      {/* Help Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Help & Guidance</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Get help with {currentStage} • {currentStep}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-hidden flex">
                {/* Help List */}
                <div className="w-1/3 border-r border-gray-200 flex flex-col">
                  {/* Search */}
                  <div className="p-4 border-b border-gray-200">
                    <input
                      type="text"
                      placeholder="Search help topics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Help Items */}
                  <div className="flex-1 overflow-y-auto">
                    {filteredHelp.map((help) => {
                      const Icon = getTypeIcon(help.type);
                      const color = getTypeColor(help.type);
                      
                      return (
                        <button
                          key={help.id}
                          onClick={() => setSelectedHelp(help)}
                          className={`
                            w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100
                            ${selectedHelp?.id === help.id ? 'bg-blue-50 border-blue-200' : ''}
                          `}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`
                              w-8 h-8 rounded-lg flex items-center justify-center
                              bg-${color}-100 text-${color}-600
                            `}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 text-sm mb-1">
                                {help.title}
                              </h3>
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {help.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`
                                  px-2 py-1 rounded-full text-xs
                                  bg-${color}-100 text-${color}-700
                                `}>
                                  {help.type}
                                </span>
                                {help.timeToRead && (
                                  <span className="flex items-center gap-1 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    {help.timeToRead}m
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Help Content */}
                <div className="flex-1 flex flex-col">
                  {selectedHelp ? (
                    <div className="p-6 flex-1 overflow-y-auto">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {selectedHelp.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                          {selectedHelp.description}
                        </p>
                      </div>
                      
                      {selectedHelp.content}
                      
                      {/* Feedback */}
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600 mb-3">Was this helpful?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              onHelpUsed?.(selectedHelp.id, true);
                              setHelpHistory([...helpHistory, selectedHelp.id]);
                            }}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
                          >
                            👍 Yes
                          </button>
                          <button
                            onClick={() => onHelpUsed?.(selectedHelp.id, false)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
                          >
                            👎 No
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 flex-1 flex items-center justify-center text-center">
                      <div>
                        <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Select a help topic to get started</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}