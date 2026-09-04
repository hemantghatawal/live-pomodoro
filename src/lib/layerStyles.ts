import type { CSSProperties } from 'react';

/**
 * How individual layers move.
 *
 * Every value here reads a custom property that the rAF loop writes, so none of
 * this costs a React render. Rotating assets are exported with their pivot at
 * the centre of the canvas, which is why a bare rotate() needs no offset.
 */
export const LAYER_STYLE: Record<string, CSSProperties> = {
  // A mechanical kitchen timer winds down to zero across the block.
  'timer-dial': { transform: 'rotate(calc(var(--dial-deg)))' },
  'timer-glow': { opacity: 'var(--focus)', transition: 'opacity 400ms ease' },

  // Real local time. The second hand steps, the others drift.
  'clock-hand-hour': { transform: 'rotate(calc(var(--clock-hour) * 1deg))' },
  'clock-hand-minute': { transform: 'rotate(calc(var(--clock-minute) * 1deg))' },
  'clock-hand-second': { transform: 'rotate(calc(var(--clock-second) * 1deg))' },

  // He stops typing on a break, so the screens dim rather than cut out.
  'monitor-glow': {
    opacity: 'calc(0.3 + var(--focus) * 0.7)',
    transition: 'opacity 400ms ease',
  },

  'lamp-glow': { opacity: 'var(--lamp)' },

  // The sundial. The beam crosses the room over the block, so the room itself
  // is the progress bar and the HUD needs almost no chrome for it.
  'light-shaft': {
    opacity: 'calc(var(--shaft) * (0.45 + var(--focus) * 0.55))',
    transform: 'translateX(calc((var(--progress) - 0.5) * 11%))',
    transition: 'opacity 600ms ease',
  },

  'fan-blades': { animation: 'fan-spin 6.7s linear infinite' },
};
