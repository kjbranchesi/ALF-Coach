import React from 'react';
import type { PhaseKind } from '../../../types/showcaseV2';
import { getPhaseColor, getPhaseIcon } from '../utils/phaseColors';

interface PhaseBeadgeProps {
  kind: PhaseKind;
}

export default function PhaseBeadge({ kind }: PhaseBeadgeProps) {
  const phaseColor = getPhaseColor(kind);
  const phaseIcon = getPhaseIcon(kind);

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-colors duration-200"
      style={{
        backgroundColor: `${phaseColor}26`,
        color: phaseColor,
        border: `1.5px solid ${phaseColor}66`
      }}
      aria-label={`Phase: ${kind}`}
    >
      <span role="img" aria-hidden="true">
        {phaseIcon}
      </span>
      {kind}
    </span>
  );
}
