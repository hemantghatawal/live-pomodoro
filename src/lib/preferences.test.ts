import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadPreferences } from './preferences';

afterEach(() => vi.unstubAllGlobals());
const stored = (value: string | null) => vi.stubGlobal('localStorage', { getItem: () => value });

describe('settings defaults and saved choices', () => {
  it('starts animated and quiet with keep-awake requested', () => {
    stored(null);
    expect(loadPreferences()).toEqual({ awake: true, calm: false, notify: false, sound: false });
  });
  it('preserves an existing choice to disable keep-awake', () => {
    stored(JSON.stringify({ awake: false, calm: true, notify: true, sound: true }));
    expect(loadPreferences()).toEqual({ awake: false, calm: true, notify: true, sound: true });
  });
  it('fills missing settings without replacing existing preferences', () => {
    stored(JSON.stringify({ sound: true }));
    expect(loadPreferences()).toEqual({ awake: true, calm: false, notify: false, sound: true });
  });
});
