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

interface IdeaOption {
  id: string;
  label: string;
  title: string;
  description: string;
  icon?: React.ElementType;
}

interface IdeaCardsProps {
  options: IdeaOption[];
  onSelect: (option: IdeaOption) => void;
  type?: 'ideas' | 'whatif';
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

export function IdeaCardsV2({ options, onSelect, type = 'ideas' }: IdeaCardsProps) {
  return (
    <div className="grid gap-3 mt-4">
      {options.map((option, index) => {
        const Icon = option.icon || (type === 'ideas' ? () => <LetterIcon letter={option.label} /> : defaultIcons.whatif[index % defaultIcons.whatif.length]);
        
        return (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <button
              onClick={() => onSelect(option)}
              className="w-full text-left p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Icon className="w-10 h-10 text-blue-600 group-hover:text-blue-700" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 mb-1">
                    {option.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {option.description}
                  </p>
                </div>
              </div>
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}

// Generate idea options from text
export function parseIdeasFromResponse(content: string, type: 'ideas' | 'whatif' = 'ideas'): IdeaOption[] {
  const lines = content.split('\n').filter(line => line.trim());
  const options: IdeaOption[] = [];
  
  lines.forEach((line, index) => {
    // Skip lines that are clearly not options
    if (line.toLowerCase().includes('here are') || 
        line.toLowerCase().includes('consider these') ||
        line.toLowerCase().includes('what do you think') ||
        line.toLowerCase().includes('which')) {
      return;
    }
    
    // Try multiple patterns in order of specificity
    let matched = false;
    
    // 1. Numbered with quotes: 1. "Title" Description
    const numberedQuotesMatch = line.match(/^(\d+)\.\s*[""]([^""]+)[""]\s*(.*)?/);
    if (numberedQuotesMatch) {
      const number = numberedQuotesMatch[1];
      const title = numberedQuotesMatch[2].trim();
      const description = numberedQuotesMatch[3]?.trim() || '';
      
      options.push({
        id: `option-${number}`,
        label: number,
        title,
        description: description || (lines[index + 1] && !lines[index + 1].match(/^\d+\./) ? lines[index + 1].trim() : ''),
      });
      matched = true;
    }
    
    // 2. Numbered with bold: 1. **Title** or 1. **Title:** Description
    if (!matched) {
      const numberedBoldMatch = line.match(/^(\d+)\.\s*\*\*([^*]+)\*\*:?\s*(.*)?/);
      if (numberedBoldMatch) {
        const number = numberedBoldMatch[1];
        const title = numberedBoldMatch[2].trim();
        const description = numberedBoldMatch[3]?.trim() || '';
        
        options.push({
          id: `option-${number}`,
          label: number,
          title,
          description: description || (lines[index + 1] && !lines[index + 1].match(/^\d+\./) ? lines[index + 1].trim() : ''),
        });
        matched = true;
      }
    }
    
    // 3. Numbered with colon: 1. Title: Description
    if (!matched) {
      const numberedColonMatch = line.match(/^(\d+)\.\s+([^:]+):\s*(.+)?$/);
      if (numberedColonMatch) {
        const number = numberedColonMatch[1];
        const title = numberedColonMatch[2].trim();
        const description = numberedColonMatch[3]?.trim() || '';
        
        options.push({
          id: `option-${number}`,
          label: number,
          title,
          description: description || (lines[index + 1] && !lines[index + 1].match(/^\d+\./) ? lines[index + 1].trim() : ''),
        });
        matched = true;
      }
    }
    
    // 4. Simple numbered: 1. Title (no colon)
    if (!matched) {
      const numberedSimpleMatch = line.match(/^(\d+)\.\s+(.+)$/);
      if (numberedSimpleMatch) {
        const number = numberedSimpleMatch[1];
        const title = numberedSimpleMatch[2].trim();
        
        options.push({
          id: `option-${number}`,
          label: number,
          title,
          description: lines[index + 1] && !lines[index + 1].match(/^\d+\./) && !lines[index + 1].toLowerCase().includes('this') ? lines[index + 1].trim() : '',
        });
        matched = true;
      }
    }
    
    // 5. Option letter format: Option A: Title or A. Title or A) Title
    if (!matched) {
      const optionLetterMatch = line.match(/^(?:Option\s+)?([A-D])[\.:)]\s*(.+)/i);
      if (optionLetterMatch) {
        const label = optionLetterMatch[1].toUpperCase();
        const title = optionLetterMatch[2].trim();
        
        options.push({
          id: `option-${label}`,
          label,
          title,
          description: '',
        });
        matched = true;
      }
    }
    
    // 6. Bullet points: • Title or - Title or * Title (only if we're expecting a list)
    if (!matched && options.length < 10) {
      const bulletMatch = line.match(/^[•\-\*]\s+(.+)/);
      if (bulletMatch) {
        const title = bulletMatch[1].trim();
        const bulletNumber = options.filter(opt => opt.id.startsWith('bullet-')).length + 1;
        
        options.push({
          id: `bullet-${bulletNumber}`,
          label: `${bulletNumber}`,
          title,
          description: '',
        });
        matched = true;
      }
    }
    
    // If no pattern matched and we have options, this might be a description
    if (!matched && options.length > 0 && !line.match(/^(\d+\.)|^Option|^[•\-\*]\s/i)) {
      const lastOption = options[options.length - 1];
      // Only add as description if it doesn't look like a continuation sentence
      if (!lastOption.description && line.trim() && 
          !line.toLowerCase().startsWith('this') && 
          !line.toLowerCase().startsWith('it') &&
          !line.toLowerCase().startsWith('imagine')) {
        lastOption.description = line.trim();
      }
    }
  });
  
  // For what-if scenarios, parse differently
  if (type === 'whatif') {
    const whatIfOptions: IdeaOption[] = [];
    let currentOption: IdeaOption | null = null;
    
    lines.forEach((line) => {
      if (line.includes('What if')) {
        if (currentOption) {
          whatIfOptions.push(currentOption);
        }
        const titleMatch = line.match(/What if\s+(.+)/i);
        currentOption = {
          id: `whatif-${whatIfOptions.length + 1}`,
          label: `${whatIfOptions.length + 1}`,
          title: titleMatch ? titleMatch[1].replace(/[*?]/g, '').trim() : line,
          description: ''
        };
      } else if (currentOption && line.trim() && !line.includes('Which direction')) {
        currentOption.description = line.trim();
      }
    });
    
    if (currentOption) {
      whatIfOptions.push(currentOption);
    }
    
    return whatIfOptions;
  }
  
  return options;
}