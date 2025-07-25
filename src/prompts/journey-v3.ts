// Flexible Prompt System v3.0
// Works with robust data model and stage-based conversations

import { WizardData } from '../features/wizard/wizardSchema';
import { JourneyDataV3, StageRecap } from '../lib/journey-data-v3';
import { JourneyState } from '../lib/fsm-v2';

export interface PromptContext {
  wizardData: WizardData;
  journeyData: JourneyDataV3;
  currentStage: JourneyState;
  previousRecaps?: StageRecap[];
}

// More natural AI system prompt
const SYSTEM_PROMPT_V3 = `You are an educational design coach helping teachers create transformative learning experiences.

Current conversation rules:
1. Be conversational and encouraging
2. Validate and gently guide when responses seem off-track
3. Build on previous stage recaps when available
4. Focus only on the current stage - don't jump ahead
5. Use natural language - avoid rigid formatting unless specifically helpful

Remember: Each stage builds on the last, but conversations are stage-specific.`;

// Generate prompts based on stage and context
export function generateStagePrompt(context: PromptContext): string {
  const { wizardData, journeyData, currentStage, previousRecaps = [] } = context;
  const { subject, ageGroup, duration, location, additionalContext } = wizardData;
  
  // Get relevant recap for context
  const relevantRecap = getRelevantRecap(currentStage, previousRecaps);
  
  switch (currentStage) {
    case 'IDEATION_INITIATOR':
      return `# Welcome to ProjectCraft!

I'm your AI design partner, here to help you create a transformative ${subject} experience for your ${ageGroup} students.

## Our Journey Together

We'll move through **4 collaborative stages**:

**1. Ideation** (10 min)
   Transform your teaching goals into a compelling foundation

**2. Learning Journey** (15 min)
   Design phases, activities, and resources that bring ideas to life

**3. Deliverables** (10 min)
   Define milestones, assessment, and authentic impact

**4. Publish** (5 min)
   Review and export your complete blueprint

${additionalContext ? `\n**Your Context**: ${additionalContext}\n` : ''}
Throughout our conversation, I'll offer:
- **Ideas** - Curated suggestions based on your context
- **What-Ifs** - Creative possibilities to explore
- **Help** - Guidance whenever you need it

This is a collaborative process - your expertise combined with AI support creates something truly special.`;

    case 'IDEATION_BIG_IDEA':
      return `Let's anchor your ${subject} experience with a Big Idea.

A Big Idea is a concept that:
- Resonates beyond the classroom
- Connects to students' lives
- Sparks curiosity and wonder

For ${ageGroup} students in ${location || 'your setting'}, what overarching concept could transform how they see ${subject}?

Share your Big Idea, or click Ideas for inspiration tailored to your context.`;

    case 'IDEATION_EQ':
      const bigIdea = journeyData.stageData.ideation.bigIdea;
      return `Excellent! With "${bigIdea}" as our anchor, let's craft an Essential Question.

This question should:
- Be open-ended (no single right answer)
- Provoke deep thinking
- Connect to real-world relevance
- Guide the entire learning journey

What question could help ${ageGroup} students explore "${bigIdea}" in meaningful ways?`;

    case 'IDEATION_CHALLENGE':
      const eq = journeyData.stageData.ideation.essentialQuestion;
      return `Powerful question! Now let's define an authentic challenge.

Students will explore "${eq}" through a real-world task that:
- Has genuine purpose or audience
- Allows creative solutions
- Demonstrates deep understanding
- Connects to ${location || 'community'} needs

What challenge could bring this learning to life?`;

    case 'IDEATION_CLARIFIER':
      return buildIdeationClarifier(journeyData, wizardData);

    case 'JOURNEY_INITIATOR':
      return `Welcome to the Learning Journey design stage!

${relevantRecap ? `Building on: ${relevantRecap.summary}\n\n` : ''}
Now we'll map out HOW students will explore this challenge. We'll design:
1. Phases - the major movements of learning
2. Activities - engaging experiences within each phase
3. Resources - materials, tools, and connections

Ready to design the journey? Type "start" or explore Ideas for phase structures.`;

    case 'JOURNEY_PHASES':
      return `Let's map out the learning phases for your ${duration || 'unit'}.

${relevantRecap ? `Remember: ${relevantRecap.summary}\n\n` : ''}
Think about 3-4 phases that:
- Move from exploration to creation
- Build skills progressively
- Allow for deep investigation
- Culminate in the challenge

How would you structure this learning journey? Share your phases or click Ideas for suggestions.`;

    case 'JOURNEY_ACTIVITIES':
      const phases = journeyData.stageData.journey.phases;
      return `Great phases! Now let's design activities that bring them to life.

Your phases: ${phases || 'Exploration → Investigation → Creation → Presentation'}

For each phase, what specific activities will:
- Engage ${ageGroup} students actively
- Build toward the challenge
- Encourage collaboration
- Allow for differentiation

Share your activity ideas or click Ideas for inspiration.`;

    case 'JOURNEY_RESOURCES':
      return `Excellent activities! Now let's gather the resources to support this journey.

Consider resources like:
- Materials and tools students will need
- Digital platforms or apps
- Community connections or experts
- Reference materials or examples
- Creative supplies

What resources will help bring these activities to life in ${location || 'your setting'}?`;

    case 'JOURNEY_CLARIFIER':
      return buildJourneyClarifier(journeyData, wizardData);

    case 'DELIVERABLES_INITIATOR':
      return `Welcome to the Deliverables stage!

${relevantRecap ? `Building on: ${relevantRecap.summary}\n\n` : ''}
Now we'll define how students demonstrate their learning:
1. Milestones - checkpoints along the way
2. Assessment - how we measure understanding
3. Impact - the difference their work makes

This ensures authentic, meaningful outcomes. Ready to begin?`;

    case 'DELIVERABLES_MILESTONES':
      return `Let's establish key milestones for your ${duration || 'learning experience'}.

Milestones are checkpoints where students:
- Share progress
- Get feedback
- Reflect on learning
- Celebrate achievements

What are 3-4 key moments where students will showcase their developing understanding?`;

    case 'DELIVERABLES_ASSESSMENT':
      const milestones = journeyData.stageData.deliverables.milestones;
      return `Good milestones! Now let's design assessment that values growth.

For ${ageGroup} students, consider:
- Formative assessments during the journey
- Authentic performance tasks
- Self and peer reflection
- Portfolio or exhibition elements

How will you and students know they're succeeding? Share your assessment approach.`;

    case 'DELIVERABLES_IMPACT':
      return `Almost there! Let's define the real-world impact of student work.

The challenge was: "${journeyData.stageData.ideation.challenge || 'your authentic challenge'}"

How will student creations:
- Reach an authentic audience
- Make a difference in ${location || 'the community'}
- Create lasting value
- Inspire continued learning

What impact will this work have beyond the classroom?`;

    case 'DELIVERABLES_CLARIFIER':
      return buildDeliverablesClarifier(journeyData, wizardData);

    case 'PUBLISH':
      return `# Congratulations! Your learning blueprint is complete!

Let's review everything we've created together:

${buildFinalSummary(journeyData, wizardData)}

You can now:
- Download your blueprint as a PDF
- Share with colleagues
- Begin implementation
- Return to edit anytime

Ready to transform learning? Click "Export Blueprint" to get your personalized guide!`;

    default:
      return `Let's continue building your learning experience. How can I help with ${currentStage}?`;
  }
}

// Build clarifier summaries
function buildIdeationClarifier(data: JourneyDataV3, wizard: WizardData): string {
  const ideation = data.stageData.ideation;
  const { subject, ageGroup } = wizard;
  
  // Generate conversational validation based on what we have
  const hasAllElements = ideation.bigIdea && ideation.essentialQuestion && ideation.challenge;
  
  if (!hasAllElements) {
    return `Let's see what we have so far:

${ideation.bigIdea ? `✓ **Big Idea**: "${ideation.bigIdea}"` : '○ Big Idea: (still needed)'}
${ideation.essentialQuestion ? `✓ **Essential Question**: "${ideation.essentialQuestion}"` : '○ Essential Question: (still needed)'}
${ideation.challenge ? `✓ **Challenge**: "${ideation.challenge}"` : '○ Challenge: (still needed)'}

${!ideation.bigIdea ? "We still need your Big Idea - the core concept that will anchor this entire learning experience." :
  !ideation.essentialQuestion ? "Great Big Idea! Now we need an Essential Question to drive student inquiry." :
  "Almost there! We just need to define the authentic challenge students will tackle."}

What would you like to share?`;
  }
  
  // All elements present - validate coherence
  return `Wonderful! Let me make sure I understand your vision:

Your ${ageGroup} students will explore **"${ideation.bigIdea}"** 

Through the question: **"${ideation.essentialQuestion}"**

By tackling this challenge: **"${ideation.challenge}"**

${ideation.bigIdea.toLowerCase().includes('movement') || ideation.bigIdea.toLowerCase().includes('community') ? 
  "I love how this connects to real experiences!" : 
  "This sounds engaging!"}

Does this capture what you're envisioning? Feel free to:
- **Continue** if this looks good
- **Refine** any part that needs adjustment
- Ask me anything if you'd like to discuss it!`;
}

function buildJourneyClarifier(data: JourneyDataV3, wizard: WizardData): string {
  const journey = data.stageData.journey;
  const { duration, ageGroup } = wizard;
  
  const hasAllElements = journey.phases && journey.activities && journey.resources;
  
  if (!hasAllElements) {
    return `Here's your learning journey so far:

${journey.phases ? `✓ **Phases**: ${journey.phases}` : '○ Learning phases: (still needed)'}
${journey.activities ? `✓ **Activities**: ${journey.activities}` : '○ Activities: (still needed)'}
${journey.resources ? `✓ **Resources**: ${journey.resources}` : '○ Resources: (still needed)'}

${!journey.phases ? `First, let's map out the major phases of this ${duration || 'learning experience'}.` :
  !journey.activities ? "Nice phases! Now, what specific activities will bring each phase to life?" :
  "Great activities! What resources and materials will support this journey?"}

What would you like to add?`;
  }
  
  return `I'm excited about this journey you've designed!

**The Path**: ${journey.phases}

**Key Experiences**: ${journey.activities}

**Supporting Resources**: ${journey.resources}

${journey.activities.toLowerCase().includes('create') || journey.activities.toLowerCase().includes('design') ?
  `Love the hands-on creativity here! Your ${ageGroup} students will really get to express themselves.` :
  `This progression builds skills beautifully for ${ageGroup} learners.`}

Ready to move forward, or would you like to adjust anything?`;
}

function buildDeliverablesClarifier(data: JourneyDataV3, wizard: WizardData): string {
  const deliverables = data.stageData.deliverables;
  const { location, subject } = wizard;
  const challenge = data.stageData.ideation.challenge;
  
  const hasAllElements = deliverables.milestones && deliverables.assessment && deliverables.impact;
  
  if (!hasAllElements) {
    return `Let's finalize how students will demonstrate their learning:

${deliverables.milestones ? `✓ **Milestones**: ${deliverables.milestones}` : '○ Key milestones: (still needed)'}
${deliverables.assessment ? `✓ **Assessment**: ${deliverables.assessment}` : '○ Assessment approach: (still needed)'}
${deliverables.impact ? `✓ **Impact**: ${deliverables.impact}` : '○ Real-world impact: (still needed)'}

${!deliverables.milestones ? "First, what are the key checkpoints where students will share their progress?" :
  !deliverables.assessment ? "Great milestones! How will you and students know they're succeeding?" :
  `Almost done! How will their work on "${challenge}" make a real difference?`}

What are your thoughts?`;
  }
  
  return `This is shaping up beautifully! Here's how students will showcase their learning:

**Progress Checkpoints**: ${deliverables.milestones}

**Success Measures**: ${deliverables.assessment}

**Real-World Impact**: ${deliverables.impact}

${deliverables.impact.toLowerCase().includes('community') || deliverables.impact.toLowerCase().includes('present') ?
  `Yes! Connecting to ${location || 'the community'} makes this so meaningful for students.` :
  `This gives students' work real purpose beyond the classroom.`}

We're ready to generate your complete blueprint! Shall we continue?`;
}

function buildFinalSummary(data: JourneyDataV3, wizardData: WizardData): string {
  const { ideation, journey, deliverables } = data.stageData;
  
  return `## Foundation
**Big Idea**: ${ideation.bigIdea}
**Essential Question**: ${ideation.essentialQuestion}
**Challenge**: ${ideation.challenge}

## Journey Design  
**Phases**: ${journey.phases}
**Key Activities**: ${journey.activities}
**Resources**: ${journey.resources}

## Outcomes & Impact
**Milestones**: ${deliverables.milestones}
**Assessment**: ${deliverables.assessment}
**Real-World Impact**: ${deliverables.impact}

## Context
**Subject**: ${wizardData.subject}
**Students**: ${wizardData.ageGroup}
**Duration**: ${wizardData.duration}
**Location**: ${wizardData.location}`; 
}

// Get relevant recap for context
function getRelevantRecap(currentStage: JourneyState, recaps: StageRecap[]): StageRecap | null {
  // Journey stages should see ideation recap
  if (currentStage.startsWith('JOURNEY') && recaps.find(r => r.stage === 'ideation')) {
    return recaps.find(r => r.stage === 'ideation')!;
  }
  
  // Deliverables should see journey recap
  if (currentStage.startsWith('DELIVER') && recaps.find(r => r.stage === 'journey')) {
    return recaps.find(r => r.stage === 'journey')!;
  }
  
  return null;
}

// Generate AI prompt for Ideas/What-If with flexible parsing
export function generateAIPrompt(action: 'ideas' | 'whatif', context: PromptContext): string {
  const { wizardData, journeyData, currentStage } = context;
  const { subject, ageGroup, location } = wizardData;
  
  if (action === 'ideas') {
    return generateIdeasPrompt(currentStage, subject, ageGroup, location || '', journeyData);
  } else {
    return generateWhatIfPrompt(currentStage, subject, ageGroup, location || '', journeyData);
  }
}

function generateIdeasPrompt(stage: JourneyState, subject: string, ageGroup: string, location: string, data: JourneyDataV3): string {
  const baseContext = `Context: Teaching ${subject} to ${ageGroup} students in ${location}.`;
  
  switch (stage) {
    case 'IDEATION_BIG_IDEA':
      return `${baseContext}
      
Generate 4 compelling Big Ideas that could anchor a transformative learning unit.

Consider:
- What matters most in ${subject} for these students?
- What connects to their lives and community?
- What sparks wonder and investigation?

Format your response as:
Here are some ideas to spark your thinking:

1. **[Title]** - [Explanation]
2. **[Title]** - [Explanation]
3. **[Title]** - [Explanation]
4. **[Title]** - [Explanation]

Make titles concise and explanations brief (1-2 sentences).`;

    case 'IDEATION_EQ':
      return `${baseContext}
Big Idea: "${data.stageData.ideation.bigIdea}"

Generate 4 Essential Questions that could drive deep inquiry into this Big Idea.

Consider:
- Questions that have multiple valid answers
- Questions that matter beyond school
- Questions students would genuinely want to explore

Format your response as:
Here are some essential questions to consider:

1. **[Question]** - [Why this question matters]
2. **[Question]** - [Why this question matters]
3. **[Question]** - [Why this question matters]
4. **[Question]** - [Why this question matters]

Make questions thought-provoking and explanations brief.`;

    case 'IDEATION_CHALLENGE':
      return `${baseContext}
Essential Question: "${data.stageData.ideation.essentialQuestion}"

Generate 4 authentic challenges that let students explore this question through real action.

Consider:
- Tasks with genuine purpose/audience
- Opportunities for creative solutions
- Connection to ${location} community needs

Format your response as:
Here are some challenge ideas:

1. **[Challenge Title]** - [Brief description]
2. **[Challenge Title]** - [Brief description]
3. **[Challenge Title]** - [Brief description]
4. **[Challenge Title]** - [Brief description]

Make challenges specific and actionable.
`;

    case 'JOURNEY_PHASES':
      return `${baseContext}
Challenge: "${data.stageData.ideation.challenge}"

Generate 4 different phase structures for this ${subject} journey.

Consider varied approaches like:
- Inquiry → Research → Create → Share
- Explore → Experiment → Design → Impact
- Wonder → Investigate → Build → Reflect

Format your response as:
Here are some phase structure options:

1. **[Phase 1 → Phase 2 → Phase 3 → Phase 4]** - [Rationale]
2. **[Phase 1 → Phase 2 → Phase 3 → Phase 4]** - [Rationale]
3. **[Phase 1 → Phase 2 → Phase 3 → Phase 4]** - [Rationale]
4. **[Phase 1 → Phase 2 → Phase 3 → Phase 4]** - [Rationale]

Explain why each structure works for ${ageGroup} learners.`;

    case 'JOURNEY_ACTIVITIES':
      return `${baseContext}
Phases: ${data.stageData.journey.phases}

Generate engaging activities for each phase that:
- Build ${subject} skills progressively
- Include hands-on experiences
- Foster collaboration
- Connect to the challenge

Format your response as:
Here are activities for each phase:

1. **[Phase Name]**: [2-3 specific activities]
2. **[Phase Name]**: [2-3 specific activities]
3. **[Phase Name]**: [2-3 specific activities]
4. **[Phase Name]**: [2-3 specific activities]

Make activities specific and engaging for ${ageGroup} students.`;

    case 'JOURNEY_RESOURCES':
      return `${baseContext}
Activities planned: ${data.stageData.journey.activities}

Generate a comprehensive resource list including:
- Essential materials and tools
- Digital resources or platforms
- Community connections
- Reference materials
- Creative supplies

Organize by type with brief notes on use.`;

    case 'DELIVERABLES_MILESTONES':
      return `${baseContext}
Journey: ${data.stageData.journey.phases}

Generate 3-4 meaningful milestone moments where students:
- Share progress with authentic audiences
- Reflect on learning
- Get feedback
- Celebrate growth

Present with timing and purpose for each.`;

    case 'DELIVERABLES_ASSESSMENT':
      return `${baseContext}
Milestones: ${data.stageData.deliverables.milestones}

Generate assessment approaches that:
- Value process and product
- Include self-reflection
- Use authentic tasks
- Support ${ageGroup} learners

Present a balanced assessment strategy.`;

    case 'DELIVERABLES_IMPACT':
      return `${baseContext}
Challenge: "${data.stageData.ideation.challenge}"

Generate ideas for real-world impact including:
- Specific audiences to reach
- Ways to share student work
- Community benefits
- Lasting contributions

Present concrete possibilities for ${location}.`;
    
    default:
      return `${baseContext}\n\nGenerate relevant suggestions for ${stage}.`;
  }
}

function generateWhatIfPrompt(stage: JourneyState, subject: string, ageGroup: string, location: string, data: JourneyDataV3): string {
  const baseContext = `Context: Teaching ${subject} to ${ageGroup} students in ${location}.`;
  
  switch (stage) {
    case 'IDEATION_BIG_IDEA':
      return `${baseContext}
      
Generate "What if" scenarios that reimagine how we teach ${subject}.

Format your response as:
Here are some thought-provoking scenarios:

1. **What if [scenario]?** - [Brief exploration of possibility]
2. **What if [scenario]?** - [Brief exploration of possibility]
3. **What if [scenario]?** - [Brief exploration of possibility]

Push boundaries. Challenge assumptions. Dream big.`;

    case 'IDEATION_EQ':
      return `${baseContext}
Big Idea: "${data.stageData.ideation.bigIdea}"

Generate "What if" questions that push the boundaries of this concept.

Format your response as:
Here are some bold possibilities:

1. **What if [scenario]?** - [How this transforms learning]
2. **What if [scenario]?** - [How this transforms learning]
3. **What if [scenario]?** - [How this transforms learning]

Think completely unexpected angles, unlimited resources, community involvement.`;

    case 'IDEATION_CHALLENGE':
      return `${baseContext}
Essential Question: "${data.stageData.ideation.essentialQuestion}"

Generate "What if" challenge scenarios that break conventional limits.

Format your response as:
Here are some game-changing scenarios:

1. **What if [challenge scenario]?** - [Impact on student experience]
2. **What if [challenge scenario]?** - [Impact on student experience]
3. **What if [challenge scenario]?** - [Impact on student experience]

Think world leaders, professional tools, policy change for ${ageGroup} changemakers.`;

    case 'JOURNEY_PHASES':
      return `${baseContext}

Generate "What if" journey structures that revolutionize learning.

Format your response as:
Here are some radical reimaginings:

1. **What if [journey scenario]?** - [How this transforms the experience]
2. **What if [journey scenario]?** - [How this transforms the experience]
3. **What if [journey scenario]?** - [How this transforms the experience]

Think student-designed pathways, no classroom walls, expert connections.`;

    case 'JOURNEY_ACTIVITIES':
      return `${baseContext}

Generate "What if" activity scenarios that transform engagement.

Format your response as:
Here are some breakthrough possibilities:

1. **What if [activity scenario]?** - [Revolutionary impact]
2. **What if [activity scenario]?** - [Revolutionary impact]
3. **What if [activity scenario]?** - [Revolutionary impact]

Think students teaching community, cutting-edge tech, 24/7 learning.`;

    case 'JOURNEY_RESOURCES':
      return `${baseContext}

Generate "What if" resource scenarios that expand possibilities.

Format your response as:
Here are some limitless possibilities:

1. **What if [resource scenario]?** - [Transformative potential]
2. **What if [resource scenario]?** - [Transformative potential]
3. **What if [resource scenario]?** - [Transformative potential]

Think unlimited budget, global experts, any tool or space.`;

    case 'DELIVERABLES_MILESTONES':
      return `${baseContext}

Generate "What if" milestone scenarios that redefine success.

Format your response as:
Here are some extraordinary possibilities:

1. **What if [milestone scenario]?** - [Redefining success]
2. **What if [milestone scenario]?** - [Redefining success]
3. **What if [milestone scenario]?** - [Redefining success]

Think public celebrations, professional conferences, viral impact.`;

    case 'DELIVERABLES_ASSESSMENT':
      return `${baseContext}

Generate "What if" assessment scenarios that revolutionize evaluation.

Format your response as:
Here are some assessment revolutions:

1. **What if [assessment scenario]?** - [New measurement paradigm]
2. **What if [assessment scenario]?** - [New measurement paradigm]
3. **What if [assessment scenario]?** - [New measurement paradigm]

Think student-designed assessments, community evaluation, portfolio-based.`;

    case 'DELIVERABLES_IMPACT':
      return `${baseContext}

Generate "What if" impact scenarios that change the world.

Format your response as:
Here are some world-changing possibilities:

1. **What if [impact scenario]?** - [Transformative outcome]
2. **What if [impact scenario]?** - [Transformative outcome]
3. **What if [impact scenario]?** - [Transformative outcome]

Think influencing legislation, sparking movements, solving real problems in ${location}.`;
    
    default:
      return `${baseContext}\n\nGenerate provocative "What if" scenarios for ${stage}.`;
  }
}

// Validate responses flexibly
export function validateResponse(input: string, stage: JourneyState, context: PromptContext): {
  isValid: boolean;
  suggestions?: string;
  severity: 'error' | 'warning' | 'info';
} {
  const trimmed = input.trim();
  
  // Always allow explicit continues
  if (['continue', 'next', 'proceed'].includes(trimmed.toLowerCase())) {
    return { isValid: true, severity: 'info' };
  }
  
  // Stage-specific validation (gentler, more flexible)
  switch (stage) {
    case 'IDEATION_BIG_IDEA':
      if (trimmed.length < 5) {
        return {
          isValid: false,
          severity: 'warning',
          suggestions: 'A Big Idea usually needs a few words to capture a complete concept. Could you expand on this a bit?'
        };
      }
      
      // Gentle subject alignment check
      const subject = context.wizardData.subject.toLowerCase();
      if (subject.includes('physical education') && trimmed.toLowerCase().includes('plants')) {
        return {
          isValid: true, // Still valid, just offer guidance
          severity: 'info',
          suggestions: `Interesting connection! How might "${trimmed}" relate to movement and physical education? Or would you like to explore ideas more directly connected to ${context.wizardData.subject}?`
        };
      }
      break;
      
    case 'IDEATION_EQ':
      if (!trimmed.includes('?')) {
        return {
          isValid: false,
          severity: 'warning',
          suggestions: 'Essential Questions need a question mark. Try rephrasing this as an open-ended question.'
        };
      }
      break;
      
    // More validation...
  }
  
  return { isValid: true, severity: 'info' };
}

// Generate contextual help suggestions
export function generateHelpPrompt(stage: JourneyState, subject: string, ageGroup: string, location: string, data: JourneyDataV3): string {
  const baseContext = `Context: Teaching ${subject} to ${ageGroup} students in ${location}.`;
  
  switch (stage) {
    case 'IDEATION_BIG_IDEA':
      return `${baseContext}

You're helping a teacher understand Big Ideas. Provide:

1. A brief, friendly explanation of what makes a strong Big Idea (2-3 sentences)
2. Why Big Ideas matter for student engagement
3. Three specific, contextually relevant Big Idea examples for ${subject}

Format as:
Let me help you craft a powerful Big Idea! [explanation]

Here are some examples that work well for ${subject}:

1. **[Specific Big Idea]** - [How it transforms learning]
2. **[Specific Big Idea]** - [How it transforms learning]
3. **[Specific Big Idea]** - [How it transforms learning]

Keep the tone conversational and inspiring.`;
      
    case 'IDEATION_EQ':
      return `${baseContext}
Big Idea: "${data.stageData.ideation.bigIdea}"

Help the teacher craft an Essential Question. Provide:

1. Quick explanation of what makes questions "essential" (2 sentences)
2. How to connect questions to their Big Idea
3. Three specific Essential Questions that explore "${data.stageData.ideation.bigIdea}"

Format as:
Let's turn your Big Idea into a driving question! [explanation]

Here are some Essential Questions that explore "${data.stageData.ideation.bigIdea}":

1. **[Specific Question]** - [Why it sparks inquiry]
2. **[Specific Question]** - [Why it sparks inquiry]
3. **[Specific Question]** - [Why it sparks inquiry]

Make questions open-ended and thought-provoking.`;
      
    case 'IDEATION_CHALLENGE':
      return `${baseContext}
Essential Question: "${data.stageData.ideation.essentialQuestion}"

Help design an authentic challenge. Provide:

1. What makes a challenge authentic and meaningful (2 sentences)
2. Connection to real-world application
3. Three specific challenges aligned with their question

Format as:
Now for the exciting part - the real-world challenge! [explanation]

Here are some authentic challenges for your students:

1. **[Specific Challenge]** - [Real impact/audience]
2. **[Specific Challenge]** - [Real impact/audience]
3. **[Specific Challenge]** - [Real impact/audience]

Focus on genuine purpose and ${location} community connections.`;
      
    default:
      return `${baseContext}\n\nProvide helpful guidance for ${stage} with practical examples relevant to ${subject} and ${ageGroup} students.`;
  }
}