import { useState } from 'react';
import { slotStatus, type SlotCategory } from '../../lib/assets';

/**
 * Development only. Lists every slot the room can hold and whether its file
 * exists yet, so it is obvious what is left to draw and what a new file will
 * light up. Never shipped: the bundler drops this whole branch in production.
 */

const ORDER: SlotCategory[] = ['room', 'character', 'cat', 'prop', 'screen', 'light', 'view', 'presence'];

export function AssetStatus() {
  const [open, setOpen] = useState(false);
  const all = slotStatus();
  const filled = all.filter((s) => s.present).length;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-[min(20rem,calc(100vw-2rem))] font-mono text-[11px]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded-panel border border-zinc-800 bg-zinc-950/90 px-3 py-2 text-left text-zinc-300 backdrop-blur hover:border-zinc-700"
      >
        art {filled}/{all.length}
        <span className="ml-2 text-zinc-600">{open ? 'hide' : 'show'}</span>
      </button>

      {open ? (
        <div className="mt-2 max-h-[60vh] overflow-y-auto rounded-panel border border-zinc-800 bg-zinc-950/95 p-3 backdrop-blur">
          {ORDER.map((category) => {
            const rows = all.filter((s) => s.slot.category === category);
            if (rows.length === 0) return null;
            return (
              <div key={category} className="mb-3 last:mb-0">
                <p className="mb-1 text-zinc-600">{category}</p>
                {rows.map(({ slot, present }) => (
                  <div key={slot.id} className="flex justify-between gap-3 py-px">
                    <span className={present ? 'text-zinc-300' : 'text-zinc-600'}>{slot.id}</span>
                    <span className={present ? 'text-ember' : 'text-zinc-700'}>
                      {present ? 'ok' : 'missing'}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
