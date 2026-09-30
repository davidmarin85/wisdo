// POST /api/capture
// Se llama cuando el usuario deja su email en la pantalla post-quiz. Hace 3 cosas:
//   1. Guarda el email en el lead existente (por id)
//   2. Genera el texto de diagnóstico personalizado con la API de Claude (híbrido)
//   3. Dispara el email transaccional con Resend (src/lib/diagnosis-email.ts)
import type { APIRoute } from 'astro';
import { createSupabaseAdminClient } from '@lib/supabase-admin';
import { buildDiagnosisEmailHtml, buildDiagnosisEmailText, diagnosisEmailSubject } from '@lib/diagnosis-email';
import { QUESTIONS, resolveDiagnosis, type Archetype, type QuizAnswers, type Stack } from '@lib/wisdo-engine';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface CaptureRequestBody {
  id?: string;
  email?: string;
}

interface LeadRow {
  id: string;
  email: string | null;
  email_captured_at: string | null;
  problema_raiz: string | null;
  situacion_actual: string | null;
  tipo_negocio: string | null;
  etapa: string | null;
  answers_raw: QuizAnswers | null;
  website_url: string | null;
  website_profile: { resumen?: string; modelo_negocio?: string; nicho?: string; cliente_ideal?: string } | null;
}

function jsonResponse(payload: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let body: CaptureRequestBody;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'JSON inválido' }, 400);
  }

  const { id, email } = body;
  if (!id || !UUID_RE.test(id) || !email || !EMAIL_RE.test(email)) {
    return jsonResponse({ error: 'id o email inválido' }, 400);
  }

  const supabase = createSupabaseAdminClient();

  // — 1. Recuperar el lead —
  const { data: lead, error: fetchError } = await supabase
    .from('leads')
    .select('id, email, email_captured_at, problema_raiz, situacion_actual, tipo_negocio, etapa, answers_raw, website_url, website_profile')
    .eq('id', id)
    .single<LeadRow>();

  if (fetchError || !lead) {
    return jsonResponse({ error: 'Diagnóstico no encontrado' }, 404);
  }

  const redirect = `/resultado/${id}/`;

  // Ya se capturó antes: no regeneramos la IA ni reenviamos el email
  // (evita gastar cuota de Claude/Resend en reintentos o doble-click).
  if (lead.email_captured_at) {
    return jsonResponse({ ok: true, redirect });
  }

  // — 2. Generar el "por qué este stack" con la API de Claude —
  const { archetype, stack } = resolveDiagnosis(lead.answers_raw ?? {});
  let aiDiagnosis: string | null = null;
  try {
    aiDiagnosis = await generateDiagnosis(lead, archetype, stack);
  } catch (e) {
    // Si la IA falla, seguimos: la página tiene fallback. No bloqueamos el email.
    console.error('[api/capture] generateDiagnosis failed:', e);
    aiDiagnosis = null;
  }

  // — 3. Actualizar el lead con email + diagnóstico IA —
  const { error: updateError } = await supabase
    .from('leads')
    .update({
      email,
      email_captured_at: new Date().toISOString(),
      ai_diagnosis: aiDiagnosis,
      ai_generated_at: aiDiagnosis ? new Date().toISOString() : null,
    })
    .eq('id', id);

  if (updateError) {
    console.error('[api/capture] update error:', updateError.message);
    return jsonResponse({ error: 'Error al guardar el email' }, 502);
  }

  // — 4. Enviar email con Resend —
  const emailSent = await sendEmail({
    email,
    id,
    archetype,
    stack,
    aiDiagnosis,
    resumen: lead.website_profile?.resumen ?? null,
    siteHost: lead.website_url ? new URL(lead.website_url).hostname.replace(/^www\./, '') : null,
  });
  if (!emailSent) {
    console.error('[api/capture] Resend failed to send to lead', id);
  }

  return jsonResponse({ ok: true, redirect, emailSent });
};

// Etiqueta legible de una respuesta del quiz ("no_llegan_leads" → "No llegan…").
function optionLabel(questionId: string, value: string | null): string | null {
  if (!value) return null;
  return QUESTIONS.find((q) => q.id === questionId)?.options.find((o) => o.value === value)?.label ?? value;
}

// Genera el diagnóstico personalizado — el diferencial de wisdo.
// Modelo híbrido: las reglas ya eligieron el stack; la IA explica el PORQUÉ
// de forma personalizada al problema y situación concreta del usuario.
async function generateDiagnosis(lead: LeadRow, archetype: Archetype, stack: Stack): Promise<string | null> {
  const toolList = stack.tools.map((t) => `- ${t.name}: ${t.role}`).join('\n');

  const prompt = `Eres el estratega de wisdo, experto en stacks de ventas para pymes.
Un usuario ha completado un diagnóstico. Escribe un párrafo breve (máximo 4 frases, en español, tono directo y cercano de founder a founder) explicando por qué este stack resuelve su problema concreto. No saludes ni te presentes. No uses listas. Habla de su situación específica.

Reglas:
- Usa solo los datos de abajo. No inventes hechos sobre su negocio (de dónde le llegan los clientes, qué le pasa, cómo trabaja) que no estén en los datos.
- Di para qué sirve cada herramienta en su caso, con frases directas.
- No uses contrastes del tipo "no es X, es Y", ni guiones largos (—), ni una frase final que resuma lo ya dicho.

DATOS DEL USUARIO:
- Problema principal: ${optionLabel('problema_raiz', lead.problema_raiz) ?? 'no especificado'}
- Cómo lo resuelve hoy: ${optionLabel('situacion_actual', lead.situacion_actual) ?? 'no especificado'}
- Tipo de negocio: ${optionLabel('tipo_negocio', lead.tipo_negocio) ?? 'no especificado'}
- Etapa: ${optionLabel('etapa', lead.etapa) ?? 'no especificado'}
${lead.website_profile?.resumen ? `- Su negocio (según su web ${lead.website_url}): ${lead.website_profile.resumen} Modelo de negocio: ${lead.website_profile.modelo_negocio ?? 'no especificado'}. Nicho: ${lead.website_profile.nicho ?? 'no especificado'}. Cliente ideal: ${lead.website_profile.cliente_ideal ?? 'no especificado'}\n` : ''}- Arquetipo asignado: ${archetype.name} (${archetype.tagline})

STACK RECOMENDADO — "${stack.name}" (${stack.cost}):
${toolList}

Escribe el párrafo del "por qué este stack es para ti":`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    console.error('[api/capture] Anthropic API error:', res.status, await res.text());
    return null;
  }

  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = data.content
    ?.filter((b) => b.type === 'text')
    .map((b) => b.text ?? '')
    .join('')
    .trim();

  return text || null;
}

interface SendEmailParams {
  email: string;
  id: string;
  archetype: Archetype;
  stack: Stack;
  aiDiagnosis: string | null;
  resumen: string | null;
  siteHost: string | null;
}

// Envía el email de diagnóstico con Resend. Devuelve si se envió con éxito.
async function sendEmail({ email, id, archetype, stack, aiDiagnosis, resumen, siteHost }: SendEmailParams): Promise<boolean> {
  const siteUrl = import.meta.env.PUBLIC_SITE_URL;
  const resultUrl = `${siteUrl}/resultado/${id}/`;
  const params = { archetype, stack, aiDiagnosis, resumen, siteHost, resultUrl, leadId: id, siteUrl };

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${import.meta.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'wisdo <diagnostico@wisdo.io>',
      to: [email],
      subject: diagnosisEmailSubject(stack),
      html: buildDiagnosisEmailHtml(params),
      text: buildDiagnosisEmailText(params),
    }),
  });

  if (!res.ok) {
    console.error('[api/capture] Resend error:', res.status, await res.text());
  }
  return res.ok;
}
