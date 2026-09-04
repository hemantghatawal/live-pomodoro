# Art Prompt Pack

Everything needed to generate the 35 assets in Phase 3. Read "Rules" once, then work down the list.

---

## Rules (read once, they matter more than the prompts)

**1. Generate the master room FIRST and get it genuinely right.** Every other asset is an edit of that one image. Its quality caps the whole project. Spend as many attempts as it takes.

**2. Attach the master room image to every subsequent request.** Do not re-prompt from scratch. Upload it and say "match this image exactly". This is the single biggest factor in whether the assets look like one world.

**3. Never ask for a transparent background.** ChatGPT bakes white or a checkerboard into the pixels. Ask for **solid pure magenta `#FF00FF`** instead and we key it out. Magenta is used because nothing in the room's palette is near it.

**4. Always use landscape 1536 x 1024.** Same canvas for every asset so nothing shifts between layers. If ChatGPT offers a size picker, pick landscape/wide.

**5. Same camera, always.** The phrase "identical camera angle, identical position and scale" appears in every edit prompt on purpose. Do not let it re-frame.

**6. Name the file as listed.** I read them by exact filename. Put them in `art/src/`.

---

## The style block

This paragraph goes at the **start of every prompt**, including the master. Copy it verbatim.

> Flat 2D digital cartoon in the style of modern adult animated television. Thick uniform black outlines of consistent weight. Completely flat colour fills with no gradients and no texture. Minimal shading, at most one flat darker shape per form. Slightly wobbly, hand-drawn organic linework. Muted desaturated palette of dirty beiges, dull teals and mustards, with only a few saturated accents. No cross-hatching, no painterly rendering, no soft cel-shading, no 3D, no photorealism.

Character descriptors, added only when a person is in frame:

> Simple bean-shaped head, small round dot pupils with heavy black outlines, thin expressive eyebrows, slightly exaggerated noodly limbs.

---

## 1. The master room

Filename: `room-base.png`

Paste the style block, then this:

> A messy young software developer's bedroom, viewed straight on from the side like a theatre stage set, wide landscape composition, perfectly flat side-on perspective with no vanishing point.
>
> Left third: an unmade bed with a rumpled blanket and a dog-eared paperback on the floor beside it. A cat bed on the rug.
>
> Centre and right: a cluttered desk pushed against a large window. Two monitors, a mechanical keyboard, a stained coffee mug, tangled cables running down the back, sticky notes stuck to the wall. A small round retro tomato-shaped kitchen timer sits on the front-left corner of the desk. An anglepoise desk lamp. A drooping potted plant beside the desk. A round analogue wall clock on the wall above the desk. A ceiling fan. Through the window, a plain daytime sky and the flat silhouettes of low city buildings, with a single horizontal power line crossing the window.
>
> Flat, even, neutral lighting. No strong directional light, no cast shadows, no sunbeam, no warm or cool colour cast. The room must look unlit and neutral so lighting can be added later.
>
> The room is completely empty of people and animals. No characters. No person. No cat.

**Check before you accept it:** side-on and flat, no dramatic perspective. Lighting genuinely neutral, no sunbeam. Window, wall clock, desk timer, plant, fan and power line all clearly visible and unobstructed. No people or cat.

Regenerate until all six are true. Do not proceed on a nearly-right room.

---

## 2. The edit template

For every remaining asset. Upload `room-base.png`, paste the style block, then:

> Using the attached image as an exact reference, keep the identical camera angle, identical position and scale, identical line weight, and identical colour palette.
>
> **[CHANGE]**
>
> Show ONLY the described element, isolated, with everything else removed. Place it on a solid pure magenta `#FF00FF` background. The element must sit in exactly the same position and at exactly the same scale as it would in the reference room. Do not redraw the room. Do not add a border or a frame. Landscape 1536 x 1024.

Swap in the `[CHANGE]` line from the tables below.

---

## 3. Character, focus (5 files)

Same young developer throughout: mid-twenties, unremarkable, hoodie or worn t-shirt, slightly unkempt hair. Add the character descriptors to the style block for all of these.

| File | `[CHANGE]` |
|---|---|
| `pose-typing.png` | The developer sitting at the desk chair, seen from the side, both hands on the keyboard, leaning slightly toward the monitors, mouth closed, focused. |
| `pose-thinking.png` | The developer sitting at the desk chair, leaning back, one hand on his chin, looking up and away from the monitors, thinking. |
| `pose-head-desk.png` | The developer sitting at the desk chair, forehead resting flat on the desk beside the keyboard, arms hanging limp at his sides, defeated. |
| `typing-hands-b.png` | Only the developer's two hands and forearms in the typing position, with the fingers in a clearly different position from the reference typing pose, as the second frame of a two-frame typing loop. Nothing else. |
| `blink-overlay.png` | Only the developer's two closed eyes, drawn as simple curved black lines, positioned exactly where the open eyes sit in the typing pose. Nothing else, no face, no head outline. |

---

## 4. Character, break (5 files)

| File | `[CHANGE]` |
|---|---|
| `pose-at-window.png` | The developer standing at the window with his back three-quarters to us, hands in pockets, looking out. |
| `pose-with-cat.png` | The developer crouching on the rug, one hand extended to stroke a cat, smiling slightly. |
| `pose-on-bed.png` | The developer lying flat on his back on the bed, hands behind his head, staring at the ceiling. |
| `pose-stretching.png` | The developer standing beside the desk chair, both arms raised straight overhead in a big stretch, back arched, eyes closed. |
| `pose-coffee.png` | The developer standing beside the desk holding a coffee mug with both hands close to his chest, taking a sip. |

---

## 5. Cat (4 files)

One consistent cat throughout: a slightly grumpy short-haired tabby.

| File | `[CHANGE]` |
|---|---|
| `cat-sitting.png` | A short-haired tabby cat sitting upright on the rug, tail curled around its front paws, facing left. |
| `cat-walking.png` | The same tabby cat mid-stride walking across the rug, side on, tail raised. |
| `cat-asleep-on-desk.png` | The same tabby cat curled into a tight sleeping ball on the corner of the desk, eyes closed. |
| `cat-ears-b.png` | Only the tabby cat's head with both ears rotated back flat, as the second frame of an ear-twitch, positioned exactly as in the sitting pose. Nothing else. |

---

## 6. Movement props (14 files)

These get animated by code, so each must be cleanly isolated.

| File | `[CHANGE]` |
|---|---|
| `timer-body.png` | Only the round retro tomato-shaped kitchen timer on the desk, with its rotating dial face removed and left blank. |
| `timer-dial.png` | Only the circular rotating dial face of the kitchen timer, drawn as a flat disc with a single clear pointer mark, centred, with nothing else. |
| `timer-glow.png` | Only a soft warm orange glow shape surrounding the kitchen timer, on solid magenta, as an additive light layer. |
| `clock-face.png` | Only the round analogue wall clock with the hour markings but with both hands removed. |
| `clock-hand-hour.png` | Only the short hour hand of the wall clock, pointing straight up at twelve, with the pivot at the exact centre of the canvas. |
| `clock-hand-minute.png` | Only the long minute hand of the wall clock, pointing straight up at twelve, with the pivot at the exact centre of the canvas. |
| `clock-hand-second.png` | Only a thin second hand of the wall clock, pointing straight up at twelve, with the pivot at the exact centre of the canvas. |
| `curtain.png` | Only a simple cloth curtain hanging down the left side of the window, hanging straight and still. |
| `plant.png` | Only the drooping potted plant that stands beside the desk. |
| `fan-blades.png` | Only the ceiling fan blades, seen from below as a flat rotationally symmetric shape, with the centre hub at the exact centre of the canvas. |
| `phone.png` | Only a small smartphone lying face up flat on the desk, screen dark and off. |
| `phone-lit.png` | Only the same smartphone lying flat on the desk with its screen lit pale blue, identical position and angle. |
| `mug.png` | Only the stained coffee mug standing on the desk. |
| `steam.png` | Only three simple curling wisps of white steam rising, on solid magenta, positioned to sit directly above the coffee mug. |

---

## 7. Monitor screens (3 files)

| File | `[CHANGE]` |
|---|---|
| `screen-a.png` | Only the two monitor screens, showing abstract flat blocks of code-like coloured bars on a dark editor background. No readable text, no real letters. |
| `screen-b.png` | Only the two monitor screens, showing a clearly different arrangement of abstract code-like coloured bars from before. No readable text. |
| `screen-c.png` | Only the two monitor screens, showing a third clearly different arrangement, one screen mostly dark with a small chart shape. No readable text. |

---

## 8. Lighting and atmosphere (5 files)

| File | `[CHANGE]` |
|---|---|
| `monitor-glow.png` | Only a soft pale blue glow spilling forward from the monitor screens onto the desk, on solid magenta, as an additive light layer. |
| `lamp-glow.png` | Only a soft warm yellow cone of light cast downward by the desk lamp, on solid magenta, as an additive light layer. |
| `light-shaft.png` | Only a single soft angled beam of light entering through the window and falling across the floor, drawn as one flat semi-transparent pale shape, on solid magenta. |
| `view-day.png` | Only the view visible through the window: a plain pale daytime sky and flat silhouettes of low city buildings. No window frame, no power line. |
| `view-night.png` | The same view through the window at night: a deep navy sky and the same building silhouettes, now dark. A few small warm lit windows scattered across the buildings. No window frame, no power line. |

---

## 9. Presence (5 files)

The birds are people. Each one is someone focusing alongside you, so they must read clearly at small size.

| File | `[CHANGE]` |
|---|---|
| `power-line.png` | Only a single horizontal power line cable stretching straight across the window, with no birds on it. |
| `bird-perched.png` | Only one small bird perched in side profile facing left, drawn as a simple compact silhouette shape, centred on the canvas, large and clear. |
| `bird-flying.png` | Only the same bird with its wings spread mid-flight, side profile facing left, centred and at the same scale. |
| `bird-wingflick.png` | Only the same perched bird with one wing lifted slightly away from its body, side profile facing left, centred and at the same scale. |
| `city-windows-lit.png` | Only a scattered field of small warm yellow lit rectangular windows matching the positions of the buildings in the night view, on solid magenta, with the buildings themselves removed. |

---

## Per-asset check

Before saving any file:

- Same camera, same position, same scale as the master room
- Solid magenta background with no white fringe or drop shadow
- Line weight matches the master room
- Nothing extra crept in, no borders, no captions, no second copy of the element
- Filename exactly as listed, saved into `art/src/`

If an asset drifts in style, do not fix it by hand. Re-upload the master room and try again. Consistency across the set matters far more than any single asset being beautiful.

---

## Order to work in

1. `room-base.png`, until it is genuinely right
2. `pose-typing.png`, which proves the character and the isolation workflow in one go
3. The rest of section 3, then 4, then 5
4. Sections 6, 7, 8
5. Section 9 last

Send me `room-base.png` and `pose-typing.png` as soon as you have them. Two assets are enough for me to build and prove the whole layer pipeline, and I can tell you early if the isolation is coming out clean.
