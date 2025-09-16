# ALF Coach Brand System

## Product Snapshot
- Purpose-built assistant that walks educators through the Active Learning Framework (Ideation → Journey → Deliverables)
- Conversational, guidance-first experience that blends AI support with educator expertise
- Must feel trustworthy, collaborative, and joyful without slipping into a purely "high-tech" aesthetic

## Brand Attributes
- **Grounded confidence** – reliable, academically credible, and data-informed
- **Warm guidance** – conversational, encouraging, and human-centered
- **Creative momentum** – sparks classroom-ready ideas and makes progress feel tangible

## Design Principles
- **Clarity first (Apple HIG)** – typography, spacing, and hierarchy favor focus; interface chrome is minimal and supports content
- **Deference with personality** – layout stays airy and content-led, while color accents communicate state and delight
- **Depth with purpose (HIG & Material)** – elevation, animation, and motion cues are used to reinforce relationships, not to decorate
- **Accessible defaults (Material)** – everything is built on an 8pt grid, touch targets are ≥ 44×44px, and contrast never drops below AA
- **Modular flexibility** – components scale from mobile to desktop with responsive typography and density presets

## Color System
Inspired by Clever.com's approachable cobalt base with human-centered accents. Keep palettes limited per screen to maintain focus.

### Primary Palette
- **Learning Blue** `#356DF3` – primary actions, key navigational elements, hero gradients (meets AA on light backgrounds)
- **Deep Indigo** `#1F3AA6` – pressed states, headlines, charts, and high contrast overlays
- **Sky Gleam** `#E6F0FF` – light wash backgrounds and empty states; use for surface layering instead of pure white when more depth is needed

### Secondary & Accent Colors
- **Meadow Green** `#29B682` – success, completion, and growth moments (use sparingly for highlights and badges)
- **Sunrise Apricot** `#FF8E5A` – warm CTA alternatives, onboarding nudges, or alerts requiring attention without urgency
- **Lilac Mist** `#C9B5FF` – creative exploration, ideation chips, and illustrations; always paired with Learning Blue or Deep Indigo text

### Neutral Foundation
- **Chalk White** `#FFFFFF` – default background for primary surfaces
- **Mist Gray** `#F6F6F7` – secondary surfaces, cards, and modals to reduce glare
- **Granite Gray** `#4B4F5C` – primary body text
- **Slate Ink** `#21242E` – headings and navigation
- **Soft Graphite** `#8D92A0` – secondary text, helper labels (never below AA)

### Semantic Colors
- **Success** `#1F9E6D`
- **Warning** `#F1A736`
- **Critical** `#DC4C3F`
- **Info** `#1A8CD8`
Each semantic tone has a 20% tint (`--color-*-tint`) for backgrounds and a tone-on-tone border (`--color-*-border`) that is one step darker.

### Elevation & Shadows
- Level 0: no shadow, `background: #FFFFFF`
- Level 1 (cards, sticky headers): `0 6px 20px rgba(31, 58, 166, 0.08)`
- Level 2 (modals, drawers): `0 16px 32px rgba(11, 20, 49, 0.12)`
- Level 3 (floating CTAs): add soft glow `0 0 0 1px rgba(53, 109, 243, 0.16)`

## Typography
### Font Stack
- **Primary UI**: `Urbanist` (weights 400, 500, 600, 700); modern geometric sans with friendly curves
- **Editorial Accent**: `Source Serif Pro` (weights 400, 600); used for callouts, testimonials, and long-form teaching stories
- **Fallbacks**: `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` for sans; `Georgia, "Times New Roman", serif` for accent

### Typographic Scale
- Display / H1: 44px (Urbanist 700, line-height 1.1)
- H2: 32px (Urbanist 600, line-height 1.2)
- H3: 24px (Urbanist 600, line-height 1.3)
- Body Large: 18px (Urbanist 500, line-height 1.55)
- Body Base: 16px (Urbanist 400, line-height 1.6)
- Body Small: 14px (Urbanist 400, line-height 1.5)
- Callout Serif: 20px (Source Serif Pro 600, line-height 1.5)
- Overline / Meta: 12px (Urbanist 600, letter-spacing 0.08em)

### Usage Guidance
- Restrict serif usage to ≤ 20% of any page; pair with generous whitespace and Learning Blue accents
- All-caps reserved for compact labels and tab headers
- Optical alignment: align numerals and icons on 4px increments for clarity

## Layout & Spacing
- Base grid: 8pt (Material); compose hero layouts on 12-column desktop, 6-column tablet, single-column mobile
- Max content width: 1120px (aligns with comfortable reading width per HIG)
- Standard gutters: 24px desktop, 20px tablet, 16px mobile
- Section rhythm: 64px vertical spacing between major sections, 32px between subsections
- Card padding: 24px desktop, 20px tablet, 16px mobile

## Components
### Navigation
- Top navigation height 72px desktop / 64px tablet / 56px mobile
- Primary CTA sits on the right with Learning Blue fill; secondary text links use Slate Ink with underline on hover/focus
- Collapse into a sheet menu using Material motion (menu slides from right, 240ms ease-out)

### Buttons
- Primary: Learning Blue background, Deep Indigo focus ring (`2px solid`), 14px label uppercase, icon optional on left
- Secondary: Ghost style with 1px Slate Ink border, hover background `rgba(53, 109, 243, 0.08)`
- Tertiary: Text-only with underline animation (scaleX from 0 to 1, 180ms)
- Destructive: Critical background + tinted hover; never pair with icons suggesting delight

### Cards & Surfaces
- Radius: 16px for standard cards, 20px for modals, 999px for pill treatments
- Use accent color bars (4px) on left edge for status differentiation (Blue=Active, Green=Completed, Apricot=Action Needed)
- Reserve elevated Level 2 for dialogs to maintain hierarchy

### Inputs & Forms
- Field height: 48px, 12px internal padding
- Focus: `outline: 2px solid rgba(53, 109, 243, 0.6);` with offset 2px; add subtle shadow `0 0 0 4px rgba(53, 109, 243, 0.12)`
- Helper text in Soft Graphite 14px; error text in Critical 600 weight

## Motion & Interaction
- Durations: 150ms for micro-interactions, 220ms for navigation transitions, 320ms for modal overlays
- Easing: use Material cubic-bezier `(0.2, 0, 0, 1)` for enter, `(0.4, 0, 1, 1)` for exit
- Movement direction: surface slides follow user intent (forward = left→right in LTR locales)
- Provide haptic & audio parity guidelines for mobile clients (where supported)

## Imagery & Illustration System
- **Signature 3D aesthetic**: Soft studio lighting, rounded geometric forms, clay/ceramic materiality, and subtle depth-of-field for natural focus falloff
- **Warm realism**: Characters carry realistic proportions with stylized facial features and expressive body language; prioritize authentic educator & learner interactions
- **Scene composition**: Contemporary educational environments with architectural details, tactile props, and floating 3D elements to emphasize key concepts
- **Color philosophy**: Warm neutral bases (cream, taupe, warm gray) with earth-tone primaries (terracotta, sage, ochre) and controlled brights (coral, teal, gold); avoid neon, metallic, cyberpunk, or high-gloss finishes
- **Innovation cues**: Introduce visionary or abstract elements (floating data ribbons, modular blocks, translucent panels) that remain grounded in educational contexts
- **Hero project prompts**: Maintain the 11 foundational prompts (Campus Sustainability Initiative through AI Accessibility Assistant) using the shared template — 3D rendered illustration, soft studio lighting, rounded geometric forms, stylized-yet-real characters, warm palette with bold accents, clay textures, subtle depth of field, modern educational environment, genuine human interactions, contemporary but approachable, architectural detail, `--ar 16:9 --v 6 --style raw --no flat, cartoon, hyper-realistic, futuristic, neon, cyberpunk`
- **Balanced elements**: Soft shadows, ambient occlusion, floating components, and tactile materials signal dimension without overwhelming the composition
- **Photography**: Supplement 3D renders with documentary-style photography of real classrooms when needed; match lighting warmth and avoid stylized filters
- **Icons**: Continue Lucide outline icons (2px stroke, 20px default, 24px navigation); reserve color accents for semantic cues to keep the UI cohesive
- **Emoji usage**: No decorative emoji inside the product UI; reserve for marketing storytelling if contextually appropriate

## Accessibility & Inclusion
- Maintain minimum contrast ratios: 4.5:1 for text < 24px, 3:1 for large text, 3:1 for icon-only controls
- Provide text alternatives for every illustration and ensure transcripts for any media
- Support reduced motion by disabling parallax and using opacity fades only
- Localize typography: allow dynamic type scaling up to 200% without breaking layout

## Voice & Tone
- Voice is professional, encouraging, and plain spoken
- Use second person (“you”) to keep feedback actionable
- Offer scaffolding language (“Try exploring…”, “Next you could…”) instead of commands
- Avoid jargon unless defined; spell out acronyms on first use

## Implementation Checklist
- [ ] Font files for Urbanist and Source Serif Pro preloaded with `font-display: swap`
- [ ] Global CSS variables reflect new color system and semantic tints
- [ ] Components adhere to spacing, radius, and focus specs
- [ ] Dark mode palette derived by applying Material tonal mapping (planned follow-up)
- [ ] Content design reviewed for voice & accessibility alignment

## Next Steps
1. Update design tokens (`src/design-system/tokens.ts` and CSS variables) to new color values and typography weights
2. Refresh marketing/demo screens to use Learning Blue + Apricot accent pairing
3. Audit existing assets to replace outdated Inter references and emoji restrictions with the refined tone guidance
