import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onRequestPost } from './book';

const buildContext = (
  body: Record<string, unknown>,
  env: Record<string, string> = {},
  accept = 'application/json',
) => {
  const formData = new FormData();
  Object.entries(body).forEach(([k, v]) => formData.append(k, String(v ?? '')));
  return {
    request: new Request('https://vfrazier.app/api/book', {
      method: 'POST',
      body: formData,
      headers: { Accept: accept },
    }),
    env: {
      RESEND_API_KEY: 're_test_key',
      TURNSTILE_SECRET_KEY: 'turnstile_test',
      ...env,
    },
  } as any;
};

const VALID_BODY = {
  name: 'Jane Organizer',
  email: 'jane@example.org',
  organization: 'ExampleConf',
  event_date: '2026-09-01',
  topic_interest: 'Pull the Lever',
  message: 'We would like you to keynote our event.',
  'cf-turnstile-response': 'token123',
};

beforeEach(() => {
  vi.restoreAllMocks();
  globalThis.fetch = vi.fn();
});

describe('booking form handler', () => {
  it('rejects when honeypot is filled', async () => {
    const ctx = buildContext({
      name: 'Test',
      email: 'test@example.com',
      organization: 'Acme',
      event_date: '2026-09-01',
      topic_interest: 'Pull the Lever',
      message: 'Want you to keynote.',
      website: 'http://spam.example.com',
      'cf-turnstile-response': 'token123',
    });
    const res = await onRequestPost(ctx);
    expect(res.status).toBe(400);
  });

  it('rejects when required fields are missing', async () => {
    const ctx = buildContext({
      name: '',
      email: 'test@example.com',
      message: 'short',
      'cf-turnstile-response': 'token123',
    });
    const res = await onRequestPost(ctx);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toMatch(/required/i);
  });

  it('rejects when turnstile token is missing', async () => {
    const ctx = buildContext({
      name: 'Test',
      email: 'test@example.com',
      organization: 'Acme',
      event_date: '2026-09-01',
      topic_interest: 'Pull the Lever',
      message: 'Want you to keynote our event in September.',
    });
    const res = await onRequestPost(ctx);
    expect(res.status).toBe(400);
  });

  it('sends email via Resend on valid input', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'em_123' })));
    globalThis.fetch = mockFetch;

    const ctx = buildContext({
      name: 'Jane Organizer',
      email: 'jane@example.org',
      organization: 'ExampleConf',
      event_date: '2026-09-01',
      topic_interest: 'Pull the Lever',
      message: 'We would like you to keynote our event.',
      'cf-turnstile-response': 'token123',
    });

    const res = await onRequestPost(ctx);
    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(2);
    const [turnstileUrl] = mockFetch.mock.calls[0];
    expect(turnstileUrl).toContain('challenges.cloudflare.com');
    const [resendUrl, resendInit] = mockFetch.mock.calls[1];
    expect(resendUrl).toBe('https://api.resend.com/emails');
    const sentBody = JSON.parse(resendInit.body as string);
    expect(sentBody.to).toContain('frazier@vfrazier.app');
    expect(sentBody.subject).toMatch(/Speaking inquiry/);
    expect(sentBody.html).toContain('Jane Organizer');
  });

  it('returns 500 (never 502 — Cloudflare masks origin 502s) when Resend fails', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true })))
      .mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }));
    globalThis.fetch = mockFetch;

    const res = await onRequestPost(buildContext(VALID_BODY));
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: string; code: string };
    expect(body.code).toBe('email-401');
  });

  it('redirects browsers back to the form with an error code instead of a raw error page', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true })))
      .mockResolvedValueOnce(new Response('Forbidden', { status: 403 }));
    globalThis.fetch = mockFetch;

    const res = await onRequestPost(buildContext(VALID_BODY, {}, 'text/html'));
    expect(res.status).toBe(303);
    const location = res.headers.get('Location') ?? '';
    expect(location).toContain('/speaking/?error=email-403');
    expect(location).toContain('#book');
  });

  it('redirects browsers with error=verification when turnstile rejects', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: false, 'error-codes': ['invalid-input-secret'] })));
    globalThis.fetch = mockFetch;

    const res = await onRequestPost(buildContext(VALID_BODY, {}, 'text/html'));
    expect(res.status).toBe(303);
    expect(res.headers.get('Location')).toContain('error=verification');
  });

  it('trims whitespace pasted into env secrets before building headers', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'em_123' })));
    globalThis.fetch = mockFetch;

    const ctx = buildContext(VALID_BODY, {
      RESEND_API_KEY: '  re_test_key\n',
      TURNSTILE_SECRET_KEY: 'turnstile_test \n',
    });
    const res = await onRequestPost(ctx);
    expect(res.status).toBe(200);
    const [, resendInit] = mockFetch.mock.calls[1];
    expect((resendInit.headers as Record<string, string>).Authorization).toBe('Bearer re_test_key');
  });

  it('returns config error when env vars are blank', async () => {
    const res = await onRequestPost(buildContext(VALID_BODY, { RESEND_API_KEY: '  ' }));
    expect(res.status).toBe(500);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe('config');
  });
});
