# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Midwave Productions

## Project Overview

**Site:** midwaveproductions.com — Full-fledged Artist Management & Promotion Platform
**Language:** JavaScript only (no TypeScript)
**Stack:** Next.js (App Router) · Supabase · MongoDB · Framer Motion · Tailwind CSS v4 · Google OAuth

Source lives under `src/`. No `tailwind.config.js` — Tailwind v4 is CSS-first, tokens live in `@theme` block in `globals.css`.

---

## Development Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server on localhost:3000 |
| `npm run build` | Production build — run before deploying to catch errors |
| `npm run start` | Run production build locally (requires `npm run build` first) |
| `npm run lint` | Run ESLint on the codebase |
| `npm run lint -- --fix` | Auto-fix ESLint violations |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router, JS only) |
| Auth | Custom Google OAuth (authorization-code flow, httpOnly cookies) — identity/roles in MongoDB |
| Primary DB | MongoDB (Mongoose) — user identity/roles, artist profiles, media, bookings |
| File Storage | Supabase Storage (press kits, EPKs, photos, audio) |
| Styling | Tailwind CSS v4 (`@theme` in globals.css, no config file) |
| Animation | Framer Motion |
| Email | Resend |
| Deployment | Vercel |

---

## Visual Design Language

**Aesthetic:** Brutalist editorial (Crevixa-inspired) — numbered catalogue sections, full-bleed strips, hard black outlines, dense uppercase typography. Midwave brand colors replace Crevixa's palette.

### Color Tokens (sourced from Midwave logo — exposed as CSS vars in `@theme`)

```
--color-brand-blue:     #3AAFE0   /* dominant — logo wave, primary action */
--color-brand-yellow:   #F5E642   /* labels, tags, N° numbers only */
--color-brand-black:    #1A1A1A   /* structural outline weight */

--color-bg:             #0D0D0D
--color-surface:        #141414
--color-surface-2:      #1E1E1E
--color-border:         #2A2A2A

--color-text:           #F2F2F2
--color-muted:          #6A6A6A
--color-highlight:      #FFFFFF

--color-accent:         #3AAFE0   /* = brand-blue */
--color-accent-hover:   #62C4E8
--color-accent-2:       #F5E642   /* = brand-yellow */
--color-accent-2-hover: #FFF176

--color-error:          #E05A3A
--color-success:        #3AE09B
```

**Hard rule:** Yellow is never body text on dark bg (contrast fails <18px). Yellow = labels/tags/badges/N° numbers only. Blue = all interactive/action states (links, active nav, CTAs). Black outline replaces all gray borders.

### Typography

| Role | Font | Usage |
|---|---|---|
| Display | Bebas Neue | Headings, N° numbers, hero — all caps, wide tracking |
| Body | DM Sans | Bios, descriptions, nav |
| Utility | Space Mono | Genre tags, version labels, status badges |

Load via `next/font/google` in `layout.js`, expose as `--font-bebas-neue`, `--font-dm-sans`, `--font-space-mono`, referenced in `@theme` as `--font-display`, `--font-body`, `--font-mono`.

### Layout Grammar (Crevixa-derived — apply across all pages)

- **Numbered sections:** every major section has `N°X` label (`font-mono`, yellow) — encodes real site-map order
- **Full-bleed strips:** sections fill 100vw, inner content `max-w-7xl mx-auto`
- **Horizontal drag carousels:** content showcases use pointer-drag scroll, `← DRAG →` hint, no auto-scroll
- **Genre-grouped content:** media grouped by genre label, flush-left heading above each group
- **Text-only links:** `↗`/`↓` suffix, no button chrome for navigation links (reserve real buttons for form submits/primary CTAs)
- **Version label:** `V#001` in hero + footer — site treated as a "release"
- **Dense footer:** logo + numbered social links + version + copyright, no newsletter

### Signature Element
Dual-row marquee ticker at section transitions — row 1 scrolls left (artist names, blue), row 2 scrolls right (genre/service tags, yellow). Pure CSS `@keyframes`, no JS.

### Animation Rules
- Scroll reveal: `fadeInUp` (y:40→0, opacity 0→1, duration 0.6s, ease `[0.22,1,0.36,1]`), `staggerChildren: 0.12`
- N° numbers slide in separately from left (`x:-30→0`) before their section text
- Cards: `scale 1.02–1.03` on hover, border→accent, 0.25–0.3s
- Page transitions: opacity fade only, no slide, 0.3s
- **Every Framer Motion block must check `useReducedMotion()`** — skip transforms if true, fade only at half duration

---

## Directory Structure (key paths — `src/` prefixed)

```
src/
├── app/
│   ├── (public)/            # page.js, artists/, services/, media/, booking/, about/
│   ├── (auth)/               # login/, auth/callback/
│   ├── (dashboard)/          # dashboard/, admin/ (role-guarded layout)
│   └── api/                  # artists/, bookings/, contact/, media/upload/, users/[id]/role/
├── components/
│   ├── ui/                   # ArrowLink, Badge, SectionNumber, SectionHeading, FormField, VersionLabel
│   ├── layout/                # Navbar, Footer, MarqueeTicker
│   ├── sections/               # HeroSplit, SectionStrip, etc.
│   ├── artists/                # ArtistCard, ArtistProfile
│   ├── media/                  # GenreShowcaseGroup, VideoThumbCard, BrandContentCard, PhotoGrid, Lightbox
│   ├── booking/
│   └── admin/
├── lib/
│   ├── supabase/              # admin.js (service role for Storage, server-only)
│   ├── mongodb/
│   │   ├── connect.js         # Mongoose singleton
│   │   └── models/            # Artist.js, Booking.js, MediaAsset.js, User.js
│   ├── auth/                  # getSession.js, requireRole.js
│   ├── motion/                # variants.js (fadeInUp, staggerContainer, slideInLeft)
│   └── email/                  # resend.js
├── hooks/                       # useSession.js, useReducedMotion.js
└── constants/roles.js           # ROLES, ROLE_HIERARCHY, hasRole()
```

---

## Environment Variables

```bash
# Supabase — Storage only (media uploads)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # server-only — never NEXT_PUBLIC_, never imported client-side

# MongoDB — User identity, roles, artist profiles, media, bookings
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
MONGODB_DB=midwaveproductions

# App — Site URL and Google OAuth
NEXT_PUBLIC_SITE_URL=https://midwaveproductions.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email — Resend API for transactional emails
RESEND_API_KEY=your_resend_api_key
CONTACT_EMAIL_TO=contact@midwaveproductions.com

# Auth — Role assignment on login
ADMIN_EMAILS=comma-separated-admin-emails@example.com

# Security & Webhooks
SESSION_JWT_SECRET=generate_random_string_for_production
CRON_SECRET=your_cron_secret_token
```

**Security rules:**
- `SUPABASE_SERVICE_ROLE_KEY` may only be imported in `lib/supabase/admin.js`, server-side only
- `GOOGLE_CLIENT_SECRET` is server-side only — never expose to the browser
- `ADMIN_EMAILS` — comma-separated list; users with these Google emails are granted `ROLES.ADMIN` on first login, others default to `ROLES.USER`
- Never commit real credentials — use `.env.local` (gitignored)
- All `NEXT_PUBLIC_*` vars are exposed to the browser; only use for non-sensitive config
- Rotate secrets immediately if accidentally committed to version control

---

## Local Development Setup

1. **Clone and install:**
   ```bash
   git clone <repo-url>
   cd midwaveproductions
   npm install
   ```

2. **Set up environment:**
   - Copy `.env.example` to `.env.local`
   - Fill in credentials for your development environment (see Supabase/MongoDB setup below)

3. **MongoDB:**
   - Use Atlas staging cluster (ask team for connection string and IP allowlist)
   - Or run local: `mongod --dbpath ./data` + set `MONGODB_URI=mongodb://localhost:27017`

4. **Supabase (Storage only):**
   - Create a Supabase project at supabase.com for media file Storage
   - Grab the project URL, anon key, and service-role key for `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`

5. **Google OAuth:**
   - Set up a Google Cloud project and OAuth consent screen
   - Create OAuth 2.0 credentials (Web app), configure authorized redirect URIs to include `http://localhost:3000/auth/callback`
   - Grab the client ID and client secret for `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

6. **Start dev server:**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 — you should see the homepage.

7. **Test auth:**
   - Visit `/login`, click "SIGN IN WITH GOOGLE"
   - OAuth redirects to Google, then back to http://localhost:3000/auth/callback, which exchanges the code and stores user in MongoDB's `users` collection
   - Check MongoDB: a new document with `googleId`, `email`, `name`, `picture`, and `role` should appear
   - First login as an email in `ADMIN_EMAILS` creates a user with `role: 'admin'`, all others default to `role: 'user'`

8. **Test file uploads:**
   - As a logged-in user, upload test files via admin panel → Media
   - Files are stored in Supabase Storage bucket `media` (requires Supabase setup above)

---

## Data Architecture

### MongoDB (Mongoose) — Identity, Roles, Content & Business Data

**`User`** — `googleId` (unique, indexed), `email` (unique, lowercase), `name`, `picture`, `role` (enum `user`|`artist`|`manager`|`admin`, default `user`). Created on first Google login; role is determined by `ADMIN_EMAILS` env var at insertion time only. Timestamps on.

**`Artist`** — `ownerId` (MongoDB `User._id`, unique, indexed), `slug` (unique), `stageName`, `realName`, `bio`, `shortBio`, `genres[]`, `socialLinks{}`, `profileImage`, `coverImage`, `pressKit`, `featuredTracks[]` (title/url/platform), `upcomingEvents[]` (title/date/venue/city/ticketUrl), `isPublished`, `isFeatured`, `managedBy`. Timestamps on.

**`Booking`** — `artistId` (ref Artist, indexed), `requesterName/Email/Phone`, `organization`, `eventType` (enum), `eventDate`, `eventLocation`, `budget`, `message`, `status` (enum: pending/reviewing/approved/rejected/cancelled, indexed), `adminNotes`. Timestamps on.

**`MediaAsset`** — `artistId` (ref Artist), `uploadedBy`, `type` (image/audio/video/document), `url`, `storagePath`, `filename`, `size`, `mimeType`, `label`. Timestamps on.

All models: `mongoose.models.X || mongoose.model('X', Schema)` guard against re-registration on hot reload.

### Supabase (PostgreSQL) — Deprecated from Auth, retained for Storage

No longer used for authentication or role storage. Supabase Storage bucket `media` remains in use for file uploads via `/api/media/upload`.

---

## Role System

```javascript
// constants/roles.js
export const ROLES = { USER: 'user', ARTIST: 'artist', MANAGER: 'manager', ADMIN: 'admin' }
export const ROLE_HIERARCHY = { user: 0, artist: 1, manager: 2, admin: 3 }
export function hasRole(userRole, requiredRole) {
  return (ROLE_HIERARCHY[userRole] ?? -1) >= (ROLE_HIERARCHY[requiredRole] ?? 999)
}
```

- `user`: default, fans/public
- `artist`: edits own artist profile only
- `manager`: manages assigned artists
- `admin`: full access — all artists, users, bookings, role assignment

---

## Auth & Session Management

**Google OAuth flow:**
1. User clicks "SIGN IN WITH GOOGLE" in navbar (`GoogleSignInButton`)
2. Redirects to `/api/auth/google/authorize` → Google's auth endpoint
3. Google redirects back to `/auth/callback` with authorization `code`
4. `/auth/callback` POSTs code to `/api/auth/google/callback`
5. Backend exchanges code for tokens, fetches user info from Google
6. User record created/updated in MongoDB's `users` collection (role = `ROLES.ADMIN` if email matches `ADMIN_EMAILS`, else `ROLES.USER`)
7. httpOnly cookies set: `google_access_token`, `google_id_token`, `google_user_id` (the Google ID)
8. Redirect to `/dashboard` on success

**Session & role-checking:**
- `lib/auth/getSession.js` — fetches httpOnly `google_user_id` cookie → looks up user in MongoDB `users` collection → returns `{ session: { user: { id, email, name, picture } }, profile: { role } }`
- `lib/auth/requireRole.js` — calls `getSession()` → compares `profile.role` against `ROLE_HIERARCHY` → returns `{ error: NextResponse(401|403), session, profile }` or `{ error: null, session, profile }`
- **Every API route** calls `requireRole()` at the correct tier — checks are not delegated to middleware

**Logout:** `/api/auth/logout` deletes httpOnly cookies (`google_access_token`, `google_id_token`, `google_user_id`)

### Google Login Data Storage Rule

**Google login details (`googleId`, `email`, `name`, `picture`, `role`) are stored in MongoDB via the `User` model — never in Supabase.** This is the single source of truth for user identity and roles. Supabase remains in use only for Storage (media file uploads). If you need to store additional user metadata, add it to the `User` schema in MongoDB, never to a Supabase `profiles` table.

---

## API Route Conventions

- Every route wrapped in try/catch, errors logged with `[METHOD /path]` prefix, generic 500 message to client.
- Public GET routes (artists list, artist detail) filter to `isPublished: true`, `.select()` to whitelist fields — never expose `managedBy`, internal flags, or Mongo `__v`.
- Mutating routes (`POST`/`PATCH`/`DELETE`) require `requireRole()` at the correct tier:
  - `POST /api/artists` → manager+
  - `PATCH /api/artists/[id]` → owner (artist editing own profile) OR manager+; non-admins stripped of `isPublished`/`isFeatured`/`managedBy` fields server-side before write
  - `DELETE /api/artists/[id]` → admin only
  - `GET /api/bookings` (list) → admin only; `POST /api/bookings` → public, no auth (booking inquiries are public-facing)
  - `PATCH /api/users/[id]/role` → admin only, validates role against `ROLES` enum, writes to MongoDB `users` collection
- `POST /api/contact` and `POST /api/bookings`: server-side re-validation always (required fields, email regex) — never trust client validation alone.
- File uploads (`/api/media/upload`): validate MIME type + size before writing to Supabase Storage; requires `requireRole('artist')` or higher.

---

## Pages & Sections Reference

### Homepage (`/`)

**N°0 Loading screen:** first-visit only (sessionStorage flag), logo path-draw animation, ~1.5s, non-blocking after.

**N°1 Hero (`HeroSplit`):** two-column split, NOT a giant-headline hero. Left: breadcrumb → animated wave-logo mark + "Watch Showreel ↗" → tagline ("Artist run — management, promotion, bookings and media production.") + `V#001` → wordmark + scroll button. Right: `SITE-MAP ↓` heading + 5 sitemap entries (dual micro-labels + `N°X` + heading + subheading + explore/contact link). Showcase pages use `explore ↗` (blue); the booking/hire page uses `contact ↗` (yellow).

**N°2 Featured Artists:** `HorizontalDragCarousel` of `ArtistCard`s, genre badge (yellow), hover reveals bio + `PROFILE ↗`.

**N°3 Services:** stacked full-width `SectionStrip`s (not a grid) — Artist Management / Promotion & PR / Event Booking.

**N°4 Stats:** animated count-up on scroll — Artists Managed / Events Booked / Years in Industry.

**N°5 Marquee:** `MarqueeTicker` — artist names (blue) + service tags (yellow).

**N°6 Brands:** grayscale logo strip, color reveal on hover.

**N°7 CTA band:** full-bleed `bg-brand-blue` (only section using blue as background), near-black text, `SEND INQUIRY ↗`.

### Artist Roster (`/artists`)
Genre filter bar (yellow tags, active = blue bg). Genre-grouped `HorizontalDragCarousel`s (Pattern 1, see Component Patterns). `ArtistCard`: 3:4 portrait, full-bleed image, bottom gradient overlay, hover reveals bio.

### Artist Profile (`/artists/[slug]`)
Full-bleed cover hero → bio / embedded tracks (Spotify/SoundCloud) / upcoming events table / social links (text list) / press kit download / booking CTA band.

### Media & Press (`/media`)
Genre-grouped video showcase (Pattern 1) → marquee → press kit request section (2-col: what's included / request form) → featured press coverage (3-col quotes) → stats band → CTA.

### Booking (`/booking`)
`N°4` header, `BookingForm` with bottom-border-only fields (no box chrome), artist pre-fill via `?artist=[id]` query param, inline success state (no page reload).

### Dashboard (`/dashboard`)
Numbered sidebar nav. Artists: edit own profile. Managers: assigned roster + booking statuses. Admins redirected to `/admin`.

### Admin (`/admin`)
Numbered sidebar: Overview (stat tiles) / Artists (publish+feature toggles) / Bookings (status filter tabs) / Users (role dropdown) / Media (Storage browser).

### Footer (all public pages)
Logo + numbered social links (`1. EMAIL ↗`, etc.) + copyright + `V#001` version label bottom-right.

---

## Security Checklist

- [ ] **CRITICAL:** `.env.example` contains placeholder values ONLY — never real credentials
- [ ] If real credentials ever leaked to version control: rotate them immediately in all environments
- [ ] All admin API routes guarded by `requireRole('admin')`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` never imported outside `lib/supabase/admin.js`
- [ ] `GOOGLE_CLIENT_SECRET` is server-side only, never exposed to browser via `NEXT_PUBLIC_` prefix
- [ ] MongoDB responses always `.select()`-whitelisted in public routes
- [ ] All user text trimmed/sanitized before DB write
- [ ] Upload route validates MIME + size before Storage write
- [ ] Booking/contact forms re-validated server-side regardless of client validation
- [ ] `ADMIN_EMAILS` roles assigned at MongoDB write time, never mutable via client
- [ ] CSP headers set in `next.config.mjs` (allow Spotify/YouTube/SoundCloud iframes)
- [ ] Rate limiting on `/api/contact`, `/api/bookings`
- [ ] `.env.local` gitignored; `.env.example` committed with placeholders only

---

## Testing

No automated tests are currently configured. When adding tests:

- **Framework choice:** Jest (default for Next.js) or Vitest (modern, faster)
- **API routes:** Mock Supabase client and MongoDB models, test auth checks + business logic
- **Components:** Test Framer Motion animations with `useReducedMotion()` mocked to true (verify no transforms break layout)
- **E2E (future):** Playwright or Cypress for auth flow, booking form submission, upload flow
- **Config:** Jest config should live in `jest.config.js` or `package.json` `jest` field; tests in `__tests__/` or colocated `.test.js` files

---

## Linting & Code Style

- **ESLint:** Run with `npm run lint` (auto-fix with `--fix` flag)
- **Config:** ESLint v9+ uses `eslint.config.js` (flat config); older versions use `.eslintrc.json`
- **Current state:** `eslint` listed in package.json but no config file — add `.eslintrc.json` or `eslint.config.js` with Next.js + React rules
- **Formatting:** No Prettier configured — match existing code style (2-space indentation, no semicolons encouraged per Crevixa pattern)
- **Pre-commit:** Consider a husky + lint-staged hook to run linting before commits (optional)

---

## Configuration (next.config.mjs)

Currently a minimal stub. Should be expanded for production to include:

- **CSP headers:** Allow iframes from Spotify, YouTube, SoundCloud (needed for embedded players in artist profiles + media showcase)
- **Image optimization:** Configure image domains for Supabase Storage URLs + external embeds
- **Redirects (future):** If migrating from old Crevixa domain, add rewrites/redirects for old routes → new ones
- **Environment-based config:** Different API endpoints or feature flags per environment (dev/preview/prod)

---

## Component Patterns (Crevixa-extracted — implementations live in `components/`, not duplicated here)

| Component | Purpose |
|---|---|
| `SectionNumber` | `N°X` label, yellow, `font-mono` |
| `SectionHeading` | Bebas Neue, full caps, highlight color |
| `Badge` | Yellow/blue/muted pill — genre tags, status labels |
| `ArrowLink` | Text-only link, `↗`/`↓` suffix, no button chrome |
| `SectionStrip` | Full-bleed horizontal strip w/ top border — used in Services |
| `MarqueeTicker` | Dual-row opposing-direction scroll, CSS-only |
| `HorizontalDragCarousel` | Pointer-drag scroll container, momentum, no autoscroll |
| `FormField` | Bottom-border-only input, label above in yellow mono |
| `VersionLabel` | `V#001` — hero + footer |
| `GenreShowcaseGroup` + `VideoThumbCard` | Genre-grouped carousel (from Crevixa `/musicvideos.html`) — group heading + `HorizontalDragCarousel` of thumbnail cards, hover reveals `WATCH ↗` |
| `BrandContentCard` | Hover-reveal preview (from `/brandcontent.html`) — static image → muted autoplay video loop on hover (NOT GIF — perf) |
| `PhotoGrid` + `Lightbox` | Full-res lightbox gallery (from `/photo.html`) — grid → click opens full image, keyboard nav (←/→/Esc) |

**GIF handling rule:** `next/image` strips GIF animation — any `MediaAsset` with `mimeType === 'image/gif'` renders via plain `<img>`, bypassing `next/image`.

**Embedded presentation pattern** (from `/workstructure.html`): Crevixa's pricing page is an embedded Google Slides iframe. Acceptable only as an interim placeholder (`// TODO: replace with hand-built pricing page`) — final `/pricing` page should be a structured `SectionStrip`-based page, not an iframe (can't be brand-styled, breaks on mobile).

---

## Coding Conventions

- No TypeScript — plain `.js`/`.jsx` throughout
- Server Components by default; `'use client'` only for hooks/events/Framer Motion
- Client components fetch via `/api/*`; Server Components fetch directly
- `@/` import alias → `./src/*` (confirm in `jsconfig.json`)
- Naming: PascalCase components, camelCase functions/vars, kebab-case files/routes
- Never pass unwhitelisted data straight to DB writes — destructure explicitly
- Never access `process.env` inside components — pass as props from Server Components, or use `NEXT_PUBLIC_` prefix explicitly
- Every Framer Motion animation checks `useReducedMotion()` before applying transforms

---

## Deployment (Vercel)

**Pre-deploy:** clean `npm run build`, all env vars set per environment (Production/Preview/Development use **separate** Supabase projects + MongoDB clusters — never point Preview at prod data), Supabase redirect URLs include production domain, MongoDB Atlas IP allowlist set to `0.0.0.0/0` (Vercel has no fixed IP range).

**Flow:** `vercel link` → set env vars in dashboard (per-environment table, not CLI) → `vercel --prod` → add custom domain (Vercel-managed nameservers recommended for auto-SSL) → update Supabase `Site URL` + redirect URLs to production domain (OAuth silently fails without this) → verify full flow manually (login, artist roster loads, booking submits + emails, admin role changes, uploads).

**Git integration:** connect repo → `main` = production, `dev`/`feature/*` = Preview deploys with isolated DB/Supabase resources.

**`vercel.json`:** framework `nextjs`, cron jobs (if any) protected by `CRON_SECRET` bearer check.

**Monitoring:** Vercel Analytics + Speed Insights (`@vercel/speed-insights/next`), optional Sentry for error tracking, external uptime monitor on the production domain.

**Rollback:** `vercel rollback [deployment-url]` or promote a prior deployment in dashboard — instant, no rebuild.
