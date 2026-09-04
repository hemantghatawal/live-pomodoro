import { useEffect } from 'react';
import type { Phase } from '../lib/cycle';

/**
 * Mirrors the countdown into the tab title and swaps the favicon with the
 * phase, so the timer stays readable from a background tab. This is the most
 * used feature of every timer app and it costs nothing.
 */
export function useDocumentTitle(countdown: string, phase: Phase): void {
  useEffect(() => {
    document.title = `${countdown} ${phase}`;
  }, [countdown, phase]);

  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (link) link.href = `/favicon-${phase}.svg`;
  }, [phase]);
}
