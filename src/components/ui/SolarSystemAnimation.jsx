import React from 'react';
import { Beaker, Calculator, Cog, Cpu, Palette } from 'lucide-react';
import { AlfLogo } from './AlfLogo';

const ORBIT_DURATION = '18s';

const ICONS = [
  { name: 'Science', Icon: Beaker },
  { name: 'Technology', Icon: Cpu },
  { name: 'Engineering', Icon: Cog },
  { name: 'Arts', Icon: Palette },
  { name: 'Math', Icon: Calculator }
];

export default function SolarSystemAnimation({ className = '' }) {
  return (
    <div className={`relative mx-auto aspect-square w-[260px] sm:w-[320px] md:w-[384px] ${className}`}>
      {/* Central ALF logo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="w-16 h-16 rounded-full bg-white shadow-lg shadow-primary-500/30 flex items-center justify-center">
          <AlfLogo size="lg" showText={false} />
        </div>
      </div>

      {/* Orbit ring */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full animate-[orbit-spin_var(--orbit-duration)_linear_infinite]"
        style={{ '--orbit-duration': ORBIT_DURATION }}
        aria-hidden
      >
        {ICONS.map(({ name, Icon }, index) => {
          const angle = (360 / ICONS.length) * index;
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
                <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-primary-600 dark:text-primary-300">
                  <Icon className="w-4 h-4" aria-label={name} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subtle background glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-radial from-primary-500/10 via-transparent to-transparent" />
    </div>
  );
}
