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
      return `# Welcome to ProjectCraft! 🚀

I'm your AI design partner, here to help you create a transformative ${subject} experience for your ${ageGroup} students.

## Our Journey Together

We'll move through **4 collaborative stages**:

**1. 🎯 Ideation** (10 min)
   Transform your teaching goals into a compelling foundation

**2. 🗺️ Learning Journey** (15 min)
   Design phases, activities, and resources that bring ideas to life

**3. 📊 Deliverables** (10 min)
   Define milestones, assessment, and authentic impact

**4. 🎉 Publish** (5 min)
   Review and export your complete blueprint

${additionalContext ? `\n**Your Context**: ${additionalContext}\n` : ''}
Throughout our conversation, I'll offer:
- 💡 **Ideas** - Curated suggestions based on your context
- 🔄 **What-Ifs** - Creative possibilities to explore
- ❓ **Help** - Guidance whenever you need it

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

    // ... continue for other stages

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

Present as a natural list with brief explanations of why each would resonate.`;

    case 'IDEATION_EQ':
      return `${baseContext}
Big Idea: "${data.stageData.ideation.bigIdea}"

Generate 4 Essential Questions that could drive deep inquiry into this Big Idea.

Consider:
- Questions that have multiple valid answers
- Questions that matter beyond school
- Questions students would genuinely want to explore

Present naturally, explaining the power of each question.`;

    // Add other stages...
    
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

    // Add other stages...
    
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