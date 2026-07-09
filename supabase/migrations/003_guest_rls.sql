-- Security: guest tables previously had RLS disabled, exposing all guest rows
-- (including GSTIN / legal names inside guest_workspace.data) to anyone holding
-- the public anon key via PostgREST.
--
-- Fix: enable RLS with NO policies (deny-by-default for anon/authenticated).
-- Application access goes through the server-only service-role client, which
-- bypasses RLS. See src/lib/guest-*.ts.
--
-- Some databases never had the later guest tables applied from schema.sql
-- (guest_workspace / guest_task_progress), so create them here first —
-- this migration is safe to run on any database state.

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

alter table public.guest_profiles enable row level security;
alter table public.guest_journey_progress enable row level security;
alter table public.guest_workspace enable row level security;
alter table public.guest_task_progress enable row level security;
