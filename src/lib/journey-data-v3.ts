// Robust Journey Data Model v3.0
// Designed for flexibility and AI-friendly parsing

export interface StageRecap {
  stage: 'ideation' | 'journey' | 'deliverables';
  summary: string;
  data: Record<string, any>; // Flexible data storage
  timestamp: Date;
}

// Flexible data structure that won't break with AI variations
export interface JourneyDataV3 {
  // Current conversation context (cleared between stages)
  currentStageMessages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  
  // Stage recaps (persisted between stages)
  recaps: {
    ideation?: StageRecap;
    journey?: StageRecap;
    deliverables?: StageRecap;
  };
  
  // Flexible data storage that AI can populate naturally
  stageData: {
    ideation: {
      bigIdea?: string;
      essentialQuestion?: string;
      challenge?: string;
      // Allow for additional fields AI might add
      [key: string]: any;
    };
    
    journey: {
      phases?: Array<{
        name: string;
        description?: string;
        [key: string]: any;
      }>;
      activities?: Array<{
        name: string;
        phase?: string;
        description?: string;
        [key: string]: any;
      }>;
      resources?: Array<{
        name: string;
        type?: string;
        [key: string]: any;
      }>;
      // Allow for additional fields
      [key: string]: any;
    };
    
    deliverables: {
      milestones?: Array<{
        name: string;
        description?: string;
        [key: string]: any;
      }>;
      rubric?: {
        criteria?: Array<{
          name: string;
          description?: string;
          [key: string]: any;
        }>;
        [key: string]: any;
      };
      impact?: {
        audience?: string;
        method?: string;
        [key: string]: any;
      };
      // Allow for additional fields
      [key: string]: any;
    };
  };
  
  // Metadata
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    version: string;
    wizardData?: any; // Original wizard context
  };
}

// Helper functions for flexible data extraction
export const DataExtractors = {
  // Extract text that might be in various formats
  extractText(data: any, keys: string[]): string {
    if (typeof data === 'string') {return data;}
    
    for (const key of keys) {
      if (data?.[key]) {return String(data[key]);}
    }
    
    // Try to find any string value
    if (typeof data === 'object') {
      const values = Object.values(data);
      const stringValue = values.find(v => typeof v === 'string');
      if (stringValue) {return String(stringValue);}
    }
    
    return '';
  },
  
  // Extract array that might be in various formats
  extractArray(data: any, keys: string[]): any[] {
    if (Array.isArray(data)) {return data;}
    
    for (const key of keys) {
      if (Array.isArray(data?.[key])) {return data[key];}
    }
    
    // Try to parse string as list
    if (typeof data === 'string') {
      return data.split('\n').filter(line => line.trim());
    }
    
    return [];
  },
  
  // Parse AI response flexibly
  parseAIResponse(response: string): Record<string, any> {
    const result: Record<string, any> = {};
    
    // Try to extract structured data
    const lines = response.split('\n');
    let currentKey = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Look for patterns like "Key: Value" or "- Item"
      if (trimmed.includes(':')) {
        const [key, ...valueParts] = trimmed.split(':');
        const value = valueParts.join(':').trim();
        currentKey = key.trim().toLowerCase().replace(/\s+/g, '_');
        result[currentKey] = value;
      } else if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
        // List item
        const item = trimmed.substring(1).trim();
        if (!result.items) {result.items = [];}
        result.items.push(item);
      } else if (trimmed.match(/^\d+\./)) {
        // Numbered list
        const item = trimmed.replace(/^\d+\./, '').trim();
        if (!result.items) {result.items = [];}
        result.items.push(item);
      }
    }
    
    // Also store the raw response
    result._raw = response;
    
    return result;
  }
};

// Stage transition helpers
export const StageTransitions = {
  // Generate a recap from current stage data
  generateRecap(stage: 'ideation' | 'journey' | 'deliverables', data: JourneyDataV3): StageRecap {
    const stageData = data.stageData[stage];
    
    switch (stage) {
      case 'ideation':
        return {
          stage: 'ideation',
          summary: this.buildIdeationSummary(stageData),
          data: { ...stageData },
          timestamp: new Date()
        };
        
      case 'journey':
        return {
          stage: 'journey',
          summary: this.buildJourneySummary(stageData),
          data: { ...stageData },
          timestamp: new Date()
        };
        
      case 'deliverables':
        return {
          stage: 'deliverables',
          summary: this.buildDeliverablesSummary(stageData),
          data: { ...stageData },
          timestamp: new Date()
        };
    }
  },
  
  buildIdeationSummary(data: any): string {
    const bigIdea = DataExtractors.extractText(data, ['bigIdea', 'big_idea', 'idea']);
    const eq = DataExtractors.extractText(data, ['essentialQuestion', 'essential_question', 'question']);
    const challenge = DataExtractors.extractText(data, ['challenge', 'task', 'project']);
    
    return `Foundation set with Big Idea: "${bigIdea}", Essential Question: "${eq}", and Challenge: "${challenge}".`;
  },
  
  buildJourneySummary(data: any): string {
    const phases = DataExtractors.extractArray(data, ['phases']);
    const activities = DataExtractors.extractArray(data, ['activities']);
    const resources = DataExtractors.extractArray(data, ['resources']);
    
    return `Learning journey designed with ${phases.length} phases, ${activities.length} activities, and ${resources.length} resources.`;
  },
  
  buildDeliverablesSummary(data: any): string {
    const milestones = DataExtractors.extractArray(data?.milestones, ['milestones']);
    const criteria = DataExtractors.extractArray(data?.rubric?.criteria, ['criteria']);
    const audience = DataExtractors.extractText(data?.impact, ['audience']);
    
    return `Assessment plan includes ${milestones.length} milestones, ${criteria.length} rubric criteria, targeting ${audience || 'community audience'}.`;
  },
  
  // Clear conversation but preserve recaps
  transitionStage(data: JourneyDataV3, fromStage: string, toStage: string): JourneyDataV3 {
    // Save recap if leaving a major stage
    if (fromStage.includes('clarifier')) {
      const stage = fromStage.split('_')[0].toLowerCase() as 'ideation' | 'journey' | 'deliverables';
      data.recaps[stage] = this.generateRecap(stage, data);
    }
    
    // Clear current conversation
    data.currentStageMessages = [];
    data.metadata.updatedAt = new Date();
    
    return data;
  }
};

// Initialize empty journey data
export function createEmptyJourneyData(): JourneyDataV3 {
  return {
    currentStageMessages: [],
    recaps: {},
    stageData: {
      ideation: {},
      journey: {},
      deliverables: {}
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '3.0'
    }
  };
}