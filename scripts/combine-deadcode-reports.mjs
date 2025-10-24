#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const R = p => JSON.parse(fs.readFileSync(p,'utf8'));
const safeRead = (p, fb) => { try { return R(p); } catch { return fb; } };

const dir = path.join(ROOT, 'reports', 'deadcode');
fs.mkdirSync(dir, { recursive: true });

const knip = safeRead(path.join(dir, 'knip.json'), { unusedFiles:[], unusedExports:[] });
const tsprune = safeRead(path.join(dir, 'tsprune.json'), []);
const madge = safeRead(path.join(dir, 'madge.json'), {});
const depcheck = safeRead(path.join(dir, 'depcheck.json'), { dependencies:{}, devDependencies:{} });
const routes = safeRead(path.join(dir, 'route-candidates.json'), { candidates:[] });
const assets = safeRead(path.join(dir, 'assets-orphans.json'), { orphans:[] });
const functionsDiff = safeRead(path.join(dir, 'firebase-functions-diff.json'), { codedNotDeployed:[], deployedNotInCode:[] });

// inbound edges from madge
const inbound = {};
Object.entries(madge).forEach(([file, deps]) => {
  deps.forEach(d => { inbound[d] = (inbound[d] || 0) + 1; });
});

const fileSet = new Set([
  ...(knip.unusedFiles || []),
  ...(routes.candidates || []),
  ...(assets.orphans || []),
]);
// add tsprune files
tsprune.forEach(e => { if (e && e.file) fileSet.add(e.file); });

const rows = [];
for (const f of fileSet) {
  const pf = String(f);
  const inKnip = (knip.unusedFiles || []).includes(pf);
  const inRoutes = (routes.candidates || []).includes(pf);
  const inAssets = (assets.orphans || []).includes(pf);
  const inboundCount = inbound[pf] || 0;
  let score = 0;
  if (inKnip) score += 3;
  if (inRoutes) score += 2;
  if (inAssets) score += 2;
  if (inboundCount === 0) score += 3;
  rows.push({ file: pf, inboundCount, inKnip, inRoutes, inAssets, score });
}

rows.sort((a,b) => b.score - a.score || a.inboundCount - b.inboundCount);

const csv = ['file,inboundCount,inKnip,inRoutes,inAssets,score']
  .concat(rows.map(r => `${r.file},${r.inboundCount},${r.inKnip},${r.inRoutes},${r.inAssets},${r.score}`))
  .join('\n');
fs.writeFileSync(path.join(dir, 'archive-candidates.csv'), csv);

const unusedDeps = Object.keys(depcheck.dependencies || {});
const unusedDevDeps = Object.keys(depcheck.devDependencies || {});
fs.writeFileSync(path.join(dir, 'unused-deps.json'), JSON.stringify({ unusedDeps, unusedDevDeps }, null, 2));

console.log('archive-candidates.csv and unused-deps.json written');

