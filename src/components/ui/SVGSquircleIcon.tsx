import React from 'react';

interface Props {
  size?: number;
  className?: string; // additional classes for container
  gradientClass?: string; // e.g., 'bg-gradient-to-br from-blue-500 to-blue-700'
  children?: React.ReactNode; // typically an icon
  smoothness?: number; // superellipse exponent (higher = squarer corners), default ~4
}

// Build an SVG path for a superellipse (squircle-like) and use it via CSS clip-path: path(...)
function buildSuperellipsePath(w: number, h: number, n: number): string {
  const a = w / 2;
  const b = h / 2;
  const cx = a;
  const cy = b;
  const steps = 64; // smooth outline
  const points: Array<[number, number]> = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * 2 * Math.PI;
    const ct = Math.cos(t);
    const st = Math.sin(t);
    const x = cx + a * Math.sign(ct) * Math.pow(Math.abs(ct), 2 / n);
    const y = cy + b * Math.sign(st) * Math.pow(Math.abs(st), 2 / n);
    points.push([x, y]);
  }
  const d = points
    .map(([x, y], idx) => `${idx === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(' ');
  return `${d} Z`;
}

export const SVGSquircleIcon: React.FC<Props> = ({
  size = 36,
  className = '',
  gradientClass = '',
  children,
  smoothness = 4,
}) => {
  const path = buildSuperellipsePath(size, size, smoothness);
  return (
    <div
      className={`relative ${gradientClass} ${className}`}
      style={{
        width: size,
        height: size,
        WebkitClipPath: `path('${path}')`,
        clipPath: `path('${path}')`,
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default SVGSquircleIcon;

