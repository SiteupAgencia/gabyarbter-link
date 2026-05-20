// Cliente Asaas — pagamentos (substitui Mercado Pago).
// Sandbox: ASAAS_ENV=sandbox (default). Produção: ASAAS_ENV=production.

const ASAAS_BASE =
  (process.env.ASAAS_ENV ?? "sandbox") === "production"
    ? "https://api.asaas.com/v3"
    : "https://api-sandbox.asaas.com/v3";

function apiKey(): string {
  const k = process.env.ASAAS_API_KEY;
  if (!k) throw new Error("asaas_not_configured");
  return k;
}

type CreateCheckoutInput = {
  serviceName: string;
  description?: string;
  valueReais: number; // ex: 175.00
  externalReference: string; // appointment id
  successUrl: string;
  cancelUrl: string;
  expiredUrl?: string;
  customerName?: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  allowPix: boolean;
  minutesToExpire?: number;
};

type CheckoutResponse = { id: string; link: string };

export async function createAsaasCheckout(
  input: CreateCheckoutInput,
): Promise<CheckoutResponse> {
  const billingTypes = input.allowPix ? ["PIX", "CREDIT_CARD"] : ["CREDIT_CARD"];

  const payload: Record<string, unknown> = {
    billingTypes,
    chargeTypes: ["DETACHED"],
    minutesToExpire: input.minutesToExpire ?? 60,
    externalReference: input.externalReference,
    callback: {
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
      ...(input.expiredUrl ? { expiredUrl: input.expiredUrl } : {}),
    },
    items: [
      {
        name: input.serviceName,
        description: input.description ?? input.serviceName,
        quantity: 1,
        value: input.valueReais,
      },
    ],
  };

  // Pré-preenche dados do cliente quando houver (reduz fricção no checkout)
  if (input.customerName) {
    payload.customerData = {
      name: input.customerName,
      ...(input.customerEmail ? { email: input.customerEmail } : {}),
      ...(input.customerPhone ? { phone: input.customerPhone } : {}),
    };
  }

  const doRequest = async (body: Record<string, unknown>) =>
    fetch(`${ASAAS_BASE}/checkouts`, {
      method: "POST",
      headers: {
        access_token: apiKey(),
        "Content-Type": "application/json",
        "User-Agent": "gabyarbter-maquiagem",
      },
      body: JSON.stringify(body),
    });

  let res = await doRequest(payload);

  // Fallback: se Pix falhar por falta de chave Pix, tenta só cartão.
  if (!res.ok && input.allowPix) {
    const txt = await res.clone().text();
    if (/chave pix/i.test(txt)) {
      res = await doRequest({ ...payload, billingTypes: ["CREDIT_CARD"] });
    }
  }

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`asaas_checkout_failed: ${txt}`);
  }

  const json = (await res.json()) as { id: string; link: string };
  return { id: json.id, link: json.link };
}

type AsaasPayment = {
  id: string;
  status: string;
  billingType?: string;
  externalReference?: string;
  checkoutSession?: string;
};

export async function getAsaasPayment(paymentId: string): Promise<AsaasPayment> {
  const res = await fetch(`${ASAAS_BASE}/payments/${paymentId}`, {
    headers: {
      access_token: apiKey(),
      "User-Agent": "gabyarbter-maquiagem",
    },
  });
  if (!res.ok) throw new Error("asaas_payment_lookup_failed");
  return (await res.json()) as AsaasPayment;
}
