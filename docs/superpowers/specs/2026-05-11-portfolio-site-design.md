# vfrazier.app — Personal Brand Site Design Spec

**Date:** 2026-05-11
**Owner:** Dr. Frazier A. Smith (frazier@vfrazier.app)
**Domain:** vfrazier.app (deployed via Cloudflare Pages from GitHub)
**Status:** Design approved; ready for implementation planning

---

## 1. Purpose and Audiences

A unified personal brand site serving four professional identities at equal weight, with **speaking** as the primary inbound conversion target.

| Audience | Primary need | Where they land |
|---|---|---|
| Conference organizers, podcast hosts, speaker bureaus | Confirm fit, see talks, book | Hero CTA → `/speaking` → booking form |
| Peer faculty, NSF program officers, grad students | Verify research, courses, credentials | About, Teaching, Research callouts |
| Industry partners (Red Hat / Palo Alto style) | Confirm department fit, see partnerships | About, affiliations, partner case studies |
| Instructional design / L&D community | Read writing, evaluate POV, subscribe | Writing section, RSS |

**Top inbound priority (explicitly chosen):** speaking invitations. The homepage, navigation, and conversion design optimize for that path while still serving the other three audiences honestly.

---

## 2. Information Architecture

```
/                      Home (hero + press strip + speaking + testimonials + about + writing + teaching)
/speaking              All 8 talk topics, abstracts, audience fit, booking form
/writing               Blog index, paginated, with RSS at /rss.xml
/writing/[slug]        Individual post page
/talks                 Past + upcoming appearances (dated list, recordings/slides where available)
/teaching              Courses across all 5 institutions, syllabi where allowed
/about                 Full bio, career arc, certifications, education, CV download
/cv                    Downloadable PDF (resume) — direct asset
404                    Branded not-found
```

Navigation order in the header: **Home · Speaking · Writing · Talks · Teaching · About** plus a persistent purple "Book a talk →" pill.

---

## 3. Visual Design System

### Palette

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#1a1209` | Body text, borders, dark surfaces (footer, POV bar, logistics row) |
| `--page` | `#ebe9e6` | Page background (warm stone grey) |
| `--card` | `#ffffff` | Card surfaces (talks, posts, institutions, testimonials) |
| `--accent` | `#6d28d9` | Primary brand color (purple-700): book buttons, frame backgrounds, link/tag highlights, shadow accents |
| `--accent-soft` | `#efe6ff` | Research callout background |
| `--accent-light` | `#c4b3ff` | Footer accent text, decorative arrows |
| `--highlight` | `#ffd60a` | Yellow "highlighter" on key phrases ("AI lab," pullquotes), corner stamps, About photo frame |
| `--highlight-soft` | `#fffae0` | Featured/elevated card tint (Pull-the-Lever talk) |
| `--muted` | `#5c4a30` | Secondary text |

### Typography

- **Family:** Inter, weights 500/600/700/800 (variable). Self-hosted via `@fontsource-variable/inter` for offline-friendly builds.
- **Display:** H1 60px / line-height 0.96 / weight 800 / letter-spacing -0.035em
- **Section H2:** 40px / weight 800 / letter-spacing -0.025em
- **Card H3:** 19px / weight 800
- **Body:** 16–17px / line-height 1.5–1.65 / weight 500
- **Eyebrow/labels:** 10–11px uppercase / weight 700–800 / letter-spacing 0.12–0.15em

### Component motifs

- **Hard 2px black borders** on cards, photo frames, nav, section dividers.
- **Solid drop shadows** (no blur): `4px 4px 0 var(--ink)` on cards, `8px 8px 0 var(--accent)` on the About photo, `10px 10px 0 var(--ink)` on the hero portrait. Creates a confident, slightly editorial / sticker-pack feel.
- **Yellow highlighter** behind key phrases — emulates a marker on paper.
- **Corner stamps** rotated 5–6° for personality (research focus stamp on hero photo).
- **Numbered section labels** (`01 / Speaking`, `02 / Testimonials`) in inverted ink-on-cream pills.
- **Decorative circles** in the hero (one yellow, one purple-tint) provide background texture without competing with content.

### Accessibility targets

- Body text contrast ratio ≥ 7:1 against `--page` (passes WCAG AAA).
- Yellow highlights are decorative; underlying text remains `--ink`.
- Focus states: 3px purple outline with 2px offset on all interactive elements.
- Skip-to-content link in nav.
- Respects `prefers-reduced-motion`.

---

## 4. Homepage Layout (Approved)

Top to bottom, the homepage is composed of these blocks:

1. **POV thesis bar** — full-width dark band: *"Entry-level IT work is being rewritten by AI faster than community-college curriculum can absorb. **I'm working on closing that gap.**"* Yellow highlight on the closer.
2. **Nav** — brand chip, links, persistent purple "Book a talk →" button.
3. **Hero** — two-column grid:
    - Left: eyebrow ("Dept Chair · NSF Co-PI · ex-VMware") · H1 ("From music classroom to **AI lab.**") · lede · research callout ("Current research" pill + sentence) · two CTAs (primary dark "Book me to speak", ghost "Read recent writing") · affiliations row.
    - Right: framed headshot (purple inner frame, ink border, ink drop-shadow) with rotated yellow corner stamp ("Research focus / AI × Entry-Level Workforce") and ink caption bar ("Dr. Frazier A. **Smith**").
4. **Press / featured strip** — white band: Live from South College (Podcast), Central Piedmont's NSF ATE GAIT grant (News), DevLearn Best in Show DemoFest 2016 (Award, yellow year badge).
5. **Section 01 — Speaking** — header + 4 talk cards in a 2-column grid + speaker logistics row (dark, with format pills and yellow "Check availability" button).
   - Cards: (1) Building NC's first associate-degree AI programs · (2) What AI is doing to the entry-level IT job · (3) **Pull the Lever** (featured, yellow tint, NSF pill) · (4) LLMs/RAG/agentic as ID tools.
6. **Section 02 — Testimonials** — header + 4 placeholder cards in a 2-column grid. Placeholders use dashed borders and italicized prompts; replaced one-by-one as quotes are collected. (LinkedIn imports available but held back per author preference.)
7. **Section 03 — About** — header + two-column grid: yellow-framed headshot (with purple drop shadow + ink "Wingate → VMware → Wingate" badge) and bio text with one pullquote ("The arc from Wingate undergrad to VMware senior manager to community college **department chair** is the whole story.").
8. **Section 04 — Writing** — header + 3 most-recent post rows in a bordered list. "All writing →" link in header.
9. **Section 05 — Teaching** — header + 3 institution cards (Central Piedmont, UNC Charlotte, Wingate).
10. **Footer** — dark band, 4 columns: brand + tagline, Site links, Elsewhere (LinkedIn, GitHub, UNCC SDS profile, RSS), Get in touch (frazier@vfrazier.app, Book a talk →). Footer-bottom: copyright + "vfrazier.app".

---

## 5. Subpage Layouts

### `/speaking`
- Page hero with H1 "Talks I give" and a one-sentence positioning line.
- All 8 talk topics as expanded cards: title, abstract (3–4 sentences), audience fit (e.g., "For: higher-ed conferences, NSF program meetings"), format options (panel/keynote/workshop), one-line "what your audience walks away with."
- Booking form at the bottom: name, organization, event date, event format, topic interest, message. POSTs to a Cloudflare Pages Function (see §7).
- Speaker logistics card (same component as homepage).

### `/writing`
- Paginated index, 10 posts per page.
- Each entry: date, category tag (purple), title, dek, read-time.
- Footer of index: RSS link, "Subscribe (coming soon)" placeholder (no live newsletter at launch).

### `/writing/[slug]`
- MDX-driven post body with prose styles tuned for long-form reading: 18px body, 1.7 line-height, 65ch max-width.
- Frontmatter: `title`, `description`, `pubDate`, `updatedDate`, `category`, `heroImage` (optional), `draft`.
- Post header: category, title, date, read-time.
- Post footer: "Written by Frazier Smith" mini-bio strip + previous/next post.

### `/talks`
- Dated, sortable list of past + upcoming appearances.
- Each entry: date, event name, location, talk title, format (keynote/panel/workshop/podcast), links (slides PDF, recording URL, event page).
- Upcoming entries get a yellow "Upcoming" pill; past entries are styled identically below.
- Empty-state copy if list is short: "More to come — currently booking 2026."

### `/teaching`
- Three institution sections (CPCC, UNCC, Wingate) plus historical institutions in a "Previously taught at" subsection (WakeTech, WayneCC).
- Each course: code, title, level, semester last taught, one-paragraph description, optional syllabus link.

### `/about`
- Full biographical narrative — expanded from the homepage About section.
- Wingate → VMware → Wingate arc surfaced prominently as a section heading.
- Career history table (auto-generated from MDX data, see §6).
- Education list.
- Certifications list.
- Honors and awards.
- "Download CV (PDF)" button linking to `/cv`.

### `/cv`
- Direct PDF download. The PDF lives in `public/` and is also generated from a Markdown source for easy updates.

---

## 6. Content Model

Use Astro **Content Collections** with Zod schemas for type safety.

```
src/content/
  config.ts                Schema definitions for all collections
  posts/                   Blog posts (.mdx)
    2026-05-xapi-lab.mdx
    ...
  talks-given/             Past + upcoming appearances (.yaml or .md)
    2026-04-devlearn.yaml
    ...
  speaking-topics/         The 8 (or N) talk topics (.md)
    pull-the-lever.md
    entry-level-ai-workforce.md
    ...
  courses/                 Course descriptions across institutions (.md)
    cpcc-nos-120.md
    uncc-itis-3310.md
    ...
  testimonials/            Curated testimonials (.yaml)
    dan-lawrie.yaml
    ...
  career/                  Career history rows (.yaml)
  press/                   Featured-in items (.yaml)
```

Schemas (Zod):

- **Post:** `title`, `description`, `pubDate`, `updatedDate?`, `category` (enum), `heroImage?`, `draft (default false)`, `readingTime` (computed).
- **TalkGiven:** `event`, `date`, `location`, `talkTitle`, `format` (enum: keynote/panel/workshop/podcast), `slidesUrl?`, `recordingUrl?`, `eventUrl?`, `upcoming` (boolean).
- **SpeakingTopic:** `title`, `slug`, `audienceFit`, `abstract` (markdown), `formats` (array), `takeaways` (array), `featured?` (boolean), `nsfFunded?` (boolean).
- **Course:** `code`, `title`, `institution` (enum), `level` (enum: associate/bachelor/graduate/honors), `lastTaught` (semester), `description`, `syllabusUrl?`.
- **Testimonial:** `name`, `role`, `org`, `quote`, `highlightedPhrase` (substring of quote to wrap in yellow), `relationship`, `linkedInUrl?`, `dateGiven`.
- **CareerRow:** `years` (string), `title`, `org`.
- **PressItem:** `kind` (enum: podcast/news/award), `title`, `org?`, `url?`, `year?`.

Empty collections render fallback empty-state UI; the site never blank-errors on missing content.

---

## 7. Tech Stack and Deployment

### Stack

- **Framework:** Astro (latest LTS), MDX integration.
- **Styling:** Plain CSS with custom properties for tokens (no Tailwind — the design uses bespoke component composition). One global stylesheet for tokens + reset; component-scoped styles via Astro's `<style>` blocks.
- **Components:** Astro components by default; zero client-side JS at runtime except where genuinely interactive (the booking form's progressive enhancement).
- **Type safety:** TypeScript strict mode; content schemas via Zod.
- **Fonts:** `@fontsource-variable/inter` (self-hosted).
- **Images:** Astro's built-in `<Image>` for responsive headshot. Source headshot stored at `src/assets/headshot.jpg`.
- **RSS:** `@astrojs/rss` generates `/rss.xml` from the posts collection.
- **Sitemap:** `@astrojs/sitemap`.

### Booking form

- Located at `/speaking#book` (anchored section).
- HTML form posts to `/api/book` (a Cloudflare Pages Function at `functions/api/book.ts`).
- Function validates input, then sends an email to `frazier@vfrazier.app` via **Resend** (API key stored as a Cloudflare environment variable: `RESEND_API_KEY`).
- Honeypot field + Cloudflare Turnstile widget to block bots.
- Returns 200 with a JSON success payload; the form shows a thank-you confirmation in-page.
- Progressive enhancement: form works without JS (full POST/redirect to `/speaking/thanks`).

### Hosting and CI

- **Source of truth:** GitHub repo `vfraziersmith/vfrazier-app` (or chosen name).
- **Deploy target:** Cloudflare Pages (connected to the GitHub repo). Pushes to `main` deploy to production; PRs deploy to preview URLs automatically.
- **Custom domain:** `vfrazier.app` with Cloudflare DNS.
- **Environment variables (Cloudflare dashboard):** `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`.
- **Build command:** `npm run build`.
- **Output:** `dist/`.

### Performance budget

- Largest Contentful Paint < 1.5s on 3G mobile (Lighthouse).
- Total page weight < 200 KB gzipped (excluding hero image).
- Lighthouse Performance / Accessibility / Best Practices / SEO ≥ 95.
- No client-side JS frameworks; zero runtime JS on most pages.

---

## 8. Repo Structure

```
.
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── wrangler.toml            (Cloudflare Pages Functions config)
├── public/
│   ├── favicon.svg
│   ├── cv.pdf
│   └── og-default.png
├── functions/
│   └── api/
│       └── book.ts          (Cloudflare Pages Function)
├── src/
│   ├── assets/
│   │   └── headshot.jpg
│   ├── components/
│   │   ├── Nav.astro
│   │   ├── Footer.astro
│   │   ├── PovBar.astro
│   │   ├── Hero.astro
│   │   ├── PressStrip.astro
│   │   ├── SpeakingCard.astro
│   │   ├── SpeakerLogistics.astro
│   │   ├── TestimonialCard.astro
│   │   ├── AboutBlock.astro
│   │   ├── PostRow.astro
│   │   ├── InstitutionCard.astro
│   │   ├── BookingForm.astro
│   │   └── SectionHead.astro
│   ├── content/
│   │   └── (see §6)
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── PostLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── speaking.astro
│   │   ├── writing/
│   │   │   ├── index.astro
│   │   │   └── [...slug].astro
│   │   ├── talks.astro
│   │   ├── teaching.astro
│   │   ├── about.astro
│   │   ├── rss.xml.ts
│   │   └── 404.astro
│   └── styles/
│       ├── tokens.css       (CSS custom properties)
│       ├── reset.css
│       └── global.css
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-05-11-portfolio-site-design.md   (this file)
```

---

## 9. Out of Scope (Explicit Non-Goals)

- **CMS / admin UI.** Content is edited as files in the repo. No Netlify CMS, Tina, etc.
- **Comments on blog posts.** Add only if requested later.
- **Search.** Skip at launch; add `pagefind` later if the post count exceeds ~20.
- **i18n.** English only.
- **Dark mode toggle.** The design has its own light/cream palette that intentionally isn't dark-mode swappable. A future dark-mode pass would require a re-think.
- **Analytics.** Cloudflare Web Analytics enabled by default at the platform level (no GA, no cookies).
- **Newsletter signup wiring** (a Tier 3 future enhancement — placeholder copy only at launch).
- **Speaker one-pager PDF generation** (future enhancement).
- **Live LinkedIn testimonial import.** Curated and approved by author, hardcoded as YAML.

---

## 10. Launch Checklist (Definition of Done)

- [ ] All 7 routes render without errors at preview URL.
- [ ] Lighthouse mobile scores ≥ 95 / 95 / 100 / 100 (Perf / A11y / BP / SEO).
- [ ] Booking form delivers test email to frazier@vfrazier.app successfully.
- [ ] RSS feed validates at validator.w3.org/feed.
- [ ] Open Graph / Twitter Card preview renders for each page.
- [ ] Real headshot replaces draft in `src/assets/`.
- [ ] At least 3 real seed blog posts (or empty-state copy if launching with zero).
- [ ] `vfrazier.app` DNS pointing to Cloudflare Pages.
- [ ] 301 redirect from `www.vfrazier.app` → `vfrazier.app`.
- [ ] Author-approved CV PDF in `public/cv.pdf`.

---

## 11. Open Questions Deferred to Implementation

These don't block the spec but will be confirmed during build:

1. Exact wording of the 8 speaking-topic abstracts (drafted from the profile PDF; author to refine).
2. Whether the GitHub repo name should be `vfrazier-app`, `portfolio-site`, or something else.
3. Whether to seed `/writing` with one real post or launch with an "Inaugural post coming soon" empty-state.
4. Whether the booking form should include a "Honorarium expectations" field (could be useful filter; could also chill inquiry rate — author decides at form-build time).

---

## 12. Post-Launch Additions

Changes made after initial launch that extend the approved IA/nav rather than replacing it. Logged here so this spec stays the accurate source of truth.

- **`/resources` (added 2026-07).** A seventh nav item — **Home · Speaking · Writing · Talks · Teaching · Resources · About** plus the "Book a talk →" pill — listing free, self-published study materials, templates, and tools (e.g., AWS Academy study guides). Content collection: `resources` (`src/content/resources/*.yaml`), fields `title`, `description`, `url`, `kind` (enum: Study Guide/Template/Tool/Dataset/Repository), `audience?`, `order`. Same card motif as `/speaking`'s topic cards; empty-state copy if the collection is ever emptied.
