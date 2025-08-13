# ALF Coach Style & Brand Guide

## Core Principles

### 1. Professional Educational Aesthetic
- Clean, modern interface designed for educators
- Soft UI design with subtle shadows and gradients
- Focus on readability and clarity
- Accessibility-first approach

### 2. NO EMOJIS Policy
- **NEVER use emojis in the interface**
- Use Lucide icons exclusively for visual elements
- Icons should be functional, not decorative
- Maintain professional appearance throughout

## Visual Design System

### Color Palette

#### Primary Colors
```css
--alf-blue: #3b82f6;        /* Primary action color */
--alf-blue-dark: #2563eb;   /* Hover states */
--alf-blue-light: #60a5fa;  /* Accents */
```

#### Secondary Colors
```css
--alf-purple: #8B5CF6;      /* Creative/ideation elements */
--alf-orange: #FF8C42;      /* Warm actions/warnings */
--alf-sage: #10B981;        /* Success states */
```

#### Neutral Colors
```css
--alf-gray-50: #f9fafb;     /* Lightest background */
--alf-gray-100: #f3f4f6;    /* Light background */
--alf-gray-200: #e5e7eb;    /* Borders */
--alf-gray-400: #9ca3af;    /* Muted text */
--alf-gray-600: #4b5563;    /* Secondary text */
--alf-gray-700: #374151;    /* Primary text */
--alf-gray-900: #111827;    /* Headings */
```

### Typography

#### Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

#### Type Scale
```css
--text-xs: 0.75rem;     /* 12px - Captions */
--text-sm: 0.875rem;    /* 14px - Secondary text */
--text-base: 1rem;      /* 16px - Body text */
--text-lg: 1.125rem;    /* 18px - Large body */
--text-xl: 1.25rem;     /* 20px - Small headings */
--text-2xl: 1.5rem;     /* 24px - Section headings */
--text-3xl: 1.875rem;   /* 30px - Page headings */
```

#### Font Weights
- Regular: 400 (body text)
- Medium: 500 (labels, buttons)
- Semibold: 600 (subheadings)
- Bold: 700 (headings)

### Spacing System
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
```

### Border Radius
```css
--radius-sm: 0.375rem;  /* Small elements */
--radius-md: 0.5rem;    /* Buttons, inputs */
--radius-lg: 0.75rem;   /* Cards */
--radius-xl: 1rem;      /* Large cards */
--radius-2xl: 1.25rem;  /* Modals */
```

### Shadows (Soft UI)
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
--shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.15);
```

## Icon Usage Guidelines

### Approved Icon Set: Lucide Icons Only

#### Navigation Icons
- `ChevronRight` - Forward navigation
- `ChevronLeft` - Back navigation
- `Menu` - Menu toggle
- `X` - Close/dismiss

#### Action Icons
- `Send` - Submit message
- `Plus` - Add new item
- `Edit2` - Edit content
- `Trash2` - Delete item
- `Download` - Export/download
- `Upload` - Import/upload

#### Status Icons
- `Check` - Completed/success
- `AlertCircle` - Warning
- `Info` - Information
- `HelpCircle` - Help/guidance
- `Clock` - In progress/time

#### Feature Icons
- `Lightbulb` - Ideas/suggestions
- `Target` - Goals/objectives
- `Users` - Collaboration
- `BookOpen` - Learning content
- `Award` - Achievements
- `Zap` - Quick actions

### Icon Implementation Rules
1. Icons should be 16-24px in size
2. Use consistent stroke width (2px default)
3. Apply proper aria-labels for accessibility
4. Icons should enhance, not replace, text labels
5. Maintain consistent color usage

## Component Patterns

### Buttons

#### Primary Button
```tsx
<button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
  <Send className="w-5 h-5 mr-2" />
  Send Message
</button>
```

#### Secondary Button
```tsx
<button className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
  <Lightbulb className="w-5 h-5 mr-2" />
  Get Ideas
</button>
```

### Cards
```tsx
<div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
  {/* Card content */}
</div>
```

### Input Fields
```tsx
<input 
  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  placeholder="Type your message..."
/>
```

## Writing Style

### Tone of Voice
- **Professional**: Maintain educator-appropriate language
- **Encouraging**: Support and guide without condescension
- **Clear**: Use simple, direct language
- **Inclusive**: Consider diverse educational contexts

### UI Copy Guidelines
1. Use sentence case for labels and buttons
2. Keep button text under 3 words when possible
3. Write in active voice
4. Avoid jargon unless educationally relevant
5. Be consistent with terminology

### Examples
- ✅ "Get ideas" (not "Get Ideas" or "GET IDEAS")
- ✅ "Save project" (not "Save" alone)
- ✅ "Continue to next step" (clear action)
- ❌ "Click here" (vague)
- ❌ "Submit" (too generic)

## Animation & Transitions

### Timing
```css
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;
```

### Hover States
- Subtle lift: `transform: translateY(-2px)`
- Color shift: Darken by 10%
- Add shadow: Increase shadow depth

### Loading States
- Use skeleton screens, not spinners
- Maintain layout during loading
- Provide progress indicators for long operations

## Accessibility Requirements

### WCAG 2.1 AA Compliance
- Minimum contrast ratio: 4.5:1 for normal text
- Minimum contrast ratio: 3:1 for large text
- All interactive elements keyboard accessible
- Proper ARIA labels and roles
- Focus indicators visible

### Keyboard Navigation
- Tab order logical and predictable
- Escape key closes modals/overlays
- Enter/Space activate buttons
- Arrow keys for menu navigation

## Layout Principles

### Grid System
- 12-column grid for desktop
- 6-column grid for tablet
- Single column for mobile

### Breakpoints
```css
--mobile: 640px;
--tablet: 768px;
--desktop: 1024px;
--wide: 1280px;
```

### Content Width
- Maximum content width: 1200px
- Optimal reading width: 65-75 characters
- Minimum touch target: 44x44px

## Implementation Checklist

### Before Deploying Any UI:
- [ ] No emojis present
- [ ] All icons from Lucide set
- [ ] Colors match palette
- [ ] Typography follows scale
- [ ] Proper spacing applied
- [ ] Shadows are soft UI style
- [ ] Animations use correct timing
- [ ] Accessibility standards met
- [ ] Mobile responsive
- [ ] Loading states handled

## Code Examples

### Correct Implementation
```tsx
import { Lightbulb, HelpCircle, Check } from 'lucide-react';

const UIComponent = () => (
  <div className="flex items-center gap-2">
    <Lightbulb className="w-5 h-5 text-purple-600" />
    <span className="text-gray-700">Get ideas</span>
  </div>
);
```

### Incorrect Implementation
```tsx
// NEVER DO THIS
const UIComponent = () => (
  <div>
    💡 Get Ideas!!! 🎉  {/* NO EMOJIS */}
  </div>
);
```

---

**This guide is mandatory for all UI development on ALF Coach.**