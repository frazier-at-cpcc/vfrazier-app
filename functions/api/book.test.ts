import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onRequestPost } from './book';

const buildContext = (body: Record<string, unknown>, env: Record<string, string> = {}) => {
  const formData = new FormData();
  Object.entries(body).forEach(([k, v]) => formData.append(k, String(v ?? '')));
  return {
    request: new Request('https://vfrazier.app/api/book', {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' },
    }),
    env: {
      RESEND_API_KEY: 're_test_key',
      TURNSTILE_SECRET_KEY: 'turnstile_test',
      ...env,
    },
  } as any;
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

  it('returns 500-class when Resend fails', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true })))
      .mockResolvedValueOnce(new Response('Server error', { status: 500 }));
    globalThis.fetch = mockFetch;

    const ctx = buildContext({
      name: 'Jane',
      email: 'jane@example.org',
      organization: 'X',
      event_date: '2026-09-01',
      topic_interest: 'Keynote',
      message: 'We would like you to keynote our event.',
      'cf-turnstile-response': 'token123',
    });
    const res = await onRequestPost(ctx);
    expect(res.status).toBe(502);
  });
});
