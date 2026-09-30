-- ============================================================================
-- WISDO — Migración: clics en enlaces de afiliado (/go/{slug}/)
-- ============================================================================
-- Aplicada en Supabase como "affiliate_clicks". Idempotente.
-- ============================================================================

create table if not exists public.affiliate_clicks (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  tool         text not null,                  -- slug de la herramienta (apollo, lemlist…)
  source       text not null
                 check (source in ('market', 'resultado', 'email', 'otro')),
  lead_id      uuid references public.leads (id) on delete set null,
  referer_host text,
  is_bot       boolean not null default false  -- antivirus de correo, crawlers, previsualizaciones
);

create index if not exists idx_affiliate_clicks_time on public.affiliate_clicks (created_at desc);
create index if not exists idx_affiliate_clicks_tool on public.affiliate_clicks (tool, created_at desc);
create index if not exists idx_affiliate_clicks_lead on public.affiliate_clicks (lead_id) where lead_id is not null;

alter table public.affiliate_clicks enable row level security;

comment on table public.affiliate_clicks is 'Clics en enlaces de afiliado (/go/{slug}/). is_bot = true no son personas.';
