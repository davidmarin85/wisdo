-- ============================================================================
-- WISDO — Migración: diagnóstico por URL (/api/analyze)
-- ============================================================================
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query → Run
-- Es idempotente: se puede ejecutar más de una vez sin romper nada.
-- ============================================================================

alter table public.leads
  add column if not exists website_url     text,
  add column if not exists website_profile jsonb;  -- perfil que devuelve Claude + herramientas detectadas

comment on column public.leads.website_url is 'Web analizada en /api/analyze (tras seguir redirecciones). Null en leads del quiz.';
comment on column public.leads.website_profile is 'Perfil del negocio deducido por Claude a partir de la web: tipo_negocio, etapa, resumen, cliente_ideal, confianza, detected_tools.';
