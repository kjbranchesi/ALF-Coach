import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Lightbulb, Users, Rocket, Brain, Palette } from 'lucide-react';

const TransformationAnimation = () => {
  const [currentPhase, setCurrentPhase] = useState(0);

  // Cycle through transformation phases
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhase((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Educational icons to represent learning elements
  const icons = [BookOpen, Lightbulb, Users, Rocket, Brain, Palette];

  // Create elements representing students/learning activities
  const elements = [];
  for (let i = 0; i < 18; i++) {
    elements.push({
      id: i,
      Icon: icons[i % icons.length],
      row: Math.floor(i / 6),
      col: i % 6
    });
  }

  const getPosition = (element, phase) => {
    const centerX = 192;
    const centerY = 192;
    const spacing = 55;

    if (phase === 0) {
      // Traditional: Rigid rows like a classroom
      const rowY = (element.row - 1) * spacing + centerY;
      const colX = (element.col - 2.5) * 40 + centerX;
      return {
        x: colX,
        y: rowY,
        scale: 0.8,
        opacity: 0.5,
        rotation: 0
      };
    } else if (phase === 1) {
      // Transforming: Breaking free from rows
      const baseX = (element.col - 2.5) * 45 + centerX;
      const baseY = (element.row - 1) * spacing + centerY;
      const wave = Math.sin(element.col * 0.5 + element.row) * 20;
      return {
        x: baseX + wave,
        y: baseY + Math.cos(element.id * 0.3) * 15,
        scale: 1,
        opacity: 0.7,
        rotation: Math.sin(element.id) * 15
      };
    } else {
      // Project-Based: Collaborative circles
      const groupId = Math.floor(element.id / 6);
      const angleInGroup = (element.id % 6) * 60;
      const groupAngle = groupId * 120;
      const groupRadius = 100;
      const elementRadius = 35;

      // Position groups in triangle formation
      const groupX = centerX + Math.cos(groupAngle * Math.PI / 180) * groupRadius;
      const groupY = centerY + Math.sin(groupAngle * Math.PI / 180) * groupRadius;

      // Position elements in circles around group centers
      const elementX = groupX + Math.cos(angleInGroup * Math.PI / 180) * elementRadius;
      const elementY = groupY + Math.sin(angleInGroup * Math.PI / 180) * elementRadius;

      return {
        x: elementX,
        y: elementY,
        scale: 1.2,
        opacity: 0.9,
        rotation: 0
      };
    }
  };

  const getColor = (element, phase) => {
    if (phase === 0) return 'rgb(148, 163, 184)'; // slate - traditional
    if (phase === 1) return 'rgb(99, 102, 241)'; // primary - transforming

    // Project-Based: Different colors for different project groups
    const groupId = Math.floor(element.id / 6);
    const colors = [
      'rgb(251, 146, 60)', // coral
      'rgb(59, 130, 246)', // blue
      'rgb(34, 197, 94)'   // emerald
    ];
    return colors[groupId];
  };

  // Connection lines showing collaboration in project-based phase
  const getConnections = () => {
    if (currentPhase !== 2) return [];

    const connections = [];
    // Connect elements within same project group
    for (let groupId = 0; groupId < 3; groupId++) {
      const groupElements = elements.filter((_, i) => Math.floor(i / 6) === groupId);
      for (let i = 0; i < groupElements.length - 1; i++) {
        const from = groupElements[i];
        const to = groupElements[i + 1];
        const fromPos = getPosition(from, 2);
        const toPos = getPosition(to, 2);

        connections.push({
          id: `conn-${groupId}-${i}`,
          x1: fromPos.x,
          y1: fromPos.y,
          x2: toPos.x,
          y2: toPos.y,
          color: getColor(from, 2)
        });
      }
    }
    return connections;
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 384 384"
        className="w-full h-full"
        style={{ overflow: 'visible' }}
      >
        {/* Background subtle gradient */}
        <defs>
          <radialGradient id="bgGradient">
            <stop offset="0%" stopColor={currentPhase === 0 ? 'rgba(148, 163, 184, 0.05)' : currentPhase === 1 ? 'rgba(99, 102, 241, 0.05)' : 'rgba(251, 146, 60, 0.05)'} />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </radialGradient>
        </defs>

        <motion.circle
          cx="192"
          cy="192"
          r="180"
          fill="url(#bgGradient)"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Connection lines for project-based phase */}
        {currentPhase === 2 && (
          <g>
            {getConnections().map((conn) => (
              <motion.line
                key={conn.id}
                x1={conn.x1}
                y1={conn.y1}
                x2={conn.x2}
                y2={conn.y2}
                stroke={conn.color}
                strokeOpacity="0.2"
                strokeWidth="2"
                strokeDasharray="4 4"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.3 }}
                transition={{ duration: 1.5 }}
              />
            ))}
          </g>
        )}

        {/* Icons representing learning elements */}
        {elements.map((element) => {
          const position = getPosition(element, currentPhase);
          const color = getColor(element, currentPhase);
          const Icon = element.Icon;

          return (
            <motion.g key={element.id}>
              {/* Glow effect */}
              <motion.circle
                cx={position.x}
                cy={position.y}
                r="20"
                fill={color}
                opacity="0.1"
                animate={{
                  scale: currentPhase === 2 ? [1, 1.3, 1] : 1,
                  opacity: currentPhase === 2 ? [0.1, 0.2, 0.1] : 0.05
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: element.id * 0.1,
                  ease: "easeInOut"
                }}
              />

              {/* Background circle for icon */}
              <motion.circle
                cx={position.x}
                cy={position.y}
                r="16"
                fill="white"
                stroke={color}
                strokeWidth="2"
                animate={{
                  x: position.x - 192,
                  y: position.y - 192,
                  scale: position.scale,
                  opacity: position.opacity
                }}
                transition={{
                  duration: 1.5,
                  ease: "easeInOut"
                }}
                className="dark:fill-slate-800"
              />

              {/* Icon */}
              <motion.g
                animate={{
                  x: position.x - 192,
                  y: position.y - 192,
                  scale: position.scale,
                  opacity: position.opacity,
                  rotate: position.rotation
                }}
                transition={{
                  duration: 1.5,
                  ease: "easeInOut"
                }}
                style={{ transformOrigin: `${position.x}px ${position.y}px` }}
              >
                <Icon
                  x={position.x - 10}
                  y={position.y - 10}
                  width={20}
                  height={20}
                  color={color}
                  strokeWidth={2}
                />
              </motion.g>
            </motion.g>
          );
        })}

        {/* Central focus point */}
        <motion.circle
          cx="192"
          cy="192"
          r="3"
          fill={currentPhase === 0 ? 'rgb(148, 163, 184)' : currentPhase === 1 ? 'rgb(99, 102, 241)' : 'rgb(251, 146, 60)'}
          animate={{
            scale: [1, 2, 1],
            opacity: [0.8, 0.4, 0.8]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Phase indicator rings */}
        <motion.circle
          cx="192"
          cy="192"
          r={currentPhase === 0 ? 100 : currentPhase === 1 ? 120 : 140}
          fill="none"
          stroke={currentPhase === 0 ? 'rgba(148, 163, 184, 0.2)' : currentPhase === 1 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(251, 146, 60, 0.2)'}
          strokeWidth="1"
          strokeDasharray="4 8"
          animate={{
            rotate: currentPhase === 2 ? 360 : 0
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ transformOrigin: "192px 192px" }}
        />
      </svg>

      {/* Phase indicators with labels */}
      <div className="absolute bottom-0 w-full flex justify-center gap-4 px-4">
        {[
          { phase: 0, label: 'Traditional', color: 'rgb(148, 163, 184)' },
          { phase: 1, label: 'Transforming', color: 'rgb(99, 102, 241)' },
          { phase: 2, label: 'Collaborative', color: 'rgb(251, 146, 60)' }
        ].map(({ phase, label, color }) => (
          <div key={phase} className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
              animate={{
                scale: currentPhase === phase ? 1.5 : 1,
                opacity: currentPhase === phase ? 1 : 0.3
              }}
              transition={{ duration: 0.3 }}
            />
            <span
              className="text-xs font-medium transition-opacity duration-300"
              style={{
                color: currentPhase === phase ? color : 'rgb(148, 163, 184)',
                opacity: currentPhase === phase ? 1 : 0.5
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransformationAnimation;