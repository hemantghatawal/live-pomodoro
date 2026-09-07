import { useEffect, useRef, useState } from 'react';
import { assetUrl } from '../../lib/assets';
import { spriteFrame } from '../../lib/spriteFrame';
import type { Phase } from '../../lib/cycle';
import type { Activity } from '../../lib/activities';
import { breakFrame, atlasFrame } from '../../lib/breakMotion';
import { FOCUS_MS } from '../../lib/cycle';

export function DeveloperSprite({ phase, calm, activity, inspectFrame = -1, previewPlaying = false }: {
  phase: Phase; calm: boolean; activity: Activity; inspectFrame?: number; previewPlaying?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const src = assetUrl('developer-sprites');
  const breakSrc = assetUrl('developer-break-sprites');
  const atlas = assetUrl('developer-atlas');
  const [decoded, setDecoded] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setDecoded(false);
    const image = new Image();
    image.src = atlas ?? src ?? '';
    void image.decode().then(() => { if (!cancelled) setDecoded(true); }).catch(() => {
      if (!cancelled) setDecoded(true);
    });
    return () => { cancelled = true; };
  }, [atlas, src]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !decoded) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let timer: ReturnType<typeof setInterval> | undefined;
    let previous = '';
    const previewStartedAt = Date.now();

    const paint = () => {
      const now = import.meta.env.DEV && previewPlaying
        ? FOCUS_MS + Date.now() - previewStartedAt : Date.now();
      const still = calm || reduced.matches;
      const motion = import.meta.env.DEV && inspectFrame >= 0 && breakSrc
        ? { sheet: 'developer-break-sprites', frame: inspectFrame, action: 'inspect' }
        : phase === 'break' && breakSrc ? breakFrame(now, activity, still) : null;
      const frame = motion?.frame ?? spriteFrame(now, phase, still);
      const sheet = motion?.sheet ?? 'developer-sprites';
      const url = atlas ?? assetUrl(sheet) ?? src;
      const cell = atlas ? atlasFrame(sheet as Parameters<typeof atlasFrame>[0], frame) : frame;
      const key = `${url}:${cell}`;
      if (key !== previous) {
        el.style.backgroundImage = `url("${url}")`;
        el.style.backgroundPosition = atlas
          ? `${(cell % 4) * 100 / 3}% ${Math.floor(cell / 4) * 50}%`
          : `${frame % 2 * 100}% ${Math.floor(frame / 2) * 100}%`;
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
  }, [phase, calm, src, breakSrc, activity, inspectFrame, previewPlaying, atlas, decoded]);

  if (!src) return null;
  return <div ref={ref} aria-hidden className="developer-sprite" data-phase={phase}
    style={{ backgroundImage: `url("${atlas ?? src}")`, backgroundSize: atlas ? "400% 300%" : "200% 200%", visibility: decoded ? "visible" : "hidden" }} />;
}
