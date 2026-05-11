// Cloudflare Pages middleware: 301 redirect www.vfrazier.app → vfrazier.app.
// Runs for every request before static asset / Pages Function resolution.
export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  if (url.hostname === 'www.vfrazier.app') {
    url.hostname = 'vfrazier.app';
    return Response.redirect(url.toString(), 301);
  }
  return context.next();
};
