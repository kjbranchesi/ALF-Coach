/**
 * PhaseTimeline.tsx
 * 
 * Visual timeline component for the Creative Process Journey
 * Shows the 4 phases with proportional time allocation and iteration paths
 * 
 * FEATURES:
 * - Circular flow diagram showing non-linear nature
 * - Draggable phase boundaries for time adjustment
 * - Color-coded phases with progress indicators
 * - Iteration path visualization
 * - Responsive design for mobile
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { 
  Search, 
  Lightbulb, 
  Hammer, 
  CheckCircle,
  RotateCcw,
  Clock,
  AlertCircle,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { PhaseType, CreativePhase, IterationEvent } from '../types';

interface PhaseTimelineProps {
  phases: CreativePhase[];
  currentPhase: number;
  projectDuration: number;
  iterationHistory: IterationEvent[];
  onPhaseClick: (index: number) => void;
  onTimeAllocationChange?: (allocations: number[]) => void;
  allowAdjustment?: boolean;
  className?: string;
}

interface PhaseNode {
  phase: CreativePhase;
  index: number;
  x: number;
  y: number;
  angle: number;
  isActive: boolean;
  isComplete: boolean;
  hasIterations: boolean;
}

const PHASE_COLORS = {
  ANALYZE: { bg: '#EBF8FF', border: '#3182CE', text: '#2C5282' },
  BRAINSTORM: { bg: '#FEF5E7', border: '#F59E0B', text: '#92400E' },
  PROTOTYPE: { bg: '#F3E8FF', border: '#8B5CF6', text: '#5B21B6' },
  EVALUATE: { bg: '#D1FAE5', border: '#10B981', text: '#065F46' }
};

export const PhaseTimeline: React.FC<PhaseTimelineProps> = ({
  phases,
  currentPhase,
  projectDuration,
  iterationHistory,
  onPhaseClick,
  onTimeAllocationChange,
  allowAdjustment = false,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [hoveredPhase, setHoveredPhase] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [timeAllocations, setTimeAllocations] = useState(
    phases.map(p => p.allocation)
  );

  // Calculate SVG dimensions based on container
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width || 800,
          height: rect.height || 400
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Calculate phase positions in circular layout
  const calculatePhasePositions = (): PhaseNode[] => {
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const radius = Math.min(dimensions.width, dimensions.height) * 0.35;
    
    let cumulativeAngle = -90; // Start at top
    
    return phases.map((phase, index) => {
      const angleSpan = phase.allocation * 360;
      const angle = cumulativeAngle + angleSpan / 2;
      cumulativeAngle += angleSpan;
      
      const x = centerX + radius * Math.cos(angle * Math.PI / 180);
      const y = centerY + radius * Math.sin(angle * Math.PI / 180);
      
      const isComplete = phase.objectives.length >= 2 && 
                        phase.activities.length >= 2 && 
                        phase.deliverables.length >= 1;
      
      const hasIterations = iterationHistory.some(event => 
        event.fromPhase === phase.type || event.toPhase === phase.type
      );
      
      return {
        phase,
        index,
        x,
        y,
        angle,
        isActive: index === currentPhase,
        isComplete,
        hasIterations
      };
    });
  };

  const phaseNodes = calculatePhasePositions();

  // Draw iteration paths between phases
  const drawIterationPaths = () => {
    const paths: JSX.Element[] = [];
    const processedPairs = new Set<string>();
    
    iterationHistory.forEach((event, i) => {
      const fromIndex = phases.findIndex(p => p.type === event.fromPhase);
      const toIndex = phases.findIndex(p => p.type === event.toPhase);
      
      if (fromIndex !== -1 && toIndex !== -1) {
        const pairKey = `${Math.min(fromIndex, toIndex)}-${Math.max(fromIndex, toIndex)}`;
        
        // Only draw one path per pair of phases
        if (!processedPairs.has(pairKey)) {
          processedPairs.add(pairKey);
          
          const fromNode = phaseNodes[fromIndex];
          const toNode = phaseNodes[toIndex];
          
          // Calculate control points for curved path
          const midX = (fromNode.x + toNode.x) / 2;
          const midY = (fromNode.y + toNode.y) / 2;
          const centerX = dimensions.width / 2;
          const centerY = dimensions.height / 2;
          
          // Pull control point toward center for inner curve
          const controlX = midX + (centerX - midX) * 0.3;
          const controlY = midY + (centerY - midY) * 0.3;
          
          paths.push(
            <motion.path
              key={`iteration-${i}`}
              d={`M ${fromNode.x} ${fromNode.y} Q ${controlX} ${controlY} ${toNode.x} ${toNode.y}`}
              stroke="#3B82F6"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{ duration: 1, delay: i * 0.1 }}
              className="pointer-events-none"
            />
          );
        }
      }
    });
    
    return paths;
  };

  // Draw main circular progress path
  const drawProgressPath = () => {
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const radius = Math.min(dimensions.width, dimensions.height) * 0.35;
    
    // Calculate progress based on completed phases
    const completedPhases = phases.filter((phase, i) => 
      i <= currentPhase && phase.objectives.length >= 2 && 
      phase.activities.length >= 2 && phase.deliverables.length >= 1
    ).length;
    
    const progress = completedPhases / phases.length;
    const endAngle = -90 + (progress * 360);
    
    const startX = centerX + radius * Math.cos(-90 * Math.PI / 180);
    const startY = centerY + radius * Math.sin(-90 * Math.PI / 180);
    const endX = centerX + radius * Math.cos(endAngle * Math.PI / 180);
    const endY = centerY + radius * Math.sin(endAngle * Math.PI / 180);
    
    const largeArcFlag = progress > 0.5 ? 1 : 0;
    
    if (progress === 0) return null;
    
    return (
      <motion.path
        d={`M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`}
        stroke="#10B981"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
    );
  };

  // Handle time allocation adjustment
  const handleBoundaryDrag = (index: number, delta: number) => {
    if (!allowAdjustment || index >= phases.length - 1) return;
    
    const newAllocations = [...timeAllocations];
    const minAllocation = 0.1; // Minimum 10% per phase
    const maxAllocation = 0.5; // Maximum 50% per phase
    
    // Adjust current and next phase
    const adjustment = delta / dimensions.width * 0.2; // Scale adjustment
    newAllocations[index] = Math.max(minAllocation, 
      Math.min(maxAllocation, newAllocations[index] + adjustment));
    newAllocations[index + 1] = Math.max(minAllocation,
      Math.min(maxAllocation, newAllocations[index + 1] - adjustment));
    
    // Normalize to ensure sum is 1
    const sum = newAllocations.reduce((a, b) => a + b, 0);
    const normalized = newAllocations.map(a => a / sum);
    
    setTimeAllocations(normalized);
    if (onTimeAllocationChange) {
      onTimeAllocationChange(normalized);
    }
  };

  return (
    <div className={`phase-timeline ${className}`}>
      <div className="relative w-full h-full">
        <svg
          ref={svgRef}
          className="w-full h-full"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        >
          {/* Background circle */}
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.height / 2}
            r={Math.min(dimensions.width, dimensions.height) * 0.35}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="2"
            strokeDasharray="10,5"
          />
          
          {/* Progress path */}
          {drawProgressPath()}
          
          {/* Iteration paths */}
          {drawIterationPaths()}
          
          {/* Phase segments */}
          {phaseNodes.map((node, index) => {
            const nextNode = phaseNodes[(index + 1) % phaseNodes.length];
            const centerX = dimensions.width / 2;
            const centerY = dimensions.height / 2;
            const radius = Math.min(dimensions.width, dimensions.height) * 0.35;
            
            const startAngle = node.angle - (node.phase.allocation * 180);
            const endAngle = node.angle + (node.phase.allocation * 180);
            
            const startX = centerX + radius * Math.cos(startAngle * Math.PI / 180);
            const startY = centerY + radius * Math.sin(startAngle * Math.PI / 180);
            const endX = centerX + radius * Math.cos(endAngle * Math.PI / 180);
            const endY = centerY + radius * Math.sin(endAngle * Math.PI / 180);
            
            const largeArcFlag = node.phase.allocation > 0.5 ? 1 : 0;
            
            return (
              <g key={node.phase.type}>
                {/* Phase arc segment */}
                <path
                  d={`M ${centerX} ${centerY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                  fill={PHASE_COLORS[node.phase.type].bg}
                  stroke={PHASE_COLORS[node.phase.type].border}
                  strokeWidth={node.isActive ? "3" : "1"}
                  opacity={hoveredPhase === index ? 1 : 0.8}
                  className="cursor-pointer transition-opacity"
                  onMouseEnter={() => setHoveredPhase(index)}
                  onMouseLeave={() => setHoveredPhase(null)}
                  onClick={() => onPhaseClick(index)}
                />
                
                {/* Phase boundary handle (for adjustment) */}
                {allowAdjustment && index < phases.length - 1 && (
                  <motion.circle
                    cx={endX}
                    cy={endY}
                    r="8"
                    fill="#6B7280"
                    className="cursor-ew-resize"
                    whileDrag={{ scale: 1.2 }}
                    drag="x"
                    dragConstraints={{ left: -50, right: 50 }}
                    dragElastic={0.2}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={(e, info) => {
                      setIsDragging(false);
                      handleBoundaryDrag(index, info.offset.x);
                    }}
                  />
                )}
              </g>
            );
          })}
          
          {/* Phase nodes */}
          {phaseNodes.map((node) => (
            <g key={`node-${node.phase.type}`}>
              {/* Node circle */}
              <motion.circle
                cx={node.x}
                cy={node.y}
                r="40"
                fill="white"
                stroke={PHASE_COLORS[node.phase.type].border}
                strokeWidth={node.isActive ? "3" : "2"}
                className="cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPhaseClick(node.index)}
              />
              
              {/* Phase icon */}
              <foreignObject
                x={node.x - 20}
                y={node.y - 20}
                width="40"
                height="40"
                className="pointer-events-none"
              >
                <div className="flex items-center justify-center w-full h-full">
                  <node.phase.icon 
                    className="w-6 h-6" 
                    style={{ color: PHASE_COLORS[node.phase.type].text }}
                  />
                </div>
              </foreignObject>
              
              {/* Phase name */}
              <text
                x={node.x}
                y={node.y + 55}
                textAnchor="middle"
                className="text-sm font-medium pointer-events-none"
                fill={PHASE_COLORS[node.phase.type].text}
              >
                {node.phase.name}
              </text>
              
              {/* Duration */}
              <text
                x={node.x}
                y={node.y + 70}
                textAnchor="middle"
                className="text-xs pointer-events-none"
                fill="#6B7280"
              >
                {node.phase.duration}
              </text>
              
              {/* Status indicators */}
              {node.isComplete && (
                <circle
                  cx={node.x + 25}
                  cy={node.y - 25}
                  r="8"
                  fill="#10B981"
                />
              )}
              {node.hasIterations && (
                <circle
                  cx={node.x - 25}
                  cy={node.y - 25}
                  r="8"
                  fill="#3B82F6"
                />
              )}
              {node.isActive && !node.isComplete && (
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r="45"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
              )}
            </g>
          ))}
          
          {/* Center info */}
          <g>
            <text
              x={dimensions.width / 2}
              y={dimensions.height / 2 - 10}
              textAnchor="middle"
              className="text-lg font-semibold"
              fill="#1F2937"
            >
              {projectDuration} Weeks
            </text>
            <text
              x={dimensions.width / 2}
              y={dimensions.height / 2 + 10}
              textAnchor="middle"
              className="text-sm"
              fill="#6B7280"
            >
              Creative Process
            </text>
            {iterationHistory.length > 0 && (
              <text
                x={dimensions.width / 2}
                y={dimensions.height / 2 + 30}
                textAnchor="middle"
                className="text-xs"
                fill="#3B82F6"
              >
                {iterationHistory.length} iterations
              </text>
            )}
          </g>
        </svg>
        
        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Complete</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-primary-500" />
              <span>Has Iterations</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full border-2 border-primary-500" />
              <span>Current</span>
            </div>
          </div>
        </div>
        
        {/* Hover tooltip */}
        <AnimatePresence>
          {hoveredPhase !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs"
            >
              <h4 className="font-semibold text-gray-900 mb-2">
                {phases[hoveredPhase].name} Phase
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                {phases[hoveredPhase].description}
              </p>
              <div className="space-y-1 text-xs text-gray-500">
                <div>Duration: {phases[hoveredPhase].duration}</div>
                <div>Allocation: {Math.round(phases[hoveredPhase].allocation * 100)}%</div>
                <div>Objectives: {phases[hoveredPhase].objectives.length}</div>
                <div>Activities: {phases[hoveredPhase].activities.length}</div>
                {iterationHistory.filter(e => 
                  e.toPhase === phases[hoveredPhase].type
                ).length > 0 && (
                  <div className="text-primary-600">
                    Returned to this phase {iterationHistory.filter(e => 
                      e.toPhase === phases[hoveredPhase].type
                    ).length} time(s)
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Adjustment instructions */}
        {allowAdjustment && isDragging && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm">
            Drag phase boundaries to adjust time allocation
          </div>
        )}
      </div>
    </div>
  );
};