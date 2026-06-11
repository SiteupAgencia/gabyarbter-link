-- =============================================================
-- Link/Maquiagem · Onda 14: bloqueios recorrentes (toda semana)
--   Ex.: aula de Yoga toda terça 07:00–08:30 — bloqueia o horário
--   no agendamento online sem precisar lançar data por data.
--
--   Diferente de make_blocked_dates (data única / folga pontual),
--   make_recurring_blocks é por dia-da-semana (weekday) e sempre
--   tem faixa de horário (não existe "dia inteiro recorrente" —
--   pra isso, desative o weekday no make_weekly_schedule).
--
--   Idempotente.
-- =============================================================

create table if not exists public.make_recurring_blocks (
  id            uuid primary key default gen_random_uuid(),
  weekday       integer not null check (weekday between 0 and 6), -- 0=domingo
  start_time    time not null,
  end_time      time not null,
  reason        text,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  check (end_time > start_time)
);

create index if not exists make_recurring_blocks_weekday_idx
  on public.make_recurring_blocks(weekday) where active;

-- ---------- RLS ----------
alter table public.make_recurring_blocks enable row level security;

-- público lê (o cálculo de slots roda com cliente anônimo)
drop policy if exists "anyone reads make_recurring_blocks" on public.make_recurring_blocks;
create policy "anyone reads make_recurring_blocks" on public.make_recurring_blocks
  for select using (active);

-- teacher (Gaby/André) administra tudo
drop policy if exists "teachers admin make_recurring_blocks" on public.make_recurring_blocks;
create policy "teachers admin make_recurring_blocks" on public.make_recurring_blocks
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher')
  );

-- ---------- Conferência ----------
select count(*) as bloqueios_recorrentes from public.make_recurring_blocks;
