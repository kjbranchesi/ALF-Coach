#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import process from 'node:process';

const rawArgs = process.argv.slice(2);
const options = {};

for (let i = 0; i < rawArgs.length; i += 1) {
  const arg = rawArgs[i];
  if (!arg.startsWith('--')) continue;

  const eqIndex = arg.indexOf('=');
  if (eqIndex !== -1) {
    const key = arg.slice(2, eqIndex);
    const value = arg.slice(eqIndex + 1);
    options[key] = value;
  } else {
    const key = arg.slice(2);
    const nextValue = rawArgs[i + 1];
    if (nextValue && !nextValue.startsWith('--')) {
      options[key] = nextValue;
      i += 1;
    } else {
      options[key] = true;
    }
  }
}

const requiredKeys = ['id', 'title', 'grade', 'subjects', 'duration'];
const missing = requiredKeys.filter(key => !options[key]);

if (missing.length > 0) {
  console.error(`Missing required arguments: ${missing.map(key => `--${key}`).join(', ')}`);
  console.error('Usage: node scripts/new-showcase-project.mjs --id=living-history --title="Title" --grade="6-8" --subjects="ELA,Social Studies" --duration="6-8 weeks"');
  process.exit(1);
}

const normalizeArray = value => value
  .split(',')
  .map(item => item.trim())
  .filter(Boolean);

const makeExportName = (identifier) => {
  const cleaned = identifier
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-');

  const camel = cleaned
    .split(/[-_]/g)
    .filter(Boolean)
    .map((segment, index) => (
      index === 0 ? segment : segment.charAt(0).toUpperCase() + segment.slice(1)
    ))
    .join('');

  if (!camel) {
    return 'showcaseProject';
  }

  if (!/^[A-Za-z_]/.test(camel)) {
    return `project${camel.charAt(0).toUpperCase()}${camel.slice(1)}`;
  }

  return camel;
};

const id = options.id.trim();
const title = options.title.trim();
const gradeBands = normalizeArray(options.grade);
const subjects = normalizeArray(options.subjects);
const duration = options.duration.trim();
const exportName = makeExportName(id);

const fileRelativePath = `src/data/showcase/${id}.showcase.ts`;
const filePath = resolve(fileRelativePath);

if (existsSync(filePath)) {
  console.error(`File already exists at ${fileRelativePath}`);
  process.exit(1);
}

mkdirSync(dirname(filePath), { recursive: true });

const template = `import type { ShowcaseProject } from '../../types/showcase';

export const ${exportName}: ShowcaseProject = {
  meta: {
    id: '${id}',
    title: '${title.replace(/'/g, "\\'")}',
    tagline: '',
    subjects: [${subjects.map(subject => `'${subject.replace(/'/g, "\\'")}'`).join(', ')}],
    gradeBands: [${gradeBands.map(grade => `'${grade.replace(/'/g, "\\'")}'`).join(', ')}],
    duration: '${duration.replace(/'/g, "\\'")}',
    image: undefined,
    tags: [],
  },
  microOverview: {
    microOverview: '',
    longOverview: undefined,
  },
  quickSpark: undefined,
  outcomeMenu: undefined,
  assignments: [],
  accessibilityUDL: undefined,
  communityJustice: {
    guidingQuestion: '',
    stakeholders: [],
    ethicsNotes: [],
  },
  sharePlan: undefined,
  gallery: undefined,
  polishFlags: undefined,
};
`;

writeFileSync(filePath, template, { encoding: 'utf-8' });
console.log(`Created ${fileRelativePath}`);
