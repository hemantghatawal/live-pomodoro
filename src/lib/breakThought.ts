import { BREAK_MS, CYCLE_MS, type Phase } from './cycle';

export interface BreakThought { kind: 'Idea' | 'Room fact'; text: string }

// Original product prompts, not business advice or claims of market demand.
const IDEAS = [
  'What if a to-do list showed only one next step?',
  'A tiny desk garden that grows with each focus block…',
  'What if coworkers could share a quiet room, without a meeting?',
  'A notebook that brings back one unfinished idea at break time…',
  'A browser tab that helps you close the other twenty tabs…',
  'What if a project started with a two-minute first step?',
];
// These are verifiable properties of this app, not unsourced health claims.
const FACTS = [
  'Everyone here follows the same 25-minute focus block.',
  'The clock is shared. The room lighting follows your local time.',
  'Two complete cycles make 50 minutes of focus and 10 minutes of breaks.',
  'This room is already running when you arrive. No Start button needed.',
];

export function breakThought(now: number, phase: Phase, calm = false): BreakThought | null {
  if (phase !== 'break' || calm) return null;
  const elapsed = ((now % BREAK_MS) + BREAK_MS) % BREAK_MS;
  // Four brief thoughts across five minutes, after the opening stretch.
  const windows = [16000, 86000, 156000, 226000];
  const index = windows.findIndex((start) => elapsed >= start && elapsed < start + 12000);
  if (index < 0) return null;
  const cycle = Math.floor(now / CYCLE_MS);
  const pool = index % 2 === 0 ? IDEAS : FACTS;
  const pick = ((cycle + index) % pool.length + pool.length) % pool.length;
  return { kind: index % 2 === 0 ? 'Idea' : 'Room fact', text: pool[pick]! };
}
