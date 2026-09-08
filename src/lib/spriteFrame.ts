import type { Phase } from './cycle';

/** Base cells 0–3; new half-blink, typing and glance intermediates 4–7. */
export function spriteFrame(now: number, phase: Phase, still = false): number {
  if (phase === 'break') return 3;
  if (still) return 0;
  // A brief contented glance between work bursts, shared by all viewers.
  // Reuse the resting smile instead of introducing a mismatched new drawing.
  const smileBeat = ((now % 97000) + 97000) % 97000;
  if (smileBeat >= 53160 && smileBeat < 53400 || smileBeat >= 55800 && smileBeat < 56040) return 7;
  if (smileBeat >= 53400 && smileBeat < 55800) return 3;
  const beat = ((now % 17300) + 17300) % 17300;
  if ((beat >= 4060 && beat < 4120) || (beat >= 4280 && beat < 4340) || (beat >= 11210 && beat < 11270) || (beat >= 11430 && beat < 11490)) return 4;
  if ((beat >= 4120 && beat < 4280) || (beat >= 11270 && beat < 11430)) return 1;
  if ((beat > 700 && beat < 2800) || (beat > 6800 && beat < 9400)) {
    return [0, 5, 2, 6][Math.floor(beat / 120) % 4]!;
  }
  return 0;
}
