/**
 * Learning Progression Spiral Visualization
 * 
 * Visualizes non-linear learning progression through spiral encounters,
 * showing deepening understanding and expanding application over time.
 * 
 * Design Principles:
 * - Non-linear progression: Spiral shows revisiting concepts with greater depth
 * - Organic growth: Natural, flowing visual metaphor for learning
 * - Context richness: Each encounter shows authentic application context
 * - Growth celebration: Visual emphasis on deepening understanding
 * - Student agency: Interactive exploration of learning journey
 */

import React, { useState, useEffect, useRef } from 'react';
import { ALFLearningProgression, ALFProgressionLevel } from '../../../services/alf-learning-progression-service';

interface LearningProgressionSpiralProps {
  progression: ALFLearningProgression;
  interactive?: boolean;
  showTooltips?: boolean;
  selectedDomain?: string;
  onDomainSelect?: (domain: string) => void;
  animationDuration?: number;
}

export const LearningProgressionSpiral: React.FC<LearningProgressionSpiralProps> = ({
  progression,
  interactive = true,
  showTooltips = true,
  selectedDomain,
  onDomainSelect,
  animationDuration = 2000
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredEncounter, setHoveredEncounter] = useState<string | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: any } | null>(null);

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

  // Calculate spiral parameters
  const width = 800;
  const height = 600;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(width, height) * 0.4;

  // Process spiral progressions into visual data
  const spiralData = progression.spiralProgressions.map(spiral => {
    const encounters = spiral.spiralEncounters.map((encounter, index) => {
      // Calculate spiral position
      const turns = index * 0.5; // Half turn per encounter
      const radius = (index + 1) * (maxRadius / spiral.spiralEncounters.length);
      const angle = turns * 2 * Math.PI;
      
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      return {
        ...encounter,
        x,
        y,
        radius: Math.max(8, 20 - index * 2), // Decreasing size for perspective
        angle,
        spiralRadius: radius,
        opacity: animationProgress > (index / spiral.spiralEncounters.length) ? 1 : 0,
        scale: animationProgress > (index / spiral.spiralEncounters.length) ? 1 : 0
      };
    });

    return {
      ...spiral,
      encounters,
      color: getDomainColor(spiral.domain),
      isSelected: selectedDomain === spiral.domain
    };
  });

  // Generate spiral path
  const generateSpiralPath = (encounters: any[]) => {
    if (encounters.length < 2) return '';
    
    const pathData = encounters.reduce((path, encounter, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${path} ${command} ${encounter.x} ${encounter.y}`;
    }, '');
    
    return pathData;
  };

  // Handle mouse events
  const handleEncounterMouseEnter = (event: React.MouseEvent, encounter: any, domain: string) => {
    if (!interactive) return;
    
    setHoveredEncounter(`${domain}-${encounter.encounterNumber}`);
    
    if (showTooltips) {
      const rect = svgRef.current?.getBoundingClientRect();
      setTooltip({
        x: event.clientX - (rect?.left || 0) + 10,
        y: event.clientY - (rect?.top || 0) - 10,
        content: {
          domain,
          encounter,
          progress: {
            depth: encounter.depthAchieved,
            concepts: encounter.conceptsExplored,
            application: encounter.uniqueApplication,
            connections: encounter.deeperConnections
          }
        }
      });
    }
  };

  const handleEncounterMouseLeave = () => {
    setHoveredEncounter(null);
    setTooltip(null);
  };

  const handleEncounterClick = (domain: string) => {
    if (interactive && onDomainSelect) {
      onDomainSelect(domain);
    }
  };

  return (
    <div className="learning-progression-spiral">
      <div className="spiral-header">
        <h3>🌀 Your Learning Spiral</h3>
        <p>Explore how your understanding deepens through multiple encounters with each domain</p>
      </div>

      <div className="spiral-container">
        <svg 
          ref={svgRef}
          width={width} 
          height={height} 
          viewBox={`0 0 ${width} ${height}`}
          className="spiral-svg"
        >
          {/* Background spiral guides */}
          <defs>
            <radialGradient id="spiralGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(99, 102, 241, 0.1)" />
              <stop offset="100%" stopColor="rgba(99, 102, 241, 0.03)" />
            </radialGradient>
            
            {/* Filters for glow effects */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background */}
          <circle 
            cx={centerX} 
            cy={centerY} 
            r={maxRadius} 
            fill="url(#spiralGradient)" 
            opacity={animationProgress}
          />

          {/* Spiral paths for each domain */}
          {spiralData.map((spiralDomain, domainIndex) => (
            <g key={spiralDomain.domain} className="spiral-domain">
              {/* Spiral path */}
              <path
                d={generateSpiralPath(spiralDomain.encounters)}
                stroke={spiralDomain.color}
                strokeWidth={spiralDomain.isSelected ? 3 : 2}
                fill="none"
                opacity={animationProgress * 0.6}
                strokeDasharray={spiralDomain.isSelected ? "none" : "5,5"}
                filter={spiralDomain.isSelected ? "url(#glow)" : "none"}
                className="spiral-path"
              />

              {/* Encounter points */}
              {spiralDomain.encounters.map((encounter, encounterIndex) => {
                const isHovered = hoveredEncounter === `${spiralDomain.domain}-${encounter.encounterNumber}`;
                const progressionLevelRadius = getProgressionLevelRadius(encounter.depthAchieved);
                
                return (
                  <g 
                    key={encounter.encounterNumber}
                    className="spiral-encounter"
                    style={{
                      opacity: encounter.opacity,
                      transform: `scale(${encounter.scale})`,
                      transformOrigin: `${encounter.x}px ${encounter.y}px`,
                      cursor: interactive ? 'pointer' : 'default'
                    }}
                  >
                    {/* Encounter circle background */}
                    <circle
                      cx={encounter.x}
                      cy={encounter.y}
                      r={progressionLevelRadius + 2}
                      fill="white"
                      opacity={0.9}
                    />
                    
                    {/* Main encounter circle */}
                    <circle
                      cx={encounter.x}
                      cy={encounter.y}
                      r={progressionLevelRadius}
                      fill={spiralDomain.color}
                      opacity={isHovered ? 1 : 0.8}
                      stroke={isHovered ? spiralDomain.color : 'white'}
                      strokeWidth={isHovered ? 3 : 2}
                      filter={isHovered ? "url(#glow)" : "none"}
                      onMouseEnter={(e) => handleEncounterMouseEnter(e, encounter, spiralDomain.domain)}
                      onMouseLeave={handleEncounterMouseLeave}
                      onClick={() => handleEncounterClick(spiralDomain.domain)}
                      className="encounter-circle"
                    />

                    {/* Encounter number */}
                    <text
                      x={encounter.x}
                      y={encounter.y + 4}
                      textAnchor="middle"
                      fontSize="12"
                      fill="white"
                      fontWeight="bold"
                      pointerEvents="none"
                    >
                      {encounter.encounterNumber}
                    </text>

                    {/* Progress indicator ring */}
                    <circle
                      cx={encounter.x}
                      cy={encounter.y}
                      r={progressionLevelRadius + 6}
                      fill="none"
                      stroke={spiralDomain.color}
                      strokeWidth="2"
                      strokeDasharray={`${2 * Math.PI * (progressionLevelRadius + 6) * 0.8} ${2 * Math.PI * (progressionLevelRadius + 6) * 0.2}`}
                      opacity={0.4}
                      className="progress-ring"
                    />

                    {/* Connection lines to next encounter */}
                    {encounterIndex < spiralDomain.encounters.length - 1 && (
                      <line
                        x1={encounter.x}
                        y1={encounter.y}
                        x2={spiralDomain.encounters[encounterIndex + 1].x}
                        y2={spiralDomain.encounters[encounterIndex + 1].y}
                        stroke={spiralDomain.color}
                        strokeWidth="1"
                        opacity={0.3}
                        strokeDasharray="2,2"
                      />
                    )}
                  </g>
                );
              })}
            </g>
          ))}

          {/* Center point with student avatar */}
          <g className="spiral-center">
            <circle
              cx={centerX}
              cy={centerY}
              r="20"
              fill="var(--primary-600)"
              opacity={animationProgress}
            />
            <text
              x={centerX}
              y={centerY + 5}
              textAnchor="middle"
              fontSize="16"
              fill="white"
              fontWeight="bold"
            >
              YOU
            </text>
          </g>

          {/* Domain labels */}
          {spiralData.map((spiralDomain, index) => {
            const labelAngle = (index * 2 * Math.PI) / spiralData.length;
            const labelRadius = maxRadius + 40;
            const labelX = centerX + labelRadius * Math.cos(labelAngle);
            const labelY = centerY + labelRadius * Math.sin(labelAngle);
            
            return (
              <g key={`label-${spiralDomain.domain}`} className="domain-label">
                <circle
                  cx={labelX}
                  cy={labelY}
                  r="15"
                  fill={spiralDomain.color}
                  opacity={animationProgress * 0.9}
                />
                <text
                  x={labelX}
                  y={labelY - 25}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill={spiralDomain.color}
                  opacity={animationProgress}
                >
                  {spiralDomain.domain.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div 
            className="spiral-tooltip"
            style={{
              position: 'absolute',
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="tooltip-content">
              <h4>{tooltip.content.domain} - Encounter {tooltip.content.encounter.encounterNumber}</h4>
              <div className="encounter-details">
                <div className="depth-indicator">
                  <span className="label">Depth:</span>
                  <span className={`level ${tooltip.content.progress.depth}`}>
                    {tooltip.content.progress.depth}
                  </span>
                </div>
                <div className="concepts">
                  <span className="label">Concepts:</span>
                  <span className="value">{tooltip.content.progress.concepts.slice(0, 2).join(', ')}</span>
                </div>
                <div className="application">
                  <span className="label">Applied in:</span>
                  <span className="value">{tooltip.content.progress.application}</span>
                </div>
                {tooltip.content.progress.connections.length > 0 && (
                  <div className="connections">
                    <span className="label">New Connections:</span>
                    <span className="value">{tooltip.content.progress.connections[0]}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="spiral-legend">
        <h4>Understanding Your Spiral</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-icon size-small"></div>
            <span>Explorer Level</span>
          </div>
          <div className="legend-item">
            <div className="legend-icon size-medium"></div>
            <span>Investigator Level</span>
          </div>
          <div className="legend-item">
            <div className="legend-icon size-large"></div>
            <span>Creator+ Level</span>
          </div>
          <div className="legend-item">
            <div className="legend-icon spiral-path"></div>
            <span>Learning Path</span>
          </div>
        </div>
        <p className="spiral-insight">
          Each encounter with a domain deepens your understanding. The spiral shows how you revisit 
          concepts with greater sophistication, building expertise through authentic application.
        </p>
      </div>
    </div>
  );
};

// Helper functions
const getDomainColor = (domain: string): string => {
  const colors = {
    'mathematics': '#E57373',
    'science': '#81C784',
    'language_arts': '#64B5F6',
    'social_studies': '#FFB74D',
    'arts': '#BA68C8',
    'technology': '#4DB6AC',
    'health': '#F06292',
    'physical_education': '#A1C181'
  };
  
  return colors[domain as keyof typeof colors] || '#9E9E9E';
};

const getProgressionLevelRadius = (level: ALFProgressionLevel): number => {
  switch (level) {
    case ALFProgressionLevel.Explorer: return 8;
    case ALFProgressionLevel.Investigator: return 12;
    case ALFProgressionLevel.Creator: return 16;
    case ALFProgressionLevel.Innovator: return 20;
    case ALFProgressionLevel.ChangeAgent: return 24;
    default: return 8;
  }
};

export default LearningProgressionSpiral;