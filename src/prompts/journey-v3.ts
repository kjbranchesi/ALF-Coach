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
      return buildIdeationClarifier(journeyData);

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
      return buildJourneyClarifier(journeyData);

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
      return buildDeliverablesClarifier(journeyData);

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
function buildIdeationClarifier(data: JourneyDataV3): string {
  const ideation = data.stageData.ideation;
  
  return `Let's review what we've created:

**Big Idea**: ${ideation.bigIdea || '[Not set]'}
**Essential Question**: ${ideation.essentialQuestion || '[Not set]'}  
**Challenge**: ${ideation.challenge || '[Not set]'}

Does this foundation feel strong and aligned? You can:
- Type "continue" to move forward
- Type "edit [element]" to refine something (e.g., "edit big idea")
- Ask questions if you're unsure

What would you like to do?`;
}

function buildJourneyClarifier(data: JourneyDataV3): string {
  const journey = data.stageData.journey;
  
  return `Let's review your learning journey design:

**Phases**: ${journey.phases || '[Not set]'}
**Activities**: ${journey.activities || '[Not set]'}
**Resources**: ${journey.resources || '[Not set]'}

Does this journey feel engaging and achievable? You can:
- Type "continue" to proceed
- Type "edit [element]" to refine (e.g., "edit activities")
- Ask for suggestions

What's next?`;
}

function buildDeliverablesClarifier(data: JourneyDataV3): string {
  const deliverables = data.stageData.deliverables;
  
  return `Let's review your assessment and impact plan:

**Milestones**: ${deliverables.milestones || '[Not set]'}
**Assessment**: ${deliverables.assessment || '[Not set]'}
**Impact**: ${deliverables.impact || '[Not set]'}

Does this create authentic, meaningful outcomes? You can:
- Type "continue" to finalize
- Type "edit [element]" to adjust
- Ask questions

Ready to complete your blueprint?`;
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

Present each idea with a title and explanation. Format as:
[Title]: [Explanation]`;

    case 'IDEATION_EQ':
      return `${baseContext}
Big Idea: "${data.stageData.ideation.bigIdea}"

Generate 4 Essential Questions that could drive deep inquiry into this Big Idea.

Consider:
- Questions that have multiple valid answers
- Questions that matter beyond school
- Questions students would genuinely want to explore

Present naturally, explaining the power of each question.`;

    case 'IDEATION_CHALLENGE':
      return `${baseContext}
Essential Question: "${data.stageData.ideation.essentialQuestion}"

Generate 4 authentic challenges that let students explore this question through real action.

Consider:
- Tasks with genuine purpose/audience
- Opportunities for creative solutions
- Connection to ${location} community needs
- Age-appropriate complexity

Present each challenge with its real-world value.`;

    case 'JOURNEY_PHASES':
      return `${baseContext}
Challenge: "${data.stageData.ideation.challenge}"

Generate 4 different phase structures for this ${subject} journey.

Consider varied approaches like:
- Inquiry → Research → Create → Share
- Explore → Experiment → Design → Impact
- Wonder → Investigate → Build → Reflect

Present each with a brief rationale for ${ageGroup} learners.`;

    case 'JOURNEY_ACTIVITIES':
      return `${baseContext}
Phases: ${data.stageData.journey.phases}

Generate engaging activities for each phase that:
- Build ${subject} skills progressively
- Include hands-on experiences
- Foster collaboration
- Connect to the challenge

Present as a natural flow of learning experiences.`;

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
      
Generate 2-3 "What if" scenarios that reimagine how we teach ${subject}.

Push boundaries. Challenge assumptions. Dream big.
What if traditional approaches were turned upside down?

Present as thought-provoking scenarios with brief explorations of possibility.`;

    case 'IDEATION_EQ':
      return `${baseContext}
Big Idea: "${data.stageData.ideation.bigIdea}"

Generate 2-3 "What if" questions that push the boundaries of this concept.

What if we approached this from completely unexpected angles?
What if students had unlimited resources?
What if the whole community was involved?

Present bold, imaginative possibilities.`;

    case 'IDEATION_CHALLENGE':
      return `${baseContext}
Essential Question: "${data.stageData.ideation.essentialQuestion}"

Generate 2-3 "What if" challenge scenarios that break conventional limits.

What if students could present to world leaders?
What if they had professional tools and mentors?
What if their work could change policy?

Dream big for ${ageGroup} changemakers.`;

    case 'JOURNEY_PHASES':
      return `${baseContext}

Generate 2-3 "What if" journey structures that revolutionize learning.

What if students designed their own pathway?
What if the classroom had no walls?
What if every phase connected to real experts?

Present radical reimaginings of the learning journey.`;

    case 'JOURNEY_ACTIVITIES':
      return `${baseContext}

Generate 2-3 "What if" activity scenarios that transform engagement.

What if students taught the community?
What if they had access to cutting-edge technology?
What if learning happened 24/7 in unexpected places?

Push beyond traditional classroom activities.`;

    case 'JOURNEY_RESOURCES':
      return `${baseContext}

Generate 2-3 "What if" resource scenarios that expand possibilities.

What if you had unlimited budget?
What if global experts volunteered to help?
What if students could access any tool or space?

Dream beyond typical constraints.`;

    case 'DELIVERABLES_MILESTONES':
      return `${baseContext}

Generate 2-3 "What if" milestone scenarios that redefine success.

What if milestones were public celebrations?
What if students presented at professional conferences?
What if each milestone went viral?

Imagine extraordinary showcases of learning.`;

    case 'DELIVERABLES_ASSESSMENT':
      return `${baseContext}

Generate 2-3 "What if" assessment scenarios that revolutionize evaluation.

What if students designed their own assessments?
What if the community evaluated impact?
What if portfolio replaced all tests?

Reimagine how we measure success.`;

    case 'DELIVERABLES_IMPACT':
      return `${baseContext}

Generate 2-3 "What if" impact scenarios that change the world.

What if student work influenced legislation?
What if it sparked a movement?
What if it solved a real community problem?

Dream of transformative student impact in ${location}.`;
    
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