# CLAUDE.md

Guidance for working on this repository.

## Project

Horizon Wealth Planning: a one-page marketing website for a fictional financial planning firm, styled as a warm, "cute and cozy" brand for people who find finance intimidating. The entire site lives in a single file, `index.html`.

## Hard constraints

- Single file: `index.html`, with CSS in one `<style>` block and JS in one `<script>` block.
- Only HTML, CSS and vanilla JavaScript. No frameworks, libraries, bundlers or build tools.
- External resources: the Google Fonts stylesheet only (Fredoka for headings, Nunito for body).
- No build, lint or test commands. To run the site, open `index.html` in a browser.
- **CSP hashes:** the Content Security Policy meta tag allows the inline style and script only by SHA-256 hash. After ANY edit to the CSS or JS, re-run the re-hash snippet in `SECURITY.md`, or the browser will block them.
- Never add inline `style="..."` attributes, inline `on...=` handlers, `javascript:` URLs, or `innerHTML` with user data. Write user text with `textContent` only.

## Design system

Colors are CSS custom properties on `:root`. Use the variables, not raw hex values, in new rules.

| Variable | Value | Use |
|---|---|---|
| `--cream` | `#FFFDF9` | Page background |
| `--mint` / `--mint-mid` | `#E2F5ED` / `#BFE8D5` | Bands, cards, soft fills |
| `--mint-deep` | `#2A7458` | Primary action color (white text) |
| `--butter` / `--butter-deep` | `#FFF1B8` / `#F6D860` | Pastel yellow accents, primary buttons |
| `--peach` | `#FFE3D6` | Third card tint |
| `--ink` / `--ink-soft` | `#3B3835` / `#6A645E` | Warm charcoal text and borders (never pure black) |

Style rules: pill-shaped buttons, 24px card radius (`--r`), 3px charcoal outlines with a hard offset shadow (`--pop`). Copy is friendly and uses everyday analogies instead of finance jargon.

## Responsive approach

Mobile-first with two `min-width` breakpoints only: `768px` (tablet) and `1024px` (desktop, horizontal nav). Do not add others without good reason.

## Page structure (in order)

1. Sticky header and nav (CTA: "Claim My Free Money Chat")
2. `#top`: hero with piggy bank illustration
3. `#services`: six cozy-analogy cards (Retirement, Investment, Tax, Risk, Estate, Family)
4. `#approach`: four steps (Discover, Design, Implement, Review)
5. `#meter`: the Wealth-O-Meter (piggy bank calculator)
6. `#about`: promises and highlights
7. `#faq`: native `<details>`
8. `#quiz`: six-question Financial Fit Quiz (replaces the contact form)
9. Footer with legal disclaimer

## JavaScript (single IIFE at end of body)

- Nav toggle, active-link highlighting, back-to-top, scroll reveal
- Wealth-O-Meter: `FV = P(1+r)^n + PMT·((1+r)^n − 1)/r`, `r = annual/12`, `n = years × 12`; 0% handled separately
- Quiz: one question at a time (topic, stage, name, email, optional phone, optional note), with allowlist validation, honeypots, minimum-fill-time check and a browser-level rate limit
- `CONFIG.endpoint` is empty, so the quiz runs in **demo mode and sends nothing**. See `SECURITY.md` before wiring a real endpoint.

## Content notes

- Phone, email, address and the highlight figures in the About section are placeholders.
- No client testimonials on purpose. Only add real ones with permission.
- Keep projections labelled as hypothetical and keep the footer disclaimers. Do not add return guarantees, performance claims or regulatory-status claims without confirmation from the firm.

## Accessibility conventions to preserve

- Skip link, visible `:focus-visible` outlines, semantic landmarks
- `aria-expanded`/`aria-controls` on the nav toggle; `aria-live` on meter results and quiz result; `role="progressbar"` on the quiz progress
- `prefers-reduced-motion` disables transitions and animation

## Tooling

- `.mcp.json` registers the Playwright MCP server (`npx -y @playwright/mcp@latest`) at project level. Browser binaries may need `npx playwright install chromium` on first use.
- `.github/workflows/deploy.yml` publishes `index.html` to GitHub Pages on push to `main`. Pages must be set to the "GitHub Actions" source.
