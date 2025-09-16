/**
 * StudentCreativeProcess.tsx
 * 
 * CRITICAL MENTAL MODEL: 
 * - Teachers DESIGN this journey
 * - Students EXPERIENCE this journey
 * - This component helps teachers plan HOW students will move through Creative Process
 */

import React, { useState, useReducer } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  Search,
  Hammer,
  CheckCircle,
  ArrowRight,
  RotateCcw,
  Users,
  Clock,
  Target,
  AlertCircle,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

// Types
interface PhaseActivity {
  id: string;
  name: string;
  duration: string;
  description: string;
  deliverable: string;
  scaffolding: string[];
}

interface Phase {
  id: 'analyze' | 'brainstorm' | 'prototype' | 'evaluate';
  name: string;
  icon: React.ElementType;
  color: string;
  duration: string;
  percentage: number;
  objectives: string[];
  activities: PhaseActivity[];
  iterationPoints: string[];
  differentiation: {
    advanced: string[];
    onLevel: string[];
    support: string[];
  };
}

interface ProjectData {
  title: string;
  essentialQuestion: string;
  challenge: string;
  duration: string;
  gradeLevel: string;
  subject: string;
}

interface StudentCreativeProcessProps {
  projectData: ProjectData;
  onSave: (data: any) => void;
  onComplete: (data: any) => void;
}

// Helper to parse duration and calculate phase timing
const calculatePhaseTiming = (projectDuration: string): { [key: string]: { duration: string; percentage: number } } => {
  // Parse duration (e.g., "4 weeks", "2 months", "1 semester")
  const durationLower = projectDuration.toLowerCase();
  let totalDays = 20; // default
  
  if (durationLower.includes('week')) {
    const weeks = parseInt(durationLower) || 4;
    totalDays = weeks * 5; // school days
  } else if (durationLower.includes('month')) {
    const months = parseInt(durationLower) || 1;
    totalDays = months * 20; // school days per month
  } else if (durationLower.includes('semester')) {
    totalDays = 90; // typical semester
  } else if (durationLower.includes('year')) {
    totalDays = 180; // school year
  }
  
  // Adjust percentages based on total duration
  if (totalDays <= 10) {
    // Very short project - quick iterations
    return {
      analyze: { duration: `${Math.round(totalDays * 0.20)} days`, percentage: 20 },
      brainstorm: { duration: `${Math.round(totalDays * 0.20)} days`, percentage: 20 },
      prototype: { duration: `${Math.round(totalDays * 0.40)} days`, percentage: 40 },
      evaluate: { duration: `${Math.round(totalDays * 0.20)} days`, percentage: 20 }
    };
  } else if (totalDays <= 30) {
    // Standard project
    return {
      analyze: { duration: `${Math.round(totalDays * 0.25)} days`, percentage: 25 },
      brainstorm: { duration: `${Math.round(totalDays * 0.25)} days`, percentage: 25 },
      prototype: { duration: `${Math.round(totalDays * 0.35)} days`, percentage: 35 },
      evaluate: { duration: `${Math.round(totalDays * 0.15)} days`, percentage: 15 }
    };
  } else {
    // Long project - deeper investigation
    return {
      analyze: { duration: `${Math.round(totalDays * 0.30)} days`, percentage: 30 },
      brainstorm: { duration: `${Math.round(totalDays * 0.20)} days`, percentage: 20 },
      prototype: { duration: `${Math.round(totalDays * 0.35)} days`, percentage: 35 },
      evaluate: { duration: `${Math.round(totalDays * 0.15)} days`, percentage: 15 }
    };
  }
};

export const StudentCreativeProcess: React.FC<StudentCreativeProcessProps> = ({
  projectData,
  onSave,
  onComplete
}) => {
  const phaseTiming = calculatePhaseTiming(projectData.duration);
  
  const [activePhase, setActivePhase] = useState<string>('overview');
  const [showIterationStrategy, setShowIterationStrategy] = useState(false);
  
  // Initialize phases based on project data
  const [phases, setPhases] = useState<Phase[]>([
    {
      id: 'analyze',
      name: 'Analyze',
      icon: Search,
      color: 'blue',
      duration: phaseTiming.analyze.duration,
      percentage: phaseTiming.analyze.percentage,
      objectives: [
        `Investigate: "${projectData.essentialQuestion}"`,
        'Understand the problem space',
        'Research existing solutions',
        'Identify stakeholders and constraints'
      ],
      activities: [],
      iterationPoints: [
        'Discovering initial assumptions were wrong',
        'Finding new information that changes understanding',
        'Realizing the problem is different than expected'
      ],
      differentiation: {
        advanced: ['Independent research pathways', 'Primary source analysis'],
        onLevel: ['Guided research with templates', 'Curated resource lists'],
        support: ['Structured research guides', 'Pre-selected sources', 'Partner work']
      }
    },
    {
      id: 'brainstorm',
      name: 'Brainstorm',
      icon: Lightbulb,
      color: 'yellow',
      duration: phaseTiming.brainstorm.duration,
      percentage: phaseTiming.brainstorm.percentage,
      objectives: [
        'Generate diverse solution ideas',
        'Think creatively without constraints',
        'Build on others\' ideas',
        'Explore "wild" possibilities'
      ],
      activities: [],
      iterationPoints: [
        'Ideas not addressing the real problem',
        'Discovering better solution directions',
        'Combining multiple ideas into new approaches'
      ],
      differentiation: {
        advanced: ['Lead ideation sessions', 'Explore complex solutions'],
        onLevel: ['Participate in group brainstorming', 'Use ideation templates'],
        support: ['Structured brainstorming protocols', 'Visual thinking tools']
      }
    },
    {
      id: 'prototype',
      name: 'Prototype',
      icon: Hammer,
      color: 'purple',
      duration: phaseTiming.prototype.duration,
      percentage: phaseTiming.prototype.percentage,
      objectives: [
        'Build tangible solutions',
        'Test ideas quickly',
        'Iterate based on feedback',
        'Document the process'
      ],
      activities: [],
      iterationPoints: [
        'Prototype failures revealing design flaws',
        'User testing showing unexpected needs',
        'Technical constraints requiring pivots'
      ],
      differentiation: {
        advanced: ['Complex prototypes', 'Multiple iterations'],
        onLevel: ['Standard prototypes', 'Planned iterations'],
        support: ['Simplified prototypes', 'Heavily scaffolded building']
      }
    },
    {
      id: 'evaluate',
      name: 'Evaluate',
      icon: CheckCircle,
      color: 'green',
      duration: phaseTiming.evaluate.duration,
      percentage: phaseTiming.evaluate.percentage,
      objectives: [
        'Test solutions with real users',
        'Measure impact and effectiveness',
        'Reflect on learning journey',
        'Present to authentic audience'
      ],
      activities: [],
      iterationPoints: [
        'Evaluation revealing critical improvements needed',
        'Feedback requiring design changes',
        'Success metrics not being met'
      ],
      differentiation: {
        advanced: ['Comprehensive evaluation metrics', 'Peer review leadership'],
        onLevel: ['Standard evaluation rubrics', 'Group presentations'],
        support: ['Simplified evaluation criteria', 'Supported presentations']
      }
    }
  ]);
  
  const getPhaseColor = (color: string) => {
    const colors = {
      blue: 'bg-primary-100 border-primary-300 text-primary-900',
      yellow: 'bg-yellow-100 border-yellow-300 text-yellow-900',
      purple: 'bg-purple-100 border-purple-300 text-purple-900',
      green: 'bg-green-100 border-green-300 text-green-900'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };
  
  const getPhaseAccent = (color: string) => {
    const colors = {
      blue: 'bg-primary-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      green: 'bg-green-500'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header with Clear Mental Model */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-primary-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Student Creative Process Journey
        </h1>
        <p className="text-lg text-gray-700 mb-4">
          You're designing how YOUR STUDENTS will journey through the Creative Process to tackle:
        </p>
        <div className="bg-white rounded-lg p-4 border border-primary-300">
          <p className="font-semibold text-primary-900 mb-2">{projectData.challenge}</p>
          <p className="text-gray-700">Essential Question: {projectData.essentialQuestion}</p>
          <div className="flex gap-4 mt-3 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {projectData.duration}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {projectData.gradeLevel}
            </span>
            <span>{projectData.subject}</span>
          </div>
        </div>
      </div>
      
      {/* Phase Overview */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          How Students Will Progress
        </h2>
        
        {/* Visual Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            {phases.map((phase, index) => (
              <motion.div
                key={phase.id}
                whileHover={{ scale: 1.02 }}
                className="relative"
              >
                <button
                  onClick={() => setActivePhase(phase.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    activePhase === phase.id
                      ? `${getPhaseColor(phase.color)} border-opacity-100`
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <phase.icon className="w-8 h-8 mx-auto mb-2" />
                  <h3 className="font-semibold">{phase.name}</h3>
                  <p className="text-sm mt-1">{phase.duration}</p>
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className={`${getPhaseAccent(phase.color)} h-2 rounded-full`}
                        style={{ width: `${phase.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs mt-1">{phase.percentage}% of time</p>
                  </div>
                </button>
                
                {index < phases.length - 1 && (
                  <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          
          {/* Iteration Note */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <RotateCcw className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-semibold text-orange-900">Iteration is Expected</p>
                <p className="text-sm text-orange-800 mt-1">
                  Students won't move through these phases linearly. Plan for loops back, 
                  pivots, and complete restarts. This is how real creative work happens.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Phase Details */}
      {activePhase !== 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          {phases.filter(p => p.id === activePhase).map(phase => (
            <div key={phase.id}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg ${getPhaseColor(phase.color)}`}>
                  <phase.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{phase.name} Phase</h3>
                  <p className="text-gray-600">{phase.duration} ({phase.percentage}% of project)</p>
                </div>
              </div>
              
              {/* Learning Objectives */}
              <div className="mb-6">
                <h4 className="font-semibold mb-2">What Students Will Do:</h4>
                <ul className="space-y-2">
                  {phase.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span className="text-gray-700">{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Iteration Points */}
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Common Iteration Triggers:</h4>
                <div className="bg-orange-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {phase.iterationPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                        <span className="text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Differentiation */}
              <div>
                <h4 className="font-semibold mb-2">Differentiation Strategies:</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-3">
                    <h5 className="font-medium text-green-900 mb-2">Advanced</h5>
                    <ul className="text-sm text-green-800 space-y-1">
                      {phase.differentiation.advanced.map((item, i) => (
                        <li key={i}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-primary-50 rounded-lg p-3">
                    <h5 className="font-medium text-primary-900 mb-2">On Level</h5>
                    <ul className="text-sm text-primary-800 space-y-1">
                      {phase.differentiation.onLevel.map((item, i) => (
                        <li key={i}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <h5 className="font-medium text-purple-900 mb-2">Support Needed</h5>
                    <ul className="text-sm text-purple-800 space-y-1">
                      {phase.differentiation.support.map((item, i) => (
                        <li key={i}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}
      
      {/* Iteration Strategy Planning */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <button
          onClick={() => setShowIterationStrategy(!showIterationStrategy)}
          className="w-full flex items-center justify-between text-left"
        >
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            Plan for Different Student Paces
          </h3>
          {showIterationStrategy ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
        </button>
        
        <AnimatePresence>
          {showIterationStrategy && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary-50 rounded-lg p-4">
                  <h4 className="font-semibold text-primary-900 mb-2">Fast Track Students</h4>
                  <p className="text-sm text-primary-800 mb-2">
                    Move quickly through phases, need enrichment
                  </p>
                  <ul className="text-sm text-primary-700 space-y-1">
                    <li>• Deeper research requirements</li>
                    <li>• Additional prototype iterations</li>
                    <li>• Peer mentoring responsibilities</li>
                    <li>• Extended evaluation criteria</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Standard Pace Students</h4>
                  <p className="text-sm text-green-800 mb-2">
                    Follow planned timeline with flexibility
                  </p>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Core objectives for each phase</li>
                    <li>• Planned activities and deliverables</li>
                    <li>• Regular check-ins and feedback</li>
                    <li>• Optional enrichment activities</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">Iteration Track Students</h4>
                  <p className="text-sm text-yellow-800 mb-2">
                    Need to loop back through phases
                  </p>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Structured reflection protocols</li>
                    <li>• Clear iteration decision points</li>
                    <li>• Documentation of learning from loops</li>
                    <li>• Modified timeline expectations</li>
                  </ul>
                </div>
                
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">Complete Pivot Students</h4>
                  <p className="text-sm text-red-800 mb-2">
                    Need to restart with new direction
                  </p>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Celebration of learning from "failure"</li>
                    <li>• Guided pivot decision process</li>
                    <li>• Accelerated timeline for second attempt</li>
                    <li>• Focus on process over product</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => onSave(phases)}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Save Progress
        </button>
        <button
          onClick={() => onComplete(phases)}
          className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          Complete Journey Design
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};