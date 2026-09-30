// ============================================================================
// WISDO ENGINE — lógica de diagnóstico del quiz (foco: Ventas y Captación)
// ============================================================================
// Reglas deterministas: deciden archetype + stack a partir de las respuestas.
// La IA (ver src/pages/api/capture.ts) solo redacta el "por qué" personalizado
// una vez que el stack ya está decidido aquí.
//
// Leyenda en cada tool:
//   partner: true   — está en PartnerStack, genera comisión
//   activated: true — ya tienes el afiliado activo
//   free: true      — tiene plan gratis relevante
// ============================================================================

export interface QuizOption {
  value: string;
  icon: string;
  label: string;
  desc: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  sub: string;
  options: QuizOption[];
}

// Textos en inglés (la web está en inglés). Los `value` son los códigos que
// se guardan en Supabase y validan los CHECK de la tabla leads: no traducir.
export const QUESTIONS: QuizQuestion[] = [
  {
    id: 'problema_raiz',
    question: "What's holding your sales back the most right now?",
    sub: 'Pick the one that sounds most like you.',
    options: [
      { value: 'no_llegan_leads', icon: '🎯', label: 'Not enough leads coming in', desc: 'Your offer is good, but you have too few prospects to talk to' },
      { value: 'prospeccion_manual', icon: '🐌', label: 'I spend hours finding contacts by hand', desc: 'Copying data from LinkedIn and hunting emails one by one' },
      { value: 'leads_no_cierran', icon: '🤝', label: 'I talk to prospects but don’t close', desc: 'Leads come in, then go cold or disappear' },
      { value: 'sin_seguimiento', icon: '📉', label: 'Follow-ups slip through the cracks', desc: 'No system to keep conversations going, so deals get lost' },
    ],
  },
  {
    id: 'situacion_actual',
    question: 'How are you handling it today?',
    sub: 'This tells us whether you’re missing a tool or underusing one.',
    options: [
      { value: 'todo_manual', icon: '✍️', label: 'Manually / spreadsheets', desc: 'No dedicated tools yet' },
      { value: 'herramientas_sueltas', icon: '🧩', label: 'A few separate tools', desc: 'Not connected, and not fully used' },
      { value: 'equipo_externo', icon: '👥', label: 'Someone else does it / an agency', desc: 'You pay for it but have little control or visibility' },
      { value: 'nada', icon: '🚫', label: 'Not handling it yet', desc: 'You know it’s a problem but haven’t tackled it' },
    ],
  },
  {
    id: 'tipo_negocio',
    question: 'What kind of business do you run?',
    sub: 'So the stack fits how you actually sell.',
    options: [
      { value: 'agencia', icon: '🏢', label: 'Agency', desc: 'You manage clients and campaigns' },
      { value: 'saas', icon: '☁️', label: 'SaaS', desc: 'You sell software on subscription' },
      { value: 'consultor', icon: '🧠', label: 'Consultant / Freelancer', desc: 'You sell your expertise' },
      { value: 'ecommerce', icon: '🛍️', label: 'Ecommerce', desc: 'You sell products online' },
    ],
  },
  {
    id: 'etapa',
    question: 'What stage is the business at?',
    sub: 'The right stack to validate is not the right stack to scale.',
    options: [
      { value: 'validando', icon: '🔬', label: 'Validating', desc: 'Looking for your first customers' },
      { value: 'creciendo', icon: '📈', label: 'Growing', desc: 'Already selling, want more volume' },
      { value: 'escalando', icon: '🚀', label: 'Scaling', desc: 'Optimizing a machine that already works' },
    ],
  },
  {
    id: 'presupuesto',
    question: 'How much can you invest in tools each month?',
    sub: 'We recommend the best stack for your range.',
    options: [
      { value: '0-100', icon: '🌱', label: 'Up to €100', desc: 'Bootstrapped: maximum impact per euro' },
      { value: '100-500', icon: '📊', label: '€100 – €500', desc: 'A solid, complete stack' },
      { value: '500+', icon: '👑', label: '€500 or more', desc: 'The best available, no constraints' },
    ],
  },
];

export interface Archetype {
  name: string;
  emoji: string;
  tagline: string;
}

export const ARCHETYPES: Record<string, Archetype> = {
  agencia: { name: 'The Ruler', emoji: '👑', tagline: 'Control, process and measurable results.' },
  saas: { name: 'The Magician', emoji: '✨', tagline: 'Automation and intelligence at scale.' },
  consultor: { name: 'The Sage', emoji: '🧭', tagline: 'Authority, trust and deep relationships.' },
  ecommerce: { name: 'The Hero', emoji: '⚡', tagline: 'Speed, volume and direct conversion.' },
};

export interface StackTool {
  name: string;
  role: string;
  partner?: boolean;
  activated?: boolean;
  free?: boolean;
}

export interface Stack {
  name: string;
  cost: string;
  tools: StackTool[];
  alt: string | null;
}

// Herramientas con programa de afiliado activo en PartnerStack (ver
// src/data/partner-links.ts), elegidas según lo que necesita cada problema.
// Sin programa, solo PandaDoc (propuestas y firma) y Synthflow AI (agente de
// voz): no hay alternativa en PartnerStack para esas necesidades.
// `cost` es una estimación por tramo de presupuesto; revisar con precios reales.
export const STACKS: Record<string, Stack> = {
  // — NOT ENOUGH LEADS —
  captacion_lean: {
    name: 'Lean Lead Generation Stack', cost: '~€50/mo',
    tools: [
      { name: 'Apollo.io', role: 'B2B database: find prospects instead of searching blindly', partner: true, activated: true, free: true },
      { name: 'ManyChat', role: 'Turns Instagram comments and DMs into leads automatically', partner: true, activated: true, free: true },
      { name: 'GetResponse', role: 'Email marketing and landing pages to nurture people who aren’t ready to buy', partner: true, activated: true },
    ],
    alt: 'Apollo + ManyChat free plans (€0 to start)',
  },
  captacion_completa: {
    name: 'Complete Lead Generation Stack', cost: '~€200/mo',
    tools: [
      { name: 'Apollo.io', role: 'Find and segment your ideal customers', partner: true, activated: true },
      { name: 'lemlist', role: 'Personalized outreach sequences that run on their own', partner: true, activated: true },
      { name: 'GetResponse', role: 'Landing pages and email automation that turn visits into leads', partner: true, activated: true },
      { name: 'ManyChat', role: 'Lead capture through social media DMs', partner: true, activated: true },
    ],
    alt: 'Apollo + lemlist + ManyChat free (~€120)',
  },
  captacion_premium: {
    name: 'Premium Lead Generation Stack', cost: '~€450/mo',
    tools: [
      { name: 'Apollo.io', role: 'End-to-end sales intelligence', partner: true, activated: true },
      { name: 'lemlist', role: 'Multichannel outreach with AI personalization', partner: true, activated: true },
      { name: 'GetResponse', role: 'High-converting landing pages, webinars and nurturing', partner: true, activated: true },
      { name: 'Bïrch', role: 'Automated rules to manage and scale Meta and Google ads', partner: true, activated: true },
      { name: 'Nutshell', role: 'CRM that centralizes every lead that comes in', partner: true, activated: true },
    ],
    alt: null,
  },

  // — MANUAL PROSPECTING —
  antimanual_lean: {
    name: 'Lean Anti-Manual Stack', cost: '~€60/mo',
    tools: [
      { name: 'Apollo.io', role: 'Segmented lists in seconds: no more copy-pasting', partner: true, activated: true, free: true },
      { name: 'Lusha', role: 'Direct contact details straight from LinkedIn', partner: true, activated: true, free: true },
    ],
    alt: 'Apollo + Lusha free plans (~€0–30)',
  },
  antimanual_pro: {
    name: 'Pro Anti-Manual Stack', cost: '~€180/mo',
    tools: [
      { name: 'Apollo.io', role: 'Automated prospecting with built-in sequences', partner: true, activated: true },
      { name: 'Lusha', role: 'Contact enrichment from LinkedIn', partner: true, activated: true },
      { name: 'lemlist', role: 'Sequences run on their own while you work', partner: true, activated: true },
    ],
    alt: 'Apollo + Lusha (~€90)',
  },
  antimanual_premium: {
    name: 'Premium Anti-Manual Stack', cost: '~€400/mo',
    tools: [
      { name: 'Amplemarket', role: 'AI sales platform: finds, enriches and contacts prospects for you', partner: true, activated: true },
      { name: 'Lusha', role: 'Verified emails and phone numbers to fill the gaps', partner: true, activated: true },
      { name: 'lemlist', role: 'Automated email and LinkedIn outreach', partner: true, activated: true },
      { name: 'n8n', role: 'Connects your tools so new contacts reach the CRM without manual work', partner: true, activated: true },
    ],
    alt: null,
  },

  // — LEADS DON'T CLOSE —
  cierre_esencial: {
    name: 'Essential Closing Stack', cost: '~€30/mo',
    tools: [
      { name: 'Capsule', role: 'Visual pipeline to see where every deal stands', partner: true, activated: true, free: true },
      { name: 'Wati.io', role: 'Close on WhatsApp, where your leads actually reply', partner: true, activated: true },
    ],
    alt: 'Capsule free plan + Wati basic plan (~€20)',
  },
  cierre_optimizado: {
    name: 'Optimized Closing Stack', cost: '~€250/mo',
    tools: [
      { name: 'Nutshell', role: 'Easy-to-use CRM that automates sales tasks', partner: true, activated: true },
      { name: 'KrispCall', role: 'Follow-up calls logged against each contact', partner: true, activated: true },
      { name: 'Wati.io', role: 'Nurturing and closing on WhatsApp', partner: true, activated: true },
      { name: 'PandaDoc', role: 'Proposals and e-signatures to close faster' },
    ],
    alt: 'Capsule free + Wati + KrispCall (~€120)',
  },
  cierre_premium: {
    name: 'Revenue Operations Stack', cost: '~€550/mo',
    tools: [
      { name: 'Nutshell', role: 'CRM with advanced pipeline automation', partner: true, activated: true },
      { name: 'KrispCall', role: 'Virtual call center for the whole team', partner: true, activated: true },
      { name: 'PandaDoc', role: 'Proposals, quotes and e-signatures in one flow' },
      { name: 'Synthflow AI', role: 'AI voice agent that qualifies leads and books meetings' },
      { name: 'Wati.io', role: 'WhatsApp Business API for the whole sales cycle', partner: true, activated: true },
    ],
    alt: null,
  },

  // — NO FOLLOW-UP —
  seguimiento_lean: {
    name: 'Lean Follow-up Stack', cost: '~€40/mo',
    tools: [
      { name: 'Capsule', role: 'Reminders and tasks so nothing slips', partner: true, activated: true, free: true },
      { name: 'ManyChat', role: 'Automatic DM follow-ups to re-engage cold leads', partner: true, activated: true, free: true },
    ],
    alt: 'Capsule + ManyChat free plans (€0)',
  },
  seguimiento_pro: {
    name: 'Pro Follow-up Stack', cost: '~€200/mo',
    tools: [
      { name: 'folk', role: 'Relationship CRM with follow-up reminders and email sequences', partner: true, activated: true },
      { name: 'lemlist', role: 'Email cadences that keep following up without being pushy', partner: true, activated: true },
      { name: 'Wati.io', role: 'WhatsApp follow-ups with high open rates', partner: true, activated: true },
    ],
    alt: 'Capsule free + lemlist (~€50)',
  },
  seguimiento_premium: {
    name: 'Premium Follow-up Stack', cost: '~€350/mo',
    tools: [
      { name: 'Nutshell', role: 'CRM with automated follow-up sequences', partner: true, activated: true },
      { name: 'GetResponse', role: 'Marketing automation to re-engage leads by behavior', partner: true, activated: true },
      { name: 'lemlist', role: 'Multichannel re-engagement sequences', partner: true, activated: true },
      { name: 'CallHippo', role: 'Calls and SMS for high-touch follow-up', partner: true, activated: true },
      { name: 'Wati.io', role: 'WhatsApp for high-touch follow-up', partner: true, activated: true },
    ],
    alt: null,
  },
};

const STACK_MATRIX: Record<string, Record<string, string>> = {
  no_llegan_leads: { '0-100': 'captacion_lean', '100-500': 'captacion_completa', '500+': 'captacion_premium' },
  prospeccion_manual: { '0-100': 'antimanual_lean', '100-500': 'antimanual_pro', '500+': 'antimanual_premium' },
  leads_no_cierran: { '0-100': 'cierre_esencial', '100-500': 'cierre_optimizado', '500+': 'cierre_premium' },
  sin_seguimiento: { '0-100': 'seguimiento_lean', '100-500': 'seguimiento_pro', '500+': 'seguimiento_premium' },
};

const DEFAULT_STACK = 'captacion_completa';
const DEFAULT_ARCHETYPE_KEY = 'agencia';

export type QuizAnswers = Record<string, string | undefined>;

export interface DiagnosisResult {
  archetype: Archetype;
  stackKey: string;
  stack: Stack;
}

export function resolveDiagnosis(answers: QuizAnswers): DiagnosisResult {
  const problemaRaiz = answers.problema_raiz;
  const tipoNegocio = answers.tipo_negocio;
  const presupuesto = answers.presupuesto;

  const byProblem = (problemaRaiz && STACK_MATRIX[problemaRaiz]) || {};
  const stackKey = (presupuesto && byProblem[presupuesto]) || DEFAULT_STACK;
  const stack = STACKS[stackKey] ?? (STACKS[DEFAULT_STACK] as Stack);
  const archetype = (tipoNegocio && ARCHETYPES[tipoNegocio]) || (ARCHETYPES[DEFAULT_ARCHETYPE_KEY] as Archetype);

  return { archetype, stackKey, stack };
}

// Valores permitidos por pregunta, derivados de QUESTIONS — evita que
// respuestas arbitrarias (no elegidas en el quiz) contaminen el analytics.
const QUESTION_VALUES: Map<string, Set<string>> = new Map(
  QUESTIONS.map((q) => [q.id, new Set(q.options.map((o) => o.value))])
);

export interface ValidationResult {
  valid: boolean;
  missing: string[];
  invalid: string[];
}

export function validateAnswers(answers: QuizAnswers | undefined | null): ValidationResult {
  const required = ['problema_raiz', 'tipo_negocio', 'presupuesto'];
  const missing = required.filter((k) => !answers?.[k]);

  const invalid: string[] = [];
  if (answers) {
    for (const [key, value] of Object.entries(answers)) {
      if (value === undefined) continue;
      const allowed = QUESTION_VALUES.get(key);
      if (allowed && !allowed.has(value)) {
        invalid.push(key);
      }
    }
  }

  return { valid: missing.length === 0 && invalid.length === 0, missing, invalid };
}
