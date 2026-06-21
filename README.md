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

## Auth + Data Setup (Supabase)

1. Copy `.env.example` to `.env.local`.
2. Set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Run SQL in `supabase/schema.sql` using Supabase SQL editor.
4. Restart dev server.

## App Routes

- `/` - public landing
- `/login` - magic link sign-in
- `/app` - authenticated dashboard
- `/onboarding` - account onboarding profile
- `/app/journey` - personalized guided journey

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Supabase (auth + persistence)
