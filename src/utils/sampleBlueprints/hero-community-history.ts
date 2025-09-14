/**
 * Hero Project: Living History - Preserving Community Stories
 * A comprehensive oral history and digital archiving project for middle school
 */

import { SampleBlueprint, ts } from './types';

export function buildCommunityHistoryHero(userId: string): SampleBlueprint {
  const id = 'hero-community-history';

  const wizardData = {
    projectTopic: 'Living History: Preserving Community Stories',
    learningGoals: 'Oral history methods, narrative craft, research ethics, archival practice, media production, community engagement, critical listening, cultural competence',
    entryPoint: 'authentic_problem',
    subjects: ['social-studies', 'language-arts', 'technology', 'arts'],
    primarySubject: 'social-studies',
    gradeLevel: 'middle',
    duration: 'long',
    materials: 'Audio recorders/mics or smartphones, headphones, transcription tools, consent forms, cameras, computers, editing software, cloud drive',
    subject: 'Social Studies, ELA, Digital Media, Arts',
    location: 'classroom; community centers; library; homes',
    featured: true,
    heroProject: true,
    communityPartners: ['Local historical society', 'Public library', 'Senior center', 'Community media', 'Local newspaper']
  };

  const ideation = {
    bigIdea: 'Communities are shaped by the stories we preserve and share; ethical documentation honors identity, fosters belonging, and informs collective memory.',
    essentialQuestion: 'How might we document and preserve community stories so they remain accessible, accurate, and meaningful over time?',
    challenge: 'Conduct oral histories with community members, curate and publish a digital archive with transcripts and media, and host a public exhibit to share and celebrate local history.',
    studentVoice: {
      drivingQuestions: [
        'Whose stories are missing from our community\'s official history?',
        'How do we want to capture and share these stories respectfully?',
        'What format will make these stories most accessible to different audiences?',
        'How can we ensure these stories are preserved for future generations?',
        'What impact do we want our archive to have on the community?'
      ],
      choicePoints: [
        'Theme selection (immigration stories, local businesses, civil rights, traditions, etc.)',
        'Interview participants and community segments to focus on',
        'Media formats (audio, video, photo essays, written narratives)',
        'Archive platform and organization structure',
        'Public presentation format (exhibit, podcast, website, performance)'
      ]
    }
  };

  const journey = {
    phases: [
      {
        id: 'phase-1',
        name: 'Discover',
        description: 'Learn oral history methods and ethical practices',
        goal: 'Master interviewing techniques, understand ethical documentation, and explore existing oral history projects',
        keyQuestion: 'What makes oral history powerful and how do we do it responsibly?',
        activities: [
          'Study exemplar oral history projects (StoryCorps, local archives)',
          'Practice active listening exercises and interview techniques',
          'Analyze sample interviews for narrative structure',
          'Learn consent procedures and ethical guidelines',
          'Equipment training and technical skill-building',
          'Explore themes in local history through preliminary research'
        ],
        studentChoice: 'Students choose practice interview subjects and topics to explore',
        output: 'Methods brief with practice transcript and reflection',
        duration: '1-2 weeks',
        formativeAssessment: 'Protocol workshop, consent/ethics checklist, practice interview peer review'
      },
      {
        id: 'phase-2',
        name: 'Define',
        description: 'Plan interviews and select participants',
        goal: 'Identify story themes, select diverse participants, and prepare comprehensive interview plans',
        keyQuestion: 'Whose stories will we preserve and what do we want to learn?',
        activities: [
          'Map community demographics and identify underrepresented voices',
          'Research historical context for chosen themes',
          'Develop interview protocols and question banks',
          'Create participant outreach materials',
          'Schedule interviews and coordinate logistics',
          'Prepare consent forms and release documents'
        ],
        studentChoice: 'Teams select their focus theme and choose participants to interview',
        output: 'Interview plan with participant list, question bank, and consent packets',
        duration: '1-2 weeks',
        formativeAssessment: 'Plan review by community partner, pilot interview feedback, logistics checklist'
      },
      {
        id: 'phase-3',
        name: 'Develop',
        description: 'Conduct interviews and create archive materials',
        goal: 'Record high-quality interviews, create accurate transcripts, and develop supporting materials',
        keyQuestion: 'How do we capture stories authentically and make them accessible?',
        activities: [
          'Conduct and record formal interviews',
          'Create verbatim transcripts with timestamps',
          'Edit audio/video for clarity while preserving authenticity',
          'Develop metadata and cataloging system',
          'Create photo essays and supplementary materials',
          'Build searchable archive structure',
          'Add captions, alt-text, and accessibility features'
        ],
        studentChoice: 'Teams decide on editing approach and supplementary materials to create',
        output: 'Curated media set with transcripts, metadata, and accessibility features',
        duration: '2-3 weeks',
        formativeAssessment: 'Production checkpoints, technical quality rubric, accessibility audit'
      },
      {
        id: 'phase-4',
        name: 'Deliver',
        description: 'Share stories with the community',
        goal: 'Launch public archive, host community event, and ensure long-term preservation',
        keyQuestion: 'How do we celebrate these stories and ensure their lasting impact?',
        activities: [
          'Finalize digital archive with search functionality',
          'Create promotional materials for public launch',
          'Organize public exhibit or listening party',
          'Prepare and deliver presentations',
          'Document audience feedback and impact',
          'Develop sustainability plan for archive',
          'Train library/historical society on maintenance'
        ],
        studentChoice: 'Teams choose presentation format and design exhibit elements',
        output: 'Live archive, public exhibit, and sustainability documentation',
        duration: '2-3 weeks',
        formativeAssessment: 'Rehearsal feedback, accessibility testing, audience response analysis'
      }
    ],
    framework: 'This project follows an adapted Documentary Production workflow combined with archival science principles. Students move from research and pre-production through production and post-production to distribution, while maintaining ethical standards and archival best practices throughout.',
    scaffolding: [
      'Teacher demonstrates interview techniques, then co-interviews, then observes',
      'Provide interview protocol templates initially, fade to student-created questions',
      'Model transcription process, then provide partial transcripts, then full independence',
      'Structured peer feedback protocols evolve into self-directed critique',
      'Technical support decreases as students gain production skills'
    ],
    differentiation: [
      'Multiple roles available (interviewer, editor, archivist, designer)',
      'Choice in technology use (simple audio vs. multi-camera video)',
      'Varied presentation formats (written, visual, audio, performance)',
      'Flexible interview lengths and complexity levels',
      'Support partnerships for students needing additional assistance'
    ],
    activities: [
      'Listening labs with historical recordings',
      'Interview technique practice sessions',
      'Community mapping exercise',
      'Historical research sprints',
      'Consent and ethics workshops',
      'Recording and editing tutorials',
      'Transcription workshops',
      'Metadata creation sessions',
      'Archive design charrettes',
      'Public speaking preparation'
    ],
    resources: [
      {
        name: 'Oral History Association Best Practices',
        type: 'Teacher-Provided Resource',
        description: 'Professional guidelines for conducting ethical oral histories',
        url: 'https://www.oralhistory.org/best-practices/',
        when: 'Introduce in Phase 1 during ethics training'
      },
      {
        name: 'StoryCorps DIY Toolkit',
        type: 'Teacher-Provided Resource',
        description: 'Free resources for recording and preserving stories',
        url: 'https://storycorps.org/participate/diy/',
        when: 'Use throughout for technical guidance and inspiration'
      },
      {
        name: 'Local Historical Archives',
        type: 'Student-Found Resource',
        description: 'Existing community history resources for context and gaps',
        url: 'Local library and historical society collections',
        when: 'Students explore during Phase 2 research'
      },
      {
        name: 'Interview Protocol Generator',
        type: 'ALF-Generated Resource',
        description: 'Custom interview questions based on themes and participants',
        url: 'Generated through ALF Coach chat',
        when: 'Created during Phase 2 planning'
      },
      {
        name: 'Transcription Tools',
        type: 'Technology Tool',
        description: 'Otter.ai, Rev, or manual transcription with Express Scribe',
        url: 'Various free and paid options',
        when: 'Used in Phase 3 for creating transcripts'
      },
      {
        name: 'Archive Platform',
        type: 'Digital Platform',
        description: 'Omeka, WordPress, or Google Sites for hosting archive',
        url: 'Free hosting platforms',
        when: 'Set up in Phase 3, populated in Phase 4'
      },
      {
        name: 'Consent Form Templates',
        type: 'ALF-Generated Resource',
        description: 'Age-appropriate consent and release forms',
        url: 'Customized through ALF Coach',
        when: 'Generated in Phase 1, used throughout'
      },
      {
        name: 'Community Contacts Database',
        type: 'Class-Built Resource',
        description: 'Shared spreadsheet of participants and partners',
        url: 'Collaborative document',
        when: 'Built in Phase 2, maintained throughout'
      }
    ],
    resourcesExplanation: {
      teacherProvided: 'Professional standards and exemplars that establish quality benchmarks and ethical guidelines',
      studentFound: 'Local history resources that provide context and help identify gaps in existing narratives',
      alfGenerated: 'Customized protocols, forms, and rubrics tailored to specific community and project needs',
      collaborative: 'Shared databases and archives that grow with each interview and become community assets',
      howAlfHelps: 'ALF Coach generates interview questions tailored to your participants, creates consent forms appropriate for your context, develops rubrics aligned with your learning goals, and provides technical troubleshooting for recording and archiving challenges.'
    }
  };

  const deliverables = {
    milestones: [
      {
        id: 'm1',
        name: 'Interview Plan & Participant Consent',
        description: 'Complete participant recruitment and secure all necessary permissions',
        deliverable: 'Comprehensive interview plan with confirmed participants, signed consent forms, and production schedule',
        successCriteria: [
          'Recruit minimum 8 diverse participants across age groups',
          'Obtain signed consent forms from all participants',
          'Create detailed interview schedule with backup dates',
          'Develop question banks specific to each participant'
        ],
        timeline: 'Weeks 1-2',
        studentProducts: ['Participant database', 'Consent forms', 'Interview protocols', 'Production calendar']
      },
      {
        id: 'm2',
        name: 'First Interviews Published (3+)',
        description: 'Complete and publish initial set of oral histories',
        deliverable: 'Three fully produced oral histories with transcripts, metadata, and supplementary materials',
        successCriteria: [
          'Record minimum 3 interviews (30-60 minutes each)',
          'Create accurate, timestamped transcripts',
          'Add complete metadata for archival standards',
          'Include photos or supporting documents'
        ],
        timeline: 'Weeks 3-5',
        studentProducts: ['Audio/video files', 'Transcripts', 'Metadata records', 'Photo essays']
      },
      {
        id: 'm3',
        name: 'Final Archive Live',
        description: 'Launch complete digital archive with all features',
        deliverable: 'Fully functional online archive with search capabilities, accessibility features, and complete collection',
        successCriteria: [
          'Publish minimum 8 oral histories',
          'Implement search and filter functionality',
          'Ensure WCAG accessibility compliance',
          'Create archive introduction and context pages'
        ],
        timeline: 'Weeks 6-8',
        studentProducts: ['Digital archive site', 'Search interface', 'Context essays', 'User guide']
      }
    ],
    rubric: {
      criteria: [
        {
          id: 'c1',
          name: 'Historical Understanding & Context',
          weight: '25%',
          description: 'Depth of historical research and ability to contextualize stories within broader narratives',
          exemplary: 'Demonstrates sophisticated understanding of historical context; makes insightful connections between individual stories and larger historical patterns; identifies and explores previously undocumented narratives; shows nuanced understanding of multiple perspectives',
          proficient: 'Shows solid grasp of historical context; connects individual stories to community history; identifies important themes and patterns; demonstrates awareness of different perspectives',
          developing: 'Basic understanding of historical context; makes some connections between stories and history; identifies obvious themes; shows limited perspective awareness',
          beginning: 'Minimal historical context provided; few connections made between stories; misses important themes; single perspective dominates'
        },
        {
          id: 'c2',
          name: 'Research Quality & Ethics',
          weight: '25%',
          description: 'Adherence to ethical standards and quality of research methodology',
          exemplary: 'Exemplary ethical practices with thorough consent processes; innovative interview techniques that elicit rich narratives; meticulous documentation and citation; creates safe space for sensitive stories',
          proficient: 'Strong ethical practices with proper consent; effective interview techniques; good documentation practices; handles sensitive topics appropriately',
          developing: 'Basic ethical compliance; adequate interview techniques; some documentation gaps; occasionally struggles with sensitive topics',
          beginning: 'Ethical concerns present; poor interview techniques; significant documentation problems; mishandles sensitive content'
        },
        {
          id: 'c3',
          name: 'Narrative Craft & Communication',
          weight: '20%',
          description: 'Quality of storytelling and clarity of communication across media',
          exemplary: 'Masterful narrative construction that preserves authentic voice while ensuring clarity; seamless integration of multiple media; compelling story arc that engages diverse audiences; exceptional editing that enhances without distorting',
          proficient: 'Strong narrative structure with clear storytelling; good use of media elements; engaging presentation; thoughtful editing that maintains authenticity',
          developing: 'Basic narrative structure present; adequate use of media; somewhat engaging; editing sometimes disrupts flow or authenticity',
          beginning: 'Poor narrative structure; ineffective use of media; difficult to follow; editing problems compromise stories'
        },
        {
          id: 'c4',
          name: 'Technical Production & Archival Quality',
          weight: '20%',
          description: 'Technical quality of recordings and adherence to archival standards',
          exemplary: 'Professional-quality audio/video with excellent clarity; comprehensive metadata exceeding archival standards; innovative use of technology; flawless transcription accuracy; robust preservation plan',
          proficient: 'Good technical quality with clear recordings; complete metadata meeting standards; effective use of technology; accurate transcriptions; solid preservation approach',
          developing: 'Acceptable technical quality with some issues; basic metadata provided; adequate technology use; mostly accurate transcriptions; simple preservation plan',
          beginning: 'Poor technical quality affecting comprehension; incomplete metadata; minimal technology skills; significant transcription errors; no preservation plan'
        },
        {
          id: 'c5',
          name: 'Community Impact & Accessibility',
          weight: '10%',
          description: 'Reach, engagement, and accessibility of the archive',
          exemplary: 'Exceptional community engagement with measurable impact; fully accessible to all users including those with disabilities; active use by community organizations; inspires follow-up projects; strengthens community bonds',
          proficient: 'Good community engagement with clear impact; accessible to most users; used by target audiences; generates positive feedback; contributes to community dialogue',
          developing: 'Some community engagement; basic accessibility features; limited audience reach; mixed feedback; minimal community discussion',
          beginning: 'Minimal community engagement; accessibility barriers present; very limited reach; little feedback; no evident impact'
        }
      ]
    },
    impact: {
      audience: {
        primary: 'Community members and elders whose stories are preserved',
        secondary: 'Local historical society and public library',
        community: 'Students, researchers, families, and future generations',
        description: 'The archive serves both the storytellers who share their experiences and the broader community seeking to understand local history and identity'
      },
      method: {
        formal: 'Public exhibit at library or community center with listening stations',
        digital: 'Searchable online archive with transcripts and multimedia',
        media: 'Podcast mini-series featuring selected stories',
        physical: 'QR-coded story map installed at relevant locations',
        description: 'Multiple distribution channels ensure stories reach diverse audiences through their preferred media'
      },
      measures: {
        quantitative: [
          'Number of oral histories recorded and archived',
          'Transcript word count and hours of audio/video',
          'Archive website visits and file downloads',
          'Exhibit attendance and engagement time',
          'Social media shares and press mentions'
        ],
        qualitative: [
          'Participant testimonials about the interview experience',
          'Community feedback on representation and inclusion',
          'Partner organization endorsements and support',
          'Evidence of intergenerational dialogue sparked',
          'Examples of archive use in other projects or research'
        ]
      },
      sustainability: {
        shortTerm: 'Initial archive launch with core collection',
        mediumTerm: 'Quarterly story additions by new student cohorts',
        longTerm: 'Permanent collection at library/historical society with ongoing community contributions',
        training: 'Student teams train next cohort and community volunteers on interview and archival methods'
      }
    },
    artifacts: [
      'Recorded oral history interviews (audio/video)',
      'Verbatim transcripts with timestamps',
      'Photo essays and historical images',
      'Metadata records and catalog entries',
      'Context essays and historical timelines',
      'Consent forms and release documents',
      'Archive website or platform',
      'Podcast episodes or audio compilations',
      'Exhibit materials and displays',
      'QR-coded story markers'
    ],
    checkpoints: [
      {
        id: 'cp1',
        name: 'Ethics & Methods Certification',
        description: 'Demonstrate understanding of ethical practices and interview techniques',
        evidence: 'Pass ethics quiz, complete practice interview with feedback',
        timing: 'End of Week 1'
      },
      {
        id: 'cp2',
        name: 'Participant Recruitment Complete',
        description: 'Secure diverse participants with signed consents',
        evidence: 'Minimum 8 confirmed participants with signed forms',
        timing: 'End of Week 2'
      },
      {
        id: 'cp3',
        name: 'First Interview Production',
        description: 'Complete full production cycle for one interview',
        evidence: 'One published interview with transcript and metadata',
        timing: 'End of Week 4'
      },
      {
        id: 'cp4',
        name: 'Archive Beta Launch',
        description: 'Soft launch archive for testing and feedback',
        evidence: 'Functional archive with 5+ stories, tested by focus group',
        timing: 'End of Week 6'
      },
      {
        id: 'cp5',
        name: 'Public Presentation',
        description: 'Share project with authentic audience',
        evidence: 'Deliver presentation at exhibit or community event',
        timing: 'End of Week 8'
      }
    ],
    accessibility: {
      recordings: 'Provide captions for all video content and transcripts for audio',
      archive: 'Ensure WCAG 2.1 AA compliance for web platform',
      materials: 'Offer materials in multiple formats (audio, visual, text)',
      events: 'Provide ASL interpretation and assistive listening at public events',
      content: 'Include content warnings where appropriate and respect participant preferences for anonymity'
    },
    differentiation: {
      roles: 'Students can specialize as interviewers, editors, archivists, designers, or project managers',
      technology: 'Options range from smartphone recording to professional equipment',
      products: 'Final contributions can be audio, video, written, or visual',
      support: 'Partner struggling students with stronger peers or adult mentors',
      extension: 'Advanced students can tackle complex historical research or technical challenges'
    }
  };

  return {
    id,
    userId,
    createdAt: ts(),
    updatedAt: ts(),
    wizardData,
    ideation,
    journey,
    deliverables,
    sample: true
  };
}
