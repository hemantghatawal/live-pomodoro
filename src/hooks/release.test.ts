// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { useCycle } from './useCycle';
import { usePhaseTransition } from './usePhaseTransition';
import { cycleState, formatCountdown } from '../lib/cycle';
import { notifyPhase, requestNotify } from '../lib/notify';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });

it('recomputes the phase/countdown after sleep and never alerts on initial mount', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(1800000 * 100 + 1499000));
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  const changed = vi.fn();
  const node = document.createElement('div');
  const root = createRoot(node);
  function Probe() { const state = useCycle(); usePhaseTransition(state.phase, changed); return createElement('p', null, `${state.phase} ${state.countdown}`); }
  await act(async () => root.render(createElement(Probe)));
  expect(changed).not.toHaveBeenCalled();
  vi.setSystemTime(new Date(1800000 * 100 + 1505000));
  await act(async () => document.dispatchEvent(new Event('visibilitychange')));
  expect(node.textContent).toBe('break 04:55');
  expect(changed).toHaveBeenCalledExactlyOnceWith('break');
  vi.setSystemTime(new Date(1800000 * 102 + 65000));
  await act(async () => document.dispatchEvent(new Event('visibilitychange')));
  const now = cycleState(Date.now());
  expect(node.textContent).toBe(`focus ${formatCountdown(now.remainingMs)}`);
  expect(changed).toHaveBeenCalledTimes(2);
  await act(async () => root.unmount());
});

it('does not create desktop alerts without permission and survives unsupported delivery', async () => {
  const create = vi.fn();
  class FakeNotification {
    static permission = 'default';
    static requestPermission = vi.fn(async () => 'granted');
    constructor(...args: unknown[]) { create(...args); }
  }
  vi.stubGlobal('Notification', FakeNotification);
  notifyPhase('break');
  expect(create).not.toHaveBeenCalled();
  expect(await requestNotify()).toBe('granted');
  FakeNotification.permission = 'granted';
  notifyPhase('focus');
  expect(create).toHaveBeenCalledWith('Focus block started', expect.objectContaining({tag: 'live-pomodoro-phase'}));
  create.mockImplementation(() => { throw new Error('Unsupported constructor'); });
  expect(() => notifyPhase('break')).not.toThrow();
});
