#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ASSET_DIRS = ['src/assets', 'public'];
const CODE_EXT = ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss'];

function walk(dir, pred) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p, pred));
    else if (!pred || pred(p)) out.push(p);
  }
  return out;
}

const assets = ASSET_DIRS.flatMap(d => walk(path.join(ROOT, d)));
const codeFiles = walk(path.join(ROOT, 'src'), p => CODE_EXT.includes(path.extname(p)));
const code = codeFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');

const orphans = assets.filter(a => !code.includes(path.basename(a)));
const report = path.join(ROOT, 'reports', 'deadcode', 'assets-orphans.json');
fs.mkdirSync(path.dirname(report), { recursive: true });
fs.writeFileSync(report, JSON.stringify({ orphans: orphans.map(f => path.relative(ROOT, f)) }, null, 2));
console.log('assets-orphans.json written');

