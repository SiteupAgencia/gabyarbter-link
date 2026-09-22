// Pagamento é sempre no dia, com a Gaby. O preço-base (price_cents) é o valor
// em DINHEIRO; PIX e cartão têm um acréscimo fixo (custo da maquininha/PIX).
// Esta é a fonte única do acréscimo — mudou aqui, muda no app inteiro.
// (As cópias estáticas da landing e do JSON-LD espelham este valor à mão.)
export const CARD_SURCHARGE_CENTS = 1000; // R$ 10,00

/** Valor no PIX/cartão a partir do preço em dinheiro (em centavos). */
export function cardPriceCents(cashCents: number): number {
  return cashCents + CARD_SURCHARGE_CENTS;
}

/** Voucher de evento (make_campaigns): desconto % sobre o preço em dinheiro;
 *  PIX/cartão seguem com o acréscimo fixo por cima. */
export type MakeVoucher = {
  code: string;
  name: string;
  serviceSlug: string;
  discountPct: number;
};

export function voucherDiscountCents(cashCents: number, pct: number): number {
  return Math.round((cashCents * pct) / 100);
}

/** Preço em dinheiro já com o voucher, quando ele vale pro serviço. */
export function priceWithVoucher(
  service: { slug: string; price_cents: number },
  voucher: MakeVoucher | null,
): number {
  if (!voucher || voucher.serviceSlug !== service.slug) return service.price_cents;
  return service.price_cents - voucherDiscountCents(service.price_cents, voucher.discountPct);
}
