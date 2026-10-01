// POST /api/auth/magic-link
// Login sin contraseña: el formulario de /login/ manda el email y Supabase
// envía un enlace. El enlace vuelve a /api/auth/callback/ con ?code=, el
// mismo flujo PKCE que Google, así que el callback no cambia.
//
// Es el acceso natural al dashboard: el lead ya nos dio su email en el
// diagnóstico, y los diagnósticos se le asocian por ese email.
import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '@lib/supabase';
import { getOAuthRedirectUrl } from '@lib/auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === 'string' ? value : '';
  return next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard/';
}

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return redirect('/login/?error=magic_failed', 303);
  }

  const next = safeNext(form.get('next'));
  const back = `/login/?next=${encodeURIComponent(next)}`;

  // Honeypot: a los bots les decimos que sí y no mandamos nada.
  if (form.get('website')) {
    return redirect(`${back}&sent=1`, 303);
  }

  const email = String(form.get('email') ?? '').trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return redirect(`${back}&error=invalid_email`, 303);
  }

  const supabase = createSupabaseServerClient({ request, cookies });
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${getOAuthRedirectUrl()}?next=${encodeURIComponent(next)}`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    console.error('[auth/magic-link] signInWithOtp error:', error.status, error.message);
    const code = error.status === 429 ? 'rate_limited' : 'magic_failed';
    return redirect(`${back}&error=${code}`, 303);
  }

  return redirect(`${back}&sent=1&email=${encodeURIComponent(email)}`, 303);
};
