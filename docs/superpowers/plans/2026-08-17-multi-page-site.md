# Digitech DSTV Multi-Page Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-page "coming soon" placeholder with a full multi-page marketing site (13 pages: Home, About, Services, 5 Service Area pages, Blog index + 3 posts, Contact) built with Eleventy, styled to match the existing brand, with a working PHP contact form.

**Architecture:** Eleventy (11ty) static site generator with Nunjucks templates and a shared `base.njk` layout. Content-heavy data (services, testimonials, areas, FAQ) lives in `src/_data/*.json` and is looped over in templates via Nunjucks macros, so the 5 area pages and 6 service cards are generated from data rather than hand-duplicated. Blog posts are Markdown files with front-matter. The build outputs plain static HTML/CSS to `_site/`, which GitHub Actions FTP-deploys to `public_html` on every push to `main` — the hosting model doesn't change, only the authoring workflow does.

**Tech Stack:** Eleventy 2.x (Node.js), Nunjucks templates, Markdown (posts), vanilla JS (nav toggle, contact form submission), PHP (`mail()`-based contact handler), GitHub Actions + FTP-Deploy-Action (existing).

## Global Constraints

- Business name: "Digitech DSTV". Domain: `digitechdstv.co.za`. Phone/WhatsApp: `081 232 2249` (`tel:+27812322249`, WhatsApp `https://wa.me/27812322249`). Contact email: `info@digitechdstv.co.za`.
- Hosting stays static + FTP-deployed to `public_html` via the existing GitHub Actions workflow — no server-side rendering, no database.
- Never modify or delete on the server: `.htaccess`, `.user.ini`, `php.ini`, `.well-known/**`, `cgi-bin/**` (cPanel account files, already excluded in the FTP deploy step).
- Testimonials appear only on the Home page — no standalone testimonials page.
- Visual design: navy/blue gradient palette + Space Grotesk font, matching the existing coming-soon page (`--navy-950: #050a17`, `--blue-500: #2f7dfa`, etc.) — see Task 2 for the full palette.
- Blog is developer-managed (no CMS) — adding a post later means adding one Markdown file.

---

## Task 1: Project Scaffolding, Data Files, and Asset Migration

**Files:**
- Create: `package.json`
- Create: `.eleventy.js`
- Create: `src/_data/site.json`
- Create: `src/_data/services.json`
- Create: `src/_data/areas.json`
- Create: `src/_data/testimonials.json`
- Create: `src/_data/faq.json`
- Create: `src/_includes/base.njk`
- Create: `src/index.njk` (temporary stub — replaced fully in Task 3)
- Modify: `.gitignore` (add `node_modules/` and `_site/`)
- Move: `assets/logo.png` → `src/assets/logo.png`
- Move: `styles.css` → `src/css/styles.css`
- Delete: `index.html` (old coming-soon page, superseded by the generated site)

**Interfaces:**
- Produces: global data available in every template as `site`, `services`, `areas`, `testimonials`, `faq` (from the `_data/*.json` filenames). `base.njk` layout consuming `title`, `description`, `content`.

- [ ] **Step 1: Verify Node.js and npm are available**

Run: `node -v && npm -v`
Expected: version numbers print (Node 18+). If this fails, install Node.js from https://nodejs.org/ (LTS version) before continuing.

- [ ] **Step 2: Create `package.json`**

```json
{
  "name": "digitech-dstv-website",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "eleventy",
    "dev": "eleventy --serve"
  },
  "devDependencies": {
    "@11ty/eleventy": "^2.0.1"
  }
}
```

- [ ] **Step 3: Install dependencies**

Run: `npm install`
Expected: exits 0, creates `node_modules/` and `package-lock.json`.

- [ ] **Step 4: Update `.gitignore`**

```
.DS_Store
Thumbs.db
node_modules/
_site/
```

- [ ] **Step 5: Migrate existing assets into `src/`**

Run:
```bash
mkdir -p src/assets src/css
git mv assets/logo.png src/assets/logo.png
git mv styles.css src/css/styles.css
git rm index.html
```

- [ ] **Step 6: Create the global data files**

`src/_data/site.json`:
```json
{
  "businessName": "Digitech DSTV",
  "tagline": "Professional DSTV Installation & Repairs Across the Western Cape",
  "phone": "081 232 2249",
  "phoneHref": "tel:+27812322249",
  "whatsappHref": "https://wa.me/27812322249?text=Hello%20I%20am%20interested%20in%20your%20DSTV%20services",
  "email": "info@digitechdstv.co.za",
  "hours": "Monday - Saturday: 07:00 - 17:00",
  "emergencyNote": "Emergency callouts available (24/7)",
  "domain": "digitechdstv.co.za",
  "url": "https://digitechdstv.co.za"
}
```

`src/_data/services.json`:
```json
[
  {
    "name": "DSTV Installation",
    "slug": "dstv-installation",
    "summary": "Complete new DSTV installation including dish mounting, cabling, and decoder setup. We install all DSTV packages — from DSTV Access to Premium.",
    "points": ["Professional dish mounting", "Neat hidden cabling", "Full decoder setup and activation", "Signal quality guarantee"]
  },
  {
    "name": "DSTV Repairs",
    "slug": "dstv-repairs",
    "summary": "Expert DSTV repair services for all types of decoder and satellite dish problems. We diagnose and fix faults quickly to restore your viewing.",
    "points": ["Decoder troubleshooting", "LNB replacement", "Cable fault detection", "Fast turnaround time"]
  },
  {
    "name": "Signal Fixing",
    "slug": "signal-fixing",
    "summary": "Experiencing poor signal or the dreaded \"no signal\" error? Our DSTV signal installers will identify and resolve all reception issues for clear, uninterrupted viewing.",
    "points": ["Signal strength testing", "Interference elimination", "Weather-resistant solutions", "Lasting signal stability"]
  },
  {
    "name": "Dish Alignment",
    "slug": "dish-alignment",
    "summary": "Precise satellite dish alignment using professional-grade meters. Perfect alignment means optimal signal quality and fewer disruptions during bad weather.",
    "points": ["Professional alignment tools", "Maximum signal strength", "Reduced weather impact", "Improved picture quality"]
  },
  {
    "name": "Extra View Setup",
    "slug": "extra-view-setup",
    "summary": "Watch different channels on multiple TVs with DSTV Extra View and Explora Ultra setup. One subscription, multiple viewing points throughout your home.",
    "points": ["Multi-room entertainment", "Explora Ultra installation", "Wireless connectivity setup", "Cost-effective multi-view"]
  },
  {
    "name": "Satellite Dish Installation",
    "slug": "satellite-dish-installation",
    "summary": "Professional satellite dish installation for DSTV, OpenView, and other satellite services. We ensure secure mounting and optimal positioning for the best reception.",
    "points": ["Secure weatherproof mounting", "Optimal positioning", "All satellite brands", "Structural integrity check"]
  }
]
```

`src/_data/areas.json`:
```json
[
  {
    "name": "Cape Town",
    "slug": "cape-town",
    "pageTitle": "DSTV Installation Cape Town | Digitech DSTV",
    "intro": "Trusted DSTV installers in Cape Town providing fast and affordable satellite installation, repairs, and signal fixing across the Cape Metro. From the City Bowl to the Northern Suburbs, Southern Suburbs, and Cape Flats — we cover all of Cape Town.",
    "suburbs": ["City Bowl", "Northern Suburbs", "Southern Suburbs", "Cape Flats", "Atlantic Seaboard", "Helderberg"]
  },
  {
    "name": "West Coast",
    "slug": "west-coast",
    "pageTitle": "DSTV Installers West Coast | Digitech DSTV",
    "intro": "Affordable DSTV installation on the West Coast. As the go-to DSTV installers in Vredenburg, Saldanha, Langebaan, and St Helena Bay, we ensure reliable satellite TV reception for all West Coast residents.",
    "suburbs": ["Vredenburg", "Saldanha", "Langebaan", "St Helena Bay", "Velddrif", "Malmesbury"]
  },
  {
    "name": "Overberg",
    "slug": "overberg",
    "pageTitle": "DSTV Installation Overberg | Digitech DSTV",
    "intro": "Professional DSTV installation in the Overberg region. Trusted DSTV installers in Hermanus, Caledon, and Bredasdorp offering new installations, signal repairs, and extra view setup.",
    "suburbs": ["Hermanus", "Caledon", "Bredasdorp", "Stanford", "Gansbaai", "Kleinmond"]
  },
  {
    "name": "Garden Route",
    "slug": "garden-route",
    "pageTitle": "DSTV Installation Garden Route | Digitech DSTV",
    "intro": "Reliable DSTV installation on the Garden Route. From George to Knysna, our qualified satellite installers provide professional DSTV services to homes and businesses across the entire Garden Route region.",
    "suburbs": ["George", "Mossel Bay", "Knysna", "Oudtshoorn", "Plettenberg Bay", "Wilderness"]
  },
  {
    "name": "Winelands",
    "slug": "winelands",
    "pageTitle": "DSTV Installation Winelands | Digitech DSTV",
    "intro": "Professional DSTV installation and repairs across the Cape Winelands. Digitech DSTV serves homes and businesses in Stellenbosch, Paarl, and Franschhoek with the same fast, reliable service we're known for across the Western Cape.",
    "suburbs": ["Stellenbosch", "Paarl", "Franschhoek"]
  }
]
```

`src/_data/testimonials.json`:
```json
[
  {"name": "Estelle Mey", "quote": "Thank you for the excellent service received from Digitech today in fixing my DSTV signal. Your technician, Warren, was friendly and efficient and of great help. I will strongly recommend Digitech to anyone in need of DSTV installation."},
  {"name": "Irene Wijmer", "quote": "Nice and professional very helpful and client friendly communication skills. Would call them certainly again when needed. Thank you."},
  {"name": "Nico Koekemoer", "quote": "The service person arrived 100% on time for our appointment and the DSTV problem was fixed within minutes. Thanks for your great service."},
  {"name": "Susan Roos", "quote": "They arrived as arranged, friendly, very helpful technician. Professional service with a smile. Very happy."}
]
```

`src/_data/faq.json`:
```json
[
  {"q": "How long does a DSTV installation take?", "a": "Most standard installations take between 1 and 2 hours, depending on the dish mounting location and cabling distance. Extra View or multi-room setups may take a little longer."},
  {"q": "Do you offer same-day DSTV installation?", "a": "Yes — we offer same-day installation across most of the areas we service, subject to technician availability. Contact us early in the day for the best chance of a same-day slot."},
  {"q": "What areas do you service?", "a": "We service the entire Western Cape, including Cape Town, the West Coast, the Overberg, the Garden Route, and the Winelands. If you're not sure whether we cover your area, get in touch and we'll confirm."},
  {"q": "Why is my DSTV showing a 'no signal' error?", "a": "This is usually caused by dish misalignment, a faulty LNB, cable damage, or bad weather. Our technicians can diagnose the exact cause and fix it, often on the same visit."},
  {"q": "Can I watch different channels on different TVs with one DSTV subscription?", "a": "Yes, with DSTV Extra View or an Explora Ultra decoder you can watch different channels on multiple TVs from a single subscription. We install and configure this setup for you."},
  {"q": "Do you provide a guarantee on your work?", "a": "Yes, every installation comes with a workmanship guarantee, and we use only approved equipment for every job."}
]
```

- [ ] **Step 7: Create `.eleventy.js`**

```js
module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/php": "." });

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return new Date(dateObj).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi.getFilteredByTag("post").sort((a, b) => b.date - a.date);
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
  };
};
```

- [ ] **Step 8: Create a minimal `base.njk` layout (stub — extended in Task 2)**

`src/_includes/base.njk`:
```njk
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{{ title }}</title>
<meta name="description" content="{{ description }}" />
<link rel="icon" type="image/png" href="/assets/logo.png" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/styles.css" />
</head>
<body>
<main>
{{ content | safe }}
</main>
</body>
</html>
```

- [ ] **Step 9: Create a temporary stub Home page**

`src/index.njk`:
```njk
---
layout: base.njk
title: "Digitech DSTV"
description: "Digitech DSTV website"
---
<p>{{ site.businessName }} — site scaffold works.</p>
```

- [ ] **Step 10: Build and verify data loads correctly**

Run: `npm run build`
Expected: exits 0, no errors, creates `_site/index.html`.

Run: `grep -q "Digitech DSTV" _site/index.html && echo PASS || echo FAIL`
Expected: `PASS` (confirms `site.json` data loaded and templated correctly).

Run: `ls _site/assets/logo.png _site/css/styles.css`
Expected: both files listed (confirms passthrough copy works).

- [ ] **Step 11: Commit**

```bash
git add package.json package-lock.json .eleventy.js .gitignore src/
git add -u assets styles.css index.html
git commit -m "Scaffold Eleventy project, migrate assets, add global data files"
```

---

## Task 2: Shared Layout — Header, Footer, Macros, Nav Script, and Design System CSS

**Files:**
- Create: `src/_includes/partials/header.njk`
- Create: `src/_includes/partials/footer.njk`
- Create: `src/_includes/partials/macros.njk`
- Create: `src/_includes/partials/cta-banner.njk`
- Create: `src/js/nav.js`
- Modify: `src/_includes/base.njk` (include header/footer, add nav.js script tag)
- Modify: `src/css/styles.css` (full design system rewrite)

**Interfaces:**
- Consumes: `site`, `areas` global data (Task 1).
- Produces: Nunjucks macros `serviceCard(service, compact=false)`, `testimonialCard(t)`, `areaCard(area)` importable via `{% from "partials/macros.njk" import serviceCard, testimonialCard, areaCard %}` — used by Tasks 3, 5, 6.

- [ ] **Step 1: Create the macros partial**

`src/_includes/partials/macros.njk`:
```njk
{% macro serviceCard(service, compact=false) %}
<div class="card service-card">
  <h3>{{ service.name }}</h3>
  <p>{{ service.summary }}</p>
  {% if not compact %}
  <ul>
    {% for point in service.points %}
    <li>{{ point }}</li>
    {% endfor %}
  </ul>
  {% endif %}
</div>
{% endmacro %}

{% macro testimonialCard(t) %}
<div class="card testimonial-card">
  <p class="stars">★★★★★</p>
  <p class="quote">"{{ t.quote }}"</p>
  <p class="author">{{ t.name }}</p>
</div>
{% endmacro %}

{% macro areaCard(area) %}
<a href="/areas/{{ area.slug }}/" class="card area-card">
  <h3>{{ area.name }}</h3>
  <p>{{ area.suburbs | join(", ") }}</p>
</a>
{% endmacro %}
```

- [ ] **Step 2: Create the header partial**

`src/_includes/partials/header.njk`:
```njk
<header class="site-header">
  <div class="header-inner">
    <a href="/" class="brand">
      <img src="/assets/logo.png" alt="{{ site.businessName }} logo" class="brand-logo" />
    </a>
    <nav class="site-nav">
      <a href="/">Home</a>
      <a href="/about/">About</a>
      <a href="/services/">Services</a>
      <a href="/areas/">Service Areas</a>
      <a href="/blog/">Blog</a>
      <a href="/contact/">Contact</a>
    </nav>
    <div class="header-actions">
      <a href="{{ site.phoneHref }}" class="btn btn-ghost">Call {{ site.phone }}</a>
      <a href="{{ site.whatsappHref }}" class="btn btn-primary">WhatsApp Us</a>
    </div>
    <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>
```

- [ ] **Step 3: Create the footer partial**

`src/_includes/partials/footer.njk`:
```njk
<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-col">
      <img src="/assets/logo.png" alt="{{ site.businessName }} logo" class="footer-logo" />
      <p>{{ site.tagline }}</p>
    </div>
    <div class="footer-col">
      <h3>Quick Links</h3>
      <a href="/about/">About</a>
      <a href="/services/">Services</a>
      <a href="/areas/">Service Areas</a>
      <a href="/blog/">Blog</a>
      <a href="/contact/">Contact</a>
    </div>
    <div class="footer-col">
      <h3>Service Areas</h3>
      {% for area in areas %}
      <a href="/areas/{{ area.slug }}/">{{ area.name }}</a>
      {% endfor %}
    </div>
    <div class="footer-col">
      <h3>Contact</h3>
      <a href="{{ site.phoneHref }}">{{ site.phone }}</a>
      <a href="mailto:{{ site.email }}">{{ site.email }}</a>
      <p>{{ site.hours }}</p>
      <p>{{ site.emergencyNote }}</p>
    </div>
  </div>
  <div class="footer-bottom">
    <p>&copy; <span id="year"></span> {{ site.businessName }}. All rights reserved.</p>
  </div>
</footer>
```

- [ ] **Step 4: Create the CTA banner partial**

`src/_includes/partials/cta-banner.njk`:
```njk
<section class="cta-banner">
  <div class="cta-inner">
    <h2>Ready for Fast, Professional DSTV Installation?</h2>
    <p>Get a free quote today — same-day service available across the Western Cape.</p>
    <div class="cta-actions">
      <a href="{{ site.whatsappHref }}" class="btn btn-primary">WhatsApp Us</a>
      <a href="/contact/" class="btn btn-ghost-light">Get a Free Quote</a>
    </div>
  </div>
</section>
```

- [ ] **Step 5: Create the nav/year script**

`src/js/nav.js`:
```js
document.addEventListener('DOMContentLoaded', function () {
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.site-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
});
```

- [ ] **Step 6: Update `base.njk` to include header, footer, and nav.js**

`src/_includes/base.njk`:
```njk
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{{ title }}</title>
<meta name="description" content="{{ description }}" />
<link rel="icon" type="image/png" href="/assets/logo.png" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/styles.css" />
</head>
<body>
{% include "partials/header.njk" %}
<main>
{{ content | safe }}
</main>
{% include "partials/footer.njk" %}
<script src="/js/nav.js"></script>
</body>
</html>
```

- [ ] **Step 7: Rewrite `src/css/styles.css` with the full design system**

```css
:root {
  --navy-950: #050a17;
  --navy-900: #081029;
  --navy-800: #0d1a3d;
  --blue-500: #2f7dfa;
  --blue-400: #4da3ff;
  --blue-300: #7cc0ff;
  --ink-100: #f4f8ff;
  --ink-300: #b9c6e6;
  --ink-500: #7c89ad;
  --white: #ffffff;
  --max-width: 1100px;
}

* { box-sizing: border-box; }
html, body { height: 100%; }
body {
  margin: 0;
  background: var(--navy-950);
  color: var(--ink-100);
  font-family: "Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.5;
}
a { color: inherit; text-decoration: none; }
img { max-width: 100%; display: block; }
h1, h2, h3 { line-height: 1.2; margin: 0 0 16px; }
p { margin: 0 0 16px; color: var(--ink-300); }

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 14px;
  border: 1px solid transparent;
  cursor: pointer;
}
.btn-primary { background: var(--blue-500); color: var(--white); }
.btn-primary:hover { background: var(--blue-400); }
.btn-ghost { background: transparent; color: var(--blue-300); border-color: rgba(124, 192, 255, 0.35); }
.btn-ghost:hover { background: rgba(47, 125, 250, 0.12); }
.btn-ghost-light { background: rgba(255, 255, 255, 0.08); color: var(--ink-100); border-color: rgba(255, 255, 255, 0.2); }

.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(5, 10, 23, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(124, 192, 255, 0.12);
}
.header-inner {
  max-width: var(--max-width);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  gap: 24px;
  position: relative;
}
.brand-logo { height: 40px; width: auto; }
.site-nav { display: flex; gap: 24px; flex: 1; justify-content: center; }
.site-nav a { font-size: 14px; font-weight: 500; color: var(--ink-300); }
.site-nav a:hover { color: var(--blue-300); }
.header-actions { display: flex; gap: 12px; }
.nav-toggle {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
}
.nav-toggle span { width: 22px; height: 2px; background: var(--ink-100); }

.section { max-width: var(--max-width); margin: 0 auto; padding: 64px 24px; }
.section-lede { max-width: 640px; color: var(--ink-300); }
.page-header { padding-bottom: 24px; }
.page-header h1 { font-size: clamp(28px, 4vw, 40px); }

.grid { display: grid; gap: 24px; margin: 32px 0; }
.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.card {
  background: rgba(13, 26, 61, 0.45);
  border: 1px solid rgba(124, 192, 255, 0.14);
  border-radius: 16px;
  padding: 24px;
}
.card h3 { font-size: 18px; color: var(--ink-100); }
.card ul { margin: 0; padding-left: 20px; color: var(--ink-300); }
.card ul li { margin-bottom: 6px; }

.area-card { display: block; }
.area-card:hover { border-color: rgba(124, 192, 255, 0.4); }

.testimonial-card .stars { color: var(--blue-400); margin: 0 0 8px; }
.testimonial-card .quote { font-style: italic; }
.testimonial-card .author { color: var(--ink-100); font-weight: 600; margin: 0; }

.hero {
  background:
    radial-gradient(circle at 20% 15%, rgba(47, 125, 250, 0.18), transparent 45%),
    radial-gradient(circle at 85% 80%, rgba(77, 163, 255, 0.14), transparent 50%),
    linear-gradient(160deg, var(--navy-950) 0%, var(--navy-900) 55%, var(--navy-800) 100%);
  padding: 96px 24px 64px;
}
.hero-inner { max-width: var(--max-width); margin: 0 auto; text-align: left; }
.hero .eyebrow { color: var(--blue-300); font-weight: 600; margin-bottom: 12px; }
.hero h1 {
  font-size: clamp(32px, 5vw, 52px);
  background: linear-gradient(90deg, var(--ink-100), var(--blue-300));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  max-width: 800px;
}
.hero .lede { max-width: 600px; }
.hero-actions { display: flex; gap: 12px; margin-bottom: 32px; flex-wrap: wrap; }
.hero-badges { display: flex; gap: 16px; flex-wrap: wrap; list-style: none; padding: 0; margin: 0; }
.hero-badges li {
  font-size: 13px;
  font-weight: 600;
  color: var(--blue-300);
  background: rgba(47, 125, 250, 0.12);
  border: 1px solid rgba(77, 163, 255, 0.3);
  border-radius: 999px;
  padding: 8px 16px;
}

.cta-banner {
  background: linear-gradient(90deg, var(--blue-500), var(--blue-400));
  padding: 56px 24px;
  text-align: center;
}
.cta-inner { max-width: 640px; margin: 0 auto; }
.cta-banner h2 { color: var(--white); }
.cta-banner p { color: rgba(255, 255, 255, 0.85); }
.cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.cta-banner .btn-ghost-light { border-color: rgba(255, 255, 255, 0.5); }

.site-footer { border-top: 1px solid rgba(124, 192, 255, 0.12); padding: 48px 24px 24px; }
.footer-inner {
  max-width: var(--max-width);
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
}
.footer-logo { height: 36px; margin-bottom: 12px; }
.footer-col h3 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-100); margin-bottom: 12px; }
.footer-col a, .footer-col p { display: block; color: var(--ink-500); font-size: 14px; margin-bottom: 8px; }
.footer-bottom { max-width: var(--max-width); margin: 32px auto 0; padding-top: 24px; border-top: 1px solid rgba(124, 192, 255, 0.08); font-size: 13px; color: var(--ink-500); }

.check-list, .suburb-list { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.check-list li, .suburb-list li { padding-left: 24px; position: relative; color: var(--ink-300); }
.check-list li::before { content: "✓"; position: absolute; left: 0; color: var(--blue-400); font-weight: 700; }
.suburb-list li::before { content: "•"; position: absolute; left: 0; color: var(--blue-400); }

.faq-item { border-bottom: 1px solid rgba(124, 192, 255, 0.12); padding: 16px 0; }
.faq-item summary { cursor: pointer; font-weight: 600; color: var(--ink-100); }
.faq-item p { margin-top: 12px; }

.blog-list { display: flex; flex-direction: column; gap: 16px; }
.blog-list-item { display: block; }
.blog-list-item h2 { font-size: 20px; margin-bottom: 4px; }
.post-date { color: var(--blue-300); font-size: 13px; margin-bottom: 8px; }
.read-more { color: var(--blue-300); font-weight: 600; font-size: 14px; }
.blog-post-header { margin-bottom: 32px; }
.prose p { color: var(--ink-300); }
.prose h2 { margin-top: 32px; color: var(--ink-100); font-size: 22px; }
.blog-post-footer { display: flex; justify-content: space-between; margin-top: 48px; flex-wrap: wrap; gap: 12px; }

.contact-layout { display: grid; grid-template-columns: 1fr 1.4fr; gap: 48px; }
.contact-info p { margin-bottom: 20px; }
.contact-form { display: flex; flex-direction: column; gap: 16px; }
.form-row { display: flex; flex-direction: column; gap: 6px; }
.form-row label { font-size: 13px; font-weight: 600; color: var(--ink-300); }
.form-row input, .form-row select, .form-row textarea {
  background: rgba(13, 26, 61, 0.45);
  border: 1px solid rgba(124, 192, 255, 0.2);
  border-radius: 8px;
  padding: 10px 14px;
  color: var(--ink-100);
  font-family: inherit;
  font-size: 14px;
}
.honeypot { position: absolute; left: -9999px; }
#form-status { font-size: 14px; }
#form-status.status-success { color: #6cdd6c; }
#form-status.status-error { color: #ff6b6b; }

@media (max-width: 900px) {
  .site-nav, .header-actions { display: none; }
  .nav-toggle { display: flex; }
  .site-nav.is-open {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--navy-900);
    padding: 16px 24px;
    gap: 16px;
  }
  .grid-2, .grid-3, .check-list, .suburb-list, .footer-inner, .contact-layout {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 8: Build and verify header/footer render**

Run: `npm run build`
Expected: exits 0.

Run: `grep -q 'href="/about/"' _site/index.html && grep -q 'href="/contact/"' _site/index.html && echo PASS || echo FAIL`
Expected: `PASS`

Run: `grep -q 'site-footer' _site/index.html && echo PASS || echo FAIL`
Expected: `PASS`

- [ ] **Step 9: Commit**

```bash
git add src/_includes src/js src/css
git commit -m "Add shared header/footer/macros and full design system CSS"
```

---

## Task 3: Home Page

**Files:**
- Create: `src/index.njk` (replaces the Task 1 stub)

**Interfaces:**
- Consumes: `serviceCard`, `testimonialCard`, `areaCard` macros (Task 2); `site`, `services`, `testimonials`, `areas`, `faq` global data (Task 1); `partials/cta-banner.njk` (Task 2).

- [ ] **Step 1: Write the full Home page**

`src/index.njk`:
```njk
---
layout: base.njk
title: "Digitech DSTV | DSTV Installation & Repairs in the Western Cape"
description: "Fast, professional DSTV installation, repairs and signal fixing across the Western Cape. Same-day service, certified installers, free quotes."
---
{% from "partials/macros.njk" import serviceCard, testimonialCard, areaCard %}

<section class="hero">
  <div class="hero-inner">
    <p class="eyebrow">★★★★★ Top Rated Installers</p>
    <h1>Fast &amp; Reliable DSTV Installation in the Western Cape</h1>
    <p class="lede">
      Enjoy uninterrupted entertainment with professional DSTV satellite installation.
      Whether you need a new setup, signal repairs, or extra view installation, our
      certified installers are ready to help — from Cape Town to the Garden Route.
    </p>
    <div class="hero-actions">
      <a href="{{ site.whatsappHref }}" class="btn btn-primary">WhatsApp Now</a>
      <a href="/areas/" class="btn btn-ghost-light">Find Your Area</a>
    </div>
    <ul class="hero-badges">
      <li>Same-Day DSTV Installation</li>
      <li>Licensed DSTV Installers</li>
      <li>Affordable Pricing</li>
      <li>Servicing the Western Cape</li>
    </ul>
  </div>
</section>

<section class="section why-us">
  <h2>Why Choose Us for Your DSTV Installation</h2>
  <p class="section-lede">As the top-rated DSTV installers across the Western Cape, we deliver professional satellite installation services you can count on.</p>
  <div class="grid grid-3">
    <div class="card"><h3>Certified Installers</h3><p>Our team consists of fully trained and accredited DSTV installation technicians you can trust.</p></div>
    <div class="card"><h3>Same-Day Service</h3><p>Need a DSTV installer near you today? We offer same-day installation across Cape Town and surrounding areas.</p></div>
    <div class="card"><h3>Quality Guaranteed</h3><p>Every DSTV installation comes with a workmanship guarantee for your complete peace of mind.</p></div>
    <div class="card"><h3>Expert Repairs</h3><p>From signal issues to decoder problems, our technicians diagnose and fix DSTV faults fast.</p></div>
    <div class="card"><h3>Wide Coverage</h3><p>We service the entire Western Cape — from the West Coast to the Garden Route and beyond.</p></div>
    <div class="card"><h3>Affordable Rates</h3><p>Competitive pricing with no hidden fees. Get a free quote before any work begins.</p></div>
  </div>
</section>

<section class="section services-overview">
  <h2>What We Offer</h2>
  <p class="section-lede">From new DSTV installations to complex repairs, Digitech DSTV provides a full range of satellite installation services across the Western Cape.</p>
  <div class="grid grid-3">
    {% for service in services %}
      {{ serviceCard(service, true) }}
    {% endfor %}
  </div>
  <a href="/services/" class="btn btn-ghost">View All Services</a>
</section>

<section class="section testimonials">
  <h2>What Our Customers Say</h2>
  <p class="section-lede">Don't just take our word for it — hear from satisfied customers across the Western Cape.</p>
  <div class="grid grid-2">
    {% for t in testimonials %}
      {{ testimonialCard(t) }}
    {% endfor %}
  </div>
</section>

<section class="section areas-overview">
  <h2>Where We Work</h2>
  <p class="section-lede">We provide professional satellite installation across the entire Western Cape.</p>
  <div class="grid grid-3">
    {% for area in areas %}
      {{ areaCard(area) }}
    {% endfor %}
  </div>
</section>

<section class="section faq">
  <h2>Frequently Asked Questions</h2>
  <p class="section-lede">Got questions about DSTV installation? Find answers to the most common questions from our customers in the Western Cape.</p>
  {% for item in faq %}
  <details class="faq-item">
    <summary>{{ item.q }}</summary>
    <p>{{ item.a }}</p>
  </details>
  {% endfor %}
</section>

{% include "partials/cta-banner.njk" %}
```

- [ ] **Step 2: Build and verify all sections render**

Run: `npm run build`
Expected: exits 0.

Run:
```bash
grep -q "Fast &amp; Reliable DSTV Installation" _site/index.html && \
grep -q "DSTV Installation" _site/index.html && \
grep -q "Estelle Mey" _site/index.html && \
grep -q "Cape Town" _site/index.html && \
grep -q "How long does a DSTV installation take" _site/index.html && \
echo PASS || echo FAIL
```
Expected: `PASS`

- [ ] **Step 3: Commit**

```bash
git add src/index.njk
git commit -m "Build full Home page with hero, services, testimonials, areas, FAQ"
```

---

## Task 4: About Page

**Files:**
- Create: `src/about.njk`

**Interfaces:**
- Consumes: `site` global data, `partials/cta-banner.njk`.

- [ ] **Step 1: Write the About page**

`src/about.njk`:
```njk
---
layout: base.njk
title: "About Us | Digitech DSTV"
description: "Digitech DSTV is a leading DSTV installation company serving the Western Cape with fast, reliable and professional satellite installation services."
---
<section class="section page-header">
  <h1>Your Trusted DSTV Installers in the Western Cape</h1>
</section>

<section class="section about-content">
  <p>Digitech DSTV is a leading DSTV installation company serving customers across the Western Cape — including the West Coast (Vredenburg, Saldanha, Langebaan, St Helena Bay, Velddrif, Malmesbury) and beyond. With years of experience in satellite installation, we have built a reputation for delivering fast, reliable, and professional DSTV services at affordable rates.</p>
  <p>Whether you need a brand-new DSTV installation in Cape Town, signal repairs on the West Coast, or extra view setup in the Overberg region — our skilled technicians are ready to help. We take pride in our work, ensuring every installation is done right the first time.</p>
  <p>As trusted DSTV installers near you, we understand the importance of quality entertainment. That's why we use only approved equipment and follow best practices for every satellite dish installation and decoder setup we perform.</p>

  <h2>Why Customers Trust Us</h2>
  <ul class="check-list">
    <li>Experienced and certified DSTV installers</li>
    <li>Serving the entire Western Cape region</li>
    <li>Customer satisfaction is our top priority</li>
    <li>Fast response times and same-day bookings</li>
    <li>Transparent pricing — no hidden costs</li>
    <li>Fully equipped with professional tools</li>
  </ul>

  <div class="cta-actions">
    <a href="{{ site.phoneHref }}" class="btn btn-primary">Call Us Now</a>
    <a href="{{ site.whatsappHref }}" class="btn btn-ghost">WhatsApp Us</a>
  </div>
</section>

{% include "partials/cta-banner.njk" %}
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: exits 0.

Run: `grep -q "Why Customers Trust Us" _site/about/index.html && echo PASS || echo FAIL`
Expected: `PASS`

- [ ] **Step 3: Commit**

```bash
git add src/about.njk
git commit -m "Add About page"
```

---

## Task 5: Services Page

**Files:**
- Create: `src/services.njk`

**Interfaces:**
- Consumes: `serviceCard` macro (Task 2), `services` global data (Task 1).

- [ ] **Step 1: Write the Services page**

`src/services.njk`:
```njk
---
layout: base.njk
title: "DSTV Installation & Repair Services | Digitech DSTV"
description: "From new DSTV installations to complex repairs, dish alignment, signal fixing and Extra View setup — full satellite installation services across the Western Cape."
---
{% from "partials/macros.njk" import serviceCard %}

<section class="section page-header">
  <h1>DSTV Installation &amp; Repair Services</h1>
  <p class="section-lede">From new DSTV installations to complex repairs, Digitech DSTV provides a full range of satellite installation services across the Western Cape.</p>
</section>

<section class="section services-full">
  <div class="grid grid-2">
    {% for service in services %}
      {{ serviceCard(service) }}
    {% endfor %}
  </div>
</section>

{% include "partials/cta-banner.njk" %}
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: exits 0.

Run:
```bash
grep -q "Dish Alignment" _site/services/index.html && \
grep -q "Professional alignment tools" _site/services/index.html && \
echo PASS || echo FAIL
```
Expected: `PASS` (confirms full detail, including bullet points, renders — unlike the compact Home version)

- [ ] **Step 3: Commit**

```bash
git add src/services.njk
git commit -m "Add Services page with full service details"
```

---

## Task 6: Service Area Pages (Index + 5 Region Pages)

**Files:**
- Create: `src/areas/index.njk`
- Create: `src/areas/area.njk`

**Interfaces:**
- Consumes: `areaCard` macro (Task 2), `areas` global data (Task 1). Uses Eleventy pagination with `alias: area` to generate one page per entry in `areas.json`.

- [ ] **Step 1: Write the areas index page**

`src/areas/index.njk`:
```njk
---
layout: base.njk
title: "DSTV Installation Service Areas | Digitech DSTV"
description: "Digitech DSTV provides trusted DSTV installation services throughout the Western Cape — Cape Town, West Coast, Overberg, Garden Route and the Winelands."
---
{% from "partials/macros.njk" import areaCard %}

<section class="section page-header">
  <h1>DSTV Installation Across the Western Cape</h1>
  <p class="section-lede">Digitech DSTV provides trusted DSTV installation services throughout the Western Cape. Find your local DSTV installer below.</p>
</section>

<section class="section areas-full">
  <div class="grid grid-3">
    {% for area in areas %}
      {{ areaCard(area) }}
    {% endfor %}
  </div>
</section>

<section class="section not-listed">
  <h2>Don't See Your Area Listed?</h2>
  <p>We service the entire Western Cape. Contact us to confirm availability in your area.</p>
  <a href="{{ site.phoneHref }}" class="btn btn-primary">{{ site.phone }}</a>
</section>

{% include "partials/cta-banner.njk" %}
```

- [ ] **Step 2: Write the paginated single-region template**

`src/areas/area.njk`:
```njk
---
layout: base.njk
pagination:
  data: areas
  size: 1
  alias: area
permalink: "areas/{{ area.slug }}/index.html"
eleventyComputed:
  title: "{{ area.pageTitle }}"
  description: "{{ area.intro }}"
---
<section class="section page-header">
  <h1>DSTV Installation in {{ area.name }}</h1>
  <p class="section-lede">{{ area.intro }}</p>
</section>

<section class="section area-suburbs">
  <h2>Areas We Cover in {{ area.name }}</h2>
  <ul class="suburb-list">
    {% for suburb in area.suburbs %}
    <li>{{ suburb }}</li>
    {% endfor %}
  </ul>
</section>

<section class="section area-services">
  <h2>DSTV Services in {{ area.name }}</h2>
  <p>We offer full DSTV installation, repairs, signal fixing, dish alignment, and Extra View setup throughout {{ area.name }}. <a href="/services/">See all our services</a>.</p>
</section>

{% include "partials/cta-banner.njk" %}
```

- [ ] **Step 3: Build and verify all 5 region pages generate**

Run: `npm run build`
Expected: exits 0.

Run:
```bash
for slug in cape-town west-coast overberg garden-route winelands; do
  test -f "_site/areas/$slug/index.html" && echo "PASS: $slug" || echo "FAIL: $slug"
done
```
Expected: `PASS` printed for all 5 slugs.

Run: `grep -q "Stellenbosch" _site/areas/winelands/index.html && echo PASS || echo FAIL`
Expected: `PASS` (confirms data-driven content, not hardcoded)

- [ ] **Step 4: Commit**

```bash
git add src/areas
git commit -m "Add service area index and 5 data-driven region pages"
```

---

## Task 7: Blog — Index, Post Layout, and 3 Starter Posts

**Files:**
- Create: `src/blog/posts/posts.json` (directory data file)
- Create: `src/_includes/layouts/post.njk`
- Create: `src/blog/index.njk`
- Create: `src/blog/posts/dstv-no-signal-troubleshooting.md`
- Create: `src/blog/posts/dstv-extra-view-explained.md`
- Create: `src/blog/posts/signs-dish-needs-realignment.md`

**Interfaces:**
- Consumes: `readableDate` filter and `posts` collection (Task 1's `.eleventy.js`).
- Produces: `/blog/<slug>/` URLs for each post (via the `posts.json` directory data file's templated `permalink`).

- [ ] **Step 1: Create the directory data file so every post shares layout, tag, and permalink pattern**

`src/blog/posts/posts.json`:
```json
{
  "layout": "layouts/post.njk",
  "tags": ["post"],
  "permalink": "/blog/{{ page.fileSlug }}/index.html"
}
```

- [ ] **Step 2: Create the post layout**

`src/_includes/layouts/post.njk`:
```njk
---
layout: base.njk
---
<article class="section blog-post">
  <div class="blog-post-header">
    <h1>{{ title }}</h1>
    <p class="post-date">{{ date | readableDate }}</p>
  </div>
  <div class="prose">
    {{ content | safe }}
  </div>
  <div class="blog-post-footer">
    <a href="/blog/" class="btn btn-ghost">&larr; Back to Blog</a>
    <a href="{{ site.whatsappHref }}" class="btn btn-primary">WhatsApp Us</a>
  </div>
</article>
```

- [ ] **Step 3: Write the 3 starter blog posts**

`src/blog/posts/dstv-no-signal-troubleshooting.md`:
```markdown
---
title: "DSTV No Signal? Here's How to Troubleshoot It"
date: 2026-08-01
excerpt: "Seeing the dreaded 'no signal' error on your DSTV decoder? Here are the most common causes and what you can check before calling a technician."
---
Nothing interrupts movie night like the dreaded DSTV "no signal" message. Before you panic, there are a few quick checks that solve the problem more often than you'd expect — and a few signs that mean it's time to call in a professional.

## 1. Check for Bad Weather

Heavy rain, thick cloud cover, or storms can temporarily disrupt satellite signal. If the weather is bad, wait it out — signal usually returns once conditions clear.

## 2. Check Your Cable Connections

Loose or damaged cabling between the dish, LNB, and decoder is one of the most common causes of signal loss. Check that all connections are firmly plugged in and that no cables are pinched, frayed, or exposed to the elements.

## 3. Restart Your Decoder

Unplug your decoder from the power outlet, wait 30 seconds, and plug it back in. This clears temporary software glitches that can cause signal errors.

## 4. Check the Dish for Obstructions

New trees, branches, or even a satellite dish that has been knocked out of position can block or misalign the signal path. A visual check of the dish (from the ground — never climb onto a roof yourself) can reveal obvious obstructions.

## 5. Look for an Error Code

DSTV decoders usually show a specific error code alongside "no signal" (such as E48-32 or E16-4). Noting this code helps a technician diagnose the issue faster when you call for help.

## When to Call a Technician

If you've checked the above and you're still stuck, the issue is likely dish misalignment, a faulty LNB, or a cable fault that needs proper diagnostic tools to find. Our technicians carry professional signal meters and can usually resolve the issue on the first visit.

Need help getting your signal back? [Get in touch with Digitech DSTV](/contact/) or WhatsApp us for same-day assistance across the Western Cape.
```

`src/blog/posts/dstv-extra-view-explained.md`:
```markdown
---
title: "DSTV Extra View Explained: Watch Different Channels on Every TV"
date: 2026-08-08
excerpt: "Want to watch different channels in every room without extra subscriptions? Here's how DSTV Extra View and the Explora Ultra decoder work."
---
If your household is constantly fighting over the remote, DSTV Extra View might be the answer. It lets everyone watch different channels, on different TVs, from a single DSTV subscription — no extra monthly packages required.

## How Extra View Works

Extra View links a second decoder to your main DSTV subscription, so a second TV in the house can access the same channels independently. Add the Extra View option to your subscription, and we'll install and pair the additional decoder for you.

## Explora Ultra: The All-in-One Option

The DSTV Explora Ultra decoder takes this further, supporting multiple simultaneous streams to different TVs and devices around the home over a wireless connection — no extra decoder box or extra cabling required in every room. It's the most flexible option for larger households.

## Which Option Is Right for You?

- **Extra View** — best if you already have a second decoder or want the simplest, most affordable multi-room setup.
- **Explora Ultra** — best for households that want a single, modern decoder handling multiple TVs wirelessly, with a more premium viewing experience.

## Installation

Both options need to be professionally set up to get the signal strength, cabling, and network configuration right. We handle the full installation — pairing the decoders, running any required cabling, and configuring wireless connectivity for Explora Ultra setups.

Ready to stop fighting over the remote? [Contact us](/contact/) for a free quote on Extra View or Explora Ultra installation anywhere in the Western Cape.
```

`src/blog/posts/signs-dish-needs-realignment.md`:
```markdown
---
title: "5 Signs Your DSTV Dish Needs Realignment"
date: 2026-08-15
excerpt: "Pixelated picture? Signal that drops in light rain? Your satellite dish might just need realignment. Here are 5 signs to look out for."
---
A satellite dish doesn't need to be knocked over to lose its alignment — even small shifts of a few millimetres can noticeably affect your DSTV signal. Here are five signs it might be time for a realignment.

## 1. Picture Freezes or Pixelates in Light Rain

If your picture struggles even in light drizzle (not just heavy storms), your dish may already be running on a weaker-than-normal signal, with little margin left for bad weather.

## 2. Signal Strength Reads Low on the Decoder

Check your decoder's signal strength meter (usually under Settings > Dish Setup). Consistently low readings, even in clear weather, point to a positioning problem.

## 3. You've Had Recent Roof or Building Work

Scaffolding, roof repairs, or even repainting near the dish can accidentally nudge it out of position. If problems started after nearby work, alignment is a likely cause.

## 4. Strong Winds or Storms Recently

Even a securely mounted dish can shift slightly during severe wind. If your signal quality dropped after a storm, that's a strong clue.

## 5. New Obstructions Nearby

New trees, extensions, or structures built in the signal path can force a dish to need repositioning to maintain a clear line of sight to the satellite.

## Getting It Fixed

Dish alignment isn't a guessing game — it requires a professional signal meter to get the angle exactly right for consistent, weatherproof reception. Our technicians realign dishes to the precise elevation and azimuth needed for the strongest possible signal.

Noticing any of these signs? [Book a dish alignment](/contact/) with Digitech DSTV and get back to uninterrupted viewing.
```

- [ ] **Step 4: Write the blog index page**

`src/blog/index.njk`:
```njk
---
layout: base.njk
title: "Blog | Digitech DSTV"
description: "DSTV tips, troubleshooting guides and satellite installation advice from Digitech DSTV."
---
<section class="section page-header">
  <h1>DSTV Tips &amp; Guides</h1>
  <p class="section-lede">Troubleshooting tips, setup guides, and satellite installation advice from the Digitech DSTV team.</p>
</section>

<section class="section blog-list">
  {% for post in collections.posts %}
  <a href="{{ post.url }}" class="card blog-list-item">
    <h2>{{ post.data.title }}</h2>
    <p class="post-date">{{ post.data.date | readableDate }}</p>
    <p>{{ post.data.excerpt }}</p>
    <span class="read-more">Read More &rarr;</span>
  </a>
  {% endfor %}
</section>
```

- [ ] **Step 5: Build and verify**

Run: `npm run build`
Expected: exits 0.

Run:
```bash
test -f "_site/blog/dstv-no-signal-troubleshooting/index.html" && \
test -f "_site/blog/dstv-extra-view-explained/index.html" && \
test -f "_site/blog/signs-dish-needs-realignment/index.html" && \
echo PASS || echo FAIL
```
Expected: `PASS` (confirms the `/blog/<slug>/` permalink pattern works, not `/blog/posts/<slug>/`)

Run:
```bash
grep -c "read-more" _site/blog/index.html
```
Expected: `3` (one per post, confirms the collection lists all 3)

- [ ] **Step 6: Commit**

```bash
git add src/blog src/_includes/layouts
git commit -m "Add blog index, post layout, and 3 starter posts"
```

---

## Task 8: Contact Page (Form Markup + Client-Side Submission)

**Files:**
- Create: `src/contact.njk`
- Create: `src/js/contact-form.js`

**Interfaces:**
- Consumes: `site` global data.
- Produces: `POST /contact-handler.php` request with JSON body `{name, phone, email, city, service, message, website}` — consumed by Task 9's PHP handler.

- [ ] **Step 1: Write the Contact page**

`src/contact.njk`:
```njk
---
layout: base.njk
title: "Contact Us | Digitech DSTV"
description: "Get in touch with Digitech DSTV for a free DSTV installation quote. Call, WhatsApp, or send us a message and we'll get back to you."
---
<section class="section page-header">
  <h1>Contact Digitech DSTV</h1>
  <p class="section-lede">Ready for a professional DSTV installation? We service the entire Western Cape. Get in touch today for a free quote.</p>
</section>

<section class="section contact-layout">
  <div class="contact-info">
    <h2>Contact Information</h2>
    <p><strong>Call Us</strong><br /><a href="{{ site.phoneHref }}">{{ site.phone }}</a></p>
    <p><strong>WhatsApp</strong><br /><a href="{{ site.whatsappHref }}">{{ site.phone }}</a></p>
    <p><strong>Email</strong><br /><a href="mailto:{{ site.email }}">{{ site.email }}</a></p>
    <p><strong>Service Area</strong><br />Entire Western Cape</p>
    <p><strong>Operating Hours</strong><br />{{ site.hours }}<br />{{ site.emergencyNote }}</p>
  </div>

  <form id="contact-form" class="contact-form">
    <div class="form-row">
      <label for="name">First Name *</label>
      <input type="text" id="name" name="name" required />
    </div>
    <div class="form-row">
      <label for="phone">Phone Number *</label>
      <input type="tel" id="phone" name="phone" required />
    </div>
    <div class="form-row">
      <label for="email">Email Address *</label>
      <input type="email" id="email" name="email" required />
    </div>
    <div class="form-row">
      <label for="city">City *</label>
      <input type="text" id="city" name="city" required />
    </div>
    <div class="form-row">
      <label for="service">Service Needed *</label>
      <select id="service" name="service" required>
        <option value="">Select...</option>
        <option>New DSTV Installation</option>
        <option>Signal Troubleshooting/No Signal</option>
        <option>Extra View Setup</option>
        <option>Explora Decoder Installation</option>
        <option>Extra TV Points</option>
        <option>Dish Realignment</option>
        <option>DSTV Repairs</option>
        <option>Commercial/Business Installation</option>
        <option>Other</option>
      </select>
    </div>
    <div class="form-row">
      <label for="message">Additional Details</label>
      <textarea id="message" name="message" maxlength="180" rows="4"></textarea>
    </div>
    <div class="form-row honeypot">
      <label for="website">Website</label>
      <input type="text" id="website" name="website" tabindex="-1" autocomplete="off" />
    </div>
    <button type="submit" class="btn btn-primary">Submit</button>
    <p id="form-status" role="status"></p>
  </form>
</section>

<script src="/js/contact-form.js"></script>
```

- [ ] **Step 2: Write the client-side submission script**

`src/js/contact-form.js`:
```js
document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.textContent = 'Sending...';
    status.className = '';

    var formData = new FormData(form);
    var payload = {};
    formData.forEach(function (value, key) { payload[key] = value; });

    fetch('/contact-handler.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (data.success) {
          status.textContent = "Thanks! We've received your message and will be in touch shortly.";
          status.className = 'status-success';
          form.reset();
        } else {
          status.textContent = data.error || 'Something went wrong. Please try again or call us directly.';
          status.className = 'status-error';
        }
      })
      .catch(function () {
        status.textContent = 'Something went wrong. Please try again or call us directly.';
        status.className = 'status-error';
      });
  });
});
```

- [ ] **Step 3: Build and verify**

Run: `npm run build`
Expected: exits 0.

Run:
```bash
grep -q 'id="contact-form"' _site/contact/index.html && \
grep -q 'name="email"' _site/contact/index.html && \
test -f _site/js/contact-form.js && \
echo PASS || echo FAIL
```
Expected: `PASS`

- [ ] **Step 4: Commit**

```bash
git add src/contact.njk src/js/contact-form.js
git commit -m "Add Contact page with form and client-side submission script"
```

---

## Task 9: Contact Form PHP Handler

**Files:**
- Create: `src/php/contact-handler.php`

**Interfaces:**
- Consumes: JSON POST body `{name, phone, email, city, service, message, website}` from Task 8's `contact-form.js`.
- Produces: JSON response `{success: bool, error?: string}`. Sends mail to `info@digitechdstv.co.za` on success. Deployed via the `src/php` passthrough copy (Task 1's `.eleventy.js`) to the output root, so it's served at `/contact-handler.php`.

- [ ] **Step 1: Write the PHP handler**

`src/php/contact-handler.php`:
```php
<?php
header('Content-Type: application/json');

$recipient = 'info@digitechdstv.co.za';

function respond($success, $error = null) {
    echo json_encode(['success' => $success, 'error' => $error]);
    exit;
}

function sanitizeHeader($value) {
    return str_replace(["\r", "\n"], '', $value);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    respond(false, 'Invalid request method.');
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data)) {
    http_response_code(400);
    respond(false, 'Invalid request body.');
}

// Honeypot: if this hidden field is filled, it's a bot. Pretend success, do nothing.
if (!empty($data['website'])) {
    respond(true);
}

$name = trim($data['name'] ?? '');
$phone = trim($data['phone'] ?? '');
$email = trim($data['email'] ?? '');
$city = trim($data['city'] ?? '');
$service = trim($data['service'] ?? '');
$message = trim($data['message'] ?? '');

if ($name === '' || $phone === '' || $email === '' || $city === '' || $service === '') {
    http_response_code(422);
    respond(false, 'Please fill in all required fields.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    respond(false, 'Please enter a valid email address.');
}

$subject = 'New Contact Form Submission - ' . $service;

$body = "New enquiry from digitechdstv.co.za\n\n";
$body .= "Name: $name\n";
$body .= "Phone: $phone\n";
$body .= "Email: $email\n";
$body .= "City: $city\n";
$body .= "Service Needed: $service\n";
$body .= "Message: " . ($message !== '' ? $message : '(none)') . "\n";

$headers = "From: no-reply@digitechdstv.co.za\r\n";
$headers .= "Reply-To: " . sanitizeHeader($email) . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = mail($recipient, $subject, $body, $headers);

if (!$sent) {
    http_response_code(500);
    respond(false, 'Could not send message. Please call or WhatsApp us directly.');
}

respond(true);
```

- [ ] **Step 2: Check PHP syntax validity**

Run: `php -l src/php/contact-handler.php`
Expected: `No syntax errors detected in src/php/contact-handler.php`

If `php` is not installed locally (`php -v` fails), skip this step — syntax will be verified functionally once deployed (Task 11's live smoke test posts a real submission).

- [ ] **Step 3: If PHP CLI is available, run a local functional test**

Run (in one terminal): `php -S localhost:8000 -t src/php`

Run (in a second terminal):
```bash
curl -s -X POST http://localhost:8000/contact-handler.php \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"0812345678","email":"test@example.com","city":"Cape Town","service":"DSTV Repairs","message":"test"}'
```
Expected: `{"success":true,"error":null}` (mail sending will fail in a bare local PHP server without a configured MTA — that's fine; the important check here is that validation and JSON handling work. If `mail()` fails locally, you'll see `{"success":false,"error":"Could not send message..."}` instead, which still confirms the script runs correctly — full mail delivery is verified live in Task 11.)

Run a second request with a missing field to confirm validation:
```bash
curl -s -X POST http://localhost:8000/contact-handler.php \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"","email":"test@example.com","city":"Cape Town","service":"DSTV Repairs"}'
```
Expected: `{"success":false,"error":"Please fill in all required fields."}`

Stop the local PHP server (Ctrl+C in its terminal) when done.

- [ ] **Step 4: Build and verify the passthrough copy places the file at the output root**

Run: `npm run build`
Expected: exits 0.

Run: `test -f _site/contact-handler.php && echo PASS || echo FAIL`
Expected: `PASS`

- [ ] **Step 5: Commit**

```bash
git add src/php
git commit -m "Add PHP contact form handler with validation and honeypot spam protection"
```

---

## Task 10: Update Deploy Pipeline

**Files:**
- Modify: `.github/workflows/deploy.yml`
- Delete: `.cpanel.yml`

**Interfaces:**
- Consumes: existing `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD` GitHub secrets (already configured).

- [ ] **Step 1: Rewrite the deploy workflow to build before deploying**

`.github/workflows/deploy.yml`:
```yaml
name: Deploy to cPanel

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build site
        run: npm run build

      - name: FTP Deploy
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./_site/
          server-dir: ./
          exclude: |
            .htaccess
            .user.ini
            php.ini
            .well-known/**
            cgi-bin/**
```

- [ ] **Step 2: Remove the now-unused cPanel deploy config**

```bash
git rm .cpanel.yml
```

- [ ] **Step 3: Verify the workflow YAML is well-formed**

Run: `python -c "import yaml; yaml.safe_load(open('.github/workflows/deploy.yml')); print('PASS')"`
Expected: `PASS`

If Python's `yaml` module isn't installed, skip this check — Task 12's `gh run watch` will immediately surface any YAML syntax error when the workflow is triggered, since GitHub Actions itself validates the file before running.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "Update deploy workflow to build with Eleventy before FTP deploy, remove unused .cpanel.yml"
```

---

## Task 11: Local Full-Site Verification

**Files:** none (verification only)

**Interfaces:** none

- [ ] **Step 1: Full clean build**

Run: `rm -rf _site && npm run build`
Expected: exits 0, no warnings about missing data or broken includes.

- [ ] **Step 2: Serve the built site locally**

Run: `npx eleventy --serve` (leave running)

Expected output includes a line like `Server at http://localhost:8080/`

- [ ] **Step 3: Open in the Browser pane and click through every page**

Use `preview_start` with `{url: "http://localhost:8080"}` (or add an entry to `.claude/launch.json` if the harness requires a named config), then:
- Confirm the nav bar links to Home, About, Services, Service Areas, Blog, Contact all work
- Confirm all 5 area pages load from `/areas/` (click each area card)
- Confirm all 3 blog posts load from `/blog/` and the "Back to Blog" link works
- Confirm the Contact page form renders all fields and the Submit button is present
- Resize to mobile width and confirm the nav collapses behind the hamburger toggle and the toggle opens/closes it
- Take a screenshot of the Home page and the Contact page for a final visual check

- [ ] **Step 4: Stop the local server**

Press Ctrl+C in the terminal running `npx eleventy --serve`.

---

## Task 12: Push and Verify Live Deployment

**Files:** none (deployment verification only)

**Interfaces:** none

- [ ] **Step 1: Push all commits from Tasks 1–10**

Run: `git push origin main`
Expected: push succeeds, shows the range of new commits.

- [ ] **Step 2: Watch the GitHub Actions run**

Run: `gh run list --repo thewebster0326/Digi-Tech-Dstv --limit 1`

Take the run ID from the output, then run: `gh run watch <run-id> --repo thewebster0326/Digi-Tech-Dstv --exit-status`
Expected: `Run ... has already completed with 'success'`

If it fails, run: `gh run view <run-id> --repo thewebster0326/Digi-Tech-Dstv --log-failed` to see the error and fix it before re-pushing.

- [ ] **Step 3: Verify the deployed files via FTP**

Run (substitute the actual FTP password — do not commit it to this file; retrieve it from wherever it's stored, e.g. the GitHub Actions secret `FTP_PASSWORD`):
```bash
curl -s --user 'deploy@digitechdstv.co.za:<FTP_PASSWORD>' "ftp://<CPANEL_HOSTNAME>/"
```
Expected: listing includes `index.html`, `about/`, `services/`, `areas/`, `blog/`, `contact/`, `contact-handler.php`, `css/`, `js/`, `assets/` — and still shows `.htaccess`, `.well-known`, `cgi-bin`, `php.ini`, `.user.ini` untouched (same as before this deploy).

- [ ] **Step 4: Smoke-test the contact form against the live handler**

Run:
```bash
curl -s -X POST https://digitechdstv.co.za/contact-handler.php \
  -H "Content-Type: application/json" \
  -d '{"name":"Smoke Test","phone":"0812345678","email":"test@example.com","city":"Cape Town","service":"DSTV Repairs","message":"Deployment smoke test - please disregard"}'
```
Expected: `{"success":true,"error":null}`. If DNS hasn't finished propagating yet, use `https://<ORIGIN_IP>/contact-handler.php` with a `Host: digitechdstv.co.za` header instead, or wait for propagation and retry.

Confirm with the site owner that this test submission arrived in the `info@digitechdstv.co.za` inbox.

- [ ] **Step 5: Final visual check on the live site**

Once DNS has propagated, open `https://digitechdstv.co.za/` in the Browser pane and spot-check the homepage, one area page, and one blog post render correctly with the deployed CSS.
