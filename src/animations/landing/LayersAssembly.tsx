import React from 'react';
import { Target, Map, Box } from 'lucide-react';
import { useReducedMotion } from './useReducedMotion';
import { useInViewOnce } from './useInViewOnce';
import { useAnimationController } from './useAnimationController';

const LOOP_DURATION = 3200;

export function LayersAssembly() {
  const prefersReducedMotion = useReducedMotion();
  const { ref, inView } = useInViewOnce<HTMLDivElement>({ threshold: 0.3 });
  const { isActive, replay } = useAnimationController({
    enabled: inView && !prefersReducedMotion,
    duration: LOOP_DURATION,
  });

  return (
    <div
      ref={ref}
      className={`layers-assembly ${isActive ? 'is-active' : ''}`}
      data-reduced-motion={prefersReducedMotion}
      onMouseEnter={() => replay()}
    >
      <svg viewBox="0 0 180 180" aria-hidden="true">
        <path className="sheet" d="M38 70 L90 48 L142 70 L90 92 Z" fill="#EBF3FF" stroke="#2563EB" strokeWidth="5" strokeLinejoin="round" />
        <path className="sheet" d="M38 88 L90 66 L142 88 L90 110 Z" fill="#F3F7FF" stroke="#2563EB" strokeWidth="5" strokeLinejoin="round" />
        <path className="sheet" d="M38 106 L90 84 L142 106 L90 128 Z" fill="#FFFFFF" stroke="#2563EB" strokeWidth="5" strokeLinejoin="round" />
      </svg>

      <div className="layer-icon">
        <Target className="w-4 h-4" />
      </div>
      <div className="layer-icon">
        <Map className="w-4 h-4" />
      </div>
      <div className="layer-icon">
        <Box className="w-4 h-4" />
      </div>
    </div>
  );
}

