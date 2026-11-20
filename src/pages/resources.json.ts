import { getCollection } from 'astro:content';

// Machine-readable list of resource cards. scripts/notify-new-resources.mjs polls it to
// confirm a new card is live before emailing subscribers.
export async function GET() {
  const items = (await getCollection('resources'))
    .sort((a, b) => a.data.order - b.data.order)
    .map((r) => ({ id: r.id, title: r.data.title, description: r.data.description, url: r.data.url, kind: r.data.kind }));
  return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json' } });
}
