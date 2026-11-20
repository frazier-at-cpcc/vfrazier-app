// Minimal LMS: Cloudflare Access sign-in, an activity list, LTI 1.1 launches
// signed with OAuth 1.0a, and a Basic Outcomes gradebook.
//
//   /lms/u/*            browser routes, behind Cloudflare Access
//   /lms/lti/outcome    POX grade passback, public, OAuth-verified per tool
import { createRemoteJWKSet, jwtVerify } from 'jose';

export interface Stmt {
  bind(...values: unknown[]): Stmt;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
}

export interface Env {
  DB?: { prepare(sql: string): Stmt };
  ACCESS_TEAM_DOMAIN?: string; // https://<team>.cloudflareaccess.com
  ACCESS_AUD?: string; // Application Audience (AUD) tag of the Access app
  ADMIN_EMAIL?: string; // this person launches as Instructor and sees every grade
}

type Person = { sub: string; email: string; instructor: boolean };
type Activity = { id: number; title: string; launch_url: string; consumer_key: string; shared_secret: string };
type Db = NonNullable<Env['DB']>;

const enc = (s: string) => new TextEncoder().encode(s);
const b64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf)));
export const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// ---------------------------------------------------------------- OAuth 1.0a

/** RFC 3986 percent-encoding, as RFC 5849 section 3.6 requires. */
export const pct = (s: string) =>
  encodeURIComponent(s).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());

/**
 * HMAC-SHA1 signature (RFC 5849 section 3.4). Query parameters on `url` are
 * part of the base string, so a launch URL such as
 * `lti-launch.cgi?netlab_cls_id=12` signs correctly without moving them.
 */
export async function oauthSignature(
  method: string,
  url: string,
  params: [string, string][],
  consumerSecret: string,
  tokenSecret = '',
): Promise<string> {
  const u = new URL(url);
  const pairs = [...params, ...u.searchParams]
    .map(([k, v]) => [pct(k), pct(v)])
    .sort(([a, x], [b, y]) => (a < b ? -1 : a > b ? 1 : x < y ? -1 : x > y ? 1 : 0));
  const base = [
    method.toUpperCase(),
    pct(`${u.protocol}//${u.host}${u.pathname}`),
    pct(pairs.map(([k, v]) => `${k}=${v}`).join('&')),
  ].join('&');
  const key = await crypto.subtle.importKey(
    'raw',
    enc(`${pct(consumerSecret)}&${pct(tokenSecret)}`),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  );
  return b64(await crypto.subtle.sign('HMAC', key, enc(base)));
}

function parseOAuthHeader(header: string | null): Record<string, string> | null {
  if (!header || !/^OAuth\s/i.test(header)) return null;
  const out: Record<string, string> = {};
  try {
    for (const m of header.slice(6).matchAll(/([\w.-]+)\s*=\s*"([^"]*)"/g)) {
      out[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }
  } catch {
    return null;
  }
  return out;
}

// ---------------------------------------------------------- Cloudflare Access

const accessKeys = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

/**
 * Verify the Access JWT rather than trusting the email header: requests to the
 * `*.pages.dev` hostnames never pass through Access, so a header alone is forgeable.
 */
async function accessPerson(request: Request, env: Env): Promise<Person | null> {
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token || !env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) return null;
  const team = env.ACCESS_TEAM_DOMAIN.replace(/\/+$/, '');
  let keys = accessKeys.get(team);
  if (!keys) accessKeys.set(team, (keys = createRemoteJWKSet(new URL(`${team}/cdn-cgi/access/certs`))));
  try {
    const { payload } = await jwtVerify(token, keys, {
      issuer: team,
      audience: env.ACCESS_AUD,
      algorithms: ['RS256'],
    });
    const email = typeof payload.email === 'string' ? payload.email : '';
    if (!payload.sub || !email) return null;
    const admin = (env.ADMIN_EMAIL ?? '').trim().toLowerCase();
    return { sub: payload.sub, email, instructor: admin !== '' && email.toLowerCase() === admin };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- responses

function page(title: string, body: string, status = 200): Response {
  return new Response(
    `<!doctype html><html lang="en"><meta charset="utf-8">` +
      `<meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>` +
      `<style>body{font:16px/1.5 system-ui,sans-serif;max-width:52rem;margin:2rem auto;padding:0 1rem;` +
      `color:#15110d;background:#f6f1e8}table{border-collapse:collapse;width:100%}` +
      `th,td{text-align:left;padding:.5rem;border-bottom:1px solid #15110d33}a{color:#5b21b6}` +
      `button{font:inherit;padding:.5rem 1rem}</style><h1>${esc(title)}</h1>${body}</html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store' } },
  );
}

const percent = (score: number | null | undefined) =>
  score == null ? 'Not graded' : `${Math.round(score * 1000) / 10}%`;

function pox(op: string, ok: boolean, description: string, messageRef: string, inner = '', status = 200): Response {
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<imsx_POXEnvelopeResponse xmlns="http://www.imsglobal.org/services/ltiv1p1/xsd/imsoms_v1p0">` +
    `<imsx_POXHeader><imsx_POXResponseHeaderInfo><imsx_version>V1.0</imsx_version>` +
    `<imsx_messageIdentifier>${crypto.randomUUID()}</imsx_messageIdentifier><imsx_statusInfo>` +
    `<imsx_codeMajor>${ok ? 'success' : 'failure'}</imsx_codeMajor>` +
    `<imsx_severity>${ok ? 'status' : 'error'}</imsx_severity>` +
    `<imsx_description>${esc(description)}</imsx_description>` +
    `<imsx_messageRefIdentifier>${esc(messageRef)}</imsx_messageRefIdentifier>` +
    `<imsx_operationRefIdentifier>${esc(op)}</imsx_operationRefIdentifier>` +
    `</imsx_statusInfo></imsx_POXResponseHeaderInfo></imsx_POXHeader>` +
    `<imsx_POXBody>${op ? `<${op}Response>${inner}</${op}Response>` : ''}</imsx_POXBody>` +
    `</imsx_POXEnvelopeResponse>`;
  return new Response(xml, { status, headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}

// ------------------------------------------------------------------- routes

async function activityList(db: Db, me: Person): Promise<Response> {
  const { results } = await db
    .prepare(
      `SELECT a.id, a.title, g.score FROM activity a
       LEFT JOIN grade g ON g.activity_id = a.id AND g.person_sub = ?
       ORDER BY a.title`,
    )
    .bind(me.sub)
    .all<{ id: number; title: string; score: number | null }>();
  const rows = results
    .map(
      (r) =>
        `<tr><td><a href="/lms/u/launch/${r.id}" target="_blank" rel="noopener">${esc(r.title)}</a></td>` +
        `<td>${percent(r.score)}</td></tr>`,
    )
    .join('');
  return page(
    'Activities',
    `<p>Signed in as ${esc(me.email)}.${me.instructor ? ' <a href="/lms/u/grades">Gradebook</a>' : ''}</p>` +
      (rows
        ? `<table><thead><tr><th>Activity</th><th>Your score</th></tr></thead><tbody>${rows}</tbody></table>`
        : '<p>No activities are available.</p>'),
  );
}

async function gradebook(db: Db, me: Person): Promise<Response> {
  if (!me.instructor) return page('Gradebook', '<p>Only the instructor can open the gradebook.</p>', 403);
  const { results } = await db
    .prepare(
      `SELECT a.title, p.email, g.score, g.updated_at FROM grade g
       JOIN activity a ON a.id = g.activity_id
       JOIN person p ON p.sub = g.person_sub
       ORDER BY a.title, p.email`,
    )
    .all<{ title: string; email: string; score: number; updated_at: string }>();
  const rows = results
    .map(
      (r) =>
        `<tr><td>${esc(r.title)}</td><td>${esc(r.email)}</td><td>${percent(r.score)}</td>` +
        `<td>${esc(r.updated_at)}</td></tr>`,
    )
    .join('');
  return page(
    'Gradebook',
    `<p><a href="/lms/u/">Activities</a></p>` +
      (rows
        ? `<table><thead><tr><th>Activity</th><th>Person</th><th>Score</th><th>Updated</th></tr></thead><tbody>${rows}</tbody></table>`
        : '<p>No grades have been returned yet.</p>'),
  );
}

async function launch(db: Db, me: Person, id: number, origin: string): Promise<Response> {
  const a = await db
    .prepare(
      `SELECT a.id, a.title, a.launch_url, t.consumer_key, t.shared_secret
       FROM activity a JOIN tool t ON t.id = a.tool_id WHERE a.id = ?`,
    )
    .bind(id)
    .first<Activity>();
  if (!a) return page('Not found', '<p>That activity does not exist.</p>', 404);

  await db
    .prepare('INSERT INTO person (sub, email) VALUES (?, ?) ON CONFLICT (sub) DO UPDATE SET email = excluded.email')
    .bind(me.sub, me.email)
    .run();

  const params: Record<string, string> = {
    lti_message_type: 'basic-lti-launch-request',
    lti_version: 'LTI-1p0',
    resource_link_id: String(a.id),
    resource_link_title: a.title,
    context_id: 'vfrazier-lms',
    context_title: 'vfrazier.app LMS',
    user_id: me.sub,
    roles: me.instructor ? 'Instructor' : 'Learner',
    // ponytail: Access JWTs carry no display name, so the email stands in for it.
    lis_person_contact_email_primary: me.email,
    lis_person_name_full: me.email,
    lis_outcome_service_url: `${origin}/lms/lti/outcome`,
    lis_result_sourcedid: `${a.id}:${me.sub}`,
    launch_presentation_document_target: 'window',
    launch_presentation_return_url: `${origin}/lms/u/`,
    tool_consumer_info_product_family_code: 'vfrazier-lms',
    tool_consumer_instance_guid: new URL(origin).host,
    oauth_consumer_key: a.consumer_key,
    oauth_nonce: crypto.randomUUID().replace(/-/g, ''),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: String(Math.floor(Date.now() / 1000)),
    oauth_version: '1.0',
    // LTI 1.1 fixes the callback at about:blank, and NETLAB+ refuses a launch without it.
    oauth_callback: 'about:blank',
  };
  params.oauth_signature = await oauthSignature('POST', a.launch_url, Object.entries(params), a.shared_secret);

  const inputs = Object.entries(params)
    .map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`)
    .join('');
  return page(
    a.title,
    `<form id="launch" method="post" action="${esc(a.launch_url)}">${inputs}` +
      `<p><button type="submit">Open ${esc(a.title)}</button></p></form>` +
      `<script>document.getElementById('launch').submit()</script>`,
  );
}

/** Basic Outcomes: replaceResult, readResult, and deleteResult over signed POX. */
async function outcome(request: Request, db: Db, origin: string): Promise<Response> {
  const body = await request.text();
  const tag = (name: string) =>
    new RegExp(`<(?:\\w+:)?${name}>\\s*([^<]*?)\\s*</`).exec(body)?.[1] ?? '';
  const messageRef = tag('imsx_messageIdentifier');
  const op = /<(?:\w+:)?(replaceResult|readResult|deleteResult)Request\b/.exec(body)?.[1] ?? '';

  const o = parseOAuthHeader(request.headers.get('Authorization'));
  const tool = o?.oauth_consumer_key
    ? await db
        .prepare('SELECT id, shared_secret FROM tool WHERE consumer_key = ?')
        .bind(o.oauth_consumer_key)
        .first<{ id: number; shared_secret: string }>()
    : null;
  // ponytail: no nonce store. A replay inside the 5-minute window repeats the same
  // idempotent write; add a nonce table if a tool ever sends non-idempotent operations.
  const fresh = o && Math.abs(Date.now() / 1000 - Number(o.oauth_timestamp)) <= 300;
  const bodyHash = b64(await crypto.subtle.digest('SHA-1', enc(body)));
  let signed = false;
  if (o && tool && fresh && o.oauth_signature_method === 'HMAC-SHA1' && safeEqual(o.oauth_body_hash ?? '', bodyHash)) {
    const { oauth_signature: sig = '', realm: _realm, ...rest } = o;
    const expected = await oauthSignature('POST', `${origin}/lms/lti/outcome`, Object.entries(rest), tool.shared_secret);
    signed = safeEqual(sig, expected);
  }
  if (!tool || !signed) return pox(op, false, 'OAuth signature failed verification', messageRef, '', 401);
  if (!op) return pox('', false, 'Unsupported or missing operation', messageRef, '', 400);

  const sourcedid = tag('sourcedId');
  const split = sourcedid.indexOf(':');
  const activityId = Number(sourcedid.slice(0, split));
  const sub = sourcedid.slice(split + 1);
  const cell =
    split > 0
      ? await db
          .prepare(
            `SELECT a.id FROM activity a, person p WHERE a.id = ? AND a.tool_id = ? AND p.sub = ?`,
          )
          .bind(activityId, tool.id, sub)
          .first()
      : null;
  if (!cell) return pox(op, false, 'Unknown sourcedId', messageRef, '', 400);

  if (op === 'readResult') {
    const g = await db
      .prepare('SELECT score FROM grade WHERE activity_id = ? AND person_sub = ?')
      .bind(activityId, sub)
      .first<{ score: number }>();
    const score = g ? String(g.score) : '';
    return pox(op, true, 'Result read', messageRef,
      `<result><resultScore><language>en</language><textString>${score}</textString></resultScore></result>`);
  }
  if (op === 'deleteResult') {
    await db.prepare('DELETE FROM grade WHERE activity_id = ? AND person_sub = ?').bind(activityId, sub).run();
    return pox(op, true, 'Result deleted', messageRef);
  }
  const raw = tag('textString');
  const score = raw === '' ? NaN : Number(raw);
  if (!(score >= 0 && score <= 1)) return pox(op, false, 'Score must be between 0.0 and 1.0', messageRef, '', 400);
  await db
    .prepare(
      `INSERT INTO grade (activity_id, person_sub, score, updated_at) VALUES (?, ?, ?, ?)
       ON CONFLICT (activity_id, person_sub) DO UPDATE SET score = excluded.score, updated_at = excluded.updated_at`,
    )
    .bind(activityId, sub, score, new Date().toISOString())
    .run();
  return pox(op, true, `Score for ${sourcedid} is now ${score}`, messageRef);
}

export async function handle(request: Request, env: Env): Promise<Response> {
  const db = env.DB;
  if (!db) return new Response('The LMS database is not bound.', { status: 503 });
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '');

  if (path === '/lms') return Response.redirect(`${url.origin}/lms/u/`, 302);
  if (path === '/lms/lti/outcome') {
    return request.method === 'POST'
      ? outcome(request, db, url.origin)
      : new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
  }
  if (path !== '/lms/u' && !path.startsWith('/lms/u/')) return new Response('Not found', { status: 404 });

  const me = await accessPerson(request, env);
  if (!me) return page('Sign in required', '<p>Sign in through Cloudflare Access to use the LMS.</p>', 401);
  if (path === '/lms/u') return activityList(db, me);
  if (path === '/lms/u/grades') return gradebook(db, me);
  const m = /^\/lms\/u\/launch\/(\d+)$/.exec(path);
  if (m) return launch(db, me, Number(m[1]), url.origin);
  return page('Not found', '<p>That page does not exist.</p>', 404);
}
