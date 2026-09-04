# Get G Modern Creativity visible in Google search (Rwanda)

## What the SEO scan found

Passing: server-side rendering, home page title/description, favicon, social preview basics, mobile viewport.

Failing (fix now):
1. Sitemap entries are relative (`/`, `/shop`) — crawlers ignore them. The sitemap's base URL is empty.
2. robots.txt doesn't point to the sitemap.

## Changes

### 1. Fix the sitemap (broken today)
- Set `BASE_URL` in `src/routes/sitemap[.]xml.ts` to `https://creator-hub-remixed.lovable.app` so every `<loc>` is a full https URL.

### 2. robots.txt
- Add `Sitemap: https://creator-hub-remixed.lovable.app/sitemap.xml` (keep existing allow rules).

### 3. Absolute canonical & og:url on every public route
- `/`, `/shop`, `/services/$slug`, `/shop/$slug` currently use relative canonical/og:url (or none). Make them absolute on the project domain so Google attributes each page correctly.

### 4. LocalBusiness structured data (JSON-LD) on the homepage
- Add `LocalBusiness`/`HomeAndConstructionBusiness` schema with name, phone, WhatsApp, email, location text, service area (Rwanda), and service list — this is the strongest signal for "near me / in Rwanda" searches.

### 5. Homepage share image
- Add absolute `og:image`/`twitter:image` (1200x630) from the hero image so shared links render well.

### 6. Verify
- Typecheck/build, fetch `/sitemap.xml` and confirm absolute URLs, mark the two scan findings fixed.

## What I can't do in code (you, outside the project)
- **Google Business Profile** — the single biggest factor for appearing in Rwanda local/map results. Create/claim it for G Modern Creativity Ltd.
- **Google Search Console** — connect it here so we can submit the sitemap and track indexing; I can wire it up if you connect it.

## Notes
- Changes reach the live site on the next publish; ranking improvements take days-to-weeks after Google re-crawls.
- Optional later: dedicated content pages (e.g. "Event decoration in Kigali") if you want to target more searches.
