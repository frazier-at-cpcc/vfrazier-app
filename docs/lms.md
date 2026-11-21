# Minimal LMS at /lms

The LMS signs people in through an OpenID Connect (OIDC) provider such as Authentik, lists LTI 1.1 activities, launches each one with an OAuth 1.0a signature, and records the scores that tools return through LTI Basic Outcomes. The code is `lib/lms.ts`, the route is `functions/lms/[[path]].ts`, and the schema is `migrations/0001_lms.sql`.

## Routes

| Path | Protection | Purpose |
|---|---|---|
| `/lms/u/` | Session cookie | Activity list with the signed-in person's own score |
| `/lms/u/launch/<id>` | Session cookie | Signed LTI 1.1 launch form that submits itself to the tool |
| `/lms/u/grades` | Session cookie, instructor only | Every returned score |
| `/lms/auth/callback` | OIDC state, nonce, and PKCE | Redirect URI that completes sign-in |
| `/lms/auth/logout` | None | Clears the session and ends the provider session |
| `/lms/lti/outcome` | OAuth 1.0a signature per tool | Basic Outcomes service: `replaceResult`, `readResult`, `deleteResult` |

A request to `/lms/u/` without a valid session redirects to the provider. Sign-in uses the authorization code flow with Proof Key for Code Exchange (PKCE). The function verifies the ID token against the provider's published keys, then sets an 8-hour session cookie signed with `SESSION_SECRET`.

Members of the provider group named by `INSTRUCTOR_GROUP`, which defaults to `lms-instructors`, launch with the `Instructor` role and are the only people who can open the gradebook. Everyone else launches as `Learner`. The role comes from the `groups` claim, which the Authentik `profile` scope includes.

## Setup

1. Create the database: `npx wrangler d1 create vfrazier-lms`.
2. Set `database_id` in the `[[d1_databases]]` block of `wrangler.toml` to the value that step 1 printed. The production database is `ef872999-5ce4-47d2-818c-3e37b429be87`.
3. Apply the schema: `npx wrangler d1 migrations apply vfrazier-lms --remote`.
4. In Authentik, open **Applications > Providers** and create an OAuth2/OpenID provider with these settings:
   - Client type: Confidential.
   - Redirect URIs: `https://vfrazier.app/lms/auth/callback` as a strict match. Add `https://.*\.vfrazier-app\.pages\.dev/lms/auth/callback` as a regular expression match to allow preview deployments.
   - Signing key: the Authentik self-signed certificate or another RSA key. The function verifies ID tokens against the provider's JSON Web Key Set (JWKS), so a provider without a signing key fails every sign-in.
   - Scopes: `openid`, `email`, and `profile`.
5. Create an application with the slug `lms` and attach the provider from step 4. Its issuer is `https://<authentik host>/application/o/lms/`.
6. Create the group `lms-instructors` and add the instructor to it. Bind the application to the groups or users who take the course.
7. Set the values the function reads. Each command prompts for its value, so the value stays out of shell history:

   ```sh
   npx wrangler pages secret put OIDC_ISSUER --project-name vfrazier-app          # issuer from step 5
   npx wrangler pages secret put OIDC_CLIENT_ID --project-name vfrazier-app       # client ID from step 4
   npx wrangler pages secret put OIDC_CLIENT_SECRET --project-name vfrazier-app   # client secret from step 4
   openssl rand -base64 32 | npx wrangler pages secret put SESSION_SECRET --project-name vfrazier-app
   ```

8. Repeat step 7 with `--env preview` to give preview deployments the same values.
9. Deploy the branch.

The provider must be reachable from the public internet. The browser redirects to it for sign-in, and the function fetches its discovery document, signing keys, and token endpoint from Cloudflare.

Rotating `SESSION_SECRET` signs everyone out at once.

## Adding a tool and an activity

A tool row holds the consumer key and shared secret. An activity row holds a title and the launch URL. Keep the secret out of git and insert it directly:

```sh
npx wrangler d1 execute vfrazier-lms --remote --command \
  "INSERT INTO tool (name, consumer_key, shared_secret) VALUES ('NETLAB+ VE', '<Consumer Key>', '<Shared Secret>');"
npx wrangler d1 execute vfrazier-lms --remote --command \
  "INSERT INTO activity (tool_id, title, launch_url) VALUES (1, 'NITIC Proxmox Lab', 'https://netlab.labsconnect.org/lti-launch.cgi?netlab_cls_id=12&netlab_com_id=1');"
```

The launch URL comes from `<blti:launch_url>` in the cartridge's `resources/*.xml` file. Its query string stays on the URL, and the signer includes it in the signature base string as RFC 5849 requires.

## NETLAB+ requirements

NETLAB+ refuses a launch that omits `oauth_callback`, so every launch sends `oauth_callback=about:blank`, the value LTI 1.1 fixes for it. The LTI broker in `netlab-lti1p3` recorded the same requirement.

A grade appears only when the tool posts `replaceResult` to the `lis_outcome_service_url` it received at launch. Whether the NETLAB+ class link in the NITIC cartridge posts scores has not been tested.

## Limits

- A role change in the provider takes effect at the next sign-in. A session keeps its role for up to 8 hours.
- The outcome service keeps no nonce store. A replayed request inside the five-minute timestamp window repeats the same write.
- The shared secret is stored in D1 as plain text.
- The LMS has one context. It has no LTI 1.3, Deep Linking, roster service, or admin interface.

## Tests

`npm run test` runs `lib/lms.test.ts` against the real schema on `node:sqlite`. The signer is checked against the published Twitter HMAC-SHA1 example and against a vector produced by oauthlib, the library the broker uses for its NETLAB+ launches.
