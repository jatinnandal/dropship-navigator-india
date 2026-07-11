-- Material profile-change log: one row per edit that changes a personalization-
-- relevant field (state, entity, GST, product category, sales model, import/
-- pre-packaged). Counted per calendar month to enforce the per-plan cap that
-- stops cycling one profile through many configs. RLS scoped to the owner.

create table if not exists public.profile_material_changes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.seller_profiles(id) on delete cascade,
  changed_at timestamptz not null default now()
);

create index if not exists profile_material_changes_idx
  on public.profile_material_changes (profile_id, changed_at desc);

alter table public.profile_material_changes enable row level security;

drop policy if exists "material_changes_rw_own_profile" on public.profile_material_changes;
create policy "material_changes_rw_own_profile"
  on public.profile_material_changes for all to authenticated
  using (exists (
    select 1 from public.seller_profiles sp
    where sp.id = profile_material_changes.profile_id and sp.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.seller_profiles sp
    where sp.id = profile_material_changes.profile_id and sp.user_id = auth.uid()
  ));
