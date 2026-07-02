-- Multi-profile seller workspaces migration
-- Run after initial schema.sql on existing databases.

-- 1. Seller profiles (many per user)
create table if not exists public.seller_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  experience_level text not null check (experience_level in ('beginner', 'existing_seller')),
  budget_band text not null check (budget_band in ('under_20k', '20k_1l', 'above_1l')),
  primary_channel text not null check (primary_channel in ('meesho', 'amazon', 'flipkart', 'shopify')),
  has_gstin boolean not null default false,
  operating_state text not null default 'Maharashtra',
  product_type text not null default 'general' check (product_type in ('general', 'food', 'beauty', 'electronics', 'fashion')),
  business_type text not null default 'proprietorship' check (business_type in ('individual', 'proprietorship', 'partnership', 'llp', 'private_limited')),
  sales_model text not null default 'marketplace_only' check (sales_model in ('marketplace_only', 'own_website_only', 'both')),
  imports_products boolean not null default false,
  sells_prepackaged_goods boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists seller_profiles_user_id_idx on public.seller_profiles(user_id);

alter table public.seller_profiles enable row level security;

drop policy if exists "seller_profiles_select_own" on public.seller_profiles;
drop policy if exists "seller_profiles_insert_own" on public.seller_profiles;
drop policy if exists "seller_profiles_update_own" on public.seller_profiles;
drop policy if exists "seller_profiles_delete_own" on public.seller_profiles;

create policy "seller_profiles_select_own"
  on public.seller_profiles for select to authenticated
  using (auth.uid() = user_id);

create policy "seller_profiles_insert_own"
  on public.seller_profiles for insert to authenticated
  with check (auth.uid() = user_id);

create policy "seller_profiles_update_own"
  on public.seller_profiles for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "seller_profiles_delete_own"
  on public.seller_profiles for delete to authenticated
  using (auth.uid() = user_id);

-- 2. Active profile preference per user
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active_profile_id uuid references public.seller_profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

drop policy if exists "user_preferences_select_own" on public.user_preferences;
drop policy if exists "user_preferences_insert_own" on public.user_preferences;
drop policy if exists "user_preferences_update_own" on public.user_preferences;

create policy "user_preferences_select_own"
  on public.user_preferences for select to authenticated
  using (auth.uid() = user_id);

create policy "user_preferences_insert_own"
  on public.user_preferences for insert to authenticated
  with check (auth.uid() = user_id);

create policy "user_preferences_update_own"
  on public.user_preferences for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 2b. Ensure legacy profiles table has extended columns (older DBs may only have base fields)
alter table public.profiles add column if not exists operating_state text not null default 'Maharashtra';
alter table public.profiles add column if not exists product_type text not null default 'general';
alter table public.profiles add column if not exists business_type text not null default 'proprietorship';
alter table public.profiles add column if not exists sales_model text not null default 'marketplace_only';
alter table public.profiles add column if not exists imports_products boolean not null default false;
alter table public.profiles add column if not exists sells_prepackaged_goods boolean not null default true;

-- 3. Migrate legacy profiles -> seller_profiles (idempotent)
insert into public.seller_profiles (
  user_id, name, experience_level, budget_band, primary_channel, has_gstin,
  operating_state, product_type, business_type, sales_model, imports_products, sells_prepackaged_goods,
  created_at, updated_at
)
select
  p.user_id,
  initcap(p.primary_channel) || ' · ' || initcap(replace(coalesce(p.product_type, 'general'), '_', ' ')),
  p.experience_level,
  p.budget_band,
  p.primary_channel,
  p.has_gstin,
  coalesce(p.operating_state, 'Maharashtra'),
  coalesce(p.product_type, 'general'),
  coalesce(p.business_type, 'proprietorship'),
  coalesce(p.sales_model, 'marketplace_only'),
  coalesce(p.imports_products, false),
  coalesce(p.sells_prepackaged_goods, true),
  p.created_at,
  p.updated_at
from public.profiles p
where not exists (
  select 1 from public.seller_profiles sp where sp.user_id = p.user_id
);

-- 4. Set active profile for migrated users
insert into public.user_preferences (user_id, active_profile_id, updated_at)
select p.user_id, sp.id, now()
from public.profiles p
join public.seller_profiles sp on sp.user_id = p.user_id
where not exists (
  select 1 from public.user_preferences up where up.user_id = p.user_id
)
on conflict (user_id) do nothing;

-- 5. journey_progress: add profile_id and migrate
alter table public.journey_progress add column if not exists profile_id uuid references public.seller_profiles(id) on delete cascade;

update public.journey_progress jp
set profile_id = sp.id
from public.seller_profiles sp
where jp.profile_id is null and jp.user_id = sp.user_id;

-- Drop old PK and user_id if profile_id is populated
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'journey_progress' and column_name = 'user_id'
  ) then
    alter table public.journey_progress drop constraint if exists journey_progress_pkey;
    alter table public.journey_progress drop column if exists user_id;
    alter table public.journey_progress alter column profile_id set not null;
    alter table public.journey_progress add primary key (profile_id, module_id);
  end if;
exception when others then
  null;
end $$;

-- 5b. Ensure workspace tables exist (older DBs may only have profiles + journey_progress)
create table if not exists public.user_workspace (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_task_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id text not null,
  completed jsonb not null default '[]'::jsonb,
  answers jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, task_id)
);

alter table public.user_workspace enable row level security;
alter table public.user_task_progress enable row level security;

drop policy if exists "user_workspace_select_own" on public.user_workspace;
drop policy if exists "user_workspace_insert_own" on public.user_workspace;
drop policy if exists "user_workspace_update_own" on public.user_workspace;
drop policy if exists "user_task_progress_select_own" on public.user_task_progress;
drop policy if exists "user_task_progress_insert_own" on public.user_task_progress;
drop policy if exists "user_task_progress_update_own" on public.user_task_progress;

create policy "user_workspace_select_own"
  on public.user_workspace for select to authenticated using (auth.uid() = user_id);
create policy "user_workspace_insert_own"
  on public.user_workspace for insert to authenticated with check (auth.uid() = user_id);
create policy "user_workspace_update_own"
  on public.user_workspace for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "user_task_progress_select_own"
  on public.user_task_progress for select to authenticated using (auth.uid() = user_id);
create policy "user_task_progress_insert_own"
  on public.user_task_progress for insert to authenticated with check (auth.uid() = user_id);
create policy "user_task_progress_update_own"
  on public.user_task_progress for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 6. user_workspace: migrate to profile_id PK
alter table public.user_workspace add column if not exists profile_id uuid references public.seller_profiles(id) on delete cascade;

update public.user_workspace uw
set profile_id = sp.id
from public.seller_profiles sp
where uw.profile_id is null and uw.user_id = sp.user_id;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'user_workspace' and column_name = 'user_id'
  ) then
    alter table public.user_workspace drop constraint if exists user_workspace_pkey;
    alter table public.user_workspace drop column if exists user_id;
    alter table public.user_workspace alter column profile_id set not null;
    alter table public.user_workspace add primary key (profile_id);
  end if;
exception when others then
  null;
end $$;

-- 7. user_task_progress: migrate to profile_id
alter table public.user_task_progress add column if not exists profile_id uuid references public.seller_profiles(id) on delete cascade;

update public.user_task_progress utp
set profile_id = sp.id
from public.seller_profiles sp
where utp.profile_id is null and utp.user_id = sp.user_id;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'user_task_progress' and column_name = 'user_id'
  ) then
    alter table public.user_task_progress drop constraint if exists user_task_progress_pkey;
    alter table public.user_task_progress drop column if exists user_id;
    alter table public.user_task_progress alter column profile_id set not null;
    alter table public.user_task_progress add primary key (profile_id, task_id);
  end if;
exception when others then
  null;
end $$;
