// Catálogo de wisdo Market. Solo herramientas con programa de afiliado activo
// (enlaces en src/data/partner-links.ts; el botón pasa por /go/{slug}/).
//
// Datos comprobados el 30/09/2026:
//   - rating / reviewCount: ficha pública de G2. Solo se muestran con ~50
//     reseñas o más y una cifra clara; si no, se omiten.
//   - pricing / priceLabel: página de precios oficial. "See pricing" cuando no
//     se pudo verificar (página bloqueada o sin precios públicos).
// Revisar cada pocos meses: las valoraciones y los precios cambian.

export interface Tool {
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  tagline: string;
  description: string;
  bestFor: string;
  pricing: 'free' | 'freemium' | 'paid';
  priceLabel: string;
  rating?: number;
  reviewCount?: number;
  /** Ficha de G2 de la que sale la valoración. */
  ratingUrl?: string;
  tags: string[];
  mono: string;
  color: string;
  cta: string;
  /** Enlace directo si la herramienta no tiene slug en partner-links. */
  externalUrl: string;
  featured?: boolean;
}

export interface Category {
  label: string;
  slug: string;
  description: string;
}

export const categories: Category[] = [
  { label: 'All',                slug: 'all',          description: 'All tools in the marketplace' },
  { label: 'Prospecting',        slug: 'prospecting',  description: 'Find and enrich B2B contacts' },
  { label: 'Outreach',           slug: 'outreach',     description: 'Automate email and LinkedIn sequences' },
  { label: 'CRM',                slug: 'crm',          description: 'Manage contacts, deals and follow-ups' },
  { label: 'Email marketing',    slug: 'email',        description: 'Newsletters, automation and landing pages' },
  { label: 'Messaging & calls',  slug: 'messaging',    description: 'Chatbots, WhatsApp and cloud telephony' },
  { label: 'Automation',         slug: 'automation',   description: 'Connect your tools and automate workflows' },
  { label: 'Ads & analytics',    slug: 'ads',          description: 'Ad automation, attribution and AI visibility' },
  { label: 'Websites & courses', slug: 'websites',     description: 'Build sites, apps, webinars and courses' },
  { label: 'Ecommerce',          slug: 'ecommerce',    description: 'Dropshipping and product sourcing' },
];

export const tools: Tool[] = [
  // — Prospecting —
  {
    name: 'Apollo.io', slug: 'apollo', category: 'Prospecting', categorySlug: 'prospecting',
    tagline: 'All-in-one lead generation & sales engagement.',
    description: 'B2B contact database with email finder, sequences and a built-in CRM in one place.',
    bestFor: 'Building & working lead lists',
    pricing: 'freemium', priceLabel: 'Free plan',
    rating: 4.7, reviewCount: 9696, ratingUrl: 'https://www.g2.com/sellers/apollo-io',
    tags: ['Lead gen', 'CRM'], mono: 'A', color: '#3B4BF0', cta: 'Get Apollo',
    externalUrl: 'https://www.apollo.io/', featured: true,
  },
  {
    name: 'Lusha', slug: 'lusha', category: 'Prospecting', categorySlug: 'prospecting',
    tagline: 'Accurate B2B contact data.',
    description: 'Verified emails and direct phone numbers, with a browser extension for LinkedIn and your CRM.',
    bestFor: 'Enriching contacts from LinkedIn',
    pricing: 'freemium', priceLabel: 'Free plan',
    rating: 4.3, reviewCount: 1665, ratingUrl: 'https://www.g2.com/sellers/lusha',
    tags: ['B2B data', 'Enrichment'], mono: 'Lu', color: '#FF6B2C', cta: 'Get Lusha',
    externalUrl: 'https://www.lusha.com/',
  },
  {
    name: 'Kaspr', slug: 'kaspr', category: 'Prospecting', categorySlug: 'prospecting',
    tagline: 'Phone numbers and emails from LinkedIn.',
    description: 'Chrome extension that finds contact details for LinkedIn profiles in one click.',
    bestFor: 'LinkedIn prospecting',
    pricing: 'freemium', priceLabel: 'Freemium',
    rating: 4.4, reviewCount: 833, ratingUrl: 'https://www.g2.com/sellers/kaspr',
    tags: ['LinkedIn', 'Contacts'], mono: 'K', color: '#6C5CE7', cta: 'Get Kaspr',
    externalUrl: 'https://www.kaspr.io/',
  },
  {
    name: 'Amplemarket', slug: 'amplemarket', category: 'Prospecting', categorySlug: 'prospecting',
    tagline: 'AI sales platform for outbound teams.',
    description: 'Finds, enriches and contacts prospects across email, LinkedIn and phone with AI assistance.',
    bestFor: 'Scaling outbound with AI',
    pricing: 'paid', priceLabel: 'From $600/mo',
    rating: 4.6, reviewCount: 657, ratingUrl: 'https://www.g2.com/sellers/amplemarket',
    tags: ['AI SDR', 'Outbound'], mono: 'Am', color: '#0F62FE', cta: 'Book an Amplemarket demo',
    externalUrl: 'https://www.amplemarket.com/',
  },

  // — Outreach —
  {
    name: 'lemlist', slug: 'lemlist', category: 'Outreach', categorySlug: 'outreach',
    tagline: 'Personalized cold outreach at scale.',
    description: 'Multichannel sequences across email and LinkedIn with personalization and deliverability tools.',
    bestFor: 'Cold email & LinkedIn sequences',
    pricing: 'paid', priceLabel: 'From $55/mo · free trial',
    rating: 4.6, reviewCount: 1424, ratingUrl: 'https://www.g2.com/sellers/lemlist',
    tags: ['Cold email', 'Outreach'], mono: 'L', color: '#1E73FF', cta: 'Try lemlist',
    externalUrl: 'https://www.lemlist.com/', featured: true,
  },

  // — CRM —
  {
    name: 'Capsule', slug: 'capsule', category: 'CRM', categorySlug: 'crm',
    tagline: 'Simple CRM for small teams.',
    description: 'Contacts, sales pipelines and tasks in a clean interface. Free for up to 2 users.',
    bestFor: 'A first CRM for small teams',
    pricing: 'freemium', priceLabel: 'Free plan',
    rating: 4.7, reviewCount: 476, ratingUrl: 'https://www.g2.com/products/capsule-crm/reviews',
    tags: ['CRM', 'Pipeline'], mono: 'C', color: '#5A45FF', cta: 'Try Capsule',
    externalUrl: 'https://capsulecrm.com/',
  },
  {
    name: 'Nutshell', slug: 'nutshell', category: 'CRM', categorySlug: 'crm',
    tagline: 'CRM with built-in sales automation.',
    description: 'Pipeline management, automated follow-ups and email marketing in one CRM.',
    bestFor: 'Growing sales teams',
    pricing: 'paid', priceLabel: 'From $13/user/mo · free trial',
    rating: 4.3, reviewCount: 1426, ratingUrl: 'https://www.g2.com/sellers/nutshell',
    tags: ['CRM', 'Automation'], mono: 'N', color: '#FF7A00', cta: 'Try Nutshell',
    externalUrl: 'https://www.nutshell.com/',
  },
  {
    name: 'folk', slug: 'folk', category: 'CRM', categorySlug: 'crm',
    tagline: 'Relationship CRM for founders and agencies.',
    description: 'Collects contacts from LinkedIn and email, with follow-up reminders and sequences.',
    bestFor: 'Relationship-driven sales',
    pricing: 'paid', priceLabel: 'From $24/user/mo · free trial',
    rating: 4.5, reviewCount: 338, ratingUrl: 'https://www.g2.com/products/folk-folk/reviews',
    tags: ['CRM', 'Relationships'], mono: 'f', color: '#111111', cta: 'Try folk',
    externalUrl: 'https://www.folk.app/',
  },

  // — Email marketing —
  {
    name: 'GetResponse', slug: 'getresponse', category: 'Email marketing', categorySlug: 'email',
    tagline: 'Email marketing, automation and landing pages.',
    description: 'Newsletters, automation workflows, landing pages and webinars in one platform.',
    bestFor: 'Nurturing leads by email',
    pricing: 'paid', priceLabel: 'From €16/mo · free trial',
    rating: 4.3, reviewCount: 1127, ratingUrl: 'https://www.g2.com/sellers/getresponse',
    tags: ['Email', 'Landing pages'], mono: 'G', color: '#00BAFF', cta: 'Try GetResponse',
    externalUrl: 'https://www.getresponse.com/',
  },
  {
    name: 'Campaign Monitor', slug: 'campaign-monitor', category: 'Email marketing', categorySlug: 'email',
    tagline: 'Well-designed email campaigns.',
    description: 'Drag-and-drop email builder, segmentation and automated journeys.',
    bestFor: 'Branded newsletters',
    pricing: 'paid', priceLabel: 'See pricing',
    rating: 4.1, reviewCount: 506, ratingUrl: 'https://www.g2.com/products/campaign-monitor/reviews',
    tags: ['Email', 'Newsletters'], mono: 'CM', color: '#7856FF', cta: 'Try Campaign Monitor',
    externalUrl: 'https://www.campaignmonitor.com/',
  },
  {
    name: 'Transpond', slug: 'transpond', category: 'Email marketing', categorySlug: 'email',
    tagline: 'Email marketing from the makers of Capsule.',
    description: 'Email campaigns and automations that sync natively with Capsule CRM.',
    bestFor: 'Capsule CRM users',
    pricing: 'paid', priceLabel: 'See pricing',
    tags: ['Email', 'Capsule'], mono: 'T', color: '#2E3A59', cta: 'Try Transpond',
    externalUrl: 'https://transpond.io/',
  },

  // — Messaging & calls —
  {
    name: 'ManyChat', slug: 'manychat', category: 'Messaging & calls', categorySlug: 'messaging',
    tagline: 'Chat automation for Instagram, WhatsApp and Messenger.',
    description: 'Turns comments and DMs into automated conversations that capture and qualify leads.',
    bestFor: 'Lead capture on social media',
    pricing: 'freemium', priceLabel: 'Free plan',
    rating: 4.5, reviewCount: 164, ratingUrl: 'https://www.g2.com/sellers/manychat',
    tags: ['Chatbots', 'Instagram'], mono: 'M', color: '#00B36B', cta: 'Try ManyChat',
    externalUrl: 'https://manychat.com/', featured: true,
  },
  {
    name: 'Wati', slug: 'wati', category: 'Messaging & calls', categorySlug: 'messaging',
    tagline: 'WhatsApp Business API for sales and support.',
    description: 'Shared WhatsApp inbox, broadcasts and chatbots on the official WhatsApp Business API.',
    bestFor: 'Selling over WhatsApp',
    pricing: 'paid', priceLabel: 'Paid · 7-day free trial',
    rating: 4.6, reviewCount: 485, ratingUrl: 'https://www.g2.com/products/wati/reviews',
    tags: ['WhatsApp', 'Inbox'], mono: 'W', color: '#25D366', cta: 'Try Wati',
    externalUrl: 'https://www.wati.io/',
  },
  {
    name: 'KrispCall', slug: 'krispcall', category: 'Messaging & calls', categorySlug: 'messaging',
    tagline: 'Cloud phone system for sales teams.',
    description: 'Virtual numbers in many countries, call logging and CRM integrations.',
    bestFor: 'Sales calls & follow-ups',
    pricing: 'paid', priceLabel: 'See pricing',
    rating: 4.5, reviewCount: 356, ratingUrl: 'https://www.g2.com/sellers/krispcall',
    tags: ['Calling', 'Telephony'], mono: 'KC', color: '#13C28A', cta: 'Try KrispCall',
    externalUrl: 'https://krispcall.com/',
  },
  {
    name: 'CallHippo', slug: 'callhippo', category: 'Messaging & calls', categorySlug: 'messaging',
    tagline: 'Virtual phone system with calls and SMS.',
    description: 'Business numbers, power dialer, SMS and call analytics for sales and support teams.',
    bestFor: 'Calls and SMS at scale',
    pricing: 'freemium', priceLabel: 'Free plan',
    rating: 4.4, reviewCount: 410, ratingUrl: 'https://www.g2.com/sellers/callhippo',
    tags: ['Calling', 'SMS'], mono: 'CH', color: '#E8421B', cta: 'Try CallHippo',
    externalUrl: 'https://callhippo.com/',
  },

  // — Automation —
  {
    name: 'n8n', slug: 'n8n', category: 'Automation', categorySlug: 'automation',
    tagline: 'Workflow automation with AI.',
    description: 'Connects your apps and automates workflows, with AI agents. Self-host for free or use the cloud.',
    bestFor: 'Connecting tools without manual work',
    pricing: 'freemium', priceLabel: 'Free self-hosted · cloud from €20/mo',
    rating: 4.7, reviewCount: 301, ratingUrl: 'https://www.g2.com/sellers/n8n-gmbh',
    tags: ['Automation', 'AI agents'], mono: 'n8', color: '#EA4B71', cta: 'Try n8n',
    externalUrl: 'https://n8n.io/',
  },

  // — Ads & analytics —
  {
    name: 'WhatConverts', slug: 'whatconverts', category: 'Ads & analytics', categorySlug: 'ads',
    tagline: 'Lead tracking and attribution.',
    description: 'Tracks calls, forms and chats back to the campaign and keyword that generated them.',
    bestFor: 'Knowing which ads bring leads',
    pricing: 'paid', priceLabel: 'From $30/mo · free trial',
    rating: 4.9, reviewCount: 286, ratingUrl: 'https://www.g2.com/sellers/whatconverts',
    tags: ['Attribution', 'Call tracking'], mono: 'WC', color: '#1D9BF0', cta: 'Try WhatConverts',
    externalUrl: 'https://www.whatconverts.com/',
  },
  {
    name: 'Bïrch', slug: 'birch', category: 'Ads & analytics', categorySlug: 'ads',
    tagline: 'Ad automation (formerly Revealbot).',
    description: 'Automated rules and reporting to manage and scale campaigns on Meta, Google and other ad platforms.',
    bestFor: 'Managing ad spend at scale',
    pricing: 'paid', priceLabel: 'See pricing',
    tags: ['Ads', 'Automation'], mono: 'B', color: '#0B7A55', cta: 'Try Bïrch',
    externalUrl: 'https://bir.ch/',
  },
  {
    name: 'Diginius', slug: 'diginius', category: 'Ads & analytics', categorySlug: 'ads',
    tagline: 'Multi-channel marketing reporting.',
    description: 'Consolidated reporting for Google, Microsoft, Meta and LinkedIn ads, plus intent leads and SEO insights.',
    bestFor: 'PPC agencies and marketers',
    pricing: 'paid', priceLabel: 'From $75/mo · free trial',
    tags: ['PPC', 'Reporting'], mono: 'D', color: '#00A3A1', cta: 'Try Diginius',
    externalUrl: 'https://diginius.com/',
  },
  {
    name: 'Rank Prompt', slug: 'rank-prompt', category: 'Ads & analytics', categorySlug: 'ads',
    tagline: 'Visibility in AI assistants.',
    description: 'Tracks how often ChatGPT, Perplexity, Claude and other AI assistants recommend your brand, and helps improve it.',
    bestFor: 'AI search visibility (GEO)',
    pricing: 'paid', priceLabel: 'Free report · 7-day trial',
    tags: ['AI search', 'SEO'], mono: 'RP', color: '#8B5CF6', cta: 'Try Rank Prompt',
    externalUrl: 'https://rankprompt.com/',
  },

  // — Websites & courses —
  {
    name: 'Wegic', slug: 'wegic', category: 'Websites & courses', categorySlug: 'websites',
    tagline: 'AI website builder.',
    description: 'Builds and edits a website by chatting with an AI assistant.',
    bestFor: 'Launching a site quickly',
    pricing: 'paid', priceLabel: 'See pricing',
    tags: ['Websites', 'AI'], mono: 'We', color: '#2563EB', cta: 'Try Wegic',
    externalUrl: 'https://wegic.ai/',
  },
  {
    name: 'Emergent', slug: 'emergent', category: 'Websites & courses', categorySlug: 'websites',
    tagline: 'Build apps by describing them.',
    description: 'Turns natural-language descriptions into working web and mobile apps, no coding needed.',
    bestFor: 'Internal tools and MVPs',
    pricing: 'freemium', priceLabel: 'Free tier',
    tags: ['AI', 'No-code'], mono: 'E', color: '#111827', cta: 'Try Emergent',
    externalUrl: 'https://emergent.sh/',
  },
  {
    name: 'Kartra', slug: 'kartra', category: 'Websites & courses', categorySlug: 'websites',
    tagline: 'All-in-one funnels, pages and email.',
    description: 'Sales funnels, landing pages, email, checkout and membership sites in one platform.',
    bestFor: 'Selling digital products',
    pricing: 'paid', priceLabel: 'See pricing',
    tags: ['Funnels', 'Checkout'], mono: 'Ka', color: '#1A73E8', cta: 'Try Kartra',
    externalUrl: 'https://kartra.com/',
  },
  {
    name: 'WebinarJam', slug: 'webinarjam', category: 'Websites & courses', categorySlug: 'websites',
    tagline: 'Live webinars for marketing and sales.',
    description: 'Live webinar platform with registration pages, reminders and in-webinar offers.',
    bestFor: 'Selling through webinars',
    pricing: 'paid', priceLabel: 'See pricing',
    tags: ['Webinars', 'Live'], mono: 'WJ', color: '#F97316', cta: 'Try WebinarJam',
    externalUrl: 'https://www.webinarjam.com/',
  },
  {
    name: 'LearnWorlds', slug: 'learnworlds', category: 'Websites & courses', categorySlug: 'websites',
    tagline: 'Create and sell online courses.',
    description: 'Course builder, branded academy site, community and payments.',
    bestFor: 'Selling courses and training',
    pricing: 'paid', priceLabel: 'From $24/mo · 30-day trial',
    rating: 4.7, reviewCount: 378, ratingUrl: 'https://www.g2.com/sellers/learnworlds',
    tags: ['Courses', 'LMS'], mono: 'LW', color: '#0A66C2', cta: 'Try LearnWorlds',
    externalUrl: 'https://www.learnworlds.com/',
  },
  {
    name: 'Switcher Studio', slug: 'switcher-studio', category: 'Websites & courses', categorySlug: 'websites',
    tagline: 'Multi-camera live video from your phone.',
    description: 'Produce and stream live video with multiple iPhones and iPads, with shopping features.',
    bestFor: 'Live video and live shopping',
    pricing: 'paid', priceLabel: 'See pricing',
    tags: ['Live video', 'Streaming'], mono: 'SS', color: '#0EA5E9', cta: 'Try Switcher',
    externalUrl: 'https://www.switcherstudio.com/',
  },

  // — Ecommerce —
  {
    name: 'Spocket', slug: 'spocket', category: 'Ecommerce', categorySlug: 'ecommerce',
    tagline: 'Dropshipping from US and EU suppliers.',
    description: 'Find products from vetted suppliers and sell them in your online store without holding stock.',
    bestFor: 'Starting a dropshipping store',
    pricing: 'paid', priceLabel: 'From $39.99/mo · 7-day trial',
    rating: 4.2, reviewCount: 71, ratingUrl: 'https://www.g2.com/products/spocket/reviews',
    tags: ['Dropshipping', 'Suppliers'], mono: 'Sp', color: '#6D28D9', cta: 'Try Spocket',
    externalUrl: 'https://www.spocket.co/',
  },
  {
    name: 'AliDrop', slug: 'alidrop', category: 'Ecommerce', categorySlug: 'ecommerce',
    tagline: 'Dropshipping automation for Shopify.',
    description: 'Imports products from AliExpress, Alibaba and Temu into your Shopify store and automates orders.',
    bestFor: 'Shopify dropshippers',
    pricing: 'paid', priceLabel: 'Paid · 7-day trial',
    tags: ['Dropshipping', 'Shopify'], mono: 'AD', color: '#F43F5E', cta: 'Try AliDrop',
    externalUrl: 'https://alidrop.co/',
  },
];

export const pricingConfig = {
  free:     { label: 'Free',     colorClass: 'tag--green' },
  freemium: { label: 'Freemium', colorClass: 'tag--purple' },
  paid:     { label: 'Paid',     colorClass: 'tag--dark' },
} as const;
