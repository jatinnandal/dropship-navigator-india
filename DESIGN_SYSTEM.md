# Dropship Navigator India Design System

This file locks the current visual direction so future pages and refactors stay consistent.

## Brand Direction

- Premium, product-grade UI (not template-like).
- Tone: confident, clear, execution-focused.
- Visual feel: dark enterprise base with warm amber + cool cyan highlights.
- Geometry: mostly `rounded-md` / `rounded-lg`; avoid overly soft rounded pills.
- Motion: subtle and useful only, always `prefers-reduced-motion` safe.

## Core Tokens and Utilities

Defined in `src/app/globals.css`.

- **Base tokens**
  - `--background`: deep navy
  - `--foreground`: near-white
  - `--muted`: desaturated slate for secondary text
  - `--card`: translucent dark panel
  - `--border`: soft blue-gray border
- **Layout + surfaces**
  - `app-shell-bg`: global ambient background
  - `glass-panel`: frosted panel surface (secondary elevation)
  - `glass-panel-primary`: hero / next-action panels — stronger bg, amber border accent
  - `glass-panel-tertiary`: sub-task rows, accordions — lighter bg/border
  - `surface-hover`: slight lift + border emphasis
  - `banner-deadline`: GST filing / hard deadline warnings — rose bg + border (never subtle)
- **Typography + hierarchy**
  - `headline-gradient`: key hero/section headline accent
  - `eyebrow`: small left-accent uppercase label
  - `text-muted`: secondary text color
- **Actions**
  - `btn-primary`: amber CTA
  - `btn-emerald`: cyan secondary primary-style action
  - `btn-ghost`: tertiary action
  - `nav-active`: active app navigation item
- **Data display**
  - `meta-tile`: compact structured metadata chip (rectangular)
  - `progress-track` + `progress-fill`: progress bars
- **Motion**
  - `ambient-orb`: decorative floating orb
  - `page-reveal`: subtle enter animation

## Components to Reuse

- `src/components/app-logo.tsx`
  - Use for brand header/logo block across public + app pages.
- `src/components/app-nav.tsx`
  - Use for authenticated top nav with active route highlighting.

## Page-Level Patterns

- Public routes (`/`, `/login`) use `app-shell-bg` and prominent hero hierarchy.
- App routes (`/app`, `/app/journey`, `/onboarding`) use:
  - a clear top header block
  - metric/progress block near top
  - action strip with primary + ghost buttons
- Journey tool references should use `meta-tile`, not rounded badge capsules.

## Explicit Do / Don't

- **Do**
  - Use SVG icons (`lucide-react`) with consistent sizing (`h-4 w-4`, `h-5 w-5`).
  - Keep hover effects to subtle lift/color only.
  - Keep text hierarchy tight: single clear `h1`, then section `h2`.
  - Prefer clean rows/tiles for metadata over decorative pills.
- **Don't**
  - Do not reintroduce generic capsule badges for hero labels/tool tags.
  - Do not use emoji as icons.
  - Do not add heavy animations, bounce, or parallax effects.
  - Do not switch to a random color palette per page.

## Accessibility Guardrails

- Maintain visible focus states for all interactive elements.
- Ensure text contrast stays readable on glass surfaces.
- Keep motion optional via `prefers-reduced-motion`.
- Do not rely on color alone to convey state.

## Change Management

When changing the visual system:

1. Update token/classes in `src/app/globals.css`.
2. Update this `DESIGN_SYSTEM.md` in the same PR/change.
3. Apply consistently to public and app pages (avoid one-off styles).
