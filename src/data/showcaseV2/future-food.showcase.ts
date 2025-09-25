import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import future_foodImage from '../../utils/hero/images/FutureFoodLab.jpeg';
export const future_foodV2: ProjectShowcaseV2 = {
  id: 'future-food',
  version: '2.0.0',
  hero: {
    title: "Future of Food: Closed-Loop Cafeteria",
    tagline: '',
    gradeBand: 'HS',
    timeframe: '6–8 weeks',
    subjects: ["Environmental Science","Nutrition","Business","Systems Engineering","Data Science","Public Health"],
    image: future_foodImage
  },
  microOverview: ['TODO', 'TODO', 'TODO'],
  fullOverview: '',
  schedule: { totalWeeks: 7, lessonsPerWeek: 3, lessonLengthMin: 55 },
  runOfShow: [],
  outcomes: { core: [], extras: [], audiences: [] },
  materialsPrep: { coreKit: [], noTechFallback: [], safetyEthics: [] },
  assignments: [],
  polish: undefined,
  planningNotes: ''
};