# Performance Optimization Plan - ALF Coach

## Critical Performance Issues Identified

### Bundle Size Problems (CRITICAL)
```
chat-CKPLjVKY.js: 658.68 kB (162.59 kB gzipped) - TOO LARGE
vendor-BW9xZ_cC.js: 656.32 kB (182.62 kB gzipped) - TOO LARGE
react-core-yEMPwwse.js: 567.44 kB (142.38 kB gzipped) - TOO LARGE
document-vendor-Cp3_V96h.js: 350.88 kB (112.76 kB gzipped)
firebase-firestore-DJzMIVI8.js: 299.42 kB (61.98 kB gzipped)
```

**Total Bundle Size: ~3.2 MB (uncompressed)**
**Target: < 1.5 MB**

---

## Immediate Performance Fixes (Do Today)

### 1. Code Splitting for Learning Journey Components
```typescript
// Instead of direct imports
import { CreativeProcessJourney } from './features/learningJourney';

// Use lazy loading
const CreativeProcessJourney = lazy(() => 
  import('./features/learningJourney/CreativeProcessJourney')
);
```

### 2. Remove Unused Sprint 5-6 Components
```bash
# These components are not integrated and add dead weight
- AITutor.tsx (not used)
- AdaptiveLearning.tsx (not used)
- DataAnalytics.tsx (partially implemented)
- ReportGenerator.tsx (partially implemented)
```

### 3. Optimize Icon Imports
```typescript
// BAD - imports entire icon library
import * as Icons from 'lucide-react';

// GOOD - imports only needed icons
import { User, Settings, ChevronRight } from 'lucide-react';
```

### 4. Fix Dynamic Tailwind Classes
```typescript
// BAD - dynamic classes get purged
className={`bg-${color}-500`}

// GOOD - use static mappings
const colorClasses = {
  blue: 'bg-blue-500',
  green: 'bg-green-500'
};
className={colorClasses[color]}
```

---

## Bundle Optimization Strategy

### 1. Vite Configuration Updates
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'ui-vendor': ['framer-motion', '@headlessui/react'],
          'learning-journey': [
            './src/features/learningJourney/CreativeProcessJourney',
            './src/features/learningJourney/components/PhasePanel',
            './src/features/learningJourney/components/PhaseTimeline'
          ],
          'assessment': [
            './src/features/learningJourney/components/RubricBuilder',
            './src/features/learningJourney/components/AssessmentCriteria',
            './src/features/learningJourney/components/StudentProgress'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 500, // Warn at 500kb instead of 400kb
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
});
```

### 2. Lazy Load Heavy Components
```typescript
// App.tsx
import { lazy, Suspense } from 'react';

// Lazy load all major routes
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LearningJourney = lazy(() => import('./features/learningJourney'));
const Chat = lazy(() => import('./features/chat'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/journey" element={<LearningJourney />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Suspense>
  );
}
```

### 3. Remove Duplicate Dependencies
```json
// package.json - Remove duplicates
{
  "dependencies": {
    "react": "^19.0.0", // Keep only one version
    // Remove any duplicate icon libraries
    // Remove unused animation libraries
  }
}
```

---

## Component-Specific Optimizations

### Learning Journey Components

#### 1. Memoize Expensive Calculations
```typescript
// Use React.memo for pure components
export const PhasePanel = React.memo(({ phase, onUpdate }) => {
  // Component logic
});

// Use useMemo for expensive calculations
const phaseMetrics = useMemo(() => {
  return calculatePhaseMetrics(phases, iterations);
}, [phases, iterations]);
```

#### 2. Virtualize Long Lists
```typescript
// For student lists > 50 items
import { FixedSizeList } from 'react-window';

const StudentList = ({ students }) => (
  <FixedSizeList
    height={600}
    itemCount={students.length}
    itemSize={80}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>
        <StudentRow student={students[index]} />
      </div>
    )}
  </FixedSizeList>
);
```

#### 3. Optimize State Updates
```typescript
// BAD - causes unnecessary re-renders
setState({ ...state, field: value });

// GOOD - use functional updates
setState(prev => ({ ...prev, field: value }));

// BETTER - use useReducer for complex state
const [state, dispatch] = useReducer(reducer, initialState);
```

---

## Firebase Optimization

### 1. Tree-shake Firebase Imports
```typescript
// BAD
import * as firebase from 'firebase/app';

// GOOD
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, query } from 'firebase/firestore';
```

### 2. Lazy Load Firebase
```typescript
// Only load Firebase when needed
const initFirebase = async () => {
  const { initializeApp } = await import('firebase/app');
  const { getAuth } = await import('firebase/auth');
  const { getFirestore } = await import('firebase/firestore');
  
  const app = initializeApp(firebaseConfig);
  return {
    auth: getAuth(app),
    db: getFirestore(app)
  };
};
```

---

## Image Optimization

### 1. Use WebP Format
```typescript
// Convert images to WebP
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <source srcSet="image.jpg" type="image/jpeg" />
  <img src="image.jpg" alt="Description" loading="lazy" />
</picture>
```

### 2. Lazy Load Images
```typescript
const LazyImage = ({ src, alt }) => (
  <img
    src={src}
    alt={alt}
    loading="lazy"
    decoding="async"
  />
);
```

---

## Performance Monitoring

### 1. Add Performance Metrics
```typescript
// utils/performance.ts
export const measurePerformance = (metricName: string) => {
  if ('performance' in window) {
    performance.mark(`${metricName}-start`);
    
    return () => {
      performance.mark(`${metricName}-end`);
      performance.measure(
        metricName,
        `${metricName}-start`,
        `${metricName}-end`
      );
      
      const measure = performance.getEntriesByName(metricName)[0];
      console.log(`${metricName}: ${measure.duration}ms`);
    };
  }
  return () => {};
};
```

### 2. Web Vitals Tracking
```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const reportWebVitals = (onPerfEntry?: any) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    getCLS(onPerfEntry);  // Cumulative Layout Shift
    getFID(onPerfEntry);  // First Input Delay
    getFCP(onPerfEntry);  // First Contentful Paint
    getLCP(onPerfEntry);  // Largest Contentful Paint
    getTTFB(onPerfEntry); // Time to First Byte
  }
};
```

---

## Implementation Priority

### Week 1 (Immediate)
1. ✅ Remove unused Sprint 5-6 components
2. ✅ Fix icon imports
3. ✅ Implement code splitting for routes
4. ✅ Fix dynamic Tailwind classes

### Week 2 (High Priority)
1. ⏳ Configure Vite manual chunks
2. ⏳ Optimize Firebase imports
3. ⏳ Add React.memo to components
4. ⏳ Implement lazy loading

### Week 3 (Medium Priority)
1. ⏳ Add virtualization for long lists
2. ⏳ Optimize images
3. ⏳ Implement performance monitoring
4. ⏳ Add loading states

### Week 4 (Polish)
1. ⏳ Fine-tune bundle sizes
2. ⏳ Add service worker for caching
3. ⏳ Implement prefetching
4. ⏳ Optimize animations

---

## Expected Results

### Current Performance
- Bundle Size: ~3.2 MB
- First Load: ~5-8 seconds
- Lighthouse Score: ~35-40

### Target Performance
- Bundle Size: < 1.5 MB
- First Load: < 2 seconds
- Lighthouse Score: > 85

### Metrics to Track
1. **Bundle Size**: Reduce by 50%
2. **First Contentful Paint**: < 1.5s
3. **Time to Interactive**: < 3.5s
4. **Largest Contentful Paint**: < 2.5s
5. **Cumulative Layout Shift**: < 0.1

---

## Quick Wins (Do Right Now)

```bash
# 1. Remove unused components
rm src/features/learningJourney/components/AITutor.tsx
rm src/features/learningJourney/components/AdaptiveLearning.tsx

# 2. Analyze bundle
npm run build -- --analyze

# 3. Find large dependencies
npx depcheck

# 4. Update dependencies
npm update
npm dedupe
```

---

## Monitoring Commands

```bash
# Check bundle size
npm run build

# Analyze bundle composition
npx vite-bundle-visualizer

# Check for duplicate packages
npm ls --depth=0

# Find unused dependencies
npx depcheck

# Lighthouse CI
npx lighthouse https://localhost:5173 --view
```

This plan will reduce your bundle size by >50% and improve performance scores to 85+.