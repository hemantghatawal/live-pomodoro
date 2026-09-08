import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { assetUrl } from '../../lib/assets';
import { spriteFrame } from '../../lib/spriteFrame';
import type { Phase } from '../../lib/cycle';
import type { Activity } from '../../lib/activities';
import { breakFrame, atlasFrame, ATLAS_ROWS, type ATLAS_OFFSETS } from '../../lib/breakMotion';
import { CAT_VISIT_START } from '../../lib/catVisit';
import { floorActivity, headphoneFrame, BACK_STRETCH_START } from '../../lib/characterActivities';
import { FOCUS_MS } from '../../lib/cycle';

export function DeveloperSprite({ phase, calm, activity, inspectFrame = -1, previewPlaying = false, activityPreview = '' }: {
  phase: Phase; calm: boolean; activity: Activity; inspectFrame?: number; previewPlaying?: boolean; activityPreview?: string;
}) {
  const floorRef = useRef<HTMLDivElement>(null);
  const catSrc = assetUrl('developer-cat-smooth');
  const exerciseSrc = assetUrl('developer-exercise-smooth');
  const headphoneSrc = assetUrl('developer-headphone-sprites');
  const ref = useRef<HTMLDivElement>(null);
  const src = assetUrl('developer-sprites');
  const breakSrc = assetUrl('developer-break-sprites');
  const atlas = assetUrl('developer-atlas');
  const [decoded, setDecoded] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setDecoded(false);
    const urls = [atlas ?? src, catSrc, exerciseSrc, headphoneSrc].filter((url): url is string => Boolean(url));
    void Promise.all(urls.map(url => { const image = new Image(); image.src = url; return image.decode(); })).then(() => { if (!cancelled) setDecoded(true); }).catch(() => {
      if (!cancelled) setDecoded(true);
    });
    return () => { cancelled = true; };
  }, [atlas, src, catSrc, exerciseSrc, headphoneSrc]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !decoded) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let timer = 0;
    let previous = '';
    const previewStartedAt = Date.now();

    const paint = () => {
      const now = import.meta.env.DEV && previewPlaying
        ? FOCUS_MS + ({ 'cat-visit': CAT_VISIT_START, 'back-stretch': BACK_STRETCH_START }[activityPreview] ?? 0) + Date.now() - previewStartedAt : Date.now();
      const still = calm || reduced.matches;
      const motion = import.meta.env.DEV && inspectFrame >= 0 && breakSrc
        ? { sheet: 'developer-break-sprites' as const, frame: inspectFrame, action: 'inspect' }
        : phase === 'break' && breakSrc ? breakFrame(now, activity, still) : null;
      const candidate = phase === 'break' && inspectFrame < 0 ? floorActivity(now, still) : null;
      const floor = candidate && assetUrl(candidate.sheet) ? candidate : null;
      el.style.opacity = floor ? '0' : '1';
      const actor = floorRef.current;
      if (actor) {
        actor.style.opacity = floor ? '1' : '0';
        actor.dataset.action = floor?.action ?? 'inactive';
        if (floor) {
          actor.style.left = `${floor.x}%`;
          actor.style.top = `${floor.top}%`;
          actor.style.width = `${floor.width}%`;
          actor.style.aspectRatio = floor.aspect;
          actor.style.backgroundImage = `url("${assetUrl(floor.sheet)}")`;
          actor.style.backgroundSize = `${floor.columns * 100}% ${floor.rows * 100}%`;
          actor.style.backgroundPosition = `${floor.frame % floor.columns * 100 / (floor.columns - 1)}% ${Math.floor(floor.frame / floor.columns) * 100}%`;
        }
      }
      const headphones = phase === 'focus' && headphoneSrc ? headphoneFrame(now, still, activityPreview === 'headphones-focus') : null;
      const selected = headphones?.frame ?? motion?.frame ?? spriteFrame(now, phase, still);
      const frame = selected % 4;
      const sheet: keyof typeof ATLAS_OFFSETS = headphones
        ? selected >= 4 ? 'developer-phones-inbetweens' : 'developer-headphone-sprites'
        : motion?.sheet ?? (selected >= 4 ? 'developer-work-inbetweens' : 'developer-sprites');
      const useAtlas = Boolean(atlas);
      const url = atlas ?? assetUrl(sheet) ?? src;
      const cell = useAtlas ? atlasFrame(sheet, frame) : frame;
      el.dataset.action = headphones?.action ?? motion?.action ?? 'work';
      const key = `${url}:${cell}`;
      if (key !== previous) {
        el.style.backgroundImage = `url("${url}")`;
        el.style.backgroundSize = useAtlas ? `400% ${ATLAS_ROWS * 100}%` : "200% 200%";
        el.style.backgroundPosition = useAtlas
          ? `${(cell % 4) * 100 / 3}% ${Math.floor(cell / 4) * 100 / (ATLAS_ROWS - 1)}%`
          : `${frame % 2 * 100}% ${Math.floor(frame / 2) * 100}%`;
        el.dataset.frame = String(frame);
        previous = key;
      }
    };
    const sync = () => {
      cancelAnimationFrame(timer);
      el.dataset.still = String(calm || reduced.matches || document.hidden);
      paint();
      if (!document.hidden && !calm && !reduced.matches && !(import.meta.env.DEV && inspectFrame >= 0)) {
        const tick = () => { paint(); timer = requestAnimationFrame(tick); };
        timer = requestAnimationFrame(tick);
      }
    };
    sync();
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', sync);
    return () => {
      cancelAnimationFrame(timer);
      document.removeEventListener('visibilitychange', sync);
      reduced.removeEventListener('change', sync);
    };
  }, [phase, calm, src, breakSrc, activity, inspectFrame, previewPlaying, atlas, decoded, catSrc, exerciseSrc, headphoneSrc, activityPreview]);

  if (!src) return null;
  return <><div ref={ref} aria-hidden className="developer-sprite" data-phase={phase}
    style={{ backgroundImage: `url("${atlas ?? src}")`, backgroundSize: atlas ? `400% ${ATLAS_ROWS * 100}%` : "200% 200%", visibility: decoded ? "visible" : "hidden" }} />
    <div ref={floorRef} aria-hidden className="developer-floor-activity"
      style={{ opacity: 0, visibility: decoded ? "visible" : "hidden" }} />
  </>;
}
