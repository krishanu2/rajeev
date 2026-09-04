# FWR Site — Design & Architecture Spec (for rebuilding with a different brand)

This document describes the *structure, flow, motion and interaction system* of this
site, deliberately separated from FWR's specific content and colors. Hand this file to
a fresh Claude Code session along with a new client's brand (name, palette, fonts,
copy, photos) and the instruction: **"Build this exact design and flow, with this new
brand."** Colors/fonts/copy should change; the skeleton below should not.

Stack: Vite + React 19 + TypeScript + Tailwind CSS v4 (CSS-first `@theme`) + Framer
Motion + React Three Fiber/drei (optional, only if the new brand wants a 3D hero
element) + Vercel serverless functions (`/api`) + Postgres (Neon) if the client needs
booking/CRM/FAQ/gallery backend features. Not every client needs the backend half —
treat Part A (site) and Part B (backend) as separable.

---

## PART A — THE SITE ITSELF

### A1. Overall narrative shape — "5 emotional beats"

The page is not a flat list of sections. It's wrapped in five *tonal zones*, each with
its own background treatment (gradient direction, grain, a subtle colored wash) so the
page feels like it moves through emotional register as you scroll, not just topic:

1. **Confrontation** — Hero. Cold open, states the problem starkly.
2. **Recognition** — an interactive "which one of these is you?" moment right after
   the hero. Low commitment, high personalization payoff.
3. **Human** — About/bio + a scroll-driven manifesto moment + philosophy/story. Warmest
   tone, most narrative.
4. **Evidence** — Results/case studies + a photo gallery + testimonials. Cold, factual,
   grid-like.
5. **Invitation** — Programs, community, FAQ, and the final booking CTA. Calm, spacious,
   low-pressure pacing (slower reveal durations here specifically).

Implementation: a `Beat` wrapper component takes a `tone` prop and renders a
`pointer-events-none absolute inset-0` overlay div with a radial/linear gradient +
optional grain texture unique to that tone, then renders children in a `relative` div
on top. Sections don't know which beat they're in — App.tsx nests them:

```
<Beat tone="confrontation"><Hero /></Beat>
<Beat tone="recognition"><SymptomSelector /></Beat>
<Beat tone="human"><About /><Manifesto /><Story /></Beat>
<Beat tone="evidence"><Results /><Gallery /><Testimonials /></Beat>
<Beat tone="invitation"><Programs /><Community /><FAQ /><CTA /></Beat>
```

For the new brand: keep this 5-beat emotional arc, but the actual overlay colors come
from the new palette (e.g. tone "human" used a warm brown wash here — for a different
brand's palette, pick whatever "warm/narrative" means in their colors).

### A2. Section-by-section inventory

Build these in this order. Each one's *job* is described — reuse the job, replace the
content.

1. **Nav** (fixed, `z-50`) — logo left, links center (desktop only, hidden `lg:flex`),
   numbered index prefix on each link (`01`, `02`…) in a monospace font at low opacity,
   animated underline on hover (`scale-x-0` → `scale-x-100`), one CTA pill button
   right. Background is transparent until `scrollY > 24`, then crossfades to a
   blurred dark bar. Mobile: hamburger opens a full-height dropdown with a dimming
   `backdrop-blur` scrim behind it (critical — without the scrim, content behind the
   open menu bleeds through and looks broken).

2. **Hero** — Full-height (`h-[125svh] sm:h-[145svh]` wrapping a `sticky top-0
   h-[100svh]` inner section — the extra height is *scroll runway* so the content can
   fade/slide out via scroll-linked `useScroll`+`useTransform` before the next section
   arrives, without both scrolling away at identical speed). Contains:
   - An eyebrow line, a two-line staggered headline (line 2 waits for line 1 to fully
     resolve, `delayChildren` roughly 1.2–1.4s after line 1 starts — payoff must
     land *after* the setup, not simultaneously), sub-paragraph, two CTAs (primary
     pill + secondary ghost/outline), and an optional stat row (hide below
     `min-height:680px` via a media-query utility rather than deleting it — short
     viewports lose it gracefully).
   - Background: EITHER a real photo of the person/founder (natural colors, NOT
     heavily filtered — a duotone/sepia filter reads as "cheap," and an ML
     background-cutout of a person floating on a solid backdrop reads as a sticker;
     the version that actually looks premium is the ORIGINAL photo in its own real
     environment, with gradient falloff blended into the page background on every
     edge) OR an abstract Three.js scene (see A6) — pick one, don't combine a real
     person with floating 3D shapes, it looks accidental.
   - A bouncing scroll-cue arrow, animated `y: [0,8,0]` infinite.

3. **SymptomSelector** ("recognition" beat) — a bank of clickable chips, each
   representing a segment of visitor ("which of these sounds like you"). On click:
   store selection in a React Context, dim/spotlight the other chips, reveal a
   short personalized response line beneath. This selection then quietly threads
   through to later sections (highlight the matching case study, personalize the
   final CTA heading) — this callback is one of the highest-leverage personalization
   tricks in the whole site for near-zero engineering cost.

4. **About** — real photo (object-cover, check crop direction against actual photo
   orientation — portrait photos cropped `object-top` can cut off the chin if the
   subject isn't centered high in frame; use `object-center` unless verified
   otherwise) + short bio paragraphs + a quick-facts row (experience/clients/location/
   focus, 4 stat chips) + optional timeline.

5. **Manifesto** — a scroll-scrubbed sequence of short standalone lines, each taking
   over the full viewport as the user scrolls through it one at a time (tall wrapper,
   `useScroll` mapped to opacity/position per line). Keep this SHORT — 3–5 lines,
   `h-[220svh] sm:h-[280svh]` wrapper max. This section is a deliberate tonal break
   from everything else — it should look and feel unlike the rest of the page. Making
   it too tall is the single most common way this pattern goes wrong (renders as dead
   blank space in any full-page screenshot/skim).

6. **Story/Philosophy** — narrative paragraphs (2, not 3 — trim aggressively, this is
   the section most likely to be too text-heavy) + a real photo alongside them with a
   small caption strip + a translated quote block (if multilingual founder) + a
   "default approach vs. working with us" two-column comparison with DELIBERATELY
   asymmetric visual weight — left column (the status quo) dense/dark/cramped, right
   column (this brand's approach) spacious/glowing/lighter. The visual contrast argues
   the point before the copy does.

7. **Results/case studies** — a full-bleed horizontal drag carousel (`motion.div
   drag="x"` with computed `dragConstraints` from `scrollWidth - containerWidth`,
   `dragElastic ~0.08`, momentum via `dragTransition={{power:0.25,timeConstant:220}}`)
   breaking out of the normal container grid. Each card: real before/after photos
   side-by-side (CSS-cropped, not two separate uploads merged in Photoshop — simplest
   to just place two `<img>` in a flex row at 50/50 width), a small circular avatar
   crop (zoomed background-image trick: `backgroundSize: "300–350%"` on a small div
   lets you pull a headshot out of a full-body photo without a separate crop), an
   animated counting stat (`useCountUp` hook — measure once on scroll-into-view via
   `IntersectionObserver`, animate 0→value over ~1.2s), and a name/tag/result line.
   Highlight the card matching the visitor's earlier SymptomSelector pick with a
   badge + scale/border animation.

8. **Gallery** — if the client wants a general photo wall beyond structured
   case-studies: an auto-scrolling CSS marquee (`@keyframes marquee { to {
   transform: translateX(-50%) } }`, applied to a flex row containing the item list
   duplicated twice, `animation: marquee Ns linear infinite`, pause on
   hover via `hover:[animation-play-state:paused]`), glassmorphism cards
   (`backdrop-blur-md` + translucent background), edge fade masks (`absolute
   inset-y-0 left-0 w-28 bg-gradient-to-r from-<bg> to-transparent`, mirrored on the
   right) so cards dissolve at the viewport edge instead of hard-cutting. Feed this
   from a database table so the client can add/remove photos without a code deploy
   (see Part B).

9. **Testimonials** — auto-rotating quote carousel (interval ~6s, pause on
   hover/mouseenter), one quote at a time with `AnimatePresence mode="wait"` for
   crossfade, a circular avatar (real photo if available, generic icon fallback),
   name + one-line detail, and small pill/dot pagination indicators below.

10. **Programs/Offerings** — 3 tiers, but NOT presented as 3 equal choices (three
    identical-weight options measurably flattens decision-making). First one is
    visually larger/featured with a "start here" badge; the other two are compact
    side cards. Each: title, one-line description, 2–3 checkmark bullets, and (on the
    featured one only) a CTA button.

11. **Community/secondary offering** (optional) — if the client has a second thing
    beyond the core offer (a community, a podcast, a sister brand): one card-style
    section, photo + copy + bullet chips + an outbound link (Instagram etc.) — only
    include the link if you have the REAL url; a link to `#` that goes nowhere reads
    as broken to visitors and is worse than no link at all.

12. **FAQ** — accordion, one open at a time, `+` icon rotating 45° into an `×` on
    open, `AnimatePresence` height animation for the answer reveal. Feed from a
    database so the client can self-manage without a deploy (Part B). Section should
    hide itself entirely if the FAQ list is empty rather than rendering an empty
    shell.

13. **CTA/Booking** — calm pacing (longer `duration` on Reveal here specifically, e.g.
    0.9 vs 0.65 elsewhere — signal "no pressure" through motion, not just copy). A
    single prominent action (in this build: a "Book the call" button revealing a
    calendar; could as easily be a contact form, a WhatsApp link, etc. depending on
    client). If offering something at a discount/free, show the original price
    struck through directly ON the button next to "FREE" — don't bury the discount
    in body copy.

14. **Footer** — logo, one-line disclaimer/note, an "Explore" link column mirroring
    nav links, a "Connect" column with REAL outbound links only (email always;
    social/phone only if confirmed — a fabricated placeholder phone number rendered
    as a clickable `tel:` link is a genuine production bug, not a cosmetic one, since
    a visitor could actually tap "call" and reach nobody or the wrong person).

### A3. Micro-interaction system (apply everywhere, not just in one component)

- **Every clickable element needs visible press feedback.** `active:scale-95` to
  `active:scale-[0.97]` on buttons/cards/day-cells/etc. Missing this was a real,
  confirmed bug pattern in earlier builds — it makes the whole site feel unresponsive
  on mobile/touch even though clicks technically register.
- **Magnetic buttons**: primary CTA(s) can subtly follow the cursor on hover
  (`Magnetic` component pattern above) for a tactile, premium feel. Don't overdo — 1-2
  buttons on the whole site, not every button.
- **Cursor glow** (desktop only, `pointer: coarse` media query check to skip on
  touch): a large soft radial-gradient blob that trails the cursor with lerp-based
  smoothing (`current += (target - current) * 0.12` per animation frame), low opacity,
  `mix-blend-screen`, `pointer-events-none`.
- **Scroll progress bar**: fixed top, `scaleX` driven by `useScroll` + `useSpring`,
  origin-left, thin (`h-[3px]`), gradient in brand colors.
- **Reveal-on-scroll**: a single reusable `Reveal` wrapper (fade + slight y-offset,
  `whileInView` with `viewport={{once:true, margin:"-80px"}}` so it fires slightly
  before full visibility) used everywhere instead of ad-hoc animation on every
  section — consistency matters more than variety here.
- **Intro overlay**: on first visit only (`sessionStorage` flag), a ~1.5s branded
  loading moment (logo fade-in, a thin animated line draw, a tagline fade-in with
  staggered delays) before the real page appears. Skip entirely if
  `prefers-reduced-motion`.
- Respect `prefers-reduced-motion` throughout — provide a hook (`useReducedMotion`)
  and gate: intro overlay, any 3D scene's continuous animation loop
  (`frameloop="demand"` instead of `"always"`), and floating/orbiting decorative
  elements. Never gate away opacity-only content reveals — only motion/parallax.

### A4. Layout & responsive rules

- Mobile is the primary target, not an afterthought — the actual client base here
  browses and books almost entirely on phones. Every new component: build/check
  mobile FIRST, then confirm desktop still works, not the reverse.
- Sticky/pinned scroll sections (hero, any scroll-jacked section) are the single
  highest-risk pattern for content clipping on short viewports (laptops with small
  vertical resolution, e.g. 1440×650). Test at that size explicitly. Fix pattern:
  reduce `pt-*`/`gap-*`/font-size via `clamp()`, and hide truly non-essential
  elements (stat rows etc.) below a `min-height` media query rather than always
  shrinking text until unreadable.
- Container pattern: `container-px mx-auto max-w-7xl` (or `max-w-6xl`/`max-w-3xl` for
  narrower sections) as the standard content wrapper; full-bleed sections (drag
  carousel, marquee) deliberately break out of this by using `w-full`/negative
  margins and computing their own left inset via
  `pl-[max(1.25rem,calc((100vw-80rem)/2+1.5rem))]`.

### A5. Typography & color system (swap per client, keep the MECHANISM)

- Tailwind v4 CSS-first `@theme` block in `index.css`. Define semantic color names
  (`--color-ink`, `--color-ink-soft`, `--color-cream`, `--color-cream-dim`, an accent
  family like `--color-<brand>`/`--color-<brand>-dark`/`--color-<brand>-light`, plus
  one seasoning accent color used sparingly for tiny details — quote marks, dots,
  dividers — never competing with the primary accent). This auto-generates
  `bg-*`/`text-*`/`border-*` utilities for every name — retinting the CSS variable
  retints the whole site instantly. Pick names that describe ROLE not the literal
  hex (e.g. `ember` not `gold-f0b429`) so a rebrand later is a values-only edit.
- ⚠️ Gotcha: retinting the theme variables does NOT touch hardcoded hex strings
  inside Three.js material props, inline SVG fills, or `rgba()` strings written
  directly in component code — grep for raw `#[0-9a-f]{6}` across `.tsx` files after
  any palette change and update those by hand.
- Fonts: one display/heading serif-or-grotesk with personality, one clean sans for
  body/UI, one monospace for "data" elements (stat numbers, nav index digits, small
  uppercase labels) — the monospace choice specifically sells a "precise/credible"
  feeling for numbers. Load via a font CDN in `index.html`, reference via
  `--font-display`/`--font-sans`/`--font-mono` theme vars.
- Base palette structure here: near-black background, off-white/cream text, single
  warm accent (this client: gold) for CTAs/highlights/links, plus one desaturated
  "seasoning" accent (this client: pink) for tiny details only. A different client
  might invert to light-mode entirely — the STRUCTURE (one dominant neutral, one
  strong accent, one seasoning accent) transfers; which colors fill those roles does
  not.

### A6. Optional: 3D hero element

If the new brand wants an abstract 3D hero (rather than a photo): React Three
Fiber + drei. Pattern used here: an `icosahedronGeometry` core shape with
`MeshDistortMaterial` (organic wobble), 2-3 small satellite `Icosahedron`s floating
around it (`Float` wrapper from drei for idle bob), 2 tilted `Torus` "orbit rings"
rotating at different slow speeds/opposite directions, a sparse `Sparkles` field,
and a `PointerRig` that subtly lerps the camera toward the cursor position for a
parallax feel. Three-point lighting (warm key light, dim neutral fill, cool rim
light from behind) sells the "lit 3D volume" read. Lazy-load this component
(`lazy()`+`Suspense`) since the three.js bundle is large (~900KB) — never worth
including if the hero ends up being a photo instead.

---

## PART B — OPTIONAL BACKEND (booking / CRM / self-service content)

Skip this whole part if the new client's site is purely informational. Include it
if they need appointment booking, a lightweight CRM, or client-editable content
(FAQ, gallery) without code deploys.

### B1. Stack

Vercel serverless functions under `/api`, one Postgres database (Neon works well,
free tier is enough for this scale). If `package.json` has `"type": "module"`,
EVERY `.js` file under `/api` must use ESM `import`/`export default` — mixing in a
CommonJS `require()` file crashes with `FUNCTION_INVOCATION_FAILED` on that
endpoint specifically. This is the single most common setup mistake — check it
before anything else if API routes return unexplained 500s.

⚠️ Vercel's Hobby plan caps a deployment at **12 serverless functions total**.
Splitting every admin action into its own file (`/api/admin/day.js`,
`/api/admin/clients.js`, `/api/admin/faqs.js`, `/api/admin/gallery.js`...) will
silently blow past this the moment you add a 4th or 5th admin feature, and the
deploy fails outright. Fix: consolidate all admin operations into ONE function
(`/api/admin.js`) dispatched by an `?op=` query param, with a `vercel.json` rewrite
mapping the pretty URLs the frontend already calls (`/api/admin/<op>` →
`/api/admin?op=<op>`) onto it. Design for this from the start rather than
refactoring under pressure later.

### B2. Booking system essentials

- **No-double-booking guarantee**: a `slot_events` table with
  `primary key (slot_date, slot_time)`. Booking does
  `INSERT ... ON CONFLICT (slot_date, slot_time) DO NOTHING` and checks
  `rowCount === 0` to detect a lost race → return 409. This is the entire
  mechanism — no locks, no queues needed. Test it for real: fire two booking
  requests at the identical slot near-simultaneously and confirm exactly one
  succeeds.
- **Timezone correctness**: if the business operates in a single timezone (as
  most local-service businesses do), treat all slot times as that timezone's
  wall-clock explicitly (`new Date(`${date}T${time}:00+05:30`)` style, fixed
  offset, not relying on server-local time — cloud functions run in UTC). Every
  place a slot time gets compared, formatted, or sent to a calendar API needs
  this same explicit-offset treatment, or you get systematic off-by-N-hours
  bugs in the calendar invite, the "is this slot in the past" check, and any
  "next 7 days" stat query simultaneously. Grep for every `new Date(` call
  touching a slot_date/slot_time when auditing this.
- Let the business owner control which hours are actually bookable, rather than
  hardcoding business hours into the schema — offer the full realistic range
  (e.g. all 48 half-hour slots in a day) and give them block/unblock tools
  (single-slot, whole-day, AND a time-range picker for "block everything before
  9am" in one action) in their own admin. Don't assume you know their hours.

### B3. Calendar/Meet/email integration (Calendly-equivalent, no paid SDK needed)

- OAuth2 Authorization Code flow directly against Google's REST endpoints (no
  `googleapis` npm package needed — plain `fetch` calls, less dependency weight).
  Store the refresh token in a one-row-per-provider table; refresh the access
  token on-demand per request.
- `POST` to `calendar/v3/calendars/primary/events?conferenceDataVersion=1&
  sendUpdates=all` with a `conferenceData.createRequest` block auto-generates a
  real Meet link AND makes Google itself email calendar invites to every
  attendee — this is the entire "Calendly-style" mechanism, no separate email
  service required for the happy path.
- ⚠️ Google never emails the organizer about their own event — only guests. If
  the business owner IS the organizer (the usual setup), they will NOT get an
  email notification for their own bookings by default — their event just
  silently appears on their calendar. If the client expects a Calendly-style "you
  got a new booking" email, you must send it yourself explicitly (Gmail API
  `messages.send` with a `gmail.send` OAuth scope, composing a plain MIME email
  from their own account) — don't assume the calendar invite covers this.
- Match the specifics of whatever booking tool the client is used to /
  replacing (event title format, event duration, where the phone number
  displays in their calendar app) rather than an approximation — ask to see a
  screenshot of their old tool's calendar entries and copy the format exactly
  (e.g. title `"{Client name} and {Owner name}"`, phone number placed in the
  Location field so calendar apps surface it under the time).
- On the customer-facing confirmation screen: match the tone of whatever tool
  they're replacing. If replacing Calendly specifically, do NOT surface the
  meeting link or name the video tool on-screen — Calendly's own pattern is "a
  calendar invite with the details is on its way to your email," full stop. The
  business owner's OWN admin view can and should still show the Meet link
  directly (they need to actually join calls from there).
- Booking form should collect whatever the business actually needs on a call —
  typically name, email, phone, and a one-line "what do you need help with,"
  with server-side validation on all of them, not just client-side.
- Auto-sync a lightweight CRM: on every booking, upsert a `clients` table keyed
  on email (increment a booking counter, update last-contact date, preserve any
  manually-set status/notes). Optionally mirror this table into a Google Sheet
  (Sheets API, full-tab rewrite on every sync — simplest correct approach,
  treat the sheet purely as a read-only mirror the OWNER never edits directly,
  since edits get overwritten on the next sync) via the SAME OAuth connection
  used for Calendar — one "Connect Google" consent screen can grant Calendar +
  Sheets + Gmail scopes together.

### B4. Self-service content (FAQ / gallery / any client-editable list)

Pattern used for both FAQ and photo gallery here, reuse for any future
"let the client manage this list without a deploy" need:

- One DB table with `sort_order int` for manual reordering.
- Public read endpoint: `GET`, no auth, returns the list ordered by
  `sort_order`. NO caching on this endpoint if the admin needs to see changes
  reflect instantly — an edge cache here reads as "the admin panel is broken"
  to a non-technical user even though it's actually just a cache window.
- Admin endpoint: same URL family, auth-gated, `GET` lists everything (incl.
  sort_order), `POST` takes an `{action: "add"|"update"|"delete"|"move", ...}`
  body and returns the fresh full list after mutating — lets the admin UI just
  replace its local state with the response rather than re-fetching.
- `move` action: swap `sort_order` with the adjacent row in the requested
  direction (look up current order, find neighbor, swap values) — simplest
  correct reordering primitive, no drag-and-drop complexity needed for a
  business owner who just wants "move this one up."
- Admin UI must be built for a **literal first-time, non-technical computer
  user** — this is not a design nice-to-have, it's the actual requirement:
  - Every text input with a length limit shows a live "N characters left"
    counter — don't let them type something that gets silently truncated.
  - An "Add new" box is visually distinct (different border/background) from
    the list of existing items, so it's unambiguous where new content goes.
  - Edits show a "Save" button ONLY when something has actually changed
    (compare current draft to original) — a permanently-visible Save button on
    unchanged content confuses people about whether they need to click it.
  - Delete always asks "Are you sure?" via a plain `confirm()` dialog
    referencing the specific item by name — never a silent delete.
  - For photo uploads: accept a raw file input, compress/resize client-side via
    an off-screen `<canvas>` before sending (a phone photo can be 5-10MB; resize
    to ~700px max-dimension JPEG at ~0.78 quality client-side before it ever
    reaches your API) — don't make the non-technical user think about file
    size at all.
  - Show a small explanatory sentence in plain language at the top of each
    admin tab ("Changes here appear on the website immediately — no extra
    steps") — a technical user infers this, a first-timer needs it stated.

### B5. Auth for the admin panel

Simplest workable pattern for a single-owner small business: one shared
password stored as an env var (`ADMIN_PASSWORD`), checked via a header
(`x-admin-key`) on every admin API call, entered once into a login form that
stores it in `sessionStorage`. Not enterprise-grade, but proportionate — this
is a solo operator's internal tool, not a multi-tenant SaaS. Do implement it
for real before public launch, though — an admin panel with NO auth at all on
a real public domain is a genuine, not theoretical, exposure (client PII,
ability to cancel bookings/block the calendar/edit public-facing content) the
moment the domain is discoverable, which is immediately.

---

## PART C — PROCESS NOTES (how this actually got built, worth repeating)

- **Get a real screenshot before diagnosing any visual bug.** Several apparent
  "bugs" reported during this build (a scaling issue, a broken layout) turned
  out on inspection to be something else entirely (a CSS class-ordering
  conflict, a stale cache) that pure code review would not have caught quickly.
  When a human says "it looks bad/broken," reproduce and screenshot it — full
  page, actual viewport size they're describing — before touching code.
- **Client feedback in casual language needs translation, not literal
  execution.** "Add more images so it's less boring" does not mean "insert
  images randomly" — it means find the specific text-heavy sections and give
  each one exactly one purposeful photo, trim the surrounding copy at the same
  time, and leave sections that are already balanced alone.
- **When a client says a specific visual "looks bad" but can't say why, offer
  2-3 concrete variations rather than one guess.** The hero photo treatment in
  this build went through three iterations (heavy color-filtered photo →
  ML-cutout floating on a bare background → the original photo with only edge
  gradients) before landing — each iteration was a genuinely different
  approach, not a small tweak, because the first two attempts were solving the
  wrong problem (the issue was never "the photo," it was "the treatment made
  it feel artificial").
- **Never invent placeholder data that LOOKS real.** A fake phone number, a
  guessed social handle, "Lorem ipsum" client testimonials — anything that
  reads as genuine information to a visitor but isn't must either be clearly
  marked as a placeholder in the visible copy, or (better) simply omitted until
  the real value exists. A confident-looking fake is worse than an honest gap.
