import { BREAK_MS } from './cycle';
import type { Activity } from './activities';

export interface BreakFrame {
  sheet: 'developer-sprites' | 'developer-break-sprites' | 'developer-transition-sprites' | 'developer-break-inbetweens';
  frame: number;
  action: 'rest' | 'raise-arms' | 'stretch' | 'look-left' | 'look-right' | 'thinking';
}

const REST: BreakFrame = { sheet: 'developer-transition-sprites', frame: 0, action: 'rest' };
const pose = (frame: number, action: BreakFrame['action']): BreakFrame =>
  ({ sheet: 'developer-break-sprites', frame, action });
const transition = (frame: number, action: BreakFrame['action']): BreakFrame =>
  ({ sheet: 'developer-transition-sprites', frame, action });

/** Absolute break time, never accumulated since the page opened. */
export function breakFrame(now: number, activity: Activity, still = false): BreakFrame {
  if (still) return REST;
  const elapsed = ((now % BREAK_MS) + BREAK_MS) % BREAK_MS;
  // Settle before the return to work. Short actions are separated by long rests.
  if (elapsed >= BREAK_MS - 7000) return REST;
  const beat = elapsed % 70000;
  // Every break opens with the approved stretch, irrespective of activity pool.
  const start = 600;
  const hold = activity === 'lean-back' ? 8500 : 4500;
  const extra = (frame: number): BreakFrame => ({ sheet: 'developer-break-inbetweens', frame, action: 'raise-arms' });
  const rise = [extra(0), transition(1, 'raise-arms'), extra(1), transition(2, 'raise-arms'), pose(0, 'raise-arms'), extra(2), pose(1, 'raise-arms')];
  if (beat >= start && beat < start + 700) return rise[Math.floor((beat - start) / 100)]!;
  if (beat >= start + 700 && beat < start + 700 + hold) return pose(1, 'stretch');
  const lower = start + 700 + hold;
  const fall = [...rise.slice(0, -1)].reverse().concat(REST);
  if (beat >= lower && beat < lower + 700) return fall[Math.floor((beat - lower) / 100)]!;
  const glance = activity === 'look-around' ? 18000 : 23000;
  if (beat >= glance && beat < glance + 2600) return beat < glance + 200 || beat >= glance + 2400
    ? { sheet: 'developer-break-inbetweens', frame: 3, action: 'look-left' } : pose(2, 'look-left');
  if (beat >= glance + 4600 && beat < glance + 7200) return pose(3, 'look-right');
  if (beat >= 47000 && beat < 51000) return transition(3, 'thinking');
  return REST;
}

/** One predecoded atlas avoids flashes when a sequence crosses source sheets. */
export const ATLAS_ROWS = 7;
export const ATLAS_OFFSETS = { 'developer-sprites': 0, 'developer-break-sprites': 4, 'developer-transition-sprites': 8,
  'developer-work-inbetweens': 12, 'developer-break-inbetweens': 16, 'developer-headphone-sprites': 20, 'developer-phones-inbetweens': 24 } as const;
export function atlasFrame(sheet: keyof typeof ATLAS_OFFSETS, frame: number): number {
  return ATLAS_OFFSETS[sheet] + frame;
}
