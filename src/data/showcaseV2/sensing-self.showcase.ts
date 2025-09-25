import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import sensing_selfImage from '../../utils/hero/images/SensingSelf.jpeg';
export const sensing_selfV2: ProjectShowcaseV2 = {
  id: 'sensing-self',
  version: '2.0.0',
  hero: {
    title: "Sensing Self: Wearables for Well-Being",
    tagline: '',
    gradeBand: 'HS',
    timeframe: '6–8 weeks',
    subjects: ["STEM","Health Sciences","Computer Science","Psychology","Data Science","Engineering"],
    image: sensing_selfImage
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