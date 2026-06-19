-- =============================================================
-- Link/Maquiagem · Onda 16: tabela própria de clientes (Fase 5 do roadmap)
--   Gatilho: migração da base do TuaAgenda (~1.179 contatos, com
--   aniversário/endereço/email) + histórico-resumo por cliente
--   (nº de atendimentos e total gasto). O export NÃO tem a data de
--   cada atendimento, então guardamos o histórico como AGREGADO fiel
--   (legacy_visits / legacy_spent_cents), sem inventar atendimentos datados.
--
--   O CRM atual deriva clientes de make_appointments (keyed por telefone).
--   make_clients usa o MESMO telefone E.164 como chave, então a UI passa a
--   fazer o merge: dado vivo (agendamentos) + dado migrado (cadastro + resumo).
--
--   Idempotente: pode rodar quantas vezes quiser.
-- =============================================================

create extension if not exists "pgcrypto";

-- ---------- 1. make_clients ----------
create table if not exists public.make_clients (
  id                 uuid primary key default gen_random_uuid(),
  -- Identidade. phone em E.164 (+55...) é a chave de ligação com make_appointments.client_phone.
  -- Pode ser null pra contatos sem telefone (ainda assim guardamos nome/email/aniversário).
  phone              text,
  name               text not null,
  nickname           text,
  email              text,
  birthday           date,
  cpf                text,

  -- Endereço (objetivo da Fase 5 — JSON-LD LocalBusiness / mala-direta futura)
  cep                text,
  street             text,
  street_number      text,
  complement         text,
  neighborhood       text,
  city               text,
  state              text,
  country            text,

  -- Marca quem realmente atendeu (estava nos relatórios de agendamento) vs lead/contato.
  is_client          boolean not null default false,

  -- Histórico-resumo importado (fiel: agregado, sem datas fabricadas).
  legacy_visits      integer not null default 0 check (legacy_visits >= 0),
  legacy_spent_cents integer not null default 0 check (legacy_spent_cents >= 0),

  source             text not null default 'manual',  -- 'tuaagenda' | 'manual' | ...
  notes              text,
  imported_at        timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Telefone NÃO é único: famílias compartilham o mesmo número (mãe/filha).
-- A identidade do cliente é o id (tuaagenda_id / id), não o telefone. Índice só pra busca.
drop index if exists make_clients_phone_key;
create index if not exists make_clients_phone_idx
  on public.make_clients(phone) where phone is not null;

create index if not exists make_clients_is_client_idx on public.make_clients(is_client) where is_client;
create index if not exists make_clients_name_idx on public.make_clients(lower(name));
create index if not exists make_clients_birthday_idx on public.make_clients(birthday) where birthday is not null;

-- updated_at automático
create or replace function public.make_clients_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists make_clients_touch_trg on public.make_clients;
create trigger make_clients_touch_trg
  before update on public.make_clients
  for each row execute function public.make_clients_touch();

-- ---------- 2. RLS ----------
-- Dados pessoais: ninguém anônimo lê. Só a Gaby (role teacher) acessa.
alter table public.make_clients enable row level security;

drop policy if exists "teachers admin make_clients" on public.make_clients;
create policy "teachers admin make_clients" on public.make_clients
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher')
  ) with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher')
  );

-- ---------- 3. Conferência ----------
-- select count(*) filter (where is_client) as clientes,
--        count(*)                          as total_contatos,
--        count(*) filter (where birthday is not null) as com_aniversario,
--        sum(legacy_visits)                as visitas_historicas,
--        sum(legacy_spent_cents)/100.0     as total_historico_reais
--   from public.make_clients where source = 'tuaagenda';
