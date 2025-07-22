// Inspirational prompt templates for journey design
// Focus on creativity, possibility, and educator empowerment

import { WizardData } from '../features/wizard/wizardSchema';
import { JourneyData } from '../lib/fsm';

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

export const templates = {
  JOURNEY_OVERVIEW: ({ wizardData }: PromptContext) => `
Welcome to the Journey Design phase! 

Based on your ${wizardData.subject} ${wizardData.scope} for ${wizardData.ageGroup} students, we'll craft a learning journey that transforms curiosity into capability.

We'll design:
• **Learning Phases** - The arc of discovery and growth
• **Engaging Activities** - Hands-on experiences that inspire
• **Rich Resources** - Materials and connections that deepen learning

Your journey will reflect your vision: "${wizardData.motivation}"

Ready to begin? Type "continue" or click below to start designing your phases.
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
    
    return `
Let's step back and admire the learning journey you've designed!

**Your ${wizardData.subject} Journey Overview:**
• ${phaseCount} thoughtfully crafted phases
• ${activityCount} engaging activities
• ${resourceCount} enriching resources

**The Learning Arc:**
${journeyData.phases.map((phase, i) => `${i + 1}. **${phase.name}** - ${phase.description}`).join('\n')}

This journey embodies your vision: "${wizardData.motivation}"

**Reflection prompts:**
• How will students feel at each phase of this journey?
• What moments of discovery and joy have you built in?
• Where might students surprise themselves with what they can do?

Would you like to refine any part of the journey, or shall we move forward to implementation planning?
`;
  },

  // Response templates for quick actions
  IDEAS: ({ currentStage, wizardData }: PromptContext) => {
    const ideaTemplates = {
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

      JOURNEY_ACTIVITIES: `Fresh activity ideas for ${wizardData.ageGroup} students:

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
  readyForNext: boolean = false
) {
  return {
    content: prompt,
    metadata: {
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
  
  if (!template) {
    return formatPromptWithMetadata(
      "Let's continue designing your learning journey. What would you like to explore next?",
      standardQuickReplies
    );
  }

  const prompt = template(context);
  return formatPromptWithMetadata(prompt, standardQuickReplies);
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
      return "No problem! Let's move on to the next part of your journey design.";
    case 'continue':
      return "Great! Let's continue building your learning journey.";
    default:
      return "I'm here to help you design an inspiring learning journey. What would you like to explore?";
  }
}