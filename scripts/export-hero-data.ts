import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { register } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '..');

// Register asset loader so hero modules that import images resolve cleanly
await register(new URL('./asset-loader.mjs', import.meta.url).href, import.meta.url);

const heroModule = await import('../src/utils/hero/index.ts');

if (!heroModule.getAllHeroProjects) {
  throw new Error('Failed to load hero project registry');
}

const heroProjects = heroModule.getAllHeroProjects();
const outputDir = resolve(repoRoot, 'src', 'data', 'generated', 'hero');
mkdirSync(outputDir, { recursive: true });

const rootFilePrefix = pathToFileURL(repoRoot + '/').href;

function normalizeValue(value: unknown): unknown {
  if (typeof value === 'string' && value.startsWith('file://')) {
    if (value.startsWith(rootFilePrefix)) {
      return value.slice(rootFilePrefix.length);
    }
    return value.replace('file://', '');
  }
  return value;
}

function toSerializable<T>(input: T): T {
  return JSON.parse(
    JSON.stringify(input, (_key, value) => normalizeValue(value))
  );
}

const summary = heroProjects.map(project => {
  const serializable = toSerializable(project);
  const fileName = `${project.id}.json`;
  const filePath = join(outputDir, fileName);
  writeFileSync(filePath, JSON.stringify(serializable, null, 2));
  return {
    id: project.id,
    title: project.title,
    duration: project.duration,
    gradeLevel: project.gradeLevel,
    subjects: project.subjects,
    path: `src/data/generated/hero/${fileName}`
  };
});

const manifest = {
  generatedAt: new Date().toISOString(),
  count: summary.length,
  projects: summary
};

writeFileSync(join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

console.log(`Exported ${summary.length} hero projects to ${outputDir}`);
