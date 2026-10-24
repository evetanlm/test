# CLAUDE.md

Guidance for working on this repository.

## Project

Horizon Wealth Planning: a one-page marketing website for a fictional financial planning firm. The entire site lives in a single file, `index.html`.

## Hard constraints

- Single file: `index.html`, with CSS in one `<style>` tag and JS in one `<script>` tag.
- Only HTML, CSS and vanilla JavaScript. No frameworks, libraries, bundlers or build tools.
- The only external resource is the Google Fonts stylesheet (Playfair Display, Inter).
- No build, lint or test commands exist. To run the site, open `index.html` in a browser.

## Design system

Colors are CSS custom properties on `:root`. Use the variables, never raw hex values, in new rules.

| Variable | Value | Use |
|---|---|---|
| `--navy` | `#0B2545` | Primary: headers, hero, buttons, headings |
| `--navy-deep` / `--navy-soft` | `#081a31` / `#13315c` | Gradient and hover variants |
| `--gold` | `#C9A227` | Accent: CTAs, eyebrows, highlights |
| `--gold-soft` | `#e6d18a` | Soft accent: borders, step badges |
| `--bg` | `#F7F9FC` | Page background |

Fonts: `--serif` (Playfair Display) for headings, `--sans` (Inter) for body text.

## Responsive approach

Mobile-first. Base styles target phones; enhancements are added with `min-width` media queries at two breakpoints only:

- `768px` (tablet): two-column grids, side-by-side form rows, row-direction hero buttons.
- `1024px` (desktop): the hamburger menu becomes a horizontal nav, three-column service grid, two-column hero, about and contact layouts.

Do not add other breakpoints without a good reason.

## Page structure (in order)

1. Header with sticky nav and hamburger toggle
2. `#top`: hero
3. `#services`: six service cards
4. `#approach`: four-step process (CSS counter numbering)
5. `#planner`: growth projection calculator
6. `#about`: firm values and highlights
7. `#faq`: native `<details>` accordion
8. `#contact`: contact form
9. Footer with legal disclaimer

SVG icons are defined once in a hidden `<svg>` sprite at the top of `<body>` and referenced with `<use href="#i-name">`.

## JavaScript (single IIFE at end of body)

- Mobile nav toggle (keeps `aria-expanded` in sync, closes on link click, Escape, or resize to desktop)
- Active nav link highlighting on scroll
- Back-to-top button
- Scroll-reveal via `IntersectionObserver` on `.reveal` elements. The `no-js` class on `<body>` is removed by JS so content stays visible without scripting.
- Growth planner: future value with monthly compounding, `FV = P(1+r)^n + PMT·((1+r)^n − 1)/r`, with `r = annual/12` and `n = years × 12`. A 0% rate is handled separately.
- Contact form validation. **The form does not send data anywhere.** The submit handler only shows a confirmation message. Wire a real endpoint in the marked comment in the submit handler.

## Content notes

- Contact details (phone, email, address) and the highlight figures in the About section are placeholders.
- There are deliberately no client testimonials. Only add real ones with the client's permission.
- Projections and illustrations must stay labelled as hypothetical. Keep the financial disclaimers in the footer and next to the planner. Do not add return guarantees, performance claims or regulatory-status claims without confirmation from the firm.

## Accessibility conventions to preserve

- Skip link to `#main`, visible `:focus-visible` outlines, semantic landmarks
- `aria-expanded` and `aria-controls` on the nav toggle; `aria-live` on planner results and form status
- Form errors marked with `aria-invalid`
- `prefers-reduced-motion` disables transitions and animation
