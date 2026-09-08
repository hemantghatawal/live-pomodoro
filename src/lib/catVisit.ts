import { BREAK_MS } from './cycle';

export const CAT_VISIT_START = 105_000;
export const CAT_VISIT_DURATION = 18_000;
/** Direct cut to cat play, with no standing, walking or return path. */
export function catVisit(now: number, still = false) {
  const t = ((now % BREAK_MS) + BREAK_MS) % BREAK_MS - CAT_VISIT_START;
  if (still || t < 0 || t >= CAT_VISIT_DURATION) return null;
  return { frame: [0, 2, 1, 3][Math.floor(t / 425) % 4]!, action: 'pet-cat' as const };
}
