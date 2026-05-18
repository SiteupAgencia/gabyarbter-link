import { createClient } from "@supabase/supabase-js";

// Cliente admin: usa SERVICE_ROLE_KEY pra ignorar RLS.
// Usar APENAS em rotas server-only (api routes, server components com
// dados internos). NUNCA importar em client components.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("supabase_admin_not_configured");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
