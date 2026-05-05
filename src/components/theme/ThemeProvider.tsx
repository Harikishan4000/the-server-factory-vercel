'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
const ThemeContext = createContext<{ theme: Theme; toggle: () => void } | null>(null);
const STORAGE_KEY = 'serverfactory.theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Light is the default per spec. Hydration-safe default = light.
  const [theme, setTheme] = useState<Theme>('light');

  // On mount, read user preference from localStorage (do NOT auto-follow system per spec)
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? (localStorage.getItem(STORAGE_KEY) as Theme | null) : null;
    if (stored === 'dark' || stored === 'light') setTheme(stored);
  }, []);

  // Reflect theme on <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
  }, [theme]);

  function toggle() {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
