import { useEffect, useState } from 'react';
import { breakThought, type BreakThought as Thought } from '../../lib/breakThought';
import { FOCUS_MS, type Phase } from '../../lib/cycle';

export function BreakThought({ phase, calm, previewPlaying, inspect = '' }: {
  phase: Phase; calm: boolean; previewPlaying: boolean; inspect?: string;
}) {
  const [thought, setThought] = useState<Thought | null>(null);
  useEffect(() => {
    const started = Date.now();
    let timer: ReturnType<typeof setInterval> | undefined;
    const paint = () => {
      const now = import.meta.env.DEV && (inspect === 'idea' || inspect === 'room-fact')
        ? FOCUS_MS + (inspect === 'idea' ? 16000 : 86000)
        : import.meta.env.DEV && previewPlaying ? FOCUS_MS + Date.now() - started : Date.now();
      const next = breakThought(now, phase, calm);
      setThought((old) => old?.text === next?.text ? old : next);
    };
    const sync = () => {
      clearInterval(timer);
      paint();
      if (!document.hidden && phase === 'break' && !calm) timer = setInterval(paint, 250);
    };
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', sync); };
  }, [phase, calm, previewPlaying, inspect]);
  if (!thought || phase !== 'break' || calm) return null;
  return <aside className="break-thought" aria-label={`Character thought: ${thought.kind}`}>
    <span className="break-thought-kind">{thought.kind}</span>
    <p>{thought.text}</p>
  </aside>;
}
