/**
 * The lighting system, rendering without the room.
 *
 * This is not a placeholder gradient. It reads the same custom properties the
 * rAF loop already writes, so the page colour genuinely tracks the visitor's
 * local time, and the soft band genuinely tracks progress through the block.
 * When the art lands it sits behind the room layers unchanged.
 */
export function AmbientBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Daylight wash, weighted toward the window wall on the right. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 78% 18%, var(--tint), transparent 62%)',
          opacity: 'calc(0.35 + var(--daylight) * 0.5)',
        }}
      />
      {/* Lamp, which takes over as the daylight drops. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 45% at 72% 62%, rgb(255 176 92 / 0.16), transparent 70%)',
          opacity: 'var(--lamp)',
        }}
      />
      {/* The sundial. Sweeps the room across the block; the room is the progress bar. */}
      <div
        className="absolute inset-y-0 w-[26vw] -translate-x-1/2 blur-3xl"
        style={{
          left: 'var(--shaft-x)',
          background:
            'linear-gradient(90deg, transparent, rgb(255 240 214 / 0.09), transparent)',
          opacity: 'calc(var(--shaft) * var(--focus) * 0.9 + 0.1)',
        }}
      />
    </div>
  );
}
