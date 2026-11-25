// ============================================================================
// STACK SIGNALS — herramientas que no se ven en el HTML
// ============================================================================
// El HTML solo enseña lo que se carga en el navegador. El hosting deja huella
// en las cabeceras HTTP, y el correo y el email marketing en el DNS del
// dominio (MX, SPF y verificaciones de dominio en TXT). Todo es público: no
// hace falta pedir permiso a nadie. Las consultas DNS tienen un tiempo
// límite corto y, si fallan, el diagnóstico sigue sin estas señales.
// ============================================================================
import { Resolver } from 'node:dns/promises';

const DNS_TIMEOUT_MS = 2_500;

// — Cabeceras HTTP: hosting y CDN —
const HEADER_SIGNATURES: [string, (h: Headers) => boolean][] = [
  ['Vercel', (h) => h.has('x-vercel-id') || /vercel/i.test(h.get('server') ?? '')],
  ['Netlify', (h) => h.has('x-nf-request-id') || /netlify/i.test(h.get('server') ?? '')],
  ['Cloudflare', (h) => h.has('cf-ray')],
  ['Amazon CloudFront', (h) => /cloudfront/i.test(h.get('via') ?? '') || h.has('x-amz-cf-id')],
  ['WP Engine', (h) => h.has('x-powered-by') && /wp engine/i.test(h.get('x-powered-by') ?? '')],
  ['Kinsta', (h) => h.has('x-kinsta-cache')],
  ['Shopify', (h) => h.has('x-shopid') || h.has('x-shopify-stage')],
  ['Webflow', (h) => /webflow/i.test(h.get('x-served-by') ?? '') || h.has('x-wf-region')],
  ['Wix', (h) => h.has('x-wix-request-id')],
  ['Squarespace', (h) => /squarespace/i.test(h.get('server') ?? '')],
  ['GitHub Pages', (h) => /github\.com/i.test(h.get('server') ?? '')],
  ['Railway', (h) => h.has('x-railway-edge') || h.has('x-railway-request-id') || /railway/i.test(h.get('server') ?? '')],
  ['Render', (h) => h.has('rndr-id') || /render/i.test(h.get('x-render-origin-server') ?? '')],
  ['Heroku', (h) => /vegur|heroku/i.test(h.get('via') ?? '')],
  ['Fly.io', (h) => h.has('fly-request-id') || /^fly\//i.test(h.get('server') ?? '')],
];

// — Dominios de servicios en el HTML o el JavaScript de la web —
// Backends y APIs que la web llama desde el navegador: la URL queda escrita en
// el código aunque el servicio no se vea en la página.
const CODE_SIGNATURES: [string, RegExp][] = [
  ['Railway', /[a-z0-9-]+\.up\.railway\.app|railway\.app\b/i],
  ['Render', /[a-z0-9-]+\.onrender\.com/i],
  ['Heroku', /[a-z0-9-]+\.herokuapp\.com/i],
  ['Fly.io', /[a-z0-9-]+\.fly\.dev/i],
  ['Supabase', /[a-z0-9]{20}\.supabase\.co/i],
  ['Firebase', /firebaseapp\.com|firebaseio\.com|firestore\.googleapis\.com|gstatic\.com\/firebasejs/i],
  ['AWS API Gateway', /\.execute-api\.[a-z0-9-]+\.amazonaws\.com/i],
  ['Sentry', /ingest(\.[a-z]+)?\.sentry\.io|browser\.sentry-cdn\.com/i],
  ['PostHog', /[a-z]+\.i\.posthog\.com|app\.posthog\.com|posthog-js/i],
  ['Mixpanel', /cdn\.mxpnl\.com|api(-js)?\.mixpanel\.com/i],
  ['Segment', /cdn\.segment\.com|api\.segment\.io/i],
  ['Amplitude', /cdn\.amplitude\.com|api2?\.amplitude\.com/i],
  ['Algolia', /\.algolia\.net|algolianet\.com/i],
  ['Cloudinary', /res\.cloudinary\.com/i],
  ['Clerk', /clerk\.accounts\.dev|\.clerk\.com\/npm/i],
  ['Auth0', /\.auth0\.com/i],
];

export function detectFromCode(code: string): string[] {
  return CODE_SIGNATURES.filter(([, re]) => re.test(code)).map(([name]) => name);
}

// — CNAME: adónde apuntan el dominio y sus subdominios habituales —
const CNAME_SIGNATURES: [string, RegExp][] = [
  ['Railway', /railway\.app\.?$/i],
  ['Vercel', /vercel-dns\.com\.?$|vercel\.app\.?$/i],
  ['Netlify', /netlify\.(app|com)\.?$/i],
  ['Render', /onrender\.com\.?$/i],
  ['Heroku', /herokudns\.com\.?$|herokuapp\.com\.?$/i],
  ['Fly.io', /fly\.dev\.?$/i],
  ['Amazon CloudFront', /cloudfront\.net\.?$/i],
  ['AWS', /elb\.amazonaws\.com\.?$|amplifyapp\.com\.?$/i],
  ['Azure', /azurewebsites\.net\.?$|azureedge\.net\.?$|azurefd\.net\.?$/i],
  ['Google Cloud', /run\.app\.?$|appspot\.com\.?$|ghs\.googlehosted\.com\.?$/i],
  ['GitHub Pages', /github\.io\.?$/i],
  ['Shopify', /myshopify\.com\.?$|shops\.myshopify/i],
  ['Webflow', /proxy-ssl\.webflow\.com\.?$|webflow\.io\.?$/i],
  ['WP Engine', /wpengine\.com\.?$/i],
  ['HubSpot', /hubspot\.net\.?$|hs-sites\.com\.?$/i],
  ['Framer', /framer\.(app|website)\.?$/i],
];

// Subdominios donde suelen vivir la API, la app o el blog.
const CNAME_SUBDOMAINS = ['www', 'api', 'app', 'backend', 'admin', 'blog', 'dashboard'];

export function detectFromHeaders(headers: Headers): string[] {
  return HEADER_SIGNATURES.filter(([, test]) => test(headers)).map(([name]) => name);
}

// — MX: proveedor de correo —
const MX_SIGNATURES: [string, RegExp][] = [
  ['Google Workspace', /google\.com\.?$|googlemail\.com\.?$/i],
  ['Microsoft 365', /outlook\.com\.?$|protection\.outlook/i],
  ['Zoho Mail', /zoho\.(com|eu|in)\.?$/i],
  ['Proton Mail', /protonmail\.ch\.?$/i],
];

// — SPF (TXT "v=spf1 … include:…"): quién envía correo en nombre del dominio —
const SPF_SIGNATURES: [string, RegExp][] = [
  ['HubSpot', /include:[^ ]*hubspot/i],
  ['Brevo', /include:[^ ]*(sendinblue|brevo)/i],
  ['Mailchimp', /include:servers\.mcsv\.net|include:[^ ]*mandrillapp/i],
  ['Klaviyo', /include:[^ ]*klaviyo/i],
  ['ActiveCampaign', /include:[^ ]*(emsd1|activecampaign)/i],
  ['SendGrid', /include:sendgrid\.net/i],
  ['Mailgun', /include:mailgun\.org/i],
  ['Amazon SES', /include:amazonses\.com/i],
  ['Resend', /include:[^ ]*resend/i],
  ['Postmark', /include:spf\.mtasv\.net/i],
  ['Salesforce', /include:_spf\.salesforce\.com/i],
  ['Zendesk', /include:mail\.zendesk\.com/i],
  ['Freshdesk', /include:[^ ]*freshdesk/i],
];

// — Verificaciones de dominio en TXT —
const TXT_SIGNATURES: [string, RegExp][] = [
  ['Google Search Console', /^google-site-verification=/i],
  ['Meta Business', /^facebook-domain-verification=/i],
  ['HubSpot', /^hubspot-developer-verification=|^hubspot-domain-verification/i],
  ['Microsoft 365', /^MS=ms\d+/i],
  ['Atlassian', /^atlassian-domain-verification=/i],
  ['Apple', /^apple-domain-verification=/i],
  ['Stripe', /^stripe-verification=/i],
  ['Zoom', /^ZOOM_verify_/i],
  ['Slack', /^slack-domain-verification=/i],
  ['Notion', /^notion-domain-verification=/i],
  ['Pinterest', /^pinterest-site-verification=/i],
  ['Brevo', /^brevo-code:|^Sendinblue-code:/i],
  ['Mailchimp', /^mandrill_verify\./i],
];

// — DKIM: claves públicas con un selector conocido (<selector>._domainkey.<dominio>) —
const DKIM_SELECTORS: [string, string][] = [
  ['Resend', 'resend'],
  ['Google Workspace', 'google'],
  ['Microsoft 365', 'selector1'],
  ['Brevo', 'brevo1'],
  ['Mailchimp', 'k1'],
  ['SendGrid', 's1'],
  ['Postmark', 'pm'],
];

// Dominio a consultar: quitamos "www." (el DNS de correo vive en el dominio raíz).
export function mailDomain(hostname: string): string {
  return hostname.replace(/^www\./i, '').toLowerCase();
}

export async function detectFromDns(hostname: string): Promise<string[]> {
  const domain = mailDomain(hostname);
  const resolver = new Resolver({ timeout: DNS_TIMEOUT_MS, tries: 1 });

  const [mx, txt, dkim, cnames] = await Promise.all([
    resolver.resolveMx(domain).catch(() => []),
    resolver.resolveTxt(domain).catch(() => [] as string[][]),
    Promise.all(
      DKIM_SELECTORS.map(([name, selector]) =>
        resolver
          .resolveTxt(`${selector}._domainkey.${domain}`)
          .then((records) => (records.some((r) => /p=/i.test(r.join(''))) ? name : null))
          .catch(() => null)
      )
    ),
    Promise.all(
      CNAME_SUBDOMAINS.map((sub) => resolver.resolveCname(`${sub}.${domain}`).catch(() => [] as string[]))
    ),
  ]);

  const found = new Set<string>(dkim.filter((n): n is string => n !== null));
  for (const target of cnames.flat()) {
    for (const [name, re] of CNAME_SIGNATURES) if (re.test(target)) found.add(name);
  }
  for (const { exchange } of mx) {
    for (const [name, re] of MX_SIGNATURES) if (re.test(exchange)) found.add(name);
  }
  // Un registro TXT puede venir partido en varios trozos: se unen.
  for (const record of txt.map((parts) => parts.join(''))) {
    if (/^v=spf1/i.test(record)) {
      for (const [name, re] of SPF_SIGNATURES) if (re.test(record)) found.add(name);
    }
    for (const [name, re] of TXT_SIGNATURES) if (re.test(record)) found.add(name);
  }
  return [...found];
}
