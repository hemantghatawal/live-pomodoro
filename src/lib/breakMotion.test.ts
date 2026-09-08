import { describe, expect, it } from 'vitest';
import { breakFrame, atlasFrame } from './breakMotion';
import { FOCUS_MS, CYCLE_MS } from './cycle';
import type { Activity } from './activities';

const activities: Activity[] = ['stretching', 'lean-back', 'look-around'];

describe('break movement sequence', () => {
  it('plays intermediate poses in reverse when lowering the arms', () => {
    const cell = (ms: number) => { const p = breakFrame(FOCUS_MS + ms, 'stretching'); return atlasFrame(p.sheet, p.frame); };
    expect([600, 820, 1040, 1300, 5800, 6060, 6280, 6500].map(cell))
      .toEqual([16, 17, 4, 5, 18, 10, 9, 8]);
    expect(cell(48000)).toBe(11);
  });
  it('raises arms before stretching, lowers them, and rests', () => {
    for (const activity of activities) {
      expect(breakFrame(FOCUS_MS + 600, activity).action).toBe('raise-arms');
      expect(breakFrame(FOCUS_MS + 1300, activity).action).toBe('stretch');
    }
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
      expect(seen.size).toBe(6);
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
