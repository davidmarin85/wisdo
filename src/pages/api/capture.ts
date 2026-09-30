// POST /api/capture
// Se llama cuando el usuario deja su email en la pantalla post-quiz. Hace 3 cosas:
//   1. Guarda el email en el lead existente (por id)
//   2. Genera el texto de diagnóstico personalizado con la API de Claude (híbrido)
//   3. Dispara el email transaccional con Resend (src/lib/diagnosis-email.ts)
import type { APIRoute } from 'astro';
import { createSupabaseAdminClient } from '@lib/supabase-admin';
import { logAiUsage, type TokenUsage } from '@lib/ai-usage';
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
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  const { id, email } = body;
  if (!id || !UUID_RE.test(id) || !email || !EMAIL_RE.test(email)) {
    return jsonResponse({ error: 'Invalid id or email' }, 400);
  }

  const supabase = createSupabaseAdminClient();

  // — 1. Recuperar el lead —
  const { data: lead, error: fetchError } = await supabase
    .from('leads')
    .select('id, email, email_captured_at, problema_raiz, situacion_actual, tipo_negocio, etapa, answers_raw, website_url, website_profile')
    .eq('id', id)
    .single<LeadRow>();

  if (fetchError || !lead) {
    return jsonResponse({ error: 'Diagnosis not found' }, 404);
  }

  const redirect = `/diagnosis/${id}/`;

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
    return jsonResponse({ error: 'Couldn’t save the email' }, 502);
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

  const na = 'not specified';
  const prompt = `You are wisdo's strategist, an expert in sales stacks for small and mid-sized businesses.
A user has completed a diagnosis. Write a short paragraph (4 sentences max, in English, direct and friendly, founder to founder) explaining why this stack solves their specific problem. Don't greet or introduce yourself. No lists. Talk about their specific situation.

Rules:
- Use only the data below. Don't invent facts about their business (where their clients come from, what's happening to them, how they work) that aren't in the data.
- Say what each tool does in their case, in plain sentences.
- Don't use "it's not X, it's Y" contrasts, em dashes (—), or a closing sentence that sums up what you already said.

USER DATA:
- Main problem: ${optionLabel('problema_raiz', lead.problema_raiz) ?? na}
- How they handle it today: ${optionLabel('situacion_actual', lead.situacion_actual) ?? na}
- Business type: ${optionLabel('tipo_negocio', lead.tipo_negocio) ?? na}
- Stage: ${optionLabel('etapa', lead.etapa) ?? na}
${lead.website_profile?.resumen ? `- Their business (from their website ${lead.website_url}): ${lead.website_profile.resumen} Business model: ${lead.website_profile.modelo_negocio ?? na}. Niche: ${lead.website_profile.nicho ?? na}. Ideal customer: ${lead.website_profile.cliente_ideal ?? na}\n` : ''}- Assigned archetype: ${archetype.name} (${archetype.tagline})

RECOMMENDED STACK: "${stack.name}" (${stack.cost}):
${toolList}

Write the "why this stack fits you" paragraph:`;

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

  const data = (await res.json()) as {
    model?: string;
    usage?: TokenUsage;
    content?: { type: string; text?: string }[];
  };
  if (data.usage) {
    await logAiUsage({ route: 'capture', model: data.model ?? 'claude-sonnet-5', usage: data.usage, leadId: lead.id });
  }
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
  const resultUrl = `${siteUrl}/diagnosis/${id}/`;
  const params = { archetype, stack, aiDiagnosis, resumen, siteHost, resultUrl, leadId: id, siteUrl };

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${import.meta.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'wisdo <diagnosis@wisdo.io>',
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
