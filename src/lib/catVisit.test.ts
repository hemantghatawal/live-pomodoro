import { describe, it, expect } from 'vitest';
import { catVisit, CAT_VISIT_START, CAT_VISIT_DURATION } from './catVisit';
import { floorActivity, headphoneFrame, BACK_STRETCH_START } from './characterActivities';
import { FOCUS_MS, CYCLE_MS } from './cycle';
const at = (t: number) => catVisit(FOCUS_MS + CAT_VISIT_START + t);

describe('direct break activities', () => {
  it('plays with the cat immediately with no travel states', () => {
    expect(at(-1)).toBeNull();
    expect(at(0)).toEqual({ action: 'pet-cat', frame: 0 });
    expect(at(850)).toEqual({ action: 'pet-cat', frame: 1 });
    expect(at(CAT_VISIT_DURATION)).toBeNull();
  });
  it('keeps floor activities mutually exclusive and stationary', () => {
    const seen = new Set();
    const positions = new Map<string, string>();
    for (let t = 0; t < 300000; t += 100) {
      const state = floorActivity(FOCUS_MS + t);
      if (!state) continue;
      seen.add(state.action);
      const position = `${state.x}:${state.top}`;
      if (positions.has(state.action)) expect(position).toBe(positions.get(state.action));
      positions.set(state.action, position);
      expect(state.frame).toBeLessThan(state.columns * state.rows);
    }
    expect([...seen]).toEqual(['pet-cat', 'back-stretch']);
    expect(floorActivity(CYCLE_MS - 1)).toBeNull();
  });
  it('restores the same state after reload and suppresses exercise for Calm', () => {
    for (const t of [CAT_VISIT_START, BACK_STRETCH_START]) {
      expect(floorActivity(FOCUS_MS + t)).toEqual(floorActivity(FOCUS_MS + t + CYCLE_MS * 10));
      expect(floorActivity(FOCUS_MS + t, true)).toBeNull();
    }
  });
  it('adds thinking and headphone adjustment while preserving quiet work', () => {
    expect(headphoneFrame(1000, false, true)?.action).toBe('headphone-work');
    expect(headphoneFrame(23000, false, true)?.action).toBe('headphone-thinking');
    expect(headphoneFrame(46000, false, true)?.action).toBe('adjust-headphones');
    expect(headphoneFrame(46000, true, true)?.frame).toBe(0);
    expect(headphoneFrame(1000)).toBeNull();
  });
});
