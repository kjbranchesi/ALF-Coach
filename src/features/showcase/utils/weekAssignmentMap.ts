import type { WeekCard } from '../../../types/showcaseV2';

export const buildAssignmentWeekMap = (weeks: WeekCard[]): Record<string, string[]> => {
  const map: Record<string, string[]> = {};

  weeks.forEach((week) => {
    if (!week.assignments || week.assignments.length === 0) {
      return;
    }

    week.assignments.forEach((assignmentId) => {
      if (!map[assignmentId]) {
        map[assignmentId] = [];
      }
      map[assignmentId].push(week.weekLabel);
    });
  });

  return map;
};

export const getWeeksForAssignment = (assignmentId: string, weekMap: Record<string, string[]>): string[] => {
  return weekMap[assignmentId] ?? [];
};
