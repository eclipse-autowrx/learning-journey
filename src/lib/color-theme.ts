// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

export interface BaseColorTheme {
  primary: string;    // Base primary color (500)
  secondary: string;  // Base secondary color (500)
  accent: string;     // Base accent color (500)
}

export interface ColorTheme {
  // Primary colors
  'color-primary-50': string;
  'color-primary-100': string;
  'color-primary-200': string;
  'color-primary-300': string;
  'color-primary-400': string;
  'color-primary-500': string;
  'color-primary-600': string;
  'color-primary-700': string;
  'color-primary-800': string;
  'color-primary-900': string;
  'color-primary-950': string;

  // Secondary colors
  'color-secondary-50': string;
  'color-secondary-100': string;
  'color-secondary-200': string;
  'color-secondary-300': string;
  'color-secondary-400': string;
  'color-secondary-500': string;
  'color-secondary-600': string;
  'color-secondary-700': string;
  'color-secondary-800': string;
  'color-secondary-900': string;
  'color-secondary-950': string;

  // Accent colors
  'color-accent-50': string;
  'color-accent-100': string;
  'color-accent-200': string;
  'color-accent-300': string;
  'color-accent-400': string;
  'color-accent-500': string;
  'color-accent-600': string;
  'color-accent-700': string;
  'color-accent-800': string;
  'color-accent-900': string;
  'color-accent-950': string;
}

export const DEFAULT_THEME: ColorTheme = {
  // Primary Color System - Teal tones
  'color-primary-50': '#f0f9f4',
  'color-primary-100': '#dcf2e4',
  'color-primary-200': '#8bbcaa',
  'color-primary-300': '#6b9c8b',
  'color-primary-400': '#5a8c7b',
  'color-primary-500': '#4a7c6b',
  'color-primary-600': '#3a6c5b',
  'color-primary-700': '#2d5a47',
  'color-primary-800': '#1a4d3a',
  'color-primary-900': '#0f3d2a',
  'color-primary-950': '#0a2d1f',

  // Secondary Color System - Vibrant green
  'color-secondary-50': '#f0fdf4',
  'color-secondary-100': '#dcfce7',
  'color-secondary-200': '#bbf7d0',
  'color-secondary-300': '#86efac',
  'color-secondary-400': '#4ade80',
  'color-secondary-500': '#22c55e',
  'color-secondary-600': '#16a34a',
  'color-secondary-700': '#15803d',
  'color-secondary-800': '#166534',
  'color-secondary-900': '#14532d',
  'color-secondary-950': '#052e16',

  // Accent Color System - Warm yellow
  'color-accent-50': '#fefce8',
  'color-accent-100': '#fef9c3',
  'color-accent-200': '#fef08a',
  'color-accent-300': '#fde047',
  'color-accent-400': '#facc15',
  'color-accent-500': '#eab308',
  'color-accent-600': '#ca8a04',
  'color-accent-700': '#a16207',
  'color-accent-800': '#854d0e',
  'color-accent-900': '#713f12',
  'color-accent-950': '#422006',
};

/**
 * Convert hex color to HSL
 */
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Convert HSL to hex color
 */
function hslToHex(h: number, s: number, l: number): string {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Generate a complete color scale from a base color
 */
function generateColorScale(baseColor: string): Record<string, string> {
  const { h, s, l } = hexToHsl(baseColor);
  
  // Define lightness adjustments for each shade
  const lightnessAdjustments = {
    50: 95,   // Very light
    100: 90,  // Light
    200: 80,  // Lighter
    300: 70,  // Light
    400: 60,  // Medium-light
    500: l,   // Base color
    600: Math.max(40, l - 10), // Medium-dark
    700: Math.max(30, l - 20), // Dark
    800: Math.max(20, l - 30), // Darker
    900: Math.max(10, l - 40), // Very dark
    950: Math.max(5, l - 50),  // Darkest
  };

  // Define saturation adjustments (slightly reduce saturation for lighter shades)
  const saturationAdjustments = {
    50: Math.max(20, s * 0.3),
    100: Math.max(30, s * 0.5),
    200: Math.max(40, s * 0.7),
    300: Math.max(50, s * 0.8),
    400: Math.max(60, s * 0.9),
    500: s,
    600: Math.min(100, s * 1.1),
    700: Math.min(100, s * 1.2),
    800: Math.min(100, s * 1.3),
    900: Math.min(100, s * 1.4),
    950: Math.min(100, s * 1.5),
  };

  const scale: Record<string, string> = {};
  
  Object.entries(lightnessAdjustments).forEach(([shade, lightness]) => {
    const saturation = saturationAdjustments[shade as keyof typeof saturationAdjustments];
    scale[shade] = hslToHex(h, saturation, lightness);
  });

  return scale;
}

/**
 * Generate a complete color theme from base colors
 */
export function generateColorTheme(baseColors: BaseColorTheme): ColorTheme {
  const primaryScale = generateColorScale(baseColors.primary);
  const secondaryScale = generateColorScale(baseColors.secondary);
  const accentScale = generateColorScale(baseColors.accent);

  return {
    // Primary colors
    'color-primary-50': primaryScale['50'],
    'color-primary-100': primaryScale['100'],
    'color-primary-200': primaryScale['200'],
    'color-primary-300': primaryScale['300'],
    'color-primary-400': primaryScale['400'],
    'color-primary-500': primaryScale['500'],
    'color-primary-600': primaryScale['600'],
    'color-primary-700': primaryScale['700'],
    'color-primary-800': primaryScale['800'],
    'color-primary-900': primaryScale['900'],
    'color-primary-950': primaryScale['950'],

    // Secondary colors
    'color-secondary-50': secondaryScale['50'],
    'color-secondary-100': secondaryScale['100'],
    'color-secondary-200': secondaryScale['200'],
    'color-secondary-300': secondaryScale['300'],
    'color-secondary-400': secondaryScale['400'],
    'color-secondary-500': secondaryScale['500'],
    'color-secondary-600': secondaryScale['600'],
    'color-secondary-700': secondaryScale['700'],
    'color-secondary-800': secondaryScale['800'],
    'color-secondary-900': secondaryScale['900'],
    'color-secondary-950': secondaryScale['950'],

    // Accent colors
    'color-accent-50': accentScale['50'],
    'color-accent-100': accentScale['100'],
    'color-accent-200': accentScale['200'],
    'color-accent-300': accentScale['300'],
    'color-accent-400': accentScale['400'],
    'color-accent-500': accentScale['500'],
    'color-accent-600': accentScale['600'],
    'color-accent-700': accentScale['700'],
    'color-accent-800': accentScale['800'],
    'color-accent-900': accentScale['900'],
    'color-accent-950': accentScale['950'],
  };
}

/**
 * Extract base colors from a full color theme
 */
export function extractBaseColors(theme: ColorTheme): BaseColorTheme {
  return {
    primary: theme['color-primary-500'],
    secondary: theme['color-secondary-500'],
    accent: theme['color-accent-500'],
  };
}

export const PRESET_THEMES = {
  'default': {
    name: 'Default Teal',
    baseColors: {
      primary: '#4a7c6b',
      secondary: '#22c55e',
      accent: '#eab308'
    }
  },
  'blue': {
    name: 'Ocean Blue',
    baseColors: {
      primary: '#3b82f6',
      secondary: '#06b6d4',
      accent: '#f59e0b'
    }
  },
  'purple': {
    name: 'Royal Purple',
    baseColors: {
      primary: '#a855f7',
      secondary: '#ec4899',
      accent: '#f59e0b'
    }
  },
  'red': {
    name: 'Crimson Red',
    baseColors: {
      primary: '#ef4444',
      secondary: '#f97316',
      accent: '#eab308'
    }
  },
  'green': {
    name: 'Forest Green',
    baseColors: {
      primary: '#059669',
      secondary: '#0d9488',
      accent: '#d97706'
    }
  },
  'indigo': {
    name: 'Deep Indigo',
    baseColors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#f59e0b'
    }
  }
};

export class ColorThemeManager {
  private static instance: ColorThemeManager;
  private currentTheme: ColorTheme = DEFAULT_THEME;
  private currentBaseColors: BaseColorTheme = extractBaseColors(DEFAULT_THEME);

  static getInstance(): ColorThemeManager {
    if (!ColorThemeManager.instance) {
      ColorThemeManager.instance = new ColorThemeManager();
    }
    return ColorThemeManager.instance;
  }

  /**
   * Apply color theme to the document by updating CSS custom properties
   */
  applyTheme(theme: ColorTheme): void {
    this.currentTheme = theme;
    this.currentBaseColors = extractBaseColors(theme);
    const root = document.documentElement;
    
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    // Update theme color meta tag
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', theme['color-primary-500']);
    }
  }

  /**
   * Apply base colors by generating and applying the full theme
   */
  applyBaseColors(baseColors: BaseColorTheme): void {
    const theme = generateColorTheme(baseColors);
    this.applyTheme(theme);
  }

  /**
   * Load theme from settings API
   */
  async loadThemeFromSettings(): Promise<void> {
    try {
      const response = await fetch('/api/admin/settings?category=theme');
      const data = await response.json();
      
      if (data.success && data.data) {
        const themeSettings = data.data.find((setting: any) => setting.key === 'color_theme');
        if (themeSettings && themeSettings.value) {
          // Check if it's base colors or full theme
          if (themeSettings.value.primary && themeSettings.value.secondary && themeSettings.value.accent) {
            // It's base colors, generate full theme
            this.applyBaseColors(themeSettings.value);
          } else {
            // It's a full theme, apply directly
            this.applyTheme(themeSettings.value);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load theme from settings:', error);
      // Fallback to default theme
      this.applyTheme(DEFAULT_THEME);
    }
  }

  /**
   * Save theme to settings API
   */
  async saveThemeToSettings(theme: ColorTheme): Promise<boolean> {
    try {
      const response = await fetch('/api/admin/settings/color_theme', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: theme
        }),
      });

      if (response.ok) {
        this.applyTheme(theme);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save theme to settings:', error);
      return false;
    }
  }

  /**
   * Save base colors to settings API
   */
  async saveBaseColorsToSettings(baseColors: BaseColorTheme): Promise<boolean> {
    try {
      const response = await fetch('/api/admin/settings/color_theme', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: baseColors
        }),
      });

      if (response.ok) {
        this.applyBaseColors(baseColors);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save base colors to settings:', error);
      return false;
    }
  }

  /**
   * Create theme setting if it doesn't exist
   */
  async createThemeSetting(): Promise<void> {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: 'color_theme',
          value: this.currentBaseColors,
          secret: false,
          description: 'Color theme configuration for the application (base colors)',
          category: 'theme'
        }),
      });

      if (!response.ok && response.status !== 409) {
        console.error('Failed to create theme setting');
      }
    } catch (error) {
      console.error('Failed to create theme setting:', error);
    }
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): ColorTheme {
    return this.currentTheme;
  }

  /**
   * Get current base colors
   */
  getCurrentBaseColors(): BaseColorTheme {
    return this.currentBaseColors;
  }

  /**
   * Apply preset theme
   */
  async applyPresetTheme(presetName: keyof typeof PRESET_THEMES): Promise<boolean> {
    const preset = PRESET_THEMES[presetName];
    if (preset) {
      return await this.saveBaseColorsToSettings(preset.baseColors);
    }
    return false;
  }
}