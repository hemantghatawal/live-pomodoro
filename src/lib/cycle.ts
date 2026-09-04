/**
 * The shared clock.
 *
 * Every visitor sees the identical state at the identical moment because the
 * cycle is derived from the Unix epoch, not from when anyone opened the page.
 *
 * A 30 minute cycle divides the epoch evenly and Unix time ignores leap
 * seconds, so blocks begin exactly on :00 and :30 UTC. Any timezone whose
 * offset is a whole or half hour inherits that, which is why he starts
 * focusing on the hour and the half hour almost everywhere.
 *
 * Nothing here accumulates. Every value is recomputed from wall clock, so a
 * throttled background tab or a sleeping laptop costs us nothing.
 */

export const CYCLE_MS = 30 * 60 * 1000;
export const FOCUS_MS = 25 * 60 * 1000;
export const BREAK_MS = CYCLE_MS - FOCUS_MS;

export type Phase = 'focus' | 'break';

export interface CycleState {
  /** Which half of the cycle we are in. */
  phase: Phase;
  /** Milliseconds until the phase flips. */
  remainingMs: number;
  /** 0..1 through the *current phase*, not the whole cycle. */
  progress: number;
  /** Global cycle number since the epoch. Identical for every visitor. */
  cycleIndex: number;
  /** Epoch ms at which the phase flips. */
  nextBoundary: number;
}

/** Modulo that stays positive for pre-epoch timestamps. */
function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export function cycleState(now: number): CycleState {
  const elapsed = mod(now, CYCLE_MS);
  const isFocus = elapsed < FOCUS_MS;

  const remainingMs = isFocus ? FOCUS_MS - elapsed : CYCLE_MS - elapsed;

  return {
    phase: isFocus ? 'focus' : 'break',
    remainingMs,
    progress: isFocus ? elapsed / FOCUS_MS : (elapsed - FOCUS_MS) / BREAK_MS,
    cycleIndex: Math.floor(now / CYCLE_MS),
    nextBoundary: now + remainingMs,
  };
}

/**
 * MM:SS, ceiling the seconds so a block reads 25:00 the instant it starts and
 * only shows 00:00 at the actual boundary.
 */
export function formatCountdown(remainingMs: number): string {
  const total = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** Epoch ms at which the next focus block begins. */
export function nextFocusStart(now: number): number {
  const { phase, nextBoundary } = cycleState(now);
  return phase === 'break' ? nextBoundary : nextBoundary + BREAK_MS;
}
