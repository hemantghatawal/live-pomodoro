// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { useWakeLock } from './useWakeLock';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
afterEach(() => vi.restoreAllMocks());

it('avoids duplicate requests and reacquires a released screen lock', async () => {
  const first = { released: false, release: vi.fn(async () => {}) };
  const second = { released: false, release: vi.fn(async () => {}) };
  const request = vi.fn().mockResolvedValueOnce(first).mockResolvedValueOnce(second);
  Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request } });
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
  const root = createRoot(document.createElement('div'));
  function Probe() { useWakeLock(true); return null; }
  await act(async () => root.render(createElement(Probe)));
  await act(async () => document.dispatchEvent(new Event('visibilitychange')));
  expect(request).toHaveBeenCalledTimes(1);
  first.released = true;
  await act(async () => document.dispatchEvent(new Event('visibilitychange')));
  expect(request).toHaveBeenCalledTimes(2);
  await act(async () => root.unmount());
  expect(second.release).toHaveBeenCalledOnce();
  Reflect.deleteProperty(navigator, 'wakeLock');
});
