/**
 * Extracts structured data from conversational AI responses
 * to update the SOPFlowManager state
 */

export const extractIdeationData = (aiResponse) => {
  console.log('[ConversationalDataExtractor] Processing AI response:', aiResponse);
  
  const data = {
    bigIdea: null,
    essentialQuestion: null,
    challenge: null
  };

  // Extract big idea
  if (aiResponse.includes('Big Idea:')) {
    const bigIdeaMatch = aiResponse.match(/Big Idea:\s*([^\n]+)/);
    if (bigIdeaMatch) {
      data.bigIdea = bigIdeaMatch[1].trim();
    }
  }
  
  // Extract essential question
  if (aiResponse.includes('Essential Question:')) {
    const eqMatch = aiResponse.match(/Essential Question:\s*([^\n]+)/);
    if (eqMatch) {
      data.essentialQuestion = eqMatch[1].trim();
    }
  }
  
  // Extract challenge
  if (aiResponse.includes('Challenge:')) {
    const challengeMatch = aiResponse.match(/Challenge:\s*([^\n]+)/);
    if (challengeMatch) {
      data.challenge = challengeMatch[1].trim();
    }
  }
  
  // Alternative extraction for when user types naturally
  if (!data.bigIdea && !data.essentialQuestion && !data.challenge) {
    // For now, treat the entire response as the current step's data
    // This ensures "not sure help me" responses are captured
    const cleanedResponse = aiResponse.trim();
    if (cleanedResponse && cleanedResponse.length > 10) {
      // The response contains valuable content
      return { conversationalInput: cleanedResponse };
    }
  }
  
  console.log('[ConversationalDataExtractor] Extracted data:', data);
  return data;
};

export const extractJourneyPhases = (aiResponse) => {
  console.log('[ConversationalDataExtractor] Extracting journey phases from:', aiResponse);
  
  const phases = [];
  
  // Try multiple formats
  // Format 1: Numbered list with colons
  const numberedWithColons = aiResponse.match(/\d+\.\s*([^:]+):\s*([^\n]+)/g);
  if (numberedWithColons && numberedWithColons.length > 0) {
    numberedWithColons.forEach(match => {
      const [, title, description] = match.match(/\d+\.\s*([^:]+):\s*(.+)/) || [];
      if (title && description) {
        phases.push({
          title: title.trim(),
          description: description.trim()
        });
      }
    });
  }
  
  // Format 2: Phase X: format
  if (phases.length === 0) {
    const phaseFormat = aiResponse.match(/Phase \d+:\s*([^\n]+)(?:\n([^\n]+))?/g);
    if (phaseFormat && phaseFormat.length > 0) {
      phaseFormat.forEach(match => {
        const [, title, description] = match.match(/Phase \d+:\s*([^\n]+)(?:\n([^\n]+))?/) || [];
        if (title) {
          phases.push({
            title: title.trim(),
            description: description?.trim() || ''
          });
        }
      });
    }
  }
  
  // Format 3: Simple numbered list
  if (phases.length === 0) {
    const simpleNumbered = aiResponse.match(/^\d+\.\s*[^\n]+$/gm);
    if (simpleNumbered && simpleNumbered.length > 0) {
      simpleNumbered.forEach((item, idx) => {
        const cleaned = item.replace(/^\d+\.\s*/, '').trim();
        phases.push({
          title: `Phase ${idx + 1}`,
          description: cleaned
        });
      });
    }
  }
  
  console.log('[ConversationalDataExtractor] Extracted phases:', phases);
  return phases;
};

export const shouldUpdateSOPFlowManager = (currentStep, conversationalData) => {
  // Determine if we have enough data to update the SOP Flow Manager
  
  switch (currentStep) {
    case 'IDEATION_BIG_IDEA':
      return conversationalData.bigIdea || conversationalData.conversationalInput;
      
    case 'IDEATION_EQ':
      return conversationalData.essentialQuestion || conversationalData.conversationalInput;
      
    case 'IDEATION_CHALLENGE':
      return conversationalData.challenge || conversationalData.conversationalInput;
      
    case 'JOURNEY_PHASES':
      return conversationalData.phases && conversationalData.phases.length > 0;
      
    default:
      return conversationalData.conversationalInput;
  }
};