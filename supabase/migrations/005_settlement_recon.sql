-- Payout reconciliation (Phase 3.1): settlement CSV uploads + per-order rows.
-- Access pattern mirrors user_workspace: rows belong to a seller profile;
-- RLS grants access only to the profile owner. Server uses the data client.
-- Retention intent: 12 months (enforced app-side for now; a scheduled purge
-- can come later).

create table if not exists public.user_settlement_uploads (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.seller_profiles(id) on delete cascade,
  channel text not null check (channel in ('amazon', 'flipkart', 'meesho')),
  category text not null default 'general',
  filename text,
  adapter_version text not null,
  row_count integer not null default 0,
  matched_count integer not null default 0,
  summary jsonb not null default '{}'::jsonb,
  uploaded_at timestamptz not null default now()
);

create table if not exists public.user_settlement_rows (
  upload_id uuid not null references public.user_settlement_uploads(id) on delete cascade,
  order_ref text not null,
  order_date date,
  sale_amount numeric not null default 0,
  settled_amount numeric not null default 0,
  status text,
  is_return boolean not null default false,
  expected_fees numeric not null default 0,
  actual_deduction numeric not null default 0,
  delta numeric not null default 0,
  flagged boolean not null default false,
  primary key (upload_id, order_ref)
);

create index if not exists user_settlement_uploads_profile_idx
  on public.user_settlement_uploads (profile_id, uploaded_at desc);

alter table public.user_settlement_uploads enable row level security;
alter table public.user_settlement_rows enable row level security;

drop policy if exists "settlement_uploads_rw_own_profile" on public.user_settlement_uploads;
create policy "settlement_uploads_rw_own_profile"
  on public.user_settlement_uploads for all to authenticated
  using (exists (
    select 1 from public.seller_profiles sp
    where sp.id = user_settlement_uploads.profile_id and sp.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.seller_profiles sp
    where sp.id = user_settlement_uploads.profile_id and sp.user_id = auth.uid()
  ));

drop policy if exists "settlement_rows_rw_own_profile" on public.user_settlement_rows;
create policy "settlement_rows_rw_own_profile"
  on public.user_settlement_rows for all to authenticated
  using (exists (
    select 1 from public.user_settlement_uploads u
    join public.seller_profiles sp on sp.id = u.profile_id
    where u.id = user_settlement_rows.upload_id and sp.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.user_settlement_uploads u
    join public.seller_profiles sp on sp.id = u.profile_id
    where u.id = user_settlement_rows.upload_id and sp.user_id = auth.uid()
  ));
