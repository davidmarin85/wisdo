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
];

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

  const [mx, txt, dkim] = await Promise.all([
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
  ]);

  const found = new Set<string>(dkim.filter((n): n is string => n !== null));
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
