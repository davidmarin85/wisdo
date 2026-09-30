// Envío a la Forms API de HubSpot desde el SERVIDOR (lo usa /api/contact/).
//
// Se hace en servidor y no desde el navegador porque los bloqueadores de anuncios
// bloquean las URLs con "hubspot" y el dominio hsforms.com: con el envío en el
// navegador, el formulario no llegaba a HubSpot para esos visitantes.
//
// El formulario de HubSpot es una DECLARACIÓN: un campo que se manda y que el
// formulario PUBLICADO no declara se descarta en silencio y la API responde 200.

// Públicos por diseño. Portal na1.
const PORTAL_ID = '7668836';
const FORM_GUID = 'fb56bb45-ef50-4062-b2b9-ed18b37cc4c4'; // "New contact form Astro"

export type Fields = Record<string, string | undefined | null>;

export interface SubmitContext {
  hutk?: string | undefined;
  pageUri?: string | undefined;
  pageName?: string | undefined;
}

/** Nunca lanza. Reintenta solo lo transitorio (red, 429, 5xx): 3 intentos. */
export async function submitToHubSpot(fields: Fields, context: SubmitContext): Promise<boolean> {
  const body = {
    // Sin vacíos: un "" en una enumeración tumba el envío entero.
    fields: Object.entries(fields)
      .filter((e): e is [string, string] => typeof e[1] === 'string' && e[1] !== '')
      .map(([name, value]) => ({ objectTypeId: '0-1', name, value })),
    context: Object.fromEntries(Object.entries(context).filter(([, v]) => v)),
  };

  const url = `https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${FORM_GUID}`;
  const backoff = [500, 1500];
  let last: number | string = 'network';

  for (let attempt = 0; attempt <= backoff.length; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, backoff[attempt - 1]));
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) return true;
      last = res.status;
      // Queda en los logs de Vercel: aquí sale qué campo o valor rechaza HubSpot.
      console.error('[hubspot-forms] HTTP', res.status, await res.text().catch(() => ''));
      // 4xx (salvo 429) es un problema de contrato: reintentar no cambia nada.
      if (res.status !== 429 && res.status < 500) return false;
    } catch (e) {
      last = 'network';
      console.error('[hubspot-forms] network error:', e);
    }
  }
  console.error('[hubspot-forms] exhausted, last:', last);
  return false;
}
