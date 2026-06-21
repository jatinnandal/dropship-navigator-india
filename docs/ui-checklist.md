# UI PR Checklist

Use this checklist before merging any UI-related change.

References:
- `DESIGN_SYSTEM.md`
- `src/app/globals.css`

## 1) Design System Compliance

- [ ] New UI follows `DESIGN_SYSTEM.md` conventions.
- [ ] Uses existing utilities (`glass-panel`, `btn-primary`, `btn-ghost`, `meta-tile`, etc.) before creating new styles.
- [ ] No generic capsule badges reintroduced for hero labels or tool tags.
- [ ] Visual language is consistent with current geometry (`rounded-md` / `rounded-lg` bias).
- [ ] Brand palette remains coherent (deep navy + amber + cyan accents).

## 2) Typography and Hierarchy

- [ ] One clear `h1` per page.
- [ ] Heading levels are sequential (`h1 -> h2 -> h3`) with no skips.
- [ ] Body copy uses muted text appropriately (`text-muted`) and remains readable.
- [ ] No random font-size jumps; follows existing rhythm.

## 3) Interaction and Motion

- [ ] All clickable controls have clear hover/focus states.
- [ ] `cursor-pointer` is present on interactive non-link elements.
- [ ] Motion is subtle (no heavy bounce/parallax).
- [ ] Motion-safe behavior is preserved under `prefers-reduced-motion`.

## 4) Navigation and App UX

- [ ] App header/logo/nav patterns use shared components (`app-logo`, `app-nav`) where applicable.
- [ ] Active nav state is clearly visible for current route.
- [ ] Primary action and secondary action hierarchy is obvious.

## 5) Accessibility

- [ ] Text contrast is sufficient on glass surfaces.
- [ ] Inputs have labels and meaningful placeholders.
- [ ] Color is not the only status indicator.
- [ ] Keyboard focus state is visible on links, buttons, and form fields.

## 6) Responsive and Layout Quality

- [ ] Verified at minimum widths: 375px, 768px, 1024px, 1440px.
- [ ] No horizontal scroll unless intentional.
- [ ] Spacing and alignment are consistent across breakpoints.
- [ ] Fixed/sticky elements do not hide content.

## 7) Regression and Build Checks

- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] Critical pages manually reviewed: `/`, `/login`, `/app`, `/onboarding`, `/app/journey`.

## 8) If New Styles Were Added

- [ ] Added styles are reusable (not one-off hacks).
- [ ] Updated `DESIGN_SYSTEM.md` to document new patterns/tokens.
- [ ] Legacy conflicting styles were cleaned up where safe.
