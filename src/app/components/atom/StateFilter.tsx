// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

'use client';

import { useState, useRef, useEffect } from 'react';
import { FaFilter, FaCheck, FaTimes } from 'react-icons/fa';

interface State {
  value: string;
  label: string;
}

interface StateFilterProps {
  states: State[];
  selectedStates: string[];
  onStatesChange: (states: string[]) => void;
  className?: string;
}

export default function StateFilter({ states, selectedStates, onStatesChange, className = '' }: StateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredStates = states.filter(state => 
    state.label.toLowerCase().includes(filterText.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selectedStates.length === states.length) {
      onStatesChange([]);
    } else {
      onStatesChange(states.map(s => s.value));
    }
  };

  const handleToggleState = (stateValue: string) => {
    if (selectedStates.includes(stateValue)) {
      onStatesChange(selectedStates.filter(s => s !== stateValue));
    } else {
      onStatesChange([...selectedStates, stateValue]);
    }
  };

  const activeFiltersCount = selectedStates.length;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <FaFilter className="mr-2 h-4 w-4" />
        State Filter
        {activeFiltersCount > 0 && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <div className="p-4">
            {/* Selected states pills */}
            {selectedStates.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {selectedStates.map(stateValue => {
                  const state = states.find(s => s.value === stateValue);
                  if (!state) return null;
                  return (
                    <span
                      key={state.value}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {state.label}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleState(state.value);
                        }}
                        className="ml-1 hover:text-blue-600"
                      >
                        <FaTimes className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Filter input */}
            <div className="mb-3">
              <input
                type="text"
                placeholder="Filter states..."
                value={filterText}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>

            {/* Select all checkbox */}
            <div className="mb-2">
              <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="checkbox"
                  checked={selectedStates.length === states.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Select All</span>
              </label>
            </div>

            <div className="border-t border-gray-200 pt-2">
              {/* State checkboxes */}
              {filteredStates.map(state => (
                <label
                  key={state.value}
                  className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedStates.includes(state.value)}
                    onChange={() => handleToggleState(state.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className={`ml-2 text-sm text-gray-700`}>
                    {state.label}
                  </span>
                  {selectedStates.includes(state.value) && (
                    <FaCheck className="ml-auto h-3 w-3 text-blue-600" />
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
