import { BREAK_MS } from './cycle';
import type { Activity } from './activities';

export interface BreakFrame {
  sheet: 'developer-sprites' | 'developer-break-sprites';
  frame: number;
  action: 'rest' | 'raise-arms' | 'stretch' | 'look-left' | 'look-right';
}

const REST: BreakFrame = { sheet: 'developer-sprites', frame: 3, action: 'rest' };
const pose = (frame: number, action: BreakFrame['action']): BreakFrame =>
  ({ sheet: 'developer-break-sprites', frame, action });

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
  if (beat >= start && beat < start + 700) return pose(0, 'raise-arms');
  if (beat >= start + 700 && beat < start + 700 + hold) return pose(1, 'stretch');
  if (beat >= start + 700 + hold && beat < start + 1400 + hold) return pose(0, 'raise-arms');
  const glance = activity === 'look-around' ? 18000 : 23000;
  if (beat >= glance && beat < glance + 2600) return pose(2, 'look-left');
  if (beat >= glance + 4600 && beat < glance + 7200) return pose(3, 'look-right');
  return REST;
}
