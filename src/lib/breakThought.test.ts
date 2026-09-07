import { describe, expect, it } from 'vitest';
import { breakThought } from './breakThought';
import { FOCUS_MS } from './cycle';

describe('break thoughts', () => {
  it('keeps focus, the opening stretch and Calm free of thought bubbles', () => {
    expect(breakThought(FOCUS_MS + 16000, 'focus')).toBeNull();
    expect(breakThought(FOCUS_MS, 'break')).toBeNull();
    expect(breakThought(FOCUS_MS + 16000, 'break', true)).toBeNull();
  });
  it('alternates labeled ideas and room facts with long quiet gaps', () => {
    expect(breakThought(FOCUS_MS + 16000, 'break')?.kind).toBe('Idea');
    expect(breakThought(FOCUS_MS + 28000, 'break')).toBeNull();
    expect(breakThought(FOCUS_MS + 86000, 'break')?.kind).toBe('Room fact');
    expect(breakThought(FOCUS_MS + 299999, 'break')).toBeNull();
  });
  it('is deterministic and rotates ideas across cycles', () => {
    const time = FOCUS_MS + 16000;
    expect(breakThought(time, 'break')).toEqual(breakThought(time, 'break'));
    expect(breakThought(time + 1800000, 'break')?.text).not.toBe(breakThought(time, 'break')?.text);
  });
});
