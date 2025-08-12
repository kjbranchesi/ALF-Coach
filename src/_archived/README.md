# Archived Components

This directory contains components that have been deprecated but are kept for reference and potential rollback.

## Archive Strategy

### Directory Structure
```
_archived/
├── YYYY-MM-DD-description/    # Date-based archive folders
│   ├── components/             # Archived components
│   ├── ARCHIVE_MANIFEST.md    # What was archived and why
│   └── ROLLBACK_GUIDE.md      # How to restore if needed
```

### Archive Process
1. Create dated folder with descriptive name
2. Move deprecated components (don't delete)
3. Document what was archived and why
4. Create rollback instructions
5. Update imports to remove references
6. Test that nothing breaks

### Restoration Process
1. Check ROLLBACK_GUIDE.md in archive folder
2. Copy components back to original locations
3. Restore import statements
4. Run tests to verify functionality

## Current Archives

### 2024-08-11-chatbot-rethink
**Reason**: Major architectural shift to chatbot-first interface
**Components**: 
- Old stage initiators
- Complex form components
- "What If" cards
- Confusing milestone forms
**Status**: Active development, keep for 90 days minimum