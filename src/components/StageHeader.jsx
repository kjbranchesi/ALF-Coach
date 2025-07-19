// src/components/StageHeader.jsx - Visual Stage Identity System
import React from 'react';
import { PROJECT_STAGES } from '../config/constants.js';

// Stage Icons
const IdeationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
    <path d="M9 18h6"/>
    <path d="M10 22h4"/>
  </svg>
);

const JourneyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const DeliverablesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
    <circle cx="12" cy="13" r="3"/>
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

// Stage Configuration
const STAGE_CONFIG = {
  [PROJECT_STAGES.IDEATION]: {
    icon: <IdeationIcon />,
    name: "Ideation",
    subtitle: "Define Your Project Catalyst",
    description: "Establish the Big Idea, Essential Question, and Challenge that will drive authentic learning",
    color: "purple",
    bgGradient: "from-purple-50 to-indigo-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-800",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-700",
    steps: ["Big Idea", "Essential Question", "Challenge"]
  },
  [PROJECT_STAGES.LEARNING_JOURNEY]: {
    icon: <JourneyIcon />,
    name: "Learning Journey", 
    subtitle: "Design Your Curriculum Path",
    description: "Create scaffolded learning experiences that build toward your authentic challenge",
    color: "blue",
    bgGradient: "from-blue-50 to-cyan-50",
    borderColor: "border-blue-200", 
    textColor: "text-blue-800",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
    steps: ["Learning Objectives", "Key Activities", "Scaffolding Plan"]
  },
  [PROJECT_STAGES.DELIVERABLES]: {
    icon: <DeliverablesIcon />,
    name: "Student Deliverables",
    subtitle: "Create Authentic Assessments", 
    description: "Design meaningful ways for students to demonstrate and share their learning",
    color: "emerald",
    bgGradient: "from-emerald-50 to-teal-50",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-800", 
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-700",
    steps: ["Assessment Design", "Rubric Creation", "Community Connection"]
  },
  [PROJECT_STAGES.COMPLETED]: {
    icon: <CheckIcon />,
    name: "Project Complete",
    subtitle: "Ready to Launch",
    description: "Your project is complete and ready for implementation",
    color: "green",
    bgGradient: "from-green-50 to-emerald-50", 
    borderColor: "border-green-200",
    textColor: "text-green-800",
    iconBg: "bg-green-100", 
    iconColor: "text-green-700",
    steps: ["Final Review", "Implementation", "Reflection"]
  }
};

const StageHeader = ({ 
  stage, 
  showDescription = true, 
  showSteps = false, 
  currentStep = null,
  className = ""
}) => {
  const config = STAGE_CONFIG[stage];
  
  if (!config) {
    return (
      <div className={`p-6 bg-gray-50 rounded-lg border border-gray-200 ${className}`}>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-600">Unknown Stage</h2>
          <p className="text-sm text-gray-500 mt-1">Stage configuration not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r ${config.bgGradient} ${config.borderColor} border rounded-xl p-6 ${className}`}>
      <div className="flex items-start gap-4">
        {/* Stage Icon */}
        <div className={`${config.iconBg} ${config.iconColor} p-3 rounded-xl flex-shrink-0`}>
          {config.icon}
        </div>
        
        {/* Stage Info */}
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className={`text-2xl font-bold ${config.textColor}`}>
              {config.name}
            </h2>
            <span className="text-xs bg-white/60 px-2 py-1 rounded-full font-medium text-gray-600">
              {stage}
            </span>
          </div>
          
          <h3 className={`text-lg font-semibold ${config.textColor} opacity-90 mb-2`}>
            {config.subtitle}
          </h3>
          
          {showDescription && (
            <p className={`text-sm ${config.textColor} opacity-75 leading-relaxed`}>
              {config.description}
            </p>
          )}
          
          {showSteps && config.steps && (
            <div className="mt-4">
              <h4 className={`text-sm font-semibold ${config.textColor} mb-2`}>Process Steps:</h4>
              <div className="flex flex-wrap gap-2">
                {config.steps.map((step, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      currentStep === index 
                        ? 'bg-white text-gray-800 shadow-sm'
                        : currentStep > index
                          ? 'bg-white/40 text-gray-700'
                          : 'bg-white/20 text-gray-600'
                    }`}
                  >
                    {step}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Compact version for inline use
export const StageTag = ({ stage, showIcon = true, className = "" }) => {
  const config = STAGE_CONFIG[stage];
  
  if (!config) return null;
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.iconBg} ${config.textColor} ${className}`}>
      {showIcon && (
        <div className="w-4 h-4">
          {React.cloneElement(config.icon, { className: "w-4 h-4" })}
        </div>
      )}
      <span>{config.name}</span>
    </div>
  );
};

// Stage progress indicator
export const StageProgress = ({ stage, currentStep = 0, totalSteps = 3 }) => {
  const config = STAGE_CONFIG[stage];
  
  if (!config) return null;
  
  const progressPercentage = Math.min(100, (currentStep / totalSteps) * 100);
  
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs font-medium mb-1">
        <span className={config.textColor}>{config.name}</span>
        <span className="text-gray-500">{currentStep}/{totalSteps}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 bg-${config.color}-500`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default StageHeader;