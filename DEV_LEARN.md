# Building this: the core techniques

Written for someone with a few years of experience who knows React and CSS but has not built a time-driven animated scene before.

Nine topics. Each says what it is, why this project needs it, where it already lives in this repo, and where to go deeper. Read them in order; each one builds on the last.

If you only learn two things here, learn **3 (custom properties as the animation bus)** and **4 (not re-rendering React)**. Everything else is ordinary web development. Those two are what make an animated scene run at 60fps instead of melting a laptop.

---

## 1. Derive state from the clock, never accumulate it

**The idea.** There are two ways to build a timer. The obvious one counts down:

```js
setInterval(() => { remaining -= 1000; }, 1000);   // wrong
```

The correct one asks what time it is and does arithmetic:

```js
const elapsed = Date.now() % CYCLE_MS;             // right
```

**Why it matters.** The first version is wrong in ways that only show up later. Browsers throttle background tabs to roughly one tick per second, then to almost nothing. A sleeping laptop stops firing timers entirely. `setInterval` also drifts, because the callback is queued, not guaranteed. Leave that tab open for an afternoon and it will be minutes wrong.

The second version has no state to drift. Close the lid, open it tomorrow, and it is still correct, because nothing was ever being counted. It also means every visitor on earth computes the identical value from the identical input, which is the entire premise of this site.

**The trick worth internalising:** modulo arithmetic on the Unix epoch gives you a global repeating cycle for free. `Date.now() % 1_800_000` is "milliseconds into the current half hour", the same number in every timezone, with no server involved.

**In this repo:** [`src/lib/cycle.ts`](src/lib/cycle.ts) is the whole idea in about forty lines. [`src/lib/cycle.test.ts`](src/lib/cycle.test.ts) is worth reading second, because the tests are where the edge cases live.

**Learn more:**
- [MDN: Date.now()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now)

---

## 2. The render loop

**The idea.** `requestAnimationFrame` asks the browser to call you once before the next repaint. You call it again from inside the callback, and that is your loop.

```js
function tick() {
  // read the clock, write the scene
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
```

**Why not setInterval.** rAF is synchronised to the display refresh, so you never render a frame nobody sees or tear halfway through one. It also **pauses automatically when the tab is hidden**, which is free battery savings you would otherwise have to build.

**The thing that trips people up.** Because rAF pauses when hidden, your loop simply stops. That is fine here precisely because of topic 1: when the tab comes back, the next frame reads `Date.now()` and is instantly correct. If you had been accumulating, you would now be broken. The two techniques depend on each other.

**Delta time.** Most rAF tutorials teach you to compute `delta = now - lastFrame` and multiply movement by it, so animation runs at the same speed on a 60Hz and a 144Hz screen. Worth knowing. This project mostly does not need it, because our positions come from the wall clock rather than from accumulated movement, which is the same insight as topic 1 wearing a different hat.

**In this repo:** [`src/hooks/useCycle.ts`](src/hooks/useCycle.ts).

**Learn more:**
- [MDN: requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
- [JavaScript animation loop, Muffin Man](https://muffinman.io/blog/javascript-animation-loop/) - short and practical on delta time

---

## 3. CSS custom properties as the animation bus

**This is the most important technique in the project.**

**The idea.** Instead of JavaScript touching many elements every frame, JavaScript writes **one number** to the root element, and CSS derives everything else from it.

```js
document.documentElement.style.setProperty('--progress', '0.42');
```

```css
:root {
  --shaft-x: calc(var(--progress) * 100%);
  --dial-deg: calc((1 - var(--progress)) * 360deg);
}
.light-shaft { left: var(--shaft-x); }
.timer-dial  { transform: rotate(var(--dial-deg)); }
```

One JS write moves the light beam across the room *and* winds the timer dial back, with no JavaScript touching either element. Add a tenth thing that reacts to progress and the per-frame JavaScript cost stays exactly the same.

**@property is what makes this properly good.** By default a custom property is just a string to the browser, so there is nothing to interpolate and it cannot be animated or transitioned. Registering it gives it a real type:

```css
@property --progress {
  syntax: "<number>";
  inherits: true;
  initial-value: 0;
}
```

Now the browser knows it is a number. It can interpolate it, transition it, and optimise it. This is also the trick behind animating gradient stops and conic-gradient angles, which are otherwise impossible.

**The other half: only write when it changes.** Setting nine properties 60 times a second is mostly waste, since daylight shifts over hours. Our loop keeps the last written value per property and skips the write when the delta is below a threshold. `--progress` gets every frame; `--daylight` gets one write every few minutes.

**In this repo:** [`src/scene.css`](src/scene.css) for the registrations and derived values, and the `put()` function in [`src/hooks/useCycle.ts`](src/hooks/useCycle.ts) for the epsilon gating.

**Learn more:**
- [MDN: @property](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@property)
- [MDN: Animatable CSS properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Animations/Animatable_properties)
- [CSS @property guide with live examples, Savvy](https://savvy.co.il/en/blog/css/css-at-property-guide/)

---

## 4. Not re-rendering React

**The idea.** React's model is: state changes, component re-renders, virtual DOM diffs, real DOM updates. That is fine at human speed and ruinous at 60fps.

```jsx
// Kills your frame budget: 60 renders and 60 reconciliations per second
const [progress, setProgress] = useState(0);
useEffect(() => {
  const tick = () => { setProgress(computeProgress()); requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}, []);
```

Every frame re-runs your component, re-creates its element tree, diffs it, and commits. With a handful of layers you will feel it. On mobile it collapses.

**Two ways out, and you should know both.**

**Write straight to the DOM.** Your rAF loop sets CSS custom properties (topic 3). React never learns anything changed, which is the point. This is what this project does.

**Motion values.** Libraries like Motion offer `useMotionValue` and `useTransform`: values that live outside React's render cycle and push directly to the DOM. Same principle, nicer ergonomics, useful when the animation is per-component rather than global.

**When React should render.** Only when a human could perceive a discrete change. Our countdown text changes once per second, so we build a small key from everything the user can actually see and call `setState` only when it differs:

```ts
const key = `${phase}|${countdown}|${stop}|${activity}|${pose}`;
if (key !== lastKey.current) { lastKey.current = key; setState(next); }
```

**Measured, not assumed.** Over 4.4 seconds this page ran 264 animation frames and React rendered 6 times, and dev StrictMode doubles that count. Roughly 1Hz, about 44x fewer renders than frames. **Measure this in your own projects.** Add a counter, watch the ratio; if renders track frames, you have found your performance problem.

**In this repo:** the `key()` function in [`src/hooks/useCycle.ts`](src/hooks/useCycle.ts).

**Learn more:**
- [React: You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [Motion: motion values](https://motion.dev/docs/react-motion-value)

---

## 5. 2D character animation: limited animation and steps()

**The idea.** Western TV animation is not drawn at 24 unique frames per second. It is drawn "on twos" or "on threes", holding each drawing for two or three frames. Cheaper, and it is the look. Smooth interpolation would make our flat 2D style look *wrong*, like a Flash tween.

**The CSS tool is `steps()`.** Normal timing functions interpolate continuously. `steps(n)` jumps in n discrete hops with nothing in between, which is exactly what you want for frame-based animation:

```css
.hands {
  animation: type 0.25s steps(2) infinite;
}
@keyframes type {
  to { background-position-x: -200px; }   /* two frames side by side */
}
```

**Sprite sheets.** Put your frames in one image, animate `background-position` with `steps(frameCount)`. One HTTP request, no flicker from late-loading frames, and the browser never has to decode a new image mid-animation. The frame count in `steps()` must equal the frames in the sheet, and the final keyframe must land exactly one full sheet width across.

**Two rules that make ambient scenes feel alive**, learned the hard way in this project:

1. **Give every loop a non-round, offset duration** (7.3s, 11.8s, 40.1s). Loops that visibly sync up are the single biggest tell that a scene is fake.
2. **Sparse random events beat constant loops.** A bird crossing the window every few minutes is worth more than ten things swaying. Continuous motion reads as a screensaver; unpredictable motion reads as life.

**Learn more:**
- [How to create a CSS sprite animation with steps(), Treehouse](https://blog.teamtreehouse.com/css-sprite-sheet-animations-steps)
- [Making CSS animations using a sprite sheet, LogRocket](https://blog.logrocket.com/making-css-animations-using-a-sprite-sheet/)
- [Sprite sheet animations using only CSS, Kirupa](https://www.kirupa.com/html5/sprite_sheet_animations_using_only_css.htm)
- [CSS sprite sheets, Lean Rada](https://leanrada.com/notes/css-sprite-sheets/)

---

## 6. Compositing a layered scene

**The idea.** The room is not one picture. It is roughly twenty stacked transparent images, each able to move independently.

**Alignment is the whole game.** If every layer is exported at the same canvas size and rendered with the same `object-fit`, they line up automatically at any viewport size with zero per-layer positioning:

```css
.layer { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
```

Get this wrong and you will spend days nudging pixels.

**transform-origin for anything that rotates.** Clock hands and the timer dial rotate about a point, not their centre. Export each hand with its pivot at the exact centre of the canvas, then rotation is one line and needs no offset maths:

```css
.clock-hand-minute { transform: rotate(calc(var(--minute) * 6deg)); }
```

**Alpha from a chroma key.** Image models will not reliably give you transparent PNGs; they bake white or a checkerboard into the pixels. So we ask for a solid magenta `#FF00FF` background and remove it at build time. Magenta because nothing in the room's palette is near it, so nothing real gets eaten.

**In this repo:** [`src/lib/assets.ts`](src/lib/assets.ts) for the slot manifest, [`src/lib/roomLayers.ts`](src/lib/roomLayers.ts) for which layers show, [`scripts/art.mjs`](scripts/art.mjs) for the keying.

---

## 7. Lighting with blend modes

**The idea.** We do not generate a day room and a night room. We generate **one** flat, neutrally lit room and change the light in CSS. That is the difference between 20 assets and 40 that never quite match.

**Two blend modes do almost all of it:**

- **`multiply`** darkens. White in the top layer disappears, dark areas stay. Think ink on paper. This is your shadow, your tint, your night wash.
- **`screen`** lightens. Black disappears, light areas stay. The exact inverse. This is your lamp glow, your monitor spill, your light shaft.

```css
.room-tint  { background: var(--tint); mix-blend-mode: multiply; }
.lamp-glow  { mix-blend-mode: screen; opacity: var(--lamp); }
```

Because `--tint` and `--lamp` come from the clock (topic 3), the room's light tracks the viewer's actual local time with no extra machinery.

**Why it works so well on flat art.** Blend modes over flat colour fills look intentional. Over painted or photographic art they usually look muddy. The art style and the lighting technique were chosen together, which is a good habit: pick an aesthetic your implementation is actually good at.

**Learn more:**
- [MDN: mix-blend-mode](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mix-blend-mode)
- [CSS-Tricks: mix-blend-mode almanac](https://css-tricks.com/almanac/properties/m/mix-blend-mode/)

---

## 8. Triggers

You asked specifically about triggers. There are four kinds worth knowing, and this project uses three.

**Time triggers.** Something fires because the clock reached a value. Our phase flip at 25 minutes. Compute from the clock, compare against last frame, fire on change. See [`src/hooks/usePhaseTransition.ts`](src/hooks/usePhaseTransition.ts), including the detail that it deliberately does *not* fire on mount, because arriving mid-block is the normal case and greeting everyone with a chime would be wrong.

**Viewport triggers.** Something fires because an element scrolled into view. Use `IntersectionObserver`, never a scroll listener. A scroll handler runs on every scroll event on the main thread and is the classic cause of janky pages.

**Scroll-driven animation.** Newer CSS ties animation *progress* to scroll position with no JavaScript at all, via `animation-timeline: scroll()` or `view()`. Runs off the main thread, so it stays smooth where a JS equivalent would not. Not used here (this page barely scrolls) but it is the modern answer to a very common requirement.

**Deterministic pseudo-random events.** This one is subtle and specific to shared experiences. Our ambient events need to feel random but be **identical for every visitor**, so two people in different countries see the cat get up at the same moment. `Math.random()` cannot do that. Instead, hash a seed you already share:

```ts
function hash2(a, b) {
  let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b);
  h = Math.imul(h ^ (b + 0x165667b1), 0xc2b2ae35);
  h ^= h >>> 15;
  return (h >>> 0) / 0x100000000;   // 0..1, stable everywhere
}
```

Seed it with the global cycle index and you get randomness that is the same on every machine, forever, with no coordination. See [`src/lib/activities.ts`](src/lib/activities.ts).

**Learn more:**
- [MDN: Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [MDN: CSS scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations)
- [A guide to scroll-driven animations with just CSS, WebKit](https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/)

---

## 9. Performance and accessibility

**Animate only `transform` and `opacity`.** These are handled by the compositor and never trigger layout or paint. Animating `left`, `top`, `width` or `height` forces the browser to recalculate layout every frame. This is the single most repeated piece of web animation advice because it is the single most common mistake.

```css
.bad  { transition: left 300ms; }        /* layout every frame */
.good { transition: transform 300ms; }   /* compositor only */
```

**Respect `prefers-reduced-motion`.** Not optional. For some people motion causes actual nausea and migraines. The useful discipline is not "turn everything off" but "decide what is decorative and what is information". Here, ambient loops stop entirely, while the clock still tells the time, just stepping instead of sweeping.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}
```

**Page Visibility.** Pause work when nobody is looking. rAF does this for you; timers, WebSockets and video do not.

**Learn more:**
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)
- [MDN: Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
- [MDN: CSS performance and animation](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Animation_performance_and_frame_rate)

---

## 10. Realtime presence (Phase 9)

**The idea.** Every person focusing right now is a bird on the power line. That needs a server, and the traffic shape is unusual: people leave this tab open for hours, so it is thousands of mostly idle long-lived connections.

That rules out most hosted realtime services, which price and cap by concurrent connection. Cloudflare Durable Objects with **WebSocket Hibernation** are built for exactly this: the object can be evicted from memory while the sockets stay open, so idle connections cost essentially nothing.

**The concepts to learn:** WebSocket lifecycle, heartbeat and timeout (so a closed laptop does not leave a ghost bird), reconnect with backoff, and graceful degradation. That last one matters most: if the socket fails, the wire and the count vanish and the timer keeps perfect time, because the clock never depended on the network.

**Learn more:**
- [MDN: WebSockets API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [Cloudflare Durable Objects docs](https://developers.cloudflare.com/durable-objects/)

---

## Video and courses

**[Kevin Powell](https://www.youtube.com/@KevinPowell)** is the single best use of your time for CSS. Over a thousand videos, almost all CSS, and he goes deep rather than staying at tutorial level. Directly relevant playlists and videos:

- His [CSS animation playlist](https://www.youtube.com/playlist?list=PL4-IK0AVhVjP5iRPyoF1pKwX-7sEOwty4)
- [CSS-only particle animations](https://www.classcentral.com/course/youtube-css-only-particle-animations-204399) - close to our dust motes
- [Scroll-based animations with CSS only](https://www.classcentral.com/course/youtube-incredible-scroll-based-animations-with-css-only-275166)
- [Animating with CSS transitions](https://www.classcentral.com/course/youtube-animating-with-css-transitions-a-look-at-the-transition-properties-160442)

**[Hyperplexed](https://www.youtube.com/@Hyperplexed)** rebuilds effects from award-winning sites. Good for seeing how a striking effect decomposes into simple parts.

**[Josh Comeau's blog](https://www.joshwcomeau.com/)** has the best writing anywhere on CSS transforms and animation intuition. Read [An Interactive Guide to CSS Transforms](https://www.joshwcomeau.com/css/transforms/) before touching topic 6.

**[Motion documentation](https://motion.dev/docs)** is worth reading end to end even if you never install it, because it teaches spring physics and orchestration concepts that apply everywhere.

---

## Learn it by building it

Reading will not stick. These are ordered so each takes about an evening and produces something you can look at.

1. **A clock that survives sleep.** Render `Date.now() % 60000` as a second hand. Rotate it with a custom property. Sleep your laptop, wake it, confirm it is still right. You now understand topics 1, 2 and 3.
2. **Count your renders.** Add a render counter to a component with a rAF loop. Do it the naive way first and watch renders track frames. Then gate the `setState` and watch the ratio collapse. Topic 4, felt rather than read.
3. **Animate a sprite on twos.** Take any 4-frame sprite sheet and drive it with `steps(4)`. Then try it without `steps()` and see why interpolation is wrong for frame animation. Topic 5.
4. **Light one photograph.** Take a single image, overlay a coloured div with `mix-blend-mode: multiply`, and drive its colour from a custom property tied to the current hour. You have just built our entire lighting system. Topic 7.
5. **Make randomness shared.** Write the hash from topic 8. Open it in two browsers and confirm they produce identical sequences from the same seed. This is the concept most people have never met.
6. **Then come back here.** Pick any unchecked task in [PROGRESS.md](PROGRESS.md) and do it. Phase 7 (ambient loops) is the best entry point: self-contained, visual, and immediate feedback.

---

## Reading this repo in order

If you want to follow the code rather than the concepts:

1. [`src/lib/cycle.ts`](src/lib/cycle.ts) then its test file. The foundation, and small.
2. [`src/hooks/useCycle.ts`](src/hooks/useCycle.ts). Where time becomes pixels. The most important file.
3. [`src/scene.css`](src/scene.css). How one number becomes many visual effects.
4. [`src/lib/roomLayers.ts`](src/lib/roomLayers.ts) then its test file. Pure logic, and a good example of why extracting logic from components makes it testable.
5. [`src/components/scene/Room.tsx`](src/components/scene/Room.tsx). The compositing.

[PLAN.md](PLAN.md) explains why each decision was made, which is usually more useful than the code itself.
