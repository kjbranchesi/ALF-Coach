/**
 * Hero Project: Everyday Innovations - Designing Tools for Dignity
 * An assistive technology design project for high school
 * Students co-design low-cost assistive solutions with and for real users
 */

import { type SampleBlueprint, ts } from './types';

export function buildAssistiveTechHero(userId: string): SampleBlueprint {
  const id = 'hero-assistive-tech';

  const wizardData = {
    projectTopic: 'Everyday Innovations: Designing Tools for Dignity',
    learningGoals: 'Universal design principles, empathetic engineering, rapid prototyping, user research, CAD/3D printing, biomechanics, accessibility standards, co-design methodology',
    entryPoint: 'authentic_problem',
    subjects: ['technology', 'science', 'mathematics', 'arts'],
    primarySubject: 'technology',
    gradeLevel: 'high',
    duration: 'medium', // 6-8 weeks
    materials: '3D printer access, basic hand tools, cardboard/foam core, Arduino kits (optional), PVC pipe, velcro, elastic bands, common household materials',
    subject: 'Engineering, Technology, Design, Health Sciences',
    location: 'makerspace; classroom; OT/PT clinic; user homes',
    featured: true,
    heroProject: true,
    communityPartners: ['Occupational therapy clinics', 'Physical therapy practices', 'Disability advocacy organizations', 'Senior centers', 'Local makerspaces', 'Assistive technology resource centers']
  };

  const ideation = {
    bigIdea: 'Small design choices can unlock independence and dignity for people with disabilities, and the best solutions come from designing WITH, not for, users.',
    essentialQuestion: 'How might we design low-cost assistive solutions that improve daily life for a specific user while maintaining their dignity and independence?',
    challenge: 'Partner with a real user to understand their daily challenges, co-design and prototype an assistive tool, test and refine it based on their feedback, and publish open-source build guides so others can benefit.',
    studentVoice: {
      drivingQuestions: [
        'What assumptions do we make about "normal" abilities in everyday design?',
        'How do we balance function with dignity and aesthetics?',
        'What makes a solution truly helpful versus patronizing?',
        'How can low-cost materials create high-impact solutions?',
        'What role should the user play in the design process?'
      ],
      choicePoints: [
        'User partner selection (age, ability, specific need)',
        'Focus area (mobility, communication, daily living, recreation)',
        'Materials and fabrication methods (3D printing, woodworking, sewing, electronics)',
        'Documentation format (video tutorial, illustrated guide, CAD files)',
        'Distribution method (open source platform, local org, direct to users)'
      ]
    }
  };

  const journey = {
    phases: [
      {
        id: 'phase-1',
        name: 'Discover',
        description: 'Build empathy and understand the lived experience of disability',
        goal: 'Develop deep understanding of accessibility challenges and existing assistive technology landscape',
        keyQuestion: 'What are the real, daily challenges faced by people with different abilities?',
        activities: [
          'Disability awareness simulations (navigate school in wheelchair, vision impaired, etc.)',
          'Research existing assistive technology and pricing',
          'Interview OT/PT professionals about common needs',
          'Shadow someone using assistive technology',
          'Analyze "hacks" people create for themselves',
          'Map accessibility barriers in local spaces'
        ],
        studentChoice: 'Students choose specific disability area to focus on',
        output: 'Empathy portfolio with observations, interviews, and barrier analysis',
        duration: '1.5 weeks',
        formativeAssessment: 'Reflection journals, empathy map creation, peer discussions'
      },
      {
        id: 'phase-2',
        name: 'Define',
        description: 'Partner with a user and define their specific needs',
        goal: 'Establish co-design partnership and identify specific challenge to address',
        keyQuestion: 'What specific challenge will make the biggest difference in our partner\'s daily life?',
        activities: [
          'Match with user partners through community organizations',
          'Conduct in-depth user interviews using respectful protocols',
          'Day-in-the-life observations (with consent)',
          'Create detailed user journey maps',
          'Identify pain points and opportunity areas',
          'Co-create design criteria with user'
        ],
        studentChoice: 'Teams matched with users based on interest and skills',
        output: 'User profile, needs statement, and co-signed design brief',
        duration: '1.5 weeks',
        formativeAssessment: 'Interview transcripts, journey maps, design criteria rubric'
      },
      {
        id: 'phase-3',
        name: 'Develop',
        description: 'Prototype and test solutions with user feedback',
        goal: 'Create functional prototypes through iterative design with user input',
        keyQuestion: 'How can we create something that truly works for our user\'s specific situation?',
        activities: [
          'Brainstorm solutions WITH user partner',
          'Create low-fi prototypes (cardboard, tape, etc.)',
          'Test prototypes in user\'s actual environment',
          'Learn necessary skills (3D modeling, sewing, basic circuits)',
          'Build refined prototypes with actual materials',
          'Conduct usability testing sessions',
          'Iterate based on user feedback'
        ],
        studentChoice: 'Materials and methods based on solution needs',
        output: 'Functional prototype with testing documentation',
        duration: '3 weeks',
        formativeAssessment: 'Prototype iterations, user feedback forms, design journals'
      },
      {
        id: 'phase-4',
        name: 'Deliver',
        description: 'Finalize solution and share knowledge',
        goal: 'Deliver final product to user and publish open-source documentation',
        keyQuestion: 'How can we ensure others can benefit from what we\'ve learned and created?',
        activities: [
          'Final refinements based on extended user testing',
          'Create professional documentation (CAD files, materials list, instructions)',
          'Film build tutorial videos',
          'Calculate cost comparisons with commercial alternatives',
          'Present to OT/PT professionals and disability organizations',
          'Upload to open-source platforms (Thingiverse, Instructables)',
          'Train user and caregivers on maintenance'
        ],
        studentChoice: 'Documentation format and distribution channels',
        output: 'Final device, open-source build guide, presentation to stakeholders',
        duration: '1.5 weeks',
        formativeAssessment: 'Documentation quality, user satisfaction survey, presentation rubric'
      }
    ],
    framework: 'This project follows a human-centered design process with emphasis on co-design principles from the disability rights movement: "Nothing About Us Without Us." Students learn that the best assistive technology comes from genuine partnership with users, not designing for them from assumptions.',
    scaffolding: [
      'Teacher models respectful interaction protocols with disability community',
      'Provide sensitivity training before user interactions',
      'Templates for user interviews and consent forms',
      'Technical skill workshops as needed (3D printing, Arduino, etc.)',
      'Gradual release from teacher-supervised to independent user meetings'
    ],
    differentiation: [
      'Various technical complexity levels (mechanical, electronic, simple modifications)',
      'Different user partnerships based on student comfort and skills',
      'Multiple documentation formats (written, video, visual)',
      'Flexible prototyping methods based on available skills',
      'Options for individual or team projects'
    ],
    activities: [
      'Empathy building exercises',
      'User interview training',
      'Journey mapping workshops',
      'Rapid prototyping challenges',
      'CAD/3D printing tutorials',
      'Basic electronics workshops',
      'Materials testing labs',
      'Usability testing protocols',
      'Technical documentation training',
      'Presentation skills workshops'
    ],
    resources: [
      {
        name: 'Stanford d.school Liberatory Design Deck',
        type: 'Teacher-Provided Resource',
        description: 'Card deck with equity-centered design methods',
        url: 'https://dschool.stanford.edu/resources/liberatory-design-cards',
        when: 'Use throughout for design process guidance'
      },
      {
        name: 'WHO Assistive Technology Fact Sheets',
        type: 'Student-Found Resource',
        description: 'Global perspective on assistive technology needs',
        url: 'https://www.who.int/news-room/fact-sheets/detail/assistive-technology',
        when: 'Research phase for understanding scope of need'
      },
      {
        name: 'User Interview Protocol',
        type: 'ALF-Generated Resource',
        description: 'Respectful interview questions customized for specific user group',
        url: 'Generated through ALF Coach chat',
        when: 'Created before first user meeting in Phase 2'
      },
      {
        name: 'Thingiverse Assistive Technology Collection',
        type: 'Technology Tool',
        description: 'Open-source 3D printable assistive devices',
        url: 'https://www.thingiverse.com/thing:collections/assistive-technology',
        when: 'Research existing solutions and share final designs'
      },
      {
        name: 'Local Disability Organization Speakers',
        type: 'Teacher-Curated Examples',
        description: 'Guest speakers from disability community',
        url: 'Contact local centers for independent living',
        when: 'Phase 1 for awareness and Phase 4 for feedback'
      },
      {
        name: 'Cost Comparison Spreadsheet',
        type: 'Class-Built Resource',
        description: 'Database comparing DIY vs commercial solutions',
        url: 'Shared class spreadsheet',
        when: 'Built throughout, becomes resource for community'
      }
    ],
    resourcesExplanation: {
      teacherProvided: 'Foundational resources on respectful co-design and disability awareness',
      studentFound: 'Research on existing solutions and user communities',
      alfGenerated: 'Customized protocols for specific user partnerships and technical guides',
      collaborative: 'Shared knowledge base of solutions and costs that grows over time',
      howAlfHelps: 'ALF Coach generates user-appropriate interview questions, suggests materials based on specific needs, creates technical tutorials for chosen fabrication methods, and helps navigate sensitive conversations about dignity and independence.'
    }
  };

  const deliverables = {
    milestones: [
      {
        id: 'm1',
        name: 'User Partnership Agreement',
        description: 'Establish formal partnership with user and define project scope',
        deliverable: 'Signed partnership agreement with user, detailed needs assessment, and project timeline',
        successCriteria: [
          'User partner identified and consent obtained',
          'Specific challenge clearly defined with user input',
          'Success metrics co-created with user',
          'Communication protocols established'
        ],
        timeline: 'Week 2',
        studentProducts: ['Partnership agreement', 'User profile', 'Needs assessment', 'Communication plan']
      },
      {
        id: 'm2',
        name: 'Prototype Development',
        description: 'Create and test functional prototype with user',
        deliverable: 'Working prototype that addresses user\'s specific need with documented testing results',
        successCriteria: [
          'Minimum 3 prototype iterations created',
          'Each iteration tested with actual user',
          'Functionality verified in user\'s environment',
          'Cost under $50 for materials'
        ],
        timeline: 'Week 5',
        studentProducts: ['Prototype iterations', 'Testing videos', 'Feedback documentation', 'Bill of materials']
      },
      {
        id: 'm3',
        name: 'Open Source Documentation',
        description: 'Create comprehensive build guide for others',
        deliverable: 'Complete open-source documentation package including build instructions, CAD files, and tutorials',
        successCriteria: [
          'Step-by-step build instructions with photos',
          'Materials list with sources and costs',
          'CAD files or patterns provided',
          'Video tutorial created',
          'Uploaded to public platform'
        ],
        timeline: 'Week 7',
        studentProducts: ['Build guide', 'CAD files', 'Video tutorial', 'Cost analysis']
      }
    ],
    rubric: {
      criteria: [
        {
          id: 'c1',
          name: 'User-Centered Design Process',
          weight: '25%',
          description: 'Quality of partnership and responsiveness to user needs',
          exemplary: 'Deep, respectful partnership with user as co-designer; solution perfectly addresses specific needs; user feedback drives all decisions; demonstrates exceptional empathy and cultural sensitivity',
          proficient: 'Good partnership with regular user input; solution addresses main needs; incorporates user feedback; shows respect and understanding',
          developing: 'Some user involvement; solution partially addresses needs; limited feedback integration; basic respect shown',
          beginning: 'Minimal user involvement; solution based on assumptions; little feedback sought; may show unintentional bias'
        },
        {
          id: 'c2',
          name: 'Technical Execution',
          weight: '25%',
          description: 'Functionality, durability, and appropriateness of solution',
          exemplary: 'Solution works flawlessly in real conditions; highly durable and safe; innovative use of materials; significantly improves user\'s daily life',
          proficient: 'Solution works well with minor issues; reasonably durable; appropriate materials; clearly helps user',
          developing: 'Solution basically works but has problems; some durability concerns; materials adequate; provides some help',
          beginning: 'Solution has significant functional problems; fragile or unsafe; poor material choices; limited real benefit'
        },
        {
          id: 'c3',
          name: 'Design for Dignity',
          weight: '20%',
          description: 'Aesthetic consideration and preservation of user dignity',
          exemplary: 'Beautiful, discreet design that user is proud to use; enhances independence without stigma; looks professional/commercial quality; celebrates user identity',
          proficient: 'Thoughtful design that considers appearance; maintains dignity; looks intentional; user comfortable using publicly',
          developing: 'Basic attention to appearance; somewhat maintains dignity; functional over aesthetic; user accepts design',
          beginning: 'Little consideration of appearance; may be stigmatizing; purely functional; user reluctant to use publicly'
        },
        {
          id: 'c4',
          name: 'Documentation & Knowledge Sharing',
          weight: '20%',
          description: 'Quality and accessibility of open-source documentation',
          exemplary: 'Professional-quality documentation; extremely clear instructions; multiple formats (video, written, visual); easy for others to replicate; includes variations and adaptations',
          proficient: 'Clear, complete documentation; good instructions; well-organized; others can replicate with effort; includes key information',
          developing: 'Basic documentation present; some unclear areas; missing some details; replication possible but challenging',
          beginning: 'Poor or incomplete documentation; unclear instructions; missing critical information; difficult to replicate'
        },
        {
          id: 'c5',
          name: 'Cost Effectiveness & Accessibility',
          weight: '10%',
          description: 'Affordability and accessibility of solution',
          exemplary: 'Under $30 with commonly available materials; multiple sourcing options; provides 80%+ functionality of commercial alternative at <10% cost',
          proficient: 'Under $50 with obtainable materials; clear cost savings; good functionality-to-cost ratio',
          developing: 'Under $75 but some hard-to-find materials; moderate cost savings; acceptable value',
          beginning: 'Over $75 or requires special access materials; minimal cost benefit; poor value proposition'
        }
      ]
    },
    impact: {
      audience: {
        primary: 'Individual user partner with specific disability',
        secondary: 'OT/PT professionals and disability service organizations',
        community: 'Global maker community through open-source platforms',
        description: 'Direct impact on one person\'s daily life, with potential to help thousands through shared designs'
      },
      method: {
        formal: 'Presentation to disability organizations and healthcare providers',
        digital: 'Open-source platforms (Thingiverse, Instructables, GitHub)',
        media: 'Video tutorials and build guides',
        direct: 'Device delivery and training for user partner',
        description: 'Multi-channel approach ensures both immediate local impact and global knowledge sharing'
      },
      measures: {
        quantitative: [
          'Time saved in daily tasks for user (minutes/day)',
          'Cost savings versus commercial alternative (dollars)',
          'Number of downloads/views of open-source files',
          'Number of replications by others',
          'Durability testing results (cycles before failure)'
        ],
        qualitative: [
          'User satisfaction and quality of life improvement',
          'User\'s sense of dignity and independence',
          'Feedback from OT/PT professionals',
          'Stories of others who built the design',
          'Student reflections on disability awareness'
        ]
      },
      sustainability: {
        shortTerm: 'User receives custom device with training',
        mediumTerm: 'Local organization adopts design for other clients',
        longTerm: 'Design enters global open-source ecosystem, continuously improved by community',
        training: 'Students create maintenance guide and train user/caregivers'
      }
    },
    artifacts: [
      'User partnership agreement',
      'Empathy maps and journey maps',
      'Prototype iterations (physical)',
      'Testing videos and photos',
      'CAD files or technical drawings',
      'Build instructions with photos',
      'Video tutorials',
      'Bill of materials with sources',
      'Cost comparison analysis',
      'User testimonial video'
    ],
    checkpoints: [
      {
        id: 'cp1',
        name: 'Disability Awareness Certification',
        description: 'Complete sensitivity training and demonstrate respectful interaction skills',
        evidence: 'Pass disability awareness quiz, practice interview role-play',
        timing: 'End of Week 1'
      },
      {
        id: 'cp2',
        name: 'User Partnership Established',
        description: 'Successfully match with user and complete initial assessment',
        evidence: 'Signed agreement, completed needs assessment',
        timing: 'End of Week 2'
      },
      {
        id: 'cp3',
        name: 'First Prototype Test',
        description: 'Complete initial prototype and test with user',
        evidence: 'Prototype photos, user feedback form',
        timing: 'End of Week 4'
      },
      {
        id: 'cp4',
        name: 'Final Delivery',
        description: 'Deliver working solution to user',
        evidence: 'User acceptance, training completed',
        timing: 'End of Week 7'
      }
    ],
    accessibility: {
      materials: 'Provide multiple fabrication options for different skill levels',
      documentation: 'Create guides in multiple formats (visual, written, video)',
      userInteraction: 'Offer various communication methods (in-person, video, text)',
      presentations: 'Ensure all presentations are accessible (captions, descriptions)'
    }
  };

  // Reflection prompts organized by project phase (adaptive to project duration)
  const weeklyReflections = {
    discover: [
      'What assumptions about disability did you have that were challenged today?',
      'How does the built environment exclude people with different abilities?'
    ],
    define: [
      'What did you learn from your user partner that surprised you?',
      'How do you balance what you think would help versus what the user actually wants?'
    ],
    develop: [
      'How does designing WITH someone differ from designing FOR them?',
      'What compromises between function, cost, and aesthetics are you making?'
    ],
    deliver: [
      'How will you know if your solution truly improves your user\'s life?',
      'What responsibility do you have to the broader disability community?'
    ],
    weekly: [
      'What moment this week changed your perspective?',
      'How are you handling the emotional aspects of this work?',
      'What technical skill proved most valuable this week?',
      'How has your definition of "good design" evolved?'
    ]
  };

  // Common challenges and solutions based on teacher experience
  const troubleshooting = [
    'If user partner becomes unavailable → Have backup plan with OT clinic for general solutions; document work for future user',
    'If students show insensitivity → Immediate private conversation; require disability awareness retraining; consider speaker from disability community',
    'If prototype fails repeatedly → Simplify scope; focus on one specific task; consult with engineering teacher or makerspace',
    'If 3D printer unavailable → Use cardboard, wood, PVC pipe, or thermoplastic; many solutions don\'t need high-tech',
    'If costs exceed budget → Seek donations from hardware stores; use recycled materials; apply for mini-grants',
    'If user feedback is harsh → Frame as learning opportunity; remember dignity matters as much as function',
    'If documentation seems overwhelming → Focus on one good format rather than many mediocre ones',
    'If students struggle with ambiguity → Provide more structure initially; gradually release control',
    'If legal concerns arise → Work through established organization; use their liability coverage and protocols',
    'If solution already exists commercially → Focus on cost reduction or customization; not everything needs to be novel'
  ];

  // Differentiation strategies for diverse learners
  const modifications = {
    struggling: 'Partner with more structured user needs (single, clear challenge); provide design templates; focus on mechanical solutions over electronic; allow team projects',
    advanced: 'Match with users with complex, multiple needs; incorporate electronics/programming; develop multiple solutions; mentor other teams; write grant proposals',
    ell: 'Provide visual design thinking tools; use translation for user interviews if needed; allow native language for initial brainstorming; pair with strong English speaker for documentation'
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
    sample: true,
    weeklyReflections,
    troubleshooting,
    modifications
  };
}