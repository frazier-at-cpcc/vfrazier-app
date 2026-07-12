# CLAUDE.md

Guidance for Claude Code (and other agents) working in this repository.

## What this is

**vfrazier.app** — the personal brand / portfolio site for **Dr. Frazier A. Smith**,
an AI & IT educator, NSF co-PI, and department chair at Central Piedmont Community
College. The site serves four professional identities at equal weight — **speaking,
writing, teaching, and about/bio** — with **speaking invitations as the primary
inbound conversion target** (the "Book a talk →" path).

It is a **static Astro site** deployed to **Cloudflare Pages**. The only server-side
piece is the booking form, handled by a single Cloudflare Pages Function.

Design and build history live in `docs/superpowers/`:
- `specs/2026-05-11-portfolio-site-design.md` — the approved design spec (IA, palette,
  content model, layout). **Read this first** for the "why" behind any structure.
- `plans/2026-05-11-portfolio-site-implementation.md` — the task-by-task build log.

## Tech stack

- **Astro 6** (`output: 'static'`), MDX integration, sitemap, RSS (`@astrojs/rss`).
- **Plain CSS** with custom-property design tokens — **no Tailwind**. Component styles
  live in Astro `<style>` blocks; global tokens/reset/prose in `src/styles/`.
- **Content Collections** with **Zod** schemas (`src/content.config.ts`) — all site
  content is typed, file-based data. No CMS.
- **TypeScript strict**; typecheck via `astro check`.
- **Fonts:** self-hosted Inter via `@fontsource-variable/inter`.
- **Tests:** Vitest (unit, e.g. the booking function) + Playwright (e2e smoke).
- Zero client-side JS at runtime except the booking form's progressive enhancement.

## Commands

```sh
npm run dev        # dev server at localhost:4321
npm run build      # production build to ./dist/
npm run preview    # preview the build
npm run typecheck  # astro check (strict TS + content schema validation)
npm run test       # vitest run (unit)
npm run test:e2e   # playwright smoke tests
```

Node >= 22.12.0 is required (see `package.json` engines).

## Where content lives (edit these for "content updates")

Almost every content change is a file edit under `src/content/`. Each collection is
governed by a Zod schema in `src/content.config.ts` — **if a build fails after a content
edit, the schema in that file is the source of truth for the allowed shape.**

| Collection | Path | Format | What it is |
|---|---|---|---|
| `posts` | `src/content/posts/` | `.mdx` | Blog posts (Writing section + RSS) |
| `speakingTopics` | `src/content/speaking-topics/` | `.md` | The talk topics on `/speaking` |
| `talksGiven` | `src/content/talks-given/` | `.yaml` | Past + upcoming appearances on `/talks` |
| `courses` | `src/content/courses/` | `.md` | Course descriptions on `/teaching` |
| `testimonials` | `src/content/testimonials/` | `.yaml` | Testimonial cards (supports `placeholder: true`) |
| `press` | `src/content/press/` | `.yaml` | "Featured in" strip on the homepage |
| `career` | `src/content/career/` | `.yaml` | Career-history rows on `/about` (ordered by `order`) |

Notes:
- Ordering is by an `order` (or, for talks, `date`) field — file names like
  `0-cpcc.yaml` / `01-...md` are just for readability, not sort order.
- `testimonials` and `speakingTopics` support a `highlightedPhrase` / yellow-highlight
  motif and `featured` / `nsfFunded` flags — check the schema before adding fields.
- `posts` `category` is an **enum** — a new category must be added to the enum in
  `src/content.config.ts` first, or the build fails.
- Empty collections render an empty-state, not an error.

## Pages, layouts, components

- `src/pages/` — routes: `index`, `speaking`, `writing/` (index + `[...slug]`),
  `talks`, `teaching`, `about`, `cv`, `404`, `rss.xml.ts`, `speaking/thanks`.
- `src/layouts/` — `BaseLayout.astro` (meta, OG tags, fonts, nav/footer slots) and
  `PostLayout.astro` (blog post chrome).
- `src/components/` — presentational Astro components (`Hero`, `Nav`, `Footer`,
  `SpeakingCard`, `TestimonialCard`, `PressStrip`, `Home*` homepage sections, etc.).
  The homepage is composed in `src/pages/index.astro` from `Home*` section components.
- `src/styles/tokens.css` — the design system (palette, type scale, shadows, spacing).
  Change colors/spacing here, not in individual components.

## Identity / facts to keep consistent

When updating bios, metadata, or JSON-LD, keep these aligned across
`index.astro` (Person JSON-LD), `about.astro`, `BaseLayout.astro` (default meta), and
`Footer.astro`:
- Name: **Dr. Frazier A. Smith**. Contact: **frazier@vfrazier.app**. Location: Charlotte, NC.
- Current affiliations: Central Piedmont Community College, UNC Charlotte, Wingate University.
- Career arc framing: **Wingate → VMware → Wingate / community-college department chair**.
- Site domain: `https://vfrazier.app` (set in `astro.config.mjs` `site`).

## Booking form (the one dynamic piece)

- `functions/api/book.ts` — Cloudflare Pages Function. Validates input, sends email via
  **Resend**, uses **Cloudflare Turnstile** + a honeypot for bot mitigation.
- Secrets are set in the Cloudflare Pages dashboard, **not** in the repo:
  `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY` (documented in `wrangler.toml`).
- `functions/api/book.test.ts` covers the handler logic — run `npm run test` after
  touching it. Form degrades gracefully without JS (POST → `/speaking/thanks`).

## Conventions

- Match the existing component's CSS idiom (hard 2px borders, solid no-blur drop
  shadows, yellow highlighter on key phrases) — the visual language is deliberate; see
  §3 of the design spec.
- After content or code changes, run `npm run typecheck` and `npm run build` before
  committing — content-schema violations surface at build time with the offending file.
- Keep it zero-runtime-JS where possible; don't reach for a framework for interactivity
  that CSS or progressive enhancement can handle.
- No secrets, API keys, or the internal model identifier in commits or pushed files.

## Deployment

- Push to `main` → Cloudflare Pages production deploy. PRs get preview URLs.
- Build command `npm run build`, output `dist/` (see `wrangler.toml`).
- OG images: default at `public/og-default.png`; generator in `scripts/render-og.mjs`.
