# vfrazier.app: Colorblock Rebrand (Exploration)

**Status:** adopted 2026-11-15 (PR #41). This replaces §3 (Visual Design System) of
`2026-05-11-portfolio-site-design.md`. IA, content
model, copy, and the conversion target (speaking invitations) are unchanged.

---

## 1. Concept: four identities, four colors

The site serves four professional identities. The colorblock system gives each one a color
and uses that color, consistently, wherever the identity shows up:

| Identity | Color | Token | Where it shows |
|---|---|---|---|
| Speaking | Violet `#5b21b6` | `--violet` | `/speaking`, `/talks` header bands; home §01 band; every "Book" button |
| Writing | Coral `#ff7a59` | `--coral` | `/writing` and post header bands; home §04 band; "Read recent writing" CTA |
| Teaching | Teal `#3ccfa9` | `--teal` | `/teaching`, `/resources` header bands; home §05 band |
| Research / About | Sun `#ffd60a` | `--sun` | `/about` header band; home §03 band; hero photo field; highlighter |

Ink `#15110d` and paper `#f6f1e8` are the neutrals. Violet and sun carry over from the
current brand (violet deepened from `#6d28d9` to `#5b21b6` so white text clears 7:1), so the
rebrand reads as an evolution, not a replacement.

`BaseLayout` maps the `current` nav key to a `data-identity` attribute on `<body>`, which sets
`--id-bg` / `--id-fg` / `--id-chip-*` / `--id-art`. Page headers (`.cb-band`) and kickers
(`.cb-kicker`) read those, so a page picks up its color from its nav key alone.

## 2. Palette and contrast

Every text/background pairing in use is at or above 7:1 (WCAG AAA), except sun on violet
(6.36:1), which is only used for large text and short bold labels.

| Pairing | Ratio |
|---|---|
| ink on paper / white / sun / teal / coral | 16.70 / 18.79 / 13.31 / 9.56 / 7.32 |
| ink on tints: lilac / mint / blush / butter | 12.52 / 15.35 / 13.38 / 16.32 |
| `--ink-2` on paper / lilac / sun | 11.58 / 8.69 / 9.23 |
| `--muted` on paper / white | 7.27 / 8.18 |
| white / paper on violet | 8.98 / 7.98 |
| paper / `--footer-text` / `--footer-dim` on ink | 16.70 / 13.56 / 7.55 |
| violet links on white / paper | 8.98 / 7.98 |

Rules that fall out of the numbers: **coral and teal only ever carry ink text**; violet only
ever carries white or paper; violet is not used for text on sun.

Tints (`--lilac`, `--mint`, `--blush`, `--butter`) are for blocks that sit inside a colored
band, so a card never matches its background.

Legacy token names (`--accent`, `--highlight`, `--card`, `--page`, …) are kept and remapped
in `tokens.css`, so every page (including the standalone resource pages) still resolves.

## 3. Typography

- **Display:** Archivo Variable (`@fontsource-variable/archivo`, wdth axis) for `h1`–`h3`,
  the brand wordmark, and the section numbers. Weight 800–900, `font-stretch` 112% (125% for
  section numbers). Tracking relaxes from -0.035em to about -0.025em because the wide cut needs less.
- **Body:** Inter Variable, unchanged.

## 4. Motifs

- **Full-bleed bands.** Sections are fields of solid color that meet edge to edge. Home runs
  paper/sun → ink → violet → paper → sun → coral → teal → ink.
- **No outlines, no drop shadows.** Blocks are separated by color, not borders.
  `--shadow-*` tokens are `none`. The only offset "shadow" left is a flat colored block
  behind a photo (about header, post images).
- **Square corners.** All `--radius-*` tokens are 0. Circles appear only as deliberate shapes.
- **Edge-to-edge mosaics.** Home speaking cards (2×2) and home teaching cards (3-up) sit with
  zero gap; fills alternate so no two neighbors match. Cards invert to ink on hover.
- **Bauhaus geometry.** The hero headshot is set in a block collage (quarter circle, half
  circle, circle) on a sun field. Page header bands carry concentric quarter-arcs hinged on the
  top-right corner (`.cb-band::before`, one radial gradient): outer ring `--id-art`, then paper,
  then `--id-alt`, with the band color at the center. They are 280px wide, 200px at 1100px
  and below, and 96px at 860px and below, so they never sit under the headline.
- **The four-block stripe** (violet | sun | coral | teal) is the brand signature: top of every
  page and the footer edge.
- **Logo mark** (`src/assets/logo.svg`, rendered by `BrandMark.astro`; copied to
  `public/favicon.svg`; used in the OG image). A 2×2 of color blocks, each holding an icon
  for a part of the story: server (violet, top left), graduation cap (teal, teaching), music
  notes (coral quarter-round, offset inward so the curve doesn't clip them), and AI sparkle
  (sun, research). Icons are drawn by hand on a 24-unit grid, not taken from an
  icon set, so there is no attribution requirement. Use it at 40px or larger; below about
  24px the icons blur into texture and only the color blocks read.
- **Numbered section squares.** `SectionHead` takes a `tone` for its number block; pick one
  that contrasts with the band it sits on.
- **Highlighter → solid block.** `HighlightPhrase` is a flat sun block; the hero "AI lab." is a
  violet block.

## 5. Accessibility notes

- Focus ring changed from a 3px purple outline to a **3px ink outline over a sun halo**. A
  purple ring would vanish on violet bands; ink+sun is visible on every block color.
- Active nav link gets `aria-current="page"` in addition to its color fill.
- Skip link, `prefers-reduced-motion`, and body contrast targets are preserved.

## 6. Tradeoffs and open questions

- **Font weight.** Archivo's Latin wdth file is ~90 KB (woff2). That is a real cost against
  the §7 budget (< 200 KB gzipped excluding hero). If adopted, consider instancing it down
  to wdth 112–125 / wght 800–900 with fonttools, or dropping the wdth axis.
- **CV PDF.** Regenerated when this was adopted; `/cv` prints with the new display face and
  violet section labels.
- **Standalone resource pages** (`src/pages/resources/*.astro`) only inherit tokens; they
  were not redesigned.
- **Headshot resolution.** The source is 300×450, so the collage is sized to show it at
  native size. A higher-resolution headshot would let the collage scale up on wide screens.

## 7. Incidental fixes

- Mobile horizontal overflow on `/`, `/writing` (nav links didn't wrap) and `/speaking`
  (booking form inputs had an intrinsic min width). Both existed before this branch.
