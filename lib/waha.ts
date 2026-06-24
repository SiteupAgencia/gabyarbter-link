// Envio de WhatsApp via WAHA (WhatsApp HTTP API).
// Mesma infra do app de yoga (Sopro): host WAHA + sessão "gaby".
//
// Env vars (setar no Vercel + .env.local):
//   WAHA_URL      = https://api2.siteup.com.br
//   WAHA_API_KEY  = <key>
//   WAHA_SESSION  = gaby           (opcional, default "gaby")

type WahaCfg = { url: string; apiKey: string; session: string };

function wahaConfig(): WahaCfg | null {
  const url = process.env.WAHA_URL;
  const apiKey = process.env.WAHA_API_KEY;
  if (!url || !apiKey) return null;
  return {
    url: url.replace(/\/+$/, ""),
    apiKey,
    session: process.env.WAHA_SESSION ?? "gaby",
  };
}

/**
 * Resolve o chatId canônico do WhatsApp pra um número, via check-exists.
 *
 * CRUCIAL pro Brasil: muitos números são registrados no WhatsApp **sem o 9º
 * dígito** (ex.: DDD 54). Mandar pro número cru (com o 9) faz o WhatsApp
 * responder `no LID found` e o envio falha. O check-exists devolve o JID certo
 * (ex.: 5554999709126 → 555499709126@c.us).
 *
 * Retorna o chatId canônico, `null` se o número não tem WhatsApp, ou — se o
 * check-exists em si falhar (rede/timeout) — o número cru como fallback.
 */
async function resolveChatId(cfg: WahaCfg, toPhone: string): Promise<string | null> {
  const digits = toPhone.replace(/\D/g, "");
  if (!digits) return null;
  try {
    const res = await fetch(
      `${cfg.url}/api/contacts/check-exists?phone=${digits}&session=${encodeURIComponent(cfg.session)}`,
      { headers: { "X-Api-Key": cfg.apiKey } },
    );
    if (res.ok) {
      const data = (await res.json()) as { numberExists?: boolean; chatId?: string };
      if (data.numberExists && data.chatId) return data.chatId;
      if (data.numberExists === false) return null; // número não tem WhatsApp
    } else {
      console.error(`[waha] check-exists falhou status=${res.status}`);
    }
  } catch (e) {
    console.error("[waha] check-exists erro:", e instanceof Error ? e.message : e);
  }
  // Fallback: tenta o número cru (não fica pior que sem resolver).
  return `${digits}@c.us`;
}

/**
 * Envia uma mensagem de texto livre via WAHA.
 * Nunca lança: retorna true se enviou, false se não configurado, número sem
 * WhatsApp, ou falha no envio.
 */
export async function sendWhatsAppText(toPhone: string, text: string): Promise<boolean> {
  const cfg = wahaConfig();
  if (!cfg) {
    console.warn("[waha] não configurado (WAHA_URL/WAHA_API_KEY) — envio pulado");
    return false;
  }
  const chatId = await resolveChatId(cfg, toPhone);
  if (!chatId) {
    console.warn(`[waha] ${toPhone} não está no WhatsApp — envio pulado`);
    return false;
  }
  try {
    const res = await fetch(`${cfg.url}/api/sendText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": cfg.apiKey,
      },
      body: JSON.stringify({
        session: cfg.session,
        chatId,
        text,
      }),
    });
    if (!res.ok) {
      console.error(`[waha] sendText falhou status=${res.status} body=${await res.text()}`);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[waha] sendText erro:", e instanceof Error ? e.message : e);
    return false;
  }
}
