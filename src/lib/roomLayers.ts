/**
 * Which layers the room shows right now.
 *
 * Kept pure and separate from asset discovery so it can be tested without a
 * bundler, and so the fallback behaviour that carries a half-finished asset set
 * is verified rather than assumed.
 */

import type { Slot } from './assets';
import type { Activity, FocusPose } from './activities';
import type { Phase } from './cycle';

export interface RoomState {
  phase: Phase;
  pose: FocusPose;
  activity: Activity;
  cycleIndex: number;
  /** 0..1 */
  daylight: number;
}

/** Which variant each group would ideally show. */
export function preferredVariants(s: RoomState): Record<string, string> {
  return {
    view: s.daylight < 0.3 ? 'view-night' : 'view-day',
    // Focus poses and break activities share the pose- prefix by design.
    pose: s.phase === 'focus' ? `pose-${s.pose}` : `pose-${s.activity}`,
    cat: s.daylight < 0.25 ? 'cat-asleep-on-desk' : 'cat-sitting',
    screen: `screen-${['a', 'b', 'c'][s.cycleIndex % 3]}`,
    phone: 'phone',
  };
}

export function chooseLayers(
  slots: readonly Slot[],
  has: (id: string) => boolean,
  state: RoomState,
): Slot[] {
  const preferred = preferredVariants(state);

  const chosen = new Map<string, string | null>();
  for (const [group, want] of Object.entries(preferred)) {
    if (has(want)) {
      chosen.set(group, want);
      continue;
    }
    // Fall back to any sibling that exists, so one character image can stand in
    // for all eight poses until the rest are drawn.
    const sibling = slots.find((s) => s.variantOf === group && has(s.id));
    chosen.set(group, sibling?.id ?? null);
  }

  return slots
    .filter((slot) => {
      if (!has(slot.id)) return false;
      if (!slot.variantOf) return true;
      return chosen.get(slot.variantOf) === slot.id;
    })
    .sort((a, b) => a.z - b.z);
}
