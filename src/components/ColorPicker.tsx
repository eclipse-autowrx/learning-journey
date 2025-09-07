'use client';

import { useState, useEffect, useRef } from 'react';
import { FaCheck, FaTimes, FaPalette } from 'react-icons/fa';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label: string;
  disabled?: boolean;
}

export default function ColorPicker({ value, onChange, label, disabled = false }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempColor, setTempColor] = useState(value);
  const [hexInput, setHexInput] = useState(value);
  const pickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTempColor(value);
    setHexInput(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset temp values when closing without saving
        setTempColor(value);
        setHexInput(value);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, value]);

  const handleColorChange = (newColor: string) => {
    setTempColor(newColor);
    setHexInput(newColor);
  };

  const handleHexInputChange = (hexValue: string) => {
    setHexInput(hexValue);
    // Validate hex format and update temp color if valid
    if (/^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
      setTempColor(hexValue);
    }
  };

  const handleConfirm = () => {
    onChange(tempColor);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempColor(value);
    setHexInput(value);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (/^#[0-9A-Fa-f]{6}$/.test(hexInput)) {
        handleConfirm();
      }
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="relative" ref={pickerRef}>
      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-neutral-200">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-lg border border-neutral-300 shadow-sm cursor-pointer"
            style={{ backgroundColor: value }}
            onClick={() => !disabled && setIsOpen(true)}
            title="Click to change color"
          />
          <div>
            <div className="font-medium text-base text-neutral-900">{label}</div>
            <div className="text-sm text-neutral-500 font-mono">{value}</div>
          </div>
        </div>
        <button
          onClick={() => !disabled && setIsOpen(true)}
          disabled={disabled}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaPalette className="h-4 w-4" />
          Change
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-lg border border-neutral-200 shadow-xl z-50 min-w-80">
          <div className="p-4">
            {/* Header with Preview and Actions */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg border border-neutral-300 shadow-sm"
                  style={{ backgroundColor: tempColor }}
                />
                <div>
                  <div className="text-sm font-medium text-neutral-900">Color Picker</div>
                  <div className="text-xs text-neutral-500 font-mono">{tempColor}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded"
                  title="Cancel (Esc)"
                >
                  <FaTimes className="h-3 w-3" />
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-primary-500 hover:bg-primary-600 rounded"
                  title="Confirm (Enter)"
                >
                  <FaCheck className="h-3 w-3" />
                  OK
                </button>
              </div>
            </div>

            {/* Color Picker and Hex Input */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-2">
                    Color Picker
                  </label>
                  <input
                    type="color"
                    value={tempColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-full h-10 rounded border border-neutral-300 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-2">
                    Hex Code
                  </label>
                  <input
                    ref={inputRef}
                    type="text"
                    value={hexInput}
                    onChange={(e) => handleHexInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="#000000"
                    className={`w-full px-2 py-2 border rounded text-sm font-mono ${
                      /^#[0-9A-Fa-f]{6}$/.test(hexInput)
                        ? 'border-neutral-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500'
                        : 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    }`}
                  />
                  {!/^#[0-9A-Fa-f]{6}$/.test(hexInput) && hexInput !== '' && (
                    <div className="text-xs text-red-600 mt-1">
                      Invalid hex format
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Color Presets */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-2">
                  Quick Colors
                </label>
                <div className="grid grid-cols-8 gap-1">
                  {[
                    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
                    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
                    '#F97316', '#6366F1', '#14B8A6', '#A855F7',
                    '#DC2626', '#059669', '#D97706', '#7C3AED'
                  ].map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className={`w-6 h-6 rounded border hover:scale-110 transition-transform ${
                        tempColor === color ? 'border-primary-500 ring-2 ring-primary-200' : 'border-neutral-300'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Arrow pointer */}
          <div className="absolute -top-2 left-6 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white"></div>
          <div className="absolute -top-1 left-6 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-neutral-200"></div>
        </div>
      )}
    </div>
  );
}