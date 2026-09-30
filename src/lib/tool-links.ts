// Enlace de afiliado de una herramienta del motor de diagnóstico.
// El motor (wisdo-engine) y el marketplace (data/tools) escriben algunos
// nombres distinto ("Manychat" / "ManyChat"), así que se casan normalizados.
// Devuelve undefined si la herramienta no está en el marketplace.
import { tools } from '@data/tools';

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const TOOL_URLS = new Map(tools.map((t) => [normalize(t.name), t.externalUrl]));

export function toolUrl(name: string): string | undefined {
  return TOOL_URLS.get(normalize(name));
}
