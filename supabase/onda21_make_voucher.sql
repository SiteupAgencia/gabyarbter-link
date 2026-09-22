-- =============================================================
-- Onda 21: Voucher de evento na maquiagem (QR impresso)
--   make_campaigns: desconto por campanha, preso a um serviço, com prazo.
--   make_appointments.campaign / discount_cents: vínculo da reserva ao evento.
--   Só o servidor (service role) lê campanhas; a checagem é no checkout.
--   Idempotente. Rollback em onda21_make_voucher_rollback.sql.
-- =============================================================

create table if not exists public.make_campaigns (
  code          text primary key,
  name          text not null,
  service_slug  text not null,
  discount_pct  int  not null check (discount_pct between 1 and 50),
  expires_at    timestamptz,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);
alter table public.make_campaigns enable row level security;

alter table public.make_appointments
  add column if not exists campaign text references public.make_campaigns(code),
  add column if not exists discount_cents int not null default 0;

create index if not exists make_appointments_campaign_idx
  on public.make_appointments(campaign) where campaign is not null;

-- 10% na Blindada, válido pra reservas feitas até 22/12/2026 (fim do dia em Brasília)
insert into public.make_campaigns (code, name, service_slug, discount_pct, expires_at)
values ('medicina', 'Evento de medicina', 'blindada', 10, '2026-12-23 03:00:00+00')
on conflict (code) do nothing;
