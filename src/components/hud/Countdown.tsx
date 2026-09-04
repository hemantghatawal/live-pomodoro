import type { Phase } from '../../lib/cycle';

interface Props {
  countdown: string;
  phase: Phase;
  /** Epoch ms of the next phase flip, already formatted by the caller. */
  nextLabel: string;
}

export function Countdown({ countdown, phase, nextLabel }: Props) {
  return (
    <div>
      <p className="mb-3 text-sm font-medium text-ember">
        {phase === 'focus' ? 'Focus' : 'Break'}
      </p>

      <p
        className="tnum font-mono font-medium leading-[0.85] text-zinc-100"
        style={{ fontSize: 'clamp(4.5rem, 17vw, 13rem)' }}
      >
        {countdown}
      </p>

      <p className="mt-4 text-sm text-zinc-400">{nextLabel}</p>
    </div>
  );
}
