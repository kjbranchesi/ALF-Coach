import { cleanAge, paraphrase, hasMaterials, type OnboardData } from './onboardHelpers';

/**
 * Generate the initial boot prompt message using onboarding data
 */
export function createBootPrompt(onboardData: OnboardData): {
  chatResponse: string;
  buttons: string[];
  interactionType: string;
} {
  const { subject, ageGroup, idea, materials } = onboardData;
  
  // Build the main message
  let message = `Welcome to ProjectCraft!\n\nI see you're working on ${subject} with learners in ${cleanAge(ageGroup)}`;
  
  // Add idea clause if present
  if (idea && idea.trim()) {
    const paraphrased = paraphrase(idea);
    if (paraphrased) {
      message += ` and you already have an initial spark around ${paraphrased}.`;
    }
  }
  
  // Add materials clause if present
  if (hasMaterials(materials)) {
    message += ` You've also gathered some starting resources we can build on.`;
  }
  
  message += `\n\nLet's shape that into a compelling project.\n\nChoose a starting point:`;
  
  return {
    chatResponse: message,
    buttons: ['Refine my idea', 'Brainstorm fresh catalysts'],
    interactionType: 'OnboardingBoot'
  };
}

/**
 * Handle the quick-reply responses from the boot prompt
 */
export function handleBootResponse(userResponse: string, onboardData: OnboardData): string {
  const { subject, ageGroup } = onboardData;
  
  if (userResponse.toLowerCase().includes('not sure') || userResponse.toLowerCase().includes('unsure')) {
    return `No worries—here are three catalyst examples in ${subject} for ${cleanAge(ageGroup)} learners:\n\n• Real-world problem solving that connects to your community\n• Investigation projects that build on current events\n• Creative challenges that develop practical skills\n\nWhich direction feels most exciting to you?`;
  }
  
  if (userResponse.toLowerCase().includes('refine')) {
    return `Perfect! Let's refine your idea. What specific aspect of ${subject} do you want your ${cleanAge(ageGroup)} learners to explore? Think about real-world problems or opportunities that could drive authentic learning.`;
  }
  
  if (userResponse.toLowerCase().includes('brainstorm') || userResponse.toLowerCase().includes('catalyst')) {
    return `Great choice! Let's explore some fresh catalysts for ${subject} with ${cleanAge(ageGroup)} learners. What kind of authentic challenge would energize your students? Consider local issues, current events, or problems they care about.`;
  }
  
  // Default response for other inputs
  return `I can see you're ready to dive in! Tell me more about what specific aspect of ${subject} you'd like your ${cleanAge(ageGroup)} learners to explore.`;
}