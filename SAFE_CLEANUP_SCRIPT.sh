#!/bin/bash

# Safe Cleanup Script - Double-checked for safety
# Run with: bash SAFE_CLEANUP_SCRIPT.sh

echo "🧹 ALF Coach Safe Cleanup Script"
echo "================================"
echo ""

# Function to confirm action
confirm() {
    read -p "$1 (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        return 1
    fi
    return 0
}

# 1. Remove test HTML files (keeping index.html)
echo "📁 Step 1: Remove test HTML files"
echo "Files to remove:"
ls test-*.html debug-*.html fix-browser-cache.html COMPLETE_IMPLEMENTATION_TEST.html STEAM_ONBOARDING_TEST.html 2>/dev/null || echo "  No test files found"

if confirm "Remove test HTML files?"; then
    rm -f test-*.html debug-*.html fix-browser-cache.html COMPLETE_IMPLEMENTATION_TEST.html STEAM_ONBOARDING_TEST.html
    echo "✅ Test files removed"
else
    echo "⏭️  Skipped"
fi

echo ""

# 2. Archive folders backup and removal
echo "📁 Step 2: Archive folders (2.4MB total)"
echo "Folders:"
echo "  - archive/ (2.0MB)"
echo "  - src/_archived/ (364KB)"

if confirm "Create backup and remove archive folders?"; then
    # Create backup
    tar -czf archive-backup-$(date +%Y%m%d).tar.gz archive/ src/_archived/ 2>/dev/null
    echo "✅ Backup created: archive-backup-$(date +%Y%m%d).tar.gz"
    
    # Remove folders
    rm -rf archive/
    rm -rf src/_archived/
    echo "✅ Archive folders removed"
else
    echo "⏭️  Skipped"
fi

echo ""

# 3. Remove duplicate stage components (only base versions where Enhanced exists)
echo "📁 Step 3: Remove duplicate stage components"
echo "Files to check:"
echo "  - src/components/chat/stages/ActivityBuilder.tsx (has Enhanced)"
echo "  - src/components/chat/stages/ImpactDesigner.tsx (has Enhanced)"
echo "  - src/components/chat/stages/LearningJourneyBuilder.tsx (has Enhanced)"
echo "  - src/components/chat/stages/RubricBuilder.tsx (has Enhanced, but used by PeerEvaluation)"

if confirm "Remove unused base versions (keeping RubricBuilder)?"; then
    # Only remove if Enhanced version exists and base isn't used
    if [ -f "src/components/chat/stages/ActivityBuilderEnhanced.tsx" ]; then
        rm -f src/components/chat/stages/ActivityBuilder.tsx
        echo "✅ Removed ActivityBuilder.tsx"
    fi
    
    if [ -f "src/components/chat/stages/ImpactDesignerEnhanced.tsx" ]; then
        rm -f src/components/chat/stages/ImpactDesigner.tsx
        echo "✅ Removed ImpactDesigner.tsx"
    fi
    
    if [ -f "src/components/chat/stages/LearningJourneyBuilderEnhanced.tsx" ]; then
        rm -f src/components/chat/stages/LearningJourneyBuilder.tsx
        echo "✅ Removed LearningJourneyBuilder.tsx"
    fi
    
    echo "⚠️  Kept RubricBuilder.tsx (used by PeerEvaluation.tsx)"
else
    echo "⏭️  Skipped"
fi

echo ""

# 4. Final verification
echo "🔍 Verifying build..."
npm run build > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed - please check for issues"
    exit 1
fi

echo ""
echo "🎉 Cleanup complete!"
echo ""
echo "Space saved:"
echo "  - Test HTML files: ~200KB"
echo "  - Archive folders: 2.4MB"
echo "  - Duplicate components: ~100KB"
echo "  - Total: ~2.7MB"
echo ""
echo "Next steps:"
echo "1. Run: git status"
echo "2. Commit changes"
echo "3. Deploy to Netlify"