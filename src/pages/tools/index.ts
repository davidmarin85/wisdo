import type { APIRoute } from 'astro';

// The tools directory was folded into the marketplace page.
export const GET: APIRoute = () =>
  new Response(null, { status: 301, headers: { Location: '/market/' } });
