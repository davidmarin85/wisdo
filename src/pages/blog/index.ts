import type { APIRoute } from 'astro';
import { BLOG_URL } from '@data/site';

// The blog lives outside this app in the new site structure.
export const GET: APIRoute = () =>
  new Response(null, { status: 301, headers: { Location: BLOG_URL } });
