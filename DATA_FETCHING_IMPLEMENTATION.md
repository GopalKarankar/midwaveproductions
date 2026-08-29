# Data Fetching Implementation Guide

## Overview
This document describes the complete data-fetching strategy for Midwave Productions. Data now flows from the dashboard (content management) to public pages via a standardized API layer.

---

## Architecture Pattern

**Golden Rule:** Dashboard pages (`/dashboard/*`) are role-guarded admin/content management interfaces. Public pages (`/`, `/artists`, `/media`, `/blog`, etc.) fetch *published data only* via `/api/*` routes.

### Flow

```
Dashboard (CRUD)
    ↓
MongoDB (Mongoose)
    ↓
API Routes (/api/*)
    ↓
Public Pages (Read)
    ↓
Components (Display)
```

---

## Implemented API Routes

### 1. **GET /api/artists** ✅ (EXISTING)
**Purpose:** Fetch published artists for roster pages and featured sections

**Response:**
```json
{
  "artists": [
    {
      "_id": "...",
      "stageName": "Artist Name",
      "slug": "artist-name",
      "genres": ["Electronic", "Ambient"],
      "profileImage": "...",
      "shortBio": "...",
      "coverImage": "...",
      ...
    }
  ]
}
```

**Query Parameters:**
- `featured=true` — Returns only featured artists (used on homepage)
- (Future) `genre=Electronic` — Filter by genre

**Security:**
- Always enforces `isPublished: true`
- Excludes: `pressKit`, `managedBy`, `ownerId`
- Rate limited: 30 req/min

**Used By:**
- `FeaturedArtistsSection` (homepage N°3)
- `ArtistRosterSection` (/artists page) — **UPDATED TO FETCH LIVE**

---

### 2. **GET /api/media** ✅ (NEWLY CREATED)
**Purpose:** Fetch published media assets grouped by artist/genre

**Response:**
```json
{
  "media": [
    {
      "_id": "...",
      "type": "video",
      "url": "https://...",
      "label": "Music Video Title",
      "filename": "video.mp4",
      "artistId": {
        "_id": "...",
        "stageName": "Artist",
        "slug": "artist",
        "genres": ["Electronic"]
      },
      "createdAt": "2026-08-29T..."
    }
  ]
}
```

**Query Parameters:**
- `type=video|image|audio|document` — Filter by media type
- `genre=Electronic` — Filter by artist genre
- `artistId=123` — Filter by specific artist

**Security:**
- Only fetches media for `isPublished: true` artists
- Excludes: `uploadedBy`
- Rate limited: 30 req/min
- Admin-only routes: POST, DELETE (in `/api/media/[id]`)

**Used By:**
- `MediaGenreShowcaseSection` (/media page) — **UPDATED TO FETCH LIVE**
- (Future) Photo galleries, audio players, document showcases

---

### 3. **GET /api/blog** ✅ (EXISTING)
**Purpose:** Fetch published blog posts with pagination & tagging

**Response:**
```json
{
  "posts": [
    {
      "_id": "...",
      "title": "Post Title",
      "slug": "post-slug",
      "excerpt": "...",
      "coverImage": "...",
      "tags": ["tag1", "tag2"],
      "publishedAt": "2026-08-29T..."
    }
  ]
}
```

**Query Parameters:**
- `tag=tag-name` — Filter by tag (case-insensitive)
- (Handled by page) Pagination via `?page=2`

**Security:**
- Always enforces `isPublished: true`
- Excludes: `body`, `authorId`
- Rate limited: 30 req/min

**Used By:**
- `/blog` page (Server Component direct fetch)
- `BlogListSection` (receives data as props)

---

### 4. **GET /api/blog/[slug]** ✅ (EXISTING)
**Purpose:** Fetch full blog post by slug

**Security:**
- Enforces `isPublished: true`
- Server-side fetch via `getPublishedPostBySlug()`

**Used By:**
- `/blog/[slug]` page

---

## Component-Level Fetching Strategy

### Server Components (Preferred)
Direct MongoDB fetch — no API route overhead:

```javascript
// src/app/page.js (Server Component, default)
async function getFeaturedArtists() {
  await dbConnect();
  const artists = await Artist.find({ isPublished: true, isFeatured: true })
    .select("...")
    .lean();
  return artists;
}

export default async function Home() {
  const artists = await getFeaturedArtists();
  return <FeaturedArtistsSection artists={artists} />;
}
```

**Used By:**
- `/` (homepage) — fetches featured artists, brands, stats
- `/blog` — fetches posts + tags with pagination
- `/blog/[slug]` — fetches full post

### Client Components (When Needed)
Fetch via API routes using `useEffect`:

```javascript
// Components that render in client context or need live updates
"use client";

export function ArtistRosterSection() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArtists() {
      const res = await fetch("/api/artists");
      const data = await res.json();
      setArtists(data.artists || []);
    }
    fetchArtists();
  }, []);

  // Render...
}
```

**Updated Components:**
- `ArtistRosterSection` — Fetches from `/api/artists` with genre grouping
- `MediaGenreShowcaseSection` — Fetches from `/api/media?type=video` with artist genre grouping

---

## Changes Made

### 1. Created `/api/media` Route
**File:** `src/app/api/media/route.js`

- Public GET handler for listing media
- Filters to published artists only
- Supports genre/type filtering
- Populates artist details on each media item
- Rate limited: 30/min

### 2. Updated `ArtistRosterSection`
**File:** `src/components/sections/ArtistRosterSection.js`

**Before:**
- Used static `placeholderArtists` data
- Static genre list from `artistGenres` constant

**After:**
- Fetches real artists via `useEffect` + `/api/artists`
- Dynamically extracts genres from fetched artists
- Shows loading/error/empty states
- Genre filter bar updates based on actual data

### 3. Updated `MediaGenreShowcaseSection`
**File:** `src/components/sections/MediaGenreShowcaseSection.js`

**Before:**
- Used static `videoShowcase` placeholder data
- Hardcoded genre grouping

**After:**
- Fetches real media via `useEffect` + `/api/media?type=video`
- Populates artist genres for grouping
- Shows loading/error/empty states
- Dynamically renders genre groups based on available media

### 4. Updated `VideoThumbCard`
**File:** `src/components/media/VideoThumbCard.js`

- Now accepts both placeholder format and MediaAsset format
- Handles missing fields gracefully
- Maps `item.label` → title, uses `item.url` for both image and link

### 5. Updated `GenreShowcaseGroup`
**File:** `src/components/media/GenreShowcaseGroup.js`

- Added `isEmpty` prop to gracefully hide empty genre groups
- Prevents rendering when no content exists for a genre

---

## Data Flow by Page

### Homepage (`/`)
```
Server Component (page.js)
  ├── getFeaturedArtists() → MongoDB
  ├── getFeaturedBrands() → MongoDB
  └── getStats() → MongoDB
      ├── FeaturedArtistsSection (receives artists as props)
      ├── ServicesSection (static data)
      ├── StatsSection (receives stats as props)
      ├── BrandsSection (receives brands as props)
      └── MarqueeTicker (receives artist names + genres)
```

### Artist Roster (`/artists`)
```
Server Component (page.js)
  └── ArtistRosterSection (Client Component)
      └── fetch("/api/artists")
          ├── Genre filter bar (dynamic)
          └── Genre → HorizontalDragCarousel → ArtistCard
```

### Media & Press (`/media`)
```
Server Component (page.js)
  └── MediaGenreShowcaseSection (Client Component)
      └── fetch("/api/media?type=video")
          ├── Extract genres from artists
          └── Genre → GenreShowcaseGroup → VideoThumbCard
```

### Blog (`/blog`)
```
Server Component (page.js)
  ├── Direct MongoDB fetch with pagination
  └── BlogListSection (receives posts + tags as props)
      ├── Tag filter (links to filtered queries)
      └── BlogPostCard grid
```

### Blog Detail (`/blog/[slug]`)
```
Server Component (page.js)
  ├── getPublishedPostBySlug() → MongoDB
  └── Render full post with metadata
```

---

## Rate Limiting

All public GET routes enforce rate limiting:

- **Route:** `/api/artists`, `/api/media`, `/api/blog`
- **Limit:** 30 requests per 60 seconds
- **Per:** Client IP (via `checkRateLimit()`)
- **Response:** 429 Too Many Requests with `Retry-After` header

### Implementation
```javascript
const { allowed, retryAfter } = checkRateLimit(request, {
  routeKey: 'artists-list',
  limit: 30,
  windowMs: 60 * 1000,
});
if (!allowed) return rateLimitResponse(retryAfter);
```

---

## Error Handling

### Client Components
```javascript
if (loading) return <p>Loading...</p>;
if (error) return <p>Failed to load data</p>;
if (data.length === 0) return <p>No data yet</p>;
```

### Server Components
```javascript
const data = await route(...);
if (!data || data.length === 0) {
  return <p>No data</p>;
}
```

---

## Field Exclusion (Security)

### Public Artist Responses
```javascript
const PUBLIC_EXCLUDE = "-pressKit -managedBy -ownerId -__v";
```

### Public Media Responses
```javascript
const PUBLIC_SELECT = "-uploadedBy -__v";
```

### Public Blog Responses
```javascript
const PUBLIC_LIST_SELECT = "title slug excerpt coverImage tags publishedAt";
```

---

## Future Enhancements

1. **Caching Strategy:**
   - Cache public API responses at edge (Vercel KV)
   - Revalidate on dashboard CRUD operations
   - Use Next.js `revalidatePath()` for ISR

2. **Search & Filtering:**
   - Add `?search=query` to artist/blog routes
   - Add multi-genre filtering via `?genres=Electronic,Ambient`
   - Add date range filtering for blog: `?from=2026-01-01&to=2026-12-31`

3. **Pagination:**
   - Implement limit/offset or cursor-based pagination on `/api/artists`
   - `/api/media` (for large media libraries)

4. **Related Content:**
   - `/api/artists/[id]/media` — Artist's media only
   - `/api/artists/[id]/bookings` — Artist's upcoming events
   - `/blog?relatedTag=tag` — Related posts by tag

5. **Export Endpoints:**
   - `/api/artists.json` — Full roster export (CSV/JSON)
   - `/api/press-kit` — Pre-formatted press materials

---

## Testing Checklist

- [ ] Fetch `/api/artists` — returns published artists only
- [ ] Fetch `/api/artists?featured=true` — returns featured artists only
- [ ] Fetch `/api/media?type=video` — returns only video media
- [ ] Fetch `/api/media?genre=Electronic` — filters by artist genre
- [ ] `/artists` page loads and genre filter works
- [ ] `/media` page loads and shows video showcase
- [ ] Rate limiting triggers after 30 requests in 60 seconds
- [ ] Errors are caught and displayed gracefully
- [ ] Empty states show appropriate messages
- [ ] Sensitive fields (pressKit, managedBy, uploadedBy) are not exposed

---

## Deployment Notes

- All routes are already deployed to Vercel
- No new environment variables needed
- Rate limiting uses in-memory store (sufficient for most cases)
- **For production with high traffic:** Replace with `@upstash/ratelimit` + Vercel KV

