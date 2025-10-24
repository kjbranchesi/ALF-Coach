#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ARCHIVE_ROOT = path.join(ROOT, 'archive');

function latestManifest() {
  if (!fs.existsSync(ARCHIVE_ROOT)) return null;
  const files = fs.readdirSync(ARCHIVE_ROOT).filter(f => f.startsWith('archive-manifest-') && f.endsWith('.json'));
  if (!files.length) return null;
  files.sort();
  return path.join(ARCHIVE_ROOT, files[files.length - 1]);
}

const manifestPath = latestManifest();
if (!manifestPath) {
  console.error('No archive manifest found');
  process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
let restored = 0;
for (const m of manifest.moved || []) {
  const src = path.join(ROOT, 'archive', m.from); // file under archive
  const dst = path.join(ROOT, m.from);
  if (!fs.existsSync(src)) continue;
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  try {
    fs.renameSync(src, dst);
    restored++;
  } catch (e) {
    console.warn('Failed to restore', m.from, e.message);
  }
}
console.log(`Restored ${restored} files from ${path.relative(ROOT, manifestPath)}`);

