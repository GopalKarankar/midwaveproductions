# Task: Implement Missing Parts Against CLAUDE.md Spec

This document describes four gaps between the current codebase and the CLAUDE.md specification. Each section is a self-contained task that can be completed independently, though Section 4 (tests) is easiest after the others are done (since it tests the code being fixed).

Scope: rebuild Hero section left column, add GIF upload+render support, fix 4 API route bugs, and scaffold Jest tests.

---

## Section 1: Rebuild HeroSection.js Left Column to Match N°1 Hero Spec

### Current State
`src/components/sections/HeroSection.js` (lines 17-63) implements a conventional giant-headline hero with eyebrow, "WE MAKE ARTISTS MOVE" headline, paragraph, and two CTA buttons. CLAUDE.md N°1 Hero spec explicitly says it should NOT be this pattern.

### Target State
Left column redesigned as: breadcrumb → animated wave-logo mark + "Watch Showreel ↗" link → tagline ("Artist run — management, promotion, bookings and media production.") + `V#001` version label → "MIDWAVE" wordmark + circular scroll-down button. All motion blocks guarded by `useReducedMotionVariants()` (not the older `useReducedMotion()` hook).

### Files to Modify

**`src/components/sections/HeroSection.js` — replace lines 17-63 only (left `motion.div`)**

Keep the right column (sitemap grid) completely untouched.

Replace the left column with this structure:

```javascript
<motion.div
  className="flex flex-col justify-between"
  variants={staggerContainer}
  initial="hidden"
  animate="visible"
>
  {/* Breadcrumb — top */}
  <motion.p
    variants={reducedFadeInUp}
    className="font-mono text-xs tracking-widest text-muted uppercase"
  >
    MIDWAVE <span className="text-accent">— Home</span>
  </motion.p>

  {/* Animated wave-logo + showreel link — center */}
  <motion.div
    variants={reducedFadeInUp}
    className="relative flex items-center justify-center h-40"
  >
    {/* Decorative concentric circles */}
    <div className="absolute w-64 h-32 border border-border rounded-full" />
    <div className="absolute w-56 h-36 border border-border rounded-full -rotate-6" />
    
    {/* Animated wave path — only if not reducing motion */}
    {!shouldReduceMotion && (
      <motion.svg
        width="28" height="18" viewBox="0 0 28 18"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
      >
        <path
          d="M2 2 Q8 2 10 10 Q12 18 18 10 Q20 2 26 2"
          stroke="currentColor"
          className="text-accent"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </motion.svg>
    )}

    {/* "Watch Showreel ↗" link — overlaid right */}
    <a
      href="#showreel"
      className="absolute right-0 font-mono text-xs text-highlight text-right leading-tight
        hover:text-accent transition-colors duration-200"
    >
      Watch<br />Showreel<br /><span className="text-accent">↗</span>
    </a>
  </motion.div>

  {/* Tagline + version — bottom-left */}
  <motion.div variants={reducedFadeInUp}>
    <p className="font-body font-bold text-text text-sm max-w-xs mb-4">
      Artist run — management, promotion, bookings and media production.
    </p>
    <VersionLabel variant="lg" />
  </motion.div>

  {/* Wordmark + scroll button — very bottom */}
  <motion.div variants={reducedFadeInUp}>
    <div className="border-t border-border mb-4" />
    <div className="flex items-center justify-between">
      <div className="font-display text-4xl md:text-5xl text-highlight tracking-widest">
        MIDWAVE
      </div>
      <a
        href="#showcase"
        aria-label="Scroll to showcase"
        className="w-14 h-14 rounded-full border border-border flex items-center justify-center
          text-highlight hover:border-accent hover:text-accent transition-colors duration-200"
      >
        ↓
      </a>
    </div>
    <div className="border-t border-border mt-4" />
  </motion.div>
</motion.div>
```

### Required Imports
At the top of the file, ensure these are imported:
- `VersionLabel` from `@/components/ui/VersionLabel` (already used elsewhere, may already be imported)
- Both already imported: `staggerContainer`, `fadeInUp` from variants, `useReducedMotionVariants()` from the hook

### Notes
- The tagline text is an exact copy from `src/app/layout.js` metadata description — use it verbatim, do not invent new copy.
- `useReducedMotionVariants()` returns `{ shouldReduceMotion, fadeInUp: reducedFadeInUp }` — use `reducedFadeInUp` as the variant, not `fadeInUp` directly.
- The wave SVG animation only runs if `!shouldReduceMotion` (conditional render + `initial={{ pathLength: 0 }}`, not skipping the entire SVG).
- The scroll-down button anchors to `#showcase` (the right column or the next section) — no need to create an element with that ID yet if it doesn't exist; the link is semantic.

---

## Section 2: GIF Upload Support + Media Thumbnail Rendering with Bypass Rule

### Current State
1. GIF (`image/gif`) MIME type is not in the allow-list at `src/app/api/media/upload/route.js:10-18`, so GIFs cannot be uploaded.
2. `src/components/admin/MediaAdminBrowser.js` renders a metadata-only table for uploaded files — no thumbnails, no image preview of any kind.

### Target State
1. Allow GIF uploads in the upload route.
2. Add a media thumbnail column to `MediaAdminBrowser.js` (image type only), using `next/image` by default but falling back to plain `<img>` when the asset is a GIF (implementing the spec's "GIF handling rule: bypass `next/image` for GIFs").
3. Create a reusable helper function `isGifAsset()` to check GIF MIME type.

### Files to Create/Modify

#### New File: `src/lib/media/isGifAsset.js`
```javascript
// Single source of truth for GIF detection per spec's GIF handling rule
export function isGifAsset(mimeType) {
  return mimeType === "image/gif";
}
```

#### Modify: `src/app/api/media/upload/route.js`
Add GIF to the `MIME_RULES` object (lines 10-18). Insert this line after the WebP entry:
```javascript
  "image/gif": { type: "image", maxSize: 10 * 1024 * 1024 },
```

Full object after change:
```javascript
const MIME_RULES = {
  "image/jpeg": { type: "image", maxSize: 10 * 1024 * 1024 },
  "image/png": { type: "image", maxSize: 10 * 1024 * 1024 },
  "image/webp": { type: "image", maxSize: 10 * 1024 * 1024 },
  "image/gif": { type: "image", maxSize: 10 * 1024 * 1024 },
  "audio/mpeg": { type: "audio", maxSize: 50 * 1024 * 1024 },
  "audio/wav": { type: "audio", maxSize: 50 * 1024 * 1024 },
  "video/mp4": { type: "video", maxSize: 200 * 1024 * 1024 },
  "application/pdf": { type: "document", maxSize: 15 * 1024 * 1024 },
};
```

#### Modify: `src/components/admin/MediaAdminBrowser.js`
Add a thumbnail preview column. Import `next/image` and the new helper at the top:
```javascript
import Image from "next/image";
import { isGifAsset } from "@/lib/media/isGifAsset";
```

In the table header (inside the `<thead>` row), add a new `<th>` before the "Filename" column:
```javascript
<th className="text-left px-4 py-3 font-mono text-xs text-muted uppercase tracking-widest">
  Preview
</th>
```

In the table body (inside the `<tbody>` `map`), wrap the entire `<tr>` in a conditional so thumbnails only show for images:
```javascript
{items.map((asset) => asset.type === "image" && (
  <tr
    key={asset._id}
    className="border-t border-border hover:bg-surface-2 transition-colors"
  >
    {/* NEW — Preview thumbnail cell */}
    <td className="px-4 py-3">
      {isGifAsset(asset.mimeType) ? (
        <img
          src={asset.url}
          alt={asset.filename}
          className="w-16 h-16 object-cover border border-border"
        />
      ) : (
        <Image
          src={asset.url}
          alt={asset.filename}
          width={64}
          height={64}
          className="w-16 h-16 object-cover border border-border"
        />
      )}
    </td>

    {/* Existing cells — Filename, Artist, Size, Uploaded, Action */}
    <td className="px-4 py-3 font-body text-highlight truncate">
      {asset.filename}
    </td>
    {/* ... rest of the row as-is ... */}
  </tr>
))}
```

Or, if you prefer to keep all rows visible but only show thumbnails for images, add the thumbnail cell to every row and render `null` for non-images:
```javascript
<td className="px-4 py-3">
  {asset.type === "image" ? (
    isGifAsset(asset.mimeType) ? (
      <img src={asset.url} alt={asset.filename} className="w-16 h-16 object-cover border border-border" />
    ) : (
      <Image src={asset.url} alt={asset.filename} width={64} height={64} className="w-16 h-16 object-cover border border-border" />
    )
  ) : null}
</td>
```

**Important:** Do NOT modify `MediaCard.js`, `VideoThumbCard.js`, or `PhotoGrid.js` — these intentionally render placeholder/demo data and are not wired to real `MediaAsset` records yet.

---

## Section 3: Fix Four API Route Bugs

All four are small, localized fixes. No logic changes — only error-handling standardization.

### Bug 1: Empty catch block in GET /api/artists/[id]

**File:** `src/app/api/artists/[id]/route.js` (lines 26-28)

**Current:**
```javascript
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
```

**Replace with:**
```javascript
  } catch (err) {
    console.error("[ROUTE GET /api/artists/[id]]", err);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
```

### Bug 2: JSON parsing outside try/catch in PATCH /api/bookings/[id]

**File:** `src/app/api/bookings/[id]/route.js` (lines 8-22)

**Current:**
```javascript
export async function PATCH(request, { params }) {
  const { error } = await requireRole("admin");
  if (error) return error;

  const { id } = await params;
  const { status, adminNotes } = await request.json();

  if (status && !BOOKING_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "Invalid status. Must be one of: pending, reviewing, approved, rejected, cancelled" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    // ...rest of logic
```

**Replace with:**
```javascript
export async function PATCH(request, { params }) {
  const { error } = await requireRole("admin");
  if (error) return error;

  const { id } = await params;

  try {
    const { status, adminNotes } = await request.json();

    if (status && !BOOKING_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: pending, reviewing, approved, rejected, cancelled" },
        { status: 400 }
      );
    }

    await dbConnect();
    // ...rest of logic
```

Move both `await request.json()` and the status validation inside the `try` block that currently starts at line 22.

### Bug 3: JSON parsing outside try/catch in PATCH /api/users/[id]/role

**File:** `src/app/api/users/[id]/role/route.js` (lines 8-19)

**Current:**
```javascript
export async function PATCH(request, { params }) {
  const { error } = await requireRole("admin");
  if (error) return error;

  const { id } = await params;
  const { role } = await request.json();

  if (!Object.values(ROLES).includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  try {
    await dbConnect();
    // ...rest of logic
```

**Replace with:**
```javascript
export async function PATCH(request, { params }) {
  const { error } = await requireRole("admin");
  if (error) return error;

  const { id } = await params;

  try {
    const { role } = await request.json();

    if (!Object.values(ROLES).includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    await dbConnect();
    // ...rest of logic
```

Move both `await request.json()` and the role validation inside the `try` block.

### Bug 4: Inconsistent log prefix in POST /api/contact

**File:** `src/app/api/contact/route.js` (line 47)

**Current:**
```javascript
    console.error("[ROUTE /api/contact]", err);
```

**Replace with:**
```javascript
    console.error("[ROUTE POST /api/contact]", err);
```

Add the HTTP method to match the convention used everywhere else (`[ROUTE METHOD /path]`).

### Known Minor Deviation (Do Not Fix)
The `.select()` patterns in `GET /api/artists` and `GET /api/artists/[id]` use an exclude-list (`"-pressKit -managedBy -ownerId -__v"`) rather than an include-list/true whitelist. This is functionally correct (works today) but less "secure-by-default" (any new sensitive field added to the `Artist` schema later would be exposed by default). This is a known acceptable deviation per the spec's mention of "secure by default" — it's not a bug, just a style difference. Do not change it.

---

## Section 4: Jest Test Scaffolding

### Setup

Install dev dependencies:
```bash
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom
```

### Create `jest.config.js`

At the project root:
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
}

module.exports = createJestConfig(customJestConfig)
```

### Create `jest.setup.js`

At the project root:
```javascript
import '@testing-library/jest-dom'
```

### Update `package.json`

Add this script to the `"scripts"` object:
```json
"test": "jest"
```

### Create Three Example Tests

#### Test 1: `src/constants/roles.test.js` — Pure function test (no mocks needed)

```javascript
import { ROLES, ROLE_HIERARCHY, hasRole } from '@/constants/roles'

describe('Roles', () => {
  it('ROLES object contains expected keys', () => {
    expect(ROLES.USER).toBe('user')
    expect(ROLES.ARTIST).toBe('artist')
    expect(ROLES.MANAGER).toBe('manager')
    expect(ROLES.ADMIN).toBe('admin')
  })

  it('ROLE_HIERARCHY defines correct numeric levels', () => {
    expect(ROLE_HIERARCHY.user).toBe(0)
    expect(ROLE_HIERARCHY.artist).toBe(1)
    expect(ROLE_HIERARCHY.manager).toBe(2)
    expect(ROLE_HIERARCHY.admin).toBe(3)
  })

  it('hasRole() returns true when user role meets or exceeds required role', () => {
    expect(hasRole('admin', 'user')).toBe(true)
    expect(hasRole('manager', 'artist')).toBe(true)
    expect(hasRole('artist', 'artist')).toBe(true)
    expect(hasRole('artist', 'manager')).toBe(false)
    expect(hasRole('user', 'admin')).toBe(false)
  })

  it('hasRole() handles undefined roles gracefully', () => {
    expect(hasRole(undefined, 'user')).toBe(false)
    expect(hasRole('admin', undefined)).toBe(true)
  })
})
```

#### Test 2: `__tests__/api/contact.test.js` — API route test with mocks

Create the `__tests__/api/` directory first.

```javascript
import { POST } from '@/app/api/contact/route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/email/resend', () => ({
  sendContactEmail: jest.fn(() => Promise.resolve({ id: 'mock-email-id' })),
}))

jest.mock('@/lib/rateLimit', () => ({
  checkRateLimit: jest.fn(() => ({ allowed: true, retryAfter: null })),
}))

describe('POST /api/contact', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 400 if name is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', message: 'Hello' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('name is required')
  })

  it('returns 400 if email is invalid', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({ name: 'John', email: 'invalid-email', message: 'Hello' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('valid email is required')
  })

  it('returns 400 if message is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({ name: 'John', email: 'john@example.com' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('message is required')
  })

  it('returns 400 if message exceeds max length', async () => {
    const tooLongMessage = 'a'.repeat(2001)
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John',
        email: 'john@example.com',
        message: tooLongMessage,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('2000 characters or fewer')
  })

  it('returns 200 if all fields are valid', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'This is a test message',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
})
```

#### Test 3: `src/components/ui/ArrowLink.test.js` — Component test

```javascript
import { render, screen } from '@testing-library/react'
import { ArrowLink } from '@/components/ui/ArrowLink'

describe('ArrowLink', () => {
  it('renders a link with the correct text and direction', () => {
    render(<ArrowLink href="/test">Explore</ArrowLink>)
    expect(screen.getByRole('link', { name: /explore/i })).toBeInTheDocument()
  })

  it('applies the correct color class', () => {
    const { container } = render(
      <ArrowLink href="/test" color="yellow">
        Contact
      </ArrowLink>
    )
    const link = container.querySelector('a')
    expect(link).toHaveClass('text-accent-2')
  })

  it('renders as a span when as prop is "span"', () => {
    const { container } = render(
      <ArrowLink href="/test" as="span">
        Contact
      </ArrowLink>
    )
    expect(container.querySelector('span')).toBeInTheDocument()
    expect(container.querySelector('a')).not.toBeInTheDocument()
  })

  it('includes the direction suffix in the text', () => {
    render(<ArrowLink href="/test">Explore</ArrowLink>)
    expect(screen.getByText(/explore ↗/i)).toBeInTheDocument()
  })

  it('renders custom direction suffix', () => {
    render(
      <ArrowLink href="/test" direction="↓">
        Scroll
      </ArrowLink>
    )
    expect(screen.getByText(/scroll ↓/i)).toBeInTheDocument()
  })

  it('applies custom className prop', () => {
    const { container } = render(
      <ArrowLink href="/test" className="custom-class">
        Link
      </ArrowLink>
    )
    const link = container.querySelector('a')
    expect(link).toHaveClass('custom-class')
  })
})
```

---

## Verification

After completing all four sections, run:

```bash
npm run build
npm run lint
npm test
```

All should pass with no errors.

### What to Expect

- **Build:** Completes without errors; all imports resolve correctly.
- **Lint:** ESLint passes (no new violations introduced by the refactors).
- **Tests:** All three example tests pass; Jest runs without errors.
- **HeroSection:** Left column displays breadcrumb → animated wave → tagline+V#001 → wordmark+scroll-button (on desktop in a browser, run `npm run dev` and navigate to `/` to visually verify).
- **Media upload:** `/api/media/upload` now accepts `image/gif` MIME type; uploading a GIF file works without "Unsupported file type" error.
- **Media admin:** Admin panel media browser displays image thumbnails (GIFs render as plain `<img>`, others via `next/image`).
- **API routes:** All four error-handling fixes in place; malformed JSON to `/api/bookings/[id]` and `/api/users/[id]/role` now logged and caught by the generic 500 handler; `/api/contact` error logs include the method name.

---

## Notes

- The three example tests are minimal proof-of-concept — expand them with more branches/edge cases as the project grows.
- Test structure follows the spec's guidance: API tests mock external dependencies (email, rate-limiting); component tests assert structure/behavior, not implementation details.
- If you hit a "Cannot find module" error, confirm the `@/` alias in `jsconfig.json` points to `./src/*` (it does by default).
