// Email the "Resource updates" audience about resource cards added between two commits.
// usage: RESEND_API_KEY=... node scripts/notify-new-resources.mjs BEFORE_SHA AFTER_SHA
// DRY_RUN=1 prints the email instead of sending it. Run by .github/workflows/notify-resources.yml.
import { execFileSync } from 'node:child_process';

const AUDIENCE_ID = 'e99fbcd4-0865-4802-a57f-8a06c8b88a69'; // same as functions/api/subscribe.ts
const SITE = process.env.SITE ?? 'https://vfrazier.app'; // override only for local dry runs
const [before, after] = process.argv.slice(2);
const dry = Boolean(process.env.DRY_RUN);

if (!before || !after || /^0+$/.test(before)) {
  console.log('no previous commit to compare against; nothing to send');
  process.exit(0);
}
const ids = execFileSync('git', ['diff', '--name-only', '--diff-filter=A', before, after, '--', 'src/content/resources'], { encoding: 'utf8' })
  .split('\n').filter((f) => /\.(ya?ml|json)$/.test(f)).map((f) => f.split('/').pop().replace(/\.[^.]+$/, ''));
if (ids.length === 0) {
  console.log('no new resource cards');
  process.exit(0);
}

// Wait for the Cloudflare Pages deploy so the email never links to a card that is not live yet.
let items = [];
for (let i = 0; i < 40; i++) {
  const live = await fetch(`${SITE}/resources.json`, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : [])).catch(() => []);
  items = ids.map((id) => live.find((x) => x.id === id));
  if (items.every(Boolean)) break;
  if (i === 39) throw new Error(`not live after 20 minutes: ${ids.filter((_, j) => !items[j]).join(', ')}`);
  await new Promise((r) => setTimeout(r, 30_000));
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const subject = items.length === 1 ? `New resource: ${items[0].title}` : `${items.length} new resources on vfrazier.app`;
const html = `<div style="font-family:system-ui,sans-serif;max-width:560px;line-height:1.5;color:#1a1a1a">
<p>New on <a href="${SITE}/resources/">vfrazier.app/resources</a>:</p>
${items.map((r) => `<h2 style="font-size:18px;margin:20px 0 6px">${esc(r.title)}</h2>
<p style="margin:0 0 8px">${esc(r.description)}</p>
<p style="margin:0"><a href="${esc(r.url)}">Open the resource</a></p>`).join('\n')}
<p style="margin-top:28px;font-size:12px;color:#666">You get this email because you signed up at vfrazier.app/resources. <a href="{{{RESEND_UNSUBSCRIBE_URL}}}">Unsubscribe</a>.</p>
</div>`;

if (dry) {
  console.log(subject, '\n', html);
  process.exit(0);
}
const key = (process.env.RESEND_API_KEY ?? '').trim();
if (!key) throw new Error('RESEND_API_KEY is not set');
const api = async (path, body) => {
  const res = await fetch(`https://api.resend.com${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${path} ${res.status} ${JSON.stringify(out)}`);
  return out;
};
const { id } = await api('/broadcasts', { audience_id: AUDIENCE_ID, from: 'Frazier Smith <noreply@vfrazier.app>', reply_to: 'frazier@vfrazier.app', subject, html, name: subject });
await api(`/broadcasts/${id}/send`, {});
console.log(`sent broadcast ${id}: ${subject}`);
