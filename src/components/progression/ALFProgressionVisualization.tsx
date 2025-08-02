/**
 * ALF Progression Visualization Components
 * 
 * Visualizes non-linear learning progressions that honor student choice and
 * showcase multiple pathways to mastery through authentic project work.
 */

import React, { useState, useEffect } from 'react';
import { 
  ALFStudentProgression, 
  ALFProgressionLevel, 
  EvidenceType,
  ALFDomainProgression,
  ALFProgressionEvidence,
  ALFCommunityConnection,
  ALFLearningGoal
} from '../../services/alf-learning-progression-service';

interface ALFProgressionVisualizationProps {
  studentId: string;
  progression: ALFStudentProgression;
  viewType: 'student' | 'teacher' | 'parent' | 'community';
  interactive?: boolean;
}

/**
 * Main progression visualization component
 */
export const ALFProgressionVisualization: React.FC<ALFProgressionVisualizationProps> = ({
  studentId,
  progression,
  viewType,
  interactive = true
}) => {
  const [activeView, setActiveView] = useState<'spiral' | 'pathway' | 'network' | 'portfolio' | 'goals'>('spiral');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  return (
    <div className="alf-progression-container">
      <ALFProgressionHeader 
        progression={progression}
        viewType={viewType}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      
      <div className="alf-progression-content">
        {activeView === 'spiral' && (
          <ALFSpiralVisualization 
            progression={progression}
            selectedDomain={selectedDomain}
            onDomainSelect={setSelectedDomain}
            viewType={viewType}
          />
        )}
        
        {activeView === 'pathway' && (
          <ALFPathwayVisualization 
            progression={progression}
            viewType={viewType}
            interactive={interactive}
          />
        )}
        
        {activeView === 'network' && (
          <ALFCommunityNetworkVisualization 
            progression={progression}
            viewType={viewType}
          />
        )}
        
        {activeView === 'portfolio' && (
          <ALFPortfolioVisualization 
            progression={progression}
            viewType={viewType}
            interactive={interactive}
          />
        )}
        
        {activeView === 'goals' && (
          <ALFGoalsVisualization 
            progression={progression}
            viewType={viewType}
            interactive={interactive}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Header with navigation and overview
 */
interface ALFProgressionHeaderProps {
  progression: ALFStudentProgression;
  viewType: 'student' | 'teacher' | 'parent' | 'community';
  activeView: string;
  onViewChange: (view: 'spiral' | 'pathway' | 'network' | 'portfolio' | 'goals') => void;
}

const ALFProgressionHeader: React.FC<ALFProgressionHeaderProps> = ({
  progression,
  viewType,
  activeView,
  onViewChange
}) => {
  const getViewTitle = () => {
    switch (viewType) {
      case 'student': return 'My Learning Journey';
      case 'teacher': return `${progression.studentId}'s Learning Progression`;
      case 'parent': return `${progression.studentId}'s Growth Overview`;
      case 'community': return `Student Learning Impact`;
      default: return 'Learning Progression';
    }
  };

  const getViewDescription = () => {
    switch (viewType) {
      case 'student': return 'Track your growth through authentic projects and community connections';
      case 'teacher': return 'Monitor student progression through portfolio evidence and goal achievement';
      case 'parent': return 'See how your child is growing through real-world learning experiences';
      case 'community': return 'Understand student learning through community-connected projects';
      default: return '';
    }
  };

  return (
    <div className="alf-progression-header">
      <div className="header-content">
        <h1>{getViewTitle()}</h1>
        <p>{getViewDescription()}</p>
        
        <ALFLevelIndicator 
          currentLevel={progression.overallLevel}
          viewType={viewType}
        />
      </div>
      
      <div className="view-navigation">
        <button 
          className={`nav-button ${activeView === 'spiral' ? 'active' : ''}`}
          onClick={() => onViewChange('spiral')}
        >
          <SpiralIcon />
          Spiral Learning
        </button>
        
        <button 
          className={`nav-button ${activeView === 'pathway' ? 'active' : ''}`}
          onClick={() => onViewChange('pathway')}
        >
          <PathwayIcon />
          Learning Paths
        </button>
        
        <button 
          className={`nav-button ${activeView === 'network' ? 'active' : ''}`}
          onClick={() => onViewChange('network')}
        >
          <NetworkIcon />
          Community Network
        </button>
        
        <button 
          className={`nav-button ${activeView === 'portfolio' ? 'active' : ''}`}
          onClick={() => onViewChange('portfolio')}
        >
          <PortfolioIcon />
          Evidence Portfolio
        </button>
        
        <button 
          className={`nav-button ${activeView === 'goals' ? 'active' : ''}`}
          onClick={() => onViewChange('goals')}
        >
          <GoalsIcon />
          Learning Goals
        </button>
      </div>
    </div>
  );
};

/**
 * Current progression level indicator
 */
interface ALFLevelIndicatorProps {
  currentLevel: ALFProgressionLevel;
  viewType: string;
}

const ALFLevelIndicator: React.FC<ALFLevelIndicatorProps> = ({ currentLevel, viewType }) => {
  const getLevelDescription = (level: ALFProgressionLevel) => {
    switch (level) {
      case ALFProgressionLevel.Explorer:
        return 'Discovering new ideas through authentic contexts';
      case ALFProgressionLevel.Investigator:
        return 'Making connections across perspectives and disciplines';
      case ALFProgressionLevel.Creator:
        return 'Building solutions through iterative prototyping';
      case ALFProgressionLevel.Innovator:
        return 'Contributing original ideas to community challenges';
      case ALFProgressionLevel.ChangeAgent:
        return 'Leading system-level impact and mentoring others';
    }
  };

  const getLevelColor = (level: ALFProgressionLevel) => {
    switch (level) {
      case ALFProgressionLevel.Explorer: return '#8B5A3C';
      case ALFProgressionLevel.Investigator: return '#4A90A4';
      case ALFProgressionLevel.Creator: return '#F4A261';
      case ALFProgressionLevel.Innovator: return '#E76F51';
      case ALFProgressionLevel.ChangeAgent: return '#2A9D8F';
    }
  };

  return (
    <div className="alf-level-indicator">
      <div 
        className="level-badge"
        style={{ backgroundColor: getLevelColor(currentLevel) }}
      >
        {currentLevel.replace('_', ' ').toUpperCase()}
      </div>
      <p className="level-description">
        {getLevelDescription(currentLevel)}
      </p>
    </div>
  );
};

/**
 * Spiral curriculum visualization showing concept development over time
 */
interface ALFSpiralVisualizationProps {
  progression: ALFStudentProgression;
  selectedDomain?: string | null;
  onDomainSelect?: (domain: string | null) => void;
  viewType: string;
}

const ALFSpiralVisualization: React.FC<ALFSpiralVisualizationProps> = ({
  progression,
  selectedDomain,
  onDomainSelect,
  viewType
}) => {
  const [timeRange, setTimeRange] = useState<'month' | 'semester' | 'year' | 'all'>('semester');

  const renderSpiralPath = (domain: ALFDomainProgression) => {
    const spiralPath = domain.spiralProgression.encounters.map((encounter, index) => (
      <div 
        key={`${encounter.projectId}-${index}`}
        className="spiral-encounter"
        style={{
          transform: `rotate(${index * 45}deg) translateX(${50 + index * 20}px)`,
          backgroundColor: getLevelColor(domain.currentLevel),
          opacity: selectedDomain === domain.domainId ? 1 : 0.7
        }}
        onClick={() => onDomainSelect?.(domain.domainId)}
      >
        <div className="encounter-content">
          <h4>{encounter.projectTitle}</h4>
          <p>{encounter.context}</p>
          <span className="depth-indicator">{encounter.depth}</span>
        </div>
      </div>
    ));

    return (
      <div className="spiral-domain" key={domain.domainId}>
        <div className="spiral-center">
          <h3>{domain.domainName}</h3>
          <span className="current-level">{domain.currentLevel}</span>
        </div>
        <div className="spiral-path">
          {spiralPath}
        </div>
      </div>
    );
  };

  return (
    <div className="alf-spiral-visualization">
      <div className="spiral-controls">
        <div className="time-range-selector">
          <label>Time Range:</label>
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value as any)}>
            <option value="month">This Month</option>
            <option value="semester">This Semester</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>
      
      <div className="spiral-container">
        {Array.from(progression.domainProgressions.values()).map(renderSpiralPath)}
      </div>
      
      {selectedDomain && (
        <ALFDomainDetailPanel 
          domain={progression.domainProgressions.get(selectedDomain)!}
          onClose={() => onDomainSelect?.(null)}
          viewType={viewType}
        />
      )}
    </div>
  );
};

/**
 * Non-linear pathway visualization showing different routes to mastery
 */
interface ALFPathwayVisualizationProps {
  progression: ALFStudentProgression;
  viewType: string;
  interactive: boolean;
}

const ALFPathwayVisualization: React.FC<ALFPathwayVisualizationProps> = ({
  progression,
  viewType,
  interactive
}) => {
  const [selectedPathway, setSelectedPathway] = useState<string | null>(null);

  return (
    <div className="alf-pathway-visualization">
      <div className="pathway-legend">
        <h3>Learning Pathways</h3>
        <p>Multiple routes to mastery based on interests, strengths, and community connections</p>
        
        <div className="pathway-types">
          <div className="pathway-type collaboration">
            <span className="indicator"></span>
            Collaboration-focused
          </div>
          <div className="pathway-type creation">
            <span className="indicator"></span>
            Creation-centered
          </div>
          <div className="pathway-type community">
            <span className="indicator"></span>
            Community-connected
          </div>
          <div className="pathway-type innovation">
            <span className="indicator"></span>
            Innovation-driven
          </div>
        </div>
      </div>
      
      <div className="pathway-map">
        <ALFPathwayNetwork 
          progression={progression}
          selectedPathway={selectedPathway}
          onPathwaySelect={setSelectedPathway}
          interactive={interactive}
        />
      </div>
      
      <div className="pathway-insights">
        <ALFPathwayInsights 
          progression={progression}
          viewType={viewType}
        />
      </div>
    </div>
  );
};

/**
 * Community network visualization showing connections and impact
 */
interface ALFCommunityNetworkVisualizationProps {
  progression: ALFStudentProgression;
  viewType: string;
}

const ALFCommunityNetworkVisualization: React.FC<ALFCommunityNetworkVisualizationProps> = ({
  progression,
  viewType
}) => {
  const [selectedConnection, setSelectedConnection] = useState<ALFCommunityConnection | null>(null);

  return (
    <div className="alf-community-network-visualization">
      <div className="network-overview">
        <h3>Community Learning Network</h3>
        <div className="network-stats">
          <div className="stat">
            <span className="value">{progression.communityConnections.length}</span>
            <span className="label">Community Partners</span>
          </div>
          <div className="stat">
            <span className="value">
              {progression.communityConnections.filter(c => c.ongoing).length}
            </span>
            <span className="label">Ongoing Relationships</span>
          </div>
          <div className="stat">
            <span className="value">
              {progression.communityConnections.filter(c => c.mutualBenefit).length}
            </span>
            <span className="label">Mutual Benefit</span>
          </div>
        </div>
      </div>
      
      <div className="network-map">
        <ALFCommunityNetworkMap 
          connections={progression.communityConnections}
          selectedConnection={selectedConnection}
          onConnectionSelect={setSelectedConnection}
          studentLevel={progression.overallLevel}
        />
      </div>
      
      {selectedConnection && (
        <ALFCommunityDetailPanel 
          connection={selectedConnection}
          projects={progression.portfolioEvidence.filter(e => 
            selectedConnection.projects.includes(e.projectId)
          )}
          onClose={() => setSelectedConnection(null)}
          viewType={viewType}
        />
      )}
    </div>
  );
};

/**
 * Portfolio evidence visualization
 */
interface ALFPortfolioVisualizationProps {
  progression: ALFStudentProgression;
  viewType: string;
  interactive: boolean;
}

const ALFPortfolioVisualization: React.FC<ALFPortfolioVisualizationProps> = ({
  progression,
  viewType,
  interactive
}) => {
  const [filterType, setFilterType] = useState<EvidenceType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'level' | 'authenticity'>('date');

  const filteredEvidence = progression.portfolioEvidence
    .filter(evidence => filterType === 'all' || evidence.evidenceType === filterType)
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.createdDate.getTime() - a.createdDate.getTime();
        case 'level':
          return b.progressionLevel.localeCompare(a.progressionLevel);
        case 'authenticity':
          return b.authenticityScore - a.authenticityScore;
        default:
          return 0;
      }
    });

  return (
    <div className="alf-portfolio-visualization">
      <div className="portfolio-controls">
        <div className="filter-controls">
          <label>Filter by Evidence Type:</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)}>
            <option value="all">All Evidence</option>
            <option value="project_artifact">Project Artifacts</option>
            <option value="community_feedback">Community Feedback</option>
            <option value="peer_collaboration">Peer Collaboration</option>
            <option value="self_reflection">Self Reflection</option>
            <option value="iteration_journal">Iteration Journal</option>
            <option value="community_impact">Community Impact</option>
          </select>
        </div>
        
        <div className="sort-controls">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
            <option value="date">Date</option>
            <option value="level">Progression Level</option>
            <option value="authenticity">Authenticity Score</option>
          </select>
        </div>
      </div>
      
      <div className="portfolio-grid">
        {filteredEvidence.map(evidence => (
          <ALFEvidenceCard 
            key={evidence.id}
            evidence={evidence}
            viewType={viewType}
            interactive={interactive}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Goals visualization and tracking
 */
interface ALFGoalsVisualizationProps {
  progression: ALFStudentProgression;
  viewType: string;
  interactive: boolean;
}

const ALFGoalsVisualization: React.FC<ALFGoalsVisualizationProps> = ({
  progression,
  viewType,
  interactive
}) => {
  return (
    <div className="alf-goals-visualization">
      <div className="goals-overview">
        <h3>Learning Goals Journey</h3>
        <div className="goals-stats">
          <div className="stat">
            <span className="value">{progression.goalSetting.currentGoals.length}</span>
            <span className="label">Active Goals</span>
          </div>
          <div className="stat">
            <span className="value">{progression.goalSetting.completedGoals.length}</span>
            <span className="label">Completed Goals</span>
          </div>
          <div className="stat">
            <span className="value">
              {progression.goalSetting.currentGoals.filter(g => g.selfSelected).length}
            </span>
            <span className="label">Self-Selected</span>
          </div>
        </div>
      </div>
      
      <div className="goals-timeline">
        <ALFGoalsTimeline 
          goals={[...progression.goalSetting.currentGoals, ...progression.goalSetting.completedGoals]}
          viewType={viewType}
          interactive={interactive}
        />
      </div>
      
      <div className="goals-categories">
        <ALFGoalsBreakdown 
          goals={progression.goalSetting.currentGoals}
          viewType={viewType}
        />
      </div>
    </div>
  );
};

// Helper components (implementation details would be added)

const ALFDomainDetailPanel: React.FC<any> = ({ domain, onClose, viewType }) => (
  <div className="domain-detail-panel">
    <button onClick={onClose} className="close-button">×</button>
    <h3>{domain.domainName}</h3>
    <p>Current Level: {domain.currentLevel}</p>
    {/* Additional domain details */}
  </div>
);

const ALFPathwayNetwork: React.FC<any> = ({ progression, selectedPathway, onPathwaySelect, interactive }) => (
  <div className="pathway-network">
    {/* SVG or Canvas-based pathway visualization */}
    <svg width="100%" height="400">
      {/* Pathway visualization implementation */}
    </svg>
  </div>
);

const ALFPathwayInsights: React.FC<any> = ({ progression, viewType }) => (
  <div className="pathway-insights">
    <h4>Pathway Insights</h4>
    {/* Insights about learning pathways */}
  </div>
);

const ALFCommunityNetworkMap: React.FC<any> = ({ connections, selectedConnection, onConnectionSelect, studentLevel }) => (
  <div className="community-network-map">
    {/* Community network visualization */}
  </div>
);

const ALFCommunityDetailPanel: React.FC<any> = ({ connection, projects, onClose, viewType }) => (
  <div className="community-detail-panel">
    <button onClick={onClose} className="close-button">×</button>
    <h3>{connection.partnerName}</h3>
    {/* Community connection details */}
  </div>
);

const ALFEvidenceCard: React.FC<any> = ({ evidence, viewType, interactive }) => (
  <div className="evidence-card">
    <h4>{evidence.description}</h4>
    <div className="evidence-meta">
      <span className="type">{evidence.evidenceType}</span>
      <span className="level">{evidence.progressionLevel}</span>
      <span className="authenticity">Authenticity: {(evidence.authenticityScore * 100).toFixed(0)}%</span>
    </div>
    {/* Evidence details */}
  </div>
);

const ALFGoalsTimeline: React.FC<any> = ({ goals, viewType, interactive }) => (
  <div className="goals-timeline">
    {/* Timeline visualization of goals */}
  </div>
);

const ALFGoalsBreakdown: React.FC<any> = ({ goals, viewType }) => (
  <div className="goals-breakdown">
    {/* Breakdown of goals by category */}
  </div>
);

// Icon components
const SpiralIcon = () => <span>🌀</span>;
const PathwayIcon = () => <span>🛤️</span>;
const NetworkIcon = () => <span>🌐</span>;
const PortfolioIcon = () => <span>📁</span>;
const GoalsIcon = () => <span>🎯</span>;

// Helper function
const getLevelColor = (level: ALFProgressionLevel): string => {
  switch (level) {
    case ALFProgressionLevel.Explorer: return '#8B5A3C';
    case ALFProgressionLevel.Investigator: return '#4A90A4';
    case ALFProgressionLevel.Creator: return '#F4A261';
    case ALFProgressionLevel.Innovator: return '#E76F51';
    case ALFProgressionLevel.ChangeAgent: return '#2A9D8F';
  }
};

export default ALFProgressionVisualization;