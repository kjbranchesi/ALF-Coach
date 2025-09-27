import type { Stage } from '../components/chat/ProgressSidebar';
import React from 'react';
import { Lightbulb, Map, Target } from 'lucide-react';

export function computeStageProgress(blueprint: any): { stages: Stage[]; current: string } {
  const ideation = blueprint?.ideation || {};
  const journey = blueprint?.journey || {};
  const deliverables = blueprint?.deliverables || {};

  const ideationSub = [
    { id: 'bigIdea', label: 'Big Idea', completed: !!ideation.bigIdea },
    { id: 'eq', label: 'Essential Question', completed: !!ideation.essentialQuestion },
    { id: 'challenge', label: 'Challenge', completed: !!ideation.challenge }
  ];

  const journeySub = [
    { id: 'phases', label: 'Phases', completed: Array.isArray(journey.phases) ? journey.phases.length > 0 : !!journey.phases },
    { id: 'activities', label: 'Activities', completed: !!journey.activities },
    { id: 'resources', label: 'Resources', completed: !!journey.resources }
  ];

  const del = {
    milestones: Array.isArray(deliverables.milestones) ? deliverables.milestones.length : 0,
    rubric: deliverables.rubric?.criteria ? deliverables.rubric.criteria.length : 0,
    impactAudience: !!deliverables.impact?.audience,
    impactMethod: !!deliverables.impact?.method,
    artifacts: Array.isArray(deliverables.artifacts) ? deliverables.artifacts.length : (deliverables.artifacts ? 1 : 0),
    checkpoints: deliverables?.evidencePlan?.checkpoints ? deliverables.evidencePlan.checkpoints.length : 0
  };

  const delSub = [
    { id: 'milestones', label: 'Milestones', completed: del.milestones >= 3 },
    { id: 'rubric', label: 'Rubric', completed: del.rubric > 0 },
    { id: 'impact', label: 'Exhibition', completed: del.impactAudience && del.impactMethod }
  ];

  const ideationDone = ideationSub.every(s => s.completed);
  const journeyDone = journeySub.every(s => s.completed);
  const deliverablesDone = delSub.every(s => s.completed);

  const stages: Stage[] = [
    {
      id: 'ideation',
      label: 'Ideation',
      icon: React.createElement(Lightbulb, { className: 'w-5 h-5' }),
      status: ideationDone ? 'completed' : (ideationSub.some(s => s.completed) ? 'in-progress' : 'pending'),
      substeps: ideationSub
    },
    {
      id: 'journey',
      label: 'Learning Journey',
      icon: React.createElement(Map, { className: 'w-5 h-5' }),
      status: journeyDone ? 'completed' : (journeySub.some(s => s.completed) ? 'in-progress' : 'pending'),
      substeps: journeySub
    },
    {
      id: 'deliverables',
      label: 'Deliverables',
      icon: React.createElement(Target, { className: 'w-5 h-5' }),
      status: deliverablesDone ? 'completed' : (delSub.some(s => s.completed) ? 'in-progress' : 'pending'),
      substeps: delSub
    }
  ];

  const current = deliverablesDone ? 'deliverables' : journeyDone ? 'journey' : 'ideation';
  return { stages, current };
}
