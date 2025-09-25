import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import accessability_aiImage from '../../utils/hero/images/AIAccessibilityAssistant.jpg';
export const accessability_aiV2: ProjectShowcaseV2 = {
  id: 'accessability-ai',
  version: '2.0.0',
  hero: {
    title: "AccessAbility AI: Captions, Alt-Text, and Simplified Reading",
    tagline: '',
    gradeBand: 'HS',
    timeframe: '6–8 weeks',
    subjects: ["Special Education","English Language Arts","Computer Science","Digital Media","Accessibility Studies","Ethics"],
    image: accessability_aiImage
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