#!/bin/bash

# Codebase Cleanup Script
# Updates spec documents to reference actual files instead of non-existent ones

echo "🧹 Starting codebase cleanup..."
echo ""

# Backup original files
echo "📦 Creating backups..."
cp REDESIGN_SPECIFICATION.md REDESIGN_SPECIFICATION.md.backup
cp CHAT_INTERFACE_REDESIGN.md CHAT_INTERFACE_REDESIGN.md.backup
echo "✅ Backups created"
echo ""

# Update REDESIGN_SPECIFICATION.md
echo "📝 Updating REDESIGN_SPECIFICATION.md..."
sed -i '' 's|src/components/chat/PBLChatInterface\.tsx|src/features/chat-mvp/ChatMVP.tsx|g' REDESIGN_SPECIFICATION.md
sed -i '' 's|/src/components/chat/PBLChatInterface\.tsx|/src/features/chat-mvp/ChatMVP.tsx|g' REDESIGN_SPECIFICATION.md
sed -i '' 's|src/components/chat/ProgressSidebar\.tsx|src/features/chat-mvp/components/WorkingDraftSidebar.tsx|g' REDESIGN_SPECIFICATION.md
sed -i '' 's|/src/components/chat/ProgressSidebar\.tsx|/src/features/chat-mvp/components/WorkingDraftSidebar.tsx|g' REDESIGN_SPECIFICATION.md
echo "✅ REDESIGN_SPECIFICATION.md updated"

# Update CHAT_INTERFACE_REDESIGN.md
echo "📝 Updating CHAT_INTERFACE_REDESIGN.md..."
sed -i '' 's|src/components/chat/PBLChatInterface\.tsx|src/features/chat-mvp/ChatMVP.tsx|g' CHAT_INTERFACE_REDESIGN.md
sed -i '' 's|/src/components/chat/PBLChatInterface\.tsx|/src/features/chat-mvp/ChatMVP.tsx|g' CHAT_INTERFACE_REDESIGN.md
sed -i '' 's|src/components/chat/ProgressSidebar\.tsx|src/features/chat-mvp/components/WorkingDraftSidebar.tsx|g' CHAT_INTERFACE_REDESIGN.md
sed -i '' 's|/src/components/chat/ProgressSidebar\.tsx|/src/features/chat-mvp/components/WorkingDraftSidebar.tsx|g' CHAT_INTERFACE_REDESIGN.md
echo "✅ CHAT_INTERFACE_REDESIGN.md updated"
echo ""

# Summary
echo "✨ Spec document updates complete!"
echo ""
echo "📊 Summary of changes:"
echo "  - PBLChatInterface.tsx → ChatMVP.tsx (with correct path)"
echo "  - ProgressSidebar.tsx → WorkingDraftSidebar.tsx (with correct path)"
echo ""
echo "💾 Backup files created:"
echo "  - REDESIGN_SPECIFICATION.md.backup"
echo "  - CHAT_INTERFACE_REDESIGN.md.backup"
echo ""
echo "Next steps:"
echo "  1. Review changes: git diff REDESIGN_SPECIFICATION.md"
echo "  2. Extract Stage type from ProgressSidebar.tsx"
echo "  3. Delete unused files"
echo "  4. Run build to verify"
