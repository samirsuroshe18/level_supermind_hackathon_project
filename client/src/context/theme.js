import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'advise-theme';
const listeners = new Set();

const currentTheme = () => (document.documentElement.classList.contains('dark') ? 'dark' : 'light');

// storage can be blocked (private windows); the theme then lasts for the visit only
const remember = (theme) => {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // nothing to do
  }
};

const setTheme = (theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  remember(theme);
  listeners.forEach((listener) => listener());
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// The current theme lives on <html> (index.html sets it before the first paint),
// so every component that reads it stays in step, charts included.
export const useTheme = () => {
  const theme = useSyncExternalStore(subscribe, currentTheme);

  return { theme, toggle: () => setTheme(theme === 'dark' ? 'light' : 'dark') };
};
