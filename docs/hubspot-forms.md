# Conectar un formulario web con HubSpot

Guía para conectar un formulario propio (HTML/JS, cualquier framework) con HubSpot,
de forma que cree o actualice contactos mediante la **Forms API**. Es la versión 4:
sale de montar el formulario de contacto de wisdo.io, y cambia una decisión clave
respecto a la v3. **El envío se hace desde el servidor, no desde el navegador**
(ver apartado 1).

Implementación de referencia en este repo:

| Pieza | Fichero |
| --- | --- |
| Formulario (HTML + script) | `src/components/site/ContactForm.astro` |
| Endpoint propio | `src/pages/api/contact.ts` → `POST /api/contact/` |
| Envío a HubSpot (solo servidor) | `src/lib/hubspot-forms.ts` |
| UTMs de primer toque (navegador) | `src/lib/lead-utm.ts`, llamado desde `src/layouts/SiteLayout.astro` |

---

## 1. Cómo funciona

```
Navegador ──POST JSON──▶ /api/contact/ (tu dominio) ──POST──▶ api.hsforms.com/.../submit/{PORTAL_ID}/{FORM_GUID}
   (sin JS: POST de formulario normal al mismo endpoint, que redirige de vuelta)
```

- El formulario de la web **no es** un formulario incrustado de HubSpot. Es HTML
  propio. HubSpot solo recibe los datos.
- La Forms API **no lleva autenticación**. El portal ID y el GUID del formulario son
  públicos, no son secretos.
- HubSpot **deduplica por `email`**: si el contacto existe lo enriquece, y si no, lo crea.

### Por qué desde el servidor y no desde el navegador

La v3 de esta guía mandaba el `POST` directamente desde el navegador a
`api.hsforms.com`. En producción **no llegaba nada**: el formulario se enviaba como un
GET normal y los datos acababan en la URL (`/?firstname=…&email=…`).

Los bloqueadores de anuncios y de rastreo (uBlock, AdBlock, Brave, el modo estricto
de Safari o Firefox) bloquean las URLs que contienen `hubspot` o `hsforms`. Bloqueaban
el script del formulario (`hubspot.[hash].js`), así que el listener no llegaba a
registrarse, y además habrían bloqueado la llamada a hsforms.com.

Con un endpoint propio:

- El navegador solo habla con tu dominio, así que ningún bloqueador lo corta.
- Si el JavaScript no carga, el formulario hace un POST normal al mismo endpoint y
  sigue funcionando.
- Los rechazos de HubSpot quedan en los logs del servidor (en Vercel, en Logs).

**Regla de nombres:** ningún fichero que cargue el navegador puede llevar `hubspot`
ni `hsforms` en el nombre o en la URL.

### La idea clave: el formulario de HubSpot es una DECLARACIÓN

Nadie ve el formulario en HubSpot. Su única función es **declarar qué propiedades
acepta la API**. Un campo que mandas y que el formulario publicado no declara
**se descarta sin avisar**, y la API responde 200 igualmente.

La pregunta nunca es "¿lo mando en el payload?". La pregunta es "¿el formulario
PUBLICADO lo declara?".

---

## 2. Qué necesito antes de empezar

Pide o reúne esto antes de escribir código:

| Dato | Dónde se saca | Ejemplo (wisdo.io) |
| --- | --- | --- |
| Portal ID | URL de HubSpot (`app.hubspot.com/.../7668836/...`) o el código de inserción del formulario (`data-portal-id`) | `7668836` |
| GUID del formulario | URL del editor del formulario o el código de inserción (`data-form-id`) | `fb56bb45-ef50-4062-b2b9-ed18b37cc4c4` |
| Región | El código de inserción (`data-region`) | `na1` |
| Lista de campos | Qué preguntas hace el formulario y a qué propiedad va cada una | ver apartado 3 |
| ¿Hay casilla de consentimiento? | Decisión legal o de negocio | No, en el de contacto |
| `subscriptionTypeId` (solo si hay casilla) | Settings → Marketing → Email → Subscription types | — |
| Dónde va el formulario en la web | Página y sección | Sección `#contact` de la home |
| Textos | Etiquetas, botón, mensaje de gracias y de error | — |

El código de inserción que da HubSpot (`<script src="https://js.hsforms.net/...">` +
`<div class="hs-form-frame" ...>`) **no se usa en la web**. Solo sirve para leer de él
el portal ID, el GUID y la región.

---

## 3. Preparación en HubSpot

1. **Propiedades de contacto.** Reutiliza las nativas (`email`, `firstname`,
   `lastname`, `phone`, `company`, `message`, `zip`, `country`, `hs_language`) y crea
   propiedades propias solo cuando haga falta. Apunta el **nombre interno** de cada
   una, no la etiqueta.
2. **Crea el formulario** (Marketing → Forms) y añade un campo por cada propiedad que
   mande el código. Los campos que rellena el código y no la persona (UTMs,
   categoría, idioma) se añaden como **ocultos**.
3. En cada campo, abre *Connected property* y comprueba el **Internal name**.
   "Company name" suele venir conectado al `name` del objeto **Empresa**: cámbialo a
   la propiedad de **contacto** `company`.
4. Privacidad: si la web **no** tiene casilla de consentimiento, no actives la casilla
   en el formulario de HubSpot (ver apartado 8).
5. **Publícalo.** Guardar no es publicar: si el editor dice "Saved with unpublished
   changes", la API sigue usando la versión anterior.
6. Si hay workflows que reescriben propiedades al crear el contacto, **excluye este
   formulario de su enrolamiento**, o sobrescribirán lo que mandes un minuto después.

Campos del formulario de contacto de wisdo.io, como ejemplo:

| Campo web | Propiedad (internal name) | En HubSpot |
| --- | --- | --- |
| First name | `firstname` | visible |
| Last name | `lastname` | visible |
| Work email * | `email` | visible, obligatorio |
| Phone | `phone` | visible |
| Company | `company` | visible |
| How can we help? | `message` | visible |
| (UTMs) | `lead_utm_source`, `lead_utm_medium`, `lead_utm_campaign`, `lead_utm_content`, `lead_utm_term`, `lead_landing_url`, `lead_referrer_url` | ocultos (propiedades propias, crear antes) |

---

## 4. El payload que recibe HubSpot

```json
{
  "fields": [
    { "objectTypeId": "0-1", "name": "email", "value": "jane@acme.com" },
    { "objectTypeId": "0-1", "name": "firstname", "value": "Jane" },
    { "objectTypeId": "0-1", "name": "contact_solutions", "value": "Academy;Perks" }
  ],
  "context": {
    "hutk": "valor de la cookie hubspotutk",
    "pageUri": "https://www.wisdo.io/",
    "pageName": "wisdo — AI-powered growth consultancy"
  }
}
```

- `objectTypeId`: `0-1` es contacto y `0-2` es empresa.
- Todos los valores van como **string**. Los booleanos van como `"true"` o `"false"`.
- **Las casillas múltiples van separadas por `;`**, nunca por coma: `"Academy, Perks"`
  llega como UNA opción que no existe.
- **No mandes campos vacíos.** Un `""` en una enumeración es un valor que no existe y
  tumba el envío entero. Filtra antes de enviar.
- En las enumeraciones (desplegable, radio, casillas) se manda el **valor** interno de
  la opción, no la etiqueta (`fr-fr`, no "French - France").

---

## 5. Implementación

### 5.1 Envío a HubSpot (servidor)

Este fichero es `src/lib/hubspot-forms.ts`. **Para reutilizarlo con un segundo
formulario**, el GUID tiene que pasar a ser un parámetro, en vez de la constante
`FORM_GUID` que hay hoy:

```ts
// src/lib/hubspot-forms.ts — solo servidor
const PORTAL_ID = '7668836';

/** Un GUID por formulario de HubSpot. Públicos por diseño. */
export const HUBSPOT_FORMS = {
  contact: 'fb56bb45-ef50-4062-b2b9-ed18b37cc4c4', // "New contact form Astro"
  // nuevoForm: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
} as const;

export type Fields = Record<string, string | undefined | null>;

export interface SubmitContext {
  hutk?: string | undefined;
  pageUri?: string | undefined;
  pageName?: string | undefined;
}

/** Solo si el formulario tiene casilla de consentimiento (apartado 8). */
export interface LegalConsent {
  consent: {
    consentToProcess: boolean;
    text: string;
    communications?: Array<{ value: boolean; subscriptionTypeId: number; text: string }>;
  };
}

/** Nunca lanza. Reintenta solo lo transitorio (red, 429, 5xx): 3 intentos. */
export async function submitToHubSpot(
  formGuid: string,
  fields: Fields,
  context: SubmitContext,
  consent?: LegalConsent
): Promise<boolean> {
  const body: Record<string, unknown> = {
    // Sin vacíos: un "" en una enumeración tumba el envío entero.
    fields: Object.entries(fields)
      .filter((e): e is [string, string] => typeof e[1] === 'string' && e[1] !== '')
      .map(([name, value]) => ({ objectTypeId: '0-1', name, value })),
    context: Object.fromEntries(Object.entries(context).filter(([, v]) => v)),
  };
  if (consent) body['legalConsentOptions'] = consent;

  const url = `https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${formGuid}`;
  const backoff = [500, 1500]; // esperas ANTES de cada reintento
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
      // Queda en los logs: aquí sale qué campo o valor rechaza HubSpot.
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
```

Si se hace este cambio, hay que actualizar la llamada de `src/pages/api/contact.ts`
a `submitToHubSpot(HUBSPOT_FORMS.contact, fields, {...})`.

### 5.2 Endpoint propio (servidor)

Un endpoint por formulario: copia `src/pages/api/contact.ts` como
`src/pages/api/<nombre>.ts` y cambia tres cosas: la **lista blanca de campos**, el
**GUID** y, si aplica, el **consentimiento**.

```ts
// src/pages/api/<nombre>.ts → POST /api/<nombre>/
import type { APIRoute } from 'astro';
import { submitToHubSpot, HUBSPOT_FORMS, type Fields } from '@lib/hubspot-forms';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// 1) Lista blanca: solo estos campos pasan a HubSpot, con tope de longitud.
//    Los nombres son los INTERNAL NAMES de HubSpot.
const VISIBLE = { firstname: 100, lastname: 100, email: 254, phone: 30, company: 150, message: 2000 } as const;
const HIDDEN = {
  lead_utm_source: 255, lead_utm_medium: 255, lead_utm_campaign: 255,
  lead_utm_content: 255, lead_utm_term: 255, lead_landing_url: 2000, lead_referrer_url: 2000,
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
  } catch { /* se queda en / */ }
  // 2) El ancla (#contact) es la sección donde está el formulario.
  return new Response(null, { status: 303, headers: { Location: `${path}?contact=${status}#contact` } });
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const isJson = (request.headers.get('content-type') || '').includes('application/json');

  let input: Record<string, unknown>;
  try {
    input = isJson ? await request.json() : Object.fromEntries(await request.formData());
  } catch {
    return new Response(JSON.stringify({ ok: false }), { status: 400 });
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

  // 3) GUID del formulario de HubSpot.
  const ok = await submitToHubSpot(HUBSPOT_FORMS.contact, fields, {
    hutk: cookies.get('hubspotutk')?.value, // solo existe con el script de seguimiento
    pageUri,
    pageName: clean(input['pageName'], 300),
  });
  return reply(ok, ok ? 200 : 502);
};
```

Notas:

- Con `trailingSlash: 'always'` (como en este repo), la URL es `/api/<nombre>/`, con
  barra final.
- Si el formulario tiene **campos de enumeración**, valida en el endpoint que el valor
  es una de las opciones (un `Set` con los valores internos). Un valor que no existe
  tumba el envío entero.
- Si un campo es una **casilla múltiple**, une los valores con `;` en el endpoint.

### 5.3 Formulario (HTML + script de navegador)

Puntos que no son opcionales:

- `method="post" action="/api/<nombre>/"`: si el script no carga, el formulario sigue
  funcionando y los datos **nunca** acaban en la URL. Sin esto, el navegador hace un
  GET con todos los datos personales en la URL, que es lo que pasó en producción.
- Un `<input type="hidden" name="pageUri">` con la URL de la página, para el envío
  sin JS.
- Honeypot `website`, escondido fuera de pantalla.
- `novalidate`, con la validación del email hecha en el código.
- Mensajes de éxito y de error con `role="status"` y `role="alert"`, que también se
  pintan desde el servidor cuando la página vuelve con `?contact=sent|error`.

```astro
---
const status = Astro.url.searchParams.get('contact');
const sent = status === 'sent';
const failed = status === 'error';
---
<form class="cf" data-contact-form method="post" action="/api/contact/" novalidate hidden={sent}>
  <input type="hidden" name="pageUri" value={Astro.url.href} />
  <label>First name <input name="firstname" type="text" autocomplete="given-name" maxlength="100" /></label>
  <label>Work email * <input name="email" type="email" autocomplete="email" required maxlength="254" /></label>
  <label>How can we help? <textarea name="message" rows="4" maxlength="2000"></textarea></label>

  <!-- Honeypot: invisible para personas, los bots lo rellenan. -->
  <div class="cf-hp" aria-hidden="true">
    <label>Website <input name="website" type="text" tabindex="-1" autocomplete="off" /></label>
  </div>

  <button class="cf-submit" type="submit">Send message</button>
  <p class="cf-error" role="alert" hidden={!failed}>{failed && "We couldn't send your message. Please try again."}</p>
</form>
<p class="cf-success" role="status" hidden={!sent}>Thanks, we've got it.</p>

<script>
  // OJO: ningún import cuyo nombre lleve "hubspot" o "hsforms" (los bloqueadores lo cortan).
  import { getUtmFields } from '@lib/lead-utm';

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const track = (name: string) => (window as any).dataLayer?.push({ event: name });

  document.querySelectorAll<HTMLFormElement>('[data-contact-form]').forEach((form) => {
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    const errorBox = form.querySelector<HTMLElement>('.cf-error')!;
    const successBox = form.nextElementSibling as HTMLElement;
    const showError = (msg: string) => { errorBox.textContent = msg; errorBox.hidden = false; };
    const showSuccess = () => { form.hidden = true; successBox.hidden = false; };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (button.disabled) return; // doble clic o Enter repetido
      errorBox.hidden = true;
      const data = new FormData(form);
      const get = (k: string) => String(data.get(k) ?? '').trim();

      if (get('website') !== '') { showSuccess(); return; } // honeypot

      const email = get('email');
      if (!EMAIL_RE.test(email)) { showError('Please check your email address.'); return; }

      button.disabled = true;
      let ok = false;
      try {
        const res = await fetch('/api/contact/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            firstname: get('firstname'),
            message: get('message'),
            ...getUtmFields(),
            pageUri: window.location.href,
            pageName: document.title,
          }),
        });
        ok = res.ok;
      } catch { ok = false; }
      track(ok ? 'contact_submit' : 'contact_error');

      if (ok) { showSuccess(); return; }
      button.disabled = false;
      showError("We couldn't send your message. Please try again.");
    });
  });
</script>

<style>
  /* Si .cf o los mensajes llevan display:grid/flex, el atributo hidden deja de
     ocultarlos. Esta regla lo arregla. */
  [hidden] { display: none !important; }
  .cf-hp { position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden; }
</style>
```

Para un segundo formulario en la misma web, cambia `data-contact-form`, el `action`,
la URL del `fetch` y el parámetro `?contact=` por nombres propios, para que no choquen
con el de contacto.

### 5.4 UTMs de primer toque

Ya existe en `src/lib/lead-utm.ts` y se llama en cada página desde `SiteLayout`, así
que un formulario nuevo solo tiene que hacer `...getUtmFields()` en el envío. Para que
lleguen a HubSpot, las propiedades `lead_utm_*`, `lead_landing_url` y
`lead_referrer_url` tienen que existir y estar como campos ocultos en **cada**
formulario de HubSpot que las reciba.

- Se capturan **al cargar** la página, no al enviar.
- Primer toque por pestaña y sesión (`sessionStorage`). Si quieres primer toque entre
  visitas, cámbialo por `localStorage` con caducidad (por ejemplo, 30 días).

---

## 6. Las seis maneras en que HubSpot responde 200 y pierde el dato

Ninguna sale en un build, un test ni en la respuesta.

1. **Campo no declarado** en el formulario: se descarta sin avisar.
2. **Guardado pero no publicado.** La API valida contra la versión PUBLICADA. **Es lo
   primero que hay que comprobar** cuando un campo no aterriza.
3. **Nombre interno equivocado.** Puede haber propiedades casi iguales (`country`
   "Country/Region" frente a un `country_` "Country" propio). Lee el *Internal name*
   en *Connected property*.
4. **Valor inexistente en una enumeración:** tumba el envío ENTERO, no solo ese campo.
5. **Valores por defecto del formulario.** Por API no se aplican nunca: mándalos tú.
6. **Email rechazado.** Un dominio inventado o un TLD reservado (`.invalid`) devuelve
   200 y no crea nada. Prueba siempre con un dominio real (`tu+test1@tuempresa.com`).

Y una que no es de HubSpot, pero tiene el mismo síntoma: **el script del formulario no
se ejecuta** (bloqueador, error de JS) y el navegador envía el formulario por su cuenta.
Se reconoce porque los datos aparecen en la URL o la página se recarga sin mensaje. Se
evita con el apartado 1 y con `method="post" action=...` (apartado 5.3).

---

## 7. Atribución: `hutk` y fuente

- La cookie `hubspotutk` la crea el **script de seguimiento de HubSpot**
  (`js.hs-scripts.com/{PORTAL_ID}.js`). El endpoint la lee del request
  (`cookies.get('hubspotutk')`) y la manda como `context.hutk`.
- **Hoy wisdo.io no carga ese script**, así que no hay `hutk` y los contactos entran
  con fuente **"Offline"**. Para tener la atribución nativa de HubSpot hay que añadir
  el script, y en España eso requiere antes un **banner de cookies** con consentimiento.
- Mientras tanto, la atribución sale de las **UTMs propias** (apartado 5.4).

---

## 8. Consentimiento

- **No escribas ninguna propiedad de consentimiento si el formulario no tiene
  casilla.** Escribirla sin casilla registra un permiso que nadie ha dado, y algunas
  integraciones (Ads, envío de datos a Meta) se activan con ella.
- Si hay casilla, el navegador manda si está marcada (`consent: true`) y el endpoint
  añade `legalConsentOptions` **solo si está marcada**:

```ts
const CONSENT_TEXT = 'Quiero que Empresa me contacte sobre sus servicios.';
const SUBSCRIPTION_TYPE_ID = 123456; // ID REAL del portal

const consent = input['consent'] === true || input['consent'] === 'on'
  ? { consent: { consentToProcess: true, text: CONSENT_TEXT,
      communications: [{ value: true, subscriptionTypeId: SUBSCRIPTION_TYPE_ID, text: CONSENT_TEXT }] } }
  : undefined;

await submitToHubSpot(HUBSPOT_FORMS.nuevoForm, fields, context, consent);
```

- El texto que ve la persona y el `text` que se manda tienen que ser **idénticos**.
  Con una sola casilla se repite el mismo texto en `consent` y en `communications`. Con
  dos casillas, cada una lleva su texto y su constante.
- El `subscriptionTypeId` tiene que ser un ID real (Settings → Marketing → Email →
  Subscription types). Un placeholder como `0` no registra nada útil.

---

## 9. Si también mandas un email (Resend, Web3Forms…)

El orden es la regla: **primero el email, y HubSpot solo cuando el email se confirma
enviado**. El buzón es lo que un humano lee y contesta, así que una caída de HubSpot
nunca debe convertir un lead entregado en un mensaje de error. En el endpoint: si el
email falla, responde error. Si sale bien, llama a HubSpot, regístralo en el log si
falla y responde éxito igualmente.

---

## 10. Cómo verificar (la única forma que funciona)

1. Despliega y envía una vez desde **producción** o la preview, con
   `tu+algo@tuempresa.com` y **todos los campos rellenos**.
2. Comprueba que la página muestra el mensaje de gracias y que **la URL no cambia** ni
   lleva datos.
3. **Espera tres minutos.** Los workflows reescriben propiedades más o menos al minuto.
4. Abre el contacto en HubSpot y compara **campo por campo** con lo que mandaste. Mira
   también "Recent conversion": debe nombrar el formulario.
5. Si no llegó, abre los logs del servidor (Vercel → Logs) y busca `[hubspot-forms]`.
   Ahí aparece el código y el mensaje de HubSpot.
6. Prueba también con un bloqueador de anuncios activo.

Fiarse del 200, o mirar antes de tiempo, es como sobrevivieron hasta producción todas
las trampas del apartado 6.

---

## 11. Checklist

**HubSpot**
- [ ] Cada propiedad existe y tengo su **nombre interno**.
- [ ] Cada campo que manda el código está en el formulario (los del código, ocultos).
- [ ] "Company" conectado a la propiedad de contacto `company`, no a la de empresa.
- [ ] El formulario está **publicado**, no solo guardado.
- [ ] El formulario está excluido de los workflows que sobrescriben lo que mando.

**Código**
- [ ] El navegador envía a un endpoint propio, nunca a hsforms.com.
- [ ] Ningún fichero del navegador lleva `hubspot` ni `hsforms` en el nombre.
- [ ] `<form method="post" action="/api/...">`: sin JS funciona y no deja datos en la URL.
- [ ] El endpoint usa lista blanca de campos y topes de longitud.
- [ ] Las enumeraciones mandan **valores** que existen, y las casillas múltiples van unidas con `;`.
- [ ] Los campos vacíos se filtran antes de enviar.
- [ ] Mando `pageUri`, `pageName` y, si existe, `hutk`. Las UTMs viajan como campos ocultos.
- [ ] Consentimiento solo con casilla marcada, con texto idéntico y `subscriptionTypeId` real.
- [ ] Reintento en red, 429 y 5xx, nunca lanzo, hay honeypot y el botón se desactiva al enviar.
- [ ] Los rechazos de HubSpot quedan en el log del servidor.

**Verificación**
- [ ] Probado en producción con `tu+test@tuempresa.com`, releyendo el contacto a los tres minutos.
- [ ] Probado con un bloqueador de anuncios activo.
