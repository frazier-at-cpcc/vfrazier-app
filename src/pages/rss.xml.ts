import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return rss({
    title: 'Frazier Smith — Writing',
    description: 'Long-form posts on AI in the classroom, instructional design, and CTE workforce.',
    site: context.site!,
    items: posts
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
      .map((p) => ({
        title: p.data.title,
        pubDate: p.data.pubDate,
        description: p.data.description,
        link: `/writing/${p.id}/`,
        categories: [p.data.category],
      })),
    customData: '<language>en-us</language>',
  });
}
