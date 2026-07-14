# CLAUDE.md

Guidance for Claude Code (and other AI assistants) working in this repository.

## What this is

`vfrazier.app` is the personal brand / portfolio site for **Dr. Frazier A. Smith** —
AI & IT educator, NSF co-PI, and Department Chair for Network Management,
Cybersecurity, and Cloud & Virtualization at Central Piedmont Community College.
The site serves four professional identities (speaking, writing, teaching, research)
with **speaking invitations** as the primary inbound conversion target.

- **Live domain:** https://vfrazier.app
- **Owner / contact:** frazier@vfrazier.app
- **Hosting:** Cloudflare Pages, deployed from GitHub (`frazier-at-cpcc/vfrazier-app`).
  Pushes to `main` deploy production; PRs get preview URLs.

The canonical design spec is `docs/superpowers/specs/2026-05-11-portfolio-site-design.md`
and the implementation plan is `docs/superpowers/plans/2026-05-11-portfolio-site-implementation.md`.
Read the spec before making structural or design changes — it is the source of truth
for IA, palette, typography, and component motifs.

## Tech stack

- **Framework:** Astro 6 (`output: 'static'`), MDX integration, sitemap integration.
- **Language:** TypeScript (strict), content schemas via Zod 4.
- **Styling:** Plain CSS with custom properties. No Tailwind. Global tokens/reset in
  `src/styles/`; component styles via Astro `<style>` blocks.
- **Fonts:** Self-hosted Inter via `@fontsource-variable/inter`. Font Awesome 6.5.2
  icons loaded from cdnjs in `BaseLayout.astro`.
- **Client JS:** Effectively zero at runtime except the booking form's progressive
  enhancement. Keep it that way.
- **Booking backend:** Cloudflare Pages Function at `functions/api/book.ts` (Resend
  email + Turnstile bot check). Not an Astro endpoint — Pages picks it up automatically,
  so no Astro adapter is used.
- **Node:** >= 22.12.0.

## Commands

```sh
npm install          # install deps
npm run dev          # dev server at localhost:4321
npm run build        # production build to ./dist
npm run preview      # preview the build
npm run typecheck    # astro check (run this before committing)
npm run test         # vitest unit tests (run once)
npm run test:watch   # vitest watch mode
npm run test:e2e     # playwright smoke tests
npm run cv:pdf       # build, then regenerate public/cv.pdf from the /cv page
npm run og           # regenerate public/og-default.png
```

Before committing changes, run `npm run typecheck`; run `npm run test` when touching
`functions/` or anything with a unit test.

## Repository layout

```
src/
  pages/            Routes: index, about, cv, speaking, speaking/thanks, talks,
                    teaching, writing/index, writing/[...slug], rss.xml.ts, 404
  layouts/          BaseLayout.astro, PostLayout.astro
  components/       Astro components (Hero, Nav, Footer, SpeakingCard, etc.)
  content/          Content collections (see below) — the editable data lives here
  content.config.ts Zod schemas for every collection
  data/             Shared TS data modules imported by pages (credentials.ts)
  styles/           tokens.css, reset.css, global.css
  assets/           headshot.jpg, teaching-music.jpg (processed by Astro)
functions/
  _middleware.ts    301 redirects alternate hosts → vfrazier.app
  api/book.ts       Booking form handler (Resend + Turnstile)
  api/book.test.ts  Unit tests for the handler
public/             cv.pdf, favicon, og-default.png (served as-is)
scripts/            render-og.mjs, render-cv-pdf.mjs (Playwright/Chromium renderers)
docs/superpowers/   Design spec + implementation plan
```

## Content model — where to edit site content

Almost all "bring the site up to date" work is **editing files under `src/content/`**,
not touching components. Each collection is defined in `src/content.config.ts`; any new
file must satisfy that collection's Zod schema or the build fails.

| Collection | Path | Format | Purpose |
|---|---|---|---|
| `posts` | `src/content/posts/` | `.mdx` | Blog / writing posts |
| `speakingTopics` | `src/content/speaking-topics/` | `.md` | Talk topics offered (shown on `/speaking`) |
| `talksGiven` | `src/content/talks-given/` | `.yaml` | Past + upcoming appearances (`/talks`) |
| `courses` | `src/content/courses/` | `.md` | Courses taught, by institution (`/teaching`) |
| `testimonials` | `src/content/testimonials/` | `.yaml` | Curated testimonials |
| `press` | `src/content/press/` | `.yaml` | Featured-in strip |
| `career` | `src/content/career/` | `.yaml` | Career history rows (`/about`, `/cv`) |

Key schema notes (see `content.config.ts` for the authoritative list):

- **Posts** need `title`, `description`, `pubDate`, and a `category` from the enum
  (`Instructional Design`, `AI & Workforce`, `Teaching`, `Cloud & Infra`, `Research`,
  `Notes`). `draft: true` hides a post. Filenames follow `YYYY-MM-slug.mdx`.
- **speakingTopics** use `order` for sort, `featured`/`nsfFunded` flags, and `formats`
  from a fixed enum. `takeaways` is 1–5 items.
- **talksGiven** use `upcoming: true` for the "Upcoming" pill; `format` is an enum.
- **courses** carry `institution` and `level` enums and a `current` flag. `career`
  rows are ordered by the numeric `order` (0 = most recent) and their filename prefix.
- **testimonials** `initials` must be 1–3 uppercase letters; `placeholder: true`
  renders the dashed empty-state card.

Empty collections render fallback empty-state UI — the site never blank-errors on
missing content. When adding content, mirror the shape of an existing sibling file.

**Résumé facts not in a collection:** education, certifications, awards, and
service are a shared module, `src/data/credentials.ts`, rendered by both `/cv`
and `/about` — edit them once there. Service entries have an optional `detail`
that renders only on `/cv`. Career history is the `career` collection. The
remaining CV-only sections (current roles, sponsored research, grants under
review, curriculum development) are inline arrays/markup in `src/pages/cv.astro`.

## Design system quick reference

Tokens live in `src/styles/tokens.css`. The look is deliberately editorial/"sticker-pack":

- Warm stone background (`--page #ebe9e6`), ink text (`--ink #1a1209`), purple accent
  (`--accent #6d28d9`), yellow highlighter (`--highlight #ffd60a`).
- Hard 2px black borders + solid (no-blur) drop shadows on cards and framed images.
- Yellow highlighter behind key phrases (see `HighlightPhrase.astro`).
- Numbered section labels (`01 / Speaking`).
- Inter, weights 500–800. No dark mode (intentional — see spec §9).

Accessibility targets: body text ≥ 7:1 contrast, 3px purple focus outlines, skip link,
respects `prefers-reduced-motion`. Preserve these when editing.

## Conventions & guardrails

- **Match surrounding style.** New content files should copy the frontmatter/field
  shape of the nearest existing file in the same collection.
- **Names & facts:** the site subject is "Dr. Frazier A. Smith" (`frazier@vfrazier.app`).
  Person/JSON-LD identity is hardcoded in `src/pages/index.astro` and the default
  description in `BaseLayout.astro` — update both if biographical facts change.
- **No new runtime JS frameworks.** Astro components + minimal progressive enhancement.
- **CV PDF:** `public/cv.pdf` is generated from the `/cv` page — after any CV/about
  content change, run `npm run cv:pdf` and commit the refreshed PDF. It prints the
  page's own `@media print` styles (site chrome hidden via `:global()` rules), so it
  stays in sync with the site; there is no separate PDF source to edit.
- **OG image:** if branding/text changes, regenerate `public/og-default.png` with
  `npm run og` (uses the pre-installed Chromium).
- **Secrets** (`RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`) live only in the Cloudflare
  Pages dashboard — never commit them.
- **Out of scope** (per spec §9): CMS/admin UI, blog comments, search, i18n, dark mode,
  third-party analytics, live newsletter wiring. Don't add these without being asked.

## Workflow for this branch

Development happens on `claude/site-content-updates-en7p3n`. Commit with clear messages,
run `npm run typecheck`, push with `git push -u origin <branch>`, and open a draft PR.
