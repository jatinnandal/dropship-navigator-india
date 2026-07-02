# Dropship Navigator India Design System

This file locks the current visual direction so future pages and refactors stay consistent.

## Brand Direction

- Premium, product-grade UI (not template-like).
- Tone: confident, clear, execution-focused.
- Visual feel: dark enterprise base with warm amber + cool cyan highlights.
- Geometry: mostly `rounded-md` / `rounded-lg`; avoid overly soft rounded pills.
- Motion: purposeful scroll reveals, ambient hero backgrounds, hover tilt/spotlight, and count-up — always `prefers-reduced-motion` safe.

## Core Tokens and Utilities

Defined in `src/app/globals.css`.

- **Base tokens**
  - `--background`: deep navy (`#050d1a`)
  - `--foreground`: near-white
  - `--muted`: desaturated slate for secondary text
  - `--card`: translucent dark panel
  - `--border`: soft blue-gray border
- **Motion tokens**
  - `--motion-duration-fast` / `--motion-duration-base` / `--motion-duration-slow`
  - `--motion-ease-out`: standard enter easing
- **Elevation**
  - `--shadow-1` / `--shadow-2` / `--shadow-3`
  - `--glow-amber` / `--glow-cyan`
- **Typography**
  - Body: Plus Jakarta Sans (`--font-plus-jakarta-sans`)
  - Display headlines: Space Grotesk (`--font-display`) via `.font-display` and `headline-gradient`
  - Mono: Fira Code (`--font-fira-code`)
- **Layout + surfaces**
  - `app-shell-bg`: global ambient background
  - `grain`: subtle noise overlay for depth
  - `scroll-atmosphere` / `scroll-atmosphere-grid`: fixed full-page ambient field (public pages)
  - `section-light` / `section-dark` / `full-bleed` / `section-inner`: alternating landing bands — light bands are opaque and create scroll contrast; dark bands let aurora show through
  - `display-xl` / `display-lg`: oversized marketing headlines (Space Grotesk)
  - `eyebrow-light` / `text-muted-light`: light-band label and secondary text
  - `cta-band`: full-bleed gradient CTA section on landing
  - `product-mockup`: shared faux dashboard card for hero, auth, and showcase
  - `auth-brand-panel`: left split panel on login/signup (desktop)
  - `header-scrolled`: sticky nav background when user scrolls
  - `--sidebar-width-expanded` / `--sidebar-width-collapsed`: app sidebar dimensions
  - `app-sidebar` / `app-main-with-sidebar`: collapsible left nav layout (authenticated app)
  - `dashboard-hero`: dominant next-action / crisis hero — amber border + shadow; only one per page
  - `glass-panel`: frosted panel surface (secondary elevation)
  - `glass-panel-primary`: marketing / welcome hero panels (includes elevation + amber glow)
  - `glass-panel-receded`: receded dashboard sections (progress, footer links)
  - `glass-panel-tertiary`: sub-task rows, accordions — lighter bg/border
  - `surface-hover`: subtle slate lift — never amber on non-critical tiles
  - `spotlight-card`: mouse-follow radial highlight on hover
  - `banner-deadline`: GST filing / hard deadline warnings — rose bg + border (never subtle)
  - `banner-at-risk`: preventive crisis warnings — amber bg + border (distinct from deadline)
  - `insight-tile` + `insight-tile-{info|safe|warn|neutral}`: dashboard insight cards with left accent
  - `bento-grid` + `bento-span-{4|6|8}`: asymmetric landing layouts
- **Typography + hierarchy**
  - `headline-gradient`: key hero/section headline accent (uses display font)
  - `eyebrow`: small left-accent uppercase label (amber — action/mentor)
  - `text-muted`: secondary text color
  - `text-mentor`: amber — mentor notes, time estimates
  - `text-info` / `link-info`: cyan — informational links and labels
  - `text-safe`: emerald — completed / healthy state
  - `text-danger`: rose — deadline / blocked state copy
- **Actions**
  - `btn-primary`: amber CTA
  - `btn-emerald`: cyan secondary primary-style action
  - `btn-ghost`: tertiary action
  - `nav-active`: active app navigation item
- **Data display**
  - `meta-tile`: compact structured metadata chip (rectangular)
  - `progress-track` + `progress-fill`: progress bars
- **Motion utilities**
  - `ambient-orb`: decorative floating orb
  - `ambient-hero-bg`: container for WebGL Aurora backgrounds (legacy per-card use)
  - `page-reveal` / `hero-reveal`: subtle enter animations

## Motion Budget

**Allowed**

- Scroll reveals via `Reveal` (`src/components/motion/reveal.tsx`) — supports `from="up" | "left" | "right"`; under reduced motion uses fade-only (no transforms)
- **One** `ScrollAtmosphere` per public page (fixed backdrop + scroll-reactive aurora/orbs/grid)
- Scroll parallax via `Parallax` (`src/components/motion/parallax.tsx`) — decorative layers only, not body copy
- Scroll-pinned storytelling via `PinnedSection` + `AppShowcase` on landing (Jeton-style step rail + mockup scenes)
- Smooth inertial scroll via `SmoothScroll` (lenis) on public pages — disabled under reduced motion
- Hover tilt + spotlight on feature cards (`TiltCard`, `spotlight-card`)
- Magnetic CTA hover on primary buttons (`MagneticButton`)
- Count-up on numeric stats (`CountUp` from React Bits)
- Shiny eyebrow text on landing hero (`ShinyText`)
- Logo marquee for marketplace credibility (`LogoLoop`)
- Step transitions in onboarding (`AnimatePresence`)
- Progress ring stroke animation + journey graph opacity reveals

**Not allowed**

- Bounce or layout-shifting parallax on paragraph text
- Multiple WebGL canvases on one page (use single `ScrollAtmosphere` instead)
- Infinite decorative pulses on non-interactive elements
- Random per-page color palettes

All motion must respect `prefers-reduced-motion` and use `useReducedMotion()` in client components.

## Approved React Bits Components

Installed via shadcn registry (`components.json` → `@react-bits`):

| Component | Use |
|-----------|-----|
| `Aurora` | Ambient backgrounds inside `ScrollAtmosphere` (lazy-loaded) |
| `CountUp` | Animated numeric stats (dashboard, onboarding, landing preview) |
| `LogoLoop` | Marketplace credibility marquee |
| `ShinyText` | Landing hero eyebrow highlight |

Do not add additional React Bits components without updating this table.

## Shared Motion Primitives

Reuse instead of ad-hoc `motion.div` blocks:

- `src/components/motion/reveal.tsx` — scroll enter
- `src/components/motion/scroll-atmosphere.tsx` — fixed scroll-reactive ambient field
- `src/components/motion/parallax.tsx` — depth layers tied to scroll
- `src/components/motion/pinned-section.tsx` — sticky scroll-pinned sections
- `src/components/motion/smooth-scroll.tsx` — lenis wrapper (public pages)
- `src/components/motion/tilt-card.tsx` — tilt + spotlight cards
- `src/components/motion/magnetic-button.tsx` — magnetic CTA links
- `src/components/motion/aurora-background.tsx` — legacy per-card aurora (prefer `ScrollAtmosphere`)

## App Navigation

- **Desktop:** collapsible left sidebar — `src/components/app-sidebar.tsx` via `AppShellClient`
- **Mobile:** top bar (`app-mobile-top-bar.tsx`) + bottom nav (`app-mobile-nav.tsx`)
- **Nav items:** centralized in `src/lib/app-nav-items.ts` — Dashboard, Journey, Setup (pre-profile), Resources
- Collapse state persisted in `localStorage` key `dni-sidebar-collapsed`

## Components to Reuse

- `src/components/app-logo.tsx`
  - Use for brand header/logo block across public + app pages.
- `src/lib/app-nav-items.ts`
  - Single source of truth for sidebar and mobile nav items.

## Page-Level Patterns

- Public landing (`/`) uses alternating `section-light` / `section-dark` full-bleed bands inside `LandingPageShell` (`ScrollAtmosphere` + `SmoothScroll`). Hero and showcase are dark; challenges and how-it-works are light; CTA uses `cta-band`.
- Auth routes (`/login`, `/signup`) use `AuthPageShell` split layout: brand panel + animated product mockup (desktop) / stacked form (mobile).
- App routes (`/app`, `/app/journey`, `/onboarding`, `/app/resources`) use **sidebar layout** (`AppShellClient`) — not top header nav.
- Journey tool references should use `meta-tile`, not rounded badge capsules.
- Journey graph nodes use `rounded-md` squares on mobile timeline; desktop graph uses circles.

## Explicit Do / Don't

- **Do**
  - Use SVG icons (`lucide-react`) with consistent sizing (`h-4 w-4`, `h-5 w-5`).
  - Keep hover effects to subtle lift/color/spotlight only.
  - Keep text hierarchy tight: single clear `h1`, then section `h2`.
  - Prefer clean rows/tiles for metadata over decorative pills.
  - Lazy-load WebGL (`dynamic(..., { ssr: false })`) for Aurora.
- **Don't**
  - Do not reintroduce generic capsule badges for hero labels/tool tags.
  - Do not use emoji as icons.
  - Do not add bounce, parallax text, or unbounded infinite animations.
  - Do not switch to a random color palette per page.
  - Do not use amber for decorative hovers, progress fills, or secondary tile borders — reserve amber for hero border, CTAs, eyebrows, and mentor copy.

## Accessibility Guardrails

- Maintain visible focus states for all interactive elements.
- Ensure text contrast stays readable on glass surfaces.
- Keep motion optional via `prefers-reduced-motion`.
- Do not rely on color alone to convey state.
- WebGL backgrounds are decorative (`aria-hidden`); never put essential content only in the canvas.

## Change Management

When changing the visual system:

1. Update token/classes in `src/app/globals.css`.
2. Update this `DESIGN_SYSTEM.md` in the same PR/change.
3. Apply consistently to public and app pages (avoid one-off styles).
