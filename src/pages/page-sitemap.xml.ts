import type { APIRoute } from 'astro';

const SITE = 'https://wisdo.io';

interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

// Static public pages — extend this list as the site grows
const PAGES: SitemapEntry[] = [
  { url: `${SITE}/`, priority: 1.0, changefreq: 'weekly' },
  { url: `${SITE}/about/`, priority: 0.8, changefreq: 'monthly' },
  { url: `${SITE}/blog/`, priority: 0.9, changefreq: 'daily' },
];

function toXmlEntry(entry: SitemapEntry): string {
  const parts = [`  <url>`, `    <loc>${entry.url}</loc>`];
  if (entry.lastmod) parts.push(`    <lastmod>${entry.lastmod}</lastmod>`);
  if (entry.changefreq) parts.push(`    <changefreq>${entry.changefreq}</changefreq>`);
  if (entry.priority !== undefined) parts.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);
  parts.push(`  </url>`);
  return parts.join('\n');
}

export const GET: APIRoute = () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map(toXmlEntry).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
};
