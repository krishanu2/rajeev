# Rajeev HB — Coaching Portfolio Site

Single-page, scroll-driven portfolio + booking site for Rajeev HB (fitness &
wellness coach). Built with React, TypeScript, Vite, Tailwind CSS v4, Framer
Motion, and React Three Fiber (Three.js) for the animated 3D hero.

## Running it

```bash
npm install
npm run dev       # local dev server with HMR
npm run build     # type-check + production build to dist/
npm run preview   # preview the production build locally
```

## Structure

- `src/data/content.ts` — **all site copy lives here.** Names, stats, testimonials,
  program details, links, the symptom-selector responses, and About/timeline
  copy. Edit this file to change what the site says without touching any component.
- `src/components/` — one file per section, in page order: `Hero`,
  `SymptomSelector` (the "which one sounds like you?" interactive gut-check),
  `About` (Rajeev's bio, photo, credibility timeline), `Story` (philosophy +
  the "default system vs. working with me" contrast block), `Results`,
  `Testimonials`, `Programs`, `FunWithFitness`, `CTA`, `Footer`. Shared bits:
  `Nav`, `Reveal` (scroll-in wrapper), `CursorGlow`, `ScrollProgress` (top
  progress bar), `Magnetic` (cursor-attraction wrapper for buttons), `TiltCard`
  (mouse-tilt wrapper for the About portrait), `StatCounter` (count-up numbers).
- `src/components/three/HeroScene.tsx` — the 3D hero (distorted core shape,
  orbit rings, floating satellites, particles, cursor-based camera parallax).
  Lazy-loaded and automatically toned down (`reducedMotion`) on touch devices
  and when the OS "reduce motion" setting is on, for performance and
  accessibility.

## Why these sections exist (design rationale)

- **Symptom Selector** (right after the hero) — the single highest-impact
  addition. Instead of asking a visitor to read four sections before knowing
  "is this for me," it gives a personalized answer in one click. This is the
  fix for "generic at first glance": value is delivered before any scrolling
  commitment is asked of the visitor.
- **About** — an explicit, currently-missing trust/authority section. Photo
  placeholder + timeline turn "8 years, 1000+ clients" from a hero stat into
  a believable story, which is what actually earns credibility for premium
  pricing (per the PRD's "walked the path himself" positioning).
- **Contrast block in Philosophy** ("default system vs. working with me") —
  makes the differentiation concrete and scannable instead of only asserted
  in prose, using a standard high-conversion persuasion pattern (contrast).
- **Count-up stats, magnetic buttons, tilt portrait, scroll progress bar** —
  small kinetic details that separate a site from a static template without
  adding new sections. Cheap to build, disproportionately affects "does this
  feel premium" perception.

## Before this goes live — real content still needed

Everything below is a clearly-marked placeholder in `content.ts` or the code,
written in Rajeev's voice as a stand-in so the page reads naturally. It needs
to be swapped for the real thing:

- **Calendly link** (`site.calendlyUrl`) — currently a fake URL. Replace with
  Rajeev's real scheduling link (Calendly or otherwise) and the booking widget
  in the final section will work immediately, no code changes needed.
- **Client transformations & testimonials** — names, photos, and quotes in
  the Results and Testimonials sections are placeholders (`[[Client Name]]`).
  Swap for real clients with their written consent before launch.
- **Rajeev's portrait photo** — the About section (`src/components/About.tsx`)
  currently shows a styled placeholder ("Rajeev's photo goes here"). Drop the
  real photo in as `src/assets/rajeev-portrait.jpg` and swap the placeholder
  `<div>` for an `<img>` — everything else (the tilt effect, floating ring,
  credibility badge) is already built around a 4:5 portrait aspect ratio.
- **Contact details** — email, phone, Instagram handle, podcast link, and
  Fun with Fitness link in `site` at the top of `content.ts`.
- **Brand assets** — no formal logo/colour/font files were supplied, so this
  design establishes a palette (ink/cream/ember/moss) and type system
  (Fraunces + Inter) from scratch. Confirm with Rajeev before treating it as final.
- **Open Graph cover image** — `index.html` has a commented-out `og:image`
  tag pointing at `/og-cover.jpg`. Add a 1200×630 image and uncomment once
  real photography exists, so Instagram bio link shares look right.

## Design notes

- Dark, warm palette (near-black base, ember/terracotta accent, moss green
  for the Fun with Fitness proof-point) — deliberately distinct from generic
  bright fitness-influencer pages, and from Fun with Fitness's own brighter
  visual language, per the brand architecture call in the PRD.
- The "3D" requirement is delivered as a lightweight animated hero scene plus
  scroll-linked parallax throughout, rather than a fully-3D site — this is
  what was scoped as the practical interpretation of "three-dimensional"
  for a conversion-focused single page.
