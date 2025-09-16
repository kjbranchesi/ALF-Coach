/**
 * AlignmentDashboard.tsx - Visual alignment between objectives, activities, and assessments
 * FUTURE FEATURE: Shows clear connections between curriculum components
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Link, Target, Activity, CheckSquare, AlertCircle } from 'lucide-react';

interface AlignmentDashboardProps {
  objectives: Array<{ id: string; text: string }>;
  activities: Array<{ id: string; text: string; alignedTo: string[] }>;
  assessments: Array<{ id: string; text: string; measures: string[] }>;
}

export const AlignmentDashboard: React.FC<AlignmentDashboardProps> = ({
  objectives,
  activities,
  assessments
}) => {
  // Visual connection mapping
  const findAlignmentGaps = () => {
    const gaps = [];
    
    // Check if each objective has activities
    objectives.forEach(obj => {
      const hasActivity = activities.some(act => act.alignedTo.includes(obj.id));
      if (!hasActivity) {
        gaps.push({ type: 'missing-activity', objective: obj.text });
      }
    });
    
    // Check if each objective has assessment
    objectives.forEach(obj => {
      const hasAssessment = assessments.some(assess => assess.measures.includes(obj.id));
      if (!hasAssessment) {
        gaps.push({ type: 'missing-assessment', objective: obj.text });
      }
    });
    
    return gaps;
  };

  const gaps = findAlignmentGaps();

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Link className="w-5 h-5 text-primary-500" />
        Curriculum Alignment Dashboard
      </h2>

      {/* Visual Flow Diagram */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Objectives Column */}
        <div>
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Learning Objectives
          </h3>
          {objectives.map(obj => (
            <motion.div
              key={obj.id}
              className="p-3 mb-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-blue-800"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-sm">{obj.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Activities Column */}
        <div>
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Learning Activities
          </h3>
          {activities.map(act => (
            <motion.div
              key={act.id}
              className="p-3 mb-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-sm">{act.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Assessments Column */}
        <div>
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            Assessments
          </h3>
          {assessments.map(assess => (
            <motion.div
              key={assess.id}
              className="p-3 mb-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-sm">{assess.text}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Alignment Gaps */}
      {gaps.length > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            Alignment Gaps Detected
          </h3>
          <ul className="space-y-1">
            {gaps.map((gap, index) => (
              <li key={index} className="text-sm text-amber-800 dark:text-amber-200">
                • {gap.type === 'missing-activity' ? 'Missing activity for: ' : 'Missing assessment for: '}
                {gap.objective}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};