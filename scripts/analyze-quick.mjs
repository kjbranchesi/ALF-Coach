#!/usr/bin/env node
// Quick dead-code analysis without external deps
// - Scans src for imports and builds a simple inbound reference map
// - Flags files with zero inbound references (excluding entries/tests)
// - Scans assets in src/assets and public for orphan basenames

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');
const REPORT_DIR = path.join(ROOT, 'reports', 'deadcode');

function walk(dir, filter = () => true) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p, filter));
    else if (filter(p)) out.push(p);
  }
  return out;
}

function isCode(p) {
  return /(\.tsx?|\.jsx?)$/.test(p) && !p.includes('/__tests__/') && !p.endsWith('.test.tsx') && !p.endsWith('.spec.tsx');
}

function readText(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return ''; }
}

function toPosix(p) { return p.split(path.sep).join('/'); }

// Build list of code files
const codeFiles = walk(SRC, isCode);

// Entry files we consider roots
const ENTRY_FILES = [
  'src/main.jsx',
  'src/main.tsx',
  'src/App.tsx',
  'src/AuthenticatedApp.tsx',
].map(toPosix).filter(f => fs.existsSync(path.join(ROOT, f)));

// Resolve a relative spec from importer to absolute file (best-effort)
const EXT_CANDIDATES = ['.tsx', '.ts', '.jsx', '.js', ''];
const INDEX_CANDIDATES = ['index.tsx', 'index.ts', 'index.jsx', 'index.js'];

function resolveImport(importer, spec) {
  if (!spec.startsWith('.')) return null; // only local files
  const base = path.resolve(path.dirname(importer), spec);
  for (const ext of EXT_CANDIDATES) {
    const fp = base + ext;
    if (fs.existsSync(fp) && isCode(fp)) return toPosix(fp);
  }
  // try index.* in folder
  if (fs.existsSync(base) && fs.statSync(base).isDirectory()) {
    for (const idx of INDEX_CANDIDATES) {
      const fp = path.join(base, idx);
      if (fs.existsSync(fp) && isCode(fp)) return toPosix(fp);
    }
  }
  return null;
}

// Extract import specs from code (import, require, dynamic import)
const IMPORT_REGEXES = [
  /import\s+[^'"\n]+from\s+['"]([^'"]+)['"]/g,
  /import\(\s*['"]([^'"]+)['"]\s*\)/g,
  /require\(\s*['"]([^'"]+)['"]\s*\)/g,
];

const inbound = new Map();
const outbounds = new Map();

for (const f of codeFiles) {
  const text = readText(f);
  const specs = new Set();
  for (const re of IMPORT_REGEXES) {
    for (const m of text.matchAll(re)) {
      specs.add(m[1]);
    }
  }
  const absF = toPosix(f);
  const outs = [];
  specs.forEach(spec => {
    const target = resolveImport(f, spec);
    if (target) {
      outs.push(target);
      inbound.set(target, (inbound.get(target) || 0) + 1);
    }
  });
  outbounds.set(absF, outs);
}

// Candidates: files with zero inbound refs and not entries
const excluded = new Set([
  ...ENTRY_FILES,
]);

function isExcluded(p) {
  if (excluded.has(toPosix(p))) return true;
  if (p.includes('/__tests__/')) return true;
  if (/\.(test|spec)\.(t|j)sx?$/.test(p)) return true;
  // Skip barrel files
  if (p.endsWith('/index.ts') || p.endsWith('/index.tsx') || p.endsWith('/index.js') || p.endsWith('/index.jsx')) return true;
  return false;
}

const orphanModules = [];
for (const f of codeFiles) {
  const pf = toPosix(f);
  if (isExcluded(pf)) continue;
  const inCount = inbound.get(pf) || 0;
  if (inCount === 0 && !ENTRY_FILES.includes(pf)) {
    orphanModules.push({ file: pf, inbound: inCount });
  }
}

// Asset orphans: look for basenames not mentioned in code/css
const ASSET_DIRS = ['src/assets', 'public'];
const assetFiles = ASSET_DIRS.flatMap(d => walk(path.join(ROOT, d), () => true));
const codeAndCss = walk(SRC, p => /\.(t|j)sx?$|\.css$|\.scss$/.test(p)).map(readText).join('\n');
const orphanAssets = assetFiles.filter(a => !codeAndCss.includes(path.basename(a)));

fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(path.join(REPORT_DIR, 'orphan-modules.json'), JSON.stringify({ orphanModules, inboundCounted: inbound.size }, null, 2));
fs.writeFileSync(path.join(REPORT_DIR, 'orphan-assets.json'), JSON.stringify({ orphanAssets }, null, 2));

console.log('Wrote:',
  path.relative(ROOT, path.join(REPORT_DIR, 'orphan-modules.json')),
  'and',
  path.relative(ROOT, path.join(REPORT_DIR, 'orphan-assets.json'))
);

