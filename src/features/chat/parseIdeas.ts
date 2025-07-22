interface ParsedIdea {
  id: string;
  title: string;
  description: string;
  icon?: 'sparkles' | 'lightbulb' | 'beaker';
}

export function parseIdeasFromContent(content: string): ParsedIdea[] {
  const ideas: ParsedIdea[] = [];
  const lines = content.split('\n');
  
  let currentIdea: Partial<ParsedIdea> | null = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check if line starts with ** and ends with ** (title)
    if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
      // Save previous idea if exists
      if (currentIdea && currentIdea.title) {
        ideas.push({
          id: `idea-${ideas.length + 1}`,
          title: currentIdea.title,
          description: currentIdea.description || '',
          icon: determineIcon(currentIdea.title)
        });
      }
      
      // Start new idea
      currentIdea = {
        title: trimmedLine.slice(2, -2), // Remove ** from both ends
        description: ''
      };
    } 
    // If we have a current idea and this is a description line
    else if (currentIdea && trimmedLine && !trimmedLine.startsWith('•')) {
      currentIdea.description = trimmedLine;
    }
  }
  
  // Don't forget the last idea
  if (currentIdea && currentIdea.title) {
    ideas.push({
      id: `idea-${ideas.length + 1}`,
      title: currentIdea.title,
      description: currentIdea.description || '',
      icon: determineIcon(currentIdea.title)
    });
  }
  
  return ideas;
}

function determineIcon(title: string): 'sparkles' | 'lightbulb' | 'beaker' {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('experiment') || lowerTitle.includes('test') || lowerTitle.includes('try')) {
    return 'beaker';
  }
  if (lowerTitle.includes('idea') || lowerTitle.includes('what if') || lowerTitle.includes('imagine')) {
    return 'lightbulb';
  }
  return 'sparkles';
}

// Function to check if content contains parseable ideas
export function hasParseableIdeas(content: string): boolean {
  return content.includes('**') && content.split('**').length > 2;
}