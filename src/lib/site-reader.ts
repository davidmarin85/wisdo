// ============================================================================
// SITE READER — descarga la web del usuario y extrae texto + herramientas
// ============================================================================
// Descargar una URL que manda un desconocido es un vector de SSRF: alguien
// podría pedirnos http://169.254.169.254/ o http://localhost:5432/. Por eso:
//   - solo http/https, sin usuario:contraseña y puertos 80/443
//   - resolvemos el DNS y rechazamos IPs privadas, loopback, link-local…
//   - seguimos las redirecciones a mano, validando cada salto
//   - límite de tiempo y de bytes
// ============================================================================
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const FETCH_TIMEOUT_MS = 8_000;
const MAX_BYTES = 1_500_000;
const MAX_REDIRECTS = 3;
// Suficiente para que Claude entienda el negocio sin pagar tokens de más.
const MAX_TEXT_CHARS = 12_000;

export interface SiteSnapshot {
  finalUrl: string;
  title: string;
  description: string;
  text: string;
  detectedTools: string[];
}

export type SiteReadErrorCode = 'invalid_url' | 'blocked_host' | 'fetch_failed' | 'not_html' | 'empty';

export class SiteReadError extends Error {
  code: SiteReadErrorCode;

  constructor(code: SiteReadErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

// Acepta "miweb.com" o "https://miweb.com/algo" y devuelve una URL normalizada.
export function normalizeUrl(input: string): URL {
  const raw = input.trim();
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) && !/^https?:\/\//i.test(raw)) {
    throw new SiteReadError('invalid_url', 'Solo se admiten URLs http(s)');
  }
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    throw new SiteReadError('invalid_url', 'URL inválida');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new SiteReadError('invalid_url', 'Solo se admiten URLs http(s)');
  }
  if (url.username || url.password) {
    throw new SiteReadError('invalid_url', 'La URL no puede llevar credenciales');
  }
  if (url.port && url.port !== '80' && url.port !== '443') {
    throw new SiteReadError('invalid_url', 'Puerto no permitido');
  }
  // Exigimos un dominio con punto: fuera "localhost", "intranet", etc.
  if (!url.hostname.includes('.') || isIP(url.hostname)) {
    throw new SiteReadError('invalid_url', 'Introduce un dominio, no una IP');
  }
  url.hash = '';
  return url;
}

export async function readSite(input: string): Promise<SiteSnapshot> {
  let url = normalizeUrl(input);
  let res: Response | null = null;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicHost(url.hostname);
    try {
      res = await fetch(url, {
        redirect: 'manual',
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; wisdo-diagnostico/1.0; +https://www.wisdo.io)',
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'es,en;q=0.8',
        },
      });
    } catch {
      throw new SiteReadError('fetch_failed', 'No se pudo conectar con la web');
    }

    const location = res.headers.get('location');
    if (res.status >= 300 && res.status < 400 && location) {
      url = normalizeUrl(new URL(location, url).toString());
      continue;
    }
    break;
  }

  if (!res || !res.ok) {
    throw new SiteReadError('fetch_failed', `La web respondió ${res?.status ?? 'sin respuesta'}`);
  }
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('html')) {
    throw new SiteReadError('not_html', 'La URL no devuelve una página web');
  }

  const html = await readLimited(res);
  const title = decodeEntities(matchFirst(html, /<title[^>]*>([\s\S]*?)<\/title>/i));
  const description = decodeEntities(
    matchFirst(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
      matchFirst(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i)
  );
  const text = htmlToText(html).slice(0, MAX_TEXT_CHARS);

  // Webs 100% JavaScript (SPA, algunos Wix) devuelven casi nada sin navegador.
  if (text.length < 200 && !description) {
    throw new SiteReadError('empty', 'No hemos podido leer el contenido de la web');
  }

  return { finalUrl: url.toString(), title, description, text, detectedTools: detectTools(html) };
}

async function assertPublicHost(hostname: string): Promise<void> {
  let addresses: { address: string }[];
  try {
    addresses = await lookup(hostname, { all: true });
  } catch {
    throw new SiteReadError('fetch_failed', 'El dominio no existe');
  }
  if (addresses.length === 0 || addresses.some((a) => isPrivateAddress(a.address))) {
    throw new SiteReadError('blocked_host', 'Dominio no permitido');
  }
}

function isPrivateAddress(ip: string): boolean {
  if (ip.startsWith('::ffff:')) return isPrivateAddress(ip.slice(7));
  if (isIP(ip) === 4) {
    const [a, b] = ip.split('.').map(Number) as [number, number];
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) || // CGNAT
      (a === 169 && b === 254) || // link-local / metadata cloud
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224 // multicast y reservadas
    );
  }
  const v6 = ip.toLowerCase();
  return v6 === '::' || v6 === '::1' || v6.startsWith('fc') || v6.startsWith('fd') || v6.startsWith('fe80');
}

async function readLimited(res: Response): Promise<string> {
  if (!res.body) return '';
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.byteLength;
  }
  await reader.cancel().catch(() => {});
  return new TextDecoder().decode(Buffer.concat(chunks).subarray(0, MAX_BYTES));
}

function matchFirst(html: string, re: RegExp): string {
  return re.exec(html)?.[1]?.trim() ?? '';
}

function htmlToText(html: string): string {
  return decodeEntities(
    html
      .replace(/<(script|style|noscript|svg|template|iframe)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<\/(p|div|li|h[1-6]|section|article|header|footer|br|tr)>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/[ \t\f\v]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim();
}

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

// Firmas en el HTML de herramientas de marketing/ventas. Determinista y
// gratis: no hace falta IA para ver que una web carga el script de HubSpot.
const TOOL_SIGNATURES: [string, RegExp][] = [
  ['HubSpot', /js\.hs-scripts\.com|js\.hsforms\.net|hs-analytics/i],
  ['Salesforce / Pardot', /pardot\.com|pi\.pardot|salesforce\.com\/.*\.js/i],
  ['Zoho', /zohopublic|salesiq\.zoho/i],
  ['Pipedrive', /pipedrive(webforms)?\.com/i],
  ['Mailchimp', /chimpstatic\.com|list-manage\.com/i],
  ['Klaviyo', /klaviyo\.com/i],
  ['ActiveCampaign', /activehosted\.com|trackcmp\.net/i],
  ['Brevo', /sibforms\.com|sendinblue|brevo\.com/i],
  ['Intercom', /widget\.intercom\.io|intercomcdn/i],
  ['Crisp', /client\.crisp\.chat/i],
  ['Tidio', /tidio\.co/i],
  ['WhatsApp', /wa\.me\/|api\.whatsapp\.com/i],
  ['Calendly', /calendly\.com/i],
  ['Typeform', /typeform\.com/i],
  ['Stripe', /js\.stripe\.com/i],
  ['Shopify', /cdn\.shopify\.com|myshopify\.com/i],
  ['WooCommerce', /woocommerce/i],
  ['WordPress', /wp-content|wp-includes/i],
  ['Webflow', /webflow\.(js|com)|assets\.website-files\.com/i],
  ['Wix', /static\.wixstatic\.com|wix\.com/i],
  ['Google Tag Manager', /googletagmanager\.com\/gtm\.js/i],
  ['Google Analytics', /gtag\/js\?id=G-|google-analytics\.com/i],
  ['Meta Pixel', /connect\.facebook\.net\/.*fbevents\.js/i],
  ['LinkedIn Insight', /snap\.licdn\.com/i],
  ['Hotjar', /static\.hotjar\.com/i],
];

function detectTools(html: string): string[] {
  return TOOL_SIGNATURES.filter(([, re]) => re.test(html)).map(([name]) => name);
}
