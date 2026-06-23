# Dropship Navigator India

India-first guided co-pilot for beginner dropshippers and ecommerce sellers.

## Design Lock (Read First)

UI/UX direction is locked in:

- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)
- [docs/ui-checklist.md](docs/ui-checklist.md)

When creating or updating UI, follow that file to keep visual consistency.

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Current MVP Access Mode

1. Copy `.env.example` to `.env.local`.
2. Set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (use `http://localhost:3000` for local dev)
3. Run SQL in `supabase/schema.sql` using Supabase SQL editor.
4. Restart dev server.

Notes:
- Login/signup is intentionally disabled for now.
- The app runs in guest mode and persists onboarding + journey progress to Supabase using a visitor ID cookie.
- Browser cookies are still used as local fallback if Supabase is unavailable.
- You can open the product directly at `/app` and `/onboarding`.
- Re-run `supabase/schema.sql` after pull to create guest persistence tables.

## App Routes

- `/` - public landing
- `/login` - redirect to app (disabled)
- `/signup` - redirect to app (disabled)
- `/app` - guest dashboard
- `/onboarding` - onboarding profile (drives personalization)
- `/app/journey` - personalized guided journey

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Supabase (auth + persistence)
