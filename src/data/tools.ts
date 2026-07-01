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
  { label: 'All',         slug: 'all',         description: 'All tools in the marketplace' },
  { label: 'Prospecting', slug: 'prospecting',  description: 'Find and enrich B2B contacts' },
  { label: 'Outreach',    slug: 'outreach',     description: 'Automate emails and sales sequences' },
  { label: 'Calling',     slug: 'calling',      description: 'Cloud PBX and VoIP for sales teams' },
  { label: 'Automation',  slug: 'automation',   description: 'Conversation and workflow automation' },
];

export const tools: Tool[] = [
  {
    name: 'Apollo.io',
    slug: 'apollo',
    category: 'Prospecting',
    categorySlug: 'prospecting',
    description:
      'B2B database with 275M+ verified contacts. Find leads, enrich data and launch email sequences — all from one platform.',
    pricing: 'freemium',
    priceLabel: 'Free · from $49/mo',
    rating: 4.7,
    reviewCount: 8400,
    tags: ['Email', 'Lead gen', 'Enrichment', 'Sequences'],
    mono: 'A',
    color: '#3B4BF0',
    cta: 'Get Apollo',
    externalUrl: 'https://www.apollo.io',
    featured: true,
  },
  {
    name: 'Kaspr',
    slug: 'kaspr',
    category: 'Prospecting',
    categorySlug: 'prospecting',
    description:
      'LinkedIn extension that reveals verified emails and phone numbers from any profile in real time. Integrate with your CRM in one click.',
    pricing: 'freemium',
    priceLabel: 'Free · from €30/mo',
    rating: 4.4,
    reviewCount: 1200,
    tags: ['LinkedIn', 'Phone numbers', 'Email'],
    mono: 'K',
    color: '#6C5CE7',
    cta: 'Get Kaspr',
    externalUrl: 'https://www.kaspr.io',
    featured: true,
  },
  {
    name: 'KrispCall',
    slug: 'krispcall',
    category: 'Calling',
    categorySlug: 'calling',
    description:
      'AI-powered cloud PBX for sales teams. Local numbers in 100+ countries, automatic call recording and AI-generated summaries.',
    pricing: 'paid',
    priceLabel: 'From $15/user/mo',
    rating: 4.3,
    reviewCount: 560,
    tags: ['VoIP', 'Cloud PBX', 'AI', 'Recording'],
    mono: 'KC',
    color: '#13C28A',
    cta: 'Get KrispCall',
    externalUrl: 'https://www.krispcall.com',
    featured: false,
  },
  {
    name: 'Lemlist',
    slug: 'lemlist',
    category: 'Outreach',
    categorySlug: 'outreach',
    description:
      'Cold outreach platform with image, video and dynamic text personalization. Combine email, LinkedIn and calls in a single sequence.',
    pricing: 'paid',
    priceLabel: 'From $39/mo',
    rating: 4.6,
    reviewCount: 3100,
    tags: ['Cold email', 'Personalization', 'Multichannel'],
    mono: 'L',
    color: '#1E73FF',
    cta: 'Get Lemlist',
    externalUrl: 'https://www.lemlist.com',
    featured: true,
  },
  {
    name: 'Lusha',
    slug: 'lusha',
    category: 'Prospecting',
    categorySlug: 'prospecting',
    description:
      'High-accuracy B2B contact enrichment. Get direct phone numbers and verified professional emails for any decision-maker.',
    pricing: 'freemium',
    priceLabel: 'Free · from $36/mo',
    rating: 4.2,
    reviewCount: 2800,
    tags: ['Enrichment', 'Phone numbers', 'CRM sync'],
    mono: 'Lu',
    color: '#FF6B2C',
    cta: 'Get Lusha',
    externalUrl: 'https://www.lusha.com',
    featured: false,
  },
  {
    name: 'ManyChat',
    slug: 'manychat',
    category: 'Automation',
    categorySlug: 'automation',
    description:
      'Conversation automation for Instagram, WhatsApp and Facebook Messenger. Generate leads and close sales directly from DMs.',
    pricing: 'freemium',
    priceLabel: 'Free · from $15/mo',
    rating: 4.5,
    reviewCount: 6700,
    tags: ['WhatsApp', 'Instagram', 'Chatbot', 'DMs'],
    mono: 'M',
    color: '#00B36B',
    cta: 'Get ManyChat',
    externalUrl: 'https://manychat.com',
    featured: true,
  },
];

export const pricingConfig = {
  free:     { label: 'Free',     colorClass: 'tag--green' },
  freemium: { label: 'Freemium', colorClass: 'tag--purple' },
  paid:     { label: 'Paid',     colorClass: 'tag--dark' },
} as const;
