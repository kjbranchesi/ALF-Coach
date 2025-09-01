#!/usr/bin/env node
// Simple static check for lazy-loaded component mismatches.
// Flags cases where a file defines `const XLazy = lazy(() => import('./X'...))`
// but then uses `<X ...>` in JSX within the same file.

import fs from 'fs';
import path from 'path';

const root = path.join(process.cwd(), 'src');
let issues = [];

/** Recursively list files */
function listFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) listFiles(full);
    else if (/\.(tsx?|jsx?)$/.test(e.name)) files.push(full);
  }
}

const files = [];
listFiles(root);

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  // Find lazy declarations: const NameLazy = lazy(() => import(...).then(m => ({ default: m.Name })))
  const lazyRegex = /const\s+(\w+)Lazy\s*=\s*lazy\s*\(/g;
  let match;
  while ((match = lazyRegex.exec(text))) {
    const lazyVar = match[1];
    // Heuristic: infer base component name from var by removing trailing 'Lazy'
    const base = lazyVar.replace(/Lazy$/, '');

    // Skip if same name appears in import or variable declarations (to avoid false positives)
    const importRegex = new RegExp(`import\\s+.*\\b${base}\\b`);
    if (importRegex.test(text)) continue;

    // Look for JSX usage of <Base ...> or </Base>
    const jsxOpen = new RegExp(`<${base}(\n|\s|>)`);
    const jsxClose = new RegExp(`</${base}>`);
    if (jsxOpen.test(text) || jsxClose.test(text)) {
      issues.push({ file, message: `Lazy component mismatch: defined ${lazyVar} but JSX uses <${base}>` });
    }
  }
}

if (issues.length) {
  console.error('\nLazy usage issues found:');
  for (const i of issues) {
    console.error(`- ${i.file}: ${i.message}`);
  }
  process.exit(1);
} else {
  console.log('No lazy usage mismatches detected.');
}

