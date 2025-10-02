import React from 'react';
import { useReducedMotion } from './useReducedMotion';
import { useInViewOnce } from './useInViewOnce';
import { useAnimationController } from './useAnimationController';

const LOOP_DURATION = 5200;

export function PromptToPlan() {
  const prefersReducedMotion = useReducedMotion();
  const { ref, inView } = useInViewOnce<HTMLDivElement>({ threshold: 0.4 });
  const { isActive, replay } = useAnimationController({
    enabled: inView && !prefersReducedMotion,
    duration: LOOP_DURATION,
  });

  return (
    <div
      ref={ref}
      className={`prompt-to-plan ${isActive ? 'is-active' : ''}`}
      data-reduced-motion={prefersReducedMotion}
      onMouseEnter={() => replay()}
    >
      <div className="prompt-input">
        <span className="caret" aria-hidden="true" />
        <span className="prompt-text">
          How might our community adapt to changing climate patterns?
        </span>
      </div>

      <div className="plan-stack">
        <div className="plan-card">
          <strong>Phase 1 · Investigate Context</strong>
          <p>Analyze climate data and interview local experts.</p>
        </div>
        <div className="plan-card">
          <strong>Phase 2 · Co-Design Solutions</strong>
          <p>Generate adaptation ideas with students and partners.</p>
        </div>
        <div className="plan-card">
          <strong>Phase 3 · Prototype & Test</strong>
          <p>Build toolkit components and iterate with feedback.</p>
        </div>
        <div className="plan-card">
          <strong>Phase 4 · Launch & Reflect</strong>
          <p>Share the toolkit and capture impact reflections.</p>
        </div>
      </div>

      <div className="plan-highlight" aria-hidden="true" />
    </div>
  );
}

