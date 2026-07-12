# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

`vfrazier-app` is the personal/professional portfolio site for **Dr. Frazier A. Smith** —
AI & IT educator, Department Chair (Network Management, Cybersecurity, and Cloud &
Virtualization) at Central Piedmont Community College, adjunct at UNC Charlotte and
Wingate University, NSF co-PI, and speaker.

It is a **content-driven static site** built with **Astro** and deployed on
**Cloudflare Pages**. The canonical domain is `https://vfrazier.app`. Most edits are
content updates (career history, courses, talks, testimonials, writing) rather than
code changes.

## Tech stack

- **Astro 6** (`output: 'static'`) with MDX and sitemap integrations
- **Content Collections** with Zod schemas (`src/content.config.ts`) — the source of truth for structured content
- **Cloudflare Pages** for hosting; **Pages Functions** (`functions/`) for the one dynamic endpoint
- **Vitest** (unit) + **Playwright** (e2e smoke) for tests
- Node **>= 22.12.0**. Fonts via `@fontsource-variable/inter`.

## Commands

| Command | Action |
| :-- | :-- |
| `npm run dev` | Local dev server at `localhost:4321` |
| `npm run build` | Production build to `./dist/` |
| `npm run preview` | Preview the build locally |
| `npm run typecheck` | `astro check` — run before committing |
| `npm run test` | Vitest unit tests (currently `functions/api/book.test.ts`) |
| `npm run test:e2e` | Playwright smoke tests (`tests/e2e/`) |

Before committing non-trivial changes, run `npm run typecheck` and `npm run test`.
Content changes that touch schemas or frontmatter especially need `typecheck`, since
Zod validation fails the build on bad data.

## Project structure

```
src/
├── content/               # ← most content updates happen here (typed collections)
│   ├── career/            # career timeline entries (.yaml, ordered by `order`)
│   ├── courses/           # courses taught (.md, by institution/level)
│   ├── posts/             # writing/blog (.mdx) — the `posts` collection
│   ├── press/             # press / podcasts / awards / talks (.yaml)
│   ├── speaking-topics/   # speaking topics offered (.md)
│   ├── talks-given/       # talks delivered / upcoming (.yaml)
│   └── testimonials/      # testimonial quotes (.yaml)
├── content.config.ts      # Zod schemas for every collection — READ THIS before editing content
├── components/            # Astro components (Hero, Nav, Footer, Home* sections, cards)
├── layouts/               # BaseLayout.astro, PostLayout.astro
├── pages/                 # routes: index, about, speaking, teaching, talks, writing/, cv, rss
├── styles/                # tokens.css (design tokens), global.css, reset.css
└── assets/                # images processed by Astro (headshot, teaching-music)

functions/
├── api/book.ts            # Cloudflare Pages Function: speaking-inquiry form handler
└── _middleware.ts         # 301-redirects alternate hosts/TLDs → canonical vfrazier.app

public/                    # static assets served as-is (favicon, cv.pdf, og-default.png)
scripts/                   # render-og.mjs — generates the OG image
docs/                      # design spec + implementation plan (superpowers/)
```

## Content model — how to make updates

All structured content lives in `src/content/` and is validated by the Zod schemas in
`src/content.config.ts`. **Always check the relevant schema before adding or editing an
entry** — the build fails on any field that doesn't match. Notes on each collection:

- **career/** — `{ years, title, org, order }`. `order` controls display sequence (0 = most recent/top).
- **courses/** — Markdown with frontmatter `{ code, title, institution, level, lastTaught, description, syllabusUrl?, current }`. `institution` and `level` are fixed enums; set `current: true` for actively-taught courses.
- **posts/** (writing) — MDX with `{ title, description, pubDate, updatedDate?, category, heroImage?, draft }`. `category` is a fixed enum. Filenames follow `YYYY-MM-slug.mdx`. Set `draft: true` to keep a post out of production.
- **press/** — `{ kind, title, org?, url?, year?, order }`. `kind` ∈ Podcast/News/Award/Talk.
- **speaking-topics/** — Markdown with `{ title, audienceFit, abstract, formats[], takeaways[1..5], featured, nsfFunded, order, icon, tag }`.
- **talks-given/** — `{ event, date, location?, talkTitle, format, slidesUrl?, recordingUrl?, eventUrl?, notes?, upcoming }`. Set `upcoming: true` for scheduled future talks.
- **testimonials/** — `{ name, role, quote, highlightedPhrase?, initials, relationship?, linkedInUrl?, placeholder, order }`. `initials` must be 1–3 uppercase letters.

To add an entry, create a new file in the collection folder matching the existing naming
convention and schema. To reorder, adjust the `order` field.

## Identity / facts to keep consistent

When updating content, keep these canonical facts aligned (they appear in the homepage
JSON-LD in `src/pages/index.astro`, the CV, and the About page):

- Name: **Dr. Frazier A. Smith** (contact: `frazier@vfrazier.app`)
- Primary role: Department Chair — Network Management, Cybersecurity, and Cloud & Virtualization, **Central Piedmont Community College**
- Also teaches at **UNC Charlotte** and **Wingate University**
- NSF co-PI; research focus: how AI is reshaping entry-level IT work and community-college curriculum
- If you change a title, employer, or affiliation in one place, update it everywhere (JSON-LD, CV page, About, career collection).

## The booking form (only dynamic piece)

`functions/api/book.ts` handles speaking-inquiry submissions:
- Validates required fields, checks a honeypot (`website`), and verifies a **Cloudflare Turnstile** token.
- Sends email via **Resend** to `frazier@vfrazier.app`.
- Requires secrets set in the Cloudflare Pages dashboard: `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY` (see `wrangler.toml`).
- Redirects to `/speaking/thanks` on success (or returns JSON if `Accept: application/json`).
- Covered by `functions/api/book.test.ts` — run `npm run test` after touching it.

## Conventions

- **Styling:** use the design tokens in `src/styles/tokens.css`; avoid hard-coded colors/spacing.
- **Images in content** go through Astro's `image()` (import into `src/assets/`); truly static files go in `public/`.
- Match existing file naming (`YYYY-MM-slug` for posts, numbered prefixes for ordered YAML) and frontmatter style in each folder.
- Keep the site static — don't add server-rendering or an Astro adapter. New dynamic behavior belongs in `functions/` as a Pages Function.

## Deployment

Pushing to the repo triggers a Cloudflare Pages build (`npm run build` → `dist/`). The
`_middleware.ts` function 301-redirects the `www`, `.net`, `.com`, and `.io` variants to
the canonical `vfrazier.app`.
