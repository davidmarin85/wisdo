import type { AstroCookies } from 'astro';
import { createSupabaseServerClient } from './supabase';

interface AuthClientOptions {
  request: Request;
  cookies: AstroCookies;
}

export async function getSession({ request, cookies }: AuthClientOptions) {
  const supabase = createSupabaseServerClient({ request, cookies });
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) return null;
  return session;
}

export async function getUser({ request, cookies }: AuthClientOptions) {
  const supabase = createSupabaseServerClient({ request, cookies });
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) return null;
  return user;
}

export function buildLoginUrl(destination: string): string {
  const params = new URLSearchParams({ next: destination });
  return `/login/?${params.toString()}`;
}

export function getOAuthRedirectUrl(): string {
  return import.meta.env.PUBLIC_OAUTH_REDIRECT_URL as string;
}
