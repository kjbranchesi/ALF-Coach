# ALF Design System Usage Guide

## Quick Reference

This guide provides practical examples for migrating existing components to the new ALF Design System. Use this as a reference during the transformation process.

---

## Component Import Patterns

### Single Component Import
```tsx
import { Button } from '@/design-system/components/Button';
import { Heading, Text } from '@/design-system/components/Typography';
import { Icon } from '@/design-system/components/Icon';
```

### Complete Design System Import
```tsx
import { Button, Heading, Text, Icon, Card, Grid } from '@/design-system';
```

### Feature Flag Usage
```tsx
import { useDesignFlag, DESIGN_SYSTEM_FLAGS } from '@/design-system/featureFlags';

const MyComponent = () => {
  const useNewIcons = useDesignFlag(DESIGN_SYSTEM_FLAGS.USE_NEW_ICONS);
  
  return useNewIcons ? <Icon name="star" /> : <span>⭐</span>;
};
```

---

## Button Component Migrations

### Primary Actions

**Before:**
```jsx
<button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 soft-rounded-xl shadow-soft-lg hover:shadow-soft-xl hover:lift flex items-center justify-center gap-2 soft-transition">
  <PlusIcon />
  New Blueprint
</button>
```

**After:**
```tsx
<Button variant="primary" size="lg" leftIcon="add">
  New Blueprint
</Button>
```

### Secondary Actions

**Before:**
```jsx
<button className="bg-teal-600 text-white hover:bg-teal-700 shadow-lg hover:shadow-xl px-4 py-2 rounded-lg">
  Continue
</button>
```

**After:**
```tsx
<Button variant="secondary">
  Continue
</Button>
```

### Ghost/Subtle Actions

**Before:**
```jsx
<button className="text-slate-700 hover:text-slate-900 hover:bg-slate-100 p-2 rounded">
  Cancel
</button>
```

**After:**
```tsx
<Button variant="ghost">
  Cancel
</Button>
```

### Icon-Only Buttons

**Before:**
```jsx
<button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors">
  <TrashIcon />
</button>
```

**After:**
```tsx
<IconButton icon="delete" label="Delete project" variant="ghost" />
```

### Button Groups

**Before:**
```jsx
<div className="flex gap-2">
  <button className="px-4 py-2 bg-slate-200 rounded-l-lg">Back</button>
  <button className="px-4 py-2 bg-blue-600 text-white rounded-r-lg">Next</button>
</div>
```

**After:**
```tsx
<ButtonGroup>
  <Button variant="secondary">Back</Button>
  <Button variant="primary">Next</Button>
</ButtonGroup>
```

---

## Typography Migrations

### Page Headings

**Before:**
```jsx
<h1 className="text-[2.25rem] font-bold text-slate-800 dark:text-slate-100 leading-tight">
  Dashboard
</h1>
```

**After:**
```tsx
<Heading level={1} color="default" weight="bold">
  Dashboard
</Heading>
```

### Section Headings

**Before:**
```jsx
<h2 className="text-[1.875rem] font-bold text-slate-700 leading-tight">
  Welcome to Your Design Studio!
</h2>
```

**After:**
```tsx
<Heading level={2} weight="bold">
  Welcome to Your Design Studio!
</Heading>
```

### Body Text

**Before:**
```jsx
<p className="text-slate-500 dark:text-slate-400 mt-2 mb-6">
  You don't have any blueprints yet.
</p>
```

**After:**
```tsx
<Text color="muted" className="mt-2 mb-6">
  You don't have any blueprints yet.
</Text>
```

### Small Text / Captions

**Before:**
```jsx
<div className="text-xs text-slate-400">
  Created: {formatDate(project.createdAt)}
</div>
```

**After:**
```tsx
<Caption color="muted">
  Created: {formatDate(project.createdAt)}
</Caption>
```

---

## Icon System Migrations

### Educational Icons (High Priority)

**Before → After:**
```jsx
// Learning targets
<span>🎯 Learning Target</span>
<div className="flex items-center gap-2">
  <Icon name="target" size="sm" />
  <Text>Learning Target</Text>
</div>

// Innovation/Ideas  
<span>🚀 Launch Project</span>
<div className="flex items-center gap-2">
  <Icon name="rocket" size="sm" />
  <Text>Launch Project</Text>
</div>

// Knowledge/Learning
<span>📚 Course Materials</span>
<div className="flex items-center gap-2">
  <Icon name="book" size="sm" />
  <Text>Course Materials</Text>
</div>

// Ideas/Insights
<span>💡 Key Insights</span>
<div className="flex items-center gap-2">
  <Icon name="lightbulb" size="sm" />
  <Text>Key Insights</Text>
</div>

// Achievement
<span>⭐ Featured</span>
<div className="flex items-center gap-2">
  <Icon name="star" size="sm" />
  <Text>Featured</Text>
</div>

// Quality/Excellence  
<span>✨ Enhanced</span>
<div className="flex items-center gap-2">
  <Icon name="sparkles" size="sm" />
  <Text>Enhanced</Text>
</div>

// Creativity
<span>🎨 Design Tools</span>
<div className="flex items-center gap-2">
  <Icon name="palette" size="sm" />
  <Text>Design Tools</Text>
</div>

// Documentation
<span>📝 Notes</span>
<div className="flex items-center gap-2">
  <Icon name="document" size="sm" />
  <Text>Notes</Text>
</div>

// Success/Achievement
<span>🏆 Completed</span>
<div className="flex items-center gap-2">
  <Icon name="trophy" size="sm" />
  <Text>Completed</Text>
</div>

// Trending/Popular
<span>🔥 Popular</span>
<div className="flex items-center gap-2">
  <Icon name="fire" size="sm" />
  <Text>Popular</Text>
</div>
```

### Status Icons

**Before:**
```jsx
<span className="text-green-500">✅ Complete</span>
<span className="text-red-500">❌ Failed</span>
<span className="text-yellow-500">⚠️ Warning</span>
```

**After:**
```tsx
<div className="flex items-center gap-2">
  <StatusIcon status="success" size="sm" />
  <Text>Complete</Text>
</div>
<div className="flex items-center gap-2">
  <StatusIcon status="error" size="sm" />
  <Text>Failed</Text>
</div>
<div className="flex items-center gap-2">
  <StatusIcon status="warning" size="sm" />
  <Text>Warning</Text>
</div>
```

### Interactive Icon Buttons

**Before:**
```jsx
<button onClick={handleEdit} className="p-2 hover:bg-gray-100 rounded">
  ✏️
</button>
```

**After:**
```tsx
<IconButton 
  icon="edit" 
  label="Edit item" 
  onClick={handleEdit}
  variant="ghost" 
/>
```

---

## Layout Component Migrations

### Card Components

**Before:**
```jsx
<div className="soft-card p-6 soft-rounded-lg hover:shadow-soft-xl hover:lift soft-transition">
  <h3 className="text-xl font-bold mb-2">Card Title</h3>
  <p className="text-slate-500 mb-4">Card description</p>
  <button className="bg-blue-600 text-white px-4 py-2 rounded">Action</button>
</div>
```

**After:**
```tsx
<Card padding="lg" rounded="lg" hover="lift">
  <Heading level={3} className="mb-2">Card Title</Heading>
  <Text color="muted" className="mb-4">Card description</Text>
  <Button variant="primary">Action</Button>
</Card>
```

### Grid Layouts

**Before:**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <ItemCard key={item.id} item={item} />)}
</div>
```

**After:**
```tsx
<Grid cols={1} mdCols={2} lgCols={3} gap={6}>
  {items.map(item => <ItemCard key={item.id} item={item} />)}
</Grid>
```

### Container/Wrapper Elements

**Before:**
```jsx
<div className="max-w-4xl mx-auto px-6 py-8">
  <div className="bg-white rounded-lg shadow p-6">
    Content
  </div>
</div>
```

**After:**
```tsx
<Container maxWidth="4xl" padding="lg">
  <Card padding="lg">
    Content
  </Card>
</Container>
```

---

## Form Component Migrations

### Input Fields

**Before:**
```jsx
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Email Address
  </label>
  <input 
    type="email"
    className="soft-input w-full px-3 py-2 border rounded-lg focus:ring-blue-500"
    placeholder="Enter your email"
  />
</div>
```

**After:**
```tsx
<FormField>
  <Label htmlFor="email" required>Email Address</Label>
  <Input 
    id="email"
    type="email" 
    placeholder="Enter your email"
    required
  />
</FormField>
```

### Form Validation

**Before:**
```jsx
<div className="mb-4">
  <input className="border-red-500" />
  <p className="text-red-500 text-sm mt-1">This field is required</p>
</div>
```

**After:**
```tsx
<FormField error="This field is required">
  <Input state="error" />
</FormField>
```

### Form Actions

**Before:**
```jsx
<div className="flex justify-between pt-4 border-t">
  <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded">
    Cancel
  </button>
  <button className="bg-blue-600 text-white px-4 py-2 rounded">
    Submit
  </button>
</div>
```

**After:**
```tsx
<FormActions>
  <Button variant="secondary">Cancel</Button>
  <Button variant="primary" type="submit">Submit</Button>
</FormActions>
```

---

## Progress Component Migrations

### Progress Indicators

**Before:**
```jsx
<div className="flex items-center gap-2">
  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">
    1
  </div>
  <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm">
    2
  </div>
</div>
```

**After:**
```tsx
<StepIndicator 
  steps={['Ideation', 'Journey', 'Deliverables']}
  currentStep={0}
/>
```

### Progress Bars

**Before:**
```jsx
<div className="w-full bg-gray-200 rounded-full h-2">
  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
</div>
```

**After:**
```tsx
<ProgressBar value={60} max={100} />
```

---

## Modal Component Migrations

### Confirmation Dialogs

**Before:**
```jsx
{isOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
      <p className="text-gray-600 mb-4">Are you sure you want to delete this item?</p>
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 text-gray-600">Cancel</button>
        <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
      </div>
    </div>
  </div>
)}
```

**After:**
```tsx
<Modal isOpen={isOpen} onClose={onClose} title="Confirm Delete">
  <Text className="mb-4">Are you sure you want to delete this item?</Text>
  <ModalActions>
    <Button variant="ghost" onClick={onClose}>Cancel</Button>
    <Button variant="danger" onClick={onConfirm}>Delete</Button>
  </ModalActions>
</Modal>
```

---

## Chat Component Migrations

### Message Bubbles

**Before:**
```jsx
<div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
    isUser ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
  }`}>
    {content}
  </div>
</div>
```

**After:**
```tsx
<MessageBubble variant={isUser ? 'user' : 'assistant'}>
  {content}
</MessageBubble>
```

### Suggestion Cards

**Before:**
```jsx
<div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
  <div className="flex items-center gap-2">
    <span>💡</span>
    <span className="font-medium">Suggestion Title</span>
  </div>
  <p className="text-sm text-gray-600 mt-1">Suggestion description</p>
</div>
```

**After:**
```tsx
<SuggestionCard onClick={handleClick} icon="lightbulb">
  <Heading level={4}>Suggestion Title</Heading>
  <Text size="sm" color="muted">Suggestion description</Text>
</SuggestionCard>
```

---

## Theme & Dark Mode

### Color-Aware Components

```tsx
// Automatic theme support built into design system
<Card>
  <Heading level={2}>Title</Heading>
  <Text color="muted">This automatically adapts to light/dark themes</Text>
</Card>
```

### Custom Theme Overrides

```tsx
// Using design tokens for custom styling
<div style={{ 
  backgroundColor: tokens.colors.background.secondary,
  color: tokens.colors.gray[900],
  padding: tokens.spacing[4]
}}>
  Custom styled content
</div>
```

---

## Performance Optimization

### Tree Shaking

```tsx
// Good: Import specific components
import { Button } from '@/design-system/components/Button';

// Avoid: Importing entire library (unless using build optimization)
import * as DesignSystem from '@/design-system';
```

### Icon Loading

```tsx
// Icons are lazy-loaded automatically
<Icon name="star" /> // Only loads Star icon when rendered
```

### Component Memoization

```tsx
import React from 'react';
import { Button } from '@/design-system';

// For components with expensive renders
const ExpensiveComponent = React.memo(({ data }) => (
  <div>
    {data.map(item => <Button key={item.id}>{item.label}</Button>)}
  </div>
));
```

---

## Common Patterns & Examples

### Loading States

```tsx
<Button loading disabled>
  Saving...
</Button>

<Card>
  <SkeletonLoader lines={3} />
</Card>
```

### Error States

```tsx
<FormField error="This field is required">
  <Input state="error" />
</FormField>

<Toast variant="error" title="Error">
  Something went wrong. Please try again.
</Toast>
```

### Empty States

```tsx
<EmptyState 
  icon="package"
  title="No projects yet"
  description="Create your first learning blueprint to get started"
  action={<Button variant="primary">Create Project</Button>}
/>
```

### Feature Flags Integration

```tsx
const MyComponent = () => {
  const useNewDesign = useDesignFlag(DESIGN_SYSTEM_FLAGS.USE_NEW_BUTTONS);
  
  return (
    <div>
      {useNewDesign ? (
        <Button variant="primary">New Design</Button>
      ) : (
        <button className="old-button-class">Old Design</button>
      )}
    </div>
  );
};
```

---

## Migration Checklist

For each component you're migrating:

- [ ] Replace button elements with `<Button>` component
- [ ] Replace heading tags with `<Heading>` component  
- [ ] Replace paragraph/span text with `<Text>` component
- [ ] Replace emoji with `<Icon>` components
- [ ] Update color classes to use design tokens
- [ ] Replace custom spacing with token-based spacing
- [ ] Add appropriate feature flag checks
- [ ] Test responsive behavior
- [ ] Verify accessibility attributes
- [ ] Update any related TypeScript types

---

This usage guide should be your primary reference during the migration process. Each pattern has been tested against the existing codebase to ensure compatibility and improved consistency.