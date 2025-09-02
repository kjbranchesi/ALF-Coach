#!/usr/bin/env node
// Fails if any non-archived file imports from src/_archived/**
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');
const EXCLUDE_DIRS = new Set(['node_modules', 'dist', 'build', '.netlify', 'playwright-report', 'test-results']);

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (full.includes(`${path.sep}_archived${path.sep}`)) continue;
      yield* walk(full);
    } else if (/\.(j|t)sx?$/.test(entry.name)) {
      if (full.includes(`${path.sep}_archived${path.sep}`)) continue;
      yield full;
    }
  }
}

const offenders = [];
for (const file of walk(SRC)) {
  const text = fs.readFileSync(file, 'utf8');
  if (/from\s+['"][.\/\w-]*_archived\//.test(text) || /import\([^)]*_archived\//.test(text)) {
    offenders.push(path.relative(ROOT, file));
  }
}

if (offenders.length) {
  console.error('Blocked: imports from src/_archived detected in:');
  offenders.forEach(f => console.error(' -', f));
  process.exit(1);
}

console.log('No imports from src/_archived detected.');

