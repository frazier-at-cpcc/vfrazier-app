// @vitest-environment node
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { SignJWT, exportJWK, generateKeyPair } from 'jose';
import { handle, oauthSignature, pct, type Env, type Stmt } from './lms';

const ISSUER = 'https://auth.example.org/application/o/lms/';
const CLIENT_ID = 'lms-client';
const CLIENT_SECRET = 'client-secret';
const ORIGIN = 'https://vfrazier.app';
const LAUNCH_URL = 'https://netlab.example.org/lti-launch.cgi?netlab_cls_id=12&netlab_com_id=1';

/** D1 stand-in over node:sqlite, running the real migration. */
function testDb() {
  const db = new DatabaseSync(':memory:');
  db.exec(readFileSync(new URL('../migrations/0001_lms.sql', import.meta.url), 'utf8'));
  db.exec(`INSERT INTO tool VALUES (1, 'NETLAB+', 'key-a', 'secret-a'), (2, 'Other', 'key-b', 'secret-b');
           INSERT INTO activity VALUES (1, 1, 'Proxmox Lab', '${LAUNCH_URL}'), (2, 2, 'Other Lab', 'https://other.example.org/launch');`);
  const d1 = {
    prepare(sql: string): Stmt {
      const st = db.prepare(sql);
      let args: any[] = [];
      const s: Stmt = {
        bind: (...v) => ((args = v), s),
        first: async () => (st.get(...args) as any) ?? null,
        all: async () => ({ results: st.all(...args) as any[] }),
        run: async () => st.run(...args),
      };
      return s;
    },
  };
  return { raw: db, d1 };
}

let idpKey: CryptoKey;
let db: ReturnType<typeof testDb>;
let env: Env;
/** What the mock IdP returns from its token endpoint, and the PKCE challenge it expects. */
const idp = { idToken: '', challenge: '' };

beforeAll(async () => {
  const pair = await generateKeyPair('RS256');
  idpKey = pair.privateKey;
  const jwk = { ...(await exportJWK(pair.publicKey)), kid: 'k1', alg: 'RS256' };
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  globalThis.fetch = vi.fn(async (input: any, init?: RequestInit) => {
    const url = String(input);
    if (url === `${ISSUER}.well-known/openid-configuration`) {
      return json({
        issuer: ISSUER,
        authorization_endpoint: 'https://auth.example.org/application/o/authorize/',
        token_endpoint: 'https://auth.example.org/application/o/token/',
        end_session_endpoint: `${ISSUER}end-session/`,
        jwks_uri: `${ISSUER}jwks/`,
      });
    }
    if (url === `${ISSUER}jwks/`) return json({ keys: [jwk] });
    if (url === 'https://auth.example.org/application/o/token/') {
      const f = new URLSearchParams(String(init?.body));
      const challenge = Buffer.from(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(f.get('code_verifier') ?? ''))).toString('base64url');
      const ok = f.get('client_secret') === CLIENT_SECRET && f.get('code') === 'c1' && challenge === idp.challenge &&
        f.get('redirect_uri') === `${ORIGIN}/lms/auth/callback`;
      return ok ? json({ id_token: idp.idToken }) : json({ error: 'invalid_grant' }, 400);
    }
    throw new Error(`unexpected fetch ${url}`);
  }) as any;
});

beforeEach(() => {
  db = testDb();
  env = { DB: db.d1, OIDC_ISSUER: ISSUER, OIDC_CLIENT_ID: CLIENT_ID, OIDC_CLIENT_SECRET: CLIENT_SECRET, SESSION_SECRET: 'test-session-secret' };
});

const idToken = (claims: Record<string, unknown>, sub: string, aud = CLIENT_ID) =>
  new SignJWT(claims)
    .setProtectedHeader({ alg: 'RS256', kid: 'k1' })
    .setIssuer(ISSUER)
    .setAudience(aud)
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(idpKey);

/** Runs the authorization code flow against the mock IdP and returns the callback response. */
async function callback(sub: string, email: string, groups: string[] = [], tweak: { nonce?: string; aud?: string; state?: string } = {}) {
  const start = await handle(new Request(`${ORIGIN}/lms/u/`), env);
  expect(start.status).toBe(302);
  const auth = new URL(start.headers.get('Location')!);
  idp.challenge = auth.searchParams.get('code_challenge')!;
  idp.idToken = await idToken({ email, name: `Name ${sub}`, groups, nonce: tweak.nonce ?? auth.searchParams.get('nonce') }, sub, tweak.aud);
  const state = tweak.state ?? auth.searchParams.get('state');
  return handle(
    new Request(`${ORIGIN}/lms/auth/callback?code=c1&state=${state}`, {
      headers: { Cookie: start.headers.get('Set-Cookie')!.split(';')[0] },
    }),
    env,
  );
}

async function signIn(sub: string, email: string, groups: string[] = []) {
  const res = await callback(sub, email, groups);
  expect(res.status).toBe(302);
  return res.headers.getSetCookie().find((c) => c.startsWith('lms_session='))!.split(';')[0];
}

async function browse(path: string, sub = 'u-1', email = 'student@example.org', groups: string[] = []) {
  return handle(new Request(ORIGIN + path, { headers: { Cookie: await signIn(sub, email, groups) } }), env);
}
const teacher = (path: string) => browse(path, 't-1', 'teacher@example.org', ['lms-instructors']);

function formFields(html: string): Record<string, string> {
  const unescape = (s: string) => s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
  return Object.fromEntries(
    [...html.matchAll(/name="([^"]+)" value="([^"]*)"/g)].map((m) => [unescape(m[1]), unescape(m[2])]),
  );
}

async function poxRequest(body: string, key = 'key-a', secret = 'secret-a', tamper?: string) {
  const oauth: Record<string, string> = {
    oauth_body_hash: Buffer.from(await crypto.subtle.digest('SHA-1', new TextEncoder().encode(body))).toString('base64'),
    oauth_consumer_key: key,
    oauth_nonce: 'n1',
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: String(Math.floor(Date.now() / 1000)),
    oauth_version: '1.0',
  };
  oauth.oauth_signature = await oauthSignature('POST', `${ORIGIN}/lms/lti/outcome`, Object.entries(oauth), secret);
  const header = 'OAuth realm="", ' + Object.entries(oauth).map(([k, v]) => `${k}="${pct(v)}"`).join(', ');
  return handle(
    new Request(`${ORIGIN}/lms/lti/outcome`, {
      method: 'POST',
      headers: { Authorization: header, 'Content-Type': 'application/xml' },
      body: tamper ?? body,
    }),
    env,
  );
}

const pox = (op: string, sourcedid: string, score?: string) =>
  `<?xml version="1.0" encoding="UTF-8"?><imsx_POXEnvelopeRequest xmlns="http://www.imsglobal.org/services/ltiv1p1/xsd/imsoms_v1p0">` +
  `<imsx_POXHeader><imsx_POXRequestHeaderInfo><imsx_version>V1.0</imsx_version><imsx_messageIdentifier>m-9</imsx_messageIdentifier>` +
  `</imsx_POXRequestHeaderInfo></imsx_POXHeader><imsx_POXBody><${op}Request><resultRecord><sourcedGUID><sourcedId>${sourcedid}</sourcedId></sourcedGUID>` +
  (score === undefined ? '' : `<result><resultScore><language>en</language><textString>${score}</textString></resultScore></result>`) +
  `</resultRecord></${op}Request></imsx_POXBody></imsx_POXEnvelopeRequest>`;

describe('oauthSignature', () => {
  it('matches the published Twitter HMAC-SHA1 example', async () => {
    const sig = await oauthSignature(
      'POST',
      'https://api.twitter.com/1.1/statuses/update.json?include_entities=true',
      [
        ['status', 'Hello Ladies + Gentlemen, a signed OAuth request!'],
        ['oauth_consumer_key', 'xvz1evFS4wEEPTGEFPHBog'],
        ['oauth_nonce', 'kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg'],
        ['oauth_signature_method', 'HMAC-SHA1'],
        ['oauth_timestamp', '1318622958'],
        ['oauth_token', '370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb'],
        ['oauth_version', '1.0'],
      ],
      'kAcSOqF21Fu85e7zjz7ZN2U4ZRhfV3WpwPAoE3Z7kBw',
      'LswwdoUaIvS8ltyTt5jkRh4J50vUPVVHtR2YPi5kE',
    );
    expect(sig).toBe('hCtSmYh+iHYCEqBWrE7C7hYmtUk=');
  });

  it('matches oauthlib on a NETLAB+ style launch URL with a query string', async () => {
    // Vector produced by oauthlib.oauth1.Client, the signer the LTI broker uses for NETLAB+.
    const sig = await oauthSignature(
      'POST',
      'https://netlab.example.org/lti-launch.cgi?netlab_cls_id=12&netlab_com_id=1',
      Object.entries({
        lti_message_type: 'basic-lti-launch-request',
        lti_version: 'LTI-1p0',
        resource_link_id: '1',
        user_id: 'u-1',
        roles: 'Learner',
        lis_person_contact_email_primary: 'a+b@example.org',
        resource_link_title: 'Lab: one & two',
        oauth_nonce: 'abc123',
        oauth_timestamp: '1700000000',
        oauth_version: '1.0',
        oauth_signature_method: 'HMAC-SHA1',
        oauth_consumer_key: 'key123',
        oauth_callback: 'about:blank',
      }),
      's3cr3t',
    );
    expect(sig).toBe('PCRWZ7maBcC2/MGrxFTJeeRL2uw=');
  });
});

describe('sign-in', () => {
  it('sends a visitor without a session to the provider with PKCE', async () => {
    const res = await handle(new Request(`${ORIGIN}/lms/u/grades`), env);
    expect(res.status).toBe(302);
    const auth = new URL(res.headers.get('Location')!);
    expect(auth.origin + auth.pathname).toBe('https://auth.example.org/application/o/authorize/');
    expect(Object.fromEntries(auth.searchParams)).toMatchObject({
      response_type: 'code',
      client_id: CLIENT_ID,
      redirect_uri: `${ORIGIN}/lms/auth/callback`,
      code_challenge_method: 'S256',
    });
    expect(res.headers.get('Set-Cookie')).toMatch(/^lms_login=.+; Path=\/lms\/auth; .*HttpOnly; Secure; SameSite=Lax/);
  });

  it('returns to the requested page with a session cookie', async () => {
    const res = await callback('u-1', 'student@example.org');
    expect(res.headers.get('Location')).toBe(`${ORIGIN}/lms/u/`);
    expect(res.headers.getSetCookie()).toEqual(
      expect.arrayContaining([expect.stringMatching(/^lms_session=.+; Path=\/lms; Max-Age=28800; HttpOnly/)]),
    );
  });

  it('rejects a mismatched state, a replayed nonce, and a token for another client', async () => {
    expect((await callback('u-1', 's@example.org', [], { state: 'forged' })).status).toBe(400);
    expect((await callback('u-1', 's@example.org', [], { nonce: 'other' })).status).toBe(401);
    expect((await callback('u-1', 's@example.org', [], { aud: 'other-client' })).status).toBe(401);
  });

  it('ignores a session cookie signed with another secret', async () => {
    const cookie = await signIn('u-1', 's@example.org');
    env.SESSION_SECRET = 'rotated';
    expect((await handle(new Request(`${ORIGIN}/lms/u/`, { headers: { Cookie: cookie } }), env)).status).toBe(302);
  });

  it('signs out and reports a missing configuration', async () => {
    const out = await handle(new Request(`${ORIGIN}/lms/auth/logout`), env);
    expect(out.headers.get('Location')).toBe(`${ISSUER}end-session/`);
    expect(out.headers.get('Set-Cookie')).toMatch(/^lms_session=; Path=\/lms; Max-Age=0/);
    delete env.SESSION_SECRET;
    expect((await handle(new Request(`${ORIGIN}/lms/u/`), env)).status).toBe(503);
  });
});

describe('browser routes', () => {
  it('lists activities for a signed-in person', async () => {
    const res = await browse('/lms/u/');
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('href="/lms/u/launch/1"');
    expect(html).toContain('Not graded');
    expect(html).not.toContain('Gradebook');
  });

  it('signs a launch the tool can verify', async () => {
    const res = await browse('/lms/u/launch/1');
    const html = await res.text();
    expect(html).toContain(`action="${LAUNCH_URL.replace('&', '&#38;')}"`);
    const f = formFields(html);
    expect(f).toMatchObject({
      lti_message_type: 'basic-lti-launch-request',
      user_id: 'u-1',
      roles: 'Learner',
      oauth_callback: 'about:blank',
      oauth_consumer_key: 'key-a',
      lis_result_sourcedid: '1:u-1',
      lis_outcome_service_url: `${ORIGIN}/lms/lti/outcome`,
    });
    const { oauth_signature, ...rest } = f;
    expect(await oauthSignature('POST', LAUNCH_URL, Object.entries(rest), 'secret-a')).toBe(oauth_signature);
    expect(db.raw.prepare('SELECT email FROM person WHERE sub = ?').get('u-1')).toMatchObject({
      email: 'student@example.org',
    });
  });

  it('launches the instructor group as Instructor and hides the gradebook from learners', async () => {
    const f = formFields(await (await teacher('/lms/u/launch/1')).text());
    expect(f.roles).toBe('Instructor');
    expect(f.lis_person_name_full).toBe('Name t-1');
    expect((await browse('/lms/u/grades')).status).toBe(403);
  });
});

describe('outcome service', () => {
  beforeEach(async () => {
    await browse('/lms/u/launch/1'); // registers u-1 the way a real launch does
  });

  it('records, reads, and deletes a score', async () => {
    const put = await poxRequest(pox('replaceResult', '1:u-1', '0.85'));
    const xml = await put.text();
    expect(put.status).toBe(200);
    expect(xml).toContain('<imsx_codeMajor>success</imsx_codeMajor>');
    expect(xml).toContain('<imsx_messageRefIdentifier>m-9</imsx_messageRefIdentifier>');
    expect(await (await browse('/lms/u/')).text()).toContain('85%');
    const book = await (await teacher('/lms/u/grades')).text();
    expect(book).toContain('student@example.org');

    expect(await (await poxRequest(pox('readResult', '1:u-1'))).text()).toContain('<textString>0.85</textString>');
    await poxRequest(pox('deleteResult', '1:u-1'));
    expect(db.raw.prepare('SELECT COUNT(*) AS n FROM grade').get()).toMatchObject({ n: 0 });
  });

  it('rejects a wrong secret, a tampered body, and another tool writing to this activity', async () => {
    expect((await poxRequest(pox('replaceResult', '1:u-1', '0.5'), 'key-a', 'wrong')).status).toBe(401);
    const tampered = await poxRequest(pox('replaceResult', '1:u-1', '0.1'), 'key-a', 'secret-a', pox('replaceResult', '1:u-1', '1.0'));
    expect(tampered.status).toBe(401);
    expect((await poxRequest(pox('replaceResult', '1:u-1', '0.5'), 'key-b', 'secret-b')).status).toBe(400);
    expect(db.raw.prepare('SELECT COUNT(*) AS n FROM grade').get()).toMatchObject({ n: 0 });
  });

  it('rejects an out-of-range score and an unknown person', async () => {
    expect((await poxRequest(pox('replaceResult', '1:u-1', '1.5'))).status).toBe(400);
    expect((await poxRequest(pox('replaceResult', '1:nobody', '0.5'))).status).toBe(400);
  });
});
