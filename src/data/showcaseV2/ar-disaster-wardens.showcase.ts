import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import arDisasterImage from '../../utils/hero/images/ARDisasterWardens.jpeg';

export const ar_disaster_wardensV2: ProjectShowcaseV2 = {
  id: 'ar-disaster-wardens',
  version: '2.0.0',
  hero: {
    title: 'AR Disaster Wardens',
    tagline: 'Neighborhood safety overlays guide evacuation, supplies, and resilience—designed with local partners.',
    gradeBand: 'MS',
    timeframe: '4–6 weeks',
    subjects: ['Computer Science', 'Geography', 'Engineering', 'Civics'],
    image: arDisasterImage
  },
  microOverview: [
    'Students map neighborhood hazards and resources with partners and privacy in mind.',
    'They prototype AR overlays for routes, rally points, and supply caches.',
    'A live demo walk trains families on calm, safe evacuation choices.'
  ],
  fullOverview:
    'Learners act as resilience designers. With emergency managers or community leaders, they map local hazards and safe assets, then design an augmented reality (AR) interface that overlays evacuation routes, rally points, and supply locations. Students test usability and accessibility—including Americans with Disabilities Act (ADA) considerations for contrast, language, and icon clarity—embed privacy norms, and publish a family‑friendly guide. The final “Resilience Walk” shares the AR experience and collects feedback for city improvement.',
  schedule: { totalWeeks: 6, lessonsPerWeek: 3, lessonLengthMin: 60 },
  runOfShow: [
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'Investigate local hazards and assets to ground resilient evacuation design. Teachers host partner briefing sharing hazard realities and data gaps. Students catalog hazards and assets using partner stories and datasets.',
      teacher: [
        'Host partner briefing sharing hazard realities and data gaps',
        'Model annotating base maps with hazard and asset layers',
        'Facilitate privacy agreements that honor partner expectations'
      ],
      students: [
        'Catalog hazards and assets using partner stories and datasets',
        'Sketch preliminary evacuation concepts highlighting access needs',
        'Draft privacy guardrails for data capture with community approval'
      ],
      deliverables: ['Hazard and asset map', 'Team privacy pledge'],
      checkpoint: ['Partner reviews annotated map and privacy commitments'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Co-design AR storyboards and evacuation routes that prioritize equity and accessibility. Teachers model storyboard sequencing using accessibility heuristics. Students draft AR overlays that spotlight high-risk blocks.',
      teacher: [
        'Model storyboard sequencing using accessibility heuristics',
        'Review ADA iconography with assistive tech partners',
        'Approve evacuation routes aligned to community risk tiers'
      ],
      students: [
        'Draft AR overlays that spotlight high-risk blocks',
        'Check contrast ratios and translations with partner checklists',
        'Finalize evacuation route set with inclusive access notes'
      ],
      deliverables: ['Equity-checked AR storyboard', 'Approved evacuation route list'],
      checkpoint: ['Teacher validates storyboard against ADA and equity criteria'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Week 3',
      kind: 'Build',
      focus: 'Prototype AR overlays and validate readability with diverse users. Teachers provide contrast guidelines tailored to outdoor environments. Students build AR overlay prototypes with layered hazard data.',
      teacher: [
        'Provide contrast guidelines tailored to outdoor environments',
        'Coach icon refinement using user feedback heuristics',
        'Set usability test scripts for mixed-age participants'
      ],
      students: [
        'Build AR overlay prototypes with layered hazard data',
        'Run readability tests with multilingual community reviewers',
        'Revise text, icons, and audio cues based on findings'
      ],
      deliverables: ['Overlay prototype v1', 'Usability findings log'],
      checkpoint: ['Readability thresholds met across priority user groups'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Week 4',
      kind: 'Build',
      focus: 'Conduct full route rehearsals and prioritize fixes from field feedback. Teachers verify permissions and safety plans before rehearsals. Students walk evacuation routes while piloting AR overlays live.',
      teacher: [
        'Verify permissions and safety plans before rehearsals',
        'Assign safety marshals monitoring hydration and mobility needs',
        'Observe tests capturing qualitative friction moments'
      ],
      students: [
        'Walk evacuation routes while piloting AR overlays live',
        'Log friction points with timestamps and user quotes',
        'Fix highest-impact usability and safety issues quickly'
      ],
      deliverables: ['Route rehearsal log', 'Overlay revision backlog'],
      checkpoint: ['Partners sign demo readiness after rehearsals'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Exhibit',
      focus: 'Host Resilience Walk showcasing AR guidance and activating family preparedness. Teachers invite families, emergency teams, and translators to event. Students guide visitors through routes highlighting safety choices.',
      teacher: [
        'Invite families, emergency teams, and translators to event',
        'Brief student safety marshals on incident protocols',
        'Collect feedback surveys and quick interviews systematically'
      ],
      students: [
        'Guide visitors through routes highlighting safety choices',
        'Explain evacuation decisions using data and partner stories',
        'Gather feedback to strengthen guide clarity and coverage'
      ],
      deliverables: ['Event run-of-show plan', 'Feedback dataset and summary'],
      checkpoint: ['Incident-free walk confirmed with partner debrief'],
      assignments: ['A4']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Extension',
      focus: 'Publish multilingual guides and formalize long-term partner handoff. Teachers review language access and translation accuracy before release. Students publish family guide with clear safety instructions.',
      teacher: [
        'Review language access and translation accuracy before release',
        'Arrange follow-up calibration meetings with emergency partners',
        'Schedule maintenance plan review across school leadership'
      ],
      students: [
        'Publish family guide with clear safety instructions',
        'Propose update roadmap for overlays and training cycles',
        'Send thank-you notes documenting commitments and timelines'
      ],
      deliverables: ['Family readiness guide', 'Partner handoff memo'],
      checkpoint: ['Translations complete and distribution plan approved']
    }
  ],
  outcomes: {
    core: [
      'Analyze neighborhood hazards and assets with community partners',
      'Prototype ADA-compliant AR overlays that guide safe evacuation choices',
      'Design resilience walks and publish a privacy-respecting family guide'
    ],
    extras: ['Run translation support', 'Create ADA icon pack', 'Launch family training session', 'Propose city feedback ticket'],
    audiences: ['Emergency managers', 'Neighborhood groups', 'Families', 'School leadership']
  },
  materialsPrep: {
    coreKit: ['Phones/tablets', 'Printed base maps', 'High‑vis vests', 'Wayfinding signs', 'Survey forms'],
    noTechFallback: ['Paper arrows and posters', 'Laminated ADA cards', 'Manual route maps'],
  },
  assignments: [
    {
      id: 'A1',
      title: 'Hazard/Asset Map + Privacy Pledge',
      summary: 'Teams map hazards and assets with partners to build privacy-ready evacuation groundwork. Students collect hazard and asset data from partners and public sources. Teachers provide layered base maps and vetted data sources.',
      studentDirections: [
        'Collect hazard and asset data from partners and public sources',
        'Annotate base maps with accuracy notes and citations',
        'Draft privacy pledge honoring community expectations',
        'Share annotated map for partner feedback session',
        'List unanswered questions to research before storyboard work'
      ],
      teacherSetup: [
        'Provide layered base maps and vetted data sources',
        'Guide privacy pledge writing using community agreements',
        'Review maps for bias and missing protective assets'
      ],
      evidence: ['Annotated hazard and asset map', 'Signed privacy pledge'],
      successCriteria: ['I map hazards and assets with verifiable data', 'I commit to privacy norms partners approve', 'I name gaps we must address respectfully'],
      aiOptional: {
        toolUse: 'Summarize public hazard data for context',
        critique: 'Verify AI summaries cite reliable agencies',
        noAIAlt: 'Use emergency manager fact sheets'
      }
    },
    {
      id: 'A2',
      title: 'AR Storyboard + Equity Check',
      summary: 'Teams design equity-centered AR storyboards and validate accessibility choices with partners. Students sketch AR screen flow that mirrors evacuation sequence. Teachers share storyboard templates and evacuation exemplars.',
      studentDirections: [
        'Sketch AR screen flow that mirrors evacuation sequence',
        'Add icons and text meeting ADA readability standards',
        'Check translations and contrast with partner checklists',
        'Revise overlays based on partner usability feedback',
        'Submit storyboard packet for approval before prototyping'
      ],
      teacherSetup: [
        'Share storyboard templates and evacuation exemplars',
        'Provide ADA and translation guides for quick reference',
        'Review storyboards alongside accessibility specialist partners'
      ],
      evidence: ['Partner-validated AR storyboard set'],
      successCriteria: ['I create overlays everyone can read easily', 'I incorporate ADA and language access supports', 'I revise designs based on feedback and data'],
      aiOptional: {
        toolUse: 'Suggest color/contrast combinations meeting WCAG',
        critique: 'Ensure suggestions meet partner accessibility checklist',
        noAIAlt: 'Use printed contrast cards and peer read test'
      }
    },
    {
      id: 'A3',
      title: 'Route Mock + Fix List',
      summary: 'Students rehearse evacuation routes, document friction, and prioritize fixes for overlays. Students walk assigned routes while piloting overlays with families. Teachers assign safety marshals and observers to each rehearsal team.',
      studentDirections: [
        'Walk assigned routes while piloting overlays with families',
        'Capture timing, access barriers, and comfort observations',
        'Capture user quotes describing friction points and needs',
        'Prioritize fixes using impact versus effort matrix',
        'Update overlays and route notes before final event'
      ],
      teacherSetup: [
        'Assign safety marshals and observers to each rehearsal team',
        'Set detailed testing scripts and contingency plans',
        'Confirm rehearsal timing with partner agencies'
      ],
      evidence: ['Route rehearsal log', 'Prioritized fix list'],
      successCriteria: ['I observe routes safely and empathetically', 'I document friction points with clear evidence', 'I implement fixes that improve access and safety'],
      aiOptional: {
        toolUse: 'Cluster logged issues into themes',
        critique: 'Verify clusters match actual observations',
        noAIAlt: 'Use sticky note affinity mapping'
      }
    },
    {
      id: 'A4',
      title: 'Resilience Walk + Guide Draft',
      summary: 'Teams run the Resilience Walk, synthesize feedback, and complete the family guide. Students guide families along evacuation routes using AR overlays. Teachers invite partners and manage safety briefing logistics.',
      studentDirections: [
        'Guide families along evacuation routes using AR overlays',
        'Collect surveys or voice notes with consent reminders',
        'Synthesize feedback into actionable guide improvements',
        'Finalize translations, icons, and distribution checklist',
        'Send thank-you notes outlining follow-up commitments'
      ],
      teacherSetup: [
        'Invite partners and manage safety briefing logistics',
        'Coordinate translation headsets and interpreters',
        'Secure survey data storage per privacy agreements'
      ],
      evidence: ['Post-walk feedback dataset', 'Family guide v1.1'],
      successCriteria: ['I host resilience walks safely and calmly', 'I synthesize feedback into actionable tips', 'I publish a guide families can follow confidently'],
      aiOptional: {
        toolUse: 'Summarize survey responses into guide tips',
        critique: 'Check AI summary maintains privacy and accuracy',
        noAIAlt: 'Use tally sheets and partner debrief'
      }
    }
  ],
};
