// Envío de formularios propios a HubSpot mediante la Forms API (endpoint público).
// Solo navegador: usa document, window y sessionStorage.
//
// El formulario de HubSpot es una DECLARACIÓN: un campo que se manda y que el
// formulario PUBLICADO no declara se descarta en silencio y la API responde 200.
// Cada nombre de campo de aquí tiene que existir como propiedad de contacto y
// estar en el formulario (los que pone el código, como las UTMs, ocultos).

// Públicos por diseño: se ven en cualquier inspección del navegador. Portal na1.
const PORTAL_ID = '7668836';
const FORM_GUID = 'fb56bb45-ef50-4062-b2b9-ed18b37cc4c4'; // "New contact form Astro"

export type Fields = Record<string, string | number | boolean | undefined | null>;

type OnEvent = (name: string, extra?: Record<string, unknown>) => void;

function getHutk(): string | undefined {
  const m = document.cookie.match(/(?:^|;\s*)hubspotutk=([^;]+)/);
  return m?.[1] ? decodeURIComponent(m[1]) : undefined;
}

// ---------- UTMs de primer toque ----------

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
const UTM_STORE = 'lead_utm';

/** Llamar al CARGAR cada página (no al enviar): la URL con UTMs es la de
 *  aterrizaje, y al enviar el visitante puede estar ya en otra página.
 *  Primer toque por pestaña y sesión: para conservarlo entre visitas habría que
 *  cambiar sessionStorage por localStorage con caducidad. */
export function captureUtms(): void {
  try {
    if (sessionStorage.getItem(UTM_STORE)) return; // primer toque: no sobrescribir
    const params = new URLSearchParams(window.location.search);
    const utms: Record<string, string> = {};
    for (const k of UTM_KEYS) {
      const v = params.get(k);
      if (v) utms[k] = v;
    }
    if (Object.keys(utms).length === 0) return; // sin UTMs no se guarda nada
    utms['landing_url'] = window.location.href;
    utms['referrer'] = document.referrer;
    sessionStorage.setItem(UTM_STORE, JSON.stringify(utms));
  } catch {
    /* storage bloqueado: el envío sigue, solo sin UTMs */
  }
}

/** Las UTMs guardadas, con los nombres internos de las propiedades en HubSpot. */
export function getUtmFields(): Fields {
  try {
    const u = JSON.parse(sessionStorage.getItem(UTM_STORE) || '{}') as Record<string, string | undefined>;
    return {
      lead_utm_source: u['utm_source'],
      lead_utm_medium: u['utm_medium'],
      lead_utm_campaign: u['utm_campaign'],
      lead_utm_content: u['utm_content'],
      lead_utm_term: u['utm_term'],
      lead_landing_url: u['landing_url'],
      lead_referrer_url: u['referrer'],
    };
  } catch {
    return {};
  }
}

// ---------- Envío ----------

/** Nunca lanza: devuelve true/false y reporta por onEvent. */
export async function submitToHubSpot(fields: Fields, options: { onEvent?: OnEvent } = {}): Promise<boolean> {
  const { onEvent } = options;

  const body = {
    // Sin vacíos: un "" en una enumeración tumba el envío entero.
    fields: Object.entries(fields)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([name, value]) => ({ objectTypeId: '0-1', name, value: String(value) })),
    context: {
      hutk: getHutk(), // undefined sin el script de seguimiento o sin cookies aceptadas
      pageUri: window.location.href,
      pageName: document.title,
    },
  };

  const url = `https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${FORM_GUID}`;
  // Esperas ANTES de cada reintento: 3 intentos en total (1 + 2 reintentos).
  const backoff = [500, 1500];
  // Último motivo de fallo, para que 'exhausted' diga si fue la red o HubSpot.
  let last: number | string = 'network';

  for (let attempt = 0; attempt <= backoff.length; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, backoff[attempt - 1]));
    try {
      const res = await fetch(url, {
        method: 'POST',
        // Que la petición en curso sobreviva si la página navega justo después.
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        onEvent?.('hubspot_submit');
        return true;
      }
      last = res.status;
      // 4xx (salvo 429) es un problema de contrato: reintentar no cambia nada.
      if (res.status !== 429 && res.status < 500) {
        console.error('[hubspot] Envío rechazado:', res.status, await res.text().catch(() => ''));
        onEvent?.('hubspot_error', { status: res.status });
        return false;
      }
    } catch {
      last = 'network';
    }
  }
  onEvent?.('hubspot_error', { status: 'exhausted', last });
  return false;
}
