-- =============================================================
-- Link/Maquiagem · Onda 15: consolida o catálogo em 2 serviços
--   Sem cobrança online, não faz sentido dividir a Blindada por forma
--   de pagamento. Vira: Express (R$175) e Blindada (R$200).
--   O acréscimo no cartão (+R$15) é observação, não um produto.
--   A duplicata é DESATIVADA (não apagada) pra não quebrar o histórico
--   de agendamentos que apontam pra ela via service_id.
--   Idempotente.
-- =============================================================

update public.make_services
  set name = 'Maquiagem Express',
      description = 'Realce natural, pele leve e luminosa. Pro dia a dia e eventos sociais.',
      sort_order = 1,
      active = true
  where slug = 'express';

update public.make_services
  set slug = 'blindada',
      name = 'Maquiagem Blindada',
      description = 'À prova de choro, suor e calor — dura o dia todo. Pra casamento, formatura e festas.',
      price_cents = 20000,
      payment_methods = '{pix,cash,credit_card}',
      sort_order = 2,
      active = true
  where slug in ('blindada-dinheiro', 'blindada');

-- desativa a antiga "Blindada (Pix/Cartão)" R$215 (mantida pro histórico)
update public.make_services set active = false where slug = 'blindada-online';

select slug, name, price_cents, active, sort_order
  from public.make_services order by sort_order;
