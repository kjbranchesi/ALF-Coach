import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGenerator, Config } from 'ts-json-schema-generator';

interface SchemaSpec {
  readonly label: string;
  readonly typeName: string;
  readonly source: string;
  readonly output: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = resolve(__dirname, '..');
const schemaDir = resolve(projectRoot, 'schemas');

const specs: SchemaSpec[] = [
  {
    label: 'HeroProjectData',
    typeName: 'HeroProjectData',
    source: resolve(projectRoot, 'src', 'utils', 'hero', 'types.ts'),
    output: resolve(schemaDir, 'hero-project.schema.json')
  },
  {
    label: 'ALF Project',
    typeName: 'Project',
    source: resolve(projectRoot, 'src', 'types', 'alf.ts'),
    output: resolve(schemaDir, 'alf-project.schema.json')
  },
  {
    label: 'ALF Project V3',
    typeName: 'ProjectV3',
    source: resolve(projectRoot, 'src', 'types', 'alf.ts'),
    output: resolve(schemaDir, 'alf-project-v3.schema.json')
  }
];

function generateSchema(spec: SchemaSpec) {
  const config: Config = {
    path: spec.source,
    tsconfig: resolve(projectRoot, 'tsconfig.json'),
    type: spec.typeName,
    expose: 'export',
    topRef: true,
    skipTypeCheck: false,
    additionalProperties: false
  };

  const generator = createGenerator(config);
  const schema = generator.createSchema(spec.typeName);

  mkdirSync(dirname(spec.output), { recursive: true });
  writeFileSync(spec.output, JSON.stringify(schema, null, 2));
  console.log(`✓ Generated ${spec.label} schema -> ${spec.output}`);
}

function run() {
  specs.forEach(generateSchema);
  console.log('Schema generation complete.');
}

run();
