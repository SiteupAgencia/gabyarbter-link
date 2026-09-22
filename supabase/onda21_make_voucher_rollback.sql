-- Rollback da onda 21. Reservas já feitas mantêm o total_cents com desconto.
drop index if exists public.make_appointments_campaign_idx;
alter table public.make_appointments drop column if exists campaign, drop column if exists discount_cents;
drop table if exists public.make_campaigns;
