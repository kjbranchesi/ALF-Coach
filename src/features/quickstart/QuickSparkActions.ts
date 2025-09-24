import { nanoid } from 'nanoid';
import type { ShowcaseProject } from '../../types/showcase';
import type { UnifiedProject } from '../../types/project';
import { fromShowcase } from '../../utils/transformers/projectTransformers';
import { saveUnifiedProject } from '../../services/ShowcaseStorage';
import type { QuickSparkInput, QuickSparkResult } from './QuickSparkPrompt';

export interface ConvertToProjectOptions {
  input: QuickSparkInput;
  result: QuickSparkResult;
}

const buildProjectId = (subject: string, topic?: string): string => {
  const base = topic || subject || 'quick-spark';
  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return `qs-${slug || 'project'}-${Date.now().toString(36)}-${nanoid(4)}`;
};

const buildMicroOverview = ({ subject, topic }: QuickSparkInput): string => {
  const focus = topic || subject;
  if (!focus) {
    return 'Students launch a quick investigation, gather evidence with teammates, and pitch a next step that matters to our community.';
  }
  return `Students explore “${focus}” through rapid observation, questioning, and storytelling. Teams capture short evidence bursts, surface who is impacted, and pitch the most urgent next step for our community.`;
};

export async function convertToProject({ input, result }: ConvertToProjectOptions): Promise<UnifiedProject> {
  const id = buildProjectId(input.subject, input.topic);
  const project: ShowcaseProject = {
    meta: {
      id,
      title: `${input.subject ? `${input.subject} Quick Spark` : 'Quick Spark Project'}`,
      tagline: input.topic ? `Launching an inquiry into ${input.topic}` : 'Rapid launch to spark inquiry',
      subjects: input.subject ? [input.subject] : [],
      gradeBands: input.gradeBand ? [input.gradeBand] : [],
      duration: result.miniActivity.timeWindow || '1–2 lessons',
      tags: input.topic ? [input.topic] : [],
    },
    microOverview: {
      microOverview: buildMicroOverview(input),
    },
    quickSpark: {
      hooks: result.hooks,
      miniActivity: result.miniActivity,
    },
    outcomeMenu: undefined,
    assignments: [],
    accessibilityUDL: undefined,
    communityJustice: {
      guidingQuestion: input.topic
        ? `Who is most affected by “${input.topic}” in our context?`
        : 'Who benefits if we keep momentum on this spark? ',
      stakeholders: [],
      ethicsNotes: [],
    },
    sharePlan: undefined,
    gallery: undefined,
      polishFlags: undefined,
  };

  const unified = fromShowcase(project);
  unified.metadata = {
    ...unified.metadata,
    variant: 'showcase',
    createdAt: unified.metadata.createdAt,
    updatedAt: unified.metadata.updatedAt,
  };
  await saveUnifiedProject(unified);
  return unified;
}

export default {
  convertToProject,
};
