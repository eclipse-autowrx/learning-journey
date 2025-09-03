'use client';

import { useState, useEffect } from 'react';
import { ColorThemeManager, ColorTheme, BaseColorTheme, PRESET_THEMES } from '../lib/color-theme';

export function useColorTheme() {
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>(ColorThemeManager.getInstance().getCurrentTheme());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const colorThemeManager = ColorThemeManager.getInstance();

  useEffect(() => {
    const loadTheme = async () => {
      setIsLoading(true);
      try {
        await colorThemeManager.loadThemeFromSettings();
        setCurrentTheme(colorThemeManager.getCurrentTheme());
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  const updateTheme = async (theme: ColorTheme) => {
    setIsSaving(true);
    try {
      const success = await colorThemeManager.saveThemeToSettings(theme);
      if (success) {
        setCurrentTheme(theme);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save theme:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateBaseColors = async (baseColors: BaseColorTheme) => {
    setIsSaving(true);
    try {
      const success = await colorThemeManager.saveBaseColorsToSettings(baseColors);
      if (success) {
        setCurrentTheme(colorThemeManager.getCurrentTheme());
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save base colors:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const applyPreset = async (presetName: keyof typeof PRESET_THEMES) => {
    setIsSaving(true);
    try {
      const success = await colorThemeManager.applyPresetTheme(presetName);
      if (success) {
        setCurrentTheme(colorThemeManager.getCurrentTheme());
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to apply preset theme:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const refreshTheme = async () => {
    setIsLoading(true);
    try {
      await colorThemeManager.loadThemeFromSettings();
      setCurrentTheme(colorThemeManager.getCurrentTheme());
    } catch (error) {
      console.error('Failed to refresh theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentTheme,
    isLoading,
    isSaving,
    updateTheme,
    updateBaseColors,
    applyPreset,
    refreshTheme,
    colorThemeManager
  };
}