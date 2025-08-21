# ALF Coach Design System Migration Guide

## Overview
We're upgrading ALF Coach to a modern design system combining Material Design 3 and Apple Human Interface Guidelines. This guide provides step-by-step migration instructions.

## Phase 1: Foundation Setup ✅

### 1.1 Tailwind Configuration Update
**Status:** Ready to implement

```bash
# Backup current config
cp tailwind.config.js tailwind.config.backup.js

# Use enhanced config
cp tailwind.config.enhanced.js tailwind.config.js
```

### 1.2 Install Dependencies
**Status:** Completed ✅

```bash
npm install --save-dev @tailwindcss/forms tailwindcss-animate
```

### 1.3 Import Enhanced Styles
Add to `src/index.css`:

```css
/* Keep existing styles */
@import './index.css';

/* Add enhanced design system */
@import './styles/enhanced-global.css';
```

## Phase 2: Component Migration

### Button Components

#### Before (Current):
```jsx
<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  Click Me
</button>
```

#### After (Enhanced):
```jsx
// Material Design 3 Filled Button
<button className="btn-filled">
  Click Me
</button>

// Apple HIG Style Button with Glassmorphism
<button className="
  px-6 py-3 
  glass-medium text-primary-600 font-medium rounded-2xl
  shadow-sm hover:shadow-md hover:scale-[1.02]
  transform transition-all duration-200
  haptic-light
">
  Click Me
</button>
```

### Chat Messages

#### Before:
```jsx
<div className="bg-white p-4 rounded-lg">
  {message.content}
</div>
```

#### After:
```jsx
// User Message
<div className="message-user">
  {message.content}
</div>

// AI Assistant Message
<div className="message-assistant-ai">
  <MessageRenderer content={message.content} role="assistant" />
</div>
```

### Cards

#### Before:
```jsx
<div className="bg-white rounded-lg shadow p-6">
  {/* content */}
</div>
```

#### After:
```jsx
// Material Design 3 Elevated Card
<div className="card-elevated p-6">
  {/* content */}
</div>

// Apple HIG Glass Card
<div className="card-ios-glass p-6">
  {/* content */}
</div>
```

### Form Inputs

#### Before:
```jsx
<input 
  className="px-3 py-2 border rounded" 
  placeholder="Enter text"
/>
```

#### After:
```jsx
// Material Design 3 Input
<input 
  className="input-material" 
  placeholder="Enter text"
/>

// Apple HIG Input
<input 
  className="input-ios" 
  placeholder="Enter text"
/>
```

## Phase 3: Chat Interface Redesign

### Updated ChatbotFirstInterfaceFixed

Replace current chat bubble styling:

```jsx
// src/components/chat/ChatbotFirstInterfaceFixed.tsx

// Update message rendering
<div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
  {message.role === 'assistant' && (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ai-400 to-ai-600 
                    shadow-ai/30 shadow-lg flex items-center justify-center mr-3">
      <Bot className="w-5 h-5 text-white" />
    </div>
  )}
  
  <div className={message.role === 'user' ? 'message-user' : 'message-assistant-ai'}>
    <MessageRenderer content={message.content} role={message.role} />
  </div>
</div>

// Update input area
<div className="p-4 glass-medium border-t border-gray-200/50">
  <div className="flex gap-3">
    <input
      type="text"
      placeholder="Ask me anything..."
      className="input-ios flex-1"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
    />
    <button 
      onClick={handleSend}
      className="btn-filled !rounded-2xl !px-4"
    >
      <Send className="w-5 h-5" />
    </button>
  </div>
</div>
```

### Stage Initiator Cards Update

```jsx
// Update card styling in StageInitiatorCards.tsx
<motion.button
  className="
    p-6 
    card-ios-glass
    hover:shadow-elevation-3
    transform transition-all duration-300
    hover:-translate-y-1
    state-layer-hover
  "
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  {/* Card content */}
</motion.button>
```

## Phase 4: Education Components

### Progress Visualization

```jsx
// New Progress Ring Component
const ProgressRing = ({ progress, size = 120 }) => (
  <div 
    className="progress-ring" 
    style={{ width: size, height: size }}
  >
    <svg className="transform -rotate-90" width={size} height={size}>
      <circle
        className="text-gray-200"
        strokeWidth="8"
        stroke="currentColor"
        fill="transparent"
        r={(size - 16) / 2}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        className="progress-ring-circle text-primary-500"
        strokeWidth="8"
        style={{
          '--progress-dasharray': `${2 * Math.PI * ((size - 16) / 2)}`,
          '--progress-dashoffset': `${2 * Math.PI * ((size - 16) / 2) * (1 - progress)}`
        }}
        r={(size - 16) / 2}
        cx={size / 2}
        cy={size / 2}
      />
    </svg>
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="text-2xl font-bold gradient-text">
        {Math.round(progress * 100)}%
      </span>
    </div>
  </div>
);
```

### Achievement Badges

```jsx
const AchievementBadge = ({ title, icon, earned = false }) => (
  <div className={`
    achievement-badge
    ${earned ? 'opacity-100' : 'opacity-50 grayscale'}
    transition-all duration-300
  `}>
    {icon}
    <span>{title}</span>
  </div>
);
```

## Phase 5: Dark Mode Updates

### Toggle Implementation

```jsx
const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);
  
  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="
        p-2 rounded-xl
        glass-subtle
        hover:glass-medium
        transition-all duration-200
        touch-target
      "
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-warning-500" />
      ) : (
        <Moon className="w-5 h-5 text-ai-500" />
      )}
    </button>
  );
};
```

## Testing Checklist

### Visual Testing
- [ ] All buttons have proper Material Design 3 ripple effects
- [ ] Cards show elevation changes on hover
- [ ] Glassmorphism effects render correctly
- [ ] Dark mode transitions smoothly
- [ ] Animations respect reduced motion preferences

### Accessibility Testing
- [ ] All interactive elements have 44px minimum touch targets
- [ ] Focus indicators are clearly visible
- [ ] Color contrast meets WCAG AAA standards
- [ ] Screen reader announcements work correctly
- [ ] Keyboard navigation is smooth

### Performance Testing
- [ ] Page load time < 3 seconds
- [ ] First Contentful Paint < 1.5 seconds
- [ ] Cumulative Layout Shift < 0.1
- [ ] No animation jank on scroll

## Rollback Plan

If issues arise:

```bash
# Restore original Tailwind config
cp tailwind.config.backup.js tailwind.config.js

# Remove enhanced styles import from src/index.css
# Restart dev server
npm run dev
```

## Component Conversion Priority

1. **Critical (Week 1)**
   - Buttons
   - Form inputs
   - Chat messages
   - Cards

2. **Important (Week 2)**
   - Navigation
   - Progress indicators
   - Loading states
   - Modals

3. **Enhancement (Week 3)**
   - Achievement badges
   - Learning paths
   - Collaboration features
   - Analytics dashboards

## Success Metrics

- **Performance**: 20% faster perceived load time
- **Accessibility**: WCAG AAA compliance
- **User Satisfaction**: 15% increase in engagement
- **Developer Experience**: 30% faster component development

## Resources

- [Material Design 3 Guidelines](https://m3.material.io/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [ALF Coach Design System v2.0 Spec](./DESIGN_SYSTEM_SPEC.md)

## Support

For questions or issues during migration:
1. Check this guide first
2. Review the enhanced Tailwind config
3. Test in isolation using Storybook
4. Create an issue with the `design-system` tag

---

**Remember:** This is a gradual migration. Not everything needs to change at once. Focus on high-impact, user-facing components first.