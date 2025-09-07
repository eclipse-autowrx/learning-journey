// Copyright (c) 2025 Eclipse Foundation.
//
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import connectToDatabase from './mongodb';
import SystemSettings from './models/SystemSettings';
import { ColorTheme, DEFAULT_THEME, generateColorTheme, BaseColorTheme } from './color-theme';

/**
 * Fetch theme from database server-side
 */
export async function fetchThemeFromDB(): Promise<ColorTheme> {
  try {
    await connectToDatabase();

    const setting = await SystemSettings.findOne({ key: 'color_theme' });

    if (setting && setting.value) {
      const themeValue = setting.value;

      // Check if it's base colors or full theme
      if (themeValue.primary && themeValue.secondary && themeValue.accent) {
        // It's base colors, generate full theme
        return generateColorTheme(themeValue as BaseColorTheme);
      } else {
        // It's a full theme
        return themeValue as ColorTheme;
      }
    }
  } catch (error) {
    console.error('Failed to fetch theme from DB:', error);
  }

  return DEFAULT_THEME;
}

/**
 * Generate CSS custom properties from theme
 */
export function generateThemeCSS(theme: ColorTheme): string {
  const cssVars = Object.entries(theme)
    .map(([key, value]) => `  --${key}: ${value};`)
    .join('\n');

  return `:root {\n${cssVars}\n}`;
}

/**
 * Get theme styles for server-side injection
 */
export async function getThemeStyles(): Promise<string> {
  const theme = await fetchThemeFromDB();
  return generateThemeCSS(theme);
}