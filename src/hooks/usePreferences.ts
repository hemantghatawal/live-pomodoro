import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_PREFERENCES,
  loadPreferences,
  savePreferences,
  type Preferences,
} from '../lib/preferences';

export function usePreferences() {
  // Read lazily rather than in an effect, so the toggles never flash the
  // default state on first paint.
  const [prefs, setPrefs] = useState<Preferences>(() =>
    typeof window === 'undefined' ? DEFAULT_PREFERENCES : loadPreferences(),
  );

  useEffect(() => {
    savePreferences(prefs);
  }, [prefs]);

  const set = useCallback(<K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPrefs((p) => (p[key] === value ? p : { ...p, [key]: value }));
  }, []);

  return { prefs, set };
}
