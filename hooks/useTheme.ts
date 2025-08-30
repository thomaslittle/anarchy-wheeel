'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Theme } from '@/types';

interface UseThemeReturn {
  theme: Theme['current'];
  toggleTheme: () => void;
  setTheme: (theme: Theme['current']) => void;
}

export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme['current']>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme['current'] | null;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setThemeState(savedTheme);
      document.body.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const setTheme = useCallback((newTheme: Theme['current']) => {
    setThemeState(newTheme);
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, setTheme]);

  return {
    theme,
    toggleTheme,
    setTheme,
  };
}