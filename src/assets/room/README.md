# Room art

Drop image files here. The filename must match a slot id from `src/lib/assets.ts`,
with any of these extensions: `.png` `.webp` `.avif` `.jpg`

```
room-base.png
pose-typing.png
cat-sitting.png
```

That is the entire process. Files are discovered at build time, so a slot with
no file simply does not render and the rest of the room carries on. There is no
registration step and nothing to wire up.

Run `npm run dev` and the asset panel in the corner lists every slot and whether
it is filled.

Assets with a magenta `#FF00FF` background need keying first:

```bash
npm run art
```

That reads `art/src/` and writes keyed, optimised files into this folder.
