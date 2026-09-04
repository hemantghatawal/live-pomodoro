import { describe, expect, it } from 'vitest';
import { handAngles } from './clockHands';

const at = (h: number, m = 0, s = 0) => new Date(2026, 8, 4, h, m, s);

describe('handAngles', () => {
  it('points everything at twelve at noon', () => {
    expect(handAngles(at(12))).toEqual({ hour: 0, minute: 0, second: 0 });
  });

  it('puts the hour hand on the quarters', () => {
    expect(handAngles(at(3)).hour).toBe(90);
    expect(handAngles(at(6)).hour).toBe(180);
    expect(handAngles(at(9)).hour).toBe(270);
  });

  it('reads midnight the same as noon', () => {
    expect(handAngles(at(0)).hour).toBe(handAngles(at(12)).hour);
  });

  it('creeps the hour hand between hours rather than jumping', () => {
    // A real clock does not sit on 3 until 4 arrives.
    expect(handAngles(at(3, 30)).hour).toBe(105);
  });

  it('sweeps the minute hand with the seconds', () => {
    expect(handAngles(at(1, 30)).minute).toBe(180);
    expect(handAngles(at(1, 30, 30)).minute).toBeCloseTo(183, 6);
  });

  it('steps the second hand in whole ticks', () => {
    expect(handAngles(at(1, 1, 1)).second).toBe(6);
    expect(handAngles(at(1, 1, 30)).second).toBe(180);
    expect(handAngles(at(1, 1, 59)).second).toBe(354);
  });

  it('keeps every hand inside one full turn', () => {
    for (let h = 0; h < 24; h += 1) {
      for (const m of [0, 17, 43, 59]) {
        const a = handAngles(at(h, m, 59));
        for (const v of [a.hour, a.minute, a.second]) {
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThan(360);
        }
      }
    }
  });
});
