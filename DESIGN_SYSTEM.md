# Dropship Navigator India Design System — Mono Depth

This file locks the visual direction so future pages and refactors stay consistent.

## Brand Direction

- **Mono Depth**: black & white minimalist with real 3D depth.
- Depth from light, shadow, glow, layered transforms — not color.
- Color reserved strictly for **semantic meaning** (success, danger, active state).
- Tagline: "From first doubt to *first payout.*"

## Core Tokens

Defined in `src/app/globals.css`.

### Colors — monochrome base
| Token | Value | Use |
|---|---|---|
| `--background` | `#000000` | page background |
| `--card` | `#060606` | panels, sidebar |
| `--card-raised` | `gradient(#0c0c0c → #050505)` | hero cards, featured panels |
| `--chip-bg` | `#0a0a0a` – `#111111` | floating chips, icon tiles |
| `--foreground` | `#ffffff` | headings, key values |
| `--body-text` | `#b8b8b8` | body copy |
| `--muted` | `#8a8a8a` | secondary copy |
| `--text-faint` | `#6e6e6e` | mono labels, metadata |
| `--text-faintest` | `#5a5a5a` | tertiary metadata |
| `--border-default` | `rgba(255,255,255,0.1)` | panel borders |
| `--border-strong` | `rgba(255,255,255,0.16)` | featured panels |
| `--border-hover` | `rgba(255,255,255,0.28)` | hover states |

### Colors — semantic only (never decorative)
| Token | Value | Use |
|---|---|---|
| `--success` | `oklch(0.72 0.13 165)` | done states, checkmarks |
| `--danger` | `oklch(0.72 0.17 20)` | deadlines, RTO alerts, crisis |
| accent/active | pure white `#ffffff` with glow | CTAs, progress, "you are here" |

### Signature effects
- **Panel inner light:** `inset 0 1px 0 rgba(255,255,255,0.06)` on every panel.
- **White glow:** CTAs `0 8px 36px -8px rgba(255,255,255,0.45)`.
- **Deep drop:** `0 24px 60px -24px rgba(0,0,0,0.9)`.
- **Primary button:** white bg, black text, radius 12px, bottom bevel + glow; hover translateY(-2px).
- **Grid texture:** 1px `rgba(255,255,255,0.025)` lines every 38px, masked with radial fade.

## Typography

| Role | Font | Variable |
|---|---|---|
| UI / headings | **Instrument Sans** 400–700 | `--font-instrument-sans` |
| Serif accent | **Instrument Serif** *italic* 400 | `--font-instrument-serif` |
| Mono / data | **IBM Plex Mono** 400–500 | `--font-ibm-plex-mono` |

- Headings: weight 600–700, letter-spacing −0.02em to −0.04em (tighter as size grows).
- Serif italic: 1–3 words per headline max.
- Mono: numbers, metadata, uppercase labels (9.5–12px, letter-spacing 0.1–0.22em).

## Surface Classes

| Class | Use |
|---|---|
| `panel` | Standard card surface |
| `panel-raised` | Featured/hero cards with glow |
| `panel-chip` | Small floating chips |
| `glass-panel` | Legacy compat → maps to panel |
| `dashboard-hero` | Command deck / main action card |
| `spotlight-card` | Cursor-following radial highlight |
| `insight-tile` | Dashboard stat tiles with hover lift |

## Button Classes

| Class | Style |
|---|---|
| `btn-primary` | White bg, black text, glow, hover lift |
| `btn-ghost` | Outline, transparent, border brightens on hover |
| `btn-danger` | Danger-tinted bg + border |

## Motion Budget

**Allowed**
- Scroll reveals (`[data-reveal]` with IntersectionObserver)
- Tilt + spotlight on cards
- Magnetic CTA hover on landing
- Count-up on numeric stats
- `dashFlow` animated stroke on route SVGs
- `floatY` bob on floating chips
- `pulseGlow` on "current" dots
- Spring hover on tool cards
- Three.js particle field on landing only (lazy-loaded, `prefers-reduced-motion` safe)

**Not allowed**
- Bounce or layout-shifting parallax on text
- Multiple WebGL canvases on one page
- Infinite pulses on non-interactive elements
- Color-based decorative animations

Standard easing: `cubic-bezier(0.22, 1, 0.36, 1)`. All motion disabled under `prefers-reduced-motion`.

## Layout

- Marketing pages: `max-width: 76rem` + 40px gutters.
- App screens: 232px sidebar + main `padding: 26px 32px`, max-width 80rem.
- Card padding: 20–34px. Grid gaps: 12–20px.
- Radii: large panels 20–28px, cards 14–20px, buttons/inputs 9–13px, pills 999px.

## App Navigation

- **Desktop:** 232px fixed sidebar with rounded panel interior.
- **Mobile:** top bar + bottom nav.
- Nav items: Dashboard, Journey, Tools, Profiles, Resources.
- Active state: white text, bg rgba(255,255,255,0.07), border rgba(255,255,255,0.16).

## Assets

- Logo: inline SVG triangle glyph `<path d="M8 1 L14 14 L8 10.5 L2 14 Z">` in bordered tile.
- Icons: lucide-react (no emoji).
- Three.js for landing WebGL particle background.

## Do / Don't

**Do**
- Use lucide-react icons with consistent sizing.
- Keep hover to subtle lift / border brighten / spotlight.
- Use `.font-serif-accent` for 1–3 italic words in headlines.
- Keep mono labels uppercase with wide letter-spacing.
- Lazy-load Three.js (`dynamic(..., { ssr: false })`).

**Don't**
- Use color decoratively — only semantic.
- Use emoji as icons.
- Add bounce, parallax text, or unbounded animations.
- Use amber/cyan/emerald for decorative purposes.
- Create light-background sections (everything is black).
