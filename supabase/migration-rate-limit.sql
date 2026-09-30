-- ============================================================================
-- WISDO — Migración: límite de uso de /api/analyze
-- ============================================================================
-- Aplicada en Supabase como "analyze_rate_limit". Idempotente.
-- Cada análisis cuesta una llamada a Claude. Solo se guarda un HMAC de la IP
-- (calculado en el servidor), nunca la IP.
-- ============================================================================

create table if not exists public.analyze_requests (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  ip_hash    text not null
);

create index if not exists idx_analyze_requests_ip_time on public.analyze_requests (ip_hash, created_at desc);
create index if not exists idx_analyze_requests_time    on public.analyze_requests (created_at desc);

alter table public.analyze_requests enable row level security;

-- Comprueba los límites y, si pasa, registra la petición en la misma llamada.
-- Devuelve 'ok', 'ip' (límite por IP) o 'global' (tope diario).
create or replace function public.analyze_rate_check(
  p_ip_hash      text,
  p_per_ip       int,
  p_ip_window    interval,
  p_global_daily int
) returns text
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- Limpieza: no necesitamos más de dos días de historia.
  delete from public.analyze_requests where created_at < now() - interval '2 days';

  if (select count(*) from public.analyze_requests
      where ip_hash = p_ip_hash and created_at > now() - p_ip_window) >= p_per_ip then
    return 'ip';
  end if;

  if (select count(*) from public.analyze_requests
      where created_at > now() - interval '1 day') >= p_global_daily then
    return 'global';
  end if;

  insert into public.analyze_requests (ip_hash) values (p_ip_hash);
  return 'ok';
end;
$$;

revoke execute on function public.analyze_rate_check(text, int, interval, int) from public, anon, authenticated;
grant execute on function public.analyze_rate_check(text, int, interval, int) to service_role;

comment on table public.analyze_requests is 'Registro de llamadas a /api/analyze para limitar abuso. Se purga a los 2 días.';
