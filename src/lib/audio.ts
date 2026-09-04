/**
 * The phase chime. Synthesised rather than shipped as an audio file, so it
 * costs no bytes and can be tuned by ear in code.
 *
 * Rising for focus, falling for break, so the two are distinguishable without
 * looking at the screen. Deliberately quiet: this plays while someone is
 * concentrating.
 */

import type { Phase } from './cycle';

type Ctor = typeof AudioContext;

let ctx: AudioContext | null = null;

/** Must be called from inside a user gesture or autoplay policy blocks it. */
export function ensureAudio(): boolean {
  if (typeof window === 'undefined') return false;
  if (ctx) {
    if (ctx.state === 'suspended') void ctx.resume();
    return true;
  }
  const Ctor: Ctor | undefined =
    window.AudioContext ?? (window as { webkitAudioContext?: Ctor }).webkitAudioContext;
  if (!Ctor) return false;
  try {
    ctx = new Ctor();
    return true;
  } catch {
    return false;
  }
}

const NOTES: Record<Phase, [number, number]> = {
  // D5 up to A5, a rising fifth. Attention without alarm.
  focus: [587.33, 880.0],
  // The same fifth inverted, so a break is unmistakable with your eyes closed.
  break: [880.0, 587.33],
};

function note(at: number, hz: number, seconds: number, peak: number): void {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(hz, at);

  // Fast attack, long exponential tail. A linear fade reads as a click.
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(peak, at + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + seconds);

  osc.connect(gain).connect(ctx.destination);
  osc.start(at);
  osc.stop(at + seconds + 0.05);
}

export function playChime(phase: Phase): void {
  if (!ensureAudio() || !ctx) return;
  const [a, b] = NOTES[phase];
  const t = ctx.currentTime;
  note(t, a, 0.55, 0.1);
  note(t + 0.16, b, 0.75, 0.085);
}

export function closeAudio(): void {
  void ctx?.close();
  ctx = null;
}
