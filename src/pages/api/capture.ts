// POST /api/capture
// Se llama cuando el usuario deja su email en la pantalla post-quiz. Hace 3 cosas:
//   1. Guarda el email en el lead existente (por id)
//   2. Genera el texto de diagnóstico personalizado con la API de Claude (híbrido)
//   3. Dispara el email transaccional con Resend
import type { APIRoute } from 'astro';
import { createSupabaseAdminClient } from '@lib/supabase-admin';
import { resolveDiagnosis, type Archetype, type QuizAnswers, type Stack } from '@lib/wisdo-engine';

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
    .select('id, email, email_captured_at, problema_raiz, situacion_actual, tipo_negocio, etapa, answers_raw')
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
  const emailSent = await sendEmail({ email, id, archetype, stack, aiDiagnosis });
  if (!emailSent) {
    console.error('[api/capture] Resend failed to send to lead', id);
  }

  return jsonResponse({ ok: true, redirect, emailSent });
};

// Genera el diagnóstico personalizado — el diferencial de wisdo.
// Modelo híbrido: las reglas ya eligieron el stack; la IA explica el PORQUÉ
// de forma personalizada al problema y situación concreta del usuario.
async function generateDiagnosis(lead: LeadRow, archetype: Archetype, stack: Stack): Promise<string | null> {
  const toolList = stack.tools.map((t) => `- ${t.name}: ${t.role}`).join('\n');

  const prompt = `Eres el estratega de wisdo, experto en stacks de ventas para pymes.
Un usuario ha completado un diagnóstico. Escribe un párrafo breve (máximo 4 frases, en español, tono directo y cercano de founder a founder) explicando POR QUÉ este stack resuelve su problema concreto. No saludes ni te presentes. No uses listas. Habla de su situación específica.

DATOS DEL USUARIO:
- Problema principal: ${lead.problema_raiz ?? 'no especificado'}
- Cómo lo resuelve hoy: ${lead.situacion_actual ?? 'no especificado'}
- Tipo de negocio: ${lead.tipo_negocio ?? 'no especificado'}
- Etapa: ${lead.etapa ?? 'no especificado'}
- Arquetipo asignado: ${archetype.name} (${archetype.tagline})

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
}

// Envía el email de diagnóstico con Resend. Devuelve si se envió con éxito.
async function sendEmail({ email, id, archetype, stack, aiDiagnosis }: SendEmailParams): Promise<boolean> {
  const resultUrl = `${import.meta.env.PUBLIC_SITE_URL}/resultado/${id}/`;
  const html = buildEmailHtml({ archetype, stack, aiDiagnosis, resultUrl });

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${import.meta.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'wisdo <diagnostico@wisdo.io>',
      to: [email],
      subject: `Tu stack está listo: ${stack.name}`,
      html,
    }),
  });

  if (!res.ok) {
    console.error('[api/capture] Resend error:', res.status, await res.text());
  }
  return res.ok;
}

interface EmailHtmlParams {
  archetype: Archetype;
  stack: Stack;
  aiDiagnosis: string | null;
  resultUrl: string;
}

// Template del email (inline styles porque los clientes de correo lo exigen).
function buildEmailHtml({ archetype, stack, aiDiagnosis, resultUrl }: EmailHtmlParams): string {
  const tools = stack.tools
    .map(
      (t, i) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #2A2745;">
          <span style="color:#00E5C8;font-family:monospace;font-size:12px;">${String(i + 1).padStart(2, '0')}</span>
          &nbsp;<strong style="color:#F0EAFF;">${t.name}</strong>
          ${t.free ? '<span style="color:#13C28A;font-size:10px;">&nbsp;FREE</span>' : ''}
          <br/>
          <span style="color:#A8A2BD;font-size:13px;">${t.role}</span>
        </td>
      </tr>`
    )
    .join('');

  return `
  <div style="background:#14121F;padding:32px;font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;border-radius:16px;">
    <div style="color:#F0EAFF;font-size:20px;font-weight:700;margin-bottom:24px;">wisdo</div>
    <div style="display:inline-block;background:rgba(108,92,231,0.2);border:1px solid #6C5CE7;border-radius:999px;padding:6px 12px;margin-bottom:16px;">
      <span style="color:#9747FF;font-size:12px;font-weight:700;">${archetype.emoji} ${archetype.name}</span>
    </div>
    <h1 style="color:#F0EAFF;font-size:26px;margin:0 0 8px;">${stack.name}</h1>
    <p style="color:#A8A2BD;font-size:14px;margin:0 0 20px;">Coste estimado: <strong style="color:#00E5C8;">${stack.cost}</strong></p>
    ${aiDiagnosis ? `<p style="color:#C9B8FF;font-size:15px;line-height:1.6;background:rgba(108,92,231,0.1);padding:16px;border-radius:12px;border-left:3px solid #6C5CE7;margin:0 0 24px;">${aiDiagnosis}</p>` : ''}
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">${tools}</table>
    <a href="${resultUrl}" style="display:inline-block;background:#6C5CE7;color:#fff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:700;">Ver tu diagnóstico completo →</a>
    <p style="color:#7E7995;font-size:12px;margin-top:24px;">Guarda este email. Tu diagnóstico vive en el enlace de arriba.</p>
  </div>`;
}
