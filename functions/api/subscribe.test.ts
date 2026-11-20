import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onRequestPost, RESOURCES_AUDIENCE_ID } from './subscribe';

const ctx = (body: Record<string, string>, env: Record<string, string> = {}, accept = 'application/json') => {
  const fd = new FormData();
  Object.entries(body).forEach(([k, v]) => fd.append(k, v));
  return {
    request: new Request('https://vfrazier.app/api/subscribe', { method: 'POST', body: fd, headers: { Accept: accept } }),
    env: { RESEND_API_KEY: 're_test', TURNSTILE_SECRET_KEY: 'ts_test', ...env },
  } as any;
};
const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });
const VALID = { email: ' Reader@Example.org ', 'cf-turnstile-response': 'tok' };

beforeEach(() => { globalThis.fetch = vi.fn(); });

describe('resource subscribe handler', () => {
  it('adds the lowercased email to the resources audience after Turnstile passes', async () => {
    (fetch as any).mockResolvedValueOnce(ok({ success: true })).mockResolvedValueOnce(ok({ id: 'c1' }));
    const res = await onRequestPost(ctx(VALID));
    expect(res.status).toBe(200);
    const [url, init] = (fetch as any).mock.calls[1];
    expect(url).toBe(`https://api.resend.com/audiences/${RESOURCES_AUDIENCE_ID}/contacts`);
    expect(JSON.parse(init.body)).toEqual({ email: 'reader@example.org', unsubscribed: false });
  });

  it('rejects a bad email, a filled honeypot, and a missing token without calling Resend', async () => {
    expect((await onRequestPost(ctx({ email: 'nope', 'cf-turnstile-response': 'tok' }))).status).toBe(400);
    expect((await onRequestPost(ctx({ ...VALID, website: 'x' }))).status).toBe(400);
    expect((await onRequestPost(ctx({ email: 'a@b.co' }))).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('rejects a failed Turnstile check', async () => {
    (fetch as any).mockResolvedValueOnce(ok({ success: false }));
    expect((await onRequestPost(ctx(VALID))).status).toBe(400);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('reports config and Resend failures as 500', async () => {
    expect((await onRequestPost(ctx(VALID, { RESEND_API_KEY: ' ' }))).status).toBe(500);
    (fetch as any).mockResolvedValueOnce(ok({ success: true })).mockResolvedValueOnce(new Response('no', { status: 422 }));
    expect(await (await onRequestPost(ctx(VALID))).json()).toEqual({ error: 'resend-422', code: 'resend-422' });
  });

  it('redirects browsers back to the resources page with a status code', async () => {
    (fetch as any).mockResolvedValueOnce(ok({ success: true })).mockResolvedValueOnce(ok({ id: 'c1' }));
    const res = await onRequestPost(ctx(VALID, {}, 'text/html'));
    expect(res.status).toBe(303);
    expect(res.headers.get('Location')).toBe('https://vfrazier.app/resources/?subscribe=ok#subscribe');
  });
});
