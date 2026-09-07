import { useEffect, useRef } from 'react';
import { assetUrl } from '../../lib/assets';
import type { Phase } from '../../lib/cycle';

export function RoomLife({ calm, phase }: { calm: boolean; phase: Phase }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => { el.dataset.still = String(calm || document.hidden || reduced.matches); };
    sync();
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', sync);
    return () => {
      document.removeEventListener('visibilitychange', sync);
      reduced.removeEventListener('change', sync);
    };
  }, [calm]);
  return <div ref={ref} className="room-life" aria-hidden data-phase={phase}>
    <div className="ambient-fan"><img src={assetUrl('ambient-fan')!} alt="" /></div>
    <img className="ambient-plant" src={assetUrl('ambient-plant')!} alt="" />
    <div className="ambient-cat" style={{ backgroundImage: `url("${assetUrl('ambient-cat')}")` }} />
    <div className="mug-steam"><i /><i /><i /></div>
    <div className="desk-timer-indicator" />
  </div>;
}
