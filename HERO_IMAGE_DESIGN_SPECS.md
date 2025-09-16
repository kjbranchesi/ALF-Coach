# Hero Image Design Specifications
## Project Showcase Pages

### Implementation Summary
The hero images have been successfully integrated into individual project showcase pages with the following approach:

## 1. Primary Hero Section Integration

### Desktop Layout (lg breakpoint and above)
- **Layout**: 2-column grid with 50/50 split
- **Left Column**: Project metadata and title
- **Right Column**: Hero image with visual enhancements
- **Image Container**:
  - Min height: 400px for consistent sizing
  - Border radius: `rounded-2xl` (16px)
  - Shadow: `shadow-2xl` for depth
  - Border: Glass morphism style with `border-white/20`
  - Hover effect: Subtle scale animation (1.02x)

### Mobile/Tablet Layout
- **Layout**: Full-width stacked design
- **Image Position**: Below title section
- **Image Height**:
  - Mobile (sm): 256px (h-64)
  - Tablet (md): 320px (h-80)
- **Visual Treatment**: Gradient overlay for better text contrast

## 2. Secondary Context Section Preview

### Desktop Only Feature
- **Layout**: 3-column grid (2:1 ratio)
- **Position**: Within "About This Exemplar" section
- **Purpose**: Visual reinforcement without repetition
- **Opacity**: 80% for subtle presence
- **Gradient**: Left-to-right fade for smooth integration

## 3. Visual Design Details

### Color Treatment
```css
/* Gradient Overlays */
- Hero gradient: from-blue-600/10 via-purple-600/10 to-emerald-600/10
- Bottom fade: from-slate-900/20 via-transparent to-transparent
- Mobile overlay: from-slate-900/40 via-slate-900/20 to-transparent
```

### Animation Specifications
```javascript
// Framer Motion Settings
Desktop Image:
- initial: { opacity: 0, x: 20 }
- animate: { opacity: 1, x: 0 }
- transition: { delay: 0.3, duration: 0.6 }
- whileHover: { scale: 1.02 }

Mobile Image:
- initial: { opacity: 0, scale: 0.95 }
- animate: { opacity: 1, scale: 1 }
- transition: { delay: 0.2 }
```

## 4. Performance Optimizations

### Image Loading
- **Hero Section**: `loading="eager"` for immediate display
- **Context Preview**: Lazy loaded with viewport detection
- **Object Fit**: `object-cover` for responsive scaling
- **Object Position**: `center center` for focal point control

### Responsive Breakpoints
```css
/* Tailwind Breakpoints */
- sm: 640px (mobile)
- md: 768px (tablet)
- lg: 1024px (desktop)
- xl: 1280px (wide desktop)
```

## 5. Accessibility Considerations

### Alt Text
- Primary image: Full project title
- Preview image: "{title} preview"

### Color Contrast
- Overlay gradients ensure text remains readable
- Dark mode specific adjustments for proper contrast
- Glass morphism effects maintain WCAG AA compliance

## 6. Integration Patterns

### Conditional Rendering
```jsx
{heroData?.image && (
  // Image component only renders when image exists
)}
```

### Fallback Behavior
- Pages without images maintain original centered layout
- No broken image icons or empty spaces
- Graceful degradation to text-only display

## 7. Design Rationale

### Visual Hierarchy
1. **Immediate Impact**: Hero image creates emotional connection
2. **Information Flow**: Eye moves from visual to title to metadata
3. **Progressive Disclosure**: Details revealed as user scrolls
4. **Contextual Reinforcement**: Secondary preview maintains visual thread

### Brand Consistency
- Rounded corners match existing card designs
- Glass morphism aligns with modern UI patterns
- Color gradients complement existing palette
- Shadow depths create consistent layering

## 8. Future Enhancements

### Potential Additions
1. **Parallax Scrolling**: Subtle depth effect on scroll
2. **Image Gallery**: Multiple project images in carousel
3. **Video Support**: Hero video backgrounds for dynamic projects
4. **Loading States**: Skeleton screens while images load
5. **Image Optimization**: Next-gen formats (WebP, AVIF)

### Performance Monitoring
- Track Core Web Vitals impact
- Monitor Largest Contentful Paint (LCP)
- Optimize Cumulative Layout Shift (CLS)
- Measure First Input Delay (FID)

## 9. Implementation Checklist

✅ Desktop split layout with hero image
✅ Mobile responsive stacking
✅ Context section preview integration
✅ Glass morphism and shadow effects
✅ Hover animations with Framer Motion
✅ Dark mode compatibility
✅ Accessibility alt text
✅ Conditional rendering for missing images
✅ Performance optimizations

## 10. Testing Requirements

### Browser Compatibility
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

### Device Testing
- Desktop: 1920x1080, 1440x900, 1366x768
- Tablet: iPad Pro, iPad Air, Surface
- Mobile: iPhone 14/13, Samsung Galaxy, Pixel

### Performance Targets
- LCP: < 2.5 seconds
- CLS: < 0.1
- FID: < 100ms
- Image load time: < 1 second on 3G

## Notes for Developers

The implementation uses existing React, Tailwind CSS, and Framer Motion patterns established in the codebase. No additional dependencies are required. Images are imported directly from the hero project data files and rendered conditionally based on availability.

The design maintains professionalism while adding visual engagement, ensuring the educational content remains the primary focus while the images enhance rather than overwhelm the user experience.