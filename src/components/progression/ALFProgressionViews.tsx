/**
 * ALF Progression Views
 * 
 * Different progression interfaces for students, teachers, parents, and community members
 * with appropriate access levels and information presentation for each audience.
 */

import React, { useState, useEffect } from 'react';
import { 
  ALFStudentProgression, 
  ALFProgressionLevel, 
  ALFProgressionEvidence,
  ALFLearningGoal,
  ALFCommunityConnection,
  EvidenceType
} from '../../services/alf-learning-progression-service';
import { ALFProgressionVisualization } from './ALFProgressionVisualization';

/**
 * Student-facing progression view - emphasizes agency, reflection, and goal-setting
 */
interface StudentProgressionViewProps {
  studentId: string;
  progression: ALFStudentProgression;
  onGoalSet: (goals: ALFLearningGoal[]) => void;
  onReflectionSubmit: (evidenceId: string, reflection: string) => void;
  onSelfAssessment: (domainId: string, level: ALFProgressionLevel) => void;
}

export const StudentProgressionView: React.FC<StudentProgressionViewProps> = ({
  studentId,
  progression,
  onGoalSet,
  onReflectionSubmit,
  onSelfAssessment
}) => {
  const [activeTab, setActiveTab] = useState<'journey' | 'goals' | 'portfolio' | 'community'>('journey');
  const [showGoalSetting, setShowGoalSetting] = useState(false);

  return (
    <div className="student-progression-view">
      <StudentProgressionHeader 
        progression={progression}
        onShowGoalSetting={() => setShowGoalSetting(true)}
      />

      <div className="student-navigation">
        <button 
          className={`nav-tab ${activeTab === 'journey' ? 'active' : ''}`}
          onClick={() => setActiveTab('journey')}
        >
          🌱 My Learning Journey
        </button>
        <button 
          className={`nav-tab ${activeTab === 'goals' ? 'active' : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          🎯 My Goals
        </button>
        <button 
          className={`nav-tab ${activeTab === 'portfolio' ? 'active' : ''}`}
          onClick={() => setActiveTab('portfolio')}
        >
          📂 My Evidence
        </button>
        <button 
          className={`nav-tab ${activeTab === 'community' ? 'active' : ''}`}
          onClick={() => setActiveTab('community')}
        >
          🌐 My Community
        </button>
      </div>

      <div className="student-content">
        {activeTab === 'journey' && (
          <StudentJourneyView 
            progression={progression}
            onSelfAssessment={onSelfAssessment}
          />
        )}
        
        {activeTab === 'goals' && (
          <StudentGoalsView 
            goals={progression.goalSetting}
            onGoalSet={onGoalSet}
          />
        )}
        
        {activeTab === 'portfolio' && (
          <StudentPortfolioView 
            evidence={progression.portfolioEvidence}
            onReflectionSubmit={onReflectionSubmit}
          />
        )}
        
        {activeTab === 'community' && (
          <StudentCommunityView 
            connections={progression.communityConnections}
            evidence={progression.portfolioEvidence}
          />
        )}
      </div>

      {showGoalSetting && (
        <StudentGoalSettingModal 
          currentGoals={progression.goalSetting.currentGoals}
          onGoalSet={onGoalSet}
          onClose={() => setShowGoalSetting(false)}
        />
      )}
    </div>
  );
};

/**
 * Teacher-facing progression view - emphasizes assessment, intervention, and planning
 */
interface TeacherProgressionViewProps {
  studentId: string;
  progression: ALFStudentProgression;
  classData?: ALFStudentProgression[];
  onFeedbackProvide: (evidenceId: string, feedback: string) => void;
  onInterventionPlan: (studentId: string, plan: string) => void;
  onStandardsTracking: (standardId: string, masteryLevel: ALFProgressionLevel) => void;
}

export const TeacherProgressionView: React.FC<TeacherProgressionViewProps> = ({
  studentId,
  progression,
  classData,
  onFeedbackProvide,
  onInterventionPlan,
  onStandardsTracking
}) => {
  const [activeView, setActiveView] = useState<'individual' | 'comparison' | 'planning' | 'standards'>('individual');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  return (
    <div className="teacher-progression-view">
      <TeacherProgressionHeader 
        studentId={studentId}
        progression={progression}
        classData={classData}
      />

      <div className="teacher-navigation">
        <button 
          className={`nav-tab ${activeView === 'individual' ? 'active' : ''}`}
          onClick={() => setActiveView('individual')}
        >
          📊 Individual Progress
        </button>
        <button 
          className={`nav-tab ${activeView === 'comparison' ? 'active' : ''}`}
          onClick={() => setActiveView('comparison')}
        >
          📈 Class Comparison
        </button>
        <button 
          className={`nav-tab ${activeView === 'planning' ? 'active' : ''}`}
          onClick={() => setActiveView('planning')}
        >
          📝 Planning & Intervention
        </button>
        <button 
          className={`nav-tab ${activeView === 'standards' ? 'active' : ''}`}
          onClick={() => setActiveView('standards')}
        >
          📋 Standards Tracking
        </button>
      </div>

      <div className="teacher-content">
        {activeView === 'individual' && (
          <TeacherIndividualView 
            progression={progression}
            selectedDomain={selectedDomain}
            onDomainSelect={setSelectedDomain}
            onFeedbackProvide={onFeedbackProvide}
          />
        )}
        
        {activeView === 'comparison' && classData && (
          <TeacherComparisonView 
            studentProgression={progression}
            classData={classData}
          />
        )}
        
        {activeView === 'planning' && (
          <TeacherPlanningView 
            progression={progression}
            onInterventionPlan={onInterventionPlan}
          />
        )}
        
        {activeView === 'standards' && (
          <TeacherStandardsView 
            progression={progression}
            onStandardsTracking={onStandardsTracking}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Parent-facing progression view - emphasizes growth, celebration, and support
 */
interface ParentProgressionViewProps {
  studentId: string;
  progression: ALFStudentProgression;
  studentName: string;
}

export const ParentProgressionView: React.FC<ParentProgressionViewProps> = ({
  studentId,
  progression,
  studentName
}) => {
  const [activeSection, setActiveSection] = useState<'growth' | 'projects' | 'community' | 'support'>('growth');

  return (
    <div className="parent-progression-view">
      <ParentProgressionHeader 
        studentName={studentName}
        progression={progression}
      />

      <div className="parent-navigation">
        <button 
          className={`nav-section ${activeSection === 'growth' ? 'active' : ''}`}
          onClick={() => setActiveSection('growth')}
        >
          🌱 Growth & Achievements
        </button>
        <button 
          className={`nav-section ${activeSection === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveSection('projects')}
        >
          🎨 Projects & Work
        </button>
        <button 
          className={`nav-section ${activeSection === 'community' ? 'active' : ''}`}
          onClick={() => setActiveSection('community')}
        >
          🤝 Community Connections
        </button>
        <button 
          className={`nav-section ${activeSection === 'support' ? 'active' : ''}`}
          onClick={() => setActiveSection('support')}
        >
          💡 How to Support
        </button>
      </div>

      <div className="parent-content">
        {activeSection === 'growth' && (
          <ParentGrowthView 
            progression={progression}
            studentName={studentName}
          />
        )}
        
        {activeSection === 'projects' && (
          <ParentProjectsView 
            evidence={progression.portfolioEvidence}
            studentName={studentName}
          />
        )}
        
        {activeSection === 'community' && (
          <ParentCommunityView 
            connections={progression.communityConnections}
            studentName={studentName}
          />
        )}
        
        {activeSection === 'support' && (
          <ParentSupportView 
            progression={progression}
            studentName={studentName}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Community member-facing progression view - emphasizes impact and feedback opportunities
 */
interface CommunityProgressionViewProps {
  studentId: string;
  progression: ALFStudentProgression;
  communityMemberId: string;
  onFeedbackSubmit: (evidenceId: string, feedback: string) => void;
}

export const CommunityProgressionView: React.FC<CommunityProgressionViewProps> = ({
  studentId,
  progression,
  communityMemberId,
  onFeedbackSubmit
}) => {
  const [activeArea, setActiveArea] = useState<'impact' | 'feedback' | 'mentorship'>('impact');

  // Filter evidence and connections relevant to this community member
  const relevantEvidence = progression.portfolioEvidence.filter(evidence =>
    evidence.isPublic && evidence.communityMembers.includes(communityMemberId)
  );

  const relevantConnections = progression.communityConnections.filter(connection =>
    connection.partnerId === communityMemberId
  );

  return (
    <div className="community-progression-view">
      <CommunityProgressionHeader 
        studentId={studentId}
        progression={progression}
        relevantConnections={relevantConnections}
      />

      <div className="community-navigation">
        <button 
          className={`nav-area ${activeArea === 'impact' ? 'active' : ''}`}
          onClick={() => setActiveArea('impact')}
        >
          🌟 Student Impact
        </button>
        <button 
          className={`nav-area ${activeArea === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveArea('feedback')}
        >
          💬 Provide Feedback
        </button>
        <button 
          className={`nav-area ${activeArea === 'mentorship' ? 'active' : ''}`}
          onClick={() => setActiveArea('mentorship')}
        >
          🤝 Mentorship Opportunities
        </button>
      </div>

      <div className="community-content">
        {activeArea === 'impact' && (
          <CommunityImpactView 
            evidence={relevantEvidence}
            connections={relevantConnections}
          />
        )}
        
        {activeArea === 'feedback' && (
          <CommunityFeedbackView 
            evidence={relevantEvidence}
            onFeedbackSubmit={onFeedbackSubmit}
          />
        )}
        
        {activeArea === 'mentorship' && (
          <CommunityMentorshipView 
            progression={progression}
            communityMemberId={communityMemberId}
          />
        )}
      </div>
    </div>
  );
};

// Student View Components

const StudentProgressionHeader: React.FC<{
  progression: ALFStudentProgression;
  onShowGoalSetting: () => void;
}> = ({ progression, onShowGoalSetting }) => (
  <div className="student-header">
    <div className="level-display">
      <h1>You are a {progression.overallLevel.replace('_', ' ')}</h1>
      <p>{getLevelEncouragement(progression.overallLevel)}</p>
    </div>
    <div className="quick-actions">
      <button onClick={onShowGoalSetting} className="goal-button">
        🎯 Set New Goal
      </button>
      <button className="reflection-button">
        💭 Quick Reflection
      </button>
    </div>
  </div>
);

const StudentJourneyView: React.FC<{
  progression: ALFStudentProgression;
  onSelfAssessment: (domainId: string, level: ALFProgressionLevel) => void;
}> = ({ progression, onSelfAssessment }) => (
  <div className="student-journey">
    <ALFProgressionVisualization 
      studentId={progression.studentId}
      progression={progression}
      viewType="student"
      interactive={true}
    />
    <div className="self-assessment-prompts">
      <h3>How are you growing?</h3>
      <div className="assessment-domains">
        {Array.from(progression.domainProgressions.entries()).map(([domainId, domain]) => (
          <div key={domainId} className="domain-assessment">
            <h4>{domain.domainName}</h4>
            <p>Current level: {domain.currentLevel}</p>
            <button onClick={() => onSelfAssessment(domainId, domain.currentLevel)}>
              Reflect on my progress
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const StudentGoalsView: React.FC<{
  goals: any;
  onGoalSet: (goals: ALFLearningGoal[]) => void;
}> = ({ goals, onGoalSet }) => (
  <div className="student-goals">
    <div className="active-goals">
      <h3>My Active Goals</h3>
      {goals.currentGoals.map((goal: ALFLearningGoal) => (
        <StudentGoalCard key={goal.id} goal={goal} />
      ))}
    </div>
    <div className="completed-goals">
      <h3>Goals I've Achieved</h3>
      {goals.completedGoals.map((goal: ALFLearningGoal) => (
        <StudentGoalCard key={goal.id} goal={goal} completed={true} />
      ))}
    </div>
  </div>
);

const StudentPortfolioView: React.FC<{
  evidence: ALFProgressionEvidence[];
  onReflectionSubmit: (evidenceId: string, reflection: string) => void;
}> = ({ evidence, onReflectionSubmit }) => (
  <div className="student-portfolio">
    <div className="portfolio-stats">
      <div className="stat">
        <span className="value">{evidence.length}</span>
        <span className="label">Pieces of Evidence</span>
      </div>
      <div className="stat">
        <span className="value">{evidence.filter(e => e.communityFeedback.length > 0).length}</span>
        <span className="label">With Community Feedback</span>
      </div>
    </div>
    <div className="evidence-grid">
      {evidence.map(item => (
        <StudentEvidenceCard 
          key={item.id} 
          evidence={item} 
          onReflectionSubmit={onReflectionSubmit}
        />
      ))}
    </div>
  </div>
);

const StudentCommunityView: React.FC<{
  connections: ALFCommunityConnection[];
  evidence: ALFProgressionEvidence[];
}> = ({ connections, evidence }) => (
  <div className="student-community">
    <div className="community-network">
      <h3>My Community Network</h3>
      {connections.map(connection => (
        <StudentCommunityCard key={connection.partnerId} connection={connection} />
      ))}
    </div>
    <div className="community-impact">
      <h3>My Community Impact</h3>
      <CommunityImpactSummary evidence={evidence} />
    </div>
  </div>
);

// Teacher View Components

const TeacherProgressionHeader: React.FC<{
  studentId: string;
  progression: ALFStudentProgression;
  classData?: ALFStudentProgression[];
}> = ({ studentId, progression, classData }) => (
  <div className="teacher-header">
    <div className="student-overview">
      <h1>{studentId}'s Learning Progression</h1>
      <div className="progression-summary">
        <span className="current-level">{progression.overallLevel}</span>
        <span className="evidence-count">{progression.portfolioEvidence.length} pieces of evidence</span>
        <span className="community-connections">{progression.communityConnections.length} community connections</span>
      </div>
    </div>
    {classData && (
      <div className="class-context">
        <ClassProgressionComparison student={progression} classData={classData} />
      </div>
    )}
  </div>
);

const TeacherIndividualView: React.FC<{
  progression: ALFStudentProgression;
  selectedDomain: string | null;
  onDomainSelect: (domainId: string | null) => void;
  onFeedbackProvide: (evidenceId: string, feedback: string) => void;
}> = ({ progression, selectedDomain, onDomainSelect, onFeedbackProvide }) => (
  <div className="teacher-individual">
    <ALFProgressionVisualization 
      studentId={progression.studentId}
      progression={progression}
      viewType="teacher"
      interactive={true}
    />
    <div className="teaching-insights">
      <TeacherInsightsPanel progression={progression} />
      <TeacherInterventionSuggestions progression={progression} />
    </div>
  </div>
);

// Additional component implementations would continue here...

// Helper functions
const getLevelEncouragement = (level: ALFProgressionLevel): string => {
  switch (level) {
    case ALFProgressionLevel.Explorer:
      return "You're discovering new ideas and making connections!";
    case ALFProgressionLevel.Investigator:
      return "You're diving deeper and seeing different perspectives!";
    case ALFProgressionLevel.Creator:
      return "You're building solutions and iterating on your ideas!";
    case ALFProgressionLevel.Innovator:
      return "You're creating original contributions to real problems!";
    case ALFProgressionLevel.ChangeAgent:
      return "You're leading change and inspiring others!";
    default:
      return "Keep growing and learning!";
  }
};

// Component stub implementations
const StudentGoalSettingModal: React.FC<any> = ({ currentGoals, onGoalSet, onClose }) => <div>Goal Setting Modal</div>;
const StudentGoalCard: React.FC<any> = ({ goal, completed }) => <div>Goal Card</div>;
const StudentEvidenceCard: React.FC<any> = ({ evidence, onReflectionSubmit }) => <div>Evidence Card</div>;
const StudentCommunityCard: React.FC<any> = ({ connection }) => <div>Community Card</div>;
const CommunityImpactSummary: React.FC<any> = ({ evidence }) => <div>Impact Summary</div>;
const ClassProgressionComparison: React.FC<any> = ({ student, classData }) => <div>Class Comparison</div>;
const TeacherComparisonView: React.FC<any> = ({ studentProgression, classData }) => <div>Comparison View</div>;
const TeacherPlanningView: React.FC<any> = ({ progression, onInterventionPlan }) => <div>Planning View</div>;
const TeacherStandardsView: React.FC<any> = ({ progression, onStandardsTracking }) => <div>Standards View</div>;
const TeacherInsightsPanel: React.FC<any> = ({ progression }) => <div>Insights Panel</div>;
const TeacherInterventionSuggestions: React.FC<any> = ({ progression }) => <div>Intervention Suggestions</div>;
const ParentProgressionHeader: React.FC<any> = ({ studentName, progression }) => <div>Parent Header</div>;
const ParentGrowthView: React.FC<any> = ({ progression, studentName }) => <div>Growth View</div>;
const ParentProjectsView: React.FC<any> = ({ evidence, studentName }) => <div>Projects View</div>;
const ParentCommunityView: React.FC<any> = ({ connections, studentName }) => <div>Community View</div>;
const ParentSupportView: React.FC<any> = ({ progression, studentName }) => <div>Support View</div>;
const CommunityProgressionHeader: React.FC<any> = ({ studentId, progression, relevantConnections }) => <div>Community Header</div>;
const CommunityImpactView: React.FC<any> = ({ evidence, connections }) => <div>Impact View</div>;
const CommunityFeedbackView: React.FC<any> = ({ evidence, onFeedbackSubmit }) => <div>Feedback View</div>;
const CommunityMentorshipView: React.FC<any> = ({ progression, communityMemberId }) => <div>Mentorship View</div>;

export { 
  StudentProgressionView,
  TeacherProgressionView,
  ParentProgressionView,
  CommunityProgressionView
};