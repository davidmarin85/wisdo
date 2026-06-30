import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import type { CookieMethodsServer } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase env vars: PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY are required.'
  );
}

interface ServerClientOptions {
  request: Request;
  cookies: AstroCookies;
}

export function createSupabaseServerClient({ request, cookies }: ServerClientOptions) {
  // Explicitly typed as CookieMethodsServer so TypeScript resolves the non-deprecated overload.
  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return parseCookieHeader(request.headers.get('Cookie') ?? '')
        .map(({ name, value }) => ({ name, value: value ?? '' }));
    },
    setAll(cookiesToSet) {
      for (const { name, value, options } of cookiesToSet) {
        cookies.set(name, value, {
          ...options,
          httpOnly: true,
          sameSite: 'lax',
          secure: import.meta.env.PROD,
        });
      }
    },
  };

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, { cookies: cookieMethods });
}
