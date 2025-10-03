import React from 'react';
import {
  Beaker,
  Calculator,
  Cog,
  Cpu,
  Palette,
  FlaskConical,
  Globe,
  PenTool,
  Sparkles,
  Atom
} from 'lucide-react';
import { AlfLogo } from './AlfLogo';

const ORBIT_DURATION = '18s';

const ORBIT_ITEMS = [
  { name: 'Innovation', Icon: Sparkles, background: 'bg-indigo-50', icon: 'text-indigo-500' },
  { name: 'Science', Icon: Beaker, background: 'bg-blue-50', icon: 'text-blue-500' },
  { name: 'Engineering', Icon: Cog, background: 'bg-sky-50', icon: 'text-sky-500' },
  { name: 'Design', Icon: PenTool, background: 'bg-cyan-50', icon: 'text-cyan-500' },
  { name: 'Technology', Icon: Cpu, background: 'bg-emerald-50', icon: 'text-emerald-500' },
  { name: 'Mathematics', Icon: Calculator, background: 'bg-lime-50', icon: 'text-lime-500' },
  { name: 'Global', Icon: Globe, background: 'bg-amber-50', icon: 'text-amber-500' },
  { name: 'Chemistry', Icon: FlaskConical, background: 'bg-orange-50', icon: 'text-orange-500' },
  { name: 'Creativity', Icon: Palette, background: 'bg-rose-50', icon: 'text-rose-500' },
  { name: 'Physics', Icon: Atom, background: 'bg-violet-50', icon: 'text-violet-500' }
];

export default function HeroOrbitAnimation({ className = '' }) {
  const duration = 18;

  // Responsive radius values matched to container sizes
  // Mobile: 220px container → 82px radius
  // SM: 280px container → 108px radius
  // MD: 340px container → 138px radius
  const radiusMobile = 82;
  const radiusSm = 108;
  const radiusMd = 138;

  return (
    <div
      className={`relative mx-auto aspect-square w-[220px] sm:w-[280px] md:w-[340px] ${className}`}
      style={{
        '--orbit-duration': `${duration}s`,
        '--orbit-radius-mobile': `${radiusMobile}px`,
        '--orbit-radius-sm': `${radiusSm}px`,
        '--orbit-radius-md': `${radiusMd}px`
      }}
    >
      <div className="absolute inset-[-20%] rounded-full bg-gradient-radial from-primary-500/12 via-transparent to-transparent" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white shadow-[0_16px_40px_rgba(59,130,246,0.25)] border border-primary-100 flex items-center justify-center">
          <AlfLogo size="lg" showText={false} />
        </div>
      </div>

      <div className="absolute inset-0 animate-[orbit-spin_var(--orbit-duration)_linear_infinite]" aria-hidden>
        {ORBIT_ITEMS.map(({ name, Icon, background, icon }, index) => {
          const angle = (360 / ORBIT_ITEMS.length) * index;
          const angleRad = (angle * Math.PI) / 180;

          // Calculate positions for each breakpoint
          const xMobile = Math.sin(angleRad) * radiusMobile;
          const yMobile = -Math.cos(angleRad) * radiusMobile;
          const xSm = Math.sin(angleRad) * radiusSm;
          const ySm = -Math.cos(angleRad) * radiusSm;
          const xMd = Math.sin(angleRad) * radiusMd;
          const yMd = -Math.cos(angleRad) * radiusMd;

          return (
            <div
              key={name}
              className="orbit-item absolute top-1/2 left-1/2"
              style={{
                transform: `translate(calc(-50% + ${xMobile}px), calc(-50% + ${yMobile}px))`,
                '--x-sm': `${xSm}px`,
                '--y-sm': `${ySm}px`,
                '--x-md': `${xMd}px`,
                '--y-md': `${yMd}px`
              }}
            >
              <div
                className={`w-12 h-12 sm:w-[52px] sm:h-[52px] rounded-full ${background} shadow-[0_12px_24px_rgba(15,23,42,0.12)] border border-white/60 flex items-center justify-center animate-[orbit-counter_var(--orbit-duration)_linear_infinite]`}
              >
                <Icon className={`w-4 h-4 ${icon}`} aria-label={name} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
