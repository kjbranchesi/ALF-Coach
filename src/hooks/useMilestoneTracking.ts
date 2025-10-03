import { useEffect, useState } from 'react';
import { useFSMv2 } from '../context/FSMContextV2';

export function useMilestoneTracking() {
  const { currentState, progress } = useFSMv2();
  const [completedMilestones, setCompletedMilestones] = useState<Set<string>>(new Set());
  const [currentMilestone, setCurrentMilestone] = useState<string | null>(null);

  useEffect(() => {
    const checkMilestones = () => {
      if (currentState.startsWith('JOURNEY') && !completedMilestones.has('ideation')) {
        setCompletedMilestones(prev => new Set([...prev, 'ideation']));
        setCurrentMilestone('ideation');
      } else if (currentState.startsWith('DELIVER') && !completedMilestones.has('journey')) {
        setCompletedMilestones(prev => new Set([...prev, 'journey']));
        setCurrentMilestone('journey');
      } else if (currentState.startsWith('PUBLISH') && !completedMilestones.has('deliverables')) {
        setCompletedMilestones(prev => new Set([...prev, 'deliverables']));
        setCurrentMilestone('deliverables');
      } else if (progress.current >= progress.total && !completedMilestones.has('complete')) {
        setCompletedMilestones(prev => new Set([...prev, 'complete']));
        setCurrentMilestone('complete');
      }
    };

    checkMilestones();
  }, [currentState, progress, completedMilestones]);

  useEffect(() => {
    if (currentMilestone) {
      const timer = setTimeout(() => { setCurrentMilestone(null); }, 4000);
      return () => { clearTimeout(timer); };
    }
    return undefined;
  }, [currentMilestone]);

  return { currentMilestone, completedMilestones };
}
