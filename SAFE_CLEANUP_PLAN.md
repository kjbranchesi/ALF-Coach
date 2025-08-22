# Safe Cleanup Plan - Remove Only Unused Code

## Current Performance Issues
- **Score: 40/100** 
- **FCP: 4.6s** (should be <1.5s)
- **TTI: 7.6s** (should be <3s)
- **TBT: 1,670ms** (should be <300ms)

## Safe Items to Remove (Won't Break Anything)

### 1. Test/Debug HTML Files (18 files, ~200KB)
These are just test files, not used in production:
```bash
rm test-*.html
rm debug-*.html
rm fix-browser-cache.html
rm COMPLETE_IMPLEMENTATION_TEST.html
rm STEAM_ONBOARDING_TEST.html
```

### 2. Archive Folders (2.4MB total)
Old code that's already been replaced:
- `/archive/` folder (2.0MB) - old documentation
- `/src/_archived/` folder (364KB) - old components

### 3. Unused Component Imports
Remove from `ChatLoader.tsx`:
- Line 7: `import { ChatbotFirstInterfaceImproved }` - not used
- Line 8: Keep ChatbotFirstInterfaceFixed (it's used)

### 4. Disabled Files
- `src/App.tsx.disabled` - not used
- `src/components/NewArchitectureTest.tsx.disabled` - not used

### 5. Duplicate Chat Components (Safe to Remove)
These are NOT imported anywhere active:
- `ChatbotFirstInterfaceImproved.tsx` - unused duplicate
- `ChatbotFirstInterfaceV2.tsx` - unused duplicate
- `ChatInterface.tsx` - only imported in disabled files
- `StageSpecificSuggestions.tsx` - replaced by inline suggestions
- `EnhancedSuggestionCards.tsx` - duplicate of SuggestionCards
- `ImprovedSuggestionCards.tsx` - another duplicate

### 6. Duplicate Stage Components
Keep only the Enhanced versions (remove base versions):
- Remove: `ActivityBuilder.tsx` (keep ActivityBuilderEnhanced)
- Remove: `ImpactDesigner.tsx` (keep ImpactDesignerEnhanced)
- Remove: `LearningJourneyBuilder.tsx` (keep LearningJourneyBuilderEnhanced)
- Remove: `RubricBuilder.tsx` (keep RubricBuilderEnhanced)

### 7. Legacy Chat Components in `/archive/legacy-chat/`
All these are old versions:
- ChatV2.tsx, ChatV3.tsx, ChatV4.tsx, ChatV5.tsx
- ChatV5-backup.tsx, ChatV5-emergency.tsx, etc.

### 8. Unused Services
Check if these are imported anywhere:
```bash
# Check each service
grep -r "import.*ServiceName" src/
```

## Performance Optimizations (Without Breaking)

### 1. Lazy Load Heavy Libraries
Already done for Firebase, but can extend to:
- Lottie animations (only load when needed)
- PDF generation (only load on export)
- Markdown processors

### 2. Remove Unused Dependencies
Check package.json for unused packages:
```bash
npx depcheck
```

### 3. Optimize Images
- Convert any PNGs to WebP
- Add lazy loading to images

## Safe Cleanup Commands

```bash
# 1. Remove test files
rm test-*.html debug-*.html fix-browser-cache.html COMPLETE_IMPLEMENTATION_TEST.html STEAM_ONBOARDING_TEST.html

# 2. Remove archive folders (after backing up if needed)
tar -czf archive-backup.tar.gz archive/ src/_archived/
rm -rf archive/
rm -rf src/_archived/

# 3. Remove disabled files
rm src/App.tsx.disabled
rm src/components/NewArchitectureTest.tsx.disabled

# 4. Remove unused chat components
rm src/components/chat/ChatbotFirstInterfaceImproved.tsx
rm src/components/chat/ChatbotFirstInterfaceV2.tsx
rm src/components/chat/ChatInterface.tsx
rm src/components/chat/StageSpecificSuggestions.tsx
rm src/components/chat/EnhancedSuggestionCards.tsx
rm src/components/chat/ImprovedSuggestionCards.tsx

# 5. Remove duplicate stage components
rm src/components/chat/stages/ActivityBuilder.tsx
rm src/components/chat/stages/ImpactDesigner.tsx
rm src/components/chat/stages/LearningJourneyBuilder.tsx
rm src/components/chat/stages/RubricBuilder.tsx

# 6. Clean unused imports
# Fix ChatLoader.tsx to remove unused import

# 7. Rebuild
npm run build
```

## Expected Results
- **Reduce repository size by ~3MB**
- **Cleaner codebase** with no duplicates
- **Faster builds** with less files to process
- **No functionality broken** - only removing unused code

## DO NOT REMOVE
- ChatbotFirstInterfaceFixed.tsx - MAIN COMPONENT
- Any component actually imported and used
- Firebase services (they're used)
- Gemini services (they're used)
- Current routing and authentication

## Next Steps After Cleanup
1. Run `npm run build` to verify nothing breaks
2. Test the app locally
3. Check bundle size reduction
4. Deploy to Netlify
5. Re-run Lighthouse test

This approach removes ~3MB of truly unused code without touching any active functionality.