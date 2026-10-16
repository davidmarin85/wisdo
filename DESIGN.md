# DESIGN.md — wisdo.io

Design system of the live marketing site (https://www.wisdo.io) as built in this repo.
Source of truth: `src/layouts/SiteLayout.astro`, `src/components/site/*`, `src/pages/index.astro`, `src/styles/responsive.css`.

> **Heads-up:** `src/styles/global.css` (purple `#6C5CE7`, cream background, Plus Jakarta Sans) is only imported by `BaseLayout.astro`, which **no page uses**. It is a legacy token set and does not describe the live site. Don't build from it until it is either deleted or updated to match this file.

---

## 1. Brand essence

- **Positioning:** AI-powered growth consultancy — "Marketing that runs itself. Measured end to end."
- **Personality:** technical, calm, data-first. Looks like an analytics product, not an agency.
- **Visual metaphor:** a dashboard on graph paper — near-black canvas, hairline borders, monospace labels, one blue accent for "signal".
- **Rule of restraint:** grayscale does 95% of the work. Blue marks what matters (a KPI, an active step, a link). Green appears only in the logo dot.

## 2. Logo

| Element | Spec |
|---|---|
| Wordmark | `wisdo`, always lowercase, Space Grotesk 700, 20–21px, letter-spacing −0.42px, `#ffffff` |
| Dot | 9×9px circle, `#13C28A`, 10px left of the wordmark |
| Nav variant | Dot with glow: `box-shadow: 0 0 12px #13C28A` |
| Footer variant | Dot without glow, wordmark 20px |
| Legal name | "WISD Global" (footer copyright only) |

Favicon (`public/favicon.svg`) is currently a `#2563eb` square with a white "w" — **off-brand**; should become the green dot + "w" on `#0a0a0a`.

## 3. Color

Dark-only. No light theme on the marketing site.

### Core palette

| Token | Hex | Use |
|---|---|---|
| `bg` | `#0a0a0a` | Page background, nav (at 88% opacity + blur) |
| `surface` | `#141414` | Cards, panels, input wrappers, active nav pill |
| `surface-alt` | `#0f0f0f` | Rare, nested surfaces |
| `line` | `#1e1e1e` | Hairline borders, section dividers, grid pattern |
| `line-strong` | `#313131` | Input borders, chart bars (inactive), tag borders |
| `line-button` | `#454545` | Secondary (outline) button border |
| `text` | `#ffffff` | Headings, primary text, primary button fill |
| `text-muted` | `#a7a7a7` | Body copy, labels, table values |
| `text-subtle` | `#7c7c7c` | Notes, footnotes, copyright, hover border on outline buttons |
| `hover-light` | `#e6e6e6` | Hover fill for white buttons |
| `accent` | `#6798ff` | KPIs, active step numbers, focus rings, links-as-CTA, highlighted chart bars |
| `brand-green` | `#13C28A` | Logo dot only |
| `error` | `#ff7a7a` | Form error text |

### Usage ratios
- ~85% `#0a0a0a` / `#141414`
- ~12% white + grays
- ~3% `#6798ff`
- Never use blue for large fills or full buttons. Never put green anywhere except the logo.

## 4. Typography

| Role | Family | Weight | Notes |
|---|---|---|---|
| UI / body / headings | **Inter** | 400, 500, 600 | Headings use **500**, not bold |
| Labels, eyebrows, data | **JetBrains Mono** | 400 | Usually uppercase, tracked |
| Wordmark only | **Space Grotesk** | 700 | Not used for headings |

Google Fonts URL: `family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&family=Space+Grotesk:wght@700`

### Type scale

| Style | Size | Line-height | Tracking | Weight |
|---|---|---|---|---|
| Display (H1 hero) | `clamp(38px, 5.2vw, 64px)` | 1.13 | −2.3px | 500, `text-wrap: balance` |
| Display CTA (closing H2) | `clamp(32px, 4.4vw, 56px)` | 1.14 | −1.74px | 500 |
| H2 section | `clamp(28px, 3.6vw, 40px)` | 1.2 | −0.84px | 500 |
| Stat big | 40px | — | −0.84px | 500 |
| Stat / metric | 24px | — | −0.6px | 500 |
| Card title | 20px | — | −0.42px | 500 |
| Body | 16px | 1.5 | −0.25px | 400, muted |
| Small body | 14px | 1.57 | −0.25px | 400, muted |
| Note | 13px | 1.5 | — | 400, subtle |
| Eyebrow / label (mono) | 12px | — | +0.85px | 400, UPPERCASE |
| Logo strip (mono) | 14px | — | +1.16px | 400, UPPERCASE |

Pattern: **negative tracking on Inter, positive tracking on mono.** Max text width 480–640px for paragraphs.

## 5. Layout & spacing

- **Container:** `max-width: 1200px; margin: 0 auto; padding: 0 24px` (20px on ≤640px).
- **Section padding:** 80px vertical (96px for hero and closing CTA). Mobile: 48px / 56px.
- **Section separation:** every section ends with `border-bottom: 1px solid #1e1e1e`. No background color changes between sections.
- **Spacing steps in use:** 4, 6, 8, 10, 12, 16, 24, 32, 40, 64, 80, 96px.
- **Eyebrow → H2:** 32px. **H2 → paragraph:** 16px. **Paragraph → actions/grid:** 32–40px.
- **Grids:**
  - Two-column split: `repeat(auto-fit, minmax(380px, 1fr))`, gap 64px → stacks at ≤820px.
  - Card grids: `repeat(auto-fit, minmax(240–260px, 1fr))`, gap 16px → 1 column at ≤600px.
  - Stat tiles: `minmax(150px, 1fr)` → 2 per row at ≤420px.

### Graph-paper background
Used on hero, "How it works" and closing CTA (alternate with plain sections):
```css
background-color: #0a0a0a;
background-image:
  linear-gradient(#1e1e1e 1px, transparent 1px),
  linear-gradient(90deg, #1e1e1e 1px, transparent 1px);
background-size: 48px 48px;
```

## 6. Shape, borders, elevation

| Token | Value |
|---|---|
| Radius — cards, buttons, panels | 8px |
| Radius — input wrapper | 10px (inner button 7px) |
| Radius — mini tag | 4px |
| Radius — chart bar top | 3px |
| Radius — nav pill | 9999px |
| Border | always 1px solid; `#1e1e1e` default |
| Shadows | **none.** Depth = surface color + hairline. Only exception: logo-dot glow |
| Blur | Nav: `background: rgba(10,10,10,0.88); backdrop-filter: blur(12px)` |

## 7. Components

### Navigation (sticky)
- Height ~64px, `position: sticky; top: 0; z-index: 20`, bottom hairline.
- Left: logo. Then pills (`Solutions · Market · AI & Automation`): 8px 14px padding, 14px/500, radius full; active and hover = `#141414` fill.
- Right: primary button "Book a call" (small: 8px 16px).
- Mobile (≤640px): logo + button on row 1, pills on row 2.

### Buttons
| Variant | Style | Hover |
|---|---|---|
| Primary | `#ffffff` bg, `#0a0a0a` text, 12px 20px, radius 8px, 14px/500 | bg `#e6e6e6` |
| Secondary | transparent, `1px solid #454545`, white text | border `#7c7c7c` |
| Text link CTA | `#6798ff`, 14px/500, trailing `→` | — |

No blue or green filled buttons. Max two buttons side by side (gap 8px): primary first.

### Cards
```css
background: #141414;
border: 1px solid #1e1e1e;
border-radius: 8px;
padding: 24px;
```
Content order: mono label (12px, `01 — PAID MEDIA` / `STEP 01`) → 16px → title 20px/500 → 8px → description 14px muted. Clickable card: label + "Explore →" in blue; hover border `#313131`.

### Tile grid (1px-gap mosaic)
Container `background: #1e1e1e; gap: 1px; border: 1px solid #1e1e1e; border-radius: 8px; overflow: hidden;` with `#141414` cells, 24px padding. Creates hairline dividers without borders. Used for the HubSpot capability grid and Market stats.

### Dashboard panel (hero visual)
- Card with header: 8px blue square + title 14px/500 + mono pill (`LAST 30 DAYS`, 1px `#313131`, radius 4px).
- KPI row: 3 columns, mono label + 24px value; the hero KPI in blue.
- Bar chart: bars `#313131`, highlighted bars `#6798ff`, gap 6px, top radius 3px.
- Table: mono header row, 14px rows, `1px #1e1e1e` row dividers, secondary column muted.

### Stat block
Mono label in blue with a glyph (`↑ CONVERSION`, `◷ TIME SAVED`, `⌾ EFFICIENCY`) → 40px value → 16px/500 caption → 14px muted explanation. Centered.

### Diagnosis input (URL scan)
- Label: mono 12px uppercase **blue**.
- Wrapper: `#141414`, `1px solid #313131`, radius 10px, padding 6px; `:focus-within` border `#6798ff`.
- Input: transparent, 15px, placeholder `yourcompany.com`.
- Button inside: white primary, radius 7px. Stacks vertically ≤480px.
- Note below: 13px `#7c7c7c`, inline link `#a7a7a7` underlined.

### Contact form
Fields in 2-column rows (first/last name, email/phone), then full-width company and message. Input focus border `#6798ff`. Honeypot field hidden. Submit = primary button; note "We reply within one business day." Error text `#ff7a7a`.

### Logo strip
"Trusted by growing companies" (14px/500) + client names as mono 14px uppercase `#a7a7a7`, tracking 1.16px, gap 40px. Text, not images.

### Footer
3 columns (brand + description + phone / Explore / Contact). Column heads mono 12px uppercase. Links 14px white. Bottom bar: hairline, `© 2026 WISD Global` left, `MADRID · LATAM` mono right, both `#7c7c7c`.

## 8. Iconography & imagery

- No icon library and no photography. "Icons" are Unicode glyphs in mono labels (`↑ ◷ ⌾ →`) and small geometric marks (8px square, 9px dot).
- Data visuals are built in HTML/CSS (bars, tables), not images.
- If imagery is ever added: product UI screenshots on `#141414` panels, never stock photos.

## 9. Motion

Minimal. Hover transitions only (fill / border color). No scroll animations. Smooth anchor scrolling with `scroll-margin-top: 88px` (124px on mobile) for the sticky nav.

## 10. Voice & copy

- **Language:** English for all user-facing content.
- **Tone:** plain, confident, specific. Short declarative sentences. No hype words.
- **Headline pattern:** a claim + a period. "HubSpot, run properly." "Tell us what's not growing."
- **Proof over promise:** numbers (CPL, MQL, ROAS, %), named partners (HubSpot · Google Ads · Meta), concrete cadence ("two-week cycle").
- **Eyebrows:** 1–3 words, uppercase mono ("What we do", "How it works", "Next step").
- **CTAs:** verb-first and literal — "Book a call", "Analyze my website", "Open the marketplace →", "Email us instead".
- **Numbering:** `01 — LABEL` for services, `STEP 01` for process.

## 11. Responsive breakpoints

| Breakpoint | Change |
|---|---|
| ≤820px | Two-column splits stack, gap 40px |
| ≤720px | Logo strip wraps full width; comparison table rows become stacked cards with `data-l` labels |
| ≤640px | Gutter 20px, section padding reduced, nav splits into 2 rows, long strings wrap |
| ≤600px | Card grids → 1 column |
| ≤480px | Diagnosis input stacks |
| ≤420px | Stat tiles → 2 per row |

## 12. Implementation notes

- Styles are currently inline `style=""` attributes (exported from a design tool); `responsive.css` overrides them with attribute selectors and `!important`. When refactoring, move the values in this file into CSS custom properties, e.g.:

```css
:root {
  --bg: #0a0a0a;
  --surface: #141414;
  --line: #1e1e1e;
  --line-strong: #313131;
  --line-button: #454545;
  --text: #ffffff;
  --text-muted: #a7a7a7;
  --text-subtle: #7c7c7c;
  --hover-light: #e6e6e6;
  --accent: #6798ff;
  --brand-green: #13C28A;
  --error: #ff7a7a;

  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --font-logo: 'Space Grotesk', sans-serif;

  --radius: 8px;
  --container: 1200px;
  --gutter: 24px;
  --section-y: 80px;
}
```

- Global link hover is `#6798ff` (`SiteLayout.astro`).
- Placeholder content still live on the homepage: the three stat figures ("PLACEHOLDER FIGURES — REPLACE WITH YOUR REAL NUMBERS") and the client logo names.
