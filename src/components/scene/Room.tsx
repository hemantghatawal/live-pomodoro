import { Layer } from './Layer';
import { SLOTS_BY_Z, assetUrl, hasAsset } from '../../lib/assets';
import { chooseLayers } from '../../lib/roomLayers';
import { LAYER_STYLE } from '../../lib/layerStyles';
import type { CycleView } from '../../hooks/useCycle';

/**
 * Composes the room from whatever art exists.
 *
 * Selection lives in lib/roomLayers so it can be tested without a bundler. Two
 * rules make this survive a half-finished asset set: a slot with no file is
 * skipped, and a slot that is one of several variants falls back to any sibling
 * that does exist, so one character image covers all eight poses.
 */

interface Props {
  cycle: CycleView;
  /** 0..1, from the daylight system. */
  daylight: number;
}

export function Room({ cycle, daylight }: Props) {
  const layers = chooseLayers(SLOTS_BY_Z, hasAsset, {
    phase: cycle.phase,
    pose: cycle.pose,
    activity: cycle.activity,
    cycleIndex: cycle.cycleIndex,
    daylight,
    screen: cycle.screen,
  });
  if (layers.length === 0) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {layers.map((slot) => {
        const src = assetUrl(slot.id);
        if (!src) return null;
        return (
          <Layer
            key={slot.id}
            src={src}
            z={slot.z}
            blend={slot.blend}
            style={LAYER_STYLE[slot.id]}
          />
        );
      })}

      {/* Room lighting, applied over the flat art rather than baked into it. */}
      <div
        className="absolute inset-0"
        style={{ zIndex: 92, background: 'var(--tint)', mixBlendMode: 'multiply' }}
      />
      {/* Keeps the HUD legible whatever the room is doing behind it. */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 93,
          background:
            'linear-gradient(to top, rgb(9 9 11 / 0.85) 0%, rgb(9 9 11 / 0.35) 38%, transparent 70%)',
        }}
      />
    </div>
  );
}
