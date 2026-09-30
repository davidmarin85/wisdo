// GET /go/{slug}/?from=market|resultado|email&lead={uuid}
// Apunta el clic en Supabase (affiliate_clicks) y redirige al enlace de
// afiliado de PartnerStack. La redirección es lo importante: si Supabase va
// lento o falla, se redirige igual sin apuntar el clic.
import type { APIRoute } from 'astro';
import { createSupabaseAdminClient } from '@lib/supabase-admin';
import { partnerBySlug, type ClickSource } from '@lib/tool-links';

const SOURCES = new Set<ClickSource>(['market', 'resultado', 'email', 'otro']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LOG_TIMEOUT_MS = 800;

// Antivirus de correo, crawlers y previsualizaciones abren los enlaces sin que
// nadie haga clic. Se apuntan igual, marcados, para poder filtrarlos.
const BOT_RE =
  /bot|crawl|spider|slurp|preview|scanner|headless|lighthouse|python-requests|curl|wget|go-http-client|axios|node-fetch|googleimageproxy|proofpoint|mimecast|barracuda|safelinks|symantec|forcepoint|trendmicro/i;

export const GET: APIRoute = async ({ params, url, request }) => {
  const partner = partnerBySlug(params.slug ?? '');
  if (!partner) {
    return new Response('Enlace no encontrado', { status: 404 });
  }

  const fromParam = url.searchParams.get('from') as ClickSource | null;
  const source: ClickSource = fromParam && SOURCES.has(fromParam) ? fromParam : 'otro';
  const leadParam = url.searchParams.get('lead');
  const leadId = leadParam && UUID_RE.test(leadParam) ? leadParam : null;

  let refererHost: string | null = null;
  try {
    const referer = request.headers.get('referer');
    refererHost = referer ? new URL(referer).hostname : null;
  } catch {
    refererHost = null;
  }

  const insert = createSupabaseAdminClient()
    .from('affiliate_clicks')
    .insert({
      tool: partner.slug,
      source,
      lead_id: leadId,
      referer_host: refererHost,
      is_bot: BOT_RE.test(request.headers.get('user-agent') ?? ''),
    })
    .then(({ error }) => {
      if (error) console.error('[go] insert error:', error.message);
    });

  await Promise.race([insert, new Promise((r) => setTimeout(r, LOG_TIMEOUT_MS))]);

  return new Response(null, {
    status: 302,
    headers: {
      Location: partner.url,
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
      // No pasar a la herramienta la URL completa (lleva el id del lead).
      'Referrer-Policy': 'origin',
    },
  });
};
