import { ThemeMode } from '../types/bill';

const THEME_STORAGE_KEY = 'tabfast_theme_mode_v2';

export function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
    if (stored && ['system', 'light', 'dark'].includes(stored)) {
      return stored;
    }
  } catch (e) {
    console.error('Failed to get theme from localStorage', e);
  }
  return 'system';
}

export function applyTheme(mode: ThemeMode): boolean {
  if (typeof window === 'undefined') return false;

  const root = document.documentElement;
  let isDark = false;

  if (mode === 'dark') {
    isDark = true;
  } else if (mode === 'light') {
    isDark = false;
  } else {
    // system mode: check prefers-color-scheme
    isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch (e) {
    console.error('Failed to save theme', e);
  }

  return isDark;
}
