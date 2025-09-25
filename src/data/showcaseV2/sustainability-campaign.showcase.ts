import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
export const sustainability_campaignV2: ProjectShowcaseV2 = {
  id: 'sustainability-campaign',
  version: '2.0.0',
  hero: {
    title: "Campus Sustainability Initiative",
    tagline: '',
    gradeBand: 'HS',
    timeframe: '8–10 weeks',
    subjects: ["Environmental Science","Social Studies","Statistics","ELA","Digital Media","Mathematics"],
    image: "src/utils/hero/images/CampusSustainabilityInitiative.jpeg"
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