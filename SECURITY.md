# SECURITY.md

How the Horizon site is hardened, what that does and does not cover, and what to do before launch.

## 1. Content Security Policy (meta tag in `index.html`)

The policy is deny-by-default:

| Directive | Value | Why |
|---|---|---|
| `default-src` | `'none'` | Nothing loads unless explicitly allowed |
| `script-src` | one `sha256-` hash | Only the exact inline script runs. Injected inline scripts and event handlers are blocked |
| `style-src` | one `sha256-` hash + `fonts.googleapis.com` | Only the exact inline stylesheet and the Google Fonts CSS |
| `font-src` | `fonts.gstatic.com` | Font files only |
| `img-src` | `'self' data:` | No third-party images or trackers |
| `connect-src` | `'none'` | No network calls from JS until you add your form endpoint |
| `form-action`, `base-uri`, `object-src` | `'none'` | Blocks form hijacking, `<base>` tricks and plugins |

Because the policy uses hashes, **any edit to the inline CSS or JS changes its hash and the browser will block it.** After editing, run from the repo root:

```bash
python3 - <<'EOF'
import re, hashlib, base64
p = 'index.html'
s = open(p, encoding='utf-8').read()
h = lambda t: 'sha256-' + base64.b64encode(hashlib.sha256(t.encode('utf-8')).digest()).decode()
style = re.search(r'<style>(.*?)</style>', s, re.S).group(1)
script = re.search(r'<script>(.*?)</script>', s, re.S).group(1)
s = re.sub(r"(script-src )'sha256-[^']+'", lambda m: m.group(1) + "'" + h(script) + "'", s)
s = re.sub(r"(style-src )'sha256-[^']+'", lambda m: m.group(1) + "'" + h(style) + "'", s)
open(p, 'w', encoding='utf-8').write(s)
EOF
```

Rules that keep the policy working: no inline `style="..."` attributes, no inline `on...=` handlers, no `javascript:` links, no `innerHTML` with user data. (Setting `element.style.x` from JS is fine.)

### Limits of a meta CSP

`frame-ancestors`, `report-uri`/`report-to` and `X-Frame-Options` are ignored in meta tags. GitHub Pages cannot send custom headers, so if you need these, put the site behind Cloudflare, Netlify, or Vercel and set real headers:

```
Content-Security-Policy: <same policy>; frame-ancestors 'none'
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## 2. Form defences (client side)

- **Validation by allowlist:** names (letters, spaces, hyphen, apostrophe), email, phone and a length-capped free-text note. Choice questions only accept known values.
- **Normalisation:** Unicode NFKC, control and invisible characters removed, whitespace collapsed.
- **Injection tripwires:** inputs containing tag-like text, `javascript:`, inline handlers or common SQL patterns are rejected. This is a friendly first filter and a **tripwire, not a defence**: determined attackers skip the browser entirely.
- **Safe rendering:** user text is only ever written with `textContent`, never `innerHTML`.
- **Anti-bot:** two off-screen honeypot fields, a "human interaction" flag, and a minimum fill time. Bots get a fake success message so they learn nothing.
- **Rate limiting (UX level):** 30 s cooldown and 3 submissions per hour per browser via `localStorage`. Easy to bypass, so it only stops casual spam.

## 3. Server side (required once you add an endpoint)

The form ships in demo mode (`CONFIG.endpoint = ''`) and sends nothing. Before pointing it at a real endpoint:

1. Set `CONFIG.endpoint` in `index.html` and add that origin to `connect-src` in the CSP, then re-hash.
2. **Re-validate every field on the server** with the same allowlists. Never trust the browser.
3. **SQL injection:** use parameterised queries or an ORM. Never build SQL by string concatenation. Input filtering does not replace this.
4. **XSS:** encode output for its context (HTML, attribute, JS) wherever submissions are displayed, including admin dashboards and emails.
5. **Rate limit by IP and by email** server-side, and return 429 when exceeded.
6. **CORS:** allow only your site's origin. Reject requests with other `Origin` values.
7. Add a CAPTCHA or proof-of-work (for example Cloudflare Turnstile) if bot traffic gets through. This needs its script origin added to the CSP.
8. Cap request body size (a few KB is plenty), require `Content-Type: application/json`, and drop unknown fields.
9. Do not log full personal data. Treat submissions as personal data under the regulations that apply to your clients, and publish a privacy notice.

Minimal Node/Express sketch of the server-side checks:

```js
import express from 'express';
import rateLimit from 'express-rate-limit';

const app = express();
app.use(express.json({ limit: '4kb' }));
app.use(rateLimit({ windowMs: 60 * 60 * 1000, max: 10 }));

const TOPICS = ['retire','invest','tax','protect','legacy','family','unsure'];
const STAGES = ['start','build','near','enjoy'];

app.post('/horizon', (req, res) => {
  if (req.get('origin') !== 'https://YOUR-SITE.example') return res.sendStatus(403);
  const { topic, stage, name, email, phone = '', note = '' } = req.body ?? {};
  const ok =
    TOPICS.includes(topic) && STAGES.includes(stage) &&
    /^[\p{L}][\p{L}\p{M} .'’-]{1,59}$/u.test(name) &&
    /^[a-z0-9._%+-]{1,64}@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(email) && email.length <= 254 &&
    /^(\+?[0-9 ()-]{7,20})?$/.test(phone) && String(note).length <= 300;
  if (!ok) return res.sendStatus(400);
  // Store with parameterised queries only, e.g. db.query('INSERT ... VALUES ($1,$2,$3)', [name, email, note]);
  res.sendStatus(204);
});
```

## 4. Checklist before launch

- [ ] Replace placeholder contact details and the highlight figures
- [ ] Configure and test the form endpoint, then update `connect-src` and re-hash
- [ ] Confirm the claims on the site (fiduciary status, no commissions, free first chat) are accurate for the firm and its regulator
- [ ] Add real response headers via your host or CDN
- [ ] Publish a privacy notice
