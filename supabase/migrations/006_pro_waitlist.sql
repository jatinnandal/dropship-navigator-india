-- Pro waitlist (Phase 3.7): captures intent from the pricing page instead of
-- a dead "coming soon" toast. Writes go through the server-side service-role
-- client only; RLS with no policies denies the public anon key entirely.

create table if not exists public.pro_waitlist (
  email text primary key,
  user_id uuid,
  source text not null default 'pricing',
  created_at timestamptz not null default now()
);

alter table public.pro_waitlist enable row level security;
