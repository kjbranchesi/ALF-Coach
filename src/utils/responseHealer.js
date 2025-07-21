// Smart response healing system - makes responses work regardless of format
export class ResponseHealer {
  
  /**
   * Intelligently heals any AI response into a working format
   * @param {any} rawResponse - Whatever the AI returned
   * @param {string} expectedStage - The stage we're in 
   * @param {string} userInput - What the user said
   * @returns {object} - Always returns a working response
   */
  static heal(rawResponse, expectedStage = 'Ideation', userInput = '') {
    console.log('🔧 Healing response:', { rawResponse, expectedStage, userInput });
    
    // Step 1: Extract the core content regardless of format
    const content = this.extractContent(rawResponse);
    
    // Step 2: Infer the interaction type intelligently  
    const interactionType = this.inferInteractionType(content, expectedStage, userInput);
    
    // Step 3: Extract suggestions flexibly
    const suggestions = this.extractSuggestions(content, rawResponse);
    
    // Step 4: Determine current step
    const currentStep = this.inferCurrentStep(content, expectedStage, suggestions);
    
    // Step 5: Build the healed response
    const healed = {
      chatResponse: content.chatResponse,
      interactionType: interactionType,
      currentStage: expectedStage,
      currentStep: currentStep,
      suggestions: suggestions,
      isStageComplete: this.inferStageComplete(content, suggestions),
      dataToStore: content.dataToStore || null,
      ideationProgress: content.ideationProgress || this.inferProgress(content, expectedStage)
    };
    
    console.log('✨ Healed response:', healed);
    return healed;
  }
  
  /**
   * Extract readable content from any format
   */
  static extractContent(rawResponse) {
    // Handle string responses (AI gave us plain text)
    if (typeof rawResponse === 'string') {
      return {
        chatResponse: rawResponse,
        dataToStore: null,
        ideationProgress: {}
      };
    }
    
    // Handle object responses
    if (rawResponse && typeof rawResponse === 'object') {
      return {
        chatResponse: rawResponse.chatResponse || rawResponse.response || rawResponse.message || rawResponse.content || 'I can help you continue with your project.',
        dataToStore: rawResponse.dataToStore,
        ideationProgress: rawResponse.ideationProgress || {}
      };
    }
    
    // Fallback for anything else
    return {
      chatResponse: 'Let me help you continue with your project design.',
      dataToStore: null,
      ideationProgress: {}
    };
  }
  
  /**
   * Smart interaction type inference based on context
   */
  static inferInteractionType(content, expectedStage, userInput) {
    // Always use conversational for ideation stage
    if (expectedStage === 'Ideation') {
      return 'conversationalIdeation';
    }
    
    // Infer based on content patterns
    const text = content.chatResponse.toLowerCase();
    
    if (text.includes('welcome') || text.includes('getting started')) {
      return 'Welcome';
    }
    
    if (text.includes('framework') || text.includes('process')) {
      return 'Framework';
    }
    
    if (text.includes('guide') || text.includes('step by step')) {
      return 'Guide';
    }
    
    // Default fallback
    return 'Standard';
  }
  
  /**
   * Extract suggestions from any format
   */
  static extractSuggestions(content, rawResponse) {
    // Check if suggestions exist in the object
    if (rawResponse?.suggestions && Array.isArray(rawResponse.suggestions)) {
      return rawResponse.suggestions;
    }
    
    // Extract from text content using patterns
    const text = content.chatResponse;
    const suggestions = [];
    
    // Look for "What if" patterns
    const whatIfMatches = text.match(/💭\s*What if[^?]+\?/g);
    if (whatIfMatches) {
      whatIfMatches.forEach(match => {
        const clean = match.replace(/💭\s*/, '').trim();
        if (clean) suggestions.push(clean);
      });
    }
    
    // Look for bulleted suggestions
    const bulletMatches = text.match(/^[•\-*]\s*(.+)$/gm);
    if (bulletMatches) {
      bulletMatches.forEach(match => {
        const clean = match.replace(/^[•\-*]\s*/, '').trim();
        if (clean && !clean.includes('Big Idea') && !clean.includes('Essential Question')) {
          suggestions.push(clean);
        }
      });
    }
    
    // Look for quoted suggestions
    const quotedMatches = text.match(/"([^"]+)"/g);
    if (quotedMatches && suggestions.length === 0) {
      quotedMatches.forEach(match => {
        const clean = match.replace(/"/g, '').trim();
        if (clean.length > 10 && clean.length < 100) {
          suggestions.push(clean);
        }
      });
    }
    
    return suggestions.length > 0 ? suggestions : null;
  }
  
  /**
   * Infer the current step based on content and context
   */
  static inferCurrentStep(content, expectedStage, suggestions) {
    if (expectedStage !== 'Ideation') {
      return 'complete';
    }
    
    const text = content.chatResponse.toLowerCase();
    
    if (text.includes('big idea') || text.includes('theme')) {
      return 'bigIdea';
    }
    
    if (text.includes('essential question') || text.includes('driving question')) {
      return 'essentialQuestion';
    }
    
    if (text.includes('challenge') || text.includes('project work')) {
      return 'challenge';
    }
    
    if (text.includes('complete') || text.includes('finished') || text.includes('learning journey')) {
      return 'complete';
    }
    
    // Default to bigIdea for ideation
    return 'bigIdea';
  }
  
  /**
   * Infer if stage is complete
   */
  static inferStageComplete(content, suggestions) {
    const text = content.chatResponse.toLowerCase();
    return text.includes('complete') || 
           text.includes('finished') || 
           text.includes('learning journey') ||
           text.includes('move on') ||
           (suggestions === null && text.includes('ready'));
  }
  
  /**
   * Infer progress from content
   */
  static inferProgress(content, expectedStage) {
    if (expectedStage !== 'Ideation') {
      return {};
    }
    
    const progress = {};
    const text = content.chatResponse;
    
    // Look for captured content patterns
    const bigIdeaMatch = text.match(/Big Idea[:"']\s*([^\n"']+)/i);
    if (bigIdeaMatch) {
      progress.bigIdea = bigIdeaMatch[1].trim();
    }
    
    const questionMatch = text.match(/Essential Question[:"']\s*([^\n"']+)/i);
    if (questionMatch) {
      progress.essentialQuestion = questionMatch[1].trim();
    }
    
    const challengeMatch = text.match(/Challenge[:"']\s*([^\n"']+)/i);
    if (challengeMatch) {
      progress.challenge = challengeMatch[1].trim();
    }
    
    return progress;
  }
}

export default ResponseHealer;