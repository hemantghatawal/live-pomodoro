import { describe, expect, it } from 'vitest';
import type { DaylightStop } from './daylight';
import {
  FOCUS_SEGMENTS,
  activityPool,
  breakActivity,
  focusPose,
  type Activity,
  type FocusPose,
} from './activities';

const STOPS: DaylightStop[] = ['night', 'dawn', 'day', 'golden', 'dusk'];
const ACTIVITIES: Activity[] = ['at-window', 'with-cat', 'on-bed', 'stretching', 'coffee'];
const POSES: FocusPose[] = ['typing', 'thinking', 'head-desk'];

describe('break pools', () => {
  it('gives every stop a non-empty pool of known activities', () => {
    for (const stop of STOPS) {
      const pool = activityPool(stop);
      expect(pool.length).toBeGreaterThan(0);
      for (const a of pool) expect(ACTIVITIES).toContain(a);
    }
  });

  it('never sends him outside or to bed at dawn', () => {
    // Waking up and immediately going back to bed would read as a bug.
    expect(activityPool('dawn')).not.toContain('on-bed');
  });

  it('has no duplicates within a pool', () => {
    for (const stop of STOPS) {
      const pool = activityPool(stop);
      expect(new Set(pool).size).toBe(pool.length);
    }
  });
});

describe('breakActivity', () => {
  it('is deterministic, which is what makes it shared', () => {
    expect(breakActivity(9_182_736, 'day')).toBe(breakActivity(9_182_736, 'day'));
  });

  it('walks the whole pool over consecutive cycles', () => {
    const pool = activityPool('day');
    const seen = new Set<Activity>();
    for (let i = 0; i < pool.length; i += 1) seen.add(breakActivity(i, 'day'));
    expect(seen.size).toBe(pool.length);
  });

  it('always returns a member of that stop pool', () => {
    for (const stop of STOPS) {
      for (let i = 0; i < 50; i += 1) {
        expect(activityPool(stop)).toContain(breakActivity(i, stop));
      }
    }
  });

  it('handles a negative cycle index without throwing', () => {
    expect(ACTIVITIES).toContain(breakActivity(-7, 'night'));
  });
});

describe('focusPose', () => {
  it('opens every block at the keyboard', () => {
    for (let i = 0; i < 25; i += 1) expect(focusPose(i, 0)).toBe('typing');
    expect(focusPose(3, 0.05)).toBe('typing');
  });

  it('holds one pose for a whole segment', () => {
    const seg = 1 / FOCUS_SEGMENTS;
    const a = focusPose(42, seg + 0.001);
    const b = focusPose(42, seg + seg * 0.98);
    expect(a).toBe(b);
  });

  it('is deterministic for a given cycle and progress', () => {
    expect(focusPose(1234, 0.42)).toBe(focusPose(1234, 0.42));
  });

  it('always returns a known pose across the full block', () => {
    for (let p = 0; p < 1; p += 0.01) expect(POSES).toContain(focusPose(77, p));
  });

  it('spends most of the block typing', () => {
    let typing = 0;
    let total = 0;
    for (let cycle = 0; cycle < 400; cycle += 1) {
      for (let seg = 0; seg < FOCUS_SEGMENTS; seg += 1) {
        if (focusPose(cycle, seg / FOCUS_SEGMENTS) === 'typing') typing += 1;
        total += 1;
      }
    }
    const ratio = typing / total;
    expect(ratio).toBeGreaterThan(0.7);
    expect(ratio).toBeLessThan(0.9);
  });

  it('uses head-desk sparingly', () => {
    let headDesk = 0;
    let total = 0;
    for (let cycle = 0; cycle < 400; cycle += 1) {
      for (let seg = 1; seg < FOCUS_SEGMENTS; seg += 1) {
        if (focusPose(cycle, seg / FOCUS_SEGMENTS) === 'head-desk') headDesk += 1;
        total += 1;
      }
    }
    expect(headDesk / total).toBeLessThan(0.12);
    expect(headDesk).toBeGreaterThan(0);
  });

  it('clamps progress outside 0..1', () => {
    expect(POSES).toContain(focusPose(5, -0.5));
    expect(POSES).toContain(focusPose(5, 1.5));
  });
});
