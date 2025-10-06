import React, { useMemo } from 'react';
import type { AssignmentCard as AssignmentCardType, WeekCard } from '../../../types/showcaseV2';
import AssignmentCard from './AssignmentCard';
import { buildAssignmentWeekMap, getWeeksForAssignment } from '../utils/weekAssignmentMap';

interface AssignmentPanelProps {
  assignments: AssignmentCardType[];
  runOfShow: WeekCard[];
}

export default function AssignmentPanel({ assignments, runOfShow }: AssignmentPanelProps) {
  const assignmentWeekMap = useMemo(() => buildAssignmentWeekMap(runOfShow), [runOfShow]);

  if (!assignments || assignments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {assignments.map(assignment => (
        <AssignmentCard
          key={assignment.id}
          assignment={assignment}
          weeksUsedIn={getWeeksForAssignment(assignment.id, assignmentWeekMap)}
        />
      ))}
    </div>
  );
}
