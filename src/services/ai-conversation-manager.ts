// AI Conversation Manager - Handles all AI-guided conversation generation
// Replaces static templates with dynamic, context-aware responses

import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatMessage, ChatState, ChatStage } from './chat-service';
import { logger } from '../utils/logger';
import { JSONResponseParser } from '../utils/json-response-parser';

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
    logger.log('Initializing Gemini model...');
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      this.model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024, // Reduced from 2048 to enforce brevity
        },
      });
      logger.log('Gemini model initialized');
    } catch (error) {
      logger.error('Failed to initialize Gemini model:', error);
      throw error;
    }
  }

  async generateResponse(request: AIGenerationRequest): Promise<string> {
    logger.log('AI generateResponse called:', {
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
      logger.log('Returning cached AI response for key:', cacheKey);
      return cached;
    }
    
    const systemPrompt = this.buildSystemPrompt(request);
    const conversationContext = this.buildConversationContext(request);
    
    logger.log('AI Prompt Details:', {
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
        logger.log(`Generating AI response for action: ${request.action} (attempt ${attempt + 1}/${this.retryPolicy.maxRetries + 1})`);
        
        // Add timeout to prevent hanging - increased for thinking mode
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AI generation timeout')), 60000) // Increased to 60s for thinking mode
        );
        
        const generationPromise = this.model.generateContent(prompt);
        const result = await Promise.race([generationPromise, timeoutPromise]) as any;
        
        const response = await result.response;
        let text = response.text();
        
        // Clean up any problematic patterns in the AI response
        text = text
          .replace(/```[\s\S]*?```/g, '') // Remove code blocks
          .replace(/`[^`]+`/g, (match) => match.replace(/[<>]/g, '')) // Clean inline code
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove any script tags
          .replace(/pattern\s*[=:]/gi, 'pattern is') // Replace pattern syntax
          .replace(/validation\s*[=:]/gi, 'validation is'); // Replace validation syntax
        
        logger.log('AI response received:', {
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
        
        logger.log('AI generation successful');
        return finalResponse;
      } catch (error) {
        lastError = error as Error;
        logger.error(`AI generation error (attempt ${attempt + 1}):`, error);
        
        this.failureCount++;
        
        // Don't retry on certain errors
        if (this.isNonRetryableError(error)) {
          break;
        }
        
        // Calculate backoff delay
        if (attempt < this.retryPolicy.maxRetries) {
          const delay = this.calculateBackoffDelay(attempt);
          logger.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // All retries failed
    logger.error('All AI generation attempts failed, using enhanced fallback');
    
    // Check if we should enter degraded mode
    if (this.shouldEnterDegradedMode()) {
      logger.warn('Entering degraded mode due to repeated failures');
      return this.generateDegradedModeResponse(request);
    }
    
    // Fallback to enhanced template
    return this.generateEnhancedTemplate(request);
  }

  private buildSystemPrompt(request: AIGenerationRequest): string {
    const basePrompt = `You are ALF Coach, a supportive colleague helping educators create amazing learning experiences. Think of yourself as their collaborative partner, not their instructor.

CORE PERSONALITY:
- Write like a helpful colleague sitting across the table, not a professor at a podium
- Use "we" and "let's" instead of instructional commands
- Be warm, encouraging, and conversational
- Share excitement about their ideas while helping shape them
- Avoid academic jargon - keep it friendly and accessible

CRITICAL INSTRUCTIONS:
1. You MUST follow the SOP structure - 10 steps across 3 stages (Ideation, Journey, Deliverables)
2. NEVER just repeat what they said - always ADD VALUE by refining, expanding, or reframing
3. Build on previous context - reference what they've already shared
4. Make responses feel like a natural conversation with a supportive peer
5. Current action: ${request.action}
${request.stage ? `6. Current stage: ${request.stage}` : ''}
${request.step ? `7. Current step: ${request.step}` : ''}

RESPONSE LENGTH REQUIREMENTS:
- Keep responses CONCISE: 1-2 paragraphs for confirmations, 2-3 for explanations
- Each paragraph should be 2-3 sentences maximum
- Avoid lengthy explanations - be clear and direct
- Focus on ONE main point per paragraph

IMPORTANT: Format responses in Markdown. Use **bold** for emphasis and clear paragraph breaks. Keep paragraphs short and readable.

AVOID INCLUDING:
- Code examples or technical syntax
- Pattern validation or regex examples  
- JavaScript or programming snippets
- Complex formatting that might break rendering
- Any content that looks like code or scripts

Focus on natural language responses that guide the educator.`;

    // Add specific requirements based on action
    const actionPrompts = this.getActionSpecificPrompts(request);
    
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
- Subject: ${context.userData?.subject || 'your subject'}
- Age Group: ${context.userData?.ageGroup || 'your students'}
- Location: ${context.userData?.location || 'your location'}

Progress So Far:
${capturedDataSummary || 'Just starting their journey'}

Recent Conversation:
${recentMessages || 'This is the beginning of our conversation'}

${request.userInput ? `User's current input: "${request.userInput}"` : ''}

Now generate an appropriate response that:
1. Shows you've been listening - reference specific things they've shared
2. Build on THEIR ideas, don't introduce random new concepts
3. Guide them forward with enthusiasm, not instruction
4. Feel like a natural conversation with a supportive colleague
5. Weave in their ${context.userData?.subject || 'subject'}, ${context.userData?.ageGroup || 'age group'}, and ${context.userData?.location || 'location'} conversationally
6. NEVER just repeat or confirm what they said - always add value
7. Keep the energy positive and collaborative throughout`;

    return userContext;
  }

  private getActionSpecificPrompts(request: AIGenerationRequest): string {
    const action = request.action;
    const prompts: Record<string, string> = {
      'stage_init': `Generate a warm, collaborative introduction to this stage that:
- Uses "we" and "let's" to establish partnership
- Briefly explains what we'll work on together (not lecture about)
- References their previous work with genuine appreciation (if any)
- Creates excitement using friendly, accessible language
- Mentions the 3 steps conversationally, not as a formal list
- Ends with an invitation to dive in together
- IMPORTANT: Keep to 2-3 short paragraphs maximum
- Naturally weaves in their ${request.context.userData?.subject || 'subject'}, ${request.context.userData?.ageGroup || 'age group'}, and ${request.context.userData?.location || 'location'}`,
      
      'step_entry': `Generate a friendly prompt that:
- Celebrates what they just accomplished (if applicable)
- Explains this step in simple, relatable terms
- Shares why this matters for their ${request.context.userData?.ageGroup || 'age group'} students
- Invites them to share their thoughts with "What comes to mind..." or "What excites you about..."
- Casually mentions Ideas/What-If buttons as helpful tools, not requirements
- Sounds like a supportive colleague, not an instructor
- IMPORTANT: Keep to 2 short paragraphs maximum`,
      
      'confirm': `Generate an enthusiastic confirmation that:
- Shows genuine excitement about their choice
- NEVER just repeats what they said - add insight or connection
- Briefly explains why this works well for ${request.context.userData?.ageGroup || 'age group'} learners
- Connects to the bigger picture they're building
- Asks "Shall we build on this, or would you like to explore other angles?"
- Keeps energy high and collaborative
- IMPORTANT: Keep to 1-2 very short paragraphs`,
      
      'process_big_idea': `The user shared: "${request.userInput}". 
KEEP RESPONSE TO 3-5 SENTENCES TOTAL.
1. Quick enthusiasm: "Great starting point!"
2. Offer 3 conceptual themes (5-7 words each) in **bold**
3. One sentence per theme showing relevance to ${request.context.userData?.ageGroup || 'students'}
4. End: "Which resonates? Or explore another angle?"`,
      
      'process_essential_question': `The user shared: "${request.userInput}".
KEEP TO 3-5 SENTENCES.
1. "Good start! Let's deepen it."
2. 3 enhanced questions in **bold** (start with: How might, What if, Why do)
3. Connect to Big Idea: "${request.context.capturedData['ideation.bigIdea'] || 'concept'}"
4. End: "Which sparks curiosity?"`,
      
      'process_challenge': `The user shared: "${request.userInput}".
KEEP TO 3-5 SENTENCES.
1. "Excellent foundation!"
2. 3 action-oriented challenges in **bold** for ${request.context.userData?.location || 'community'}
3. Each connects to: "${request.context.capturedData['ideation.essentialQuestion'] || 'inquiry'}"
4. End: "Which creates real impact?"`,
      
      'process_phases': `The user shared: "${request.userInput}".
KEEP TO 3-5 SENTENCES.
1. "Good thinking!"
2. 3 creative phase progressions in **bold** (avoid academic terms)
3. Each builds to: "${request.context.capturedData['ideation.challenge'] || 'challenge'}"
4. End: "Which journey excites you?"`,
      
      'process_activities': `The user shared: "${request.userInput}".
KEEP TO 3-5 SENTENCES.
1. "Nice ideas!"
2. 3 hands-on activity sets in **bold** for ${request.context.userData?.location || 'location'}
3. Each builds skills for the challenge
4. End: "Which engages students most?"`,
      
      'process_resources': `The user shared: "${request.userInput}".
KEEP TO 3-5 SENTENCES.
1. "Good start!"
2. 3 resource packages in **bold** (mix high/low tech)
3. Include ${request.context.userData?.location || 'local'} connections
4. End: "Which toolkit works best?"`,
      
      'process_milestones': `The user shared: "${request.userInput}".
KEEP TO 3-5 SENTENCES.
1. "Great progress markers!"
2. 3 milestone sequences in **bold** (like game achievements)
3. Mix individual/team wins for ${request.context.userData?.ageGroup || 'students'}
4. End: "Which celebrates progress best?"`,
      
      'process_rubric': `The user shared: "${request.userInput}".
KEEP TO 3-5 SENTENCES.
1. "Good assessment thinking!"
2. 3 rubric frameworks in **bold** with "I can" statements
3. Use ${request.context.userData?.ageGroup || 'student'}-friendly language
4. End: "Which empowers student growth?"`,
      
      'process_impact': `The user shared: "${request.userInput}".
KEEP TO 3-5 SENTENCES.
1. "Inspiring real-world connection!"
2. 3 impact strategies in **bold** for ${request.context.userData?.location || 'community'}
3. Mix digital/in-person sharing
4. End: "Which creates lasting change?"`,
      
      'help': `KEEP TO 3-5 SENTENCES.
Generate brief help for ${request.context.userData?.subject || 'subject'} and ${request.context.userData?.ageGroup || 'students'}.
Include 2-3 concrete examples.
Mention Ideas/What-If buttons for more options.
- IMPORTANT: Keep to 2-3 short paragraphs with concrete examples`,
      
      'refine': `Generate a supportive refinement message that:
- Validates their instinct to refine - "I love that you want to make this even better!"
- References what they've chosen so far
- Offers 2-3 specific enhancement ideas using "We could...", "What if we..."
- Keeps their confidence high - this is about polishing, not fixing
- Mentions Ideas/What-If as brainstorming partners
- Focuses on how refinements serve their ${request.context.userData?.ageGroup || 'your'} students
- IMPORTANT: Keep to 2 short paragraphs maximum`,

      'welcome': `Generate a warm, friendly welcome that:
- Introduces ALF Coach as their collaborative partner (not expert instructor)
- Briefly mentions the three stages in accessible terms
- Focuses on the amazing experience they'll create for students
- Avoids academic jargon or "best practices" language
- Ends with "Ready to dive in?" or similar casual invitation
- Sounds like a friendly colleague, not a formal guide
- Is 3-4 short, conversational paragraphs`,

      'stage_clarify': `Generate a celebratory stage summary that:
- Reviews what we've accomplished together using "we" language
- Shows how the 3 elements connect in simple terms
- Genuinely celebrates their creative work
- Avoids academic references - keep it practical
- Asks "Ready for the next stage?" conversationally
- Builds excitement for what's coming next
- Is encouraging and forward-looking (3-4 short paragraphs)`,

      'complete': `Generate a celebration message that:
- Congratulates them on completing their blueprint
- Summarizes the journey they've taken
- Highlights the value of what they've created
- Connects to student impact
- Offers next steps
- Is inspiring and affirming (3-4 paragraphs)`,
      
      'tellmore': `Generate an enthusiastic explanation of the Active Learning Framework that:
- Introduces ALF as a transformative approach to ${request.context.userData?.subject || 'your subject'} education
- Explains each of the three stages (Ideation, Journey, Deliverables) in friendly terms
- Connects specifically to their ${request.context.userData?.ageGroup || 'your'} students in ${request.context.userData?.location || 'your location'}
- Uses "we" and "let's" language to establish partnership
- Shares excitement about the possibilities
- Avoids academic jargon - keep it conversational
- Ends with "Shall we begin designing..." or similar invitation
- Is 4-5 engaging paragraphs that build enthusiasm`,
      
      'ideas': `Generate 3-4 contextual ideas for the current step: "${request.step?.label || 'current step'}". Your task is to:
1. Create ideas that are specifically relevant to ${request.context.userData?.subject || 'your subject'}
2. Ensure each idea connects to ${request.context.userData?.ageGroup || 'your'} students' interests
3. When possible, incorporate ${request.context.userData?.location || 'your location'} connections
4. Build on what they've already created: ${JSON.stringify(request.context.capturedData)}
5. Format as a structured list with:
   - **Title** (bold, specific, actionable)
   - Description (1-2 sentences explaining the value)
6. Make ideas progressively innovative - from practical to transformative
7. Ensure variety - different approaches, not variations of the same idea
8. Sound like helpful suggestions from a colleague, not prescriptions
9. End with encouraging them to choose what resonates or create their own`,
      
      'whatif': `Generate 2-3 transformative "What if..." scenarios for the current step: "${request.step?.label || 'current step'}". Your task is to:
1. Start each with "What if..." to spark imagination
2. Push boundaries while remaining achievable for ${request.context.userData?.ageGroup || 'your students'}
3. Connect to real possibilities in ${request.context.userData?.location || 'your location'}
4. Build on their work so far: ${JSON.stringify(request.context.capturedData)}
5. Format as:
   - **What if... [bold transformative question]**
   - Description of the exciting possibility (1-2 sentences)
6. Make each scenario genuinely different - not variations
7. Balance between:
   - Reimagining the learning space/context
   - Flipping traditional roles or processes
   - Connecting to broader community/global impact
8. Inspire them to think beyond conventional education
9. End with invitation to explore these or dream up their own`
    };
    
    return prompts[action] || `Generate an appropriate response based on the context. Make it conversational, encouraging, and specific to their ${action} request.`;
  }

  private validateAndEnhance(response: string, requirements: SOPRequirement[]): string {
    // Use the robust JSON parser to handle various response formats
    const parsed = JSONResponseParser.parse(response);
    
    if (!parsed.success) {
      logger.warn('Failed to parse AI response:', parsed.error);
      // Return a safe fallback message
      return "I'm having trouble understanding the response format. Please try again or use the help button.";
    }
    
    // Log if we had to fall back to cleaned text
    if (parsed.error) {
      logger.debug('AI response parsing warning:', parsed.error);
    }
    
    return parsed.content;
  }

  private injectRequirement(text: string, requirement: string): string {
    // Deprecated - no longer injecting requirements to avoid duplication
    return text;
  }

  private generateEnhancedTemplate(request: AIGenerationRequest): string {
    // Fallback that's still better than static templates
    const { context, action } = request;
    const subject = context.userData?.subject || 'your subject';
    const ageGroup = context.userData?.ageGroup || 'your students';
    const location = context.userData?.location || 'your location';
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
        return `I love that you're thinking about "${userIdea}"! That's such a rich area to explore with your ${ageGroup} students.

Let's work together to shape this into a Big Idea - a concept that students can apply beyond just this specific topic. Here are a few ways we could frame it:

**Option 1: Interconnection and Balance**  
We could explore how ${userIdea} demonstrates the delicate relationships between different elements. This helps students see patterns of connection everywhere - in ecosystems, communities, even in their own lives.

**Option 2: Growth Through Change**  
What if we looked at how ${userIdea} shows us that transformation is natural and necessary? Students could apply this lens to personal growth, historical events, or scientific processes.

**Option 3: Human Influence and Responsibility**  
We might frame it around how people shape and are shaped by ${userIdea}. This empowers students to see themselves as active participants who can make a difference.

Which of these directions excites you most? Or maybe you're seeing another angle we should explore together?`;

      case 'help':
        return `**Let's figure this out together!**

I know it can feel overwhelming to translate your vision into the right words. Working with ${ageGroup} students in ${subject} gives us so many exciting possibilities!

Here's what often helps:
• Start with what excites YOU about this topic - your passion will be contagious
• Think about a moment when you saw students really "get it" - what were they discovering?
• Consider what your students in ${location} already know and care about
• Don't worry about getting it perfect - we'll refine it together

The **Ideas** button can spark some thoughts, or **What-If** can help us think outside the box. 

What aspect of your idea feels most important to share with your students?`;

      default:
        return `Let's keep building this amazing ${subject} experience together! 

${capturedCount > 0 ? 'You\'re creating something really special here. Let\'s keep that momentum going!' : 'I\'m excited to see where your ideas take us. Let\'s start with what interests you most about this topic.'}`;
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
      logger.error('🔴 AI Manager: Invalid API key');
      return null;
    }
    
    logger.log('Creating AI Conversation Manager...');
    const manager = new AIConversationManager(apiKey);
    logger.log('AI Conversation Manager created successfully');
    return manager;
  } catch (error) {
    logger.error('🔴 Failed to create AI Conversation Manager:', error);
    return null;
  }
}