export interface Tool {
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  description: string;
  pricing: 'free' | 'freemium' | 'paid';
  priceLabel: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  logo: string;
  externalUrl: string;
  featured?: boolean;
}

export interface Category {
  label: string;
  slug: string;
  description: string;
}

export const categories: Category[] = [
  { label: 'Todos', slug: 'all', description: 'Todas las herramientas del marketplace' },
  { label: 'Prospecting', slug: 'prospecting', description: 'Encuentra y enriquece contactos B2B' },
  { label: 'Outreach', slug: 'outreach', description: 'Automatiza emails y secuencias de ventas' },
  { label: 'Calling', slug: 'calling', description: 'Centralitas cloud y VoIP para ventas' },
  { label: 'Automation', slug: 'automation', description: 'Automatización de conversaciones y flujos' },
];

export const tools: Tool[] = [
  {
    name: 'Apollo.io',
    slug: 'apollo',
    category: 'Prospecting',
    categorySlug: 'prospecting',
    description:
      'Base de datos B2B con más de 275M de contactos verificados. Encuentra leads, enriquece datos y lanza secuencias de email desde una sola plataforma.',
    pricing: 'freemium',
    priceLabel: 'Gratis · desde $49/mes',
    rating: 4.7,
    reviewCount: 8400,
    tags: ['Email', 'Lead gen', 'Enrichment', 'Sequences'],
    logo: '🎯',
    externalUrl: 'https://www.apollo.io',
    featured: true,
  },
  {
    name: 'Kaspr',
    slug: 'kaspr',
    category: 'Prospecting',
    categorySlug: 'prospecting',
    description:
      'Extensión de LinkedIn que revela emails y teléfonos verificados de cualquier perfil en tiempo real. Integra con tu CRM con un clic.',
    pricing: 'freemium',
    priceLabel: 'Gratis · desde €30/mes',
    rating: 4.4,
    reviewCount: 1200,
    tags: ['LinkedIn', 'Teléfonos', 'Email'],
    logo: '📋',
    externalUrl: 'https://www.kaspr.io',
    featured: true,
  },
  {
    name: 'KrispCall',
    slug: 'krispcall',
    category: 'Calling',
    categorySlug: 'calling',
    description:
      'Centralita cloud con IA para equipos de ventas. Número local en más de 100 países, grabación automática de llamadas y resúmenes IA.',
    pricing: 'paid',
    priceLabel: 'Desde $15/usuario/mes',
    rating: 4.3,
    reviewCount: 560,
    tags: ['VoIP', 'Cloud PBX', 'IA', 'Grabación'],
    logo: '📞',
    externalUrl: 'https://www.krispcall.com',
    featured: false,
  },
  {
    name: 'Lemlist',
    slug: 'lemlist',
    category: 'Outreach',
    categorySlug: 'outreach',
    description:
      'Plataforma de cold outreach con personalización de imagen, video y texto dinámico. Combina email, LinkedIn y llamadas en una sola secuencia.',
    pricing: 'paid',
    priceLabel: 'Desde $39/mes',
    rating: 4.6,
    reviewCount: 3100,
    tags: ['Cold email', 'Personalización', 'Multichannel'],
    logo: '✉️',
    externalUrl: 'https://www.lemlist.com',
    featured: true,
  },
  {
    name: 'Lusha',
    slug: 'lusha',
    category: 'Prospecting',
    categorySlug: 'prospecting',
    description:
      'Enriquecimiento de contactos B2B con alta precisión. Obtén teléfonos directos y emails profesionales verificados para cualquier decisor.',
    pricing: 'freemium',
    priceLabel: 'Gratis · desde $36/mes',
    rating: 4.2,
    reviewCount: 2800,
    tags: ['Enrichment', 'Teléfonos', 'CRM sync'],
    logo: '🔍',
    externalUrl: 'https://www.lusha.com',
    featured: false,
  },
  {
    name: 'ManyChat',
    slug: 'manychat',
    category: 'Automation',
    categorySlug: 'automation',
    description:
      'Automatización de conversaciones en Instagram, WhatsApp y Facebook Messenger. Genera leads y cierra ventas directamente desde los DMs.',
    pricing: 'freemium',
    priceLabel: 'Gratis · desde $15/mes',
    rating: 4.5,
    reviewCount: 6700,
    tags: ['WhatsApp', 'Instagram', 'Chatbot', 'DMs'],
    logo: '💬',
    externalUrl: 'https://manychat.com',
    featured: true,
  },
];

export const pricingConfig = {
  free:     { label: 'Gratis',    colorClass: 'tag--green' },
  freemium: { label: 'Freemium',  colorClass: 'tag--purple' },
  paid:     { label: 'Pago',      colorClass: 'tag--dark' },
} as const;
