# UI/UX Redesign Plan: Dropship Navigator India

## Current State Audit

### Overarching Problems

The app has a coherent dark-mode design system on paper (DESIGN_SYSTEM.md is well-written), but the implementation has several systemic issues that produce a "generic AI SaaS template" feel:

1. **Monochromatic monotony.** The entire app is shades of neutral-800/900/950 with white text. The DESIGN_SYSTEM.md references amber and cyan accents, but `globals.css` has stripped them all to grayscale (`--glow-amber` is white, `text-mentor` is `#d4d4d4`, `text-info` is `#e5e5e5`, `text-safe` is `#fafafa`, `text-danger` is `#d4d4d4`). Every semantic color has been neutralized. The result: nothing draws the eye, nothing communicates urgency, and no surface hierarchy exists.

2. **Design system vs. MASTER.md conflict.** The `design-system/dropship-navigator-india/MASTER.md` specifies an indigo/emerald/light-background palette with Fira Sans body font, while the actual codebase uses a dark navy/monochrome palette with Plus Jakarta Sans. These two documents contradict each other. The MASTER.md is completely unused.

3. **Surface hierarchy is flat.** `glass-panel`, `glass-panel-primary`, `glass-panel-receded`, `glass-panel-tertiary`, `dashboard-hero` -- these are all nearly identical visually: dark gray backgrounds with barely-different border opacities (0.08 vs 0.12 vs 0.16 vs 0.20). In practice, you cannot distinguish a primary panel from a receded one.

4. **Every page looks the same.** Dashboard, journey, task runner, welcome, resources, profiles -- they all follow the exact same pattern: `max-w-6xl px-4 py-6` container with stacked `rounded-xl border border-neutral-800 bg-neutral-950 p-6` boxes. There is zero layout variety.

5. **No color coding for states.** Done/active/locked/at-risk all look nearly identical. The progress fill is a gray-to-white gradient. The warning banners (`banner-deadline`, `banner-at-risk`) have been stripped of their color identity (rose/amber) and are now just different shades of neutral.

6. **Missing visual reward.** The confetti function exists but there are no visible celebration states, no milestone animations, no visual differentiation when a module is completed vs. started.

---

### Page-by-Page Teardown

#### Landing Page (`/`)
**Structure:** Header > Hero > Challenges (light) > Solution (dark) > App Showcase (dark, pinned scroll) > How It Works (light) > CTA (white) > Footer

**Problems:**
- **Hero:** The two-column hero with `display-xl` text and a parallax `ProductMockupCard` is structurally sound but the monochrome palette makes it feel like a noir tech-bro template. The `eyebrow-mono` label "India-first seller co-pilot" is barely visible (neutral-400 on dark).
- **Challenges section:** Light-band cards with `border-neutral-200 bg-white shadow-sm` are the most generic possible card treatment. Six identical cards in a 3-column grid with icon + title + description is the #1 AI slop layout. Zero visual distinction between cards.
- **Solution section:** The bento grid with `TiltCard` and `Parallax` is the right idea but the `glass-panel-mono` cards all look the same. The bento-span system (8/4, 6/6) produces only mild variation.
- **App Showcase (pinned scroll):** This is the strongest section. The scroll-pinned storytelling with step tabs and mockup panel is genuinely engaging. But the mockup cards inside are plain neutral-900 boxes. The stat counter is disconnected from the visual flow.
- **How It Works:** Three identical cards with giant step numbers (01, 02, 03) is a cliche. The `text-neutral-200` color on the numbers wastes an opportunity for bold typographic contrast.
- **CTA:** Plain white band with black text is clean but unremarkable. No visual energy.
- **Footer:** Minimal but missing trust signals, social links, or any visual interest.
- **Header:** Functional but generic. The `MagneticButton` is a nice touch but the header design is unremarkable.

**AI Slop Patterns Found:**
- 6-card grid of pain points with icon + title + description
- 3-column "How it works" with numbered steps
- Generic hero with left text / right mockup split
- Identical card styling across all sections

#### Login & Signup (`/login`, `/signup`)
**Problems:**
- Both pages are structurally identical (they share `AuthPageShell` and `AuthForm`).
- The `auth-brand-panel` split layout is fine for desktop but the brand panel is just a dark rectangle. No product screenshot, no social proof, no credibility signals.
- The form itself is wrapped in the shell but there's no visual delight -- just inputs on dark background.
- No password strength indicator, no loading states visible, no micro-interactions on form fields.
- The `AuthSetupBanner` component exists but provides no visual warmth.

#### Onboarding (`/onboarding`)
**Problems:**
- The intro phase (`glass-panel-primary grain`) is a single centered card. It works but feels generic.
- The quiz phase uses a segmented progress bar (amber dots) -- this is one of the few places amber still appears in the actual rendering, but only because it's hardcoded in JSX (`bg-amber-400`) rather than using the CSS class system.
- The `AnimatePresence` slide transition is good but each question looks identical -- same layout, same radio buttons with amber accent, same spacing. Ten consecutive questions with no visual variety produces fatigue.
- The mentor tip sidebar (`lg:col-span-2`) is hidden on mobile entirely, losing valuable context.
- The `CountUp` for progress percentage is a nice touch.
- Radio button labels use amber border highlighting on selection -- this is actually one of the better interaction patterns in the app but it contradicts the monochrome CSS system.

#### Dashboard (`/app`)
**Problems:**
- **Hero section:** `dashboard-hero` with eyebrow "Do this now" + title + description + CTA. This is the single most important UI element in the app and it looks like every other panel. The amber border and shadow mentioned in DESIGN_SYSTEM.md have been stripped to neutral.
- **Progress section:** The `ProgressRing` SVG with CountUp is well-built technically but tiny (72px) and buried in a `glass-panel-receded` card. The gradient is gray-to-white.
- **Insight tiles:** 3-column grid of `DashboardInsightTile` components. The left-accent colors (`insight-tile-info`, `insight-tile-safe`, `insight-tile-warn`) are all shades of white/gray now, making them indistinguishable.
- **Banners:** `banner-deadline` and `banner-at-risk` have been neutered to near-identical neutral backgrounds.
- **Overall:** The dashboard is a vertical stack of identical-looking gray boxes. There is no visual hierarchy, no focal point, no sense of "you should do THIS next."
- **Crisis mode:** The `CrisisHero` uses `dashboard-hero` styling which should be visually distinct but isn't. Crisis mode should feel urgent -- it currently looks the same as normal mode.

#### Welcome (`/app/welcome`)
**Problems:**
- A `glass-panel-primary` card with eyebrow + headline + description + CTA, followed by three `glass-panel` cards and a checklist card. It's clean but unremarkable.
- The three module preview cards (Legal & GST, Product & Sourcing, Launch & grow) are tiny identical cards with no visual interest.
- The "What you'll answer" checklist uses `meta-tile` with dot bullets -- functional but flat.
- No illustrations, no product screenshots, no visual preview of what the app actually does.

#### Journey Map (`/app/journey`)
**Problems:**
- **Header:** Plain bordered card with title, profile summary, and progress bar. No visual identity.
- **SVG Graph (desktop):** The `JourneyGraphView` is a static SVG with circles connected by paths. Circles are 24px radius with numbers inside. This is the core visual metaphor of the app and it looks like a flowchart from a PowerPoint. No visual richness, no sense of progression, no spatial storytelling.
- **Mobile Timeline:** Vertical list with numbered circles and connecting lines. Functional but generic.
- **Module detail panel:** Below the graph, the selected module shows sub-tasks as `TaskToggle` checkboxes. Dense information but no visual breathing room.
- **Footer info card:** "Personalized for you" card with channel/product metadata is visually indistinguishable from every other card.

#### Module Detail (`/app/journey/[moduleId]`)
**Problems:**
- Glass panel header with eyebrow + headline + description + mentor line.
- Interactive guide CTA card with title and button.
- Accordion sections (`JourneyModuleAccordion`) using `ChevronDown` toggles -- functional but every section looks identical.
- The accordion content uses `surface-hover` cards for execution plans and personalization data -- these are tiny text-heavy cards with no visual markers.
- No visual preview of what the module contains before expanding.

#### Task Runner (`/app/tasks/[taskId]`)
**Problems:**
- This is the most complex page and it's a dense two-column layout (sidebar step list + main content area).
- **Step sidebar:** Numbered circles with check marks, identical to the journey timeline. `bg-neutral-800` for current, `text-muted` for others. No visual delight on completion.
- **Main content:** `MentorStepContent` renders chat-like bubbles with a "DN" avatar. The mentor avatar is a plain 36px circle with text -- no personality, no warmth.
- **Bubble styling:** All bubbles look the same regardless of tone (`default`, `trap`, `tip`). The "trap" bubble should feel dangerous but it's just a slightly different shade of neutral-950.
- **Interactive elements:** Simulator cards, calculator, question options are all embedded inline. The `surface-hover` question options use `border-white bg-neutral-900` for selected state -- functional but not celebratory.
- **Completion state:** The "You finished this walkthrough" screen is a white circle with a checkmark, centered text, and three buttons. No confetti visible (the function fires but the visual is unremarkable), no celebration animation, no sense of accomplishment.
- **Progressive reveal:** The "Continue (2/5)" pattern in `ProgressiveHow` is clever but each revealed step looks identical to the previous one.

#### Resources (`/app/resources`)
**Problems:**
- Header glass panel with eyebrow + headline.
- Category sections in `glass-panel-receded` with link cards using `spotlight-card insight-tile insight-tile-info`.
- Every resource link looks the same -- no favicon previews, no visual categorization, no hierarchy.

#### Profiles (`/app/profiles`)
**Problems:**
- Header with title + "Add launch plan" button.
- Profile cards in a 2-column grid with progress bars.
- Active profile has `border-neutral-200` (barely visible difference from `border-neutral-800` inactive).
- The "Active" badge is a tiny bordered pill -- easily missed.
- No visual identity per profile (no color coding, no avatar, no icon).

---

### Component-Level Issues

#### AppSidebar / AppShellClient
- The sidebar uses the collapsible pattern with `--sidebar-width-expanded` (15rem) / `--sidebar-width-collapsed` (4.5rem). This is fine structurally.
- The sidebar has no visual identity -- it's just a dark column with icon + label links.
- The mobile top bar + bottom nav combination works but the bottom nav is a plain row of icons with no active indicator beyond white text color.

#### ProgressRing
- Technically well-built with Framer Motion stroke animation.
- Gray-to-white gradient provides no emotional feedback. Green for progress, amber for in-progress would add meaning.
- At 72px default size, it's too small to be a visual anchor.

#### TaskToggle
- Checkbox + label + expandable "How to do this" section.
- The completed state is barely visually distinct (`border-white/25 bg-neutral-900` vs `border-neutral-800 bg-black`).
- No transition animation on completion, no satisfying visual feedback.

#### JargonText
- Underlined terms with tooltip -- this is a genuinely good UX pattern that should be celebrated more visually.

#### Aurora (WebGL)
- Well-implemented OGL shader with simplex noise. Used as ambient background in `ScrollAtmosphere`.
- The default color stops (`#5227FF`, `#7cff67`, `#5227FF`) are the only place in the app where bold color exists -- but it's in a decorative background layer that's barely visible behind the dark panels.

#### CrisisProtocol / CrisisHero
- These should feel urgent and visually distinct. Instead, they use the same neutral panel styling as everything else.
- The crisis step list is plain bordered cards -- no red/orange urgency signaling.

---

## Design Direction

### Proposed Visual Identity

**Concept: "Mentor's Workshop"**
A dark, confident interface that feels like a personal workspace guided by an expert -- not a generic dashboard. Premium materials (glass, grain, subtle metallics), purposeful color, spatial depth, and a sense of progress and accomplishment.

### Color Palette Recommendations

Restore semantic color with restraint. The current grayscale palette kills the UI's ability to communicate state.

| Role | Current | Proposed | Usage |
|------|---------|----------|-------|
| Background | `#0a0a0a` | `#050d1a` (original deep navy) | Base layer |
| Surface 1 | `#141414` | `#0c1829` | Primary cards |
| Surface 2 | `rgba(20,20,20,0.85)` | `rgba(12,24,41,0.85)` | Secondary glass |
| Amber accent | stripped to white | `#f59e0b` / `#fbbf24` | CTAs, eyebrows, mentor, active states |
| Cyan info | stripped to white | `#22d3ee` / `#67e8f9` | Informational links, data labels |
| Emerald success | stripped to white | `#34d399` / `#6ee7b7` | Completed, healthy states |
| Rose danger | stripped to white | `#fb7185` / `#fda4af` | Deadlines, blocked, crisis |
| Progress gradient | `#737373` to `#fafafa` | `#f59e0b` to `#34d399` | Progress fills (amber start to green complete) |
| Glow amber | white 8% | `rgba(245,158,11,0.15)` | Hero border glow, CTA hover |
| Glow cyan | white 6% | `rgba(34,211,238,0.12)` | Info panel accents |

### Typography System

Keep the current font trio -- it's well-chosen:
- **Display:** Space Grotesk (bold, geometric, modern)
- **Body:** Plus Jakarta Sans (warm, readable)
- **Mono:** Fira Code (data, templates)

**Improvements needed:**
- Increase display headline weight contrast. Current `display-xl` caps at `clamp(2.75rem, 7vw, 5.5rem)` which is correct, but the body text that follows is too close in visual weight.
- Add a `text-balance` utility for headlines to prevent orphaned words.
- Use font-feature-settings for Space Grotesk to enable stylistic alternates.
- Introduce `text-lg/relaxed` for hero paragraphs -- current `text-base leading-7` is slightly cramped.

### Motion Design Language

The DESIGN_SYSTEM.md motion budget is well-defined. Keep it, but add:

1. **State transitions:** When a task is marked done, the checkbox should animate with a satisfying stroke draw (not just a CSS `scale` pop). The card border should briefly pulse with emerald.
2. **Progress celebrations:** When a module is completed, the ProgressRing should burst with a radial particle effect. The confetti function should trigger visible confetti (currently fires but may not be visually connected).
3. **Milestone markers:** Journey graph nodes should transition from locked (dim, no shadow) -> available (normal, subtle pulse) -> in-progress (amber ring pulse) -> done (emerald fill, check icon) with smooth Framer Motion transitions.
4. **Scroll depth indicators:** Add a thin progress bar at the very top of app pages showing scroll depth through long content (task runner especially).
5. **Loading states:** Replace the plain "Loading..." fallback text with skeleton shimmer blocks.

### Component Design Patterns

**Surface hierarchy (make it real):**
- Level 0: Page background (`#050d1a` + subtle grid + Aurora)
- Level 1: `dashboard-hero` -- amber border glow, elevated shadow, distinct from everything
- Level 2: `glass-panel-primary` -- visible backdrop blur, medium border
- Level 3: `glass-panel` -- standard card
- Level 4: `glass-panel-receded` -- truly receded (dimmer, less contrast)
- Level 5: Inline elements (`meta-tile`, `TaskToggle` items)

Each level should have VISIBLY different backgrounds, borders, and shadows -- not 4% opacity differences.

---

## Page-by-Page Redesign Plan

### Landing Page (`/`)

**What's wrong now:**
- Generic 6-card grid for challenges
- Cookie-cutter hero layout
- Identical card styling across all sections
- No social proof beyond a logo marquee
- Light sections feel disconnected from dark sections

**What it should look like:**
- **Hero:** Replace the standard left-text/right-mockup split with a full-width cinematic hero. Large `display-xl` headline centered. Below it, an animated mockup of the actual app dashboard (not a fake product card). The scroll-cue at the bottom should feel like an invitation, not an afterthought. Add a "Trusted by X sellers" counter with `CountUp`.
- **Challenges:** Replace the 6-card grid with a 2-column asymmetric layout. Left column: large statement cards (2 items, stacked, with bold typographic numbers like "35%" and "3 weeks"). Right column: 4 smaller supporting cards. Use bento-grid for genuine asymmetry, not equal columns.
- **Solution:** The bento grid is correct in concept. Add visual illustrations or simple SVG diagrams inside each card instead of just icon + text. The `TiltCard` interaction should have a stronger spotlight effect.
- **App Showcase:** This section is good. Enhance the mockup panel with real app screenshots instead of hard-coded JSX panels. Add a subtle glow behind the active mockup.
- **How It Works:** Replace the 3-card grid with a vertical stepped timeline with a connecting line, each step revealing on scroll. Use large step numbers (01, 02, 03) as watermarks behind the content, not as decorative features above it.
- **CTA:** Add testimonial or stat above the CTA. "Join 200+ sellers" with profile avatars (even placeholders).
- **Footer:** Add a 3-column layout with product links, resource links, and legal/trust signals.

**Specific components to use:**
- `Reveal` from="up" with staggered delays for challenge cards
- `CountUp` for statistics (35% RTO rate, 3-week delays, 200+ sellers)
- `PinnedSection` for app showcase (already used, keep it)
- `TiltCard` with enhanced spotlight (increase glow intensity)
- `MagneticButton` for primary CTAs (already used, keep it)

### Login & Signup (`/login`, `/signup`)

**What's wrong now:**
- Empty brand panel
- No visual warmth
- No trust signals

**What it should look like:**
- **Brand panel (desktop):** Show a real app screenshot or animated mockup with a single testimonial quote overlaid. Add the marketplace logos from `MarketplaceLogoLoop` at the bottom.
- **Form side:** Add micro-animations on input focus (border color transition from neutral to amber). Add a password strength meter for signup. Show a subtle shimmer on the submit button to draw attention.
- **Mobile:** Stack with brand panel as a collapsed header showing just the logo and tagline.

### Onboarding (`/onboarding`)

**What's wrong now:**
- Ten identical questions produce visual fatigue
- Mentor tip hidden on mobile
- No sense of progression beyond the progress bar

**What it should look like:**
- **Progress:** Keep the segmented bar but add the current question's category label (e.g., "Business Setup" for questions 1-3, "Channel & Product" for 4-6, "Budget & Goals" for 7-10).
- **Question cards:** Vary the layout. Multiple-choice questions should use a 2x2 grid on desktop. Binary yes/no questions should use large toggle-style buttons. Text inputs should have a full-width treatment with floating label.
- **Mentor tip (mobile):** Show as a dismissible banner above the question instead of hiding entirely.
- **Transitions:** Use directional slide (left-to-right for forward, right-to-left for back) with slight scale. Already uses `AnimatePresence` -- enhance the exit/enter with Y offset.
- **Completion:** When the last question is answered, show a brief celebration animation before redirecting.

### Dashboard (`/app`)

**What's wrong now:**
- Hero blends into everything else
- Progress ring too small and monochrome
- Insight tiles indistinguishable
- No visual hierarchy

**What it should look like:**
- **Hero (next action):** This card should DOMINATE the page. Restore the amber border glow. Add a subtle gradient overlay at the top edge (amber fading into the card background). The "Do this now" eyebrow should use amber color. The estimated time should use a clock icon. The CTA button should have an amber gradient background.
- **Progress section:** Make the `ProgressRing` larger (120px) and use an amber-to-emerald gradient for the stroke. Place it prominently, not buried in a receded panel. Add percentage text large and bold below.
- **Insight tiles:** Restore the semantic left-accent colors: cyan for info, emerald for safe, amber for warnings, rose for danger. This is the single most impactful change for the dashboard.
- **Banners:** `banner-deadline` should have a rose background tint. `banner-at-risk` should have an amber background tint. These need to feel urgent.
- **Crisis hero:** When in crisis mode, the entire page header should have a red gradient overlay. The text should be larger. The eyebrow should say "CRISIS MODE" in rose.

### Journey Map (`/app/journey`)

**What's wrong now:**
- SVG graph looks like a flowchart
- Mobile timeline is generic
- Selected module panel lacks visual context

**What it should look like:**
- **SVG Graph (desktop):** Replace plain circles with styled nodes. Done nodes: emerald fill with a check icon. Active nodes: amber ring with a pulse animation. Locked nodes: dim with a lock icon overlay. Available nodes: neutral with subtle hover glow. Increase node size from 24px radius to 32px. Add curved connecting edges with arrow heads. The selected node should have a glowing ring effect.
- **Mobile Timeline:** Add colored dots matching node status. Done = emerald, active = amber, locked = gray. Add a progress bar alongside the vertical line that fills as modules are completed.
- **Module detail:** When a module is selected, show a card with the module's status as a colored badge at the top. Show sub-task completion as a mini progress bar inside each sub-task, not just a checkbox.
- **Progress header:** Move the progress bar to a sticky header that remains visible as you scroll through the module detail.

### Task Runner (`/app/tasks/[taskId]`)

**What's wrong now:**
- Mentor avatar has no personality
- All bubbles look the same
- No celebration on completion
- Dense content with no visual relief

**What it should look like:**
- **Mentor avatar:** Replace the plain "DN" circle with a styled avatar -- either a custom SVG icon (compass, lighthouse) or a gradient-filled circle with an icon. Give it personality.
- **Bubble differentiation:** "Tip" bubbles: cyan left-accent border + subtle cyan tint. "Trap" bubbles: rose left-accent border + subtle rose tint. "Default" bubbles: neutral. "Why this matters" bubbles: amber left-accent.
- **Step completion:** When marking a step done, animate the sidebar step number from outline to filled (stroke-draw animation). Flash a brief emerald glow on the completed step.
- **All-done state:** Full-screen celebration with confetti particles, a large animated checkmark (Lottie or SVG animation), and prominent CTAs. This is the payoff moment -- make it feel earned.
- **Simulator cards:** Add a colored border to simulator containers (cyan for interactive exercises) to visually separate them from content bubbles.
- **Progressive reveal:** Add a subtle slide-down animation when each new step is revealed.

### Resources (`/app/resources`)

**What's wrong now:**
- Every link card looks identical
- No visual categorization

**What it should look like:**
- Add category icons (or colored left accents per category).
- Show favicon/logo for each external link (can be placeholders initially).
- Add a "Recommended" badge for the most useful tools in each category.
- Use a wider card layout for the top recommendation in each category.

### Profiles (`/app/profiles`)

**What's wrong now:**
- Active profile barely distinguishable
- No visual identity per profile

**What it should look like:**
- Active profile card: amber border with glow effect, "Active" badge in amber.
- Each profile: assign a color from a small palette based on the channel (Meesho = purple, Amazon = orange, Flipkart = blue, Shopify = green).
- Show the channel logo/icon on each profile card.
- Progress bar should use the amber-to-emerald gradient.

---

## Premium UI Patterns to Implement

### 3D Card Tilts
Already implemented via `TiltCard` on landing. Extend to:
- Dashboard insight tiles (subtle, 2-3 degree max)
- Journey module detail card
- Profile cards

### Parallax
Already implemented via `Parallax` component. Extend to:
- Landing hero stat counters
- App showcase decorative elements

### Glassmorphism
Already in use but needs to be made VISIBLE:
- Increase blur from 14px to 20px on primary panels
- Add a visible white/amber border (not 12% opacity -- try 20-25%)
- Add subtle inner glow on `glass-panel-primary`

### Scroll Animations
- Add `Reveal` to dashboard sections (currently static)
- Add staggered reveals to journey graph nodes on first load
- Add reveal to profile cards on profiles page

### Skeleton Loading States
Replace all `Loading...` text fallbacks with skeleton blocks:
- Dashboard: skeleton for hero card + progress ring + insight grid
- Journey: skeleton for graph + module detail
- Task runner: skeleton for step content

### Celebration Moments
- Module completion: confetti + checkmark animation
- GSTIN saved: brief emerald flash + congratulatory toast
- First listing live: gold confetti burst
- All modules complete: full celebration screen with stats

### Progress Visualizations
- `ProgressRing`: Increase size, add amber-to-emerald gradient, add glowing trail
- Journey graph: Animate edges with a flowing particle effect (data flowing through the graph)
- Task runner sidebar: Step circles should fill with a smooth stroke-draw animation
- Dashboard: Add a "streak" counter for consecutive days active

---

## Anti-Slop Checklist

### Patterns Found and How to Fix Them

| # | AI Slop Pattern | Where | Fix |
|---|----------------|-------|-----|
| 1 | 6 identical cards in 3-col grid | Landing challenges | Asymmetric bento layout with varying card sizes and bold typographic stats |
| 2 | 3-column "How it works" steps | Landing how-it-works | Vertical timeline with scroll-triggered reveals and watermark numbers |
| 3 | Left-text / right-image hero | Landing hero | Full-width cinematic hero with centered text and embedded app mockup below |
| 4 | Every card same border-radius + padding + bg | Every page | Introduce 3 distinct card treatments with visible hierarchy |
| 5 | Monochrome color palette | Entire app | Restore amber/cyan/emerald/rose semantic colors |
| 6 | Gray progress bars | Dashboard, journey, profiles | Amber-to-emerald gradient fills |
| 7 | Plain round avatar with initials | Task runner mentor | Styled icon avatar with gradient or illustration |
| 8 | Undifferentiated chat bubbles | Task runner | Color-coded left accents by tone (tip=cyan, trap=rose, mentor=amber) |
| 9 | Generic "Done" checkmark | Task completion | Animated checkmark + confetti + celebration screen |
| 10 | Identical module cards in journey | Journey map | Status-colored nodes (emerald/amber/gray) with icons |
| 11 | Plain text loading states | Auth, suspense boundaries | Skeleton shimmer blocks |
| 12 | Cookie-cutter bordered panels | Dashboard, welcome, resources | Visible glass hierarchy with different blur/border/shadow levels |
| 13 | No illustrations anywhere | Every page | Add SVG illustrations for empty states, module icons, celebration |
| 14 | Identical light sections | Landing challenges + how-it-works | Vary light section treatment -- one with subtle warm tint, one with grid pattern |
| 15 | No social proof | Landing, auth | Add seller counter, testimonials, marketplace logos |
| 16 | Identical form inputs | Onboarding, task inputs | Floating labels, amber focus glow, input-type-specific sizing |
| 17 | No hover state differentiation | All cards and buttons | Restore amber hover glow on hero CTA, cyan on info links, emerald on success actions |

### Priority Order for Implementation

**Phase 1 -- Immediate visual impact (CSS-only, 1-2 days):**
1. Restore semantic colors in `globals.css` (amber, cyan, emerald, rose tokens)
2. Fix surface hierarchy (make glass-panel variants visibly different)
3. Restore progress gradient to amber-to-emerald
4. Restore banner colors (rose for deadline, amber for at-risk)
5. Fix insight tile left-accent colors

**Phase 2 -- Component upgrades (3-5 days):**
6. Enhance journey graph nodes with status colors and icons
7. Color-code mentor bubbles by tone
8. Upgrade mentor avatar
9. Add skeleton loading states
10. Enhance celebration/completion animations

**Phase 3 -- Layout redesign (5-8 days):**
11. Redesign landing challenges section (asymmetric bento)
12. Redesign landing how-it-works (vertical timeline)
13. Enhance dashboard hero with amber glow
14. Add profile card color coding
15. Redesign task runner completion state

**Phase 4 -- Polish and delight (3-5 days):**
16. Add illustrations/SVG graphics
17. Add social proof sections
18. Enhanced onboarding question variety
19. Scroll depth indicator
20. Interactive milestone celebrations
