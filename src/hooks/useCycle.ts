import { useEffect, useRef, useState } from 'react';
import {
  breakActivity,
  focusPose,
  screenFrame,
  type Activity,
  type FocusPose,
} from '../lib/activities';
import { handAngles } from '../lib/clockHands';
import { cycleState, formatCountdown, nextFocusStart, type Phase } from '../lib/cycle';
import { daylight, type DaylightStop } from '../lib/daylight';

/**
 * The single animation loop for the whole site.
 *
 * It writes CSS custom properties onto the document element every frame and
 * lets CSS do the rest, so no component re-renders per frame. React state is
 * touched only when something a human could actually read has changed, which
 * in practice means once a second.
 */

export interface CycleView {
  phase: Phase;
  /** MM:SS, already formatted. */
  countdown: string;
  cycleIndex: number;
  /** Epoch ms at which the phase flips next, whichever direction. */
  nextBoundaryAt: number;
  /** Epoch ms at which the next focus block begins. */
  nextFocusAt: number;
  stop: DaylightStop;
  /** 0 dark, 1 brightest. Drives which room variants are shown. */
  daylightLevel: number;
  /** What he is doing on his break. Only meaningful during break. */
  activity: Activity;
  /** What he is doing at the desk. Only meaningful during focus. */
  pose: FocusPose;
  /** Which monitor image is up. Rotates through a block, frozen on break. */
  screen: 'a' | 'b' | 'c';
}

function view(now: number): CycleView {
  const c = cycleState(now);
  const d = daylight(now);
  return {
    phase: c.phase,
    countdown: formatCountdown(c.remainingMs),
    cycleIndex: c.cycleIndex,
    nextBoundaryAt: c.nextBoundary,
    nextFocusAt: nextFocusStart(now),
    stop: d.stop,
    daylightLevel: d.level,
    activity: breakActivity(c.cycleIndex, d.stop),
    pose: focusPose(c.cycleIndex, c.progress),
    screen: screenFrame(c.cycleIndex, c.phase, c.progress),
  };
}

/** Cheap identity for "has anything a human can see changed?". */
function key(v: CycleView): string {
  // Daylight is bucketed here on purpose: it drives which variant renders, and
  // a continuous value would re-render every frame for an invisible change.
  return `${v.phase}|${v.countdown}|${v.stop}|${v.activity}|${v.pose}|${v.screen}|${v.daylightLevel < 0.3 ? 'dark' : 'lit'}`;
}

export function useCycle(): CycleView {
  const [state, setState] = useState<CycleView>(() => view(Date.now()));
  const lastKey = useRef(key(state));
  const written = useRef<Record<string, number>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    let frame = 0;

    /**
     * Only touch the CSSOM when a value actually moved. --progress drives the
     * sundial and the timer dial so it needs every frame; daylight shifts over
     * hours and would be pure waste at 60Hz.
     */
    const put = (name: string, value: number, epsilon: number) => {
      const prev = written.current[name];
      if (prev !== undefined && Math.abs(prev - value) < epsilon) return;
      written.current[name] = value;
      root.style.setProperty(name, String(Number(value.toFixed(5))));
    };

    const tick = () => {
      const now = Date.now();
      const c = cycleState(now);
      const d = daylight(now);

      put('--progress', c.progress, 0.0002);
      put('--focus', c.phase === 'focus' ? 1 : 0, 0.5);
      put('--daylight', d.level, 0.002);
      put('--lamp', d.lamp, 0.002);
      put('--shaft', d.shaft, 0.002);
      put('--tint-r', d.tint.r, 0.5);
      put('--tint-g', d.tint.g, 0.5);
      put('--tint-b', d.tint.b, 0.5);
      put('--tint-a', d.tint.a, 0.002);

      // Wall clock, on the visitor's real local time. Degrees are written
      // unitless and given their unit in CSS, so every write is numeric.
      const hands = handAngles(new Date(now));
      put('--clock-second', hands.second, 1);
      put('--clock-minute', hands.minute, 0.05);
      put('--clock-hour', hands.hour, 0.05);

      const next = view(now);
      const nextKey = key(next);
      if (nextKey !== lastKey.current) {
        lastKey.current = nextKey;
        setState(next);
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    // Coming back from a hidden tab or a sleeping laptop: recompute from wall
    // clock immediately rather than showing a stale second for one frame.
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      written.current = {};
      const next = view(Date.now());
      lastKey.current = key(next);
      setState(next);
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return state;
}
