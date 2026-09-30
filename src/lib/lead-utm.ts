// UTMs de primer toque, en el navegador. Las lee ContactForm y las manda a
// /api/contact/, que las pasa a HubSpot como campos ocultos lead_utm_* (tienen que
// existir como propiedades de contacto y estar en el formulario de HubSpot).
//
// El nombre del fichero evita "hubspot" a propósito: los bloqueadores de anuncios
// bloquean los scripts cuya URL lo contiene, y con ellos caía todo el formulario.

type Fields = Record<string, string | undefined>;

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
