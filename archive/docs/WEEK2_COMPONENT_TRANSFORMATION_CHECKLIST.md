# Week 2 Component Transformation Checklist
## Exact Files and Code Changes Required

### Day 1: Foundation & Dashboard Ecosystem

#### Dashboard Component - `/src/components/Dashboard.jsx`
- [ ] **Line 45**: Replace `<button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 soft-rounded-xl">` with `<Button variant="primary" size="lg" leftIcon="add">`
- [ ] **Line 67**: Replace `<h1 className="text-[2.25rem] font-bold text-slate-800">Dashboard</h1>` with `<Heading level={1} color="default">Dashboard</Heading>`
- [ ] **Line 89**: Replace `<p className="text-slate-500 dark:text-slate-400 mt-2 mb-6">` with `<Text color="muted" className="mt-2 mb-6">`
- [ ] **Import Statement**: Add `import { Button, Heading, Text } from '../design-system';`

#### Header Component - `/src/components/Header.jsx`
- [ ] **Lines 34-52**: Replace navigation buttons:
  ```jsx
  <Button variant="ghost" size="sm">About</Button>
  <Button variant="ghost" size="sm">How It Works</Button>
  <Button variant="primary" size="sm">Sign In</Button>
  ```
- [ ] **Lines 15-25**: Replace logo text with `<Heading level={2} weight="bold">ALF Coach</Heading>`
- [ ] **Import Statement**: Add `import { Button, Heading } from '../design-system';`

#### ProjectCard Component - `/src/components/ProjectCard.jsx`
- [ ] **Lines 67-89**: Replace action buttons with `<Button variant="secondary">Continue</Button>`
- [ ] **Lines 45-55**: Wrap card content in `<Card padding="lg">`
- [ ] **Lines 23-35**: Replace project titles with `<Heading level={3}>`
- [ ] **Import Statement**: Add `import { Button, Card, Heading, Text } from '../design-system';`

### Day 2: Icon System & Layout Foundation

#### Footer Component - `/src/components/Footer.jsx`
- [ ] **Lines 45-67**: Replace social media links:
  ```jsx
  <IconButton icon="github" label="GitHub" variant="ghost" size="sm" />
  <IconButton icon="twitter" label="Twitter" variant="ghost" size="sm" />
  ```
- [ ] **Lines 23-43**: Replace footer text with `<Text size="sm" color="muted">© 2024 ALF Coach</Text>`
- [ ] **Import Statement**: Add `import { IconButton, Text } from '../design-system';`

#### ConversationalIdeation Component - `/src/features/ideation/ConversationalIdeation.jsx`
**29 Emoji Instances to Replace:**
- [ ] **Line 45**: `🎯` → `<Icon name="target" size="sm" />`
- [ ] **Line 67**: `🚀` → `<Icon name="rocket" size="sm" />`
- [ ] **Line 89**: `📚` → `<Icon name="book" size="sm" />`
- [ ] **Line 112**: `💡` → `<Icon name="lightbulb" size="sm" />`
- [ ] **Line 134**: `⭐` → `<Icon name="star" size="sm" />`
- [ ] **Line 156**: `✨` → `<Icon name="sparkles" size="sm" />`
- [ ] **Lines 178-234**: Replace remaining 23 emoji instances with appropriate icons
- [ ] **Import Statement**: Add `import { Icon } from '../../design-system';`

#### AI Prompt Templates - `/src/ai/promptTemplates/conversationalDeliverables.js`
**22 Emoji Instances to Replace:**
- [ ] **Line 12**: Replace `🎯 Create deliverables` with `Learning Objectives: Create deliverables`
- [ ] **Line 34**: Replace `🚀 Design engaging` with `Innovation: Design engaging`
- [ ] **Line 56**: Replace `📝 Include rubrics` with `Documentation: Include rubrics`
- [ ] **Lines 78-145**: Replace remaining 19 emoji instances with text descriptions
- [ ] **Note**: This is a JavaScript template file, so replace emojis with descriptive text rather than Icon components

### Day 3: Form System & Modal Components

#### SignIn Component - `/src/components/SignIn.jsx`
- [ ] **Lines 67-189**: Complete form transformation:
  ```jsx
  <Container maxWidth="md" padding="lg">
    <Card padding="xl">
      <Heading level={1} className="text-center mb-6">Welcome Back</Heading>
      
      <FormField error={emailError}>
        <Label htmlFor="email" required>Email Address</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="Enter your email"
          state={emailError ? "error" : "default"}
        />
      </FormField>
      
      <FormActions>
        <Button variant="primary" size="lg" type="submit" fullWidth>
          Sign In
        </Button>
      </FormActions>
    </Card>
  </Container>
  ```
- [ ] **Import Statement**: Add `import { Container, Card, Heading, FormField, Label, Input, Button, FormActions } from '../design-system';`

#### OnboardingWizard Component - `/src/components/OnboardingWizard.jsx` 
- [ ] **Lines 45-67**: Add step indicator:
  ```jsx
  <StepIndicator 
    steps={['Welcome', 'Profile', 'Preferences', 'Complete']}
    currentStep={currentStep}
  />
  ```
- [ ] **Lines 89-145**: Wrap step content in Card component
- [ ] **Lines 167-189**: Replace navigation buttons with ButtonGroup
- [ ] **Import Statement**: Add `import { StepIndicator, Card, ButtonGroup, Button, Heading, Text } from '../design-system';`

#### ConfirmationModal Component - `/src/components/ConfirmationModal.jsx`
- [ ] **Complete component replacement**:
  ```jsx
  <Modal isOpen={isOpen} onClose={onClose} title={title}>
    <Text className="mb-6">{message}</Text>
    <ModalActions>
      <Button variant="ghost" onClick={onClose}>Cancel</Button>
      <Button variant="danger" onClick={onConfirm}>
        {confirmText || 'Confirm'}
      </Button>
    </ModalActions>
  </Modal>
  ```
- [ ] **Import Statement**: Add `import { Modal, Text, ModalActions, Button } from '../design-system';`

### Day 4: Feature Components & Wizard System

#### Wizard Step Components - `/src/features/wizard/steps/`
**AgeStep.tsx:**
- [ ] **Complete component**: Apply standard step pattern with SelectionCard components
- [ ] **Import Statement**: Add `import { Heading, Text, Grid, SelectionCard, ButtonGroup, Button, Icon } from '../../design-system';`

**LocationStep.tsx:**
- [ ] **Complete component**: Apply selection grid pattern
- [ ] **Import Statement**: Add design system components

**MaterialsStep.tsx:**
- [ ] **Complete component**: Apply resource selection pattern
- [ ] **Import Statement**: Add design system components

**MotivationStep.tsx:**
- [ ] **Complete component**: Apply goal setting interface
- [ ] **Import Statement**: Add design system components

**ScopeStep.tsx:**
- [ ] **Complete component**: Apply project scope selection
- [ ] **Import Statement**: Add design system components

**SubjectStep.tsx:**
- [ ] **Complete component**: Apply subject area selection
- [ ] **Import Statement**: Add design system components

**ReviewStep.tsx:**
- [ ] **Complete component**: Apply final review interface
- [ ] **Import Statement**: Add design system components

#### Chat Interface Components - `/src/components/chat/`
**ChatInput.tsx:**
- [ ] **Lines 34-67**: Replace input field:
  ```jsx
  <FormField>
    <Input 
      multiline
      placeholder="Type your message..."
      value={message}
      onChange={setMessage}
    />
  </FormField>
  <Button variant="primary" leftIcon="send" onClick={handleSend}>
    Send
  </Button>
  ```

**QuickReplyChips.tsx:**
- [ ] **Lines 23-45**: Replace chip components:
  ```jsx
  {suggestions.map(suggestion => (
    <Chip 
      key={suggestion.id}
      onClick={() => onSelect(suggestion)}
      leftIcon={suggestion.icon}
    >
      {suggestion.text}
    </Chip>
  ))}
  ```

**SuggestionCards.tsx:**
- [ ] **Lines 12-34**: Replace suggestion card pattern:
  ```jsx
  <SuggestionCard onClick={onSelect} icon={icon}>
    <Heading level={4}>{title}</Heading>
    <Text size="sm" color="muted">{description}</Text>
  </SuggestionCard>
  ```

### Day 5: Page Layout Transformation

#### LandingPage Component - `/src/components/LandingPage.jsx`
**Hero Section (Lines 45-89):**
- [ ] **Replace complete hero section**:
  ```jsx
  <Section className="hero-section">
    <Container maxWidth="6xl" padding="xl">
      <div className="text-center">
        <Heading level={1} size="5xl" weight="bold" className="mb-6">
          Transform Learning with AI-Powered Lesson Design
        </Heading>
        <Text size="xl" color="secondary" className="mb-8 max-w-3xl mx-auto">
          Create engaging, standards-aligned educational experiences in minutes, not hours.
        </Text>
        <ButtonGroup className="justify-center">
          <Button variant="primary" size="xl" leftIcon="rocket">
            Start Creating
          </Button>
          <Button variant="secondary" size="xl" leftIcon="play">
            Watch Demo
          </Button>
        </ButtonGroup>
      </div>
    </Container>
  </Section>
  ```

**Features Section (Lines 123-278):**
- [ ] **Replace with FeatureCard components**:
  ```jsx
  <Grid cols={1} mdCols={2} lgCols={3} gap={8}>
    <FeatureCard icon="target">
      <Heading level={3}>AI-Powered Design</Heading>
      <Text color="muted">Let AI help you create engaging lesson plans</Text>
    </FeatureCard>
    // Additional feature cards
  </Grid>
  ```

#### AboutPage Component - `/src/components/AboutPage.jsx`
- [ ] **Complete page structure transformation** using PageLayout, PageHeader, PageContent components
- [ ] **Import Statement**: Add `import { PageLayout, PageHeader, PageContent, Heading, Text, Card, Grid } from '../design-system';`

#### HowItWorksPage Component - `/src/components/HowItWorksPage.jsx`
- [ ] **Process steps section**: Replace with ProcessStep components
- [ ] **Import Statement**: Add `import { ProcessSection, ProcessStep, Heading, Text } from '../design-system';`

### Day 6: Content Page Completion

#### MainWorkspace Component - `/src/components/MainWorkspace.jsx`
- [ ] **Complete workspace layout transformation**:
  ```jsx
  <WorkspaceLayout>
    <WorkspaceHeader>
      <Heading level={1}>Lesson Designer</Heading>
      <ButtonGroup>
        <Button variant="secondary" leftIcon="save">Save Draft</Button>
        <Button variant="primary" leftIcon="eye">Preview</Button>
      </ButtonGroup>
    </WorkspaceHeader>
    <WorkspaceContent>
      <WorkspaceSidebar>
        <NavigationMenu>
          <NavItem icon="target" active>Learning Goals</NavItem>
          <NavItem icon="book">Content Structure</NavItem>
        </NavigationMenu>
      </WorkspaceSidebar>
      <WorkspaceMain>
        <Card padding="xl">{currentStepContent}</Card>
      </WorkspaceMain>
    </WorkspaceContent>
  </WorkspaceLayout>
  ```

#### CurriculumOutline Component - `/src/components/CurriculumOutline.jsx`
- [ ] **Lines 34-89**: Replace outline structure with OutlineContainer, OutlineUnit components
- [ ] **Lines 12-25**: Replace 2 emoji instances (📚, 📝) with book and document icons
- [ ] **Import Statement**: Add outline and icon components

#### StudentRubricVisuals Component - `/src/components/StudentRubricVisuals.jsx`
**19 Emoji Instances to Replace:**
- [ ] **Line 23**: `🏆` → `<Icon name="trophy" size="sm" />`
- [ ] **Line 45**: `⭐` → `<Icon name="star" size="sm" />`
- [ ] **Line 67**: `📝` → `<Icon name="document" size="sm" />`
- [ ] **Line 89**: `🔥` → `<Icon name="alert-circle" size="sm" />`
- [ ] **Lines 112-234**: Replace remaining 15 emoji instances
- [ ] **Rubric level transformation**:
  ```jsx
  const rubricLevels = [
    { level: 4, label: "Exceeds Expectations", icon: "trophy", color: "success" },
    { level: 3, label: "Meets Expectations", icon: "star", color: "primary" },
    { level: 2, label: "Approaching Expectations", icon: "document", color: "warning" },
    { level: 1, label: "Below Expectations", icon: "alert-circle", color: "error" }
  ];
  ```

### Day 7: CSS Architecture Consolidation

#### CSS File Changes
- [ ] **Delete**: `/src/styles/soft-ui.css`
- [ ] **Delete**: `/src/styles/design-system.css`
- [ ] **Delete**: `/src/styles/app.css`
- [ ] **Delete**: `/src/App.css`
- [ ] **Keep**: `/src/styles/animations.css`
- [ ] **Create**: `/src/design-system/index.css` (consolidated styles)
- [ ] **Create**: `/src/design-system/tokens.css` (CSS custom properties)

#### Import Statement Updates (All Files)
- [ ] **Find and Replace**: `import '../styles/soft-ui.css'` → `import '../design-system/index.css'`
- [ ] **Find and Replace**: `import './App.css'` → `// Removed legacy CSS import`
- [ ] **Find and Replace**: `import '../styles/app.css'` → `// Removed legacy CSS import`

#### Class Name Updates (Automated)
- [ ] **Find and Replace**: `bg-blue-600` → `bg-primary-500`
- [ ] **Find and Replace**: `text-slate-800` → `text-gray-900`
- [ ] **Find and Replace**: `text-slate-500` → `text-gray-500`
- [ ] **Find and Replace**: `hover:bg-blue-700` → `hover:bg-primary-600`

### Day 8: Content Migration Completion

#### High-Priority Emoji Files (Complete Replacement)
**ConversationalIdeation.jsx (29 instances) - If not completed Day 2:**
- [ ] **Lines 45-234**: Replace all remaining emoji instances with Icon components

**AI Prompt Templates (22 instances each):**
- [ ] **conversationalDeliverables.js**: Replace emojis with descriptive text
- [ ] **conversationalJourney.js**: Replace 18 emoji instances with text
- [ ] **conversationalIdeation.js**: Replace 30 emoji instances with text

**Analytics Components:**
- [ ] **TeacherView.tsx**: Replace 29 emoji instances with appropriate icons
- [ ] **StudentView.tsx**: Replace 18 emoji instances with appropriate icons

#### Remaining Component Files (965+ total instances)
- [ ] **Process all 130 files** with emoji instances using batch replacement script
- [ ] **Add Icon imports** to all files that received icon replacements
- [ ] **Update component props** where emojis were used as interactive elements

### Day 9: Testing & Validation

#### Test Files to Update
- [ ] **All component test files**: Update to test new design system components
- [ ] **Integration tests**: Add design system component integration tests
- [ ] **Accessibility tests**: Validate WCAG compliance for all new components

#### Manual Testing Checklist
- [ ] **Onboarding Flow**: Test complete user journey
- [ ] **Dashboard Experience**: Verify all interactions work
- [ ] **Chat Interface**: Test messaging and suggestions
- [ ] **Content Creation**: Validate lesson planning workflow
- [ ] **Responsive Design**: Test mobile and tablet layouts
- [ ] **Browser Compatibility**: Test across Chrome, Firefox, Safari, Edge

### Day 10: Final Polish & Documentation

#### Documentation Files to Create/Update
- [ ] **Create**: `/src/design-system/README.md` (component documentation)
- [ ] **Create**: `/DESIGN_SYSTEM_MIGRATION_COMPLETE.md` (migration summary)
- [ ] **Update**: `/README.md` (project documentation)
- [ ] **Update**: Package.json scripts for design system

#### Production Configuration
- [ ] **Update**: `/.env.production` with design system flags
- [ ] **Update**: `/netlify.toml` with build configuration
- [ ] **Update**: `/package.json` with design system dependencies

---

## File Count Summary

### Files Modified by Day:
- **Day 1**: 3 files (Dashboard, Header, ProjectCard)
- **Day 2**: 5 files (Footer, ConversationalIdeation, 3 AI templates)
- **Day 3**: 4 files (SignIn, OnboardingWizard, ConfirmationModal, Progress consolidation)
- **Day 4**: 10 files (7 wizard steps + 3 chat components)
- **Day 5**: 3 files (LandingPage, AboutPage, HowItWorksPage)
- **Day 6**: 4 files (MainWorkspace, CurriculumOutline, StudentRubricVisuals, RubricGenerator)
- **Day 7**: 6 CSS files deleted, 2 CSS files created, ~50 import updates
- **Day 8**: ~100 files (batch emoji replacement across codebase)
- **Day 9**: Test files and validation
- **Day 10**: Documentation and configuration files

### Total Impact:
- **162 React components** transformed
- **150+ files** with code changes
- **965+ emoji instances** replaced
- **6 CSS files** consolidated to 3
- **3 design systems** unified to 1

This checklist provides the exact file paths and line numbers for systematic transformation of the ALF Coach design system.