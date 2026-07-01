import type { APIRoute } from 'astro';

const SITE = 'https://wisdo.io';

interface PostEntry {
  slug: string;
  updatedAt: string;
}

// TODO: replace with real DB/CMS query
async function fetchPosts(): Promise<PostEntry[]> {
  return [
    { slug: 'example-post', updatedAt: '2026-01-01' },
  ];
}

export const GET: APIRoute = async () => {
  const posts = await fetchPosts();

  const urls = posts.map((post) =>
    [
      '  <url>',
      `    <loc>${SITE}/blog/${post.slug}/</loc>`,
      `    <lastmod>${post.updatedAt}</lastmod>`,
      '    <changefreq>monthly</changefreq>',
      '    <priority>0.7</priority>',
      '  </url>',
    ].join('\n')
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
};
