# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

**vfrazier.app** — the personal brand site for **Dr. Frazier A. Smith**, an AI & IT
educator, NSF co-PI, department chair at Central Piedmont Community College, and
speaker. It serves four professional identities (speaking, writing/thought
leadership, teaching, research) at roughly equal weight, with **speaking
invitations as the primary inbound conversion target** — the homepage,
navigation, and booking form all optimize for that path.

It is a **static site**, built with **Astro** and deployed to **Cloudflare
Pages** from GitHub. The one dynamic piece is the speaking booking form, handled
by a Cloudflare Pages Function.

## Tech stack

- **Astro 6** (`output: 'static'`), MDX + sitemap + RSS integrations
- **Content Collections** with Zod schemas (`src/content.config.ts`)
- **Inter** (variable) self-hosted via `@fontsource-variable/inter`; Font Awesome 6 via CDN
- **Cloudflare Pages** hosting; **Pages Functions** in `functions/` (no Astro adapter)
- **Resend** for booking-form email; **Cloudflare Turnstile** for bot mitigation
- **Vitest** (unit, happy-dom) + **Playwright** (e2e smoke) for tests
- Node `>=22.12.0`

## Commands

| Command | Action |
| :-- | :-- |
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Production build to `./dist/` |
| `npm run preview` | Preview the build locally |
| `npm run typecheck` | `astro check` (run before committing) |
| `npm run test` | Vitest unit tests (one-shot) |
| `npm run test:e2e` | Playwright e2e (builds/serves `dist` first) |
| `node scripts/render-og.mjs` | Regenerate `public/og-default.png` OG card |

Before committing non-trivial changes, run `npm run typecheck` and `npm run test`.

## Layout

```
src/
  content/            Content collections — EDIT THESE for site content updates
    posts/            Blog posts (.mdx) — category enum, pubDate, draft flag
    speaking-topics/  The 8 talk topics (.md) — abstract, formats, takeaways
    talks-given/      Past + upcoming appearances (.yaml) — upcoming flag
    testimonials/     Endorsements (.yaml) — ordered
    courses/          Courses across 5 institutions (.md) — current flag
    career/           Career-arc timeline entries (.yaml) — ordered
    press/            Press / podcast / award mentions (.yaml)
  content.config.ts   Zod schemas + enums for ALL collections (source of truth)
  pages/              Routes: index, speaking, writing/[slug], talks, teaching, about, cv, 404
  components/         Astro components (Hero, BookingForm, cards, etc.)
  layouts/            BaseLayout (SEO/meta), PostLayout
  styles/             tokens.css (design tokens), global.css, reset.css
  assets/             Images processed by Astro (headshot, etc.)
functions/
  api/book.ts         Booking form handler (Turnstile verify → Resend email)
  _middleware.ts      301 redirects alias domains (.net/.com/.io/www) → vfrazier.app
public/               Static assets served as-is (favicon, og-default.png, cv)
scripts/render-og.mjs OG image generator (Playwright screenshot)
docs/superpowers/     Original design spec + implementation plan
```

## Editing site content (most common task)

Site content lives in `src/content/` as Markdown/MDX/YAML with typed
frontmatter. **The schema in `src/content.config.ts` is the source of truth** —
frontmatter must satisfy it or `astro check` / the build fails. When adding or
updating content:

- Match the existing frontmatter shape of sibling files in the same collection.
- Respect the **enums** (e.g. post `category`, course `institution`/`level`,
  talk `format`, speaking-topic `formats`). Adding a new value means editing the
  schema too.
- Ordered collections (`career`, `testimonials`, `speaking-topics`, `press`) use
  numeric `order` and numeric filename prefixes — keep both consistent.
- Boolean flags drive display: post `draft`, talk `upcoming`, course `current`,
  speaking-topic `featured`/`nsfFunded`, testimonial `placeholder`.
- Dates are `coerce.date()` — ISO `YYYY-MM-DD` strings are fine.
- Run `npm run typecheck` after content edits to validate frontmatter.

Canonical facts about the subject (title, affiliations, education, `sameAs`
links, `knowsAbout`) live in the Person JSON-LD block in `src/pages/index.astro`
— keep it in sync when biographical details change.

## Design system

Editorial / "sticker-pack" aesthetic. Tokens are in `src/styles/tokens.css`;
prefer CSS variables over hard-coded values.

- Palette: `--ink` #1a1209, `--page` #ebe9e6, `--card` #fff, `--accent` #6d28d9
  (purple), `--highlight` #ffd60a (yellow marker), `--muted` #5c4a30
- Motifs: hard 2px black borders, **solid (no-blur) drop shadows**, yellow
  highlighter behind key phrases, rotated corner stamps, numbered section labels
- Type: Inter, big tight display headings; body 16–17px
- Accessibility target: body text ≥ 7:1 contrast (WCAG AAA); yellow highlights
  are decorative only

## Deployment & conventions

- Deploys automatically via Cloudflare Pages on push (build output `dist/`).
- Secrets (`RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`) are set in the Cloudflare
  Pages dashboard — never commit them.
- Canonical host is `vfrazier.app`; `_middleware.ts` redirects all aliases.
- `site: 'https://vfrazier.app'` in `astro.config.mjs` drives sitemap/RSS/canonical URLs.
