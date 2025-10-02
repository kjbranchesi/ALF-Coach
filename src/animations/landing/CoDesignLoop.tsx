import React, { useMemo } from 'react';
import { Check, Map, Box, CheckSquare } from 'lucide-react';
import { useReducedMotion } from './useReducedMotion';
import { useInViewOnce } from './useInViewOnce';
import { useAnimationController } from './useAnimationController';

const LOOP_DURATION = 4200; // ms

export function CoDesignLoop() {
  const prefersReducedMotion = useReducedMotion();
  const { ref, inView } = useInViewOnce<HTMLDivElement>({ threshold: 0.4 });
  const { isActive, replay } = useAnimationController({
    enabled: inView && !prefersReducedMotion,
    duration: LOOP_DURATION,
  });

  const phaseContent = useMemo(
    () => [
      { title: 'Phase 1 · Investigate', summary: 'Research local data & interview partners.' },
      { title: 'Phase 2 · Co-design', summary: 'Brainstorm possibilities with your learners.' },
      { title: 'Phase 3 · Prototype', summary: 'Build first versions & gather feedback.' },
      { title: 'Phase 4 · Launch', summary: 'Share with the community and reflect.' },
    ],
    []
  );

  return (
    <div
      ref={ref}
      className={`co-design-loop ${isActive ? 'is-active' : ''}`}
      data-reduced-motion={prefersReducedMotion}
      onMouseEnter={() => replay()}
    >
      <div className="chip-row">
        <div className="chip">Big Idea</div>
        <div className="chip">Essential Question</div>
        <div className="chip">Challenge</div>
      </div>

      <svg viewBox="0 0 360 80" aria-hidden="true">
        <path className="connector" d="M30 50 C110 50 110 20 180 20" fill="transparent" />
        <path className="connector" d="M180 20 C250 20 250 50 330 50" fill="transparent" />
      </svg>

      <div className="phases">
        {phaseContent.map(phase => (
          <div key={phase.title} className="phase-card">
            <strong>{phase.title}</strong>
            <span>{phase.summary}</span>
          </div>
        ))}
      </div>

      <div className="deliverables">
        <div className="deliverable">
          <Map className="w-4 h-4 mx-auto mb-1" />
          Milestones
        </div>
        <div className="deliverable">
          <Box className="w-4 h-4 mx-auto mb-1" />
          Artifacts
        </div>
        <div className="deliverable">
          <CheckSquare className="w-4 h-4 mx-auto mb-1" />
          Rubric
        </div>
      </div>

      <div className="progress-ring">
        <div className="progress-check">
          <Check className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

