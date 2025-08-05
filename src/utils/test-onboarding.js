// Test script to force ALF onboarding to show
// Run this in browser console to test onboarding

// Clear the completion flag
localStorage.removeItem('alfOnboardingCompleted');

// Set force flag to ensure it shows
localStorage.setItem('alfForceOnboarding', 'true');

// Refresh the page
window.location.reload();

console.log('Onboarding settings cleared. Page will reload to show onboarding.');