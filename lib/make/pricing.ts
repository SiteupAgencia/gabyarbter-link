// Pagamento é sempre no dia, com a Gaby. O preço-base (price_cents) é o valor
// em DINHEIRO; PIX e cartão têm um acréscimo fixo (custo da maquininha/PIX).
// Esta é a fonte única do acréscimo — mudou aqui, muda no app inteiro.
// (As cópias estáticas da landing e do JSON-LD espelham este valor à mão.)
export const CARD_SURCHARGE_CENTS = 1000; // R$ 10,00

/** Valor no PIX/cartão a partir do preço em dinheiro (em centavos). */
export function cardPriceCents(cashCents: number): number {
  return cashCents + CARD_SURCHARGE_CENTS;
}
