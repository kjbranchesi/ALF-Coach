import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Target, Shuffle, Plus, X, Check, Info, AlertTriangle } from 'lucide-react';
import { StepComponentProps } from '../types';
import { Phase, Milestone, Tier, ID } from '../../../types/alf';

// Phase templates following Double Diamond model
const PHASE_TEMPLATES = {
  discovery: {
    name: 'Discovery-Focused',
    description: 'Emphasis on research and exploration',
    phases: [
      { name: 'Discover', duration: '35%', focus: 'Research, empathy, problem exploration' },
      { name: 'Define', duration: '20%', focus: 'Problem framing, goal setting' },
      { name: 'Develop', duration: '25%', focus: 'Solution development' },
      { name: 'Deliver', duration: '15%', focus: 'Implementation and sharing' },
      { name: 'Reflect', duration: '5%', focus: 'Learning synthesis' }
    ]
  },
  balanced: {
    name: 'Balanced Approach',
    description: 'Equal emphasis across all phases',
    phases: [
      { name: 'Discover', duration: '20%', focus: 'Context and research' },
      { name: 'Define', duration: '20%', focus: 'Goals and planning' },
      { name: 'Develop', duration: '30%', focus: 'Creating solutions' },
      { name: 'Deliver', duration: '20%', focus: 'Presentation and exhibition' },
      { name: 'Reflect', duration: '10%', focus: 'Assessment and iteration' }
    ]
  },
  buildHeavy: {
    name: 'Build-Heavy',
    description: 'More time for creation and iteration',
    phases: [
      { name: 'Discover', duration: '15%', focus: 'Quick research sprint' },
      { name: 'Define', duration: '15%', focus: 'Rapid goal setting' },
      { name: 'Develop', duration: '40%', focus: 'Extended creation time' },
      { name: 'Deliver', duration: '20%', focus: 'Polish and presentation' },
      { name: 'Reflect', duration: '10%', focus: 'Improvement insights' }
    ]
  },
  inquiryDriven: {
    name: 'Inquiry-Driven',
    description: 'Deep research and investigation focus',
    phases: [
      { name: 'Discover', duration: '40%', focus: 'Deep investigation' },
      { name: 'Define', duration: '15%', focus: 'Hypothesis formation' },
      { name: 'Develop', duration: '20%', focus: 'Evidence synthesis' },
      { name: 'Deliver', duration: '15%', focus: 'Findings presentation' },
      { name: 'Reflect', duration: '10%', focus: 'Research reflection' }
    ]
  },
  designSprint: {
    name: 'Design Sprint',
    description: 'Rapid prototyping and testing',
    phases: [
      { name: 'Discover', duration: '10%', focus: 'Problem identification' },
      { name: 'Define', duration: '10%', focus: 'Solution sketching' },
      { name: 'Develop', duration: '50%', focus: 'Rapid prototyping cycles' },
      { name: 'Deliver', duration: '20%', focus: 'Testing and feedback' },
      { name: 'Reflect', duration: '10%', focus: 'Iteration planning' }
    ]
  }
};

// Milestone templates for each phase
const MILESTONE_TEMPLATES: Record<string, string[]> = {
  Discover: [
    'Project Launch & Team Formation',
    'Initial Research Complete',
    'Community Partner Connection',
    'Problem Statement Draft'
  ],
  Define: [
    'Essential Question Finalized',
    'Learning Goals Approved',
    'Project Plan Complete',
    'Resources Secured'
  ],
  Develop: [
    'First Prototype/Draft',
    'Peer Review Session',
    'Mid-Project Checkpoint',
    'Final Product Draft'
  ],
  Deliver: [
    'Final Product Complete',
    'Presentation Ready',
    'Exhibition Day',
    'Community Feedback Collected'
  ],
  Reflect: [
    'Self-Assessment Complete',
    'Portfolio Updated',
    'Celebration & Recognition',
    'Next Steps Identified'
  ]
};

const generateId = (prefix: string): ID => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as ID;
};

export const PhasesMilestonesStep: React.FC<StepComponentProps> = ({
  data,
  onUpdate,
  onNext,
  onBack
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof PHASE_TEMPLATES>('balanced');
  const [phases, setPhases] = useState<Phase[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [customizing, setCustomizing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDivergeOptions, setShowDivergeOptions] = useState(true);

  // Calculate dates based on project duration
  const projectDuration = useMemo(() => {
    const timeWindow = data.projectContext?.timeWindow || '4 weeks';
    const weeks = parseInt(timeWindow) || 4;
    return weeks * 7 * 24 * 60 * 60 * 1000; // Convert to milliseconds
  }, [data.projectContext]);

  // Generate phases and milestones from template
  const generateFromTemplate = (templateKey: keyof typeof PHASE_TEMPLATES) => {
    const template = PHASE_TEMPLATES[templateKey];
    const startDate = new Date();
    let currentDate = new Date(startDate);
    
    const newPhases: Phase[] = [];
    const newMilestones: Milestone[] = [];
    
    template.phases.forEach((phaseTemplate, index) => {
      const durationPercent = parseInt(phaseTemplate.duration) / 100;
      const phaseDuration = projectDuration * durationPercent;
      const endDate = new Date(currentDate.getTime() + phaseDuration);
      
      const phase: Phase = {
        id: generateId('phase'),
        name: phaseTemplate.name,
        description: phaseTemplate.focus,
        startDate: currentDate.toISOString(),
        endDate: endDate.toISOString(),
        goals: data.learningGoals?.slice(index, index + 1) || [],
        tier: 'core' as Tier,
        confidence: 0.85
      };
      
      newPhases.push(phase);
      
      // Generate milestones for this phase
      const phaseMilestones = MILESTONE_TEMPLATES[phaseTemplate.name] || [];
      const milestoneInterval = phaseDuration / (phaseMilestones.length + 1);
      
      phaseMilestones.forEach((milestoneName, mIndex) => {
        const milestoneDate = new Date(currentDate.getTime() + milestoneInterval * (mIndex + 1));
        const milestone: Milestone = {
          id: generateId('milestone'),
          phaseId: phase.id,
          name: milestoneName,
          description: `Key checkpoint for ${phase.name.toLowerCase()} phase`,
          dueDate: milestoneDate.toISOString(),
          evidence: generateEvidenceList(phaseTemplate.name, milestoneName),
          owner: mIndex === 0 ? 'Teacher' : 'Students',
          tier: mIndex < 2 ? 'core' as Tier : 'scaffold' as Tier,
          confidence: mIndex < 2 ? 0.9 : 0.75
        };
        newMilestones.push(milestone);
      });
      
      currentDate = endDate;
    });
    
    setPhases(newPhases);
    setMilestones(newMilestones);
    setSelectedTemplate(templateKey);
    setShowDivergeOptions(false);
  };

  // Generate evidence list based on phase and milestone
  const generateEvidenceList = (phaseName: string, milestoneName: string): string[] => {
    const evidenceMap: Record<string, string[]> = {
      'Project Launch': ['Team contracts signed', 'Project overview documented', 'Initial questions logged'],
      'Research Complete': ['Research notes compiled', 'Sources documented', 'Key findings summarized'],
      'Partner Connection': ['Partner agreement signed', 'Communication log started', 'Needs assessment complete'],
      'Essential Question': ['EQ iterations documented', 'Stakeholder feedback collected', 'Final EQ posted'],
      'First Prototype': ['Prototype photos/documentation', 'Design rationale written', 'Test plan created'],
      'Peer Review': ['Feedback forms completed', 'Revision plan documented', 'Peer ratings collected'],
      'Final Product': ['Product complete', 'Quality checklist verified', 'Documentation finalized'],
      'Exhibition': ['Presentation delivered', 'Audience feedback collected', 'Media captured'],
      'Self-Assessment': ['Rubric self-scores', 'Reflection essay', 'Growth evidence documented']
    };
    
    // Find matching evidence or return defaults
    for (const [key, evidence] of Object.entries(evidenceMap)) {
      if (milestoneName.includes(key)) {
        return evidence;
      }
    }
    
    // Default evidence
    return ['Progress documented', 'Work samples collected', 'Reflection notes'];
  };

  // Update a phase
  const updatePhase = (phaseId: ID, updates: Partial<Phase>) => {
    setPhases(phases.map(p => p.id === phaseId ? { ...p, ...updates } : p));
    setCustomizing(true);
  };

  // Update a milestone
  const updateMilestone = (milestoneId: ID, updates: Partial<Milestone>) => {
    setMilestones(milestones.map(m => m.id === milestoneId ? { ...m, ...updates } : m));
    setCustomizing(true);
  };

  // Add custom milestone
  const addMilestone = (phaseId: ID) => {
    const phase = phases.find(p => p.id === phaseId);
    if (!phase) return;
    
    const newMilestone: Milestone = {
      id: generateId('milestone'),
      phaseId,
      name: 'New Milestone',
      description: 'Custom milestone',
      dueDate: phase.startDate,
      evidence: ['Evidence to be determined'],
      owner: 'Students',
      tier: 'scaffold' as Tier,
      confidence: 0.7
    };
    
    setMilestones([...milestones, newMilestone]);
    setCustomizing(true);
  };

  // Remove milestone
  const removeMilestone = (milestoneId: ID) => {
    setMilestones(milestones.filter(m => m.id !== milestoneId));
  };

  // Validation
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (phases.length === 0) {
      newErrors.phases = 'Please select a phase template or create custom phases';
    }
    
    if (milestones.length < 4) {
      newErrors.milestones = 'Please ensure at least 4 milestones are defined';
    }
    
    // Check for feasibility
    const totalDuration = phases.reduce((acc, phase) => {
      const start = new Date(phase.startDate).getTime();
      const end = new Date(phase.endDate).getTime();
      return acc + (end - start);
    }, 0);
    
    if (totalDuration > projectDuration * 1.1) {
      newErrors.feasibility = 'Timeline exceeds available project duration';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submission
  const handleSubmit = () => {
    if (validate()) {
      onUpdate({ phases, milestones });
      onNext();
    }
  };

  // Shuffle templates (diverge behavior)
  const shuffleTemplates = () => {
    const templates = Object.keys(PHASE_TEMPLATES) as Array<keyof typeof PHASE_TEMPLATES>;
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    generateFromTemplate(randomTemplate);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Design Your Project Phases & Milestones
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          {showDivergeOptions 
            ? "Choose a phase structure that matches your project style (Diverge)"
            : "Customize your timeline and checkpoints (Converge)"}
        </p>
      </div>

      {/* Diverge: Template Selection */}
      {showDivergeOptions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-600" />
              Phase Templates
              <span className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full">
                Diverge
              </span>
            </h4>
            <button
              onClick={shuffleTemplates}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50"
            >
              <Shuffle className="w-4 h-4" />
              Random Template
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(PHASE_TEMPLATES).map(([key, template]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => generateFromTemplate(key as keyof typeof PHASE_TEMPLATES)}
                className={`
                  p-4 rounded-xl border-2 text-left transition-all
                  ${selectedTemplate === key && !showDivergeOptions
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }
                `}
              >
                <h5 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  {template.name}
                </h5>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {template.description}
                </p>
                <div className="space-y-1">
                  {template.phases.map((phase, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300">{phase.name}</span>
                      <span className="text-slate-500 dark:text-slate-400">{phase.duration}</span>
                    </div>
                  ))}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Converge: Timeline Visualization */}
      {!showDivergeOptions && phases.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Project Timeline
              <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                Converge
              </span>
            </h4>
            <button
              onClick={() => setShowDivergeOptions(true)}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Choose Different Template
            </button>
          </div>

          {/* Phase Timeline */}
          <div className="space-y-4">
            {phases.map((phase, phaseIndex) => (
              <div key={phase.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={phase.name}
                      onChange={(e) => updatePhase(phase.id, { name: e.target.value })}
                      className="font-semibold text-slate-800 dark:text-slate-200 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-primary-500 focus:outline-none"
                    />
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {new Date(phase.startDate).toLocaleDateString()} - {new Date(phase.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${phase.tier === 'core' 
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      }
                    `}>
                      {phase.tier}
                    </span>
                    <button
                      onClick={() => addMilestone(phase.id)}
                      className="text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 p-1 rounded"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Phase Milestones */}
                <div className="space-y-2 ml-4">
                  {milestones
                    .filter(m => m.phaseId === phase.id)
                    .map((milestone) => (
                      <div key={milestone.id} className="flex items-start gap-3 p-2 bg-slate-50 dark:bg-slate-800 rounded">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                        <div className="flex-1">
                          <input
                            type="text"
                            value={milestone.name}
                            onChange={(e) => updateMilestone(milestone.id, { name: e.target.value })}
                            className="font-medium text-sm text-slate-700 dark:text-slate-300 bg-transparent w-full focus:outline-none"
                          />
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {new Date(milestone.dueDate).toLocaleDateString()} • {milestone.owner}
                          </p>
                          <div className="mt-2">
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Evidence:</p>
                            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                              {milestone.evidence.map((item, idx) => (
                                <li key={idx}>• {item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <button
                          onClick={() => removeMilestone(milestone.id)}
                          className="text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Feasibility Check */}
          {errors.feasibility && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    Feasibility Warning
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                    {errors.feasibility}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Stage Gate: Validation Message */}
      {errors.phases || errors.milestones ? (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.phases || errors.milestones}
          </p>
        </div>
      ) : null}

      {/* Info box */}
      <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-primary-800 dark:text-primary-300">
              <strong>Double Diamond Approach:</strong> We start by exploring multiple phase structures (diverge), 
              then refine and customize your chosen timeline (converge). Each milestone should have clear evidence 
              requirements to track progress and ensure accountability.
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-between gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={phases.length === 0}
          className={`
            px-6 py-3 rounded-xl font-medium shadow-lg transition-colors
            ${phases.length === 0
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-primary-600 text-white hover:bg-primary-700'
            }
          `}
        >
          Continue to Artifacts & Rubrics
        </button>
      </div>
    </div>
  );
};
