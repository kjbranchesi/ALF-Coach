/**
 * GeminiService.ts - Clean, simple Gemini AI integration
 * No unnecessary abstractions or layers
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { SuggestionCard, SOPStep } from '../core/types/SOPTypes';

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
    const baseContext = `
You are an ALF Coach helping an educator design an active learning experience.

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
`;

    // Step-specific prompts
    const stepPrompts = this.getStepPrompts(step, action, context);
    
    // User input if provided
    const userContext = userInput ? `\nEducator's input: "${userInput}"` : '';
    
    return `${baseContext}\n${stepPrompts}${userContext}`;
  }

  /**
   * Get step-specific prompts
   */
  private getStepPrompts(step: SOPStep, action: string, context: any): string {
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
        break;
        
      // Add more cases for each step
    }
    
    // Default response prompt
    return `
Respond helpfully to the educator's request about ${step}.
Keep it natural and conversational.`;
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