import type { ShowcaseProject } from '../../types/showcase';

export const urbanHeat: ShowcaseProject = {
  meta: {
    id: 'urban-heat',
    title: 'Urban Heat Island Lab',
    tagline: 'Students map neighborhood heat zones and pitch cooling interventions.',
    subjects: ['Science', 'Math', 'Civics'],
    gradeBands: ['6-8'],
    duration: '5–7 weeks',
    tags: ['climate', 'data storytelling', 'community design'],
  },
  microOverview: {
    microOverview:
      'Students act as community climate analysts. They gather temperature data across microclimates, analyze patterns, and co-design quick-win and long-term cooling ideas for local stakeholders. Teams rotate across data collection, analysis, and storytelling roles.',
  },
  quickSpark: {
    hooks: [
      'Where does it feel five degrees hotter on campus—and why?',
      'Who is most impacted when the heat sticks around after sunset?',
      'What would a cooler block look, feel, and sound like?'
    ],
    miniActivity: {
      do: [
        'Test three campus locations with handheld thermometers in sun/shade.',
        'Log temps plus surface type (asphalt, grass, metal, etc.).',
        'Sketch a quick map with heat “hot spot” notes.',
        'Brainstorm one fast idea to cool a hot location.'
      ],
      share: ['Post data to a shared map; color code hottest/coolest spots'],
      reflect: ['Who might rely on this spot? What happens as temps rise?'],
      materials: ['Infrared or standard thermometers', 'Clipboards/Tablets', 'Base map printout'],
      timeWindow: '1 lesson',
      differentiationHint: 'Choose roles: data collector, mapper, or storyteller.',
      aiTip: 'Ask AI to list three tree species suited for our USDA zone; verify with local extension office.',
    },
  },
  outcomeMenu: {
    core: 'Cooling Action Brief (map + recommendations)',
    choices: ['Heat equity story map', 'Family cooling guide', 'Quick shade prototype', 'City council lightning talk'],
    audiences: ['City sustainability office', 'Neighborhood council', 'Parent-teacher group'],
  },
  assignments: [
    {
      id: 'A1',
      title: 'Baseline Heat Mapping Sprint',
      when: 'Week 1',
      studentDirections: [
        'Collect temperature readings at four assigned locations (morning + afternoon).',
        'Record surface type, shade coverage, and human activity notes.',
        'Upload photos and readings to the shared dashboard.',
        'Highlight one location that needs immediate cooling attention.'
      ],
      teacherSetup: [
        'Coordinate thermometer checkout and calibration.',
        'Assign balanced routes with sun/shade variety.',
        'Model safe data collection (hydration, buddy system).',
        'Prepare data dashboard template and base map.'
      ],
      evidence: ['Temperature dataset entries', 'Geo-tagged photos', 'Hotspot highlight note'],
      successCriteria: ['Accurate readings', 'Complete contextual notes', 'Clear priority rationale'],
      checkpoint: 'Teacher reviews one route per group; connect class with city resilience lead for feedback.',
      aiOptional: 'Ask AI for three reflective questions about heat equity to discuss with stakeholders.',
    },
  ],
  communityJustice: {
    guidingQuestion: 'Whose routines are most disrupted by urban heat islands in our community?',
    stakeholders: ['City resilience office', 'Transit riders', 'Outdoor workers', 'Students and families'],
    ethicsNotes: ['Gain consent before photographing people', 'Respect private property boundaries', 'Share raw data openly with partners'],
  },
  polishFlags: {
    standardsAvailable: false,
    rubricAvailable: false,
    feasibilityAvailable: false,
  },
};
