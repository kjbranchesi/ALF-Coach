import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import playable_cityImage from '../../utils/hero/images/PlayableCity.jpg';
export const playable_cityV2: ProjectShowcaseV2 = {
  id: 'playable-city',
  version: '2.0.0',
  hero: {
    title: "Playable City: Designing Joy in Public Space",
    tagline: '',
    gradeBand: 'HS',
    timeframe: '6–8 weeks',
    subjects: ["Game Design","Urban Planning","Art & Design","Computer Science","Psychology","Architecture"],
    image: playable_cityImage
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