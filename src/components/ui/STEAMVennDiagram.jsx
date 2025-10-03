import React from 'react';
import {
  Beaker,
  Cpu,
  Cog,
  Palette,
  Calculator
} from 'lucide-react';
import { AlfLogo } from './AlfLogo';

const PETALS = [
  {
    label: 'Science',
    Icon: Beaker,
    angle: -18,
    gradient: 'from-blue-200/70 to-blue-500/40',
    text: 'text-blue-700'
  },
  {
    label: 'Technology',
    Icon: Cpu,
    angle: 54,
    gradient: 'from-violet-200/70 to-indigo-500/40',
    text: 'text-indigo-700'
  },
  {
    label: 'Engineering',
    Icon: Cog,
    angle: 126,
    gradient: 'from-emerald-200/70 to-emerald-500/40',
    text: 'text-emerald-700'
  },
  {
    label: 'Arts',
    Icon: Palette,
    angle: 198,
    gradient: 'from-rose-200/70 to-rose-500/40',
    text: 'text-rose-700'
  },
  {
    label: 'Mathematics',
    Icon: Calculator,
    angle: 270,
    gradient: 'from-amber-200/70 to-amber-500/40',
    text: 'text-amber-700'
  }
];

const STEAMVennDiagram = () => {
  return (
    <div className="relative mx-auto aspect-square w-[280px] sm:w-[320px] md:w-[360px]">
      <div className="absolute inset-[-20%] rounded-full bg-gradient-radial from-primary-500/12 via-transparent to-transparent" />

      {PETALS.map(({ label, Icon, angle, gradient, text }) => (
        <div
          key={label}
          className="absolute top-1/2 left-1/2"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          <div className="origin-center -translate-y-[125px] -translate-x-1/2">
            <div
              className={`w-32 h-48 rounded-[999px] bg-gradient-to-b ${gradient} shadow-[0_18px_32px_rgba(15,23,42,0.18)] border border-white/40 dark:border-white/10`}
              style={{ transform: `rotate(${-angle}deg)` }}
            />
            <div
              className="absolute left-1/2 top-full mt-6 flex flex-col items-center gap-1"
              style={{ transform: `rotate(${-angle}deg) translateX(-50%)` }}
            >
              <div className={`w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center border border-white/60 ${text}`}>
                <Icon className="w-4 h-4" aria-hidden />
              </div>
              <span className={`text-sm font-semibold ${text}`}>{label}</span>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white shadow-[0_18px_40px_rgba(59,130,246,0.25)] border border-primary-100 flex items-center justify-center">
          <AlfLogo size="lg" showText={false} />
        </div>
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-center">
          <p className="text-xs font-semibold tracking-wide text-primary-600 uppercase">Active Learning Framework</p>
        </div>
      </div>
    </div>
  );
};

export default STEAMVennDiagram;
