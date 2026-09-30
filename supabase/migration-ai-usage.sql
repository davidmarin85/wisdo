-- ============================================================================
-- WISDO — Migración: consumo de tokens de Claude
-- ============================================================================
-- Aplicada en Supabase como "ai_usage". Idempotente.
-- ============================================================================

create table if not exists public.ai_usage (
  id                  bigint generated always as identity primary key,
  created_at          timestamptz not null default now(),
  route               text not null,        -- 'analyze' | 'capture'
  model               text not null,        -- modelo que respondió (puede ser el de fallback)
  input_tokens        integer not null default 0,
  output_tokens       integer not null default 0,
  cache_read_tokens   integer not null default 0,
  cache_write_tokens  integer not null default 0,
  cost_usd            numeric(10, 6),       -- calculado con la tabla de precios del código
  lead_id             uuid references public.leads (id) on delete set null
);

create index if not exists idx_ai_usage_time on public.ai_usage (created_at desc);

alter table public.ai_usage enable row level security;

comment on table public.ai_usage is 'Tokens y coste de cada llamada a Claude (analyze, capture).';
