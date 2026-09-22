// POST /api/diagnose
// Recibe las respuestas del quiz, deriva el diagnóstico con el motor de
// reglas, guarda el lead en Supabase y devuelve el id único para redirigir a
// /resultado/{id}/. La generación del texto IA se dispara aparte (en
// /api/capture) para no bloquear la respuesta al usuario.
import type { APIRoute } from 'astro';
import { createSupabaseAdminClient } from '@lib/supabase-admin';
import { resolveDiagnosis, validateAnswers, type QuizAnswers } from '@lib/wisdo-engine';

interface DiagnoseRequestBody {
  answers?: QuizAnswers;
  utm?: { source?: string; medium?: string; campaign?: string };
}

function jsonResponse(payload: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let body: DiagnoseRequestBody;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'JSON inválido' }, 400);
  }

  const { answers, utm } = body;

  // 1. Validar (presencia + que los valores sean los del quiz, no texto libre)
  const { valid, missing, invalid } = validateAnswers(answers);
  if (!valid) {
    return jsonResponse({ error: 'Respuestas incompletas o inválidas', missing, invalid }, 400);
  }
  const safeAnswers = answers as QuizAnswers;

  // 2. Derivar diagnóstico (motor determinista)
  const { archetype, stackKey } = resolveDiagnosis(safeAnswers);

  // 3. Guardar en Supabase (service_role, salta RLS)
  const supabase = createSupabaseAdminClient();
  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      problema_raiz: safeAnswers.problema_raiz,
      situacion_actual: safeAnswers.situacion_actual ?? null,
      tipo_negocio: safeAnswers.tipo_negocio ?? null,
      etapa: safeAnswers.etapa ?? null,
      presupuesto: safeAnswers.presupuesto,
      archetype: archetype.name,
      stack_key: stackKey,
      answers_raw: safeAnswers,
      source: 'quiz',
      utm_source: utm?.source ?? null,
      utm_medium: utm?.medium ?? null,
      utm_campaign: utm?.campaign ?? null,
    })
    .select('id')
    .single();

  if (error || !lead) {
    console.error('[api/diagnose] insert error:', error?.message);
    return jsonResponse({ error: 'Error al guardar' }, 502);
  }

  // 4. Devolver el id para redirigir. NO esperamos a la IA: el texto
  //    personalizado se genera en /api/capture al dejar el email.
  return jsonResponse({
    id: lead.id,
    archetype: archetype.name,
    stackKey,
    redirect: `/resultado/${lead.id}/`,
  });
};
