-- =============================================================
-- Maquiagem Landing · agendamento próprio (substitui TuaAgenda)
-- Tables prefixadas com `make_` pra não conflitar com o yoga.
-- Idempotente: pode rodar quantas vezes quiser.
-- =============================================================

create extension if not exists "pgcrypto";
create extension if not exists btree_gist;

-- ---------- 1. make_services ----------
create table if not exists public.make_services (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  name            text not null,
  description     text,
  price_cents     integer not null check (price_cents > 0),
  duration_min    integer not null check (duration_min > 0),
  payment_methods text[] not null default '{}',  -- ['pix','credit_card','cash']
  active          boolean not null default true,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now()
);

-- ---------- 2. make_weekly_schedule (template fixo) ----------
create table if not exists public.make_weekly_schedule (
  id            uuid primary key default gen_random_uuid(),
  weekday       integer not null check (weekday between 0 and 6), -- 0=domingo
  start_time    time not null,
  end_time      time not null,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  check (end_time > start_time)
);

create index if not exists make_weekly_schedule_weekday_idx
  on public.make_weekly_schedule(weekday) where active;

-- ---------- 3. make_blocked_dates (feriados/folgas) ----------
create table if not exists public.make_blocked_dates (
  id            uuid primary key default gen_random_uuid(),
  date          date not null,
  all_day       boolean not null default true,
  start_time    time,
  end_time      time,
  reason        text,
  kind          text not null default 'block'
                check (kind in ('block', 'commitment', 'party', 'yoga')),
  created_at    timestamptz not null default now(),
  check (all_day or (start_time is not null and end_time is not null and end_time > start_time))
);

create index if not exists make_blocked_dates_date_idx on public.make_blocked_dates(date);
create index if not exists make_blocked_dates_kind_idx on public.make_blocked_dates(kind);

-- ---------- 4. make_appointments ----------
create table if not exists public.make_appointments (
  id                  uuid primary key default gen_random_uuid(),
  service_id          uuid not null references public.make_services(id),
  client_name         text not null,
  client_phone        text not null,    -- E.164 (+5599...)
  client_email        text,
  starts_at           timestamptz not null,
  ends_at             timestamptz not null,
  status              text not null default 'pending_payment'
                      check (status in (
                        'pending_payment',  -- aguardando MP confirmar
                        'confirmed',         -- pago ou dinheiro reservado
                        'completed',         -- atendimento realizado
                        'cancelled',         -- cancelada antes do dia
                        'refunded',          -- cancelada com reembolso
                        'no_show'           -- não compareceu
                      )),
  amount_cents        integer not null,
  payment_method      text,             -- 'pix' | 'credit_card' | 'cash' | 'stub'
  mp_preference_id    text,
  mp_payment_id       text,
  mp_status           text,
  notes               text,
  created_at          timestamptz not null default now(),
  confirmed_at        timestamptz,
  cancelled_at        timestamptz,
  completed_at        timestamptz,
  check (ends_at > starts_at)
);

create index if not exists make_appointments_starts_at_idx on public.make_appointments(starts_at);
create index if not exists make_appointments_status_idx on public.make_appointments(status);
create index if not exists make_appointments_client_phone_idx on public.make_appointments(client_phone);

-- Exclusion constraint: dois pending/confirmed não podem sobrepor
alter table public.make_appointments drop constraint if exists make_no_overlap;
alter table public.make_appointments add constraint make_no_overlap
  exclude using gist (
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status in ('pending_payment', 'confirmed'));

-- ---------- 5. make_settings (buffer, antecedência etc) ----------
create table if not exists public.make_settings (
  key         text primary key,
  value       text not null,
  updated_at  timestamptz not null default now()
);

-- ---------- 6. RLS ----------
alter table public.make_services         enable row level security;
alter table public.make_weekly_schedule  enable row level security;
alter table public.make_blocked_dates    enable row level security;
alter table public.make_appointments     enable row level security;
alter table public.make_settings         enable row level security;

-- públicos podem LER catálogo + disponibilidade
drop policy if exists "anyone reads make_services" on public.make_services;
create policy "anyone reads make_services" on public.make_services
  for select using (active);

drop policy if exists "anyone reads make_weekly_schedule" on public.make_weekly_schedule;
create policy "anyone reads make_weekly_schedule" on public.make_weekly_schedule
  for select using (active);

drop policy if exists "anyone reads make_blocked_dates" on public.make_blocked_dates;
create policy "anyone reads make_blocked_dates" on public.make_blocked_dates
  for select using (true);

drop policy if exists "anyone reads make_settings" on public.make_settings;
create policy "anyone reads make_settings" on public.make_settings
  for select using (true);

-- ninguém lê make_appointments direto (dados pessoais).
-- pra checar slots ocupados usaremos a RPC make_busy_slots abaixo.

-- admin (role teacher) pode tudo em todas as tabelas make_*
drop policy if exists "teachers admin make_services" on public.make_services;
create policy "teachers admin make_services" on public.make_services
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher')
  );

drop policy if exists "teachers admin make_weekly_schedule" on public.make_weekly_schedule;
create policy "teachers admin make_weekly_schedule" on public.make_weekly_schedule
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher')
  );

drop policy if exists "teachers admin make_blocked_dates" on public.make_blocked_dates;
create policy "teachers admin make_blocked_dates" on public.make_blocked_dates
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher')
  );

drop policy if exists "teachers admin make_appointments" on public.make_appointments;
create policy "teachers admin make_appointments" on public.make_appointments
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher')
  );

drop policy if exists "teachers admin make_settings" on public.make_settings;
create policy "teachers admin make_settings" on public.make_settings
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher')
  );

-- ---------- 7. RPC: slots ocupados em um range ----------
-- usado pelo frontend público pra calcular disponibilidade sem expor dados pessoais
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

-- ---------- 8. SEED dos serviços ----------
insert into public.make_services (slug, name, description, price_cents, duration_min, payment_methods, sort_order)
values
  (
    'express',
    'Maquiagem Express',
    'Realce natural com pele resistente. Sem construção de esfumado.',
    17500, 30, '{pix,credit_card}', 1
  ),
  (
    'blindada-online',
    'Maquiagem Blindada (Pix/Cartão)',
    'À prova de água, suor e lágrimas. Construção de esfumado inclusa. Pagamento online via Pix ou cartão.',
    21500, 45, '{pix,credit_card}', 2
  ),
  (
    'blindada-dinheiro',
    'Maquiagem Blindada (Dinheiro)',
    'À prova de água, suor e lágrimas. Construção de esfumado inclusa. Pagamento em dinheiro presencial — desconto à vista.',
    20000, 45, '{cash}', 3
  )
on conflict (slug) do update set
  name            = excluded.name,
  description     = excluded.description,
  price_cents     = excluded.price_cents,
  duration_min    = excluded.duration_min,
  payment_methods = excluded.payment_methods,
  sort_order      = excluded.sort_order;

-- ---------- 9. SEED template inicial de horários ----------
-- Placeholder: ter/qui/sex 14h-18h, sáb 9h-13h.
-- Gaby ajusta no admin depois. Idempotente: não duplica.
insert into public.make_weekly_schedule (weekday, start_time, end_time)
select * from (values
  (2, '14:00'::time, '18:00'::time),
  (4, '14:00'::time, '18:00'::time),
  (5, '14:00'::time, '18:00'::time),
  (6, '09:00'::time, '13:00'::time)
) as v(weekday, start_time, end_time)
where not exists (
  select 1 from public.make_weekly_schedule
  where weekday = v.weekday
    and start_time = v.start_time
    and end_time = v.end_time
);

-- ---------- 10. SEED settings ----------
insert into public.make_settings (key, value) values
  ('buffer_minutes',       '15'),
  ('min_advance_hours',    '12'),
  ('max_advance_days',     '1825'),  -- ~5 anos: noiva/madrinha marcam com muita antecedência
  ('cancel_refund_hours',  '24'),
  ('slot_step_minutes',    '15'),    -- granularidade dos slots oferecidos
  ('timezone',             'America/Sao_Paulo')
on conflict (key) do update set value = excluded.value, updated_at = now();
