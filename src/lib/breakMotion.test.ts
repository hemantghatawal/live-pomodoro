import { describe, expect, it } from 'vitest';
import { breakFrame } from './breakMotion';
import { FOCUS_MS, CYCLE_MS } from './cycle';
import type { Activity } from './activities';

const activities: Activity[] = ['stretching', 'lean-back', 'look-around'];

describe('break movement sequence', () => {
  it('raises arms before stretching, lowers them, and rests', () => {
    const action = (ms: number) => breakFrame(FOCUS_MS + ms, 'stretching').action;
    expect(action(0)).toBe('rest');
    expect(action(600)).toBe('raise-arms');
    expect(action(1300)).toBe('stretch');
    expect(action(5800)).toBe('raise-arms');
    expect(action(6500)).toBe('rest');
    expect(action(23000)).toBe('look-left');
    expect(action(27600)).toBe('look-right');
  });
  it('shows all movement types during each complete break without constant motion', () => {
    for (const activity of activities) {
      const seen = new Set<string>();
      let resting = 0;
      for (let ms = 0; ms < 300000; ms += 100) {
        const state = breakFrame(FOCUS_MS + ms, activity);
        seen.add(state.action);
        if (state.action === 'rest') resting++;
        expect(state.frame).toBeGreaterThanOrEqual(0);
        expect(state.frame).toBeLessThan(4);
      }
      expect(seen.size).toBe(5);
      expect(resting / 3000).toBeGreaterThan(0.7);
    }
  });
  it('freezes in Calm/reduced motion and settles before focus starts', () => {
    for (const activity of activities) {
      expect(breakFrame(FOCUS_MS + 2000, activity, true).action).toBe('rest');
      expect(breakFrame(CYCLE_MS - 1, activity).action).toBe('rest');
    }
  });
  it('resolves the same position after reload, sleep, or a later cycle', () => {
    expect(breakFrame(FOCUS_MS + 2000, 'stretching')).toEqual(
      breakFrame(FOCUS_MS + CYCLE_MS * 10 + 2000, 'stretching'));
  });
});
