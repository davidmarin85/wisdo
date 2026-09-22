-- ============================================================================
-- WISDO — Schema de Supabase (Fase 1: Lead Magnet / quiz)
-- ============================================================================
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================================

-- pgcrypto nos da gen_random_uuid() para los IDs únicos de cada diagnóstico
create extension if not exists pgcrypto;

-- ============================================================================
-- TABLA: leads
-- ============================================================================
-- Cada fila es un diagnóstico completo de un usuario.
-- El id (uuid) es lo que va en la URL: wisdo.io/resultado/{id}/
-- No hay login: quien tiene el link, ve su diagnóstico. El uuid es
-- imposible de adivinar, así que funciona como "contraseña" implícita.
-- ============================================================================

create table if not exists public.leads (
  -- Identidad del diagnóstico
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),

  -- Captura de email (puede ser null si aún no lo dejó)
  email             text,
  email_captured_at timestamptz,

  -- — Respuestas del quiz (el diagnóstico en crudo) —
  -- Guardamos cada respuesta por separado para poder hacer analytics después
  -- sin parsear un JSON. Los CHECK constraints son la última línea de
  -- defensa: la API ya valida contra QUESTIONS en src/lib/wisdo-engine.ts,
  -- pero así una fila nunca puede quedar con un valor fuera del enum aunque
  -- se inserte por otra vía.
  problema_raiz     text not null
                       check (problema_raiz in ('no_llegan_leads', 'prospeccion_manual', 'leads_no_cierran', 'sin_seguimiento')),
  situacion_actual  text
                       check (situacion_actual is null or situacion_actual in ('todo_manual', 'herramientas_sueltas', 'equipo_externo', 'nada')),
  tipo_negocio      text
                       check (tipo_negocio is null or tipo_negocio in ('agencia', 'saas', 'consultor', 'ecommerce')),
  etapa             text
                       check (etapa is null or etapa in ('validando', 'creciendo', 'escalando')),
  presupuesto       text not null
                       check (presupuesto in ('0-100', '100-500', '500+')),

  -- — Resultado derivado (calculado por las reglas) —
  archetype         text,            -- "The Ruler" | "The Magician" | "The Sage" | "The Hero"
  stack_key         text,            -- clave del stack recomendado (ej: "captacion_completa")

  -- — Diagnóstico IA (el "por qué este stack para ti") —
  -- Se rellena de forma asíncrona en /api/capture tras generar con Claude.
  -- null mientras se genera o si la IA falla — la página muestra un fallback.
  ai_diagnosis      text,
  ai_generated_at   timestamptz,

  -- — Metadata útil para analytics —
  answers_raw       jsonb,           -- copia completa de las respuestas por si añadimos preguntas
  source            text default 'quiz',
  utm_source        text,
  utm_medium        text,
  utm_campaign      text
);

-- — Índices —
create index if not exists idx_leads_email      on public.leads (email);
create index if not exists idx_leads_problema   on public.leads (problema_raiz);
create index if not exists idx_leads_created_at on public.leads (created_at desc);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- El frontend (clave anon) NO puede leer ni escribir esta tabla directamente.
-- Todo pasa por los endpoints /api/diagnose y /api/capture (Astro, server-side)
-- que usan SUPABASE_SERVICE_ROLE_KEY y por tanto saltan RLS. Así el uuid del
-- diagnóstico es la única "llave" y nunca exponemos el listado completo.
-- ============================================================================

alter table public.leads enable row level security;
-- Sin políticas permisivas para el rol anon = nadie con la clave pública
-- puede leer ni escribir. Solo el service_role (servidor) tiene acceso.

comment on table  public.leads is 'Diagnósticos del quiz de wisdo. Cada fila = un stack recomendado a un usuario.';
comment on column public.leads.id is 'UUID único. Va en la URL /resultado/{id}/. Funciona como llave de acceso al diagnóstico.';
comment on column public.leads.problema_raiz is 'El dolor principal que el usuario seleccionó primero. Campo de analytics clave.';
comment on column public.leads.ai_diagnosis is 'Texto personalizado generado por la API de Claude explicando por qué este stack. Null mientras se genera.';
