/**
 * Student View - ALF Analytics Dashboard
 * 
 * Designed for students to track their authentic learning journey,
 * celebrate achievements, and discover opportunities for growth.
 * 
 * Design Principles:
 * - Student agency: Puts learner in control of their story
 * - Growth mindset: Emphasizes progress over perfection
 * - Authentic celebration: Highlights real-world impact
 * - Forward momentum: Inspires next steps and goals
 * - Community connection: Shows relationships and validation
 */

import React, { useState, useEffect } from 'react';
import { type DashboardData } from '../ALFAnalyticsDashboard';
import { LearningProgressionSpiral } from '../visualizations/LearningProgressionSpiral';
import { CompetencyConstellation } from '../visualizations/CompetencyConstellation';
import { CommunityImpactHeatmap } from '../visualizations/CommunityImpactHeatmap';
import { PortfolioEvidenceTimeline } from '../visualizations/PortfolioEvidenceTimeline';
import { GrowthTrajectoryChart } from '../visualizations/GrowthTrajectoryChart';
import { AuthenticAchievementBadges } from '../visualizations/AuthenticAchievementBadges';
import { GoalProgressTracker } from '../visualizations/GoalProgressTracker';
import { TransferLearningNetwork } from '../visualizations/TransferLearningNetwork';
import { CelebrationModal } from '../components/CelebrationModal';
import { QuickActionPanel } from '../components/QuickActionPanel';
import { InsightCard } from '../components/InsightCard';

interface StudentViewProps {
  data: DashboardData;
  studentId: string;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  filters: any;
  onFiltersChange: (filters: any) => void;
  celebrationMode: boolean;
  onCelebrationClose: () => void;
}

export const StudentView: React.FC<StudentViewProps> = ({
  data,
  studentId,
  timeRange,
  onTimeRangeChange,
  filters,
  onFiltersChange,
  celebrationMode,
  onCelebrationClose
}) => {
  const [activeView, setActiveView] = useState<'overview' | 'journey' | 'goals' | 'community' | 'portfolio'>('overview');
  const [selectedVisualization, setSelectedVisualization] = useState<string>('spiral');
  const [goalSettingMode, setGoalSettingMode] = useState(false);
  const [insightsExpanded, setInsightsExpanded] = useState(true);

  // Generate personalized insights
  const personalInsights = generatePersonalInsights(data);
  const growthHighlights = generateGrowthHighlights(data);
  const opportunities = generateOpportunities(data);

  return (
    <div className="student-dashboard-view">
      {/* Celebration Modal */}
      {celebrationMode && (
        <CelebrationModal 
          achievements={identifyRecentAchievements(data)}
          onClose={onCelebrationClose}
          studentName={data.progression.studentId}
        />
      )}

      {/* Header Section */}
      <header className="student-header">
        <div className="welcome-section">
          <h1 className="student-greeting">
            Welcome back to your learning journey! 🌟
          </h1>
          <p className="journey-subtitle">
            Discover your growth, celebrate achievements, and explore new opportunities
          </p>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card momentum">
            <div className="stat-icon">🚀</div>
            <div className="stat-content">
              <span className="stat-value">{Math.round(data.growthMetrics.momentumScore * 100)}%</span>
              <span className="stat-label">Momentum Score</span>
            </div>
          </div>
          
          <div className="stat-card community">
            <div className="stat-icon">🤝</div>
            <div className="stat-content">
              <span className="stat-value">{data.communityMetrics.partnerCount}</span>
              <span className="stat-label">Community Partners</span>
            </div>
          </div>
          
          <div className="stat-card authenticity">
            <div className="stat-icon">💎</div>
            <div className="stat-content">
              <span className="stat-value">{Math.round(data.portfolioMetrics.authenticityScore * 100)}%</span>
              <span className="stat-label">Authenticity Score</span>
            </div>
          </div>
          
          <div className="stat-card impact">
            <div className="stat-icon">🌍</div>
            <div className="stat-content">
              <span className="stat-value">{data.portfolioMetrics.realWorldImpacts}</span>
              <span className="stat-label">Real-World Impacts</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="view-navigation">
        <button 
          className={`nav-button ${activeView === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveView('overview')}
        >
          <span className="nav-icon">🏠</span>
          Overview
        </button>
        <button 
          className={`nav-button ${activeView === 'journey' ? 'active' : ''}`}
          onClick={() => setActiveView('journey')}
        >
          <span className="nav-icon">🛤️</span>
          My Journey
        </button>
        <button 
          className={`nav-button ${activeView === 'goals' ? 'active' : ''}`}
          onClick={() => setActiveView('goals')}
        >
          <span className="nav-icon">🎯</span>
          Goals
        </button>
        <button 
          className={`nav-button ${activeView === 'community' ? 'active' : ''}`}
          onClick={() => setActiveView('community')}
        >
          <span className="nav-icon">🌐</span>
          Community
        </button>
        <button 
          className={`nav-button ${activeView === 'portfolio' ? 'active' : ''}`}
          onClick={() => setActiveView('portfolio')}
        >
          <span className="nav-icon">📁</span>
          Portfolio
        </button>
      </nav>

      {/* Main Content */}
      <main className="dashboard-content">
        {activeView === 'overview' && (
          <OverviewSection 
            data={data}
            insights={personalInsights}
            highlights={growthHighlights}
            opportunities={opportunities}
            onVisualizationSelect={setSelectedVisualization}
            selectedVisualization={selectedVisualization}
          />
        )}

        {activeView === 'journey' && (
          <JourneySection 
            data={data}
            timeRange={timeRange}
            onTimeRangeChange={onTimeRangeChange}
          />
        )}

        {activeView === 'goals' && (
          <GoalsSection 
            data={data}
            onGoalSetting={() => setGoalSettingMode(true)}
          />
        )}

        {activeView === 'community' && (
          <CommunitySection 
            data={data}
            timeRange={timeRange}
          />
        )}

        {activeView === 'portfolio' && (
          <PortfolioSection 
            data={data}
            filters={filters}
            onFiltersChange={onFiltersChange}
          />
        )}
      </main>

      {/* Quick Actions Sidebar */}
      <aside className="quick-actions-sidebar">
        <QuickActionPanel 
          data={data}
          onGoalSet={() => setGoalSettingMode(true)}
          onExploreOpportunity={(opportunity) => console.log('Explore:', opportunity)}
          onCelebrate={() => console.log('Celebrate achievement')}
        />
      </aside>
    </div>
  );
};

// Overview Section Component
const OverviewSection: React.FC<{
  data: DashboardData;
  insights: PersonalInsight[];
  highlights: GrowthHighlight[];
  opportunities: LearningOpportunity[];
  onVisualizationSelect: (viz: string) => void;
  selectedVisualization: string;
}> = ({ data, insights, highlights, opportunities, onVisualizationSelect, selectedVisualization }) => {
  return (
    <div className="overview-section">
      {/* Growth Highlights */}
      <section className="growth-highlights">
        <h2>🌱 Your Growth Story</h2>
        <div className="highlights-grid">
          {highlights.map((highlight, index) => (
            <div key={index} className={`highlight-card ${highlight.type}`}>
              <div className="highlight-icon">{highlight.icon}</div>
              <div className="highlight-content">
                <h3>{highlight.title}</h3>
                <p>{highlight.description}</p>
                {highlight.evidence && (
                  <span className="evidence-count">{highlight.evidence.length} pieces of evidence</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Visualization */}
      <section className="main-visualization">
        <div className="visualization-header">
          <h2>📊 Learning Visualization</h2>
          <div className="viz-selector">
            <button 
              className={selectedVisualization === 'spiral' ? 'active' : ''}
              onClick={() => onVisualizationSelect('spiral')}
            >
              🌀 Learning Spiral
            </button>
            <button 
              className={selectedVisualization === 'constellation' ? 'active' : ''}
              onClick={() => onVisualizationSelect('constellation')}
            >
              ⭐ Competency Stars
            </button>
            <button 
              className={selectedVisualization === 'growth' ? 'active' : ''}
              onClick={() => onVisualizationSelect('growth')}
            >
              📈 Growth Curve
            </button>
            <button 
              className={selectedVisualization === 'network' ? 'active' : ''}
              onClick={() => onVisualizationSelect('network')}
            >
              🕸️ Learning Network
            </button>
          </div>
        </div>

        <div className="visualization-container">
          {selectedVisualization === 'spiral' && (
            <LearningProgressionSpiral 
              progression={data.progression}
              interactive={true}
              showTooltips={true}
            />
          )}
          
          {selectedVisualization === 'constellation' && (
            <CompetencyConstellation 
              competencyProfile={data.competencyProfile}
              interactive={true}
              showConnections={true}
            />
          )}
          
          {selectedVisualization === 'growth' && (
            <GrowthTrajectoryChart 
              timelineData={data.progressionTimeline}
              showPredictions={true}
              interactive={true}
            />
          )}
          
          {selectedVisualization === 'network' && (
            <TransferLearningNetwork 
              progression={data.progression}
              competencyProfile={data.competencyProfile}
              interactive={true}
            />
          )}
        </div>
      </section>

      {/* Personal Insights */}
      <section className="personal-insights">
        <h2>💡 Your Learning Insights</h2>
        <div className="insights-grid">
          {insights.map((insight, index) => (
            <InsightCard 
              key={index}
              insight={insight}
              expandable={true}
            />
          ))}
        </div>
      </section>

      {/* Learning Opportunities */}
      <section className="learning-opportunities">
        <h2>🚀 Next Adventures</h2>
        <div className="opportunities-list">
          {opportunities.map((opportunity, index) => (
            <div key={index} className={`opportunity-card ${opportunity.priority}`}>
              <div className="opportunity-header">
                <h3>{opportunity.title}</h3>
                <span className={`priority-badge ${opportunity.priority}`}>
                  {opportunity.priority}
                </span>
              </div>
              <p>{opportunity.description}</p>
              <div className="opportunity-meta">
                <span className="timeline">⏱️ {opportunity.estimatedTime}</span>
                <span className="impact">💫 {opportunity.impactPotential}</span>
              </div>
              <div className="opportunity-actions">
                <button className="explore-button">
                  Explore This
                </button>
                {opportunity.mentorAvailable && (
                  <button className="mentor-button">
                    Connect with Mentor
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// Journey Section Component
const JourneySection: React.FC<{
  data: DashboardData;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}> = ({ data, timeRange, onTimeRangeChange }) => {
  return (
    <div className="journey-section">
      <div className="timeline-controls">
        <h2>🛤️ Your Learning Journey</h2>
        <div className="time-range-selector">
          {['week', 'month', 'semester', 'year', 'all'].map(range => (
            <button 
              key={range}
              className={timeRange === range ? 'active' : ''}
              onClick={() => onTimeRangeChange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <PortfolioEvidenceTimeline 
        evidence={data.progression.portfolioEvidence}
        milestones={data.progression.milestones}
        reflections={data.progression.reflections}
        timeRange={timeRange}
        interactive={true}
        showDetails={true}
      />

      <div className="journey-insights">
        <div className="insight-card">
          <h3>🎯 Patterns in Your Learning</h3>
          <p>You tend to make breakthrough progress when working on community-connected projects.</p>
        </div>
        <div className="insight-card">
          <h3>⚡ Your Learning Rhythm</h3>
          <p>Your most productive learning happens in 2-3 week iteration cycles.</p>
        </div>
        <div className="insight-card">
          <h3>🤝 Collaboration Impact</h3>
          <p>Projects with peer collaboration show 40% higher authenticity scores.</p>
        </div>
      </div>
    </div>
  );
};

// Goals Section Component
const GoalsSection: React.FC<{
  data: DashboardData;
  onGoalSetting: () => void;
}> = ({ data, onGoalSetting }) => {
  return (
    <div className="goals-section">
      <div className="goals-header">
        <h2>🎯 Your Learning Goals</h2>
        <button className="set-goal-button" onClick={onGoalSetting}>
          + Set New Goal
        </button>
      </div>

      <GoalProgressTracker 
        goalProgress={data.goalProgress}
        competencyGoals={data.competencyProfile.competencyGoals}
        interactive={true}
        showMilestones={true}
      />

      <div className="goal-recommendations">
        <h3>💡 Suggested Goals</h3>
        <div className="suggestions-grid">
          {generateGoalSuggestions(data).map((suggestion, index) => (
            <div key={index} className="suggestion-card">
              <h4>{suggestion.title}</h4>
              <p>{suggestion.rationale}</p>
              <div className="suggestion-meta">
                <span className="timeline">📅 {suggestion.timeline}</span>
                <span className="difficulty">⚡ {suggestion.difficulty}</span>
              </div>
              <button className="adopt-goal-button">
                Adopt This Goal
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Community Section Component
const CommunitySection: React.FC<{
  data: DashboardData;
  timeRange: string;
}> = ({ data, timeRange }) => {
  return (
    <div className="community-section">
      <h2>🌐 Your Learning Community</h2>

      <CommunityImpactHeatmap 
        communityEngagement={data.communityEngagement}
        validations={data.progression.communityValidation}
        timeRange={timeRange}
        interactive={true}
      />

      <div className="community-stories">
        <h3>🤝 Community Connections</h3>
        <div className="connections-grid">
          {data.progression.communityValidation.map((validation, index) => (
            <div key={index} className="connection-card">
              <div className="partner-info">
                <h4>{validation.validatorName}</h4>
                <p className="organization">{validation.organization}</p>
                <p className="role">{validation.validatorRole}</p>
              </div>
              <div className="connection-details">
                <div className="validation-score">
                  <span className="score">{validation.realWorldRelevance}/5</span>
                  <span className="label">Impact Rating</span>
                </div>
                <div className="feedback-summary">
                  <p>"{validation.strengths[0]}"</p>
                </div>
                {validation.mentorshipOffered && (
                  <div className="mentorship-badge">
                    Mentorship Available
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Portfolio Section Component
const PortfolioSection: React.FC<{
  data: DashboardData;
  filters: any;
  onFiltersChange: (filters: any) => void;
}> = ({ data, filters, onFiltersChange }) => {
  return (
    <div className="portfolio-section">
      <div className="portfolio-header">
        <h2>📁 Your Evidence Portfolio</h2>
        <div className="portfolio-stats">
          <span className="stat">
            {data.portfolioMetrics.totalEvidence} pieces of evidence
          </span>
          <span className="stat">
            {Math.round(data.portfolioMetrics.authenticityScore * 100)}% avg authenticity
          </span>
          <span className="stat">
            {data.portfolioMetrics.realWorldImpacts} real-world impacts
          </span>
        </div>
      </div>

      <AuthenticAchievementBadges 
        evidence={data.progression.portfolioEvidence}
        milestones={data.progression.milestones}
        communityValidations={data.progression.communityValidation}
        interactive={true}
      />

      <div className="portfolio-filters">
        <h3>Filter Your Evidence</h3>
        <div className="filter-controls">
          <select 
            value={filters.evidenceType || 'all'}
            onChange={(e) => onFiltersChange({...filters, evidenceType: e.target.value})}
          >
            <option value="all">All Evidence Types</option>
            <option value="project_artifact">Project Artifacts</option>
            <option value="community_feedback">Community Feedback</option>
            <option value="peer_collaboration">Peer Collaboration</option>
            <option value="self_reflection">Self Reflection</option>
          </select>
          
          <input 
            type="range"
            min="0"
            max="100"
            value={(filters.minimumAuthenticity || 0) * 100}
            onChange={(e) => onFiltersChange({...filters, minimumAuthenticity: e.target.value / 100})}
            className="authenticity-slider"
          />
          <span>Min Authenticity: {Math.round((filters.minimumAuthenticity || 0) * 100)}%</span>
        </div>
      </div>

      <div className="evidence-grid">
        {data.progression.portfolioEvidence
          .filter(evidence => applyPortfolioFilters(evidence, filters))
          .map((evidence, index) => (
            <div key={evidence.id} className="evidence-card">
              <div className="evidence-header">
                <h4>{evidence.title}</h4>
                <span className={`evidence-type ${evidence.type}`}>
                  {evidence.type.replace('_', ' ')}
                </span>
              </div>
              <p className="evidence-description">{evidence.description}</p>
              <div className="evidence-metrics">
                <div className="authenticity">
                  <span className="value">{Math.round(evidence.authenticityScore * 100)}%</span>
                  <span className="label">Authenticity</span>
                </div>
                <div className="validations">
                  <span className="value">{evidence.validations.length}</span>
                  <span className="label">Validations</span>
                </div>
                <div className="impact">
                  <span className="value">{evidence.communityImpact.measurableOutcomes.length}</span>
                  <span className="label">Outcomes</span>
                </div>
              </div>
              <div className="evidence-reflection">
                <h5>Your Reflection:</h5>
                <p>"{evidence.studentReflection.substring(0, 100)}..."</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

// Helper functions
const generatePersonalInsights = (data: DashboardData): PersonalInsight[] => {
  return [
    {
      type: 'strength',
      title: 'Community Connection Master',
      description: 'You excel at building meaningful relationships with community partners.',
      evidence: ['High community validation scores', 'Multiple ongoing partnerships'],
      actionable: 'Consider mentoring other students in community engagement.'
    },
    {
      type: 'growth',
      title: 'Reflection Deepening',
      description: 'Your reflection quality has improved 35% over the semester.',
      evidence: ['Longer, more thoughtful reflections', 'Better connection-making'],
      actionable: 'Try sharing your reflection techniques with peers.'
    },
    {
      type: 'opportunity',
      title: 'Cross-Domain Transfer',
      description: 'Opportunity to connect learning across more domains.',
      evidence: ['Strong progress in individual domains', 'Few interdisciplinary projects'],
      actionable: 'Look for projects that combine your interests.'
    }
  ];
};

const generateGrowthHighlights = (data: DashboardData): GrowthHighlight[] => {
  return [
    {
      type: 'achievement',
      icon: '🏆',
      title: 'Authenticity Leader',
      description: 'Your work shows exceptional real-world relevance',
      evidence: data.progression.portfolioEvidence.filter(e => e.authenticityScore > 0.9)
    },
    {
      type: 'momentum',
      icon: '🚀',
      title: 'Accelerating Growth',
      description: 'Your learning momentum is increasing',
      evidence: []
    },
    {
      type: 'community',
      icon: '🤝',
      title: 'Community Champion',
      description: 'Building strong partnerships with community mentors',
      evidence: []
    }
  ];
};

const generateOpportunities = (data: DashboardData): LearningOpportunity[] => {
  return [
    {
      title: 'Lead a Community Project',
      description: 'Your community connections and project skills make you ready to lead others.',
      priority: 'high',
      estimatedTime: '3-4 weeks',
      impactPotential: 'High community impact',
      mentorAvailable: true,
      prerequisites: [],
      nextSteps: ['Connect with community mentor', 'Define project scope']
    },
    {
      title: 'Cross-Domain Innovation Challenge',
      description: 'Combine your strengths across multiple domains in an innovation project.',
      priority: 'medium',
      estimatedTime: '2-3 weeks',
      impactPotential: 'Skill transfer development',
      mentorAvailable: false,
      prerequisites: ['Complete current domain goals'],
      nextSteps: ['Explore interdisciplinary connections']
    }
  ];
};

const generateGoalSuggestions = (data: DashboardData): GoalSuggestion[] => {
  return [
    {
      title: 'Mentor Another Student',
      rationale: 'Your community engagement skills can help others grow.',
      timeline: '4-6 weeks',
      difficulty: 'Medium',
      alignedCompetencies: ['leadership', 'communication', 'empathy']
    },
    {
      title: 'Create Cross-Domain Portfolio',
      rationale: 'Show connections between your learning areas.',
      timeline: '3-4 weeks',
      difficulty: 'Medium',
      alignedCompetencies: ['synthesis', 'systems thinking', 'creativity']
    }
  ];
};

const identifyRecentAchievements = (data: DashboardData): Achievement[] => {
  const recent = Date.now() - 7 * 24 * 60 * 60 * 1000; // Last week
  
  return [
    ...data.progression.milestones
      .filter(m => m.achievedDate && m.achievedDate.getTime() > recent)
      .map(m => ({
        type: 'milestone' as const,
        title: m.title,
        description: m.description,
        date: m.achievedDate!,
        evidence: m.evidenceRequired.map(e => e.description)
      })),
    // Add other achievement types...
  ];
};

const applyPortfolioFilters = (evidence: any, filters: any): boolean => {
  if (filters.evidenceType && filters.evidenceType !== 'all' && evidence.type !== filters.evidenceType) {
    return false;
  }
  
  if (filters.minimumAuthenticity && evidence.authenticityScore < filters.minimumAuthenticity) {
    return false;
  }
  
  return true;
};

// Type definitions
interface PersonalInsight {
  type: 'strength' | 'growth' | 'opportunity';
  title: string;
  description: string;
  evidence: string[];
  actionable: string;
}

interface GrowthHighlight {
  type: 'achievement' | 'momentum' | 'community' | 'reflection';
  icon: string;
  title: string;
  description: string;
  evidence: any[];
}

interface LearningOpportunity {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  impactPotential: string;
  mentorAvailable: boolean;
  prerequisites: string[];
  nextSteps: string[];
}

interface GoalSuggestion {
  title: string;
  rationale: string;
  timeline: string;
  difficulty: string;
  alignedCompetencies: string[];
}

interface Achievement {
  type: 'milestone' | 'evidence' | 'collaboration' | 'community';
  title: string;
  description: string;
  date: Date;
  evidence: string[];
}

export default StudentView;