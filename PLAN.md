# Live Pomodoro - Build Plan

## Context

There are thousands of pomodoro timers and every one of them makes you press Start. The friction is not the timer, it is the activation energy and the loneliness of focusing alone.

This site removes both. A developer character is *always* mid-pomodoro in his room. You open the page and he is already 17 minutes into a focus block, so you join a rhythm that is already moving instead of starting one. Because the cycle is derived from the Unix epoch rather than from your click, every visitor on earth sees the identical state at the identical moment. It is a shared clock, not a personal one.

The room is lit by the visitor's own local time, so the shared rhythm arrives in your light. Nobody is asked to sign up. The clock itself needs no server at all, and the one networked feature, the live count of people focusing alongside you, is built so the room still works perfectly without it.

**Confirmed decisions:** global shared clock, Rick-and-Morty-family flat 2D animation style, fixed wide camera, works 24/7 with a distinct night mood.

---

## Design read

Ambient single-screen consumer product for developers and focus-seeking knowledge workers, with a flat 2D adult-animation language, leaning toward Vite + React + Tailwind v4 driving generated layered art.

**Dials:** `DESIGN_VARIANCE 7` / `MOTION_INTENSITY 7` / `VISUAL_DENSITY 2`

Density is deliberately at the art-gallery end. This product is one screen. The room is the content and the chrome must get out of its way.

### Locked tokens

| Token | Value | Why |
|---|---|---|
| Theme | Dark only, page-level lock | Deliberate single-theme commitment. Dark chrome is the only thing that stays readable over both a dawn room and a midnight room. A light mode would fight the artwork. |
| Accent | Acid orange `#F26B21` | Belongs to the world (lamp, sunset), survives all five lighting states, avoids the banned AI-purple and the banned beige-plus-brass family, and deliberately avoids portal green. |
| Neutrals | `zinc-950` scrim through `zinc-100` text | One neutral family, cool, never mixed with warm greys. |
| Display font | Geist | Sans display per serif discipline. This is not editorial. |
| Numerals | Geist Mono, tabular figures | The countdown is the hero number. Tabular figures stop digit jitter every second. |
| Radius | Controls full pill, panels 12px | One documented rule, applied everywhere. |

**Phase is never carried by a second accent color.** Focus versus break is communicated by the room itself: the desk timer light, the monitor glow, and the character's pose. The accent stays orange in both phases. This is the color consistency lock doing real work rather than being obeyed grudgingly.

**HUD is anti-centered.** No centered card floating over the room. Wordmark top-left, toggles top-right, countdown and phase anchored bottom-left at large scale. The character sits right of frame center so the lower left stays open for type.

---

## The clock

All state is a pure function of `Date.now()`. No server, no socket, no database.

```ts
// lib/cycle.ts - pure, no React, unit-testable
export const CYCLE_MS = 30 * 60 * 1000; // 1_800_000
export const FOCUS_MS = 25 * 60 * 1000; // 1_500_000

export function cycleState(now: number) {
  const elapsed = now % CYCLE_MS;            // ms into the current cycle, UTC anchored
  const isFocus = elapsed < FOCUS_MS;
  return {
    phase: isFocus ? 'focus' : 'break',
    remainingMs: isFocus ? FOCUS_MS - elapsed : CYCLE_MS - elapsed,
    progress: isFocus ? elapsed / FOCUS_MS : (elapsed - FOCUS_MS) / (CYCLE_MS - FOCUS_MS),
    cycleIndex: Math.floor(now / CYCLE_MS),  // global cycle number since epoch
  };
}
```

Because `1_800_000ms` divides the epoch evenly and Unix time ignores leap seconds, the cycle lands exactly on `:00` and `:30` UTC. Every timezone offset that is a whole or half hour inherits that, so for almost everyone **he starts focusing on the hour and the half hour**. This is the site's one memorable, sayable fact and it should appear in the copy.

Footnote for the build: the two 45-minute offsets (Nepal `+05:45`, Chatham `+12:45`) land on `:15` and `:45`. Do not hardcode "on the hour" into rendered copy. Derive the next block time from the actual clock.

**Critical:** `remainingMs` is recomputed from wall clock on every tick. Never accumulate with `setInterval`. A background tab throttles to 1Hz or slower and a sleeping laptop stops entirely, so an accumulating timer silently drifts minutes off. Deriving from `Date.now()` makes sleep, throttling, and tab-switching free.

---

## State machine

Three independent inputs drive the whole scene.

**1. Phase** (global, UTC): `focus` or `break`.

**2. Daylight** (local to visitor): a continuous `0..1` value from local time, interpolated between five color stops rather than bucketed. Bucketing snaps jarringly at exactly 17:00; interpolating means the room drifts the way real light does.

| Stop | Local hours | Character |
|---|---|---|
| night | 21:00 - 04:59 | Desk lamp only, dark city, cat asleep on desk |
| dawn | 05:00 - 07:59 | Cool blue wash, low warm rim from window |
| day | 08:00 - 16:59 | Neutral, brightest, hardest light shaft |
| golden | 17:00 - 18:59 | Deep warm, long shaft, highest saturation |
| dusk | 19:00 - 20:59 | Magenta-to-indigo, lamp begins to dominate |

**3. Activity** (deterministic, shared): break behavior selected by global cycle index, gated by the visitor's local daylight stop so the choice is time-appropriate.

```ts
const pool = ACTIVITY_POOLS[daylightStop];        // no grass-touching at 3am
const activity = pool[cycleIndex % pool.length];  // same cycle, same activity, everywhere
```

Focus poses rotate on the same principle, weighted heavily toward `typing` since that is where he spends most of the block.

---

## Presence: birds on the wire

The count of people focusing right now is the emotional payload of the whole site. A shared clock is what makes it possible, and putting the number in a HUD chip would waste it. So it lives in the room.

**Outside the window there is a power line. Every person focusing right now is a bird sitting on it.**

When someone joins, a bird flies in from off-screen and lands. When someone leaves, a bird takes off. You are one of those birds. At 3am with eleven people, there are eleven birds on an empty wire and it feels like exactly what it is. At 2pm the wire is crowded and slightly chaotic.

This works because it is legible at a glance without a legend, it animates naturally on join and leave, it reads in every lighting state as a silhouette, and it is completely at home in flat 2D animation.

### Mechanics

| Concern | Decision |
|---|---|
| Scale | 1 bird per person up to 40. Past that, birds compress to 1 per 5 and the wire gets a second and third tier. Caps at roughly 60 birds drawn. |
| Position | Birds sit at deterministic slots seeded from a connection id, so a bird does not jump around between renders. |
| Join | Bird flies in over roughly 900ms, lands, settles with a small hop. |
| Leave | Bird takes off and exits. Never a pop-out. |
| Idle | Slow ambient shuffle, occasional wing flick, staggered so they never sync. |
| Night bloom | At night the city behind the wire lights additional windows as the count climbs. Pure atmosphere layered under the birds, not a second counter. Cut this first if scope tightens. |
| Exact figure | A small count near the wire, plus once in the explainer section. The wire carries the feeling, the number carries the fact. |

**The number must be real.** No inflation, no floor, no "join 500 others" when it is nine. If the count is three, three birds. Faking presence on a site whose entire premise is that you are genuinely not alone would poison it.

### Backend

This is the only feature that needs a server, and the traffic shape is unusual: people leave this tab **open for hours**. Long-lived connections are the whole problem.

**Cloudflare Durable Object with WebSocket Hibernation.** One DO instance is the room. Clients connect, it broadcasts the count on join and leave. Hibernation means idle open connections cost essentially nothing, which is precisely the pricing trap that would bite us on a hosted realtime service with a concurrent-connection cap.

- No accounts, no identity, no cookies. An anonymous connection count and nothing else crosses the wire.
- Heartbeat plus server-side timeout so a closed laptop does not linger as a ghost bird.
- **Graceful degradation:** if the socket fails or is blocked, hide the wire and the count entirely. Never render an empty wire or a zero. The room simply has no birds today, and the timer keeps working perfectly, because the clock never depended on the network.

---

## The art pipeline

### The insight that keeps asset count sane

Do **not** generate the room per time of day. Eight poses times five lighting states is forty images that will never match each other.

Generate the room **once** in flat neutral light, as separated transparent layers. Time of day then becomes a CSS lighting problem applied on top of fixed art: tinted overlays, `mix-blend-mode: multiply` and `screen`, filter shifts, and an opacity-driven lamp layer. Roughly 20 assets instead of 40+, and they are guaranteed consistent because they are the same pixels.

Flat 2D animation style makes this work unusually well. Blend modes over flat color fills look intentional. Over painted or rendered art they look muddy.

### Generation order (this is the whole trick)

1. Generate the **master room** first, fully composed, flat neutral light, no character. Iterate until it is genuinely good. Everything downstream inherits from it.
2. For every subsequent asset, use **image-to-image editing on that exact master**, not a fresh prompt. Instruct: same room, same camera, same line weight, same palette, change only X, transparent background, PNG with alpha.
3. Gemini's image editing holds a reference scene far better than re-prompting. Use ChatGPT for concept exploration on step 1, Gemini for the locked variants in step 2.

### Asset manifest

Fixed camera means the static background can be **flattened into one image**. Only elements that move or change need their own layer.

**The separation rule:** anything that **rotates or travels** needs its own layer. Anything that only **sways, glows, or drifts** can stay part of a larger asset and be animated with a CSS transform. This keeps the layer count honest.

**Core layers**

| # | Asset | Notes |
|---|---|---|
| 1 | `room-base` | Walls, door, poster, bed, rug, shelf, desk, monitors, keyboard. One flat image. This is the LCP asset. |
| 2 | `view-day` / `view-night` | Outside the window. Dawn, golden, and dusk are tints of `view-day`. |
| 3 | `monitor-glow` | Additive screen spill. Dims on break. |
| 4 | `lamp-glow` | Additive. Opacity ramps up as daylight drops. |
| 5 | Character focus poses (3) | `typing`, `thinking`, `head-desk` |
| 6 | Character break poses (5) | `at-window`, `with-cat`, `on-bed`, `stretching`, `coffee` |
| 7 | `typing-hands-b` | Second frame for the typing loop. |
| 8 | `blink-overlay` | Eyes closed, positioned per focus pose. |
| 9 | Cat states (3) + `cat-ears-b` | `cat-sitting`, `cat-walking`, `cat-asleep-on-desk`, plus an ear-twitch frame. |
| 10 | `light-shaft` | Window beam. One asset, tinted and repositioned continuously. |
| 11 | `grain` | Fixed noise overlay, `pointer-events-none`. |

**Movement layers.** All tiny, most under 10KB, and they are what make the room feel inhabited.

| # | Asset | Movement |
|---|---|---|
| 12 | `timer-body`, `timer-dial`, `timer-glow` | Dial physically rotates as the block counts down. Glow on during focus. |
| 13 | `clock-face`, `clock-hand-hour`, `clock-hand-minute`, `clock-hand-second` | Wall clock showing the visitor's real local time. Hands rotate for real. |
| 14 | `curtain` | Sways in a breeze near the window. |
| 15 | `plant` | Pulled out of the room base so its leaves can sway. |
| 16 | `fan-blades` | Ceiling fan, slow continuous rotation. |
| 17 | `phone`, `phone-lit` | Lights up occasionally during focus. He ignores it. |
| 18 | `screen-a`, `screen-b`, `screen-c` | Monitor content, swapped so the screens change. |
| 19 | `mug`, `steam` | Steam appears for a few minutes after a coffee break, then stops. |
| 20 | `car` | Crosses the window occasionally at night. |
| 21 | `desk-toy` | Newton's cradle or bobbing toy, slow decaying swing. |
| 22 | `power-line` | The wire outside the window. Part of the view, static. |
| 23 | `bird-perched`, `bird-flying`, `bird-wingflick` | The presence birds. Three small frames total, reused for every bird on the wire. |
| 24 | `city-windows-lit` | Night presence bloom. Addressable lit windows, opacity-driven. |

**About 35 assets**, but the additions past number 11 are small. Flat vector art in WebP compresses hard: roughly 150-250KB for the room base at 2560px, 40-80KB per character pose, and single-digit KB for clock hands and props.

Night hoodie variants would double the character count. Skip for v1. Night already reads through lighting plus the sleeping cat. Log as optional polish.

### Master room prompt (starting point)

> Flat 2D adult animation style, thick uniform black outlines, flat color fills with no gradients, minimal flat shadow shapes, slightly wobbly organic linework. A messy young software developer's bedroom, viewed straight on from the side like a stage set, wide 16:9 composition. Left third: an unmade bed with a rumpled blanket and a dog-eared paperback. Center right: a cluttered desk against a large window, two monitors, mechanical keyboard, a stained coffee mug, tangled cables, sticky notes on the wall. A small round retro tomato-shaped kitchen timer sits on the desk corner. A drooping potted plant. A cat bed on the floor. Muted desaturated mid-tone palette, dirty beige walls, dull teal and mustard accents. Flat even neutral lighting with no strong directional light and no cast shadows from the window. No characters, no people, no cat. Empty room.

Then, for every variant:

> Using this exact image as reference, keep the room, camera angle, line weight, and palette absolutely identical. [CHANGE]. Output only the changed element on a fully transparent background, PNG with alpha, same canvas size and same position as in the reference.

---

## Motion spec: the ambient life system

`MOTION_INTENSITY 7`, expressed in the limited-animation idiom rather than as smooth easing.

**The governing principle:** continuous loops read as a screensaver. Sparse, unpredictable events read as life. A bird that crosses the window once every few minutes is worth more than ten things swaying constantly. So movement is organised into three tiers, and Tier 3 is what actually sells it.

**The hard constraint:** this is a focus tool. Movement must never compete with the user's real work. Everything is slow, nothing is high contrast, nothing blinks rapidly, and no motion sits in the visual hot zone next to the countdown. A busy room would defeat the entire product.

### Tier 1 - Stateful movement (driven by real data, never decorative)

| Motion | Spec |
|---|---|
| **Sundial light shaft** | The window beam sweeps across the room over the full 25 minutes, mapped to `progress`. The room *is* the progress bar. Diegetic, and it means we need almost no UI chrome for progress. |
| **Desk timer dial** | The tomato timer's dial physically rotates back to zero across the block, exactly like a real mechanical kitchen timer. A second progress indicator on the other side of the frame, so wherever you look the room tells you where you are. |
| **Wall clock** | Hands show the visitor's actual local time and move for real. The second hand ticks in discrete steps, never sweeps. Reinforces that the light in the room is your light. |
| Timer glow | On during focus, dark during break. The character's on/off signal you asked for. |
| Monitor glow | Bright and active during focus, dimmed on break. |
| Screen content | `screen-a/b/c` swap every 30-90s during focus so the work visibly changes. Frozen during break. |
| **Presence birds** | Birds land and take off on the power line as real people join and leave. Driven by the live socket, so this is the one motion in the room that is not derived from the clock. See the presence section. |
| **Phase transition** | Timer dial snaps to zero, timer light cuts out, monitor glow dims over 400ms, character snaps to the break pose, lighting shifts, chime fires. The one storytelling beat the whole product is built around. Everything else is ambient. This is the moment. |

### Tier 2 - Ambient loops (constant, slow, peripheral)

| Motion | Spec |
|---|---|
| Blink | 2 frames, 120ms hold, random 3-7s interval, focus poses only. Strongest "alive" signal in flat 2D and nearly free. |
| Typing | 2-frame hand swap at 8fps in bursts of 2-4s, then a pause. Irregular bursts read human, steady loops read robotic. |
| Breathing | Very slow sub-pixel `translateY` on the character. Invisible but felt. |
| Curtain sway | Slow skew and translate, 8s loop, slightly irregular. |
| Plant sway | 12s loop, lower amplitude than the curtain, offset phase so they never sync. |
| Ceiling fan | Continuous slow rotation. Steady, unlike everything else, which is why it works as a baseline. |
| Cat tail | 3-frame loop at 6fps, plus an ear twitch on a random interval. |
| Desk toy | Newton's cradle with a decaying swing, re-triggered occasionally rather than looping forever. |
| Dust motes | 6-8 CSS particles, visible **only inside the light shaft**, which is physically correct and much prettier than motes floating in shadow. |
| Cloud drift | Slow `translateX` on `view-day`, with the shaft's opacity dipping slightly as a cloud passes. Ties the outside to the inside. |
| Light shaft shimmer | Slow opacity and skew on a 40s loop, layered under the sundial position. |

### Tier 3 - Occasional events (rare, random, unpredictable)

These fire on a scheduler, not a loop. **This tier is the answer to "make it feel alive."**

| Event | Frequency |
|---|---|
| Car passes, headlights sweep the wall | Every 4-10 min, night and dusk only |
| Phone lights up on the desk, then dims | Every 5-12 min, focus only. He ignores it. The joke lands. |
| Cat walks across the room and resettles | Every 6-15 min, not at night |
| He sips coffee, then returns to the pose | Every 4-9 min during focus |
| He scratches his head or shifts in the chair | Every 3-7 min during focus |
| Steam rises from the mug | For 3-4 min after any `coffee` break, then stops |
| Lamp flickers once | Rare, night only |

**The scheduler enforces calm.** At most **one** Tier 3 event runs at a time, with a minimum 20-second gap after each. Tier 2 loops continue underneath. Without this rule the room becomes a Christmas tree and stops being a place you can work next to.

Event timing is seeded from `cycleIndex` rather than `Math.random()`, so the events stay **shared across all visitors** like everything else. Two people watching in different countries see the cat get up at the same moment.

A generic "bird flies past the window" event was cut from this tier. Birds now mean people, and an ambient bird would read as a phantom join. Nothing outside the window is allowed to be decorative bird movement any more.

### Rules that apply to all three tiers

- **Animate `transform` and `opacity` only.** Never `left`, `top`, or `width`. Clock hands and the timer dial use `rotate` about a set `transform-origin`.
- Every loop gets an **offset phase and a non-round duration** (7.3s, 11.8s, 40.1s) so nothing ever visibly syncs up. Synchronised loops are the thing that makes an animated scene read as fake.
- All Tier 2 and 3 motion pauses when the tab is hidden, via Page Visibility. No point burning battery animating a room nobody is looking at.
- Grain lives on a fixed `pointer-events-none` overlay, never on a scrolling container.

**Calm mode:** a toggle that drops the room to Tier 1 only. Some people will find any movement distracting, and they are the exact audience for a focus tool. Cheap to build, and it makes the ambitious version safe to ship on by default.

**Reduced motion:** Tier 2 and Tier 3 stop entirely. Tier 1 degrades to discrete steps: the sundial and timer dial jump once per minute rather than sweeping, the clock still ticks. The countdown, notifications, and phase transitions all keep working. The product stays fully functional and still tells the time through the room.

**Line boil** (3-frame jitter on the character outline) is the most authentic touch available in this style and would sell it hard, but it triples the character asset count. Log as v2.

---

## Architecture

```
src/
  main.tsx                   # mount
  App.tsx                    # static shell
  globals.css                # Tailwind v4, tokens
  scene.css                  # keyframes, custom properties
components/
  scene/
    Scene.tsx                # 'use client' island, orchestrates layers
    Layer.tsx                # absolutely positioned image layer
    Character.tsx            # pose swap + blink + typing loop
    Cat.tsx
    DeskTimer.tsx
    LightShaft.tsx           # the sundial, motion-value driven
    LightingOverlay.tsx      # daylight tint + blend modes
    PowerLine.tsx            # presence birds, join/leave animation
  hud/
    Countdown.tsx            # hero number
    PhaseLabel.tsx           # phase + next block time
    Controls.tsx             # notify + sound + calm toggles
lib/
  cycle.ts                   # pure clock math
  daylight.ts                # local time -> continuous 0..1 + color stops
  activities.ts              # break activity pools per daylight stop
  events.ts                  # Tier 3 scheduler, seeded from cycleIndex
  notify.ts                  # Notification API wrapper
  audio.ts                   # Web Audio chime
hooks/
  useCycle.ts                # rAF loop, setState only when the second changes
  usePresence.ts             # socket connect, count, reconnect, degrade to null
worker/
  room.ts                    # Cloudflare Durable Object, WebSocket Hibernation
  wrangler.toml
```

The Durable Object is the only server-side code in the project and it does one thing: hold open sockets and broadcast a number. Everything else stays static and deployable to any CDN.

### Stack

| Layer | Choice | Why |
|---|---|---|
| Build | Vite 6 + React 19 + TypeScript strict | Fast HMR for animation iteration, tiny output, no RSC boundary ceremony on a page that is one client island |
| Styling | Tailwind v4 for HUD, plain CSS for the scene | Tailwind is bad at complex keyframes. Do not force it. |
| Animation | CSS keyframes plus one rAF loop. Motion only for birds. | See state discipline below |
| Tests | Vitest | Native to Vite. The clock math needs real tests. |
| Backend | Cloudflare Durable Object, Wrangler | WebSocket Hibernation is built for long-lived idle sockets |
| Hosting | Cloudflare Pages plus Workers, one project | Site and DO deploy together, one origin, no CORS |
| Assets | `sharp` build script to AVIF and WebP | The 35 assets are static and known, so optimize once |
| Icons | `@phosphor-icons/react`, global `weight="regular"` | |
| Fonts | Self-hosted Geist and Geist Mono woff2, `font-display: swap` | |

**Next.js was rejected deliberately.** One page, no routing, no data fetching, no SEO surface beyond a single document, and roughly 90% of the page is one client-side animated island. Its strengths buy us nothing here, while its RSC rules would be pure friction. The decisive factor is that Vite on Cloudflare Pages lets the site and the Durable Object ship as a single project on a single origin, instead of a Vercel deploy plus a separate worker and a cross-origin socket.

Losing `next/image` and `next/font` costs nothing, because a fixed set of pre-known assets wants a one-time build script, not an on-demand pipeline.

Verify every package against `package.json` before importing. Nothing is assumed present.

### State discipline

**One `requestAnimationFrame` loop writes CSS custom properties onto the root element, and CSS does everything else.** `--progress`, `--daylight`, `--shaft-x`, `--dial-deg`, `--phase`. React renders the DOM once and then essentially never re-renders.

The single exception is the countdown text, which changes at 1Hz. That rAF loop calls `setState` **only when the displayed second actually changes**.

No per-frame React work exists anywhere in this project. No component re-renders on scroll, pointer, or animation frame. There is no `window.addEventListener('scroll')`. Motion is pulled in only for bird join and leave choreography, where spring physics genuinely earns its bundle cost.

### Page structure

The room fills `min-h-[100dvh]` (never `h-screen`, which jumps on iOS Safari). Below the fold sits exactly **one** short section explaining the shared clock and the on-the-hour property, plus a minimal footer. That is the entire page.

Resisting an eight-section marketing page is a deliberate choice. This product is one screen and padding it out with feature grids would undercut it. Two sections means an eyebrow budget of one, and we are spending zero.

---

## Platform behavior

- **Notifications** sit behind an explicit toggle. Requesting permission on page load gets silently blocked by Chrome and is hostile besides. Permission is requested inside the click handler. Fire on focus-to-break and break-to-focus only.
- **Audio chime** behind its own toggle, Web Audio, respecting autoplay policy. Off by default.
- **`document.title`** mirrors the countdown so the timer is readable from a background tab. Free, and one of the most-used features in every timer app.
- **Favicon** swaps between focus and break states.
- **Wake Lock API** as an optional toggle to keep the screen alive. Feature-detected, degrades silently.
- **Page Visibility:** on tab refocus, recompute from wall clock and hard-snap the scene. No catch-up animation.

### Accessibility

- The countdown is an `aria-live="polite"` region announcing phase changes, not every second.
- Every scene layer is decorative with `alt=""`. A single visually-hidden description conveys what the room is doing.
- Toggles are real buttons with visible focus rings that clear WCAG AA against the dark scrim.
- Orange accent on `zinc-950` scrim is verified at 4.5:1 minimum. HUD text always sits on a scrim gradient so contrast never depends on which lighting state the room happens to be in.
- Both toggle labels are two words maximum and cannot wrap at desktop.

### Performance budget

- LCP: `room-base` preloaded with `<link rel="preload">` and served as AVIF with a WebP fallback. Target under 2.5s.
- Poses preloaded during idle after first paint so pose swaps never pop a blank frame.
- Total scene payload target under 1.2MB, with under 400KB above the fold.
- AVIF with WebP fallback. Flat color compresses extremely well, so this is comfortable.
- CLS: every layer has explicit dimensions in a fixed aspect-ratio container.

---

## Build phases

0. **Scaffold.** Vite, Tailwind v4, Vitest, fonts, tokens, directory structure, `wrangler.toml`.
1. **Clock core.** `lib/cycle.ts`, `lib/daylight.ts`, `hooks/useCycle.ts`, with unit tests around phase boundaries, the `:00`/`:30` alignment, and the 45-minute-offset edge case. No UI. This is the foundation and it should be provably correct before any art exists.
2. **HUD on a flat background.** Countdown, phase label, next block time, toggles, notifications, title mirroring. Fully usable product with zero art. Ship-quality on its own.
3. **Art generation.** Master room, then all variants via image-to-image. The slowest phase and the one that decides whether this is good.
4. **Scene assembly.** Layer stack, pose swapping, cat, monitor and lamp glow.
5. **Tier 1 stateful movement.** Sundial shaft, timer dial rotation, wall clock hands, screen swapping, the phase transition beat. This tier is functional, not decorative, so it lands before anything ambient.
6. **Lighting system.** Daylight interpolation, blend-mode overlays, night mood.
7. **Tier 2 ambient loops.** Blink, typing, sway, fan, tail, motes, with phase offsets verified so nothing syncs.
8. **Tier 3 event scheduler.** Seeded from `cycleIndex`, one-at-a-time rule, minimum gap enforcement.
9. **Presence.** Durable Object worker, `usePresence` hook with reconnect and degradation, then the power line and bird choreography. Build the worker and prove the count with plain text on screen before drawing a single bird.
10. **Polish.** Calm mode, reduced-motion fallbacks, explainer section, footer, favicon swap, wake lock, perf pass.

Phases 1 and 2 produce a working product before a single image exists, which de-risks the whole thing. If the art takes three passes to get right, there is still something real running.

Presence sits at phase 9 deliberately. It is the only networked feature, and the site has to be complete and good without it, because the socket will sometimes be blocked or down and the room still has to work.

---

## Verification

- **Clock correctness:** unit tests asserting phase, remaining time, and cycle index at boundary timestamps. Verify a mocked `Date.now()` at a UTC `:00` yields `focus` with exactly 25:00 remaining.
- **Drift:** open the tab, background it for 20 minutes, return. Countdown must be exactly correct, not 20 minutes stale. Repeat across a laptop sleep.
- **Cross-device sync:** two browsers side by side, ideally one with a forced different timezone. Countdowns must match to the second while the room lighting differs.
- **Lighting sweep:** drive `daylight.ts` from an injectable clock and step through all 24 hours, screenshotting each. Look for muddy blend modes and any hour where HUD text loses contrast.
- **Phase transition:** watch a real focus-to-break rollover. Confirm timer dial, timer light, glow dim, pose snap, chime, and notification all fire together and feel like one event rather than six.
- **Mechanical accuracy:** verify the timer dial reaches zero exactly when the countdown does, and that the wall clock matches the system clock. These are visible against a real clock on the wall behind the user, so they have to be right.
- **The calm test.** The one that actually decides whether this ships. Put the site on a second monitor and genuinely work for a full 25-minute block. If the room pulled your eye even once, something is too fast, too high contrast, or too close to the countdown. Tune until it passes. Repeat at night.
- **Loop sync audit:** record 90 seconds and scrub it. If any two ambient loops visibly line up, their durations need re-offsetting.
- **Scheduler check:** log Tier 3 events over an hour and confirm the one-at-a-time rule and minimum gap held, and that two browsers seeded from the same `cycleIndex` fired identical events.
- **Reduced motion:** enable the OS setting, confirm Tier 2 and 3 stop entirely, Tier 1 degrades to discrete steps, and the product still fully works.
- **Battery and idle:** confirm all animation pauses when the tab is hidden.
- **Presence accuracy:** open five tabs, confirm five birds, close two, confirm two take off. Kill a tab without a clean close and confirm the heartbeat timeout removes the ghost bird rather than leaving it perched forever.
- **Presence degradation:** block the socket in devtools. The wire and count must disappear cleanly, the timer must keep perfect time, and nothing may render a zero or an empty wire.
- **Long-connection soak:** leave a tab open for a full working day. Confirm the socket survives sleep and network changes, reconnects without duplicating your own bird, and that DO hibernation is actually engaging rather than billing for idle time.
- **Crowd behavior:** simulate 200 connections and confirm the wire compresses to tiers, caps its drawn birds, and does not tank frame rate.
- **Lighthouse** on the deployed build for LCP, INP, and CLS against the budget above.
- **Live check** in the Browser pane across desktop, tablet, and mobile presets. Mobile collapse is declared per component, not assumed.

---

## Deliberately deferred

- Line boil on the character outline.
- Named or located presence (flags, cities, cursors). The birds stay anonymous. Identity would turn a calm room into a social feed.
- Historical stats, streaks, accounts.
- Night hoodie pose variants.
- Long-break rhythm. The clean 30-minute cycle and its `:00`/`:30` alignment is worth more than classic pomodoro's four-then-long-break structure, which divides the day awkwardly.

---

## Tracking

Live task status lives in `PROGRESS.md` at the project root, phase by phase in chronological order, including the asset generation checklist. Update it as work lands.

---

## Pre-flight commitments

Carried into implementation and checked before shipping: zero em-dashes anywhere visible; one theme locked page-wide; one accent across all states; one radius rule; no eyebrows; no scroll cues; no locale or weather strips; no version labels; no decorative status dots; no section-number labels; no fake-precise numbers; no div-based fake screenshots; no hand-rolled SVG icons; every animation justified in one sentence; hero fits the viewport with a countdown visible without scrolling.
