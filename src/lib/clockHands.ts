/**
 * Wall clock hand angles, in degrees clockwise from twelve.
 *
 * Assets are exported with their pivot at the centre of the canvas, so these
 * feed a bare rotate() with no offset.
 */

export interface HandAngles {
  hour: number;
  minute: number;
  second: number;
}

export function handAngles(date: Date): HandAngles {
  const seconds = date.getSeconds();
  const minutes = date.getMinutes();
  const hours = date.getHours() % 12;

  return {
    // 30 degrees per hour, plus the creep from minutes elapsed.
    hour: hours * 30 + minutes * 0.5,
    minute: minutes * 6 + seconds * 0.1,
    // Steps rather than sweeps, like a quartz movement.
    second: seconds * 6,
  };
}
