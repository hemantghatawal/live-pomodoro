#!/usr/bin/env node
/**
 * Art pipeline: art/src/*.png  ->  src/assets/room/*.webp
 *
 * ChatGPT will not reliably produce a transparent background; asking for alpha
 * bakes white or a checkerboard into the pixels. So isolated layers are drawn
 * on solid magenta #FF00FF and keyed out here. Magenta is used because nothing
 * in the room palette is anywhere near it, so nothing real gets eaten.
 *
 * Full-frame images (the room, the window views) need no keying and are
 * detected automatically: if the edges are not magenta, it is left opaque.
 *
 *   npm run art
 */

import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'art/src';
const OUT = 'src/assets/room';

/** How far from pure magenta still counts as background. */
const TOLERANCE = 60;
/** Fraction of edge pixels that must be magenta to treat a file as keyed. */
const EDGE_THRESHOLD = 0.6;

const isMagenta = (r, g, b) =>
  r > 255 - TOLERANCE && b > 255 - TOLERANCE && g < TOLERANCE;

function edgeIsMagenta(data, width, height, channels) {
  let magenta = 0;
  let total = 0;
  const at = (x, y) => {
    const i = (y * width + x) * channels;
    return [data[i], data[i + 1], data[i + 2]];
  };
  const step = Math.max(1, Math.floor(width / 200));
  for (let x = 0; x < width; x += step) {
    for (const y of [0, height - 1]) {
      const [r, g, b] = at(x, y);
      if (isMagenta(r, g, b)) magenta += 1;
      total += 1;
    }
  }
  for (let y = 0; y < height; y += step) {
    for (const x of [0, width - 1]) {
      const [r, g, b] = at(x, y);
      if (isMagenta(r, g, b)) magenta += 1;
      total += 1;
    }
  }
  return total > 0 && magenta / total >= EDGE_THRESHOLD;
}

function key(data, width, height, channels) {
  const out = Buffer.alloc(width * height * 4);
  for (let p = 0; p < width * height; p += 1) {
    const i = p * channels;
    const o = p * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (isMagenta(r, g, b)) {
      out[o] = out[o + 1] = out[o + 2] = out[o + 3] = 0;
      continue;
    }

    out[o] = r;
    out[o + 1] = g;
    out[o + 2] = b;
    // Soften the halo the model leaves where the subject meets the backdrop.
    const halo = (r + b) / 2 - g;
    const sourceAlpha = channels === 4 ? data[i + 3] : 255;
    out[o + 3] = Math.min(sourceAlpha, halo > TOLERANCE ? Math.max(0, 255 - (halo - TOLERANCE) * 4) : 255);
  }
  return out;
}

/** Register generated sprite cells without rescaling the character between frames. */
async function registerSprites(pipeline, width, height) {
  if (width !== 1536 || height !== 1024) throw new Error('Developer sheet must be 1536x1024 (2x2 cells).');
  const rgba = await pipeline.ensureAlpha().raw().toBuffer();
  const cells = [];
  for (let frame = 0; frame < 4; frame++) {
    const left = (frame % 2) * 768;
    const top = Math.floor(frame / 2) * 512;
    let minX = 768, maxX = -1, minY = 512, maxY = -1;
    for (let y = 0; y < 512; y++) for (let x = 0; x < 768; x++) {
      if (rgba[((top + y) * width + left + x) * 4 + 3] < 128) continue;
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
    if (maxX < 0 || maxY - minY > 470 || minX === 0 || maxX === 767) {
      throw new Error(`Sprite ${frame}: missing alpha or artwork touches a cell edge.`);
    }
    const w = maxX - minX + 1;
    const h = maxY - minY + 1;
    const input = await sharp(rgba, { raw: { width, height, channels: 4 } })
      .extract({ left: left + minX, top: top + minY, width: w, height: h }).png().toBuffer();
    cells.push({ input, left: left + Math.round((768 - w) / 2), top: top + 40 });
    console.log(`  sprite ${frame}: ${w}x${h}, registered at head y=40, centre x=384`);
  }
  return sharp({ create: { width, height, channels: 4, background: '#00000000' } }).composite(cells);
}

const files = await readdir(SRC).catch(() => {
  console.error(`No ${SRC} directory. Create it and put your exports there.`);
  process.exit(1);
});

const images = files.filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
if (images.length === 0) {
  console.log(`Nothing to do. Put exports in ${SRC}/`);
  process.exit(0);
}

await mkdir(OUT, { recursive: true });

for (const file of images) {
  const id = file.replace(/\.[^.]+$/, '');
  const src = path.join(SRC, file);
  const dest = path.join(OUT, `${id}.webp`);

  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const keyed = edgeIsMagenta(data, width, height, channels);

  let pipeline = keyed
    ? sharp(key(data, width, height, channels), { raw: { width, height, channels: 4 } })
    : sharp(src);

  if (id === 'developer-sprites') pipeline = await registerSprites(pipeline, width, height);

  const { size } = await pipeline.webp({ quality: 90, effort: 5 }).toFile(dest);

  console.log(
    `${id.padEnd(24)} ${keyed ? 'keyed ' : 'opaque'}  ${width}x${height}  ${(size / 1024).toFixed(0)}kB`,
  );
}

console.log(`\nDone. ${images.length} file(s) written to ${OUT}/`);
