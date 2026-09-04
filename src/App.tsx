import { useCallback, useState } from 'react';
import { AmbientBackdrop } from './components/scene/AmbientBackdrop';
import { Room } from './components/scene/Room';
import { Controls } from './components/hud/Controls';
import { Countdown } from './components/hud/Countdown';
import { Wordmark } from './components/hud/Wordmark';
import { AssetStatus } from './components/dev/AssetStatus';
import { useCycle } from './hooks/useCycle';
import { useDocumentTitle } from './hooks/useDocumentTitle';
import { usePhaseTransition } from './hooks/usePhaseTransition';
import { usePreferences } from './hooks/usePreferences';
import { useWakeLock } from './hooks/useWakeLock';
import { ensureAudio, playChime } from './lib/audio';
import { notifyPhase, notifyState, requestNotify } from './lib/notify';

const clockTime = (epochMs: number): string =>
  new Date(epochMs).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export function App() {
  const cycle = useCycle();
  const { prefs, set } = usePreferences();
  const [permission, setPermission] = useState(notifyState);
  const { supported: wakeLockSupported } = useWakeLock(prefs.awake);

  useDocumentTitle(cycle.countdown, cycle.phase);

  usePhaseTransition(cycle.phase, (phase) => {
    if (prefs.notify) notifyPhase(phase);
    if (prefs.sound) playChime(phase);
  });

  const onNotify = useCallback(() => {
    if (prefs.notify) {
      set('notify', false);
      return;
    }
    // Permission is requested here, inside the gesture, never on load.
    void requestNotify().then((next) => {
      setPermission(next);
      if (next === 'granted') set('notify', true);
    });
  }, [prefs.notify, set]);

  const onSound = useCallback(() => {
    const next = !prefs.sound;
    if (next) {
      // Unlocks the AudioContext under the autoplay policy, and lets someone
      // hear what they just switched on rather than waiting 20 minutes to find out.
      ensureAudio();
      playChime(cycle.phase);
    }
    set('sound', next);
  }, [prefs.sound, cycle.phase, set]);

  const onAwake = useCallback(() => set('awake', !prefs.awake), [prefs.awake, set]);

  const nextLabel =
    cycle.phase === 'focus'
      ? `Break at ${clockTime(cycle.nextBoundaryAt)}`
      : `Focus at ${clockTime(cycle.nextBoundaryAt)}`;

  return (
    <>
      {/* Lighting renders whether or not the room art exists yet. */}
      <AmbientBackdrop />
      <Room cycle={cycle} daylight={cycle.daylightLevel} />

      <div className="mx-auto flex min-h-[100dvh] max-w-[1400px] flex-col justify-between gap-16 px-6 py-6 sm:px-10 sm:py-8">
        <header className="flex items-start justify-between gap-6">
          <Wordmark />
          <Controls
            notify={prefs.notify}
            notifyDenied={permission === 'denied' || permission === 'unsupported'}
            sound={prefs.sound}
            awake={prefs.awake}
            wakeLockSupported={wakeLockSupported}
            onNotify={onNotify}
            onSound={onSound}
            onAwake={onAwake}
          />
        </header>

        {/* Anchored bottom-left, so the room has the rest of the frame. */}
        <main>
          <Countdown countdown={cycle.countdown} phase={cycle.phase} nextLabel={nextLabel} />
        </main>
      </div>

      {/* Announces the flip only. Announcing every second would be unusable. */}
      <p aria-live="polite" className="sr-only">
        {cycle.phase === 'focus' ? 'Focus block started' : 'Break started'}
      </p>

      {import.meta.env.DEV ? <AssetStatus /> : null}
    </>
  );
}
