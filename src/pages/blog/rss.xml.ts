// Feed RSS del blog: /blog/rss.xml
import type { APIRoute } from 'astro';
import { BLOG_CATEGORIES, getPosts, postUrl } from '@lib/blog';

export const prerender = true;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://www.wisdo.io');
  const posts = await getPosts();
  const items = posts
    .map((p) => {
      const link = new URL(postUrl(p), base).href;
      return `    <item>
      <title>${esc(p.data.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${esc(p.data.excerpt)}</description>
      <category>${BLOG_CATEGORIES[p.data.category].label}</category>
      <pubDate>${p.data.date.toUTCString()}</pubDate>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>wisdo blog</title>
    <link>${new URL('/blog/', base).href}</link>
    <atom:link href="${new URL('/blog/rss.xml', base).href}" rel="self" type="application/rss+xml" />
    <description>Guides and tool comparisons for marketing and sales stacks.</description>
    <language>en</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
