/**
 * Quick Assessment Strategies Component
 * Provides rapid formative assessment tools for immediate classroom feedback
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  type QuickCheck as QuickCheckType,
  type PBLStage 
} from '../../types/FormativeAssessmentTypes';
import { 
  MessageSquare, 
  Users, 
  ThumbsUp, 
  ThumbsDown, 
  FileText, 
  Brain,
  HelpCircle,
  Timer,
  BarChart3,
  Eye,
  Shuffle,
  Zap,
  Clock,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

interface QuickAssessmentStrategiesProps {
  stage: PBLStage;
  onComplete: (responses: Array<{ studentId: string; response: string }>) => void;
  participantCount?: number;
  timeLimit?: number; // minutes
}

interface StrategyCardProps {
  strategy: {
    id: string;
    type: QuickCheckType['type'];
    title: string;
    description: string;
    duration: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  };
  isSelected: boolean;
  onSelect: () => void;
}

interface ThinkPairShareProps {
  prompt: string;
  timeLimit: number;
  onComplete: (responses: Array<{ studentId: string; response: string }>) => void;
}

interface GalleryWalkProps {
  prompt: string;
  stationCount: number;
  onComplete: (responses: Array<{ studentId: string; response: string }>) => void;
}

interface ThumbsUpDownProps {
  statement: string;
  onComplete: (responses: Array<{ studentId: string; response: string }>) => void;
}

interface OneWordProps {
  prompt: string;
  onComplete: (responses: Array<{ studentId: string; response: string }>) => void;
}

interface MuddiestPointProps {
  onComplete: (responses: Array<{ studentId: string; response: string }>) => void;
}

const StrategyCard: React.FC<StrategyCardProps> = ({ strategy, isSelected, onSelect }) => {
  const { title, description, duration, icon: Icon, color } = strategy;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected
          ? `border-${color}-500 bg-${color}-50 dark:bg-${color}-900/20`
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
          <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{description}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {duration}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ThinkPairShare: React.FC<ThinkPairShareProps> = ({ prompt, timeLimit, onComplete }) => {
  const [phase, setPhase] = useState<'think' | 'pair' | 'share'>('think');
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60);
  const [responses, setResponses] = useState<Array<{ studentId: string; response: string }>>([]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const nextPhase = () => {
    if (phase === 'think') {
      setPhase('pair');
      setTimeRemaining(timeLimit * 60); // Reset timer for pair phase
    } else if (phase === 'pair') {
      setPhase('share');
    } else {
      onComplete(responses);
    }
  };

  const phaseConfig = {
    think: {
      title: 'Think Phase',
      instruction: 'Individual thinking time',
      description: 'Students reflect on the prompt individually',
      color: 'blue',
      icon: Brain
    },
    pair: {
      title: 'Pair Phase', 
      instruction: 'Discussion with partner',
      description: 'Students share and discuss their thoughts in pairs',
      color: 'green',
      icon: Users
    },
    share: {
      title: 'Share Phase',
      instruction: 'Class discussion',
      description: 'Pairs share insights with the whole class',
      color: 'purple',
      icon: MessageSquare
    }
  };

  const currentPhase = phaseConfig[phase];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className={`inline-flex items-center gap-2 px-4 py-2 bg-${currentPhase.color}-100 dark:bg-${currentPhase.color}-900/20 rounded-lg mb-4`}>
          <currentPhase.icon className={`w-5 h-5 text-${currentPhase.color}-600 dark:text-${currentPhase.color}-400`} />
          <span className={`font-semibold text-${currentPhase.color}-800 dark:text-${currentPhase.color}-200`}>
            {currentPhase.title}
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {currentPhase.instruction}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{currentPhase.description}</p>
        
        {phase !== 'share' && (
          <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            <Timer className="w-6 h-6" />
            {formatTime(timeRemaining)}
          </div>
        )}
      </div>

      {/* Prompt */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Prompt:</h4>
        <p className="text-gray-700 dark:text-gray-300">{prompt}</p>
      </div>

      {/* Phase-specific content */}
      {phase === 'think' && (
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
          <h5 className="font-medium text-primary-900 dark:text-primary-100 mb-2">Instructions for Students:</h5>
          <ul className="text-sm text-primary-800 dark:text-primary-200 space-y-1">
            <li>• Take time to think about the prompt silently</li>
            <li>• Jot down your initial thoughts</li>
            <li>• Consider different perspectives</li>
            <li>• Prepare to share with a partner</li>
          </ul>
        </div>
      )}

      {phase === 'pair' && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <h5 className="font-medium text-green-900 dark:text-green-100 mb-2">Instructions for Students:</h5>
          <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
            <li>• Find a partner or work in assigned pairs</li>
            <li>• Share your thoughts with your partner</li>
            <li>• Listen actively to your partner's ideas</li>
            <li>• Prepare one key insight to share with the class</li>
          </ul>
        </div>
      )}

      {phase === 'share' && (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <h5 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Class Sharing:</h5>
          <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
            Have each pair share one key insight or question that emerged from their discussion.
          </p>
          <button
            onClick={() => onComplete([])}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Complete Activity
          </button>
        </div>
      )}

      {/* Controls */}
      {phase !== 'share' && (
        <div className="flex justify-center">
          <button
            onClick={nextPhase}
            disabled={timeRemaining > 0 && phase === 'think'}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {phase === 'think' ? 'Start Pair Phase' : 'Start Share Phase'}
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

const GalleryWalk: React.FC<GalleryWalkProps> = ({ prompt, stationCount, onComplete }) => {
  const [currentStation, setCurrentStation] = useState(1);
  const [responses, setResponses] = useState<Record<number, string>>({});

  const stations = Array.from({ length: stationCount }, (_, i) => i + 1);

  const handleStationResponse = (station: number, response: string) => {
    setResponses(prev => ({ ...prev, [station]: response }));
  };

  const nextStation = () => {
    if (currentStation < stationCount) {
      setCurrentStation(currentStation + 1);
    } else {
      // Convert responses to expected format
      const formattedResponses = stations.map(station => ({
        studentId: `station-${station}`,
        response: responses[station] || ''
      }));
      onComplete(formattedResponses);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Gallery Walk: Station {currentStation} of {stationCount}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">{prompt}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
          Station {currentStation} Response
        </h4>
        <textarea
          value={responses[currentStation] || ''}
          onChange={(e) => handleStationResponse(currentStation, e.target.value)}
          placeholder="Enter observations or responses from this station..."
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24"
        />
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Progress: {Object.keys(responses).length} / {stationCount} stations completed
        </div>
        <button
          onClick={nextStation}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          {currentStation === stationCount ? 'Complete Gallery Walk' : 'Next Station'}
          {currentStation < stationCount && <Eye className="w-4 h-4" />}
          {currentStation === stationCount && <CheckCircle className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

const ThumbsUpDown: React.FC<ThumbsUpDownProps> = ({ statement, onComplete }) => {
  const [votes, setVotes] = useState<{ up: number; down: number }>({ up: 0, down: 0 });

  const vote = (type: 'up' | 'down') => {
    setVotes(prev => ({ ...prev, [type]: prev[type] + 1 }));
  };

  const total = votes.up + votes.down;
  const upPercentage = total > 0 ? (votes.up / total) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Quick Poll</h3>
        <p className="text-lg text-gray-700 dark:text-gray-300">{statement}</p>
      </div>

      <div className="flex gap-4 justify-center">
        <button
          onClick={() => vote('up')}
          className="flex flex-col items-center gap-2 p-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
        >
          <ThumbsUp className="w-12 h-12 text-green-600 dark:text-green-400" />
          <span className="font-semibold text-green-800 dark:text-green-200">{votes.up}</span>
          <span className="text-sm text-green-600 dark:text-green-400">Agree</span>
        </button>

        <button
          onClick={() => vote('down')}
          className="flex flex-col items-center gap-2 p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          <ThumbsDown className="w-12 h-12 text-red-600 dark:text-red-400" />
          <span className="font-semibold text-red-800 dark:text-red-200">{votes.down}</span>
          <span className="text-sm text-red-600 dark:text-red-400">Disagree</span>
        </button>
      </div>

      {total > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Results ({total} responses)</span>
            <span>{upPercentage.toFixed(1)}% agree</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${upPercentage}%` }}
            />
          </div>
        </div>
      )}

      <div className="text-center">
        <button
          onClick={() => onComplete([{ studentId: 'class', response: `${votes.up} agree, ${votes.down} disagree` }])}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Complete Poll
        </button>
      </div>
    </div>
  );
};

const OneWord: React.FC<OneWordProps> = ({ prompt, onComplete }) => {
  const [words, setWords] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState('');

  const addWord = () => {
    if (currentWord.trim() && !words.includes(currentWord.trim().toLowerCase())) {
      setWords([...words, currentWord.trim().toLowerCase()]);
      setCurrentWord('');
    }
  };

  const removeWord = (wordToRemove: string) => {
    setWords(words.filter(word => word !== wordToRemove));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">One Word Response</h3>
        <p className="text-gray-700 dark:text-gray-300">{prompt}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={currentWord}
            onChange={(e) => setCurrentWord(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addWord()}
            placeholder="Enter one word..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={addWord}
            disabled={!currentWord.trim()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            Add
          </button>
        </div>

        {words.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Collected Words:</h4>
            <div className="flex flex-wrap gap-2">
              {words.map((word, index) => (
                <span
                  key={index}
                  onClick={() => removeWord(word)}
                  className="px-3 py-1 bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-200 rounded-full text-sm cursor-pointer hover:bg-primary-200 dark:hover:bg-primary-800/70 transition-colors"
                >
                  {word} ×
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="text-center">
        <button
          onClick={() => onComplete([{ studentId: 'class', response: words.join(', ') }])}
          disabled={words.length === 0}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          Complete Activity ({words.length} words)
        </button>
      </div>
    </div>
  );
};

const MuddiestPoint: React.FC<MuddiestPointProps> = ({ onComplete }) => {
  const [muddiestPoints, setMuddiestPoints] = useState<string[]>([]);
  const [currentPoint, setCurrentPoint] = useState('');

  const addPoint = () => {
    if (currentPoint.trim()) {
      setMuddiestPoints([...muddiestPoints, currentPoint.trim()]);
      setCurrentPoint('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Muddiest Point</h3>
        <p className="text-gray-700 dark:text-gray-300">
          What was the most confusing or unclear part of today's learning?
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="space-y-3">
          <textarea
            value={currentPoint}
            onChange={(e) => setCurrentPoint(e.target.value)}
            placeholder="Describe what was confusing or needs clarification..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24"
          />
          <button
            onClick={addPoint}
            disabled={!currentPoint.trim()}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            Add Muddy Point
          </button>
        </div>

        {muddiestPoints.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Collected Points ({muddiestPoints.length}):</h4>
            <div className="space-y-2">
              {muddiestPoints.map((point, index) => (
                <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">{point}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="text-center">
        <button
          onClick={() => onComplete(muddiestPoints.map((point, index) => ({ 
            studentId: `point-${index}`, 
            response: point 
          })))}
          disabled={muddiestPoints.length === 0}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          Complete Activity ({muddiestPoints.length} points)
        </button>
      </div>
    </div>
  );
};

export const QuickAssessmentStrategies: React.FC<QuickAssessmentStrategiesProps> = ({
  stage,
  onComplete,
  participantCount = 25,
  timeLimit = 10
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  const strategies = [
    {
      id: 'think_pair_share',
      type: 'think_pair_share' as const,
      title: 'Think-Pair-Share',
      description: 'Individual reflection, partner discussion, then class sharing',
      duration: '8-12 minutes',
      icon: MessageSquare,
      color: 'blue'
    },
    {
      id: 'gallery_walk',
      type: 'gallery_walk' as const,
      title: 'Gallery Walk',
      description: 'Students move around stations to view and respond to content',
      duration: '10-15 minutes',
      icon: Eye,
      color: 'green'
    },
    {
      id: 'thumbs_up_down',
      type: 'thumbs_up_down' as const,
      title: 'Thumbs Up/Down Poll',
      description: 'Quick agreement/disagreement poll for instant feedback',
      duration: '2-3 minutes',
      icon: ThumbsUp,
      color: 'purple'
    },
    {
      id: 'one_word',
      type: 'one_word' as const,
      title: 'One Word Summary',
      description: 'Students capture their understanding in a single word',
      duration: '3-5 minutes',
      icon: Zap,
      color: 'yellow'
    },
    {
      id: 'muddiest_point',
      type: 'muddiest_point' as const,
      title: 'Muddiest Point',
      description: 'Identify the most confusing aspect of the lesson',
      duration: '3-5 minutes',
      icon: HelpCircle,
      color: 'red'
    },
    {
      id: 'exit_slip',
      type: 'exit_slip' as const,
      title: 'Exit Slip',
      description: 'Quick written reflection before leaving class',
      duration: '5-7 minutes',
      icon: FileText,
      color: 'indigo'
    }
  ];

  const selectedStrategyData = strategies.find(s => s.id === selectedStrategy);

  if (!selectedStrategy) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Quick Assessment Strategies
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Choose a strategy to quickly check student understanding during {stage.replace('_', ' ').toLowerCase()}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategies.map(strategy => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              isSelected={false}
              onSelect={() => setSelectedStrategy(strategy.id)}
            />
          ))}
        </div>

        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h3 className="font-semibold text-primary-900 dark:text-primary-100">Quick Assessment Tips</h3>
          </div>
          <ul className="text-sm text-primary-800 dark:text-primary-200 space-y-1">
            <li>• Use these regularly to monitor understanding in real-time</li>
            <li>• Choose based on your learning objectives and available time</li>
            <li>• Follow up on insights gained to adjust instruction</li>
            <li>• Create a safe environment for honest responses</li>
          </ul>
        </div>
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setSelectedStrategy(null)}
            className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
          >
            ← Back to strategies
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            {selectedStrategyData && (
              <div className={`p-3 rounded-lg bg-${selectedStrategyData.color}-100 dark:bg-${selectedStrategyData.color}-900/30`}>
                <selectedStrategyData.icon className={`w-6 h-6 text-${selectedStrategyData.color}-600 dark:text-${selectedStrategyData.color}-400`} />
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {selectedStrategyData?.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{selectedStrategyData?.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              Duration: {selectedStrategyData?.duration}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4" />
              Participants: {participantCount}
            </div>
          </div>

          <button
            onClick={() => setIsActive(true)}
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Start {selectedStrategyData?.title}
          </button>
        </div>
      </div>
    );
  }

  // Render the selected strategy component
  const renderStrategy = () => {
    const commonPrompt = `Reflect on your learning during the ${stage.replace('_', ' ').toLowerCase()} phase.`;
    
    switch (selectedStrategy) {
      case 'think_pair_share':
        return (
          <ThinkPairShare
            prompt={commonPrompt}
            timeLimit={timeLimit}
            onComplete={onComplete}
          />
        );
      case 'gallery_walk':
        return (
          <GalleryWalk
            prompt={commonPrompt}
            stationCount={4}
            onComplete={onComplete}
          />
        );
      case 'thumbs_up_down':
        return (
          <ThumbsUpDown
            statement={`I understand the key concepts from the ${stage.replace('_', ' ').toLowerCase()} phase.`}
            onComplete={onComplete}
          />
        );
      case 'one_word':
        return (
          <OneWord
            prompt={`Describe your learning from the ${stage.replace('_', ' ').toLowerCase()} phase in one word.`}
            onComplete={onComplete}
          />
        );
      case 'muddiest_point':
        return <MuddiestPoint onComplete={onComplete} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsActive(false)}
          className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
        >
          ← Back to setup
        </button>
      </div>
      {renderStrategy()}
    </div>
  );
};