# ALF Design System - Standard Operating Procedure (SOP)

## Core Design Principles

### 1. Logo and Branding
- **Logo Icon**: ALWAYS use `layers` icon (stacked paper icon) - NOT gem, diamond, or any other icon
- **App Name**: "Alf" or "ALF" (depending on context)
- **Logo Implementation**: 
  ```jsx
  <Icon name="layers" size="lg" color="#3b82f6" />
  ```

### 2. Color System
- **Primary Color**: Blue (#3b82f6) - NOT purple, NOT any other color
- **Color Palette**:
  - Primary: #3b82f6 (blue-500)
  - Primary Dark: #2563eb (blue-600)
  - Primary Light: #60a5fa (blue-400)
  - Gray scale: Use the defined gray tokens
  - Semantic colors: Success (green), Warning (amber), Error (red), Info (cyan)

### 3. Visual Style Requirements
- **Soft Shadows**: MUST preserve soft, subtle shadows
  ```css
  /* Standard shadows to use */
  shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  ```
- **Rounded Edges**: MUST use rounded corners
  ```css
  /* Standard radius values */
  rounded-md: 0.375rem (6px)
  rounded-lg: 0.5rem (8px)
  rounded-xl: 0.75rem (12px)
  ```
- **Clean, Modern Look**: No sharp corners, maintain soft UI aesthetic

### 4. Component Guidelines

#### Icons
- Use Lucide React icons exclusively
- Map ALL emojis to appropriate Lucide icons
- Never use emoji characters in production code
- Reference the Icon component's iconMap for consistency

#### Typography
- Font: Inter (primary), system fonts as fallback
- Use design system Text/Heading components
- Maintain consistent sizing and weight

#### Spacing
- Use 8px grid system (0.5rem increments)
- Consistent padding/margin using design tokens

### 5. Quality Checklist (Before ANY Component Update)

Before transforming or creating any component, verify:

- [ ] Logo uses `layers` icon (NOT gem/diamond)
- [ ] Primary color is blue (#3b82f6)
- [ ] All emojis replaced with Lucide icons
- [ ] Soft shadows applied to cards/elevated elements
- [ ] Rounded corners used (no sharp edges)
- [ ] Using design system components (not custom styles)
- [ ] Following the spacing grid (8px base)
- [ ] No hardcoded colors - use tokens
- [ ] Component matches Dashboard.jsx style reference

### 6. Common Mistakes to Avoid

1. **Wrong Logo Icon**: Using gem, diamond, or other icons instead of layers
2. **Wrong Primary Color**: Using purple or other colors instead of blue
3. **Missing Soft Shadows**: Forgetting to add subtle shadows to cards
4. **Sharp Corners**: Not applying border radius to components
5. **Emoji Usage**: Leaving emojis in the code instead of using icons
6. **Hardcoded Values**: Using pixel values instead of design tokens

### 7. Reference Implementation

Always refer to these transformed components as examples:
- `Dashboard.jsx` - Main reference for layout and styling
- `Header.jsx` - Logo and navigation reference
- `ProjectCard.jsx` - Card styling with soft shadows and rounded edges

### 8. Testing Protocol

After each component transformation:
1. Verify logo displays correctly (layers icon)
2. Check primary color is blue throughout
3. Confirm soft shadows are visible on cards
4. Ensure all corners are rounded appropriately
5. Validate no emojis remain in the component
6. Test responsive behavior

## Agent Review Process

When using specialized agents, explicitly instruct them to:
1. Check this SOP document first
2. Verify logo icon choice (must be layers)
3. Confirm color choices align with tokens
4. Ensure soft UI principles are maintained
5. Double-check for any remaining emojis

This SOP should be referenced before ANY design system work to maintain consistency and quality.