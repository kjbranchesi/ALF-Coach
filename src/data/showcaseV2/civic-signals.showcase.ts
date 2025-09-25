import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import civic_signalsImage from '../../utils/hero/images/CivicSignals.jpeg';
export const civic_signalsV2: ProjectShowcaseV2 = {
  id: 'civic-signals',
  version: '2.0.0',
  hero: {
    title: "Civic Signals: AI Listening for Community Needs",
    tagline: '',
    gradeBand: 'HS',
    timeframe: '8–10 weeks',
    subjects: ["Computer Science","Data Science","Civics","Statistics","Social Studies","Ethics"],
    image: civic_signalsImage
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