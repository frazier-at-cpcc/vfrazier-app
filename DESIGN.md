---
version: alpha
name: vfrazier.app Colorblock
description: >-
  Colorblock design system for vfrazier.app, adopted 2026-11-15 in PR #41.
  Four professional identities each own one color. Sections are solid,
  full-bleed fields of color with square corners and no shadows.
colors:
  violet: "#5b21b6"
  violet-deep: "#3b1480"
  sun: "#ffd60a"
  coral: "#ff7a59"
  teal: "#3ccfa9"
  lilac: "#d8ccff"
  blush: "#ffcfc2"
  mint: "#c8f1e4"
  butter: "#fff0a3"
  ink: "#15110d"
  ink-2: "#3a2f24"
  muted: "#5a4d3e"
  paper: "#f6f1e8"
  white: "#ffffff"
  footer-text: "#e3dacb"
  footer-dim: "#b0a293"
  primary: "{colors.violet}"
  secondary: "{colors.coral}"
  tertiary: "{colors.teal}"
  neutral: "{colors.paper}"
  surface: "{colors.white}"
  on-surface: "{colors.ink}"
typography:
  display-xl:
    fontFamily: Archivo Variable
    fontSize: 62px
    fontWeight: 900
    lineHeight: 0.98
    letterSpacing: -0.025em
  display-lg:
    fontFamily: Archivo Variable
    fontSize: 44px
    fontWeight: 900
    lineHeight: 1
    letterSpacing: -0.02em
  section-number:
    fontFamily: Archivo Variable
    fontSize: 30px
    fontWeight: 900
    lineHeight: 1
  headline-md:
    fontFamily: Archivo Variable
    fontSize: 21px
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: -0.01em
  wordmark:
    fontFamily: Archivo Variable
    fontSize: 17px
    fontWeight: 850
    letterSpacing: -0.01em
  thesis:
    fontFamily: Inter Variable
    fontSize: 22px
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: -0.015em
  prose:
    fontFamily: Inter Variable
    fontSize: 18px
    fontWeight: 500
    lineHeight: 1.7
  body-md:
    fontFamily: Inter Variable
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.55
  body-sm:
    fontFamily: Inter Variable
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.55
  button:
    fontFamily: Inter Variable
    fontSize: 14px
    fontWeight: 800
  label-caps:
    fontFamily: Inter Variable
    fontSize: 11px
    fontWeight: 800
    letterSpacing: 0.15em
rounded:
  none: 0px
  sm: 0px
  md: 0px
  lg: 0px
  full: 0px
spacing:
  section: 80px
  section-mobile: 56px
  page-x: 40px
  page-x-mobile: 20px
  container-max: 1100px
  card-padding: 30px
  gap-mosaic: 0px
components:
  button-primary:
    backgroundColor: "{colors.violet}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: 16px 24px
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  button-secondary:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: 16px 24px
  button-secondary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  nav:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    height: 64px
  nav-book:
    backgroundColor: "{colors.violet}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
  nav-book-hover:
    backgroundColor: "{colors.sun}"
    textColor: "{colors.ink}"
  band-speaking:
    backgroundColor: "{colors.violet}"
    textColor: "{colors.white}"
  band-writing:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.ink}"
  band-teaching:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.ink}"
  band-research:
    backgroundColor: "{colors.sun}"
    textColor: "{colors.ink}"
  kicker:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label-caps}"
    padding: 6px 10px
  kicker-on-violet:
    backgroundColor: "{colors.sun}"
    textColor: "{colors.ink}"
  card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: 30px
  card-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  card-tint-lilac:
    backgroundColor: "{colors.lilac}"
    textColor: "{colors.ink}"
  card-tint-mint:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.ink}"
  card-tint-blush:
    backgroundColor: "{colors.blush}"
    textColor: "{colors.ink}"
  card-tint-butter:
    backgroundColor: "{colors.butter}"
    textColor: "{colors.ink}"
  highlight:
    backgroundColor: "{colors.sun}"
    textColor: "{colors.ink}"
    padding: 1px 4px
  hero-highlight:
    backgroundColor: "{colors.violet}"
    textColor: "{colors.white}"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: 10px 12px
  footer:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.footer-text}"
  footer-fine-print:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.footer-dim}"
  secondary-text:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-2}"
  muted-text:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.muted}"
  link-hover-deep:
    backgroundColor: "{colors.violet-deep}"
    textColor: "{colors.white}"
---

# vfrazier.app Colorblock Design System

## Overview

vfrazier.app is the portfolio site for Dr. Frazier A. Smith. The site serves four professional identities: speaking, writing, teaching, and research. Speaking invitations are the conversion target.

The colorblock system assigns one color to each identity and uses that color wherever the identity appears. Sections are flat fields of solid color that meet edge to edge. Color separates one block from the next. Corners are square, and no element casts a shadow. The geometry borrows from Bauhaus poster work: quarter circles, half circles, and concentric arcs set against rectangles.

The source of truth for values is `src/styles/tokens.css`. The adopting specification is `docs/superpowers/specs/2026-11-15-colorblock-rebrand.md`. The site has one theme and no dark mode.

## Colors

### Identity colors

| Identity | Color | Token | Text on it | Where it appears |
|---|---|---|---|---|
| Speaking | Violet `#5b21b6` | `--violet` | White or paper | `/speaking` and `/talks` header bands, the home speaking band, every Book button |
| Writing | Coral `#ff7a59` | `--coral` | Ink | `/writing` and post header bands, the home writing band, the secondary hero button |
| Teaching | Teal `#3ccfa9` | `--teal` | Ink | `/teaching` and `/resources` header bands, the home teaching band |
| Research and About | Sun `#ffd60a` | `--sun` | Ink | `/about` header band, the home about band, the hero photo field, highlighted phrases |

`BaseLayout` maps the page's nav key to a `data-identity` attribute on `<body>`. That attribute sets six custom properties, and the header band and kicker read them. A page takes its color from its nav key and needs no color declarations of its own.

| `data-identity` | `--id-bg` | `--id-fg` | Kicker chip | `--id-art` (outer arc) | `--id-alt` (inner arc) |
|---|---|---|---|---|---|
| `speaking` | violet | white | sun with ink text | sun | coral |
| `writing` | coral | ink | ink with paper text | violet | sun |
| `teaching` | teal | ink | ink with paper text | sun | violet |
| `research` | sun | ink | ink with paper text | coral | violet |
| none | ink | paper | sun with ink text | coral | sun |

### Neutrals

- **Ink** `#15110d` is the text color and the darkest block color. The footer and the home testimonial band use it as a background.
- **Paper** `#f6f1e8` is the page background.
- **White** `#ffffff` is the card surface on paper and on colored bands.
- **Ink-2** `#3a2f24` is for secondary body text. **Muted** `#5a4d3e` is for metadata on paper or white.
- **Footer-text** `#e3dacb` and **footer-dim** `#b0a293` are for text on ink.

### Tints

Lilac `#d8ccff`, blush `#ffcfc2`, mint `#c8f1e4`, and butter `#fff0a3` are for blocks that sit inside a colored band. A card on a violet band uses a tint or white so that the card never matches the band behind it. Every tint carries ink text.

### Contrast

Every text and background pairing in use meets 7:1, the WCAG AAA threshold, with one exception. Sun on violet measures 6.36:1 and is limited to large text and short bold labels.

| Pairing | Ratio |
|---|---|
| Ink on paper, white, sun, teal, coral | 16.70, 18.79, 13.31, 9.56, 7.32 |
| Ink on lilac, mint, blush, butter | 12.52, 15.35, 13.38, 16.32 |
| Ink-2 on paper, lilac, sun | 11.58, 8.69, 9.23 |
| Muted on paper, white | 7.27, 8.18 |
| White, paper on violet | 8.98, 7.98 |
| Paper, footer-text, footer-dim on ink | 16.70, 13.56, 7.55 |
| Violet links on white, paper | 8.98, 7.98 |

### Legacy token names

`--accent`, `--accent-soft`, `--accent-deep`, `--highlight`, `--highlight-soft`, `--card`, `--page`, and `--border` remain defined and point at the colorblock values. The standalone resource pages under `src/pages/resources/` depend on them. New code uses the colorblock names.

## Typography

Two typefaces are self-hosted through Fontsource.

- **Display:** Archivo Variable with the width axis. It sets `h1` through `h3`, the wordmark, section numbers, institution names, and testimonial quote marks. The weight is 800 to 900. `font-stretch` is 112% for headings, 118% for the wordmark, and 125% for section numbers and quote marks. Letter spacing is about -0.025em at the largest size and relaxes to -0.01em at card-heading size.
- **Body:** Inter Variable at weight 500, with the `cv11` and `ss01` font features enabled.

| Role | Size | Weight | Line height | Notes |
|---|---|---|---|---|
| Hero headline (`h1`) | 62px | 900 | 0.98 | Archivo |
| Section heading (`h2`) | 44px, 30px at 720px and below | 900 | 1.0 | Archivo |
| Section number | 30px, 22px at 720px and below | 900 | 1.0 | Archivo at 125% stretch |
| Card heading (`h3`) | 21px | 800 | 1.15 | Archivo |
| Hero thesis | 22px | 600 | 1.35 | Inter |
| Post prose | 18px | 500 | 1.7 | Inter, 65ch measure |
| Body | 16px | 500 | 1.55 | Inter |
| Card body | 14px | 500 | 1.55 | Inter, ink-2 |
| Button and nav | 14px | 800, nav links 650 | | Inter |
| Label, kicker, eyebrow | 10px to 11px | 800 | | Inter, uppercase, 0.14em to 0.16em tracking |

Labels are the only uppercase text. Headings use sentence case.

## Layout

- The content container is 1100px wide with 40px of horizontal padding. The padding is 20px at 720px and below.
- Vertical section padding is 80px, and 56px at 720px and below.
- Each section is a full-bleed band. The band background runs to both viewport edges while the content stays inside the container.
- The home page band order is: hero on paper with a sun photo field, ink, violet, paper, sun, coral, teal, ink.
- The four-block stripe is the brand signature. It runs violet, sun, coral, teal across the top of every page and along the top edge of the footer. The `--stripe` token divides it into equal quarters. The footer stripe is 14px tall and gives violet a double share to match the footer column grid.
- Mosaic grids have zero gap. The home speaking cards form a two-by-two grid, and the home teaching cards form a three-column row. Both collapse to one column at 720px and below.
- The breakpoints are 1100px, 860px, 720px, and 480px.

## Elevation & Depth

The system has no elevation. Every `--shadow-*` token is `none`. Hierarchy comes from color contrast between adjacent blocks and from type size.

A flat offset block is the one depth device. A solid rectangle of a second color sits behind a photo, offset down and to the right. The about header photo and images in post prose use it. Post images take a 10px paper outline and an 18px lilac offset block.

## Shapes

Every `--radius-*` token is 0. Buttons, cards, inputs, chips, and bands have square corners.

Circles and arcs appear only as deliberate geometry:

- **Header band arcs.** Each page header band carries concentric quarter-arcs hinged on its top-right corner. A single radial gradient draws them. The rings run from the outside in: `--id-art`, paper, `--id-alt`, then the band color at the center. The arc is 280px wide. It is 200px at 1100px and below, and 96px at 860px and below, so the arcs never sit under the headline.
- **Hero collage.** The headshot sits in a grid of blocks on the sun field with a quarter circle, a half circle, and a circle.
- **Testimonial avatar.** The initials sit in a 40px circle in the card's identity color.
- **Logo.** The coral block is a quarter round.

Small squares replace round bullets and dots. Card tags, course lists, and the hero affiliation list use 7px to 10px squares.

## Components

### Logo

The mark is a two-by-two grid of color blocks, each holding one icon. The file is `src/assets/logo.svg`. `BrandMark.astro` renders it, and `public/favicon.svg` is a copy.

| Position | Block | Icon | Icon color |
|---|---|---|---|
| Top left | Violet square | Server | White |
| Top right | Teal square | Graduation cap | Ink |
| Bottom left | Coral quarter round | Music notes | Ink |
| Bottom right | Sun square | AI sparkle | Ink |

The icons are drawn by hand on a 24-unit grid and carry no attribution requirement. Use the mark at 40px or larger. Below about 24px the icons lose their shape and only the color blocks read. Run `npm run og` after any change to the mark so that the Open Graph image matches.

### Navigation

The nav bar is paper, at least 64px tall, with a 3px ink rule beneath it. The wordmark sits at the left in Archivo. Each link fills with its identity color on hover and when active. The active link also carries `aria-current="page"`. The Book button is a violet block that stretches the full height of the bar at the right edge and turns sun with ink text on hover. At 860px and below, the links wrap to a second row.

### Page header band

`.cb-band` is the header for every interior page. It takes its background and text color from `--id-bg` and `--id-fg` and carries the corner arcs described under Shapes. `.cb-kicker` is the small uppercase chip above the headline. It reads `--id-chip-bg` and `--id-chip-fg`, so it is legible on every band color.

### Buttons

Buttons are flat blocks with 16px by 24px padding and 14px Inter at weight 800. The primary button is violet with white text. The secondary button is coral with ink text. Both invert to ink with paper text on hover. Adjacent buttons touch with no gap. Transitions change color only and last 120ms to 150ms.

### Section head

`SectionHead` pairs a numbered square with an uppercase label and an `h2`. The square is 76px, or 56px at 720px and below, with the number set bottom left in Archivo at 125% stretch. The `tone` prop sets the square's color. Choose a tone that contrasts with the band behind it. The optional "more" link is underlined, ends with an arrow, and inverts to ink on hover.

### Cards

- **Speaking card.** A 240px minimum block with 30px padding. The fill is white, paper, a tint, or sun. Neighbors in the mosaic never share a fill. A 10px violet square precedes the uppercase tag. A 40px ink square holding an arrow sits at the bottom right. On hover the card inverts to ink, and the arrow square and tag square turn sun.
- **Institution card.** A 200px minimum block in one of five tones: white, lilac, sun, ink, or violet. Each tone sets its own text color, role label color, and bullet square color.
- **Post row.** A three-column row: an ink date block, a white body, and a lilac "Read" block. On hover the row inverts to ink, the date block turns violet, and the "Read" block turns sun.
- **Testimonial card.** A white card with a 64px colored column holding an oversized Archivo quote mark. The column and the avatar take one of the four identity colors. A placeholder card has a 2px inset muted outline and italic muted text.

### Highlight

`HighlightPhrase` sets a phrase on a flat sun block with ink text at weight 700. The hero headline highlight is a violet block with white text.

### Booking form

The form is a white block with a 12px violet top rule. Inputs have a paper background, a 2px ink border, and square corners. The submit button follows the primary button. The error panel is the one place the system uses red: a `#b91c1c` border on a `#fef2f2` background.

### Post prose

Links are violet with a 2px underline and turn into a sun block with ink text on hover. Inline code sits on lilac. Code blocks are ink with paper text and an 8px coral left rule. Block quotes sit on butter with an 8px sun left rule. List markers are violet. Table headers are ink with paper text.

### Footer

The footer is ink. The four-block stripe runs along its top edge. Column headings are small uppercase chips in sun, teal, and coral with ink text. Links are footer-text and turn into a sun block with ink text on hover. The fine-print bar uses footer-dim.

### Focus ring

Every focusable element shows a 3px ink outline at a 3px offset over a 6px sun halo. The pairing stays visible on every block color, including violet.

## Do's and Don'ts

**Do**

- Use each identity color for its own identity. A Book button is violet on every page.
- Put ink text on coral, teal, sun, and every tint.
- Put white or paper text on violet and on ink.
- Separate blocks with a change of color.
- Set mosaic grids with zero gap and alternate fills so that no two neighbors match.
- Use a tint or white for a card that sits inside a colored band.
- Invert a block to ink on hover.
- Keep every text pairing at 7:1 or higher. Check any new pairing before it ships.
- Preserve the skip link, the focus ring, and the `prefers-reduced-motion` rule.

**Do not**

- Do not put white text on coral, teal, or sun.
- Do not put violet text on sun.
- Do not use sun text on violet for body copy. That pairing is for large text and short bold labels.
- Do not add rounded corners, drop shadows, gradients, or decorative outlines.
- Do not add a border between two blocks that already differ in color. The 3px ink rule under the nav and the hero, form input borders, and prose table rules are the existing exceptions.
- Do not introduce a fifth accent color.
- Do not use the logo below 24px where the icons need to be read.
- Do not add a dark theme.
- Do not animate layout or position. Transitions change color only.
