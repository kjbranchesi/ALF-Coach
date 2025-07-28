import React from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  Zap, 
  Users, 
  Search,
  Sparkles,
  Brain,
  Target,
  Rocket
} from 'lucide-react';
import { AnimatedCard } from '../../components/RiveInteractions';

interface IdeaOption {
  id: string;
  label: string;
  title: string;
  description: string;
  icon?: React.ElementType;
}

interface IdeaCardsProps {
  options: IdeaOption[];
  onSelect: (option: IdeaOption) => void | Promise<void>;
  type?: 'ideas' | 'whatif';
}

export interface CardSelectionEvent {
  type: 'CARD_SELECTION';
  payload: {
    value: string;
    cardType: 'idea' | 'whatif';
    index: number;
    fullOption: IdeaOption;
  };
}

// Letter icons for example options
const LetterIcon = ({ letter, className }: { letter: string; className?: string }) => (
  <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg ${className}`}>
    {letter}
  </div>
);

// Default icons for different types
const defaultIcons = {
  ideas: [Lightbulb, Zap, Users, Search],
  whatif: [Sparkles, Brain, Target, Rocket]
};

export function IdeaCardsV2({ options, onSelect, type = 'ideas', isActive = true }: IdeaCardsProps & { isActive?: boolean }) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const [failedIds, setFailedIds] = React.useState<Set<string>>(new Set());
  
  const handleCardClick = async (option: IdeaOption, displayTitle: string) => {
    if (!isActive || processingId) {return;}
    
    try {
      setSelectedId(option.id);
      setProcessingId(option.id);
      
      const optionToSend = type === 'whatif' ? 
        { ...option, title: displayTitle } : 
        option;
      
      // Call onSelect and handle potential errors
      await onSelect(optionToSend);
      
    } catch (error) {
      console.error('Card selection failed:', error);
      setFailedIds(prev => new Set([...prev, option.id]));
      setSelectedId(null);
    } finally {
      setProcessingId(null);
    }
  };
  
  return (
    <div className="grid gap-3 mt-4">
      {options.map((option, index) => {
        const Icon = option.icon || (type === 'ideas' ? () => <LetterIcon letter={option.label} /> : defaultIcons.whatif[index % defaultIcons.whatif.length]);
        
        // Ensure What-If cards start with "What if..." if they don't already
        let displayTitle = option.title;
        if (type === 'whatif' && !option.title.toLowerCase().startsWith('what if')) {
          displayTitle = `What if ${option.title}`;
        }
        
        const isProcessing = processingId === option.id;
        const isSelected = selectedId === option.id;
        const hasFailed = failedIds.has(option.id);
        const isDisabled = !isActive || processingId !== null;
        
        return (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <AnimatedCard
              onClick={() => !isDisabled && handleCardClick(option, displayTitle)}
              className={`
                p-4 transition-all duration-200
                ${isDisabled && !isProcessing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                ${isProcessing ? 'ring-2 ring-blue-500 animate-pulse' : ''}
                ${isSelected && !isProcessing ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20' : ''}
                ${hasFailed ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/20' : ''}
              `}
              isActive={!isDisabled}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {isProcessing ? (
                    <div className="w-10 h-10 flex items-center justify-center">
                      <motion.div
                        className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                  ) : (
                    <motion.div
                      whileHover={!isDisabled ? { rotate: [0, -10, 10, 0] } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className={`w-10 h-10 ${
                        hasFailed ? 'text-red-500' : 
                        isSelected ? 'text-green-600' : 
                        'text-blue-600 dark:text-blue-400'
                      }`} />
                    </motion.div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {displayTitle}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {option.description}
                  </p>
                  {hasFailed && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Failed to select. Please try again or choose another option.
                    </p>
                  )}
                </div>
              </div>
            </AnimatedCard>
          </motion.div>
        );
      })}
    </div>
  );
}

// Generate idea options from text - Simplified and more robust
export function parseIdeasFromResponse(content: string, type: 'ideas' | 'whatif' = 'ideas'): IdeaOption[] {
  const lines = content.split('\n').filter(line => line.trim());
  const options: IdeaOption[] = [];
  
  lines.forEach((line, index) => {
    // Skip lines that are clearly not options (grounding messages)
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('here are') || 
        lowerLine.includes('consider these') ||
        lowerLine.includes('what do you think') ||
        lowerLine.includes('which') ||
        lowerLine.includes('thought-provoking') ||
        lowerLine.includes('brainstorm') ||
        (lowerLine.includes('ideas') && !line.match(/^\d+\./)) ||
        (lowerLine.includes('scenarios') && !line.match(/^\d+\./))) {
      return;
    }
    
    // Try to match numbered items with various formats
    let matched = false;
    
    // Pattern 1: 1. **Title** - Description
    const pattern1 = line.match(/^(\d+)\.\s*\*\*([^*]+)\*\*\s*-\s*(.+)/);
    if (pattern1) {
      const [_, number, title, description] = pattern1;
      options.push({
        id: `option-${number}`,
        label: number,
        title: title.trim(),
        description: description.trim()
      });
      matched = true;
    }
    
    // Pattern 2: 1. "Title" - Description
    if (!matched) {
      const pattern2 = line.match(/^(\d+)\.\s*[""]([^""]+)[""]\s*-\s*(.+)/);
      if (pattern2) {
        const [_, number, title, description] = pattern2;
        options.push({
          id: `option-${number}`,
          label: number,
          title: title.trim(),
          description: description.trim()
        });
        matched = true;
      }
    }
    
    // Pattern 3: 1. Title: Description
    if (!matched) {
      const pattern3 = line.match(/^(\d+)\.\s+([^:]+):\s*(.+)/);
      if (pattern3) {
        const [_, number, title, description] = pattern3;
        options.push({
          id: `option-${number}`,
          label: number,
          title: title.trim(),
          description: description.trim()
        });
        matched = true;
      }
    }
    
    // Pattern 4: Simple numbered list (look for description on next line)
    if (!matched) {
      const pattern4 = line.match(/^(\d+)\.\s+(.+)$/);
      if (pattern4) {
        const [_, number, title] = pattern4;
        const nextLine = lines[index + 1];
        const description = nextLine && !nextLine.match(/^\d+\./) ? nextLine.trim() : '';
        
        options.push({
          id: `option-${number}`,
          label: number,
          title: title.trim(),
          description
        });
        matched = true;
      }
    }
  });
  
  return options;
}

// Extract the grounding message (intro text) from the full content
export function extractGroundingMessage(content: string): string {
  const lines = content.split('\n');
  const groundingLines: string[] = [];
  
  for (const line of lines) {
    // Stop when we hit the first numbered item
    if (line.match(/^\d+\./)) {
      break;
    }
    groundingLines.push(line);
  }
  
  return groundingLines.join('\n').trim();
}

// Parse help content into grounding message and example cards
export function parseHelpContent(content: string): { 
  groundingMessage: string; 
  examples: IdeaOption[] 
} {
  // Split content into sections
  const lines = content.split('\n');
  const groundingLines: string[] = [];
  const exampleLines: string[] = [];
  let inExamples = false;
  
  for (const line of lines) {
    // Check if we've hit the examples section
    if (line.toLowerCase().includes('exemplar') || 
        line.toLowerCase().includes('example') ||
        line.match(/^(strong|effective|powerful)\s+\w+:/i)) {
      inExamples = true;
    }
    
    if (inExamples) {
      exampleLines.push(line);
    } else {
      groundingLines.push(line);
    }
  }
  
  // Parse examples into cards if they exist
  const examples: IdeaOption[] = [];
  let exampleIndex = 1;
  
  // Look for bullet points or specific patterns in example section
  exampleLines.forEach((line) => {
    // Match patterns like "• Pattern" or "- Pattern" or specific example formats
    const bulletMatch = line.match(/^[•\-]\s*(.+)/);
    const strongMatch = line.match(/^(Strong|Effective|Powerful)\s+\w+:\s*(.+)/i);
    const exemplarMatch = line.match(/^\*\*Exemplar:\*\*\s*"?([^"]+)"?/);
    
    if (bulletMatch || strongMatch || exemplarMatch) {
      const title = bulletMatch ? bulletMatch[1] : 
                   strongMatch ? strongMatch[2] :
                   exemplarMatch ? exemplarMatch[1] : '';
                   
      if (title) {
        examples.push({
          id: `example-${exampleIndex}`,
          label: String(exampleIndex),
          title: title.replace(/[*"]/g, '').trim(),
          description: 'Click to use this example'
        });
        exampleIndex++;
      }
    }
  });
  
  return {
    groundingMessage: groundingLines.join('\n').trim(),
    examples
  };
}