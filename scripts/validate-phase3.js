#!/usr/bin/env node

/**
 * Comprehensive validation script for Phase 3 changes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Phase 3 Validation Script\n');

// 1. Check all service files exist
console.log('1️⃣ Checking service files...');
const servicesDir = path.join(__dirname, '../src/services');
const coreDir = path.join(servicesDir, 'core');
const futureDir = path.join(servicesDir, 'future');

let fileCount = 0;
let errorCount = 0;

function checkDirectory(dir, label) {
  if (!fs.existsSync(dir)) {
    console.error(`❌ Directory missing: ${label}`);
    errorCount++;
    return;
  }
  
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));
  console.log(`✅ ${label}: ${files.length} TypeScript files`);
  fileCount += files.length;
  
  // Check each file can be read
  files.forEach(file => {
    try {
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      // Basic syntax check - ensure it has export
      if (!content.includes('export')) {
        console.warn(`⚠️  ${file} may not export anything`);
      }
    } catch (err) {
      console.error(`❌ Cannot read ${file}: ${err.message}`);
      errorCount++;
    }
  });
}

checkDirectory(servicesDir, 'Main services');
checkDirectory(coreDir, 'Core services');
checkDirectory(futureDir, 'Future services');

// 2. Check critical files that were modified
console.log('\n2️⃣ Checking critical modified files...');
const criticalFiles = [
  'src/ai/promptTemplates/conversationalJourney.js',
  'src/core/SOPFlowManager.ts'
];

criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for obvious syntax errors
    const backtickCount = (content.match(/`/g) || []).length;
    if (backtickCount % 2 !== 0) {
      console.error(`❌ ${file}: Unmatched backticks detected`);
      errorCount++;
    } else {
      console.log(`✅ ${file}: Syntax looks OK`);
    }
  } else {
    console.error(`❌ ${file}: File not found`);
    errorCount++;
  }
});

// 3. Check for circular dependencies
console.log('\n3️⃣ Checking for obvious circular dependencies...');
const serviceFiles = [
  ...fs.readdirSync(servicesDir).filter(f => f.endsWith('.ts')).map(f => path.join(servicesDir, f)),
  ...fs.readdirSync(coreDir).filter(f => f.endsWith('.ts')).map(f => path.join(coreDir, f)),
  ...fs.readdirSync(futureDir).filter(f => f.endsWith('.ts')).map(f => path.join(futureDir, f))
];

const importMap = new Map();

serviceFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const imports = content.match(/from ['"]\.\/([^'"]+)['"]/g) || [];
  importMap.set(file, imports);
});

// Simple circular check (not exhaustive)
let circularFound = false;
importMap.forEach((imports, file) => {
  imports.forEach(imp => {
    const importedFile = imp.match(/from ['"]\.\/([^'"]+)['"]/)[1];
    const resolvedPath = path.join(path.dirname(file), `${importedFile  }.ts`);
    
    if (importMap.has(resolvedPath)) {
      const reverseImports = importMap.get(resolvedPath);
      if (reverseImports.some(ri => ri.includes(path.basename(file, '.ts')))) {
        console.error(`❌ Potential circular dependency: ${path.basename(file)} <-> ${importedFile}`);
        circularFound = true;
        errorCount++;
      }
    }
  });
});

if (!circularFound) {
  console.log('✅ No obvious circular dependencies detected');
}

// 4. Check imports from services
console.log('\n4️⃣ Checking service usage in components...');
const componentsDir = path.join(__dirname, '../src/components');
const componentFiles = fs.readdirSync(componentsDir)
  .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'))
  .map(f => path.join(componentsDir, f));

let serviceImportCount = 0;
componentFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('from "../services/') || content.includes('from "@/services/')) {
    serviceImportCount++;
    console.log(`📦 ${path.basename(file)} imports from services`);
  }
});

console.log(`\n📊 Summary:`);
console.log(`- Total service files: ${fileCount}`);
console.log(`- Components using services: ${serviceImportCount}`);
console.log(`- Errors found: ${errorCount}`);

// 5. Memory check
console.log('\n5️⃣ Checking file sizes...');
let totalSize = 0;
const largeFiles = [];

serviceFiles.forEach(file => {
  const stats = fs.statSync(file);
  totalSize += stats.size;
  
  if (stats.size > 50000) { // 50KB
    largeFiles.push({
      name: path.basename(file),
      size: `${(stats.size / 1024).toFixed(1)  }KB`
    });
  }
});

console.log(`Total service code size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
if (largeFiles.length > 0) {
  console.log('Large files detected:');
  largeFiles.forEach(f => console.log(`  ⚠️  ${f.name}: ${f.size}`));
}

// Final verdict
console.log(`\n${  '='.repeat(50)}`);
if (errorCount === 0) {
  console.log('✅ Phase 3 validation PASSED!');
  console.log('🎉 All services appear to be correctly structured');
} else {
  console.log(`❌ Phase 3 validation FAILED with ${errorCount} errors`);
  console.log('⚠️  Please fix the errors before committing');
}

process.exit(errorCount > 0 ? 1 : 0);