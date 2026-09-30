// Registro del consumo de cada llamada a Claude (tabla ai_usage), para saber
// el coste real por diagnóstico. Nunca bloquea ni rompe la respuesta: si
// Supabase falla, solo se escribe en el log.
import { createSupabaseAdminClient } from '@lib/supabase-admin';

// USD por millón de tokens. Precios de la API de Anthropic (septiembre 2026).
// Escritura en caché = 1,25 × entrada; lectura en caché según cada modelo.
const PRICES: Record<string, { input: number; output: number; cacheRead: number }> = {
  'claude-opus-5-5': { input: 4, output: 20, cacheRead: 0.2 },
  'claude-sonnet-5-5': { input: 2, output: 10, cacheRead: 0.2 },
  'claude-sonnet-5': { input: 2, output: 10, cacheRead: 0.2 },
  'claude-haiku-4-5': { input: 1, output: 5, cacheRead: 0.1 },
};

export interface TokenUsage {
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
}

/** Coste en USD, o null si el modelo no está en la tabla de precios. */
export function usageCostUsd(model: string, usage: TokenUsage): number | null {
  // La API puede devolver el id con sufijo de fecha; se compara por prefijo.
  const key = Object.keys(PRICES).find((k) => model === k || model.startsWith(`${k}-`));
  if (!key) return null;
  const p = PRICES[key]!;
  const cost =
    ((usage.input_tokens ?? 0) * p.input +
      (usage.output_tokens ?? 0) * p.output +
      (usage.cache_read_input_tokens ?? 0) * p.cacheRead +
      (usage.cache_creation_input_tokens ?? 0) * p.input * 1.25) /
    1_000_000;
  return Math.round(cost * 1_000_000) / 1_000_000;
}

export async function logAiUsage(params: {
  route: 'analyze' | 'capture';
  model: string;
  usage: TokenUsage;
  leadId?: string | null;
}): Promise<void> {
  const { route, model, usage, leadId } = params;
  try {
    const { error } = await createSupabaseAdminClient()
      .from('ai_usage')
      .insert({
        route,
        model,
        input_tokens: usage.input_tokens ?? 0,
        output_tokens: usage.output_tokens ?? 0,
        cache_read_tokens: usage.cache_read_input_tokens ?? 0,
        cache_write_tokens: usage.cache_creation_input_tokens ?? 0,
        cost_usd: usageCostUsd(model, usage),
        lead_id: leadId ?? null,
      });
    if (error) console.error('[ai-usage] insert error:', error.message);
  } catch (e) {
    console.error('[ai-usage] failed:', e);
  }
}
