/**
 * Education-Specific Components
 * Specialized components for learning experiences
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Progress Ring Component for Learning Progress
interface ProgressRingProps {
  progress: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  className?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'warning';
}

const progressRingSizes = {
  sm: { size: 80, strokeWidth: 6 },
  md: { size: 120, strokeWidth: 8 },
  lg: { size: 160, strokeWidth: 10 },
};

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 'md',
  children,
  className,
  showPercentage = true,
  color = 'primary',
}) => {
  const { size: dimensions, strokeWidth } = progressRingSizes[size];
  const radius = (dimensions - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const colorClasses = {
    primary: 'stroke-primary',
    secondary: 'stroke-secondary',
    success: 'stroke-green-500',
    warning: 'stroke-amber-500',
  };

  return (
    <div className={cn('alf-progress-ring relative', className)} style={{ width: dimensions, height: dimensions }}>
      <svg
        className="alf-progress-ring__circle transform -rotate-90"
        width={dimensions}
        height={dimensions}
      >
        <circle
          className="alf-progress-ring__track"
          cx={dimensions / 2}
          cy={dimensions / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          opacity="0.1"
        />
        <circle
          className={cn('alf-progress-ring__fill transition-all duration-500 ease-out', colorClasses[color])}
          cx={dimensions / 2}
          cy={dimensions / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="alf-progress-ring__label absolute inset-0 flex items-center justify-center">
        {children || (showPercentage && (
          <span className="text-lg font-semibold text-foreground">
            {Math.round(progress)}%
          </span>
        ))}
      </div>
    </div>
  );
};

// Student Progress Dashboard Card
interface StudentProgressCardProps {
  studentName: string;
  avatar?: string;
  completedLessons: number;
  totalLessons: number;
  currentStreak: number;
  totalXP: number;
  achievements: Achievement[];
  className?: string;
}

interface Achievement {
  id: string;
  name: string;
  icon: React.ReactNode;
  type: 'bronze' | 'silver' | 'gold';
  earnedAt: Date;
}

const StudentProgressCard: React.FC<StudentProgressCardProps> = ({
  studentName,
  avatar,
  completedLessons,
  totalLessons,
  currentStreak,
  totalXP,
  achievements,
  className,
}) => {
  const completionPercentage = (completedLessons / totalLessons) * 100;

  return (
    <div className={cn('alf-student-progress', className)}>
      <div className="flex items-center gap-4 mb-6">
        {avatar ? (
          <img
            src={avatar}
            alt={`${studentName}'s avatar`}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">
              {studentName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <h3 className="text-xl font-semibold text-white">{studentName}</h3>
          <p className="text-white/80">Learning Journey</p>
        </div>
      </div>

      <div className="alf-student-progress__stats">
        <div className="alf-student-progress__stat">
          <span className="alf-student-progress__stat-value">{completedLessons}/{totalLessons}</span>
          <span className="alf-student-progress__stat-label">Lessons</span>
        </div>
        <div className="alf-student-progress__stat">
          <span className="alf-student-progress__stat-value">{currentStreak}</span>
          <span className="alf-student-progress__stat-label">Day Streak</span>
        </div>
        <div className="alf-student-progress__stat">
          <span className="alf-student-progress__stat-value">{totalXP.toLocaleString()}</span>
          <span className="alf-student-progress__stat-label">Total XP</span>
        </div>
        <div className="alf-student-progress__stat">
          <span className="alf-student-progress__stat-value">{achievements.length}</span>
          <span className="alf-student-progress__stat-label">Achievements</span>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-white/80">Overall Progress</span>
          <span className="text-sm font-medium text-white">{Math.round(completionPercentage)}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div
            className="bg-white h-2 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Achievement Badge Component
interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  size = 'md',
  showName = true,
  className,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const typeClasses = {
    bronze: 'alf-achievement-badge--bronze',
    silver: 'alf-achievement-badge--silver',
    gold: 'alf-achievement-badge',
  };

  return (
    <div className={cn('alf-achievement-badge', typeClasses[achievement.type], className)}>
      <div className={cn('rounded-full flex items-center justify-center', sizeClasses[size])}>
        {achievement.icon}
      </div>
      {showName && (
        <span className="ml-2 font-medium">{achievement.name}</span>
      )}
    </div>
  );
};

// Learning Path Component
interface LearningPathProps {
  steps: LearningStep[];
  currentStepId: string;
  onStepClick?: (stepId: string) => void;
  className?: string;
}

interface LearningStep {
  id: string;
  title: string;
  description?: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'locked';
  estimatedTime?: string;
  icon?: React.ReactNode;
}

const LearningPath: React.FC<LearningPathProps> = ({
  steps,
  currentStepId,
  onStepClick,
  className,
}) => {
  const getStepIcon = (step: LearningStep, index: number) => {
    if (step.icon) return step.icon;
    
    switch (step.status) {
      case 'completed':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'in-progress':
        return (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        );
      case 'locked':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        );
      default:
        return <span className="text-sm font-semibold">{index + 1}</span>;
    }
  };

  return (
    <div className={cn('alf-learning-path', className)}>
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={cn(
            'alf-learning-path__step',
            {
              'alf-learning-path__step--completed': step.status === 'completed',
              'alf-learning-path__step--current': step.id === currentStepId,
              'opacity-50 cursor-not-allowed': step.status === 'locked',
            }
          )}
          onClick={() => step.status !== 'locked' && onStepClick?.(step.id)}
        >
          <div className="alf-learning-path__step-icon">
            {getStepIcon(step, index)}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-foreground">{step.title}</h4>
            {step.description && (
              <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
            )}
            {step.estimatedTime && (
              <span className="text-xs text-muted-foreground mt-1 block">
                {step.estimatedTime}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Collaborative Learning Card
interface CollaborationCardProps {
  title: string;
  description: string;
  participants: Participant[];
  type: 'peer-review' | 'group-project' | 'study-group' | 'mentorship';
  dueDate?: Date;
  status: 'active' | 'pending' | 'completed';
  onJoin?: () => void;
  className?: string;
}

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  role?: 'student' | 'mentor' | 'instructor';
}

const CollaborationCard: React.FC<CollaborationCardProps> = ({
  title,
  description,
  participants,
  type,
  dueDate,
  status,
  onJoin,
  className,
}) => {
  const typeColors = {
    'peer-review': 'border-orange-200 bg-orange-50',
    'group-project': 'border-primary-200 bg-primary-50',
    'study-group': 'border-green-200 bg-green-50',
    'mentorship': 'border-purple-200 bg-purple-50',
  };

  const statusColors = {
    active: 'text-green-600 bg-green-100',
    pending: 'text-amber-600 bg-amber-100',
    completed: 'text-gray-600 bg-gray-100',
  };

  return (
    <div className={cn('alf-collaboration-card', typeColors[type], className)}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium text-foreground">{title}</h3>
        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusColors[status])}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      
      <div className="alf-collaboration-card__participants">
        <div className="flex items-center">
          {participants.slice(0, 4).map((participant, index) => (
            <div
              key={participant.id}
              className="alf-collaboration-card__avatar"
              style={{ zIndex: participants.length - index }}
              title={participant.name}
            >
              {participant.avatar ? (
                <img
                  src={participant.avatar}
                  alt={participant.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                participant.name.charAt(0).toUpperCase()
              )}
            </div>
          ))}
          {participants.length > 4 && (
            <div className="alf-collaboration-card__avatar bg-muted text-muted-foreground">
              +{participants.length - 4}
            </div>
          )}
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          {dueDate && (
            <span className="text-xs text-muted-foreground">
              Due {dueDate.toLocaleDateString()}
            </span>
          )}
          {status === 'pending' && onJoin && (
            <button
              onClick={onJoin}
              className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/90 transition-colors"
            >
              Join
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Competency Tracker Component
interface CompetencyTrackerProps {
  competencies: Competency[];
  className?: string;
}

interface Competency {
  id: string;
  name: string;
  description: string;
  level: number; // 0-4 (Novice, Advanced Beginner, Competent, Proficient, Expert)
  maxLevel: number;
  skills: Skill[];
}

interface Skill {
  id: string;
  name: string;
  mastered: boolean;
}

const competencyLevels = [
  'Novice',
  'Advanced Beginner',
  'Competent',
  'Proficient',
  'Expert'
];

const CompetencyTracker: React.FC<CompetencyTrackerProps> = ({
  competencies,
  className,
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      {competencies.map((competency) => (
        <div key={competency.id} className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">{competency.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{competency.description}</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-primary">
                {competencyLevels[competency.level]}
              </div>
              <div className="text-xs text-muted-foreground">
                Level {competency.level + 1} of {competency.maxLevel + 1}
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="text-sm font-medium">
                {Math.round(((competency.level + 1) / (competency.maxLevel + 1)) * 100)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${((competency.level + 1) / (competency.maxLevel + 1)) * 100}%` }}
              />
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Skills</h4>
            <div className="grid grid-cols-2 gap-2">
              {competency.skills.map((skill) => (
                <div
                  key={skill.id}
                  className={cn(
                    'flex items-center gap-2 text-sm p-2 rounded',
                    skill.mastered
                      ? 'bg-green-50 text-green-700'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <div className={cn(
                    'w-4 h-4 rounded-full flex items-center justify-center',
                    skill.mastered ? 'bg-green-500' : 'bg-muted-foreground'
                  )}>
                    {skill.mastered && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span>{skill.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export {
  ProgressRing,
  StudentProgressCard,
  AchievementBadge,
  LearningPath,
  CollaborationCard,
  CompetencyTracker,
  type ProgressRingProps,
  type StudentProgressCardProps,
  type AchievementBadgeProps,
  type LearningPathProps,
  type CollaborationCardProps,
  type CompetencyTrackerProps,
  type Achievement,
  type LearningStep,
  type Participant,
  type Competency,
  type Skill,
};