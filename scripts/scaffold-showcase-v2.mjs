#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const manifestPath = path.resolve('src/data/generated/hero/manifest.json');
const outDir = path.resolve('src/data/showcaseV2');
const regPath = path.resolve('src/utils/showcaseV2-registry.ts');

const slugMap = {
  'hero-sustainability-campaign': 'sustainability-campaign',
  'hero-community-history': 'living-history',
  'hero-assistive-tech': 'assistive-tech',
  'hero-sensing-self': 'sensing-self',
  'hero-move-fair': 'move-fair',
  'hero-future-food': 'future-food',
  'hero-heatsafe-blocks': 'urban-heat',
  'hero-playable-city': 'playable-city',
  'hero-harbor-health': 'harbor-health',
  'hero-civic-signals': 'civic-signals',
  'hero-accessability-ai': 'accessability-ai'
};

const tfMap = dur => {
  const s = String(dur || '').toLowerCase();
  if (s.includes('10') || s.includes('9')) return '8–10 weeks';
  if (s.includes('8') || s.includes('7')) return '6–8 weeks';
  if (s.includes('6') || s.includes('5')) return '4–6 weeks';
  if (s.includes('4') || s.includes('3')) return '2–4 weeks';
  return '6–8 weeks';
};

const gbMap = g => {
  const s = String(g || '').toLowerCase();
  if (s.includes('high')) return 'HS';
  if (s.includes('middle') || s.includes('ms')) return 'MS';
  return 'ES';
};

const weeksFromTf = tf => {
  if (tf === '4–6 weeks') return 5;
  if (tf === '6–8 weeks') return 7;
  if (tf === '8–10 weeks') return 9;
  if (tf === '10–12 weeks') return 11;
  if (tf === '2–4 weeks') return 3;
  return 7;
};

const readJson = filePath => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Failed to read JSON at ${filePath}: ${error.message}`);
  }
};

const manifest = readJson(manifestPath);
if (!manifest || !Array.isArray(manifest.projects)) {
  throw new Error('Hero manifest missing projects array.');
}

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const imports = [];
const entries = [];

for (const project of manifest.projects) {
  const originalId = project.id;
  const slug = slugMap[originalId] || originalId;
  const varName = `${slug.replace(/[-]/g, '_')}V2`;
  const filePath = path.join(outDir, `${slug}.showcase.ts`);
  const heroDataPath = path.resolve(project.path);
  const heroData = readJson(heroDataPath);

  const subjects = Array.isArray(project.subjects) ? project.subjects : [];
  const timeframe = tfMap(project.duration || heroData.duration || '');
  const gradeBand = gbMap(project.gradeLevel || heroData.gradeLevel || '');
  const totalWeeks = weeksFromTf(timeframe);
  const image = heroData.image ? String(heroData.image).trim() : '';
  const title = project.title || heroData.title || slug;

  const contentLines = [
    "import type { ProjectShowcaseV2 } from '../../types/showcaseV2';",
    '',
    `export const ${varName}: ProjectShowcaseV2 = {`,
    `  id: '${slug}',`,
    "  version: '2.0.0',",
    '  hero: {',
    `    title: ${JSON.stringify(title)},`,
    "    tagline: '',",
    `    gradeBand: '${gradeBand}',`,
    `    timeframe: '${timeframe}',`,
    `    subjects: ${JSON.stringify(subjects)},`,
    image ? `    image: ${JSON.stringify(image)}` : undefined,
    '  },',
    "  microOverview: ['TODO', 'TODO', 'TODO'],",
    "  fullOverview: '',",
    `  schedule: { totalWeeks: ${totalWeeks}, lessonsPerWeek: 3, lessonLengthMin: 55 },`,
    '  runOfShow: [],',
    "  outcomes: { core: [], extras: [], audiences: [] },",
    "  materialsPrep: { coreKit: [], noTechFallback: [], safetyEthics: [] },",
    '  assignments: [],',
    '  polish: undefined,',
    "  planningNotes: ''",
    '};',
    ''
  ].filter(Boolean);

  fs.writeFileSync(filePath, contentLines.join('\n'), 'utf8');

  imports.push(`import { ${varName} } from '../data/showcaseV2/${slug}.showcase';`);
  entries.push(`  '${slug}': ${varName},`);
}

const registrySource = `import type { ProjectShowcaseV2 } from '../types/showcaseV2';
${imports.join('\n')}

const REGISTRY: Record<string, ProjectShowcaseV2> = {
${entries.join('\n')}
};

export function getProjectV2(id: string): ProjectShowcaseV2 | undefined {
  return REGISTRY[id];
}

export function listProjectsV2(): Array<{ id: string; title: string; gradeBand: string; timeframe: string; subjects: string[]; image?: string }> {
  return Object.entries(REGISTRY).map(([id, p]) => ({
    id,
    title: p.hero.title,
    gradeBand: p.hero.gradeBand,
    timeframe: p.hero.timeframe,
    subjects: p.hero.subjects,
    image: p.hero.image
  }));
}
`;

fs.writeFileSync(regPath, registrySource, 'utf8');

console.log('Scaffolded V2 showcase files:', manifest.projects.map(p => slugMap[p.id] || p.id).join(', '));
