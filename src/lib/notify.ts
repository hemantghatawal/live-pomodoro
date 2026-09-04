/**
 * Desktop notifications for phase changes.
 *
 * Permission is never requested on load. Chrome silently blocks that, and it is
 * hostile regardless, so the request happens inside the toggle's click handler.
 */

import type { Phase } from './cycle';

export type NotifyState = 'unsupported' | 'default' | 'granted' | 'denied';

export function notifyState(): NotifyState {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission as NotifyState;
}

/** Must be called from inside a user gesture. */
export async function requestNotify(): Promise<NotifyState> {
  if (notifyState() === 'unsupported') return 'unsupported';
  try {
    return (await Notification.requestPermission()) as NotifyState;
  } catch {
    return 'denied';
  }
}

const COPY: Record<Phase, { title: string; body: string }> = {
  focus: { title: 'Focus block started', body: 'Twenty five minutes. He is already at the keyboard.' },
  break: { title: 'Break started', body: 'Five minutes. Look at something further away than your screen.' },
};

export function notifyPhase(phase: Phase): void {
  if (notifyState() !== 'granted') return;
  const { title, body } = COPY[phase];
  try {
    // A stable tag means a missed notification is replaced, never stacked.
    new Notification(title, { body, tag: 'live-pomodoro-phase', icon: `/favicon-${phase}.svg` });
  } catch {
    // Some browsers require a service worker for notifications. Not worth one.
  }
}
