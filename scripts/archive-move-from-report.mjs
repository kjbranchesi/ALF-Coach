#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CSV = path.join(ROOT, 'reports', 'deadcode', 'archive-candidates.csv');
const ARCHIVE_ROOT = path.join(ROOT, 'archive');

function readCSV(p) {
  const text = fs.readFileSync(p, 'utf8');
  const lines = text.split(/\r?\n/).filter(Boolean);
  const header = lines.shift();
  if (!header) return [];
  const cols = header.split(',');
  const rows = lines.map(l => {
    const parts = l.split(',');
    const obj = {};
    cols.forEach((c, i) => { obj[c] = parts[i]; });
    return obj;
  });
  return rows;
}

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

function usage() {
  console.log('Usage: node scripts/archive-move-from-report.mjs --percent 50');
}

const args = process.argv.slice(2);
let percent = 50;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--percent' && args[i+1]) {
    percent = Math.max(1, Math.min(100, parseInt(args[i+1], 10) || 50));
  }
}

if (!fs.existsSync(CSV)) {
  console.error('Missing archive-candidates.csv. Run npm run analyze:all first.');
  process.exit(1);
}

const rows = readCSV(CSV);
if (!rows.length) {
  console.error('No rows in archive-candidates.csv');
  process.exit(1);
}

const total = rows.length;
const count = Math.floor((percent / 100) * total);
const selected = rows.slice(0, count);

const moved = [];
for (const r of selected) {
  const rel = r.file;
  const src = path.join(ROOT, rel);
  if (!fs.existsSync(src)) continue; // may already be archived
  const dst = path.join(ARCHIVE_ROOT, rel);
  ensureDir(path.dirname(dst));
  try {
    fs.renameSync(src, dst);
    moved.push({ from: rel, to: path.join('archive', rel) });
  } catch (e) {
    console.warn('Skip (failed to move):', rel, e.message);
  }
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
ensureDir(ARCHIVE_ROOT);
const manifest = path.join(ARCHIVE_ROOT, `archive-manifest-${stamp}.json`);
fs.writeFileSync(manifest, JSON.stringify({ percent, total, movedCount: moved.length, moved }, null, 2));
console.log(`Moved ${moved.length}/${count} files to archive. Manifest: ${path.relative(ROOT, manifest)}`);

