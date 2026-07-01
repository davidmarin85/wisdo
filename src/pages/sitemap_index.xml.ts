import type { APIRoute } from 'astro';

const SITE = 'https://wisdo.io';

export const GET: APIRoute = () => {
  const sitemaps = [
    `${SITE}/page-sitemap.xml`,
    `${SITE}/post-sitemap.xml`,
  ];

  const urls = sitemaps
    .map((loc) => `  <sitemap><loc>${loc}</loc></sitemap>`)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
};
