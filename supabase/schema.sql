create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  experience_level text not null check (experience_level in ('beginner', 'existing_seller')),
  budget_band text not null check (budget_band in ('under_20k', '20k_1l', 'above_1l')),
  primary_channel text not null check (primary_channel in ('meesho', 'amazon', 'flipkart', 'shopify')),
  has_gstin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.journey_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id text not null,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, module_id)
);

alter table public.profiles enable row level security;
alter table public.journey_progress enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "progress_select_own" on public.journey_progress;
drop policy if exists "progress_insert_own" on public.journey_progress;
drop policy if exists "progress_update_own" on public.journey_progress;

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "progress_select_own"
  on public.journey_progress
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "progress_insert_own"
  on public.journey_progress
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "progress_update_own"
  on public.journey_progress
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.guest_profiles (
  visitor_id text primary key,
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

create table if not exists public.guest_journey_progress (
  visitor_id text not null,
  module_id text not null,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (visitor_id, module_id)
);

alter table public.guest_profiles add column if not exists business_type text not null default 'proprietorship';
alter table public.guest_profiles add column if not exists sales_model text not null default 'marketplace_only';
alter table public.guest_profiles add column if not exists imports_products boolean not null default false;
alter table public.guest_profiles add column if not exists sells_prepackaged_goods boolean not null default true;

alter table public.guest_profiles disable row level security;
alter table public.guest_journey_progress disable row level security;

create table if not exists public.guest_workspace (
  visitor_id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.guest_task_progress (
  visitor_id text not null,
  task_id text not null,
  completed jsonb not null default '[]'::jsonb,
  answers jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (visitor_id, task_id)
);

alter table public.guest_workspace disable row level security;
alter table public.guest_task_progress disable row level security;

-- Authenticated user profile extensions (run after initial profiles table)
alter table public.profiles add column if not exists operating_state text not null default 'Maharashtra';
alter table public.profiles add column if not exists product_type text not null default 'general';
alter table public.profiles add column if not exists business_type text not null default 'proprietorship';
alter table public.profiles add column if not exists sales_model text not null default 'marketplace_only';
alter table public.profiles add column if not exists imports_products boolean not null default false;
alter table public.profiles add column if not exists sells_prepackaged_goods boolean not null default true;

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
