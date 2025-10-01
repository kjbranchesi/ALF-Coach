/**
 * Coaching Responses
 * Provides context-aware guidance and post-capture coaching
 */

import type { CapturedData, Stage, WizardContext } from './stages';

/**
 * Get coaching message after capturing input
 * Provides next steps and guidance instead of just "Perfect!"
 */
export function getPostCaptureCoaching(
  stage: Stage,
  captured: CapturedData,
  wizard: WizardContext
): string | null {
  switch (stage) {
    case 'BIG_IDEA': {
      const bigIdea = captured.ideation?.bigIdea;
      if (!bigIdea) return null;

      return `Great! **"${bigIdea}"** gives students a powerful lens for understanding this topic.\n\n**Next, let's craft an essential question** that makes this idea come alive. Think about:\n• What problem or opportunity connects to this?\n• What would make ${wizard.gradeLevel || 'students'} want to investigate?\n• How can they apply this to their world?`;
    }

    case 'ESSENTIAL_QUESTION': {
      const eq = captured.ideation?.essentialQuestion;
      if (!eq) return null;

      return `**"${eq}"** will drive deep inquiry.\n\n**Now let's define an authentic challenge** where students answer this for a real audience.\n\nConsider:\n• Who needs this answer? (families, community leaders, peers?)\n• What could students create that makes a difference?\n• What would success look like?`;
    }

    case 'CHALLENGE': {
      const challenge = captured.ideation?.challenge;
      if (!challenge) return null;

      return `**"${challenge}"** sets up authentic work!\n\n**Time to map the learning journey.** I'll suggest a complete ${wizard.duration || ''} journey structure based on your project, then you can customize if needed.\n\nReady to see the suggested journey?`;
    }

    case 'JOURNEY': {
      const phases = captured.journey?.phases || [];
      if (phases.length === 0) return null;

      if (phases.length < 3) {
        return `You have **${phases.length} ${phases.length === 1 ? 'phase' : 'phases'}** so far.\n\nMost ${wizard.duration || ''} projects work best with **3-4 phases** to give students time to investigate, design, build, and reflect.\n\nWant me to suggest a complete journey structure?`;
      }

      return `Excellent! You've mapped **${phases.length} phases**:\n${phases.map((p, i) => `${i + 1}. ${p.name}`).join('\n')}\n\n**Next: Define deliverables and assessment.**\n\nWhat artifacts will students create? How will you know they've mastered the learning?\n\nI can suggest a complete structure if helpful.`;
    }

    case 'DELIVERABLES': {
      const milestones = captured.deliverables?.milestones || [];
      const artifacts = captured.deliverables?.artifacts || [];
      const criteria = captured.deliverables?.rubric?.criteria || [];

      if (milestones.length === 0 && artifacts.length === 0 && criteria.length === 0) {
        return null;
      }

      const needs: string[] = [];
      if (milestones.length < 3) needs.push(`**${3 - milestones.length} more milestones**`);
      if (artifacts.length === 0) needs.push('**final artifacts**');
      if (criteria.length < 3) needs.push(`**${3 - criteria.length} more rubric criteria**`);

      if (needs.length > 0) {
        return `Good start! To complete deliverables, you still need:\n${needs.map(n => `• ${n}`).join('\n')}\n\nI can suggest these if helpful.`;
      }

      return `Fantastic! Your deliverables are complete:\n• **${milestones.length} milestones** to track progress\n• **${artifacts.length} ${artifacts.length === 1 ? 'artifact' : 'artifacts'}** for assessment\n• **${criteria.length} rubric criteria** for quality\n\nYour project structure is ready!`;
    }

    default:
      return null;
  }
}

/**
 * Get stage-specific guidance when user asks for help
 */
export function getStageGuidance(
  stage: Stage,
  captured: CapturedData,
  wizard: WizardContext
): string {
  const subject = wizard.subjects?.[0] || 'your subject';
  const gradeLevel = wizard.gradeLevel || 'students';
  const duration = wizard.duration || 'your timeline';

  switch (stage) {
    case 'BIG_IDEA':
      return `Happy to help! A strong **Big Idea** is a transferable concept students can apply beyond your class.\n\n**Examples for ${subject}:**\n• Systems thinking reveals hidden connections\n• Perspective shapes how we interpret experiences\n• Small changes can create large-scale impacts\n• Patterns help us predict and prepare\n\n**Your turn:** What's the "a-ha" moment you want ${gradeLevel} to have? What concept will stick with them?`;

    case 'ESSENTIAL_QUESTION':
      return `An **Essential Question** makes students want to investigate!\n\n**What makes a good EQ:**\n• Starts with "How might..." or "What happens when..."\n• Connects to students' lived experiences\n• Can't be answered with yes/no\n• Leads to meaningful work\n\n**Example transformation:**\nWeak: "What is climate change?"\nStrong: "How might our community adapt to changing climate patterns?"\n\n${captured.ideation?.bigIdea ? `**Your Big Idea:** "${captured.ideation.bigIdea}"\n\nWhat question would help students explore this?` : 'Want to try crafting one?'}`;

    case 'CHALLENGE':
      return `The **Challenge** names what students will DO and for WHOM.\n\n**Formula:** [Action verb] + [What they create] + for [Authentic audience]\n\n**Examples:**\n• Design a workshop for parents\n• Create a campaign for local businesses  \n• Build a resource guide for city council\n• Produce a documentary for community members\n• Curate an exhibition for museum visitors\n\n${captured.ideation?.essentialQuestion ? `**Your Essential Question:** "${captured.ideation.essentialQuestion}"\n\nWhat could ${gradeLevel} create to answer this question?` : 'What authentic work would be meaningful?'}`;

    case 'JOURNEY':
      return `I can help structure your **learning journey**!\n\n**Most projects follow this arc:**\n1. **Investigate** (early weeks): Research, interviews, context-building\n2. **Design** (middle): Brainstorm, prototype, get feedback\n3. **Build** (late): Create final work, refine, rehearse\n4. **Share** (final): Present to audience, reflect, celebrate\n\n**For your ${duration} project**, I can:\n• Generate a complete journey structure tailored to ${subject}\n• Help you build it phase-by-phase\n• Show examples from similar projects\n\nWant me to suggest a complete journey?`;

    case 'DELIVERABLES':
      return `**Deliverables** show what students create and how you assess quality.\n\n**You need three components:**\n\n📍 **Milestones** (3-4): Checkpoints showing progress\n   Example: "Research insights synthesized"\n\n🎯 **Artifacts** (1-2): What students turn in\n   Example: "Exhibition ready for visitors"\n\n📊 **Rubric** (3-6 criteria): What quality looks like\n   Example: "Evidence is credible and relevant"\n\n${captured.ideation?.challenge ? `**For your challenge:** "${captured.ideation.challenge}"\n\nI can suggest a complete deliverable structure. Want to see it?` : 'I can suggest a structure tailored to your project.'}`;

    default:
      return "I'm here to help! What specific question do you have?";
  }
}
