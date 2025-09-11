// src/components/visuals/DoubleDiamond.tsx
// Lightweight, accessible Double Diamond diagram component

import React, { useMemo } from 'react';
import type { DiamondStage, StageInfo, CompletionMap, PhaseType } from '../../utils/alfFlow';
import { DEFAULT_STAGES, STAGE_LEGEND } from '../../utils/alfFlow';

type Size = 'compact' | 'default' | 'wide';

export interface DoubleDiamondProps {
  stages?: StageInfo[];
  currentStage?: DiamondStage;
  completion?: CompletionMap; // 0..100 per stage
  onStageClick?: (stage: DiamondStage) => void;
  size?: Size;
  interactive?: boolean;
  className?: string;
}

const COLORS: Record<PhaseType, { gradient: string; text: string; ring: string }> = {
  diverge: {
    gradient: 'from-sky-500 to-cyan-500',
    text: 'text-sky-700 dark:text-sky-300',
    ring: 'ring-sky-400/50',
  },
  converge: {
    gradient: 'from-violet-500 to-fuchsia-500',
    text: 'text-violet-700 dark:text-violet-300',
    ring: 'ring-violet-400/50',
  },
  reflect: {
    gradient: 'from-emerald-500 to-teal-500',
    text: 'text-emerald-700 dark:text-emerald-300',
    ring: 'ring-emerald-400/50',
  },
};

const STAGE_ORDER: DiamondStage[] = ['Discover', 'Define', 'Develop', 'Deliver', 'Reflect'];

function useReducedMotion(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const DoubleDiamond: React.FC<DoubleDiamondProps> = ({
  stages = DEFAULT_STAGES,
  currentStage,
  completion,
  onStageClick,
  size = 'default',
  interactive = true,
  className,
}) => {
  const prefersReducedMotion = useReducedMotion();

  // Normalize stages to expected order
  const ordered = useMemo(() => {
    const dict = new Map(stages.map((s) => [s.id, s] as const));
    return STAGE_ORDER.map((id) => dict.get(id)).filter(Boolean) as StageInfo[];
  }, [stages]);

  const dims = useMemo(() => {
    switch (size) {
      case 'compact':
        return { width: 720, height: 160 };
      case 'wide':
        return { width: 980, height: 220 };
      default:
        return { width: 860, height: 180 };
    }
  }, [size]);

  // Positions for four diamond nodes + reflect pill
  const positions = useMemo(() => {
    const { width, height } = dims;
    const pad = 24;
    const midY = height / 2;
    const unit = (width - pad * 2) / 5; // 5 segments across (incl. Reflect)
    return {
      discover: { x: pad + unit * 0.5, y: midY },
      define: { x: pad + unit * 1.5, y: midY },
      develop: { x: pad + unit * 2.5, y: midY },
      deliver: { x: pad + unit * 3.5, y: midY },
      reflect: { x: pad + unit * 4.5, y: midY },
      unit,
    };
  }, [dims]);

  const Node: React.FC<{
    info: StageInfo;
    x: number;
    y: number;
    active?: boolean;
    percent?: number;
    onClick?: () => void;
  }> = ({ info, x, y, active, percent = 0, onClick }) => {
    const color = COLORS[info.type];
    const isDiamond = info.type !== 'reflect';
    const w = 100; // node width baseline
    const h = 56; // node height baseline
    const progress = Math.max(0, Math.min(100, percent));

    return (
      <g transform={`translate(${x}, ${y})`}>
        {/* Hit area */}
        <g transform={`translate(${-w / 2}, ${-h / 2})`}>
          {isDiamond ? (
            <polygon
              points={`${w / 2},0 ${w},${h / 2} ${w / 2},${h} 0,${h / 2}`}
              className={`fill-white/85 dark:fill-slate-900/80 stroke-1 ${active ? 'stroke-current' : 'stroke-slate-300 dark:stroke-slate-700'}`}
              style={{ filter: 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.06))' }}
            />
          ) : (
            <rect
              x={w * 0.1}
              y={h * 0.18}
              rx={12}
              ry={12}
              width={w * 0.8}
              height={h * 0.64}
              className={`fill-white/85 dark:fill-slate-900/80 stroke-1 ${active ? 'stroke-current' : 'stroke-slate-300 dark:stroke-slate-700'}`}
            />
          )}

          {/* Gradient ring for active/hover state */}
          <g className={`pointer-events-none`}>
            {active && (
              <path
                d={isDiamond
                  ? `M ${w / 2},${-6} L ${w + 6},${h / 2} L ${w / 2},${h + 6} L ${-6},${h / 2} Z`
                  : ''}
                className={`fill-none stroke-2 ${color.ring}`}
              />
            )}
          </g>

          {/* Progress underline */}
          <rect
            x={w * 0.15}
            y={h - 6}
            width={(w * 0.7 * progress) / 100}
            height={3}
            className={`fill-gradient-to-r ${progress > 0 ? `from-slate-400 to-slate-600 dark:from-slate-300 dark:to-slate-500` : 'fill-transparent'}`}
          />
        </g>

        {/* Label */}
        <g transform={`translate(0, ${isDiamond ? 0 : 0})`}>
          <text
            textAnchor="middle"
            className={`select-none ${color.text} font-semibold`}
            style={{ fontSize: 13 }}
          >
            {info.title}
          </text>
          <text
            y={18}
            textAnchor="middle"
            className="fill-slate-600 dark:fill-slate-400 select-none"
            style={{ fontSize: 11 }}
          >
            {info.type === 'reflect' ? 'Reflect' : info.type === 'diverge' ? 'Diverge' : 'Converge'}
          </text>
        </g>

        {/* Click overlay for accessibility */}
        <g>
          <foreignObject x={-60} y={-38} width={120} height={76}>
            <button
              onClick={onClick}
              aria-pressed={active}
              aria-label={`${info.title}: ${info.subtitle}`}
              className={`w-full h-full opacity-0 focus:opacity-100 rounded-md outline-none focus-visible:ring-2 ${color.ring}`}
              disabled={!onClick}
              title={`${info.title}: ${info.subtitle}`}
            />
          </foreignObject>
        </g>
      </g>
    );
  };

  // Simple connectors between nodes
  const Connector: React.FC<{ x1: number; x2: number; y: number }> = ({ x1, x2, y }) => (
    <line x1={x1} x2={x2} y1={y} y2={y} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={2} />
  );

  const onClick = (stage: DiamondStage) => {
    if (!interactive) return;
    onStageClick?.(stage);
  };

  return (
    <div className={`w-full ${className || ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          ALF Flow — Double Diamond
        </div>
        <div className="flex items-center gap-2">
          {STAGE_LEGEND.map((l) => (
            <div key={l.type} className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
              <span className={`inline-block h-2 w-2 rounded-full bg-gradient-to-r ${l.colorClass}`} />
              <span>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur p-3">
        <svg
          viewBox={`0 0 ${dims.width} ${dims.height}`}
          width="100%"
          height={dims.height}
          role="img"
          aria-label="ALF Double Diamond diagram"
        >
          {/* Connectors */}
          <Connector x1={positions.discover.x} x2={positions.define.x} y={positions.discover.y} />
          <Connector x1={positions.define.x} x2={positions.develop.x} y={positions.discover.y} />
          <Connector x1={positions.develop.x} x2={positions.deliver.x} y={positions.discover.y} />
          <Connector x1={positions.deliver.x} x2={positions.reflect.x} y={positions.discover.y} />

          {/* Nodes */}
          <Node
            info={ordered.find((s) => s.id === 'Discover')!}
            x={positions.discover.x}
            y={positions.discover.y}
            active={currentStage === 'Discover'}
            percent={completion?.Discover ?? 0}
            onClick={interactive ? () => onClick('Discover') : undefined}
          />
          <Node
            info={ordered.find((s) => s.id === 'Define')!}
            x={positions.define.x}
            y={positions.define.y}
            active={currentStage === 'Define'}
            percent={completion?.Define ?? 0}
            onClick={interactive ? () => onClick('Define') : undefined}
          />
          <Node
            info={ordered.find((s) => s.id === 'Develop')!}
            x={positions.develop.x}
            y={positions.develop.y}
            active={currentStage === 'Develop'}
            percent={completion?.Develop ?? 0}
            onClick={interactive ? () => onClick('Develop') : undefined}
          />
          <Node
            info={ordered.find((s) => s.id === 'Deliver')!}
            x={positions.deliver.x}
            y={positions.deliver.y}
            active={currentStage === 'Deliver'}
            percent={completion?.Deliver ?? 0}
            onClick={interactive ? () => onClick('Deliver') : undefined}
          />
          <Node
            info={ordered.find((s) => s.id === 'Reflect')!}
            x={positions.reflect.x}
            y={positions.reflect.y}
            active={currentStage === 'Reflect'}
            percent={completion?.Reflect ?? 0}
            onClick={interactive ? () => onClick('Reflect') : undefined}
          />
        </svg>
      </div>

      {/* Helper content for screen readers or optional details */}
      <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {ordered.map((st) => (
          <div key={st.id} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-white/60 dark:bg-slate-900/60">
            <dt className="text-xs uppercase tracking-wide text-slate-500">{st.title}</dt>
            <dd className="text-sm text-slate-700 dark:text-slate-300">{st.subtitle}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default DoubleDiamond;

