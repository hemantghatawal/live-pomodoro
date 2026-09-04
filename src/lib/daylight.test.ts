import { describe, expect, it } from 'vitest';
import { daylightAt, fractionalHour, tintCss } from './daylight';

describe('fractionalHour', () => {
  it('folds minutes and seconds into the hour', () => {
    const d = new Date(2026, 8, 4, 14, 30, 36);
    expect(fractionalHour(d)).toBeCloseTo(14.51, 2);
  });
});

describe('named stops', () => {
  it('calls the small hours night', () => {
    expect(daylightAt(3).stop).toBe('night');
    expect(daylightAt(23).stop).toBe('night');
  });

  it('calls midday day', () => {
    expect(daylightAt(12).stop).toBe('day');
  });

  it('names dawn, golden and dusk somewhere in the day', () => {
    const stops = new Set<string>();
    for (let h = 0; h < 24; h += 0.25) stops.add(daylightAt(h).stop);
    expect(stops).toEqual(new Set(['night', 'dawn', 'day', 'golden', 'dusk']));
  });
});

describe('interpolation', () => {
  it('is brightest around midday and darkest in the small hours', () => {
    expect(daylightAt(12).level).toBe(1);
    expect(daylightAt(3).level).toBeLessThan(0.1);
  });

  it('interpolates across 17:00 rather than snapping', () => {
    // 17:00 sits midway between the 16:00 day anchor and the 18:00 golden one.
    const a = daylightAt(16).level;
    const b = daylightAt(18).level;
    const mid = daylightAt(17).level;
    expect(mid).toBeGreaterThan(Math.min(a, b));
    expect(mid).toBeLessThan(Math.max(a, b));
    expect(mid).toBeCloseTo((a + b) / 2, 6);
  });

  it('moves continuously with no jumps larger than a small step', () => {
    let prev = daylightAt(0).level;
    for (let h = 0.05; h <= 24; h += 0.05) {
      const next = daylightAt(h).level;
      expect(Math.abs(next - prev)).toBeLessThan(0.05);
      prev = next;
    }
  });

  it('wraps midnight without a discontinuity', () => {
    expect(Math.abs(daylightAt(23.99).level - daylightAt(0.01).level)).toBeLessThan(0.01);
  });
});

describe('ranges', () => {
  it('keeps every channel inside its bounds all day', () => {
    for (let h = 0; h < 24; h += 0.1) {
      const d = daylightAt(h);
      for (const v of [d.level, d.lamp, d.shaft, d.tint.a]) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      }
      for (const c of [d.tint.r, d.tint.g, d.tint.b]) {
        expect(c).toBeGreaterThanOrEqual(0);
        expect(c).toBeLessThanOrEqual(255);
      }
    }
  });

  it('turns the lamp up as the light goes down', () => {
    expect(daylightAt(3).lamp).toBeGreaterThan(daylightAt(12).lamp);
    expect(daylightAt(12).lamp).toBe(0);
  });
});

describe('hour normalisation', () => {
  it('wraps out-of-range hours instead of clamping', () => {
    expect(daylightAt(25).hour).toBeCloseTo(1, 10);
    expect(daylightAt(-1).hour).toBeCloseTo(23, 10);
    expect(daylightAt(-1).level).toBeCloseTo(daylightAt(23).level, 10);
  });
});

describe('tintCss', () => {
  it('emits a usable rgba string', () => {
    expect(tintCss({ r: 26, g: 35, b: 82, a: 0.66 })).toBe('rgba(26, 35, 82, 0.660)');
  });
});
