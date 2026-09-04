import { describe, expect, it } from 'vitest';
import {
  BREAK_MS,
  CYCLE_MS,
  FOCUS_MS,
  cycleState,
  formatCountdown,
  nextFocusStart,
} from './cycle';

/** 2026-09-04T12:00:00.000Z, exactly on a cycle boundary. */
const NOON = Date.UTC(2026, 8, 4, 12, 0, 0, 0);

describe('cycle boundaries', () => {
  it('starts a focus block exactly on a UTC :00', () => {
    const s = cycleState(NOON);
    expect(s.phase).toBe('focus');
    expect(s.remainingMs).toBe(FOCUS_MS);
    expect(s.progress).toBe(0);
    expect(formatCountdown(s.remainingMs)).toBe('25:00');
  });

  it('starts a focus block exactly on a UTC :30', () => {
    const s = cycleState(NOON + 30 * 60_000);
    expect(s.phase).toBe('focus');
    expect(formatCountdown(s.remainingMs)).toBe('25:00');
  });

  it('is still focus 1ms before the break', () => {
    const s = cycleState(NOON + FOCUS_MS - 1);
    expect(s.phase).toBe('focus');
    expect(s.remainingMs).toBe(1);
  });

  it('flips to break exactly at 25:00 elapsed', () => {
    const s = cycleState(NOON + FOCUS_MS);
    expect(s.phase).toBe('break');
    expect(s.remainingMs).toBe(BREAK_MS);
    expect(s.progress).toBe(0);
    expect(formatCountdown(s.remainingMs)).toBe('05:00');
  });

  it('is still break 1ms before the cycle rolls', () => {
    const s = cycleState(NOON + CYCLE_MS - 1);
    expect(s.phase).toBe('break');
    expect(s.remainingMs).toBe(1);
  });

  it('rolls into the next focus block at 30:00 elapsed', () => {
    const s = cycleState(NOON + CYCLE_MS);
    expect(s.phase).toBe('focus');
    expect(s.remainingMs).toBe(FOCUS_MS);
  });
});

describe('progress', () => {
  it('reaches the midpoint of focus at 12:30 elapsed', () => {
    expect(cycleState(NOON + FOCUS_MS / 2).progress).toBeCloseTo(0.5, 10);
  });

  it('reaches the midpoint of break at 2:30 into it', () => {
    expect(cycleState(NOON + FOCUS_MS + BREAK_MS / 2).progress).toBeCloseTo(0.5, 10);
  });

  it('never leaves 0..1', () => {
    for (let ms = 0; ms < CYCLE_MS; ms += 7_919) {
      const p = cycleState(NOON + ms).progress;
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThan(1);
    }
  });
});

describe('cycleIndex', () => {
  it('is stable for the whole cycle and increments once per 30 minutes', () => {
    const base = cycleState(NOON).cycleIndex;
    expect(cycleState(NOON + CYCLE_MS - 1).cycleIndex).toBe(base);
    expect(cycleState(NOON + CYCLE_MS).cycleIndex).toBe(base + 1);
  });

  it('is identical for two observers at the same instant', () => {
    // The whole premise: no per-visitor state exists to diverge.
    expect(cycleState(NOON + 12_345).cycleIndex).toBe(cycleState(NOON + 12_345).cycleIndex);
  });

  it('gives 48 cycles per day', () => {
    const day = 24 * 60 * 60 * 1000;
    expect(cycleState(NOON + day).cycleIndex - cycleState(NOON).cycleIndex).toBe(48);
  });
});

describe('timezone alignment', () => {
  // The *phase flip* lands on :25 and :55. The thing that lands on :00 and :30
  // is the start of a focus block, which is what the copy actually promises.
  const focusStart = nextFocusStart(NOON + 61_000);

  function localMinuteAt(offsetMinutes: number): number {
    return new Date(focusStart + offsetMinutes * 60_000).getUTCMinutes();
  }

  it('flips focus to break on :25 and :55 UTC', () => {
    expect([25, 55]).toContain(
      new Date(cycleState(NOON + 61_000).nextBoundary).getUTCMinutes(),
    );
  });

  it('starts focus blocks on :00 or :30 for whole-hour offsets', () => {
    expect([0, 30]).toContain(localMinuteAt(0)); // UTC
    expect([0, 30]).toContain(localMinuteAt(-8 * 60)); // US Pacific
    expect([0, 30]).toContain(localMinuteAt(9 * 60)); // Japan
  });

  it('starts focus blocks on :00 or :30 for half-hour offsets', () => {
    expect([0, 30]).toContain(localMinuteAt(5 * 60 + 30)); // India
  });

  it('starts focus blocks on :15 or :45 for the 45-minute offsets', () => {
    // Nepal +05:45 and Chatham +12:45 are the reason rendered copy must never
    // hardcode "on the hour" and should derive the next block from the clock.
    expect([15, 45]).toContain(localMinuteAt(5 * 60 + 45));
    expect([15, 45]).toContain(localMinuteAt(12 * 60 + 45));
  });
});

describe('formatCountdown', () => {
  it('shows a full block at the start', () => {
    expect(formatCountdown(FOCUS_MS)).toBe('25:00');
  });

  it('ceilings partial seconds so it never shows 00:00 early', () => {
    expect(formatCountdown(1)).toBe('00:01');
    expect(formatCountdown(999)).toBe('00:01');
    expect(formatCountdown(1000)).toBe('00:01');
    expect(formatCountdown(1001)).toBe('00:02');
  });

  it('shows 00:00 only at zero', () => {
    expect(formatCountdown(0)).toBe('00:00');
  });

  it('clamps negatives rather than rendering nonsense', () => {
    expect(formatCountdown(-5000)).toBe('00:00');
  });

  it('zero-pads both fields', () => {
    expect(formatCountdown(65_000)).toBe('01:05');
  });
});

describe('nextFocusStart', () => {
  it('is the end of the break when we are on a break', () => {
    const now = NOON + FOCUS_MS + 60_000;
    expect(nextFocusStart(now)).toBe(NOON + CYCLE_MS);
  });

  it('skips the upcoming break when we are focusing', () => {
    expect(nextFocusStart(NOON + 60_000)).toBe(NOON + CYCLE_MS);
  });
});

describe('pre-epoch safety', () => {
  it('does not return negative remaining time before 1970', () => {
    const s = cycleState(-CYCLE_MS * 3 - 5_000);
    expect(s.remainingMs).toBeGreaterThan(0);
    expect(s.progress).toBeGreaterThanOrEqual(0);
  });
});
