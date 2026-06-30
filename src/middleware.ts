import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient } from '@lib/supabase';
import { buildLoginUrl } from '@lib/auth';

const PRIVATE_PREFIXES = ['/dashboard/', '/tools/'];

function isPrivateRoute(pathname: string): boolean {
  return PRIVATE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, cookies, redirect } = context;
  const url = new URL(request.url);

  if (!isPrivateRoute(url.pathname)) {
    return next();
  }

  const supabase = createSupabaseServerClient({ request, cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect(buildLoginUrl(url.pathname), 302);
  }

  // Attach user to locals so pages don't need to re-fetch
  context.locals.user = user;

  return next();
});
