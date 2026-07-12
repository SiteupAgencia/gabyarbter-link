-- Encaixes manuais: somente o admin pode gravar allow_overlap=true.
-- O fluxo público não envia essa coluna e continua protegido pela constraint.
alter table public.make_appointments
  add column if not exists allow_overlap boolean not null default false;

alter table public.make_appointments drop constraint if exists make_no_overlap;
alter table public.make_appointments add constraint make_no_overlap
  exclude using gist (tstzrange(starts_at, ends_at, '[)') with &&)
  where (
    status in ('pending_payment', 'confirmed')
    and source = 'app'
    and allow_overlap = false
  );

comment on column public.make_appointments.allow_overlap is
  'Exceção confirmada manualmente pela Gaby para encaixar duas clientes.';
