/**
 * What he is doing.
 *
 * Break activities are chosen by the global cycle index, so every visitor sees
 * the same break, but the pool is gated by the visitor's local daylight stop so
 * the choice is time-appropriate. Nobody goes outside at 3am.
 *
 * Focus poses rotate within a block rather than holding one pose for 25
 * minutes, weighted heavily toward typing since that is where he spends most
 * of his time.
 */

import type { DaylightStop } from './daylight';

export type Activity = 'at-window' | 'with-cat' | 'on-bed' | 'stretching' | 'coffee';
export type FocusPose = 'typing' | 'thinking' | 'head-desk';

const POOLS: Record<DaylightStop, readonly Activity[]> = {
  night: ['with-cat', 'on-bed', 'coffee', 'at-window'],
  dawn: ['coffee', 'at-window', 'stretching', 'with-cat'],
  day: ['at-window', 'with-cat', 'stretching', 'coffee', 'on-bed'],
  golden: ['at-window', 'coffee', 'with-cat', 'stretching'],
  dusk: ['at-window', 'with-cat', 'coffee', 'on-bed'],
};

/** Deterministic, seeded, and stable across reloads and machines. */
function hash2(a: number, b: number): number {
  let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b);
  h = Math.imul(h ^ (b + 0x165667b1), 0xc2b2ae35);
  h ^= h >>> 15;
  return (h >>> 0) / 0x100000000;
}

export function breakActivity(cycleIndex: number, stop: DaylightStop): Activity {
  const pool = POOLS[stop];
  const index = ((cycleIndex % pool.length) + pool.length) % pool.length;
  return pool[index]!;
}

/** A focus block is split into this many pose segments, roughly 2.5 min each. */
export const FOCUS_SEGMENTS = 10;

export function focusPose(cycleIndex: number, progress: number): FocusPose {
  const clamped = Math.min(0.999999, Math.max(0, progress));
  const segment = Math.floor(clamped * FOCUS_SEGMENTS);

  // He always sits down and starts working, so a block opens decisively.
  if (segment === 0) return 'typing';

  const r = hash2(cycleIndex, segment);
  if (r < 0.72) return 'typing';
  if (r < 0.94) return 'thinking';
  return 'head-desk';
}

export function activityPool(stop: DaylightStop): readonly Activity[] {
  return POOLS[stop];
}
