import type { Phase } from './cycle';

/** Four cells: work, blink, alternate typing, rest. Timing is shared wall time. */
export function spriteFrame(now: number, phase: Phase, still = false): number {
  if (phase === 'break') return 3;
  if (still) return 0;
  // A brief contented glance between work bursts, shared by all viewers.
  // Reuse the resting smile instead of introducing a mismatched new drawing.
  const smileBeat = ((now % 97000) + 97000) % 97000;
  if (smileBeat >= 53400 && smileBeat < 55800) return 3;
  const beat = ((now % 17300) + 17300) % 17300;
  if ((beat >= 4120 && beat < 4280) || (beat >= 11270 && beat < 11430)) return 1;
  if ((beat > 700 && beat < 2800) || (beat > 6800 && beat < 9400)) {
    return Math.floor(beat / 180) % 2 === 0 ? 0 : 2;
  }
  return 0;
}
