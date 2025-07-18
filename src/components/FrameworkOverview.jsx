import React, { useState } from 'react';

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="l 12,8 12,12"></path>
    <path d="l 12,16 12.01,16"></path>
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const LightbulbIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M9 21h6"></path>
    <path d="M12 17v4"></path>
    <path d="M12 3C8.7 3 6 5.7 6 9c0 2.4 1.4 4.5 3.5 5.5V17h5v-2.5C16.6 13.5 18 11.4 18 9c0-3.3-2.7-6-6-6z"></path>
  </svg>
);

const TargetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="6"></circle>
    <circle cx="12" cy="12" r="2"></circle>
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

export default function FrameworkOverview({ isExpanded: forceExpanded = null }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const expanded = forceExpanded !== null ? forceExpanded : isExpanded;

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
      {forceExpanded === null && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <InfoIcon />
            <span className="font-semibold text-purple-900">About the Active Learning Framework</span>
          </div>
          <ChevronDownIcon />
        </button>
      )}
      
      {expanded && (
        <div className={forceExpanded === null ? "mt-4 pt-4 border-t border-purple-200" : ""}>
          <div className="space-y-6 text-sm text-purple-800">
            {/* ALF Introduction */}
            <div>
              <h4 className="font-semibold mb-3 text-purple-900 flex items-center gap-2">
                <LightbulbIcon />
                What is the Active Learning Framework?
              </h4>
              <p className="mb-3">
                The Active Learning Framework (ALF) is a research-based pedagogical approach that transforms 
                traditional education by placing students at the center of their learning journey. Instead of 
                passive consumption, students engage in authentic problem-solving that mirrors real-world challenges.
              </p>
              <div className="bg-white p-3 rounded border border-purple-200">
                <p className="text-xs font-medium text-purple-700 mb-2">Core Principle:</p>
                <p className="italic">
                  "Students learn best when they actively construct knowledge through meaningful experiences 
                  that connect to their lives and communities."
                </p>
              </div>
            </div>

            {/* Key Benefits */}
            <div>
              <h4 className="font-semibold mb-3 text-purple-900 flex items-center gap-2">
                <TargetIcon />
                Why ALF Transforms Learning
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded border border-purple-200">
                  <h5 className="font-medium text-purple-800 mb-1">Student Engagement</h5>
                  <p className="text-xs">Real challenges create intrinsic motivation and deeper investment</p>
                </div>
                <div className="bg-white p-3 rounded border border-purple-200">
                  <h5 className="font-medium text-purple-800 mb-1">Critical Thinking</h5>
                  <p className="text-xs">Complex problems develop analytical and creative problem-solving skills</p>
                </div>
                <div className="bg-white p-3 rounded border border-purple-200">
                  <h5 className="font-medium text-purple-800 mb-1">Knowledge Retention</h5>
                  <p className="text-xs">Learning through application creates lasting understanding</p>
                </div>
                <div className="bg-white p-3 rounded border border-purple-200">
                  <h5 className="font-medium text-purple-800 mb-1">Real-World Skills</h5>
                  <p className="text-xs">Students develop competencies they'll use beyond the classroom</p>
                </div>
              </div>
            </div>
            
            {/* Three Stages Detailed */}
            <div>
              <h4 className="font-semibold mb-3 text-purple-900 flex items-center gap-2">
                <UsersIcon />
                The ProjectCraft Implementation
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 bg-purple-600 text-white rounded-full text-sm flex items-center justify-center flex-shrink-0 mt-1 font-bold">1</span>
                  <div className="flex-1">
                    <h5 className="font-semibold text-purple-800 mb-1">Ideation Stage</h5>
                    <p className="text-xs mb-2">
                      Define a compelling Big Idea and authentic Challenge that drives student curiosity and 
                      connects academic content to real-world applications.
                    </p>
                    <div className="text-xs text-purple-600">
                      <strong>Focus:</strong> Purpose, relevance, and student voice
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 bg-purple-600 text-white rounded-full text-sm flex items-center justify-center flex-shrink-0 mt-1 font-bold">2</span>
                  <div className="flex-1">
                    <h5 className="font-semibold text-purple-800 mb-1">Learning Journey Stage</h5>
                    <p className="text-xs mb-2">
                      Design scaffolded activities that build necessary knowledge and skills while maintaining 
                      connection to the authentic challenge.
                    </p>
                    <div className="text-xs text-purple-600">
                      <strong>Focus:</strong> Skill-building, scaffolding, and engagement
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 bg-purple-600 text-white rounded-full text-sm flex items-center justify-center flex-shrink-0 mt-1 font-bold">3</span>
                  <div className="flex-1">
                    <h5 className="font-semibold text-purple-800 mb-1">Student Deliverables Stage</h5>
                    <p className="text-xs mb-2">
                      Create authentic assessments where students demonstrate mastery through real-world 
                      applications and community connections.
                    </p>
                    <div className="text-xs text-purple-600">
                      <strong>Focus:</strong> Authentic assessment and community impact
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Research Foundation */}
            <div className="bg-white p-4 rounded border border-purple-300">
              <h5 className="font-semibold text-purple-900 mb-2">Research Foundation</h5>
              <p className="text-xs mb-2">
                ALF builds on decades of educational research showing that active, student-centered learning 
                significantly improves academic outcomes, student engagement, and skill development.
              </p>
              <div className="text-xs text-purple-600">
                <strong>Key Evidence:</strong> Students in ALF environments show 25% higher retention rates 
                and develop stronger critical thinking skills compared to traditional instruction.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}