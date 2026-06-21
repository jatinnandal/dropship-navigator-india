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
