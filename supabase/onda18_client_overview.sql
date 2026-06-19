-- =============================================================
-- Link/Maquiagem · Onda 18: view de CRM por identidade de cliente
--   Problema: o CRM agrupava clientes só por telefone (client_phone) e
--   pulava quem não tem telefone — escondendo ~960 clientes migrados.
--   Solução: identidade do cliente = COALESCE(tuaagenda_client_id, client_phone),
--   juntando make_clients (cadastro: nome/aniversário/endereço, inclui leads)
--   com os agregados de make_appointments. Uma linha por cliente.
--
--   security_invoker=on: a view roda com a RLS de quem consulta (a teacher),
--   então só a Gaby lê — igual às tabelas base.
--   Idempotente. Pré-req: onda16 + onda17 (e seeds, pra ter dado).
-- =============================================================

create or replace view public.make_client_overview
with (security_invoker = on) as
with appt as (
  select
    coalesce(tuaagenda_client_id, client_phone) as client_key,
    count(*) filter (where status in ('confirmed', 'completed'))                         as visits,
    count(*) filter (where status = 'confirmed' and starts_at >= now())                  as upcoming,
    sum(coalesce(total_cents, amount_cents, 0))
      filter (where status in ('confirmed', 'completed'))                                as total_cents,
    max(starts_at) filter (where status = 'completed' or starts_at < now())              as last_visit,
    min(starts_at) filter (where status = 'confirmed' and starts_at >= now())            as next_at,
    max(starts_at)                                                                       as most_recent,
    (array_agg(client_name  order by starts_at desc) filter (where client_name is not null))[1]  as appt_name,
    (array_agg(client_phone order by starts_at desc) filter (where client_phone is not null))[1] as appt_phone,
    (array_agg(client_email order by starts_at desc) filter (where client_email is not null))[1] as appt_email
  from public.make_appointments
  where coalesce(tuaagenda_client_id, client_phone) is not null
  group by coalesce(tuaagenda_client_id, client_phone)
)
select
  coalesce(c.tuaagenda_id, a.client_key)        as client_key,
  coalesce(c.name, a.appt_name, 'Cliente')      as name,
  coalesce(c.phone, a.appt_phone)               as phone,
  coalesce(c.email, a.appt_email)               as email,
  c.birthday,
  c.city,
  c.tuaagenda_id,
  (c.tuaagenda_id is not null)                  as is_migrated,
  coalesce(a.visits, 0)                         as visits,
  coalesce(a.upcoming, 0)                        as upcoming,
  coalesce(a.total_cents, 0)                     as total_cents,
  a.last_visit,
  a.next_at,
  coalesce(a.most_recent, c.created_at, now())  as most_recent
from public.make_clients c
full outer join appt a on a.client_key = c.tuaagenda_id;

grant select on public.make_client_overview to authenticated;

-- Conferência:
-- select count(*) total, count(*) filter (where visits>0) com_atend,
--        count(*) filter (where phone is null) sem_tel from public.make_client_overview;
