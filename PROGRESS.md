# Live Pomodoro - Project Progress

**Current focus:** Direct break activities and varied desk work. Walking is removed. The character plays with the cat, stretches his back to the left of the bed. Headphone work includes blinking, thinking and adjusting an earcup.
**Last updated:** 2026-09-08

## Current release status

Working locally: shared clock, approved room, opening seated stretch, direct cat play, back stretches, occasional smiles/thoughts, headphone work, local-time lighting, fan/plant/cat/steam loops and Settings. Screens are deferred at the user's request. Walking paths and their runtime sprite sheet have been removed; original source art is preserved for the two petting frames.

Still outstanding: further visual polish and long-session validation, real presence backend, performance audit and deployment/domain setup. The configured worker is not implemented yet. Historical checklists below are a backlog, not the current release contract.

## Latest validation

112 tests and production build pass. Browser checked back-stretch placement, headphone work and immediate cat play. New floor activities remain stationary and respect Calm/reduced motion; absolute timing restores their state after sleep/reload. Sprite changes apply before browser paint. Source art and exact built-in image-generation prompts are documented in `art/SPRITE_WORKFLOW.md`.

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
| 1 | Clock core | `[x]` | Claude |
| 2 | HUD, no art | `[x]` | Claude |
| 3 | Art generation | `[~]` | **Kanishk** |
| 4 | Scene assembly | `[~]` | Claude |
| 5 | Tier 1 stateful movement | `[x]` | Claude |
| 6 | Lighting system | `[~]` | Claude |
| 7 | Tier 2 ambient loops | `[~]` | Claude |
| 8 | Tier 3 event scheduler | `[ ]` | Claude |
| 9 | Presence, birds on the wire | `[ ]` | Claude |
| 10 | Polish and ship | `[ ]` | Claude |

Phases 1 and 2 produce a fully working timer before any art exists. Phase 3 runs in parallel and is the long pole, but **it no longer blocks anything**: the room is built on a slot manifest, so it renders whatever art exists and skips the rest.

### Adding art

1. Drop exports into `art/src/`, named after their slot id (see [ART_PROMPTS.md](ART_PROMPTS.md))
2. Run `npm run art` to key the magenta backgrounds and optimise
3. That is all. No registration, no wiring

Run `npm run dev` and the panel in the corner lists every slot and whether it is filled. A slot with no file is skipped; a pose with no file falls back to whichever pose does exist, so a single character image covers all eight until the rest arrive.

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

- [x] `lib/cycle.ts` - `cycleState(now)` returning phase, remainingMs, progress, cycleIndex
- [x] Tests: phase boundaries at exactly 0ms, 1499999ms, 1500000ms, 1799999ms
- [x] Tests: UTC `:00` yields focus with exactly 25:00 remaining
- [x] Tests: `cycleIndex` increments once per 30 min and is stable across a cycle
- [x] `lib/daylight.ts` - local time to continuous 0..1 plus interpolated color stops
- [x] Tests: all five stops, and smooth interpolation across the 17:00 boundary
- [x] Tests: the 45-minute-offset edge case (Nepal `+05:45`)
- [x] `lib/activities.ts` - break pools gated by daylight stop, deterministic selection
- [x] `hooks/useCycle.ts` - rAF loop, setState only when the displayed second changes
- [x] rAF driver writes `--progress`, `--daylight`, `--phase` to the root element
- [x] Verify: no React re-render per frame (React DevTools profiler)

## Phase 2 - HUD, no art

Ship-quality usable timer on a flat background.

- [x] `Countdown.tsx` - hero number, Geist Mono tabular figures, no digit jitter
- [x] Phase label and next block time, derived from the real clock (built into `Countdown.tsx`, since they read as one visual unit rather than two components)
- [x] Anti-centered layout: wordmark top-left, toggles top-right, countdown bottom-left
- [x] `lib/notify.ts` - permission requested inside the click handler, never on load
- [x] `lib/audio.ts` - Web Audio chime, off by default
- [x] `Controls.tsx` - notify, sound, keep-awake toggles, real buttons with focus rings
- [-] Calm toggle moved to Phase 7. There is no ambient motion to calm yet, and shipping a dead toggle is worse than shipping none
- [x] `document.title` mirrors the countdown
- [x] Favicon swaps between focus and break
- [x] Wake Lock toggle, feature-detected, degrades silently
- [x] a11y: `aria-live="polite"` on phase change only, not per second
- [x] Contrast audit: landed as permanent tests in `contrast.test.ts`, not a one-time eyeball. Ember on scrim measures 6.54:1
- [x] Verify: countdown stays exact across hidden periods. rAF pauses when the pane hides and the visibilitychange handler recomputes from wall clock; observed repeatedly across multi-minute hidden gaps
- [ ] Verify: sleep the laptop, countdown still exact (genuinely untested, needs a real sleep cycle)

## Phase 3 - Art generation `(Kanishk)`

**Ready-to-paste prompts are in [ART_PROMPTS.md](ART_PROMPTS.md).** Generate the master room FIRST and get it genuinely right. Every other asset is an edit of that one file, so its quality caps the project. Assets go in `art/src/`.

**Master**
- [x] `room-base` - approved opposite-side cartoon room, no character or cat; installed as optimized WebP
- [x] `developer-sprites` - registered 2x2 sheet: working, blink, alternate typing, seated rest
- [x] Exact monitor foreground clipping, responsive shared canvas, and browser occlusion check
- [x] Calm control, reduced-motion handling, and hidden-tab sprite pause
- [x] Occasional small smile during focus, reusing the approved resting sprite for 2.4 seconds every 97 seconds
- [x] Four additional break movement sprites, timed arm raise/stretch/lower and left/right glances
- [x] Every break begins with the approved seated stretch; old camera-specific activity pool replaced
- [x] Sparse break-only thought bubbles alternating product ideas and app facts
- [x] Dev-only day/night and work/rest preview; live countdown remains authoritative

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

- [x] Slot manifest in `lib/assets.ts`, 42 slots, discovered at build time
- [x] `Layer.tsx` - absolutely positioned layer, shared object-fit, no CLS
- [x] `Room.tsx` - composes the stack in z order from whatever art exists
- [x] Selection logic extracted to `lib/roomLayers.ts` and unit tested
- [x] Variant fallback so a partial asset set still renders a character
- [x] Deterministic format priority with a dev warning on duplicate filenames
- [x] Dev asset panel listing filled and missing slots
- [x] `npm run art` chroma-key pipeline, auto-detecting keyed vs full-frame
- [x] Room tint and HUD scrim composited over the art
- [ ] Pose preload during idle so swaps never pop a blank frame
- [ ] Monitor and lamp glow wired to phase as well as daylight
- [ ] Mobile framing check once real art exists

## Phase 5 - Tier 1 stateful movement

Functional, not decorative. Lands before anything ambient.

- [x] Sundial light shaft sweeps across the room mapped to `progress`
- [x] Desk timer dial rotates to zero across the block
- [x] Wall clock hands show real local time, second hand ticks in discrete steps
- [x] Timer glow on during focus, dark during break
- [x] Screen content rotates through a block, frozen on break
- [x] Phase transition beat: glows ease over 400ms while dial and pose snap
- [x] Verify: dial reaches zero exactly when the countdown does (asserted in `cycle.test.ts`)
- [x] Verify: wall clock matches system clock (checked live against 16:10:18, all three hands exact)
- [ ] Visual confirmation of rotation and sweep, once art exists to rotate

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

## Cat visit — September 7

Added eight full-body frames for standing, walking and petting. A 28-second visit begins 1:45 into the break, after the opening stretch and second thought bubble. The character rises, walks left, crouches and pets the cat, then returns and sits down. Paths use animation-frame updates; sprite frames are keyed, foot-aligned, registered horizontally and decoded before use. Expanded foreground desk masking keeps the character behind the table. Calm/reduced motion suppress the visit, hidden tabs stop the player, and absolute time restores the correct position on resume. A development preview plays the visit immediately.

Validated walking scale, petting contact and desk occlusion in the browser, plus Calm returning to a single seated character. Tests cover the activity order, continuous route, frame limits, handoff opacity and reload determinism. Exact asset prompt: `art/previews/developer-visit-prompt.md`. Independent cat walking, other destinations and deployment remain outstanding.

## September 8 revision

Supersedes the September 7 walking visit: the character now cuts directly to cat play at break 1:45 for 18 seconds, back stretches at 2:55 for 18 seconds, and pushups at 4:05 for 18 seconds. Walking code and runtime frames are removed. Work alternates regular and headphone blocks with brief thinking/adjusting gestures. No screen work in this update.

## Pushup removal — September 8

Removed front-facing pushup source/runtime images, generation prompt, preprocessing, scheduling, preloading and preview option at the user’s request. Breaks retain direct cat play and back stretches. The earlier side-view samples remain unused in the back-stretch source sheet.

## Expanded animation frames

Added 16 intermediate poses across regular work, headphones, seated stretch/head turn, cat play and standing back stretch. Seated atlas now has 28 frames; both floor loops have four frames. Opening/closing blinks, four-frame typing cycles and seven-step stretch transitions are scheduled from absolute time. Browser verified expanded atlas stretch playback and floor placement; original room, no-walking and no-pushup scope preserved. See `art/SPRITE_WORKFLOW.md` for sources and exact prompts.
