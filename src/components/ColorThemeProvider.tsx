'use client';

import { useEffect } from 'react';
import { ColorThemeManager } from '../lib/color-theme';

interface ColorThemeProviderProps {
  children: React.ReactNode;
}

export default function ColorThemeProvider({ children }: ColorThemeProviderProps) {
  useEffect(() => {
    const initializeTheme = async () => {
      const colorThemeManager = ColorThemeManager.getInstance();
      
      // First, try to create the theme setting if it doesn't exist
      await colorThemeManager.createThemeSetting();
      
      // Then load and apply the theme
      await colorThemeManager.loadThemeFromSettings();
    };

    initializeTheme();
  }, []);

  return <>{children}</>;
}