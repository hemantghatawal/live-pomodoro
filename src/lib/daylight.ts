/**
 * Room lighting, driven by the visitor's own local time.
 *
 * The cycle is global and shared; the light is personal. Everyone focuses on
 * the same rhythm, but a visitor at 3am sees a dark room lit by a desk lamp
 * while a visitor at 2pm sees full sun.
 *
 * Values are interpolated between anchors rather than bucketed into five
 * discrete stops. Bucketing would snap jarringly at exactly 17:00; lerping
 * means the room drifts the way real light does. The anchor at hour 24 mirrors
 * hour 0 so midnight wraps without a discontinuity.
 */

export type DaylightStop = 'night' | 'dawn' | 'day' | 'golden' | 'dusk';

export interface Tint {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Daylight {
  stop: DaylightStop;
  /** Fractional local hour, 0..24. */
  hour: number;
  /** 0 fully dark, 1 brightest. */
  level: number;
  /** Desk lamp opacity, 0..1. */
  lamp: number;
  /** Window light shaft strength, 0..1. */
  shaft: number;
  /** Colour wash laid over the flat art. */
  tint: Tint;
}

interface Anchor extends Omit<Daylight, 'hour'> {
  hour: number;
}

const NIGHT: Tint = { r: 26, g: 35, b: 82, a: 0.66 };
const DAWN: Tint = { r: 126, g: 142, b: 196, a: 0.32 };
const DAY: Tint = { r: 255, g: 250, b: 238, a: 0.05 };
const GOLDEN: Tint = { r: 255, g: 146, b: 56, a: 0.3 };
const DUSK: Tint = { r: 146, g: 68, b: 128, a: 0.42 };

const ANCHORS: readonly Anchor[] = [
  { hour: 0, stop: 'night', level: 0.05, lamp: 1, shaft: 0.1, tint: NIGHT },
  { hour: 5, stop: 'night', level: 0.05, lamp: 1, shaft: 0.1, tint: NIGHT },
  { hour: 7, stop: 'dawn', level: 0.45, lamp: 0.5, shaft: 0.55, tint: DAWN },
  { hour: 9, stop: 'day', level: 1, lamp: 0, shaft: 1, tint: DAY },
  { hour: 16, stop: 'day', level: 1, lamp: 0, shaft: 0.95, tint: DAY },
  { hour: 18, stop: 'golden', level: 0.7, lamp: 0.15, shaft: 0.9, tint: GOLDEN },
  { hour: 19.5, stop: 'dusk', level: 0.35, lamp: 0.6, shaft: 0.45, tint: DUSK },
  { hour: 21, stop: 'night', level: 0.05, lamp: 1, shaft: 0.1, tint: NIGHT },
  { hour: 24, stop: 'night', level: 0.05, lamp: 1, shaft: 0.1, tint: NIGHT },
];

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

function lerpTint(a: Tint, b: Tint, t: number): Tint {
  return {
    r: Math.round(lerp(a.r, b.r, t)),
    g: Math.round(lerp(a.g, b.g, t)),
    b: Math.round(lerp(a.b, b.b, t)),
    a: lerp(a.a, b.a, t),
  };
}

/** Local hour with minutes and seconds folded in. */
export function fractionalHour(date: Date): number {
  return date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
}

export function daylightAt(rawHour: number): Daylight {
  const hour = ((rawHour % 24) + 24) % 24;

  let from = ANCHORS[0]!;
  let to = ANCHORS[ANCHORS.length - 1]!;

  for (let i = 0; i < ANCHORS.length - 1; i += 1) {
    const a = ANCHORS[i]!;
    const b = ANCHORS[i + 1]!;
    if (hour >= a.hour && hour <= b.hour) {
      from = a;
      to = b;
      break;
    }
  }

  const span = to.hour - from.hour;
  const t = span === 0 ? 0 : (hour - from.hour) / span;

  return {
    // Name the stop we are closest to, so the label does not flicker mid-segment.
    stop: t < 0.5 ? from.stop : to.stop,
    hour,
    level: lerp(from.level, to.level, t),
    lamp: lerp(from.lamp, to.lamp, t),
    shaft: lerp(from.shaft, to.shaft, t),
    tint: lerpTint(from.tint, to.tint, t),
  };
}

export function daylight(now: number): Daylight {
  return daylightAt(fractionalHour(new Date(now)));
}

export function tintCss({ r, g, b, a }: Tint): string {
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
}
