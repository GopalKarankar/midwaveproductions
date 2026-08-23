# Task: Add Midwave hero section to the existing project

Add the following 5 files to this repo exactly as shown, at the exact paths given.
Do not modify their contents — only adjust import paths if the `@/*` alias in
`jsconfig.json` points somewhere other than `./src/*`.

After creating the files, wire `<HeroSplit />` into `src/app/page.js` as the
first element in the page (replace any existing placeholder/default content
from `create-next-app`).

Then run `npm run build` and fix any errors that surface (missing deps,
import path mismatches, etc.) before considering this done. Note: this repo
uses Tailwind v4 — the CSS-first `@theme` block in `globals.css` replaces the
old `tailwind.config.js` approach entirely, do not create a `tailwind.config.js`.

Also confirm `framer-motion` is installed (`npm install framer-motion` if not).

---

## File 1 — `src/app/globals.css` (REPLACE existing file entirely)

```css
@import "tailwindcss";

@theme inline {
  /* ── Brand (extracted from Midwave logo) ── */
  --color-brand-blue: #3AAFE0;
  --color-brand-yellow: #F5E642;
  --color-brand-black: #1A1A1A;

  /* ── Surfaces ── */
  --color-bg: #0D0D0D;
  --color-surface: #141414;
  --color-surface-2: #1E1E1E;
  --color-border: #2A2A2A;

  /* ── Text ── */
  --color-text: #F2F2F2;
  --color-muted: #6A6A6A;
  --color-highlight: #FFFFFF;

  /* ── Interactive ── */
  --color-accent: #3AAFE0;
  --color-accent-hover: #62C4E8;
  --color-accent-2: #F5E642;
  --color-accent-2-hover: #FFF176;

  /* ── States ── */
  --color-error: #E05A3A;
  --color-success: #3AE09B;

  /* ── Typography — loaded via next/font/google in layout.js, exposed as CSS vars ── */
  --font-display: var(--font-bebas-neue), Impact, sans-serif;
  --font-body: var(--font-dm-sans), system-ui, sans-serif;
  --font-mono: var(--font-space-mono), monospace;

  /* ── Motion ── */
  --animate-marquee-left: marquee-left 28s linear infinite;
  --animate-marquee-right: marquee-right 28s linear infinite;
  --animate-bounce-down: bounce-down 1.5s ease-in-out infinite;

  @keyframes marquee-left {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes marquee-right {
    0% { transform: translateX(-50%); }
    100% { transform: translateX(0); }
  }
  @keyframes bounce-down {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(8px); }
  }
}

/* ── Base ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; }

html { scroll-behavior: smooth; }

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.scrollbar-none { scrollbar-width: none; }
.scrollbar-none::-webkit-scrollbar { display: none; }

::selection {
  background-color: var(--color-brand-blue);
  color: var(--color-bg);
}

:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## File 2 — `src/hooks/useReducedMotion.js` (NEW file)

```javascript
'use client'
import { useEffect, useState } from 'react'

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(query.matches)

    function handleChange(e) {
      setReduced(e.matches)
    }
    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  return reduced
}
```

---

## File 3 — `src/lib/motion/variants.js` (NEW file)

```javascript
// Reusable scroll reveal variants — import in any section component
export const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

export const slideInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
}
```

---

## File 4 — `src/components/ui/ArrowLink.js` (NEW file)

```javascript
// components/ui/ArrowLink.js
// Text-only link with ↗ or ↓ suffix — no button chrome
export function ArrowLink({ href, children, direction = '↗', className = '' }) {
  return (
    <a
      href={href}
      className={`font-mono text-xs text-accent hover:text-accent-hover tracking-widest uppercase transition-colors duration-200 ${className}`}
    >
      {children} {direction}
    </a>
  )
}
```

---

## File 5 — `src/components/hero/HeroSplit.js` (NEW file)

```javascript
// src/components/hero/HeroSplit.js
// Implements CLAUDE.md "Homepage — N°1 HERO" and "N°2 SITE-MAP GRID" specs
'use client'

import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { fadeInUp, staggerContainer, slideInLeft } from '@/lib/motion/variants'
import { ArrowLink } from '@/components/ui/ArrowLink'

const SITEMAP = [
  { labelA: 'ARTISTS', labelB: 'ROSTER', n: '1', heading: 'ARTIST ROSTER', sub: 'SHOWCASE & ARCHIVE', href: '/artists', linkLabel: 'explore', linkColor: 'accent' },
  { labelA: 'MANAGEMENT', labelB: 'PROMOTION', n: '2', heading: 'SERVICES', sub: 'MANAGEMENT & PROMOTION', href: '/services', linkLabel: 'explore', linkColor: 'accent' },
  { labelA: 'MEDIA', labelB: 'PRESS', n: '3', heading: 'MEDIA & PRESS', sub: 'SHOWCASE & ARCHIVE', href: '/media', linkLabel: 'explore', linkColor: 'accent' },
  { labelA: 'EVENTS', labelB: 'BOOKINGS', n: '4', heading: 'EVENTS & BOOKINGS', sub: 'INQUIRIES & SCHEDULING', href: '/booking', linkLabel: 'contact', linkColor: 'accent-2' },
  { labelA: 'STRUCTURE', labelB: 'COST', n: '5', heading: 'WORK STRUCTURE & COSTS', sub: 'HIRE US', href: '/pricing', linkLabel: 'contact', linkColor: 'accent-2' },
]

export function HeroSplit() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="relative w-full h-svh bg-bg grid grid-cols-1 md:grid-cols-2 gap-8 px-6 md:px-12 py-8 overflow-hidden">

      <motion.div
        className="flex flex-col justify-between"
        variants={reduceMotion ? undefined : staggerContainer}
        initial={reduceMotion ? undefined : 'hidden'}
        animate={reduceMotion ? undefined : 'visible'}
      >
        <motion.div
          variants={reduceMotion ? undefined : fadeInUp}
          className="font-mono text-xs tracking-widest text-muted"
        >
          MIDWAVE <span className="text-accent">— Home</span>
        </motion.div>

        <motion.div
          variants={reduceMotion ? undefined : fadeInUp}
          className="relative flex items-center justify-center h-40"
        >
          <div className="absolute w-64 h-32 border border-border rounded-full" />
          <div className="absolute w-56 h-36 border border-border rounded-full -rotate-6" />
          <motion.svg
            width="28" height="18" viewBox="0 0 28 18"
            initial={reduceMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 1.2, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }
            }
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
          <a
            href="#showreel"
            className="absolute right-0 font-mono text-xs text-highlight text-right leading-tight
              hover:text-accent transition-colors duration-200"
          >
            Watch<br />Showreel<br /><span className="text-accent">↗</span>
          </a>
        </motion.div>

        <motion.div variants={reduceMotion ? undefined : fadeInUp}>
          <p className="font-body font-bold text-text text-sm max-w-xs mb-4">
            Artist run — management, promotion, bookings and media production.
          </p>
          <div className="font-display text-2xl text-highlight tracking-widest">
            V#00<span className="text-accent">1</span>
          </div>
        </motion.div>

        <motion.div variants={reduceMotion ? undefined : fadeInUp}>
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

      <div className="flex flex-col">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-start justify-between mb-2"
        >
          <h1 className="font-display text-3xl md:text-4xl text-highlight tracking-widest uppercase">
            SITE-MAP <span className="text-accent">↓</span>
          </h1>
          <div className="font-mono text-xs text-muted text-right leading-tight">
            Work<br />Artist Roster
          </div>
        </motion.div>

        <motion.div
          className="flex-1 flex flex-col justify-evenly"
          variants={reduceMotion ? undefined : staggerContainer}
          initial={reduceMotion ? undefined : 'hidden'}
          animate={reduceMotion ? undefined : 'visible'}
        >
          {SITEMAP.map((item) => (
            <motion.a
              key={item.n}
              href={item.href}
              variants={reduceMotion ? undefined : slideInLeft}
              className="group block"
            >
              <div className="flex justify-between font-mono text-[10px] tracking-widest text-muted mb-1 uppercase">
                <span>{item.labelA}</span>
                <span>{item.labelB}</span>
                <span>
                  N°<span className="text-accent-2">{item.n}</span>
                </span>
              </div>
              <div
                className="border-t border-border flex items-center justify-between py-2.5
                  group-hover:border-accent transition-colors duration-200"
              >
                <div>
                  <span
                    className="font-display text-2xl text-highlight tracking-widest uppercase
                      group-hover:text-accent transition-colors duration-200"
                  >
                    {item.heading}
                  </span>
                  <p className="font-mono text-[10px] text-muted tracking-widest uppercase mt-0.5">
                    {item.sub}
                  </p>
                </div>
                <ArrowLink
                  href={item.href}
                  direction="↗"
                  className={item.linkColor === 'accent-2' ? 'text-accent-2 hover:text-accent-2-hover' : ''}
                >
                  {item.linkLabel}
                </ArrowLink>
              </div>
            </motion.a>
          ))}
          <div className="border-t border-border" />
        </motion.div>
      </div>

      <div
        className="hidden md:block absolute right-2 top-1/2 -translate-y-1/2 rotate-90
          font-mono text-[10px] tracking-[0.2em] text-muted uppercase"
      >
        SCROLL <span className="text-accent">↓</span>
      </div>
    </section>
  )
}
```

---

## Also required — check `src/app/layout.js`

If Bebas Neue, DM Sans, and Space Mono are not already loaded via `next/font/google`,
add them and expose as CSS variables (`--font-bebas-neue`, `--font-dm-sans`,
`--font-space-mono`) matching the names referenced in `globals.css` above:

```javascript
import { Bebas_Neue, DM_Sans, Space_Mono } from 'next/font/google'

const bebasNeue = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-bebas-neue' })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' })
const spaceMono = Space_Mono({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-space-mono' })

// apply all three variable classNames to the <html> or <body> tag
```
