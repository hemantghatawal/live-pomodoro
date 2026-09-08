# Approved room and sprite workflow

## Direction approved on 2026-09-07

Master: `src/room-base.png`, copied unchanged from `previews/room-base-opposite-cartoon-v2.png`. Preserve every preview. Camera looks from behind the monitors toward the seated developer's face. Clean Rick-and-Morty-inspired cartoon treatment, original character. This document supersedes older side-on camera and asset-count assumptions in PLAN.md and ART_PROMPTS.md.

## Working first slice

- Room and developer share one 1536x1024 coordinate space, scaled together to cover the viewport.
- `src/developer-sprites.png` is a 1536x1024 source sheet, four 768x512 cells: work, blink, alternate typing, rest.
- `npm run art` removes magenta, registers each character silhouette to the same head height and horizontal center, and exports WebP. Registration corrects translation only, never stretches one frame to match another. Inspect the result visually; registration cannot repair a differently drawn face.
- `DeveloperSprite.tsx` swaps cells using shared wall-clock timing. Work has short typing bursts and two sparse blinks per 17.3 seconds; breaks use the resting cell. Breathing is a tiny CSS translation.
- During focus, the resting smile appears for 2.4 seconds every 97 seconds as a brief contented glance. Calm and reduced motion suppress this occasional smile along with other frame animation.
- Calm and reduced motion keep the phase-appropriate static frame. Hidden tabs stop the sprite interval; resuming resolves from current wall time.
- The foreground uses the original room image clipped along the monitor tops. These are exact source pixels, so there is no redraw mismatch or extra download. The mask currently covers the seated developer's area; extend it deliberately for future travelling poses.
- Day/night uses the existing local-time tint plus a restrained lamp light overlay. The dev art panel previews day/night and work/rest without altering the shared countdown.

## Rules for the next assets

1. Reference the approved room AND the approved character. Never independently re-prompt the room for each pose.
2. Use sprite frames for changes of shape: blinking, fingers, expression, turns, stretching, cat gait. Keep the same scale, palette, line weight, and anchor across cells.
3. Use CSS for subtle translation, opacity and sway. Do not rotate the baked ceiling fan or redraw the entire room to animate a prop.
4. Any moving prop must first be removed from a new version of the static background and extracted as a layer. Preserve the master and previews. Otherwise the static copy remains visible beneath the moving one.
5. Inspect a sample before producing a large sheet. Then check keyed transparency, registration, foreground occlusion, real browser playback, mobile crop, Calm, reduced motion, and phase changes.
6. Prefer true alpha when available, but verify the actual channels. The first generated character had a baked checkerboard despite the transparency request; it is a reference only. The installed sheet uses magenta keying and real alpha.
7. Persist exact prompts and source images. Generated media uses the built-in image generation tool; preprocessing and deterministic sheet assembly use the existing Sharp pipeline.

## Revised scope

The window is behind the camera. Keep this approved composition. For a future connected presence feature, use a small honest text count near the phase label; hide it when unavailable. Birds, exterior city layers, visible screen contents and wall-clock sprites are deferred for this camera. Do not fabricate presence or add a new window just to preserve the old plan.

The room now rotates the fan, sways the plant, switches two sleeping-cat poses, emits mug steam and changes a small desk-timer glow by phase. Independent cat walking, other destinations and the presence backend remain future work. A walking-and-petting visit is now implemented.

## Break animation update

`developer-break-sprites.png` adds four movement cells: hands raised beside ears, hands-behind-head stretch, look left, look right. Every break starts by raising arms, stretching, then lowering them. The sequence includes long resting gaps, repeats gentle movement bouts, and settles for the final seven seconds before focus. All production timing derives from absolute clock time. Supported activities are now stretching, lean-back and look-around; the previous window/cat/bed/coffee activity pool is no longer scheduled.

Break sheet alignment uses the waist center horizontally, so wide elbows do not shift the torso. Source pixels are keyed and registered by `npm run art`. The built-in image generation prompt is saved in `previews/developer-break-sprites-prompt.md`.

Four 12-second thought bubbles appear during a break, starting at seconds 16, 86, 156 and 226. They alternate original product ideas and facts directly grounded in the app's clock/lighting behavior. No claims of market demand or health benefits. Calm hides the thoughts. They are readable to assistive technology but do not interrupt with live announcements.

The development panel can play a break from its beginning without changing the actual timer, or hold individual movement frames for visual inspection. Closing the panel restores the live room.

## Validation

- Browser inspected at desktop and a narrow portrait viewport: character/monitor occlusion, transparent edges and countdown clearance.
- Calm toggled in the real UI; static-frame state confirmed. Night/rest preview confirmed frame 3 and darker lighting. Closing preview restores real phase and local light.
- Unit tests cover sprite timing, break/rest behavior, calm mode, resume determinism, and excluding a spritesheet from the full-room layer stack.

## Smoother movement and room life

`developer-transition-sprites.png` supplies neutral rest, two arm-rise intermediates and a chin-resting thinking pose. The sequence reverses the intermediate frames when lowering arms. All three registered sheets are assembled into `developer-atlas.webp` (4 columns × 3 rows), decoded before display. Typing frame 2 reuses the base head and shoulders to prevent jitter.

`room-clean.png` removes only the baked fan blades and foreground plant for independent compositing. The original room remains the fallback. `room-props-sheet.png` supplies fan, plant and two sleeping-cat frames. RoomLife pauses all loops for Calm, reduced motion or hidden tabs. Exact prompts and actual source dimensions are recorded in [ANIMATION_ASSETS.md](ANIMATION_ASSETS.md).

## Cat visit

The eight-frame `developer-visit-sprites.png` sheet uses 384×512 cells. The art pipeline keys magenta, aligns feet, registers walking heads and the paired petting poses, and removes a small adjacent-cell spill. Runtime uses a separate predecoded sheet and an absolute 28-second route starting 105 seconds into the break. Stand/sit transitions blend briefly while rising/lowering; the return mirrors the walking frames. The original room background is preserved. See [the exact generation prompt](previews/developer-visit-prompt.md).

## Current activity revision — September 8

Walking is removed from the runtime. The old visit source is retained only as the source for `developer-cat-sprites.webp`, containing the two petting poses. `catVisit.ts` now schedules a direct, stationary interaction. Earlier walking descriptions in this document are historical.

`developer-exercise-sprites.png` supplies two back-stretch poses. Its generated standing figures extend below the requested row boundary, so the pipeline splits at the empty y570 gutter and registers the feet. Side-view pushup samples in this source were rejected for room placement; `developer-pushup-sprites.png` supplies four front-facing pushup frames fitted to the narrow floor beside the bed. `developer-headphone-sprites.png` supplies working, blinking, thinking and earcup-adjusting poses. All files are keyed and shipped as WebP assets. Original room art stays unchanged.

Exact built-in generation prompts: [exercise](previews/exercise-prompt.md), [headphones](previews/headphones-prompt.md). Sources are in `art/src/`; runtime assets are in `src/assets/room/`. The development menu can preview each activity independently. Screens remain deferred.

## Front-facing pushups removed

The front-facing pushup source and runtime sheet, dedicated prompt, preprocessing and playback code have been removed. Earlier pushup descriptions above are historical. Back stretches, direct cat play and headphone work remain active.

## Expanded frames — September 8

Added 16 generated poses: four work intermediates, four headphone intermediates, four seated-break intermediates, two petting intermediates and two standing back-stretch intermediates. Seated art is now one predecoded 4-column × 7-row atlas (28 frames). Regular work and headphone work each use eight poses. The seated break uses twelve poses. The arm rise has seven steps at 100ms each; lowering reverses those intermediate poses. Blinks close and reopen through a half-closed frame. Typing intermediates reuse the approved upper-body pixels to reduce drift. The headphone thinking/adjustment gestures have entry and return poses.

Cat play and back stretches each use four frames in separate horizontal sheets, registered to the original floor positions. Walking and pushups stay removed. Original sources are retained.

Exact built-in image-generation prompts: [work](previews/work-inbetweens-prompt.md), [headphones](previews/phones-inbetweens-prompt.md), [seated break](previews/break-inbetweens-prompt.md), [floor activities](previews/floor-inbetweens-prompt.md). Sources: `art/src/developer-{work,phones,break}-inbetweens.png` and `art/src/developer-floor-extras.png`. Runtime: `src/assets/room/developer-atlas.webp`, `developer-cat-smooth.webp`, `developer-exercise-smooth.webp`. Build with `npm run art`.
