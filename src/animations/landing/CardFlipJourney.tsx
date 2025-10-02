import React from 'react';
import { useReducedMotion } from './useReducedMotion';
import { useInViewOnce } from './useInViewOnce';
import { useAnimationController } from './useAnimationController';

const LOOP_DURATION = 12000;

export function CardFlipJourney() {
  const prefersReducedMotion = useReducedMotion();
  const { ref, inView } = useInViewOnce<HTMLDivElement>({ threshold: 0.3 });
  const { isActive, replay } = useAnimationController({
    enabled: inView && !prefersReducedMotion,
    duration: LOOP_DURATION,
    loops: 1,
  });

  return (
    <div
      ref={ref}
      className={`card-flip-journey ${isActive ? 'is-active' : ''}`}
      data-reduced-motion={prefersReducedMotion}
      onMouseEnter={() => replay()}
    >
      <div className="card-scene">
        <div className="card">
          <div className="card-face front">
            <h4>Big Idea</h4>
            <p>
              Understanding local climate change empowers students to design meaningful community solutions.
            </p>
          </div>

          <div className="card-face back">
            <h4>Learning Journey</h4>
            <ul>
              <li>Investigate context & gather data</li>
              <li>Co-design ideas with partners</li>
              <li>Prototype, test, and iterate</li>
              <li>Launch toolkit & reflect</li>
            </ul>
          </div>

          <div className="card-face side">
            <h4>Deliverables</h4>
            <ul>
              <li>3 Milestones tracking progress</li>
              <li>2 Final artifacts for the community</li>
              <li>5 Rubric criteria for quality</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

