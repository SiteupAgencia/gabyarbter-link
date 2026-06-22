-- =============================================================
-- Link/Maquiagem · Onda 17: histórico real do TuaAgenda
--   A API do TuaAgenda revelou o histórico COMPLETO (3.562 atendimentos
--   datados, 2021-2026, ~R$475k). Esta onda prepara o schema pra receber:
--     - serviços históricos (inativos) — preservam o nome exato do que foi feito
--     - atendimentos datados em make_appointments (com origem marcada)
--     - clientes (make_clients) ligados ao atendimento por id do TuaAgenda
--
--   Ligação atendimento↔cliente por ID (não só telefone), porque 821 dos 1.850
--   clientes não têm telefone — e o CRM atual pula quem não tem telefone.
--
--   Idempotente. Pré-requisito: onda13 (total_cents/deposit_cents) e onda16 (make_clients).
-- =============================================================

-- defensivo: garante colunas de valor (vieram na onda13)
alter table public.make_appointments add column if not exists total_cents   integer;
alter table public.make_appointments add column if not exists deposit_cents integer not null default 0;

-- origem + chaves de migração (idempotência e filtro "migrado vs novo")
alter table public.make_appointments add column if not exists source              text not null default 'app';
alter table public.make_appointments add column if not exists tuaagenda_id        text;
alter table public.make_appointments add column if not exists tuaagenda_client_id text;

create unique index if not exists make_appointments_tuaagenda_id_key
  on public.make_appointments(tuaagenda_id) where tuaagenda_id is not null;
create index if not exists make_appointments_tuaagenda_client_idx
  on public.make_appointments(tuaagenda_client_id) where tuaagenda_client_id is not null;

-- 821 clientes migrados não têm telefone → client_phone passa a aceitar null.
-- (a identidade do cliente migrado é o tuaagenda_client_id; o app novo continua exigindo
--  telefone no agendamento manual via validação na server action)
alter table public.make_appointments alter column client_phone drop not null;

-- A constraint anti-overlap existe pra impedir DOUBLE-BOOKING no app novo.
-- O histórico do TuaAgenda tem sobreposições legítimas (cursos, recorrências) — então
-- a constraint passa a valer SÓ pra linhas do app (source='app'). Migrado fica isento.
-- A disponibilidade pública (make_busy_slots) continua lendo os migrados confirmados,
-- então ninguém agenda por cima de um compromisso futuro da Gaby vindo do TuaAgenda.
alter table public.make_appointments drop constraint if exists make_no_overlap;
alter table public.make_appointments add constraint make_no_overlap
  exclude using gist (tstzrange(starts_at, ends_at, '[)') with &&)
  where (status in ('pending_payment', 'confirmed') and source = 'app');

-- make_clients: liga ao TuaAgenda por id (cruza com make_appointments.tuaagenda_client_id)
alter table public.make_clients add column if not exists tuaagenda_id text;
create unique index if not exists make_clients_tuaagenda_id_key
  on public.make_clients(tuaagenda_id) where tuaagenda_id is not null;

-- marca de origem nos serviços (pra distinguir catálogo ativo dos serviços históricos)
alter table public.make_services add column if not exists source text not null default 'app';

-- Conferência:
-- select source, count(*) , sum(total_cents)/100.0 from public.make_appointments group by source;
-- select count(*) filter (where active) ativos, count(*) total from public.make_services;
