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
  { name: 'Innovation', Icon: Sparkles, ring: 'from-indigo-100 to-indigo-300', icon: 'text-indigo-600' },
  { name: 'Science', Icon: Beaker, ring: 'from-blue-100 to-blue-300', icon: 'text-blue-600' },
  { name: 'Engineering', Icon: Cog, ring: 'from-sky-100 to-sky-300', icon: 'text-sky-600' },
  { name: 'Design', Icon: PenTool, ring: 'from-cyan-100 to-cyan-300', icon: 'text-cyan-600' },
  { name: 'Technology', Icon: Cpu, ring: 'from-emerald-100 to-emerald-300', icon: 'text-emerald-600' },
  { name: 'Mathematics', Icon: Calculator, ring: 'from-lime-100 to-lime-300', icon: 'text-lime-600' },
  { name: 'Global', Icon: Globe, ring: 'from-amber-100 to-amber-300', icon: 'text-amber-600' },
  { name: 'Chemistry', Icon: FlaskConical, ring: 'from-orange-100 to-orange-300', icon: 'text-orange-500' },
  { name: 'Creativity', Icon: Palette, ring: 'from-rose-100 to-rose-300', icon: 'text-rose-500' },
  { name: 'Physics', Icon: Atom, ring: 'from-violet-100 to-violet-300', icon: 'text-violet-500' }
];

export default function SolarSystemAnimation({ className = '' }) {
  return (
    <div className={`relative mx-auto aspect-square w-[260px] sm:w-[320px] md:w-[384px] ${className}`}>
      {/* Central ALF logo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="w-16 h-16 rounded-full bg-white shadow-lg shadow-primary-500/30 flex items-center justify-center border border-primary-100">
          <AlfLogo size="lg" showText={false} />
        </div>
      </div>

      {/* Orbit ring */}
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
              style={{ transform: `rotate(${angle}deg) translateY(-42%)` }}
            >
              <div
                className="animate-[orbit-counter_var(--orbit-duration)_linear_infinite]"
                style={{ transform: `rotate(${-angle}deg)` }}
              >
                <div className={`w-12 h-12 rounded-full shadow-md flex items-center justify-center border border-white/50 bg-gradient-to-br ${ring}`}>
                  <Icon className={`w-4 h-4 ${icon}`} aria-label={name} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subtle background glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-radial from-primary-500/8 via-transparent to-transparent" />
    </div>
  );
}
