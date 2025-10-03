import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlfLogo } from './AlfLogo';

const STEAMVennDiagram = () => {
  const [hoveredPetal, setHoveredPetal] = useState(null);

  // Radial Bloom configuration - 5 petals radiating from center
  const petals = [
    {
      id: 'science',
      label: 'Science',
      angle: -90, // Top
      color: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgb(59, 130, 246)',
      delay: 0
    },
    {
      id: 'technology',
      label: 'Technology',
      angle: -18, // Upper right
      color: 'rgba(139, 92, 246, 0.2)',
      borderColor: 'rgb(139, 92, 246)',
      delay: 0.2
    },
    {
      id: 'engineering',
      label: 'Engineering',
      angle: 54, // Lower right
      color: 'rgba(34, 197, 94, 0.2)',
      borderColor: 'rgb(34, 197, 94)',
      delay: 0.4
    },
    {
      id: 'arts',
      label: 'Arts',
      angle: 126, // Lower left
      color: 'rgba(251, 146, 60, 0.2)',
      borderColor: 'rgb(251, 146, 60)',
      delay: 0.6
    },
    {
      id: 'math',
      label: 'Mathematics',
      angle: 198, // Upper left
      color: 'rgba(251, 191, 36, 0.2)',
      borderColor: 'rgb(251, 191, 36)',
      delay: 0.8
    }
  ];

  // Helper to calculate label position (outside the petals)
  const getLabelPosition = (angle, radius = 135) => {
    const angleRad = (angle * Math.PI) / 180;
    return {
      x: 150 + Math.cos(angleRad) * radius,
      y: 150 + Math.sin(angleRad) * radius
    };
  };

  // Helper to calculate connector end point (edge of center circle)
  const getConnectorStart = (angle, radius = 30) => {
    const angleRad = (angle * Math.PI) / 180;
    return {
      x: 150 + Math.cos(angleRad) * radius,
      y: 150 + Math.sin(angleRad) * radius
    };
  };

  return (
    <div className="relative w-80 h-80 md:w-96 md:h-96 mx-auto">
      <svg viewBox="0 0 300 300" className="w-full h-full" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="centerGlow">
            <stop offset="0%" stopColor="rgba(99, 102, 241, 0.4)" />
            <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
          </radialGradient>
        </defs>

        {/* Render petals as rounded capsules */}
        {petals.map((petal) => {
          const angleRad = (petal.angle * Math.PI) / 180;
          const centerX = 150;
          const centerY = 150;

          // Petal dimensions
          const innerRadius = 38; // Start just outside center circle
          const outerRadius = 90; // End point
          const width = 50; // Width of petal

          // Calculate petal path as rounded capsule
          const innerX = centerX + Math.cos(angleRad) * innerRadius;
          const innerY = centerY + Math.sin(angleRad) * innerRadius;
          const outerX = centerX + Math.cos(angleRad) * outerRadius;
          const outerY = centerY + Math.sin(angleRad) * outerRadius;

          // Perpendicular angle for width
          const perpAngleRad = angleRad + Math.PI / 2;
          const halfWidth = width / 2;

          // Four corners of the capsule
          const innerLeft = {
            x: innerX + Math.cos(perpAngleRad) * halfWidth,
            y: innerY + Math.sin(perpAngleRad) * halfWidth
          };
          const innerRight = {
            x: innerX - Math.cos(perpAngleRad) * halfWidth,
            y: innerY - Math.sin(perpAngleRad) * halfWidth
          };
          const outerLeft = {
            x: outerX + Math.cos(perpAngleRad) * halfWidth,
            y: outerY + Math.sin(perpAngleRad) * halfWidth
          };
          const outerRight = {
            x: outerX - Math.cos(perpAngleRad) * halfWidth,
            y: outerY - Math.sin(perpAngleRad) * halfWidth
          };

          // Create rounded capsule path
          const pathD = `
            M ${innerLeft.x} ${innerLeft.y}
            L ${outerLeft.x} ${outerLeft.y}
            A ${halfWidth} ${halfWidth} 0 0 1 ${outerRight.x} ${outerRight.y}
            L ${innerRight.x} ${innerRight.y}
            A ${halfWidth} ${halfWidth} 0 0 1 ${innerLeft.x} ${innerLeft.y}
            Z
          `;

          return (
            <g key={petal.id}>
              <motion.path
                d={pathD}
                fill={petal.color}
                stroke={petal.borderColor}
                strokeWidth="2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: hoveredPetal === petal.id ? 1.05 : 1,
                  opacity: 1
                }}
                transition={{
                  scale: { duration: 0.3 },
                  default: { duration: 0.8, delay: petal.delay }
                }}
                onMouseEnter={() => setHoveredPetal(petal.id)}
                onMouseLeave={() => setHoveredPetal(null)}
                style={{
                  cursor: 'pointer',
                  transformOrigin: '150px 150px'
                }}
              />
            </g>
          );
        })}

        {/* Dotted connector lines and labels */}
        {petals.map((petal) => {
          const labelPos = getLabelPosition(petal.angle);
          const connectorStart = getConnectorStart(petal.angle);
          const connectorEnd = getLabelPosition(petal.angle, 105); // End before label

          return (
            <g key={`${petal.id}-label`}>
              {/* Dotted connector line */}
              <motion.line
                x1={connectorStart.x}
                y1={connectorStart.y}
                x2={connectorEnd.x}
                y2={connectorEnd.y}
                stroke={petal.borderColor}
                strokeWidth="1.5"
                strokeDasharray="3,3"
                opacity="0.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.5 }}
                transition={{ duration: 0.8, delay: petal.delay + 0.4 }}
              />

              {/* Label text */}
              <motion.text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={petal.borderColor}
                className="text-sm font-semibold pointer-events-none select-none"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: hoveredPetal === petal.id ? 1 : 0.85,
                  scale: hoveredPetal === petal.id ? 1.1 : 1
                }}
                transition={{ duration: 0.3, delay: petal.delay + 0.5 }}
              >
                {petal.label}
              </motion.text>
            </g>
          );
        })}

        {/* Center circle background with glow */}
        <motion.g>
          <motion.circle
            cx="150"
            cy="150"
            r="35"
            fill="url(#centerGlow)"
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.circle
            cx="150"
            cy="150"
            r="30"
            fill="white"
            stroke="rgb(99, 102, 241)"
            strokeWidth="3"
            className="dark:fill-slate-900"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 1, type: 'spring', stiffness: 200 }}
          />
        </motion.g>
      </svg>

      {/* ALF Logo positioned in center (outside SVG for proper rendering) */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2, type: 'spring', stiffness: 200 }}
      >
        <AlfLogo size="md" showText={false} />
      </motion.div>
    </div>
  );
};

export default STEAMVennDiagram;
