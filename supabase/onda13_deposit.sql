-- =============================================================
-- Link/Maquiagem · Onda 13: entrada (sinal) de 30%
--   - total_cents: preço total do serviço (igual a amount_cents)
--   - deposit_cents: quanto foi pago online via Asaas (entrada)
--   - final_paid_at / final_payment_method: registro do pagamento presencial
--   - settings.deposit_percent: % padrão da entrada (30 default)
--
-- Regra (decisão de produto):
--   - Serviço com payment_methods contendo só "cash" (sem pix/cartão):
--       deposit_cents = 0  (paga tudo no dia, sem entrada online)
--   - Demais serviços (pix/cartão):
--       deposit_cents = round(total_cents * deposit_percent / 100)
--
-- Idempotente. Backfill seguro: pra agendamentos existentes,
-- total_cents = amount_cents e deposit_cents = amount_cents (já estava
-- considerado pago integral pelo modelo antigo).
-- =============================================================

-- ---------- 1. Colunas ----------
alter table public.make_appointments
  add column if not exists total_cents          integer,
  add column if not exists deposit_cents        integer,
  add column if not exists final_paid_at        timestamptz,
  add column if not exists final_payment_method text
    check (final_payment_method in ('cash', 'pix', 'credit_card') or final_payment_method is null);

-- Backfill: agendamentos antigos consideram total = deposit (modelo antigo
-- não tinha entrada — o que pagou foi o total integral).
update public.make_appointments
   set total_cents = coalesce(total_cents, amount_cents),
       deposit_cents = coalesce(deposit_cents, amount_cents)
 where total_cents is null or deposit_cents is null;

-- Daqui pra frente, todo agendamento novo tem total_cents not null
alter table public.make_appointments
  alter column total_cents set not null,
  alter column deposit_cents set not null;

-- ---------- 2. Setting deposit_percent ----------
insert into public.make_settings (key, value)
values ('deposit_percent', '30')
on conflict (key) do nothing;

-- ---------- Conferência ----------
select
  (select count(*) from public.make_appointments) as total_agendamentos,
  (select count(*) from public.make_appointments where total_cents is not null and deposit_cents is not null) as com_campos_preenchidos,
  (select value from public.make_settings where key = 'deposit_percent') as deposit_percent_setting;
