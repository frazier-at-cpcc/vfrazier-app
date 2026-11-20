# Minimal LMS at /lms

The LMS signs people in through Cloudflare Access, lists LTI 1.1 activities, launches each one with an OAuth 1.0a signature, and records the scores that tools return through LTI Basic Outcomes. The code is `lib/lms.ts`, the route is `functions/lms/[[path]].ts`, and the schema is `migrations/0001_lms.sql`.

## Routes

| Path | Protection | Purpose |
|---|---|---|
| `/lms/u/` | Cloudflare Access | Activity list with the signed-in person's own score |
| `/lms/u/launch/<id>` | Cloudflare Access | Signed LTI 1.1 launch form that submits itself to the tool |
| `/lms/u/grades` | Cloudflare Access, instructor only | Every returned score |
| `/lms/lti/outcome` | OAuth 1.0a signature per tool | Basic Outcomes service: `replaceResult`, `readResult`, `deleteResult` |

The function verifies the Access JWT on every browser route. It does not trust the email header, because requests to the `*.pages.dev` hostnames never pass through Access.

The person whose email matches `ADMIN_EMAIL` launches with the `Instructor` role and is the only person who can open the gradebook. Everyone else launches as `Learner`.

## Setup

1. Create the database: `npx wrangler d1 create vfrazier-lms`.
2. Uncomment the `[[d1_databases]]` block at the end of `wrangler.toml` and paste the `database_id` that step 1 printed.
3. Apply the schema: `npx wrangler d1 migrations apply vfrazier-lms --remote`.
4. In Cloudflare Zero Trust, add a self-hosted Access application for the domain `vfrazier.app` with the path `lms/u`. Attach a policy that allows the people who take the course, and choose the login methods, such as Google or a one-time PIN.
5. Copy the Application Audience (AUD) tag from the application overview that step 4 created.
6. Set the three values the function reads:

   ```sh
   npx wrangler pages secret put ACCESS_TEAM_DOMAIN --project-name vfrazier-app   # https://<team>.cloudflareaccess.com
   npx wrangler pages secret put ACCESS_AUD --project-name vfrazier-app           # the AUD tag from step 5
   npx wrangler pages secret put ADMIN_EMAIL --project-name vfrazier-app          # the instructor's Access email
   ```

7. Deploy the branch. Until the database is bound, `/lms` answers 503 and the rest of the site is unaffected.

The Access application covers `/lms/u` only. The outcome service at `/lms/lti/outcome` must stay outside it, because tools call that endpoint server to server without an Access session.

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

- Access JWTs carry no display name, so the launch sends the email as `lis_person_name_full`.
- The outcome service keeps no nonce store. A replayed request inside the five-minute timestamp window repeats the same write.
- The shared secret is stored in D1 as plain text.
- The LMS has one context. It has no LTI 1.3, Deep Linking, roster service, or admin interface.

## Tests

`npm run test` runs `lib/lms.test.ts` against the real schema on `node:sqlite`. The signer is checked against the published Twitter HMAC-SHA1 example and against a vector produced by oauthlib, the library the broker uses for its NETLAB+ launches.
