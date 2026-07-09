-- Security: guest tables previously had RLS disabled, exposing all guest rows
-- (including GSTIN / legal names inside guest_workspace.data) to anyone holding
-- the public anon key via PostgREST.
--
-- Fix: enable RLS with NO policies (deny-by-default for anon/authenticated).
-- Application access goes through the server-only service-role client, which
-- bypasses RLS. See src/lib/guest-*.ts.

alter table public.guest_profiles enable row level security;
alter table public.guest_journey_progress enable row level security;
alter table public.guest_workspace enable row level security;
alter table public.guest_task_progress enable row level security;
