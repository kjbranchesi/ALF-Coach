/**
 * Enhanced Conversational Flow v1.0
 * Establishes correct mental model: Teachers DESIGN curriculum for students who JOURNEY through Creative Process
 * Professional, warm, Apple-like sophistication without emojis or cutesy language
 */

import { type SOPStage } from '../core/types/SOPTypes';
import { type WizardData } from '../features/wizard/wizardSchema';

// CRITICAL MENTAL MODEL TO ESTABLISH
const CORE_MENTAL_MODEL = {
  teacher: "You are the curriculum designer, architect of learning experiences",
  student: "Your students will journey through the creative process you design",
  ai: "I'm your expert colleague, here to guide the design process",
  relationship: "We're creating something FOR your students, not WITH them"
};

// OPENING CONVERSATIONS - Establish Mental Model
export const OPENING_MESSAGES = {
  WELCOME: {
    title: "Welcome to ALF Coach",
    content: `I'm your curriculum design partner. Together, we'll create a transformative learning experience that guides your students through a structured creative process.

**Here's how this works:**
- **You design** the learning framework
- **Your students journey** through the creative process you create
- **I provide** expert guidance throughout our design session

This isn't about creating curriculum with your students present—this is about you as the professional educator crafting something powerful for them to experience later.`,
    tone: "professional-welcome"
  },

  MENTAL_MODEL_CLARIFICATION: {
    title: "Your Role as Learning Designer",
    content: `You're about to design a complete learning experience. Think of yourself as an architect:

**The Foundation (Ideation):** We'll establish your big idea, essential question, and authentic challenge
**The Structure (Learning Journey):** We'll map phases, activities, and resources your students will navigate
**The Framework (Deliverables):** We'll define milestones, assessment, and real-world impact

Your students aren't here right now—they'll encounter this beautiful design when you implement it in your classroom. Our job is to create something extraordinary for them to experience.`,
    tone: "professional-clarification"
  },

  DESIGN_SESSION_BEGIN: {
    title: "Let's Begin Designing",
    content: `Perfect. Now we'll move through three focused design phases. Each builds on the previous:

**Phase 1: Ideation (10 minutes)**
Establish the conceptual foundation your students will explore

**Phase 2: Learning Journey (15 minutes)**  
Map the progression your students will follow from discovery to creation

**Phase 3: Deliverables (10 minutes)**
Define how your students will demonstrate learning and create impact

Ready to design something transformative? Let's establish your foundational concept.`,
    tone: "professional-invitation"
  }
};

// STAGE TRANSITIONS - Clear progression between phases
export const STAGE_TRANSITIONS = {
  IDEATION_TO_JOURNEY: {
    title: "Foundation Complete → Journey Design",
    content: `Excellent foundation. Your students now have:
- A compelling big idea to explore
- An essential question to guide their thinking  
- An authentic challenge to solve

**Now we design their journey.** We'll map exactly how your students will progress from initial curiosity to final creation. This is where we sequence their learning experience strategically.

Ready to design the learning progression your students will follow?`,
    validation: (data: any) => {
      return data?.ideation?.bigIdea && data?.ideation?.essentialQuestion && data?.ideation?.challenge;
    }
  },

  JOURNEY_TO_DELIVERABLES: {
    title: "Journey Mapped → Success Framework",
    content: `Outstanding learning progression. Your students will have:
- Clear phases to navigate their learning
- Engaging activities at each stage
- Necessary resources and support

**Now we define success.** We'll establish the milestones, assessment criteria, and real-world impact that will guide both you and your students toward excellence.

Ready to design the framework that ensures every student succeeds?`,
    validation: (data: any) => {
      return data?.journey?.phases && data?.journey?.activities && data?.journey?.resources;
    }
  },

  DELIVERABLES_TO_COMPLETION: {
    title: "Blueprint Complete → Implementation Ready",
    content: `Exceptional work. You've created a complete learning experience with:
- Solid conceptual foundation
- Strategic learning progression  
- Clear success framework

Your curriculum blueprint is now ready for implementation. Your students will have everything they need to journey through this transformative creative process.

Let's review your complete design and prepare your implementation materials.`,
    validation: (data: any) => {
      return data?.deliverables?.milestones && data?.deliverables?.rubric && data?.deliverables?.impact;
    }
  }
};

// PHASE PROMPTS - Key prompts for each Creative Process phase
export const CREATIVE_PROCESS_PROMPTS = {
  IDEATION: {
    BIG_IDEA: {
      prompt: "What's the central concept you want your students to explore deeply?",
      guidance: "This should be something that connects to their world but transforms how they see your subject area. Think beyond textbook topics to ideas that matter in life.",
      examples: "Community resilience, The power of story, Innovation through constraints",
      clarification: "Your students will spend weeks exploring this concept through multiple lenses and activities."
    },
    
    ESSENTIAL_QUESTION: {
      prompt: "What thought-provoking question will guide your students' inquiry throughout this experience?",
      guidance: "This question should be open-ended, require deep thinking, and connect to real-world significance. Students will return to this question repeatedly.",
      examples: "How can individual actions create collective change? What makes a story worth telling? How do limitations spark innovation?",
      clarification: "This question will frame every activity and discussion your students have during the project."
    },
    
    CHALLENGE: {
      prompt: "What authentic, real-world challenge will your students work to address?",
      guidance: "This should feel meaningful to students, connect to your community, and require them to apply what they're learning in service of something larger.",
      examples: "Design solutions for neighborhood accessibility, Create multimedia stories for local historical preservation, Develop sustainable practices for your school",
      clarification: "Your students will work on this challenge throughout the entire learning experience, building toward real solutions and impact."
    }
  },

  JOURNEY: {
    PHASES: {
      prompt: "How will your students progress from initial curiosity to final creation?",
      guidance: "Think about the natural learning sequence. What needs to happen first, second, third? Keep phases clear and manageable—usually 3-4 works best.",
      examples: "Discover → Investigate → Design → Impact | Explore → Create → Test → Share",
      clarification: "These phases will structure your entire unit timeline. Students will know where they are in the process at all times."
    },
    
    ACTIVITIES: {
      prompt: "What specific learning experiences will you design for each phase?",
      guidance: "Mix individual reflection, collaborative work, hands-on creation, and sharing opportunities. Consider different learning styles and engagement levels.",
      examples: "Community interviews, design thinking workshops, prototype building, public presentations",
      clarification: "These activities will fill your daily lesson plans. Think about what students will actually be doing during class time."
    },
    
    RESOURCES: {
      prompt: "What materials, tools, and support will your students need to succeed?",
      guidance: "Consider physical materials, digital tools, human resources, and reference materials. Think practically about what you can actually provide or access.",
      examples: "Guest experts, maker space materials, research databases, presentation equipment",
      clarification: "This is your shopping list and planning checklist. Include everything students will need access to."
    }
  },

  DELIVERABLES: {
    MILESTONES: {
      prompt: "What are the key checkpoints where students will share progress and receive feedback?",
      guidance: "These should build toward the final outcome while providing multiple opportunities for guidance and celebration of growth.",
      examples: "Research presentation, first prototype, peer feedback session, final showcase",
      clarification: "These milestones help you monitor progress and help students see their growth journey."
    },
    
    ASSESSMENT: {
      prompt: "What criteria will define success for both you and your students?",
      guidance: "Create clear, meaningful criteria that value both process and product. Students should understand exactly what excellence looks like.",
      examples: "Research quality, creative problem-solving, collaboration skills, communication effectiveness",
      clarification: "This becomes your grading rubric and students' success roadmap. Make it transparent and achievable."
    },
    
    IMPACT: {
      prompt: "Who is the authentic audience, and how will your students share their work beyond your classroom?",
      guidance: "Real impact requires real audiences. Consider your community connections and how student work can make an actual difference.",
      examples: "City council presentation, community fair exhibition, social media campaign, school board proposal",
      clarification: "This gives students' work genuine purpose and connects learning to the world beyond school."
    }
  }
};

// ERROR RECOVERY - When teachers get confused about their role
export const ERROR_RECOVERY_MESSAGES = {
  ROLE_CONFUSION: {
    trigger: /students? (will|should|can) (help|decide|choose|design)/i,
    response: `I notice you're thinking about including students in the design process. Let me clarify our current work:

**Right now:** You're designing the learning experience framework
**Later:** Your students will journey through what you create
**Your role:** Curriculum architect and learning designer
**Students' role:** Creative explorers within your designed framework

We're creating the structure, activities, and guidelines that will guide your students through their creative process. They'll have plenty of choice and agency within the framework you design.

Should we continue designing the learning experience for your students?`
  },

  SCOPE_CONFUSION: {
    trigger: /with.{0,10}students?|students?.{0,10}present|students?.{0,10}here/i,
    response: `This design session is for you as the educator. Your students aren't part of this conversation—they'll experience the learning journey you create during implementation.

Think of this like architectural planning: we're creating the blueprint for an amazing learning experience. Your students will inhabit and explore the "building" we design, but right now we're in the planning phase.

You're making professional decisions about curriculum design based on your expertise and knowledge of your students.

Ready to continue designing their learning experience?`
  },

  IMPLEMENTATION_CONFUSION: {
    trigger: /how.{0,15}(implement|teach|deliver|run)/i,
    response: `Great question about implementation. Here's the distinction:

**Design Phase (now):** We create the complete learning framework
**Implementation Phase (later):** You facilitate students through the experience we design

Right now we're establishing what your students will do, learn, and create. When you implement this blueprint, you'll guide them through each phase we design.

The beauty of this approach is that you'll have a complete roadmap before you begin teaching, making implementation smooth and confident.

Let's continue designing the framework first, then we'll prepare your implementation materials.`
  },

  CONTENT_CONFUSION: {
    trigger: /curriculum|standards|textbook|lessons?/i,
    response: `Excellent educator thinking. You're absolutely right to consider curriculum alignment and content coverage.

**What we're designing:** A project-based learning experience that naturally integrates your content standards
**How it works:** Students master curriculum content while working on meaningful, authentic challenges
**Your expertise:** You'll see how traditional content fits naturally into this engaging framework

This approach doesn't replace curriculum—it makes curriculum come alive through purposeful application. Students learn content more deeply when it's connected to real challenges.

Ready to continue designing this engaging approach to your curriculum?`
  }
};

// CELEBRATION & COMPLETION MESSAGES
export const CELEBRATION_MESSAGES = {
  IDEATION_COMPLETE: {
    title: "Foundation Excellence",
    content: `Outstanding conceptual design. You've established a learning foundation that will:
- Engage students with a meaningful big idea
- Guide deep thinking through essential questioning
- Connect learning to authentic real-world challenges

Your students will begin their creative journey with clear purpose and direction. This foundation will anchor everything they do throughout the experience.

Ready to design their learning progression?`
  },

  JOURNEY_COMPLETE: {
    title: "Learning Path Mastery", 
    content: `Exceptional journey design. You've created a learning progression that will:
- Guide students through logical, engaging phases
- Provide varied, meaningful learning experiences
- Support success with necessary resources and tools

Your students will have a clear roadmap from curiosity to creation, with engaging activities at every step. This journey will keep them motivated and progressing.

Ready to establish the success framework?`
  },

  DELIVERABLES_COMPLETE: {
    title: "Success Framework Complete",
    content: `Masterful assessment design. You've established a framework that will:
- Provide clear checkpoints for progress and feedback
- Define success criteria that inspire excellence  
- Create authentic impact beyond the classroom walls

Your students will know exactly what success looks like and how their work matters in the real world. This framework ensures meaningful learning and genuine accomplishment.

Ready to review your complete blueprint?`
  },

  BLUEPRINT_COMPLETE: {
    title: "Curriculum Blueprint Mastery",
    content: `Congratulations. You've designed a transformative learning experience that demonstrates true educational expertise.

**Your Achievement:**
- Created engaging curriculum that connects content to purpose
- Designed student experiences that build toward real impact
- Established clear success frameworks that inspire excellence

**What You've Built:**
Your students will journey through a carefully crafted creative process that transforms both their learning and their confidence as creators and problem-solvers.

**Implementation Ready:**
You now have everything needed to guide your students through this powerful learning experience. Your expertise and intentional design will create lasting impact.

This is curriculum design at its finest. Your students are fortunate to have an educator who creates such thoughtful, engaging learning experiences.`
  },

  MILESTONE_CELEBRATIONS: {
    PHASE_COMPLETE: "Excellent progress. This phase of design shows real educational insight.",
    BREAKTHROUGH_MOMENT: "That's a breakthrough insight. Your students will benefit tremendously from that thinking.",
    CREATIVE_SOLUTION: "Brilliant approach. You're thinking like the expert educator you are.",
    AUTHENTIC_CONNECTION: "Perfect real-world connection. That authenticity will energize your students.",
    STUDENT_CENTERED_DESIGN: "Beautiful student-centered thinking. This shows deep understanding of learning design."
  }
};

// VALIDATION MESSAGES - Gentle guidance when input needs refinement
export const VALIDATION_MESSAGES = {
  BIG_IDEA_REFINEMENT: {
    too_narrow: "That's a solid start. How might we expand this concept to give students multiple ways to explore and connect?",
    too_broad: "Excellent thinking. Can we focus this powerful concept into something students can explore deeply in your timeframe?",
    misaligned: "I can see the connection to your subject area. How might we make this concept more directly relevant to your students' world?"
  },

  ESSENTIAL_QUESTION_REFINEMENT: {
    not_question: "Great concept. How might we turn this into an open-ended question that will guide student inquiry?",
    too_specific: "Good direction. Can we broaden this question to allow for multiple valid student perspectives and solutions?",
    missing_depth: "Solid foundation. How might we deepen this question to require significant thinking throughout the project?"
  },

  CHALLENGE_REFINEMENT: {
    inauthentic: "Good start. How might we connect this more directly to real issues your students care about or your community faces?",
    too_complex: "Ambitious thinking. Can we scale this challenge to match your timeline and students' developmental level?",
    missing_audience: "Excellent challenge concept. Who would be the authentic audience interested in your students' solutions?"
  }
};

// HELPER FUNCTIONS
export const generateContextualMessage = (
  stage: SOPStage,
  step: number,
  wizardData: WizardData,
  capturedData?: any
): string => {
  const gradeLevel = wizardData.students?.gradeLevel || 'middle school';
  const subject = wizardData.subject || 'your subject';
  const timeline = wizardData.timeline || '4 weeks';
  
  const contextPrefix = `For your ${gradeLevel} students in ${subject} over ${timeline}:`;
  
  // Return contextually appropriate prompts based on stage and step
  return contextPrefix;
};

export const detectTeacherConfusion = (input: string): string | null => {
  for (const [key, config] of Object.entries(ERROR_RECOVERY_MESSAGES)) {
    if (config.trigger.test(input)) {
      return config.response;
    }
  }
  return null;
};

export const getCelebrationMessage = (achievement: keyof typeof CELEBRATION_MESSAGES): string => {
  return CELEBRATION_MESSAGES[achievement]?.content || "Excellent work on this phase of design.";
};