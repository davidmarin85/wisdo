import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '@lib/supabase';

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/dashboard/';

  if (!code) {
    return redirect('/login/?error=missing_code', 302);
  }

  const supabase = createSupabaseServerClient({ request, cookies });
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('[auth/callback] exchangeCodeForSession error:', error.message);
    return redirect('/login/?error=auth_failed', 302);
  }

  // Ensure redirect target is safe (no open redirect)
  const safePath = next.startsWith('/') ? next : '/dashboard/';
  return redirect(safePath, 302);
};
