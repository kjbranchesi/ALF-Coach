import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import bioSymphonyImage from '../../utils/hero/images/Bio-SymphonySkylines.jpeg';

export const bio_symphony_skylinesV2: ProjectShowcaseV2 = {
  id: 'bio-symphony-skylines',
  version: '2.0.0',
  hero: {
    title: 'Bio‑Symphony Skylines',
    tagline: 'Students turn biodiversity and city sounds into living music that reveals urban ecosystem health.',
    gradeBand: 'MS',
    timeframe: '4–6 weeks',
    subjects: ['Biology', 'Data Science', 'Music & Sound', 'Environmental Science', 'Technology'],
    image: bioSymphonyImage
  },
  microOverview: [
    'Teams soundwalk local blocks, logging species calls, noise sources, and habitat cues.',
    'They analyze patterns and compose soundscapes where data drives melody, tempo, and texture.',
    'The class hosts a “Listening Gallery” for neighbors with insights and action prompts.'
  ],
  fullOverview:
    'Students investigate how biodiversity and human noise intermix in their city. After learning to identify common species calls and noise sources, teams run repeatable soundwalks, capture short clips, and tally observations on a simple rubric. Using spreadsheets or notebooks, they convert counts and trends into musical parameters—pitch for species richness, rhythm for call frequency, volume for noise intensity—composing data‑driven scores. At a public Listening Gallery, students present their sonifications beside evidence dashboards and co‑design ideas for quieter, more hospitable micro‑habitats.',
  schedule: { totalWeeks: 6, lessonsPerWeek: 3, lessonLengthMin: 60 },
  runOfShow: [
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'Explore how soundscapes reflect urban ecology and wellbeing to frame advocacy. Invite questions like "Which sounds signal a thriving habitat and which warn of stress?" Teachers model soundwalk protocol with safety, consent, and hydration cues. Students conduct quiet listening sessions logging baseline soundscape notes.',
      teacher: [
        'Model soundwalk protocol with safety, consent, and hydration cues',
        'Teach species and noise identification using local recordings',
        'Facilitate discussion linking sound equity to community wellbeing',
        'Share consent signage placement guidelines for each route',
        'Assign safety leaders and review escalation protocol'
      ],
      students: [
        'Conduct quiet listening sessions logging baseline soundscape notes',
        'Test tally sheets for species calls and noise sources',
        'Analyze equity impacts from observations with partner prompts',
        'Post consent signage at entry points with partner approval',
        'Nominate safety leaders and document responsibilities clearly'
      ],
      deliverables: ['Soundwalk checklist', 'Species/noise ID mini‑poster', 'Consent signage draft'],
      checkpoint: ['Teams recite safety and consent rules', 'Safety leaders identified'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Plan routes, timing, and data schema for repeatable soundwalk datasets. Ask, "Who hears these soundscapes today and who is left out?" to anchor design choices. Teachers share map tiles highlighting habitat assets and safety considerations. Students map two routes noting habitat features and gathering points.',
      teacher: [
        'Share map tiles highlighting habitat assets and safety considerations',
        'Approve team routes with partner timing and consent windows',
        'Set audio guidelines covering volume limits and clip length',
        'Schedule partner check-ins for coordination and feedback',
        'Publish duty roster clarifying roles and backup coverage'
      ],
      students: [
        'Map two routes noting habitat features and gathering points',
        'Draft data schema tying counts to species and noise metrics',
        'Confirm team roles and document responsibilities clearly',
        'Send partner notice summarizing purpose, timing, and supports',
        'Finalize duty roster and share with guardian contacts'
      ],
      deliverables: ['Route maps', 'Field data template', 'Partner notice email'],
      checkpoint: ['Teacher signs route safety plan', 'Partner confirms windows'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Week 3',
      kind: 'FieldworkLoop',
      focus: 'Collect clips and tallies while maintaining data quality, safety, and consent. Keep checking, "Would our partners trust these recordings if they stood beside us right now?" Teachers shadow first outing to validate protocol and safety. Students capture short clips following consent signage and privacy rules.',
      teacher: [
        'Shadow first outing to validate protocol and safety',
        'Check data uploads for labeling accuracy and completeness',
        'Coach teams on hydration, de-escalation, and equipment care',
        'Review file naming conventions before uploads',
        'Confirm hydration breaks and guardian check-ins'
      ],
      students: [
        'Capture short clips following consent signage and privacy rules',
        'Tally species calls and noise sources consistently',
        'Label files clearly and sync metadata daily',
        'Upload daily dataset with context notes for partners',
        'Hydrate per schedule and log safety check-ins'
      ],
      deliverables: ['Audio clip set', 'Cleaned tally sheet', 'Labeled file index'],
      checkpoint: ['Teacher validates first dataset'],
      repeatable: true
    },
    {
      weekLabel: 'Week 4',
      kind: 'Build',
      focus: 'Translate data into musical rules and compose first soundscape drafts. Use prompts like "What should listeners feel the moment biodiversity drops out of the track?" Teachers share mapping examples linking data patterns to musical elements. Students draft mapping rules connecting counts to tempo, pitch, and dynamics.',
      teacher: [
        'Share mapping examples linking data patterns to musical elements',
        'Coach rule choices with evidence and accessibility in mind',
        'Facilitate critique sessions centered on evidence and clarity',
        'Check citation style for data sources used in compositions'
      ],
      students: [
        'Draft mapping rules connecting counts to tempo, pitch, and dynamics',
        'Compose short loops that demonstrate data-driven decisions',
        'Explain rule evidence and cite data sources in notes',
        'Iterate based on peer critique and teacher feedback',
        'Maintain citation tracker for all data and sounds used'
      ],
      deliverables: ['Music mapping table', 'Loop audio draft'],
      checkpoint: ['Rule mapping justifies evidence'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Exhibit',
      focus: 'Curate the Listening Gallery highlighting insights and concrete action prompts. Challenge teams with "What commitment do we want visitors to make before they leave?" Teachers invite partners and coordinate accessibility supports for gallery. Students refine soundscape scores with clear evidence labels.',
      teacher: [
        'Invite partners and coordinate accessibility supports for gallery',
        'Finalize exhibit curation ensuring flow and sensory access',
        'Facilitate visitor feedback forms and docent briefings',
        'Brief student docents on welcoming scripts and safety',
        'Coordinate accessibility services and translation as needed'
      ],
      students: [
        'Refine soundscape scores with clear evidence labels',
        'Design gallery signage communicating insights and action asks',
        'Host visitor dialogues collecting pledges and reflections',
        'Collect feedback data using agreed prompts and forms',
        'Record accessibility notes to improve future galleries'
      ],
      deliverables: ['Listening Gallery plan', 'Visitor feedback log', 'Partner pledge sheet'],
      checkpoint: ['Partners schedule next‑step chat', 'Pledges logged'],
      assignments: ['A4']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Extension',
      focus: 'Prototype quiet corner interventions and evaluate impact for community partners. Ground pilots in "How will we know this change is working when we return?" Teachers coordinate small pilots with facilities and custodial teams. Students install micro-habitats or signage following safety approvals.',
      teacher: [
        'Coordinate small pilots with facilities and custodial teams',
        'Review risk, consent, and maintenance plans for interventions',
        'Coach impact write-ups connecting data to proposed changes',
        'Coordinate custodial support for ongoing upkeep',
        'Confirm maintenance owner and follow-up schedule'
      ],
      students: [
        'Install micro-habitats or signage following safety approvals',
        'Measure before-and-after data to assess impact',
        'Publish mini brief summarizing outcomes and next steps',
        'Share actions with families, PTA, and partners',
        'Assign maintenance owner and document responsibilities'
      ],
      deliverables: ['Pilot spec sheet', 'Before/after data card', 'PTA share deck'],
      checkpoint: ['Teacher verifies safe install', 'Custodial sign‑off recorded'],
      assignments: ['A5']
    }
  ],
  outcomes: {
    core: ['Curate a neighborhood soundscape portfolio with evidence notes'],
    extras: [
      'Prototype “quiet corners” micro‑habitats',
      'Create bilingual listening maps',
      'Pitch bell‑less periods near nests',
      'Contribute observations to citizen science'
    ],
    audiences: ['City parks or planning office', 'Local library', 'Community board', 'Environmental NGOs']
  },
  materialsPrep: {
    coreKit: [
      'Clip‑on phone mics or handheld recorders',
      'Analog decibel meter or app',
      'Headphones and splitters',
      'Printed maps + clipboards',
      'Laptops/tablets with DAW or browser synths'
    ],
    noTechFallback: ['Paper tally sheets', 'Analogue rhythm cards', 'Printed spectrogram examples'],
  },
  assignments: [
    {
      id: 'A1',
      title: 'Soundwalk 101 + ID Mini‑Poster',
      summary: 'Launch the work by practicing intentional listening and respectful presence in the neighborhood. Students walk silent routes, document detailed sound observations, and translate their notes into a mini-poster that spotlights equity impacts. Teachers set safety and consent expectations so partners trust the team before official data collection begins.',
      studentDirections: [
        'Walk in silence following safety zones and hydration cues',
        'Mark sound sources on map with consistent symbols',
        'Log three detailed observations including context notes',
        'Sketch one call shape and label species or noise type',
        'Share one equity insight connecting sound to community experience'
      ],
      teacherSetup: [
        'Define safety zone and consent expectations for soundwalks',
        'Model tally routine using exemplar clips',
        'Provide ID cards and vocabulary supports'
      ],
      evidence: ['Completed tally map', 'Mini-poster of one species'],
      successCriteria: ['I listen safely with focus', 'I log observations clearly', 'I explain equity impacts thoughtfully'],
      checkpoint: 'Poster reviewed before fieldwork'
    },
    {
      id: 'A2',
      title: 'Route + Data Schema',
      summary: 'Route planning becomes the moment students prove they can gather data ethically and consistently. Teams map contrasting habitats, define variables that will matter in their compositions, and coordinate notifications with community partners. Teachers supply historical layers, review ethics language, and make sure every role and schedule detail is locked before launch.',
      studentDirections: [
        'Pick two routes highlighting habitat assets and safety notes',
        'Set timing windows aligned with partner and daylight needs',
        'Select variables describing species, noise, and context factors',
        'Assign roles and document responsibilities for each walk',
        'Draft ethics line covering consent signage and privacy'
      ],
      teacherSetup: [
        'Share map layers and historical sound data',
        'Approve variables and ethics commitments',
        'Confirm partner availability and neighborhood notifications'
      ],
      evidence: ['Route map', 'Data schema table'],
      successCriteria: ['I choose safe, representative routes', 'I define variables with purpose', 'I share roles transparently'],
      checkpoint: 'Teacher signs field plan',
      aiOptional: { toolUse: 'Summarize route risks', critique: 'Check site bias', noAIAlt: 'Peer review routes' }
    },
    {
      id: 'A3',
      title: 'Data→Music Mapping',
      summary: 'The data-to-music studio shows how evidence can reshape creative choices. Students scrub tallies, draft mapping rules, and produce loop drafts that make ecological patterns audible to any visitor. Teachers provide tool templates, critique routines, and citation checks so every sonic decision stays transparent.',
      studentDirections: [
        'Clean tally data to remove duplicates and anomalies',
        'Pick three musical parameters representing key data patterns',
        'Set mapping rules that connect evidence to sound choices',
        'Test quick loop demonstrating mapping decisions',
        'Note one ecological insight in composition journal',
        'Cite data sources supporting musical choices'
      ],
      teacherSetup: [
        'Provide sample DAW or browser synth templates',
        'Share mapping examples from prior projects',
        'Coach testing cycles and peer feedback protocols',
        'Check citation format and completeness'
      ],
      evidence: ['Mapping table', 'Audio loop draft'],
      successCriteria: ['I justify mappings with evidence', 'I iterate quickly on loops', 'I cite data accurately'],
      aiOptional: { toolUse: 'Suggest mapping variants', critique: 'Flag overfitting risks', noAIAlt: 'Peer critique circle' }
    },
    {
      id: 'A4',
      title: 'Listening Gallery',
      summary: 'Gallery prep turns raw analysis into an activation experience. Students choose contrasting clips, craft labels and action asks, and rehearse scripts that honor visitor perspectives. Teachers coordinate accessibility supports, invite partners, and structure feedback so pledges lead to next steps.',
      studentDirections: [
        'Select best clips that represent contrasting soundscapes',
        'Label stations with evidence and mapping explanations',
        'Craft action ask inviting visitors to support change',
        'Host visitors using welcoming scripts and listening prompts',
        'Gather feedback and pledges using agreed tools'
      ],
      teacherSetup: [
        'Invite partners and families with clear accessibility info',
        'Set gallery stations and technology needs',
        'Print labels, prompts, and pledge cards'
      ],
      evidence: ['Gallery label set', 'Visitor feedback log'],
      successCriteria: ['I explain methods accessibly', 'I propose actionable next steps', 'I respond to feedback respectfully'],
    },
    {
      id: 'A5',
      title: 'Quiet Corner Pilot',
      summary: 'Close the arc by piloting quiet corners that respond to what the data revealed. Students co-design interventions with partners, install them safely, and measure impact before sharing briefs that propose long-term stewardship. Teachers vet risk plans, logistics, and measurement templates so changes stick beyond the showcase.',
      studentDirections: [
        'Design pilot intervention aligned with partner priorities',
        'Install safely with protective gear and permission checks',
        'Collect before-and-after sound and observation data',
        'Write mini brief summarizing impact and recommendations',
        'Share findings and next steps with partners'
      ],
      teacherSetup: [
        'Review consent and risk mitigation plans',
        'Approve installation logistics and materials',
        'Provide data template for impact tracking'
      ],
      evidence: ['Pilot spec sheet', 'Impact mini brief'],
      successCriteria: ['I design interventions responsibly', 'I measure change with evidence', 'I propose sustainable next steps'],
      aiOptional: { toolUse: 'Summarize visitor feedback', critique: 'Check causal claims', noAIAlt: 'Peer code review' }
    }
  ],
};
