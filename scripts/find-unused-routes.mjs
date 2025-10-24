#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT = path.join(ROOT, 'reports', 'deadcode', 'route-candidates.json');
const ROUTERS = [
  'src/App.tsx',
  'src/AuthenticatedApp.tsx',
].map(p => path.join(ROOT, p)).filter(fs.existsSync);

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const srcFiles = walk(path.join(ROOT, 'src')).filter(f => /\.(t|j)sx?$/.test(f));
const routerText = ROUTERS.map(f => fs.readFileSync(f, 'utf8')).join('\n');

// Extract imported module specs from router shells
const importSpecs = [...routerText.matchAll(/from\s+['"]([^'"]+)['"]/g)].map(m => m[1]);

// Resolve to absolute prefix paths (crude)
const referenced = new Set();
for (const spec of importSpecs) {
  if (spec.startsWith('.')) {
    for (const base of ROUTERS) {
      const abs = path.resolve(path.dirname(base), spec);
      referenced.add(abs);
    }
  }
}

const candidates = [];
for (const f of srcFiles) {
  // skip test files and domain/utility files
  if (/__tests__|\.test\.|\.spec\./.test(f)) continue;
  const abs = f;
  // keep files under referenced prefixes
  const isReferenced = [...referenced].some(r => abs.startsWith(r));
  if (!isReferenced && /components|pages|features/.test(abs)) {
    candidates.push(path.relative(ROOT, abs));
  }
}

fs.mkdirSync(path.dirname(REPORT), { recursive: true });
fs.writeFileSync(REPORT, JSON.stringify({ candidates, routerFiles: ROUTERS.map(r => path.relative(ROOT, r)) }, null, 2));
console.log('route-candidates.json written');

