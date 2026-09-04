import { useEffect, useRef } from 'react';
import type { Phase } from '../lib/cycle';

/**
 * Fires once when the phase flips, and never on mount.
 *
 * Mount is deliberately excluded: arriving mid-block is the normal way to use
 * this site, and greeting every visitor with a chime for a block that started
 * eleven minutes ago would be wrong.
 */
export function usePhaseTransition(phase: Phase, onChange: (phase: Phase) => void): void {
  const previous = useRef<Phase>(phase);
  const handler = useRef(onChange);
  handler.current = onChange;

  useEffect(() => {
    if (previous.current === phase) return;
    previous.current = phase;
    handler.current(phase);
  }, [phase]);
}
