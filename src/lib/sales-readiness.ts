// ============================================================================
// SALES READINESS — el score del dashboard
// ============================================================================
// Puntúa de 0 a 100 lo "equipada" que está la web del usuario para vender,
// a partir de las herramientas detectadas en su HTML (site-reader) y del
// stack que le recomendó el motor. Cinco áreas con peso; un área cuenta si
// hay al menos una herramienta detectada de esa área. Para las áreas vacías
// se sugiere la herramienta del stack que las cubre, si la hay.
//
// Es determinista y gratis (sin IA): el mismo lead da siempre el mismo score,
// y re-analizar la web es lo único que lo cambia.
// ============================================================================
import { tools as MARKET_TOOLS } from '@data/tools';
import type { Stack } from '@lib/wisdo-engine';

export interface ReadinessArea {
  id: string;
  label: string;
  /** Qué aporta el área, en una frase. */
  hint: string;
  weight: number;
  /** Herramientas detectadas en la web que cubren el área. */
  covered: string[];
  /** Herramienta del stack recomendado que cubriría el área si está vacía. */
  suggestion: string | null;
}

export interface Readiness {
  score: number;
  label: string;
  areas: ReadinessArea[];
}

interface AreaDef {
  id: string;
  label: string;
  hint: string;
  weight: number;
  /** Nombres tal y como los devuelve detectTools() en site-reader. */
  signals: string[];
  /** categorySlug de data/tools que cubre el área. */
  categories: string[];
  /** Herramientas concretas del motor que cubren el área aunque su categoría
   *  no (ManyChat capta leads por DM, pero "messaging" también tiene centralitas). */
  names?: string[];
}

// Los pesos suman 100.
const AREAS: AreaDef[] = [
  {
    id: 'crm',
    label: 'CRM',
    hint: 'Somewhere to track every lead and deal',
    weight: 25,
    signals: ['HubSpot', 'Salesforce / Pardot', 'Zoho', 'Pipedrive'],
    categories: ['crm'],
  },
  {
    id: 'capture',
    label: 'Lead capture',
    hint: 'Forms or booking so visitors can reach you',
    weight: 25,
    signals: ['Calendly', 'Typeform', 'HubSpot'],
    categories: ['email'],
    names: ['ManyChat', 'Wati.io'],
  },
  {
    id: 'email',
    label: 'Email marketing',
    hint: 'Nurture the people who aren’t ready to buy',
    weight: 20,
    signals: ['Mailchimp', 'Klaviyo', 'ActiveCampaign', 'Brevo', 'HubSpot', 'Salesforce / Pardot'],
    categories: ['email'],
  },
  {
    id: 'messaging',
    label: 'Chat & messaging',
    hint: 'Answer prospects where they already are',
    weight: 15,
    signals: ['Intercom', 'Crisp', 'Tidio', 'WhatsApp'],
    categories: ['messaging'],
  },
  {
    id: 'tracking',
    label: 'Tracking & analytics',
    hint: 'Know where your leads come from',
    weight: 15,
    signals: ['Google Tag Manager', 'Google Analytics', 'Meta Pixel', 'LinkedIn Insight', 'Hotjar'],
    categories: ['ads'],
  },
];

const LABELS: [number, string][] = [
  [86, 'Advanced'],
  [61, 'Solid'],
  [31, 'Building'],
  [0, 'Getting started'],
];

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

// El motor escribe "Wati.io" y el catálogo "Wati": se compara por prefijo.
function categoryOf(stackToolName: string): string | null {
  const n = normalize(stackToolName);
  const tool = MARKET_TOOLS.find((t) => {
    const m = normalize(t.name);
    return n === m || n.startsWith(m) || m.startsWith(n);
  });
  return tool?.categorySlug ?? null;
}

export function salesReadiness(detectedTools: string[], stack: Stack): Readiness {
  const detected = new Set(detectedTools);
  const stackByCategory = new Map<string, string>();
  for (const t of stack.tools) {
    const cat = categoryOf(t.name);
    if (cat && !stackByCategory.has(cat)) stackByCategory.set(cat, t.name);
  }

  const stackNames = new Set(stack.tools.map((t) => normalize(t.name)));

  const areas: ReadinessArea[] = AREAS.map((a) => {
    const covered = a.signals.filter((s) => detected.has(s));
    const suggestion = covered.length
      ? null
      : (a.categories.map((c) => stackByCategory.get(c)).find(Boolean) ??
        a.names?.find((n) => stackNames.has(normalize(n))) ??
        null);
    return { id: a.id, label: a.label, hint: a.hint, weight: a.weight, covered, suggestion };
  });

  const score = areas.reduce((sum, a) => sum + (a.covered.length ? a.weight : 0), 0);
  const label = LABELS.find(([min]) => score >= min)?.[1] ?? 'Getting started';
  return { score, label, areas };
}
