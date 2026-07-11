-- Personalized plan rebuild: per-module, keyed by profile state.
-- Previously one row held the whole 7-module plan; now personalization is
-- limited to the two compliance modules and generated lazily per module.
-- A row is a single module's plan for a specific (profile_id, module_id,
-- profile_hash). Auto-generation is idempotent on that key, so it can't loop;
-- the only monthly cap (entitlements.llmPlanRegensPerMonth) guards profile
-- thrash. Legacy whole-plan rows (module_id null) are simply never matched.

alter table public.journey_plans
  add column if not exists module_id text,
  add column if not exists profile_hash text;

create index if not exists journey_plans_module_lookup_idx
  on public.journey_plans (profile_id, module_id, profile_hash, generated_at desc);
