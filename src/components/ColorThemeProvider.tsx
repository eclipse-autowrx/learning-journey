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

      // Check if theme has been applied server-side
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      const hasThemeApplied = computedStyle.getPropertyValue('--color-primary-500').trim();

      if (!hasThemeApplied) {
        // Fallback: load theme client-side if not already applied
        await colorThemeManager.loadThemeFromSettings();
      } else {
        // Theme already applied server-side, just sync the manager state
        // Extract current theme from CSS variables
        const currentTheme: any = {};
        Object.keys(colorThemeManager.getCurrentTheme()).forEach(key => {
          const value = computedStyle.getPropertyValue(`--${key}`).trim();
          if (value) {
            currentTheme[key] = value;
          }
        });

        if (Object.keys(currentTheme).length > 0) {
          // Update manager's internal state without reapplying CSS
          colorThemeManager['currentTheme'] = currentTheme;
          colorThemeManager['currentBaseColors'] = require('../lib/color-theme').extractBaseColors(currentTheme);
        }
      }
    };

    initializeTheme();
  }, []);

  return <>{children}</>;
}