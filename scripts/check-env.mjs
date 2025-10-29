#!/usr/bin/env node
/**
 * Build-time Environment Validation
 *
 * Enforces that AI is properly configured before builds.
 * This ensures production deployments have valid AI configuration.
 *
 * Run: npm run check-env (automatically runs in prebuild)
 */

import { readFileSync, writeFileSync, appendFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from project root if it exists
try {
  const envPath = resolve(__dirname, '../.env');
  const envContent = readFileSync(envPath, 'utf-8');

  // Parse .env file and set environment variables if not already set
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').trim();

    if (key && value && !process.env[key]) {
      process.env[key] = value;
    }
  });
} catch (error) {
  // .env file doesn't exist or can't be read - that's okay, use process.env
}

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + colors.bright + colors.cyan + '━'.repeat(60) + colors.reset);
  console.log(colors.bright + colors.cyan + title + colors.reset);
  console.log(colors.bright + colors.cyan + '━'.repeat(60) + colors.reset + '\n');
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

// Attempt fallback mapping: if GEMINI_API_KEY is set but VITE_GEMINI_API_KEY is not,
// map it for this build and persist to a local .env for the subsequent vite process.
try {
  if (!process.env.VITE_GEMINI_API_KEY && process.env.GEMINI_API_KEY) {
    logWarning('Detected GEMINI_API_KEY. Mapping to VITE_GEMINI_API_KEY for this build.');
    const key = process.env.GEMINI_API_KEY;
    process.env.VITE_GEMINI_API_KEY = key;
    // Persist to .env so the next npm script (vite build) sees it
    const envPath = resolve(__dirname, '../.env');
    let existing = '';
    try { existing = readFileSync(envPath, 'utf-8'); } catch {}
    if (!existing.includes('VITE_GEMINI_API_KEY')) {
      appendFileSync(envPath, `\nVITE_GEMINI_API_KEY=${key}\n`);
    }
  }
} catch {}

// Get environment variables (prefer process.env, after fallback mapping)
const geminiEnabled = process.env.VITE_GEMINI_ENABLED === 'true';
const hasApiKey = !!process.env.VITE_GEMINI_API_KEY;
const featureEnabled = process.env.VITE_FEATURE_STAGE_ASSISTANT === 'true';
const isProduction = process.env.NODE_ENV === 'production';

logSection('🤖 AI Configuration Check');

// Show current configuration
log('Configuration Status:', colors.bright);
log(`  NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
log(`  VITE_FEATURE_STAGE_ASSISTANT: ${featureEnabled ? 'true' : 'false'}`);
log(`  VITE_GEMINI_ENABLED: ${geminiEnabled ? 'true' : 'false'}`);
log(`  VITE_GEMINI_API_KEY: ${hasApiKey ? '✓ Set' : '✗ Not set'}\n`);

// Validation logic
let hasError = false;

// Check 1: If Gemini is enabled, API key must be present
if (geminiEnabled && !hasApiKey) {
  hasError = true;
  logError('VITE_GEMINI_ENABLED is true but VITE_GEMINI_API_KEY is not set!');
  console.log('\n' + colors.yellow + 'This is a critical configuration error.' + colors.reset);
  console.log(colors.yellow + 'The app requires AI to function properly.' + colors.reset + '\n');

  if (isProduction) {
    console.log(colors.bright + 'Production Build Fix:' + colors.reset);
    console.log('  1. Set VITE_GEMINI_API_KEY in your hosting platform (Netlify, Vercel, etc.)');
    console.log('  2. Get an API key from: https://ai.google.dev/gemini-api/docs/api-key');
    console.log('  3. Redeploy your application\n');
  } else {
    console.log(colors.bright + 'Development Fix:' + colors.reset);
    console.log('  1. Create or update your .env file in the project root');
    console.log('  2. Add: VITE_GEMINI_API_KEY=your_api_key_here');
    console.log('  3. Get an API key from: https://ai.google.dev/gemini-api/docs/api-key');
    console.log('  4. Restart your development server\n');
  }
}

// Check 2: Warn if feature is enabled but Gemini is disabled
if (featureEnabled && !geminiEnabled) {
  logWarning('VITE_FEATURE_STAGE_ASSISTANT is true but VITE_GEMINI_ENABLED is false');
  console.log(colors.yellow + '  AI features will be disabled. Set VITE_GEMINI_ENABLED=true to enable AI.\n' + colors.reset);
}

// Check 3: Info if everything is disabled
if (!featureEnabled && !geminiEnabled) {
  logWarning('AI features are completely disabled');
  console.log(colors.yellow + '  The app will show blocking gates. This is expected if AI is intentionally disabled.\n' + colors.reset);
}

// Success case
if (geminiEnabled && hasApiKey) {
  logSuccess('AI configuration is valid!');
  console.log(colors.green + '  All required environment variables are set correctly.\n' + colors.reset);
}

// Exit with error if critical issues found
if (hasError) {
  logSection('❌ Build Failed - Fix Configuration Errors Above');
  process.exit(1);
} else {
  logSection('✅ Environment Check Passed');
  process.exit(0);
}
