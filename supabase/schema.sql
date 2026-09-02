-- TaskFlow — schéma de la base
-- À exécuter dans Supabase → SQL Editor.

-- ─── Table ────────────────────────────────────────────────────────────────
create table if not exists public.tasks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  title        text not null,
  description  text,
  priority     text not null default 'medium' check (priority in ('high','medium','low')),
  category     text not null default 'general',
  start_date   timestamptz,
  end_date     timestamptz,
  needs        text[] not null default '{}',
  completed    boolean not null default false,
  completed_at timestamptz,
  created_at   timestamptz not null default now()
);

-- Horodatage de la complétion : nécessaire au graphe « Activité de la semaine »
-- du dashboard. Sans cette colonne, une tâche est comptée comme terminée le jour
-- de sa création et non le jour où elle a été cochée.
alter table public.tasks add column if not exists completed_at timestamptz;

create index if not exists tasks_user_id_created_at_idx
  on public.tasks (user_id, created_at desc);

-- ─── Row Level Security ───────────────────────────────────────────────────
-- Chaque utilisateur n'accède qu'à ses propres tâches.
alter table public.tasks enable row level security;

drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own" on public.tasks
  for select using (auth.uid() = user_id);

drop policy if exists "tasks_insert_own" on public.tasks;
create policy "tasks_insert_own" on public.tasks
  for insert with check (auth.uid() = user_id);

drop policy if exists "tasks_update_own" on public.tasks;
create policy "tasks_update_own" on public.tasks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own" on public.tasks
  for delete using (auth.uid() = user_id);
