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

export const QUESTIONS: QuizQuestion[] = [
  {
    id: 'problema_raiz',
    question: '¿Qué es lo que más te está frenando ahora mismo?',
    sub: 'Vamos directo a lo que duele. Elige lo que más te suene.',
    options: [
      { value: 'no_llegan_leads', icon: '🎯', label: 'No llegan suficientes clientes potenciales', desc: 'Tienes buena oferta pero pocos prospectos con quien hablar' },
      { value: 'prospeccion_manual', icon: '🐌', label: 'Pierdo horas buscando contactos a mano', desc: 'Copias datos de LinkedIn, buscas emails uno a uno, no escala' },
      { value: 'leads_no_cierran', icon: '🤝', label: 'Hablo con gente pero no cierro', desc: 'Los prospectos llegan pero se enfrían o desaparecen' },
      { value: 'sin_seguimiento', icon: '📉', label: 'Se me caen los seguimientos', desc: 'No tienes un sistema para dar continuidad y se pierden ventas' },
    ],
  },
  {
    id: 'situacion_actual',
    question: '¿Cómo lo estás resolviendo hoy?',
    sub: 'Esto nos dice si te falta una herramienta o si tienes una mal usada.',
    options: [
      { value: 'todo_manual', icon: '✍️', label: 'Todo a mano / hojas de cálculo', desc: 'Sin herramientas dedicadas todavía' },
      { value: 'herramientas_sueltas', icon: '🧩', label: 'Tengo alguna herramienta suelta', desc: 'Pero no están conectadas ni las aprovecho del todo' },
      { value: 'equipo_externo', icon: '👥', label: 'Lo delego a alguien / agencia', desc: 'Pagas por ello pero no tienes control ni visibilidad' },
      { value: 'nada', icon: '🚫', label: 'No lo estoy resolviendo', desc: 'Sabes que es un problema pero aún no le has metido mano' },
    ],
  },
  {
    id: 'tipo_negocio',
    question: '¿Qué tipo de negocio tienes?',
    sub: 'Para ajustar el stack a tu realidad.',
    options: [
      { value: 'agencia', icon: '🏢', label: 'Agencia', desc: 'Gestionas clientes y campañas' },
      { value: 'saas', icon: '☁️', label: 'SaaS', desc: 'Vendes software por suscripción' },
      { value: 'consultor', icon: '🧠', label: 'Consultor / Freelance', desc: 'Vendes tu expertise' },
      { value: 'ecommerce', icon: '🛍️', label: 'Ecommerce', desc: 'Vendes productos online' },
    ],
  },
  {
    id: 'etapa',
    question: '¿En qué momento está el negocio?',
    sub: 'El stack correcto para validar no es el mismo que para escalar.',
    options: [
      { value: 'validando', icon: '🔬', label: 'Validando', desc: 'Buscando los primeros clientes' },
      { value: 'creciendo', icon: '📈', label: 'Creciendo', desc: 'Ya vendes, quieres más volumen' },
      { value: 'escalando', icon: '🚀', label: 'Escalando', desc: 'Optimizando una máquina que ya funciona' },
    ],
  },
  {
    id: 'presupuesto',
    question: '¿Cuánto puedes invertir en herramientas al mes?',
    sub: 'Te damos el mejor stack posible para tu rango. Sin sorpresas.',
    options: [
      { value: '0-100', icon: '🌱', label: 'Hasta 100€', desc: 'Bootstrapped, máximo impacto por euro' },
      { value: '100-500', icon: '📊', label: '100 – 500€', desc: 'Stack sólido y completo' },
      { value: '500+', icon: '👑', label: '500€ o más', desc: 'Sin restricciones, lo mejor disponible' },
    ],
  },
];

export interface Archetype {
  name: string;
  emoji: string;
  tagline: string;
}

export const ARCHETYPES: Record<string, Archetype> = {
  agencia: { name: 'The Ruler', emoji: '👑', tagline: 'Control, proceso y resultados medibles.' },
  saas: { name: 'The Magician', emoji: '✨', tagline: 'Automatización e inteligencia a escala.' },
  consultor: { name: 'The Sage', emoji: '🧭', tagline: 'Autoridad, confianza y relaciones profundas.' },
  ecommerce: { name: 'The Hero', emoji: '⚡', tagline: 'Velocidad, volumen y conversión directa.' },
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

export const STACKS: Record<string, Stack> = {
  // — NO LLEGAN LEADS —
  captacion_lean: {
    name: 'Stack de Captación Lean', cost: '~50€/mes',
    tools: [
      { name: 'Apollo.io', role: 'Base de datos B2B: encuentra prospectos sin buscar a ciegas', partner: true, activated: true, free: true },
      { name: 'Manychat', role: 'Convierte comentarios de Instagram en leads automáticamente', partner: true, activated: true, free: true },
      { name: 'Sender', role: 'Email marketing para nutrir a los que aún no compran', partner: true },
    ],
    alt: 'Apollo free + Manychat free (0€ para empezar)',
  },
  captacion_completa: {
    name: 'Stack de Captación Completo', cost: '~200€/mes',
    tools: [
      { name: 'Apollo.io', role: 'Encuentra y segmenta a tus clientes ideales', partner: true, activated: true },
      { name: 'lemlist', role: 'Secuencias de outreach personalizadas en automático', partner: true, activated: true },
      { name: 'Leadpages', role: 'Landing pages que convierten visitas en leads', partner: true },
      { name: 'Manychat', role: 'Captación por DM en redes sociales', partner: true, activated: true },
    ],
    alt: 'Apollo + lemlist + Manychat free (~120€)',
  },
  captacion_premium: {
    name: 'Stack de Captación Premium', cost: '~450€/mes',
    tools: [
      { name: 'Apollo.io', role: 'Inteligencia de ventas end-to-end', partner: true, activated: true },
      { name: 'lemlist', role: 'Outreach multicanal con personalización IA', partner: true, activated: true },
      { name: 'Instapage', role: 'Landing pages de alto rendimiento con A/B testing', partner: true },
      { name: 'Adwisely', role: 'Ads en Meta y Google gestionados con IA', partner: true },
      { name: 'HubSpot CRM', role: 'CRM para centralizar todos los leads que entran', free: true },
    ],
    alt: null,
  },

  // — PROSPECCIÓN MANUAL —
  antimanual_lean: {
    name: 'Stack Anti-Manual Lean', cost: '~60€/mes',
    tools: [
      { name: 'Apollo.io', role: 'Listas segmentadas al instante: adiós al copiar-pegar', partner: true, activated: true, free: true },
      { name: 'Lusha', role: 'Datos de contacto directos desde LinkedIn', partner: true, activated: true },
    ],
    alt: 'Apollo free tier + Lusha free (~0-30€)',
  },
  antimanual_pro: {
    name: 'Stack Anti-Manual Pro', cost: '~180€/mes',
    tools: [
      { name: 'Apollo.io', role: 'Prospección automática con secuencias integradas', partner: true, activated: true },
      { name: 'Lusha', role: 'Enriquecimiento de contactos desde LinkedIn', partner: true, activated: true },
      { name: 'lemlist', role: 'Las secuencias se ejecutan solas mientras trabajas', partner: true, activated: true },
    ],
    alt: 'Apollo + Lusha (~90€)',
  },
  antimanual_premium: {
    name: 'Stack Anti-Manual Premium', cost: '~400€/mes',
    tools: [
      { name: 'Apollo.io', role: 'Plataforma de inteligencia de ventas', partner: true, activated: true },
      { name: 'RocketReach', role: '700M+ contactos: datos que Apollo no tiene', partner: true },
      { name: 'lemlist', role: 'Outreach multicanal automatizado', partner: true, activated: true },
      { name: 'Closely', role: 'Automatización de LinkedIn + email (30% lifetime)', partner: true },
    ],
    alt: null,
  },

  // — LEADS NO CIERRAN —
  cierre_esencial: {
    name: 'Stack de Cierre Esencial', cost: '~30€/mes',
    tools: [
      { name: 'HubSpot CRM', role: 'Pipeline visual para ver en qué punto está cada deal', free: true },
      { name: 'Wati.io', role: 'Cierra por WhatsApp: donde tus leads sí responden', partner: true, activated: true },
    ],
    alt: 'HubSpot free + Wati plan básico (~20€)',
  },
  cierre_optimizado: {
    name: 'Stack de Cierre Optimizado', cost: '~250€/mes',
    tools: [
      { name: 'Pipedrive', role: 'CRM #1 en usabilidad: automatiza tareas de venta', partner: true },
      { name: 'KrispCall', role: 'Llamadas de seguimiento registradas por contacto', partner: true, activated: true },
      { name: 'Wati.io', role: 'Nurturing y cierre por WhatsApp', partner: true, activated: true },
      { name: 'PandaDoc', role: 'Propuestas y firma electrónica para cerrar más rápido', partner: true },
    ],
    alt: 'HubSpot free + Wati + KrispCall (~120€)',
  },
  cierre_premium: {
    name: 'Stack de Revenue Operations', cost: '~550€/mes',
    tools: [
      { name: 'Pipedrive', role: 'CRM con automatización avanzada de pipeline', partner: true },
      { name: 'KrispCall', role: 'Centro de llamadas virtual para el equipo', partner: true, activated: true },
      { name: 'PandaDoc', role: 'Propuestas, quotes y e-sign en un flujo', partner: true },
      { name: 'Synthflow AI', role: 'Agente de voz IA que califica y agenda solo', partner: true },
      { name: 'Wati.io', role: 'WhatsApp Business API para todo el ciclo', partner: true, activated: true },
    ],
    alt: null,
  },

  // — SIN SEGUIMIENTO —
  seguimiento_lean: {
    name: 'Stack de Seguimiento Lean', cost: '~40€/mes',
    tools: [
      { name: 'HubSpot CRM', role: 'Recordatorios y tareas para que nada se caiga', free: true },
      { name: 'Manychat', role: 'Seguimiento automático por DM para reactivar fríos', partner: true, activated: true, free: true },
    ],
    alt: 'HubSpot free + Manychat free (0€)',
  },
  seguimiento_pro: {
    name: 'Stack de Seguimiento Pro', cost: '~200€/mes',
    tools: [
      { name: 'Keap', role: 'CRM + automatización de follow-up para pymes', partner: true },
      { name: 'lemlist', role: 'Cadencias de email que insisten sin ser pesadas', partner: true, activated: true },
      { name: 'Wati.io', role: 'Seguimiento por WhatsApp con alta apertura', partner: true, activated: true },
    ],
    alt: 'HubSpot free + lemlist (~50€)',
  },
  seguimiento_premium: {
    name: 'Stack de Seguimiento Premium', cost: '~350€/mes',
    tools: [
      { name: 'Keap', role: 'Automatización de marketing y ventas todo-en-uno', partner: true },
      { name: 'lemlist', role: 'Secuencias multicanal de reactivación', partner: true, activated: true },
      { name: 'Salesmsg', role: 'SMS y llamadas nativas para HubSpot/Salesforce', partner: true },
      { name: 'Wati.io', role: 'WhatsApp para seguimiento de alto contacto', partner: true, activated: true },
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
