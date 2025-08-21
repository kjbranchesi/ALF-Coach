// Improved GeminiService with natural coaching conversations
// This service focuses on adaptive, contextual coaching rather than rigid templates

import { WizardContextHelper } from './WizardContextHelper';
import { JSONResponseParser } from '../utils/json-response-parser';
import { generateJsonResponse } from './geminiApiCall';
import { logger } from '../utils/logger';

// Simplified coaching personas for different stages
const COACHING_PERSONAS = {
  SUPPORTIVE_COLLEAGUE: `You are an experienced PBL coach having a natural conversation with a colleague. 
You've successfully guided hundreds of educators and understand the challenges they face.

Your approach:
- Listen carefully and respond to what they actually said
- Share wisdom from experience when relevant
- Ask one thoughtful follow-up question at a time
- Be encouraging but also push for quality
- Never make them feel inadequate
- Provide specific, grade-appropriate examples when helpful

Remember: You're their collaborative partner, not their instructor. Use "we" and "let's" language.
Keep responses conversational and concise (2-3 sentences unless they ask for more detail).`,

  CURIOUS_EXPLORER: `You're helping an educator explore possibilities for their project.
Be genuinely curious about their ideas and help them discover deeper connections.
Ask "what if" and "how might" questions that open up new perspectives.`,

  PRACTICAL_GUIDE: `You're helping an educator plan the practical implementation of their project.
Focus on what's realistic and achievable in their specific context.
Anticipate common challenges and offer practical solutions.`
};

export class ImprovedGeminiService {
  // Build natural conversation prompts based on stage and context
  public async generateCoachingResponse(
    stage: string,
    userInput: string,
    context: any,
    action?: string
  ): Promise<any> {
    try {
      // Build conversational prompt based on stage and user needs
      const systemPrompt = this.buildNaturalPrompt(stage, context, action);
      const conversationHistory = this.buildConversationContext(context, userInput);
      
      // Let the AI be more natural and adaptive
      const response = await generateJsonResponse(conversationHistory, systemPrompt);
      
      // Check if user seems confused or stuck
      if (this.detectConfusion(userInput)) {
        return this.generateSupportiveResponse(stage, context, userInput);
      }
      
      return {
        message: response.chatResponse,
        suggestions: action === 'ideas' ? await this.generateContextualSuggestions(stage, context) : [],
        shouldProgress: this.assessReadinessToProgress(userInput, stage, context)
      };
    } catch (error) {
      logger.error('Coaching response generation failed:', error);
      return this.generateFallbackResponse(stage);
    }
  }

  private buildNaturalPrompt(stage: string, context: any, action?: string): string {
    // Start with the appropriate persona
    let prompt = COACHING_PERSONAS.SUPPORTIVE_COLLEAGUE;
    
    // Add context about where we are in the conversation
    const wizardContext = WizardContextHelper.generateContextualPromptPrefix(context);
    prompt += `\n\nContext about this educator:\n${wizardContext}`;
    
    // Add stage-specific guidance without rigid templates
    prompt += this.getStageGuidance(stage, context);
    
    // Handle special actions naturally
    if (action === 'ideas') {
      prompt += `\n\nThey've asked for ideas. Generate 3-4 contextual suggestions that build on what they've shared so far.`;
    } else if (action === 'help') {
      prompt += `\n\nThey seem confused or stuck. Provide gentle clarification and offer a simpler path forward.`;
    }
    
    return prompt;
  }

  private getStageGuidance(stage: string, context: any): string {
    const guidance: Record<string, string> = {
      'BIG_IDEA': `
We're helping them develop their Big Idea - the conceptual lens for their project.
${context?.ideation?.bigIdea ? `They've shared: "${context.ideation.bigIdea}"` : ''}

Help them distinguish between topics (what they'll study) and concepts (the deeper understanding).
For their ${context?.wizard?.gradeLevel || 'grade level'}, what enduring understanding should students gain?

If they give you a topic, help them find the concept beneath it.
If they give you an activity, help them identify the learning behind it.
If they seem stuck, offer a relevant example from their subject area.`,

      'ESSENTIAL_QUESTION': `
We're crafting their Essential Question - the inquiry that drives the entire project.
Big Idea: "${context?.ideation?.bigIdea || 'Not yet defined'}"

Help them create a question that:
- Can't be answered with a quick Google search
- Connects to their students' lives
- Has multiple valid perspectives
- Sustains investigation over ${context?.wizard?.duration || 'the project duration'}

If they provide a closed question, show them how to open it up.
If it's too broad, help them focus it.
Connect it explicitly to their Big Idea.`,

      'CHALLENGE': `
We're defining their Challenge - the authentic task students will complete.
Big Idea: "${context?.ideation?.bigIdea}"
Essential Question: "${context?.ideation?.essentialQuestion}"

Help them identify:
- Who in their community needs this work?
- What real problem can ${context?.wizard?.gradeLevel || 'students'} help solve?
- How can student work have impact beyond the classroom?

If they suggest an academic exercise, help them find the real-world connection.
If it seems too ambitious, help them scope it appropriately.`,

      'JOURNEY': `
We're planning how students will tackle this challenge through four phases.
Current Challenge: "${context?.ideation?.challenge}"

Focus on the phase they're discussing:
- Analyze: What do students need to understand first?
- Brainstorm: How will they generate creative solutions?
- Prototype: What will they create or test?
- Evaluate: How will they know if their solution works?

Be specific about activities that work for ${context?.wizard?.gradeLevel || 'their grade level'}.
Consider their ${context?.wizard?.duration || 'timeline'} constraints.`,

      'DELIVERABLES': `
We're defining what students will create and how it will be assessed.
Project Challenge: "${context?.ideation?.challenge}"

Help them determine:
- What tangible products demonstrate learning?
- How will different learners show their understanding?
- Who is the authentic audience?
- What makes assessment fair and meaningful?

Connect deliverables directly to their Essential Question and Challenge.
Ensure assessment values both process and product.`
    };

    return guidance[stage] || `\n\nHelp them with the current stage: ${stage}`;
  }

  private detectConfusion(userInput: string): boolean {
    const confusionIndicators = [
      'i don\'t understand',
      'what do you mean',
      'i\'m not sure',
      'can you explain',
      'i\'m confused',
      'help me understand',
      'what\'s the difference',
      'i don\'t know'
    ];
    
    const input = userInput.toLowerCase();
    return confusionIndicators.some(indicator => input.includes(indicator));
  }

  private async generateSupportiveResponse(stage: string, context: any, userInput: string): Promise<any> {
    const supportPrompt = `${COACHING_PERSONAS.SUPPORTIVE_COLLEAGUE}

The educator seems confused or stuck. They said: "${userInput}"
Current stage: ${stage}

Provide warm, encouraging support:
1. Acknowledge that this is challenging
2. Simplify the concept using their context
3. Offer a concrete example from their ${context?.wizard?.subject || 'subject area'}
4. Ask a simpler question to help them move forward

Keep it supportive and non-judgmental.`;

    const response = await generateJsonResponse([], supportPrompt);
    
    return {
      message: response.chatResponse,
      suggestions: await this.generateHelpfulExamples(stage, context),
      shouldProgress: false
    };
  }

  private async generateContextualSuggestions(stage: string, context: any): Promise<string[]> {
    const suggestionPrompt = `Based on this educator's specific context and current conversation, generate 3-4 helpful suggestions.

Educator Context:
- Subject: ${context?.wizard?.subject}
- Grade Level: ${context?.wizard?.gradeLevel}
- Project Topic: ${context?.wizard?.projectTopic}
- Current Stage: ${stage}
- What they've shared so far: ${JSON.stringify(context?.ideation || {})}

Generate suggestions that:
1. Build directly on what they've already said
2. Are specific to their grade level and subject
3. Feel like natural next steps, not generic templates
4. Include their local context when relevant

Format: Return as a JSON array of strings.`;

    try {
      const response = await generateJsonResponse([], suggestionPrompt);
      return response.suggestions || [];
    } catch (error) {
      return this.getFallbackSuggestions(stage);
    }
  }

  private assessReadinessToProgress(userInput: string, stage: string, context: any): boolean {
    // Don't auto-progress - look for explicit signals
    const progressSignals = [
      'that works',
      'let\'s move on',
      'what\'s next',
      'i\'m ready',
      'that sounds good',
      'yes, let\'s continue',
      'perfect',
      'great, next'
    ];
    
    const input = userInput.toLowerCase();
    const hasProgressSignal = progressSignals.some(signal => input.includes(signal));
    
    // Also check if they've provided substantive content for the current stage
    const hasSubstantiveContent = userInput.length > 20 && !this.detectConfusion(userInput);
    
    // Only progress if they explicitly want to OR have clearly completed the stage
    return hasProgressSignal || (hasSubstantiveContent && this.stageSeemComplete(stage, context));
  }

  private stageSeemComplete(stage: string, context: any): boolean {
    switch (stage) {
      case 'BIG_IDEA':
        return !!(context?.ideation?.bigIdea && context.ideation.bigIdea.length > 10);
      case 'ESSENTIAL_QUESTION':
        return !!(context?.ideation?.essentialQuestion && context.ideation.essentialQuestion.includes('?'));
      case 'CHALLENGE':
        return !!(context?.ideation?.challenge && context.ideation.challenge.length > 20);
      default:
        return false;
    }
  }

  private async generateHelpfulExamples(stage: string, context: any): Promise<string[]> {
    const examples: Record<string, string[]> = {
      'BIG_IDEA': [
        `For ${context?.wizard?.subject || 'your subject'}: "The power of systems thinking"`,
        `Concept that works well: "Change and continuity over time"`,
        `Universal theme: "The relationship between freedom and responsibility"`
      ],
      'ESSENTIAL_QUESTION': [
        `"How might we balance individual needs with community good?"`,
        `"What is the true cost of ${context?.wizard?.projectTopic || 'progress'}?"`,
        `"To what extent does ${context?.wizard?.projectTopic || 'this issue'} shape our daily lives?"`
      ],
      'CHALLENGE': [
        `Create a guide for ${context?.wizard?.location || 'local'} families about ${context?.ideation?.bigIdea || 'this topic'}`,
        `Design solutions for a real ${context?.wizard?.location || 'community'} organization`,
        `Develop recommendations for younger students to understand ${context?.ideation?.bigIdea || 'this concept'}`
      ]
    };
    
    return examples[stage] || ['Let me help you think through this...'];
  }

  private buildConversationContext(context: any, userInput: string): any[] {
    const history = context?.conversationHistory || [];
    
    // Keep recent history but summarize older messages
    const recentHistory = history.slice(-10);
    
    // Add the current user input
    if (userInput) {
      recentHistory.push({
        role: 'user',
        parts: [{ text: userInput }]
      });
    }
    
    return recentHistory;
  }

  private generateFallbackResponse(stage: string): any {
    const fallbacks: Record<string, string> = {
      'BIG_IDEA': "Let's work together to find the perfect conceptual foundation for your project. What matters most to your students?",
      'ESSENTIAL_QUESTION': "Let's craft a question that will spark genuine curiosity. What do you want students to wonder about?",
      'CHALLENGE': "Let's design something authentic that your students can really sink their teeth into. What problems do they care about?",
      'JOURNEY': "Let's map out how students will tackle this challenge. What's the first thing they need to understand?",
      'DELIVERABLES': "Let's figure out how students will show what they've learned. What would make them proud to share?"
    };
    
    return {
      message: fallbacks[stage] || "Let's continue working on your project together.",
      suggestions: [],
      shouldProgress: false
    };
  }

  private getFallbackSuggestions(stage: string): string[] {
    const suggestions: Record<string, string[]> = {
      'BIG_IDEA': [
        'The intersection of nature and technology',
        'Power and responsibility in communities',
        'How systems influence individual choices'
      ],
      'ESSENTIAL_QUESTION': [
        'How might we create more equitable solutions?',
        'What is the relationship between innovation and tradition?',
        'To what extent do our choices impact others?'
      ],
      'CHALLENGE': [
        'Create a resource for your local community',
        'Design solutions for a school-wide issue',
        'Develop recommendations for local leaders'
      ]
    };
    
    return suggestions[stage] || [];
  }
}

// Export singleton instance
export const improvedGeminiService = new ImprovedGeminiService();