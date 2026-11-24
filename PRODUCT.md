# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: founders and marketing/sales leads at B2B SMEs and startups in Spain and Latin America. They have a growing set of marketing and sales tools (CRM, ads, outreach, automation) but no in-house marketing operations team to choose, connect and run them. They come to the site to work out which tools they need and whether wisdo can run the system for them.

Secondary: visitors who arrive for wisdo Market (tool research, comparisons) or the free website diagnosis, and may later become service clients.

## Product Purpose

wisdo is a marketing operations partner. It helps companies build their marketing and sales stack in one place: a free diagnosis of what they need, vetted tools from wisdo Market, and a team that sets up, connects and runs those tools (HubSpot, paid media, automation, tracking).

Success on the public site means booked calls and consulting clients first. Market and the diagnosis exist mainly to attract and qualify those leads; affiliate revenue from Market is secondary.

## Positioning

wisdo joins the client's growth effort as their operations partner rather than handing over a one-off setup: it recommends the stack (from the same shortlist it uses on client projects), implements it and keeps operating it, measured end to end. Certified HubSpot, Google and Meta partners.

## Operating Context

- Public marketing site (Astro, deployed on Vercel): home, Solutions, AI & Automation, wisdo Market (`/market/`), free diagnosis (`/diagnosis/`), contact and "Book a call".
- wisdo Market: 28 vetted tools across 9 categories (`src/data/tools.ts`), with category filters, a 3-way comparator and a full comparison table. Shared component `src/components/site/MarketSections.astro`, shown on both `/market/` and the home.
- Diagnosis: the visitor enters their website and gets a recommended stack (which tools, what each does, what it costs).
- Logged-in dashboard (`/dashboard/`) with analyses and reports, backed by Supabase.
- Affiliate clicks go through `/go/{slug}/` for tracking before redirecting to the partner link.

## Capabilities and Constraints

- Services: AI & marketing automation; Google and Meta campaign launch and optimization; HubSpot CRM implementation and sales process (revenue ops); tracking and attribution.
- Market links are partly affiliate links; every place that shows them must carry the affiliate disclosure.
- Site copy is currently in English while the target markets are Spain and Latin America. Whether to localize to Spanish is undecided.

## Brand Commitments

- Name written in lowercase as "wisdo" in copy; the logo wordmark reads "Wisdo".
- Logo kit in `public/brand/` (eclipse ring + diamond spark symbol, Space Grotesk wordmark). Use `wisdo-logo-dark.svg` on dark backgrounds and the light variant on light ones; app icons and favicons in `public/brand/icons/`.
- Brand colors from the kit: green `#13C28A`, dark core `#0B0A14`, ink `#171528`, highlight `#E9FFF6`, glow `#5EE0B0`.
- Positioning line in use: "Marketing operations partner"; home headline "Build your marketing and sales stack in one place."

## Evidence on Hand

- Partner certifications: HubSpot, Google and Meta (stated on the site).
- Market catalogue with G2 ratings and review counts per tool (`src/data/tools.ts`).
- No real client results, case studies or testimonials yet. The home's results figures and the "Pipeline performance" panel (CPL, MQL, win rate, ROAS) are placeholders marked in code; future work must not present them, or any invented numbers, logos or testimonials, as real.

## Product Principles

1. Service first: every surface should lead toward a conversation with the wisdo team; Market and the diagnosis are the entry points, not the destination.
2. Honest over impressive: vetted tools, clear affiliate disclosure, no paid rankings and no fabricated proof.
3. Partner, not vendor: talk about running the client's system with them over time, not one-off deliverables.
4. Practical for small teams: plain language, clear costs and next steps for founders without an ops team.
