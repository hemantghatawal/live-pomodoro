import { describe, expect, it } from 'vitest';
import { contrastRatio, hexToRgb, luminance } from './contrast';
import { PALETTE } from './palette';

const AA_BODY = 4.5;
const AA_LARGE = 3;

describe('contrast maths', () => {
  it('parses shorthand and full hex alike', () => {
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#f26b21')).toEqual({ r: 242, g: 107, b: 33 });
  });

  it('puts black and white at the theoretical extremes', () => {
    expect(luminance(hexToRgb('#000000'))).toBe(0);
    expect(luminance(hexToRgb('#ffffff'))).toBeCloseTo(1, 6);
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 4);
  });

  it('is symmetric', () => {
    expect(contrastRatio(PALETTE.ember, PALETTE.scrim)).toBeCloseTo(
      contrastRatio(PALETTE.scrim, PALETTE.ember),
      10,
    );
  });
});

describe('palette audit', () => {
  it('clears AA body contrast for the accent on the scrim', () => {
    expect(contrastRatio(PALETTE.ember, PALETTE.scrim)).toBeGreaterThanOrEqual(AA_BODY);
  });

  it('clears AA for every text tone on the scrim', () => {
    for (const tone of [PALETTE.text, PALETTE.muted] as const) {
      expect(contrastRatio(tone, PALETTE.scrim)).toBeGreaterThanOrEqual(AA_BODY);
    }
  });

  it('keeps the faint tone legible at large sizes at least', () => {
    expect(contrastRatio(PALETTE.faint, PALETTE.scrim)).toBeGreaterThanOrEqual(AA_LARGE);
  });

  it('keeps dark text off the accent, which would fail', () => {
    // Guards against anyone "improving" a CTA into ember-on-ember.
    expect(contrastRatio(PALETTE.ember, PALETTE.emberDim)).toBeLessThan(AA_BODY);
  });
});
