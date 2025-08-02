/**
 * GeminiService.ts - Clean, simple Gemini AI integration
 * No unnecessary abstractions or layers
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { type SuggestionCard, type SOPStep } from '../core/types/SOPTypes';

interface GeminiConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface GenerateOptions {
  step: SOPStep;
  context: any;
  action: 'ideas' | 'whatif' | 'help' | 'response';
  userInput?: string;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private config: GeminiConfig = {
    model: 'gemini-2.0-flash',
    temperature: 0.7,
    maxTokens: 800,
    apiKey: ''
  };

  async initialize() {
    // Support both Vite and Netlify environment variables
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 
                   import.meta.env.REACT_APP_GEMINI_API_KEY ||
                   process.env.REACT_APP_GEMINI_API_KEY ||
                   process.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('Gemini API key not found. Running in demo mode.');
      return;
    }

    this.config.apiKey = apiKey;
    this.genAI = new GoogleGenerativeAI(this.config.apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: this.config.model!,
      generationConfig: {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens,
      }
    });
  }

  /**
   * Generate AI response based on current step and action
   */
  async generate(options: GenerateOptions): Promise<{
    message: string;
    suggestions?: SuggestionCard[];
  }> {
    // Use demo responses if no model initialized
    if (!this.model) {
      return this.getDemoResponse(options);
    }
    
    const prompt = this.buildPrompt(options);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse response based on action type
      if (options.action === 'ideas' || options.action === 'whatif') {
        return this.parseSuggestionResponse(text, options.action);
      }
      
      return { message: text.trim() };
    } catch (error) {
      console.error('Gemini generation error:', error);
      return { 
        message: "I'm having trouble generating a response. Please try again." 
      };
    }
  }

  /**
   * Get demo response when API key is not available
   */
  private getDemoResponse(options: GenerateOptions): {
    message: string;
    suggestions?: SuggestionCard[];
  } {
    const { step, action } = options;
    
    // Provide contextual demo responses
    if (action === 'ideas') {
      return {
        message: "Here are some ideas to consider:",
        suggestions: [
          { id: 'demo-1', text: 'Explore local community partnerships', category: 'idea' },
          { id: 'demo-2', text: 'Create a student-led research project', category: 'idea' },
          { id: 'demo-3', text: 'Design a real-world problem-solving challenge', category: 'idea' }
        ]
      };
    }
    
    if (action === 'whatif') {
      return {
        message: "What if we approached it this way:",
        suggestions: [
          { id: 'demo-1', text: 'What if students presented to real stakeholders?', category: 'whatif' },
          { id: 'demo-2', text: 'What if we partnered with another classroom?', category: 'whatif' },
          { id: 'demo-3', text: 'What if students chose their own challenge?', category: 'whatif' }
        ]
      };
    }
    
    return {
      message: "I'm here to help you create an engaging active learning experience. What aspect would you like to explore?"
    };
  }

  /**
   * Build prompt based on current step and action
   */
  private buildPrompt(options: GenerateOptions): string {
    const { step, context, action, userInput } = options;
    
    // Base context about the educator and project
    const stageNames = {
      'IDEATION_BIG_IDEA': 'Stage 1: Ideation - Big Idea',
      'IDEATION_EQ': 'Stage 1: Ideation - Essential Question', 
      'IDEATION_CHALLENGE': 'Stage 1: Ideation - Challenge',
      'JOURNEY_PHASES': 'Stage 2: Learning Journey - Phases',
      'JOURNEY_ACTIVITIES': 'Stage 2: Learning Journey - Activities',
      'JOURNEY_RESOURCES': 'Stage 2: Learning Journey - Resources',
      'DELIVER_MILESTONES': 'Stage 3: Student Deliverables - Milestones',
      'DELIVER_RUBRIC': 'Stage 3: Student Deliverables - Rubric',
      'DELIVER_IMPACT': 'Stage 3: Student Deliverables - Impact Plan'
    };
    
    const currentStageInfo = stageNames[step] || `Current Step: ${step}`;
    
    const baseContext = `
You are an ALF Coach helping an educator design an active learning experience.

CURRENT LOCATION: ${currentStageInfo}

Project Context:
- Subject: ${context.wizard?.subject || 'Not specified'}
- Students: ${context.wizard?.students || 'Not specified'}
- Scope: ${context.wizard?.scope || 'unit'}
- Vision: ${context.wizard?.vision || 'Not specified'}

Current Progress:
- Big Idea: ${context.ideation?.bigIdea || 'Not yet defined'}
- Essential Question: ${context.ideation?.essentialQuestion || 'Not yet defined'}
- Challenge: ${context.ideation?.challenge || 'Not yet defined'}

IMPORTANT: 
- Be conversational and natural, like a helpful colleague
- Avoid phrases like "Based on educational research" 
- Don't repeat student demographics in every response
- Keep responses concise and actionable
- Respond in plain text, never JSON
- Focus your response on the current stage context
`;

    // Step-specific prompts
    const stepPrompts = this.getStepPrompts(step, action, context, userInput);
    
    // User input if provided
    const userContext = userInput ? `\nEducator's input: "${userInput}"` : '';
    
    return `${baseContext}\n${stepPrompts}${userContext}`;
  }

  /**
   * Get step-specific prompts
   */
  private getStepPrompts(step: SOPStep, action: string, context: any, userInput?: string): string {
    // This would be expanded with specific prompts for each step
    // Keeping it simple for the foundation
    
    switch (step) {
      case 'IDEATION_BIG_IDEA':
        if (action === 'ideas') {
          return `
Generate 3-4 big idea suggestions for this ${context.wizard.subject} project.
Each should be:
- Relevant to real-world issues
- Engaging for ${context.wizard.students}
- Actionable within a ${context.wizard.scope}

Format as numbered list with title and one-sentence description.`;
        }
        if (action === 'help') {
          return `
Explain what makes a good "Big Idea" in the ALF framework.
Provide 2 brief examples relevant to ${context.wizard.subject}.
Keep it conversational and helpful.`;
        }
        if (action === 'response') {
          // Check if user is asking for suggestions
          const needsHelp = userInput && (
            userInput.toLowerCase().includes('not sure') ||
            userInput.toLowerCase().includes('you decide') ||
            userInput.toLowerCase().includes('you choose') ||
            userInput.toLowerCase().includes('help me') ||
            userInput.toLowerCase().includes('no idea') ||
            userInput.toLowerCase().includes('suggest') ||
            userInput.trim().length < 10
          );
          
          if (needsHelp) {
            return `
The educator needs help with a big idea. They said: "${userInput}"

Based on their project setup:
Subject: ${context.wizard.subject}
Students: ${context.wizard.students}
Scope: ${context.wizard.scope}

First acknowledge their request, then generate EXACTLY 3 big ideas:

Format your response like this:
"I understand you'd like some suggestions! Based on your ${context.wizard.subject} ${context.wizard.scope}, here are 3 big ideas that could engage your students:

1. [Big Idea Title]
[One sentence description of what this idea addresses and why it matters]

2. [Big Idea Title]  
[One sentence description of what this idea addresses and why it matters]

3. [Big Idea Title]
[One sentence description of what this idea addresses and why it matters]"

Make sure each big idea is relevant to real-world issues and actionable within their scope.`;
          }
          
          return `
The educator shared their big idea: "${userInput}"
Respond enthusiastically and help them refine it.
- Acknowledge what's strong about their idea
- Suggest one way to make it more specific or engaging
- Keep it brief and encouraging`;
        }
        break;
        
      case 'IDEATION_EQ':
        if (action === 'ideas') {
          return `
Based on the Big Idea "${context.ideation.bigIdea}", suggest 3-4 essential questions.
Each should be:
- Open-ended and thought-provoking
- Drive inquiry throughout the project
- Connect to real-world relevance

Format as numbered list.`;
        }
        if (action === 'response') {
          // Check if user is asking for suggestions
          const needsHelp = userInput && (
            userInput.toLowerCase().includes('not sure') ||
            userInput.toLowerCase().includes('you decide') ||
            userInput.toLowerCase().includes('you choose') ||
            userInput.toLowerCase().includes('help me') ||
            userInput.toLowerCase().includes('no idea') ||
            userInput.toLowerCase().includes('suggest') ||
            userInput.trim().length < 10
          );
          
          if (needsHelp) {
            return `
The educator needs help with an essential question. They said: "${userInput}"

Based on their big idea: "${context.ideation.bigIdea}"

First acknowledge their request, then generate EXACTLY 3 essential questions:

Format your response like this:
"I'll help you craft essential questions for your big idea! Here are 3 thought-provoking questions that could drive this project:

1. [Essential Question]

2. [Essential Question]

3. [Essential Question]"

Make sure each question is open-ended, drives inquiry, and connects to real-world relevance.`;
          }
          
          return `
The educator proposed this essential question: "${userInput}"
For their big idea: "${context.ideation.bigIdea}"

- Acknowledge what makes their question effective
- If needed, suggest how to make it more open-ended or thought-provoking
- Keep response encouraging and brief`;
        }
        break;
        
      case 'IDEATION_CHALLENGE':
        if (action === 'ideas') {
          return `
Based on the Big Idea "${context.ideation.bigIdea}" and Essential Question "${context.ideation.essentialQuestion}", 
suggest 3-4 engaging challenges for students.
Each should be:
- Action-oriented and specific
- Achievable within the project scope
- Meaningful to the students

Format as numbered list.`;
        }
        if (action === 'response') {
          // Check if user is asking for suggestions
          const needsHelp = userInput && (
            userInput.toLowerCase().includes('not sure') ||
            userInput.toLowerCase().includes('you decide') ||
            userInput.toLowerCase().includes('you choose') ||
            userInput.toLowerCase().includes('help me') ||
            userInput.toLowerCase().includes('no idea') ||
            userInput.toLowerCase().includes('suggest') ||
            userInput.trim().length < 10
          );
          
          if (needsHelp) {
            return `
The educator needs help with a challenge. They said: "${userInput}"

Based on their project:
Big Idea: "${context.ideation.bigIdea}"
Essential Question: "${context.ideation.essentialQuestion}"

First acknowledge their request, then generate EXACTLY 3 student challenges:

Format your response like this:
"I'll help you create engaging challenges! Based on your essential question, here are 3 challenges that could motivate your students:

1. [Challenge Title]
[One sentence description of what students will do and create]

2. [Challenge Title]  
[One sentence description of what students will do and create]

3. [Challenge Title]
[One sentence description of what students will do and create]"

Make sure each challenge is action-oriented, achievable, and meaningful to students.`;
          }
          
          return `
The educator defined this challenge: "${userInput}"
For their project on "${context.ideation.bigIdea}"

- Highlight what makes this challenge engaging
- Suggest one way to make it more actionable or specific if needed
- Connect it to the essential question
- Keep it brief and supportive`;
        }
        break;
        
      // JOURNEY STAGE
      case 'JOURNEY_PHASES':
        if (action === 'ideas') {
          return `
Create a complete 3-phase learning journey for this project.
Big Idea: "${context.ideation.bigIdea}"
Challenge: "${context.ideation.challenge}"

Generate EXACTLY 3 phases:
1. Discovery/Research Phase - Students explore and understand the problem
2. Design/Build Phase - Students create their solution
3. Test/Present Phase - Students refine and share their work

For EACH phase provide:
- A specific, engaging title (3-5 words)
- One clear sentence about what students will do

Example format:
Phase 1: Investigate Energy Sources
Students research different types of renewable energy and identify community needs.

Phase 2: Design Solar Solutions  
Students prototype a solar-powered device to address their chosen need.

Phase 3: Power Up the Community
Students test their devices and present solutions to local stakeholders.`;
        }
        if (action === 'response') {
          // Check if user is asking for suggestions
          const needsHelp = userInput && (
            userInput.toLowerCase().includes('not sure') ||
            userInput.toLowerCase().includes('you decide') ||
            userInput.toLowerCase().includes('you choose') ||
            userInput.toLowerCase().includes('help me') ||
            userInput.toLowerCase().includes('suggest') ||
            userInput.toLowerCase().includes('ideas')
          );
          
          if (needsHelp) {
            return `
The educator needs help with learning phases. They said: "${userInput}"

Based on their project:
Big Idea: "${context.ideation.bigIdea}"
Challenge: "${context.ideation.challenge}"

First acknowledge their input, then generate EXACTLY 3 phases for them:

Format your response like this:
"I understand you'd like some suggestions! Based on your [mention something specific about their project], here are 3 phases that could work well:

Phase 1: [Engaging Title]
[One sentence about what students will do in this phase]

Phase 2: [Engaging Title]  
[One sentence about what students will do in this phase]

Phase 3: [Engaging Title]
[One sentence about what students will do in this phase]"

Make sure the phases connect to their essential question and build toward completing the challenge.`;
          }
          
          return `
The educator outlined these learning phases: "${userInput}"
For their ${context.ideation.challenge} challenge.

- Acknowledge the progression they've created
- Suggest how phases connect to the essential question
- Offer one enhancement if helpful
- Stay encouraging and concise`;
        }
        break;
        
      case 'JOURNEY_ACTIVITIES':
        if (action === 'ideas') {
          return `
Based on the learning phases, suggest EXACTLY 3 specific activities that:
- Engage students with the challenge: "${context.ideation.challenge}"
- Are appropriate for ${context.wizard.students}
- Can be completed within the timeframe

Format as numbered list.`;
        }
        if (action === 'response') {
          // Check if user is asking for suggestions
          const needsHelp = userInput && (
            userInput.toLowerCase().includes('not sure') ||
            userInput.toLowerCase().includes('you decide') ||
            userInput.toLowerCase().includes('you choose') ||
            userInput.toLowerCase().includes('help me') ||
            userInput.toLowerCase().includes('suggest') ||
            userInput.toLowerCase().includes('what would be')
          );
          
          if (needsHelp) {
            return `
The educator needs help with activities. They said: "${userInput}"

Based on their project:
Challenge: "${context.ideation.challenge}"
Students: ${context.wizard.students}
Phases: ${context.journey?.phases?.map(p => p.title).join(', ') || 'as outlined'}

First acknowledge their input, then generate EXACTLY 3 engaging activities:

Format your response like this:
"I can definitely help with that! Based on your ${context.ideation.challenge} challenge, here are 3 activities that would engage your students:

1. [Activity Name]
[Brief description of what students will do and how it connects to the learning goals]

2. [Activity Name]  
[Brief description of what students will do and how it connects to the learning goals]

3. [Activity Name]
[Brief description of what students will do and how it connects to the learning goals]"

Make sure activities are hands-on, collaborative, and directly support the challenge.`;
          }
          
          return `
The educator described these activities: "${userInput}"
For ${context.wizard.students} working on "${context.ideation.challenge}"

- Highlight what's engaging about these activities
- Connect them to the learning goals
- Suggest one practical tip if relevant
- Keep response supportive and brief`;
        }
        break;
        
      case 'JOURNEY_RESOURCES':
        if (action === 'ideas') {
          return `
Suggest EXACTLY 3 resources or tools students will need for this project:
- Consider both digital and physical resources
- Think about what's accessible for ${context.wizard.students}
- Include learning materials and creation tools

Format as numbered list.`;
        }
        if (action === 'response') {
          // Check if user is asking for suggestions
          const needsHelp = userInput && (
            userInput.toLowerCase().includes('not sure') ||
            userInput.toLowerCase().includes('you decide') ||
            userInput.toLowerCase().includes('you choose') ||
            userInput.toLowerCase().includes('help me') ||
            userInput.toLowerCase().includes('suggest')
          );
          
          if (needsHelp) {
            return `
The educator needs help with resources. They said: "${userInput}"

Based on their project:
Challenge: "${context.ideation.challenge}"
Activities: ${context.journey?.activities?.join(', ') || 'as planned'}

First acknowledge their request, then generate EXACTLY 3 essential resources:

Format your response like this:
"I'll help you identify the key resources! Based on your ${context.ideation.challenge} project, here are 3 essential resources your students will need:

1. [Resource Name/Type]
[Brief description of what it is and how students will use it]

2. [Resource Name/Type]  
[Brief description of what it is and how students will use it]

3. [Resource Name/Type]
[Brief description of what it is and how students will use it]"

Include a mix of digital tools, learning materials, and creation resources. Consider free/accessible options.`;
          }
          
          return `
The educator listed these resources: "${userInput}"
For their project activities.

- Acknowledge their resource planning
- Suggest one additional resource type if missing
- Consider accessibility for all students
- Stay brief and practical`;
        }
        break;
        
      // DELIVERABLES STAGE
      case 'DELIVER_MILESTONES':
        if (action === 'ideas') {
          return `
Create 3 milestone deliverables that align with the 3 learning phases.
Challenge: "${context.ideation.challenge}"

Generate EXACTLY 3 milestones (one per phase):
1. Phase 1 Milestone - What students produce from research/discovery
2. Phase 2 Milestone - What students create during design/build
3. Phase 3 Milestone - Final presentation/demonstration

For EACH milestone provide:
- A specific deliverable name
- Brief description of what students will create

Example format:
Milestone 1: Research Portfolio
A comprehensive collection of research findings, interviews, and problem analysis.

Milestone 2: Working Prototype
A functional prototype or model that demonstrates their solution concept.

Milestone 3: Solution Presentation
A professional presentation with demonstration for community stakeholders.`;
        }
        if (action === 'response') {
          // Check if user is asking for suggestions
          const needsHelp = userInput && (
            userInput.toLowerCase().includes('not sure') ||
            userInput.toLowerCase().includes('you decide') ||
            userInput.toLowerCase().includes('you choose') ||
            userInput.toLowerCase().includes('help me') ||
            userInput.toLowerCase().includes('suggest')
          );
          
          if (needsHelp) {
            return `
The educator needs help with milestones. They said: "${userInput}"

Based on their project:
Challenge: "${context.ideation.challenge}"
Journey Phases: ${context.journey?.phases?.map(p => p.title).join(', ') || 'as planned'}

First acknowledge their request, then generate EXACTLY 3 milestone deliverables (one per phase):

Format your response like this:
"I'll help you create meaningful milestones! Based on your ${context.ideation.challenge} challenge, here are 3 milestones aligned with each phase:

Milestone 1: [Deliverable Name]
[Brief description of what students will create in Phase 1]

Milestone 2: [Deliverable Name]  
[Brief description of what students will create in Phase 2]

Milestone 3: [Deliverable Name]
[Brief description of what students will create in Phase 3]"

Make sure each milestone demonstrates clear progress toward completing the challenge.`;
          }
          
          return `
You're helping define student milestones for Stage 3: Student Deliverables.

The educator has shared their ideas for milestones. Respond encouragingly and help them refine their milestone plans. Consider:
- How these milestones demonstrate progress on the challenge: "${context.ideation.challenge}"
- Whether they're appropriate for ${context.wizard.students}
- How they connect to the essential question: "${context.ideation.essentialQuestion}"

Keep your response focused on refining and improving their milestone ideas.`;
        }
        if (action === 'help') {
          return `
Explain what makes effective student milestones in Stage 3: Student Deliverables.
Focus on milestones that:
- Show clear learning progression
- Are meaningful to ${context.wizard.students} 
- Connect to their challenge: "${context.ideation.challenge}"

Provide 2 brief examples relevant to ${context.wizard.subject}.`;
        }
        if (action === 'whatif') {
          return `
Generate 3-4 "What if" scenarios for student milestones in Stage 3: Student Deliverables.
Consider creative alternatives like:
- What if students presented to real community members?
- What if milestones included peer collaboration?
- What if students chose their own milestone formats?

Format as numbered list starting with "What if...".`;
        }
        break;
        
      case 'DELIVER_RUBRIC':
        if (action === 'ideas') {
          return `
Suggest 3-4 assessment criteria for evaluating the student deliverables.
Each criterion should:
- Be clear and measurable
- Align with the essential question
- Include different skill levels

Format as numbered list.`;
        }
        if (action === 'response') {
          return `
You're helping design assessment criteria for Stage 3: Student Deliverables.

The educator has shared their rubric ideas. Provide encouraging feedback and help them improve their assessment criteria. Consider:
- How these criteria measure progress on "${context.ideation.essentialQuestion}"
- Whether they're clear and understandable for ${context.wizard.students}
- How they support the learning goals of "${context.ideation.bigIdea}"

Focus on making their rubric more effective and student-friendly.`;
        }
        if (action === 'help') {
          return `
Explain how to create effective rubrics in Stage 3: Student Deliverables.
Focus on criteria that:
- Are clear and student-friendly
- Measure meaningful learning for ${context.wizard.students}
- Align with the essential question: "${context.ideation.essentialQuestion}"

Provide 2 example criteria relevant to ${context.wizard.subject}.`;
        }
        if (action === 'whatif') {
          return `
Generate 3-4 "What if" scenarios for assessment in Stage 3: Student Deliverables.
Consider innovative approaches like:
- What if students created their own success criteria?
- What if assessment included peer feedback?
- What if rubrics focused on growth rather than grades?

Format as numbered list starting with "What if...".`;
        }
        break;
        
      case 'DELIVER_IMPACT':
        if (action === 'ideas') {
          return `
Suggest 3-4 complete impact plans that specify BOTH audience AND method:

Each suggestion should include:
- WHO: Specific authentic audience (e.g., "Elementary students," "Local business owners")
- HOW: Clear sharing method (e.g., "Live presentation," "Published website")

Consider different combinations of audiences and presentation formats.

Format as numbered list with WHO and HOW clearly labeled.`;
        }
        if (action === 'response') {
          return `
You're helping plan impact and sharing strategies for Stage 3: Student Deliverables.

The educator has shared their impact ideas. Help them create a complete impact plan that specifies BOTH:
1. **WHO** - their authentic audience 
2. **HOW** - the sharing method

Consider:
- How students can authentically share their work on "${context.ideation.challenge}"
- What specific audiences would be meaningful for ${context.wizard.students}
- What sharing methods best demonstrate learning from the essential question: "${context.ideation.essentialQuestion}"

If they've only provided one part (audience OR method), guide them to specify the missing piece.`;
        }
        if (action === 'help') {
          return `
Explain how to create meaningful impact opportunities in Stage 3: Student Deliverables.

A complete impact plan needs BOTH parts:
1. **WHO** - Authentic audience (specific people who would benefit)
2. **HOW** - Sharing method (how students will present their work)

Focus on combinations that:
- Connect ${context.wizard.students} to real audiences
- Demonstrate learning from "${context.ideation.challenge}"
- Create authentic impact beyond the classroom

Provide 2 complete example impact plans (WHO + HOW) relevant to ${context.wizard.subject}.`;
        }
        if (action === 'whatif') {
          return `
Generate 3-4 "What if" scenarios for student impact in Stage 3: Student Deliverables.

Each scenario should specify BOTH audience AND method:
- What if students presented their solutions to city council members through a formal presentation?
- What if they taught younger students through interactive workshops?
- What if they shared their findings with local professionals via published reports?

Format as numbered list starting with "What if..." and include WHO and HOW in each scenario.`;
        }
        break;
    }
    
    // Default response prompt with stage context
    const stageContext = step.startsWith('DELIVER_') ? 'Stage 3: Student Deliverables' :
                        step.startsWith('JOURNEY_') ? 'Stage 2: Learning Journey' :
                        step.startsWith('IDEATION_') ? 'Stage 1: Ideation' : 'the current step';
    
    return `
You're currently helping with ${stageContext}.
Respond helpfully to the educator's request about ${step}.
Keep it natural and conversational, and stay focused on the current stage context.`;
  }

  /**
   * Parse suggestion response into cards
   */
  private parseSuggestionResponse(
    text: string, 
    type: 'ideas' | 'whatif'
  ): { message: string; suggestions?: SuggestionCard[] } {
    // Simple parsing - look for numbered lists
    const lines = text.split('\n').filter(line => line.trim());
    const suggestions: SuggestionCard[] = [];
    const introLines: string[] = [];
    
    let foundNumberedItem = false;
    
    for (const line of lines) {
      // Check if it's a numbered item (1. or 1) or **1.**)
      const numberMatch = line.match(/^(\*\*)?(\d+)[\.\)]\s*(.+)/);
      
      if (numberMatch) {
        foundNumberedItem = true;
        const [, , number, content] = numberMatch;
        suggestions.push({
          id: `${type}-${number}`,
          text: content.replace(/\*\*/g, '').trim(),
          category: type as 'idea' | 'whatif'
        });
      } else if (!foundNumberedItem) {
        // Collect intro text before numbered items
        introLines.push(line);
      }
    }
    
    return {
      message: introLines.join(' ').trim() || "Here are some suggestions:",
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  }

  /**
   * Set model (for future when we add Gemini 2.5 with thinking)
   */
  setModel(modelName: string): void {
    this.config.model = modelName;
    this.model = this.genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens,
      }
    });
  }
}