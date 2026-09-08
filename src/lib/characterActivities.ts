import { BREAK_MS } from './cycle';
import { catVisit } from './catVisit';

export const BACK_STRETCH_START = 175_000;
export function floorActivity(now: number, still = false) {
  if (still) return null;
  const cat = catVisit(now);
  if (cat) return { ...cat, sheet: 'developer-cat-smooth', columns: 4, rows: 1, x: 29, top: 12, width: 34, aspect: '3 / 4' };
  const t = ((now % BREAK_MS) + BREAK_MS) % BREAK_MS;
  if (t >= BACK_STRETCH_START && t < BACK_STRETCH_START + 18000) {
    return { action: 'back-stretch', sheet: 'developer-exercise-smooth', frame: [0, 2, 1, 2, 0, 3][Math.floor((t - BACK_STRETCH_START) / 730) % 6]!,
      columns: 4, rows: 1, x: 61, top: 14, width: 50, aspect: '3 / 2' };
  }
  return null;
}

/** Long headphone work blocks with brief, spaced thinking/adjusting gestures. */
export function headphoneFrame(now: number, still = false, force = false) {
  if (!force && Math.floor(now / 180000) % 3 === 0) return null;
  if (still) return { frame: 0, action: 'headphone-work' };
  const beat = ((now % 60000) + 60000) % 60000;
  if (beat >= 21700 && beat < 22000 || beat >= 27000 && beat < 27300) return { frame: 5, action: 'headphone-thinking' };
  if (beat >= 44700 && beat < 45000 || beat >= 47700 && beat < 48000) return { frame: 6, action: 'adjust-headphones' };
  if (beat >= 22000 && beat < 27000) return { frame: 2, action: 'headphone-thinking' };
  if (beat >= 45000 && beat < 47700) return { frame: 3, action: 'adjust-headphones' };
  const blink = now % 17300;
  if (blink >= 4060 && blink < 4120 || blink >= 4280 && blink < 4340) return { frame: 4, action: 'headphone-work' };
  return { frame: blink >= 4120 && blink < 4280 ? 1 : (blink > 700 && blink < 2800 ? [0, 7, 0, 7][Math.floor(blink / 160) % 4]! : 0), action: 'headphone-work' };
}
