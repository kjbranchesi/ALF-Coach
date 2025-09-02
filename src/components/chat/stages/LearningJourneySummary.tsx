/**
 * LearningJourneySummary.tsx - Clear, actionable summary of the complete learning journey
 * 
 * ADDRESSES PROBLEM #7: "No cohesive plan at the end"
 * 
 * This component creates a comprehensive, teacher-ready summary that:
 * - Shows the complete learning journey as a coherent plan
 * - Connects all elements (ideation -> progression -> activities -> resources)
 * - Provides actionable next steps
 * - Offers multiple export/sharing options
 * - Includes implementation guidance
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Download, 
  Share2, 
  Calendar, 
  Users, 
  Target, 
  Lightbulb,
  ArrowRight,
  BookOpen,
  Clock,
  Wrench,
  Sparkles
} from 'lucide-react';
import { Button } from '../../ui/Button';

interface LearningJourneySummaryProps {
  journeyData: {
    ideation: {
      bigIdea: string;
      essentialQuestion: string;
      challenge: string;
    };
    journey: {
      progression: string;
      activities: string;
      resources: string;
    };
    wizard: {
      subject: string;
      students: {
        gradeLevel: string;
        count: number;
      };
      timeframe: string;
    };
  };
  onExport?: () => void;
  onShare?: () => void;
  onEditSection?: (section: string) => void;
}

export const LearningJourneySummary: React.FC<LearningJourneySummaryProps> = ({
  journeyData,
  onExport,
  onShare, 
  onEditSection
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'implementation' | 'materials'>('overview');

  const formatTimeEstimate = (progression: string) => {
    // Extract time estimate from progression text
    const weeks = progression.toLowerCase().match(/(\d+)[-\s]*week/g);
    if (weeks && weeks.length > 0) {
      const totalWeeks = weeks.length;
      return `${totalWeeks} week${totalWeeks > 1 ? 's' : ''}`;
    }
    return 'Flexible timing';
  };

  const parseProgression = (progressionText: string) => {
    // Split on arrows or numbers to create individual stages
    const stages = progressionText
      .split(/→|->|\d+[.:]|\n/)
      .map(stage => stage.trim())
      .filter(stage => stage.length > 0);
    
    return stages;
  };

  const parseActivities = (activitiesText: string) => {
    // Parse activities and try to group them with progression stages
    const activities = activitiesText
      .split(/[,;]|\n/)
      .map(activity => activity.trim())
      .filter(activity => activity.length > 0);
    
    return activities;
  };

  const parseResources = (resourcesText: string) => {
    // Parse resources into categories
    const resources = resourcesText
      .split(/[,;]|\n/)
      .map(resource => resource.trim())
      .filter(resource => resource.length > 0);
    
    // Categorize resources
    const categorized = {
      materials: resources.filter(r => /material|supplies|tool|equipment/i.test(r)),
      people: resources.filter(r => /speaker|expert|volunteer|mentor|partner/i.test(r)),
      technology: resources.filter(r => /software|app|platform|digital|online|computer/i.test(r)),
      other: resources.filter(r => 
        !/material|supplies|tool|equipment|speaker|expert|volunteer|mentor|partner|software|app|platform|digital|online|computer/i.test(r)
      )
    };

    return categorized;
  };

  const stages = parseProgression(journeyData.journey.progression);
  const activities = parseActivities(journeyData.journey.activities);
  const resources = parseResources(journeyData.journey.resources);

  return (
    <div className="learning-journey-summary max-w-5xl mx-auto p-6">
      {/* Header with celebration */}
      <div className="text-center mb-8 glass-squircle card-pad-lg anim-ease border border-green-200 dark:border-green-700">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Your Learning Journey is Complete!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          You've created a comprehensive, student-centered learning experience. Here's your complete plan, 
          ready to implement with your {journeyData.wizard.students.count} {journeyData.wizard.students.gradeLevel} students.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-squircle card-pad anim-ease border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {formatTimeEstimate(journeyData.journey.progression)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="glass-squircle card-pad anim-ease border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Stages</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {stages.length} phases
              </p>
            </div>
          </div>
        </div>
        
        <div className="glass-squircle card-pad anim-ease border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Activities</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {activities.length} experiences
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Wrench className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Resources</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {Object.values(resources).flat().length} items
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for different views */}
      <div className="mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'overview', label: 'Journey Overview', icon: BookOpen },
            { id: 'implementation', label: 'Implementation Guide', icon: Calendar },
            { id: 'materials', label: 'Materials List', icon: Wrench }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Foundation Section */}
            <section className="glass-squircle card-pad-lg anim-ease border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Project Foundation
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Big Idea:</h4>
                  <p className="text-gray-900 dark:text-gray-100">{journeyData.ideation.bigIdea}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Essential Question:</h4>
                  <p className="text-gray-900 dark:text-gray-100">{journeyData.ideation.essentialQuestion}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Student Challenge:</h4>
                  <p className="text-gray-900 dark:text-gray-100">{journeyData.ideation.challenge}</p>
                </div>
              </div>
            </section>

            {/* Learning Journey Flow */}
            <section className="glass-squircle card-pad-lg anim-ease border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Learning Journey Flow
              </h3>
              <div className="space-y-4">
                {stages.map((stage, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{stage}</p>
                      {activities[index] && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Key activity: {activities[index]}
                        </p>
                      )}
                    </div>
                    {index < stages.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        )}

        {activeTab === 'implementation' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Implementation Timeline */}
            <section className="glass-squircle card-pad-lg anim-ease border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-500" />
                Implementation Timeline
              </h3>
              <div className="space-y-4">
                {stages.map((stage, index) => (
                  <div key={index} className="border-l-4 border-blue-200 dark:border-blue-800 pl-6 pb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Stage {index + 1}: {stage}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Students will:</span> Engage in {activities[index] || 'related activities'}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">You will need:</span> Resources and materials for this stage
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Success looks like:</span> Students progress toward the essential question
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Next Steps */}
            <section className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Ready to Start?
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Before you begin:</h4>
                  <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• Review and gather all resources</li>
                    <li>• Prepare materials for first stage</li>
                    <li>• Set up learning spaces as needed</li>
                    <li>• Connect with any expert speakers</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">During the project:</h4>
                  <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• Check student understanding regularly</li>
                    <li>• Document the learning journey</li>
                    <li>• Adjust timing based on student needs</li>
                    <li>• Celebrate progress at each stage</li>
                  </ul>
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {activeTab === 'materials' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Resource Categories */}
            {Object.entries(resources).map(([category, items]) => (
              items.length > 0 && (
                <section key={category} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 capitalize flex items-center gap-2">
                    {category === 'materials' && <Wrench className="w-5 h-5 text-orange-500" />}
                    {category === 'people' && <Users className="w-5 h-5 text-blue-500" />}
                    {category === 'technology' && <BookOpen className="w-5 h-5 text-green-500" />}
                    {category === 'other' && <Target className="w-5 h-5 text-purple-500" />}
                    {category} Resources
                  </h3>
                  <div className="grid md:grid-cols-2 gap-2">
                    {items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700 dark:text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )
            ))}
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button onClick={onExport} variant="primary" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Complete Plan
        </Button>
        
        <Button onClick={onShare} variant="secondary" className="flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          Share Journey
        </Button>
        
        <Button 
          onClick={() => onEditSection?.('journey')} 
          variant="ghost"
          className="flex items-center gap-2"
        >
          Edit Learning Journey
        </Button>
      </div>

      {/* Footer note */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          This learning journey was designed to engage your {journeyData.wizard.students.gradeLevel} students 
          in meaningful, authentic learning experiences that build both knowledge and skills.
        </p>
      </div>
    </div>
  );
};

export default LearningJourneySummary;
