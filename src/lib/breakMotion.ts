import { BREAK_MS } from './cycle';
import type { Activity } from './activities';

export interface BreakFrame {
  sheet: 'developer-sprites' | 'developer-break-sprites' | 'developer-transition-sprites';
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
  if (beat >= start && beat < start + 220) return transition(1, 'raise-arms');
  if (beat >= start + 220 && beat < start + 440) return transition(2, 'raise-arms');
  if (beat >= start + 440 && beat < start + 700) return pose(0, 'raise-arms');
  if (beat >= start + 700 && beat < start + 700 + hold) return pose(1, 'stretch');
  const lower = start + 700 + hold;
  if (beat >= lower && beat < lower + 260) return pose(0, 'raise-arms');
  if (beat >= lower + 260 && beat < lower + 480) return transition(2, 'raise-arms');
  if (beat >= lower + 480 && beat < lower + 700) return transition(1, 'raise-arms');
  const glance = activity === 'look-around' ? 18000 : 23000;
  if (beat >= glance && beat < glance + 2600) return pose(2, 'look-left');
  if (beat >= glance + 4600 && beat < glance + 7200) return pose(3, 'look-right');
  if (beat >= 47000 && beat < 51000) return transition(3, 'thinking');
  return REST;
}

/** One predecoded atlas avoids flashes when a sequence crosses source sheets. */
export function atlasFrame(sheet: BreakFrame['sheet'], frame: number): number {
  return ({ 'developer-sprites': 0, 'developer-break-sprites': 4, 'developer-transition-sprites': 8 })[sheet] + frame;
}
