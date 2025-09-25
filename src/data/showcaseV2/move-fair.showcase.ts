import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import move_fairImage from '../../utils/hero/images/MoveFair.jpeg';
export const move_fairV2: ProjectShowcaseV2 = {
  id: 'move-fair',
  version: '2.0.0',
  hero: {
    title: "Move Fair: Rethinking Neighborhood Mobility",
    tagline: '',
    gradeBand: 'HS',
    timeframe: '8–10 weeks',
    subjects: ["Urban Studies","Geography","Data Science","Social Justice","Public Policy","Mathematics"],
    image: move_fairImage
  },
  microOverview: ['TODO', 'TODO', 'TODO'],
  fullOverview: '',
  schedule: { totalWeeks: 9, lessonsPerWeek: 3, lessonLengthMin: 55 },
  runOfShow: [],
  outcomes: { core: [], extras: [], audiences: [] },
  materialsPrep: { coreKit: [], noTechFallback: [], safetyEthics: [] },
  assignments: [],
  polish: undefined,
  planningNotes: ''
};