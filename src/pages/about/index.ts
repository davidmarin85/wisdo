import type { APIRoute } from 'astro';

// The new site has no standalone about page; the story lives on the home page.
export const GET: APIRoute = () =>
  new Response(null, { status: 301, headers: { Location: '/' } });
