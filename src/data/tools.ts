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
  rating: number;
  reviewCount: number;
  tags: string[];
  mono: string;
  color: string;
  cta: string;
  externalUrl: string;
  featured?: boolean;
}

export interface Category {
  label: string;
  slug: string;
  description: string;
}

export const categories: Category[] = [
  { label: 'All',           slug: 'all',           description: 'All tools in the marketplace' },
  { label: 'Prospecting',   slug: 'prospecting',   description: 'Find and enrich B2B contacts' },
  { label: 'Outreach',      slug: 'outreach',      description: 'Automate emails and sales sequences' },
  { label: 'Automation',    slug: 'automation',    description: 'Conversation and workflow automation' },
  { label: 'Data',          slug: 'data',          description: 'B2B data and contact enrichment' },
  { label: 'Communication', slug: 'communication', description: 'Cloud telephony and team inboxes' },
];

export const tools: Tool[] = [
  {
    name: 'Apollo.io',
    slug: 'apollo',
    category: 'Prospecting',
    categorySlug: 'prospecting',
    tagline: 'All-in-one lead generation & sales engagement.',
    description:
      '260M+ contacts with email finder, sequences and a built-in CRM in one place.',
    bestFor: 'Building & working lead lists',
    pricing: 'freemium',
    priceLabel: 'Free plan',
    rating: 4.8,
    reviewCount: 8400,
    tags: ['Lead gen', 'CRM'],
    mono: 'A',
    color: '#3B4BF0',
    cta: 'Get Apollo',
    externalUrl: 'https://get.apollo.io/wisdo',
    featured: true,
  },
  {
    name: 'Kaspr',
    slug: 'kaspr',
    category: 'Prospecting',
    categorySlug: 'prospecting',
    tagline: 'Direct contact info straight from LinkedIn.',
    description:
      'Grab verified phone numbers and emails in one click while browsing profiles.',
    bestFor: 'LinkedIn prospecting',
    pricing: 'freemium',
    priceLabel: 'Freemium',
    rating: 4.6,
    reviewCount: 1200,
    tags: ['LinkedIn', 'Contacts'],
    mono: 'K',
    color: '#6C5CE7',
    cta: 'Get Kaspr',
    externalUrl: 'https://kaspr.partnerlinks.io/gwm4l081zvey',
    featured: true,
  },
  {
    name: 'KrispCall',
    slug: 'krispcall',
    category: 'Communication',
    categorySlug: 'communication',
    tagline: 'Unified, efficient business phone system.',
    description:
      'Cloud telephony with numbers in 100+ countries and a shared team inbox.',
    bestFor: 'Sales calling teams',
    pricing: 'paid',
    priceLabel: 'From $15/mo',
    rating: 4.5,
    reviewCount: 560,
    tags: ['Calling', 'Telephony'],
    mono: 'KC',
    color: '#13C28A',
    cta: 'Get KrispCall',
    externalUrl: 'https://try.krispcall.com/8xqb028wq9zz',
    featured: false,
  },
  {
    name: 'Lemlist',
    slug: 'lemlist',
    category: 'Outreach',
    categorySlug: 'outreach',
    tagline: 'Cold email with advanced personalization.',
    description:
      'Personalized images, video and multichannel sequences that actually get replies.',
    bestFor: 'Cold email at scale',
    pricing: 'paid',
    priceLabel: 'From $39/mo',
    rating: 4.7,
    reviewCount: 3100,
    tags: ['Cold email', 'Outreach'],
    mono: 'L',
    color: '#1E73FF',
    cta: 'View Lemlist',
    externalUrl: 'https://market.wisdo.io/product/lemlist-potencia-tus-campanas-de-email-con-personalizacion-avanzada/',
    featured: true,
  },
  {
    name: 'Lusha',
    slug: 'lusha',
    category: 'Data',
    categorySlug: 'data',
    tagline: 'Accurate B2B data to power your sales.',
    description:
      'Verified emails and direct dials, enriched on demand right inside your workflow.',
    bestFor: 'Contact enrichment',
    pricing: 'freemium',
    priceLabel: 'Freemium',
    rating: 4.6,
    reviewCount: 2800,
    tags: ['B2B data', 'Enrichment'],
    mono: 'Lu',
    color: '#FF6B2C',
    cta: 'View Lusha',
    externalUrl: 'https://market.wisdo.io/product/lusha-datos-b2b-precisos-para-impulsar-tus-ventas/',
    featured: false,
  },
  {
    name: 'ManyChat',
    slug: 'manychat',
    category: 'Automation',
    categorySlug: 'automation',
    tagline: 'Automate marketing with smart chatbots.',
    description:
      'Instagram, WhatsApp and Messenger flows that capture and convert leads on autopilot.',
    bestFor: 'Social DM automation',
    pricing: 'freemium',
    priceLabel: 'Free plan',
    rating: 4.7,
    reviewCount: 6700,
    tags: ['Chatbots', 'Automation'],
    mono: 'M',
    color: '#00B36B',
    cta: 'View ManyChat',
    externalUrl: 'https://market.wisdo.io/product/manychat-revoluciona-tu-marketing-con-chatbots-inteligentes/',
    featured: true,
  },
];

export const pricingConfig = {
  free:     { label: 'Free',     colorClass: 'tag--green' },
  freemium: { label: 'Freemium', colorClass: 'tag--purple' },
  paid:     { label: 'Paid',     colorClass: 'tag--dark' },
} as const;
