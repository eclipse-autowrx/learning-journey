// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import Swal from 'sweetalert2';
import { toast } from 'sonner';

// Color scheme - using theme colors from globals.css
// These colors match the Tailwind classes available in your theme:
// - primary: text-primary-500, bg-primary-500, border-primary-500
// - success: text-secondary-500, bg-secondary-500, border-secondary-500  
// - warning: text-accent-500, bg-accent-500, border-accent-500
// - error: text-red-500, bg-red-500, border-red-500
// - neutral: text-neutral-500, bg-neutral-500, border-neutral-500
const COLORS = {
  primary: '#4a7c6b',   // --color-primary-500 (teal)
  delete: '#ef4444',    // --color-error (red)
  success: '#22c55e',   // --color-secondary-500 (green)
  warning: '#eab308',   // --color-accent-500 (yellow)
  info: '#4a7c6b',      // --color-primary-500 (teal)
  neutral: '#737373',   // --color-neutral-500 (gray)
};

// SweetAlert2 configuration
export const showConfirmDialog = async (options) => {
  const defaultOptions = {
    icon: 'question',
    confirmButtonColor: COLORS.primary,
    cancelButtonColor: COLORS.neutral,
    confirmButtonText: 'Yes',
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    ...options,
  };

  return await Swal.fire(defaultOptions);
};

export const showDeleteConfirm = async (itemName = 'item') => {
  return await showConfirmDialog({
    title: 'Are you sure?',
    text: `Do you want to delete this ${itemName}? This action cannot be undone.`,
    icon: 'warning',
    confirmButtonColor: COLORS.delete,
    confirmButtonText: 'Delete',
    showCancelButton: true,
    cancelButtonText: 'Cancel',
  });
};

export const showBulkDeleteConfirm = async (itemType, count) => {
  return await showConfirmDialog({
    title: 'Confirm Bulk Delete',
    text: `Are you sure you want to delete ${count} ${itemType}? This action cannot be undone.`,
    icon: 'warning',
    confirmButtonColor: COLORS.delete,
    confirmButtonText: `Delete ${count} ${itemType}`,
    showCancelButton: true,
    cancelButtonText: 'Cancel',
  });
};

export const showStateChangeConfirm = async (itemType, count, newState) => {
  return await showConfirmDialog({
    title: 'Confirm State Change',
    text: `Do you want to change the state of ${count} ${itemType} to "${newState}"?`,
    icon: 'question',
    confirmButtonColor: COLORS.primary,
    confirmButtonText: `Change to ${newState}`,
    showCancelButton: true,
    cancelButtonText: 'Cancel',
  });
};

// Sonner toast configuration
export const showToast = {
  success: (message) => toast.success(message, {
    style: {
      background: COLORS.success,
      color: 'white',
      border: 'none',
    },
  }),
  
  error: (message) => toast.error(message, {
    style: {
      background: COLORS.delete,
      color: 'white',
      border: 'none',
    },
  }),
  
  warning: (message) => toast.warning(message, {
    style: {
      background: COLORS.warning,
      color: 'white',
      border: 'none',
    },
  }),
  
  info: (message) => toast.info(message, {
    style: {
      background: COLORS.info,
      color: 'white',
      border: 'none',
    },
  }),
  
  // Custom toast with primary color
  primary: (message) => toast(message, {
    style: {
      background: COLORS.primary,
      color: 'white',
      border: 'none',
    },
  }),
};

// Success messages
export const showSuccessMessage = (message) => {
  showToast.success(message);
};

// Error messages
export const showErrorMessage = (message) => {
  showToast.error(message);
};

// Bulk operation results
export const showBulkOperationResult = (result) => {
  if (result.success) {
    showToast.success(result.message);
    
    if (result.errors && result.errors.length > 0) {
      // Show errors in a more detailed way
      const errorMessage = result.errors.map(e => `${e.id}: ${e.error}`).join('\n');
      showToast.warning(`Operation completed with some errors:\n${errorMessage}`);
    }
  } else {
    showToast.error(result.error || 'Operation failed');
  }
};
