'use client';

import { useState, useEffect } from 'react';
import { FaSave, FaPalette, FaUndo, FaEye } from 'react-icons/fa';
import { DEFAULT_THEME, PRESET_THEMES, BaseColorTheme, generateColorTheme, extractBaseColors } from '../../../lib/color-theme';
import { useColorTheme } from '../../../hooks/useColorTheme';

interface ColorThemeTabProps {
  hasManageUsers: boolean;
}

export default function ColorThemeTab({ hasManageUsers }: ColorThemeTabProps) {
  const { currentTheme, isLoading, isSaving, applyPreset } = useColorTheme();
  const [hasChanges, setHasChanges] = useState(false);
  const [activePreset, setActivePreset] = useState<string>('default');
  const [localBaseColors, setLocalBaseColors] = useState<BaseColorTheme>(extractBaseColors(currentTheme));
  const [showColorScale, setShowColorScale] = useState(false);

  useEffect(() => {
    const baseColors = extractBaseColors(currentTheme);
    setLocalBaseColors(baseColors);
    
    // Check which preset matches current base colors
    const matchingPreset = Object.entries(PRESET_THEMES).find(([_, preset]) => 
      JSON.stringify(preset.baseColors) === JSON.stringify(baseColors)
    );
    setActivePreset(matchingPreset ? matchingPreset[0] : 'custom');
  }, [currentTheme]);

  const handleBaseColorChange = (colorType: keyof BaseColorTheme, value: string) => {
    const newBaseColors = { ...localBaseColors, [colorType]: value };
    setLocalBaseColors(newBaseColors);
    setHasChanges(true);
    setActivePreset('custom');
    
    // Apply changes immediately for preview
    const colorThemeManager = require('../../../lib/color-theme').ColorThemeManager.getInstance();
    colorThemeManager.applyBaseColors(newBaseColors);
  };

  const handleSave = async () => {
    const colorThemeManager = require('../../../lib/color-theme').ColorThemeManager.getInstance();
    const success = await colorThemeManager.saveBaseColorsToSettings(localBaseColors);
    if (success) {
      setHasChanges(false);
      console.log('Theme saved successfully');
    } else {
      console.error('Failed to save theme');
    }
  };

  const handlePresetSelect = async (presetName: string) => {
    if (presetName === 'custom') return;
    
    const success = await applyPreset(presetName as keyof typeof PRESET_THEMES);
    if (success) {
      setActivePreset(presetName);
      setHasChanges(false);
    }
  };

  const handleReset = () => {
    const defaultBaseColors = extractBaseColors(DEFAULT_THEME);
    setLocalBaseColors(defaultBaseColors);
    setActivePreset('default');
    setHasChanges(true);
    const colorThemeManager = require('../../../lib/color-theme').ColorThemeManager.getInstance();
    colorThemeManager.applyBaseColors(defaultBaseColors);
  };

  const BaseColorPicker = ({ colorType, label }: { colorType: keyof BaseColorTheme; label: string }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-neutral-200">
      <div className="flex items-center gap-4">
        <div 
          className="w-12 h-12 rounded-lg border border-neutral-300 shadow-sm"
          style={{ backgroundColor: localBaseColors[colorType] }}
        />
        <div>
          <div className="font-medium text-base text-neutral-900">{label}</div>
          <div className="text-sm text-neutral-500 font-mono">{localBaseColors[colorType]}</div>
        </div>
      </div>
      <input
        type="color"
        value={localBaseColors[colorType]}
        onChange={(e) => handleBaseColorChange(colorType, e.target.value)}
        className="w-16 h-10 rounded border border-neutral-300 cursor-pointer"
      />
    </div>
  );

  const ColorScalePreview = ({ colorType, label }: { colorType: keyof BaseColorTheme; label: string }) => {
    const generatedTheme = generateColorTheme(localBaseColors);
    const baseColor = localBaseColors[colorType];
    const scale = colorType === 'primary' ? 
      Object.entries(generatedTheme).filter(([key]) => key.startsWith('color-primary-')) :
      colorType === 'secondary' ?
      Object.entries(generatedTheme).filter(([key]) => key.startsWith('color-secondary-')) :
      Object.entries(generatedTheme).filter(([key]) => key.startsWith('color-accent-'));

    return (
      <div className="p-4 bg-white rounded-lg border border-neutral-200">
        <div className="flex items-center gap-3 mb-3">
          <div 
            className="w-8 h-8 rounded border border-neutral-300 shadow-sm"
            style={{ backgroundColor: baseColor }}
          />
          <div>
            <div className="font-medium text-sm text-neutral-900">{label} Scale</div>
            <div className="text-xs text-neutral-500">Auto-generated from base color</div>
          </div>
        </div>
        <div className="flex gap-1">
          {scale.map(([key, value]) => (
            <div key={key} className="flex flex-col items-center">
              <div 
                className="w-6 h-6 rounded border border-neutral-300 shadow-sm"
                style={{ backgroundColor: value }}
                title={`${key}: ${value}`}
              />
              <div className="text-xs text-neutral-400 mt-1">
                {key.split('-').pop()}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!hasManageUsers) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-500">
        <p>You don't have permission to manage color themes.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-neutral-500">Loading color theme...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <FaPalette className="h-6 w-6 text-primary-500" />
          <h2 className="text-xl font-semibold text-neutral-900">Color Theme Configuration</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-md"
          >
            <FaUndo className="mr-2 h-4 w-4" />
            Reset to Default
          </button>
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md disabled:opacity-50"
            >
              <FaSave className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Theme'}
            </button>
          )}
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left Side - Color Theme Configuration (1/3) */}
        <div className="w-1/3">
          <div className="bg-white rounded-lg border border-neutral-200 shadow-sm h-full">
            <div className="p-4 border-b border-neutral-200">
              <h3 className="text-lg font-medium text-neutral-900">Theme Presets</h3>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto max-h-96">
              {Object.entries(PRESET_THEMES).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => handlePresetSelect(key)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    activePreset === key
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
                    <div className="text-sm font-medium text-neutral-900">{preset.name}</div>
                  </div>
                </button>
              ))}
              <button
                onClick={() => setActivePreset('custom')}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  activePreset === 'custom'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-4 h-4 rounded bg-gradient-to-r from-primary-500 to-secondary-500" />
                    <div className="w-4 h-4 rounded bg-gradient-to-r from-secondary-500 to-accent-500" />
                    <div className="w-4 h-4 rounded bg-gradient-to-r from-accent-500 to-primary-500" />
                  </div>
                  <div className="text-sm font-medium text-neutral-900">Custom</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Base Colors & Theme Preview (2/3) */}
        <div className="w-2/3 flex flex-col gap-6">
          {/* Base Color Configuration */}
          <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
            <div className="p-4 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-neutral-900">Base Colors</h3>
                <button
                  onClick={() => setShowColorScale(!showColorScale)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-md"
                >
                  <FaEye className="mr-2 h-4 w-4" />
                  {showColorScale ? 'Hide' : 'Show'} Color Scales
                </button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <BaseColorPicker colorType="primary" label="Primary Color" />
              <BaseColorPicker colorType="secondary" label="Secondary Color" />
              <BaseColorPicker colorType="accent" label="Accent Color" />
            </div>
          </div>

          {/* Color Scale Preview */}
          {showColorScale && (
            <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
              <div className="p-4 border-b border-neutral-200">
                <h3 className="text-lg font-medium text-neutral-900">Generated Color Scales</h3>
              </div>
              <div className="p-4 space-y-4">
                <ColorScalePreview colorType="primary" label="Primary" />
                <ColorScalePreview colorType="secondary" label="Secondary" />
                <ColorScalePreview colorType="accent" label="Accent" />
              </div>
            </div>
          )}


        </div>
      </div>
    </div>
  );
}