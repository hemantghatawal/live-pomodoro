import { useEffect, useState } from 'react';

/**
 * Keeps the screen awake while the room is on display.
 *
 * The lock is dropped by the browser whenever the tab is hidden, so it has to
 * be re-acquired on every return to visibility rather than held once.
 */

interface WakeLockSentinelLike {
  release(): Promise<void>;
}

interface WakeLockLike {
  request(type: 'screen'): Promise<WakeLockSentinelLike>;
}

function api(): WakeLockLike | null {
  if (typeof navigator === 'undefined') return null;
  return (navigator as Navigator & { wakeLock?: WakeLockLike }).wakeLock ?? null;
}

export function useWakeLock(enabled: boolean): { supported: boolean } {
  const [supported] = useState(() => api() !== null);

  useEffect(() => {
    if (!enabled || !supported) return;

    let sentinel: WakeLockSentinelLike | null = null;
    let cancelled = false;

    const acquire = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const next = await api()?.request('screen');
        if (cancelled) {
          void next?.release();
          return;
        }
        sentinel = next ?? null;
      } catch {
        // Denied, low battery, or unsupported in this context. Degrade silently.
      }
    };

    void acquire();
    document.addEventListener('visibilitychange', acquire);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', acquire);
      void sentinel?.release();
    };
  }, [enabled, supported]);

  return { supported };
}
