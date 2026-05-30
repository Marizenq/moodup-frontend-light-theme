import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform, useColorScheme as useRNColorScheme } from 'react-native';

export type ThemePreference = 'system' | 'light' | 'dark';

type AppColorScheme = 'light' | 'dark';

type ThemePreferenceContextValue = {
  preference: ThemePreference;
  setPreference: (next: ThemePreference) => Promise<void>;
  colorScheme: AppColorScheme;
};

const STORAGE_KEY = 'themePreference';

const ThemePreferenceContext = createContext<ThemePreferenceContextValue | null>(null);

export function ThemePreferenceProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = (useRNColorScheme() ?? 'light') as AppColorScheme;

  const [hasHydratedWeb, setHasHydratedWeb] = useState(Platform.OS !== 'web');
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    setHasHydratedWeb(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (!saved) return;
        if (saved !== 'system' && saved !== 'light' && saved !== 'dark') return;
        if (!cancelled) setPreferenceState(saved);
      } catch {
        // ignore
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const setPreference = useCallback(async (next: ThemePreference) => {
    setPreferenceState(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const colorScheme: AppColorScheme = useMemo(() => {
    if (!hasHydratedWeb) return 'light';
    if (preference === 'system') return systemScheme;
    return preference;
  }, [hasHydratedWeb, preference, systemScheme]);

  const value = useMemo<ThemePreferenceContextValue>(
    () => ({ preference, setPreference, colorScheme }),
    [preference, setPreference, colorScheme]
  );

  return <ThemePreferenceContext.Provider value={value}>{children}</ThemePreferenceContext.Provider>;
}

export function useThemePreference() {
  const ctx = useContext(ThemePreferenceContext);
  if (!ctx) {
    throw new Error('useThemePreference must be used within ThemePreferenceProvider');
  }
  return ctx;
}

export function useAppColorScheme(): AppColorScheme {
  return useThemePreference().colorScheme;
}

