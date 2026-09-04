import { useCycle } from './hooks/useCycle';

/**
 * Phase 1 verification surface. The real HUD replaces this in Phase 2.
 */
export function App() {
  const { phase, countdown, cycleIndex, nextFocusAt, stop, activity, pose } = useCycle();

  const nextFocus = new Date(nextFocusAt).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <main className="min-h-[100dvh] p-10 flex flex-col justify-end gap-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-ember">{phase}</p>
        <p
          className="tnum font-mono font-medium leading-none text-zinc-100"
          style={{ fontSize: 'clamp(4rem, 18vw, 11rem)' }}
        >
          {countdown}
        </p>
        <p className="mt-3 text-sm text-zinc-400">Next focus block at {nextFocus}</p>
      </div>

      <dl className="grid grid-cols-2 gap-x-8 gap-y-2 font-mono text-xs text-zinc-500 sm:grid-cols-4">
        {[
          ['cycle', cycleIndex],
          ['light', stop],
          ['doing', phase === 'focus' ? pose : activity],
          ['sundial', <SundialReadout key="s" />],
        ].map(([k, v]) => (
          <div key={String(k)}>
            <dt className="text-zinc-600">{k}</dt>
            <dd className="text-zinc-300">{v}</dd>
          </div>
        ))}
      </dl>

      {/* Proves the CSS custom properties are live: driven by --progress alone. */}
      <div className="h-px w-full bg-zinc-800">
        <div className="h-px bg-ember" style={{ width: 'var(--shaft-x)' }} />
      </div>
    </main>
  );
}

function SundialReadout() {
  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>see bar</span>;
}
