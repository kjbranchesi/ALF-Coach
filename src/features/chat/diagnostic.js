// Emergency diagnostic script to identify La constructor error
console.group('🚨 CHAT SYSTEM DIAGNOSTIC');

// Check for common problematic imports
try {
  console.log('Testing EventEmitter...');
  const { EventEmitter } = require('../../utils/event-emitter');
  new EventEmitter();
  console.log('✅ EventEmitter OK');
} catch (e) {
  console.error('❌ EventEmitter Error:', e);
}

try {
  console.log('Testing ButtonStateManager...');
  const ButtonStateManager = require('../../services/button-state-manager').default;
  ButtonStateManager.getInstance();
  console.log('✅ ButtonStateManager OK');
} catch (e) {
  console.error('❌ ButtonStateManager Error:', e);
}

try {
  console.log('Testing ChatEventHandler...');
  const ChatEventHandler = require('../../services/chat-event-handler').default;
  ChatEventHandler.getInstance();
  console.log('✅ ChatEventHandler OK');
} catch (e) {
  console.error('❌ ChatEventHandler Error:', e);
}

// Check for La references
console.log('\nSearching for "La" references in loaded modules...');
Object.keys(require.cache).forEach(modulePath => {
  try {
    const moduleExports = require.cache[modulePath].exports;
    const moduleString = JSON.stringify(moduleExports);
    if (moduleString && moduleString.includes('La')) {
      console.warn('Found "La" in module:', modulePath);
    }
  } catch (e) {
    // Ignore circular reference errors
  }
});

console.groupEnd();

export function runDiagnostics() {
  console.log('🚨 Running chat diagnostics...');
}