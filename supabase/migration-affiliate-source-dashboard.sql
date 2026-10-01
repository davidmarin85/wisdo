-- ============================================================================
-- WISDO — Migración: origen "dashboard" en affiliate_clicks
-- ============================================================================
-- Los botones "Try →" del dashboard (/dashboard/) apuntan los clics con
-- source = 'dashboard'. Sin esta migración el CHECK rechaza el insert (el
-- redirect sigue funcionando, pero el clic no se apunta).
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query → Run. Idempotente.
-- ============================================================================

alter table public.affiliate_clicks
  drop constraint if exists affiliate_clicks_source_check;

alter table public.affiliate_clicks
  add constraint affiliate_clicks_source_check
  check (source in ('market', 'resultado', 'email', 'dashboard', 'otro'));
