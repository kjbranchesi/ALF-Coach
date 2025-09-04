#!/usr/bin/env node
/*
  Quick unreferenced file scan (non-binding)
  - Scans src (excluding _archived) for .js/.jsx/.ts/.tsx files
  - Checks if any other file imports them (static or dynamic)
  - Writes CSV to docs/unreferenced-files.scan.csv

  Note: heuristic only; dynamic runtime usage may not be captured.
*/
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const ROOT = path.resolve(process.cwd());
const SRC = path.join(ROOT, 'src');

const EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx']);
const EXCLUDE_DIRS = new Set(['_archived', '_archive_old_system']);

/** Recursively list source files */
function listFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listFiles(full));
    } else {
      const ext = path.extname(entry.name);
      if (EXTENSIONS.has(ext)) out.push(full);
    }
  }
  return out;
}

function rel(p) { return path.relative(SRC, p).replaceAll('\\', '/'); }

/** Build an import search pattern for a given file */
function importPatternsFor(relFile) {
  const noExt = relFile.replace(/\.(jsx?|tsx?)$/, '');
  const base = './' + noExt; // typical relative import
  // Also try without leading './' and with aliases removed
  const variants = new Set([
    base,
    base.replace(/^\.\//, ''),
    noExt, // sometimes used as bare relative
  ]);
  return Array.from(variants);
}

function rgSearch(pattern) {
  const args = ['-n', '--fixed-strings', '--', pattern, 'src'];
  const res = spawnSync('rg', args, { encoding: 'utf8' });
  if (res.error) return '';
  return res.stdout || '';
}

const allFiles = listFiles(SRC);
const results = [];

for (const file of allFiles) {
  const relFile = rel(file);
  // Skip obvious entrypoints and routes; and type-only modules
  if (/^main\.(t|j)sx?$/.test(path.basename(relFile))) continue;
  if (/^AppRouter\.(t|j)sx?$/.test(path.basename(relFile))) continue;
  if (/^AuthenticatedApp\.(t|j)sx?$/.test(path.basename(relFile))) continue;

  const patterns = importPatternsFor(relFile);
  let imported = false;
  for (const p of patterns) {
    const out = rgSearch(`from '${p}'`)
      + rgSearch(`from \"${p}\"`)
      + rgSearch(`import\(\'${p}\'\)`) 
      + rgSearch(`import\(\"${p}\"\)`);
    // Consider a match imported if any line references another file (exclude self)
    if (out.trim().length > 0) {
      const lines = out.split('\n').filter(Boolean);
      const nonSelf = lines.filter(l => !l.includes(relFile));
      if (nonSelf.length > 0) { imported = true; break; }
    }
  }
  if (!imported) {
    results.push(relFile);
  }
}

const outPath = path.join(ROOT, 'docs', 'unreferenced-files.scan.csv');
fs.writeFileSync(outPath, ['path', ...results].join('\n'));
console.log(`Wrote ${results.length} unreferenced candidates to ${path.relative(ROOT, outPath)}`);

