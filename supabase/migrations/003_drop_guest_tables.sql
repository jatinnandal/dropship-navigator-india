-- Guest mode removed (2026-07-09 decision): the product requires authentication;
-- local development uses DEV_AUTH_BYPASS_USER_ID instead (see .env.example).
--
-- This migration drops the guest tables. Earlier revisions of this file
-- enabled RLS on them instead — dropping supersedes that (a table that does
-- not exist cannot leak). Safe to run on any database state.

drop table if exists public.guest_task_progress;
drop table if exists public.guest_workspace;
drop table if exists public.guest_journey_progress;
drop table if exists public.guest_profiles;
