/**
 * Competency Constellation Visualization
 * 
 * Maps competencies as interconnected stars in a constellation,
 * showing relationships, mastery levels, and growth trajectories.
 * 
 * Design Principles:
 * - Organic network: Competencies naturally cluster and connect
 * - Growth visualization: Star brightness indicates mastery level
 * - Relationship mapping: Connection strength shows interdependence
 * - Discovery inspiration: Encourages exploration of new connections
 * - Personal universe: Each student has unique constellation pattern
 */

import React, { useState, useEffect, useRef } from 'react';
import { ALFCompetencyProfile, CompetencyStatus } from '../../../services/alf-competency-tracking-service';

interface CompetencyConstellationProps {
  competencyProfile: ALFCompetencyProfile;
  interactive?: boolean;
  showConnections?: boolean;
  selectedCompetency?: string;
  onCompetencySelect?: (competencyId: string) => void;
  animationDuration?: number;
  showLabels?: boolean;
}

export const CompetencyConstellation: React.FC<CompetencyConstellationProps> = ({
  competencyProfile,
  interactive = true,
  showConnections = true,
  selectedCompetency,
  onCompetencySelect,
  animationDuration = 3000,
  showLabels = true
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredCompetency, setHoveredCompetency] = useState<string | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: any } | null>(null);
  const [constellationData, setConstellationData] = useState<ConstellationNode[]>([]);

  // Animation effect
  useEffect(() => {
    if (animationDuration > 0) {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        setAnimationProgress(progress);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      animate();
    } else {
      setAnimationProgress(1);
    }
  }, [animationDuration]);

  // Process competency data into constellation nodes
  useEffect(() => {
    const width = 800;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) * 0.35;

    const competencies = Array.from(competencyProfile.competencyMap.entries());
    
    // Group competencies by domain/category for constellation clustering
    const competencyGroups = competencyProfile.competencyGroups;
    
    const nodes: ConstellationNode[] = [];
    
    competencyGroups.forEach((group, groupIndex) => {
      // Calculate group center position
      const groupAngle = (groupIndex * 2 * Math.PI) / competencyGroups.length;
      const groupRadius = maxRadius * 0.7;
      const groupCenterX = centerX + groupRadius * Math.cos(groupAngle);
      const groupCenterY = centerY + groupRadius * Math.sin(groupAngle);
      
      // Position competencies within group
      group.competencies.forEach((competencyId, compIndex) => {
        const competencyStatus = competencyProfile.competencyMap.get(competencyId);
        if (!competencyStatus) return;
        
        // Calculate individual competency position within group
        const localAngle = (compIndex * 2 * Math.PI) / group.competencies.length;
        const localRadius = Math.min(80, group.competencies.length * 10);
        
        const x = groupCenterX + localRadius * Math.cos(localAngle);
        const y = groupCenterY + localRadius * Math.sin(localAngle);
        
        const node: ConstellationNode = {
          id: competencyId,
          name: competencyStatus.competencyName,
          x,
          y,
          groupId: group.groupId,
          groupName: group.groupName,
          status: competencyStatus,
          progress: competencyStatus.progressPercentage,
          momentum: competencyStatus.momentum,
          brightness: calculateBrightness(competencyStatus),
          size: calculateStarSize(competencyStatus),
          color: getCompetencyColor(competencyStatus, group.groupId),
          connections: calculateConnections(competencyId, competencyProfile),
          isVisible: animationProgress > (groupIndex * 0.2 + compIndex * 0.1),
          pulseRate: getMomentumPulseRate(competencyStatus.momentum),
          achievements: getCompetencyAchievements(competencyStatus)
        };
        
        nodes.push(node);
      });
    });
    
    setConstellationData(nodes);
  }, [competencyProfile, animationProgress]);

  // Handle mouse events
  const handleCompetencyMouseEnter = (event: React.MouseEvent, node: ConstellationNode) => {
    if (!interactive) return;
    
    setHoveredCompetency(node.id);
    
    const rect = svgRef.current?.getBoundingClientRect();
    setTooltip({
      x: event.clientX - (rect?.left || 0) + 10,
      y: event.clientY - (rect?.top || 0) - 10,
      content: {
        name: node.name,
        progress: node.progress,
        momentum: node.momentum,
        group: node.groupName,
        achievements: node.achievements,
        connections: node.connections.length,
        status: node.status
      }
    });
  };

  const handleCompetencyMouseLeave = () => {
    setHoveredCompetency(null);
    setTooltip(null);
  };

  const handleCompetencyClick = (competencyId: string) => {
    if (interactive && onCompetencySelect) {
      onCompetencySelect(competencyId);
    }
  };

  const width = 800;
  const height = 600;

  return (
    <div className="competency-constellation">
      <div className="constellation-header">
        <h3>⭐ Your Competency Constellation</h3>
        <p>Explore your unique pattern of skills and their interconnections</p>
      </div>

      <div className="constellation-container">
        <svg 
          ref={svgRef}
          width={width} 
          height={height} 
          viewBox={`0 0 ${width} ${height}`}
          className="constellation-svg"
        >
          {/* Background and effects */}
          <defs>
            {/* Star glow effect */}
            <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            {/* Pulsing animation */}
            <filter id="pulse" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            {/* Gradient backgrounds for groups */}
            {competencyProfile.competencyGroups.map((group, index) => (
              <radialGradient 
                key={`gradient-${group.groupId}`}
                id={`groupGradient-${group.groupId}`}
                cx="50%" cy="50%" r="50%"
              >
                <stop offset="0%" stopColor={getGroupColor(group.groupId)} stopOpacity="0.1" />
                <stop offset="100%" stopColor={getGroupColor(group.groupId)} stopOpacity="0.03" />
              </radialGradient>
            ))}
          </defs>

          {/* Background starfield */}
          <rect width={width} height={height} fill="#0a0a1a" />
          
          {/* Random background stars for atmosphere */}
          {Array.from({ length: 50 }, (_, i) => (
            <circle
              key={`bg-star-${i}`}
              cx={Math.random() * width}
              cy={Math.random() * height}
              r={Math.random() * 1.5 + 0.5}
              fill="white"
              opacity={Math.random() * 0.3 + 0.1}
            />
          ))}

          {/* Group background areas */}
          {competencyProfile.competencyGroups.map((group, index) => {
            const groupNodes = constellationData.filter(node => node.groupId === group.groupId);
            if (groupNodes.length === 0) return null;
            
            // Calculate group bounds
            const minX = Math.min(...groupNodes.map(n => n.x)) - 50;
            const maxX = Math.max(...groupNodes.map(n => n.x)) + 50;
            const minY = Math.min(...groupNodes.map(n => n.y)) - 50;
            const maxY = Math.max(...groupNodes.map(n => n.y)) + 50;
            const groupWidth = maxX - minX;
            const groupHeight = maxY - minY;
            
            return (
              <ellipse
                key={`group-bg-${group.groupId}`}
                cx={minX + groupWidth / 2}
                cy={minY + groupHeight / 2}
                rx={groupWidth / 2}
                ry={groupHeight / 2}
                fill={`url(#groupGradient-${group.groupId})`}
                opacity={animationProgress * 0.6}
                className="group-background"
              />
            );
          })}

          {/* Connection lines */}
          {showConnections && constellationData.map(node => 
            node.connections.map(connection => {
              const targetNode = constellationData.find(n => n.id === connection.targetId);
              if (!targetNode || !node.isVisible || !targetNode.isVisible) return null;
              
              const isHighlighted = hoveredCompetency === node.id || 
                                  hoveredCompetency === connection.targetId ||
                                  selectedCompetency === node.id ||
                                  selectedCompetency === connection.targetId;
              
              return (
                <line
                  key={`connection-${node.id}-${connection.targetId}`}
                  x1={node.x}
                  y1={node.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={connection.color}
                  strokeWidth={connection.strength * 2 + (isHighlighted ? 1 : 0)}
                  opacity={isHighlighted ? 0.8 : 0.3}
                  strokeDasharray={connection.type === 'dependency' ? '5,5' : 'none'}
                  className="competency-connection"
                />
              );
            })
          )}

          {/* Competency stars */}
          {constellationData.map(node => {
            const isHovered = hoveredCompetency === node.id;
            const isSelected = selectedCompetency === node.id;
            const isHighlighted = isHovered || isSelected;
            
            if (!node.isVisible) return null;
            
            return (
              <g 
                key={node.id}
                className="competency-star"
                style={{
                  cursor: interactive ? 'pointer' : 'default'
                }}
              >
                {/* Star halo for high-performing competencies */}
                {node.brightness > 0.8 && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.size + 8}
                    fill={node.color}
                    opacity={0.2}
                    filter="url(#starGlow)"
                  />
                )}
                
                {/* Main star shape */}
                <StarShape
                  x={node.x}
                  y={node.y}
                  size={node.size}
                  color={node.color}
                  brightness={node.brightness}
                  isHighlighted={isHighlighted}
                  pulseRate={node.pulseRate}
                  onClick={() => handleCompetencyClick(node.id)}
                  onMouseEnter={(e) => handleCompetencyMouseEnter(e, node)}
                  onMouseLeave={handleCompetencyMouseLeave}
                />
                
                {/* Progress ring */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.size + 4}
                  fill="none"
                  stroke={node.color}
                  strokeWidth="2"
                  strokeDasharray={`${2 * Math.PI * (node.size + 4) * (node.progress / 100)} ${2 * Math.PI * (node.size + 4) * (1 - node.progress / 100)}`}
                  opacity={0.6}
                  transform={`rotate(-90 ${node.x} ${node.y})`}
                />
                
                {/* Competency label */}
                {showLabels && (isHighlighted || node.brightness > 0.7) && (
                  <text
                    x={node.x}
                    y={node.y + node.size + 20}
                    textAnchor="middle"
                    fontSize="10"
                    fill="white"
                    fontWeight="bold"
                    opacity={isHighlighted ? 1 : 0.7}
                  >
                    {node.name.length > 15 ? node.name.substring(0, 15) + '...' : node.name}
                  </text>
                )}
                
                {/* Achievement indicators */}
                {node.achievements.length > 0 && (
                  <g className="achievement-indicators">
                    {node.achievements.slice(0, 3).map((achievement, index) => (
                      <circle
                        key={index}
                        cx={node.x + 15 + index * 8}
                        cy={node.y - 15}
                        r="3"
                        fill={getAchievementColor(achievement.type)}
                        opacity={0.8}
                      />
                    ))}
                  </g>
                )}
              </g>
            );
          })}

          {/* Group labels */}
          {competencyProfile.competencyGroups.map((group, index) => {
            const groupNodes = constellationData.filter(node => node.groupId === group.groupId && node.isVisible);
            if (groupNodes.length === 0) return null;
            
            const centerX = groupNodes.reduce((sum, node) => sum + node.x, 0) / groupNodes.length;
            const centerY = groupNodes.reduce((sum, node) => sum + node.y, 0) / groupNodes.length;
            
            return (
              <g key={`group-label-${group.groupId}`} className="group-label">
                <text
                  x={centerX}
                  y={centerY - 40}
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="bold"
                  fill={getGroupColor(group.groupId)}
                  opacity={animationProgress * 0.8}
                >
                  {group.groupName.toUpperCase()}
                </text>
                <text
                  x={centerX}
                  y={centerY - 25}
                  textAnchor="middle"
                  fontSize="10"
                  fill="white"
                  opacity={animationProgress * 0.6}
                >
                  {Math.round(group.overallProgress)}% Complete
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div 
            className="constellation-tooltip"
            style={{
              position: 'absolute',
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="tooltip-content">
              <h4>{tooltip.content.name}</h4>
              <div className="competency-details">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${tooltip.content.progress}%` }}></div>
                  <span className="progress-text">{Math.round(tooltip.content.progress)}% Complete</span>
                </div>
                <div className="momentum-indicator">
                  <span className="label">Momentum:</span>
                  <span className={`momentum ${tooltip.content.momentum}`}>
                    {getMomentumIcon(tooltip.content.momentum)} {tooltip.content.momentum}
                  </span>
                </div>
                <div className="group-info">
                  <span className="label">Group:</span>
                  <span className="value">{tooltip.content.group}</span>
                </div>
                <div className="connections-info">
                  <span className="label">Connected to:</span>
                  <span className="value">{tooltip.content.connections} competencies</span>
                </div>
                {tooltip.content.achievements.length > 0 && (
                  <div className="achievements">
                    <span className="label">Recent achievements:</span>
                    <div className="achievement-list">
                      {tooltip.content.achievements.slice(0, 2).map((achievement: any, index: number) => (
                        <span key={index} className="achievement">{achievement.title}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Constellation legend */}
      <div className="constellation-legend">
        <h4>Reading Your Constellation</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-star bright"></div>
            <span>High Mastery</span>
          </div>
          <div className="legend-item">
            <div className="legend-star medium"></div>
            <span>Developing</span>
          </div>
          <div className="legend-item">
            <div className="legend-star dim"></div>
            <span>Beginning</span>
          </div>
          <div className="legend-item">
            <div className="legend-line solid"></div>
            <span>Strong Connection</span>
          </div>
          <div className="legend-item">
            <div className="legend-line dashed"></div>
            <span>Dependency</span>
          </div>
        </div>
        <div className="momentum-legend">
          <h5>Momentum Indicators</h5>
          <div className="momentum-items">
            <span className="momentum-item accelerating">🚀 Accelerating</span>
            <span className="momentum-item steady">➡️ Steady</span>
            <span className="momentum-item slowing">📉 Slowing</span>
            <span className="momentum-item dormant">😴 Dormant</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Star Shape Component
const StarShape: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  brightness: number;
  isHighlighted: boolean;
  pulseRate: number;
  onClick: () => void;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
}> = ({ x, y, size, color, brightness, isHighlighted, pulseRate, onClick, onMouseEnter, onMouseLeave }) => {
  const points = generateStarPoints(x, y, size);
  
  return (
    <g>
      <polygon
        points={points}
        fill={color}
        opacity={brightness}
        stroke={isHighlighted ? 'white' : color}
        strokeWidth={isHighlighted ? 2 : 1}
        filter={brightness > 0.7 ? "url(#starGlow)" : "none"}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{
          animation: pulseRate > 0 ? `pulse ${2 / pulseRate}s infinite` : 'none'
        }}
      />
    </g>
  );
};

// Helper functions
const generateStarPoints = (centerX: number, centerY: number, size: number): string => {
  const outerRadius = size;
  const innerRadius = size * 0.4;
  const numPoints = 5;
  
  let points = '';
  for (let i = 0; i < numPoints * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points += `${x},${y} `;
  }
  
  return points.trim();
};

const calculateBrightness = (status: CompetencyStatus): number => {
  return Math.min(1, status.progressPercentage / 100 + 0.3);
};

const calculateStarSize = (status: CompetencyStatus): number => {
  return Math.max(8, 8 + (status.progressPercentage / 100) * 12);
};

const getCompetencyColor = (status: CompetencyStatus, groupId: string): string => {
  const baseColor = getGroupColor(groupId);
  const intensity = Math.min(1, status.progressPercentage / 100 + 0.5);
  
  // Adjust color intensity based on progress
  return adjustColorIntensity(baseColor, intensity);
};

const getGroupColor = (groupId: string): string => {
  const colors = {
    'core_academics': '#FF6B6B',
    'creative_expression': '#4ECDC4',
    'social_emotional': '#45B7D1',
    'practical_skills': '#96CEB4',
    'critical_thinking': '#FFEAA7',
    'communication': '#DDA0DD',
    'collaboration': '#98D8C8',
    'innovation': '#F7DC6F'
  };
  
  return colors[groupId as keyof typeof colors] || '#9E9E9E';
};

const adjustColorIntensity = (hexColor: string, intensity: number): string => {
  // Simple color intensity adjustment
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  const adjustedR = Math.min(255, Math.floor(r * intensity));
  const adjustedG = Math.min(255, Math.floor(g * intensity));
  const adjustedB = Math.min(255, Math.floor(b * intensity));
  
  return `rgb(${adjustedR}, ${adjustedG}, ${adjustedB})`;
};

const calculateConnections = (competencyId: string, profile: ALFCompetencyProfile): Connection[] => {
  // This would be implemented based on competency relationships
  // For now, return sample connections
  return [];
};

const getMomentumPulseRate = (momentum: string): number => {
  switch (momentum) {
    case 'accelerating': return 2;
    case 'steady': return 1;
    case 'slowing': return 0.5;
    case 'dormant': return 0;
    default: return 0;
  }
};

const getMomentumIcon = (momentum: string): string => {
  switch (momentum) {
    case 'accelerating': return '🚀';
    case 'steady': return '➡️';
    case 'slowing': return '📉';
    case 'dormant': return '😴';
    default: return '❓';
  }
};

const getCompetencyAchievements = (status: CompetencyStatus): Achievement[] => {
  // This would extract recent achievements from the competency status
  return [];
};

const getAchievementColor = (type: string): string => {
  const colors = {
    'milestone': '#FFD700',
    'community': '#4ECDC4',
    'collaboration': '#FF6B6B',
    'innovation': '#9B59B6'
  };
  
  return colors[type as keyof typeof colors] || '#BDC3C7';
};

// Type definitions
interface ConstellationNode {
  id: string;
  name: string;
  x: number;
  y: number;
  groupId: string;
  groupName: string;
  status: CompetencyStatus;
  progress: number;
  momentum: string;
  brightness: number;
  size: number;
  color: string;
  connections: Connection[];
  isVisible: boolean;
  pulseRate: number;
  achievements: Achievement[];
}

interface Connection {
  targetId: string;
  type: 'synergy' | 'dependency' | 'transfer';
  strength: number; // 0-1
  color: string;
}

interface Achievement {
  type: string;
  title: string;
  date: Date;
}

export default CompetencyConstellation;