import type { APIRoute } from 'astro';
import { getProjects } from '../../lib/projects.ts';

export const prerender = false;

export const GET: APIRoute = async () => {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'CDN-Cache-Control': 'no-store',
    'Vercel-CDN-Cache-Control': 'no-store',
  };
  try {
    return new Response(JSON.stringify({ projects: await getProjects() }), { headers });
  } catch {
    return new Response(JSON.stringify({ error: 'Projects unavailable' }), { status: 503, headers });
  }
};
