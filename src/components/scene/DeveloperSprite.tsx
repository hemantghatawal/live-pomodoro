import { useEffect, useRef } from 'react';
import { assetUrl } from '../../lib/assets';
import { spriteFrame } from '../../lib/spriteFrame';
import type { Phase } from '../../lib/cycle';

export function DeveloperSprite({ phase, calm }: { phase: Phase; calm: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const src = assetUrl('developer-sprites');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let timer: ReturnType<typeof setInterval> | undefined;
    let previous = -1;
    const paint = () => {
      const frame = spriteFrame(Date.now(), phase, calm || reduced.matches);
      if (frame !== previous) {
        el.style.backgroundPosition = `${frame % 2 * 100}% ${Math.floor(frame / 2) * 100}%`;
        el.dataset.frame = String(frame);
        previous = frame;
      }
    };
    const sync = () => {
      clearInterval(timer);
      el.dataset.still = String(calm || reduced.matches || document.hidden);
      paint();
      if (!document.hidden && !calm && !reduced.matches && phase === 'focus') {
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
  }, [phase, calm, src]);

  if (!src) return null;
  return <div ref={ref} className="developer-sprite" data-phase={phase}
    style={{ backgroundImage: `url("${src}")` }} />;
}
