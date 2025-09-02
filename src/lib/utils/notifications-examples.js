// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

/**
 * Notification System Usage Examples
 * 
 * This file demonstrates how to use SweetAlert2 and Sonner notifications
 * consistently across the Learning Journey application.
 * 
 * Color scheme:
 * - Primary (Blue): For informational actions and general confirmations
 * - Red: For delete confirmations and destructive actions
 * - Green: For success notifications
 */

import { 
  showToast, 
  showConfirmDialog, 
  showDeleteConfirm, 
  showBulkDeleteConfirm,
  showStateChangeConfirm,
  showBulkOperationResult,
  showSuccessMessage,
  showErrorMessage
} from './notifications';

// ==== SONNER TOAST EXAMPLES ====

// 1. Success notifications (Green background)
// Use for: Course/lesson completion, successful uploads, saves, creates
const handleLessonComplete = async (lessonName) => {
  const result = await saveLessonProgress();
  if (result.success) {
    showToast.success(`Lesson "${lessonName}" completed!`);
  }
};

const handleCourseComplete = async (courseName) => {
  const result = await saveCourseProgress();
  if (result.success) {
    showToast.success(`Course "${courseName}" completed! 🎉`);
  }
};

const handleUploadSuccess = (fileName) => {
  showToast.success(`File "${fileName}" uploaded successfully`);
};

// 2. Info notifications (Blue background - Primary color)
// Use for: Course/lesson starts, general information
const handleCourseStart = async (courseName) => {
  await saveStateCourseStarted();
  showToast.info(`Started course: ${courseName}`);
};

const handleLessonStart = (lessonName) => {
  showToast.info(`Now viewing: ${lessonName}`);
};

// 3. Warning notifications (Amber background)
// Use for: Non-critical issues, validation warnings
const handleFormValidation = () => {
  showToast.warning('Please fill in all required fields');
};

// 4. Error notifications (Red background)
// Use for: Failed operations, API errors
const handleApiError = (error) => {
  showToast.error(`Operation failed: ${error.message}`);
};

// 5. Custom primary color toast
const handleCustomInfo = () => {
  showToast.primary('Your progress has been automatically saved');
};

// ==== SWEETALERT2 CONFIRMATION EXAMPLES ====

// 1. Delete confirmations (Red confirm button)
// Use for: Deleting courses, lessons, collections, paths
const handleDeleteCourse = async (courseName) => {
  const result = await showDeleteConfirm(`course "${courseName}"`);
  
  if (result.isConfirmed) {
    try {
      await deleteCourse();
      showToast.success(`Course "${courseName}" deleted successfully`);
    } catch (error) {
      showToast.error(`Failed to delete course: ${error.message}`);
    }
  }
};

// 2. Bulk delete confirmations
const handleBulkDeleteCourses = async (selectedCourses) => {
  const result = await showBulkDeleteConfirm('courses', selectedCourses.length);
  
  if (result.isConfirmed) {
    const deleteResult = await bulkDeleteCourses(selectedCourses);
    showBulkOperationResult(deleteResult);
  }
};

// 3. State change confirmations (Blue confirm button)
// Use for: Publishing, archiving, marking as complete
const handleMarkComplete = async (courseName) => {
  const result = await showConfirmDialog({
    title: 'Mark as Completed',
    text: `Are you sure you want to mark "${courseName}" as completed?`,
    icon: 'question',
    confirmButtonText: 'Yes, Mark Complete',
    cancelButtonText: 'Cancel',
    showCancelButton: true,
  });
  
  if (result.isConfirmed) {
    await saveStateCourseCompleted();
    showToast.success(`Course "${courseName}" marked as completed!`);
  }
};

// 4. Bulk state change confirmations
const handleBulkStateChange = async (selectedItems, newState) => {
  const result = await showStateChangeConfirm('courses', selectedItems.length, newState);
  
  if (result.isConfirmed) {
    const updateResult = await bulkUpdateState(selectedItems, newState);
    showBulkOperationResult(updateResult);
  }
};

// 5. Custom confirmations with specific styling
const handleDataLoss = async () => {
  const result = await showConfirmDialog({
    title: 'Unsaved Changes',
    text: 'You have unsaved changes. Do you want to leave without saving?',
    icon: 'warning',
    confirmButtonColor: '#ef4444', // Using error color for destructive action
    confirmButtonText: 'Leave Without Saving',
    cancelButtonText: 'Stay and Save',
    showCancelButton: true,
    reverseButtons: true
  });
  
  return result.isConfirmed;
};

// ==== PRACTICAL USAGE PATTERNS ====

// Pattern 1: File Upload with Progress
const handleFileUpload = async (file) => {
  try {
    // Show info toast for upload start
    showToast.info(`Uploading "${file.name}"...`);
    
    const result = await uploadFile(file);
    
    if (result.success) {
      showToast.success(`File "${file.name}" uploaded successfully`);
      return result.url;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    showToast.error(`Upload failed: ${error.message}`);
    throw error;
  }
};

// Pattern 2: Form Submission with Validation
const handleFormSubmit = async (formData, isEditing = false) => {
  try {
    const result = await saveFormData(formData);
    
    if (result.success) {
      const action = isEditing ? 'updated' : 'created';
      showToast.success(`Item ${action} successfully`);
      return result;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    showToast.error(`Save failed: ${error.message}`);
    throw error;
  }
};

// Pattern 3: Batch Operations with Results
const handleBatchOperation = async (items, operation) => {
  const result = await showConfirmDialog({
    title: `${operation} Multiple Items`,
    text: `Are you sure you want to ${operation.toLowerCase()} ${items.length} items?`,
    icon: 'question',
    confirmButtonText: `Yes, ${operation}`,
    showCancelButton: true,
  });
  
  if (result.isConfirmed) {
    try {
      const operationResult = await performBatchOperation(items, operation);
      showBulkOperationResult(operationResult);
      return operationResult;
    } catch (error) {
      showToast.error(`Batch operation failed: ${error.message}`);
      throw error;
    }
  }
  
  return null;
};

// ==== HELPER FUNCTIONS FOR COMMON SCENARIOS ====

// Quick success helper
export const notifySuccess = (message) => showToast.success(message);

// Quick error helper
export const notifyError = (message) => showToast.error(message);

// Quick info helper
export const notifyInfo = (message) => showToast.info(message);

// Quick delete confirmation helper
export const confirmDelete = (itemName) => showDeleteConfirm(itemName);

// Quick general confirmation helper
export const confirmAction = (title, text, confirmText = 'Confirm') => 
  showConfirmDialog({
    title,
    text,
    confirmButtonText: confirmText,
    showCancelButton: true,
  });

export {
  handleLessonComplete,
  handleCourseComplete,
  handleUploadSuccess,
  handleCourseStart,
  handleLessonStart,
  handleFormValidation,
  handleApiError,
  handleCustomInfo,
  handleDeleteCourse,
  handleBulkDeleteCourses,
  handleMarkComplete,
  handleBulkStateChange,
  handleDataLoss,
  handleFileUpload,
  handleFormSubmit,
  handleBatchOperation
};
