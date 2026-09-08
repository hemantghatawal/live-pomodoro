import { describe, expect, it } from 'vitest';
import { spriteFrame } from './spriteFrame';

describe('developer sprite timing', () => {
  it('smiles briefly during focus, then returns to work', () => {
    expect(spriteFrame(53399, 'focus')).not.toBe(3);
    expect(spriteFrame(53400, 'focus')).toBe(3);
    expect(spriteFrame(55799, 'focus')).toBe(3);
    expect(spriteFrame(55800, 'focus')).not.toBe(3);
    expect(spriteFrame(97000 * 9 + 54000, 'focus')).toBe(3);
    expect(spriteFrame(54000, 'focus', true)).toBe(0);
  });
  it('rests for the entire break, including blink and typing windows', () => {
    for (let t = 0; t < 17300; t += 60) expect(spriteFrame(t, 'break')).toBe(3);
  });
  it('holds the working frame in calm or reduced motion mode', () => {
    for (let t = 0; t < 17300; t += 60) expect(spriteFrame(t, 'focus', true)).toBe(0);
  });
  it('resolves to the same frame after a hidden tab resumes', () => {
    expect(spriteFrame(17300 * 500 + 4200, 'focus')).toBe(1);
    expect(spriteFrame(4280, 'focus')).toBe(4);
  });
  it('has sparse blinks, alternating work frames, and long still pauses', () => {
    expect(spriteFrame(4120, 'focus')).toBe(1);
    expect(spriteFrame(900, 'focus')).toBe(6);
    expect(spriteFrame(1080, 'focus')).toBe(5);
    expect(spriteFrame(15000, 'focus')).toBe(0);
  });
});
