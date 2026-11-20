// @vitest-environment node
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { SignJWT, exportJWK, generateKeyPair } from 'jose';
import { handle, oauthSignature, pct, type Env, type Stmt } from './lms';

const TEAM = 'https://example-team.cloudflareaccess.com';
const AUD = 'aud-tag';
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

let accessKey: CryptoKey;
let db: ReturnType<typeof testDb>;
let env: Env;

beforeAll(async () => {
  const pair = await generateKeyPair('RS256');
  accessKey = pair.privateKey;
  const jwk = { ...(await exportJWK(pair.publicKey)), kid: 'k1', alg: 'RS256' };
  globalThis.fetch = vi.fn(async (input: any) => {
    expect(String(input)).toBe(`${TEAM}/cdn-cgi/access/certs`);
    return new Response(JSON.stringify({ keys: [jwk] }), { headers: { 'Content-Type': 'application/json' } });
  }) as any;
});

beforeEach(() => {
  db = testDb();
  env = { DB: db.d1, ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD, ADMIN_EMAIL: 'Teacher@Example.org' };
});

const accessJwt = (sub: string, email: string, aud = AUD) =>
  new SignJWT({ email })
    .setProtectedHeader({ alg: 'RS256', kid: 'k1' })
    .setIssuer(TEAM)
    .setAudience(aud)
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(accessKey);

async function browse(path: string, sub = 'u-1', email = 'student@example.org') {
  return handle(
    new Request(ORIGIN + path, { headers: { 'Cf-Access-Jwt-Assertion': await accessJwt(sub, email) } }),
    env,
  );
}

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

describe('browser routes', () => {
  it('rejects a request without a valid Access JWT', async () => {
    expect((await handle(new Request(`${ORIGIN}/lms/u/`), env)).status).toBe(401);
    const wrongAud = new Request(`${ORIGIN}/lms/u/`, {
      headers: { 'Cf-Access-Jwt-Assertion': await accessJwt('u-1', 's@example.org', 'other-app') },
    });
    expect((await handle(wrongAud, env)).status).toBe(401);
  });

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

  it('launches the admin as Instructor and hides the gradebook from learners', async () => {
    const f = formFields(await (await browse('/lms/u/launch/1', 't-1', 'teacher@example.org')).text());
    expect(f.roles).toBe('Instructor');
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
    const book = await (await browse('/lms/u/grades', 't-1', 'teacher@example.org')).text();
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
