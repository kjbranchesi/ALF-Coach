import React from 'react';
import { motion } from 'framer-motion';
import { Beaker, Calculator, Cog, Cpu, Palette } from 'lucide-react';
import { AlfLogo } from './AlfLogo';

const subjectIconMap = {
  Science: Beaker,
  Technology: Cpu,
  Engineering: Cog,
  Arts: Palette,
  Math: Calculator
};

const SolarSystemAnimation = ({ className = '' }) => {
  const planets = [
    {
      id: 1,
      size: 12,
      orbitRadius: 58,
      duration: 16,
      color: 'bg-primary-400',
      name: 'Science',
      delay: 0
    },
    {
      id: 2,
      size: 10,
      orbitRadius: 86,
      duration: 20,
      color: 'bg-coral-400',
      name: 'Technology',
      delay: 4
    },
    {
      id: 3,
      size: 9,
      orbitRadius: 114,
      duration: 24,
      color: 'bg-emerald-400',
      name: 'Engineering',
      delay: 8
    },
    {
      id: 4,
      size: 8,
      orbitRadius: 142,
      duration: 18,
      color: 'bg-ai-400',
      name: 'Arts',
      delay: 12
    },
    {
      id: 5,
      size: 9,
      orbitRadius: 170,
      duration: 22,
      color: 'bg-amber-400',
      name: 'Math',
      delay: 16
    }
  ];

  return (
    <div className={`relative w-80 h-80 md:w-96 md:h-96 mx-auto ${className}`}>
      {/* Central Alf Hub */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full shadow-lg flex items-center justify-center z-10"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        whileHover={{ scale: 1.1 }}
      >
        <motion.div
          className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner"
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(59, 130, 246, 0.7)',
              '0 0 0 10px rgba(59, 130, 246, 0)',
              '0 0 0 0 rgba(59, 130, 246, 0)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <AlfLogo size="lg" showText={false} />
        </motion.div>
      </motion.div>

      {/* Orbit Lines */}
      {planets.map((planet) => (
        <motion.div
          key={`orbit-${planet.id}`}
          className="absolute top-1/2 left-1/2 border border-slate-200 dark:border-slate-700 rounded-full opacity-30"
          style={{
            width: planet.orbitRadius * 2,
            height: planet.orbitRadius * 2,
            marginLeft: -planet.orbitRadius,
            marginTop: -planet.orbitRadius,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 0.8, delay: planet.delay * 0.1 }}
        />
      ))}

      {/* Orbiting Planets */}
      {planets.map((planet) => {
        const SubjectIcon = subjectIconMap[planet.name] ?? Beaker;
        return (
        <motion.div
          key={planet.id}
          className="absolute top-1/2 left-1/2"
          style={{
            width: planet.orbitRadius * 2,
            height: planet.orbitRadius * 2,
            marginLeft: -planet.orbitRadius,
            marginTop: -planet.orbitRadius,
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: planet.duration,
            repeat: Infinity,
            ease: "linear",
            delay: planet.delay
          }}
        >
          <motion.div
            className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 ${planet.color} rounded-full shadow-md hover:shadow-lg transition-shadow cursor-pointer group flex items-center justify-center text-white`}
            style={{
              width: planet.size,
              height: planet.size,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: -360 }}
            transition={{
              scale: { duration: 0.5, delay: planet.delay * 0.1 + 0.3 },
              rotate: {
                duration: planet.duration,
                repeat: Infinity,
                ease: 'linear',
                delay: planet.delay
              }
            }}
            whileHover={{ scale: 1.2 }}
          >
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {planet.name}
            </div>
            <div className="flex items-center justify-center">
              <SubjectIcon className="w-3.5 h-3.5" />
            </div>
          </motion.div>
        </motion.div>
        );
      })}

      {/* Subtle background glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-primary-100/20 via-transparent to-transparent rounded-full"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

export default SolarSystemAnimation;
