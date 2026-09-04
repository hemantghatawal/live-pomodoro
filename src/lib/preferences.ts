/**
 * Viewer preferences. Local to one browser, never sent anywhere.
 *
 * Every access is wrapped: private windows, cleared site data and browsers set
 * to block storage all throw rather than returning null.
 */

export interface Preferences {
  notify: boolean;
  sound: boolean;
  awake: boolean;
}

export const DEFAULT_PREFERENCES: Preferences = {
  notify: false,
  sound: false,
  awake: false,
};

const KEY = 'live-pomodoro:preferences';

export function loadPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_PREFERENCES;
    const p = parsed as Partial<Record<keyof Preferences, unknown>>;
    return {
      notify: typeof p.notify === 'boolean' ? p.notify : DEFAULT_PREFERENCES.notify,
      sound: typeof p.sound === 'boolean' ? p.sound : DEFAULT_PREFERENCES.sound,
      awake: typeof p.awake === 'boolean' ? p.awake : DEFAULT_PREFERENCES.awake,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: Preferences): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    // Storage unavailable. Preferences last the session and that is fine.
  }
}
