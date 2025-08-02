/**
 * ALF Competency Tracker Component
 * 
 * Interactive visualization for tracking competency development through
 * authentic project work, showing growth, transfer, and community validation.
 */

import React, { useState, useEffect } from 'react';
import { 
  ALFCompetencyProfile,
  CompetencyStatus,
  CompetencyGoal,
  NextStepRecommendation,
  CompetencyTrackingUpdate,
  CertificationLevel
} from '../../services/alf-competency-tracking-service';
import { CompetencyTrackingImplementation } from '../../services/alf-competency-tracking-implementation';

interface ALFCompetencyTrackerProps {
  studentId: string;
  profile: ALFCompetencyProfile;
  updates: CompetencyTrackingUpdate[];
  onGoalSet: (competencyId: string, goal: CompetencyGoal) => void;
  onCompetencySelect: (competencyId: string) => void;
  viewMode: 'student' | 'teacher' | 'parent';
}

export const ALFCompetencyTracker: React.FC<ALFCompetencyTrackerProps> = ({
  studentId,
  profile,
  updates,
  onGoalSet,
  onCompetencySelect,
  viewMode
}) => {
  const [selectedView, setSelectedView] = useState<'overview' | 'details' | 'goals' | 'recommendations'>('overview');
  const [selectedCompetency, setSelectedCompetency] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'semester' | 'year'>('month');
  const [showGoalModal, setShowGoalModal] = useState(false);

  // Get visualization data
  const visualizationData = CompetencyTrackingImplementation.generateCompetencyNetwork(profile);
  const heatmapData = CompetencyTrackingImplementation.generateCompetencyHeatmap(profile);
  const timelineData = CompetencyTrackingImplementation.generateProgressionTimeline(updates, profile);
  const milestoneData = CompetencyTrackingImplementation.generateMilestoneTracker(profile.competencyGoals);

  return (
    <div className="alf-competency-tracker">
      <CompetencyHeader 
        profile={profile}
        viewMode={viewMode}
        onViewChange={setSelectedView}
        selectedView={selectedView}
      />

      <div className="tracker-content">
        {selectedView === 'overview' && (
          <CompetencyOverview 
            profile={profile}
            visualizationData={visualizationData}
            heatmapData={heatmapData}
            onCompetencySelect={(id) => {
              setSelectedCompetency(id);
              onCompetencySelect(id);
            }}
            viewMode={viewMode}
          />
        )}

        {selectedView === 'details' && (
          <CompetencyDetails 
            profile={profile}
            selectedCompetency={selectedCompetency}
            updates={updates}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            viewMode={viewMode}
          />
        )}

        {selectedView === 'goals' && (
          <CompetencyGoals 
            goals={profile.competencyGoals}
            milestoneData={milestoneData}
            onNewGoal={() => setShowGoalModal(true)}
            viewMode={viewMode}
          />
        )}

        {selectedView === 'recommendations' && (
          <CompetencyRecommendations 
            recommendations={profile.nextStepsRecommendations}
            profile={profile}
            viewMode={viewMode}
          />
        )}
      </div>

      {showGoalModal && selectedCompetency && (
        <GoalSettingModal 
          competencyId={selectedCompetency}
          competencyStatus={profile.competencyMap.get(selectedCompetency)!}
          onGoalSet={(goal) => {
            onGoalSet(selectedCompetency, goal);
            setShowGoalModal(false);
          }}
          onClose={() => setShowGoalModal(false)}
        />
      )}
    </div>
  );
};

// Header Component
const CompetencyHeader: React.FC<{
  profile: ALFCompetencyProfile;
  viewMode: string;
  selectedView: string;
  onViewChange: (view: any) => void;
}> = ({ profile, viewMode, selectedView, onViewChange }) => {
  const activeCompetencies = Array.from(profile.competencyMap.values()).filter(s => s.isActive).length;
  const totalProgress = Array.from(profile.competencyMap.values())
    .reduce((sum, s) => sum + s.progressPercentage, 0) / profile.competencyMap.size;

  return (
    <div className="competency-header">
      <div className="header-stats">
        <div className="stat">
          <span className="value">{profile.competencyMap.size}</span>
          <span className="label">Total Competencies</span>
        </div>
        <div className="stat">
          <span className="value">{activeCompetencies}</span>
          <span className="label">Active</span>
        </div>
        <div className="stat">
          <span className="value">{Math.round(totalProgress)}%</span>
          <span className="label">Overall Progress</span>
        </div>
        <div className="stat">
          <span className="value">{profile.communityValidatedCompetencies.length}</span>
          <span className="label">Community Validated</span>
        </div>
      </div>

      <div className="view-selector">
        <button 
          className={selectedView === 'overview' ? 'active' : ''}
          onClick={() => onViewChange('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={selectedView === 'details' ? 'active' : ''}
          onClick={() => onViewChange('details')}
        >
          📈 Details
        </button>
        <button 
          className={selectedView === 'goals' ? 'active' : ''}
          onClick={() => onViewChange('goals')}
        >
          🎯 Goals
        </button>
        <button 
          className={selectedView === 'recommendations' ? 'active' : ''}
          onClick={() => onViewChange('recommendations')}
        >
          💡 Next Steps
        </button>
      </div>
    </div>
  );
};

// Overview Component
const CompetencyOverview: React.FC<{
  profile: ALFCompetencyProfile;
  visualizationData: any;
  heatmapData: any;
  onCompetencySelect: (id: string) => void;
  viewMode: string;
}> = ({ profile, visualizationData, heatmapData, onCompetencySelect, viewMode }) => {
  const [visualization, setVisualization] = useState<'network' | 'heatmap' | 'radar'>('heatmap');

  return (
    <div className="competency-overview">
      <div className="visualization-controls">
        <button 
          className={visualization === 'network' ? 'active' : ''}
          onClick={() => setVisualization('network')}
        >
          Network View
        </button>
        <button 
          className={visualization === 'heatmap' ? 'active' : ''}
          onClick={() => setVisualization('heatmap')}
        >
          Heatmap View
        </button>
        <button 
          className={visualization === 'radar' ? 'active' : ''}
          onClick={() => setVisualization('radar')}
        >
          Radar View
        </button>
      </div>

      <div className="visualization-container">
        {visualization === 'heatmap' && (
          <CompetencyHeatmap 
            data={heatmapData}
            onCellClick={(competencyIndex) => {
              const competencyId = Array.from(profile.competencyMap.keys())[competencyIndex];
              onCompetencySelect(competencyId);
            }}
          />
        )}
        
        {visualization === 'network' && (
          <CompetencyNetwork 
            data={visualizationData}
            onNodeClick={(nodeId) => {
              if (nodeId.startsWith('domain_')) return;
              onCompetencySelect(nodeId);
            }}
          />
        )}
        
        {visualization === 'radar' && (
          <CompetencyRadar 
            profile={profile}
            onSectorClick={onCompetencySelect}
          />
        )}
      </div>

      <CompetencyGroups 
        groups={profile.competencyGroups}
        onGroupSelect={(group) => {
          // Could filter view to show only competencies in this group
          console.log('Selected group:', group);
        }}
      />

      {viewMode === 'student' && (
        <QuickActions 
          profile={profile}
          onAction={(action) => console.log('Action:', action)}
        />
      )}
    </div>
  );
};

// Heatmap Visualization
const CompetencyHeatmap: React.FC<{
  data: any;
  onCellClick: (competencyIndex: number) => void;
}> = ({ data, onCellClick }) => {
  const { competencies, dimensions, values, insights } = data;

  return (
    <div className="competency-heatmap">
      <div className="heatmap-grid">
        <div className="dimension-labels">
          <div className="corner-cell"></div>
          {dimensions.map(dim => (
            <div key={dim} className="dimension-label">{dim}</div>
          ))}
        </div>
        
        {competencies.map((comp: string, i: number) => (
          <div key={comp} className="competency-row">
            <div className="competency-label">{comp}</div>
            {values[i].map((value: number, j: number) => (
              <div 
                key={j}
                className="heatmap-cell"
                style={{
                  backgroundColor: `rgba(76, 175, 80, ${value})`,
                  cursor: 'pointer'
                }}
                onClick={() => onCellClick(i)}
                title={`${comp} - ${dimensions[j]}: ${Math.round(value * 100)}%`}
              >
                {Math.round(value * 100)}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="heatmap-insights">
        <h4>Insights</h4>
        <ul>
          {insights.map((insight: string, i: number) => (
            <li key={i}>{insight}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Network Visualization (simplified)
const CompetencyNetwork: React.FC<{
  data: any;
  onNodeClick: (nodeId: string) => void;
}> = ({ data, onNodeClick }) => {
  return (
    <div className="competency-network">
      <svg width="600" height="400">
        {data.links.map((link: any, i: number) => (
          <line
            key={i}
            x1={100}
            y1={100}
            x2={200}
            y2={200}
            stroke="#ccc"
            strokeWidth={link.strength * 3}
          />
        ))}
        
        {data.nodes.map((node: any, i: number) => (
          <g key={node.id} onClick={() => onNodeClick(node.id)}>
            <circle
              cx={100 + i * 50}
              cy={100 + (i % 2) * 50}
              r={node.size / 2}
              fill={node.color}
              style={{ cursor: 'pointer' }}
            />
            <text
              x={100 + i * 50}
              y={100 + (i % 2) * 50 + 30}
              textAnchor="middle"
              fontSize="12"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
      
      <div className="network-legend">
        <div className="legend-item">
          <span className="color-box" style={{ backgroundColor: '#4CAF50' }}></span>
          Accelerating
        </div>
        <div className="legend-item">
          <span className="color-box" style={{ backgroundColor: '#2196F3' }}></span>
          Steady
        </div>
        <div className="legend-item">
          <span className="color-box" style={{ backgroundColor: '#FF9800' }}></span>
          Slowing
        </div>
      </div>
    </div>
  );
};

// Radar Chart (simplified)
const CompetencyRadar: React.FC<{
  profile: ALFCompetencyProfile;
  onSectorClick: (competencyId: string) => void;
}> = ({ profile, onSectorClick }) => {
  const competencies = Array.from(profile.competencyMap.entries())
    .slice(0, 8); // Show top 8 for visibility

  return (
    <div className="competency-radar">
      <svg width="400" height="400" viewBox="-200 -200 400 400">
        {/* Draw axes */}
        {competencies.map((_, i) => {
          const angle = (i * 2 * Math.PI) / competencies.length - Math.PI / 2;
          const x = Math.cos(angle) * 150;
          const y = Math.sin(angle) * 150;
          
          return (
            <line
              key={i}
              x1="0"
              y1="0"
              x2={x}
              y2={y}
              stroke="#e0e0e0"
              strokeWidth="1"
            />
          );
        })}
        
        {/* Draw data polygon */}
        <polygon
          points={competencies.map(([_, status], i) => {
            const angle = (i * 2 * Math.PI) / competencies.length - Math.PI / 2;
            const radius = (status.progressPercentage / 100) * 150;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            return `${x},${y}`;
          }).join(' ')}
          fill="rgba(76, 175, 80, 0.3)"
          stroke="#4CAF50"
          strokeWidth="2"
        />
        
        {/* Labels */}
        {competencies.map(([id, status], i) => {
          const angle = (i * 2 * Math.PI) / competencies.length - Math.PI / 2;
          const x = Math.cos(angle) * 170;
          const y = Math.sin(angle) * 170;
          
          return (
            <text
              key={id}
              x={x}
              y={y}
              textAnchor="middle"
              fontSize="12"
              style={{ cursor: 'pointer' }}
              onClick={() => onSectorClick(id)}
            >
              {status.competencyName.substring(0, 15)}...
            </text>
          );
        })}
      </svg>
    </div>
  );
};

// Competency Groups
const CompetencyGroups: React.FC<{
  groups: any[];
  onGroupSelect: (group: any) => void;
}> = ({ groups, onGroupSelect }) => {
  return (
    <div className="competency-groups">
      <h3>Competency Groups</h3>
      <div className="groups-grid">
        {groups.map(group => (
          <div 
            key={group.groupId}
            className="group-card"
            onClick={() => onGroupSelect(group)}
          >
            <h4>{group.groupName}</h4>
            <div className="group-stats">
              <div className="stat">
                <span className="value">{group.competencies.length}</span>
                <span className="label">Competencies</span>
              </div>
              <div className="stat">
                <span className="value">{Math.round(group.overallProgress)}%</span>
                <span className="label">Progress</span>
              </div>
              <div className="stat">
                <span className="value">{Math.round(group.synergyScore * 100)}%</span>
                <span className="label">Synergy</span>
              </div>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${group.overallProgress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Quick Actions for Students
const QuickActions: React.FC<{
  profile: ALFCompetencyProfile;
  onAction: (action: string) => void;
}> = ({ profile, onAction }) => {
  const acceleratingCompetencies = Array.from(profile.competencyMap.values())
    .filter(s => s.momentum === 'accelerating');
  
  const needsAttention = Array.from(profile.competencyMap.values())
    .filter(s => s.momentum === 'dormant' || s.momentum === 'slowing');

  return (
    <div className="quick-actions">
      <h3>Quick Actions</h3>
      
      {acceleratingCompetencies.length > 0 && (
        <div className="action-card accelerating">
          <h4>🚀 Keep the Momentum!</h4>
          <p>You're making great progress in {acceleratingCompetencies.length} competencies</p>
          <button onClick={() => onAction('view_accelerating')}>
            View Opportunities
          </button>
        </div>
      )}
      
      {needsAttention.length > 0 && (
        <div className="action-card attention">
          <h4>⚡ Reignite Your Journey</h4>
          <p>{needsAttention.length} competencies could use some love</p>
          <button onClick={() => onAction('view_needs_attention')}>
            Get Inspired
          </button>
        </div>
      )}
      
      <div className="action-card goals">
        <h4>🎯 Set a New Goal</h4>
        <p>Challenge yourself with a new competency target</p>
        <button onClick={() => onAction('set_goal')}>
          Set Goal
        </button>
      </div>
    </div>
  );
};

// Detailed view components would continue...
const CompetencyDetails: React.FC<any> = ({ profile, selectedCompetency, updates, timeRange, onTimeRangeChange, viewMode }) => (
  <div>Competency Details View</div>
);

const CompetencyGoals: React.FC<any> = ({ goals, milestoneData, onNewGoal, viewMode }) => (
  <div>Competency Goals View</div>
);

const CompetencyRecommendations: React.FC<any> = ({ recommendations, profile, viewMode }) => (
  <div>Competency Recommendations View</div>
);

const GoalSettingModal: React.FC<any> = ({ competencyId, competencyStatus, onGoalSet, onClose }) => (
  <div>Goal Setting Modal</div>
);

export default ALFCompetencyTracker;