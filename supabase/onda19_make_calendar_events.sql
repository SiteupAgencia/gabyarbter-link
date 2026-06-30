-- =============================================================
-- Link/Maquiagem · Onda 19: agenda unificada
--   - Tipos/cores para eventos manuais da agenda da make.
--   - Aulas do Sopro bloqueiam disponibilidade pública.
--   - Idempotente.
-- =============================================================

alter table public.make_blocked_dates
  add column if not exists kind text not null default 'block';

alter table public.make_blocked_dates
  drop constraint if exists make_blocked_dates_kind_check;

alter table public.make_blocked_dates
  add constraint make_blocked_dates_kind_check
  check (kind in ('block', 'commitment', 'party', 'yoga'));

alter table public.make_recurring_blocks
  add column if not exists kind text not null default 'block';

alter table public.make_recurring_blocks
  drop constraint if exists make_recurring_blocks_kind_check;

alter table public.make_recurring_blocks
  add constraint make_recurring_blocks_kind_check
  check (kind in ('block', 'commitment', 'party', 'yoga'));

create index if not exists make_blocked_dates_kind_idx
  on public.make_blocked_dates(kind);

create index if not exists make_recurring_blocks_kind_idx
  on public.make_recurring_blocks(kind)
  where active;

comment on column public.make_blocked_dates.kind is
  'Agenda visual da make: block, commitment, party, yoga. Todos bloqueiam disponibilidade.';

comment on column public.make_recurring_blocks.kind is
  'Agenda visual recorrente da make: block, commitment, party, yoga. Todos bloqueiam disponibilidade.';

create or replace function public.make_busy_slots(
  p_from timestamptz,
  p_to   timestamptz
)
returns table (starts_at timestamptz, ends_at timestamptz)
language sql
security definer
stable
set search_path = public
as $$
  select a.starts_at, a.ends_at
  from public.make_appointments a
  where a.status in ('pending_payment', 'confirmed')
    and a.starts_at >= p_from
    and a.starts_at < p_to

  union all

  select c.starts_at, c.starts_at + make_interval(mins => c.duration_minutes)
  from public.classes c
  where c.starts_at >= p_from
    and c.starts_at < p_to;
$$;

grant execute on function public.make_busy_slots(timestamptz, timestamptz) to anon;
grant execute on function public.make_busy_slots(timestamptz, timestamptz) to authenticated;

select
  (select count(*) from public.make_blocked_dates) as eventos_pontuais,
  (select count(*) from public.make_recurring_blocks where active) as eventos_recorrentes;
