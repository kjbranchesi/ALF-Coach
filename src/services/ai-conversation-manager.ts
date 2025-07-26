// AI Conversation Manager - Handles all AI-guided conversation generation
// Replaces static templates with dynamic, context-aware responses

import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatMessage, ChatState, ChatStage } from './chat-service';

export interface AIGenerationRequest {
  action: string;
  stage?: ChatStage;
  step?: string;
  userInput?: string;
  context: ConversationContext;
  requirements?: SOPRequirement[];
}

export interface ConversationContext {
  messages: ChatMessage[];
  userData: any;
  capturedData: Record<string, any>;
  currentPhase: string;
}

export interface SOPRequirement {
  type: 'include' | 'tone' | 'structure' | 'length';
  value: string;
  priority: 'must' | 'should' | 'nice';
}

export class AIConversationManager {
  private model: any;
  private contextWindow: ChatMessage[] = [];
  private readonly maxContextSize = 10;
  
  constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });
  }

  async generateResponse(request: AIGenerationRequest): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(request);
    const conversationContext = this.buildConversationContext(request);
    
    try {
      const prompt = `${systemPrompt}\n\n${conversationContext}`;
      console.log('Generating AI response for action:', request.action);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Validate and enhance if needed
      return this.validateAndEnhance(text, request.requirements || []);
    } catch (error) {
      console.error('AI generation error:', error);
      // Fallback to enhanced template
      return this.generateEnhancedTemplate(request);
    }
  }

  private buildSystemPrompt(request: AIGenerationRequest): string {
    const basePrompt = `You are ALF Coach, an expert educational guide helping educators design transformative learning experiences using the Active Learning Framework.

CRITICAL INSTRUCTIONS:
1. You MUST follow the SOP structure strictly - there are 10 steps across 3 stages (Ideation, Journey, Deliverables)
2. Always maintain an encouraging, professional tone
3. Build on previous context - reference what the user has already shared
4. Make responses feel natural and conversational, not templated
5. Current action: ${request.action}
${request.stage ? `6. Current stage: ${request.stage}` : ''}
${request.step ? `7. Current step: ${request.step}` : ''}

IMPORTANT: Your response should be formatted in Markdown. Use **bold** for emphasis and clear paragraph breaks.`;

    // Add specific requirements based on action
    const actionPrompts = this.getActionSpecificPrompts(request.action);
    
    return `${basePrompt}\n\n${actionPrompts}`;
  }

  private buildConversationContext(request: AIGenerationRequest): string {
    const { context } = request;
    
    // Get recent relevant messages
    const recentMessages = context.messages.slice(-5).map(m => 
      `${m.role}: ${m.content.substring(0, 200)}...` // Truncate long messages
    ).join('\n');
    
    // Add captured data context
    const capturedDataSummary = Object.entries(context.capturedData)
      .map(([key, value]) => {
        const cleanKey = key.split('.').pop() || key;
        return `${cleanKey}: ${value}`;
      })
      .join('\n');
    
    // Add user context
    const userContext = `
User Context:
- Subject: ${context.userData.subject}
- Age Group: ${context.userData.ageGroup}
- Location: ${context.userData.location}

Progress So Far:
${capturedDataSummary || 'Just starting their journey'}

Recent Conversation:
${recentMessages || 'This is the beginning of our conversation'}

${request.userInput ? `User's current input: "${request.userInput}"` : ''}

Now generate an appropriate response that:
1. Acknowledges what came before
2. Builds on their specific context
3. Guides them naturally to the next step
4. Feels personalized and thoughtful
5. Uses their subject (${context.userData.subject}), age group (${context.userData.ageGroup}), and location (${context.userData.location}) naturally in the response`;

    return userContext;
  }

  private getActionSpecificPrompts(action: string): string {
    const prompts: Record<string, string> = {
      'stage_init': `Generate a welcoming introduction to this stage that:
- Explains what will be accomplished in this stage
- References their previous work (if any)
- Creates excitement about what's coming
- Outlines the 3 steps in this stage clearly
- Ends with encouragement to begin
- Is 3-4 paragraphs long
- Uses their specific context (subject, age group, location)`,
      
      'step_entry': `Generate a prompt that:
- Connects to what they just completed (if applicable)
- Clearly explains what this step is about
- Provides context-specific examples related to their subject and age group
- Asks them to provide their input
- Naturally mentions the Ideas/What-If options available
- Is conversational and encouraging
- Is 2-3 paragraphs long`,
      
      'confirm': `Generate a confirmation message that:
- Restates their input positively and specifically
- Explains why this is valuable for their specific context
- Connects it to their overall goal
- Asks if they want to continue or refine
- Maintains momentum and excitement
- References how this will help their students
- Is 2 paragraphs long`,
      
      'help': `Generate helpful guidance that:
- Addresses their specific situation with their subject and age group
- Provides 2-3 relevant examples from their context
- Offers practical suggestions they can use immediately
- Encourages them to continue
- References the Ideas/What-If tools available
- Connects to their location when relevant
- Is supportive and detailed (3-4 paragraphs)`,
      
      'refine': `Generate a refinement message that:
- Acknowledges their desire to improve their selection
- References their current selection specifically
- Offers 2-3 specific ways to enhance it
- Maintains their confidence
- Suggests using Ideas/What-If for inspiration
- Relates improvements to their students' needs
- Is encouraging and constructive (2-3 paragraphs)`,

      'welcome': `Generate a warm welcome message that:
- Introduces ALF Coach as their expert partner
- Explains the three-stage journey ahead (Ideation, Journey, Deliverables)
- Creates excitement about the transformation they'll create
- References educational best practices
- Ends with an invitation to begin
- Is professional yet approachable (3-4 paragraphs)`,

      'stage_clarify': `Generate a stage summary that:
- Reviews the 3 elements they've completed in this stage
- Highlights how these elements work together
- Celebrates their progress
- Connects to educational research/best practices
- Asks if they're ready to proceed to the next stage
- Shows how this foundation will support the next phase
- Is comprehensive (3-4 paragraphs)`,

      'complete': `Generate a celebration message that:
- Congratulates them on completing their blueprint
- Summarizes the journey they've taken
- Highlights the value of what they've created
- Connects to student impact
- Offers next steps
- Is inspiring and affirming (3-4 paragraphs)`
    };
    
    return prompts[action] || `Generate an appropriate response based on the context. Make it conversational, encouraging, and specific to their ${action} request.`;
  }

  private validateAndEnhance(response: string, requirements: SOPRequirement[]): string {
    let enhanced = response;
    
    // Check each requirement
    requirements.forEach(req => {
      if (req.type === 'include' && req.priority === 'must') {
        if (!response.toLowerCase().includes(req.value.toLowerCase())) {
          // Add required element
          enhanced = this.injectRequirement(enhanced, req.value);
        }
      }
    });
    
    // Ensure proper markdown formatting
    if (!enhanced.includes('**')) {
      // Add some basic formatting if none exists
      enhanced = enhanced.replace(/^(.+)$/m, '**$1**');
    }
    
    return enhanced;
  }

  private injectRequirement(text: string, requirement: string): string {
    // Smart injection of required elements
    const sentences = text.split('. ');
    const midPoint = Math.floor(sentences.length / 2);
    
    sentences.splice(midPoint, 0, `This approach emphasizes ${requirement}`);
    return sentences.join('. ');
  }

  private generateEnhancedTemplate(request: AIGenerationRequest): string {
    // Fallback that's still better than static templates
    const { context, action } = request;
    const subject = context.userData.subject;
    const ageGroup = context.userData.ageGroup;
    const location = context.userData.location;
    const capturedCount = Object.keys(context.capturedData).length;
    
    switch (action) {
      case 'stage_init':
        const stage = request.stage || 'this';
        return `**Welcome to the ${stage} stage!**

Based on your work with ${subject} for ${ageGroup} students in ${location}, we're ready to ${
          stage === 'IDEATION' ? 'establish your conceptual foundation' :
          stage === 'JOURNEY' ? 'design the learning progression' :
          'define success metrics and impact'
        }.

${capturedCount > 0 ? `You've made excellent progress so far, and this stage will build on that foundation.` : 'This is where your vision begins to take shape.'}

Let's continue creating something transformative for your students!`;

      case 'step_entry':
        return `Now let's work on this important element of your ${subject} project.

${capturedCount > 0 ? `Building on what you've created so far, ` : ''}what ideas do you have for engaging your ${ageGroup} students in ${location}?

Feel free to share your thoughts, or use the **Ideas** or **What-If** buttons below for inspiration tailored to your context.`;

      case 'confirm':
        const value = request.userInput || 'your selection';
        return `**Excellent choice!**

"${value}" is a strong selection that will serve your ${ageGroup} students well in their ${subject} learning journey.

This aligns beautifully with best practices in education and will create meaningful engagement. Shall we continue building on this foundation, or would you like to refine it further?`;

      case 'help':
        return `**Here to Help!**

Working with ${ageGroup} students in ${subject} offers unique opportunities and challenges. Here in ${location}, you have rich contexts to draw from.

Consider these approaches:
• Connect to students' daily experiences
• Use hands-on, interactive methods
• Build on their natural curiosity
• Create opportunities for collaboration

The **Ideas** button will give you specific suggestions tailored to your context, while **What-If** explores more transformative possibilities.

Remember, there's no "wrong" answer here - we're building something uniquely suited to your students' needs.`;

      default:
        return `Let's continue developing your ${subject} learning experience for your ${ageGroup} students in ${location}. 

${capturedCount > 0 ? 'You\'re making great progress!' : 'Every great journey begins with a single step.'}`;
    }
  }

  updateContext(message: ChatMessage): void {
    this.contextWindow.push(message);
    // Keep only recent messages for context
    if (this.contextWindow.length > this.maxContextSize) {
      this.contextWindow.shift();
    }
  }

  getContextWindow(): ChatMessage[] {
    return [...this.contextWindow];
  }
}

// Factory function for creating AI manager
export function createAIConversationManager(apiKey: string): AIConversationManager | null {
  try {
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.warn('AI Conversation Manager: No valid API key provided');
      return null;
    }
    return new AIConversationManager(apiKey);
  } catch (error) {
    console.error('Failed to create AI Conversation Manager:', error);
    return null;
  }
}