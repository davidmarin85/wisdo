// GET /api/auth/callback
// Punto de vuelta de los dos logins:
//   - Google (PKCE): llega ?code=… y se cambia por sesión.
//   - Magic link: llega ?token_hash=…&type=email y se verifica aquí. Las
//     plantillas de email de Supabase (Magic Link y Confirm signup) enlazan a
//     {{ .SiteURL }}/api/auth/callback/?token_hash={{ .TokenHash }}&type=email
//     en vez de a la URL de verificación de Supabase. Así el enlace no depende
//     de la lista de Redirect URLs ni de abrirlo en el mismo navegador.
import type { APIRoute } from 'astro';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@lib/supabase';

const OTP_TYPES = new Set<EmailOtpType>(['email', 'magiclink', 'signup', 'recovery', 'invite', 'email_change']);

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;
  const next = url.searchParams.get('next') ?? '/dashboard/';
  // Sin open redirect: solo rutas propias.
  const safePath = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard/';
  const fail = (reason: string) => redirect(`/login/?error=${reason}&next=${encodeURIComponent(safePath)}`, 302);

  const supabase = createSupabaseServerClient({ request, cookies });

  if (tokenHash && type && OTP_TYPES.has(type)) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) {
      console.error('[auth/callback] verifyOtp error:', error.status, error.message);
      return fail('auth_failed');
    }
    return redirect(safePath, 302);
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('[auth/callback] exchangeCodeForSession error:', error.message);
      return fail('auth_failed');
    }
    return redirect(safePath, 302);
  }

  // Supabase también puede volver con ?error=… (enlace caducado, etc.).
  const providerError = url.searchParams.get('error_code') ?? url.searchParams.get('error');
  if (providerError) {
    console.warn('[auth/callback] provider error:', providerError);
    return fail(providerError === 'otp_expired' ? 'otp_expired' : 'auth_failed');
  }
  return fail('missing_code');
};
