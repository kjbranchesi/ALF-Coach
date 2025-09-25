import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import assistive_techImage from '../../utils/hero/images/AccessAbilityTech.jpeg';
export const assistive_techV2: ProjectShowcaseV2 = {
  id: 'assistive-tech',
  version: '2.0.0',
  hero: {
    title: "Everyday Innovations: Designing Tools for Dignity",
    tagline: '',
    gradeBand: 'HS',
    timeframe: '6–8 weeks',
    subjects: ["Engineering","Technology","Health Sciences","Mathematics","Social Studies","Art & Design"],
    image: assistive_techImage
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