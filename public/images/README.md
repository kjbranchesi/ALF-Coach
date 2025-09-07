# ALF Coach - Image Assets Organization

This directory contains all visual assets for the ALF Coach platform, organized for easy maintenance and scalability.

## Directory Structure

### 📸 `/hero-projects/`
Contains high-quality images for featured "hero" projects that showcase platform capabilities.

#### `/hero-projects/sustainability-campaign/`
Images for the featured sustainability campaign project:
- `hero-banner.jpg` - Main project header image
- `campus-audit-data.png` - Environmental data visualization
- `community-presentation.jpg` - Students presenting to stakeholders
- `policy-document.png` - Sample policy brief screenshot
- `team-collaboration.jpg` - Students working together
- `before-after-campus.jpg` - Visual impact comparison
- `infographic-results.png` - Project impact infographic

#### `/hero-projects/future-projects/`
Reserved for additional hero projects as they are developed.

### 🎨 `/sample-projects/`
Images for other sample projects on the platform:
- Organized by project ID or name
- Contains thumbnails and content images

### 🎯 `/ui-assets/`
Platform interface elements and visual components.

#### `/ui-assets/icons/`
- Custom icons for subjects, activities, milestones
- Navigation and interface icons
- Achievement badges and status indicators

#### `/ui-assets/backgrounds/`
- Gradient patterns and textures
- Section backgrounds
- Hero banners and headers

#### `/ui-assets/illustrations/`
- Educational concept illustrations
- Process diagrams and workflows
- Decorative elements

### 📚 `/project-resources/`
Subject-specific images and educational content.

#### Subject Directories:
- `/science/` - Lab equipment, nature, experiments, data visualizations
- `/math/` - Graphs, statistical charts, geometric concepts
- `/social-studies/` - Historical images, civic engagement, cultural content
- `/language-arts/` - Writing samples, literature, communication
- `/arts/` - Creative works, design elements, artistic processes
- `/technology/` - Digital tools, coding concepts, innovation

## Image Guidelines

### File Naming Convention
- Use descriptive, kebab-case names: `student-presentation-city-hall.jpg`
- Include project reference where applicable: `sustainability-data-visualization.png`
- Version control: `hero-banner-v2.jpg`

### Technical Specifications
- **Hero images**: 1920x1080px minimum, high quality JPG/PNG
- **Thumbnails**: 400x300px, optimized for web
- **Icons**: SVG format preferred, PNG fallback at 64x64px minimum
- **File size**: Optimize for web without sacrificing quality
- **Formats**: JPG for photos, PNG for graphics with transparency, SVG for icons

### Content Guidelines
- Use diverse, inclusive imagery
- Focus on authentic learning moments
- Show real student work and engagement
- Avoid stock photo appearance
- Ensure proper licensing and permissions

## Usage in Code

Images can be referenced in React components using:
```jsx
// For hero project images
import heroImage from '/images/hero-projects/sustainability-campaign/hero-banner.jpg';

// For UI assets
<img src="/images/ui-assets/icons/science-icon.svg" alt="Science" />

// For project resources
<img src="/images/project-resources/science/lab-equipment.jpg" alt="Lab setup" />
```

## Placeholder System

Currently, this structure contains empty directories. As images are created:
1. Add actual image files to appropriate directories
2. Update this README with specific file descriptions
3. Reference new images in component code
4. Test loading and optimization

This organized structure ensures scalable image management as the platform grows and more hero projects are developed.