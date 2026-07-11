-- LLM personalized journey plan (Tranche B): template-anchored generations.
-- One row per generation; the profile's "current" plan is the latest row.
-- Regeneration cap is enforced app-side by counting this-month rows.
-- Access mirrors user_settlement_uploads: rows belong to a seller profile;
-- RLS grants access only to the profile owner. Server uses the data client.

create table if not exists public.journey_plans (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.seller_profiles(id) on delete cascade,
  model text not null,
  plan jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now()
);

create index if not exists journey_plans_profile_idx
  on public.journey_plans (profile_id, generated_at desc);

alter table public.journey_plans enable row level security;

drop policy if exists "journey_plans_rw_own_profile" on public.journey_plans;
create policy "journey_plans_rw_own_profile"
  on public.journey_plans for all to authenticated
  using (exists (
    select 1 from public.seller_profiles sp
    where sp.id = journey_plans.profile_id and sp.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.seller_profiles sp
    where sp.id = journey_plans.profile_id and sp.user_id = auth.uid()
  ));
