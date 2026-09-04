import { describe, expect, it } from 'vitest';
import { screenFrame } from './activities';

const FRAMES = ['a', 'b', 'c'];

describe('screenFrame', () => {
  it('always returns a real frame', () => {
    for (let p = 0; p <= 1; p += 0.02) {
      expect(FRAMES).toContain(screenFrame(12, 'focus', p));
    }
  });

  it('is deterministic, so every visitor sees the same screen', () => {
    expect(screenFrame(400, 'focus', 0.4)).toBe(screenFrame(400, 'focus', 0.4));
  });

  it('changes during a block rather than holding one image for 25 minutes', () => {
    const seen = new Set<string>();
    for (let p = 0; p < 1; p += 0.02) seen.add(screenFrame(3, 'focus', p));
    expect(seen.size).toBeGreaterThan(1);
  });

  it('freezes during a break, because he is not at the desk', () => {
    const held = screenFrame(3, 'break', 0);
    for (let p = 0; p <= 1; p += 0.1) {
      expect(screenFrame(3, 'break', p)).toBe(held);
    }
  });

  it('holds one image across a whole segment rather than flickering', () => {
    // 33 segments across the block, so a segment is about 3% of progress.
    expect(screenFrame(9, 'focus', 0.305)).toBe(screenFrame(9, 'focus', 0.32));
  });

  it('clamps progress outside 0..1', () => {
    expect(FRAMES).toContain(screenFrame(1, 'focus', -1));
    expect(FRAMES).toContain(screenFrame(1, 'focus', 2));
  });
});
