/**
 * JourneySummary.tsx - Shows cohesive learning journey plan after completion
 * Simple, clear summary of progression, activities, and resources
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Share2, ArrowRight, Calendar, Users, Package } from 'lucide-react';
import { textStyles } from '../../../design-system/typography.config';

interface JourneySummaryProps {
  journeyData: {
    progression: string;
    activities: string;
    resources: string;
  };
  ideationData: {
    bigIdea?: string;
    essentialQuestion?: string;
    challenge?: string;
  };
  wizardData?: {
    timeline?: string;
    students?: {
      gradeLevel?: string;
      classSize?: string;
    };
  };
  onContinue: () => void;
  onExport?: () => void;
}

export const JourneySummary: React.FC<JourneySummaryProps> = ({
  journeyData,
  ideationData,
  wizardData,
  onContinue,
  onExport
}) => {
  // Parse the progression into steps
  const parseProgression = (progression: string): string[] => {
    // Split by arrows or common separators
    const separators = ['→', '->', ':', 'then', 'Week', 'Phase', 'Step'];
    let steps = [progression];
    
    for (const separator of separators) {
      if (progression.includes(separator)) {
        steps = progression.split(separator).filter(s => s.trim());
        break;
      }
    }
    
    return steps.map(s => s.trim());
  };

  // Parse activities into list
  const parseActivities = (activities: string): string[] => {
    // Split by periods, commas, or line breaks
    const parts = activities.split(/[.;\n]/).filter(s => s.trim());
    return parts.map(s => s.trim());
  };

  // Parse resources into categories
  const parseResources = (resources: string): { materials: string[], people: string[], tools: string[] } => {
    const result = { materials: [], people: [], tools: [] };
    const parts = resources.toLowerCase();
    
    // Simple categorization based on keywords
    const allItems = resources.split(/[,;\n]/).filter(s => s.trim());
    
    allItems.forEach(item => {
      const lower = item.toLowerCase();
      if (lower.includes('material') || lower.includes('supplies') || lower.includes('paper') || lower.includes('board')) {
        result.materials.push(item.trim());
      } else if (lower.includes('people') || lower.includes('expert') || lower.includes('volunteer') || lower.includes('mentor')) {
        result.people.push(item.trim());
      } else if (lower.includes('tool') || lower.includes('software') || lower.includes('technology') || lower.includes('digital')) {
        result.tools.push(item.trim());
      } else {
        // Default to materials if unclear
        result.materials.push(item.trim());
      }
    });
    
    return result;
  };

  const progressionSteps = parseProgression(journeyData.progression);
  const activityList = parseActivities(journeyData.activities);
  const resourceCategories = parseResources(journeyData.resources);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="journey-summary max-w-4xl mx-auto p-6"
    >
      {/* Success header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Your Learning Journey is Ready!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Here's your complete plan for: <strong>{ideationData.challenge}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Journey Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Learning Progression
        </h3>
        
        {/* Visual timeline */}
        <div className="relative mb-6">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700" />
          <div className="relative flex justify-between">
            {progressionSteps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10 ${
                  idx === 0 
                    ? 'bg-blue-500 text-white'
                    : idx === progressionSteps.length - 1
                    ? 'bg-green-500 text-white'
                    : 'bg-amber-500 text-white'
                }`}>
                  {idx + 1}
                </div>
                <p className="text-xs text-center mt-2 text-gray-600 dark:text-gray-400 max-w-[100px]">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline info */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Duration: {wizardData?.timeline || '4 weeks'}</span>
          <span>Grade Level: {wizardData?.students?.gradeLevel || 'Not specified'}</span>
          <span>Class Size: {wizardData?.students?.classSize || 'Not specified'}</span>
        </div>
      </div>

      {/* Activities */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          Key Learning Activities
        </h3>
        <div className="space-y-2">
          {activityList.map((activity, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <span className="text-purple-500 mt-1">•</span>
              <span className="text-gray-700 dark:text-gray-300">{activity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          Resources & Support
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          {resourceCategories.materials.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Materials</h4>
              <ul className="space-y-1">
                {resourceCategories.materials.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">• {item}</li>
                ))}
              </ul>
            </div>
          )}
          
          {resourceCategories.people.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">People</h4>
              <ul className="space-y-1">
                {resourceCategories.people.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">• {item}</li>
                ))}
              </ul>
            </div>
          )}
          
          {resourceCategories.tools.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Tools & Technology</h4>
              <ul className="space-y-1">
                {resourceCategories.tools.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">• {item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Student Agency Note (for higher grades) */}
      {(wizardData?.students?.gradeLevel?.includes('high') || 
        wizardData?.students?.gradeLevel?.includes('university')) && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Student Agency Note:</strong> Consider where students can make choices about their learning path, 
            select their own research focus, or design their own assessment criteria within this framework.
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <button
            onClick={onExport}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Plan
          </button>
          <button
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-2 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
        
        <button
          onClick={onContinue}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
        >
          Continue to Deliverables
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default JourneySummary;