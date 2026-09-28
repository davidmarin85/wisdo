// POST /api/contact/
// Recibe el formulario de contacto (ContactForm.astro) y lo reenvía a HubSpot.
//   - Con JavaScript: llega como JSON y responde JSON { ok }.
//   - Sin JavaScript (o si el script no cargó): llega como un POST de formulario
//     normal y responde con una redirección a la página de origen con
//     ?contact=sent o ?contact=error, que el componente muestra.
import type { APIRoute } from 'astro';
import { submitToHubSpot, type Fields } from '@lib/hubspot-forms';

// Formato razonable, no RFC completo. HubSpot descarta los dominios inexistentes
// devolviendo 200 igualmente, así que esto solo filtra erratas obvias.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Solo estos campos pasan a HubSpot, con un tope de longitud cada uno.
const VISIBLE = { firstname: 100, lastname: 100, email: 254, phone: 30, company: 150, message: 2000 } as const;
const HIDDEN = {
  lead_utm_source: 255,
  lead_utm_medium: 255,
  lead_utm_campaign: 255,
  lead_utm_content: 255,
  lead_utm_term: 255,
  lead_landing_url: 2000,
  lead_referrer_url: 2000,
} as const;

function clean(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

/** Solo rutas del propio sitio, para no convertir el endpoint en un redirector abierto. */
function backTo(request: Request, pageUri: string, status: 'sent' | 'error'): Response {
  let path = '/';
  try {
    const u = new URL(pageUri || request.headers.get('referer') || '/', request.url);
    if (u.origin === new URL(request.url).origin) path = u.pathname;
  } catch {
    /* se queda en / */
  }
  return new Response(null, { status: 303, headers: { Location: `${path}?contact=${status}#contact` } });
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const isJson = (request.headers.get('content-type') || '').includes('application/json');

  let input: Record<string, unknown>;
  try {
    input = isJson ? await request.json() : Object.fromEntries(await request.formData());
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_body' }), { status: 400 });
  }

  const pageUri = clean(input['pageUri'], 2000) || request.headers.get('referer') || '';
  const reply = (ok: boolean, status = ok ? 200 : 400) =>
    isJson
      ? new Response(JSON.stringify({ ok }), { status, headers: { 'Content-Type': 'application/json' } })
      : backTo(request, pageUri, ok ? 'sent' : 'error');

  // Honeypot relleno: fingir éxito y no mandar nada.
  if (clean(input['website'], 200) !== '') return reply(true);

  const fields: Fields = {};
  for (const [k, max] of Object.entries(VISIBLE)) fields[k] = clean(input[k], max);
  if (isJson) for (const [k, max] of Object.entries(HIDDEN)) fields[k] = clean(input[k], max);

  if (!EMAIL_RE.test(fields['email'] ?? '')) return reply(false);

  const ok = await submitToHubSpot(fields, {
    // Solo existe si el script de seguimiento de HubSpot está en la página.
    hutk: cookies.get('hubspotutk')?.value,
    pageUri,
    pageName: clean(input['pageName'], 300),
  });
  return reply(ok, ok ? 200 : 502);
};
