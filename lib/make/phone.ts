/**
 * Normalização canônica de telefone BR para E.164 (+55DDDNÚMERO).
 *
 * Robusta para o DDD 55 (Santa Maria/RS), que colide com o código do país 55 —
 * a regra antiga `startsWith("55")` corrompia esses números. Aqui decidimos por
 * COMPRIMENTO. É a MESMA lógica do importador do TuaAgenda
 * (supabase/import-tuaagenda/import2.mjs), pra agendamento novo bater com o
 * histórico migrado no CRM.
 *
 *  - 13 díg. começando 55  -> já tem país (55 + DDD + 9 díg)  -> +<d>
 *  - 12 díg. começando 55  -> já tem país (55 + DDD + 8 díg)  -> +<d>
 *  - 11 díg.               -> DDD + 9 díg (celular)           -> +55<d>
 *  - 10 díg.               -> DDD + 8 díg (fixo/antigo)       -> +55<d>
 *  - resto                 -> inválido -> "" (callers tratam `if (!phone)`)
 */
export function toE164(raw: string): string {
  const d = (raw || "").replace(/\D/g, "");
  if (d.length === 13 && d.startsWith("55")) return "+" + d;
  if (d.length === 12 && d.startsWith("55")) return "+" + d;
  if (d.length === 11 || d.length === 10) return "+55" + d;
  return "";
}
