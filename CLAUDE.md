# CLAUDE.md

Guidance for working in this repository.

## What this is

**vfrazier.app** — the personal brand / portfolio site for **Dr. Frazier A. Smith**,
an AI & IT educator, NSF co-PI, and speaker. It serves four professional identities
at equal weight (speaking, writing, teaching, research/about), with **speaking
invitations as the primary inbound conversion goal**.

- **Framework:** Astro 6 (static output, `output: 'static'`), MDX + RSS + sitemap integrations.
- **Styling:** Plain CSS with custom-property tokens. No Tailwind. Global tokens/reset in
  `src/styles/`; per-component styles live in Astro `<style>` blocks.
- **JS at runtime:** effectively none, except the booking form's progressive enhancement.
- **Hosting:** Cloudflare Pages, deployed from GitHub. Custom domain `vfrazier.app`.
  The booking API is a Cloudflare Pages Function (`functions/`), not an Astro adapter route.
- **Canonical design + scope reference:** `docs/superpowers/specs/2026-05-11-portfolio-site-design.md`.
  Read it before making structural, visual, or IA changes — it defines the palette,
  typography, homepage block order, routes, content model, and explicit non-goals.

## Commands

```sh
npm run dev        # local dev server at localhost:4321
npm run build      # production build to dist/
npm run preview    # preview the build
npm run typecheck  # astro check (TS strict + content schema validation)
npm test           # vitest unit tests (run once)
npm run test:e2e   # playwright smoke tests (tests/e2e/)
```

Node `>=22.12.0` is required. Run `npm run typecheck` after content or component
changes — it catches Zod schema violations in content collections.

## Content model — this is where most edits happen

Content is **file-based**; there is no CMS. All content lives in `src/content/` as
Astro Content Collections with Zod schemas defined in `src/content.config.ts`. When
adding or editing content, match the existing files in each folder and keep the
frontmatter/fields valid against the schema. Collections:

| Folder | Format | What it is |
|---|---|---|
| `posts/` | `.mdx` | Blog posts. `category` is a fixed enum; `draft: true` hides a post. |
| `speaking-topics/` | `.md` | Talk topics shown on `/speaking` (and top 4 on home). `order`, `featured`, `nsfFunded`, `tag`, `icon`. |
| `talks-given/` | `.yaml` | Past + upcoming appearances on `/talks`. `upcoming: true` for future ones. |
| `courses/` | `.md` | Courses on `/teaching`. `institution` + `level` are enums; `current: true` for actively taught. |
| `testimonials/` | `.yaml` | Homepage testimonials. `placeholder: true` renders a dashed empty prompt. `initials` must be 1–3 uppercase letters. |
| `career/` | `.yaml` | Career-history rows for `/about`; ordered by numeric `order` (filename prefix mirrors it). |
| `press/` | `.yaml` | "Featured in" strip. `kind` enum: Podcast/News/Award/Talk. |

Filename number prefixes (e.g. `0-cpcc.yaml`, `01-dan-lawrie.yaml`) mirror the `order`
field and control display order. Keep them consistent when adding items.

Empty collections must degrade to an empty-state UI — never let the site blank-error
on missing content.

## Structure

- `src/pages/` — one file per route: `index`, `speaking`, `talks`, `teaching`, `about`,
  `cv`, `404`, `writing/index` + `writing/[...slug]`, `speaking/thanks`, `rss.xml.ts`.
- `src/components/` — Astro components. `Home*` components are the homepage sections;
  the design's homepage block order is authoritative (see the spec, §4).
- `src/layouts/` — `BaseLayout.astro` (SEO/meta/JSON-LD wrapper) and `PostLayout.astro`.
- `src/styles/` — `tokens.css` (CSS custom properties / palette), `reset.css`, `global.css`.
- `functions/` — Cloudflare Pages Functions: `api/book.ts` (booking form handler) and
  `_middleware.ts` (301-redirects alias domains → `vfrazier.app`).
- `public/` — static assets: `cv.pdf`, favicons, `og-default.png`.
- `scripts/` — `render-og.mjs` regenerates the OG image from `og-image-template.html`.

## Design system (do not drift from it)

Palette and type are token-driven in `src/styles/tokens.css`; the spec §3 lists every
token and its intended use. Signature motifs: hard 2px black borders, **solid (no-blur)
drop shadows** (`4px 4px 0`, `8px 8px 0`, etc.), yellow highlighter behind key phrases,
rotated corner stamps, numbered section labels. Accessibility is a requirement, not a
nice-to-have: body text ≥ 7:1 contrast (WCAG AAA), 3px purple focus outlines, respects
`prefers-reduced-motion`. Keep runtime JS near zero.

## Booking form / Pages Functions

- `functions/api/book.ts` handles `POST /api/book`: validates required fields, checks a
  honeypot (`website` field) + Cloudflare Turnstile, then emails `frazier@vfrazier.app`
  via **Resend**. JSON `Accept` → 200 JSON; otherwise 303 redirect to `/speaking/thanks`.
- Secrets are **Cloudflare dashboard env vars**, not committed: `RESEND_API_KEY`,
  `TURNSTILE_SECRET_KEY` (see `wrangler.toml` comments). The form degrades to a full
  POST/redirect without JS.
- Unit-tested in `functions/api/book.test.ts` — update it when changing handler behavior.

## Explicit non-goals (from the spec §9)

No CMS/admin UI, no blog comments, no search (add `pagefind` only past ~20 posts), no
i18n, no dark-mode toggle (the cream palette is intentional), no third-party analytics
(Cloudflare Web Analytics only), no live LinkedIn testimonial import (curated YAML only).
Don't add these without an explicit request.

## Working conventions

- Match the surrounding code's idiom, naming, and comment density.
- Prefer content/data edits over new components when a change is just "update the info."
- Keep the person's facts consistent across `index.astro` JSON-LD, `career/`, `about`,
  and content collections when updating biographical or role information.
- Validate with `npm run typecheck` (schema + TS) and, for anything with runtime
  surface, `npm run build` before committing.
