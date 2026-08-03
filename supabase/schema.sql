-- budg3 sync schema.
--
-- Run this once in the Supabase SQL editor (Dashboard -> SQL Editor -> New
-- query -> paste -> Run). It is safe to run twice.
--
-- The whole security model is here. The anon key ships to every browser, so
-- it must grant nothing on its own: row-level security is what makes a row
-- readable only by the person it belongs to. Do not skip the policies, and
-- never put a service_role key in client code.

create table if not exists public.states (
  -- Deleting the auth user deletes their data with it. This matters: budg3
  -- is used by minors, and "delete my account" has to mean it.
  user_id    uuid primary key references auth.users (id) on delete cascade,
  -- The whole State object from lib/store.ts. One row per person. Merging is
  -- done in the client (lib/merge.ts) so that two devices editing offline
  -- combine rather than overwrite.
  data       jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.states enable row level security;

-- Four explicit policies rather than one FOR ALL, so it's obvious at a glance
-- that every verb is covered and every one is scoped to the owner.
drop policy if exists "read own state"   on public.states;
drop policy if exists "insert own state" on public.states;
drop policy if exists "update own state" on public.states;
drop policy if exists "delete own state" on public.states;

create policy "read own state"
  on public.states for select
  using (auth.uid() = user_id);

create policy "insert own state"
  on public.states for insert
  with check (auth.uid() = user_id);

create policy "update own state"
  on public.states for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "delete own state"
  on public.states for delete
  using (auth.uid() = user_id);

-- A row can only ever be written by its owner, so the client never needs to
-- send user_id for a read. Belt and braces: default it from the session too.
alter table public.states alter column user_id set default auth.uid();
