// Inspirational prompt templates for journey design
// Focus on creativity, possibility, and educator empowerment

// Avoid importing full schema
type WizardData = any;
import { type JourneyData } from '../lib/fsm';

export interface PromptContext {
  wizardData: WizardData;
  journeyData: JourneyData;
  currentStage: string;
}

export interface QuickReply {
  label: string;
  action: 'ideas' | 'whatif' | 'examples' | 'skip' | 'continue';
  variant?: 'primary' | 'secondary' | 'subtle';
}

// Standard quick replies for all journey stages
export const standardQuickReplies: QuickReply[] = [
  { label: "Get Ideas", action: "ideas", variant: "primary" },
  { label: "What-If", action: "whatif", variant: "secondary" },
  { label: "Examples", action: "examples", variant: "secondary" },
  { label: "Skip", action: "skip", variant: "subtle" }
];

const continueQuickReply: QuickReply = { label: 'Continue', action: 'continue', variant: 'primary' };

const stageQuickReplies: Record<string, QuickReply[]> = {
  JOURNEY_OVERVIEW: standardQuickReplies,
  JOURNEY_PHASES: standardQuickReplies,
  JOURNEY_ACTIVITIES: standardQuickReplies,
  JOURNEY_RESOURCES: standardQuickReplies,
  JOURNEY_REVIEW: [continueQuickReply],
  DELIVER_MILESTONES: standardQuickReplies,
  DELIVER_RUBRIC: standardQuickReplies,
  DELIVER_IMPACT: standardQuickReplies,
  PUBLISH_REVIEW: [continueQuickReply],
  COMPLETE: [],
  UNKNOWN_STAGE: []
};

export const templates = {
  JOURNEY_OVERVIEW: ({ wizardData }: PromptContext) => `
Welcome! Your vision — "${wizardData.motivation}" — is about to become a ${wizardData.subject} ${wizardData.scope} for ${wizardData.ageGroup} students.

Let's set the stage for their learning journey:
• **Context**: ${wizardData.location || 'Your learning space'}
• **Tools on hand**: ${wizardData.materials || 'Everyday classroom resources'}
• **Why it matters**: Students will connect ${wizardData.subject} to real-world purpose.

Share what excites you most, or try a quick action below to spark ideas.
`,

  DELIVER_MILESTONES: ({ wizardData, journeyData }: PromptContext) => `
Let's outline milestone checkpoints that keep learners and stakeholders aligned throughout your ${wizardData.scope}.

Milestones serve as:
• **Celebration points** - Acknowledging progress and growth
• **Alignment checks** - Ensuring everyone understands expectations
• **Reflection moments** - Pausing to assess and adjust

Consider these approaches:

**Option A: Phase-Based Milestones**
• End of each phase presentation or demonstration
• Peer feedback sessions between phases
• Family showcase at midpoint and finale

**Option B: Skill-Based Checkpoints**
• Mastery demonstrations of key competencies
• Portfolio reviews showing growth over time
• Student-led conferences on progress

**Option C: Product-Oriented Markers**
• Prototype reviews with authentic feedback
• Draft submissions with revision cycles
• Final exhibition with community panel

Share your milestone ideas or build on these suggestions. What moments will make learning visible?
`,

  DELIVER_RUBRIC: ({ wizardData, journeyData }: PromptContext) => `
Now let's draft clear criteria that reward inquiry, collaboration, craft, and reflection.

Effective rubrics:
• **Describe growth** - Not just final achievement
• **Use student-friendly language** - Clear and accessible
• **Value process and product** - Both matter
• **Support assessment and reporting** - Align with standards and evidence collection

Here's a framework to adapt:

**Core Criteria to Consider:**
• **Inquiry & Innovation** - How deeply students explore and create
• **Collaboration & Communication** - How well they work with others
• **Craft & Quality** - The care and skill in their work
• **Reflection & Growth** - How they learn from the experience

**Levels of Achievement:**
We suggest: Emerging → Developing → Proficient → Exemplary

Would you like to use this framework, modify it, or create your own criteria? Focus on what matters most for your ${wizardData.ageGroup} students.
`,

  DELIVER_IMPACT: ({ wizardData, journeyData }: PromptContext) => `
Let's specify how student work connects to authentic audiences or community needs.

Authentic connections transform learning by:
• **Creating real purpose** - Work that matters beyond grades
• **Building empathy** - Understanding diverse perspectives
• **Inspiring excellence** - Rising to meet real expectations

**Connection Possibilities:**

**Local Community**
• Present to city council or school board
• Partner with local businesses or nonprofits
• Create resources for community organizations

**Peer Networks**
• Teach younger students
• Share with other schools via video conference
• Create online resources for global peers

**Digital Reach**
• Publish work on project websites
• Share through social media campaigns
• Contribute to open-source projects

Please specify BOTH parts of your impact plan:

1. **WHO is your authentic audience?** (e.g., "Elementary students," "Local business owners," "City council members")

2. **HOW will students share their work?** (e.g., "Live presentation," "Published website," "Workshop demonstration")

Your ${wizardData.ageGroup} students' work needs to reach real people who can benefit from what they're creating.
`,

  PUBLISH_REVIEW: ({ wizardData, journeyData }: PromptContext) => {
    const phaseCount = journeyData.phases.length;
    const activityCount = journeyData.activities.length;
    const resourceCount = journeyData.resources.length;
    const milestoneCount = journeyData.deliverables?.milestones?.length || 0;
    const criteriaCount = journeyData.deliverables?.rubric?.criteria?.length || 0;
    
    return `
Your blueprint is complete! Let's review what you've created:

**Learning Journey Design**
• ${phaseCount} thoughtfully crafted phases
• ${activityCount} engaging activities
• ${resourceCount} enriching resources

**Assessment & Impact**
• ${milestoneCount} milestone checkpoints
• ${criteriaCount} rubric criteria
• Authentic audience: ${journeyData.deliverables?.impact?.audience || 'To be determined'}

**Your Vision**
"${wizardData.motivation}"

This ${wizardData.subject} ${wizardData.scope} for ${wizardData.ageGroup} students embodies project-based learning at its best:
✓ Student-centered and engaging
✓ Connected to real-world impact
✓ Clear expectations and support

Ready to publish your blueprint? Type "publish" to finalize, or "edit" to refine any section.
`;
  },

  IDEATION_BIG_IDEA: ({ wizardData }: PromptContext) => `
Welcome to the Ideation Stage! 

Based on your ${wizardData.subject} ${wizardData.scope} for ${wizardData.ageGroup} students, let's anchor your learning experience with a powerful Big Idea.

A Big Idea is a concept that:
• Connects to what matters most in ${wizardData.subject}
• Resonates with your ${wizardData.ageGroup} students' lives
• Opens doors to deeper exploration

Your vision: "${wizardData.motivation}"

**Here are three Big Ideas to consider:**

**A) ${wizardData.subject} as a Force for Change**
Explore how ${wizardData.subject} can transform communities and solve real problems.

**B) The Hidden ${wizardData.subject} in Everyday Life**
Discover the surprising ways ${wizardData.subject} shapes our daily experiences.

**C) ${wizardData.subject} Through Multiple Lenses**
Examine ${wizardData.subject} from diverse perspectives and cultural viewpoints.

Choose A, B, or C, or craft your own Big Idea that captures the essence of your vision.
`,

  IDEATION_EQ: ({ wizardData, journeyData }: PromptContext) => `
Excellent! Your Big Idea: "${journeyData.ideation.bigIdea}"

Now let's frame an Essential Question that will drive student inquiry throughout this ${wizardData.scope}.

A great Essential Question:
• Is open-ended with no single "right" answer
• Provokes deep thinking and discussion
• Connects to students' lives and the world beyond school

**Here are three Essential Questions inspired by your Big Idea:**

**A) How might we...?**
"How might we use ${wizardData.subject} to ${journeyData.ideation.bigIdea.toLowerCase()}?"

**B) What if...?**
"What if ${wizardData.subject} could ${journeyData.ideation.bigIdea.toLowerCase()}?"

**C) Why does... matter?**
"Why does ${journeyData.ideation.bigIdea.toLowerCase()} matter to our community?"

Choose A, B, or C, or write your own Essential Question that ignites curiosity.
`,

  IDEATION_CHALLENGE: ({ wizardData, journeyData }: PromptContext) => `
Powerful question: "${journeyData.ideation.essentialQuestion}"

Now let's define an authentic challenge where students will showcase their learning and create real impact.

The challenge should:
• Connect to a real audience or purpose
• Allow for creative, diverse solutions
• Be worthy of your students' time and effort

**Here are three inspiring challenges for your ${wizardData.ageGroup} students:**

**A) Community Exhibition**
Create an interactive ${wizardData.subject} exhibition for ${wizardData.location || 'the community'} that addresses: "${journeyData.ideation.essentialQuestion}"

**B) Digital Campaign**
Design and launch a multimedia campaign that uses ${wizardData.subject} to explore: "${journeyData.ideation.essentialQuestion}"

**C) Solution Showcase**
Develop working prototypes or solutions that demonstrate how ${wizardData.subject} answers: "${journeyData.ideation.essentialQuestion}"

Choose A, B, or C, or describe your own authentic challenge.
`,

  JOURNEY_PHASES: ({ wizardData, journeyData }: PromptContext) => `
Let's design the learning arc for your ${wizardData.subject} journey with ${wizardData.ageGroup} students.

Think of 3-4 phases that guide students from initial wonder to confident application. Each phase should feel like a natural step in their growth.

**Here are three inspiring approaches:**

**A) Classic Inquiry Arc**
1. Discover & Wonder - Spark curiosity through exploration
2. Investigate & Create - Deep dive and hands-on making  
3. Share & Reflect - Present learning and celebrate growth

**B) Design Thinking Journey**
1. Empathize & Define - Understand the challenge deeply
2. Ideate & Prototype - Generate solutions and test ideas
3. Implement & Iterate - Refine and share with the world

**C) Story-Based Adventure**
1. Setting the Scene - Establish context and build excitement
2. Rising Action - Tackle challenges and build skills
3. Climax & Resolution - Apply learning to solve the big challenge
4. New Beginnings - Reflect and imagine future possibilities

You can choose A, B, or C, mix elements from each, or create your own unique progression. What resonates with your vision?
`,

  JOURNEY_ACTIVITIES: ({ wizardData, journeyData }: PromptContext) => {
    const currentPhase = journeyData.phases[journeyData.phases.length - 1] || journeyData.phases[0];
    const phaseNames = journeyData.phases.map(p => p.name).join(', ');
    
    return `
Excellent phases: ${phaseNames}! 

Now let's bring "${currentPhase?.name || 'your first phase'}" to life with engaging activities.

For ${wizardData.ageGroup} students in ${wizardData.subject}, consider activities that:
• Connect to their world and interests
• Build skills through hands-on exploration
• Encourage collaboration and creativity
• Lead to authentic, shareable outcomes

**Activity inspirations for this phase:**

**Option 1: Investigation Station**
Students rotate through discovery centers, each revealing a different aspect of the topic through experiments, artifacts, or puzzles.

**Option 2: Creative Challenge**
Teams tackle a real-world problem using the concepts they're learning, documenting their process and presenting solutions.

**Option 3: Storytelling Workshop**
Students become experts who teach others through creative mediums - videos, comics, presentations, or interactive demonstrations.

What type of activity would make your students' eyes light up? Describe your idea or build on one of these suggestions.
`;
  },

  JOURNEY_RESOURCES: ({ wizardData, journeyData }: PromptContext) => {
    const materials = wizardData.materials ? `You mentioned having: ${wizardData.materials}. ` : '';
    
    return `
Your journey is taking beautiful shape! Let's gather resources to support and enrich the experience.

${materials}Think beyond traditional materials - what could make this journey unforgettable?

**Resource categories to consider:**

**Inspiring Content**
• Videos, articles, or podcasts that spark wonder
• Virtual field trips or expert interviews
• Interactive simulations or tools

**Community Connections**
• Local experts or professionals to invite
• Partner organizations or businesses
• Other classrooms for collaboration

**Creative Materials**
• Making supplies for hands-on creation
• Digital tools for design and sharing
• Unexpected materials that surprise and delight

**Support Resources**
• Scaffolding tools for different learners
• Extension challenges for those ready to go deeper
• Reflection prompts and celebration ideas

What resources would help your ${wizardData.ageGroup} students thrive in this ${wizardData.subject} journey? Share your ideas or let me suggest some specific options.
`;
  },

  JOURNEY_REVIEW: ({ wizardData, journeyData }: PromptContext) => {
    const phaseCount = journeyData.phases.length;
    const activityCount = journeyData.activities.length;
    const resourceCount = journeyData.resources.length;
    const activityHighlights = journeyData.activities.slice(0, 3).map((activity) => `• ${activity.name}`).join('\n');
    const resourceHighlights = journeyData.resources.slice(0, 3).map((resource) => `• ${resource.name}`).join('\n');
    
    return `
Let's step back and admire the learning journey you've designed!

**Your ${wizardData.subject} Journey Overview:**
• ${phaseCount} thoughtfully crafted phases
• ${activityCount} engaging activities
• ${resourceCount} enriching resources

**The Learning Arc:**
${journeyData.phases.map((phase, i) => `${i + 1}. **${phase.name}** - ${phase.description}`).join('\n')}

${activityHighlights ? `**Activity Highlights:**\n${activityHighlights}\n` : ''}${resourceHighlights ? `**Resource Highlights:**\n${resourceHighlights}\n` : ''}

This journey embodies your vision: "${wizardData.motivation}"

**Reflection prompts:**
• How will students feel at each phase of this journey?
• What moments of discovery and joy have you built in?
• Where might students surprise themselves with what they can do?

Would you like to refine any part of the journey, or shall we move forward to implementation planning?
`;
  },

  COMPLETE: ({ wizardData }: PromptContext) => `
Congratulations! You've built a complete ${wizardData.subject} ${wizardData.scope} grounded in your vision: "${wizardData.motivation}".

Next steps you might consider:
• Share the blueprint with collaborators or administrators
• Schedule launch milestones and gather partner feedback
• Capture student-facing introductions or entry events while ideas are fresh

Ready for implementation planning or extension ideas? I'm here when you are.
`,

  // Response templates for quick actions
  IDEAS: ({ currentStage, wizardData }: PromptContext) => {
    const ideaTemplates = {
      IDEATION_BIG_IDEA: `Here are more Big Ideas to inspire you:

**Content-Focused Ideas**
• The Science of ${wizardData.subject}
• ${wizardData.subject} as Problem-Solving
• ${wizardData.subject} in Nature
• The Art of ${wizardData.subject}

**Connection-Focused Ideas**
• ${wizardData.subject} Connects Communities
• ${wizardData.subject} Across Cultures
• ${wizardData.subject} and Social Justice
• ${wizardData.subject} for Future Generations

**Process-Focused Ideas**
• The Journey of Discovery in ${wizardData.subject}
• Making Thinking Visible Through ${wizardData.subject}
• ${wizardData.subject} as Creative Expression
• Learning ${wizardData.subject} Like a Professional`,
      
      IDEATION_EQ: `Here are more Essential Question formats:

**Philosophical Questions**
• What does it mean to...?
• How do we know when...?
• What is the relationship between...?

**Action-Oriented Questions**
• How can we create...?
• What would happen if...?
• How might we redesign...?

**Critical Thinking Questions**
• Whose perspective is missing from...?
• What assumptions underlie...?
• How has ... changed over time?`,
      
      IDEATION_CHALLENGE: `Here are more authentic challenge formats:

**Creation Challenges**
• Design and build a working model
• Create an original performance or presentation
• Develop a teaching resource for younger students

**Research Challenges**
• Conduct original research and share findings
• Document and analyze local examples
• Create a field guide or resource collection

**Action Challenges**
• Launch a awareness campaign
• Organize a community event
• Start a school-wide initiative`,
      
      JOURNEY_OVERVIEW: `Here are some initial ideas to spark your thinking:

**Project Themes for ${wizardData.subject}**
• Real-world problem solving in your community
• Creative expression through ${wizardData.subject}
• Collaborative challenges that build skills
• Student-driven inquiry and exploration

**Starting Points**
• What fascinates your ${wizardData.ageGroup} students?
• What challenges exist in your ${wizardData.location || 'community'}?
• How might ${wizardData.subject} make a difference?
• What resources and partnerships are available?

**Big Questions to Explore**
• How might we use ${wizardData.subject} to improve our world?
• What would students create if given full creative freedom?
• How can learning connect to authentic audiences?
• What legacy might this project leave behind?`,
      
      DELIVER_MILESTONES: `Here are more milestone ideas for your project:

**Time-Based Checkpoints**
• Weekly reflection journals or vlogs
• Bi-weekly peer review sessions
• Monthly family update presentations
• Mid-project pivot opportunity

**Achievement-Based Markers**
• Skills passport with stamps for competencies
• Digital badge system for accomplishments
• Student-created tutorials showing mastery
• Expert verification checkpoints

**Community-Connected Milestones**
• Initial stakeholder meeting and needs assessment
• Prototype testing with target audience
• Feedback incorporation demonstration
• Final presentation to authentic panel`,

      DELIVER_RUBRIC: `Additional rubric considerations:

**21st Century Skills Focus**
• Critical Thinking & Problem Solving
• Creativity & Innovation
• Digital Literacy & Media Skills
• Leadership & Responsibility

**Project-Specific Criteria**
• Research Depth & Source Quality
• Design Thinking Process
• Iteration Based on Feedback
• Real-World Application

**Holistic Assessment Elements**
• Self-Assessment Reflections
• Peer Evaluation Components
• Growth Over Time Tracking
• Exhibition Performance`,

      DELIVER_IMPACT: `More ways to connect to authentic audiences:

**Professional Connections**
• Industry expert panels
• Professional mentorship programs
• Workplace presentations
• Career exploration partnerships

**Media & Publishing**
• Student blog or podcast series
• Local newspaper features
• School district showcases
• YouTube or TikTok education content

**Service Learning**
• Nonprofit partnerships
• Community service integration
• Social enterprise development
• Advocacy campaigns`,
      JOURNEY_PHASES: `Here are more phase design ideas for ${wizardData.subject}:

**Community-Connected Arc**
1. Local Discovery - Explore the topic in your community
2. Problem Finding - Identify real challenges to solve
3. Solution Building - Create and test interventions
4. Community Sharing - Present to authentic audiences

**Skills Progression Model**
1. Foundation Building - Core concepts through play
2. Skill Development - Targeted practice with choice
3. Integration - Combine skills in complex challenges
4. Teaching Others - Become the expert

**Nature-Inspired Cycle**
1. Planting Seeds - Introduction and wonder
2. Growing & Nurturing - Exploration and practice
3. Blooming - Creation and expression
4. Harvest & Renewal - Reflection and next steps`,

      JOURNEY_ACTIVITIES: `Fresh activity ideas for ${wizardData.ageGroup} students — activities to bring this phase to life:

**Maker Space Challenges**
• Design challenges with constraints that spark creativity
• Rapid prototyping sessions with diverse materials
• Peer teaching stations where students share skills

**Real-World Connections**
• Interview community members about the topic
• Create solutions for actual classroom/school needs
• Partner with younger students as mentors

**Digital Creativity**
• Produce podcasts or video documentaries
• Design interactive websites or apps
• Create social media campaigns for causes`,

      JOURNEY_RESOURCES: `Additional resource inspirations:

**Free Digital Tools**
• Canva for design projects
• Flipgrid for video reflections
• Padlet for collaborative boards
• Google Earth for virtual exploration

**Community Partners**
• Local libraries often have maker spaces
• Universities may offer student mentors
• Museums frequently have education programs
• Businesses might sponsor materials or visits

**Unexpected Materials**
• Cardboard for engineering challenges
• Natural materials for art and science
• Recycled items for invention projects
• Simple household items for experiments`
    };

    return ideaTemplates[currentStage as keyof typeof ideaTemplates] || "Let me help you brainstorm more ideas...";
  },

  WHATIF: ({ currentStage, wizardData }: PromptContext) => {
    const whatIfTemplates = {
      IDEATION_BIG_IDEA: `What if we pushed the boundaries:

**What if ${wizardData.subject} was everywhere?**
Find it hidden in unexpected places and reveal its power.

**What if students were the experts?**
They research, teach, and lead the learning journey.

**What if we worked backwards?**
Start with the impact you want and design the journey to get there.

**What if constraints sparked creativity?**
Use limitations as launching pads for innovation.

**What if learning was a game?**
Transform the entire experience into an immersive quest.`,
      
      IDEATION_EQ: `What if your question:

**What if it had no answer?**
Embrace questions that lead to more questions.

**What if everyone's answer was different?**
Celebrate diverse perspectives and solutions.

**What if the question evolved?**
Let student discoveries reshape the inquiry.

**What if students wrote the questions?**
Start with their burning curiosities.`,
      
      IDEATION_CHALLENGE: `What if the challenge:

**What if it was impossible?**
Tackle something that seems too big, then find a way.

**What if it went viral?**
Design for impact beyond your classroom walls.

**What if professionals joined?**
Partner with experts who face this challenge daily.

**What if it lasted beyond the ${wizardData.scope}?**
Create something that continues growing after class ends.`,
      
      JOURNEY_OVERVIEW: `What if we reimagined project-based learning:

**What if students designed the entire journey?**
Start with their burning questions and let them chart the course.

**What if the project had real clients?**
Partner with local organizations who need student solutions.

**What if failure was the goal?**
Design a "Failure Festival" where students showcase what didn't work and why.

**What if the classroom disappeared?**
Conduct the entire ${wizardData.scope} in community spaces.

**What if students taught the teachers?**
Flip the expertise and let students lead professional development.`,
      
      DELIVER_MILESTONES: `What if we reimagined milestones:

**What if students set their own milestones?**
Co-create checkpoints based on their goals and interests.

**What if milestones were public celebrations?**
Community events showcasing progress, not just classroom moments.

**What if failure was a milestone?**
Celebrate productive struggle and learning from mistakes.

**What if families designed milestones with students?**
Home-school partnership in defining success markers.`,

      DELIVER_RUBRIC: `What if assessment was transformed:

**What if students wrote the rubric?**
They define quality based on exemplars and goals.

**What if rubrics were visual, not text?**
Infographics, symbols, or color systems for criteria.

**What if growth was the only measure?**
Individual progress from personal starting points.

**What if peer assessment was primary?**
Students become expert evaluators of each other's work.`,

      DELIVER_IMPACT: `What if authentic audience was revolutionary:

**What if students presented to decision-makers?**
Direct access to those who can implement their ideas.

**What if the work became a permanent installation?**
Creating lasting change in school or community.

**What if students taught professionals?**
Reverse mentoring on youth perspectives and tech.

**What if impact was measured after graduation?**
Long-term tracking of project influence.`,
      JOURNEY_PHASES: `What if we pushed the boundaries:

**What if students designed the phases?**
Start with their questions and let them map the journey of discovery.

**What if each phase happened in a different location?**
Library → Maker space → Nature → Community center

**What if the phases weren't linear?**
Students choose their path through interconnected learning experiences.

**What if each phase had a different expert guide?**
Bring in diverse voices to lead each stage of the journey.`,

      JOURNEY_ACTIVITIES: `What if we reimagined activities:

**What if students taught the class?**
Each team becomes expert teachers for one concept.

**What if everything was a game?**
Turn learning into quests, challenges, and collaborative puzzles.

**What if we worked backwards?**
Start with the final product and reverse-engineer the learning.

**What if parents/community were co-learners?**
Create activities that bring families into the discovery process.`,

      JOURNEY_RESOURCES: `What if resources were unconventional:

**What if students were the primary resource?**
Leverage their diverse backgrounds, skills, and connections.

**What if we used zero traditional materials?**
Build everything from found, natural, or recycled items.

**What if every resource was interactive?**
No passive content - everything requires engagement.

**What if students created all the resources?**
They build the library for next year's class.`
    };

    return whatIfTemplates[currentStage as keyof typeof whatIfTemplates] || "Let's explore some 'what if' possibilities...";
  },

  EXAMPLES: ({ currentStage, wizardData }: PromptContext) => {
    const exampleTemplates = {
      IDEATION_BIG_IDEA: `Here are real Big Ideas from successful projects:

**"Math is Everywhere" (Middle School)**
Students discovered mathematical patterns in nature, architecture, and music, creating a multimedia exhibition.

**"Stories Shape Us" (High School English)**
Explored how narratives influence identity and community, culminating in a storytelling festival.

**"Science for Social Good" (Grade 9-10)**
Applied scientific methods to solve local environmental challenges, presenting to city council.

**"History Lives Here" (Elementary)**
Uncovered hidden histories in their neighborhood through interviews and artifact collection.`,
      
      IDEATION_EQ: `Essential Questions that sparked amazing learning:

**Middle School Science**
"How can we heal our local watershed?" 
Led to stream monitoring and restoration project.

**High School Arts**
"What does home mean in a changing world?"
Resulted in multimedia exhibition exploring belonging.

**Elementary Technology**
"How can we make our school more inclusive?"
Students designed accessibility apps and tools.

**Multi-age Math**
"What patterns connect us all?"
Created collaborative data visualization project.`,
      
      IDEATION_CHALLENGE: `Authentic challenges from real classrooms:

**"Redesign Our Town Square" (Grade 7-8)**
Students presented urban planning proposals to mayor, one element was actually implemented.

**"Podcast for Change" (High School)**
Created 10-episode series on local issues, aired on community radio with 500+ listeners.

**"Innovation Fair" (Grade 5-6)**
Students invented solutions for everyday problems, presented to panel of local entrepreneurs.

**"Digital Heritage Project" (Grade 9-12)**
Built interactive website preserving cultural stories, now used by historical society.`,
      
      JOURNEY_OVERVIEW: `Here are inspiring project examples for ${wizardData.subject}:

**"Tech for Good" - High School Technology Project**
Students partnered with local nonprofits to create digital solutions:
• Built websites for small community organizations
• Created apps to help elderly navigate city services
• Designed social media campaigns for environmental causes
• Presented at City Hall with implemented solutions

**"Code Your Community" - Middle School CS Project**
${wizardData.ageGroup} students mapped and improved their neighborhood:
• Created interactive digital maps of local resources
• Built QR code tours of historical sites
• Developed safety apps for walking routes
• Hosted community tech fair with live demos

**"Digital Storytellers" - Cross-curricular Project**
Students used ${wizardData.subject} to preserve local history:
• Interviewed community elders and created podcasts
• Built virtual museum of neighborhood stories
• Designed interactive timeline of local changes
• Published digital book shared with library`,
      
      DELIVER_MILESTONES: `Real milestone examples from successful projects:

**Environmental Action Project (Grade 8)**
• Week 2: Research findings presentation to peers
• Week 4: Prototype solution with materials list
• Week 6: Community partner feedback session
• Week 8: Final exhibition with action commitments

**Digital Storytelling Unit (Grade 10)**
• Draft 1: Peer workshop with revision notes
• Draft 2: Teacher conference on narrative arc
• Draft 3: Family preview and feedback
• Final: Public screening with Q&A panel

**Math in Architecture (Grade 6)**
• Phase 1 Exit: Scale model of dream classroom
• Phase 2 Exit: Budget calculations presentation
• Phase 3 Exit: Final blueprints with justification
• Showcase: School board presentation`,

      DELIVER_RUBRIC: `Actual rubrics from innovative classrooms:

**Design Thinking Rubric (Middle School)**
• Empathy: Understanding user needs deeply
• Ideation: Generating creative solutions
• Prototyping: Building to learn
• Testing: Iterating based on feedback
*Each criterion has student-friendly descriptors*

**Collaboration Rubric (High School)**
• Contributing: Sharing ideas and resources
• Listening: Building on others' thoughts
• Facilitating: Helping group progress
• Reflecting: Learning from team dynamics
*Students score themselves and teammates*

**Exhibition Rubric (Elementary)**
• Preparation: Ready and practiced
• Presentation: Clear and engaging
• Knowledge: Understands deeply
• Growth: Shows learning journey
*Visual symbols for each level*`,

      DELIVER_IMPACT: `How real projects connected to audiences:

**Water Quality Study (Grade 7)**
Audience: City Environmental Department
Method: Presented findings at council meeting
Result: City adopted student recommendations

**Historical Documentary (Grade 11)**
Audience: Local Historical Society
Method: Film screening at community center
Result: Added to permanent museum collection

**Playground Redesign (Grade 4)**
Audience: School board and PTA
Method: 3D models and budget proposal
Result: Funded and built student designs

**Cultural Cookbook (Grade 9)**
Audience: Families and community
Method: Published book with recipe stories
Result: Sold to fund field trips*`,
      JOURNEY_PHASES: `Real examples from innovative educators:

**Environmental Science Journey (Grade 6-8)**
1. "Wonder Walks" - Nature observation and questioning
2. "System Detectives" - Investigating ecosystems  
3. "Change Makers" - Designing environmental solutions
4. "Green Showcase" - Community presentation and action

**Mathematics Through Design (Grade 9-10)**
1. "Pattern Hunters" - Finding math in art and nature
2. "Design Lab" - Creating with geometric principles
3. "Build & Test" - Engineering with mathematical models
4. "Math Gallery" - Exhibition of mathematical art

**History as Time Travel (Grade 4-5)**
1. "Time Portal" - Immersive historical introduction
2. "Living History" - Role-play and primary sources
3. "Then & Now" - Connecting past to present
4. "Future Historians" - Creating records for tomorrow`,

      JOURNEY_ACTIVITIES: `Successful activities from real classrooms:

**"Shark Tank" Style Presentations**
Students pitch solutions to real problems, with community judges providing feedback.
*Works for: Any subject, grades 5-12*

**"Escape Room" Challenges**
Teams solve subject-related puzzles to "escape," reviewing content through play.
*Works for: Math, Science, History, grades 3-12*

**"Teaching Robots"**
Students create step-by-step instructions to teach concepts to "robots" (peers).
*Works for: Any procedural learning, grades 2-8*

**"Community Consultant"**
Students act as consultants solving real problems for local organizations.
*Works for: Applied subjects, grades 6-12*`,

      JOURNEY_RESOURCES: `Resources teachers love:

**"Mystery Skype"**
Connect with classrooms worldwide for cultural exchange and collaborative learning.
*Free, requires only internet connection*

**"Citizen Science Projects"**
Real research participation through platforms like Zooniverse or iNaturalist.
*Free, contributes to actual science*

**"Local Expert Network"**
Build a database of community members willing to share expertise.
*Free, builds community connections*

**"Student Choice Libraries"**
Curated collections where students pick their learning resources.
*Mix of free and low-cost options*`
    };

    return exampleTemplates[currentStage as keyof typeof exampleTemplates] || "Here are some examples to inspire you...";
  }
};

// Helper function to add metadata for Gemini responses
export function formatPromptWithMetadata(
  prompt: string, 
  quickReplies: QuickReply[] = standardQuickReplies,
  readyForNext: boolean = false,
  stage?: string
) {
  return {
    content: prompt,
    metadata: {
      stage,
      quickReplies,
      readyForNext,
      allowsFreeResponse: true
    }
  };
}

// Generate appropriate prompt based on context
export function generatePrompt(context: PromptContext): ReturnType<typeof formatPromptWithMetadata> {
  const templateKey = context.currentStage as keyof typeof templates;
  const template = templates[templateKey];
  const quickReplies = stageQuickReplies[context.currentStage] ?? stageQuickReplies.UNKNOWN_STAGE;
  const readyForNext = quickReplies.length === 0;
  
  if (!template) {
    return formatPromptWithMetadata(
      "Let's continue designing your learning journey. What would you like to explore next?",
      quickReplies,
      readyForNext,
      context.currentStage
    );
  }

  const prompt = template(context);
  return formatPromptWithMetadata(prompt, quickReplies, readyForNext, context.currentStage);
}

// Generate response for quick actions
export function generateQuickResponse(
  action: string, 
  context: PromptContext
): string {
  switch (action) {
    case 'ideas':
      return templates.IDEAS(context);
    case 'whatif':
      return templates.WHATIF(context);
    case 'examples':
      return templates.EXAMPLES(context);
    case 'skip':
      return "Skip noted! Let's move on to the next part of your journey design.";
    case 'continue':
      return "Great! Let's continue building your learning journey.";
    default:
      return "I'm here to help you design an inspiring learning journey. What would you like to explore?";
  }
}
