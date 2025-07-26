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
  
  // Network resilience
  private retryPolicy = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2
  };
  private requestCache = new Map<string, { response: string; timestamp: number }>();
  private readonly cacheExpiry = 5 * 60 * 1000; // 5 minutes
  private failureCount = 0;
  private lastSuccessTime = Date.now();
  
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
    console.log('🤖 AI generateResponse called:', {
      action: request.action,
      stage: request.stage,
      step: request.step,
      hasUserInput: !!request.userInput,
      contextMessageCount: request.context.messages.length,
      timestamp: new Date().toISOString()
    });

    // Check cache first
    const cacheKey = this.generateCacheKey(request);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log('💾 Returning cached AI response for key:', cacheKey);
      return cached;
    }
    
    const systemPrompt = this.buildSystemPrompt(request);
    const conversationContext = this.buildConversationContext(request);
    
    console.log('📝 AI Prompt Details:', {
      systemPromptLength: systemPrompt.length,
      contextLength: conversationContext.length,
      totalPromptLength: systemPrompt.length + conversationContext.length,
      requirementsCount: request.requirements?.length || 0
    });
    
    // Implement retry with exponential backoff
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.retryPolicy.maxRetries; attempt++) {
      try {
        const prompt = `${systemPrompt}\n\n${conversationContext}`;
        console.log(`🔄 Generating AI response for action: ${request.action} (attempt ${attempt + 1}/${this.retryPolicy.maxRetries + 1})`);
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AI generation timeout')), 30000)
        );
        
        const generationPromise = this.model.generateContent(prompt);
        const result = await Promise.race([generationPromise, timeoutPromise]) as any;
        
        const response = await result.response;
        const text = response.text();
        
        console.log('✅ AI response received:', {
          responseLength: text.length,
          firstChars: text.substring(0, 100) + '...'
        });
        
        // Validate and enhance if needed
        const finalResponse = this.validateAndEnhance(text, request.requirements || []);
        
        // Cache successful response
        this.cacheResponse(cacheKey, finalResponse);
        
        // Reset failure tracking on success
        this.failureCount = 0;
        this.lastSuccessTime = Date.now();
        
        console.log('🎯 AI generation successful');
        return finalResponse;
      } catch (error) {
        lastError = error as Error;
        console.error(`AI generation error (attempt ${attempt + 1}):`, error);
        
        this.failureCount++;
        
        // Don't retry on certain errors
        if (this.isNonRetryableError(error)) {
          break;
        }
        
        // Calculate backoff delay
        if (attempt < this.retryPolicy.maxRetries) {
          const delay = this.calculateBackoffDelay(attempt);
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // All retries failed
    console.error('All AI generation attempts failed, using enhanced fallback');
    
    // Check if we should enter degraded mode
    if (this.shouldEnterDegradedMode()) {
      console.warn('Entering degraded mode due to repeated failures');
      return this.generateDegradedModeResponse(request);
    }
    
    // Fallback to enhanced template
    return this.generateEnhancedTemplate(request);
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
      
      'process_big_idea': `The user has provided input for their Big Idea. Your task is to:
1. Acknowledge their input thoughtfully
2. Help shape it into a proper transferable Big Idea concept
3. Provide 2-3 refined options that elevate their thinking
4. Each option should be a conceptual framework, not just a topic
5. Connect to deeper educational principles
6. Make it relevant to their ${request.context.userData.subject} and ${request.context.userData.ageGroup}
7. End by asking which direction resonates or if they'd like to refine further
8. Format options clearly with bold headers
9. Keep the tone encouraging and educational`,
      
      'process_essential_question': `The user has provided input for their Essential Question. Your task is to:
1. Acknowledge their question and its potential
2. Analyze if it's truly open-ended and inquiry-driven
3. Provide 2-3 refined versions that:
   - Resist simple answers
   - Connect to their Big Idea: "${request.context.capturedData['ideation.bigIdea'] || 'their concept'}"
   - Promote sustained investigation
   - Are developmentally appropriate for ${request.context.userData.ageGroup}
4. Each option should begin with powerful question starters (How might, To what extent, Why do, etc.)
5. Explain how each question drives deeper thinking
6. Format with bold headers and clear explanations
7. Ask which resonates or if they want to explore other angles`,
      
      'process_challenge': `The user has provided input for their Challenge. Your task is to:
1. Acknowledge their challenge idea enthusiastically
2. Evaluate its authenticity and real-world relevance
3. Provide 2-3 refined versions that:
   - Address genuine needs in ${request.context.userData.location}
   - Connect to their Essential Question: "${request.context.capturedData['ideation.essentialQuestion'] || 'their inquiry'}"
   - Result in tangible products or measurable impact
   - Empower ${request.context.userData.ageGroup} students as change agents
4. Each challenge should be action-oriented and specific
5. Include potential community partners or audiences
6. Format with bold challenge statements
7. Ask which challenge excites them most or if they want to modify`,
      
      'process_phases': `The user has provided input for their project Phases. Your task is to:
1. Acknowledge their phase structure
2. Analyze the progression for developmental appropriateness
3. Provide 2-3 refined phase structures that:
   - Build skills incrementally for ${request.context.userData.ageGroup}
   - Include clear milestones between phases
   - Balance structure with student agency
   - Connect to their Challenge: "${request.context.capturedData['ideation.challenge'] || 'their goal'}"
4. Each structure should have 3-4 phases with descriptive names
5. Explain the learning progression in each option
6. Include timing suggestions
7. Format with clear phase names and descriptions
8. Ask which structure best supports their vision`,
      
      'process_activities': `The user has provided input for their Activities. Your task is to:
1. Acknowledge their activity ideas with enthusiasm
2. Evaluate them for engagement and learning value
3. Provide 2-3 enhanced activity sets that:
   - Are hands-on and interactive for ${request.context.userData.ageGroup}
   - Build skills needed for their Challenge
   - Incorporate multiple learning modalities
   - Connect to ${request.context.userData.subject} standards
   - Leverage resources in ${request.context.userData.location}
4. Each set should include 4-6 specific activities
5. Explain how activities scaffold learning
6. Include differentiation suggestions
7. Format with bold activity names and descriptions
8. Ask which set excites them or how to customize`,
      
      'process_resources': `The user has provided input for their Resources. Your task is to:
1. Acknowledge their resource ideas
2. Assess accessibility and appropriateness
3. Provide 2-3 comprehensive resource lists that:
   - Support diverse learners in ${request.context.userData.ageGroup}
   - Include digital and physical materials
   - Connect to local ${request.context.userData.location} resources
   - Enable the Activities they've planned
   - Consider budget constraints
4. Organize resources by category (materials, tools, human, digital)
5. Include specific examples and alternatives
6. Suggest free/low-cost options
7. Format with clear categories and bullet points
8. Ask what additional support they need`,
      
      'process_milestones': `The user has provided input for their Milestones. Your task is to:
1. Acknowledge their milestone structure
2. Evaluate frequency and clarity for ${request.context.userData.ageGroup}
3. Provide 2-3 refined milestone frameworks that:
   - Celebrate progress frequently (every 3-5 days)
   - Include both individual and group achievements
   - Build toward their final Challenge
   - Are visible and tangible for students
   - Include reflection opportunities
4. Each framework should have 5-7 specific milestones
5. Explain how each milestone maintains momentum
6. Include celebration suggestions
7. Format with milestone names and success indicators
8. Ask which framework best motivates their students`,
      
      'process_rubric': `The user has provided input for their Rubric criteria. Your task is to:
1. Acknowledge their assessment approach
2. Evaluate clarity and student-friendliness
3. Provide 2-3 refined rubric frameworks that:
   - Use "I can" statements for ${request.context.userData.ageGroup}
   - Balance process and product assessment
   - Include creativity and collaboration
   - Connect to their Challenge outcomes
   - Promote growth mindset
4. Each framework should have 4-5 clear categories
5. Include 3-4 performance levels per category
6. Use student-friendly language and visuals
7. Format as a clear rubric structure
8. Ask how to make success criteria clearer`,
      
      'process_impact': `The user has provided input for their Impact Plan. Your task is to:
1. Acknowledge their vision for student impact
2. Evaluate authenticity and feasibility
3. Provide 2-3 enhanced impact plans that:
   - Connect to real audiences in ${request.context.userData.location}
   - Create lasting value beyond grades
   - Are achievable for ${request.context.userData.ageGroup}
   - Celebrate student work publicly
   - Build community connections
4. Each plan should include specific venues and formats
5. Suggest multiple presentation options
6. Include logistics and preparation tips
7. Format with clear action steps
8. Ask which approach creates the most meaningful impact`,
      
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
        
      case 'process_big_idea':
        const userIdea = request.userInput || 'your concept';
        return `I see you're interested in exploring "${userIdea}" as a foundation for your ${subject} project.

Let me help you shape this into a powerful Big Idea. A Big Idea should be a transferable concept that connects to deeper understanding. Based on your interest in ${userIdea}, here are some ways we could frame this:

**Option 1: Systems and Relationships** - How ${userIdea} represents interconnected systems that shape our world

**Option 2: Change and Adaptation** - The ways ${userIdea} evolves and transforms over time

**Option 3: Human Impact and Agency** - How people influence and are influenced by ${userIdea}

Which direction resonates with your vision for your ${ageGroup} students, or would you like to refine your original idea further?`;

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
    
    // Clear old cache entries when context updates
    this.cleanupCache();
  }

  getContextWindow(): ChatMessage[] {
    return [...this.contextWindow];
  }
  
  // Cache management
  private generateCacheKey(request: AIGenerationRequest): string {
    const contextHash = this.hashContext(request.context);
    return `${request.action}_${request.stage || ''}_${request.step || ''}_${contextHash}`;
  }
  
  private hashContext(context: ConversationContext): string {
    // Simple hash for context - in production use proper hashing
    const str = JSON.stringify({
      lastMessages: context.messages.slice(-3).map(m => m.content.substring(0, 50)),
      capturedKeys: Object.keys(context.capturedData),
      phase: context.currentPhase
    });
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }
  
  private getFromCache(key: string): string | null {
    const cached = this.requestCache.get(key);
    if (!cached) return null;
    
    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.cacheExpiry) {
      this.requestCache.delete(key);
      return null;
    }
    
    return cached.response;
  }
  
  private cacheResponse(key: string, response: string): void {
    this.requestCache.set(key, {
      response,
      timestamp: Date.now()
    });
    
    // Limit cache size
    if (this.requestCache.size > 50) {
      const oldestKey = Array.from(this.requestCache.entries())
        .sort(([,a], [,b]) => a.timestamp - b.timestamp)[0][0];
      this.requestCache.delete(oldestKey);
    }
  }
  
  private cleanupCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.requestCache.forEach((value, key) => {
      if (now - value.timestamp > this.cacheExpiry) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.requestCache.delete(key));
  }
  
  // Error handling
  private isNonRetryableError(error: any): boolean {
    const message = error?.message?.toLowerCase() || '';
    
    // Don't retry on authentication or quota errors
    if (message.includes('api key') || 
        message.includes('quota') || 
        message.includes('unauthorized') ||
        message.includes('forbidden')) {
      return true;
    }
    
    return false;
  }
  
  private calculateBackoffDelay(attempt: number): number {
    const delay = Math.min(
      this.retryPolicy.baseDelay * Math.pow(this.retryPolicy.backoffMultiplier, attempt),
      this.retryPolicy.maxDelay
    );
    
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.3 * delay;
    return Math.floor(delay + jitter);
  }
  
  private shouldEnterDegradedMode(): boolean {
    // Enter degraded mode if:
    // 1. More than 5 consecutive failures
    // 2. Haven't had a success in the last 5 minutes
    const timeSinceLastSuccess = Date.now() - this.lastSuccessTime;
    return this.failureCount > 5 || timeSinceLastSuccess > 5 * 60 * 1000;
  }
  
  private generateDegradedModeResponse(request: AIGenerationRequest): string {
    // In degraded mode, provide helpful but generic responses
    const { action, stage, step } = request;
    
    return `I'm experiencing some technical difficulties but I'm still here to help! 

Based on where you are in the process (${stage || 'current stage'}, ${step || 'current step'}), 
here are some general suggestions:

• Take a moment to reflect on what you've created so far
• Consider how this connects to your students' needs
• Think about practical next steps

Feel free to continue sharing your ideas, and I'll provide feedback as best I can. 
The **Ideas** and **What-If** buttons are great resources for inspiration!

*Note: Some advanced features may be temporarily limited.*`;
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