// Enlace de afiliado de una herramienta, por nombre.
// El motor (wisdo-engine), el marketplace (data/tools) y PartnerStack escriben
// algunos nombres distinto ("Manychat" / "ManyChat", "Wati.io" / "Wati"), así
// que se comparan normalizados y con alias. Devuelve undefined si no hay
// programa de afiliado para esa herramienta.
import { PARTNER_LINKS } from '@data/partner-links';

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const TOOL_URLS = new Map<string, string>();
for (const p of PARTNER_LINKS) {
  for (const name of [p.name, ...(p.aliases ?? [])]) {
    TOOL_URLS.set(normalize(name), p.url);
  }
}

export function toolUrl(name: string): string | undefined {
  return TOOL_URLS.get(normalize(name));
}
