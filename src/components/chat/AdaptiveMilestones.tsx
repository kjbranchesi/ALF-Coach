/**
 * AdaptiveMilestones.tsx - Flexible milestone generation based on project duration
 * Lightweight solution for adaptive project timelines
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Minus, Clock } from 'lucide-react';

interface AdaptiveMilestone {
  id: string;
  title: string;
  timeline: string;
  optional: boolean;
}

interface AdaptiveMilestonesProps {
  projectDuration: 'oneWeek' | 'twoWeeks' | 'month' | 'quarter' | 'semester';
  onMilestonesGenerated: (milestones: AdaptiveMilestone[]) => void;
  initialMilestones?: AdaptiveMilestone[];
}

export const AdaptiveMilestones: React.FC<AdaptiveMilestonesProps> = ({
  projectDuration,
  onMilestonesGenerated,
  initialMilestones
}) => {
  const [milestones, setMilestones] = useState<AdaptiveMilestone[]>(
    initialMilestones || []
  );

  // Generate appropriate number of milestones based on duration
  useEffect(() => {
    if (!initialMilestones || initialMilestones.length === 0) {
      generateMilestones();
    }
  }, [projectDuration]);

  const generateMilestones = () => {
    let newMilestones: AdaptiveMilestone[] = [];
    
    switch (projectDuration) {
      case 'oneWeek':
        newMilestones = [
          { id: '1', title: 'Project Launch & Team Formation', timeline: 'Day 1', optional: false },
          { id: '2', title: 'Research & Planning', timeline: 'Day 2-3', optional: false },
          { id: '3', title: 'Final Presentation', timeline: 'Day 5', optional: false }
        ];
        break;
        
      case 'twoWeeks':
        newMilestones = [
          { id: '1', title: 'Project Kickoff', timeline: 'Day 1', optional: false },
          { id: '2', title: 'Initial Research Complete', timeline: 'Day 3', optional: false },
          { id: '3', title: 'First Prototype/Draft', timeline: 'Week 1 End', optional: false },
          { id: '4', title: 'Peer Review', timeline: 'Day 8', optional: true },
          { id: '5', title: 'Final Submission', timeline: 'Day 10', optional: false }
        ];
        break;
        
      case 'month':
        newMilestones = [
          { id: '1', title: 'Project Introduction', timeline: 'Week 1', optional: false },
          { id: '2', title: 'Research Phase Complete', timeline: 'Week 1-2', optional: false },
          { id: '3', title: 'Design/Planning Review', timeline: 'Week 2', optional: false },
          { id: '4', title: 'Mid-Project Check-in', timeline: 'Week 2-3', optional: true },
          { id: '5', title: 'Working Prototype', timeline: 'Week 3', optional: false },
          { id: '6', title: 'Testing & Iteration', timeline: 'Week 3-4', optional: true },
          { id: '7', title: 'Final Presentation', timeline: 'Week 4', optional: false }
        ];
        break;
        
      case 'quarter':
        // Generate weekly milestones for quarter
        newMilestones = [
          { id: '1', title: 'Project Launch', timeline: 'Week 1', optional: false },
          { id: '2', title: 'Team Formation & Planning', timeline: 'Week 1-2', optional: false },
          { id: '3', title: 'Research Complete', timeline: 'Week 3', optional: false },
          { id: '4', title: 'Initial Design Review', timeline: 'Week 4', optional: true },
          { id: '5', title: 'First Prototype', timeline: 'Week 5-6', optional: false },
          { id: '6', title: 'Mid-Quarter Review', timeline: 'Week 6', optional: false },
          { id: '7', title: 'User Testing', timeline: 'Week 7', optional: true },
          { id: '8', title: 'Iteration Phase', timeline: 'Week 8', optional: true },
          { id: '9', title: 'Final Development', timeline: 'Week 9-10', optional: false },
          { id: '10', title: 'Project Exhibition', timeline: 'Week 11', optional: false },
          { id: '11', title: 'Reflection & Documentation', timeline: 'Week 12', optional: true }
        ];
        break;
        
      case 'semester':
        // Monthly milestones for semester
        newMilestones = [
          { id: '1', title: 'Project Introduction & Teams', timeline: 'Month 1, Week 1', optional: false },
          { id: '2', title: 'Problem Definition Complete', timeline: 'Month 1, Week 3', optional: false },
          { id: '3', title: 'Research Phase Complete', timeline: 'Month 1, End', optional: false },
          { id: '4', title: 'Design Proposals', timeline: 'Month 2, Week 2', optional: false },
          { id: '5', title: 'Prototype Development', timeline: 'Month 2, End', optional: false },
          { id: '6', title: 'Mid-Semester Review', timeline: 'Month 3, Week 1', optional: false },
          { id: '7', title: 'Testing & Feedback', timeline: 'Month 3, Week 3', optional: true },
          { id: '8', title: 'Final Development Sprint', timeline: 'Month 4, Week 1-2', optional: false },
          { id: '9', title: 'Documentation Complete', timeline: 'Month 4, Week 3', optional: true },
          { id: '10', title: 'Final Presentation & Exhibition', timeline: 'Month 4, End', optional: false }
        ];
        break;
    }
    
    setMilestones(newMilestones);
    onMilestonesGenerated(newMilestones);
  };

  // Add custom milestone
  const addMilestone = () => {
    const newMilestone: AdaptiveMilestone = {
      id: Date.now().toString(),
      title: 'New Milestone',
      timeline: 'TBD',
      optional: true
    };
    const updated = [...milestones, newMilestone];
    setMilestones(updated);
    onMilestonesGenerated(updated);
  };

  // Remove milestone
  const removeMilestone = (id: string) => {
    const updated = milestones.filter(m => m.id !== id);
    setMilestones(updated);
    onMilestonesGenerated(updated);
  };

  // Toggle optional status
  const toggleOptional = (id: string) => {
    const updated = milestones.map(m => 
      m.id === id ? { ...m, optional: !m.optional } : m
    );
    setMilestones(updated);
    onMilestonesGenerated(updated);
  };

  // Update milestone
  const updateMilestone = (id: string, field: 'title' | 'timeline', value: string) => {
    const updated = milestones.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    );
    setMilestones(updated);
    onMilestonesGenerated(updated);
  };

  // Get duration label
  const getDurationLabel = () => {
    switch (projectDuration) {
      case 'oneWeek': return '1 Week Project';
      case 'twoWeeks': return '2 Week Project';
      case 'month': return '1 Month Project';
      case 'quarter': return 'Quarter-long Project';
      case 'semester': return 'Semester Project';
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-500" />
          Adaptive Milestones
        </h3>
        <span className="text-sm text-gray-500 flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {getDurationLabel()}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        {milestones.map((milestone, index) => (
          <div 
            key={milestone.id}
            className={`
              p-3 rounded-lg border
              ${milestone.optional 
                ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50' 
                : 'border-primary-200 dark:border-blue-800 bg-primary-50 dark:bg-primary-900/20'
              }
            `}
          >
            <div className="flex items-start gap-3">
              <span className="text-sm font-medium text-gray-500 mt-1">
                #{index + 1}
              </span>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={milestone.title}
                  onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                  className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary-500 text-sm"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={milestone.timeline}
                    onChange={(e) => updateMilestone(milestone.id, 'timeline', e.target.value)}
                    className="bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary-500 text-xs"
                    placeholder="Timeline"
                  />
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={milestone.optional}
                      onChange={() => toggleOptional(milestone.id)}
                      className="rounded"
                    />
                    Optional
                  </label>
                </div>
              </div>
              {milestone.optional && (
                <button
                  onClick={() => removeMilestone(milestone.id)}
                  className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <Minus className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addMilestone}
        className="w-full p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-400 transition-colors flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400"
      >
        <Plus className="w-4 h-4" />
        Add Custom Milestone
      </button>

      <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
        <p className="text-xs text-primary-700 dark:text-primary-300">
          Tip: Milestones automatically adjust based on project duration. Required milestones ensure key checkpoints, while optional ones can be removed or customized.
        </p>
      </div>
    </div>
  );
};
