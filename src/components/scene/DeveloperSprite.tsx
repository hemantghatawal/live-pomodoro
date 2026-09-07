import { useEffect, useRef } from 'react';
import { assetUrl } from '../../lib/assets';
import { spriteFrame } from '../../lib/spriteFrame';
import type { Phase } from '../../lib/cycle';
import type { Activity } from '../../lib/activities';
import { breakFrame } from '../../lib/breakMotion';
import { FOCUS_MS } from '../../lib/cycle';

export function DeveloperSprite({ phase, calm, activity, inspectFrame = -1, previewPlaying = false }: {
  phase: Phase; calm: boolean; activity: Activity; inspectFrame?: number; previewPlaying?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const src = assetUrl('developer-sprites');
  const breakSrc = assetUrl('developer-break-sprites');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let timer: ReturnType<typeof setInterval> | undefined;
    let previous = '';
    const previewStartedAt = Date.now();
    if (breakSrc) { const preload = new Image(); preload.src = breakSrc; }
    const paint = () => {
      const now = import.meta.env.DEV && previewPlaying
        ? FOCUS_MS + Date.now() - previewStartedAt : Date.now();
      const still = calm || reduced.matches;
      const motion = import.meta.env.DEV && inspectFrame >= 0 && breakSrc
        ? { sheet: 'developer-break-sprites', frame: inspectFrame, action: 'inspect' }
        : phase === 'break' && breakSrc ? breakFrame(now, activity, still) : null;
      const frame = motion?.frame ?? spriteFrame(now, phase, still);
      const url = motion?.sheet === 'developer-break-sprites' ? breakSrc : src;
      const key = `${url}:${frame}`;
      if (key !== previous) {
        el.style.backgroundImage = `url("${url}")`;
        el.style.backgroundPosition = `${frame % 2 * 100}% ${Math.floor(frame / 2) * 100}%`;
        el.dataset.frame = String(frame);
        el.dataset.action = motion?.action ?? 'work';
        previous = key;
      }
    };
    const sync = () => {
      clearInterval(timer);
      el.dataset.still = String(calm || reduced.matches || document.hidden);
      paint();
      if (!document.hidden && !calm && !reduced.matches && !(import.meta.env.DEV && inspectFrame >= 0)) {
        timer = setInterval(paint, 60);
      }
    };
    sync();
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', sync);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', sync);
      reduced.removeEventListener('change', sync);
    };
  }, [phase, calm, src, breakSrc, activity, inspectFrame, previewPlaying]);

  if (!src) return null;
  return <div ref={ref} aria-hidden className="developer-sprite" data-phase={phase}
    style={{ backgroundImage: `url("${src}")` }} />;
}
