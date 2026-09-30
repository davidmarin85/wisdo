// POST /api/analyze
// Sustituye al quiz largo: el usuario da su web + responde UNA pregunta
// (problema_raiz). Hace 4 cosas:
//   1. Descarga la web (con protección SSRF, ver src/lib/site-reader.ts)
//   2. Claude analiza el negocio: modelo, servicios, nicho, cliente, etapa…
//   3. El motor de reglas decide arquetipo + stack, igual que en el quiz
//   4. Guarda el lead en Supabase
//
// Los errores de entrada o de lectura de la web se devuelven como JSON con
// 400/422 (el front cae al mensaje de "no hemos podido leer tu web"). A partir
// de ahí la respuesta es un stream NDJSON, un evento por línea, para que la
// pantalla de carga vaya enseñando lo que se descubre:
//   {"type":"site", host, title, tools}      web leída
//   {"type":"profile", profile}              análisis de Claude
//   {"type":"done", id, redirect, stack}     lead guardado
//   {"type":"error", code, error}            fallo tras empezar el stream
import type { APIRoute } from 'astro';
import { createHmac } from 'node:crypto';
import Anthropic from '@anthropic-ai/sdk';
import { createSupabaseAdminClient } from '@lib/supabase-admin';
import { normalizeUrl, readSite, SiteReadError, type SiteSnapshot } from '@lib/site-reader';
import { logAiUsage, type TokenUsage } from '@lib/ai-usage';
import { profileWebsite, type WebsiteProfile } from '@lib/website-profile';
import { resolveDiagnosis, validateAnswers, type QuizAnswers } from '@lib/wisdo-engine';

interface AnalyzeRequestBody {
  url?: string;
  problema_raiz?: string;
  website?: string; // honeypot: campo oculto que solo rellenan los bots
  utm?: { source?: string; medium?: string; campaign?: string };
}


const MAX_SERVICIOS = 5;

// Sin pregunta de presupuesto, lo aproximamos por la etapa del negocio.
const PRESUPUESTO_POR_ETAPA: Record<WebsiteProfile['etapa'], string> = {
  validando: '0-100',
  creciendo: '100-500',
  escalando: '500+',
};

// Herramientas que indican que ya tienen algo montado para vender/captar
// (el CMS o la analítica no cuentan).
const SALES_TOOLS = new Set([
  'HubSpot', 'Salesforce / Pardot', 'Zoho', 'Pipedrive', 'Mailchimp', 'Klaviyo',
  'ActiveCampaign', 'Brevo', 'Intercom', 'Crisp', 'Tidio', 'Calendly', 'Typeform',
]);

// Límites de uso. Cada análisis es una llamada a Claude (~1 céntimo), así que
// el tope global acota el gasto diario aunque el abuso venga de muchas IPs.
const RATE_PER_IP = 5;
const RATE_IP_WINDOW = '1 hour';
const RATE_GLOBAL_DAILY = 200;

const RATE_MESSAGES: Record<string, string> = {
  ip: 'You’ve run several analyses in a row. Please wait a while and try again.',
  global: 'We’ve received a lot of analyses today. Please try again tomorrow, or book a call with us.',
};

const anthropic = new Anthropic({ apiKey: import.meta.env.ANTHROPIC_API_KEY });

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false; // "null" u otros valores que no son una URL
  }
}

function jsonResponse(payload: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Solo aceptamos peticiones hechas desde nuestra propia web. Un script puede
  // falsear Origin, pero esto corta el uso directo desde otras webs.
  if (!isSameOrigin(request)) {
    return jsonResponse({ error: 'Origin not allowed' }, 403);
  }

  let body: AnalyzeRequestBody;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  const { url, problema_raiz, utm, website } = body;
  if (website) {
    return jsonResponse({ error: 'Invalid request' }, 400);
  }
  if (typeof url !== 'string' || url.length > 300) {
    return jsonResponse({ error: 'Invalid URL', code: 'invalid_url' }, 400);
  }
  const problemaCheck = validateAnswers({ problema_raiz });
  if (!problema_raiz || problemaCheck.invalid.includes('problema_raiz')) {
    return jsonResponse({ error: 'Invalid problema_raiz' }, 400);
  }

  // Formato de la URL antes de contar la petición: una errata no gasta intento.
  try {
    normalizeUrl(url);
  } catch (e) {
    const message = e instanceof SiteReadError ? e.message : 'Invalid URL';
    return jsonResponse({ error: message, code: 'invalid_url' }, 400);
  }

  // — 0. Límite de uso (antes de gastar nada en leer la web o en Claude) —
  const supabase = createSupabaseAdminClient();
  const ipHash = createHmac('sha256', import.meta.env.SUPABASE_SERVICE_ROLE_KEY)
    .update(clientAddress ?? 'unknown')
    .digest('hex');
  const { data: rate, error: rateError } = await supabase.rpc('analyze_rate_check', {
    p_ip_hash: ipHash,
    p_per_ip: RATE_PER_IP,
    p_ip_window: RATE_IP_WINDOW,
    p_global_daily: RATE_GLOBAL_DAILY,
  });
  if (rateError) {
    // Si el límite no se puede comprobar, cerramos: mejor un fallo que gasto sin control.
    console.error('[api/analyze] rate check failed:', rateError.message);
    return jsonResponse({ error: 'Service unavailable, please try again later', code: 'unavailable' }, 503);
  }
  if (rate !== 'ok') {
    console.warn('[api/analyze] rate limited:', rate);
    return jsonResponse({ error: RATE_MESSAGES[rate] ?? RATE_MESSAGES.ip, code: 'rate_limited' }, 429);
  }

  // — 1. Leer la web (antes del stream, para poder responder 4xx) —
  let site: SiteSnapshot;
  try {
    site = await readSite(url);
  } catch (e) {
    if (e instanceof SiteReadError) {
      const status = e.code === 'invalid_url' || e.code === 'blocked_host' ? 400 : 422;
      return jsonResponse({ error: e.message, code: e.code }, status);
    }
    console.error('[api/analyze] readSite failed:', e);
    return jsonResponse({ error: 'Couldn’t read the website', code: 'fetch_failed' }, 422);
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: Record<string, unknown>) =>
        controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'));

      send({
        type: 'site',
        host: new URL(site.finalUrl).hostname.replace(/^www\./, ''),
        title: site.title,
        tools: site.detectedTools,
      });

      try {
        // — 2. Análisis del negocio con Claude —
        let profile: WebsiteProfile | null;
        let aiModel = '';
        let aiUsage: TokenUsage | null = null;
        try {
          const result = await profileWebsite(anthropic, site);
          profile = result.profile;
          aiModel = result.model;
          aiUsage = result.usage;
        } catch (e) {
          console.error('[api/analyze] profileWebsite failed:', e);
          profile = null;
        }
        if (!profile) {
          if (aiUsage) await logAiUsage({ route: 'analyze', model: aiModel, usage: aiUsage });
          send({ type: 'error', code: 'ai_failed', error: 'We couldn’t analyze the website' });
          return;
        }
        profile.servicios = profile.servicios.slice(0, MAX_SERVICIOS);
        send({ type: 'profile', profile });

        // — 3. Mismo motor de reglas que el quiz —
        const answers: QuizAnswers = {
          problema_raiz,
          tipo_negocio: profile.tipo_negocio === 'otro' ? undefined : profile.tipo_negocio,
          etapa: profile.etapa,
          presupuesto: PRESUPUESTO_POR_ETAPA[profile.etapa],
          situacion_actual: site.detectedTools.some((t) => SALES_TOOLS.has(t)) ? 'herramientas_sueltas' : undefined,
        };
        const { archetype, stackKey, stack } = resolveDiagnosis(answers);

        // — 4. Guardar en Supabase —
        const { data: lead, error } = await supabase
          .from('leads')
          .insert({
            problema_raiz: answers.problema_raiz,
            situacion_actual: answers.situacion_actual ?? null,
            tipo_negocio: answers.tipo_negocio ?? null,
            etapa: answers.etapa,
            presupuesto: answers.presupuesto,
            archetype: archetype.name,
            stack_key: stackKey,
            answers_raw: answers,
            website_url: site.finalUrl,
            website_profile: { ...profile, detected_tools: site.detectedTools },
            source: 'web',
            utm_source: utm?.source ?? null,
            utm_medium: utm?.medium ?? null,
            utm_campaign: utm?.campaign ?? null,
          })
          .select('id')
          .single();

        await logAiUsage({ route: 'analyze', model: aiModel, usage: aiUsage!, leadId: lead?.id ?? null });

        if (error || !lead) {
          console.error('[api/analyze] insert error:', error?.message);
          send({ type: 'error', code: 'save_failed', error: 'Couldn’t save the diagnosis' });
          return;
        }

        send({
          type: 'done',
          id: lead.id,
          archetype: archetype.name,
          stack: stack.name,
          redirect: `/diagnosis/${lead.id}/`,
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Accel-Buffering': 'no',
    },
  });
};
