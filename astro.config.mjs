// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Pure static site. The booking handler lives in `functions/api/book.ts`,
// which Cloudflare Pages picks up as a Pages Function automatically — no
// Astro adapter required.
export default defineConfig({
  site: 'https://vfrazier.app',
  output: 'static',
  integrations: [mdx(), sitemap()],
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
});
