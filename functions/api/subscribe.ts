import { cleanSecret, verifyTurnstile, wantsJson } from './book';

// Resend audience "Resource updates". Not a secret: it only works with the API key.
// scripts/notify-new-resources.mjs sends to the same audience.
export const RESOURCES_AUDIENCE_ID = 'e99fbcd4-0865-4802-a57f-8a06c8b88a69';

interface Context {
  request: Request;
  env: { RESEND_API_KEY: string; TURNSTILE_SECRET_KEY: string };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Browsers land back on the resources page with ?subscribe=<code>; JSON clients get JSON.
function reply(ctx: Context, code: string, status: number): Response {
  if (wantsJson(ctx.request)) {
    return new Response(JSON.stringify(status === 200 ? { ok: true } : { error: code, code }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return Response.redirect(new URL(`/resources/?subscribe=${encodeURIComponent(code)}#subscribe`, ctx.request.url).toString(), 303);
}

export async function onRequestPost(ctx: Context): Promise<Response> {
  try {
    const key = cleanSecret(ctx.env.RESEND_API_KEY);
    const turnstileSecret = cleanSecret(ctx.env.TURNSTILE_SECRET_KEY);
    if (!key || !turnstileSecret) return reply(ctx, 'config', 500);

    const form = await ctx.request.formData();
    if (String(form.get('website') ?? '').trim()) return reply(ctx, 'invalid', 400);
    const email = String(form.get('email') ?? '').trim().toLowerCase();
    if (!EMAIL.test(email) || email.length > 254) return reply(ctx, 'email', 400);

    const token = String(form.get('cf-turnstile-response') ?? '').trim();
    const ip = ctx.request.headers.get('CF-Connecting-IP') ?? '0.0.0.0';
    if (!token || !(await verifyTurnstile(token, turnstileSecret, ip))) return reply(ctx, 'verification', 400);

    const res = await fetch(`https://api.resend.com/audiences/${RESOURCES_AUDIENCE_ID}/contacts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      // unsubscribed:false also re-subscribes someone who unsubscribed and signs up again.
      body: JSON.stringify({ email, unsubscribed: false }),
    });
    if (!res.ok) {
      console.error('resend contact create failed', res.status, (await res.text().catch(() => '')).slice(0, 500));
      return reply(ctx, `resend-${res.status}`, 500);
    }
    return reply(ctx, 'ok', 200);
  } catch (err) {
    console.error('subscribe handler error', err instanceof Error ? err.stack ?? err.message : err);
    return reply(ctx, 'internal', 500);
  }
}
