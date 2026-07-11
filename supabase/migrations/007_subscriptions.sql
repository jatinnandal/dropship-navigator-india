-- Plan gating (pricing strategy 2026-07): free Scout / Starter ₹49 / Growth ₹199.
-- Phase A billing: rows written manually or by payment-link webhook (service
-- role). Users may read their own row; no client writes.

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'starter', 'growth')),
  status text not null default 'active' check (status in ('active', 'past_due', 'cancelled')),
  source text not null default 'manual',
  razorpay_subscription_id text,
  current_period_end timestamptz,
  founding_member boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
  on public.subscriptions for select to authenticated
  using (auth.uid() = user_id);
