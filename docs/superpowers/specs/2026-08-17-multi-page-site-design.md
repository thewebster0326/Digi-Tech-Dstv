# Digitech DSTV — Multi-Page Website Rebuild

## Overview

Replace the current single-page "coming soon" placeholder at digitechdstv.co.za with
a full multi-page marketing site for the rebranded business (formerly "Digitech
Satellites", now "Digitech DSTV"). Content is sourced from the client's old site
(digitechsatellites.co.za) and adapted to the new brand. The site adds a
developer-managed blog and dedicated service-area pages for local SEO.

## Goals

- Multi-page static site (not a single scrolling page)
- Blog that the developer (not the client) publishes to, by adding files and
  pushing to Git — no CMS, no database
- Dedicated pages per service area for local SEO
- Working contact form that emails submissions to `info@digitechdstv.co.za`
- Fresh visual design consistent with the new brand (navy/blue gradient,
  satellite-dish logo) already established on the coming-soon page
- No change to hosting model: still a static site FTP-deployed to `public_html`
  on push to `main` via the existing GitHub Actions workflow

## Non-goals

- No client-facing admin/CMS for the blog
- No database
- No e-commerce / booking / payment functionality
- No redesign of the FTP-based hosting/deploy target (cPanel + FTP stays as-is)

## Site Structure

| Page | Path | Notes |
|---|---|---|
| Home | `/` | Hero, why-choose-us, services overview, testimonials, service-areas overview, CTA |
| About | `/about/` | Company story + trust points |
| Services | `/services/` | All 6 services with details |
| Service Areas index | `/areas/` | Links to the 5 region pages |
| Cape Town | `/areas/cape-town/` | Sub-suburbs: City Bowl, Northern Suburbs, Southern Suburbs, Cape Flats, Atlantic Seaboard, Helderberg |
| West Coast | `/areas/west-coast/` | Vredenburg, Saldanha, Langebaan, St Helena Bay, Velddrif, Malmesbury |
| Overberg | `/areas/overberg/` | Hermanus, Caledon, Bredasdorp, Stanford, Gansbaai, Kleinmond |
| Garden Route | `/areas/garden-route/` | George, Mossel Bay, Knysna, Oudtshoorn, Plettenberg Bay, Wilderness |
| Winelands | `/areas/winelands/` | Stellenbosch, Paarl, Franschhoek |
| Blog index | `/blog/` | Lists all posts, newest first |
| Blog posts (×3 starter) | `/blog/<slug>/` | See Content Plan below |
| Contact | `/contact/` | Form, phone/WhatsApp, hours |

Testimonials remain a Home-page section only — no standalone testimonials page.

## Architecture

**Static site generator: Eleventy (11ty)**

- Node-based, zero client-side framework required. Outputs plain HTML/CSS to
  `_site/`.
- `src/_includes/base.njk` — shared layout: `<head>`, header/nav, footer.
  Every page is a small template that extends this layout.
- `src/_includes/partials/` — reusable components: header, footer, cta-banner,
  service-card, testimonial-card, area-card.
- `src/blog/posts/*.md` — blog posts as Markdown with front-matter (`title`,
  date, excerpt). Eleventy's collections API builds `/blog/` index
  automatically from these files — adding a post later is "add one Markdown
  file, push."
- `src/areas/*.njk` (or a single data-driven template + `_data/areas.json`) —
  the 5 region pages share one layout, populated from a small JSON/YAML data
  file listing each region's name, slug, and suburb list. This keeps the 5
  pages from being hand-duplicated.
- Global data (business name, phone, email, hours) lives in
  `src/_data/site.json` so it's defined once and used everywhere (nav, footer,
  contact page, schema.org markup).
- `styles.css` carries over from the coming-soon page as the base design
  language (navy/blue gradient, Space Grotesk font) and is extended with
  page-layout styles (nav bar, cards, footer, blog list, form).

**Contact form**

- Plain HTML `<form>` on `/contact/`, fields: name, phone, email, city,
  service type (dropdown, matching old site's options), message.
- Submits via `fetch()` (no page reload) to `contact-handler.php`.
- `contact-handler.php` lives in `src/php-passthrough/` and is copied by
  Eleventy to the output root unmodified (Eleventy `addPassthroughCopy`) —
  it's not templated, just a static PHP file that ships alongside the
  generated HTML.
- Server-side: validates required fields, checks a hidden honeypot field
  (spam bots fill it, humans don't — if filled, silently reject), then sends
  via PHP `mail()` to `info@digitechdstv.co.za` with the submission details
  and a `Reply-To` set to the submitter's email.
- Returns JSON `{success: true}` or `{success: false, error: "..."}`; the
  page JS shows an inline success or error message without navigating away.

## Deploy Pipeline Changes

Update `.github/workflows/deploy.yml`:

1. Add `actions/setup-node@v4`
2. `npm ci`
3. `npm run build` (runs `eleventy`, outputs to `_site/`)
4. FTP-deploy step: change `local-dir` from `./` to `./_site/` (everything
   else — server, credentials, excludes for `.htaccess`/`.well-known`/
   `cgi-bin`/`php.ini` — stays the same)

Retire `.cpanel.yml` — it was the fallback for cPanel's built-in Git deploy
before shell access was enabled; GitHub Actions is now the only deploy path,
so this file is dead weight and will be removed.

`package.json` is added at the repo root with Eleventy as the sole
dependency, plus `build` and `dev` (local preview) scripts.

## Content Plan

**Reused from the old site** (digitechsatellites.co.za), adapted to the new
brand name:
- 6 services and their bullet points (Installation, Repairs, Signal Fixing,
  Dish Alignment, Extra View Setup, Satellite Dish Installation)
- About Us copy and "Why Customers Trust Us" list
- 4 testimonials (Estelle Mey, Irene Wijmer, Nico Koekemoer, Susan Roos)
- Service area suburb lists for the 4 main regions
- Phone/WhatsApp number: 081 232 2249 (unchanged)
- Operating hours: Monday–Saturday 07:00–17:00, emergency callouts 24/7

**Written fresh** (old site had none or empty placeholders):
- FAQ content (5–6 common DSTV installation questions/answers)
- Winelands area page copy (implied by old site's footer but never built out)
- 3 starter blog posts:
  1. "DSTV No Signal? Here's How to Troubleshoot It" — practical
     troubleshooting guide, ends with a CTA to book a technician
  2. "DSTV Extra View Explained: Watch Different Channels on Every TV" —
     explains the Extra View / Explora Ultra setup, links to the Extra View
     service
  3. "5 Signs Your DSTV Dish Needs Realignment" — signal-quality symptoms,
     links to the Dish Alignment service

## Verification Plan

- Run the Eleventy build locally and preview via the Browser pane
  (`preview_start`) before pushing, checking: nav works across all pages,
  contact form validation, mobile responsiveness, blog index lists all 3
  posts, each area page renders correctly.
- After push, confirm the GitHub Actions run succeeds (`gh run watch`).
- Spot-check the live site once DNS has propagated: homepage, one service
  area page, one blog post, and a real submission through the contact form
  (checking it lands in the `info@digitechdstv.co.za` inbox).

## Open Risks / Assumptions

- PHP `mail()` on shared hosting can occasionally land in spam; this is a
  known limitation of the "no third-party service" approach discussed
  earlier. If deliverability turns out to be a problem, the fallback is
  swapping the send mechanism for an SMTP-based library (PHPMailer) using the
  same `info@digitechdstv.co.za` mailbox's SMTP credentials — no other design
  changes needed.
- DNS for digitechdstv.co.za is still propagating (nameserver change made
  earlier); this work can proceed and deploy regardless, since deployment
  targets the same `public_html` and doesn't depend on DNS being resolved
  correctly yet.
