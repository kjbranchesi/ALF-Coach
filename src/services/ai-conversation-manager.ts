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
    console.log('🤖 Initializing Gemini model...');
    try {
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
      console.log('✅ Gemini model initialized');
    } catch (error) {
      console.error('🔴 Failed to initialize Gemini model:', error);
      throw error;
    }
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

IMPORTANT: Format responses in Markdown. Use **bold** for emphasis and clear paragraph breaks. Keep paragraphs short and readable.`;

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
- Subject: ${context.userData.subject}
- Age Group: ${context.userData.ageGroup}
- Location: ${context.userData.location}

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
5. Weave in their ${context.userData.subject}, ${context.userData.ageGroup}, and ${context.userData.location} conversationally
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
- Is 3-4 short, readable paragraphs
- Naturally weaves in their ${request.context.userData.subject}, ${request.context.userData.ageGroup}, and ${request.context.userData.location}`,
      
      'step_entry': `Generate a friendly prompt that:
- Celebrates what they just accomplished (if applicable)
- Explains this step in simple, relatable terms
- Shares why this matters for their ${request.context.userData.ageGroup} students
- Invites them to share their thoughts with "What comes to mind..." or "What excites you about..."
- Casually mentions Ideas/What-If buttons as helpful tools, not requirements
- Sounds like a supportive colleague, not an instructor
- Is 2-3 short, engaging paragraphs`,
      
      'confirm': `Generate an enthusiastic confirmation that:
- Shows genuine excitement about their choice
- NEVER just repeats what they said - add insight or connection
- Briefly explains why this works well for ${request.context.userData.ageGroup} learners
- Connects to the bigger picture they're building
- Asks "Shall we build on this, or would you like to explore other angles?"
- Keeps energy high and collaborative
- Is 2 short, punchy paragraphs`,
      
      'process_big_idea': `The user has shared their initial idea: "${request.userInput}". Your task is to:
1. Show genuine interest in their idea - "I love that you're thinking about..."
2. NEVER just confirm what they said - ALWAYS help them develop it further
3. Explain briefly why Big Ideas need to be transferable concepts (in friendly terms)
4. Provide 2-3 refined options that transform their topic into powerful Big Ideas
5. Each option should:
   - Start with a conceptual framework title (e.g., "Interconnection and Balance")
   - Explain how it connects to their original idea about ${request.userInput}
   - Show how students can apply this concept beyond just this topic
   - Be relevant to ${request.context.userData.subject} and ${request.context.userData.ageGroup}
6. Use collaborative language: "We could explore...", "What if we framed it as..."
7. End with: "Which of these directions excites you most? Or maybe you're seeing another angle we should explore together?"
8. Format each option with **bold headers** and brief, friendly explanations
9. Sound like an enthusiastic colleague, not a textbook`,
      
      'process_essential_question': `The user has shared: "${request.userInput}". Your task is to:
1. Show enthusiasm - "Great question! Let's make it even more powerful..."
2. NEVER just accept their question as-is - always help develop it
3. Briefly explain (in friendly terms) what makes questions "essential" for learning
4. Provide 2-3 enhanced versions that:
   - Start with dynamic question words (How might we, What if, To what extent, Why do)
   - Connect to their Big Idea: "${request.context.capturedData['ideation.bigIdea'] || 'their concept'}"
   - Invite exploration rather than simple answers
   - Work perfectly for ${request.context.userData.ageGroup} students
5. For each question:
   - Present it in **bold**
   - Explain in 1-2 sentences why it opens up rich learning
6. Use "we" language throughout
7. End with: "Which question feels right for your students? Or shall we explore another angle together?"`,
      
      'process_challenge': `The user has shared: "${request.userInput}". Your task is to:
1. Get excited with them - "What a fantastic starting point! Let's shape this into something amazing..."
2. ALWAYS enhance their idea, don't just confirm it
3. Briefly mention why real-world challenges transform learning
4. Provide 2-3 elevated versions that:
   - Address real needs in ${request.context.userData.location}
   - Connect to their Essential Question: "${request.context.capturedData['ideation.essentialQuestion'] || 'their inquiry'}"
   - Give students authentic impact opportunities
   - Are perfect for ${request.context.userData.ageGroup} capabilities
5. For each challenge:
   - Present the challenge in **bold**
   - Describe the real-world impact in 1-2 sentences
   - Suggest a community connection or audience
6. Keep language active and exciting
7. End with: "Which challenge makes your heart race? Or should we dream up something different together?"`,
      
      'process_phases': `The user has shared: "${request.userInput}". Your task is to:
1. Appreciate their thinking - "I can see where you're going with this! Let's make it even more engaging..."
2. Don't just accept their phases - help them create a compelling journey
3. Mention how great phase names can energize students
4. Provide 2-3 dynamic phase structures that:
   - Create an exciting progression for ${request.context.userData.ageGroup} learners
   - Have creative, student-friendly names (not academic terms)
   - Build toward their Challenge: "${request.context.capturedData['ideation.challenge'] || 'their goal'}"
   - Balance guidance with student choice
5. For each structure:
   - Present phases with **bold**, creative names
   - Describe the journey in 2-3 sentences
   - Suggest approximate timing
6. Make it sound like an adventure, not a syllabus
7. End with: "Which journey excites you most? Or shall we map out a different path together?"`,
      
      'process_activities': `The user has shared: "${request.userInput}". Your task is to:
1. Share their enthusiasm - "These are great starting points! Let's make them unforgettable..."
2. Transform their ideas into engaging, specific activities
3. Briefly mention how variety keeps ${request.context.userData.ageGroup} students engaged
4. Provide 2-3 activity collections that:
   - Turn their ideas into hands-on experiences
   - Build skills for their Challenge progressively
   - Mix different types of learning (create, explore, collaborate)
   - Use ${request.context.userData.location} as a learning lab
   - Feel fresh and exciting, not textbook-y
5. For each collection:
   - Name 4-6 specific activities with **bold** titles
   - Describe each in one vivid sentence
   - Show how they connect and build
6. Make activities sound irresistible
7. End with: "Which set would make students rush to class? Or should we cook up something else together?"`,
      
      'process_resources': `The user has shared: "${request.userInput}". Your task is to:
1. Validate their thinking - "Good start on resources! Let's expand this toolkit..."
2. Build on their ideas with specific, practical additions
3. Mention how the right resources empower student creativity
4. Provide 2-3 resource packages that:
   - Include their suggestions plus creative additions
   - Mix high-tech and low-tech options
   - Tap into ${request.context.userData.location} community assets
   - Support all learners in ${request.context.userData.ageGroup}
   - Prioritize free/low-cost options
5. For each package:
   - Organize by type with **bold** headers
   - List specific items (not general categories)
   - Include at least one surprising/unusual resource
   - Note any local connections
6. Make resources feel accessible, not overwhelming
7. End with: "Which toolkit would best support your vision? Or what else should we add to the mix?"`,
      
      'process_milestones': `The user has shared: "${request.userInput}". Your task is to:
1. Appreciate their ideas - "Yes! Celebrating progress is so important. Let's make these milestones memorable..."
2. Transform their input into specific, exciting checkpoints
3. Mention how ${request.context.userData.ageGroup} students thrive on recognition
4. Provide 2-3 milestone sequences that:
   - Turn their ideas into celebration-worthy moments
   - Mix individual and team achievements
   - Build excitement toward their Challenge
   - Create visible progress students can see/touch
   - Include quick reflection moments
5. For each sequence:
   - Name 5-7 milestones with **bold**, student-friendly titles
   - Describe what success looks like in one sentence
   - Suggest a mini-celebration idea
6. Make milestones feel like video game achievements
7. End with: "Which milestone journey would keep students motivated? Or should we design different checkpoints together?"`,
      
      'process_rubric': `The user has shared: "${request.userInput}". Your task is to:
1. Support their thinking - "Great foundation for assessment! Let's make this crystal clear for students..."
2. Transform their ideas into student-friendly success criteria
3. Mention how ${request.context.userData.ageGroup} students succeed when they understand expectations
4. Provide 2-3 rubric designs that:
   - Turn their criteria into "I can" statements
   - Celebrate growth, not just perfection
   - Include creativity and teamwork alongside content
   - Connect directly to their Challenge
   - Use language students understand
5. For each design:
   - Present 4-5 categories with **bold** headers
   - Show 3 levels (with positive names, not "poor/fair/good")
   - Use specific, observable descriptions
   - Include at least one unique criterion
6. Make assessment feel empowering, not judgmental
7. End with: "Which rubric would help students shine? Or should we adjust the criteria together?"`,
      
      'process_impact': `The user has shared: "${request.userInput}". Your task is to:
1. Get excited with them - "I love your vision for impact! Let's make this truly unforgettable..."
2. Elevate their ideas to create lasting community value
3. Mention how ${request.context.userData.ageGroup} students glow when their work matters
4. Provide 2-3 impact scenarios that:
   - Transform their ideas into specific events/products
   - Connect to real audiences in ${request.context.userData.location}
   - Create value that lasts beyond the project
   - Give students authentic platforms to shine
   - Build bridges with the community
5. For each scenario:
   - Describe the impact event/product in **bold**
   - Paint a picture of the moment in 2-3 sentences
   - Suggest specific venues, partners, or platforms
   - Include one "wow factor" element
6. Make impact feel achievable and exciting
7. End with: "Which impact plan gives you goosebumps? Or should we dream even bigger together?"`,
      
      'help': `Generate helpful guidance that:
- Addresses their specific situation with their subject and age group
- Provides 2-3 relevant examples from their context
- Offers practical suggestions they can use immediately
- Encourages them to continue
- References the Ideas/What-If tools available
- Connects to their location when relevant
- Is supportive and detailed (3-4 paragraphs)`,
      
      'refine': `Generate a supportive refinement message that:
- Validates their instinct to refine - "I love that you want to make this even better!"
- References what they've chosen so far
- Offers 2-3 specific enhancement ideas using "We could...", "What if we..."
- Keeps their confidence high - this is about polishing, not fixing
- Mentions Ideas/What-If as brainstorming partners
- Focuses on how refinements serve their ${request.context.userData.ageGroup} students
- Is warm and constructive (2-3 short paragraphs)`,

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
- Introduces ALF as a transformative approach to ${request.context.userData.subject} education
- Explains each of the three stages (Ideation, Journey, Deliverables) in friendly terms
- Connects specifically to their ${request.context.userData.ageGroup} students in ${request.context.userData.location}
- Uses "we" and "let's" language to establish partnership
- Shares excitement about the possibilities
- Avoids academic jargon - keep it conversational
- Ends with "Shall we begin designing..." or similar invitation
- Is 4-5 engaging paragraphs that build enthusiasm`,
      
      'ideas': `Generate 3-4 contextual ideas for the current step: "${request.step?.label || 'current step'}". Your task is to:
1. Create ideas that are specifically relevant to ${request.context.userData.subject}
2. Ensure each idea connects to ${request.context.userData.ageGroup} students' interests
3. When possible, incorporate ${request.context.userData.location} connections
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
2. Push boundaries while remaining achievable for ${request.context.userData.ageGroup}
3. Connect to real possibilities in ${request.context.userData.location}
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
      console.error('🔴 AI Manager: Invalid API key');
      return null;
    }
    
    console.log('🤖 Creating AI Conversation Manager...');
    const manager = new AIConversationManager(apiKey);
    console.log('✅ AI Conversation Manager created successfully');
    return manager;
  } catch (error) {
    console.error('🔴 Failed to create AI Conversation Manager:', error);
    return null;
  }
}