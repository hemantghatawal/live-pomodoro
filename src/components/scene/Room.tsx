import { Layer } from './Layer';
import { SLOTS_BY_Z, assetUrl, hasAsset } from '../../lib/assets';
import { chooseLayers } from '../../lib/roomLayers';
import { LAYER_STYLE } from '../../lib/layerStyles';
import type { CycleView } from '../../hooks/useCycle';
import { DeveloperSprite } from './DeveloperSprite';
import { daylightAt, tintCss } from '../../lib/daylight';
import type { CSSProperties } from 'react';
import type { ScenePreview } from '../dev/AssetStatus';
import { BreakThought } from './BreakThought';
import { RoomLife } from './RoomLife';

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
  calm?: boolean;
  preview?: ScenePreview;
}

export function Room({ cycle, daylight, calm = false, preview = 'live' }: Props) {
  const inspecting = import.meta.env.DEV && preview !== 'live';
  const light = inspecting ? daylightAt(preview.startsWith('night') ? 0 : 12) : null;
  const phase = inspecting ? (preview.endsWith('focus') ? 'focus' : 'break') : cycle.phase;
  const inspectFrame = inspecting ? ['raise-arms', 'stretch', 'look-left', 'look-right'].indexOf(preview) : -1;
  const layeredProps = ['room-clean', 'ambient-fan', 'ambient-plant', 'ambient-cat'].every(hasAsset);
  const roomSrc = assetUrl(layeredProps ? 'room-clean' : 'room-base');
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
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="room-stage" style={light ? {
        '--tint': tintCss(light.tint), '--lamp': light.lamp,
      } as CSSProperties : undefined}>
      {layers.map((slot) => {
        const src = slot.id === 'room-base' ? roomSrc : assetUrl(slot.id);
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

      {layeredProps ? <RoomLife calm={calm} phase={phase} /> : null}

      <DeveloperSprite phase={phase} calm={calm} activity={cycle.activity} inspectFrame={inspectFrame}
        previewPlaying={inspecting && preview.endsWith('break')} />
      {assetUrl('room-base') && hasAsset('developer-sprites') ? (
        <Layer src={roomSrc!} z={75} className="room-foreground" />
      ) : null}

      {/* Room lighting, applied over the flat art rather than baked into it. */}
      <div
        className="absolute inset-0"
        style={{ zIndex: 92, background: 'var(--tint)', mixBlendMode: 'multiply' }}
      />
      <div className="room-lamp-light" />
      <BreakThought phase={inspectFrame >= 0 ? 'focus' : phase} calm={calm}
        previewPlaying={inspecting && preview.endsWith('break')} inspect={inspecting ? preview : ''} />
      </div>
      {/* Keeps the HUD legible whatever the room is doing behind it. */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 93,
          background:
            'linear-gradient(to top, rgb(9 9 11 / 0.90) 0%, rgb(9 9 11 / 0.3) 27%, transparent 52%), linear-gradient(to bottom, rgb(9 9 11 / 0.85), transparent 20%)',
        }}
      />
    </div>
  );
}
