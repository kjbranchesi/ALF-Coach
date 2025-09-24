import type { ShowcaseProject } from '../../types/showcase';

export const invasiveVegetation: ShowcaseProject = {
  meta: {
    id: 'invasive-vegetation',
    title: 'Invasive Vegetation Rapid Response',
    tagline: 'Students map invasive species and design a community action sprint.',
    subjects: ['Science', 'Geography', 'STEM Lab'],
    gradeBands: ['6-8'],
    duration: '6–8 weeks',
    tags: ['field science', 'ecosystems', 'community action'],
  },
  microOverview: {
    microOverview:
      'Students become rapid-response ecologists. They investigate how invasive plants crowd out natives, collect field data, and brief local partners with maps and action options. Teams rotate through survey, analysis, and communication roles to keep momentum across the sprint.',
  },
  quickSpark: {
    hooks: [
      'Which species are quietly taking over our campus or neighborhood?',
      'Why do invasive plants win, and what would it take to push back?',
      'Who in town cares about restoring native habitat right now?'
    ],
    miniActivity: {
      do: [
        'Walk a 5-minute transect and photograph every plant you suspect is invasive.',
        'Compare photos to a laminated field ID card and tally the likely invaders.',
        'Drop waypoints on a shared map and add quick habitat notes.',
        'Draft a one-sentence “why it matters” caption for one hotspot.'
      ],
      share: ['Pin findings to a shared map; note confidence level and questions'],
      reflect: ['How confident are we? What help do we need to confirm IDs?'],
      materials: ['Phones/tablets or clipboards', 'Local invasive ID guide'],
      timeWindow: '1–2 lessons',
      differentiationHint: 'Choose to scout, log data, or synthesize hotspots.',
      aiTip: 'Ask AI to summarize one invasive species’ impact in 3 kid-friendly sentences; fact-check with local resources.',
    },
  },
  outcomeMenu: {
    core: 'Restoration Brief (map + priority actions)',
    choices: ['Story Map update', 'Native replanting mini-plan', 'School announcement script', 'Volunteer recruitment toolkit'],
    audiences: ['Parks department', 'School facilities team', 'Neighborhood association'],
  },
  assignments: [
    {
      id: 'A1',
      title: 'Field Recon & Species ID Jam',
      when: 'Week 1',
      studentDirections: [
        'Pair up to survey two transects and capture geotagged evidence.',
        'Log each suspect species in the shared sheet; flag confidence level.',
        'Upload two clear photos per species and add habitat notes.',
        'Summarize one hotspot with a 2-sentence “why it matters” caption.'
      ],
      teacherSetup: [
        'Pre-select safe transects and print field ID cards.',
        'Share data capture template (sheet or app) and mapping tool.',
        'Model how to take clear plant photos and note context.',
        'Establish gear checkout (clipboards, tape measures, gloves).'
      ],
      evidence: ['Shared spreadsheet entries', 'Geotagged photos', 'Hotspot caption draft'],
      successCriteria: ['Accurate location data', 'Clear photos', 'Caption ties to local impact'],
      checkpoint: 'Teacher reviews 3–4 entries per team; schedule follow-up questions with local expert.',
      aiOptional: 'Ask AI to suggest three clarifying questions for a park steward interview.',
    },
  ],
  communityJustice: {
    guidingQuestion: 'Who is most impacted when invasive plants replace native habitat here?',
    stakeholders: ['City parks team', 'Local gardeners', 'Pollinator advocates', 'Students and families'],
    ethicsNotes: ['Gain permission before removing any plants', 'Share raw data with partners for review', 'Respect private property boundaries during scouting'],
  },
  polishFlags: {
    standardsAvailable: false,
    rubricAvailable: false,
    feasibilityAvailable: false,
  },
};
