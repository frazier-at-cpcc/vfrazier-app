interface Env {
  RESEND_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
}

interface Context {
  request: Request;
  env: Env;
}

const REQUIRED_FIELDS = ['name', 'email', 'organization', 'event_date', 'topic_interest', 'message'] as const;
type RequiredField = (typeof REQUIRED_FIELDS)[number];

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Secrets pasted into the Cloudflare dashboard sometimes carry a trailing
// newline or space; an untrimmed value in an Authorization header throws at
// Headers construction, which surfaces as an opaque 502 to the visitor.
function cleanSecret(v: string | undefined): string {
  return (v ?? '').trim();
}

function wantsJson(req: Request): boolean {
  return (req.headers.get('Accept') ?? '').includes('application/json');
}

// Browsers get redirected back to the form with a diagnosable error code —
// never a raw error status. JSON clients get JSON. Error statuses stay in the
// 4xx/500 range: Cloudflare replaces origin 502/504 responses with its own
// branded "Bad gateway" page, which hides the real failure from everyone.
function fail(ctx: Context, code: string, status: number, message: string): Response {
  if (wantsJson(ctx.request)) {
    return new Response(JSON.stringify({ error: message, code }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const back = new URL(`/speaking/?error=${encodeURIComponent(code)}#book`, ctx.request.url);
  return Response.redirect(back.toString(), 303);
}

async function verifyTurnstile(token: string, secret: string, ip: string): Promise<boolean> {
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  if (!res.ok) {
    console.error('turnstile siteverify HTTP error', res.status);
    return false;
  }
  const data = (await res.json()) as { success?: boolean; 'error-codes'?: string[] };
  if (!data?.success) {
    console.error('turnstile verification failed', JSON.stringify(data?.['error-codes'] ?? []));
  }
  return Boolean(data?.success);
}

// Returns null on success, or the Resend HTTP status on failure (for the
// error code shown to the visitor and logged for `wrangler pages deployment tail`).
async function sendEmail(apiKey: string, payload: Record<RequiredField, string>): Promise<number | null> {
  const html = `
    <h2>New speaking inquiry</h2>
    <p><strong>${escapeHtml(payload.name)}</strong> &lt;${escapeHtml(payload.email)}&gt;</p>
    <p><strong>Organization:</strong> ${escapeHtml(payload.organization)}</p>
    <p><strong>Event date:</strong> ${escapeHtml(payload.event_date)}</p>
    <p><strong>Topic:</strong> ${escapeHtml(payload.topic_interest)}</p>
    <hr/>
    <pre style="font-family:inherit;white-space:pre-wrap;">${escapeHtml(payload.message)}</pre>
  `;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'vfrazier.app <noreply@vfrazier.app>',
      to: ['frazier@vfrazier.app'],
      reply_to: payload.email,
      subject: `Speaking inquiry — ${payload.organization} (${payload.event_date})`,
      html,
    }),
  });
  if (!res.ok) {
    const detail = (await res.text().catch(() => '')).slice(0, 500);
    console.error('resend send failed', res.status, detail);
    return res.status;
  }
  return null;
}

export async function onRequestPost(ctx: Context): Promise<Response> {
  try {
    const resendKey = cleanSecret(ctx.env.RESEND_API_KEY);
    const turnstileSecret = cleanSecret(ctx.env.TURNSTILE_SECRET_KEY);
    if (!resendKey || !turnstileSecret) {
      console.error('missing env config', { resend: !!resendKey, turnstile: !!turnstileSecret });
      return fail(ctx, 'config', 500, 'Server configuration error');
    }

    const form = await ctx.request.formData();
    const honeypot = String(form.get('website') ?? '').trim();
    if (honeypot.length > 0) {
      return fail(ctx, 'invalid', 400, 'Invalid submission');
    }

    const data: Partial<Record<RequiredField, string>> = {};
    const missing: string[] = [];
    for (const field of REQUIRED_FIELDS) {
      const v = String(form.get(field) ?? '').trim();
      if (!v) missing.push(field);
      data[field] = v;
    }
    if (missing.length > 0) {
      return fail(ctx, 'missing', 400, `Required fields missing: ${missing.join(', ')}`);
    }

    const token = String(form.get('cf-turnstile-response') ?? '').trim();
    if (!token) {
      return fail(ctx, 'verification', 400, 'Bot challenge failed');
    }
    const ip = ctx.request.headers.get('CF-Connecting-IP') ?? '0.0.0.0';
    const passed = await verifyTurnstile(token, turnstileSecret, ip);
    if (!passed) {
      return fail(ctx, 'verification', 400, 'Bot challenge failed');
    }

    const emailError = await sendEmail(resendKey, data as Record<RequiredField, string>);
    if (emailError !== null) {
      return fail(ctx, `email-${emailError}`, 500, 'Email delivery failed');
    }

    if (wantsJson(ctx.request)) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const thanksUrl = new URL('/speaking/thanks', ctx.request.url).toString();
    return Response.redirect(thanksUrl, 303);
  } catch (err) {
    console.error('booking handler error', err instanceof Error ? err.stack ?? err.message : err);
    return fail(ctx, 'internal', 500, 'Internal error');
  }
}
