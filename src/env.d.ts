/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user: import('@supabase/supabase-js').User | null;
  }
}


interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  readonly PUBLIC_SITE_URL: string;
  readonly PUBLIC_OAUTH_REDIRECT_URL: string;
  readonly CANONICAL_HOST: string;

  // Server-only — nunca exponer al frontend (sin prefijo PUBLIC_)
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
  readonly ANTHROPIC_API_KEY: string;
  readonly RESEND_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
