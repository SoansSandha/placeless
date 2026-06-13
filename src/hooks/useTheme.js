import { useState, useEffect, useCallback } from 'react';

// Theme preference, persisted to localStorage and mirrored onto <html> as a
// `.dark` class (the same class the no-flash script in index.html sets before
// paint). Defaults to the OS preference until the user picks explicitly.
const STORAGE_KEY = 'placeless_theme';

function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  // Keep <html>.dark and the stored preference in sync with state.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggleTheme };
}
