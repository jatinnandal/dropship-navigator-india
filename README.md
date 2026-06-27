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

## Setup (required)

1. Copy `.env.example` to `.env.local`.
2. Set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (use `http://localhost:3000` for local dev)
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only; enables email/password signup to work without confirmation emails)
3. Run SQL in `supabase/schema.sql` in the Supabase SQL editor (re-run after pulls that change schema).
4. Enable **Google** auth provider in Supabase (Authentication → Providers → Google) if using Google sign-in.
5. Add redirect URLs in Supabase (Authentication → URL configuration):
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`
6. **Email/password signup:** With `SUPABASE_SERVICE_ROLE_KEY` set, accounts are confirmed immediately and you go straight to onboarding. Without it, Supabase may require email confirmation (built-in mail is often slow or blocked).
7. Optional: disable **Confirm email** under Authentication → Providers → Email for simpler local dev.
8. Restart the dev server.

## Auth & access

- **Public:** `/` (landing), `/login`, `/signup`
- **Authenticated only:** `/app`, `/app/journey`, `/app/tasks/*`, `/onboarding`
- Sign in with **email/password** or **Google OAuth**
- New users complete onboarding once, then land on the dashboard
- Sign out returns you to the landing page

## App Routes

- `/` — marketing landing page
- `/login` — sign in
- `/signup` — create account
- `/onboarding` — profile quiz (first login)
- `/app` — dashboard with next-action hero
- `/app/journey` — personalized guided journey
- `/app/tasks/[taskId]` — module walkthroughs

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Supabase (auth + persistence)
- Framer Motion (landing page motion)
