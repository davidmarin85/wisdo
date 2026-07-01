import type { APIRoute } from 'astro';

const CANONICAL_HOST = import.meta.env.CANONICAL_HOST ?? 'wisdo.io';

const PRIVATE_PATHS = [
  '/dashboard/',
  '/tools/',
  '/api/',
  '/login/',
];

export const GET: APIRoute = ({ request }) => {
  const host = new URL(request.url).hostname;
  const isCanonical = host === CANONICAL_HOST;

  let content: string;

  if (!isCanonical) {
    // Block all crawlers on staging/preview deployments
    content = [
      'User-agent: *',
      'Disallow: /',
      '',
      `# Non-canonical host: ${host}`,
      `# Canonical: https://${CANONICAL_HOST}/`,
    ].join('\n');
  } else {
    const disallowLines = PRIVATE_PATHS.map((p) => `Disallow: ${p}`).join('\n');
    content = [
      'User-agent: *',
      disallowLines,
      '',
      `Sitemap: https://${CANONICAL_HOST}/sitemap_index.xml`,
    ].join('\n');
  }

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
};
