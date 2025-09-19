import React from 'react';

const KnowledgeRipples = ({ className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full"
        style={{ transform: 'translateZ(0)' }}
      >
        <defs>
          {/* Gradient for the center orb */}
          <radialGradient id="centerGradient">
            <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="rgb(147, 51, 234)" stopOpacity="0.7" />
          </radialGradient>

          {/* Gradient for ripples */}
          <radialGradient id="rippleGradient">
            <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
            <stop offset="50%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ripple circles - each with different timing */}
        {[0, 1, 2, 3].map((index) => (
          <circle
            key={`ripple-${index}`}
            cx="200"
            cy="200"
            r="30"
            fill="none"
            stroke="url(#rippleGradient)"
            strokeWidth="2"
            opacity="0"
          >
            <animate
              attributeName="r"
              values="30;180"
              dur="4s"
              begin={`${index * 1}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              dur="4s"
              begin={`${index * 1}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-width"
              values="3;1;0.5;0"
              dur="4s"
              begin={`${index * 1}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* Secondary wave with different color */}
        {[0, 1, 2].map((index) => (
          <circle
            key={`secondary-ripple-${index}`}
            cx="200"
            cy="200"
            r="30"
            fill="none"
            stroke="rgb(147, 51, 234)"
            strokeWidth="1.5"
            opacity="0"
          >
            <animate
              attributeName="r"
              values="30;160"
              dur="5s"
              begin={`${index * 1.667 + 0.5}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;0.6;0.3;0"
              dur="5s"
              begin={`${index * 1.667 + 0.5}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-width"
              values="2;0.8;0.3;0"
              dur="5s"
              begin={`${index * 1.667 + 0.5}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* Center orb - the source */}
        <g>
          {/* Glow effect */}
          <circle
            cx="200"
            cy="200"
            r="25"
            fill="url(#centerGradient)"
            opacity="0.3"
            filter="blur(10px)"
          >
            <animate
              attributeName="r"
              values="25;30;25"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Main center circle */}
          <circle
            cx="200"
            cy="200"
            r="20"
            fill="url(#centerGradient)"
          >
            <animate
              attributeName="r"
              values="20;22;20"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Inner bright spot */}
          <circle
            cx="195"
            cy="195"
            r="8"
            fill="white"
            opacity="0.7"
          />
        </g>

        {/* Optional: Small particles emanating */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => {
          const radian = (angle * Math.PI) / 180;
          const startX = 200 + Math.cos(radian) * 30;
          const startY = 200 + Math.sin(radian) * 30;
          const endX = 200 + Math.cos(radian) * 170;
          const endY = 200 + Math.sin(radian) * 170;

          return (
            <circle
              key={`particle-${angle}`}
              cx={startX}
              cy={startY}
              r="2"
              fill="rgb(59, 130, 246)"
              opacity="0"
            >
              <animate
                attributeName="cx"
                values={`${startX};${endX}`}
                dur="3s"
                begin={`${index * 0.375}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values={`${startY};${endY}`}
                dur="3s"
                begin={`${index * 0.375}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;0.8;0.4;0"
                dur="3s"
                begin={`${index * 0.375}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="r"
                values="2;1;0.5"
                dur="3s"
                begin={`${index * 0.375}s`}
                repeatCount="indefinite"
              />
            </circle>
          );
        })}
      </svg>

      {/* Subtle text label */}
      <div className="absolute bottom-0 left-0 right-0 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400 font-light">
          Knowledge Rippling Outward
        </p>
      </div>
    </div>
  );
};

export default KnowledgeRipples;