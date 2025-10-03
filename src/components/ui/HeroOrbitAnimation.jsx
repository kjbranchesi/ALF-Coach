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
  { name: 'Innovation', Icon: Sparkles, ring: 'from-indigo-200/80 to-indigo-400/60', icon: 'text-indigo-600' },
  { name: 'Science', Icon: Beaker, ring: 'from-blue-200/80 to-blue-400/60', icon: 'text-blue-600' },
  { name: 'Engineering', Icon: Cog, ring: 'from-sky-200/80 to-sky-400/60', icon: 'text-sky-600' },
  { name: 'Design', Icon: PenTool, ring: 'from-cyan-200/80 to-cyan-400/60', icon: 'text-cyan-600' },
  { name: 'Technology', Icon: Cpu, ring: 'from-emerald-200/80 to-emerald-400/60', icon: 'text-emerald-600' },
  { name: 'Mathematics', Icon: Calculator, ring: 'from-lime-200/80 to-lime-400/60', icon: 'text-lime-600' },
  { name: 'Global', Icon: Globe, ring: 'from-amber-200/80 to-amber-400/60', icon: 'text-amber-600' },
  { name: 'Chemistry', Icon: FlaskConical, ring: 'from-orange-200/80 to-orange-400/60', icon: 'text-orange-500' },
  { name: 'Creativity', Icon: Palette, ring: 'from-rose-200/80 to-rose-400/60', icon: 'text-rose-500' },
  { name: 'Physics', Icon: Atom, ring: 'from-violet-200/80 to-violet-400/60', icon: 'text-violet-500' }
];

export default function HeroOrbitAnimation({ className = '' }) {
  return (
    <div className={`relative mx-auto aspect-square w-[220px] sm:w-[280px] md:w-[340px] ${className}`}>
      <div className="absolute inset-[-20%] rounded-full bg-gradient-radial from-primary-500/12 via-transparent to-transparent" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white shadow-[0_16px_40px_rgba(59,130,246,0.25)] border border-primary-100 flex items-center justify-center">
          <AlfLogo size="lg" showText={false} />
        </div>
      </div>

      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full animate-[orbit-spin_var(--orbit-duration)_linear_infinite]"
        style={{ '--orbit-duration': ORBIT_DURATION }}
        aria-hidden
      >
        {ORBIT_ITEMS.map(({ name, Icon, ring, icon }, index) => {
          const angle = (360 / ORBIT_ITEMS.length) * index;
          return (
            <div
              key={name}
              className="absolute top-1/2 left-1/2"
              style={{ transform: `rotate(${angle}deg) translateY(-46%)` }}
            >
              <div
                className="animate-[orbit-counter_var(--orbit-duration)_linear_infinite]"
                style={{ transform: `rotate(${-angle}deg)` }}
              >
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full shadow-[0_10px_24px_rgba(15,23,42,0.15)] flex items-center justify-center border border-white/60 bg-gradient-to-br ${ring}`}>
                  <Icon className={`w-4 h-4 ${icon}`} aria-label={name} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
