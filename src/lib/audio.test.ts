// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { closeAudio, ensureAudio, playChime } from './audio';
afterEach(() => { closeAudio(); vi.unstubAllGlobals(); });

it('does not create audio until a gesture unlocks it and handles denied resume', async () => {
  const resume = vi.fn().mockRejectedValue(new Error('Autoplay denied'));
  const create = vi.fn();
  class FakeAudioContext {
    state = 'suspended';
    resume = resume;
    close = vi.fn(async () => {});
    constructor() { create(); }
  }
  vi.stubGlobal('AudioContext', FakeAudioContext);
  playChime('focus');
  expect(create).not.toHaveBeenCalled();
  expect(ensureAudio()).toBe(true);
  expect(create).toHaveBeenCalledOnce();
  playChime('break');
  await Promise.resolve();
  expect(resume).toHaveBeenCalled();
});
