# vfrazier.app Portfolio Site — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a multi-section personal brand site at vfrazier.app — Astro + MDX, hosted on Cloudflare Pages, source on GitHub — implementing the design approved in `docs/superpowers/specs/2026-05-11-portfolio-site-design.md`.

**Architecture:** Static-site generation with Astro 5+, content driven by typed MDX/YAML collections (Zod schemas). Server-side concerns isolated to one Cloudflare Pages Function handling the booking form. Zero client-side JS at runtime except form progressive-enhancement.

**Tech Stack:** Astro 5, MDX, TypeScript (strict), Zod, `@fontsource-variable/inter`, `@astrojs/rss`, `@astrojs/sitemap`, `@astrojs/cloudflare`, Resend (transactional email), Cloudflare Turnstile (bot mitigation), Vitest (unit tests), Playwright (smoke tests).

---

## File Structure (Locked Before Tasks)

| Path | Responsibility |
|---|---|
| `astro.config.mjs` | Astro integrations + adapter config |
| `tsconfig.json` | Strict TS config (extends `astro/tsconfigs/strict`) |
| `wrangler.toml` | Cloudflare Pages Functions config |
| `package.json` | Dependencies + scripts |
| `vitest.config.ts` | Unit test config |
| `playwright.config.ts` | E2E smoke-test config |
| `.gitignore` | Standard + `.superpowers/`, `.dev.vars` |
| `public/cv.pdf` | Downloadable CV asset |
| `public/og-default.png` | Default social-share image |
| `public/favicon.svg` | Site favicon |
| `functions/api/book.ts` | Cloudflare Pages Function for booking form |
| `functions/api/book.test.ts` | Unit tests for booking form handler logic |
| `src/assets/headshot.jpg` | Source headshot (Astro processes) |
| `src/styles/tokens.css` | All design tokens as CSS custom properties |
| `src/styles/reset.css` | Light reset based on modern-normalize |
| `src/styles/global.css` | Body styles, link styles, prose styles, focus rings |
| `src/content/config.ts` | All Zod schemas + collection definitions |
| `src/content/posts/*.mdx` | Blog post content |
| `src/content/speaking-topics/*.md` | 8 speaking topics |
| `src/content/testimonials/*.yaml` | Curated testimonials |
| `src/content/talks-given/*.yaml` | Past/upcoming appearances |
| `src/content/courses/*.md` | Course descriptions |
| `src/content/press/*.yaml` | Featured-in items |
| `src/content/career/*.yaml` | Career history rows |
| `src/layouts/BaseLayout.astro` | Wraps every page; loads fonts, meta, global CSS |
| `src/layouts/PostLayout.astro` | Wraps single blog posts |
| `src/components/Nav.astro` | Site navigation |
| `src/components/Footer.astro` | Site footer |
| `src/components/PovBar.astro` | Top thesis bar |
| `src/components/SectionHead.astro` | Numbered section header (label + h2 + more link) |
| `src/components/Hero.astro` | Homepage hero with portrait |
| `src/components/PressStrip.astro` | Featured-in strip |
| `src/components/SpeakingCard.astro` | Individual speaking topic card |
| `src/components/SpeakerLogistics.astro` | Available formats row |
| `src/components/TestimonialCard.astro` | Testimonial card (with placeholder variant) |
| `src/components/AboutBlock.astro` | Homepage about block |
| `src/components/PostRow.astro` | Single row in writing list |
| `src/components/InstitutionCard.astro` | Institution + courses card |
| `src/components/BookingForm.astro` | Speaking inquiry form |
| `src/components/HighlightPhrase.astro` | Helper that wraps the highlighted substring in `<em>` |
| `src/pages/index.astro` | Homepage |
| `src/pages/speaking.astro` | All 8 talks + booking form |
| `src/pages/writing/index.astro` | Blog index |
| `src/pages/writing/[...slug].astro` | Single post |
| `src/pages/talks.astro` | Appearances list |
| `src/pages/teaching.astro` | Courses across institutions |
| `src/pages/about.astro` | Full bio + career + education |
| `src/pages/rss.xml.ts` | RSS generator |
| `src/pages/404.astro` | Branded 404 |
| `src/pages/speaking/thanks.astro` | Post-submit confirmation |
| `tests/e2e/smoke.spec.ts` | Smoke E2E tests |

---

## Task 1: Initialize project with Astro and Git

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `README.md`

- [ ] **Step 1: Create Astro project in current directory**

Working dir: `/Users/frazier/Documents/Projects/portfolio-site`

Run:
```bash
cd /Users/frazier/Documents/Projects/portfolio-site
npm create astro@latest . -- --template minimal --typescript strict --no-install --no-git --skip-houston --yes
```
Expected: Creates `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro`, `public/favicon.svg`. May warn about non-empty directory — say yes to continue (existing files: PDF, headshot, `.superpowers/`, `docs/` will not be touched).

- [ ] **Step 2: Install dependencies**

Run:
```bash
npm install
```
Expected: `node_modules/` populated, no errors.

- [ ] **Step 3: Verify dev server starts**

Run:
```bash
npm run dev
```
Expected: Astro reports "Local: http://localhost:4321/" within ~3 seconds. Hit Ctrl+C to stop.

- [ ] **Step 4: Write `.gitignore`**

Replace `.gitignore` with:
```gitignore
# build output
dist/
.astro/

# dependencies
node_modules/

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# environment variables
.env
.env.production
.dev.vars

# macOS
.DS_Store

# jetbrains setting folder
.idea/

# Brainstorming workspace (local-only, not for repo)
.superpowers/

# Cloudflare Wrangler local state
.wrangler/

# Playwright
test-results/
playwright-report/
playwright/.cache/

# Vitest
coverage/
```

- [ ] **Step 5: Initialize git repo and make first commit**

Run:
```bash
git init -b main
git add .gitignore package.json package-lock.json astro.config.mjs tsconfig.json src/ public/ README.md docs/
git status
```
Expected: Files listed; verify no `node_modules/` or `.superpowers/` in the staged list.

Then:
```bash
git commit -m "chore: scaffold Astro project with strict TypeScript"
```

---

## Task 2: Install all production and dev dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Astro integrations and runtime deps**

Run:
```bash
npm install @astrojs/mdx @astrojs/rss @astrojs/sitemap @astrojs/cloudflare @fontsource-variable/inter zod
```
Expected: All installed without errors.

- [ ] **Step 2: Install dev dependencies (testing + types)**

Run:
```bash
npm install -D vitest @vitest/ui happy-dom @playwright/test @cloudflare/workers-types
```
Expected: All installed.

- [ ] **Step 3: Install Playwright browsers**

Run:
```bash
npx playwright install chromium
```
Expected: Chromium download completes (~120 MB).

- [ ] **Step 4: Add npm scripts to package.json**

Edit `package.json` — replace the `"scripts"` block with:
```json
"scripts": {
  "dev": "astro dev",
  "start": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "typecheck": "astro check"
}
```

- [ ] **Step 5: Verify and commit**

Run:
```bash
npm run typecheck
```
Expected: 0 errors (the default index.astro is valid).

Then:
```bash
git add package.json package-lock.json
git commit -m "chore: install Astro integrations and test tooling"
```

---

## Task 3: Configure Astro with all integrations and Cloudflare adapter

**Files:**
- Modify: `astro.config.mjs`
- Create: `wrangler.toml`

- [ ] **Step 1: Replace astro.config.mjs**

Write `astro.config.mjs`:
```javascript
// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://vfrazier.app',
  output: 'static',
  adapter: cloudflare({
    imageService: 'compile',
  }),
  integrations: [mdx(), sitemap()],
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  vite: {
    ssr: {
      external: ['node:buffer'],
    },
  },
});
```

- [ ] **Step 2: Create wrangler.toml**

Write `wrangler.toml`:
```toml
name = "vfrazier-app"
compatibility_date = "2025-05-01"
pages_build_output_dir = "dist"

# Environment variables are set in the Cloudflare Pages dashboard:
#   RESEND_API_KEY        — for the booking form to send email
#   TURNSTILE_SECRET_KEY  — for booking form bot mitigation
```

- [ ] **Step 3: Verify build still works**

Run:
```bash
npm run build
```
Expected: Build succeeds; reports "Complete!" with `dist/` generated.

- [ ] **Step 4: Commit**

Run:
```bash
git add astro.config.mjs wrangler.toml
git commit -m "chore: configure Astro for Cloudflare Pages with MDX and sitemap"
```

---

## Task 4: Set up design tokens, reset, and global CSS

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/reset.css`, `src/styles/global.css`

- [ ] **Step 1: Write src/styles/tokens.css**

Write `src/styles/tokens.css`:
```css
:root {
  /* Palette */
  --ink: #1a1209;
  --ink-2: #2a1d10;
  --muted: #5c4a30;
  --page: #ebe9e6;
  --card: #ffffff;
  --accent: #6d28d9;
  --accent-soft: #efe6ff;
  --accent-light: #c4b3ff;
  --accent-deep: #3a1d70;
  --highlight: #ffd60a;
  --highlight-soft: #fffae0;
  --border: #1a1209;
  --footer-text: #d4c9b4;
  --footer-dim: #8a7558;

  /* Typography */
  --font-sans: 'Inter Variable', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;

  /* Sizing */
  --container-max: 1100px;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 12px;
  --radius-pill: 99px;

  /* Shadows */
  --shadow-card: 4px 4px 0 var(--ink);
  --shadow-card-accent: 4px 4px 0 var(--accent);
  --shadow-hero: 10px 10px 0 var(--ink);
  --shadow-about: 8px 8px 0 var(--accent);

  /* Spacing */
  --space-section: 70px;
  --space-page-x: 40px;
}

@media (max-width: 720px) {
  :root {
    --space-section: 48px;
    --space-page-x: 22px;
  }
}
```

- [ ] **Step 2: Write src/styles/reset.css**

Write `src/styles/reset.css`:
```css
*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; }
html, body { height: 100%; }
body { line-height: 1.5; -webkit-font-smoothing: antialiased; }
img, picture, video, canvas, svg { display: block; max-width: 100%; }
input, button, textarea, select { font: inherit; }
p, h1, h2, h3, h4, h5, h6 { overflow-wrap: break-word; }
a { color: inherit; text-decoration: none; }
ul, ol { padding: 0; }
button { background: none; border: 0; cursor: pointer; padding: 0; }
```

- [ ] **Step 3: Write src/styles/global.css**

Write `src/styles/global.css`:
```css
@import './tokens.css';
@import './reset.css';
@import '@fontsource-variable/inter';

body {
  font-family: var(--font-sans);
  font-weight: 500;
  background: var(--page);
  color: var(--ink);
  font-feature-settings: 'cv11', 'ss01';
}

a:focus-visible,
button:focus-visible,
input:focus-visible,
textarea:focus-visible,
[role='button']:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
  border-radius: 4px;
}

.container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--space-page-x);
}

.skip-link {
  position: absolute;
  top: -100px;
  left: 12px;
  background: var(--ink);
  color: var(--page);
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-weight: 700;
  z-index: 100;
}
.skip-link:focus { top: 12px; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* Prose styles for blog posts */
.prose { font-size: 18px; line-height: 1.7; max-width: 65ch; }
.prose > * + * { margin-top: 1.2em; }
.prose h2 { font-size: 28px; font-weight: 800; letter-spacing: -.02em; margin-top: 1.6em; }
.prose h3 { font-size: 22px; font-weight: 800; letter-spacing: -.015em; margin-top: 1.4em; }
.prose a { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }
.prose code { background: var(--accent-soft); padding: 1px 6px; border-radius: 4px; font-size: 0.92em; }
.prose pre { background: var(--ink); color: var(--page); padding: 18px 20px; border-radius: var(--radius-md); overflow-x: auto; }
.prose pre code { background: transparent; padding: 0; color: inherit; }
.prose blockquote { border-left: 3px solid var(--accent); padding-left: 18px; font-style: italic; color: var(--ink-2); }
.prose ul, .prose ol { padding-left: 22px; }
.prose li + li { margin-top: 0.4em; }
```

- [ ] **Step 4: Commit**

Run:
```bash
git add src/styles/
git commit -m "feat(styles): add design tokens, reset, and global styles"
```

---

## Task 5: Create BaseLayout and verify font loading

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Write src/layouts/BaseLayout.astro**

Write `src/layouts/BaseLayout.astro`:
```astro
---
import '../styles/global.css';

interface Props {
  title: string;
  description?: string;
  ogImage?: string;
  noindex?: boolean;
}

const {
  title,
  description = 'Dr. Frazier A. Smith — AI & IT educator, NSF co-PI, department chair at Central Piedmont. Speaker on AI in education, workforce, and instructional design.',
  ogImage = '/og-default.png',
  noindex = false,
} = Astro.props;

const canonical = new URL(Astro.url.pathname, Astro.site).toString();
const ogImageUrl = new URL(ogImage, Astro.site).toString();
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    {noindex && <meta name="robots" content="noindex,nofollow" />}
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="sitemap" href="/sitemap-index.xml" />
    <link rel="alternate" type="application/rss+xml" title="vfrazier.app — Writing" href="/rss.xml" />

    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={ogImageUrl} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={ogImageUrl} />
  </head>
  <body>
    <a href="#main" class="skip-link">Skip to content</a>
    <slot name="header" />
    <main id="main">
      <slot />
    </main>
    <slot name="footer" />
  </body>
</html>
```

- [ ] **Step 2: Replace src/pages/index.astro with a smoke page**

Write `src/pages/index.astro`:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Dr. Frazier A. Smith — AI & IT Educator, Speaker, Researcher">
  <div class="container" style="padding-top: 60px;">
    <h1 style="font-size: 60px; font-weight: 800; letter-spacing: -.035em;">Hello, Frazier.</h1>
    <p style="margin-top: 12px; color: var(--muted);">Foundation is live. We'll layer in the real homepage next.</p>
  </div>
</BaseLayout>
```

- [ ] **Step 3: Add a placeholder og-default.png and favicon**

The existing `public/favicon.svg` is fine. For OG image, create a minimal placeholder:
```bash
# Create a 1x1 transparent PNG as a stub (will be replaced before launch)
printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xfc\xff\xff?\x03\x00\x05\xfe\x02\xfe\xa6\x9b\x9e/\x00\x00\x00\x00IEND\xaeB`\x82' > public/og-default.png
```

- [ ] **Step 4: Build and verify**

Run:
```bash
npm run dev
```
Visit http://localhost:4321/ — expect "Hello, Frazier." in heavy Inter sans on warm-grey background.

Then Ctrl+C and:
```bash
npm run build
```
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/BaseLayout.astro src/pages/index.astro public/og-default.png
git commit -m "feat(layout): add BaseLayout with meta tags and font loading"
```

---

## Task 6: Build Nav, Footer, and PovBar components

**Files:**
- Create: `src/components/Nav.astro`, `src/components/Footer.astro`, `src/components/PovBar.astro`

- [ ] **Step 1: Write src/components/PovBar.astro**

Write `src/components/PovBar.astro`:
```astro
---
// One-line thesis bar at the very top of every page.
---
<aside class="pov">
  <span class="arrow" aria-hidden="true">▸</span>
  Entry-level IT work is being rewritten by AI faster than community-college curriculum can absorb.
  <span class="hl">I'm working on closing that gap.</span>
</aside>

<style>
  .pov {
    background: var(--ink);
    color: var(--page);
    padding: 14px 24px;
    font-size: 14px;
    line-height: 1.4;
    font-weight: 600;
    text-align: center;
    letter-spacing: -.005em;
  }
  .pov .hl { color: var(--highlight); }
  .pov .arrow { color: var(--accent-light); margin-right: 6px; }
  @media (max-width: 720px) { .pov { font-size: 13px; padding: 12px 16px; } }
</style>
```

- [ ] **Step 2: Write src/components/Nav.astro**

Write `src/components/Nav.astro`:
```astro
---
interface Props { current?: string; }
const { current = '' } = Astro.props;

const links = [
  { href: '/', label: 'Home', key: 'home' },
  { href: '/speaking', label: 'Speaking', key: 'speaking' },
  { href: '/writing', label: 'Writing', key: 'writing' },
  { href: '/talks', label: 'Talks', key: 'talks' },
  { href: '/teaching', label: 'Teaching', key: 'teaching' },
  { href: '/about', label: 'About', key: 'about' },
];
---
<nav class="nav" aria-label="Primary">
  <a href="/" class="brand">Dr. Frazier Smith</a>
  <ul class="links">
    {links.map((l) => (
      <li>
        <a href={l.href} class={current === l.key ? 'active' : ''}>{l.label}</a>
      </li>
    ))}
  </ul>
  <a href="/speaking#book" class="book">Book a talk →</a>
</nav>

<style>
  .nav {
    display: flex;
    align-items: center;
    padding: 18px 40px;
    border-bottom: 2px solid var(--ink);
    font-size: 14px;
    background: var(--page);
  }
  .brand {
    background: var(--ink);
    color: var(--page);
    padding: 5px 12px;
    border-radius: var(--radius-sm);
    font-weight: 800;
    letter-spacing: -.02em;
  }
  .links {
    display: flex;
    gap: 24px;
    margin-left: auto;
    list-style: none;
    font-weight: 600;
  }
  .links a.active {
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 5px;
    text-decoration-color: var(--accent);
  }
  .book {
    margin-left: 28px;
    background: var(--accent);
    color: var(--page);
    padding: 9px 16px;
    border-radius: var(--radius-pill);
    font-weight: 700;
    font-size: 13px;
  }
  @media (max-width: 860px) {
    .nav { padding: 14px 20px; flex-wrap: wrap; gap: 12px; }
    .links { gap: 16px; margin-left: 0; flex-basis: 100%; order: 3; font-size: 13px; }
    .book { margin-left: auto; font-size: 12px; padding: 7px 12px; }
  }
</style>
```

- [ ] **Step 3: Write src/components/Footer.astro**

Write `src/components/Footer.astro`:
```astro
---
const year = new Date().getFullYear();
---
<footer class="footer">
  <div class="cols">
    <div class="col-brand">
      <div class="brand">frazier<span class="dot">.</span>smith</div>
      <p>AI &amp; IT educator. Learning design leader. Department chair at Central Piedmont. Speaker on the things in between.</p>
    </div>
    <div>
      <h5>Site</h5>
      <ul>
        <li><a href="/speaking">Speaking</a></li>
        <li><a href="/writing">Writing</a></li>
        <li><a href="/talks">Talks</a></li>
        <li><a href="/teaching">Teaching</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </div>
    <div>
      <h5>Elsewhere</h5>
      <ul>
        <li><a href="https://linkedin.com/in/fraziersmith" rel="noopener">LinkedIn</a></li>
        <li><a href="https://github.com/" rel="noopener">GitHub</a></li>
        <li><a href="https://sds.charlotte.edu/frazier-smith" rel="noopener">UNCC SDS profile</a></li>
        <li><a href="/rss.xml">RSS</a></li>
      </ul>
    </div>
    <div>
      <h5>Get in touch</h5>
      <ul>
        <li><a href="mailto:frazier@vfrazier.app">frazier@vfrazier.app</a></li>
        <li><a href="/speaking#book">Book a talk →</a></li>
      </ul>
    </div>
  </div>
  <div class="bar">
    <span>© {year} Frazier A. Smith · Charlotte, NC</span>
    <span>vfrazier.app</span>
  </div>
</footer>

<style>
  .footer {
    background: var(--ink);
    color: var(--page);
  }
  .cols {
    padding: 60px 40px 30px;
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 40px;
  }
  .col-brand .brand { font-weight: 800; font-size: 22px; margin-bottom: 10px; letter-spacing: -.02em; }
  .col-brand .brand .dot { color: var(--accent-light); }
  .col-brand p { font-size: 13px; color: var(--footer-text); max-width: 280px; line-height: 1.55; }
  h5 {
    font-size: 11px;
    color: var(--accent-light);
    text-transform: uppercase;
    letter-spacing: .12em;
    margin: 0 0 14px;
    font-weight: 800;
  }
  ul { list-style: none; }
  li { font-size: 13px; color: var(--footer-text); margin-bottom: 7px; font-weight: 500; }
  .bar {
    padding: 18px 40px;
    border-top: 1px solid #3a2c1a;
    font-size: 11px;
    color: var(--footer-dim);
    display: flex;
    justify-content: space-between;
  }
  @media (max-width: 720px) {
    .cols { grid-template-columns: 1fr 1fr; padding: 40px 22px 24px; gap: 28px; }
    .bar { padding: 14px 22px; flex-direction: column; gap: 6px; }
  }
</style>
```

- [ ] **Step 4: Wire into BaseLayout**

Edit `src/layouts/BaseLayout.astro` — add imports above the frontmatter close and replace the body content:

Replace the `---` script block content's last lines:
```astro
const canonical = new URL(Astro.url.pathname, Astro.site).toString();
const ogImageUrl = new URL(ogImage, Astro.site).toString();
```
…stays as is. Below it, add:
```astro
import PovBar from '../components/PovBar.astro';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';

interface NavProps { current?: string; }
const navProps: NavProps = { current: Astro.props.current };
```

Update the `Props` interface:
```ts
interface Props {
  title: string;
  description?: string;
  ogImage?: string;
  noindex?: boolean;
  current?: string;
}
```

Then replace the body content:
```astro
  <body>
    <a href="#main" class="skip-link">Skip to content</a>
    <PovBar />
    <Nav current={navProps.current} />
    <main id="main">
      <slot />
    </main>
    <Footer />
  </body>
```

- [ ] **Step 5: Verify and commit**

Run:
```bash
npm run dev
```
Open http://localhost:4321 — should see PovBar at top, Nav below, "Hello, Frazier." main, and Footer at bottom.

Then:
```bash
git add src/components/PovBar.astro src/components/Nav.astro src/components/Footer.astro src/layouts/BaseLayout.astro
git commit -m "feat(components): add PovBar, Nav, and Footer wired into BaseLayout"
```

---

## Task 7: Build SectionHead and HighlightPhrase helpers

**Files:**
- Create: `src/components/SectionHead.astro`, `src/components/HighlightPhrase.astro`

- [ ] **Step 1: Write src/components/SectionHead.astro**

Write `src/components/SectionHead.astro`:
```astro
---
interface Props {
  number: string;
  label: string;
  title: string;
  moreLabel?: string;
  moreHref?: string;
}
const { number, label, title, moreLabel, moreHref } = Astro.props;
---
<div class="head">
  <span class="badge">{number} / {label}</span>
  <h2>{title}</h2>
  {moreLabel && moreHref && <a class="more" href={moreHref}>{moreLabel}</a>}
</div>

<style>
  .head {
    display: flex;
    align-items: baseline;
    gap: 18px;
    margin-bottom: 36px;
    flex-wrap: wrap;
  }
  .badge {
    font-size: 11px;
    letter-spacing: .15em;
    text-transform: uppercase;
    font-weight: 800;
    background: var(--ink);
    color: var(--page);
    padding: 4px 10px;
    border-radius: 4px;
  }
  h2 {
    font-size: 40px;
    margin: 0;
    font-weight: 800;
    letter-spacing: -.025em;
    line-height: 1;
  }
  .more {
    margin-left: auto;
    font-size: 13px;
    font-weight: 700;
    color: var(--accent);
  }
  .more::after { content: ' →'; }
  @media (max-width: 720px) { h2 { font-size: 30px; } }
</style>
```

- [ ] **Step 2: Write src/components/HighlightPhrase.astro**

Write `src/components/HighlightPhrase.astro`:
```astro
---
// Wraps a substring of `text` in a yellow highlighter <em>.
// If `phrase` is not in `text`, renders text unchanged.
interface Props { text: string; phrase: string; }
const { text, phrase } = Astro.props;
const idx = phrase && text.indexOf(phrase);
const split = idx !== undefined && idx >= 0;
const before = split ? text.slice(0, idx) : text;
const middle = split ? phrase : '';
const after = split ? text.slice(idx + phrase.length) : '';
---
{split ? (
  <>{before}<em class="hl">{middle}</em>{after}</>
) : (
  <>{text}</>
)}

<style>
  em.hl {
    background: var(--highlight);
    font-style: normal;
    font-weight: 700;
    padding: 0 3px;
  }
</style>
```

- [ ] **Step 3: Smoke-render both on the homepage**

Temporarily add to `src/pages/index.astro` just to verify rendering:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SectionHead from '../components/SectionHead.astro';
import HighlightPhrase from '../components/HighlightPhrase.astro';
---
<BaseLayout title="Dr. Frazier A. Smith — AI & IT Educator, Speaker, Researcher" current="home">
  <div class="container" style="padding-top: 60px; padding-bottom: 60px;">
    <SectionHead number="01" label="Sample" title="Section header preview" moreLabel="See all" moreHref="/" />
    <p style="font-size: 22px;">A test of <HighlightPhrase text="highlighted phrase rendering" phrase="highlighted phrase" /> in body text.</p>
  </div>
</BaseLayout>
```

- [ ] **Step 4: Verify in dev**

Run `npm run dev` and visit http://localhost:4321. Expect section header (numbered badge + h2 + "See all →") and a sentence with "highlighted phrase" wrapped in yellow.

- [ ] **Step 5: Commit**

```bash
git add src/components/SectionHead.astro src/components/HighlightPhrase.astro src/pages/index.astro
git commit -m "feat(components): add SectionHead and HighlightPhrase helpers"
```

---

## Task 8: Define content collection schemas

**Files:**
- Create: `src/content/config.ts`

- [ ] **Step 1: Write src/content/config.ts**

Write `src/content/config.ts`:
```typescript
import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      category: z.enum([
        'Instructional Design',
        'AI & Workforce',
        'Teaching',
        'Cloud & Infra',
        'Research',
        'Notes',
      ]),
      heroImage: image().optional(),
      draft: z.boolean().default(false),
    }),
});

const speakingTopics = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    audienceFit: z.string(),
    abstract: z.string(),
    formats: z.array(z.enum(['Keynote', 'Panel', 'Half-day workshop', 'Full-day workshop', 'Podcast guest', 'Webinar'])),
    takeaways: z.array(z.string()).min(1).max(5),
    featured: z.boolean().default(false),
    nsfFunded: z.boolean().default(false),
    order: z.number().default(99),
    tag: z.string(),
  }),
});

const testimonials = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    role: z.string(),
    quote: z.string(),
    highlightedPhrase: z.string().optional(),
    initials: z.string().regex(/^[A-Z]{1,3}$/, 'Initials must be 1–3 uppercase letters'),
    relationship: z.string().optional(),
    linkedInUrl: z.string().url().optional(),
    placeholder: z.boolean().default(false),
    order: z.number().default(99),
  }),
});

const talksGiven = defineCollection({
  type: 'data',
  schema: z.object({
    event: z.string(),
    date: z.coerce.date(),
    location: z.string().optional(),
    talkTitle: z.string(),
    format: z.enum(['Keynote', 'Panel', 'Workshop', 'Podcast', 'Webinar', 'Guest lecture']),
    slidesUrl: z.string().url().optional(),
    recordingUrl: z.string().url().optional(),
    eventUrl: z.string().url().optional(),
    upcoming: z.boolean().default(false),
  }),
});

const courses = defineCollection({
  type: 'content',
  schema: z.object({
    code: z.string(),
    title: z.string(),
    institution: z.enum(['Central Piedmont', 'UNC Charlotte', 'Wingate', 'Wake Tech', 'Wayne CC']),
    level: z.enum(['Associate', 'Bachelor', 'Graduate', 'Honors']),
    lastTaught: z.string(),
    description: z.string(),
    syllabusUrl: z.string().url().optional(),
    current: z.boolean().default(false),
  }),
});

const press = defineCollection({
  type: 'data',
  schema: z.object({
    kind: z.enum(['Podcast', 'News', 'Award', 'Talk']),
    title: z.string(),
    org: z.string().optional(),
    url: z.string().url().optional(),
    year: z.string().optional(),
    order: z.number().default(99),
  }),
});

const career = defineCollection({
  type: 'data',
  schema: z.object({
    years: z.string(),
    title: z.string(),
    org: z.string(),
    order: z.number(),
  }),
});

export const collections = { posts, speakingTopics, testimonials, talksGiven, courses, press, career };
```

- [ ] **Step 2: Verify schemas compile**

Run:
```bash
npm run typecheck
```
Expected: 0 errors. (Astro will tell you if any schema references a missing import.)

- [ ] **Step 3: Commit**

```bash
git add src/content/config.ts
git commit -m "feat(content): define Zod schemas for all content collections"
```

---

## Task 9: Seed press, career, and testimonials content

**Files:**
- Create: `src/content/press/live-from-south-college.yaml`, `src/content/press/nsf-ate-gait.yaml`, `src/content/press/devlearn-2016.yaml`
- Create: `src/content/career/*.yaml` (8 entries)
- Create: `src/content/testimonials/*.yaml` (4 placeholders)

- [ ] **Step 1: Write press entries**

Write `src/content/press/live-from-south-college.yaml`:
```yaml
kind: Podcast
title: Live from South College
org: South College
order: 1
```

Write `src/content/press/nsf-ate-gait.yaml`:
```yaml
kind: News
title: Central Piedmont's NSF ATE GAIT grant
org: NSF
order: 2
```

Write `src/content/press/devlearn-2016.yaml`:
```yaml
kind: Award
title: DevLearn Best in Show DemoFest
org: The Learning Guild
year: '2016'
order: 3
```

- [ ] **Step 2: Write career entries**

For each row below, create a file `src/content/career/<order>-<slug>.yaml`:

`src/content/career/1-fast-lane.yaml`:
```yaml
years: 2024–2025
title: Senior Manager of Solutions Engineering
org: Fast Lane US
order: 1
```

`src/content/career/2-broadcom.yaml`:
```yaml
years: 2023–2024
title: Leader, Content Development — VMware vSphere Foundation & Cloud Director
org: Broadcom
order: 2
```

`src/content/career/3-vmware-senior.yaml`:
```yaml
years: 2022–2023
title: Senior Manager, Technical Content Development
org: VMware
order: 3
```

`src/content/career/4-vmware-tcdm.yaml`:
```yaml
years: 2021–2022
title: Technical Content Development Manager — vSphere / VMware Cloud / HCX / SD-WAN
org: VMware
order: 4
```

`src/content/career/5-vmware-instructor.yaml`:
```yaml
years: 2020–2021
title: Senior Technical Instructor — Carbon Black & VMware on AWS Lead
org: VMware
order: 5
```

`src/content/career/6-anomali.yaml`:
```yaml
years: 2019–2020
title: Technical Trainer
org: Anomali
order: 6
```

`src/content/career/7-snapav.yaml`:
```yaml
years: 2018–2019
title: HR Training & Communications Manager
org: SnapAV
order: 7
```

`src/content/career/8-cpi.yaml`:
```yaml
years: 2015–2018
title: Mid-Level Manager, Instructional Design
org: CPI Security
order: 8
```

`src/content/career/9-belk.yaml`:
```yaml
years: 2014–2015
title: Program Manager, eLearning
org: Belk
order: 9
```

`src/content/career/10-wingate-edtech.yaml`:
```yaml
years: 2011–2013
title: Educational Technology Specialist
org: Wingate University
order: 10
```

- [ ] **Step 3: Write 4 placeholder testimonials**

`src/content/testimonials/01-organizer.yaml`:
```yaml
name: '[Conference Organizer]'
role: '[Role · Event year]'
quote: '[Conference organizer quote — 1–2 sentences on what attendees took away from your talk.]'
initials: 'CO'
placeholder: true
order: 1
```

`src/content/testimonials/02-partner.yaml`:
```yaml
name: '[Industry Partner]'
role: '[Role]'
quote: '[Industry partner or peer faculty quote — what working with you produced.]'
initials: 'IP'
placeholder: true
order: 2
```

`src/content/testimonials/03-student.yaml`:
```yaml
name: '[Student / Graduate]'
role: '[Program · Graduation year]'
quote: '[Student or graduate testimonial — what changed for them after your course or program.]'
initials: 'SG'
placeholder: true
order: 3
```

`src/content/testimonials/04-colleague.yaml`:
```yaml
name: '[Former Colleague]'
role: '[Company · Role]'
quote: '[Former VMware / Broadcom colleague or learner — 1 sentence on your impact.]'
initials: 'FC'
placeholder: true
order: 4
```

- [ ] **Step 4: Verify schemas accept the seed content**

Run:
```bash
npm run build
```
Expected: Build succeeds. If any schema mismatch, Astro reports the file and field with a clear error.

- [ ] **Step 5: Commit**

```bash
git add src/content/press/ src/content/career/ src/content/testimonials/
git commit -m "feat(content): seed press, career, and placeholder testimonials"
```

---

## Task 10: Seed 8 speaking topics

**Files:**
- Create: `src/content/speaking-topics/*.md` (8 files)

- [ ] **Step 1: Write the 8 speaking-topic files**

`src/content/speaking-topics/01-associate-degree-ai.md`:
```markdown
---
title: Building one of NC's first associate-degree AI programs
audienceFit: Higher-ed conferences, NSF program meetings, CTE policy summits
abstract: |
  How the NSF GAIT grant is shaping curriculum, transfer pathways, and industry partnerships at scale — what we got right, what we'd redo, and what other community colleges should steal.
formats: [Keynote, Panel, Half-day workshop]
takeaways:
  - The three biggest curriculum gaps when AI meets a community-college IT pathway
  - Industry-partnership structures that actually serve students (with Red Hat and Palo Alto as examples)
  - How to write transfer-friendly AI courses that bachelor's programs will accept
tag: 'Higher Ed · CTE'
order: 1
---

The full talk runs 45 minutes plus Q&A. The 25-minute version drops the case-study section.
```

`src/content/speaking-topics/02-entry-level-ai-workforce.md`:
```markdown
---
title: What AI is doing to the entry-level IT job — and what to teach instead
audienceFit: Workforce-board meetings, community-college conferences, instructional-design summits
abstract: |
  Field data and ongoing research on how generative AI is reshaping help desk, junior cloud, and analyst roles. Where the entry-level door is narrowing, where it's widening, and what curriculum has to change before the cohort graduates.
formats: [Keynote, Panel, Webinar]
takeaways:
  - Which entry-level IT tasks are already automated and which are next
  - What skills now matter more (and which credentials matter less)
  - How to redesign a foundational IT course in one semester
tag: 'Workforce · Research'
order: 2
---
```

`src/content/speaking-topics/03-pull-the-lever.md`:
```markdown
---
title: 'Would You Pull the Lever? Ethical dilemmas in the age of AI'
audienceFit: General-audience seminars, ethics symposia, AI literacy programs, Honors colleges
abstract: |
  An NSF-funded interactive seminar. The classic Trolley Problem becomes a frame for the real ethical decisions inside self-driving cars, autonomous systems, and AI-mediated work. The audience votes, debates, and walks out with a vocabulary for the hard cases.
formats: [Half-day workshop, Full-day workshop, Keynote]
takeaways:
  - A working frame for AI ethics that holds up after the workshop ends
  - Five live scenarios mapped from the Trolley Problem to current AI systems
  - How to run the workshop with your own audience
featured: true
nsfFunded: true
tag: 'Ethics · AI · Workshop'
order: 3
---

This workshop was developed under NSF ATE award #2500901.
```

`src/content/speaking-topics/04-llms-rag-agents-as-id-tools.md`:
```markdown
---
title: 'LLMs, RAG, and agentic development as instructional-design tools'
audienceFit: ID & L&D conferences, internal corporate L&D teams
abstract: |
  Practical workflows for instructional designers — beyond "ChatGPT writes my objectives." Concrete RAG patterns over course documents, agentic pipelines for course generation, and where the human still has to sit in the loop.
formats: [Half-day workshop, Webinar, Keynote]
takeaways:
  - Three repeatable RAG patterns for ID work
  - A working agentic workflow for course generation
  - The four places AI breaks ID quality (and the safeguards that catch it)
tag: 'Instructional Design'
order: 4
---
```

`src/content/speaking-topics/05-addie-to-agile.md`:
```markdown
---
title: 'Modernizing technical training: ADDIE to Agile at the speed of SaaS'
audienceFit: Enterprise L&D, training-content leaders
abstract: |
  Walks through the transformation we ran at VMware — moving a 16-course technical portfolio from waterfall ADDIE to a SAM-based, sprint-driven model — and what to copy, what to skip, and what failed quietly the first time.
formats: [Keynote, Webinar, Panel]
takeaways:
  - The minimum viable Agile-for-ID workflow
  - Three failure modes in the transition (and how to spot them early)
  - How to keep design quality from collapsing under sprint pressure
tag: 'L&D · Industry'
order: 5
---
```

`src/content/speaking-topics/06-industry-partnerships.md`:
```markdown
---
title: 'Industry partnerships that actually serve students'
audienceFit: Community-college leadership, workforce boards, corporate L&D
abstract: |
  Red Hat and Palo Alto Networks as case studies. How to structure a partnership that gives students real exposure without turning the curriculum into a vendor brochure.
formats: [Panel, Keynote, Webinar]
takeaways:
  - The four partnership structures we tried and which one stuck
  - Contract terms that protect curricular independence
  - What partners actually want in return (it's not what you think)
tag: 'Partnerships · CTE'
order: 6
---
```

`src/content/speaking-topics/07-xapi-learning-analytics.md`:
```markdown
---
title: 'xAPI and learning analytics for technical training programs'
audienceFit: L&D analytics teams, LMS administrators, community-college IT
abstract: |
  How we instrumented a community-college cybersecurity program with xAPI from labs and SCORM modules, what it told us, and how to start without a six-figure platform.
formats: [Half-day workshop, Webinar, Keynote]
takeaways:
  - A minimum xAPI stack you can stand up in a semester
  - Three analytics questions xAPI answers that grades don't
  - The award-winning Bluetooth-beacon xAPI module from my CPI Security days, dissected
tag: 'Analytics · L&D'
order: 7
---
```

`src/content/speaking-topics/08-music-to-server-room.md`:
```markdown
---
title: 'From the music classroom to the server room: an instructional design career through-line'
audienceFit: Career-transition events, ID community keynotes, educator gatherings
abstract: |
  A keynote on the through-line from music education to community-college department chair. What music ed teaches you about teaching, and why the move into technical training was less of a leap than it looked.
formats: [Keynote, Podcast guest]
takeaways:
  - The three pedagogical instincts music educators bring into tech
  - When the career change actually started (it's earlier than you'd guess)
  - One thing every educator should steal from professional musicians
tag: 'Career · Pedagogy'
order: 8
---
```

- [ ] **Step 2: Verify build accepts all 8**

Run:
```bash
npm run build
```
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/content/speaking-topics/
git commit -m "feat(content): seed 8 speaking topics"
```

---

## Task 11: Seed courses content

**Files:**
- Create: `src/content/courses/*.md` (8 files)

- [ ] **Step 1: Write course files**

`src/content/courses/cpcc-nos-120.md`:
```markdown
---
code: NOS-120
title: 'Linux/UNIX Single User'
institution: Central Piedmont
level: Associate
lastTaught: Spring 2026
description: Foundational Linux administration covering the shell, file system, permissions, package management, and scripting. Lab-driven.
current: true
---
```

`src/content/courses/cpcc-csc-214.md`:
```markdown
---
code: CSC-214
title: 'Data Structures'
institution: Central Piedmont
level: Associate
lastTaught: Spring 2026
description: Stacks, queues, lists, trees, hash tables, and graph algorithms — implemented in Python with an emphasis on real-world tradeoffs.
current: true
---
```

`src/content/courses/uncc-itis-3310.md`:
```markdown
---
code: ITIS 3310
title: 'Software Architecture and Design'
institution: UNC Charlotte
level: Bachelor
lastTaught: Spring 2026
description: Architectural patterns, design principles, and trade-off analysis for software-intensive systems.
current: true
---
```

`src/content/courses/uncc-cloud-analytics.md`:
```markdown
---
code: Graduate Seminar
title: 'Cloud Computing for Data Analytics'
institution: UNC Charlotte
level: Graduate
lastTaught: Spring 2026
description: Cloud-native architectures for analytics workloads on AWS, Azure, and Google Cloud — from data ingest to ML serving.
current: true
---
```

`src/content/courses/wingate-applied-innovation.md`:
```markdown
---
code: Honors
title: 'Applied Innovation (AI) for Honors'
institution: Wingate
level: Honors
lastTaught: Spring 2026
description: Co-taught honors seminar applying LLMs, RAG, and agentic AI to interdisciplinary student projects.
current: true
---
```

`src/content/courses/wingate-digital-wellness.md`:
```markdown
---
code: Honors
title: 'Digital Wellness & AI'
institution: Wingate
level: Honors
lastTaught: Fall 2025
description: Critical examination of how AI-mediated environments shape attention, agency, and well-being.
---
```

`src/content/courses/waketech-cti-110.md`:
```markdown
---
code: CTI-110
title: 'Web, Programming, and Database Foundation'
institution: Wake Tech
level: Associate
lastTaught: Fall 2025
description: Foundational web/programming/database course for IT pathway students.
---
```

`src/content/courses/waynecc-csc-214.md`:
```markdown
---
code: CSC-214
title: 'Data Structures'
institution: Wayne CC
level: Associate
lastTaught: Fall 2025
description: Data structures in Python with an applied lab focus.
---
```

- [ ] **Step 2: Verify build accepts all courses**

Run `npm run build`. Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/content/courses/
git commit -m "feat(content): seed course descriptions across 5 institutions"
```

---

## Task 12: Seed one blog post and one upcoming talk

**Files:**
- Create: `src/content/posts/2026-05-xapi-lab-stack.mdx`
- Create: `src/content/talks-given/.gitkeep`

- [ ] **Step 1: Write the first blog post**

Write `src/content/posts/2026-05-xapi-lab-stack.mdx`:
```mdx
---
title: 'What I learned standing up an xAPI lab system for a CC cybersecurity program'
description: Cost, infrastructure, and what we wish we'd known three months in.
pubDate: 2026-05-08
category: 'AI & Workforce'
draft: false
---

We rolled out an xAPI-instrumented lab pipeline for our cybersecurity program in March. Three months later, here's what's working, what isn't, and what I'd do differently.

## The setup

Every lab — physical or virtual — emits xAPI statements to a Learning Record Store via a small adapter we wrote. Statements include the lab attempt, completion state, time-on-task, and (where it makes sense) a rough quality signal pulled from the lab's own scoring.

## What worked

The single biggest win was not the analytics — it was that *every lab now has the same shape*. Faculty who used to grade in five different formats now look at one dashboard.

## What didn't

The LRS-side schema work took twice as long as the adapter work. I'd budget for it differently next time.

## What I'd do differently

Start with three statement types, not twelve. Add complexity only when a real question forces it.
```

- [ ] **Step 2: Create empty talks-given directory**

Run:
```bash
mkdir -p src/content/talks-given
touch src/content/talks-given/.gitkeep
```

- [ ] **Step 3: Build to verify**

Run `npm run build`. Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/content/posts/ src/content/talks-given/
git commit -m "feat(content): seed first blog post and create talks-given collection"
```

---

## Task 13: Copy headshot into src/assets and build Hero component

**Files:**
- Create: `src/assets/headshot.jpg`, `src/components/Hero.astro`

- [ ] **Step 1: Copy the headshot**

Run:
```bash
mkdir -p src/assets
cp FrazierSmithg2025-DLV-0129-9227-2-300x450.jpg src/assets/headshot.jpg
```

- [ ] **Step 2: Write src/components/Hero.astro**

Write `src/components/Hero.astro`:
```astro
---
import { Image } from 'astro:assets';
import HighlightPhrase from './HighlightPhrase.astro';
import headshot from '../assets/headshot.jpg';
---
<section class="hero">
  <div class="hero-text">
    <span class="eyebrow">Dept Chair · NSF Co-PI · ex-VMware</span>
    <h1>
      From music<br />
      classroom to<br />
      <span class="hl">AI lab.</span>
    </h1>
    <p class="lede">
      I lead the Network, Cybersecurity, and Cloud department at Central Piedmont.
      I help build one of NC's first associate-degree AI programs as co-PI on the
      NSF GAIT grant. And I speak about all of it.
    </p>

    <div class="research">
      <span class="pill">Current research</span>
      <span class="text">
        <HighlightPhrase
          text="How AI is reshaping entry-level IT work — and what community colleges should teach because of it."
          phrase="entry-level IT work"
        />
      </span>
    </div>

    <div class="ctas">
      <a href="/speaking#book" class="cta primary">Book me to speak →</a>
      <a href="/writing" class="cta ghost">Read recent writing</a>
    </div>

    <ul class="affil" aria-label="Affiliations">
      <li>Central Piedmont</li><li class="dot" aria-hidden="true"></li>
      <li>UNC Charlotte</li><li class="dot" aria-hidden="true"></li>
      <li>Wingate Honors</li><li class="dot" aria-hidden="true"></li>
      <li>NSF ATE GAIT</li>
    </ul>
  </div>

  <div class="portrait">
    <div class="img-wrap">
      <span class="stamp">
        <span class="top">Research focus</span>
        AI × Entry-Level Workforce
      </span>
      <Image src={headshot} alt="Dr. Frazier A. Smith" widths={[280, 420, 560]} sizes="(max-width: 720px) 220px, 320px" />
    </div>
    <div class="caption">Dr. Frazier A. <span class="accent">Smith</span></div>
  </div>
</section>

<style>
  .hero {
    padding: 70px var(--space-page-x);
    display: grid;
    grid-template-columns: 1.25fr 1fr;
    gap: 56px;
    align-items: center;
    position: relative;
    max-width: var(--container-max);
    margin: 0 auto;
  }
  .hero::before {
    content: '';
    position: absolute;
    top: 50px;
    right: 40px;
    width: 70px;
    height: 70px;
    background: var(--highlight);
    border-radius: 50%;
    opacity: .8;
    z-index: 0;
  }
  .hero::after {
    content: '';
    position: absolute;
    bottom: 30px;
    left: 55%;
    width: 60px;
    height: 60px;
    background: var(--accent);
    border-radius: 50%;
    opacity: .15;
    z-index: 0;
  }
  .hero-text { position: relative; z-index: 1; }

  .eyebrow {
    font-size: 11px;
    letter-spacing: .15em;
    text-transform: uppercase;
    margin-bottom: 18px;
    font-weight: 700;
    background: var(--ink);
    color: var(--page);
    display: inline-block;
    padding: 4px 10px;
    border-radius: 4px;
  }
  h1 {
    font-size: 60px;
    line-height: .96;
    margin: 0 0 22px;
    font-weight: 800;
    letter-spacing: -.035em;
  }
  h1 .hl { background: var(--highlight); padding: 0 6px; }
  .lede {
    font-size: 17px;
    line-height: 1.5;
    margin-bottom: 24px;
    font-weight: 500;
    color: var(--ink-2);
  }
  .research {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: var(--accent-soft);
    border: 2px solid var(--accent);
    border-radius: var(--radius-md);
    padding: 10px 14px;
    margin-bottom: 28px;
    max-width: 100%;
  }
  .research .pill {
    background: var(--accent);
    color: var(--page);
    font-size: 10px;
    font-weight: 800;
    padding: 3px 8px;
    border-radius: var(--radius-pill);
    letter-spacing: .08em;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .research .text {
    font-size: 13px;
    font-weight: 600;
    color: var(--accent-deep);
    line-height: 1.35;
  }
  .ctas { display: flex; gap: 10px; margin-bottom: 30px; flex-wrap: wrap; }
  .cta {
    padding: 13px 22px;
    border-radius: var(--radius-pill);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: .01em;
  }
  .cta.primary { background: var(--ink); color: var(--page); }
  .cta.ghost { background: transparent; border: 2px solid var(--ink); color: var(--ink); }

  .affil {
    display: flex;
    gap: 16px;
    font-size: 11px;
    color: var(--muted);
    flex-wrap: wrap;
    align-items: center;
    font-weight: 700;
    list-style: none;
  }
  .affil .dot { width: 4px; height: 4px; border-radius: 50%; background: var(--accent); }

  .portrait { position: relative; z-index: 1; max-width: 320px; justify-self: end; }
  .img-wrap {
    background: var(--accent);
    border: 2.5px solid var(--ink);
    border-radius: 14px;
    padding: 14px;
    box-shadow: var(--shadow-hero);
    position: relative;
  }
  .img-wrap img {
    display: block;
    width: 100%;
    border-radius: var(--radius-sm);
    border: 2px solid var(--ink);
    height: auto;
  }
  .stamp {
    position: absolute;
    top: -22px;
    right: -28px;
    background: var(--highlight);
    border: 2px solid var(--ink);
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 10px;
    font-weight: 800;
    line-height: 1.25;
    text-transform: uppercase;
    letter-spacing: .04em;
    transform: rotate(6deg);
    z-index: 2;
    max-width: 160px;
    text-align: center;
    box-shadow: 3px 3px 0 var(--ink);
  }
  .stamp .top {
    display: block;
    font-size: 8px;
    color: var(--accent);
    margin-bottom: 2px;
    letter-spacing: .12em;
  }
  .caption {
    background: var(--ink);
    color: var(--page);
    font-size: 11px;
    font-weight: 700;
    text-align: center;
    padding: 8px 12px;
    margin-top: 12px;
    border-radius: var(--radius-sm);
    letter-spacing: .04em;
  }
  .caption .accent { color: var(--accent-light); }

  @media (max-width: 860px) {
    .hero { grid-template-columns: 1fr; padding-top: 40px; padding-bottom: 40px; gap: 36px; }
    .portrait { justify-self: start; max-width: 240px; }
    h1 { font-size: 44px; }
  }
</style>
```

- [ ] **Step 3: Verify in dev**

Replace `src/pages/index.astro` body temporarily to test:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
---
<BaseLayout title="Dr. Frazier A. Smith — AI & IT Educator, Speaker, Researcher" current="home">
  <Hero />
</BaseLayout>
```

Run `npm run dev`. Visit http://localhost:4321. Expect: hero with portrait on right, framed in purple with yellow stamp, headline "From music classroom to AI lab." with yellow highlight, and all sub-elements.

- [ ] **Step 4: Commit**

```bash
git add src/assets/ src/components/Hero.astro src/pages/index.astro
git commit -m "feat(home): add Hero component with optimized headshot"
```

---

## Task 14: Build PressStrip component

**Files:**
- Create: `src/components/PressStrip.astro`

- [ ] **Step 1: Write src/components/PressStrip.astro**

Write `src/components/PressStrip.astro`:
```astro
---
import { getCollection } from 'astro:content';
const items = (await getCollection('press')).sort(
  (a, b) => a.data.order - b.data.order
);
---
<section class="press" aria-label="Featured in and on">
  <div class="inner">
    <div class="label">As featured<br/>in &amp; on</div>
    <ul class="items">
      {items.map((p) => (
        <li class="item">
          <span class="src">{p.data.kind}</span>
          <span>
            {p.data.url ? <a href={p.data.url} rel="noopener">{p.data.title}</a> : p.data.title}
            {p.data.year && <span class="badge-yr"> {p.data.year}</span>}
          </span>
        </li>
      ))}
    </ul>
  </div>
</section>

<style>
  .press {
    border-top: 2px solid var(--ink);
    border-bottom: 2px solid var(--ink);
    background: var(--card);
  }
  .inner {
    padding: 28px var(--space-page-x);
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 30px;
    align-items: center;
    max-width: var(--container-max);
    margin: 0 auto;
  }
  .label {
    font-size: 10px;
    letter-spacing: .14em;
    text-transform: uppercase;
    font-weight: 800;
    color: var(--accent);
    white-space: nowrap;
    line-height: 1.4;
  }
  .items {
    display: flex;
    gap: 30px;
    align-items: center;
    flex-wrap: wrap;
    list-style: none;
  }
  .item {
    font-size: 13px;
    font-weight: 700;
    color: var(--ink);
    display: flex;
    align-items: baseline;
    gap: 8px;
  }
  .item .src {
    font-size: 10px;
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: .08em;
  }
  .item .badge-yr {
    background: var(--highlight);
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 10px;
    margin-left: 4px;
  }
  @media (max-width: 720px) {
    .inner { grid-template-columns: 1fr; gap: 14px; padding-top: 22px; padding-bottom: 22px; }
    .items { gap: 16px; }
  }
</style>
```

- [ ] **Step 2: Add to homepage**

Edit `src/pages/index.astro` to include PressStrip below Hero:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import PressStrip from '../components/PressStrip.astro';
---
<BaseLayout title="Dr. Frazier A. Smith — AI & IT Educator, Speaker, Researcher" current="home">
  <Hero />
  <PressStrip />
</BaseLayout>
```

- [ ] **Step 3: Verify**

Run `npm run dev`. Visit http://localhost:4321. Press strip appears with three items pulled from collection.

- [ ] **Step 4: Commit**

```bash
git add src/components/PressStrip.astro src/pages/index.astro
git commit -m "feat(home): add PressStrip pulling from press collection"
```

---

## Task 15: Build SpeakingCard, SpeakerLogistics, and homepage Speaking section

**Files:**
- Create: `src/components/SpeakingCard.astro`, `src/components/SpeakerLogistics.astro`

- [ ] **Step 1: Write src/components/SpeakingCard.astro**

Write `src/components/SpeakingCard.astro`:
```astro
---
interface Props {
  tag: string;
  title: string;
  excerpt: string;
  featured?: boolean;
  nsfFunded?: boolean;
  href?: string;
}
const { tag, title, excerpt, featured = false, nsfFunded = false, href } = Astro.props;
const ContentEl = href ? 'a' : 'article';
---
<ContentEl class:list={['card', featured && 'featured']} href={href}>
  <span class="tag">
    {tag}
    {nsfFunded && <span class="nsf">NSF</span>}
  </span>
  <h3>{title}</h3>
  <p>{excerpt}</p>
</ContentEl>

<style>
  .card {
    display: block;
    background: var(--card);
    border: 2px solid var(--ink);
    border-radius: var(--radius-lg);
    padding: 24px;
    box-shadow: var(--shadow-card);
    color: var(--ink);
  }
  .card.featured { background: var(--highlight-soft); }
  a.card:hover { transform: translate(-1px, -1px); box-shadow: 5px 5px 0 var(--ink); transition: transform .12s, box-shadow .12s; }
  .tag {
    display: inline-block;
    font-size: 10px;
    letter-spacing: .12em;
    text-transform: uppercase;
    margin-bottom: 12px;
    font-weight: 800;
    color: var(--accent);
  }
  .nsf {
    display: inline-block;
    background: var(--ink);
    color: var(--highlight);
    font-size: 9px;
    font-weight: 800;
    padding: 2px 6px;
    border-radius: 3px;
    letter-spacing: .1em;
    margin-left: 6px;
    vertical-align: middle;
  }
  h3 {
    font-size: 19px;
    margin: 0 0 10px;
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: -.015em;
  }
  p { font-size: 13px; line-height: 1.55; margin: 0; color: #3a2c1a; }
</style>
```

- [ ] **Step 2: Write src/components/SpeakerLogistics.astro**

Write `src/components/SpeakerLogistics.astro`:
```astro
---
const formats = ['Keynote', 'Panel', 'Half-day workshop', 'Full-day workshop', 'Podcast guest', 'Webinar'];
---
<aside class="logistics">
  <div class="label">Available<br/>formats</div>
  <ul class="formats">
    {formats.map((f, i) => (
      <li class:list={['format', i === 0 && 'highlight']}>{f}</li>
    ))}
  </ul>
  <a href="/speaking#book" class="book-btn">Check availability →</a>
</aside>

<style>
  .logistics {
    background: var(--ink);
    color: var(--page);
    border-radius: var(--radius-lg);
    padding: 18px 24px;
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 24px;
    align-items: center;
  }
  .label {
    font-size: 10px;
    letter-spacing: .14em;
    text-transform: uppercase;
    font-weight: 800;
    color: var(--highlight);
    line-height: 1.4;
  }
  .formats { display: flex; gap: 8px; flex-wrap: wrap; list-style: none; }
  .format {
    font-size: 11px;
    font-weight: 700;
    padding: 5px 11px;
    border-radius: var(--radius-pill);
    background: #2c1e10;
    color: var(--page);
    border: 1px solid #3a2c1a;
  }
  .format.highlight { background: var(--accent); border-color: var(--accent); }
  .book-btn {
    background: var(--highlight);
    color: var(--ink);
    font-size: 12px;
    font-weight: 800;
    padding: 9px 16px;
    border-radius: var(--radius-pill);
    white-space: nowrap;
  }
  @media (max-width: 720px) {
    .logistics { grid-template-columns: 1fr; gap: 16px; }
    .book-btn { justify-self: start; }
  }
</style>
```

- [ ] **Step 3: Add a Speaking section component to wrap header + cards + logistics**

Write `src/components/HomeSpeaking.astro`:
```astro
---
import { getCollection } from 'astro:content';
import SectionHead from './SectionHead.astro';
import SpeakingCard from './SpeakingCard.astro';
import SpeakerLogistics from './SpeakerLogistics.astro';

const topics = (await getCollection('speakingTopics'))
  .sort((a, b) => a.data.order - b.data.order)
  .slice(0, 4);
---
<section class="section">
  <div class="inner">
    <SectionHead number="01" label="Speaking" title="Eight talks I give." moreLabel="See all topics" moreHref="/speaking" />
    <div class="grid">
      {topics.map((t) => (
        <SpeakingCard
          tag={t.data.tag}
          title={t.data.title}
          excerpt={t.body.split('\n').filter(Boolean).slice(0, 1).join(' ') || t.data.abstract.split('\n')[0]}
          featured={t.data.featured}
          nsfFunded={t.data.nsfFunded}
          href={`/speaking#${t.slug}`}
        />
      ))}
    </div>
    <SpeakerLogistics />
  </div>
</section>

<style>
  .section {
    padding: var(--space-section) 0;
    border-top: 2px solid var(--ink);
  }
  .inner {
    max-width: var(--container-max);
    margin: 0 auto;
    padding: 0 var(--space-page-x);
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 28px;
  }
  @media (max-width: 720px) { .grid { grid-template-columns: 1fr; } }
</style>
```

Note: the excerpt logic above grabs the first sentence of abstract for display. If you'd prefer a separate `excerpt` field in the schema, that's a follow-up — for now we derive from `abstract`.

- [ ] **Step 4: Wire into homepage**

Edit `src/pages/index.astro`:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import PressStrip from '../components/PressStrip.astro';
import HomeSpeaking from '../components/HomeSpeaking.astro';
---
<BaseLayout title="Dr. Frazier A. Smith — AI & IT Educator, Speaker, Researcher" current="home">
  <Hero />
  <PressStrip />
  <HomeSpeaking />
</BaseLayout>
```

- [ ] **Step 5: Verify and commit**

Run `npm run dev`. Homepage Speaking section should render 4 topic cards (PullTheLever yellow-tinted with NSF pill) + dark logistics row.

```bash
git add src/components/SpeakingCard.astro src/components/SpeakerLogistics.astro src/components/HomeSpeaking.astro src/pages/index.astro
git commit -m "feat(home): add Speaking section with topic cards and logistics row"
```

---

## Task 16: Build TestimonialCard and homepage Testimonials section

**Files:**
- Create: `src/components/TestimonialCard.astro`, `src/components/HomeTestimonials.astro`

- [ ] **Step 1: Write src/components/TestimonialCard.astro**

Write `src/components/TestimonialCard.astro`:
```astro
---
import HighlightPhrase from './HighlightPhrase.astro';

interface Props {
  name: string;
  role: string;
  quote: string;
  highlightedPhrase?: string;
  initials: string;
  placeholder?: boolean;
}
const { name, role, quote, highlightedPhrase, initials, placeholder = false } = Astro.props;
---
<figure class:list={['card', placeholder && 'placeholder']}>
  <span class="mark" aria-hidden="true">"</span>
  <blockquote class="quote">
    {highlightedPhrase ? <HighlightPhrase text={quote} phrase={highlightedPhrase} /> : quote}
  </blockquote>
  <figcaption class="attr">
    <span class="avatar">{initials}</span>
    <span class="who">
      <span class="name">{name}</span>
      <span class="role">{role}</span>
    </span>
  </figcaption>
</figure>

<style>
  .card {
    background: var(--card);
    border: 2px solid var(--ink);
    border-radius: var(--radius-lg);
    padding: 26px;
    position: relative;
    box-shadow: var(--shadow-card-accent);
  }
  .card.placeholder {
    background: #f5f4f1;
    border-style: dashed;
    box-shadow: none;
  }
  .mark {
    position: absolute;
    top: -2px;
    left: 18px;
    font-size: 56px;
    line-height: 1;
    color: var(--accent);
    font-weight: 800;
  }
  .quote {
    font-size: 14px;
    line-height: 1.55;
    font-weight: 500;
    color: var(--ink);
    margin: 22px 0 18px;
    letter-spacing: -.005em;
  }
  .card.placeholder .quote { color: var(--muted); font-style: italic; }
  .attr {
    display: flex;
    align-items: center;
    gap: 12px;
    border-top: 1.5px solid var(--ink);
    padding-top: 14px;
  }
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--accent);
    color: var(--page);
    border: 2px solid var(--ink);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 14px;
  }
  .card.placeholder .avatar { background: #d6d3d1; color: transparent; }
  .who { display: flex; flex-direction: column; }
  .name { font-size: 13px; font-weight: 800; line-height: 1.25; }
  .role { font-size: 11px; color: var(--muted); font-weight: 600; margin-top: 1px; }
</style>
```

- [ ] **Step 2: Write src/components/HomeTestimonials.astro**

Write `src/components/HomeTestimonials.astro`:
```astro
---
import { getCollection } from 'astro:content';
import SectionHead from './SectionHead.astro';
import TestimonialCard from './TestimonialCard.astro';

const tms = (await getCollection('testimonials'))
  .sort((a, b) => a.data.order - b.data.order)
  .slice(0, 4);
---
<section class="section">
  <div class="inner">
    <SectionHead number="02" label="Testimonials" title="What people say." />
    <div class="grid">
      {tms.map((t) => (
        <TestimonialCard
          name={t.data.name}
          role={t.data.role}
          quote={t.data.quote}
          highlightedPhrase={t.data.highlightedPhrase}
          initials={t.data.initials}
          placeholder={t.data.placeholder}
        />
      ))}
    </div>
  </div>
</section>

<style>
  .section { padding: var(--space-section) 0; border-top: 2px solid var(--ink); }
  .inner { max-width: var(--container-max); margin: 0 auto; padding: 0 var(--space-page-x); }
  .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }
  @media (max-width: 720px) { .grid { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 3: Wire into homepage and verify**

Edit `src/pages/index.astro`:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import PressStrip from '../components/PressStrip.astro';
import HomeSpeaking from '../components/HomeSpeaking.astro';
import HomeTestimonials from '../components/HomeTestimonials.astro';
---
<BaseLayout title="Dr. Frazier A. Smith — AI & IT Educator, Speaker, Researcher" current="home">
  <Hero />
  <PressStrip />
  <HomeSpeaking />
  <HomeTestimonials />
</BaseLayout>
```

Run `npm run dev`. Expect: 4 dashed placeholder testimonial cards in a 2×2 grid.

- [ ] **Step 4: Commit**

```bash
git add src/components/TestimonialCard.astro src/components/HomeTestimonials.astro src/pages/index.astro
git commit -m "feat(home): add Testimonials section with placeholder cards"
```

---

## Task 17: Build AboutBlock and homepage About section

**Files:**
- Create: `src/components/AboutBlock.astro`

- [ ] **Step 1: Write src/components/AboutBlock.astro**

Write `src/components/AboutBlock.astro`:
```astro
---
import { Image } from 'astro:assets';
import HighlightPhrase from './HighlightPhrase.astro';
import SectionHead from './SectionHead.astro';
import headshot from '../assets/headshot.jpg';
---
<section class="section">
  <div class="inner">
    <SectionHead number="03" label="About" title="Music classroom to AI lab." />
    <div class="about">
      <div class="photo">
        <div class="frame">
          <Image src={headshot} alt="Dr. Frazier A. Smith" widths={[280, 420, 560]} sizes="(max-width: 720px) 240px, 360px" />
        </div>
        <div class="badge">Wingate <span class="accent">→</span> VMware <span class="accent">→</span> Wingate</div>
      </div>
      <div class="text">
        <p>I started as a music education major at Wingate University. I came back to Wingate in 2026 as adjunct in the Honors program — only this time, I'm teaching applied AI.</p>
        <div class="pullquote">
          "The arc from Wingate undergrad to VMware senior manager to community college <HighlightPhrase text="department chair" phrase="department chair" /> is the whole story."
        </div>
        <p>In between: a decade of instructional design work at Belk, CPI Security, SnapAV, Anomali, and Carbon Black; senior leadership at VMware and Broadcom shipping training to working engineers; and now leadership of a 3-pathway IT department in Charlotte.</p>
        <p><a class="more" href="/about">Read the full story →</a></p>
      </div>
    </div>
  </div>
</section>

<style>
  .section { padding: var(--space-section) 0; border-top: 2px solid var(--ink); }
  .inner { max-width: var(--container-max); margin: 0 auto; padding: 0 var(--space-page-x); }
  .about { display: grid; grid-template-columns: 360px 1fr; gap: 50px; align-items: start; }
  .photo { position: relative; }
  .frame {
    background: var(--highlight);
    border: 2.5px solid var(--ink);
    padding: 16px;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-about);
  }
  .frame img {
    display: block;
    width: 100%;
    border-radius: var(--radius-sm);
    border: 2px solid var(--ink);
    height: auto;
  }
  .badge {
    position: absolute;
    bottom: -18px;
    left: 30px;
    background: var(--ink);
    color: var(--page);
    font-size: 11px;
    font-weight: 800;
    padding: 8px 14px;
    border-radius: var(--radius-pill);
    letter-spacing: .06em;
    text-transform: uppercase;
  }
  .badge .accent { color: var(--accent-light); }
  .text p { font-size: 16px; line-height: 1.65; margin: 0 0 14px; color: var(--ink-2); }
  .pullquote {
    font-size: 22px;
    font-weight: 800;
    line-height: 1.25;
    padding: 18px 0;
    border-top: 2px solid var(--ink);
    border-bottom: 2px solid var(--ink);
    margin: 20px 0;
    letter-spacing: -.015em;
  }
  .more { color: var(--accent); font-weight: 700; }
  @media (max-width: 860px) {
    .about { grid-template-columns: 1fr; gap: 36px; }
    .photo { max-width: 320px; }
  }
</style>
```

- [ ] **Step 2: Wire into homepage and verify**

Edit `src/pages/index.astro` — add `import AboutBlock` and place after Testimonials:
```astro
import AboutBlock from '../components/AboutBlock.astro';
```
And in the body:
```astro
<HomeTestimonials />
<AboutBlock />
```

Run `npm run dev`. About section appears with yellow-framed photo, purple drop shadow, "Wingate → VMware → Wingate" badge, and pullquote.

- [ ] **Step 3: Commit**

```bash
git add src/components/AboutBlock.astro src/pages/index.astro
git commit -m "feat(home): add About section with framed portrait and pullquote"
```

---

## Task 18: Build PostRow and homepage Writing section

**Files:**
- Create: `src/components/PostRow.astro`, `src/components/HomeWriting.astro`

- [ ] **Step 1: Write src/components/PostRow.astro**

Write `src/components/PostRow.astro`:
```astro
---
interface Props {
  date: string;
  title: string;
  description: string;
  href: string;
  readingMin: number;
}
const { date, title, description, href, readingMin } = Astro.props;
---
<a class="row" href={href}>
  <span class="date">{date}</span>
  <span class="body">
    <h4>{title}</h4>
    <p>{description}</p>
  </span>
  <span class="read">{readingMin} min</span>
</a>

<style>
  .row {
    padding: 22px 24px;
    display: grid;
    grid-template-columns: 100px 1fr auto;
    gap: 24px;
    align-items: center;
    border-bottom: 1.5px solid var(--ink);
    color: var(--ink);
  }
  .row:last-child { border-bottom: none; }
  .row:hover { background: var(--page); }
  .date {
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .08em;
  }
  h4 {
    font-size: 17px;
    margin: 0 0 4px;
    font-weight: 700;
    letter-spacing: -.01em;
  }
  p { font-size: 13px; margin: 0; color: var(--muted); }
  .read {
    font-size: 11px;
    font-weight: 700;
    color: var(--accent);
  }
  .read::after { content: ' →'; }
  @media (max-width: 720px) {
    .row { grid-template-columns: 1fr; gap: 6px; }
    .read { justify-self: start; }
  }
</style>
```

- [ ] **Step 2: Write src/components/HomeWriting.astro**

Write `src/components/HomeWriting.astro`:
```astro
---
import { getCollection } from 'astro:content';
import SectionHead from './SectionHead.astro';
import PostRow from './PostRow.astro';

function readingMinutes(body: string) {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}
function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

const posts = (await getCollection('posts', ({ data }) => !data.draft))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
  .slice(0, 3);
---
<section class="section">
  <div class="inner">
    <SectionHead number="04" label="Writing" title="Recent posts." moreLabel="All writing" moreHref="/writing" />
    {posts.length === 0 ? (
      <p class="empty">First post coming soon. <a href="/rss.xml">Subscribe via RSS</a> to be notified.</p>
    ) : (
      <div class="list">
        {posts.map((p) => (
          <PostRow
            date={formatDate(p.data.pubDate)}
            title={p.data.title}
            description={p.data.description}
            href={`/writing/${p.slug}`}
            readingMin={readingMinutes(p.body)}
          />
        ))}
      </div>
    )}
  </div>
</section>

<style>
  .section { padding: var(--space-section) 0; border-top: 2px solid var(--ink); }
  .inner { max-width: var(--container-max); margin: 0 auto; padding: 0 var(--space-page-x); }
  .list {
    background: var(--card);
    border: 2px solid var(--ink);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
  .empty {
    padding: 32px 24px;
    background: var(--card);
    border: 2px dashed var(--ink);
    border-radius: var(--radius-lg);
    text-align: center;
    color: var(--muted);
  }
  .empty a { color: var(--accent); text-decoration: underline; }
</style>
```

- [ ] **Step 3: Add to homepage and verify**

Edit `src/pages/index.astro` — add import and use after AboutBlock:
```astro
import HomeWriting from '../components/HomeWriting.astro';
```
```astro
<AboutBlock />
<HomeWriting />
```

Run `npm run dev`. Expect: Writing section with one post row (the xAPI lab post seeded earlier).

- [ ] **Step 4: Commit**

```bash
git add src/components/PostRow.astro src/components/HomeWriting.astro src/pages/index.astro
git commit -m "feat(home): add Writing section pulling latest posts"
```

---

## Task 19: Build InstitutionCard and homepage Teaching section

**Files:**
- Create: `src/components/InstitutionCard.astro`, `src/components/HomeTeaching.astro`

- [ ] **Step 1: Write src/components/InstitutionCard.astro**

Write `src/components/InstitutionCard.astro`:
```astro
---
interface Props {
  name: string;
  role: string;
  courses: string[];
}
const { name, role, courses } = Astro.props;
---
<article class="inst">
  <div class="name">{name}</div>
  <div class="role">{role}</div>
  <ul class="courses">
    {courses.map((c) => <li>{c}</li>)}
  </ul>
</article>

<style>
  .inst {
    background: var(--card);
    border: 2px solid var(--ink);
    border-radius: var(--radius-lg);
    padding: 22px;
    box-shadow: var(--shadow-card);
  }
  .name { font-size: 16px; font-weight: 800; margin-bottom: 4px; letter-spacing: -.01em; }
  .role {
    font-size: 11px;
    font-weight: 700;
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: .08em;
    margin-bottom: 14px;
  }
  .courses { list-style: none; font-size: 12px; line-height: 1.6; color: var(--ink-2); }
  .courses li { margin-bottom: 3px; font-weight: 600; }
  .courses li::before { content: '✦ '; color: var(--accent); }
</style>
```

- [ ] **Step 2: Write src/components/HomeTeaching.astro**

Write `src/components/HomeTeaching.astro`:
```astro
---
import { getCollection } from 'astro:content';
import SectionHead from './SectionHead.astro';
import InstitutionCard from './InstitutionCard.astro';

const allCurrent = (await getCollection('courses', ({ data }) => data.current));
const groupedByInst = allCurrent.reduce<Record<string, string[]>>((acc, c) => {
  const key = c.data.institution;
  (acc[key] ||= []).push(`${c.data.code !== c.data.institution ? c.data.code + ' ' : ''}${c.data.title}`);
  return acc;
}, {});

const roleMap: Record<string, string> = {
  'Central Piedmont': 'Dept Chair · Instructor',
  'UNC Charlotte': 'Graduate Faculty',
  Wingate: 'Adjunct · Honors',
  'Wake Tech': 'Adjunct',
  'Wayne CC': 'Adjunct',
};
const institutions: Array<{ name: string; role: string; courses: string[] }> = [
  'Central Piedmont',
  'UNC Charlotte',
  'Wingate',
].map((name) => ({
  name,
  role: roleMap[name],
  courses: groupedByInst[name] ?? [],
}));
---
<section class="section">
  <div class="inner">
    <SectionHead number="05" label="Teaching" title="Where I teach." moreLabel="All courses" moreHref="/teaching" />
    <div class="grid">
      {institutions.map((i) => (
        <InstitutionCard name={i.name} role={i.role} courses={i.courses} />
      ))}
    </div>
  </div>
</section>

<style>
  .section { padding: var(--space-section) 0; border-top: 2px solid var(--ink); }
  .inner { max-width: var(--container-max); margin: 0 auto; padding: 0 var(--space-page-x); }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  @media (max-width: 720px) { .grid { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 3: Wire into homepage and verify**

Edit `src/pages/index.astro`:
```astro
import HomeTeaching from '../components/HomeTeaching.astro';
```
```astro
<HomeWriting />
<HomeTeaching />
```

Run `npm run dev`. Expect: Teaching section with 3 institution cards.

- [ ] **Step 4: Commit**

```bash
git add src/components/InstitutionCard.astro src/components/HomeTeaching.astro src/pages/index.astro
git commit -m "feat(home): add Teaching section grouping current courses by institution"
```

---

## Task 20: Build /speaking page

**Files:**
- Create: `src/pages/speaking.astro`

- [ ] **Step 1: Write src/pages/speaking.astro**

Write `src/pages/speaking.astro`:
```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import SectionHead from '../components/SectionHead.astro';
import SpeakerLogistics from '../components/SpeakerLogistics.astro';

const topics = (await getCollection('speakingTopics'))
  .sort((a, b) => a.data.order - b.data.order);
---
<BaseLayout title="Speaking — Dr. Frazier Smith" current="speaking">
  <header class="page-header">
    <div class="container">
      <span class="kicker">Speaking</span>
      <h1>Talks I give.</h1>
      <p class="lede">Eight topics covering AI in the classroom, the entry-level workforce, instructional design, and what enterprise L&amp;D and community colleges can teach each other. Each runs as keynote, panel, or workshop format depending on your event.</p>
    </div>
  </header>

  <section class="container topics">
    {topics.map((t) => (
      <article id={t.slug} class:list={['topic', t.data.featured && 'featured']}>
        <div class="meta">
          <span class="tag">{t.data.tag}{t.data.nsfFunded && <span class="nsf">NSF</span>}</span>
          <h2>{t.data.title}</h2>
        </div>
        <p class="abstract">{t.data.abstract}</p>
        <div class="grid">
          <div>
            <h3>Audience fit</h3>
            <p>{t.data.audienceFit}</p>
          </div>
          <div>
            <h3>Available formats</h3>
            <ul class="formats">
              {t.data.formats.map((f) => <li>{f}</li>)}
            </ul>
          </div>
          <div>
            <h3>You'll walk away with</h3>
            <ul class="takeaways">
              {t.data.takeaways.map((tk) => <li>{tk}</li>)}
            </ul>
          </div>
        </div>
      </article>
    ))}
  </section>

  <section class="container logistics-wrap">
    <SpeakerLogistics />
  </section>

  <section id="book" class="container booking-wrap">
    <SectionHead number="✦" label="Book" title="Inquire about a date." />
    <div class="form-placeholder">
      <p>Form goes here in a later task — installs in Task 24.</p>
    </div>
  </section>
</BaseLayout>

<style>
  .container { max-width: var(--container-max); margin: 0 auto; padding-left: var(--space-page-x); padding-right: var(--space-page-x); }
  .page-header { padding: 70px 0 40px; border-bottom: 2px solid var(--ink); }
  .kicker {
    font-size: 11px;
    letter-spacing: .15em;
    text-transform: uppercase;
    font-weight: 800;
    background: var(--ink);
    color: var(--page);
    padding: 4px 10px;
    border-radius: 4px;
  }
  .page-header h1 { font-size: 60px; line-height: 1; margin: 18px 0 18px; font-weight: 800; letter-spacing: -.035em; }
  .page-header .lede { font-size: 17px; line-height: 1.55; max-width: 70ch; color: var(--ink-2); }

  .topics { padding-top: 50px; padding-bottom: 30px; display: grid; gap: 40px; }
  .topic {
    background: var(--card);
    border: 2px solid var(--ink);
    border-radius: var(--radius-lg);
    padding: 30px;
    box-shadow: var(--shadow-card);
  }
  .topic.featured { background: var(--highlight-soft); }
  .tag {
    display: inline-block;
    font-size: 10px;
    letter-spacing: .12em;
    text-transform: uppercase;
    margin-bottom: 12px;
    font-weight: 800;
    color: var(--accent);
  }
  .nsf {
    display: inline-block;
    background: var(--ink);
    color: var(--highlight);
    font-size: 9px;
    font-weight: 800;
    padding: 2px 6px;
    border-radius: 3px;
    letter-spacing: .1em;
    margin-left: 6px;
    vertical-align: middle;
  }
  h2 { font-size: 28px; margin: 0 0 14px; font-weight: 800; letter-spacing: -.02em; line-height: 1.1; }
  .abstract { font-size: 16px; line-height: 1.6; color: var(--ink-2); margin-bottom: 22px; }
  .grid { display: grid; grid-template-columns: 1.2fr 1fr 1.6fr; gap: 28px; padding-top: 18px; border-top: 1.5px solid var(--ink); }
  .grid h3 { font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: var(--accent); margin-bottom: 8px; }
  .grid p, .grid li { font-size: 14px; line-height: 1.55; color: var(--ink-2); }
  .formats, .takeaways { list-style: none; }
  .formats li, .takeaways li { padding-left: 16px; position: relative; margin-bottom: 4px; }
  .formats li::before, .takeaways li::before { content: '◆'; color: var(--accent); position: absolute; left: 0; top: 0; font-size: 10px; }
  .logistics-wrap { padding-top: 20px; padding-bottom: 40px; }
  .booking-wrap { padding-top: 30px; padding-bottom: 80px; }
  .form-placeholder {
    padding: 36px;
    border: 2px dashed var(--ink);
    border-radius: var(--radius-lg);
    background: var(--card);
    text-align: center;
    color: var(--muted);
  }
  @media (max-width: 720px) {
    .page-header h1 { font-size: 40px; }
    .grid { grid-template-columns: 1fr; gap: 20px; }
  }
</style>
```

- [ ] **Step 2: Verify**

Run `npm run dev`. Visit http://localhost:4321/speaking. Expect: page header, 8 expanded topic cards (Pull-the-Lever yellow), logistics row, booking-form placeholder.

- [ ] **Step 3: Commit**

```bash
git add src/pages/speaking.astro
git commit -m "feat(speaking): build /speaking page with expanded topic cards"
```

---

## Task 21: Build /writing index and [...slug] post page + RSS feed

**Files:**
- Create: `src/pages/writing/index.astro`, `src/pages/writing/[...slug].astro`, `src/layouts/PostLayout.astro`, `src/pages/rss.xml.ts`

- [ ] **Step 1: Write src/layouts/PostLayout.astro**

Write `src/layouts/PostLayout.astro`:
```astro
---
import BaseLayout from './BaseLayout.astro';

interface Props {
  title: string;
  description: string;
  pubDate: Date;
  category: string;
  readingMin: number;
}
const { title, description, pubDate, category, readingMin } = Astro.props;
const dateStr = pubDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
---
<BaseLayout title={`${title} — Frazier Smith`} description={description} current="writing">
  <article class="post container">
    <header class="post-header">
      <a class="back" href="/writing">← All writing</a>
      <span class="cat">{category}</span>
      <h1>{title}</h1>
      <div class="meta">
        <time datetime={pubDate.toISOString()}>{dateStr}</time>
        <span aria-hidden="true">·</span>
        <span>{readingMin} min read</span>
      </div>
    </header>
    <div class="prose">
      <slot />
    </div>
    <footer class="post-footer">
      <p><strong>Written by Frazier Smith.</strong> Department chair at Central Piedmont, NSF co-PI, and AI &amp; IT educator. <a href="/about">More about me →</a></p>
    </footer>
  </article>
</BaseLayout>

<style>
  .container { max-width: 800px; margin: 0 auto; padding: 60px var(--space-page-x); }
  .post-header { margin-bottom: 40px; }
  .back { font-size: 13px; color: var(--accent); font-weight: 700; }
  .cat {
    display: inline-block;
    margin: 22px 0 14px;
    font-size: 11px;
    letter-spacing: .12em;
    text-transform: uppercase;
    font-weight: 800;
    color: var(--accent);
  }
  h1 { font-size: 48px; line-height: 1.05; font-weight: 800; letter-spacing: -.03em; margin-bottom: 14px; }
  .meta { font-size: 13px; color: var(--muted); display: flex; gap: 8px; font-weight: 600; }
  .post-footer {
    margin-top: 60px;
    padding-top: 24px;
    border-top: 2px solid var(--ink);
    font-size: 14px;
    color: var(--ink-2);
  }
  .post-footer a { color: var(--accent); font-weight: 700; }
  @media (max-width: 720px) { h1 { font-size: 32px; } }
</style>
```

- [ ] **Step 2: Write src/pages/writing/[...slug].astro**

Write `src/pages/writing/[...slug].astro`:
```astro
---
import { getCollection, type CollectionEntry } from 'astro:content';
import PostLayout from '../../layouts/PostLayout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

interface Props { post: CollectionEntry<'posts'>; }
const { post } = Astro.props;
const { Content } = await post.render();

const words = post.body.trim().split(/\s+/).length;
const readingMin = Math.max(1, Math.round(words / 220));
---
<PostLayout
  title={post.data.title}
  description={post.data.description}
  pubDate={post.data.pubDate}
  category={post.data.category}
  readingMin={readingMin}
>
  <Content />
</PostLayout>
```

- [ ] **Step 3: Write src/pages/writing/index.astro**

Write `src/pages/writing/index.astro`:
```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostRow from '../../components/PostRow.astro';

const posts = (await getCollection('posts', ({ data }) => !data.draft))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
function readingMin(body: string) {
  return Math.max(1, Math.round(body.trim().split(/\s+/).length / 220));
}
---
<BaseLayout title="Writing — Frazier Smith" current="writing">
  <header class="page-header">
    <div class="container">
      <span class="kicker">Writing</span>
      <h1>Notes from the field.</h1>
      <p class="lede">Long-form posts on AI in the classroom, instructional design, and what enterprise L&amp;D and community colleges have to teach each other.</p>
      <a href="/rss.xml" class="rss">Subscribe via RSS</a>
    </div>
  </header>

  <section class="container list-wrap">
    {posts.length === 0 ? (
      <p class="empty">First post coming soon. <a href="/rss.xml">Subscribe via RSS</a> to be notified.</p>
    ) : (
      <div class="list">
        {posts.map((p) => (
          <PostRow
            date={formatDate(p.data.pubDate)}
            title={p.data.title}
            description={p.data.description}
            href={`/writing/${p.slug}`}
            readingMin={readingMin(p.body)}
          />
        ))}
      </div>
    )}
  </section>
</BaseLayout>

<style>
  .container { max-width: var(--container-max); margin: 0 auto; padding-left: var(--space-page-x); padding-right: var(--space-page-x); }
  .page-header { padding: 70px 0 40px; border-bottom: 2px solid var(--ink); }
  .kicker {
    font-size: 11px;
    letter-spacing: .15em;
    text-transform: uppercase;
    font-weight: 800;
    background: var(--ink);
    color: var(--page);
    padding: 4px 10px;
    border-radius: 4px;
  }
  h1 { font-size: 60px; line-height: 1; margin: 18px 0 18px; font-weight: 800; letter-spacing: -.035em; }
  .lede { font-size: 17px; line-height: 1.55; max-width: 70ch; color: var(--ink-2); margin-bottom: 18px; }
  .rss { font-size: 13px; color: var(--accent); font-weight: 700; }
  .rss::after { content: ' ↗'; }
  .list-wrap { padding: 50px 0 80px; }
  .list {
    background: var(--card);
    border: 2px solid var(--ink);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
  .empty {
    padding: 32px 24px;
    background: var(--card);
    border: 2px dashed var(--ink);
    border-radius: var(--radius-lg);
    text-align: center;
    color: var(--muted);
  }
  @media (max-width: 720px) { h1 { font-size: 40px; } }
</style>
```

- [ ] **Step 4: Write src/pages/rss.xml.ts**

Write `src/pages/rss.xml.ts`:
```typescript
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return rss({
    title: 'Frazier Smith — Writing',
    description: 'Long-form posts on AI in the classroom, instructional design, and CTE workforce.',
    site: context.site!,
    items: posts
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
      .map((p) => ({
        title: p.data.title,
        pubDate: p.data.pubDate,
        description: p.data.description,
        link: `/writing/${p.slug}/`,
        categories: [p.data.category],
      })),
    customData: '<language>en-us</language>',
  });
}
```

- [ ] **Step 5: Verify and commit**

Run `npm run dev` and visit:
- http://localhost:4321/writing → list with 1 post
- http://localhost:4321/writing/2026-05-xapi-lab-stack → full post in prose style
- http://localhost:4321/rss.xml → valid XML

```bash
git add src/layouts/PostLayout.astro src/pages/writing/ src/pages/rss.xml.ts
git commit -m "feat(writing): add writing index, single-post page, and RSS feed"
```

---

## Task 22: Build /talks, /teaching, /about, and 404 pages

**Files:**
- Create: `src/pages/talks.astro`, `src/pages/teaching.astro`, `src/pages/about.astro`, `src/pages/404.astro`

- [ ] **Step 1: Write src/pages/talks.astro**

Write `src/pages/talks.astro`:
```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';

const all = await getCollection('talksGiven');
const sorted = all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
const upcoming = sorted.filter((t) => t.data.upcoming);
const past = sorted.filter((t) => !t.data.upcoming);

function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
---
<BaseLayout title="Talks — Frazier Smith" current="talks">
  <header class="page-header">
    <div class="container">
      <span class="kicker">Talks</span>
      <h1>Where I've spoken.</h1>
      <p class="lede">Past and upcoming appearances — conferences, panels, podcasts, and workshops.</p>
    </div>
  </header>

  <section class="container list-wrap">
    {upcoming.length > 0 && (
      <>
        <h2 class="group">Upcoming</h2>
        <ul class="list">
          {upcoming.map((t) => (
            <li class="row">
              <span class="date">{formatDate(t.data.date)} <span class="up">Upcoming</span></span>
              <div>
                <strong>{t.data.event}</strong> {t.data.location && <span class="loc">· {t.data.location}</span>}
                <div class="title">{t.data.talkTitle}</div>
              </div>
              <span class="fmt">{t.data.format}</span>
            </li>
          ))}
        </ul>
      </>
    )}

    {past.length > 0 ? (
      <>
        <h2 class="group">Past</h2>
        <ul class="list">
          {past.map((t) => (
            <li class="row">
              <span class="date">{formatDate(t.data.date)}</span>
              <div>
                <strong>{t.data.event}</strong> {t.data.location && <span class="loc">· {t.data.location}</span>}
                <div class="title">{t.data.talkTitle}</div>
                <div class="links">
                  {t.data.slidesUrl && <a href={t.data.slidesUrl}>Slides</a>}
                  {t.data.recordingUrl && <a href={t.data.recordingUrl}>Recording</a>}
                  {t.data.eventUrl && <a href={t.data.eventUrl}>Event</a>}
                </div>
              </div>
              <span class="fmt">{t.data.format}</span>
            </li>
          ))}
        </ul>
      </>
    ) : (
      upcoming.length === 0 && (
        <p class="empty">More to come — currently booking 2026. <a href="/speaking#book">Inquire about an event →</a></p>
      )
    )}
  </section>
</BaseLayout>

<style>
  .container { max-width: var(--container-max); margin: 0 auto; padding-left: var(--space-page-x); padding-right: var(--space-page-x); }
  .page-header { padding: 70px 0 40px; border-bottom: 2px solid var(--ink); }
  .kicker { font-size: 11px; letter-spacing: .15em; text-transform: uppercase; font-weight: 800; background: var(--ink); color: var(--page); padding: 4px 10px; border-radius: 4px; }
  h1 { font-size: 60px; line-height: 1; margin: 18px 0 18px; font-weight: 800; letter-spacing: -.035em; }
  .lede { font-size: 17px; line-height: 1.55; max-width: 70ch; color: var(--ink-2); }
  .list-wrap { padding: 50px 0 80px; }
  .group { font-size: 14px; letter-spacing: .14em; text-transform: uppercase; color: var(--accent); margin: 30px 0 16px; font-weight: 800; }
  .list { list-style: none; background: var(--card); border: 2px solid var(--ink); border-radius: var(--radius-lg); overflow: hidden; }
  .row { padding: 20px 24px; display: grid; grid-template-columns: 200px 1fr auto; gap: 18px; align-items: start; border-bottom: 1.5px solid var(--ink); }
  .row:last-child { border-bottom: none; }
  .date { font-size: 13px; font-weight: 800; }
  .up { display: inline-block; margin-left: 6px; background: var(--highlight); padding: 1px 6px; border-radius: 3px; font-size: 10px; letter-spacing: .1em; }
  .loc { color: var(--muted); font-weight: 500; }
  .title { font-size: 14px; color: var(--ink-2); margin-top: 2px; }
  .links { margin-top: 8px; display: flex; gap: 14px; font-size: 12px; font-weight: 700; }
  .links a { color: var(--accent); }
  .fmt { font-size: 11px; font-weight: 800; color: var(--accent); text-transform: uppercase; letter-spacing: .08em; }
  .empty { padding: 32px 24px; background: var(--card); border: 2px dashed var(--ink); border-radius: var(--radius-lg); text-align: center; color: var(--muted); }
  .empty a { color: var(--accent); font-weight: 700; }
  @media (max-width: 720px) {
    h1 { font-size: 40px; }
    .row { grid-template-columns: 1fr; gap: 6px; }
  }
</style>
```

- [ ] **Step 2: Write src/pages/teaching.astro**

Write `src/pages/teaching.astro`:
```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';

const all = await getCollection('courses');
const grouped = all.reduce<Record<string, typeof all>>((acc, c) => {
  (acc[c.data.institution] ||= []).push(c);
  return acc;
}, {});

const institutionsOrder = ['Central Piedmont', 'UNC Charlotte', 'Wingate', 'Wake Tech', 'Wayne CC'];
---
<BaseLayout title="Teaching — Frazier Smith" current="teaching">
  <header class="page-header">
    <div class="container">
      <span class="kicker">Teaching</span>
      <h1>Courses across five institutions.</h1>
      <p class="lede">From foundational Linux to graduate cloud computing for analytics — what I'm currently teaching and what I've taught recently.</p>
    </div>
  </header>

  <section class="container teach-wrap">
    {institutionsOrder.map((name) => grouped[name] && (
      <article class="inst">
        <h2>{name}</h2>
        <ul class="courses">
          {grouped[name].sort((a, b) => Number(b.data.current) - Number(a.data.current)).map((c) => (
            <li>
              <div class="head">
                <strong>{c.data.code !== c.data.institution ? `${c.data.code} · ` : ''}{c.data.title}</strong>
                {c.data.current && <span class="pill">Currently teaching</span>}
                <span class="level">{c.data.level}</span>
              </div>
              <p class="desc">{c.data.description}</p>
              <div class="meta">
                <span>Last taught: {c.data.lastTaught}</span>
                {c.data.syllabusUrl && <a href={c.data.syllabusUrl}>Syllabus →</a>}
              </div>
            </li>
          ))}
        </ul>
      </article>
    ))}
  </section>
</BaseLayout>

<style>
  .container { max-width: var(--container-max); margin: 0 auto; padding-left: var(--space-page-x); padding-right: var(--space-page-x); }
  .page-header { padding: 70px 0 40px; border-bottom: 2px solid var(--ink); }
  .kicker { font-size: 11px; letter-spacing: .15em; text-transform: uppercase; font-weight: 800; background: var(--ink); color: var(--page); padding: 4px 10px; border-radius: 4px; }
  h1 { font-size: 60px; line-height: 1; margin: 18px 0 18px; font-weight: 800; letter-spacing: -.035em; }
  .lede { font-size: 17px; line-height: 1.55; max-width: 70ch; color: var(--ink-2); }
  .teach-wrap { padding: 50px 0 80px; display: grid; gap: 40px; }
  .inst { background: var(--card); border: 2px solid var(--ink); border-radius: var(--radius-lg); padding: 28px; box-shadow: var(--shadow-card); }
  h2 { font-size: 24px; margin: 0 0 18px; font-weight: 800; letter-spacing: -.02em; }
  .courses { list-style: none; display: grid; gap: 20px; }
  .head { display: flex; gap: 10px; flex-wrap: wrap; align-items: baseline; }
  .pill { background: var(--accent); color: var(--page); font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: var(--radius-pill); letter-spacing: .08em; text-transform: uppercase; }
  .level { font-size: 11px; color: var(--muted); font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
  .desc { font-size: 14px; line-height: 1.55; color: var(--ink-2); margin-top: 6px; }
  .meta { display: flex; gap: 18px; font-size: 12px; color: var(--muted); margin-top: 8px; font-weight: 600; }
  .meta a { color: var(--accent); }
  @media (max-width: 720px) { h1 { font-size: 40px; } }
</style>
```

- [ ] **Step 3: Write src/pages/about.astro**

Write `src/pages/about.astro`:
```astro
---
import { Image } from 'astro:assets';
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import HighlightPhrase from '../components/HighlightPhrase.astro';
import headshot from '../assets/headshot.jpg';

const career = (await getCollection('career')).sort((a, b) => a.data.order - b.data.order);

const certifications = [
  'VMware Certified Cloud Infrastructure Administrator 2024',
  'Double VCP — Data Center Virtualization & Network Virtualization',
  'VMware Carbon Black Endpoint Protection 2020',
  'Fortinet FortiGate 7.4 Operator',
  'CompTIA Network+ ce',
];
const education = [
  { date: 'June 2025', deg: 'Ed.D., Instructional Design, Systems, and Technology', inst: 'South College' },
  { date: 'November 2024', deg: 'Ed.S., Instructional Design and Technology', inst: 'South College' },
  { date: 'February 2023', deg: 'M.S., IT Management', inst: 'Western Governors University' },
  { date: 'August 2018', deg: 'M.Ed., Instructional Systems Technology, Training and Development', inst: 'UNC Charlotte' },
  { date: '2014', deg: 'B.A., Music Education', inst: 'Wingate University' },
];
const awards = [
  'Worldwide Training Delivery Impact Award',
  'Worldwide Sales and Strategy Acceleration Quarterly Award — Accelerator',
  'Team Member Excellence Award',
  'Best of Show — DevLearn DemoFest',
];
---
<BaseLayout title="About — Frazier Smith" current="about">
  <header class="page-header">
    <div class="container hdr">
      <div>
        <span class="kicker">About</span>
        <h1>Music classroom to AI lab.</h1>
        <p class="lede">I lead the Network, Cybersecurity, and Cloud department at Central Piedmont; serve as graduate faculty at UNC Charlotte; teach Applied Innovation in Wingate's Honors program; and co-PI an NSF ATE grant building one of NC's first associate-degree AI programs.</p>
        <a href="/cv.pdf" class="cv-btn">Download CV (PDF) →</a>
      </div>
      <div class="photo">
        <Image src={headshot} alt="Dr. Frazier A. Smith" widths={[280, 420, 560]} sizes="(max-width: 720px) 220px, 320px" />
      </div>
    </div>
  </header>

  <section class="container section">
    <h2>Wingate → VMware → Wingate</h2>
    <p>I started as a music education major at Wingate University and stayed on as Educational Technology Specialist after graduating in 2014. A decade later — after senior instructional design and content development roles at Belk, CPI Security, SnapAV, Anomali, Carbon Black, VMware, Broadcom, and Fast Lane — I came back to Wingate as adjunct in the Honors program, only this time co-teaching applied AI.</p>
    <p>In between: I led a 12-person content team at VMware responsible for sixteen courses across vSphere, VMware Cloud, and HCX — work that drove $40M in customer revenue in 2022. I modernized the team's development process from ADDIE to a SAM-based, agile approach suited to the pace of SaaS. As senior instructor, I led the Carbon Black and VMware on AWS portfolio with a global instructor rating consistently above 4.95.</p>
    <p>Now I run a 3-pathway IT department (IT Support, Cybersecurity, Cloud &amp; Networking) at Central Piedmont. I've built collaborations with Red Hat and Palo Alto Networks, redesigned entry-level courses, and mentored student data-center workers connecting classroom content to live infrastructure.</p>
    <p class="thesis">My research focus: <HighlightPhrase text="how AI is reshaping entry-level IT work, and what post-secondary CTE has to do about it." phrase="entry-level IT work" /></p>
  </section>

  <section class="container section">
    <h2>Career history</h2>
    <ul class="career">
      {career.map((c) => (
        <li>
          <span class="years">{c.data.years}</span>
          <span class="title">{c.data.title}</span>
          <span class="org">{c.data.org}</span>
        </li>
      ))}
    </ul>
  </section>

  <section class="container section">
    <h2>Education</h2>
    <ul class="edu">
      {education.map((e) => (
        <li>
          <span class="years">{e.date}</span>
          <span class="title">{e.deg}</span>
          <span class="org">{e.inst}</span>
        </li>
      ))}
    </ul>
  </section>

  <section class="container section">
    <h2>Certifications</h2>
    <ul class="bullets">
      {certifications.map((c) => <li>{c}</li>)}
    </ul>
  </section>

  <section class="container section last">
    <h2>Honors &amp; Awards</h2>
    <ul class="bullets">
      {awards.map((a) => <li>{a}</li>)}
    </ul>
  </section>
</BaseLayout>

<style>
  .container { max-width: var(--container-max); margin: 0 auto; padding-left: var(--space-page-x); padding-right: var(--space-page-x); }
  .page-header { padding: 70px 0 50px; border-bottom: 2px solid var(--ink); }
  .hdr { display: grid; grid-template-columns: 1.4fr 1fr; gap: 50px; align-items: center; }
  .kicker { font-size: 11px; letter-spacing: .15em; text-transform: uppercase; font-weight: 800; background: var(--ink); color: var(--page); padding: 4px 10px; border-radius: 4px; }
  h1 { font-size: 60px; line-height: 1; margin: 18px 0 18px; font-weight: 800; letter-spacing: -.035em; }
  .lede { font-size: 17px; line-height: 1.55; color: var(--ink-2); margin-bottom: 22px; }
  .cv-btn { background: var(--ink); color: var(--page); padding: 11px 18px; border-radius: var(--radius-pill); font-size: 13px; font-weight: 700; display: inline-block; }
  .photo img { border-radius: var(--radius-lg); border: 2.5px solid var(--ink); box-shadow: var(--shadow-card); width: 100%; height: auto; }

  .section { padding: 50px 0 0; }
  .section.last { padding-bottom: 80px; }
  .section h2 { font-size: 28px; font-weight: 800; margin: 0 0 18px; letter-spacing: -.02em; }
  .section p { font-size: 16px; line-height: 1.65; color: var(--ink-2); margin-bottom: 14px; max-width: 75ch; }
  .thesis { font-size: 18px; font-weight: 600; padding: 18px; background: var(--card); border: 2px solid var(--accent); border-radius: var(--radius-lg); margin-top: 18px; }

  .career, .edu { list-style: none; display: grid; gap: 6px; }
  .career li, .edu li { display: grid; grid-template-columns: 130px 1fr 1fr; gap: 18px; padding: 10px 0; border-bottom: 1px dashed #c8c4be; font-size: 14px; }
  .years { font-weight: 800; }
  .title { font-weight: 600; }
  .org { color: var(--muted); }

  .bullets { padding-left: 22px; }
  .bullets li { font-size: 15px; line-height: 1.65; color: var(--ink-2); margin-bottom: 6px; }

  @media (max-width: 860px) {
    .hdr { grid-template-columns: 1fr; }
    h1 { font-size: 40px; }
    .career li, .edu li { grid-template-columns: 1fr; gap: 2px; padding-bottom: 12px; }
  }
</style>
```

- [ ] **Step 4: Write src/pages/404.astro**

Write `src/pages/404.astro`:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="404 — Page not found" current="" noindex={true}>
  <div class="container">
    <span class="big">404</span>
    <h1>This page doesn't exist.</h1>
    <p>It may have moved or never existed. Try one of these:</p>
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/speaking">Speaking</a></li>
      <li><a href="/writing">Writing</a></li>
      <li><a href="/about">About</a></li>
    </ul>
  </div>
</BaseLayout>

<style>
  .container { max-width: 700px; margin: 0 auto; padding: 80px var(--space-page-x); }
  .big { font-size: 120px; font-weight: 800; line-height: 1; color: var(--accent); letter-spacing: -.05em; }
  h1 { font-size: 36px; font-weight: 800; margin: 8px 0 14px; }
  p { font-size: 16px; color: var(--ink-2); margin-bottom: 18px; }
  ul { list-style: none; display: flex; gap: 18px; flex-wrap: wrap; }
  ul a { color: var(--accent); font-weight: 700; text-decoration: underline; }
</style>
```

- [ ] **Step 5: Add a placeholder CV PDF**

```bash
cp Frazier_Smith_Professional_Profile.pdf public/cv.pdf
```

- [ ] **Step 6: Verify and commit**

Run `npm run dev`. Visit:
- `/talks` → shows empty-state since no talks-given data yet.
- `/teaching` → shows all 8 courses grouped by institution.
- `/about` → full bio + career table + education + certs + awards.
- `/some-random-url` → 404.

```bash
git add src/pages/talks.astro src/pages/teaching.astro src/pages/about.astro src/pages/404.astro public/cv.pdf
git commit -m "feat(pages): add /talks, /teaching, /about, and branded 404"
```

---

## Task 23: Build BookingForm component and Cloudflare Function

**Files:**
- Create: `src/components/BookingForm.astro`, `functions/api/book.ts`, `functions/api/book.test.ts`, `src/pages/speaking/thanks.astro`, `vitest.config.ts`

- [ ] **Step 1: Write vitest.config.ts**

Write `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['**/*.test.ts'],
    coverage: { reporter: ['text', 'html'] },
  },
});
```

- [ ] **Step 2: Write the failing test for the booking function**

Write `functions/api/book.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onRequestPost } from './book';

const buildContext = (body: Record<string, unknown>, env: Record<string, string> = {}) => {
  const formData = new FormData();
  Object.entries(body).forEach(([k, v]) => formData.append(k, String(v ?? '')));
  return {
    request: new Request('https://vfrazier.app/api/book', {
      method: 'POST',
      body: formData,
    }),
    env: {
      RESEND_API_KEY: 're_test_key',
      TURNSTILE_SECRET_KEY: 'turnstile_test',
      ...env,
    },
  } as any;
};

beforeEach(() => {
  vi.restoreAllMocks();
  globalThis.fetch = vi.fn();
});

describe('booking form handler', () => {
  it('rejects when honeypot is filled', async () => {
    const ctx = buildContext({
      name: 'Test',
      email: 'test@example.com',
      organization: 'Acme',
      event_date: '2026-09-01',
      topic_interest: 'Pull the Lever',
      message: 'Want you to keynote.',
      website: 'http://spam.example.com',
      'cf-turnstile-response': 'token123',
    });
    const res = await onRequestPost(ctx);
    expect(res.status).toBe(400);
  });

  it('rejects when required fields are missing', async () => {
    const ctx = buildContext({
      name: '',
      email: 'test@example.com',
      message: 'short',
      'cf-turnstile-response': 'token123',
    });
    const res = await onRequestPost(ctx);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toMatch(/required/i);
  });

  it('rejects when turnstile token is missing', async () => {
    const ctx = buildContext({
      name: 'Test',
      email: 'test@example.com',
      organization: 'Acme',
      event_date: '2026-09-01',
      topic_interest: 'Pull the Lever',
      message: 'Want you to keynote our event in September.',
    });
    const res = await onRequestPost(ctx);
    expect(res.status).toBe(400);
  });

  it('sends email via Resend on valid input', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }))) // turnstile verify
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'em_123' }))); // resend send
    globalThis.fetch = mockFetch;

    const ctx = buildContext({
      name: 'Jane Organizer',
      email: 'jane@example.org',
      organization: 'ExampleConf',
      event_date: '2026-09-01',
      topic_interest: 'Pull the Lever',
      message: 'We would like you to keynote our event.',
      'cf-turnstile-response': 'token123',
    });

    const res = await onRequestPost(ctx);
    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(2);
    const [turnstileUrl] = mockFetch.mock.calls[0];
    expect(turnstileUrl).toContain('challenges.cloudflare.com');
    const [resendUrl, resendInit] = mockFetch.mock.calls[1];
    expect(resendUrl).toBe('https://api.resend.com/emails');
    const sentBody = JSON.parse(resendInit.body as string);
    expect(sentBody.to).toContain('frazier@vfrazier.app');
    expect(sentBody.subject).toMatch(/Speaking inquiry/);
    expect(sentBody.html).toContain('Jane Organizer');
  });

  it('returns 500 when Resend fails', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true })))
      .mockResolvedValueOnce(new Response('Server error', { status: 500 }));
    globalThis.fetch = mockFetch;

    const ctx = buildContext({
      name: 'Jane',
      email: 'jane@example.org',
      organization: 'X',
      event_date: '2026-09-01',
      topic_interest: 'Keynote',
      message: 'We would like you to keynote our event.',
      'cf-turnstile-response': 'token123',
    });
    const res = await onRequestPost(ctx);
    expect(res.status).toBe(502);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run:
```bash
npm test
```
Expected: All tests fail with "Cannot find module './book'" or similar.

- [ ] **Step 4: Implement functions/api/book.ts**

Write `functions/api/book.ts`:
```typescript
interface Env {
  RESEND_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
}

interface Context {
  request: Request;
  env: Env;
}

const REQUIRED_FIELDS = ['name', 'email', 'organization', 'event_date', 'topic_interest', 'message'] as const;
type RequiredField = (typeof REQUIRED_FIELDS)[number];

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function verifyTurnstile(token: string, secret: string, ip: string): Promise<boolean> {
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { success?: boolean };
  return Boolean(data?.success);
}

async function sendEmail(env: Env, payload: Record<RequiredField, string>): Promise<boolean> {
  const html = `
    <h2>New speaking inquiry</h2>
    <p><strong>${escapeHtml(payload.name)}</strong> &lt;${escapeHtml(payload.email)}&gt;</p>
    <p><strong>Organization:</strong> ${escapeHtml(payload.organization)}</p>
    <p><strong>Event date:</strong> ${escapeHtml(payload.event_date)}</p>
    <p><strong>Topic:</strong> ${escapeHtml(payload.topic_interest)}</p>
    <hr/>
    <pre style="font-family:inherit;white-space:pre-wrap;">${escapeHtml(payload.message)}</pre>
  `;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'vfrazier.app <noreply@vfrazier.app>',
      to: ['frazier@vfrazier.app'],
      reply_to: payload.email,
      subject: `Speaking inquiry — ${payload.organization} (${payload.event_date})`,
      html,
    }),
  });
  return res.ok;
}

export async function onRequestPost(ctx: Context): Promise<Response> {
  const form = await ctx.request.formData();
  const honeypot = String(form.get('website') ?? '').trim();
  if (honeypot.length > 0) {
    return new Response(JSON.stringify({ error: 'Invalid submission' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data: Partial<Record<RequiredField, string>> = {};
  const missing: string[] = [];
  for (const field of REQUIRED_FIELDS) {
    const v = String(form.get(field) ?? '').trim();
    if (!v) missing.push(field);
    data[field] = v;
  }
  if (missing.length > 0) {
    return new Response(JSON.stringify({ error: `Required fields missing: ${missing.join(', ')}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = String(form.get('cf-turnstile-response') ?? '').trim();
  if (!token) {
    return new Response(JSON.stringify({ error: 'Bot challenge failed' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const ip = ctx.request.headers.get('CF-Connecting-IP') ?? '0.0.0.0';
  const passed = await verifyTurnstile(token, ctx.env.TURNSTILE_SECRET_KEY, ip);
  if (!passed) {
    return new Response(JSON.stringify({ error: 'Bot challenge failed' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const sent = await sendEmail(ctx.env, data as Record<RequiredField, string>);
  if (!sent) {
    return new Response(JSON.stringify({ error: 'Email delivery failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Browser non-JS flow: redirect; JS flow expects JSON success.
  const accept = ctx.request.headers.get('Accept') ?? '';
  if (accept.includes('application/json')) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return Response.redirect('https://vfrazier.app/speaking/thanks', 303);
}
```

- [ ] **Step 5: Run tests to confirm they pass**

Run:
```bash
npm test
```
Expected: 5 tests pass.

- [ ] **Step 6: Write src/components/BookingForm.astro**

Write `src/components/BookingForm.astro`:
```astro
---
const turnstileSiteKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? '1x00000000000000000000AA';
---
<form class="form" method="POST" action="/api/book" id="book">
  <div class="row">
    <label>
      <span>Your name<span class="req">*</span></span>
      <input name="name" required autocomplete="name" />
    </label>
    <label>
      <span>Email<span class="req">*</span></span>
      <input type="email" name="email" required autocomplete="email" />
    </label>
  </div>
  <div class="row">
    <label>
      <span>Organization<span class="req">*</span></span>
      <input name="organization" required />
    </label>
    <label>
      <span>Event date<span class="req">*</span></span>
      <input type="date" name="event_date" required />
    </label>
  </div>
  <label class="full">
    <span>Topic interest<span class="req">*</span></span>
    <select name="topic_interest" required>
      <option value="">Choose a topic…</option>
      <option>Building NC's first associate-degree AI programs</option>
      <option>What AI is doing to entry-level IT — and what to teach</option>
      <option>Would You Pull the Lever? (Ethics workshop)</option>
      <option>LLMs/RAG/agentic as instructional design tools</option>
      <option>ADDIE to Agile at the speed of SaaS</option>
      <option>Industry partnerships that serve students</option>
      <option>xAPI &amp; learning analytics</option>
      <option>Music classroom to server room</option>
      <option>Open / not listed</option>
    </select>
  </label>
  <label class="full">
    <span>What are you looking for?<span class="req">*</span></span>
    <textarea name="message" required rows="6" placeholder="Date, format, audience, anything that helps me say yes (or no) quickly."></textarea>
  </label>

  <!-- Honeypot — humans don't fill this -->
  <label class="hp" aria-hidden="true">
    Website
    <input name="website" tabindex="-1" autocomplete="off" />
  </label>

  <div class="cf-turnstile" data-sitekey={turnstileSiteKey}></div>
  <script is:inline src="https://challenges.cloudflare.com/turnstile/v0/api.js" defer></script>

  <button type="submit" class="submit">Send inquiry →</button>
  <p class="legal">Goes straight to frazier@vfrazier.app. Reply within ~2 business days.</p>
</form>

<style>
  .form { display: grid; gap: 18px; padding: 30px; background: var(--card); border: 2px solid var(--ink); border-radius: var(--radius-lg); }
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  label { display: grid; gap: 6px; font-size: 13px; font-weight: 700; }
  label .req { color: var(--accent); margin-left: 3px; }
  input, select, textarea {
    border: 2px solid var(--ink);
    border-radius: var(--radius-sm);
    padding: 10px 12px;
    font-size: 14px;
    background: var(--page);
    font-weight: 500;
  }
  textarea { resize: vertical; }
  .full { display: block; }
  .full > span { display: block; margin-bottom: 6px; }
  .submit {
    justify-self: start;
    background: var(--ink);
    color: var(--page);
    padding: 12px 22px;
    border-radius: var(--radius-pill);
    font-weight: 700;
    font-size: 14px;
  }
  .legal { font-size: 12px; color: var(--muted); }
  .hp { position: absolute; left: -9999px; height: 0; width: 0; overflow: hidden; }
  @media (max-width: 720px) { .row { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 7: Write src/pages/speaking/thanks.astro**

Write `src/pages/speaking/thanks.astro`:
```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
---
<BaseLayout title="Thanks — Frazier Smith" current="speaking" noindex={true}>
  <div class="container">
    <span class="big">✓</span>
    <h1>Got it.</h1>
    <p>Your inquiry is in my inbox. I aim to reply within two business days. If you need a faster response, email me directly at <a href="mailto:frazier@vfrazier.app">frazier@vfrazier.app</a>.</p>
    <p><a href="/" class="back">← Back to home</a></p>
  </div>
</BaseLayout>

<style>
  .container { max-width: 600px; margin: 0 auto; padding: 100px var(--space-page-x); }
  .big { font-size: 80px; color: var(--accent); font-weight: 800; }
  h1 { font-size: 40px; font-weight: 800; margin: 12px 0 14px; }
  p { font-size: 16px; line-height: 1.65; color: var(--ink-2); margin-bottom: 12px; }
  a { color: var(--accent); font-weight: 700; text-decoration: underline; }
  .back { display: inline-block; margin-top: 24px; }
</style>
```

- [ ] **Step 8: Replace the booking form placeholder on /speaking**

Edit `src/pages/speaking.astro`:

Replace:
```astro
import SpeakerLogistics from '../components/SpeakerLogistics.astro';
```
with:
```astro
import SpeakerLogistics from '../components/SpeakerLogistics.astro';
import BookingForm from '../components/BookingForm.astro';
```

Replace the `<div class="form-placeholder">…</div>` block with:
```astro
<BookingForm />
```

- [ ] **Step 9: Build to make sure it all wires up**

Run:
```bash
npm run build
```
Expected: succeeds. Production deploy will need `PUBLIC_TURNSTILE_SITE_KEY`, `RESEND_API_KEY`, and `TURNSTILE_SECRET_KEY` set in the Cloudflare Pages dashboard.

- [ ] **Step 10: Commit**

```bash
git add vitest.config.ts functions/ src/components/BookingForm.astro src/pages/speaking/thanks.astro src/pages/speaking.astro
git commit -m "feat(booking): add booking form with Cloudflare Function backend, Turnstile, and tests"
```

---

## Task 24: Add Playwright smoke tests

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Write playwright.config.ts**

Write `playwright.config.ts`:
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  retries: 0,
  use: {
    baseURL: 'http://localhost:4321',
  },
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
```

- [ ] **Step 2: Write tests/e2e/smoke.spec.ts**

Write `tests/e2e/smoke.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';

test('homepage shows hero, POV bar, and primary CTAs', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: /AI lab/i })).toBeVisible();
  await expect(page.getByText('Entry-level IT work')).toBeVisible();
  await expect(page.getByRole('link', { name: /Book me to speak/i })).toBeVisible();
});

test('nav links work to all primary pages', async ({ page }) => {
  await page.goto('/');
  for (const label of ['Speaking', 'Writing', 'Talks', 'Teaching', 'About']) {
    await page.getByRole('link', { name: label, exact: true }).first().click();
    await expect(page).toHaveURL(new RegExp(`/${label.toLowerCase()}`));
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.goto('/');
  }
});

test('speaking page renders 8 topic cards and booking form', async ({ page }) => {
  await page.goto('/speaking');
  await expect(page.locator('.topic')).toHaveCount(8);
  await expect(page.locator('form#book')).toBeVisible();
  await expect(page.getByLabel(/Your name/i)).toBeVisible();
});

test('writing post renders prose', async ({ page }) => {
  await page.goto('/writing/2026-05-xapi-lab-stack');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('xAPI');
  await expect(page.locator('.prose')).toBeVisible();
});

test('RSS feed returns valid XML', async ({ request }) => {
  const res = await request.get('/rss.xml');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('xml');
  const body = await res.text();
  expect(body).toContain('<rss');
  expect(body).toContain('Frazier Smith');
});

test('404 page renders for unknown URL', async ({ page }) => {
  const res = await page.goto('/this-does-not-exist');
  expect(res?.status()).toBe(404);
  await expect(page.getByText('404')).toBeVisible();
});
```

- [ ] **Step 3: Run smoke tests**

Run:
```bash
npm run build && npm run test:e2e
```
Expected: All 6 tests pass.

- [ ] **Step 4: Commit**

```bash
git add playwright.config.ts tests/
git commit -m "test(e2e): add Playwright smoke suite covering homepage, nav, speaking, post, RSS, 404"
```

---

## Task 25: Final polish — homepage POV bar shows on every page, accessibility audit

**Files:**
- Modify: `src/layouts/BaseLayout.astro` (verify), various pages for a11y

- [ ] **Step 1: Verify all pages have nav, footer, POV bar**

Run `npm run dev`. Click through `/`, `/speaking`, `/writing`, `/writing/2026-05-xapi-lab-stack`, `/talks`, `/teaching`, `/about`, `/404`. Each should show POV bar at top, Nav, Footer.

- [ ] **Step 2: Add lang attribute on prose images and verify alt text**

Image alt text was set in earlier tasks (Hero, AboutBlock). Confirm by `grep -rn 'alt=' src/`. All images must have non-empty alt or `alt=""` for decorative.

Run:
```bash
grep -rn '<Image' src/components src/pages src/layouts | grep -v 'alt='
```
Expected: no output (every Image has alt).

- [ ] **Step 3: Lighthouse check (manual)**

Run `npm run build && npm run preview`. Open Chrome DevTools → Lighthouse on http://localhost:4321/ → run mobile audit. Targets from spec §10:
- Performance ≥ 95
- Accessibility ≥ 95
- Best Practices = 100
- SEO = 100

Note any failures. If accessibility < 95, common fixes:
- Heading levels skipped (h1 → h3): add intermediate h2.
- Contrast issues on `--muted` text against `--page`: bump to a darker shade if needed.
- Missing form labels: each input must have a `<label>`.

Apply fixes and rerun.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "chore(a11y): final accessibility and Lighthouse pass" --allow-empty
```

---

## Task 26: Push to GitHub and connect Cloudflare Pages (manual)

**Files:** none in repo — this is operational

- [ ] **Step 1: Create GitHub repo**

In the GitHub web UI: create a new private (or public) repo named `vfrazier-app`. Don't initialize with README — we already have one.

- [ ] **Step 2: Push**

Run (replacing `YOUR-USERNAME`):
```bash
git remote add origin git@github.com:YOUR-USERNAME/vfrazier-app.git
git push -u origin main
```
Expected: push succeeds.

- [ ] **Step 3: Connect Cloudflare Pages**

In the Cloudflare dashboard (https://dash.cloudflare.com):
1. Workers & Pages → Create application → Pages → Connect to Git.
2. Select the `vfrazier-app` repo.
3. Build settings:
    - Framework preset: **Astro**
    - Build command: `npm run build`
    - Build output directory: `dist`
    - Environment variables (Production + Preview):
        - `RESEND_API_KEY` = (from resend.com dashboard)
        - `TURNSTILE_SECRET_KEY` = (from Cloudflare Turnstile dashboard — create a site key for vfrazier.app)
        - `PUBLIC_TURNSTILE_SITE_KEY` = (the matching site key — note: this is exposed client-side)
4. Save and deploy.

- [ ] **Step 4: Add custom domain**

In Cloudflare Pages project → Custom domains → Add `vfrazier.app`. Cloudflare provisions the TLS cert automatically (vfrazier.app should already be on Cloudflare DNS).

Also add `www.vfrazier.app` and create a Cloudflare Page Rule or Bulk Redirect: `www.vfrazier.app/*` → `https://vfrazier.app/$1` (301).

- [ ] **Step 5: Smoke test production**

In a browser, visit `https://vfrazier.app` and verify:
- Homepage renders.
- Submit a test booking from `/speaking#book` — confirm email lands at frazier@vfrazier.app.
- `/rss.xml` returns valid feed.
- Lighthouse mobile scores meet targets from spec §10.

- [ ] **Step 6: Final commit (if any tweaks)**

```bash
git add -A
git commit -m "chore: production launch verified" --allow-empty
git push
```

---

## Self-Review

**Spec coverage check** (mapped each spec section to tasks):

| Spec § | Topic | Task(s) covering it |
|---|---|---|
| §1 | Purpose / audiences | Reflected in homepage IA (Tasks 13–19) and /speaking design (Task 20) |
| §2 | Information Architecture (7 routes + 404) | Tasks 13–22 cover all pages |
| §3 | Visual design system (palette, type, motifs) | Task 4 (tokens), all component tasks |
| §4 | Homepage layout (10 blocks) | Tasks 5 (BaseLayout), 6 (PovBar/Nav/Footer), 7 (SectionHead), 13 (Hero), 14 (PressStrip), 15 (Speaking), 16 (Testimonials), 17 (About), 18 (Writing), 19 (Teaching) |
| §5 | Subpages — speaking, writing index, writing post, talks, teaching, about, cv | Tasks 20, 21, 22 |
| §6 | Content model (7 collections, schemas) | Task 8 (schemas), Tasks 9–12 (seeds) |
| §7 | Tech stack, booking form, hosting, perf | Tasks 1–3 (scaffolding), Task 23 (booking + function), Task 26 (deploy) |
| §8 | Repo structure | Matches file paths in Tasks 1–25 |
| §9 | Out of scope | Honored — no CMS, no comments, no search, no dark mode, no auto-LinkedIn |
| §10 | Launch checklist | Task 25 (Lighthouse), Task 26 (DNS, smoke) |
| §11 | Deferred questions | Open — surface during Task 10 (talk abstracts) and Task 26 (repo name) |

**Placeholder scan:** No "TBD", "implement later", or vague "add error handling" instructions remain. All steps have complete code. The placeholder *content* in testimonials and the CV PDF is intentional and documented as such.

**Type consistency:** Reviewed — `BookingForm` field names match `REQUIRED_FIELDS` in `book.ts`. Content collection types referenced consistently (`speakingTopics`, `talksGiven`, `testimonials`, etc.). Property names in components (e.g., `data.tag`, `data.featured`) match schema definitions in `src/content/config.ts`.

**Scope check:** 26 tasks, each scoped to 2–5 minutes per step. Some tasks (13, 17, 22, 23) are larger by step count because the components themselves are larger. Implementation can pause at any task boundary; commits at the end of each task leave the repo in a working state.
