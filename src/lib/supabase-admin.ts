import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Cliente con service_role: salta RLS. Solo para endpoints server-side que
// necesitan escribir/leer sin sesión de usuario (p.ej. el quiz público).
// Nunca importar este módulo desde código que se ejecute en el navegador.
export function createSupabaseAdminClient(): SupabaseClient {
  const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
  const SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error(
      'Missing Supabase admin env vars: PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.'
    );
  }

  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
