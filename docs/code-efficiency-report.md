# Code Efficiency Audit Report

**Date:** 2026-06-30
**Scope:** Full src/ audit of Dropship Navigator India

---

## Summary

| Category | Count |
|---|---|
| Dead code | 4 |
| Reinvented stdlib | 2 |
| Unnecessary deps | 3 |
| Over-engineered | 5 |
| Duplicate logic | 8 |
| Wrong abstraction level | 4 |
| Perf | 3 |
| **Total** | **29** |

- **Estimated removable lines:** ~350-450
- **Bundle size savings:** ~80-120 KB (minified) from dep cleanup alone
- **Key wins:** Remove `motion` + `framer-motion` duplication (~60 KB), drop `ogl` + `lenis` if unused elsewhere (~40 KB), eliminate 4 layers of store indirection

---

## Critical Findings

### 1. UNNECESSARY DEPS: `framer-motion` AND `motion` are both installed

**Files:** `package.json`
**Category:** Unnecessary deps / bundle bloat

`framer-motion` (v12.40) and `motion` (v12.42) are both in dependencies. `motion` is the renamed successor of `framer-motion` -- they are the same library. 18 files import from `framer-motion`, 2 files import from `motion` (`ShinyText.tsx`, `CountUp.tsx`).

**Fix:** Pick one. Since 18 files already use `framer-motion`, either:
- Remove `motion` and rewrite `ShinyText.tsx` and `CountUp.tsx` to import from `framer-motion`, OR
- Migrate all 18 files to `motion` (the current name) and remove `framer-motion`.

Saves ~60 KB minified from shipping duplicate code.

### 2. UNNECESSARY DEPS: `ogl` is used in exactly one component

**File:** `src/components/Aurora.tsx`
**Category:** Unnecessary deps

`ogl` is a WebGL library (~30 KB min) used only in `Aurora.tsx` for a landing page background effect. The project already has `src/components/motion/aurora-background.tsx` which uses `framer-motion` for a similar aurora effect.

**Fix:** Delete `Aurora.tsx`, use the existing `aurora-background.tsx` motion component, and remove `ogl` from `package.json`. If `Aurora.tsx` is preferred, it still should not justify an entire WebGL library for one decorative component -- a CSS/canvas solution would suffice.

### 3. UNNECESSARY DEPS: `lenis` is used in one component

**File:** `src/components/motion/smooth-scroll.tsx`
**Category:** Unnecessary deps

`lenis` (~15 KB min) is a smooth scroll library used in a single wrapper component. CSS `scroll-behavior: smooth` or a 10-line custom hook with `requestAnimationFrame` replaces it. The project already uses `framer-motion` which has scroll utilities.

**Fix:** Replace with CSS `scroll-behavior: smooth` on `html` or a small custom hook. Remove `lenis` from `package.json`.

### 4. DUPLICATE LOGIC: `CrisisType`, `ActiveCrisis`, `CrisisLogEntry` defined in two places

**Files:** `src/lib/workspace.ts` (lines 8-20) and `src/lib/crisis/types.ts` (lines 1-36)
**Category:** Duplicate logic

Identical type definitions exist in both files. `workspace.ts` defines its own `CrisisType`, `ActiveCrisis`, and `CrisisLogEntry` instead of importing from `crisis/types.ts`.

**Fix:** Delete the types from `workspace.ts` and import from `@/lib/crisis/types`.

### 5. DUPLICATE LOGIC: `userHasProfile` is implemented three times

**Files:**
- `src/proxy.ts` lines 15-36 (middleware version)
- `src/lib/auth-routing.ts` lines 8-14 (`userHasProfile` + `userHasAnyProfile`)
- `src/lib/auth-routing.ts` lines 17-40 (`userHasProfileInDb`)

**Category:** Duplicate logic

Three separate implementations of "does this user have a profile". The middleware version in `proxy.ts` duplicates `userHasProfileInDb` from `auth-routing.ts` almost identically.

**Fix:** `proxy.ts` should import `userHasProfileInDb` from `auth-routing.ts`. `userHasProfile` and `userHasAnyProfile` in `auth-routing.ts` are identical one-line wrappers -- keep one, delete the other.

### 6. DUPLICATE LOGIC: `parseRow` is copy-pasted between user and guest task stores

**Files:** `src/lib/user-task-progress-store.ts` lines 11-23, `src/lib/guest-task-progress-store.ts` lines 10-22
**Category:** Duplicate logic

Identical `parseRow` function in both files parsing `{completed, answers}` into `TaskState`.

**Fix:** Extract to a shared `src/lib/tasks/parse-state.ts` or into `src/lib/tasks/types.ts` alongside the `TaskState` type.

---

## Medium Priority

### 7. OVER-ENGINEERED: Four-layer store indirection for every data operation

**Files:**
- `src/lib/progress-store.ts` (layer 4: "for current visitor" wrappers)
- `src/lib/profile-store.ts` (layer 3: user-id resolution)
- `src/lib/user-task-progress-store.ts` / `src/lib/user-workspace-store.ts` (layer 2: profile-id resolution)
- Supabase calls (layer 1)

Same for workspace:
- `src/lib/workspace-store.ts` -> `src/lib/user-workspace-store.ts` -> Supabase
- `src/lib/task-progress-store.ts` -> `src/lib/user-task-progress-store.ts` -> Supabase

**Category:** Over-engineered / wrong abstraction level

Each data access goes through 3-4 files. `progress-store.ts` is 8 functions that each call `getCurrentUserId()` then delegate to `profile-store.ts`. `workspace-store.ts` is 4 functions that call `getCurrentUserId()` then delegate to `user-workspace-store.ts`. `task-progress-store.ts` does the same for tasks.

**Fix:** Merge the "for current visitor" wrappers into their respective base stores. The `getCurrentUserId()` call can happen inside `profile-store.ts` / `user-workspace-store.ts` / `user-task-progress-store.ts` directly. This eliminates 3 files (~80 lines) that add no logic.

### 8. DUPLICATE LOGIC: Guest stores mirror user stores with visitor ID instead of user ID

**Files:**
- `src/lib/guest-supabase-store.ts` (mirrors `src/lib/profile-store.ts`)
- `src/lib/guest-workspace-store.ts` (mirrors `src/lib/user-workspace-store.ts`)
- `src/lib/guest-task-progress-store.ts` (mirrors `src/lib/user-task-progress-store.ts`)
- `src/lib/local-progress-store.ts` (cookie-based mirror of profile-store)
- `src/lib/local-workspace-store.ts` (cookie-based mirror of workspace-store)

**Category:** Duplicate logic

Five files that are near-identical copies of the authenticated stores but using `visitor_id` or cookies instead of `user_id`. Same CRUD pattern, same data shapes.

**Fix:** Create a generic store factory that accepts an identity resolver (`() => Promise<string>`) and table name prefix. The user stores use `getCurrentUserId`, guest stores use `getVisitorId`, eliminating ~200 lines of copy-paste.

### 9. OVER-ENGINEERED: `parseWorkspace` deserializes JSON that is already an object

**Files:** `src/lib/user-workspace-store.ts` line 24, `src/lib/guest-workspace-store.ts` line 23
**Category:** Reinvented stdlib

Both files do `parseWorkspace(JSON.stringify(data.data))` -- serializing an object to JSON string only to immediately parse it back. `parseWorkspace` accepts a string because it was originally for cookie storage. Supabase returns the JSONB column as an object already.

**Fix:** Add an overload `parseWorkspace(obj: Record<string, unknown>)` that accepts an object directly, or just use a type assertion / validation function that works on objects. Eliminate the `JSON.stringify` -> `JSON.parse` round trip.

### 10. DEAD CODE: `needsDomesticSupplier` is always `true`

**File:** `src/lib/profile-facts.ts` line 117
**Category:** Dead code

```typescript
needsDomesticSupplier: !profile.importsProducts || profile.importsProducts,
```

This evaluates to `!x || x` which is always `true`. No code reads this field.

**Fix:** Remove `needsDomesticSupplier` from `ProfileFacts` type and derivation.

### 11. DUPLICATE LOGIC: `CHANNEL_LABELS` defined in three files

**Files:**
- `src/lib/profile-name.ts` line 4
- `src/lib/dashboard-insights.ts` line 17
- `src/components/profit-calculator.tsx` (inlined)

**Category:** Duplicate logic

Same `Record<PrimaryChannel, string>` mapping copy-pasted.

**Fix:** Export from `src/lib/profile-name.ts` (which already has it) and import elsewhere.

### 12. OVER-ENGINEERED: `onboarding-steps.ts` validation duplicates `parse-onboarding-form.ts`

**Files:** `src/lib/onboarding-steps.ts` lines 221-244, `src/lib/parse-onboarding-form.ts`, `src/lib/local-progress-store.ts` lines 15-57
**Category:** Duplicate logic

Three separate implementations of "parse and validate onboarding profile fields from raw input". `local-progress-store.ts` has its own `parseProfile` with identical union-type validation, `parse-onboarding-form.ts` does the same from FormData, and `onboarding-steps.ts` defines `defaultValueForField` which mirrors the shape.

**Fix:** Create one `validateOnboardingField(field, value): OnboardingProfile[field]` function. Use it in all three places.

### 13. DEAD CODE: `requireUser` in `supauth.ts` duplicates `getCurrentUser` in `current-user.ts`

**Files:** `src/lib/supauth.ts`, `src/lib/current-user.ts`
**Category:** Duplicate logic / dead code

`requireUser()` does exactly what `getCurrentUser()` + redirect does. Both are used across the app.

**Fix:** Pick one. `getCurrentUserId()` in `current-user.ts` is the more complete version (returns ID string). Migrate callers of `requireUser()` to `getCurrentUser()` and delete `supauth.ts`.

### 14. PERF: `segmentJargon` runs O(n*m) regex per render

**File:** `src/lib/jargon.ts` lines 104-134
**Category:** Perf

`segmentJargon` iterates all 19 jargon terms with `new RegExp()` for every call. This runs on every text block that passes through `JargonText`. Creating regex objects is not free.

**Fix:** Pre-compile the regexes at module load time. Better: build one combined regex `\b(ROAS|RTO|NDR|COD|...)\b` with capture groups and split in one pass. This replaces O(n*m) with O(n).

### 15. OVER-ENGINEERED: `gst-task.ts` is a 5-line re-export file

**File:** `src/lib/gst-task.ts`
**Category:** Over-engineered

The entire file is:
```typescript
export { buildDocumentationTask, buildGstRegistrationTask } from "@/lib/tasks/documentation";
export type { Task, TaskQuestion, TaskQuestionOption, TaskState, TaskStep } from "@/lib/tasks/types";
```

**Fix:** Callers should import directly from `@/lib/tasks/documentation` and `@/lib/tasks/types`. Delete `gst-task.ts`.

---

## Low Priority / Nice to Have

### 16. DEAD CODE: `JOURNEY_EDGES` in `journey-graph.ts` appears unused

**File:** `src/lib/journey-graph.ts` lines 21-33
**Category:** Dead code (verify usage)

`JOURNEY_EDGES` defines graph edges but the journey graph rendering uses `getJourneyNodes()` which does not reference these edges. The `journey-graph-view.tsx` component may use them for SVG lines.

**Fix:** Verify if `JourneyEdge` type and `JOURNEY_EDGES` are consumed anywhere. If only used for a visual graph that was replaced by the accordion view, remove.

### 17. WRONG ABSTRACTION LEVEL: `step-details.ts` is a 745-line switch statement

**File:** `src/lib/step-details.ts`
**Category:** Wrong abstraction level

One giant `getStepDetail` function with a `switch` on `moduleId` returning deeply nested objects. Each case is 50-100 lines of hardcoded data that could be a data file.

**Fix:** Extract each case into a separate constant or file under `src/lib/tasks/details/`. This makes each module's detail editable without scrolling through 745 lines.

### 18. WRONG ABSTRACTION LEVEL: `subtask-guides.ts` is 430 lines of static data

**File:** `src/lib/subtask-guides.ts`
**Category:** Wrong abstraction level

Giant `SUBTASK_GUIDES` and `SUBTASK_TIME_ESTIMATES` dictionaries. Not a code problem per se, but mixing behavior functions (`personalizeSubTaskWhy`, `getSubTaskGuide`, `getUnlockWhy`, `countSubTasksStarted`) with 350+ lines of data constants makes the file hard to maintain.

**Fix:** Move the data dictionaries to a `src/lib/subtask-guide-data.ts` and keep only functions in `subtask-guides.ts`.

### 19. WRONG ABSTRACTION LEVEL: `journey-rules.ts` mixes rule data with MODULE_ORDER constant

**File:** `src/lib/journey-rules.ts` line 690
**Category:** Duplicate logic

`ALL_MODULE_IDS` is defined at the bottom of `journey-rules.ts` and also effectively duplicated as `MODULE_ORDER` in `next-action.ts` line 24.

**Fix:** Single source of truth. Export `ALL_MODULE_IDS` from one place and import in `next-action.ts`.

### 20. PERF: `buildJourneyPlan` is called redundantly

**Files:** Multiple -- `journey-graph.ts`, `journey-engine.ts`, pages
**Category:** Perf

`buildJourneyPlan(profile)` is called multiple times per page render (once in `getJourneyNodes`, once in `getSubTaskProgress`, once in `allSubTasksDone`). The plan is pure and deterministic given the same profile.

**Fix:** Compute once per request and pass the plan object down. The functions `getSubTaskProgress` and `allSubTasksDone` already have profile-based overloads that rebuild the plan internally -- callers should use the plan-based versions (`getSubTaskProgressForPlan`, `allSubTasksDoneForPlan`) directly.

### 21. OVER-ENGINEERED: `MODULE_SUB_TASKS` in `journey-graph.ts` is a legacy duplicate

**File:** `src/lib/journey-graph.ts` lines 58-95
**Category:** Dead code / legacy

The comment says "Legacy base catalog -- kept for milestone/crisis lookups". But the journey engine builds subtasks from `BASE_SUBTASK_RULES` and `ADDITIONAL_REQUIREMENT_RULES` in `journey-rules.ts`. `MODULE_SUB_TASKS` is only used as fallback in `getSubTaskProgress` and `allSubTasksDone` when no profile is passed.

**Fix:** Always require a profile (or plan) argument and remove the legacy fallback code path plus the `MODULE_SUB_TASKS` constant (~35 lines).

### 22. DEAD CODE: `isSimulatorDone` exported but used only internally

**File:** `src/lib/journey-graph.ts` line 103
**Category:** Dead code

`isSimulatorDone` is exported but only used within `journey-graph.ts` itself. Meanwhile, `journey-rules.ts` has its own local `simulatorDone` function (line 9) doing the exact same thing.

**Fix:** Remove the export from `journey-graph.ts`. If needed externally, import the one from `journey-rules.ts`.

### 23. REINVENTED STDLIB: `fillTemplate` in `mentor-templates.ts`

**File:** `src/lib/mentor-templates.ts` line 176
**Category:** Reinvented stdlib (minor)

Custom `{{var}}` template replacement. This is fine for 10 templates, but if the project grows, consider tagged template literals or a standard lib.

**Fix:** Low priority. Keep for now, but if templates grow beyond 15, consider a standard templating solution.

### 24. PERF: `findUserByEmail` paginates through all users

**File:** `src/lib/auth-admin.ts` lines 21-38
**Category:** Perf

`findUserByEmail` iterates pages of 200 users (up to 2000) to find a user by email. Supabase Admin API has no direct email lookup, but this is O(n) on user count.

**Fix:** Use Supabase's `auth.admin.getUserById` if you have the ID, or use a database query on `auth.users` table directly if RLS allows it. For a small app this is fine, but flag for when user count grows.

---

## Dependency Audit

| Package | Verdict | Notes |
|---|---|---|
| `next` 16.2.9 | **Keep** | Framework core |
| `react` 19.2.4 | **Keep** | Framework core |
| `react-dom` 19.2.4 | **Keep** | Framework core |
| `@supabase/ssr` | **Keep** | Auth + SSR integration |
| `@supabase/supabase-js` | **Keep** | Database client |
| `framer-motion` 12.40 | **Keep (rename)** | Used in 18 files. Remove `motion` package |
| `motion` 12.42 | **Remove** | Duplicate of `framer-motion`. Migrate 2 files |
| `lucide-react` | **Keep** | Icon library, widely used |
| `canvas-confetti` | **Keep** | Used in milestone celebration. Small (~4 KB). Justified |
| `ogl` 1.0.11 | **Remove** | WebGL library for one decorative component. ~30 KB. Replace with CSS/canvas or existing aurora component |
| `lenis` 1.3.25 | **Remove** | Smooth scroll library used once. ~15 KB. Replace with CSS `scroll-behavior: smooth` |
| `tailwindcss` 4 | **Keep** | Styling framework |
| `@tailwindcss/postcss` | **Keep** | Build tooling |
| `typescript` 5 | **Keep** | Dev tooling |
| `eslint` + `eslint-config-next` | **Keep** | Dev tooling |
| `@types/*` | **Keep** | Dev tooling |

**Savings from removals:** ~105 KB minified (ogl ~30 KB, lenis ~15 KB, motion duplicate ~60 KB)

---

## Architecture Simplification Opportunities

### 1. Flatten the store layer cake

Current: Page -> progress-store.ts -> profile-store.ts -> seller-profile-store.ts -> Supabase
Also: Page -> workspace-store.ts -> user-workspace-store.ts -> Supabase
Also: Page -> task-progress-store.ts -> user-task-progress-store.ts -> Supabase

**Proposed:** Merge "for current visitor" wrappers into their base stores. Delete:
- `src/lib/progress-store.ts` (merge into `profile-store.ts`)
- `src/lib/workspace-store.ts` (merge into `user-workspace-store.ts`)
- `src/lib/task-progress-store.ts` (merge into `user-task-progress-store.ts`)

### 2. Unify guest and user store patterns

Create a generic store that accepts identity type (user_id vs visitor_id) and table prefix. This eliminates:
- `src/lib/guest-supabase-store.ts`
- `src/lib/guest-workspace-store.ts`
- `src/lib/guest-task-progress-store.ts`
- `src/lib/local-progress-store.ts`
- `src/lib/local-workspace-store.ts`

Or at minimum, extract shared parsing logic.

### 3. Consolidate auth identity helpers

Three files do "get current user": `current-user.ts`, `supauth.ts`, and inline in pages. Consolidate into `current-user.ts` only.

### 4. Single source for onboarding field validation

`parse-onboarding-form.ts`, `local-progress-store.ts` parseProfile, and `onboarding-steps.ts` defaultValueForField all validate the same enum unions. One validator function, three call sites.

### 5. Pre-compute journey plan once per request

Stop calling `buildJourneyPlan(profile)` multiple times per render. Compute once, thread through.
