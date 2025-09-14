// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

'use client';

import { COURSE_STATES } from '@/lib/const';

interface BulkActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: 'state' | 'delete' | null;
  selectedCount: number;
  bulkNewState: string;
  onBulkNewStateChange: (state: string) => void;
  onBulkStateChange: () => void;
  onBulkDelete: () => void;
}

export default function BulkActionModal({
  isOpen,
  onClose,
  actionType,
  selectedCount,
  bulkNewState,
  onBulkNewStateChange,
  onBulkStateChange,
  onBulkDelete
}: BulkActionModalProps) {
  if (!isOpen || actionType !== 'state') return null;

  const getStateColor = (state: string) => {
    switch (state) {
      case 'published':
        return 'bg-secondary-100 text-secondary-800';
      case 'reviewing':
        return 'bg-accent-100 text-accent-800';
      case 'draft':
        return 'bg-primary-100 text-primary-800';
      case 'archived':
        return 'bg-neutral-100 text-neutral-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">
            Change State
          </h3>
          <p className="text-sm text-neutral-500 mb-4">
            Select the new state for {selectedCount} selected courses.
          </p>
          
          <div className="space-y-2">
            {COURSE_STATES.map((state) => (
              <label key={state.value} className="flex items-center p-3 border border-neutral-200 rounded-md cursor-pointer hover:bg-neutral-50">
                <input
                  type="radio"
                  name="newState"
                  value={state.value}
                  checked={bulkNewState === state.value}
                  onChange={(e) => onBulkNewStateChange(e.target.value)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-3 text-sm">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateColor(state.value)}`}>
                    {state.label}
                  </span>
                </span>
              </label>
            ))}
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-300 text-neutral-700 text-sm font-medium rounded-md hover:bg-neutral-400"
            >
              Cancel
            </button>
            <button
              onClick={onBulkStateChange}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
            >
              Change State
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
