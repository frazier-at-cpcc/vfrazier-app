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

async function verifyTurnstile(token: string, secret: string, ip: string): Promise<boolean> {
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { success?: boolean };
  return Boolean(data?.success);
}

async function sendEmail(env: Env, payload: Record<RequiredField, string>): Promise<boolean> {
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
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
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
  return res.ok;
}

export async function onRequestPost(ctx: Context): Promise<Response> {
  try {
    const form = await ctx.request.formData();
    const honeypot = String(form.get('website') ?? '').trim();
    if (honeypot.length > 0) {
      return new Response(JSON.stringify({ error: 'Invalid submission' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data: Partial<Record<RequiredField, string>> = {};
    const missing: string[] = [];
    for (const field of REQUIRED_FIELDS) {
      const v = String(form.get(field) ?? '').trim();
      if (!v) missing.push(field);
      data[field] = v;
    }
    if (missing.length > 0) {
      return new Response(JSON.stringify({ error: `Required fields missing: ${missing.join(', ')}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = String(form.get('cf-turnstile-response') ?? '').trim();
    if (!token) {
      return new Response(JSON.stringify({ error: 'Bot challenge failed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const ip = ctx.request.headers.get('CF-Connecting-IP') ?? '0.0.0.0';
    const passed = await verifyTurnstile(token, ctx.env.TURNSTILE_SECRET_KEY, ip);
    if (!passed) {
      return new Response(JSON.stringify({ error: 'Bot challenge failed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sent = await sendEmail(ctx.env, data as Record<RequiredField, string>);
    if (!sent) {
      return new Response(JSON.stringify({ error: 'Email delivery failed' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const accept = ctx.request.headers.get('Accept') ?? '';
    if (accept.includes('application/json')) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const thanksUrl = new URL('/speaking/thanks', ctx.request.url).toString();
    return Response.redirect(thanksUrl, 303);
  } catch (err) {
    console.error('booking handler error', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
