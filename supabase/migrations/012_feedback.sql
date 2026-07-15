-- In-app feedback (2026-07): a central widget on tools/modules writes here with
-- metadata about which component the feedback came from. Users insert their own
-- rows; nobody reads via the client - the founder reads in the Supabase table.

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  source text not null,          -- which component/module/tool the feedback is about
  rating text check (rating in ('up', 'down')),
  message text,
  page_path text,
  plan text,
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

-- Authenticated users may submit feedback tagged with their own id.
drop policy if exists "feedback_insert_own" on public.feedback;
create policy "feedback_insert_own"
  on public.feedback for insert to authenticated
  with check (auth.uid() = user_id);

-- No select policy on purpose: feedback is read by the founder via the Supabase
-- dashboard / service role, never exposed to other users through the client.

create index if not exists feedback_created_at_idx on public.feedback (created_at desc);
create index if not exists feedback_source_idx on public.feedback (source);
