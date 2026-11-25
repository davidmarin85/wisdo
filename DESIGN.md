---
name: wisdo
description: Marketing operations partner. Dark, precise interface with one brand-green signal.
colors:
  signal-green: "#13C28A"
  glow-mint: "#5EE0B0"
  spark-white: "#E9FFF6"
  eclipse-core: "#0B0A14"
  night-canvas: "#0A0A0A"
  panel: "#141414"
  hairline: "#1E1E1E"
  control-stroke: "#313131"
  ghost-stroke: "#454545"
  text-primary: "#FFFFFF"
  text-secondary: "#A7A7A7"
  text-tertiary: "#7C7C7C"
  placeholder: "#8F8F8F"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(38px, 5.2vw, 64px)"
    fontWeight: 500
    lineHeight: 1.13
    letterSpacing: "-2.3px"
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(28px, 3.6vw, 40px)"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.84px"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.42px"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.25px"
  body-small:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.57
    letterSpacing: "-0.25px"
  label:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.85px"
  wordmark:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "21px"
    fontWeight: 700
    letterSpacing: "-0.42px"
rounded:
  xs: "4px"
  sm: "8px"
  md: "10px"
  lg: "12px"
  pill: "9999px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "32px"
  xl: "40px"
  section: "80px"
  hero: "96px"
components:
  button-primary:
    backgroundColor: "{colors.text-primary}"
    textColor: "{colors.night-canvas}"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "#E6E6E6"
    textColor: "{colors.night-canvas}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
  text-link-accent:
    textColor: "{colors.signal-green}"
  input-field:
    backgroundColor: "#0F0F0F"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    padding: "12px 14px"
  nav-pill:
    textColor: "{colors.text-primary}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  nav-pill-active:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  chip-filter:
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
  chip-filter-active:
    backgroundColor: "{colors.text-primary}"
    textColor: "{colors.night-canvas}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
  card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    padding: "24px"
---

# Design System: wisdo

## Overview

**Creative North Star: "The Operations Room"**

wisdo looks like a control room after hours: a near-black canvas, thin hairlines that organise information into panels, and a single brand-green signal that says the system is running. The interface is the calm, competent surface of a team that operates the client's marketing and sales stack. It should feel precise and quiet, never flashy, with data and plain language doing the persuading.

Density is moderate. Content sits in a 1200px column with generous section padding, so each block reads as one console module. Hierarchy comes from size and weight in a single sans family (Inter), with a monospace label voice (JetBrains Mono) reserved for data, measurements and small metadata. Colour is almost entirely neutral; green is the only chromatic voice and is spent on action, state and the numbers that matter.

The brand mark (an eclipse ring with a diamond spark) is the source of the palette: dark core, green ring, bright spark. Use it as a quiet signature, not as decoration.

**Key Characteristics:**
- Dark, flat, hairline-structured panels on a near-black canvas.
- One accent: brand green. Everything else is neutral greys and white.
- Inter at weight 500 for headings, tight negative tracking at display sizes.
- Monospace only for data, prices, ratings and short metadata.
- White solid buttons for the primary action; green for links, focus and selection.
- Honest content: example data is always labelled as an example.

## Colors

A neutral night palette with a single brand-green signal taken from the logo kit.

### Primary
- **Signal Green** (`signal-green`): the brand colour. Text links and inline CTAs ("Try lemlist →"), highlighted stats, active/selected borders, focus border on inputs, text selection background, numbered markers. Exposed as the CSS token `--accent`.
- **Glow Mint** (`glow-mint`): the brighter companion for small text on dark panels (prices in the example diagnosis) and the keyboard focus outline. Token `--accent-hi`.
- **Spark White** (`spark-white`): green-tinted near-white for text sitting on green-tinted surfaces (tags, "Example" badge). Token `--accent-soft`.

### Neutral
- **Night Canvas** (`night-canvas`): page background everywhere on the public site.
- **Eclipse Core** (`eclipse-core`): the logo's inner core; use for brand assets and email headers, not for page backgrounds.
- **Panel** (`panel`): cards, tool cards, stat tiles, the diagnosis input, active nav pill.
- **Hairline** (`hairline`): section dividers, card borders, table separators, and the 48px background grid lines.
- **Control Stroke** (`control-stroke`): borders of inputs, chips, tags and small badges.
- **Ghost Stroke** (`ghost-stroke`): border of secondary (ghost) buttons.
- **Text Primary** (`text-primary`): headings, body emphasis, primary button fill.
- **Text Secondary** (`text-secondary`): supporting paragraphs, card descriptions, metadata.
- **Text Tertiary** (`text-tertiary`): fine print, disclosures, helper notes.
- **Placeholder** (`placeholder`): input placeholder text (meets 4.5:1 on panel).

### Named Rules
**The One Signal Rule.** Green is the only accent. It marks what is actionable, selected or important. If a screen has green on decoration, remove it.

**The Lit Panel Rule.** Text on a green-tinted surface uses Spark White or Text Primary, never grey.

## Typography

**Display Font:** Inter (with system-ui, sans-serif)
**Body Font:** Inter (with system-ui, sans-serif)
**Label/Mono Font:** JetBrains Mono (with monospace)
**Wordmark:** Space Grotesk Bold, used only inside the logo and the dashboard wordmark (the logo SVG has it outlined).

**Character:** A single neutral sans carries everything at weight 500 with tight tracking, which reads as engineered and calm. The monospace voice is the instrument readout: small, spaced, used for numbers and metadata.

### Hierarchy
- **Display** (500, clamp 38–64px, 1.13): the page H1 only, with `text-wrap: balance`.
- **Headline** (500, clamp 28–40px, 1.2): section H2s. Closing CTA H2s may go up to clamp 32–56px.
- **Title** (500, 20px): card and tool names.
- **Body** (400, 16px, 1.5): section intros; keep to about 480–560px wide.
- **Body Small** (400, 14px, 1.57): card descriptions, table cells, notes.
- **Label** (400, 12px mono, 0.85px tracking): data labels, categories, ratings, prices; uppercase only when it is a category or column header.

### Named Rules
**The Readout Rule.** Monospace is for data and measurement (prices, ratings, counts, column headers). Don't use it for sentences or as a decorative "tech" costume.

**The Sentence Case Rule.** All headings are sentence case; only proper nouns are capitalised.

## Layout

Content lives in a centred column (max-width 1200px, 24px side padding). Each section is a full-width band separated by a 1px hairline (`hairline`), with 80px vertical padding (96px for the hero and closing CTA). Two-column sections use `repeat(auto-fit, minmax(380px, 1fr))` with a 64px gap, collapsing to one column on phones. Card grids use `minmax(300px, 1fr)` (tools) or `minmax(240–260px, 1fr)` with 16px gaps. The hero and closing CTA sit on a 48px grid of hairlines; other sections are plain canvas. Spacing follows the 8px scale in the frontmatter: 8 / 16 / 24 / 32 / 40, then 64 between columns and 80–96 between sections. The sticky header keeps "Book a call" visible; anchored sections use `scroll-margin-top` (88px, 124px on phones).

## Elevation & Depth

The system is flat. Depth comes from tonal layering (canvas → panel) and 1px hairlines, not shadows. The sticky header uses a translucent canvas (`rgba(10,10,10,0.88)`) with a 12px backdrop blur so content passes beneath it.

### Named Rules
**The Flat Console Rule.** No drop shadows and no coloured glows on cards or panels. Separate surfaces with a tone step or a hairline.

## Shapes

Gently rounded rectangles throughout: 8px for cards, buttons and inputs; 10–12px for larger composite panels (diagnosis input row, example diagnosis); 4px for small tags and mono badges; full pills for nav links and filter chips. Borders are always 1px and always full (all four sides). Numbered markers are circles.

## Components

### Buttons
- **Shape:** gently rounded (8px).
- **Primary:** solid white with near-black text, 14px weight 500, 12px × 20px padding (8px × 16px in the header). One primary per view.
- **Hover / Focus:** hover fills to light grey (#E6E6E6); keyboard focus shows a 2px Glow Mint outline offset by 2px.
- **Ghost:** transparent with a 1px Ghost Stroke border and white text; hover lightens the border to #7C7C7C.
- **Text link CTA:** Signal Green, 14px weight 500, trailing arrow ("Try lemlist →").

### Chips
- **Style:** pill, 1px Control Stroke border, Text Secondary label, 14px.
- **State:** selected chips invert to solid white with near-black text. Comparator selections use a Signal Green border with white text.

### Cards / Containers
- **Corner Style:** 8px.
- **Background:** Panel on Night Canvas.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** 1px Hairline.
- **Internal Padding:** 24px; footers separated by a hairline with 16px top padding.

### Inputs / Fields
- **Style:** dark fill (#0F0F0F or Panel), 1px Control Stroke border, 8px radius (10px for the hero diagnosis row, which holds an inline primary button), 16px text to avoid iOS zoom.
- **Focus:** border shifts to Signal Green; caret is Signal Green.
- **Placeholder:** Placeholder grey.
- **Error:** inline message with `role="alert"`, user input kept.

### Navigation
- **Style:** sticky translucent header with the logo (30px high, dark variant), pill links (14px, weight 500), active link on a Panel background, and the white "Book a call" button on the right. On phones the links wrap to a second row.

### Tool Card (signature)
A Panel card for each Market tool: a 36px mono monogram tile, tool name (Title), a mono metadata line (category · G2 rating), tagline, description, tags, and a hairline footer with the price on the left and a Signal Green "Try/Get X →" link on the right. Affiliate disclosure must sit near any group of these cards.

### Example Diagnosis Panel (signature)
The hero panel: a 12px-radius panel with the brand mark and title, an "Example" pill badge (Spark White on a 14% green tint), the input summary as a key/value list, a numbered list of recommended tools with Signal Green circular markers and Glow Mint prices, and a closing line separated by a hairline. Prices come from the live catalogue; it must always be labelled as an example.

## Do's and Don'ts

### Do:
- **Do** use Signal Green (`--accent`) for every link, selection, focus border and highlighted value, and nothing else.
- **Do** keep surfaces flat: Night Canvas, Panel, and 1px hairlines.
- **Do** use the dark logo (`/brand/svg/wisdo-logo-dark.svg`) at 30px high on dark backgrounds.
- **Do** label any illustrative data as "Example" and pull real prices and ratings from the catalogue.
- **Do** keep headings in sentence case, Inter weight 500, with negative tracking at display sizes.

### Don't:
- **Don't** reintroduce the old blue accent (#6798FF).
- **Don't** use the legacy purple (#6C5CE7 family) or cream (#FBF9F5) palette from `src/styles/global.css`; it belongs to the retired light pages and is obsolete for new work.
- **Don't** add drop shadows, coloured glows, gradient text or one-sided accent borders to cards.
- **Don't** set sentences or headings in monospace.
- **Don't** show invented client logos, metrics or testimonials as if they were real.
