# Save & Exit Feature Documentation

## Overview
A comprehensive Save & Exit button has been added to ALF Coach, allowing users to save their progress and return to the dashboard at any point during the blueprint creation process.

## Implementation Details

### Component: `SaveExitButton.tsx`
Located at: `/src/components/SaveExitButton.tsx`

**Features:**
- Three visual variants: `floating`, `header`, `inline`
- Three size options: `sm`, `md`, `lg`
- Animated state transitions (idle → saving → success/error)
- Mobile-optimized with responsive design
- Full accessibility support (WCAG AA compliant)

### Visual States
1. **Idle**: Gray save icon with "Save & Exit" label
2. **Saving**: Blue spinning loader with "Saving..." label
3. **Success**: Green checkmark with "Saved!" label (800ms delay before navigation)
4. **Error**: Red X with "Try Again" label (resets after 2s)

## Placement Strategy

### 1. Floating Action Button (Primary)
- **Desktop**: Bottom-right corner with label
- **Mobile**: Bottom-right corner, icon-only (larger touch target)
- **Z-index**: 40 (above content, below modals)
- **Always visible** except during wizard stage

### 2. Header Integration (Secondary)
- **Location**: Top navigation bar, next to user info
- **Visibility**: Desktop only (hidden on mobile to reduce clutter)
- **Shows on**: Blueprint/project creation pages
- **Style**: Subtle gray button that matches header aesthetic

### 3. ChatInterface Integration
- **Both floating buttons** (mobile and desktop variants)
- **Auto-saves** blueprint data before navigation
- **Hidden during wizard** to prevent incomplete setup

## UX Best Practices Applied

### Visual Hierarchy
- Secondary visual weight (doesn't compete with primary actions)
- Uses established design tokens from the app's design system
- Smooth animations with `framer-motion`

### Accessibility
- ✅ Keyboard navigable (Tab, Enter/Space)
- ✅ Screen reader support with ARIA labels
- ✅ Focus indicators for keyboard users
- ✅ 44px minimum touch targets (mobile)
- ✅ Respects `prefers-reduced-motion`

### Mobile Optimization
- Floating FAB on mobile (thumb-friendly position)
- Icon-only to save screen space
- Larger touch target (56x56px)
- No hover states on touch devices

### User Feedback
- Clear loading states during save
- Success confirmation before navigation
- Error handling with retry option
- Smooth transitions between states

## Usage

### Basic Implementation
```tsx
<SaveExitButton 
  variant="floating"
  size="md"
  showLabel={true}
  onSave={async () => {
    // Custom save logic
    await saveData();
  }}
/>
```

### Mobile/Desktop Split
```tsx
{/* Mobile floating button */}
<FloatingSaveButton onSave={handleSave} />

{/* Desktop floating button with label */}
<DesktopSaveButton onSave={handleSave} />
```

## Technical Details

### Auto-Save Integration
- Blueprint data is already auto-saved periodically
- Save & Exit triggers an explicit save before navigation
- Uses existing Firebase save infrastructure
- Graceful fallback if save fails (data persists from auto-save)

### Navigation Flow
1. User clicks Save & Exit
2. Loading state appears
3. Data saves to Firebase
4. Success state shows briefly (800ms)
5. Navigation to dashboard
6. If error: Shows error state, user can retry

## Files Modified

1. **Created:**
   - `/src/components/SaveExitButton.tsx` - Main component

2. **Modified:**
   - `/src/components/chat/ChatInterface.tsx` - Added floating buttons
   - `/src/components/Header.jsx` - Added header variant
   - `/src/AuthenticatedApp.tsx` - Pass showSaveExit prop to Header

## Design Rationale

The Save & Exit button serves as a **safety net** for users:
- Always accessible but never intrusive
- Provides confidence to explore without fear of losing work
- Clear visual feedback for all actions
- Respects the existing visual hierarchy
- Mobile-first approach with desktop enhancements

## Future Enhancements

Potential improvements:
1. Keyboard shortcut (Cmd/Ctrl + S)
2. Unsaved changes indicator
3. Auto-save status indicator
4. Session recovery after unexpected exit
5. Progressive save (only changed data)