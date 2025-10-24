#!/usr/bin/env node
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function tryExec(cmd) {
  try { return execSync(cmd, { stdio: ['ignore','pipe','pipe'] }).toString(); }
  catch { return ''; }
}

// Attempt to list deployed functions (requires firebase CLI and auth)
const deployedJson = tryExec('firebase functions:list --json');
let deployed = [];
try {
  const j = JSON.parse(deployedJson);
  deployed = (j.result || []).map(f => f.id);
} catch {}

// Scan local code for exports in netlify/functions or functions/src
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

const localFiles = [
  ...walk(path.join(process.cwd(), 'functions/src')),
  ...walk(path.join(process.cwd(), 'netlify/functions')),
].filter(Boolean);

const code = localFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');
// Match Firebase v2 style or generic named exports
const localNames = new Set([
  ...[...code.matchAll(/\.https\.(onCall|onRequest)\(['"](.+?)['"]\)/g)].map(m => m[2]),
  ...[...code.matchAll(/export\s+const\s+(\w+)\s*=\s*/g)].map(m => m[1])
]);

const diff = {
  codedNotDeployed: [...localNames].filter(n => !deployed.includes(n)),
  deployedNotInCode: deployed.filter(n => !localNames.has(n))
};

const report = path.join(process.cwd(), 'reports', 'deadcode', 'firebase-functions-diff.json');
fs.mkdirSync(path.dirname(report), { recursive: true });
fs.writeFileSync(report, JSON.stringify(diff, null, 2));
console.log('firebase-functions-diff.json written');

