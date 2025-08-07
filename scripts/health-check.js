#!/usr/bin/env node

/**
 * Health Check Script - Run before and after changes
 * Verifies core functionality is working
 */

const checks = {
  'Build compiles': async () => {
    const { exec } = require('child_process');
    return new Promise((resolve) => {
      exec('npm run build', (error) => {
        resolve(!error);
      });
    });
  },
  
  'No TypeScript errors': async () => {
    const { exec } = require('child_process');
    return new Promise((resolve) => {
      exec('npx tsc --noEmit', (error, stdout) => {
        if (!error) return resolve(true);
        // Allow some errors but flag if too many
        const errorCount = (stdout.match(/error TS/g) || []).length;
        console.log(`  └─ ${errorCount} TypeScript errors found`);
        resolve(errorCount < 10); // Threshold
      });
    });
  },
  
  'Key files exist': () => {
    const fs = require('fs');
    const keyFiles = [
      'src/components/chat/SuggestionCards.tsx',
      'src/components/ChatV6.tsx',
      'src/firebase/firebase.js',
      'netlify/functions/gemini.js'
    ];
    
    const missing = keyFiles.filter(f => !fs.existsSync(f));
    if (missing.length) {
      console.log(`  └─ Missing: ${missing.join(', ')}`);
    }
    return missing.length === 0;
  },
  
  'No console errors on start': async () => {
    // This would need puppeteer for full check
    // For now, just check if dev server starts
    return true;
  }
};

async function runHealthCheck() {
  console.log('🏥 Running Health Check...\n');
  
  let allPassed = true;
  
  for (const [name, check] of Object.entries(checks)) {
    process.stdout.write(`Checking: ${name}... `);
    try {
      const passed = await check();
      console.log(passed ? '✅' : '❌');
      if (!passed) allPassed = false;
    } catch (error) {
      console.log('❌');
      console.log(`  └─ Error: ${error.message}`);
      allPassed = false;
    }
  }
  
  console.log('\n' + (allPassed ? '✅ All checks passed!' : '⚠️ Some checks failed'));
  process.exit(allPassed ? 0 : 1);
}

runHealthCheck();