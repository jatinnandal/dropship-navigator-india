-- Completes what migration 002 intended for user_workspace / user_task_progress.
--
-- 002 wrapped the user_id -> profile_id key swap in `exception when others then
-- null`. Dropping the user_id column fails while the RLS policies reference it,
-- so on most databases the block silently did nothing. Result: tables kept a
-- user_id primary key, app writes fell back to user_id rows with profile_id
-- NULL, and profile_id reads found nothing — all workspace/task persistence
-- for authenticated users was silently lost.
--
-- This migration does the swap in the correct order and does NOT swallow
-- errors. Run it once in the Supabase SQL editor. It is a no-op on databases
-- where the swap already completed.

-- ── user_workspace ──────────────────────────────────────────────────────────
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'user_workspace' and column_name = 'user_id'
  ) then
    -- 1. Old policies reference user_id and block the column drop.
    drop policy if exists "user_workspace_select_own" on public.user_workspace;
    drop policy if exists "user_workspace_insert_own" on public.user_workspace;
    drop policy if exists "user_workspace_update_own" on public.user_workspace;

    -- 2. Backfill profile_id: active profile first, then newest profile.
    update public.user_workspace uw
    set profile_id = up.active_profile_id
    from public.user_preferences up
    where uw.profile_id is null and up.user_id = uw.user_id and up.active_profile_id is not null;

    update public.user_workspace uw
    set profile_id = sp.id
    from lateral (
      select id from public.seller_profiles sp
      where sp.user_id = uw.user_id
      order by sp.created_at desc
      limit 1
    ) sp
    where uw.profile_id is null;

    -- 3. Rows for users with no seller profile can't be linked; drop them.
    delete from public.user_workspace where profile_id is null;

    -- 4. Key swap.
    alter table public.user_workspace drop constraint if exists user_workspace_pkey;
    alter table public.user_workspace drop column user_id;
    alter table public.user_workspace alter column profile_id set not null;
    alter table public.user_workspace add primary key (profile_id);
  end if;
end $$;

-- ── user_task_progress ──────────────────────────────────────────────────────
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'user_task_progress' and column_name = 'user_id'
  ) then
    drop policy if exists "user_task_progress_select_own" on public.user_task_progress;
    drop policy if exists "user_task_progress_insert_own" on public.user_task_progress;
    drop policy if exists "user_task_progress_update_own" on public.user_task_progress;

    update public.user_task_progress utp
    set profile_id = up.active_profile_id
    from public.user_preferences up
    where utp.profile_id is null and up.user_id = utp.user_id and up.active_profile_id is not null;

    update public.user_task_progress utp
    set profile_id = sp.id
    from lateral (
      select id from public.seller_profiles sp
      where sp.user_id = utp.user_id
      order by sp.created_at desc
      limit 1
    ) sp
    where utp.profile_id is null;

    delete from public.user_task_progress where profile_id is null;

    alter table public.user_task_progress drop constraint if exists user_task_progress_pkey;
    alter table public.user_task_progress drop column user_id;
    alter table public.user_task_progress alter column profile_id set not null;
    alter table public.user_task_progress add primary key (profile_id, task_id);
  end if;
end $$;

-- ── Policies for the profile_id-keyed shape (idempotent) ────────────────────
drop policy if exists "user_workspace_rw_own_profile" on public.user_workspace;
create policy "user_workspace_rw_own_profile"
  on public.user_workspace for all to authenticated
  using (exists (
    select 1 from public.seller_profiles sp
    where sp.id = user_workspace.profile_id and sp.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.seller_profiles sp
    where sp.id = user_workspace.profile_id and sp.user_id = auth.uid()
  ));

drop policy if exists "user_task_progress_rw_own_profile" on public.user_task_progress;
create policy "user_task_progress_rw_own_profile"
  on public.user_task_progress for all to authenticated
  using (exists (
    select 1 from public.seller_profiles sp
    where sp.id = user_task_progress.profile_id and sp.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.seller_profiles sp
    where sp.id = user_task_progress.profile_id and sp.user_id = auth.uid()
  ));
