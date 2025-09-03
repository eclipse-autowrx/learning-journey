'use client';

import { useState } from 'react';
import { FaPalette, FaCheck } from 'react-icons/fa';
import { useColorTheme } from '../hooks/useColorTheme';
import { PRESET_THEMES } from '../lib/color-theme';

interface ColorThemeSwitcherProps {
  className?: string;
  showLabel?: boolean;
}

export default function ColorThemeSwitcher({ className = '', showLabel = true }: ColorThemeSwitcherProps) {
  const { currentTheme, applyPreset, isSaving } = useColorTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetSelect = async (presetName: keyof typeof PRESET_THEMES) => {
    const success = await applyPreset(presetName);
    if (success) {
      setIsOpen(false);
    }
  };

  // Check which preset matches current theme
  const currentBaseColors = require('../lib/color-theme').extractBaseColors(currentTheme);
  const matchingPreset = Object.entries(PRESET_THEMES).find(([_, preset]) => 
    JSON.stringify(preset.baseColors) === JSON.stringify(currentBaseColors)
  );
  const currentPresetName = matchingPreset ? matchingPreset[0] : 'custom';

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSaving}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
      >
        <FaPalette className="mr-2 h-4 w-4" />
        {showLabel && (
          <span className="mr-2">
            {currentPresetName === 'custom' ? 'Custom' : PRESET_THEMES[currentPresetName as keyof typeof PRESET_THEMES]?.name}
          </span>
        )}
        {isSaving && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-neutral-200 z-20">
            <div className="p-4">
              <h3 className="text-sm font-medium text-neutral-900 mb-3">Choose Theme</h3>
              <div className="space-y-2">
                {Object.entries(PRESET_THEMES).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => handlePresetSelect(key as keyof typeof PRESET_THEMES)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                      currentPresetName === key
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: preset.baseColors.primary }}
                        />
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: preset.baseColors.secondary }}
                        />
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: preset.baseColors.accent }}
                        />
                      </div>
                      <span className="text-sm font-medium text-neutral-900">{preset.name}</span>
                    </div>
                    {currentPresetName === key && (
                      <FaCheck className="h-4 w-4 text-primary-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}