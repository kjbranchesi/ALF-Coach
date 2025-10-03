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
  { name: 'Innovation', Icon: Sparkles, colors: 'from-indigo-200 to-indigo-500', icon: 'text-indigo-600' },
  { name: 'Science', Icon: Beaker, colors: 'from-blue-200 to-blue-500', icon: 'text-blue-600' },
  { name: 'Engineering', Icon: Cog, colors: 'from-sky-200 to-sky-500', icon: 'text-sky-600' },
  { name: 'Design', Icon: PenTool, colors: 'from-cyan-200 to-cyan-500', icon: 'text-cyan-600' },
  { name: 'Technology', Icon: Cpu, colors: 'from-emerald-200 to-emerald-500', icon: 'text-emerald-600' },
  { name: 'Mathematics', Icon: Calculator, colors: 'from-lime-200 to-lime-500', icon: 'text-lime-600' },
  { name: 'Global', Icon: Globe, colors: 'from-amber-200 to-amber-500', icon: 'text-amber-600' },
  { name: 'Chemistry', Icon: FlaskConical, colors: 'from-orange-200 to-orange-500', icon: 'text-orange-500' },
  { name: 'Creativity', Icon: Palette, colors: 'from-rose-200 to-rose-500', icon: 'text-rose-500' },
  { name: 'Physics', Icon: Atom, colors: 'from-violet-200 to-violet-500', icon: 'text-violet-500' }
];

export default function HeroOrbitAnimation({ className = '' }) {
  const radius = 120;

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
        {ORBIT_ITEMS.map(({ name, Icon, colors, icon }, index) => {
          const angle = (360 / ORBIT_ITEMS.length) * index;
          const radians = (angle * Math.PI) / 180;
          const x = 150 + Math.cos(radians) * radius;
          const y = 150 + Math.sin(radians) * radius;
          return (
            <div
              key={name}
              className="absolute"
              style={{ top: y, left: x, transform: 'translate(-50%, -50%)' }}
            >
              <div
                className="animate-[orbit-counter_var(--orbit-duration)_linear_infinite]"
                style={{ transform: `rotate(${-angle}deg)` }}
              >
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full shadow-[0_10px_24px_rgba(15,23,42,0.15)] flex items-center justify-center border border-white/60 bg-opacity-90 bg-white`}
                  style={{ color: icon.replace('text-', '') }}
                >
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
