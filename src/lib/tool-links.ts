// Enlaces de afiliado de las herramientas, por nombre.
// El motor (wisdo-engine), el marketplace (data/tools) y PartnerStack escriben
// algunos nombres distinto ("Manychat" / "ManyChat", "Wati.io" / "Wati"), así
// que se comparan normalizados y con alias.
//
// Los botones no enlazan directo a PartnerStack sino a /go/{slug}/, que apunta
// el clic (origen y lead) y redirige al enlace de partner. La comisión no se
// pierde: el destino final es el mismo enlace.
import { PARTNER_LINKS, type PartnerLink } from '@data/partner-links';

export type ClickSource = 'market' | 'resultado' | 'email' | 'otro';

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const BY_NAME = new Map<string, PartnerLink>();
const BY_SLUG = new Map<string, PartnerLink>();
for (const p of PARTNER_LINKS) {
  BY_SLUG.set(p.slug, p);
  for (const name of [p.name, ...(p.aliases ?? [])]) {
    BY_NAME.set(normalize(name), p);
  }
}

export function partnerBySlug(slug: string): PartnerLink | undefined {
  return BY_SLUG.get(slug);
}

interface ToolLinkOptions {
  from: ClickSource;
  /** Lead que hace clic (página de resultado y email). */
  lead?: string;
  /** URL absoluta, para el email. */
  origin?: string;
}

/** Enlace de seguimiento /go/{slug}/ de una herramienta, o undefined si no
 *  tiene programa de afiliado. */
export function toolLink(name: string, { from, lead, origin = '' }: ToolLinkOptions): string | undefined {
  const partner = BY_NAME.get(normalize(name));
  if (!partner) return undefined;
  const params = new URLSearchParams({ from });
  if (lead) params.set('lead', lead);
  return `${origin}/go/${partner.slug}/?${params}`;
}
