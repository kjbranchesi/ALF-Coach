import React from 'react';
import { motion } from 'framer-motion';

const LiveFrameworkBuilder = ({ 
  projectInfo, 
  ideationData, 
  journeyData, 
  deliverablesData, 
  currentStage,
  className = ""
}) => {
  // Determine completion status for each stage
  const ideationComplete = ideationData?.bigIdea && ideationData?.essentialQuestion && ideationData?.challenge;
  const journeyComplete = journeyData?.phases?.length >= 2 && journeyData?.resources?.length > 0;
  const deliverablesComplete = deliverablesData?.milestones?.length > 0 && deliverablesData?.assessmentMethods?.length > 0;

  const getStageStatus = (stage) => {
    switch (stage) {
      case 'Ideation':
        return ideationComplete ? 'complete' : (currentStage === 'Ideation' ? 'active' : 'pending');
      case 'Learning Journey':
        return journeyComplete ? 'complete' : (currentStage === 'Learning Journey' ? 'active' : ideationComplete ? 'pending' : 'locked');
      case 'Student Deliverables':
        return deliverablesComplete ? 'complete' : (currentStage === 'Student Deliverables' ? 'active' : journeyComplete ? 'pending' : 'locked');
      default:
        return 'locked';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete': return '✓';
      case 'active': return '🔄';
      case 'pending': return '⏳';
      case 'locked': return '🔒';
      default: return '○';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete': return 'text-green-600 bg-green-50 border-green-200';
      case 'active': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'locked': return 'text-gray-400 bg-gray-50 border-gray-200';
      default: return 'text-gray-400 bg-gray-50 border-gray-200';
    }
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const StageCard = ({ title, icon, status, children }) => {
    const statusColor = getStatusColor(status);
    const statusIcon = getStatusIcon(status);
    
    return (
      <motion.div
        className={`border-2 rounded-lg p-4 transition-all duration-300 ${statusColor}`}
        animate={{
          scale: status === 'active' ? 1.02 : 1,
          opacity: status === 'locked' ? 0.7 : 1
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <span className="text-lg">{icon}</span>
            {title}
          </h3>
          <span className="text-lg">{statusIcon}</span>
        </div>
        <div className="space-y-2 text-xs">
          {children}
        </div>
      </motion.div>
    );
  };

  const ProgressConnection = ({ fromStatus, toStatus }) => {
    const isConnected = fromStatus === 'complete';
    return (
      <div className="flex justify-center py-2">
        <div className={`w-0.5 h-6 rounded-full transition-colors duration-300 ${
          isConnected ? 'bg-green-400' : 'bg-gray-300'
        }`} />
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span className="text-xl">🏗️</span>
          Your Active Learning Framework
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Building authentic learning for {projectInfo?.subject} • {projectInfo?.ageGroup}
        </p>
      </div>

      <div className="p-4 space-y-1">
        {/* Ideation Stage */}
        <StageCard 
          title="IDEATION" 
          icon="🎯" 
          status={getStageStatus('Ideation')}
        >
          <div className="grid grid-cols-1 gap-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Big Idea:</span>
              <span className="font-medium text-right">
                {ideationData?.bigIdea ? truncateText(ideationData.bigIdea, 30) : 'Pending...'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Question:</span>
              <span className="font-medium text-right">
                {ideationData?.essentialQuestion ? truncateText(ideationData.essentialQuestion, 30) : 'Pending...'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Challenge:</span>
              <span className="font-medium text-right">
                {ideationData?.challenge ? truncateText(ideationData.challenge, 30) : 'Pending...'}
              </span>
            </div>
          </div>
        </StageCard>

        <ProgressConnection 
          fromStatus={getStageStatus('Ideation')} 
          toStatus={getStageStatus('Learning Journey')} 
        />

        {/* Journey Stage */}
        <StageCard 
          title="LEARNING JOURNEY" 
          icon="🗺️" 
          status={getStageStatus('Learning Journey')}
        >
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Phases:</span>
              <span className="font-medium text-right">
                {journeyData?.phases?.length > 0 
                  ? `${journeyData.phases.length} defined`
                  : 'Pending...'
                }
              </span>
            </div>
            {journeyData?.phases?.length > 0 && (
              <div className="bg-gray-50 rounded p-2">
                {journeyData.phases.slice(0, 2).map((phase, index) => (
                  <div key={index} className="text-xs text-gray-700">
                    {index + 1}. {truncateText(phase.title || phase, 25)}
                  </div>
                ))}
                {journeyData.phases.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{journeyData.phases.length - 2} more...
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Resources:</span>
              <span className="font-medium text-right">
                {journeyData?.resources?.length > 0 
                  ? `${journeyData.resources.length} defined`
                  : 'After phases...'
                }
              </span>
            </div>
          </div>
        </StageCard>

        <ProgressConnection 
          fromStatus={getStageStatus('Learning Journey')} 
          toStatus={getStageStatus('Student Deliverables')} 
        />

        {/* Deliverables Stage */}
        <StageCard 
          title="STUDENT DELIVERABLES" 
          icon="📋" 
          status={getStageStatus('Student Deliverables')}
        >
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Milestones:</span>
              <span className="font-medium text-right">
                {deliverablesData?.milestones?.length > 0 
                  ? `${deliverablesData.milestones.length} defined`
                  : 'After journey...'
                }
              </span>
            </div>
            {deliverablesData?.milestones?.length > 0 && (
              <div className="bg-gray-50 rounded p-2">
                {deliverablesData.milestones.slice(0, 2).map((milestone, index) => (
                  <div key={index} className="text-xs text-gray-700">
                    {index + 1}. {truncateText(milestone.title || milestone, 25)}
                  </div>
                ))}
                {deliverablesData.milestones.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{deliverablesData.milestones.length - 2} more...
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Assessment:</span>
              <span className="font-medium text-right">
                {deliverablesData?.assessmentMethods?.length > 0 
                  ? 'Defined'
                  : 'After milestones...'
                }
              </span>
            </div>
          </div>
        </StageCard>

        {/* Completion Status */}
        {ideationComplete && journeyComplete && deliverablesComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center"
          >
            <div className="text-green-600 font-semibold text-sm flex items-center justify-center gap-2">
              <span className="text-lg">🎉</span>
              Framework Complete!
            </div>
            <p className="text-xs text-green-600 mt-1">
              Ready for implementation
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LiveFrameworkBuilder;