# Live Pomodoro - Project Progress

**Current focus:** Phase 1, clock core
**Last updated:** 2026-09-04

## Status legend

| Mark | Meaning |
|---|---|
| `[ ]` | Not started |
| `[~]` | In progress |
| `[x]` | Done |
| `[!]` | Blocked, see note |
| `[-]` | Cut from scope |

## Phase summary

| # | Phase | Status | Owner |
|---|---|---|---|
| 0 | Project scaffold | `[x]` | Claude |
| 1 | Clock core | `[~]` | Claude |
| 2 | HUD, no art | `[ ]` | Claude |
| 3 | Art generation | `[ ]` | **Kanishk** |
| 4 | Scene assembly | `[ ]` | Claude |
| 5 | Tier 1 stateful movement | `[ ]` | Claude |
| 6 | Lighting system | `[ ]` | Claude |
| 7 | Tier 2 ambient loops | `[ ]` | Claude |
| 8 | Tier 3 event scheduler | `[ ]` | Claude |
| 9 | Presence, birds on the wire | `[ ]` | Claude |
| 10 | Polish and ship | `[ ]` | Claude |

Phases 1 and 2 produce a fully working timer before any art exists. Phase 3 runs in parallel with 1 and 2 and is the long pole.

---

## Phase 0 - Project scaffold

- [x] Scaffold Vite + React 19 + TypeScript, strict mode on
- [x] Tailwind v4 via the Vite plugin
- [x] Vitest configured, one passing smoke test
- [x] Self-host Geist and Geist Mono woff2, `@font-face` with `font-display: swap`
- [x] Directory structure per plan (`lib/`, `hooks/`, `components/scene/`, `components/hud/`, `worker/`)
- [x] Design tokens in `globals.css`, accent `#F26B21`, dark theme locked
- [x] `wrangler.toml` for the Durable Object, not yet wired up
- [x] `.gitignore`, `git init`, first commit

## Phase 1 - Clock core

No UI. Must be provably correct before anything renders.

- [ ] `lib/cycle.ts` - `cycleState(now)` returning phase, remainingMs, progress, cycleIndex
- [ ] Tests: phase boundaries at exactly 0ms, 1499999ms, 1500000ms, 1799999ms
- [ ] Tests: UTC `:00` yields focus with exactly 25:00 remaining
- [ ] Tests: `cycleIndex` increments once per 30 min and is stable across a cycle
- [ ] `lib/daylight.ts` - local time to continuous 0..1 plus interpolated color stops
- [ ] Tests: all five stops, and smooth interpolation across the 17:00 boundary
- [ ] Tests: the 45-minute-offset edge case (Nepal `+05:45`)
- [ ] `lib/activities.ts` - break pools gated by daylight stop, deterministic selection
- [ ] `hooks/useCycle.ts` - rAF loop, setState only when the displayed second changes
- [ ] rAF driver writes `--progress`, `--daylight`, `--phase` to the root element
- [ ] Verify: no React re-render per frame (React DevTools profiler)

## Phase 2 - HUD, no art

Ship-quality usable timer on a flat background.

- [ ] `Countdown.tsx` - hero number, Geist Mono tabular figures, no digit jitter
- [ ] `PhaseLabel.tsx` - current phase plus next block time derived from real clock
- [ ] Anti-centered layout: wordmark top-left, toggles top-right, countdown bottom-left
- [ ] `lib/notify.ts` - permission requested inside the click handler, never on load
- [ ] `lib/audio.ts` - Web Audio chime, off by default
- [ ] `Controls.tsx` - notify, sound, calm toggles, real buttons with focus rings
- [ ] `document.title` mirrors the countdown
- [ ] Favicon swaps between focus and break
- [ ] Wake Lock toggle, feature-detected, degrades silently
- [ ] a11y: `aria-live="polite"` on phase change only, not per second
- [ ] Contrast audit: accent on scrim at 4.5:1 minimum
- [ ] Verify: background the tab 20 min, countdown still exact
- [ ] Verify: sleep the laptop, countdown still exact

## Phase 3 - Art generation `(Kanishk)`

Generate the master room FIRST. Every other asset is an image-to-image edit of that exact file. Prompts are in the plan file.

**Master**
- [ ] `room-base` - empty room, flat neutral light, no character, no cat

**Core layers**
- [ ] `view-day`
- [ ] `view-night`
- [ ] `monitor-glow`
- [ ] `lamp-glow`
- [ ] `light-shaft`
- [ ] `grain`

**Character, focus (3)**
- [ ] `pose-typing`
- [ ] `pose-thinking`
- [ ] `pose-head-desk`
- [ ] `typing-hands-b`
- [ ] `blink-overlay`

**Character, break (5)**
- [ ] `pose-at-window`
- [ ] `pose-with-cat`
- [ ] `pose-on-bed`
- [ ] `pose-stretching`
- [ ] `pose-coffee`

**Cat (4)**
- [ ] `cat-sitting`
- [ ] `cat-walking`
- [ ] `cat-asleep-on-desk`
- [ ] `cat-ears-b`

**Movement props**
- [ ] `timer-body`
- [ ] `timer-dial`
- [ ] `timer-glow`
- [ ] `clock-face`
- [ ] `clock-hand-hour`
- [ ] `clock-hand-minute`
- [ ] `clock-hand-second`
- [ ] `curtain`
- [ ] `plant`
- [ ] `fan-blades`
- [ ] `phone` + `phone-lit`
- [ ] `screen-a` / `screen-b` / `screen-c`
- [ ] `mug` + `steam`
- [ ] `car`
- [ ] `desk-toy`

**Presence**
- [ ] `power-line`
- [ ] `bird-perched`
- [ ] `bird-flying`
- [ ] `bird-wingflick`
- [ ] `city-windows-lit`

**Pipeline**
- [ ] `sharp` build script, AVIF plus WebP, all assets
- [ ] Payload check: under 1.2MB total, under 400KB above the fold

## Phase 4 - Scene assembly

- [ ] `Layer.tsx` - absolutely positioned layer, explicit dimensions, no CLS
- [ ] `Scene.tsx` - layer stack in correct z-order
- [ ] `Character.tsx` - pose swap as hard cut, 60ms gap, no cross-fade
- [ ] `Cat.tsx`
- [ ] Monitor and lamp glow wired to phase and daylight
- [ ] Pose preload during idle so swaps never pop a blank frame
- [ ] Mobile collapse declared per component

## Phase 5 - Tier 1 stateful movement

Functional, not decorative. Lands before anything ambient.

- [ ] Sundial light shaft sweeps across the room mapped to `progress`
- [ ] Desk timer dial rotates to zero across the block
- [ ] Wall clock hands show real local time, second hand ticks in discrete steps
- [ ] Timer glow on during focus, dark during break
- [ ] Screen content swaps every 30-90s during focus, frozen on break
- [ ] Phase transition beat: dial, light, glow, pose, lighting, chime as ONE event
- [ ] Verify: dial reaches zero exactly when the countdown does
- [ ] Verify: wall clock matches system clock

## Phase 6 - Lighting system

- [ ] Daylight interpolation driving tint layers
- [ ] `mix-blend-mode` overlays per stop
- [ ] Night mood: lamp dominant, dark city, cat asleep on desk
- [ ] Verify: step all 24 hours, screenshot each, check for muddy blends
- [ ] Verify: HUD text keeps contrast at every hour

## Phase 7 - Tier 2 ambient loops

- [ ] Blink, 2 frames, random 3-7s, focus poses only
- [ ] Typing, 2-frame swap at 8fps in irregular bursts
- [ ] Breathing, sub-pixel translateY
- [ ] Curtain sway
- [ ] Plant sway, offset phase from curtain
- [ ] Ceiling fan, steady rotation
- [ ] Cat tail loop plus ear twitch
- [ ] Desk toy, decaying swing, re-triggered not looped
- [ ] Dust motes, visible only inside the light shaft
- [ ] Cloud drift, with shaft opacity dipping as clouds pass
- [ ] All durations non-round and phase-offset
- [ ] Pause all motion when tab hidden
- [ ] Verify: record 90s, scrub, confirm no two loops visibly sync

## Phase 8 - Tier 3 event scheduler

- [ ] `lib/events.ts` seeded from `cycleIndex`, not `Math.random()`
- [ ] One event at a time, minimum 20s gap
- [ ] Car headlights sweep the wall, night and dusk only
- [ ] Phone lights up during focus, he ignores it
- [ ] Cat walks across the room and resettles
- [ ] He sips coffee
- [ ] He scratches his head or shifts in the chair
- [ ] Steam for 3-4 min after a coffee break
- [ ] Lamp flickers once, rare, night only
- [ ] Verify: two browsers on the same cycle fire identical events

## Phase 9 - Presence, birds on the wire

Build the worker and prove the count as plain text BEFORE drawing a single bird.

- [ ] `worker/room.ts` - Durable Object with WebSocket Hibernation
- [ ] Heartbeat plus server-side timeout so ghosts get culled
- [ ] `hooks/usePresence.ts` - connect, count, reconnect with backoff
- [ ] Degrade to `null` on failure, never render a zero
- [ ] Plain-text count on screen, verified working
- [ ] `PowerLine.tsx` - deterministic bird slots seeded from connection id
- [ ] Join: bird flies in ~900ms, lands, small settle hop
- [ ] Leave: bird takes off and exits, never a pop-out
- [ ] Idle: slow shuffle and wing flick, staggered
- [ ] Scale: 1 per person to 40, then 1 per 5, cap ~60 drawn
- [ ] Night bloom: city windows light as count climbs
- [ ] Exact count rendered near the wire
- [ ] Verify: 5 tabs equals 5 birds, close 2, two take off
- [ ] Verify: hard-kill a tab, heartbeat culls the ghost bird
- [ ] Verify: block the socket, wire and count vanish cleanly, timer unaffected
- [ ] Verify: simulate 200 connections, no frame rate collapse
- [ ] Soak: tab open a full working day, survives sleep and network change

## Phase 10 - Polish and ship

- [ ] Calm mode drops the room to Tier 1 only
- [ ] Reduced motion: Tier 2 and 3 off, Tier 1 to discrete steps
- [ ] Explainer section below the fold, the `:00` and `:30` fact
- [ ] Footer
- [ ] **The calm test**: work a real 25-min block with the site on a second monitor. If the room pulled your eye once, tune it. Repeat at night.
- [ ] Lighthouse: LCP under 2.5s, INP under 200ms, CLS under 0.1
- [ ] Responsive check at desktop, tablet, mobile
- [ ] Pre-flight check from the plan file, every box
- [ ] Deploy to Cloudflare Pages plus Workers
- [ ] Custom domain

---

## Blocked and notes

Nothing blocked yet.

## Decision log

| Date | Decision |
|---|---|
| 2026-09-04 | Global shared clock derived from the Unix epoch, not a personal timer |
| 2026-09-04 | Rick-and-Morty-family flat 2D style, original character, no portal green |
| 2026-09-04 | Fixed wide camera, no parallax, so the static background flattens to one image |
| 2026-09-04 | Works 24/7 with a distinct night mood, he does not sleep |
| 2026-09-04 | Presence promoted from deferred to core, expressed as birds on a power line |
| 2026-09-04 | Vite over Next.js, so the site and the Durable Object deploy as one Cloudflare project |
| 2026-09-04 | One rAF loop writes CSS custom properties, CSS does the rest, no per-frame React |
