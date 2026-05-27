// Envio de WhatsApp via WAHA (WhatsApp HTTP API).
// Mesma infra do app de yoga (Sopro): host WAHA + sessão "gaby".
//
// Env vars (setar no Vercel + .env.local):
//   WAHA_URL      = https://api2.siteup.com.br
//   WAHA_API_KEY  = <key>
//   WAHA_SESSION  = gaby           (opcional, default "gaby")

function wahaConfig() {
  const url = process.env.WAHA_URL;
  const apiKey = process.env.WAHA_API_KEY;
  if (!url || !apiKey) return null;
  return {
    url: url.replace(/\/+$/, ""),
    apiKey,
    session: process.env.WAHA_SESSION ?? "gaby",
  };
}

function toChatId(phoneE164: string): string {
  // E.164 "+5554999999999" -> "5554999999999@c.us"
  return `${phoneE164.replace(/\D/g, "")}@c.us`;
}

/**
 * Envia uma mensagem de texto livre via WAHA.
 * Nunca lança: retorna true se enviou, false se não configurado ou falhou.
 */
export async function sendWhatsAppText(toPhone: string, text: string): Promise<boolean> {
  const cfg = wahaConfig();
  if (!cfg) {
    console.warn("[waha] não configurado (WAHA_URL/WAHA_API_KEY) — envio pulado");
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
        chatId: toChatId(toPhone),
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
