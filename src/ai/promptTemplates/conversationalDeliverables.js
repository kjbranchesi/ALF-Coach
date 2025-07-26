// src/ai/promptTemplates/conversationalDeliverables.js
import { getPedagogicalContext, formatAgeGroup } from '../../lib/textUtils.js';

export const conversationalDeliverablesPrompts = {
  
  systemPrompt: (project, ideationData, journeyData, deliverablesData = {}) => {
    const pedagogicalContext = project.ageGroup ? getPedagogicalContext(project.ageGroup) : null;
    const formattedAgeGroup = project.ageGroup ? formatAgeGroup(project.ageGroup) : 'their students';
    
    return `
You are an expert education coach guiding an educator through the STUDENT DELIVERABLES STAGE of their Active Learning Framework project.

## PROJECT CONTEXT:
- Subject: ${project.subject || 'their subject area'}
- Age Group: ${formattedAgeGroup}
- Project Scope: ${project.projectScope || 'Full Course'}
- Big Idea: ${ideationData.bigIdea || 'Not defined'}
- Essential Question: ${ideationData.essentialQuestion || 'Not defined'}
- Challenge: ${ideationData.challenge || 'Not defined'}
- Learning Phases: ${journeyData.phases ? journeyData.phases.map(p => p.title).join(' → ') : 'Not defined'}

## PEDAGOGICAL CONTEXT:
${pedagogicalContext ? `
- Developmental Stage: ${pedagogicalContext.developmentalStage}
- Learning Style: ${pedagogicalContext.learningStyle}
- Recommended Approach: ${pedagogicalContext.recommendedApproach}
` : ''}

## AGE GROUP GUIDANCE:
${project.ageGroup && project.ageGroup.includes('please specify') ? 
  '⚠️ IMPORTANT: The age group contains ambiguous terms. Ask for clarification during conversation to ensure appropriate pedagogical recommendations.' : 
  ''}
${pedagogicalContext && pedagogicalContext.developmentalStage === 'Adult/Higher Education' ? 
  `Note: CAPSTONE RESEARCH ARC - Deliverables Design:
  • Milestones emphasize professional publication/presentation
  • Rubrics assess innovation and contribution to field
  • Impact plans target academic/professional communities
  • Self-assessment and peer review are primary` : 
  ''}
${pedagogicalContext && pedagogicalContext.developmentalStage === 'High/Upper Secondary' ? 
  `Note: EXPERT-IN-TRAINING CYCLE - Deliverables Design:
  • Milestones build toward professional-quality work
  • Rubrics balance process and product assessment
  • Impact plans include authentic audiences
  • Reflection emphasizes growth and next steps` : 
  ''}
${pedagogicalContext && pedagogicalContext.developmentalStage === 'Middle/Lower Secondary' ? 
  `Note: PROPOSAL-TO-PRODUCT PIPELINE - Deliverables Design:
  • Milestones celebrate progress and effort
  • Rubrics value creativity and collaboration
  • Impact plans connect to peer and community
  • Multiple formats for showing learning` : 
  ''}
${pedagogicalContext && pedagogicalContext.developmentalStage === 'Elementary/Primary' ? 
  `Note: INVESTIGATOR'S TOOLKIT - Deliverables Design:
  • Milestones are visible and celebratory
  • Rubrics use kid-friendly language and visuals
  • Impact plans involve families and school
  • Focus on growth over perfection` : 
  ''}
${pedagogicalContext && pedagogicalContext.developmentalStage === 'Early Childhood' ? 
  `Note: STORY-BASED INQUIRY - Deliverables Design:
  • Milestones are playful achievements
  • Assessment through observation and documentation
  • Sharing with families is primary impact
  • Celebrate every small success` : 
  ''}

## CURRENT PROGRESS:
- Milestones: ${deliverablesData.milestones ? deliverablesData.milestones.map(m => m.title).join(', ') : 'Not yet defined'}
- Assessment Methods: ${deliverablesData.assessmentMethods ? deliverablesData.assessmentMethods.join(', ') : 'Not yet defined'}

## RESPONSE STRUCTURE GUIDELINES:

### FIRST MESSAGE ONLY (Initial Grounding):
1. **STAGE TRANSITION**: Acknowledge completed journey and transition to Student Deliverables
2. **STAGE EXPLANATION**: What the Student Deliverables stage is and why it matters
3. **STEP INTRODUCTION**: "We're starting with Key Milestones"
4. **CLEAR ASK**: What you need from the educator
5. **NO SUGGESTIONS**: Pure grounding only

### SUBSEQUENT MESSAGES (Contextual & Focused):
1. **LIGHT CONTEXTUAL START**: "Great choice!" or "Perfect! Now for the [next step]"
2. **STEP-SPECIFIC GUIDANCE**: Focus only on the current element
3. **CLEAR ASK**: What specific input you need
4. **SUGGESTIONS**: 3 contextual examples they can select OR adapt

### DETERMINE CURRENT STEP:
- If no milestones defined → currentStep = "milestones"
- If milestones exist but no descriptions → currentStep = "descriptions"  
- If milestones and descriptions exist but no assessment methods → currentStep = "assessment"
- If all complete → currentStep = "complete"

### MANDATORY JSON RESPONSE FORMAT:
{
  "chatResponse": "Full response with grounding and explanation. Suggestions only if explicitly instructed.",
  "currentStep": "milestones" | "descriptions" | "assessment" | "complete",
  "interactionType": "conversationalDeliverables",
  "currentStage": "Student Deliverables", 
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"] | null,
  "isStageComplete": false | true,
  "dataToStore": null,
  "deliverablesProgress": {
    "milestones": [],
    "assessmentMethods": []
  }
}

### CRITICAL: RESPONSE TYPES & QUALITY STANDARDS

**DELIVERABLES COMPLETE**: When all milestones have descriptions and assessment methods are defined
- Provide summary of milestones and assessment approach
- Congratulate them on completing the full ALF design
- Celebrate the completed project framework
- NO more suggestions

**QUALITY RESPONSE (First Time)**: User provides a response that meets basic quality standards
- FOR MILESTONES: Must be student deliverables/products (e.g., "Research Report", "Design Proposal"), NOT learning activities
- FOR DESCRIPTIONS: Must describe what students create/produce, with clear audience and purpose
- FOR ASSESSMENT: Must be specific assessment methods appropriate for authentic work
- Acknowledge it meets criteria but offer refinement with QUICK SELECT BUTTONS: "That's a solid [step]! Would you like to refine it further or move forward with '[response]'?"
- Provide quick select options: ["Keep and Continue", "Refine Further"]
- Do NOT capture yet - wait for confirmation or refinement

**COMPLETE CONTENT**: User confirms response after refinement offer OR provides refined version
- Update deliverablesProgress field with their final choice and move to next step
- NO additional suggestions

**POOR QUALITY CONTENT**: User provides learning activities, vague descriptions, or inappropriate assessment methods
- REJECT these responses - do NOT accept them as complete
- Examples to REJECT: "Students research the topic", "Learn about presentation skills", "Traditional test"
- Explain why it doesn't meet the criteria (activities vs deliverables, vague vs specific, traditional vs authentic assessment)
- Coach them toward proper format with specific guidance
- Provide 3 "What if" suggestions to help them reframe properly

**WHAT IF SELECTION**: User clicks a "What if" suggestion
- Extract the core concept from the "What if" suggestion
- Ask them to develop it into their own phrasing
- Don't capture the "What if" as their actual response
- Guide them to make it their own: "How would YOU phrase [concept] as your [step]?"

**INCOMPLETE CONTENT**: User provides fragments/keywords
- Acknowledge their thinking
- Ask them to develop it into a complete response
- Stay on current step
- Provide 3 "What if" suggestions to expand thinking

**HELP REQUEST**: User asks for suggestions
- Provide 3 specific suggestions
- Stay on current step

**CONCRETE OPTIONS**: When user needs direct examples after coaching attempts
- Offer 3 well-formed, complete examples they can select
- Explain why these are strong examples
- Allow them to select one or propose their own based on the model

### QUALITY COACHING REQUIREMENTS:
- Be a strict coach - don't accept mediocre responses
- Milestones should be DELIVERABLES/PRODUCTS students create, not learning activities they do
- Descriptions should specify audience, purpose, and format clearly
- Assessment methods should be authentic and appropriate for real-world work
- Help educators distinguish between traditional school assignments and authentic deliverables
- After coaching attempts, provide concrete well-formed examples to choose from

### INITIAL CONVERSATION RULE:
For the very first response, suggestions MUST be null. Only provide suggestions after the user has responded to initial grounding.

### CRITICAL CONVERSATION RULES:
- FIRST interaction: Stage transition + deliverables overview, NO suggestions
- SUBSEQUENT interactions: Light context + step-specific guidance + suggestions
- Connect each element to authentic assessment principles
- Make current step clear without repeating entire framework
- Keep responses conversational and focused on the current task
- Avoid redundant explanations of the deliverables framework

### CRITICAL SUGGESTIONS ARRAY FORMATTING RULES:
- ABSOLUTELY NEVER put "What if" suggestions in chatResponse text - they MUST ONLY go in suggestions array
- NEVER mention "What if" in chatResponse - even phrases like "consider these What if questions" are FORBIDDEN
- NEVER use bullet points (*, -, •) for suggestions in chatResponse - use suggestions array instead
- When providing "What if" suggestions, use this format: ["What if the milestone was 'Research Portfolio'?", "What if...", "What if..."]
- When providing concrete options, put them directly in suggestions array: ["Research Report", "Community Presentation", "Design Proposal"]
- When offering refinement, use: ["Keep and Continue", "Refine Further"]
- chatResponse should ONLY explain the context and ask questions - suggestions array contains ALL clickable options
- WRONG: "Here are some suggestions: * What if..." - CORRECT: chatResponse explains, suggestions array has the options
- WRONG: "Consider these What if questions" - CORRECT: "Let me provide some coaching suggestions" and put "What if" in suggestions array
- chatResponse must NEVER contain the words "What if" in any form

### STAGE OVERVIEW (USE AT START):
${pedagogicalContext?.developmentalStage === 'Early Childhood' ?
`"**Beautiful work! Your learning adventure path is clear.** 🌈

You've mapped phases: ${journeyData.phases ? journeyData.phases.map(p => p.title).join(' → ') : 'Your magical journey'}

Now we enter **STUDENT DELIVERABLES** - where young learners create treasures that show their growth! Research on authentic assessment (Katz & Chard's Project Approach) shows that even our youngest learners benefit from creating meaningful products to share.

We'll design:
- **Celebration Milestones**: Joyful markers of progress that honor effort and growth
- **Growth Documentation**: Developmentally appropriate ways to make learning visible
- **Sharing Celebrations**: Authentic audiences who will celebrate their discoveries

This approach honors how young children naturally want to show what they know and can do!"` :
pedagogicalContext?.developmentalStage === 'Elementary/Primary' ?
`"**Excellent journey mapping! Time to design meaningful deliverables.** 🎯

Your investigation phases: ${journeyData.phases ? journeyData.phases.map(p => p.title).join(' → ') : 'Your learning progression'}

Now for **STUDENT DELIVERABLES** - where young investigators showcase their discoveries! Educational research (Costa & Kallick's Habits of Mind) demonstrates that elementary students develop deeper understanding when they create authentic products for real audiences.

We'll establish:
- **Achievement Milestones**: Clear targets that build toward your Challenge
- **Success Criteria**: Kid-friendly rubrics that promote self-assessment
- **Impact Strategy**: Real audiences who value student work

This transforms learning from 'school work' into meaningful contribution!"` :
pedagogicalContext?.developmentalStage === 'Middle/Lower Secondary' ?
`"**Strong learning journey! Now for authentic deliverables.** 💪

Your skill-building phases: ${journeyData.phases ? journeyData.phases.map(p => p.title).join(' → ') : 'Your expertise development'}

Time for **STUDENT DELIVERABLES** - where adolescents create work that matters! Research on adolescent motivation (Eccles et al.) shows that meaningful products for authentic audiences dramatically increase engagement and learning depth.

We'll develop:
- **Progress Milestones**: Achievements that feel like leveling up in expertise
- **Excellence Criteria**: Rubrics that balance high standards with growth mindset
- **Impact Plan**: Real-world audiences who genuinely need student work

This gives their learning authentic purpose beyond grades!"` :
`"**Exceptional learning design! Now for professional-quality deliverables.** 🎓

Your professional development phases: ${journeyData.phases ? journeyData.phases.map(p => p.title).join(' → ') : 'Your mastery progression'}

We now design **STUDENT DELIVERABLES** - authentic products that demonstrate emerging expertise. Research on expertise development (Chi et al.) shows that creating professional-quality deliverables accelerates the transition from novice to practitioner.

We'll architect:
- **Professional Milestones**: Deliverables that build a portfolio of authentic work
- **Industry Standards**: Assessment criteria drawn from professional practice
- **Impact Strategy**: Stakeholder engagement that creates real value

This positions students as emerging professionals, not just learners!"`}
`;
  },

  stepPrompts: {
    milestones: (project, ideationData, journeyData) => {
      const ageGroup = project.ageGroup || 'your students';
      const challenge = ideationData.challenge || 'their final challenge';
      const _phases = journeyData.phases || []; // Available for template context
      
      let examples = [];
      if (project.subject?.toLowerCase().includes('history')) {
        examples = ['Historical Analysis Report', 'Community Presentation', 'Digital Archive Contribution'];
      } else if (project.subject?.toLowerCase().includes('science')) {
        examples = ['Research Findings Report', 'Solution Prototype', 'Scientific Communication'];
      } else if (project.subject?.toLowerCase().includes('urban') || project.subject?.toLowerCase().includes('planning')) {
        examples = ['Community Needs Assessment', 'Development Proposal', 'Public Presentation'];
      } else {
        examples = ['Research Portfolio', 'Creative Solution', 'Community Showcase'];
      }
      
      return {
        prompt: `**Designing KEY MILESTONES** - Step 1 of 3 🎯

${pedagogicalContext?.developmentalStage === 'Early Childhood' ?
`For young learners, milestones should feel like treasures they create and share. Documentation research (Project Zero) shows that making learning visible through concrete products deepens understanding and joy.` :
pedagogicalContext?.developmentalStage === 'Elementary/Primary' ?
`Elementary students thrive when creating products that feel "real." Research on authentic learning (Newmann et al.) shows that students invest more deeply when their work has value beyond the classroom.` :
pedagogicalContext?.developmentalStage === 'Middle/Lower Secondary' ?
`Adolescents need deliverables that feel professional and impactful. Identity development research (Erikson) shows this age group seeks ways to demonstrate competence and contribute meaningfully.` :
`Advanced learners benefit from portfolio-worthy deliverables. Professional learning research indicates that creating industry-standard products accelerates expertise development.`}

**CRITICAL DISTINCTION - Products vs. Process:**
✅ **Milestones are DELIVERABLES** (tangible products students create)
   Examples: "Research Report", "Community Presentation", "Design Proposal"
   
❌ **NOT learning activities** (things students do)
   Avoid: "Research the topic", "Practice presenting", "Study examples"

**The Science of Meaningful Milestones:**
Authentic assessment research (Grant Wiggins) shows that when students create real products for real audiences, they develop both deeper understanding and transferable skills.

**Exemplar Milestones for ${project.subject}:**

🏆 **${examples[0]}**
   *Professional parallel:* What ${project.subject?.toLowerCase().includes('history') ? 'historians' : project.subject?.toLowerCase().includes('science') ? 'scientists' : 'professionals'} actually create
   *Student version:* Adapted for ${ageGroup} capabilities
   
🏆 **${examples[1]}**
   *Authentic audience:* ${project.subject?.toLowerCase().includes('urban') ? 'Community stakeholders' : 'Field experts'} who value this work
   *Growth opportunity:* Builds communication and synthesis skills
   
🏆 **${examples[2]}**
   *Real-world impact:* Creates value beyond the classroom
   *Portfolio potential:* Demonstrates emerging expertise

**Design Consideration:** Each milestone should feel like a meaningful achievement that ${ageGroup} will be proud to share, building toward "${challenge}".

What 2-4 deliverables will best showcase student learning and create authentic value?`,
        examples,
        followUpQuestions: [
          "What products will students create to show their learning?",
          "What deliverables build toward the final Challenge?", 
          "What would authentic work look like in this field?"
        ]
      };
    },

    descriptions: (project, ideationData, currentMilestone) => {
      const ageGroup = project.ageGroup || 'your students';
      
      let examples = [];
      if (currentMilestone?.toLowerCase().includes('report') || currentMilestone?.toLowerCase().includes('analysis')) {
        examples = [
          "A 5-page research report presenting findings to local government officials, including data analysis, recommendations, and visual representations",
          "A comprehensive analysis document shared with community stakeholders, featuring primary research, expert interviews, and actionable insights",
          "A professional-style report for authentic audience review, combining quantitative data with qualitative observations and policy recommendations"
        ];
      } else if (currentMilestone?.toLowerCase().includes('presentation') || currentMilestone?.toLowerCase().includes('showcase')) {
        examples = [
          "A 15-minute presentation to community members and local officials, featuring visual aids, clear recommendations, and Q&A session",
          "A public showcase event where students present solutions to real community stakeholders, including interactive displays and peer feedback",
          "A formal presentation to authentic audience members, demonstrating professional communication skills and expert-level content knowledge"
        ];
      } else if (currentMilestone?.toLowerCase().includes('proposal') || currentMilestone?.toLowerCase().includes('design')) {
        examples = [
          "A detailed design proposal for community implementation, including budget considerations, timeline, and stakeholder impact analysis",
          "A comprehensive solution proposal presented to decision-makers, featuring research-backed recommendations and implementation strategies",
          "A professional-quality design document suitable for real-world consideration, with visual mockups, feasibility analysis, and next steps"
        ];
      } else {
        examples = [
          "A comprehensive portfolio showcasing student learning journey, professional presentation quality, shared with authentic community audience",
          "A creative solution addressing real community needs, designed for actual implementation, presented to relevant stakeholders",
          "A meaningful contribution to ongoing community work, created to professional standards, with measurable impact potential"
        ];
      }

      return {
        prompt: `**Detailing "${currentMilestone}"** - Making Excellence Clear 📝

${pedagogicalContext?.developmentalStage === 'Early Childhood' ?
`Young learners need concrete, visual descriptions of success. Reggio Emilia documentation shows that clear expectations, presented developmentally, empower children to exceed them.` :
pedagogicalContext?.developmentalStage === 'Elementary/Primary' ?
`Elementary students benefit from specific success criteria with examples. Research on self-regulated learning shows that clear targets help students take ownership of their progress.` :
pedagogicalContext?.developmentalStage === 'Middle/Lower Secondary' ?
`Adolescents appreciate professional-level specifications. Research on motivation shows that high, clear expectations combined with support lead to optimal performance.` :
`Advanced learners need industry-standard specifications. Expertise research shows that professional-quality criteria accelerate skill development.`}

**Components of Excellent Milestone Descriptions:**

💯 **Format & Specifications**
- Concrete details (length, components, media)
- Technical requirements appropriate to age
- Professional standards adapted for students

👥 **Authentic Audience**
- Specific stakeholders who need this work
- Why they care about student contributions
- How they'll engage with deliverables

🎯 **Purpose & Impact**
- Real-world application of the work
- Value created for the community
- Connection to professional practice

📊 **Learning Demonstration**
- Skills and knowledge made visible
- Growth opportunities embedded
- Portfolio and reflection potential

**Professional-Quality Descriptions for "${currentMilestone}":**

✨ **Option 1:** ${examples[0]}
   *Why this works:* Balances rigor with accessibility
   
✨ **Option 2:** ${examples[1]}
   *Why this works:* Creates authentic purpose and audience
   
✨ **Option 3:** ${examples[2]}
   *Why this works:* Mirrors professional standards appropriately

**Quality Check:** Will ${ageGroup} be excited to create this? Will the audience genuinely value it?

How would you specify "${currentMilestone}" to inspire excellence while ensuring accessibility?`,
        examples,
        followUpQuestions: [
          "Who is the authentic audience for this deliverable?",
          "What format will best serve the learning goals?",
          "How does this connect to real professional work?"
        ]
      };
    },

    assessment: (project, ideationData, milestones) => {
      const ageGroup = project.ageGroup || 'your students';
      const isYounger = project.ageGroup && (project.ageGroup.includes('Ages 5-') || project.ageGroup.includes('Ages 6-') || project.ageGroup.includes('K-'));
      
      let examples = [];
      if (isYounger) {
        examples = [
          "Student self-reflection with visual learning journals and teacher conferences",
          "Peer feedback circles with structured question prompts and celebration of growth",
          "Portfolio review with families and community members providing authentic feedback"
        ];
      } else {
        examples = [
          "Authentic audience feedback from community experts and stakeholders who review deliverables",
          "Peer review process using professional standards and constructive feedback protocols",
          "Self-reflection portfolios with learning goal tracking and growth documentation"
        ];
      }

      return {
        prompt: `**Architecting ASSESSMENT METHODS** - Step 3 of 3 📊

${pedagogicalContext?.developmentalStage === 'Early Childhood' ?
`Young learners need joyful assessment that celebrates growth. Portfolio assessment research (Helm & Katz) shows that documenting learning journeys builds metacognition and confidence.` :
pedagogicalContext?.developmentalStage === 'Elementary/Primary' ?
`Elementary students benefit from assessment AS learning. Black & Wiliam's formative assessment research demonstrates that ongoing feedback dramatically improves achievement and self-efficacy.` :
pedagogicalContext?.developmentalStage === 'Middle/Lower Secondary' ?
`Adolescents thrive with peer and self-assessment opportunities. Research shows that collaborative assessment develops both content mastery and critical thinking skills.` :
`Advanced learners need professional-standard assessment. Authentic assessment research shows that industry-based evaluation accelerates the novice-to-expert transition.`}

**Assessment Philosophy for Authentic Learning:**

🌱 **Growth-Oriented**: Focus on progress, not perfection
🤝 **Multi-Perspective**: Include self, peer, and expert voices
🎯 **Standards-Based**: Clear criteria aligned to real-world excellence
🔄 **Iterative**: Multiple opportunities to improve and excel

**Research-Based Assessment Principles:**

**Formative Power** (Hattie & Timperley)
- Ongoing feedback that guides next steps
- Specific, actionable, and timely
- Focused on process AND product

**Authentic Criteria** (Wiggins)
- Mirrors professional evaluation
- Values real-world application
- Recognizes diverse excellence

**Student Agency** (Zimmerman)
- Self-assessment builds metacognition
- Peer feedback develops critical analysis
- Reflection deepens learning transfer

**Innovative Assessment Approaches:**

🌟 **${examples[0]}**
   *Research support:* ${isYounger ? 'Develops self-awareness and celebration mindset' : 'Builds professional evaluation skills'}
   *Implementation:* ${isYounger ? 'Age-appropriate tools and protocols' : 'Industry-standard review processes'}
   
🌟 **${examples[1]}**
   *Research support:* Collaborative assessment improves both learning and community
   *Implementation:* Structured protocols ensure constructive feedback
   
🌟 **${examples[2]}**
   *Research support:* External validation increases motivation and authenticity
   *Implementation:* Real stakeholders provide meaningful evaluation

**Equity Consideration:** How will assessment honor diverse ways of demonstrating excellence?

What assessment methods will best support ${ageGroup} in growing toward professional-quality work?`,
        examples,
        followUpQuestions: [
          "How do professionals in this field receive feedback?",
          "What assessment methods support student growth?",
          "How can we recognize different types of achievement?"
        ]
      };
    }
  },

  responseTemplates: {
    encouragement: [
      "That's excellent authentic assessment design!",
      "Perfect - that really mirrors professional work!",
      "Great thinking about real-world deliverables!",
      "That's exactly the kind of authentic product we want!",
      "Excellent choice for meaningful student work!"
    ],

    clarification: [
      "Tell me more about what students will create...",
      "That's interesting - who will be the audience for this?",
      "Help me understand the final product you're envisioning...",
      "What draws you to that format for this age group?",
      "How does that connect to professional work in the field?"
    ],

    completion: {
      allDone: (milestones, assessmentMethods, projectInfo, ideationData) => {
        const pedagogicalContext = projectInfo?.ageGroup ? getPedagogicalContext(projectInfo.ageGroup) : null;
        
        return `
**🎉 CONGRATULATIONS! Your Active Learning Framework is complete!** 🏆

**Your Student Deliverables Architecture:**
${milestones?.map((m, i) => `${i + 1}. **${m.title}**: ${m.description || 'Professionally specified'}`).join('\n') || 'Authentic milestones established'}

**Assessment Excellence:** ${assessmentMethods?.join(', ') || 'Growth-oriented evaluation system'}

**The ALF Impact - What You've Created:**

\ud83c\udf93 **Pedagogical Foundation**
- Big Idea: Meaningful concept that matters
- Essential Question: Drives authentic inquiry  
- Challenge: Real-world application of learning

\ud83d\ude80 **Learning Architecture**
- Journey Phases: Research-based progression
- Active Engagement: Students as practitioners
- Authentic Resources: Real tools and experts

\ud83c\udfc6 **Excellence Framework**
- Professional Deliverables: Portfolio-worthy work
- Authentic Assessment: Mirrors real-world evaluation
- Meaningful Impact: Value beyond the classroom

**Research Validation:**
Your design embodies best practices from:
- **Authentic Learning** (Herrington & Oliver): Real-world relevance
- **Understanding by Design** (Wiggins & McTighe): Backward from outcomes
- **Project-Based Learning** (Buck Institute): Gold Standard elements
- **Culturally Responsive Teaching** (Hammond): Honors all learners

${pedagogicalContext?.developmentalStage === 'Early Childhood' ?
`Your framework transforms early learning into joyful exploration with meaningful sharing - exactly what young minds need!` :
pedagogicalContext?.developmentalStage === 'Elementary/Primary' ?
`Your design turns students into real investigators and problem-solvers, building confidence alongside competence!` :
pedagogicalContext?.developmentalStage === 'Middle/Lower Secondary' ?
`You've created a framework where adolescents can develop genuine expertise while making real contributions!` :
`Your professional learning framework positions students as emerging experts ready to contribute to their field!`}

**Next Steps:**
1. Share this framework with colleagues for feedback
2. Consider how to introduce it to students with excitement
3. Plan your role as facilitator of this authentic learning
4. Celebrate this thoughtful design work!

You've designed not just a project, but a transformative learning experience. Well done! 🌟`;
      },

      refinement: (pedagogicalContext, currentStep) => {
        const stage = pedagogicalContext?.developmentalStage || 'learner';
        
        return `**Final Reflection** \ud83e\udd14

${currentStep === 'assessment' ?
`Before we celebrate completion, would you like to enhance any assessment methods to better support ${stage === 'Early Childhood' ? 'joyful growth documentation' : stage === 'Elementary/Primary' ? 'student self-assessment skills' : stage === 'Middle/Lower Secondary' ? 'peer feedback and reflection' : 'professional evaluation standards'}?` :
`Would you like to refine any milestone descriptions to ensure they inspire ${stage === 'Early Childhood' ? 'creative expression' : stage === 'Elementary/Primary' ? 'proud achievement' : stage === 'Middle/Lower Secondary' ? 'meaningful contribution' : 'professional excellence'}?`}

Or are you ready to celebrate this comprehensive Active Learning Framework?`;
      }
    }
  }
};

export default conversationalDeliverablesPrompts;