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

export type Activity = 'stretching' | 'lean-back' | 'look-around';
export type FocusPose = 'typing' | 'thinking' | 'head-desk';

const POOLS: Record<DaylightStop, readonly Activity[]> = {
  night: ['lean-back', 'look-around', 'stretching'],
  dawn: ['stretching', 'look-around', 'lean-back'],
  day: ['stretching', 'lean-back', 'look-around'],
  golden: ['look-around', 'stretching', 'lean-back'],
  dusk: ['lean-back', 'stretching', 'look-around'],
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

/** Roughly how often the monitors change during a focus block. */
const SCREEN_SEGMENT_MS = 45_000;
const FOCUS_MS_LOCAL = 25 * 60 * 1000;

/**
 * Which monitor image to show. Rotates through the block so the work visibly
 * changes, and freezes during a break because he is not at the desk.
 */
export function screenFrame(
  cycleIndex: number,
  phase: 'focus' | 'break',
  progress: number,
): 'a' | 'b' | 'c' {
  const segments = Math.floor(FOCUS_MS_LOCAL / SCREEN_SEGMENT_MS);
  const segment =
    phase === 'break'
      ? segments - 1 // hold whatever was last on screen
      : Math.min(segments - 1, Math.floor(Math.max(0, progress) * segments));
  const pick = Math.floor(hash2(cycleIndex + 7919, segment) * 3);
  return (['a', 'b', 'c'] as const)[Math.min(2, pick)]!;
}
