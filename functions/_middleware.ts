// Cloudflare Pages middleware: 301 redirect every alternate host to the canonical
// vfrazier.app. Covers www on each TLD and the .net / .com / .io alternates that
// also point at this Pages project.
const CANONICAL = 'vfrazier.app';
const ALIASES = new Set([
  'www.vfrazier.app',
  'vfrazier.net',
  'www.vfrazier.net',
  'vfrazier.com',
  'www.vfrazier.com',
  'vfrazier.io',
  'www.vfrazier.io',
]);

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  if (ALIASES.has(url.hostname)) {
    url.hostname = CANONICAL;
    return Response.redirect(url.toString(), 301);
  }
  return context.next();
};
