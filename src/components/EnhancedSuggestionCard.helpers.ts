type CardCategory = 'primary' | 'secondary' | 'action' | 'success' | 'warning';

type IconName =
  | 'Lightbulb'
  | 'FileText'
  | 'HelpCircle'
  | 'Check'
  | 'ArrowRight'
  | 'Eye'
  | 'Shield'
  | 'Refresh'
  | 'Send'
  | 'Sparkles';

export const getCardType = (text: string): CardCategory => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('accept') || lowerText.includes('continue') || lowerText.includes('yes') || lowerText.includes('proceed')) {
    return 'success';
  }
  
  if (lowerText.includes('show') && lowerText.includes('change')) {
    return 'warning';
  }
  
  if (
    lowerText.includes('get ideas') ||
    lowerText.includes('see examples') ||
    lowerText.includes('help') ||
    lowerText.includes('suggest')
  ) {
    return 'action';
  }
  
  if (
    lowerText.includes('consider') ||
    lowerText.includes('let me') ||
    lowerText.includes('what if') ||
    lowerText.includes('alternative')
  ) {
    return 'secondary';
  }
  
  return 'primary';
};

export const getCardIcon = (text: string): IconName => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('idea') || lowerText.includes('concept')) {
    return 'Lightbulb';
  }
  if (lowerText.includes('example') || lowerText.includes('show')) {
    return 'FileText';
  }
  if (lowerText.includes('help') || lowerText.includes('support')) {
    return 'HelpCircle';
  }
  if (lowerText.includes('accept') || lowerText.includes('yes') || lowerText.includes('confirm')) {
    return 'Check';
  }
  if (lowerText.includes('continue') || lowerText.includes('next') || lowerText.includes('proceed')) {
    return 'ArrowRight';
  }
  if (lowerText.includes('change') || lowerText.includes('modify')) {
    return 'Eye';
  }
  if (lowerText.includes('keep') || lowerText.includes('maintain')) {
    return 'Shield';
  }
  if (lowerText.includes('try again') || lowerText.includes('retry')) {
    return 'Refresh';
  }
  if (lowerText.includes('send') || lowerText.includes('submit')) {
    return 'Send';
  }
  
  return 'Sparkles';
};
